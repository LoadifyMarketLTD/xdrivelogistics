'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/AuthContext'
import Panel from '@/components/portal/Panel'
import QuotesStats from '@/components/portal/quotes/QuotesStats'
import QuotesFilters from '@/components/portal/quotes/QuotesFilters'
import QuotesTable from '@/components/portal/quotes/QuotesTable'

export const dynamic = 'force-dynamic'

interface Quote {
  id: string
  created_at: string
  quote_amount: number
  message: string | null
  status: string
  job: {
    id: string
    pickup_location: string
    delivery_location: string
    pickup_datetime: string | null
    vehicle_type: string | null
    status: string
  }
}

export default function QuotesPage() {
  const { companyId } = useAuth()
  
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  useEffect(() => {
    if (!companyId) return
    
    let mounted = true
    let timeoutId: NodeJS.Timeout | null = null
    
    const fetchQuotes = async () => {
      try {
        setLoading(true)
        
        // Set timeout to ensure loading always resolves
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('Quotes data fetch timeout - resolving loading state')
            setLoading(false)
          }
        }, 10000) // 10 second timeout
        
        const { data, error: fetchError } = await supabase
          .from('job_bids')
          .select(`
            id,
            created_at,
            quote_amount,
            message,
            status,
            job:jobs!job_bids_job_id_fkey(
              id,
              pickup_location,
              delivery_location,
              pickup_datetime,
              vehicle_type,
              status
            )
          `)
          .eq('bidder_company_id', companyId)
          .order('created_at', { ascending: false })
        
        if (fetchError) throw fetchError
        
        if (!mounted) return
        
        // Transform the data - job comes as array, we need first element
        const transformedData = (data || []).map((item: any) => ({
          ...item,
          job: Array.isArray(item.job) ? item.job[0] : item.job
        })).filter((item: any) => item.job) // Filter out items without job data
        
        setQuotes(transformedData)
        setError(null)
      } catch (err: any) {
        console.error('Error fetching quotes:', err)
        if (mounted) {
          setError(err.message)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
        if (timeoutId) clearTimeout(timeoutId)
      }
    }
    
    fetchQuotes()
    
    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [companyId])
  
  const handleWithdraw = async (quoteId: string) => {
    if (!confirm('Are you sure you want to withdraw this quote?')) return
    
    try {
      const { error: updateError } = await supabase
        .from('job_bids')
        .update({ status: 'withdrawn' })
        .eq('id', quoteId)
      
      if (updateError) throw updateError
      
      // Update local state
      setQuotes(quotes.map(q => 
        q.id === quoteId ? { ...q, status: 'withdrawn' } : q
      ))
    } catch (err: any) {
      console.error('Error withdrawing quote:', err)
      alert('Failed to withdraw quote: ' + err.message)
    }
  }
  
  // Calculate stats
  const stats = useMemo(() => {
    const total = quotes.length
    const accepted = quotes.filter(q => q.status === 'accepted').length
    const totalValue = quotes.reduce((sum, q) => sum + q.quote_amount, 0)
    const acceptanceRate = total > 0 ? (accepted / total) * 100 : 0
    
    return {
      totalQuotes: total,
      acceptedQuotes: accepted,
      totalValue,
      acceptanceRate
    }
  }, [quotes])
  
  // Filter quotes
  const filteredQuotes = useMemo(() => {
    return quotes.filter(quote => {
      // Status filter
      if (statusFilter !== 'all' && quote.status !== statusFilter) {
        return false
      }
      
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        const route = `${quote.job.pickup_location} ${quote.job.delivery_location}`.toLowerCase()
        if (!route.includes(search)) {
          return false
        }
      }
      
      return true
    })
  }, [quotes, statusFilter, searchTerm])
  
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '16px', color: 'var(--portal-text-secondary)' }}>
          Loading quotes...
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div>
        <Panel title="Quotes" subtitle="Manage your quotes and bids">
          <div style={{ 
            padding: '40px', 
            textAlign: 'center',
            color: 'var(--portal-error)'
          }}>
            <p style={{ fontSize: '16px', marginBottom: '12px' }}>Error loading quotes</p>
            <p style={{ fontSize: '14px' }}>{error}</p>
          </div>
        </Panel>
      </div>
    )
  }
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Stats */}
      {quotes.length > 0 && (
        <QuotesStats 
          totalQuotes={stats.totalQuotes}
          acceptedQuotes={stats.acceptedQuotes}
          totalValue={stats.totalValue}
          acceptanceRate={stats.acceptanceRate}
        />
      )}
      
      {/* Quotes List */}
      <Panel 
        title="All Quotes" 
        subtitle={`${filteredQuotes.length} ${filteredQuotes.length === 1 ? 'quote' : 'quotes'} found`}
      >
        {quotes.length > 0 && (
          <QuotesFilters 
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        )}
        
        <QuotesTable 
          quotes={filteredQuotes}
          onWithdraw={handleWithdraw}
        />
      </Panel>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import ErrorBanner from '@/components/ErrorBanner'
import EmptyState from '@/components/EmptyState'

export const dynamic = 'force-dynamic'

interface Job {
  id: string
  pickup_location: string
  delivery_location: string
  status: string
  budget: number | null
  created_at: string
  vehicle_type: string | null
}

export default function DashboardPage() {
  const { companyId } = useAuth()
  const [recentJobs, setRecentJobs] = useState<Job[]>([])
  const [stats, setStats] = useState({
    totalLoads: 0,
    activeBids: 0,
    acceptedLoads: 0,
    revenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!companyId) return
    
    let mounted = true
    let timeoutId: NodeJS.Timeout | null = null

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Set timeout to ensure loading always resolves
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('Dashboard data fetch timeout - resolving loading state')
            setLoading(false)
          }
        }, 10000) // 10 second timeout
        
        // Fetch all jobs for total loads
        const { data: allJobs, error: allJobsError } = await supabase
          .from('jobs')
          .select('*')
        
        if (allJobsError) throw allJobsError
        
        // Fetch active bids for this company
        const { data: bids, error: bidsError } = await supabase
          .from('job_bids')
          .select('*')
          .eq('bidder_company_id', companyId)
          .eq('status', 'submitted')
        
        if (bidsError) throw bidsError
        
        // Fetch accepted bids/loads
        const { data: acceptedBids, error: acceptedError } = await supabase
          .from('job_bids')
          .select('*, job:jobs(*)')
          .eq('bidder_company_id', companyId)
          .eq('status', 'accepted')
        
        if (acceptedError) throw acceptedError
        
        // Calculate revenue from accepted loads
        const revenue = acceptedBids?.reduce((sum, bid) => {
          return sum + (bid.quote_amount || 0)
        }, 0) || 0
        
        // Fetch recent jobs posted by this company
        const { data: myJobs, error: myJobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('posted_by_company_id', companyId)
          .order('created_at', { ascending: false })
          .limit(10)
        
        if (myJobsError) throw myJobsError
        
        if (!mounted) return
        
        setRecentJobs(myJobs || [])
        
        setStats({
          totalLoads: allJobs?.length || 0,
          activeBids: bids?.length || 0,
          acceptedLoads: acceptedBids?.length || 0,
          revenue: revenue,
        })
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err)
        if (mounted) {
          setError(err.message || 'Failed to load dashboard data')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
        if (timeoutId) clearTimeout(timeoutId)
      }
    }

    fetchData()

    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [companyId])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
        Loading dashboard...
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1400px' }}>
      {error && (
        <ErrorBanner 
          error={error} 
          onRetry={() => window.location.reload()}
          onDismiss={() => setError(null)}
        />
      )}
      
      <h1 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '20px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        Dashboard
      </h1>

      {/* Reports & Statistics Section */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontSize: '14px',
          fontWeight: '700',
          color: '#374151',
          marginBottom: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.3px',
        }}>
          Reports & Statistics
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
        }}>
          {/* Total Loads */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            padding: '16px',
          }}>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              marginBottom: '8px',
              fontWeight: '600',
              textTransform: 'uppercase',
            }}>
              Total Loads (System)
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1f2937',
            }}>
              {stats.totalLoads}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#9ca3af',
              marginTop: '4px',
            }}>
              All available loads
            </div>
          </div>

          {/* Active Bids */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            padding: '16px',
          }}>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              marginBottom: '8px',
              fontWeight: '600',
              textTransform: 'uppercase',
            }}>
              Active Bids
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#3b82f6',
            }}>
              {stats.activeBids}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#9ca3af',
              marginTop: '4px',
            }}>
              Pending responses
            </div>
          </div>

          {/* Accepted Loads */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            padding: '16px',
          }}>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              marginBottom: '8px',
              fontWeight: '600',
              textTransform: 'uppercase',
            }}>
              Accepted Loads
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#10b981',
            }}>
              {stats.acceptedLoads}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#9ca3af',
              marginTop: '4px',
            }}>
              Won bids
            </div>
          </div>

          {/* Revenue */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            padding: '16px',
          }}>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              marginBottom: '8px',
              fontWeight: '600',
              textTransform: 'uppercase',
            }}>
              Revenue (Accepted)
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#10b981',
            }}>
              £{stats.revenue.toFixed(2)}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#9ca3af',
              marginTop: '4px',
            }}>
              From accepted bids
            </div>
          </div>
        </div>
      </div>

      {/* Activity at a Glance Section */}
      <div>
        <h2 style={{
          fontSize: '14px',
          fontWeight: '700',
          color: '#374151',
          marginBottom: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.3px',
        }}>
          My Posted Loads
        </h2>
        
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 2fr 1fr 1fr 100px',
            gap: '12px',
            padding: '12px 16px',
            background: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
            fontSize: '12px',
            fontWeight: '700',
            color: '#6b7280',
            textTransform: 'uppercase',
          }}>
            <div>From</div>
            <div>To</div>
            <div>Vehicle</div>
            <div>Status</div>
            <div>Budget</div>
          </div>

          {/* Table Rows */}
          {recentJobs.length === 0 ? (
            <div style={{ padding: '20px' }}>
              <EmptyState
                icon="🏁"
                title="Welcome to XDrive Logistics"
                description="Get started by browsing available loads or posting your first job."
                actionLabel="Browse Loads"
                actionHref="/loads"
                size="small"
              />
            </div>
          ) : (
            recentJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 2fr 1fr 1fr 100px',
                  gap: '12px',
                  padding: '12px 16px',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '13px',
                  color: '#374151',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f9fafb'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <div>{job.pickup_location || '—'}</div>
                <div>{job.delivery_location || '—'}</div>
                <div>{job.vehicle_type || '—'}</div>
                <div>
                  <span style={{
                    padding: '2px 8px',
                    background: job.status === 'open' ? '#dbeafe' : 
                               job.status === 'completed' ? '#d1fae5' : '#fef3c7',
                    color: job.status === 'open' ? '#1e40af' :
                           job.status === 'completed' ? '#065f46' : '#92400e',
                    fontSize: '11px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                  }}>
                    {job.status}
                  </span>
                </div>
                <div style={{ fontWeight: '600' }}>
                  {job.budget ? `£${job.budget.toFixed(2)}` : '—'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

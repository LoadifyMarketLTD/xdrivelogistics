'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Job, Company } from '@/lib/types'
import PlatformNav from '@/components/PlatformNav'
import FilterPanel, { JobFilters } from '@/components/marketplace/FilterPanel'
import '@/styles/dashboard.css'

export const dynamic = 'force-dynamic'

interface JobWithCompany extends Job {
  poster_company?: Company
}

const defaultFilters: JobFilters = {
  searchQuery: '',
  vehicleType: '',
  budgetMin: '',
  budgetMax: '',
  status: 'open',
  sortBy: 'created_at',
  sortOrder: 'desc'
}

export default function MarketplacePage() {
  const router = useRouter()
  const { user, companyId, loading: authLoading } = useAuth()
  
  const [allJobs, setAllJobs] = useState<JobWithCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<JobFilters>(defaultFilters)

  const fetchJobs = async () => {
    try {
      setLoading(true)
      
      const { data, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          *,
          poster_company:companies!jobs_posted_by_company_id_fkey(*)
        `)
        .order('created_at', { ascending: false })

      if (jobsError) throw jobsError

      setAllJobs(data || [])
      setError(null)
    } catch (err: any) {
      console.error('Error fetching jobs:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort jobs based on current filters
  const filteredJobs = useMemo(() => {
    let filtered = [...allJobs]

    // Status filter
    if (filters.status === 'open') {
      filtered = filtered.filter(job => job.status === 'open')
    } else if (filters.status === 'assigned') {
      filtered = filtered.filter(job => job.status === 'assigned')
    } else if (filters.status === 'urgent') {
      // Consider jobs urgent if pickup is within 2 days
      const twoDaysFromNow = new Date()
      twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2)
      filtered = filtered.filter(job => {
        if (!job.pickup_datetime) return false
        return new Date(job.pickup_datetime) <= twoDaysFromNow && job.status === 'open'
      })
    }

    // Search query filter (location)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(job =>
        job.pickup_location?.toLowerCase().includes(query) ||
        job.delivery_location?.toLowerCase().includes(query)
      )
    }

    // Vehicle type filter
    if (filters.vehicleType) {
      filtered = filtered.filter(job => job.vehicle_type === filters.vehicleType)
    }

    // Budget filters
    if (filters.budgetMin) {
      const minBudget = parseFloat(filters.budgetMin)
      filtered = filtered.filter(job => job.budget && job.budget >= minBudget)
    }
    if (filters.budgetMax) {
      const maxBudget = parseFloat(filters.budgetMax)
      filtered = filtered.filter(job => job.budget && job.budget <= maxBudget)
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal, bVal
      
      switch (filters.sortBy) {
        case 'budget':
          aVal = a.budget || 0
          bVal = b.budget || 0
          break
        case 'pickup_datetime':
          aVal = a.pickup_datetime ? new Date(a.pickup_datetime).getTime() : 0
          bVal = b.pickup_datetime ? new Date(b.pickup_datetime).getTime() : 0
          break
        case 'created_at':
        default:
          aVal = new Date(a.created_at).getTime()
          bVal = new Date(b.created_at).getTime()
          break
      }

      return filters.sortOrder === 'desc' ? bVal - aVal : aVal - bVal
    })

    return filtered
  }, [allJobs, filters])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchJobs()
    }
  }, [authLoading, user, router])

  const handleFilterChange = (newFilters: JobFilters) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters(defaultFilters)
  }

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0F1F2E', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading marketplace...</div>
          <div style={{ fontSize: '14px', color: '#94a3b8' }}>Fetching available jobs...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-content">
        <PlatformNav />
        <main className="container">
          <div style={{
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            border: '1px solid rgba(255, 107, 107, 0.3)',
            borderRadius: '12px',
            padding: '30px',
            marginTop: '40px',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#ff6b6b', marginBottom: '20px' }}>⚠️ Error</h2>
            <p style={{ marginBottom: '25px' }}>{error}</p>
            <button
              onClick={() => {
                setError(null)
                fetchJobs()
              }}
              className="action-btn primary"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="dashboard-content">
      <PlatformNav />

      {/* Main Content */}
      <main className="container">
        
        {/* Page Header */}
        <section style={{ marginTop: '32px', marginBottom: '24px' }}>
          <h1 className="section-title" style={{ fontSize: '28px', marginBottom: '8px' }}>
            📦 Job Marketplace
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '15px' }}>
            Browse available transport jobs and submit your quotes
          </p>
        </section>

        {/* Filter Panel */}
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClear={handleClearFilters}
          jobCount={filteredJobs.length}
        />

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div style={{
            backgroundColor: '#132433',
            borderRadius: '12px',
            padding: '60px 40px',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ marginBottom: '12px', color: '#fff' }}>No jobs found</h3>
            <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
              {filters.searchQuery || filters.vehicleType || filters.budgetMin || filters.budgetMax
                ? 'Try adjusting your filters to see more results.'
                : filters.status === 'open' ? 'There are no open jobs at the moment. Check back soon!' : 
                  filters.status === 'urgent' ? 'No urgent jobs at the moment.' :
                  filters.status === 'assigned' ? 'No assigned jobs to display.' :
                  'No jobs in the marketplace yet.'}
            </p>
            {(filters.searchQuery || filters.vehicleType || filters.budgetMin || filters.budgetMax || filters.status !== 'open') && (
              <button
                onClick={handleClearFilters}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--gold-premium)',
                  color: '#0B1623',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginRight: '12px'
                }}
              >
                Clear Filters
              </button>
            )}
            <a href="/jobs/new" className="action-btn primary">
              Post Your First Job
            </a>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => router.push(`/marketplace/${job.id}`)}
                style={{
                  backgroundColor: '#132433',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.borderColor = 'var(--gold-premium)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span className={`status-badge ${job.status}`}>
                        {job.status === 'open' ? '🟢 Open' : 
                         job.status === 'assigned' ? '✅ Assigned' :
                         job.status === 'in-transit' ? '🚚 In Transit' :
                         job.status === 'completed' ? '✔️ Completed' :
                         job.status}
                      </span>
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                        Posted by {job.poster_company?.name || 'Unknown'}
                      </span>
                      {job.pickup_datetime && new Date(job.pickup_datetime) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) && job.status === 'open' && (
                        <span style={{
                          backgroundColor: 'rgba(255, 107, 107, 0.2)',
                          color: '#ff6b6b',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          🔥 URGENT
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '20px', marginBottom: '12px', color: '#fff' }}>
                      {job.pickup_location} → {job.delivery_location}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', color: '#94a3b8', fontSize: '14px' }}>
                      {job.vehicle_type && (
                        <div>🚚 {job.vehicle_type}</div>
                      )}
                      {job.pallets && (
                        <div>📦 {job.pallets} pallets</div>
                      )}
                      {job.weight_kg && (
                        <div>⚖️ {job.weight_kg} kg</div>
                      )}
                      {job.budget && (
                        <div style={{ fontWeight: '600', color: 'var(--gold-premium)' }}>
                          💰 £{job.budget.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: '24px' }}>→</div>
                </div>
                {job.load_details && (
                  <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '12px', lineHeight: '1.6' }}>
                    {job.load_details.substring(0, 150)}{job.load_details.length > 150 ? '...' : ''}
                  </p>
                )}
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '13px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    Posted {new Date(job.created_at).toLocaleDateString()} at {new Date(job.created_at).toLocaleTimeString()}
                  </span>
                  {job.pickup_datetime && (
                    <span style={{ color: '#fff', fontWeight: '600' }}>
                      📅 Pickup: {new Date(job.pickup_datetime).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  )
}

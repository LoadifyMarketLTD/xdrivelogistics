'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import ErrorBanner from '@/components/ErrorBanner'
import EmptyState from '@/components/EmptyState'
import '@/styles/portal.css'

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

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
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
          .select('*')
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
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [companyId])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-text">Loading dashboard...</div>
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
    <div className="portal-layout">
      <div className="portal-header">
        <h1 className="portal-title">Dashboard</h1>
      </div>

      <main className="portal-main">
        <div className="portal-card">
          <h1 className="section-title">Dashboard</h1>
          <p className="page-description">
            Overview of your logistics operations
          </p>

          {/* Reports & Statistics Section */}
          <div>
            <h2 className="section-header">
              Reports & Statistics
            </h2>
            
            <div className="stats-grid">
              {/* Total Loads */}
              <div className="stat-card">
                <div className="stat-label">
                  Total Loads (System)
                </div>
                <div className="stat-value">
                  {stats.totalLoads}
                </div>
                <div className="stat-description">
                  All available loads
                </div>
              </div>

              {/* Active Bids */}
              <div className="stat-card">
                <div className="stat-label">
                  Active Bids
                </div>
                <div className="stat-value blue">
                  {stats.activeBids}
                </div>
                <div className="stat-description">
                  Pending responses
                </div>
              </div>

              {/* Accepted Loads */}
              <div className="stat-card">
                <div className="stat-label">
                  Accepted Loads
                </div>
                <div className="stat-value green">
                  {stats.acceptedLoads}
                </div>
                <div className="stat-description">
                  Won bids
                </div>
              </div>

              {/* Revenue */}
              <div className="stat-card">
                <div className="stat-label">
                  Revenue (Accepted)
                </div>
                <div className="stat-value green">
                  £{stats.revenue.toFixed(2)}
                </div>
                <div className="stat-description">
                  From accepted bids
                </div>
              </div>
            </div>
          </div>

          {/* Activity at a Glance Section */}
          <div>
            <h2 className="section-header">
              My Posted Loads
            </h2>
          
            <div className="table-container">
              {/* Table Header */}
              <div className="table-header" style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 100px', gap: '12px' }}>
                <div>From</div>
                <div>To</div>
                <div>Vehicle</div>
                <div>Status</div>
                <div>Budget</div>
              </div>

              {/* Table Rows */}
              {recentJobs.length === 0 ? (
                <div className="table-empty">
                  No loads posted yet
                </div>
              ) : (
                recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="table-row"
                    style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 100px', gap: '12px' }}
                  >
                    <div>{job.pickup_location || '—'}</div>
                    <div>{job.delivery_location || '—'}</div>
                    <div>{job.vehicle_type || '—'}</div>
                    <div>
                      <span className={`status-badge ${job.status}`}>
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
      </main>
    </div>
    </div>
  )
}
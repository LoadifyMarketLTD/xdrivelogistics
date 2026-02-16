'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Job, JobBid } from '@/lib/types'
import '@/styles/dashboard.css'

export const dynamic = 'force-dynamic'

interface JobWithBidCount extends Job {
  bid_count?: number
}

interface BidWithJob extends JobBid {
  job?: Job
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, companyId, loading: authLoading, signOut } = useAuth()
  
  const [postedJobs, setPostedJobs] = useState<JobWithBidCount[]>([])
  const [assignedJobs, setAssignedJobs] = useState<Job[]>([])
  const [myBids, setMyBids] = useState<BidWithJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    if (!companyId) return

    try {
      setLoading(true)

      // Fetch posted jobs
      const { data: posted, error: postedError } = await supabase
        .from('jobs')
        .select('*')
        .eq('posted_by_company_id', companyId)
        .order('created_at', { ascending: false })

      if (postedError) throw postedError
      setPostedJobs(posted || [])

      // Fetch assigned jobs
      const { data: assigned, error: assignedError } = await supabase
        .from('jobs')
        .select('*')
        .eq('assigned_company_id', companyId)
        .order('created_at', { ascending: false })

      if (assignedError) throw assignedError
      setAssignedJobs(assigned || [])

      // Fetch my bids with job details
      const { data: bids, error: bidsError } = await supabase
        .from('job_bids')
        .select(`
          *,
          job:jobs(*)
        `)
        .eq('bidder_company_id', companyId)
        .order('created_at', { ascending: false })

      if (bidsError) throw bidsError
      setMyBids(bids || [])

      setError(null)
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (!authLoading && !companyId) {
      router.push('/onboarding')
      return
    }

    if (companyId) {
      fetchDashboardData()
    }
  }, [authLoading, user, companyId, router])

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0F1F2E', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading dashboard...</div>
          <div style={{ fontSize: '14px', color: '#94a3b8' }}>Fetching your data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-content">
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
            <button onClick={() => fetchDashboardData()} className="action-btn primary">
              Try Again
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="dashboard-content">
      <header className="platform-header">
        <div className="container">
          <div className="platform-nav">
            <div className="platform-brand">
              <span className="platform-brand-accent">XDrive</span> Dashboard
            </div>
            <nav>
              <ul className="platform-links">
                <li><a href="/dashboard" style={{ color: 'var(--gold-premium)' }}>Dashboard</a></li>
                <li><a href="/marketplace">Marketplace</a></li>
                <li><a href="/jobs/new">Post Job</a></li>
                <li><a href="#" onClick={handleLogout} className="logout">Logout</a></li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main className="container">
        
        {/* Quick Actions */}
        <section className="quick-actions" style={{ marginTop: '32px' }}>
          <h2 className="section-title">Quick Actions</h2>
          
          <div className="actions-grid">
            <button className="action-btn primary" onClick={() => router.push('/jobs/new')}>
              📝 Post New Job
            </button>
            <button className="action-btn success" onClick={() => router.push('/marketplace')}>
              🔍 Browse Marketplace
            </button>
            <button className="action-btn secondary" onClick={() => fetchDashboardData()}>
              🔄 Refresh Data
            </button>
          </div>
        </section>

        {/* My Posted Jobs */}
        <section style={{ marginTop: '32px' }}>
          <h2 className="section-title">My Posted Jobs ({postedJobs.length})</h2>
          
          {postedJobs.length === 0 ? (
            <div style={{
              backgroundColor: '#132433',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <h3 style={{ marginBottom: '12px', color: '#fff' }}>No posted jobs yet</h3>
              <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
                Post your first job to the marketplace
              </p>
              <button className="action-btn primary" onClick={() => router.push('/jobs/new')}>
                Post Your First Job
              </button>
            </div>
          ) : (
            <div className="jobs-table">
              <table>
                <thead>
                  <tr>
                    <th>Pickup</th>
                    <th>Delivery</th>
                    <th>Status</th>
                    <th>Budget</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {postedJobs.map((job) => (
                    <tr key={job.id}>
                      <td>{job.pickup_location}</td>
                      <td>{job.delivery_location}</td>
                      <td>
                        <span className={`status-badge ${job.status}`}>
                          {job.status}
                        </span>
                      </td>
                      <td>{job.budget ? `£${job.budget.toFixed(2)}` : '-'}</td>
                      <td>{new Date(job.created_at).toLocaleDateString()}</td>
                      <td>
                        <a
                          href={`/marketplace/${job.id}`}
                          style={{
                            color: 'var(--gold-premium)',
                            fontSize: '13px',
                            textDecoration: 'underline',
                            cursor: 'pointer'
                          }}
                        >
                          View Details
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Jobs Assigned To Me */}
        <section style={{ marginTop: '32px' }}>
          <h2 className="section-title">Jobs Assigned To My Company ({assignedJobs.length})</h2>
          
          {assignedJobs.length === 0 ? (
            <div style={{
              backgroundColor: '#132433',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚚</div>
              <h3 style={{ marginBottom: '12px', color: '#fff' }}>No assigned jobs yet</h3>
              <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
                Browse the marketplace and bid on jobs to get started
              </p>
              <button className="action-btn primary" onClick={() => router.push('/marketplace')}>
                Browse Marketplace
              </button>
            </div>
          ) : (
            <div className="jobs-table">
              <table>
                <thead>
                  <tr>
                    <th>Pickup</th>
                    <th>Delivery</th>
                    <th>Status</th>
                    <th>Date Assigned</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedJobs.map((job) => (
                    <tr key={job.id}>
                      <td>{job.pickup_location}</td>
                      <td>{job.delivery_location}</td>
                      <td>
                        <span className={`status-badge ${job.status}`}>
                          {job.status}
                        </span>
                      </td>
                      <td>{new Date(job.updated_at).toLocaleDateString()}</td>
                      <td>
                        <a
                          href={`/marketplace/${job.id}`}
                          style={{
                            color: 'var(--gold-premium)',
                            fontSize: '13px',
                            textDecoration: 'underline',
                            cursor: 'pointer'
                          }}
                        >
                          View Details
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* My Bids */}
        <section style={{ marginTop: '32px', marginBottom: '48px' }}>
          <h2 className="section-title">My Bids ({myBids.length})</h2>
          
          {myBids.length === 0 ? (
            <div style={{
              backgroundColor: '#132433',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
              <h3 style={{ marginBottom: '12px', color: '#fff' }}>No bids submitted yet</h3>
              <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
                Find jobs in the marketplace and submit your quotes
              </p>
              <button className="action-btn primary" onClick={() => router.push('/marketplace')}>
                Browse Marketplace
              </button>
            </div>
          ) : (
            <div className="jobs-table">
              <table>
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Quote</th>
                    <th>Status</th>
                    <th>Date Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myBids.map((bid) => (
                    <tr key={bid.id}>
                      <td>
                        {bid.job ? `${bid.job.pickup_location} → ${bid.job.delivery_location}` : 'N/A'}
                      </td>
                      <td style={{ fontWeight: '600', color: 'var(--gold-premium)' }}>
                        £{bid.quote_amount.toFixed(2)}
                      </td>
                      <td>
                        <span className={`status-badge ${bid.status}`}>
                          {bid.status}
                        </span>
                      </td>
                      <td>{new Date(bid.created_at).toLocaleDateString()}</td>
                      <td>
                        {bid.job && (
                          <a
                            href={`/marketplace/${bid.job.id}`}
                            style={{
                              color: 'var(--gold-premium)',
                              fontSize: '13px',
                              textDecoration: 'underline',
                              cursor: 'pointer'
                            }}
                          >
                            View Job
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>
    </div>
  )
}

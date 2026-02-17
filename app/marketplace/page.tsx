'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Job, Company } from '@/lib/types'
import PlatformNav from '@/components/PlatformNav'
import '@/styles/dashboard.css'

export const dynamic = 'force-dynamic'

interface JobWithCompany extends Job {
  poster_company?: Company
}

export default function MarketplacePage() {
  const router = useRouter()
  const { user, companyId, loading: authLoading } = useAuth()
  
  const [jobs, setJobs] = useState<JobWithCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'open' | 'assigned'>('open')

  const fetchJobs = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('jobs')
        .select(`
          *,
          poster_company:companies!jobs_posted_by_company_id_fkey(*)
        `)
        .order('created_at', { ascending: false })

      if (filter === 'open') {
        query = query.eq('status', 'open')
      } else if (filter === 'assigned') {
        query = query.eq('status', 'assigned')
      }

      const { data, error: jobsError } = await query

      if (jobsError) throw jobsError

      setJobs(data || [])
      setError(null)
    } catch (err: any) {
      console.error('Error fetching jobs:', err)
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

    if (user) {
      fetchJobs()
    }
  }, [authLoading, user, router, filter])

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
            📦 Public Job Board
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '15px' }}>
            Browse available transport jobs and submit your quotes
          </p>
        </section>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: '12px'
        }}>
          <button
            onClick={() => setFilter('open')}
            style={{
              padding: '8px 16px',
              backgroundColor: filter === 'open' ? 'var(--gold-premium)' : 'transparent',
              color: filter === 'open' ? '#0B1623' : '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🟢 Open ({jobs.filter(j => j.status === 'open').length})
          </button>
          <button
            onClick={() => setFilter('assigned')}
            style={{
              padding: '8px 16px',
              backgroundColor: filter === 'assigned' ? 'var(--gold-premium)' : 'transparent',
              color: filter === 'assigned' ? '#0B1623' : '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            ✅ Assigned ({jobs.filter(j => j.status === 'assigned').length})
          </button>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '8px 16px',
              backgroundColor: filter === 'all' ? 'var(--gold-premium)' : 'transparent',
              color: filter === 'all' ? '#0B1623' : '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            📋 All ({jobs.length})
          </button>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
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
              {filter === 'open' ? 'There are no open jobs at the moment. Check back soon!' : 
               filter === 'assigned' ? 'No assigned jobs to display.' :
               'No jobs in the marketplace yet.'}
            </p>
            <a href="/jobs/new" className="action-btn primary">
              Post Your First Job
            </a>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {jobs.map((job) => (
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span className={`status-badge ${job.status}`}>
                        {job.status === 'open' ? '🟢 Open' : '✅ Assigned'}
                      </span>
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                        Posted by {job.poster_company?.name || 'Unknown'}
                      </span>
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
                        <div>💰 Budget: £{job.budget.toFixed(2)}</div>
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
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '13px', color: '#94a3b8' }}>
                  Posted {new Date(job.created_at).toLocaleDateString()} at {new Date(job.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import RequireRole from '@/components/auth/RequireRole'
import ResponsiveContainer from '@/components/layout/ResponsiveContainer'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

export default function BrokerDashboardPage() {
  const { user, companyId } = useAuth()
  const [stats, setStats] = useState({ postedLoads: 0, incomingBids: 0, openLoads: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let mounted = true

    const fetchData = async () => {
      try {
        // Fetch company job IDs to scope incoming bids
        const jobIdsResult = companyId
          ? await supabase.from('jobs').select('id').eq('posted_by_company_id', companyId)
          : { data: [] }

        const jobIds = (jobIdsResult.data ?? []).map((j: { id: string }) => j.id)

        const [{ data: openLoads }, { data: incomingBids }] =
          await Promise.all([
            supabase.from('jobs').select('id').eq('status', 'open'),
            jobIds.length > 0
              ? supabase.from('job_bids').select('id').in('job_id', jobIds).eq('status', 'submitted')
              : Promise.resolve({ data: [] }),
          ])

        if (!mounted) return
        setStats({
          openLoads: openLoads?.length ?? 0,
          postedLoads: jobIds.length,
          incomingBids: incomingBids?.length ?? 0,
        })
      } catch (err) {
        console.error('Broker dashboard fetch error:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchData()
    return () => { mounted = false }
  }, [user, companyId])

  return (
    <RequireRole allowedRoles={['broker']}>
      <ResponsiveContainer maxWidth="xl">
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Broker / Dispatcher Dashboard
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '28px', fontSize: '14px' }}>
          Post loads, manage incoming bids and connect with carriers.
        </p>

        {loading ? (
          <div className="loading-screen"><div className="loading-text">Loading…</div></div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <div className="stat-card">
                <div className="stat-label">Open Loads (System)</div>
                <div className="stat-value">{stats.openLoads}</div>
                <div className="stat-description">Available on exchange</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">My Posted Loads</div>
                <div className="stat-value blue">{stats.postedLoads}</div>
                <div className="stat-description">Posted by your company</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Incoming Bids</div>
                <div className="stat-value green">{stats.incomingBids}</div>
                <div className="stat-description">Awaiting review</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { label: '➕ Post a Load', desc: 'Create a new load posting', href: '/jobs/new' },
                { label: '📦 My Loads', desc: 'View and manage posted loads', href: '/loads' },
                { label: '💰 Incoming Quotes', desc: 'Review bids from carriers', href: '/quotes' },
                { label: '📁 Directory', desc: 'Find and connect with carriers', href: '/directory' },
                { label: '📡 Live Availability', desc: 'Real-time carrier availability', href: '/live-availability' },
                { label: '📅 Diary', desc: 'Manage your schedule', href: '/diary' },
              ].map((action) => (
                <a key={action.href} href={action.href} style={{ display: 'block', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', textDecoration: 'none', transition: 'border-color 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#C8A64D')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}>
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '6px' }}>{action.label}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>{action.desc}</div>
                </a>
              ))}
            </div>
          </>
        )}
      </ResponsiveContainer>
    </RequireRole>
  )
}

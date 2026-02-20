'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import RequireRole from '@/components/auth/RequireRole'
import ResponsiveContainer from '@/components/layout/ResponsiveContainer'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

export default function DriverDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ activeBids: 0, acceptedLoads: 0, availableLoads: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let mounted = true

    const fetchData = async () => {
      try {
        const [{ data: activeBids }, { data: acceptedBids }, { data: openLoads }] =
          await Promise.all([
            supabase.from('job_bids').select('id').eq('bidder_id', user.id).eq('status', 'submitted'),
            supabase.from('job_bids').select('id').eq('bidder_id', user.id).eq('status', 'accepted'),
            supabase.from('jobs').select('id').eq('status', 'open'),
          ])

        if (!mounted) return
        setStats({
          activeBids: activeBids?.length ?? 0,
          acceptedLoads: acceptedBids?.length ?? 0,
          availableLoads: openLoads?.length ?? 0,
        })
      } catch (err) {
        console.error('Driver dashboard fetch error:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchData()
    return () => { mounted = false }
  }, [user])

  return (
    <RequireRole allowedRoles={['driver']}>
      <ResponsiveContainer maxWidth="xl">
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Driver Dashboard
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '28px', fontSize: '14px' }}>
          Browse available loads, manage your bids and track accepted jobs.
        </p>

        {loading ? (
          <div className="loading-screen"><div className="loading-text">Loading…</div></div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <div className="stat-card">
                <div className="stat-label">Available Loads</div>
                <div className="stat-value">{stats.availableLoads}</div>
                <div className="stat-description">Open on the exchange</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">My Active Bids</div>
                <div className="stat-value blue">{stats.activeBids}</div>
                <div className="stat-description">Awaiting response</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Accepted Jobs</div>
                <div className="stat-value green">{stats.acceptedLoads}</div>
                <div className="stat-description">Jobs won</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { label: '📦 Browse Loads', desc: 'Find available loads to bid on', href: '/loads' },
                { label: '💰 My Quotes', desc: 'View and manage your bids', href: '/quotes' },
                { label: '🔄 Return Journeys', desc: 'Find return load opportunities', href: '/return-journeys' },
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

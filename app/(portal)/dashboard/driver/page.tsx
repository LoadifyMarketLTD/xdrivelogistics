'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import RequireRole from '@/components/auth/RequireRole'
import ResponsiveContainer from '@/components/layout/ResponsiveContainer'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

interface ActivityItem {
  id: string
  label: string
  time: string
  type: 'bid' | 'load' | 'accepted'
}

export default function DriverDashboardPage() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState({ activeBids: 0, acceptedLoads: 0, availableLoads: 0, completedLoads: 0 })
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let mounted = true

    const fetchData = async () => {
      try {
        const [{ data: activeBids }, { data: acceptedBids }, { data: openLoads }, { data: completedBids }, { data: recentBids }] =
          await Promise.all([
            supabase.from('job_bids').select('id').eq('bidder_id', user.id).eq('status', 'submitted'),
            supabase.from('job_bids').select('id').eq('bidder_id', user.id).eq('status', 'accepted'),
            supabase.from('jobs').select('id').eq('status', 'open'),
            supabase.from('job_bids').select('id').eq('bidder_id', user.id).eq('status', 'completed'),
            supabase.from('job_bids').select('id, status, created_at, jobs(pickup_location, delivery_location)').eq('bidder_id', user.id).order('created_at', { ascending: false }).limit(5),
          ])

        if (!mounted) return
        setStats({
          activeBids: activeBids?.length ?? 0,
          acceptedLoads: acceptedBids?.length ?? 0,
          availableLoads: openLoads?.length ?? 0,
          completedLoads: completedBids?.length ?? 0,
        })

        const feed: ActivityItem[] = (recentBids ?? []).map((b: any) => ({
          id: b.id,
          label: b.jobs
            ? `${b.status === 'accepted' ? '✅ Bid accepted' : b.status === 'submitted' ? '📨 Bid placed' : '📋 Bid'}: ${b.jobs.pickup_location} → ${b.jobs.delivery_location}`
            : `Bid ${b.status}`,
          time: new Date(b.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
          type: b.status === 'accepted' ? 'accepted' : 'bid',
        }))
        setActivity(feed)
      } catch (err) {
        console.error('Driver dashboard fetch error:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchData()
    return () => { mounted = false }
  }, [user])

  const gold = '#C8A64D'
  const navy = '#0A2239'

  return (
    <RequireRole allowedRoles={['driver']}>
      <ResponsiveContainer maxWidth="xl">

        {/* ── TOP STRIP ────────────────────────────────────────── */}
        <div style={{ background: navy, borderRadius: '10px', padding: '18px 24px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: gold, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>XDrive Logistics Ltd</div>
            <div style={{ color: '#ffffff', fontSize: '20px', fontWeight: '700', marginTop: '2px' }}>
              {profile?.display_name || profile?.full_name || user?.email?.split('@')[0] || 'Driver'} · Driver
            </div>
          </div>
          <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
            {[
              { label: 'Available Loads', value: stats.availableLoads, color: '#ffffff' },
              { label: 'Active Bids', value: stats.activeBids, color: gold },
              { label: 'Accepted', value: stats.acceptedLoads, color: '#22c55e' },
              { label: 'Completed', value: stats.completedLoads, color: '#60a5fa' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: s.color }}>{loading ? '—' : s.value}</div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── QUICK ACTIONS ───────────────────────────────────── */}
        <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '28px' }}>
          {[
            { label: '📦 Browse Loads', desc: 'Find & bid on loads', href: '/loads', highlight: true },
            { label: '💰 My Quotes', desc: 'View bid history', href: '/quotes' },
            { label: '🔄 Return Journeys', desc: 'Empty leg optimiser', href: '/return-journeys' },
            { label: '📅 Diary', desc: 'Your schedule', href: '/diary' },
          ].map((a) => (
            <a key={a.href} href={a.href} style={{ display: 'block', background: '#ffffff', border: `2px solid ${a.highlight ? gold : '#e5e7eb'}`, borderRadius: '8px', padding: '16px', textDecoration: 'none', transition: 'box-shadow 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 4px 12px rgba(200,166,77,0.18)` }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}>
              <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px', fontSize: '14px' }}>{a.label}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>{a.desc}</div>
            </a>
          ))}
        </div>

        {/* ── PERFORMANCE SNAPSHOT + ACTIVITY FEED ─────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

          {/* Performance Snapshot */}
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>📊 Performance Snapshot</h3>
            {[
              { label: 'Bid Win Rate', value: stats.activeBids + stats.acceptedLoads > 0 ? `${Math.round((stats.acceptedLoads / (stats.activeBids + stats.acceptedLoads)) * 100)}%` : '—', note: 'accepted / total bids' },
              { label: 'Active Bids', value: stats.activeBids, note: 'awaiting response' },
              { label: 'Jobs Completed', value: stats.completedLoads, note: 'all time' },
            ].map(m => (
              <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{m.label}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>{m.note}</div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: navy }}>{loading ? '—' : m.value}</div>
              </div>
            ))}
          </div>

          {/* Activity Feed */}
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>🕐 Recent Activity</h3>
            {loading ? (
              <div style={{ color: '#9ca3af', fontSize: '14px' }}>Loading…</div>
            ) : activity.length === 0 ? (
              <div style={{ color: '#9ca3af', fontSize: '14px' }}>No recent activity. Start bidding on loads!</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activity.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.type === 'accepted' ? '#22c55e' : gold, marginTop: '5px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '13px', color: '#1f2937', fontWeight: '500' }}>{item.label}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </ResponsiveContainer>
    </RequireRole>
  )
}


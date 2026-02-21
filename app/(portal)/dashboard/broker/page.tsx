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
  type: 'bid' | 'load' | 'new'
}

export default function BrokerDashboardPage() {
  const { user, companyId, profile } = useAuth()
  const [stats, setStats] = useState({ postedLoads: 0, incomingBids: 0, openLoads: 0, acceptedBids: 0 })
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)

  // Show welcome banner on first dashboard visit (FREE Option A — localStorage)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('xdrive_welcome_seen')) {
        setShowWelcome(true)
      }
    }
  }, [])

  const handleDismissWelcome = () => {
    localStorage.setItem('xdrive_welcome_seen', '1')
    setShowWelcome(false)
  }

  useEffect(() => {
    if (!user) return
    let mounted = true

    const fetchData = async () => {
      try {
        // Fetch company job IDs to scope incoming bids
        const jobIdsResult = companyId
          ? await supabase.from('jobs').select('id, pickup_location, delivery_location, created_at').eq('posted_by_company_id', companyId).order('created_at', { ascending: false })
          : { data: [] }

        const jobRows = jobIdsResult.data ?? []
        const jobIds = jobRows.map((j: any) => j.id)

        const [{ data: openLoads }, { data: incomingBids }, { data: acceptedBids }] =
          await Promise.all([
            supabase.from('jobs').select('id').eq('status', 'open'),
            jobIds.length > 0
              ? supabase.from('job_bids').select('id, created_at').in('job_id', jobIds).eq('status', 'submitted')
              : Promise.resolve({ data: [] }),
            jobIds.length > 0
              ? supabase.from('job_bids').select('id').in('job_id', jobIds).eq('status', 'accepted')
              : Promise.resolve({ data: [] }),
          ])

        if (!mounted) return
        setStats({
          openLoads: openLoads?.length ?? 0,
          postedLoads: jobIds.length,
          incomingBids: incomingBids?.length ?? 0,
          acceptedBids: acceptedBids?.length ?? 0,
        })

        // Build activity from recent posted loads + incoming bids
        const feed: ActivityItem[] = [
          ...((incomingBids ?? []).slice(0, 3).map((b: any) => ({
            id: `bid-${b.id}`,
            label: `💬 New bid received on your load`,
            time: new Date(b.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
            type: 'bid' as const,
          }))),
          ...(jobRows.slice(0, 3).map((j: any) => ({
            id: `load-${j.id}`,
            label: `📦 Load posted: ${j.pickup_location} → ${j.delivery_location}`,
            time: new Date(j.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
            type: 'load' as const,
          }))),
        ].slice(0, 5)

        setActivity(feed)
      } catch (err) {
        console.error('Broker dashboard fetch error:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchData()
    return () => { mounted = false }
  }, [user, companyId])

  const gold = '#C8A64D'
  const navy = '#0A2239'

  return (
    <RequireRole allowedRoles={['broker']}>
      <ResponsiveContainer maxWidth="xl">

        {/* ── WELCOME BANNER (first visit) ─────────────────────── */}
        {showWelcome && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '14px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <span style={{ fontSize: '15px', color: '#166534', fontWeight: '500' }}>
              🎉 Welcome to XDrive Logistics portal — your dashboard is ready.
            </span>
            <button
              onClick={handleDismissWelcome}
              style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '18px', cursor: 'pointer', lineHeight: 1, flexShrink: 0 }}
              aria-label="Dismiss"
            >×</button>
          </div>
        )}

        {/* ── TOP STRIP ────────────────────────────────────────── */}
        <div style={{ background: navy, borderRadius: '10px', padding: '18px 24px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: gold, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>XDrive Logistics Ltd</div>
            <div style={{ color: '#ffffff', fontSize: '20px', fontWeight: '700', marginTop: '2px' }}>
              {profile?.broker_company_name || profile?.display_name || user?.email?.split('@')[0] || 'Broker'} · Broker / Dispatcher
            </div>
          </div>
          <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
            {[
              { label: 'Open (System)', value: stats.openLoads, color: '#ffffff' },
              { label: 'My Loads', value: stats.postedLoads, color: gold },
              { label: 'Incoming Bids', value: stats.incomingBids, color: '#f97316' },
              { label: 'Accepted', value: stats.acceptedBids, color: '#22c55e' },
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '28px' }}>
          {[
            { label: '➕ Post a Load', desc: 'Create new posting', href: '/jobs/new', highlight: true },
            { label: '📦 My Loads', desc: 'Manage posted loads', href: '/loads' },
            { label: '💰 Incoming Quotes', desc: 'Review carrier bids', href: '/quotes' },
            { label: '📁 Directory', desc: 'Find carriers', href: '/directory' },
            { label: '📡 Live Availability', desc: 'Real-time carriers', href: '/live-availability' },
            { label: '📅 Diary', desc: 'Your schedule', href: '/diary' },
          ].map((a) => (
            <a key={a.href} href={a.href} style={{ display: 'block', background: '#ffffff', border: `2px solid ${a.highlight ? gold : '#e5e7eb'}`, borderRadius: '8px', padding: '14px', textDecoration: 'none', transition: 'box-shadow 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 4px 12px rgba(200,166,77,0.18)` }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}>
              <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px', fontSize: '13px' }}>{a.label}</div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>{a.desc}</div>
            </a>
          ))}
        </div>

        {/* ── PERFORMANCE SNAPSHOT + ACTIVITY FEED ─────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

          {/* Performance Snapshot */}
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>📊 Performance Snapshot</h3>
            {[
              { label: 'Fill Rate', value: stats.postedLoads > 0 ? `${Math.round((stats.acceptedBids / stats.postedLoads) * 100)}%` : '—', note: 'accepted / posted loads' },
              { label: 'Pending Bids', value: stats.incomingBids, note: 'awaiting your review' },
              { label: 'Loads Posted', value: stats.postedLoads, note: 'total on exchange' },
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
              <div style={{ color: '#9ca3af', fontSize: '14px' }}>No recent activity. Post your first load!</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activity.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.type === 'bid' ? '#f97316' : gold, marginTop: '5px', flexShrink: 0 }} />
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


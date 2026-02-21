'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import RequireRole from '@/components/auth/RequireRole'
import ResponsiveContainer from '@/components/layout/ResponsiveContainer'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

type Counts = { pendingBrokers: number; pendingCompanies: number }

export default function OwnerDashboardPage() {
  const [counts, setCounts] = useState<Counts>({ pendingBrokers: 0, pendingCompanies: 0 })
  const [loading, setLoading] = useState(true)
  const totalPending = counts.pendingBrokers + counts.pendingCompanies

  const gold = '#C8A64D'
  const navy = '#0A2239'

  useEffect(() => {
    let isMounted = true
    async function loadPendingCounts() {
      try {
        const [brokersResult, companiesResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('user_id', { count: 'exact', head: true })
            .eq('role', 'broker')
            .eq('status', 'pending'),
          supabase
            .from('companies')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'pending'),
        ])

        if (!isMounted) return
        setCounts({
          pendingBrokers: brokersResult.count ?? 0,
          pendingCompanies: companiesResult.count ?? 0,
        })
      } catch (err) {
        console.error('Owner dashboard fetch error:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadPendingCounts()
    return () => { isMounted = false }
  }, [])

  return (
    <RequireRole allowedRoles={['owner']}>
      <ResponsiveContainer maxWidth="xl">

        {/* ── TOP STRIP ─────────────────────────────────────────── */}
        <div style={{ background: navy, borderRadius: '10px', padding: '18px 24px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: gold, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>XDrive Logistics Ltd</div>
            <div style={{ color: '#ffffff', fontSize: '20px', fontWeight: '700', marginTop: '2px' }}>Owner Dashboard</div>
          </div>
          <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
            {[
              { label: 'Pending Brokers', value: counts.pendingBrokers, color: '#f97316' },
              { label: 'Pending Companies', value: counts.pendingCompanies, color: '#f97316' },
              { label: 'Total Pending', value: totalPending, color: totalPending > 0 ? '#f97316' : '#22c55e' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: stat.color }}>{loading ? '—' : stat.value}</div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PENDING NOTIFICATION BANNER ───────────────────────── */}
        {!loading && totalPending > 0 && (
          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '14px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <span style={{ fontSize: '15px', color: '#9a3412', fontWeight: '500' }}>
              🔔 You have {totalPending} pending approval{totalPending !== 1 ? 's' : ''} awaiting review.
            </span>
            <Link
              href="/admin/approvals"
              style={{ background: '#f97316', color: '#ffffff', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', fontSize: '13px', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              Review Now
            </Link>
          </div>
        )}

        {/* ── QUICK ACTIONS ─────────────────────────────────────── */}
        <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '28px' }}>
          {[
            { label: '✅ Approvals', desc: 'Manage pending users', href: '/admin/approvals', highlight: true },
            { label: '👥 Users', desc: 'View all profiles', href: '/admin/users' },
            { label: '🏢 Companies', desc: 'Manage companies', href: '/admin/companies' },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              style={{ display: 'block', background: '#ffffff', border: `2px solid ${a.highlight ? gold : '#e5e7eb'}`, borderRadius: '8px', padding: '14px', textDecoration: 'none' }}
            >
              <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px', fontSize: '13px' }}>{a.label}</div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>{a.desc}</div>
            </Link>
          ))}
        </div>

        {/* ── PENDING SUMMARY CARDS ─────────────────────────────── */}
        <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>Pending Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {[
            { label: 'Pending Brokers', value: counts.pendingBrokers, icon: '🧑‍💼', desc: 'Broker accounts awaiting approval' },
            { label: 'Pending Companies', value: counts.pendingCompanies, icon: '🏢', desc: 'Company registrations awaiting approval' },
          ].map(card => (
            <div key={card.label} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{card.icon}</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: loading ? '#9ca3af' : (card.value > 0 ? '#f97316' : navy) }}>
                {loading ? '—' : card.value}
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginTop: '4px' }}>{card.label}</div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{card.desc}</div>
              {!loading && card.value > 0 && (
                <Link
                  href="/admin/approvals"
                  style={{ display: 'inline-block', marginTop: '12px', fontSize: '12px', color: gold, fontWeight: '600', textDecoration: 'none' }}
                >
                  View approvals →
                </Link>
              )}
            </div>
          ))}
        </div>

      </ResponsiveContainer>
    </RequireRole>
  )
}

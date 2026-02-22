'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import RequireRole from '@/components/auth/RequireRole'
import ResponsiveContainer from '@/components/layout/ResponsiveContainer'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

interface AuditSection {
  label: string
  icon: string
  count: number | null
  status: 'ok' | 'warn' | 'error' | 'loading'
  detail?: string
}

const gold = '#C8A64D'
const navy = '#0A2239'

export default function SiteAuditPage() {
  const [sections, setSections] = useState<AuditSection[]>([
    { label: 'Total Users', icon: '👥', count: null, status: 'loading' },
    { label: 'Active Users', icon: '✅', count: null, status: 'loading' },
    { label: 'Pending Approvals', icon: '⏳', count: null, status: 'loading' },
    { label: 'Blocked Users', icon: '🚫', count: null, status: 'loading' },
    { label: 'Total Companies', icon: '🏢', count: null, status: 'loading' },
    { label: 'Active Companies', icon: '🏢', count: null, status: 'loading' },
    { label: 'Pending Companies', icon: '⏳', count: null, status: 'loading' },
    { label: 'Total Jobs', icon: '📦', count: null, status: 'loading' },
    { label: 'Open Jobs', icon: '🔓', count: null, status: 'loading' },
    { label: 'Total Bids', icon: '💬', count: null, status: 'loading' },
    { label: 'Total Invoices', icon: '🧾', count: null, status: 'loading' },
    { label: 'Total Vehicles', icon: '🚛', count: null, status: 'loading' },
    { label: 'Total Quotes', icon: '💰', count: null, status: 'loading' },
    { label: 'Total Drivers', icon: '👤', count: null, status: 'loading' },
    { label: 'Total Documents', icon: '📄', count: null, status: 'loading' },
  ])
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const runAudit = async () => {
    setSections(prev => prev.map(s => ({ ...s, status: 'loading', count: null })))

    const queries: Array<{ table: string; filter?: Record<string, string> }> = [
      { table: 'profiles' },
      { table: 'profiles', filter: { status: 'active' } },
      { table: 'profiles', filter: { status: 'pending' } },
      { table: 'profiles', filter: { status: 'blocked' } },
      { table: 'companies' },
      { table: 'companies', filter: { status: 'active' } },
      { table: 'companies', filter: { status: 'pending' } },
      { table: 'jobs' },
      { table: 'jobs', filter: { status: 'open' } },
      { table: 'job_bids' },
      { table: 'invoices' },
      { table: 'vehicles' },
      { table: 'quotes' },
      { table: 'profiles', filter: { role: 'driver' } },
      { table: 'documents' },
    ]

    const results = await Promise.all(
      queries.map(async ({ table, filter }) => {
        try {
          let q = supabase.from(table).select('id', { count: 'exact', head: true })
          if (filter) {
            for (const [col, val] of Object.entries(filter)) {
              q = q.eq(col, val)
            }
          }
          const { count, error } = await q
          if (error) return { count: null, ok: false }
          return { count: count ?? 0, ok: true }
        } catch {
          return { count: null, ok: false }
        }
      })
    )

    setSections(prev => prev.map((s, i) => {
      const r = results[i]
      let status: AuditSection['status'] = 'ok'
      if (!r.ok) status = 'error'
      else if (s.label === 'Pending Approvals' && (r.count ?? 0) > 0) status = 'warn'
      else if (s.label === 'Blocked Users' && (r.count ?? 0) > 0) status = 'warn'
      else if (s.label === 'Pending Companies' && (r.count ?? 0) > 0) status = 'warn'
      return { ...s, count: r.count, status }
    }))

    setLastRefresh(new Date())
  }

  useEffect(() => { runAudit() }, [])

  const statusStyle = (status: AuditSection['status']) => {
    if (status === 'ok') return { bg: '#f0fdf4', border: '#86efac', dot: '#16a34a' }
    if (status === 'warn') return { bg: '#fffbeb', border: '#fcd34d', dot: '#d97706' }
    if (status === 'error') return { bg: '#fef2f2', border: '#fca5a5', dot: '#dc2626' }
    return { bg: '#f9fafb', border: '#e5e7eb', dot: '#9ca3af' }
  }

  return (
    <RequireRole allowedRoles={['owner']}>
      <ResponsiveContainer maxWidth="xl">

        {/* Header */}
        <div style={{ background: navy, borderRadius: '10px', padding: '18px 24px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: gold, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>XDrive Logistics Ltd · Owner Admin</div>
            <div style={{ color: '#ffffff', fontSize: '20px', fontWeight: '700', marginTop: '2px' }}>📋 Site Audit</div>
            {lastRefresh && (
              <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>
                Last refreshed: {lastRefresh.toLocaleTimeString('en-GB')}
              </div>
            )}
          </div>
          <button
            onClick={runAudit}
            style={{ padding: '10px 20px', background: gold, border: 'none', borderRadius: '8px', color: navy, fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
          >
            🔄 Refresh Audit
          </button>
        </div>

        {/* Audit Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
          {sections.map(s => {
            const st = statusStyle(s.status)
            return (
              <div
                key={s.label}
                style={{ background: st.bg, border: `1px solid ${st.border}`, borderRadius: '10px', padding: '18px 16px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: st.dot, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{s.icon} {s.label}</span>
                </div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: navy }}>
                  {s.status === 'loading' ? '—' : s.status === 'error' ? 'ERR' : s.count}
                </div>
                {s.status === 'error' && (
                  <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>Query failed</div>
                )}
              </div>
            )
          })}
        </div>

        {/* Quick Links */}
        <div style={{ marginTop: '28px', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '14px' }}>Quick Links</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {[
              { label: '✅ Approvals', href: '/admin/approvals' },
              { label: '👥 All Users', href: '/admin/users' },
              { label: '🏢 All Companies', href: '/admin/companies' },
              { label: '📊 Analytics', href: '/analytics' },
              { label: '🔍 Diagnostics', href: '/diagnostics' },
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                style={{ padding: '8px 16px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#374151', fontSize: '13px', fontWeight: '500', textDecoration: 'none' }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

      </ResponsiveContainer>
    </RequireRole>
  )
}

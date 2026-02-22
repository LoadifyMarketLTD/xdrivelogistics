'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

interface Profile {
  user_id: string
  full_name: string | null
  email: string | null
  role: string | null
  status: string | null
  created_at: string
  company_id: string | null
}

const gold = '#C8A64D'
const navy = '#0A2239'

export default function AdminUsersPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [filtered, setFiltered] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  useEffect(() => {
    async function fetchProfiles() {
      setLoading(true)
      setError('')
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { router.push('/login'); return }

        const { data, error: fetchErr } = await supabase
          .from('profiles')
          .select('user_id, full_name, email, role, status, created_at, company_id')
          .order('created_at', { ascending: false })

        if (fetchErr) throw fetchErr
        setProfiles(data ?? [])
        setFiltered(data ?? [])
      } catch (err: any) {
        setError(err.message || 'Failed to load users')
      } finally {
        setLoading(false)
      }
    }
    fetchProfiles()
  }, [router])

  useEffect(() => {
    let result = profiles
    if (roleFilter !== 'all') {
      result = result.filter(p => p.role === roleFilter)
    }
    if (search.trim()) {
      const s = search.toLowerCase()
      result = result.filter(p =>
        p.full_name?.toLowerCase().includes(s) ||
        p.email?.toLowerCase().includes(s) ||
        p.user_id.toLowerCase().includes(s)
      )
    }
    setFiltered(result)
  }, [search, roleFilter, profiles])

  const statusColor = (status: string | null) => {
    if (status === 'active') return { bg: '#dcfce7', color: '#166534' }
    if (status === 'pending') return { bg: '#fef9c3', color: '#713f12' }
    if (status === 'blocked') return { bg: '#fee2e2', color: '#991b1b' }
    return { bg: '#f3f4f6', color: '#6b7280' }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f5f7', padding: '32px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: gold, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              XDrive Logistics Ltd · Owner Admin
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: navy, margin: 0 }}>👥 All Users</h1>
          </div>
          <button onClick={() => router.push('/dashboard')} style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', background: '#ffffff', color: '#374151', fontSize: '13px', cursor: 'pointer' }}>
            Dashboard
          </button>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '14px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search name, email, ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', minWidth: '240px', flex: 1 }}
          />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', background: '#fff' }}
          >
            <option value="all">All Roles</option>
            <option value="owner">Owner</option>
            <option value="broker">Broker</option>
            <option value="company_admin">Company Admin</option>
            <option value="driver">Driver</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '48px' }}>Loading…</div>
        ) : (
          <>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
              Showing {filtered.length} of {profiles.length} users
            </div>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                      {['Name', 'Email', 'Role', 'Status', 'Registered', 'Company ID'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>No users found</td></tr>
                    ) : (
                      filtered.map((p, i) => {
                        const sc = statusColor(p.status)
                        return (
                          <tr key={p.user_id} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: i % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                            <td style={{ padding: '10px 14px', fontWeight: '500', color: '#1f2937' }}>{p.full_name ?? '—'}</td>
                            <td style={{ padding: '10px 14px', color: '#4b5563' }}>{p.email ?? '—'}</td>
                            <td style={{ padding: '10px 14px', color: '#6b7280', fontStyle: 'italic' }}>{p.role ?? '—'}</td>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', backgroundColor: sc.bg, color: sc.color }}>
                                {p.status ?? 'unknown'}
                              </span>
                            </td>
                            <td style={{ padding: '10px 14px', color: '#9ca3af', fontSize: '12px' }}>{new Date(p.created_at).toLocaleDateString('en-GB')}</td>
                            <td style={{ padding: '10px 14px', color: '#9ca3af', fontSize: '11px', fontFamily: 'monospace' }}>{p.company_id ? p.company_id.slice(0, 8) + '…' : '—'}</td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

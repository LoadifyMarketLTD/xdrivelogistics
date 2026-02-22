'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

interface Company {
  id: string
  name: string
  status: string | null
  registration_no: string | null
  contact_email: string | null
  contact_phone: string | null
  created_at: string
}

const gold = '#C8A64D'
const navy = '#0A2239'

export default function AdminCompaniesPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [filtered, setFiltered] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    async function fetchCompanies() {
      setLoading(true)
      setError('')
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { router.push('/login'); return }

        const { data, error: fetchErr } = await supabase
          .from('companies')
          .select('id, name, status, registration_no, contact_email, contact_phone, created_at')
          .order('created_at', { ascending: false })

        if (fetchErr) throw fetchErr
        setCompanies(data ?? [])
        setFiltered(data ?? [])
      } catch (err: any) {
        setError(err.message || 'Failed to load companies')
      } finally {
        setLoading(false)
      }
    }
    fetchCompanies()
  }, [router])

  useEffect(() => {
    let result = companies
    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter)
    }
    if (search.trim()) {
      const s = search.toLowerCase()
      result = result.filter(c =>
        c.name?.toLowerCase().includes(s) ||
        c.contact_email?.toLowerCase().includes(s) ||
        c.registration_no?.toLowerCase().includes(s)
      )
    }
    setFiltered(result)
  }, [search, statusFilter, companies])

  const statusColor = (status: string | null) => {
    if (status === 'active') return { bg: '#dcfce7', color: '#166534' }
    if (status === 'pending') return { bg: '#fef9c3', color: '#713f12' }
    if (status === 'rejected') return { bg: '#fee2e2', color: '#991b1b' }
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
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: navy, margin: 0 }}>🏢 All Companies</h1>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => router.push('/admin/approvals')} style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', background: '#ffffff', color: '#374151', fontSize: '13px', cursor: 'pointer' }}>
              Approvals
            </button>
            <button onClick={() => router.push('/dashboard')} style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', background: '#ffffff', color: '#374151', fontSize: '13px', cursor: 'pointer' }}>
              Dashboard
            </button>
          </div>
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
            placeholder="Search name, email, reg no…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', minWidth: '240px', flex: 1 }}
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', background: '#fff' }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '48px' }}>Loading…</div>
        ) : (
          <>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
              Showing {filtered.length} of {companies.length} companies
            </div>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                      {['Company Name', 'Status', 'Reg. No.', 'Contact Email', 'Phone', 'Registered'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>No companies found</td></tr>
                    ) : (
                      filtered.map((c, i) => {
                        const sc = statusColor(c.status)
                        return (
                          <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: i % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                            <td style={{ padding: '10px 14px', fontWeight: '600', color: '#1f2937' }}>{c.name ?? '—'}</td>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', backgroundColor: sc.bg, color: sc.color }}>
                                {c.status ?? 'unknown'}
                              </span>
                            </td>
                            <td style={{ padding: '10px 14px', color: '#6b7280' }}>{c.registration_no ?? '—'}</td>
                            <td style={{ padding: '10px 14px', color: '#4b5563' }}>{c.contact_email ?? '—'}</td>
                            <td style={{ padding: '10px 14px', color: '#6b7280' }}>{c.contact_phone ?? '—'}</td>
                            <td style={{ padding: '10px 14px', color: '#9ca3af', fontSize: '12px' }}>{new Date(c.created_at).toLocaleDateString('en-GB')}</td>
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

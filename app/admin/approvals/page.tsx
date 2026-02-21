'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { approveBroker, rejectBroker, approveCompany, rejectCompany } from './actions'

interface PendingBroker {
  user_id: string
  full_name: string | null
  phone: string | null
  created_at: string
}

interface PendingCompany {
  user_id: string
  full_name: string | null
  phone: string | null
  created_at: string
  company: {
    id: string
    name: string
    status: string
    registration_no: string | null
    contact_email: string | null
    contact_phone: string | null
  } | null
}

const gold = '#C8A64D'
const navy = '#0A2239'

function ActionButton({ label, variant, onClick, disabled }: { label: string; variant: 'approve' | 'reject'; onClick: () => void; disabled: boolean }) {
  const bg = variant === 'approve' ? '#16a34a' : '#dc2626'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '7px 14px', border: 'none', borderRadius: '6px',
        backgroundColor: disabled ? '#9ca3af' : bg,
        color: '#ffffff', fontSize: '13px', fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {label}
    </button>
  )
}

export default function ApprovalsPage() {
  const router = useRouter()
  const [brokers, setBrokers] = useState<PendingBroker[]>([])
  const [companies, setCompanies] = useState<PendingCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      // Fetch pending brokers
      const { data: brokerData, error: brokerErr } = await supabase
        .from('profiles')
        .select('user_id, full_name, phone, created_at')
        .eq('role', 'broker')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })

      if (brokerErr) throw brokerErr

      // Fetch pending company admins
      const { data: companyAdminData, error: companyAdminErr } = await supabase
        .from('profiles')
        .select('user_id, full_name, phone, created_at')
        .eq('role', 'company_admin')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })

      if (companyAdminErr) throw companyAdminErr

      setBrokers((brokerData ?? []) as PendingBroker[])

      // Fetch companies for those admins via created_by
      const adminUserIds = (companyAdminData ?? []).map((p: any) => p.user_id)
      const companiesMap: Record<string, PendingCompany['company']> = {}
      if (adminUserIds.length > 0) {
        const { data: companiesData, error: companiesErr } = await supabase
          .from('companies')
          .select('id, name, status, registration_no, contact_email, contact_phone, created_by')
          .in('created_by', adminUserIds)
        if (companiesErr) throw companiesErr
        for (const c of (companiesData ?? [])) {
          companiesMap[c.created_by] = {
            id: c.id,
            name: c.name,
            status: c.status,
            registration_no: c.registration_no,
            contact_email: c.contact_email,
            contact_phone: c.contact_phone,
          }
        }
      }

      const mapped: PendingCompany[] = (companyAdminData ?? []).map((row: any) => ({
        user_id: row.user_id,
        full_name: row.full_name,
        phone: row.phone,
        created_at: row.created_at,
        company: companiesMap[row.user_id] ?? null,
      }))
      setCompanies(mapped)
    } catch (err: any) {
      setError(err.message || 'Failed to load approvals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleBrokerAction = (userId: string, action: 'approve' | 'reject') => {
    startTransition(async () => {
      try {
        if (action === 'approve') await approveBroker(userId)
        else await rejectBroker(userId)
        await fetchData()
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  const handleCompanyAction = (userId: string, companyId: string | undefined, action: 'approve' | 'reject') => {
    startTransition(async () => {
      try {
        if (action === 'approve') await approveCompany(userId, companyId)
        else await rejectCompany(userId, companyId)
        await fetchData()
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f5f7', padding: '32px 24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: gold, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              XDrive Logistics Ltd · Owner Admin
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: navy, margin: 0 }}>⚙️ Pending Approvals</h1>
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

        {loading ? (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '48px' }}>Loading…</div>
        ) : (
          <>
            {/* Pending Brokers */}
            <section style={{ marginBottom: '36px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#374151', marginBottom: '14px' }}>
                📋 Pending Brokers ({brokers.length})
              </h2>
              {brokers.length === 0 ? (
                <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e5e7eb', color: '#9ca3af', textAlign: 'center', fontSize: '14px' }}>
                  No pending brokers
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {brokers.map(b => (
                    <div key={b.user_id} style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e5e7eb', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>{b.full_name ?? '(no name)'}</div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                          {b.phone && <span>{b.phone} · </span>}
                          <span style={{ fontSize: '12px' }}>Registered {new Date(b.created_at).toLocaleDateString('en-GB')}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px', fontFamily: 'monospace' }}>{b.user_id}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <ActionButton label="✓ Approve" variant="approve" disabled={isPending} onClick={() => handleBrokerAction(b.user_id, 'approve')} />
                        <ActionButton label="✗ Reject" variant="reject" disabled={isPending} onClick={() => handleBrokerAction(b.user_id, 'reject')} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Pending Companies */}
            <section>
              <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#374151', marginBottom: '14px' }}>
                🏢 Pending Companies ({companies.length})
              </h2>
              {companies.length === 0 ? (
                <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e5e7eb', color: '#9ca3af', textAlign: 'center', fontSize: '14px' }}>
                  No pending companies
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {companies.map(c => (
                    <div key={c.user_id} style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e5e7eb', padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#1f2937' }}>
                            {c.company?.name ?? '(unnamed company)'}
                          </div>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '3px' }}>
                            Contact: {c.full_name ?? '—'}{c.phone ? ` · ${c.phone}` : ''}{c.company?.contact_email ? ` · ${c.company.contact_email}` : ''}
                          </div>
                          {c.company?.registration_no && (
                            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>Reg No: {c.company.registration_no}</div>
                          )}
                          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                            <span style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: '#fef9c3', color: '#713f12', borderRadius: '12px', fontWeight: '600' }}>
                              Company: {c.company?.status ?? 'unknown'}
                            </span>
                            <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>{c.user_id.slice(0, 8)}…</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <ActionButton label="✓ Approve" variant="approve" disabled={isPending} onClick={() => handleCompanyAction(c.user_id, c.company?.id, 'approve')} />
                          <ActionButton label="✗ Reject" variant="reject" disabled={isPending} onClick={() => handleCompanyAction(c.user_id, c.company?.id, 'reject')} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}

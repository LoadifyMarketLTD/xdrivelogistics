'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

interface Driver {
  user_id: string
  full_name: string | null
  phone: string | null
  created_at: string
}

interface Invite {
  id: string
  token: string
  invite_email: string | null
  invite_phone: string | null
  status: string
  expires_at: string
  created_at: string
}

export const dynamic = 'force-dynamic'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (typeof window !== 'undefined' ? window.location.origin : '')

export default function CompanyDriversPage() {
  const router = useRouter()
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState('')
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [creatingInvite, setCreatingInvite] = useState(false)
  const [newInviteUrl, setNewInviteUrl] = useState<string | null>(null)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Invite email / phone inputs (optional)
  const [inviteEmail, setInviteEmail] = useState('')
  const [invitePhone, setInvitePhone] = useState('')

  const gold = '#C8A64D'

  const fetchData = async (cId: string) => {
    // Drivers
    const { data: memberRows } = await supabase
      .from('company_members')
      .select('user_id, created_at, profiles:profiles!company_members_user_id_fkey(full_name, phone)')
      .eq('company_id', cId)
      .eq('member_role', 'driver')
      .order('created_at', { ascending: false })

    const mapped: Driver[] = (memberRows ?? []).map((r: any) => ({
      user_id: r.user_id,
      full_name: r.profiles?.full_name ?? null,
      phone: r.profiles?.phone ?? null,
      created_at: r.created_at,
    }))
    setDrivers(mapped)

    // Invites
    const { data: inviteRows } = await supabase
      .from('invites')
      .select('id, token, invite_email, invite_phone, status, expires_at, created_at')
      .eq('company_id', cId)
      .order('created_at', { ascending: false })
      .limit(20)

    setInvites(inviteRows ?? [])
  }

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      // Find approved company where user is admin
      const { data: memberRow } = await supabase
        .from('company_members')
        .select('company_id, companies(id, name, status)')
        .eq('user_id', session.user.id)
        .eq('member_role', 'admin')
        .maybeSingle()

      const company = (memberRow as any)?.companies
      if (!company || company.status !== 'approved') {
        setError('Your company must be approved before you can manage drivers.')
        setLoading(false)
        return
      }

      setCompanyId(company.id)
      setCompanyName(company.name)
      await fetchData(company.id)
      setLoading(false)
    }
    init()
  }, [router])

  const handleCreateInvite = async () => {
    if (!companyId) return
    setCreatingInvite(true)
    setError('')
    setNewInviteUrl(null)

    try {
      const { data, error: rpcErr } = await supabase.rpc('create_driver_invite', {
        p_company_id: companyId,
        p_invite_email: inviteEmail.trim() || null,
        p_invite_phone: invitePhone.trim() || null,
        p_token: null,
        p_expires_hours: 72,
      })

      if (rpcErr) throw rpcErr

      const invite = typeof data === 'string' ? JSON.parse(data) : data
      const inviteUrl = `${siteUrl}/invite/accept?token=${invite.token}`
      setNewInviteUrl(inviteUrl)
      setInviteEmail('')
      setInvitePhone('')
      await fetchData(companyId)
    } catch (err: any) {
      setError(err.message || 'Failed to create invite')
    } finally {
      setCreatingInvite(false)
    }
  }

  const copyToClipboard = async (text: string, tokenId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedToken(tokenId)
      setTimeout(() => setCopiedToken(null), 2000)
    } catch {
      // fallback: select text
    }
  }

  if (loading) return <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>Loading…</div>

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f5f7', padding: '32px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: gold, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
            {companyName}
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1f2937', margin: 0 }}>🚚 Drivers & Invites</h1>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '14px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* Create Invite Card */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e5e7eb', padding: '20px 24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            ➕ Create Driver Invite
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>Invite Email (optional)</label>
              <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="driver@example.com" disabled={creatingInvite}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>Invite Phone (optional)</label>
              <input type="tel" value={invitePhone} onChange={e => setInvitePhone(e.target.value)} placeholder="+44 7xxx xxx xxx" disabled={creatingInvite}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </div>
          </div>

          <button onClick={handleCreateInvite} disabled={creatingInvite} style={{
            padding: '10px 20px', backgroundColor: gold, border: 'none', borderRadius: '8px',
            color: '#ffffff', fontSize: '14px', fontWeight: '600',
            cursor: creatingInvite ? 'not-allowed' : 'pointer', opacity: creatingInvite ? 0.6 : 1,
          }}>
            {creatingInvite ? 'Generating…' : '🔗 Generate Invite Link'}
          </button>

          {/* New invite URL */}
          {newInviteUrl && (
            <div style={{ marginTop: '16px', padding: '14px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#16a34a', marginBottom: '8px' }}>✅ Invite link created! Copy and send to the driver:</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <code style={{ flex: 1, fontSize: '12px', backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #d1fae5', wordBreak: 'break-all', color: '#374151' }}>
                  {newInviteUrl}
                </code>
                <button onClick={() => copyToClipboard(newInviteUrl, 'new')} style={{
                  padding: '8px 14px', backgroundColor: '#16a34a', border: 'none', borderRadius: '6px',
                  color: '#ffffff', fontSize: '12px', fontWeight: '600', cursor: 'pointer', flexShrink: 0,
                }}>
                  {copiedToken === 'new' ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                ℹ️ Valid for 72 hours. Share via WhatsApp, SMS, or email.
              </div>
            </div>
          )}
        </div>

        {/* Active Drivers */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e5e7eb', padding: '20px 24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            👥 Active Drivers ({drivers.length})
          </h2>
          {drivers.length === 0 ? (
            <div style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
              No drivers yet. Create an invite link to add your first driver.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {drivers.map(d => (
                <div key={d.user_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{d.full_name ?? '(unnamed driver)'}</div>
                    {d.phone && <div style={{ fontSize: '12px', color: '#6b7280' }}>{d.phone}</div>}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                    Joined {new Date(d.created_at).toLocaleDateString('en-GB')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Invites */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e5e7eb', padding: '20px 24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            🔗 Recent Invites ({invites.length})
          </h2>
          {invites.length === 0 ? (
            <div style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>No invites created yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {invites.map(inv => {
                const invUrl = `${siteUrl}/invite/accept?token=${inv.token}`
                const isActive = inv.status === 'sent' && new Date(inv.expires_at) > new Date()
                return (
                  <div key={inv.id} style={{ padding: '12px 14px', backgroundColor: '#f9fafb', borderRadius: '8px', border: `1px solid ${isActive ? '#d1fae5' : '#f3f4f6'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', fontWeight: '600',
                        backgroundColor: isActive ? '#dcfce7' : inv.status === 'accepted' ? '#e0f2fe' : '#f3f4f6',
                        color: isActive ? '#16a34a' : inv.status === 'accepted' ? '#0369a1' : '#6b7280',
                      }}>
                        {inv.status === 'sent' && !isActive ? 'expired' : inv.status}
                      </span>
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                        {new Date(inv.created_at).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                    {inv.invite_email && <div style={{ fontSize: '12px', color: '#6b7280' }}>📧 {inv.invite_email}</div>}
                    {inv.invite_phone && <div style={{ fontSize: '12px', color: '#6b7280' }}>📞 {inv.invite_phone}</div>}
                    {isActive && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <code style={{ flex: 1, fontSize: '11px', color: '#374151', wordBreak: 'break-all' }}>{invUrl}</code>
                        <button onClick={() => copyToClipboard(invUrl, inv.id)} style={{
                          padding: '5px 10px', backgroundColor: gold, border: 'none', borderRadius: '5px',
                          color: '#ffffff', fontSize: '11px', fontWeight: '600', cursor: 'pointer', flexShrink: 0,
                        }}>
                          {copiedToken === inv.id ? '✓ Copied' : '📋 Copy'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

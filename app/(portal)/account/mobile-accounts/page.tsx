'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

interface MobileUser {
  id: string
  full_name: string | null
  first_name: string | null
  last_name: string | null
  email: string
  is_driver: boolean
  has_mobile_account: boolean
  mobile_option: string
}

export default function MobileAccountsPage() {
  const { companyId } = useAuth()
  const [users, setUsers] = useState<MobileUser[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    if (!companyId) return
    const fetchUsers = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('user_id,full_name,first_name,last_name,email,is_driver,has_mobile_account,mobile_option')
          .eq('company_id', companyId)
          .order('full_name', { ascending: true })
        setUsers(data || [])
      } catch (err) {
        console.error('Error fetching mobile accounts:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [companyId])

  const toggleMobileAccess = async (userId: string, currentValue: boolean) => {
    try {
      setSaving(userId)
      const { error } = await supabase
        .from('profiles')
        .update({ has_mobile_account: !currentValue, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
      if (error) throw error
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, has_mobile_account: !currentValue } : u))
    } catch (err: any) {
      alert('Failed to update: ' + err.message)
    } finally {
      setSaving(null)
    }
  }

  const updateMobileOption = async (userId: string, option: string) => {
    try {
      setSaving(userId)
      const { error } = await supabase
        .from('profiles')
        .update({ mobile_option: option, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
      if (error) throw error
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, mobile_option: option } : u))
    } catch (err: any) {
      alert('Failed to update: ' + err.message)
    } finally {
      setSaving(null)
    }
  }

  const mobileEnabled = users.filter(u => u.has_mobile_account)

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0A2239', marginBottom: '8px' }}>
          Mobile Accounts
        </h1>
        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
          Manage mobile app access for your drivers and team members.
        </p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Users', value: users.length, color: '#0A2239' },
          { label: 'Mobile Access Enabled', value: mobileEnabled.length, color: '#16A34A' },
          { label: 'Drivers', value: users.filter(u => u.is_driver).length, color: '#3b82f6' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>Loading...</div>
      ) : users.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
          <p style={{ color: '#6b7280' }}>No users found. Add users in the Users &amp; Drivers section.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Name', 'Email', 'Role', 'Mobile Access', 'Plan'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ padding: '14px 16px', fontWeight: '600', fontSize: '14px', color: '#1f2937' }}>
                    {u.full_name || [u.first_name, u.last_name].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#374151' }}>{u.email}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: '12px', fontWeight: '600',
                      color: u.is_driver ? '#3b82f6' : '#6b7280',
                      background: u.is_driver ? '#eff6ff' : '#f9fafb',
                      borderRadius: '20px', padding: '3px 10px',
                      border: `1px solid ${u.is_driver ? '#bfdbfe' : '#e5e7eb'}`,
                    }}>
                      {u.is_driver ? 'Driver' : 'User'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => toggleMobileAccess(u.id, u.has_mobile_account)}
                      disabled={saving === u.id}
                      style={{
                        width: '44px', height: '24px', borderRadius: '12px', border: 'none',
                        background: u.has_mobile_account ? '#16A34A' : '#d1d5db',
                        cursor: 'pointer', position: 'relative',
                        opacity: saving === u.id ? 0.6 : 1,
                      }}
                    >
                      <span style={{
                        position: 'absolute', top: '2px',
                        left: u.has_mobile_account ? '22px' : '2px',
                        width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                        transition: 'left 0.2s',
                      }} />
                    </button>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <select
                      value={u.mobile_option || 'FREE'}
                      onChange={e => updateMobileOption(u.id, e.target.value)}
                      disabled={!u.has_mobile_account || saving === u.id}
                      style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', cursor: 'pointer', background: u.has_mobile_account ? '#fff' : '#f9fafb', color: u.has_mobile_account ? '#374151' : '#9ca3af' }}
                    >
                      <option value="FREE">Free</option>
                      <option value="PRO">Pro</option>
                      <option value="ENTERPRISE">Enterprise</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}


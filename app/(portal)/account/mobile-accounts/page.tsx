'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/AuthContext'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

interface MobileDriver {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  has_mobile_account: boolean
  mobile_option: string | null
  is_active: boolean
}

export default function MobileAccountsPage() {
  const { companyId } = useAuth()
  const [drivers, setDrivers] = useState<MobileDriver[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    if (!companyId) { setLoading(false); return }

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone, has_mobile_account, mobile_option, is_active')
          .eq('company_id', companyId)
          .eq('is_driver', true)
          .order('full_name')

        if (error) throw error
        setDrivers(data || [])
      } catch (e) {
        console.error('Error fetching mobile accounts:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [companyId])

  const handleToggle = async (driverId: string, current: boolean) => {
    setToggling(driverId)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ has_mobile_account: !current, updated_at: new Date().toISOString() })
        .eq('id', driverId)

      if (error) throw error
      setDrivers((prev) =>
        prev.map((d) => d.id === driverId ? { ...d, has_mobile_account: !current } : d)
      )
    } catch (e) {
      console.error('Error toggling mobile access:', e)
    } finally {
      setToggling(null)
    }
  }

  if (loading) return <div className="loading-screen"><div>Loading mobile accounts…</div></div>

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0A2239', marginBottom: '8px' }}>
          Mobile Accounts
        </h1>
        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
          Enable or disable mobile app access for your drivers.
        </p>
      </div>

      {drivers.length === 0 ? (
        <div style={{
          background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px',
          padding: '48px 32px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👷</div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
            No drivers found
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Add drivers to your company first via Drivers &amp; Vehicles.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '720px' }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr auto auto',
            padding: '8px 16px', fontSize: '12px', fontWeight: '700',
            color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.4px',
          }}>
            <span>Driver</span>
            <span style={{ textAlign: 'center', minWidth: '100px' }}>Plan</span>
            <span style={{ textAlign: 'center', minWidth: '100px' }}>Mobile Access</span>
          </div>

          {drivers.map((driver) => (
            <div key={driver.id} style={{
              display: 'grid', gridTemplateColumns: '1fr auto auto',
              alignItems: 'center', padding: '14px 16px',
              background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', gap: '12px',
            }}>
              {/* Driver info */}
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                  {driver.full_name || driver.email}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {driver.email}{driver.phone ? ` · ${driver.phone}` : ''}
                </div>
              </div>

              {/* Plan badge */}
              <div style={{ textAlign: 'center', minWidth: '100px' }}>
                <span style={{
                  fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '12px',
                  background: driver.mobile_option === 'PAID' ? '#dbeafe' : '#f3f4f6',
                  color: driver.mobile_option === 'PAID' ? '#1d4ed8' : '#374151',
                }}>
                  {driver.mobile_option || 'FREE'}
                </span>
              </div>

              {/* Toggle */}
              <div style={{ textAlign: 'center', minWidth: '100px' }}>
                <button
                  role="switch"
                  aria-checked={driver.has_mobile_account}
                  disabled={toggling === driver.id}
                  onClick={() => handleToggle(driver.id, driver.has_mobile_account)}
                  style={{
                    width: '44px', height: '24px', borderRadius: '12px', border: 'none',
                    cursor: toggling === driver.id ? 'not-allowed' : 'pointer',
                    background: driver.has_mobile_account ? '#C8A64D' : '#d1d5db',
                    position: 'relative', opacity: toggling === driver.id ? 0.5 : 1,
                    transition: 'background 0.2s',
                  }}
                >
                  <span style={{
                    position: 'absolute', top: '3px',
                    left: driver.has_mobile_account ? '23px' : '3px',
                    width: '18px', height: '18px', borderRadius: '50%', background: '#ffffff',
                    transition: 'left 0.2s',
                  }} />
                </button>
              </div>
            </div>
          ))}

          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
            {drivers.filter((d) => d.has_mobile_account).length} of {drivers.length} drivers have mobile access enabled.
          </p>
        </div>
      )}
    </div>
  )
}


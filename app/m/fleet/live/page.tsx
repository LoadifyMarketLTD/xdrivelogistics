'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/AuthContext'
import { brandColors } from '@/lib/brandColors'

interface Vehicle {
  id: string
  registration: string
  vehicle_type: string | null
  make: string | null
  model: string | null
  is_available: boolean
}

export default function FleetLivePage() {
  const { companyId } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!companyId) { setLoading(false); return }
    const load = async () => {
      try {
        const { data } = await supabase
          .from('vehicles')
          .select('id, registration, vehicle_type, make, model, is_available')
          .eq('company_id', companyId)
          .order('registration')
        setVehicles(data || [])
      } catch (e) {
        console.error('Fleet live error:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
    // Refresh every 30 seconds
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [companyId])

  if (loading) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: brandColors.text.secondary }}>
        Loading fleet status…
      </div>
    )
  }

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontSize: '18px', fontWeight: '700', color: brandColors.text.primary, marginBottom: '4px' }}>
        Live Fleet
      </h1>
      <p style={{ fontSize: '13px', color: brandColors.text.secondary, marginBottom: '16px' }}>
        {vehicles.filter(v => v.is_available).length} of {vehicles.length} vehicles available · refreshes every 30 s
      </p>

      {vehicles.length === 0 ? (
        <div style={{
          background: brandColors.background.white,
          border: `1px solid ${brandColors.border?.light ?? '#e5e7eb'}`,
          borderRadius: '12px', padding: '32px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🚛</div>
          <p style={{ color: brandColors.text.secondary, fontSize: '14px' }}>
            No vehicles registered yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {vehicles.map((v) => (
            <div key={v.id} style={{
              background: brandColors.background.white,
              border: `1px solid ${brandColors.border?.light ?? '#e5e7eb'}`,
              borderRadius: '12px', padding: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: brandColors.text.primary }}>
                  {v.registration}
                </div>
                <div style={{ fontSize: '12px', color: brandColors.text.secondary, marginTop: '2px' }}>
                  {[v.vehicle_type, v.make, v.model].filter(Boolean).join(' · ') || 'Vehicle'}
                </div>
              </div>
              <span style={{
                fontSize: '12px', fontWeight: '600',
                padding: '4px 10px', borderRadius: '20px',
                background: v.is_available ? '#dcfce7' : '#fee2e2',
                color: v.is_available ? '#16a34a' : '#dc2626',
              }}>
                {v.is_available ? '● Available' : '● Unavailable'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


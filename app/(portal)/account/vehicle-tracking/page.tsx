'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/AuthContext'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

interface Vehicle {
  id: string
  registration: string
  vehicle_type: string | null
  make: string | null
  model: string | null
  is_available: boolean
  year: number | null
}

export default function VehicleTrackingPage() {
  const { companyId } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!companyId) { setLoading(false); return }

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('id, registration, vehicle_type, make, model, is_available, year')
          .eq('company_id', companyId)
          .order('registration')

        if (error) throw error
        setVehicles(data || [])
      } catch (e) {
        console.error('Error fetching vehicles:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [companyId])

  if (loading) return <div className="loading-screen"><div>Loading vehicles…</div></div>

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0A2239', marginBottom: '8px' }}>
          Vehicle Tracking
        </h1>
        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
        Fleet status overview for all your registered vehicles.
        </p>
      </div>

      {/* Summary bar */}
      <div style={{
        display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px',
      }}>
        {[
          { label: 'Total Vehicles', value: vehicles.length, color: '#1f2937', bg: '#f3f4f6' },
          { label: 'Available', value: vehicles.filter((v) => v.is_available).length, color: '#166534', bg: '#dcfce7' },
          { label: 'Unavailable', value: vehicles.filter((v) => !v.is_available).length, color: '#9a3412', bg: '#fee2e2' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{
            background: bg, borderRadius: '8px', padding: '16px 24px',
            minWidth: '140px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color }}>{value}</div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{label}</div>
          </div>
        ))}
      </div>

      {vehicles.length === 0 ? (
        <div style={{
          background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px',
          padding: '48px 32px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚛</div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
            No vehicles registered
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Add vehicles via My Fleet to track them here.
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Registration', 'Type', 'Make / Model', 'Year', 'Status'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.4px', textAlign: 'left' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v, idx) => (
                <tr key={v.id} style={{ borderBottom: idx < vehicles.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                    {v.registration}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>
                    {v.vehicle_type || '—'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>
                    {[v.make, v.model].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>
                    {v.year || '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '12px',
                      background: v.is_available ? '#dcfce7' : '#fee2e2',
                      color: v.is_available ? '#166534' : '#9a3412',
                    }}>
                      {v.is_available ? 'Available' : 'Unavailable'}
                    </span>
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


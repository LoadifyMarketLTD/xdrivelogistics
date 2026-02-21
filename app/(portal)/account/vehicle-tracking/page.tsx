'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

interface Vehicle {
  id: string
  registration: string
  make: string | null
  model: string | null
  driver_name: string | null
  current_status: string
  current_location: string | null
  last_tracked_at: string | null
  is_tracked: boolean
  vehicle_type: string
}

const STATUS_COLORS: Record<string, string> = {
  available: '#16A34A',
  on_job: '#3b82f6',
  unavailable: '#ef4444',
}
const STATUS_LABELS: Record<string, string> = {
  available: 'Available',
  on_job: 'On Job',
  unavailable: 'Unavailable',
}

export default function VehicleTrackingPage() {
  const { companyId } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!companyId) return
    const fetchVehicles = async () => {
      try {
        const { data } = await supabase
          .from('vehicles')
          .select('id,registration,make,model,driver_name,current_status,current_location,last_tracked_at,is_tracked,vehicle_type')
          .eq('company_id', companyId)
          .order('driver_name', { ascending: true })
        setVehicles(data || [])
      } catch (err) {
        console.error('Error fetching vehicles:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchVehicles()
    const interval = setInterval(fetchVehicles, 30000)
    return () => clearInterval(interval)
  }, [companyId])

  const tracked = vehicles.filter(v => v.is_tracked)
  const untracked = vehicles.filter(v => !v.is_tracked)

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0A2239', marginBottom: '8px' }}>
          Vehicle Tracking
        </h1>
        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
          Real-time GPS tracking for your fleet vehicles.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>Loading vehicles...</div>
      ) : vehicles.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '48px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚛</div>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>No vehicles found. Add vehicles in the Drivers &amp; Vehicles section.</p>
        </div>
      ) : (
        <>
          {/* Summary row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Total Vehicles', value: vehicles.length, color: '#0A2239' },
              { label: 'Tracked', value: tracked.length, color: '#16A34A' },
              { label: 'Untracked', value: untracked.length, color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Vehicle list */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['Registration', 'Vehicle', 'Driver', 'Status', 'Location', 'Last Seen'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v, i) => {
                  const color = STATUS_COLORS[v.current_status] || '#9ca3af'
                  return (
                    <tr key={v.id} style={{ borderBottom: i < vehicles.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '700', color: '#0A2239', fontSize: '14px' }}>{v.registration}</td>
                      <td style={{ padding: '14px 16px', fontSize: '14px', color: '#374151' }}>
                        {[v.make, v.model].filter(Boolean).join(' ') || v.vehicle_type}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '14px', color: '#374151' }}>{v.driver_name || '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          fontSize: '12px', fontWeight: '600', color,
                          background: `${color}15`, borderRadius: '20px',
                          padding: '3px 10px', border: `1px solid ${color}30`,
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, display: 'inline-block' }} />
                          {STATUS_LABELS[v.current_status] || v.current_status || 'Unknown'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>{v.current_location || '—'}</td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#9ca3af' }}>
                        {v.last_tracked_at
                          ? new Date(v.last_tracked_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}


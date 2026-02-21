'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { brandColors } from '@/lib/brandColors'
import { Vehicle } from '@/lib/types'

export default function FleetLivePage() {
  const { companyId } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!companyId) return
    const fetchVehicles = async () => {
      try {
        const { data } = await supabase
          .from('vehicles')
          .select('*')
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return brandColors.status.success
      case 'on_job': return brandColors.status.info
      case 'unavailable': return brandColors.status.error
      default: return brandColors.text.secondary
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Available'
      case 'on_job': return 'On Job'
      case 'unavailable': return 'Unavailable'
      default: return status || 'Unknown'
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <div style={{ color: brandColors.text.secondary }}>Loading vehicles...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: '700', color: brandColors.text.primary, marginBottom: '4px' }}>
        Live Tracking
      </h1>
      <p style={{ fontSize: '13px', color: brandColors.text.secondary, marginBottom: '16px' }}>
        {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} in your fleet
      </p>

      {vehicles.length === 0 ? (
        <div style={{
          background: brandColors.mobile.cardBackground,
          border: `1px solid ${brandColors.mobile.cardBorder}`,
          borderRadius: '12px',
          padding: '40px 20px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚛</div>
          <p style={{ color: brandColors.text.secondary, fontSize: '14px' }}>No vehicles found in your fleet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              style={{
                background: brandColors.mobile.cardBackground,
                border: `1px solid ${brandColors.mobile.cardBorder}`,
                borderRadius: '12px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: brandColors.text.primary }}>
                    {vehicle.registration}
                  </div>
                  <div style={{ fontSize: '13px', color: brandColors.text.secondary }}>
                    {[vehicle.make, vehicle.model, vehicle.year].filter(Boolean).join(' ')}
                  </div>
                </div>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: getStatusColor(vehicle.current_status),
                  background: `${getStatusColor(vehicle.current_status)}20`,
                  borderRadius: '20px',
                  padding: '3px 10px',
                  border: `1px solid ${getStatusColor(vehicle.current_status)}40`,
                }}>
                  {getStatusLabel(vehicle.current_status)}
                </span>
              </div>

              {vehicle.driver_name && (
                <div style={{ fontSize: '13px', color: brandColors.text.secondary, marginBottom: '4px' }}>
                  👤 {vehicle.driver_name}
                </div>
              )}
              {vehicle.current_location && (
                <div style={{ fontSize: '13px', color: brandColors.text.secondary, marginBottom: '4px' }}>
                  📍 {vehicle.current_location}
                </div>
              )}
              {vehicle.last_tracked_at && (
                <div style={{ fontSize: '12px', color: brandColors.text.light }}>
                  Last seen: {new Date(vehicle.last_tracked_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


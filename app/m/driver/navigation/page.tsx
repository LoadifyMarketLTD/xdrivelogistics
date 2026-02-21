'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/AuthContext'
import { brandColors } from '@/lib/brandColors'

interface ActiveJob {
  id: string
  pickup_location: string
  delivery_location: string
  pickup_lat: number | null
  pickup_lng: number | null
  delivery_lat: number | null
  delivery_lng: number | null
  status: string
}

export default function DriverNavigationPage() {
  const { profile } = useAuth()
  const [job, setJob] = useState<ActiveJob | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id) { setLoading(false); return }
    const load = async () => {
      try {
        const { data } = await supabase
          .from('jobs')
          .select('id, pickup_location, delivery_location, pickup_lat, pickup_lng, delivery_lat, delivery_lng, status')
          .eq('driver_id', profile.id)
          .in('status', ['assigned', 'in_progress'])
          .order('pickup_datetime', { ascending: true })
          .limit(1)
          .maybeSingle()
        setJob(data)
      } catch (e) {
        console.error('Navigation error:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [profile?.id])

  const openGoogleMaps = (origin: string, destination: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`
    window.open(url, '_blank', 'noopener')
  }

  const openGoogleMapsCoords = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
    window.open(url, '_blank', 'noopener')
  }

  if (loading) {
    return <div style={{ padding: '16px', color: brandColors.text.secondary }}>Loading navigation…</div>
  }

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontSize: '18px', fontWeight: '700', color: brandColors.text.primary, marginBottom: '16px' }}>
        Navigation
      </h1>

      {!job ? (
        <div style={{
          background: '#ffffff', border: '1px solid #e5e7eb',
          borderRadius: '12px', padding: '32px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📍</div>
          <p style={{ color: brandColors.text.secondary, fontSize: '14px', marginBottom: '16px' }}>
            No active job assigned. Accept a job first to get navigation.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Job summary */}
          <div style={{
            background: '#ffffff', border: '1px solid #e5e7eb',
            borderRadius: '12px', padding: '16px',
          }}>
            <div style={{ fontSize: '13px', color: brandColors.text.secondary, marginBottom: '4px' }}>Active Job</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: brandColors.text.primary }}>
              {job.pickup_location}
            </div>
            <div style={{ fontSize: '14px', color: brandColors.text.secondary, margin: '4px 0' }}>↓</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: brandColors.text.primary }}>
              {job.delivery_location}
            </div>
          </div>

          {/* Navigate to Pickup */}
          <button
            onClick={() => {
              if (job.pickup_lat && job.pickup_lng) {
                openGoogleMapsCoords(job.pickup_lat, job.pickup_lng)
              } else {
                openGoogleMaps('current location', job.pickup_location)
              }
            }}
            style={{
              background: brandColors.primary.gold, color: '#ffffff',
              border: 'none', borderRadius: '12px', padding: '16px',
              fontSize: '15px', fontWeight: '700', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}
          >
            <span style={{ fontSize: '24px' }}>🟡</span>
            Navigate to Pickup
          </button>

          {/* Navigate to Delivery */}
          <button
            onClick={() => {
              if (job.delivery_lat && job.delivery_lng) {
                openGoogleMapsCoords(job.delivery_lat, job.delivery_lng)
              } else {
                openGoogleMaps(job.pickup_location, job.delivery_location)
              }
            }}
            style={{
              background: brandColors.primary.navy, color: '#ffffff',
              border: 'none', borderRadius: '12px', padding: '16px',
              fontSize: '15px', fontWeight: '700', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}
          >
            <span style={{ fontSize: '24px' }}>📍</span>
            Navigate to Delivery
          </button>

          {/* Full Route */}
          <button
            onClick={() => openGoogleMaps(job.pickup_location, job.delivery_location)}
            style={{
              background: '#f3f4f6', color: brandColors.text.primary,
              border: '1px solid #e5e7eb', borderRadius: '12px', padding: '14px',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            }}
          >
            🗺️ View Full Route in Google Maps
          </button>

          <p style={{ fontSize: '12px', color: brandColors.text.secondary, textAlign: 'center' }}>
            Opens Google Maps with turn-by-turn directions
          </p>
        </div>
      )}
    </div>
  )
}


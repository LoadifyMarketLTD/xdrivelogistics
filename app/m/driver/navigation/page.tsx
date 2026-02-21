'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { brandColors } from '@/lib/brandColors'

interface ActiveJob {
  id: string
  pickup_location: string
  delivery_location: string
  pickup_datetime: string | null
  delivery_datetime: string | null
  status: string
  pickup_lat: number | null
  pickup_lng: number | null
  delivery_lat: number | null
  delivery_lng: number | null
  vehicle_type: string | null
  load_details: string | null
}

function mapsUrl(label: string, lat: number | null, lng: number | null, address: string): string {
  if (lat && lng) return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(lat)},${encodeURIComponent(lng)}`
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
}

function wazeUrl(lat: number | null, lng: number | null, address: string): string {
  if (lat && lng) return `https://waze.com/ul?ll=${encodeURIComponent(lat)},${encodeURIComponent(lng)}&navigate=yes`
  return `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`
}

export default function DriverNavigationPage() {
  const { profile } = useAuth()
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id) return
    const fetch = async () => {
      try {
        const { data } = await supabase
          .from('jobs')
          .select('id,pickup_location,delivery_location,pickup_datetime,delivery_datetime,status,pickup_lat,pickup_lng,delivery_lat,delivery_lng,vehicle_type,load_details')
          .eq('driver_id', profile.id)
          .in('status', ['assigned', 'in_progress'])
          .order('pickup_datetime', { ascending: true })
          .limit(1)
          .maybeSingle()
        setActiveJob(data || null)
      } catch (err) {
        console.error('Error fetching active job:', err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [profile?.id])

  if (loading) {
    return (
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <div style={{ color: brandColors.text.secondary }}>Loading navigation...</div>
      </div>
    )
  }

  if (!activeJob) {
    return (
      <div style={{ padding: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: brandColors.text.primary, marginBottom: '16px' }}>
          Navigation
        </h1>
        <div style={{
          background: brandColors.mobile.cardBackground,
          border: `1px solid ${brandColors.mobile.cardBorder}`,
          borderRadius: '12px',
          padding: '40px 20px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📍</div>
          <p style={{ color: brandColors.text.secondary, fontSize: '14px' }}>No active job. Navigation will appear when you have an assigned job.</p>
        </div>
      </div>
    )
  }

  const NavButton = ({ label, icon, href }: { label: string; icon: string; href: string }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        background: brandColors.primary.navy, color: '#fff',
        borderRadius: '12px', padding: '14px 16px',
        fontSize: '15px', fontWeight: '700',
        textDecoration: 'none', marginBottom: '10px',
      }}
    >
      <span style={{ fontSize: '22px' }}>{icon}</span>
      {label}
    </a>
  )

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: '700', color: brandColors.text.primary, marginBottom: '16px' }}>
        Navigation
      </h1>

      {/* Job summary */}
      <div style={{
        background: brandColors.mobile.cardBackground,
        border: `1px solid ${brandColors.mobile.cardBorder}`,
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
      }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: brandColors.primary.gold, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
          Active Job
        </div>
        <div style={{ fontSize: '16px', fontWeight: '700', color: brandColors.text.primary, marginBottom: '4px' }}>
          {activeJob.pickup_location} → {activeJob.delivery_location}
        </div>
        {activeJob.pickup_datetime && (
          <div style={{ fontSize: '13px', color: brandColors.text.secondary }}>
            📅 Pickup: {new Date(activeJob.pickup_datetime).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
        {activeJob.vehicle_type && (
          <div style={{ fontSize: '13px', color: brandColors.text.secondary }}>
            🚛 {activeJob.vehicle_type}
          </div>
        )}
        {activeJob.load_details && (
          <div style={{ fontSize: '13px', color: brandColors.text.secondary, marginTop: '6px', padding: '8px', background: brandColors.background.light, borderRadius: '8px' }}>
            {activeJob.load_details}
          </div>
        )}
      </div>

      {/* Navigate to pickup */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '700', color: brandColors.text.primary, marginBottom: '10px' }}>
          Navigate to Pickup
        </h2>
        <NavButton
          icon="🗺️"
          label={`Google Maps → ${activeJob.pickup_location}`}
          href={mapsUrl(activeJob.pickup_location, activeJob.pickup_lat, activeJob.pickup_lng, activeJob.pickup_location)}
        />
        <NavButton
          icon="🚗"
          label={`Waze → ${activeJob.pickup_location}`}
          href={wazeUrl(activeJob.pickup_lat, activeJob.pickup_lng, activeJob.pickup_location)}
        />
      </div>

      {/* Navigate to delivery */}
      <div>
        <h2 style={{ fontSize: '15px', fontWeight: '700', color: brandColors.text.primary, marginBottom: '10px' }}>
          Navigate to Delivery
        </h2>
        <NavButton
          icon="🗺️"
          label={`Google Maps → ${activeJob.delivery_location}`}
          href={mapsUrl(activeJob.delivery_location, activeJob.delivery_lat, activeJob.delivery_lng, activeJob.delivery_location)}
        />
        <NavButton
          icon="🚗"
          label={`Waze → ${activeJob.delivery_location}`}
          href={wazeUrl(activeJob.delivery_lat, activeJob.delivery_lng, activeJob.delivery_location)}
        />
      </div>
    </div>
  )
}


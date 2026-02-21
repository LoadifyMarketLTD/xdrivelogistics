'use client'

import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

export default function VehicleTrackingPage() {
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

      <div style={{
        background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px',
        padding: '48px 32px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
          Coming Soon
        </h2>
        <p style={{ fontSize: '14px', color: '#6b7280', maxWidth: '480px', margin: '0 auto 16px' }}>
          Real-time GPS vehicle tracking is coming soon. You will be able to monitor your entire fleet on a live map,
          set geofences and receive alerts when vehicles deviate from planned routes.
        </p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px',
          padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: '#3b82f6',
        }}>
          🚀 Coming soon
        </div>
      </div>
    </div>
  )
}

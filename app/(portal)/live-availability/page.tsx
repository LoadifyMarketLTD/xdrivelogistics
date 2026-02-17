'use client'

import Panel from '@/components/portal/Panel'

export default function LiveAvailabilityPage() {
  return (
    <div>
      <Panel title="Live Availability" subtitle="Real-time vehicle and driver availability">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔴</div>
          <h2 style={{ fontSize: '20px', color: 'var(--portal-text-primary)', marginBottom: '12px' }}>
            Live Availability Coming Soon
          </h2>
          <p style={{ color: 'var(--portal-text-secondary)', marginBottom: '24px' }}>
            Track real-time vehicle locations, driver availability, and capacity status.
          </p>
        </div>
      </Panel>
    </div>
  )
}

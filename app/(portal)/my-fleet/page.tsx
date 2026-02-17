'use client'

import Panel from '@/components/portal/Panel'

export default function MyFleetPage() {
  return (
    <div>
      <Panel title="My Fleet" subtitle="Manage your vehicles and assets">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚛</div>
          <h2 style={{ fontSize: '20px', color: 'var(--portal-text-primary)', marginBottom: '12px' }}>
            Fleet Management Coming Soon
          </h2>
          <p style={{ color: 'var(--portal-text-secondary)', marginBottom: '24px' }}>
            Manage your vehicle fleet, track maintenance, and monitor asset utilization.
          </p>
        </div>
      </Panel>
    </div>
  )
}

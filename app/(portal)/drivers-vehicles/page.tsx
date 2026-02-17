'use client'

import Panel from '@/components/portal/Panel'

export default function DriversVehiclesPage() {
  return (
    <div>
      <Panel title="Drivers & Vehicles" subtitle="Manage your team and fleet">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚗</div>
          <h2 style={{ fontSize: '20px', color: 'var(--portal-text-primary)', marginBottom: '12px' }}>
            Drivers & Vehicles Management Coming Soon
          </h2>
          <p style={{ color: 'var(--portal-text-secondary)', marginBottom: '24px' }}>
            Manage driver profiles, licenses, vehicle assignments, and compliance documentation.
          </p>
        </div>
      </Panel>
    </div>
  )
}

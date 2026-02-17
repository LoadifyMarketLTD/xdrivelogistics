'use client'

import Panel from '@/components/portal/Panel'

export default function ReturnJourneysPage() {
  return (
    <div>
      <Panel title="Return Journeys" subtitle="Optimize empty return trips">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
          <h2 style={{ fontSize: '20px', color: 'var(--portal-text-primary)', marginBottom: '12px' }}>
            Return Journeys Coming Soon
          </h2>
          <p style={{ color: 'var(--portal-text-secondary)', marginBottom: '24px' }}>
            Find and optimize return loads to maximize vehicle utilization and reduce empty miles.
          </p>
        </div>
      </Panel>
    </div>
  )
}

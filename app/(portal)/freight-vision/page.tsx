'use client'

import Panel from '@/components/portal/Panel'

export default function FreightVisionPage() {
  return (
    <div>
      <Panel title="Freight Vision" subtitle="Analytics and insights">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h2 style={{ fontSize: '20px', color: 'var(--portal-text-primary)', marginBottom: '12px' }}>
            Freight Vision Analytics Coming Soon
          </h2>
          <p style={{ color: 'var(--portal-text-secondary)', marginBottom: '24px' }}>
            Advanced analytics, performance metrics, and business intelligence for your transport operations.
          </p>
        </div>
      </Panel>
    </div>
  )
}

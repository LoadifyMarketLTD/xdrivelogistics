'use client'

import Panel from '@/components/portal/Panel'

export default function DirectoryPage() {
  return (
    <div>
      <Panel title="Directory" subtitle="Company and carrier directory">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📖</div>
          <h2 style={{ fontSize: '20px', color: 'var(--portal-text-primary)', marginBottom: '12px' }}>
            Directory Coming Soon
          </h2>
          <p style={{ color: 'var(--portal-text-secondary)', marginBottom: '24px' }}>
            Browse registered companies, carriers, and service providers in the transport network.
          </p>
        </div>
      </Panel>
    </div>
  )
}

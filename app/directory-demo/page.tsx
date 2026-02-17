'use client'

import PortalShell from '@/components/portal/PortalShell'
import Panel from '@/components/portal/Panel'

export default function DirectoryDemoPage() {
  return (
    <PortalShell>
      <Panel title="Directory" subtitle="Company and carrier directory">
        <div style={{ padding: '60px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>📖</div>
          <h2 style={{ fontSize: '24px', color: 'var(--portal-text-primary)', marginBottom: '16px', fontWeight: '600' }}>
            Directory Coming Soon
          </h2>
          <p style={{ color: 'var(--portal-text-secondary)', fontSize: '15px', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto' }}>
            Browse registered companies, carriers, and service providers in the transport network.
            Search by location, services offered, and availability.
          </p>
        </div>
      </Panel>
    </PortalShell>
  )
}

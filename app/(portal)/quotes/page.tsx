'use client'

import Panel from '@/components/portal/Panel'

export default function QuotesPage() {
  return (
    <div>
      <Panel title="Quotes" subtitle="Manage your quotes and bids">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
          <h2 style={{ fontSize: '20px', color: 'var(--portal-text-primary)', marginBottom: '12px' }}>
            Quotes Management Coming Soon
          </h2>
          <p style={{ color: 'var(--portal-text-secondary)', marginBottom: '24px' }}>
            View and manage all your submitted quotes, track acceptance rates, and analyze pricing.
          </p>
        </div>
      </Panel>
    </div>
  )
}

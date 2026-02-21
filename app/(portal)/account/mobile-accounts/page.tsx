'use client'

import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

export default function MobileAccountsPage() {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0A2239', marginBottom: '8px' }}>
          Mobile Accounts
        </h1>
        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
          Manage mobile app access for your drivers and team members.
        </p>
      </div>

      <div style={{
        background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px',
        padding: '48px 32px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
          Coming Soon
        </h2>
        <p style={{ fontSize: '14px', color: '#6b7280', maxWidth: '480px', margin: '0 auto 16px' }}>
          Dedicated mobile app accounts for drivers will allow them to manage jobs, capture proof of delivery
          and update their availability — all from their smartphone.
        </p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px',
          padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: '#3b82f6',
        }}>
          🚀 Planned for Q4 2025
        </div>
      </div>
    </div>
  )
}

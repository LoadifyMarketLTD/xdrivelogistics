'use client'

import PlatformNav from '@/components/PlatformNav'
import '@/styles/dashboard.css'

export default function NavTestPage() {
  return (
    <div className="dashboard-content">
      <PlatformNav />

      <main className="container">
        <section style={{ marginTop: '32px' }}>
          <h1 className="section-title" style={{ fontSize: '28px', marginBottom: '16px' }}>
            Navigation Test Page
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '32px' }}>
            This page demonstrates the new CX-style navigation with all tabs and CTA buttons.
          </p>

          <div style={{
            backgroundColor: '#132433',
            borderRadius: '12px',
            padding: '40px',
            border: '1px solid rgba(255,255,255,0.08)',
            marginBottom: '24px'
          }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--gold-premium)' }}>
              ✅ Features Implemented
            </h2>
            <ul style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '2' }}>
              <li>✓ CX-style navigation with 10 tabs</li>
              <li>✓ POST LOAD button (top right, gold) → /jobs/new</li>
              <li>✓ BOOK DIRECT button (top right, green) → /loads/book-direct</li>
              <li>✓ Logout button in header</li>
              <li>✓ Active tab highlighting</li>
              <li>✓ Responsive design</li>
              <li>✓ All placeholder pages created</li>
            </ul>
          </div>

          <div style={{
            backgroundColor: '#132433',
            borderRadius: '12px',
            padding: '40px',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--gold-premium)' }}>
              📋 Navigation Tabs
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px', color: '#94a3b8', fontSize: '14px' }}>
              <div>1. Dashboard → /dashboard</div>
              <div>2. Directory → /directory</div>
              <div>3. Live Availability → /availability</div>
              <div>4. My Fleet → /fleet</div>
              <div>5. Return Journeys → /return-journeys</div>
              <div>6. Loads → /marketplace</div>
              <div>7. Quotes → /quotes</div>
              <div>8. Diary → /diary</div>
              <div>9. Freight Vision → /freight-vision</div>
              <div>10. Drivers & Vehicles → /drivers</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

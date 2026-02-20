'use client'

import { useRouter } from 'next/navigation'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

export default function UsersDriversPage() {
  const router = useRouter()

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0A2239', marginBottom: '8px' }}>
          Users & Drivers
        </h1>
        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
          Manage your team members, invite drivers and set permissions.
        </p>
      </div>

      <div style={{
        background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px',
        padding: '48px 32px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>👷</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
          Team Management
        </h2>
        <p style={{ fontSize: '14px', color: '#6b7280', maxWidth: '400px', margin: '0 auto 24px' }}>
          Invite drivers and team members to your company account. Manage their roles and access permissions.
        </p>
        <button
          onClick={() => router.push('/drivers-vehicles')}
          style={{
            background: '#D4AF37', color: '#ffffff', border: 'none',
            padding: '10px 20px', fontSize: '14px', fontWeight: '600',
            cursor: 'pointer', borderRadius: '4px',
          }}
        >
          Go to Drivers &amp; Vehicles →
        </button>
      </div>
    </div>
  )
}

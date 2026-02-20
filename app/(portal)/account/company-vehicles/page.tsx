'use client'

import { useRouter } from 'next/navigation'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

export default function CompanyVehiclesPage() {
  const router = useRouter()

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0A2239', marginBottom: '8px' }}>
          Company Vehicles
        </h1>
        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
          Register and manage your company vehicles, set availability and update status.
        </p>
      </div>

      <div style={{
        background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px',
        padding: '48px 32px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚛</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
          Fleet Management
        </h2>
        <p style={{ fontSize: '14px', color: '#6b7280', maxWidth: '400px', margin: '0 auto 24px' }}>
          Add vehicles to your fleet, track their availability and assign them to drivers.
        </p>
        <button
          onClick={() => router.push('/my-fleet')}
          style={{
            background: '#D4AF37', color: '#ffffff', border: 'none',
            padding: '10px 20px', fontSize: '14px', fontWeight: '600',
            cursor: 'pointer', borderRadius: '4px',
          }}
        >
          Go to My Fleet →
        </button>
      </div>
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getMyRoleStatus, routeForRoleStatus } from '@/lib/rbac'
import { supabase } from '@/lib/supabaseClient'

export default function OwnerPage() {
  const router = useRouter()

  useEffect(() => {
    async function guard() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }

      try {
        const row = await getMyRoleStatus()
        if (!row) { router.replace('/onboarding'); return }
        if (row.status !== 'active' || row.role !== 'owner') {
          router.replace(row ? routeForRoleStatus(row) : '/login')
          return
        }
      } catch {
        router.replace('/login')
      }
    }
    guard()
  }, [router])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f5f7', padding: '32px 24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#C8A64D', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
            XDrive Logistics Ltd
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#0A2239', margin: 0 }}>👑 Owner Dashboard</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {[
            { label: '⚙️ Pending Approvals', href: '/admin/approvals', desc: 'Review broker & company applications' },
            { label: '🚚 Drivers & Invites', href: '/dashboard/company/drivers', desc: 'Manage driver invite links' },
            { label: '📦 All Loads', href: '/loads', desc: 'View all loads on the exchange' },
            { label: '👥 Users', href: '/users', desc: 'Manage platform users' },
          ].map(item => (
            <a key={item.href} href={item.href} style={{ display: 'block', padding: '20px', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e5e7eb', textDecoration: 'none', transition: 'box-shadow 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(200,166,77,0.18)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

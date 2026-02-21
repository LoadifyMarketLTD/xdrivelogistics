'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getMyRoleStatus, routeForRoleStatus } from '@/lib/rbac'
import { supabase } from '@/lib/supabaseClient'

export default function DriverPage() {
  const router = useRouter()

  useEffect(() => {
    async function guard() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }

      try {
        const row = await getMyRoleStatus()
        if (!row) { router.replace('/onboarding'); return }
        if (row.status !== 'active' || row.role !== 'driver') {
          router.replace(routeForRoleStatus(row))
          return
        }
        // Route to the full portal driver dashboard
        router.replace('/dashboard/driver')
      } catch {
        router.replace('/login')
      }
    }
    guard()
  }, [router])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#6b7280' }}>Loading dashboard…</div>
    </div>
  )
}

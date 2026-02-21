'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { getMyRoleStatus } from '@/lib/rbac'

/**
 * /owner — thin redirect to the existing owner admin area.
 * Middleware already blocks non-owners. This just ensures the user
 * lands at the right place even if navigated here directly.
 */
export default function OwnerPage() {
  const router = useRouter()

  useEffect(() => {
    async function redirect() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }

      try {
        const row = await getMyRoleStatus()
        if (!row || row.role !== 'owner' || row.status !== 'active') {
          router.replace('/post-login')
          return
        }
      } catch {
        // RPC unavailable — trust middleware already validated
      }

      router.replace('/dashboard/owner')
    }
    redirect()
  }, [router])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#6b7280' }}>Redirecting…</div>
    </div>
  )
}

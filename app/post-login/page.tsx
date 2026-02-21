'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { getMyRoleStatus, routeForRoleStatus } from '@/lib/rbac'

export default function PostLoginPage() {
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    async function run() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }

      try {
        // Race the RPC against an 8-second timeout so the page never hangs
        // indefinitely when the database is slow or the function is missing.
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Profile lookup timed out')), 8000)
        )
        const row = await Promise.race([getMyRoleStatus(), timeoutPromise])
        if (cancelled) return

        if (!row) {
          // No profile row yet → onboarding
          router.replace('/onboarding')
          return
        }

        router.replace(routeForRoleStatus(row))
      } catch {
        if (!cancelled) router.replace('/onboarding')
      }
    }

    run()
    return () => { cancelled = true }
  }, [router])

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '15px' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
        Loading your account…
      </div>
    </div>
  )
}

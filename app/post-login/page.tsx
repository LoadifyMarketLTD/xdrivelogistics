'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { getMyRoleStatus } from '@/lib/rbac'

export default function PostLoginPage() {
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    async function handlePostLogin() {
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession()

        if (!session) {
          router.replace('/login')
          return
        }

        // Timeout safety (avoid infinite waiting)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout fetching role')), 8000)
        )

        const roleStatusPromise = getMyRoleStatus()

        const { row } = (await Promise.race([
          roleStatusPromise,
          timeoutPromise
        ])) as any

        if (cancelled) return

        // 🔴 No profile row yet
        if (!row) {
          router.replace('/onboarding')
          return
        }

        const role = row.role
        const status = row.status

        // 🔴 Blocked users
        if (status === 'blocked') {
          router.replace('/blocked')
          return
        }

        // 🔴 Pending (except owner)
        if (status === 'pending' && role !== 'owner') {
          router.replace('/pending')
          return
        }

        // ✅ MAIN landing for active users + owner
        router.replace('/loads')
        return
      } catch (error) {
        console.error('Post-login error:', error)
        router.replace('/login')
      }
    }

    handlePostLogin()

    return () => {
      cancelled = true
    }
  }, [router])

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>Loading account...</h2>
    </div>
  )
}

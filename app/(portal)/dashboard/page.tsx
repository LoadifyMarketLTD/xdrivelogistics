'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { getDefaultDashboardPath } from '@/lib/routing/getDefaultDashboardPath'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const { profile, loading, profileLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (loading || profileLoading) return

    const role = profile?.role
    const status = profile?.status

    // Pending users must go to /pending (middleware also enforces this, belt-and-suspenders)
    if (status === 'pending' || status === 'blocked') {
      router.replace('/pending')
      return
    }

    router.replace(getDefaultDashboardPath(role))
  }, [loading, profileLoading, profile, router])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      color: '#6b7280',
    }}>
      {searchParams.get('restricted') === '1'
        ? 'Access restricted. Redirecting…'
        : 'Loading dashboard…'}
    </div>
  )
}

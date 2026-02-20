'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const { profile, loading, profileLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (loading || profileLoading) return

    const role = profile?.role
    if (role === 'broker') {
      router.replace('/dashboard/broker')
    } else if (role === 'company') {
      router.replace('/dashboard/company')
    } else {
      // driver or legacy/unknown role
      router.replace('/dashboard/driver')
    }
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
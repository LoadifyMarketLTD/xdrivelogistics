'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { ROLE_LABEL, type Role } from '@/lib/roles'
import { getDefaultDashboardPath } from '@/lib/routing/getDefaultDashboardPath'

interface RequireRoleProps {
  allowedRoles: Role[]
  children: React.ReactNode
}

export default function RequireRole({ allowedRoles, children }: RequireRoleProps) {
  const router = useRouter()
  const { profile, loading, profileLoading } = useAuth()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    if (loading || profileLoading) return

    const role = profile?.role as Role | undefined
    if (!hasRedirected && role && !allowedRoles.includes(role)) {
      setHasRedirected(true)
      router.replace(getDefaultDashboardPath(role))
    }
  }, [loading, profileLoading, profile, allowedRoles, router, hasRedirected])

  if (loading || profileLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#6b7280' }}>
        Loading…
      </div>
    )
  }

  const role = profile?.role as Role | undefined

  if (!profile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#6b7280' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Profile not found</div>
          <Link href="/onboarding" style={{ color: '#C8A64D', textDecoration: 'none', fontWeight: '500' }}>Complete your profile →</Link>
        </div>
      </div>
    )
  }

  if (role && !allowedRoles.includes(role)) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#6b7280' }}>
        Redirecting…
      </div>
    )
  }

  return <>{children}</>
}

export function RoleLabel() {
  const { profile } = useAuth()
  const role = profile?.role as Role | undefined
  const label = role ? (ROLE_LABEL[role] ?? role) : ''
  return <span>{label}</span>
}

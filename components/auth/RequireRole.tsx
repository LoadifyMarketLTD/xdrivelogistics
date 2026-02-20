'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { ROLE_LABEL, type Role } from '@/lib/roles'

interface RequireRoleProps {
  allowedRoles: Role[]
  children: React.ReactNode
}

export default function RequireRole({ allowedRoles, children }: RequireRoleProps) {
  const router = useRouter()
  const { profile, loading, profileLoading } = useAuth()

  useEffect(() => {
    if (loading || profileLoading) return

    const role = profile?.role as Role | undefined
    if (role && !allowedRoles.includes(role)) {
      // Show brief feedback via URL param then redirect
      router.replace('/dashboard?restricted=1')
    }
  }, [loading, profileLoading, profile, allowedRoles, router])

  if (loading || profileLoading) return null

  const role = profile?.role as Role | undefined
  if (role && !allowedRoles.includes(role)) {
    return null
  }

  return <>{children}</>
}

export function RoleLabel() {
  const { profile } = useAuth()
  const role = profile?.role as Role | undefined
  const label = role ? (ROLE_LABEL[role] ?? role) : ''
  return <span>{label}</span>
}

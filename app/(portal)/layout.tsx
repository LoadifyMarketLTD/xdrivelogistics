'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import PortalLayout from '@/components/layout/PortalLayout'
import MobileRedirect from '@/components/mobile/MobileRedirect'

/** Roles that do NOT require a company_id to access the portal */
const ROLES_NO_COMPANY = ['driver', 'broker', 'owner', 'company_admin']

/** Pending company_admin may access only these paths */
const PENDING_COMPANY_ALLOWED_PREFIX = '/dashboard/company/profile'

export default function PortalLayoutWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, companyId, loading, profile, profileLoading } = useAuth()

  useEffect(() => {
    if (loading || profileLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    const role = profile?.role ?? ''
    const status = profile?.status ?? null
    // Treat legacy is_active=false as blocked, otherwise active
    const isActive = status === 'active' || (!status && profile?.is_active !== false)

    // Blocked or pending → /pending (except company_admin completing their profile)
    if (!isActive) {
      if (role === 'company_admin' && pathname?.startsWith(PENDING_COMPANY_ALLOWED_PREFIX)) {
        return // allow through
      }
      router.push('/pending')
      return
    }

    // Only require company setup for legacy 'company' role users
    if (!companyId && !ROLES_NO_COMPANY.includes(role)) {
      router.push('/onboarding/company')
      return
    }
  }, [loading, profileLoading, user, companyId, profile, pathname])

  if (loading || profileLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f4f5f7',
        color: '#2C3E50'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>Loading portal...</div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <>
      <MobileRedirect />
      <PortalLayout>{children}</PortalLayout>
    </>
  )
}

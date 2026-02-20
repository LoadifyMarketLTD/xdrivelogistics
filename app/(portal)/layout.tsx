'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import PortalLayout from '@/components/layout/PortalLayout'
import MobileRedirect from '@/components/mobile/MobileRedirect'

/** Roles that do NOT require a company to access the portal */
const ROLES_NO_COMPANY = ['driver', 'broker']

export default function PortalLayoutWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, companyId, loading, profile, profileLoading } = useAuth()
  
  useEffect(() => {
    if (loading || profileLoading) return

    if (!user) {
      router.push('/login')
      return
    }
    
    // Only require company setup for company-role users
    const role = profile?.role ?? ''
    if (!companyId && !ROLES_NO_COMPANY.includes(role)) {
      router.push('/onboarding/company')
      return
    }
  }, [loading, profileLoading, user, companyId, profile])
  
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
  
  if (!user) {
    return null
  }

  const role = profile?.role ?? ''
  if (!companyId && !ROLES_NO_COMPANY.includes(role)) {
    return null
  }
  
  return (
    <>
      <MobileRedirect />
      <PortalLayout>{children}</PortalLayout>
    </>
  )
}

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import PortalShell from '@/components/portal/PortalShell'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, companyId, loading } = useAuth()
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }
    
    if (!loading && user && !companyId) {
      router.push('/onboarding/company')
      return
    }
  }, [loading, user, companyId, router])
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#F5F5F5',
        color: '#2C3E50'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>Loading portal...</div>
        </div>
      </div>
    )
  }
  
  if (!user || !companyId) {
    return null
  }
  
  return <PortalShell>{children}</PortalShell>
}

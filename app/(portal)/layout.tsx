'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import PortalLayout from '@/components/layout/PortalLayout'

export default function PortalLayoutWrapper({ children }: { children: React.ReactNode }) {
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
  }, [loading, user, companyId])
  
  if (loading) {
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
  
  if (!user || !companyId) {
    return null
  }
  
  return <PortalLayout>{children}</PortalLayout>
}

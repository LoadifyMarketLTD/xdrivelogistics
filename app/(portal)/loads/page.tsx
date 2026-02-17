'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoadsPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to marketplace (loads is the new primary, but marketplace has the implementation)
    router.push('/marketplace')
  }, [router])
  
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <div style={{ fontSize: '16px', color: 'var(--portal-text-secondary)' }}>
        Redirecting to Loads...
      </div>
    </div>
  )
}

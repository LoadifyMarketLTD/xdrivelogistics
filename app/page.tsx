'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export const metadata = {
  title: 'XDrive Logistics - Enterprise Exchange',
  description: 'B2B logistics exchange platform',
};

export default function Home() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to portal dashboard
    router.push('/dashboard')
  }, [router])
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: '#f3f4f6'
    }}>
      <div style={{ textAlign: 'center', color: '#6b7280' }}>
        <div style={{ fontSize: '16px' }}>Loading...</div>
      </div>
    </div>
  );
}

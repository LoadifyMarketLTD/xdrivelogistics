'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import PlatformNav from '@/components/PlatformNav'
import '@/styles/dashboard.css'
export const dynamic = 'force-dynamic'
export default function ReturnJourneysPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  useEffect(() => { if (!authLoading && !user) router.push('/login') }, [authLoading, user, router])
  if (authLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0F1F2E', color: '#fff' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px' }}>Loading...</div></div></div>
  return (
    <div className="dashboard-content">
      <PlatformNav />
      <main className="container">
        <section style={{ marginTop: '32px' }}>
          <h1 className="section-title" style={{ fontSize: '28px', marginBottom: '16px' }}>🔄 Return Journeys</h1>
          <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '32px' }}>Optimize return loads</p>
          <div style={{ backgroundColor: '#132433', borderRadius: '12px', padding: '60px 40px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚧</div>
            <h2 style={{ fontSize: '24px', marginBottom: '12px', color: '#fff' }}>Coming Soon</h2>
            <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto 24px' }}>Return journey optimization is under development.</p>
            <a href="/dashboard" className="action-btn secondary">← Back to Dashboard</a>
          </div>
        </section>
      </main>
    </div>
  )
}

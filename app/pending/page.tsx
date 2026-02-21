'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'
import { getMyRoleStatus, routeForRoleStatus } from '@/lib/rbac'

export default function PendingPage() {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }

      try {
        const row = await getMyRoleStatus()
        if (!row) { router.replace('/onboarding'); return }
        // If already active, route to correct dashboard
        if (row.status === 'active') { router.replace(routeForRoleStatus(row)); return }
        setRole(row.role)
      } catch {
        // RPC not available (local/dev) — fallback to DB query
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, status')
          .eq('user_id', session.user.id)
          .maybeSingle()
        if (profile?.status === 'active') {
          router.replace('/')
          return
        }
        setRole(profile?.role ?? null)
      }
      setLoading(false)
    }
    init()
  }, [router])

  const handleRefresh = async () => {
    setChecking(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.replace('/login'); return }

    try {
      const row = await getMyRoleStatus()
      if (!row) { router.replace('/onboarding'); return }
      router.replace(routeForRoleStatus(row))
    } catch {
      setChecking(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <div style={{ color: '#6b7280' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '48px 40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <div style={{ marginBottom: '20px' }}>
            <Image src="/logo.webp" alt="XDrive Logistics LTD" width={140} height={40} style={{ display: 'inline-block' }} priority />
          </div>

          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1f2937', margin: '0 0 12px' }}>Pending Approval</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6', marginBottom: '24px' }}>
            {role === 'broker'
              ? 'Your broker account is under review. The platform owner will activate your account shortly.'
              : 'Your company account is under review. Complete your company profile while you wait.'}
          </p>

          <div style={{ backgroundColor: '#fffbf0', border: '1px solid #f3d990', borderRadius: '8px', padding: '14px 16px', marginBottom: '24px', fontSize: '13px', color: '#92741a', lineHeight: '1.6' }}>
            ℹ️ You will be able to access the platform once the owner approves your account.
          </div>

          {role === 'company_admin' && (
            <a href="/dashboard/company/profile" style={{
              display: 'inline-block', padding: '12px 24px',
              backgroundColor: '#C8A64D', color: '#fff', borderRadius: '8px',
              textDecoration: 'none', fontWeight: '600', fontSize: '14px', marginBottom: '16px',
            }}>
              📝 Complete Company Profile →
            </a>
          )}

          <button
            onClick={handleRefresh}
            disabled={checking}
            style={{ display: 'block', width: '100%', padding: '11px', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#374151', fontSize: '14px', fontWeight: '600', cursor: checking ? 'not-allowed' : 'pointer', marginBottom: '12px', opacity: checking ? 0.6 : 1 }}
          >
            {checking ? 'Checking…' : '🔄 Check Status'}
          </button>

          <p style={{ fontSize: '13px', color: '#9ca3af' }}>
            Need help?{' '}
            <a href="tel:07423272138" style={{ color: '#C8A64D', fontWeight: '600', textDecoration: 'none' }}>Call 07423272138</a>
          </p>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
            <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

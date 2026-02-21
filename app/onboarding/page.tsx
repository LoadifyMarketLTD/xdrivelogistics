'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { needsOnboarding } from '@/lib/profile'
import { DEFAULT_ROLE, ROLE_LABEL, type Role } from '@/lib/roles'
import OnboardingForm from '@/components/onboarding/OnboardingForm'

export const dynamic = 'force-dynamic'

const ROLE_DASHBOARD: Record<Role, string> = {
  driver: '/dashboard/driver',
  broker: '/dashboard/broker',
  company: '/dashboard/company',
}

export default function OnboardingPage() {
  const router = useRouter()
  const { user, profile, loading, profileLoading, refreshProfile } = useAuth()

  const role = (profile?.role ?? DEFAULT_ROLE) as Role

  // Derive resolving from existing state — avoids calling setState inside an effect
  const resolving = loading || profileLoading || !user || (!!profile && !needsOnboarding(role, profile))

  useEffect(() => {
    if (loading || profileLoading) return

    if (!user) {
      router.replace('/login')
      return
    }

    // If onboarding is already complete, skip to dashboard
    if (profile && !needsOnboarding(role, profile)) {
      router.replace(ROLE_DASHBOARD[role] ?? '/dashboard')
      return
    }
  }, [loading, profileLoading, user, profile, role, router])

  const handleSave = async (fields: Record<string, string | number>) => {
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('profiles')
      .upsert(
        { id: user.id, ...fields },
        { onConflict: 'id' }
      )

    if (error) throw new Error(error.message)

    await refreshProfile()
    router.push(ROLE_DASHBOARD[role] ?? '/dashboard')
  }

  if (resolving) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9fafb',
        color: '#6b7280',
      }}>
        Loading…
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9fafb',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Top brand strip */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: '700', color: '#C8A64D', letterSpacing: '0.4px' }}>
          XDrive Logistics Ltd
        </div>
        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
          Account type: <strong style={{ color: '#1f2937' }}>{ROLE_LABEL[role]}</strong>
        </div>
      </div>

      <OnboardingForm role={role} onSave={handleSave} />

      <p style={{ marginTop: '20px', fontSize: '13px', color: '#9ca3af' }}>
        You can update these details later in your profile settings.
      </p>
    </div>
  )
}


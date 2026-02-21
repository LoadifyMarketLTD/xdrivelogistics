'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function RegisterPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/dashboard')
      } else {
        setChecking(false)
      }
    })
  }, [router])

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <div style={{ color: '#6b7280' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '48px 40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ marginBottom: '16px' }}>
              <Image src="/logo.webp" alt="XDrive Logistics LTD" width={160} height={46} style={{ display: 'inline-block' }} priority />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', margin: '0 0 8px 0' }}>
              Join <span style={{ color: '#C8A64D' }}>XDrive Logistics LTD</span>
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Choose your account type to get started
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Broker Option */}
            <Link href="/register/broker" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'flex-start', padding: '18px 20px',
                border: '2px solid #e5e7eb', borderRadius: '10px', cursor: 'pointer',
                background: '#ffffff', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#C8A64D'; (e.currentTarget as HTMLDivElement).style.background = '#fffbf0' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLDivElement).style.background = '#ffffff' }}
              >
                <span style={{ fontSize: '28px', marginRight: '14px', flexShrink: 0 }}>📋</span>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>
                    Broker / Dispatcher
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                    Post loads, manage shipments and connect with carriers.
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#C8A64D', fontWeight: '600' }}>
                    Requires approval → Register →
                  </div>
                </div>
              </div>
            </Link>

            {/* Company Option */}
            <Link href="/register/company" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'flex-start', padding: '18px 20px',
                border: '2px solid #e5e7eb', borderRadius: '10px', cursor: 'pointer',
                background: '#ffffff', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#C8A64D'; (e.currentTarget as HTMLDivElement).style.background = '#fffbf0' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLDivElement).style.background = '#ffffff' }}
              >
                <span style={{ fontSize: '28px', marginRight: '14px', flexShrink: 0 }}>🏢</span>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>
                    Transport Company
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                    Manage your fleet, post jobs and invite drivers to your team.
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#C8A64D', fontWeight: '600' }}>
                    Requires approval → Register →
                  </div>
                </div>
              </div>
            </Link>

            {/* Driver notice */}
            <div style={{
              padding: '14px 16px', borderRadius: '8px',
              backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'flex-start', gap: '10px',
            }}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>🚚</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Driver?</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', lineHeight: '1.5' }}>
                  Drivers can only join via a company invite link. Ask your company manager for an invite.
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#C8A64D', textDecoration: 'none', fontWeight: '600' }}>
              Sign in
            </Link>
          </div>
        </div>

        <div style={{ marginTop: '16px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
          Need help? Call or WhatsApp:{' '}
          <a href="tel:07423272138" style={{ color: '#C8A64D', fontWeight: '600', textDecoration: 'none' }}>07423272138</a>
        </div>
      </div>
    </div>
  )
}

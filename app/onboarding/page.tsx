'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

export default function OnboardingPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'broker' | 'company'>('broker')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [submitted, setSubmitted] = useState(false)

  const gold = '#C8A64D'

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login')
      } else {
        setChecking(false)
      }
    })
  }, [router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (mode === 'company' && !companyName.trim()) {
      setError('Company name is required')
      return
    }
    setLoading(true)

    try {
      if (mode === 'broker') {
        const { error: rpcErr } = await supabase.rpc('register_broker_pending', {
          p_full_name: fullName.trim() || null,
          p_phone: phone.trim() || null,
        })
        if (rpcErr) throw rpcErr
      } else {
        const { error: rpcErr } = await supabase.rpc('register_company_pending', {
          p_company_name: companyName.trim(),
          p_full_name: fullName.trim() || null,
          p_phone: phone.trim() || null,
        })
        if (rpcErr) throw rpcErr
      }
      // TODO: Enable SMTP provider to send welcome emails later
      setSubmitted(true)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#6b7280' }}>Loading...</div>
      </div>
    )
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    backgroundColor: '#ffffff', border: '1px solid #d1d5db',
    borderRadius: '8px', color: '#1f2937', fontSize: '15px',
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '48px 40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>

          {submitted ? (
            /* ── Success / welcome screen ──────────────────────────── */
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '16px' }}>
                <Image src="/logo.webp" alt="XDrive Logistics LTD" width={140} height={40} style={{ display: 'inline-block' }} priority />
              </div>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1f2937', margin: '0 0 12px' }}>
                Welcome to XDrive Logistics portal
              </h1>
              <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6', marginBottom: '24px' }}>
                Your account has been submitted for review. The platform owner will activate it shortly.
              </p>
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '14px 16px', marginBottom: '24px', fontSize: '14px', color: '#166534', fontWeight: '500' }}>
                ✅ Welcome to XDrive Logistics portal — your dashboard is ready once approved.
              </div>
              <button
                type="button"
                onClick={() => router.replace('/pending')}
                style={{ width: '100%', padding: '13px', backgroundColor: gold, border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
              >
                View account status →
              </button>
            </div>
          ) : (
          <>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ marginBottom: '12px' }}>
              <Image src="/logo.webp" alt="XDrive Logistics LTD" width={140} height={40} style={{ display: 'inline-block' }} priority />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1f2937', margin: '0 0 8px' }}>
              Complete Your Profile
            </h1>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
              Tell us your role to get started on XDrive Logistics.
            </p>
          </div>

          {/* Role toggle */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            {(['broker', 'company'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setMode(r)}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
                  border: `2px solid ${mode === r ? gold : '#e5e7eb'}`,
                  backgroundColor: mode === r ? '#fffbf0' : '#ffffff',
                  color: mode === r ? gold : '#6b7280',
                  cursor: 'pointer',
                }}
              >
                {r === 'broker' ? '📋 Broker / Dispatcher' : '🏢 Transport Company'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'company' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Company Name *</label>
                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} required placeholder="Your company name" disabled={loading} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" disabled={loading} style={inputStyle}
                onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Phone</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+44 7xxx xxx xxx" disabled={loading} style={inputStyle}
                onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </div>

            {error && (
              <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', backgroundColor: gold, border: 'none',
              borderRadius: '8px', color: '#ffffff', fontSize: '15px', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1
            }}>
              {loading ? 'Saving…' : mode === 'broker' ? 'Continue as Broker →' : 'Continue as Company →'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
            <Link href="/login" style={{ color: gold, textDecoration: 'none' }}>← Sign in to existing account</Link>
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  )
}

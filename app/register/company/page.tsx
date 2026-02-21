'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function RegisterCompanyPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)

  const gold = '#C8A64D'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!companyName.trim()) { setError('Company name is required'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }

    setLoading(true)
    try {
      // 1. Sign up with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/callback`,
        },
      })
      if (signUpError) throw signUpError

      if (!data.session) {
        // Email confirmation is required — show "check your email" screen.
        // Profile will be created via /onboarding after the user confirms.
        setRegistered(true)
        setLoading(false)
        return
      }

      // Email confirmation disabled (dev) — session available immediately.
      // 2. Call RPC to create company_admin profile + company row (both pending).
      const { error: rpcError } = await supabase.rpc('register_company_pending', {
        p_company_name: companyName.trim(),
        p_full_name: fullName.trim() || null,
        p_phone: phone.trim() || null,
      })
      if (rpcError) throw rpcError

      // 3. Redirect to pending — they can complete the company profile from /pending link
      router.push('/pending')
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    backgroundColor: '#ffffff', border: '1px solid #d1d5db',
    borderRadius: '8px', color: '#1f2937', fontSize: '15px',
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '48px 40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>

          {registered ? (
            /* ── Check-email screen ────────────────────────────────── */
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '16px' }}>
                <Image src="/logo.webp" alt="XDrive Logistics LTD" width={140} height={40} style={{ display: 'inline-block' }} priority />
              </div>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</div>
              <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1f2937', margin: '0 0 12px' }}>Check your email</h1>
              <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6', marginBottom: '24px' }}>
                We sent a confirmation link to <strong>{email}</strong>.<br />
                Click the link in the email to verify your address, then return here.
              </p>
              <div style={{ backgroundColor: '#fffbf0', border: '1px solid #f3d990', borderRadius: '8px', padding: '12px 14px', marginBottom: '24px', fontSize: '13px', color: '#92741a' }}>
                ℹ️ After confirming, complete your profile on the next screen to finish registration.
              </div>
              <button
                type="button"
                onClick={() => router.push('/login')}
                style={{ width: '100%', padding: '13px', backgroundColor: gold, border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
              >
                I confirmed — continue →
              </button>
              <div style={{ marginTop: '16px', fontSize: '13px', color: '#6b7280' }}>
                <button type="button" onClick={() => setRegistered(false)} style={{ background: 'none', border: 'none', color: gold, cursor: 'pointer', fontSize: '13px', textDecoration: 'underline', padding: 0 }}>
                  ← Use a different email
                </button>
              </div>
            </div>
          ) : (
          <>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ marginBottom: '12px' }}>
              <Image src="/logo.webp" alt="XDrive Logistics LTD" width={140} height={40} style={{ display: 'inline-block' }} priority />
            </div>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🏢</div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1f2937', margin: '0 0 6px' }}>Register as Transport Company</h1>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
              Your company will be reviewed and approved. You can complete your profile after registration.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Company Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Company Name *</label>
              <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} required placeholder="Your company name" disabled={loading} style={inputStyle}
                onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </div>

            {/* Full Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Your Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Contact person name" disabled={loading} style={inputStyle}
                onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </div>

            {/* Phone */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Phone</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+44 7xxx xxx xxx" disabled={loading} style={inputStyle}
                onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Email Address *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" disabled={loading} style={inputStyle}
                onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Password *</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 6 characters" disabled={loading} style={inputStyle}
                onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Confirm Password *</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="Repeat password" disabled={loading} style={inputStyle}
                onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </div>

            {error && (
              <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '14px', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', backgroundColor: gold, border: 'none',
              borderRadius: '8px', color: '#ffffff', fontSize: '15px', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1
            }}>
              {loading ? 'Registering...' : 'Create Company Account'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
            <Link href="/register" style={{ color: gold, textDecoration: 'none' }}>← Back to account types</Link>
            {' · '}
            <Link href="/login" style={{ color: gold, textDecoration: 'none' }}>Sign in</Link>
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  )
}

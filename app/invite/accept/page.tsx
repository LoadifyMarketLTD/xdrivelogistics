'use client'

import { useState, useEffect, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'

function InviteAcceptContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [step, setStep] = useState<'loading' | 'signup' | 'accepting' | 'error' | 'done'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  // Signup form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  const gold = '#C8A64D'

  useEffect(() => {
    if (!token) {
      setErrorMsg('No invite token provided. Please use the full invite link.')
      setStep('error')
      return
    }

    // Check if user already has a session — if so, accept invite directly
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        acceptInvite()
      } else {
        setStep('signup')
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const acceptInvite = async (name?: string, ph?: string) => {
    setStep('accepting')
    try {
      const { error } = await supabase.rpc('accept_driver_invite', {
        p_token: token,
        p_full_name: (name ?? fullName).trim() || null,
        p_phone: (ph ?? phone).trim() || null,
      })
      if (error) throw error
      setStep('done')
      setTimeout(() => router.push('/dashboard/driver'), 2000)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to accept invite. The link may be expired or already used.')
      setStep('error')
    }
  }

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (password.length < 6) { setErrorMsg('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { setErrorMsg('Passwords do not match'); return }

    setLoading(true)
    try {
      // Sign up or sign in
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) throw signUpError

      let session = data.session
      if (!session) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        session = signInData.session
      }

      if (!session) throw new Error('Could not establish session')

      // Accept invite via RPC (validates token server-side)
      await acceptInvite(fullName, phone)
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.')
      setStep('signup')
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
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ marginBottom: '12px' }}>
              <Image src="/logo.webp" alt="XDrive Logistics LTD" width={140} height={40} style={{ display: 'inline-block' }} priority />
            </div>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🚚</div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1f2937', margin: '0 0 6px' }}>Driver Invite</h1>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
              You have been invited to join a transport company on XDrive Logistics.
            </p>
          </div>

          {/* Loading */}
          {step === 'loading' && (
            <div style={{ textAlign: 'center', color: '#6b7280' }}>Checking invite…</div>
          )}

          {/* Error */}
          {step === 'error' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '14px', marginBottom: '20px' }}>
                {errorMsg}
              </div>
              <a href="/" style={{ color: gold, textDecoration: 'none', fontSize: '14px' }}>← Go to homepage</a>
            </div>
          )}

          {/* Accepting (for already-logged-in users) */}
          {step === 'accepting' && (
            <div style={{ textAlign: 'center', color: '#6b7280' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
              Accepting invite…
            </div>
          )}

          {/* Done */}
          {step === 'done' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#16a34a', marginBottom: '8px' }}>You&apos;re in!</h2>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Redirecting to your driver dashboard…</p>
            </div>
          )}

          {/* Signup form */}
          {step === 'signup' && (
            <form onSubmit={handleSignup}>
              <div style={{ backgroundColor: '#fffbf0', border: '1px solid #f3d990', borderRadius: '8px', padding: '12px 14px', marginBottom: '20px', fontSize: '13px', color: '#92741a', textAlign: 'center' }}>
                Create your driver account to accept this invite
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Full Name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" disabled={loading} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Phone</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+44 7xxx xxx xxx" disabled={loading} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Email Address *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" disabled={loading} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Password *</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 6 characters" disabled={loading} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Confirm Password *</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="Repeat password" disabled={loading} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
              </div>

              {errorMsg && (
                <div style={{ marginBottom: '14px', padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '14px' }}>
                  {errorMsg}
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '13px', backgroundColor: gold, border: 'none',
                borderRadius: '8px', color: '#ffffff', fontSize: '15px', fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1
              }}>
                {loading ? 'Joining…' : 'Create Driver Account & Join →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function InviteAcceptPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <div style={{ color: '#6b7280' }}>Loading...</div>
      </div>
    }>
      <InviteAcceptContent />
    </Suspense>
  )
}

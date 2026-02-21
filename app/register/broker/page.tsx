'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function RegisterBrokerPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const gold = '#C8A64D'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }

    setLoading(true)
    try {
      // 1. Sign up with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) throw signUpError

      // If user already exists, signUp may return a session — use it
      // Otherwise, sign in to get session
      let session = data.session
      if (!session) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) {
          // User exists but couldn't sign in — show a clear message
          setError('Account already exists. Please sign in instead.')
          setLoading(false)
          return
        }
        session = signInData.session
      }

      if (!session) throw new Error('Could not establish session')

      // 2. Call RPC to create broker profile with pending status
      const { error: rpcError } = await supabase.rpc('register_broker_pending', {
        p_full_name: fullName.trim() || null,
        p_phone: phone.trim() || null,
      })
      if (rpcError) throw rpcError

      // 3. Redirect to pending page
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
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ marginBottom: '12px' }}>
              <Image src="/logo.webp" alt="XDrive Logistics LTD" width={140} height={40} style={{ display: 'inline-block' }} priority />
            </div>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📋</div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1f2937', margin: '0 0 6px' }}>Register as Broker</h1>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
              Your account will be reviewed and activated by the platform owner.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" disabled={loading} style={inputStyle}
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
              {loading ? 'Registering...' : 'Create Broker Account'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
            <Link href="/register" style={{ color: gold, textDecoration: 'none' }}>← Back to account types</Link>
            {' · '}
            <Link href="/login" style={{ color: gold, textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

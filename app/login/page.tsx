'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  // If already authenticated, go through post-login routing
  useEffect(() => {
    // Surface any error passed via query param (e.g. from /auth/callback)
    const queryError = searchParams?.get('error')
    if (queryError === 'auth_callback_failed') {
      setError('Email confirmation failed. Please try again or re-register.')
    }

    if (!isSupabaseConfigured) {
      setChecking(false)
      return
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/post-login')
      } else {
        setChecking(false)
      }
    })
  }, [router, searchParams])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!isSupabaseConfigured) {
      setError('Authentication is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
      setLoading(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (signInError) {
      setError(signInError.message || 'Sign-in failed. Please try again.')
      setPassword('')
      return
    }

    router.replace('/post-login')
  }

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#6b7280' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '48px 40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ marginBottom: '16px' }}>
              <Image src="/logo.webp" alt="XDrive Logistics LTD" width={160} height={46} style={{ display: 'inline-block' }} priority />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#1f2937', margin: '0 0 8px 0' }}>
              Welcome to <span style={{ color: '#C8A64D' }}>XDrive Logistics LTD</span>
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="email" style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Email Address</label>
              <input
                type="email" id="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                required disabled={loading} placeholder="your@email.com" autoFocus
                style={{ width: '100%', padding: '12px 16px', backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '8px', color: '#1f2937', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                onFocus={(e) => e.target.style.borderColor = '#C8A64D'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="password" style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Password</label>
              <input
                type="password" id="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                required disabled={loading} placeholder="Enter your password"
                style={{ width: '100%', padding: '12px 16px', backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '8px', color: '#1f2937', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                onFocus={(e) => e.target.style.borderColor = '#C8A64D'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <button
              type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px', backgroundColor: '#C8A64D', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#B39543')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#C8A64D')}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {error && (
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '14px', textAlign: 'center' }}>
                {error}
              </div>
            )}
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link href="/forgot-password" style={{ color: '#C8A64D', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}>Forgot password?</Link>
          </div>

          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: '#C8A64D', textDecoration: 'none', fontWeight: '600' }}>Register here</Link>
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

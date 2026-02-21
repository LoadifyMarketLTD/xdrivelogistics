'use client'

import { useState, FormEvent } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

const card: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '48px 40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', color: '#1f2937', fontSize: '15px', boxSizing: 'border-box' }
const btnStyle: React.CSSProperties = { width: '100%', padding: '14px', background: '#C8A64D', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '16px', fontWeight: 600, cursor: 'pointer', marginTop: '8px' }

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    if (!email) { setError('Please enter an email address'); setLoading(false); return }
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/reset-password`,
      })
      if (resetError) { setError('Failed to send reset email. Please try again.') }
      else { setMessage('Password reset email sent! Please check your inbox.'); setEmail('') }
    } catch { setError('An error occurred. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '24px' }}>
        <div style={card}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1f2937', margin: '0 0 16px 0', textAlign: 'center' }}>
            <span style={{ color: '#C8A64D' }}>Forgot</span> Password?
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', marginBottom: '32px', lineHeight: 1.5 }}>
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="email" style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                Email Address
              </label>
              <input type="email" id="email" style={inputStyle} placeholder="your@email.com"
                value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} />
            </div>
            <button type="submit" style={{ ...btnStyle, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            {error && <div style={{ color: '#dc2626', fontSize: '14px', marginTop: '16px', textAlign: 'center', padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>{error}</div>}
            {message && <div style={{ color: '#16a34a', fontSize: '14px', marginTop: '16px', textAlign: 'center', padding: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>{message}</div>}
          </form>
          <Link href="/login" style={{ display: 'block', textAlign: 'center', marginTop: '20px', color: '#C8A64D', fontSize: '14px', textDecoration: 'none' }}>
            ← Back to Login
          </Link>
          <div style={{ textAlign: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e5e7eb', color: '#6b7280', fontSize: '13px', lineHeight: 1.6 }}>
            Need help? Call or WhatsApp:<br />
            <a href="tel:07423272138" style={{ color: '#C8A64D', fontWeight: 600, textDecoration: 'none' }}>07423272138</a>
          </div>
        </div>
      </div>
    </div>
  )
}

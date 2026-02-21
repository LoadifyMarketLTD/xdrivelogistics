'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

const pageWrap: React.CSSProperties = { minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" }
const card: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '48px 40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', color: '#1f2937', fontSize: '15px', boxSizing: 'border-box' }
const btnStyle: React.CSSProperties = { width: '100%', padding: '14px', background: '#C8A64D', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '16px', fontWeight: 600, cursor: 'pointer', marginTop: '8px' }

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setIsValidSession(true) }
      else { setError('Invalid or expired reset link. Please request a new one.') }
    })
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(''); setMessage(''); setLoading(true)
    if (!password) { setError('Please enter a new password'); setLoading(false); return }
    if (password.length < 6) { setError('Password must be at least 6 characters long'); setLoading(false); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); setLoading(false); return }
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) { setError('Failed to update password. Please try again.') }
      else { setMessage('Password updated successfully! Redirecting to login...'); setTimeout(() => router.push('/login'), 2000) }
    } catch { setError('An error occurred. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div style={pageWrap}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '24px' }}>
        <div style={card}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1f2937', margin: '0 0 16px 0', textAlign: 'center' }}>
            <span style={{ color: '#C8A64D' }}>Reset</span> Password
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', marginBottom: '32px', lineHeight: 1.5 }}>
            Enter your new password below.
          </p>

          {isValidSession ? (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <label htmlFor="password" style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>New Password</label>
                <input type="password" id="password" style={inputStyle} placeholder="Enter new password"
                  value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} minLength={6} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label htmlFor="confirmPassword" style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Confirm Password</label>
                <input type="password" id="confirmPassword" style={inputStyle} placeholder="Confirm new password"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required disabled={loading} minLength={6} />
              </div>
              <button type="submit" style={{ ...btnStyle, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }} disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
              {error && <div style={{ color: '#dc2626', fontSize: '14px', marginTop: '16px', textAlign: 'center', padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>{error}</div>}
              {message && <div style={{ color: '#16a34a', fontSize: '14px', marginTop: '16px', textAlign: 'center', padding: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>{message}</div>}
            </form>
          ) : (
            <div style={{ color: '#dc2626', fontSize: '14px', textAlign: 'center', padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
              {error || 'Loading...'}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e5e7eb', color: '#6b7280', fontSize: '13px', lineHeight: 1.6 }}>
            Need help? Call or WhatsApp:<br />
            <a href="tel:07423272138" style={{ color: '#C8A64D', fontWeight: 600, textDecoration: 'none' }}>07423272138</a>
          </div>
        </div>
      </div>
    </div>
  )
}

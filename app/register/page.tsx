'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (!email) {
      setError('Please enter an email address')
      setLoading(false)
      return
    }

    if (!password) {
      setError('Please enter a password')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        setError(signUpError.message)
        setPassword('')
        setConfirmPassword('')
      } else if (data.user) {
        // Redirect to dashboard after successful registration
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '48px 40px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 8px 0'
            }}>
              Join <span style={{ color: '#C8A64D' }}>XDrive</span>
            </h1>
            <p style={{
              fontSize: '15px',
              color: '#6b7280',
              margin: 0
            }}>
              Create your account to get started
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="email" style={{
                display: 'block',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="your@email.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  color: '#1f2937',
                  fontSize: '15px',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#C8A64D'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="password" style={{
                display: 'block',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="Minimum 6 characters"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  color: '#1f2937',
                  fontSize: '15px',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#C8A64D'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="confirmPassword" style={{
                display: 'block',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="Re-enter password"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  color: '#1f2937',
                  fontSize: '15px',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#C8A64D'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#C8A64D',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: loading ? 0.6 : 1
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#B39543')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#C8A64D')}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            {error && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}
          </form>

          <div style={{
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #e5e7eb',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            Already have an account?{' '}
            <Link href="/login" style={{
              color: '#C8A64D',
              textDecoration: 'none',
              fontWeight: '600'
            }}>
              Login here
            </Link>
          </div>
        </div>

        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '13px'
        }}>
          Need help? Call or WhatsApp:{' '}
          <a href="tel:07423272138" style={{
            color: '#C8A64D',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            07423272138
          </a>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import Link from 'next/link'
import { needsOnboarding } from '@/lib/profile'
import { DEFAULT_ROLE, ROLES, ROLE_LABEL, ROLE_DESCRIPTION, ROLE_ICON, type Role } from '@/lib/roles'
import { getDefaultDashboardPath } from '@/lib/routing/getDefaultDashboardPath'

export default function LoginPage() {
  const [step, setStep] = useState<'role' | 'credentials'>('role')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      if (!isSupabaseConfigured) {
        setChecking(false)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()

        const role = profileData?.role as Role | undefined
        if (needsOnboarding(role ?? DEFAULT_ROLE, profileData)) {
          router.push('/onboarding')
        } else {
          router.push(getDefaultDashboardPath(role))
        }
      } else {
        setChecking(false)
      }
    }
    checkAuth()
  }, [router])

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
    setError('')
    setStep('credentials')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!isSupabaseConfigured) {
      setError('Authentication is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
      setLoading(false)
      return
    }

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

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message || 'Sign-in failed. Please try again.')
        setPassword('')
      } else if (data.user) {
        // Fetch full profile to check role and onboarding status
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle()

        const profileRole = profileData?.role as Role | undefined

        // Verify the account role matches the selected login role
        if (profileRole && profileRole !== selectedRole) {
          await supabase.auth.signOut()
          setError(
            `This account is registered as "${ROLE_LABEL[profileRole]}". Please go back and select the correct account type.`
          )
          setPassword('')
          setLoading(false)
          return
        }

        // selectedRole is guaranteed non-null at this point (step === 'credentials')
        const effectiveRole: Role = profileRole ?? selectedRole!
        if (needsOnboarding(effectiveRole, profileData)) {
          router.push('/onboarding')
        } else {
          router.push(getDefaultDashboardPath(effectiveRole))
        }
      } else {
        setError('Sign-in failed. Please try again.')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (checking) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          Loading...
        </div>
      </div>
    )
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
        maxWidth: '460px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '48px 40px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ marginBottom: '16px' }}>
              <Image src="/logo.webp" alt="XDrive Logistics LTD" width={160} height={46} style={{ display: 'inline-block' }} priority />
            </div>
            <h1 style={{
              fontSize: '26px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 8px 0'
            }}>
              Welcome to <span style={{ color: '#C8A64D' }}>XDrive Logistics LTD</span>
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0
            }}>
              {step === 'role' ? 'Select your account type to continue' : `Signing in as ${ROLE_LABEL[selectedRole!]}`}
            </p>
          </div>

          {/* Step 1: Role Selection */}
          {step === 'role' && (
            <div>
              <p style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                I am a…
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      padding: '14px 16px',
                      border: '2px solid #d1d5db',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      background: '#ffffff',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#C8A64D'
                      e.currentTarget.style.background = '#fffbf0'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#d1d5db'
                      e.currentTarget.style.background = '#ffffff'
                    }}
                  >
                    <span style={{ fontSize: '22px', marginRight: '12px', flexShrink: 0 }}>{ROLE_ICON[role]}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937', marginBottom: '2px' }}>
                        {ROLE_LABEL[role]}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
                        {ROLE_DESCRIPTION[role]}
                      </div>
                    </div>
                    <span style={{ fontSize: '18px', color: '#9ca3af', marginLeft: '8px', alignSelf: 'center' }}>›</span>
                  </button>
                ))}
              </div>

              <div style={{
                marginTop: '24px',
                paddingTop: '24px',
                borderTop: '1px solid #e5e7eb',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '14px'
              }}>
                Don&apos;t have an account?{' '}
                <Link href="/register" style={{
                  color: '#C8A64D',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>
                  Register here
                </Link>
              </div>
            </div>
          )}

          {/* Step 2: Credentials */}
          {step === 'credentials' && selectedRole && (
            <div>
              {/* Selected role badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                backgroundColor: '#fffbf0',
                border: '2px solid #C8A64D',
                borderRadius: '10px',
                marginBottom: '24px',
              }}>
                <span style={{ fontSize: '22px' }}>{ROLE_ICON[selectedRole]}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>Logging in as</div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#1f2937' }}>{ROLE_LABEL[selectedRole]}</div>
                </div>
                <button
                  type="button"
                  onClick={() => { setStep('role'); setError(''); setPassword('') }}
                  style={{
                    fontSize: '12px',
                    color: '#C8A64D',
                    fontWeight: '600',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  Change
                </button>
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
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      color: '#1f2937',
                      fontSize: '15px',
                      transition: 'all 0.2s',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#C8A64D'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
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
                    placeholder="Enter your password"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      color: '#1f2937',
                      fontSize: '15px',
                      transition: 'all 0.2s',
                      outline: 'none',
                      boxSizing: 'border-box',
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
                  {loading ? 'Logging in...' : `Login as ${ROLE_LABEL[selectedRole]}`}
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

              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <Link href="/forgot-password" style={{
                  color: '#C8A64D',
                  fontSize: '14px',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}>
                  Forgot password?
                </Link>
              </div>

              <div style={{
                marginTop: '24px',
                paddingTop: '24px',
                borderTop: '1px solid #e5e7eb',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '14px'
              }}>
                Don&apos;t have an account?{' '}
                <Link href="/register" style={{
                  color: '#C8A64D',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>
                  Register here
                </Link>
              </div>
            </div>
          )}
        </div>

        <div style={{
          marginTop: '16px',
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

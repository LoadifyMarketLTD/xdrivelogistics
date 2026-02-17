'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

export default function DriverOnboardingPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [licenseType, setLicenseType] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
  }, [authLoading, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!firstName.trim()) {
      setError('First name is required')
      return
    }

    if (!lastName.trim()) {
      setError('Last name is required')
      return
    }

    if (!licenseType) {
      setError('License type is required')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      setSuccess(false)

      // Create driver record
      const { error: driverError } = await supabase
        .from('drivers')
        .insert({
          user_id: user?.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim() || null,
          license_type: licenseType,
        })

      if (driverError) throw driverError

      console.log('Driver profile created successfully')

      setSuccess(true)
      
      // Redirect after a brief delay to show success message
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (err: any) {
      console.error('Error creating driver profile:', err)
      setError(err.message || 'Failed to create driver profile')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0F1F2E', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px' }}>Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-content">
      <header className="platform-header">
        <div className="container">
          <div className="platform-nav">
            <div className="platform-brand">
              <span className="platform-brand-accent">XDrive</span> Driver Onboarding
            </div>
          </div>
        </div>
      </header>

      <main className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 200px)',
          padding: '40px 20px'
        }}>
          <div style={{
            backgroundColor: '#132433',
            borderRadius: '12px',
            padding: '48px',
            border: '1px solid rgba(255,255,255,0.08)',
            maxWidth: '600px',
            width: '100%'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👨‍✈️</div>
              <h1 style={{ fontSize: '28px', marginBottom: '12px', color: '#fff' }}>
                Driver Profile Setup
              </h1>
              <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: '1.6' }}>
                Complete your driver profile to start accepting jobs.
              </p>
            </div>

            {error && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                border: '1px solid rgba(255, 107, 107, 0.3)',
                borderRadius: '8px',
                marginBottom: '24px',
                color: '#ff6b6b',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '8px',
                marginBottom: '24px',
                color: '#22c55e',
                fontSize: '14px'
              }}>
                ✓ Driver profile created successfully! Redirecting to dashboard...
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#fff'
                }}>
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '16px'
                  }}
                  placeholder="Enter your first name"
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#fff'
                }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '16px'
                  }}
                  placeholder="Enter your last name"
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#fff'
                }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '16px'
                  }}
                  placeholder="+44 7xxx xxx xxx"
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#fff'
                }}>
                  License Type *
                </label>
                <select
                  value={licenseType}
                  onChange={(e) => setLicenseType(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '16px'
                  }}
                >
                  <option value="">Select license type</option>
                  <option value="B">Class B - Car/Van</option>
                  <option value="C1">Class C1 - Light Truck (up to 7.5t)</option>
                  <option value="C">Class C - Rigid Truck</option>
                  <option value="CE">Class CE - Articulated Truck</option>
                </select>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
                  Select your highest driving license category
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="action-btn primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  fontWeight: '600',
                  opacity: submitting ? 0.6 : 1
                }}
              >
                {submitting ? 'Creating Profile...' : 'Create Driver Profile'}
              </button>
            </form>

            <div style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: 'rgba(200,166,77,0.1)',
              border: '1px solid rgba(200,166,77,0.2)',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#94a3b8',
              lineHeight: '1.6'
            }}>
              <strong style={{ color: 'var(--gold-premium)', display: 'block', marginBottom: '8px' }}>
                ℹ️ What happens next:
              </strong>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Your driver profile will be created</li>
                <li>You can be assigned to transport jobs</li>
                <li>You'll receive notifications for new assignments</li>
                <li>Track your completed deliveries</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

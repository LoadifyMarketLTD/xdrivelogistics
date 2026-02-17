'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

export default function CompanyOnboardingPage() {
  const router = useRouter()
  const { user, companyId, loading: authLoading, refreshProfile } = useAuth()
  
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    // If user already has a company, redirect to dashboard
    if (!authLoading && companyId) {
      router.push('/dashboard')
      return
    }
  }, [authLoading, user, companyId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!companyName.trim()) {
      setError('Company name is required')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      setSuccess(false)

      // Call the create_company RPC function with both name and phone
      const { data: newCompanyId, error: rpcError } = await supabase
        .rpc('create_company', { 
          company_name: companyName.trim(),
          phone: phone.trim() || null
        })

      if (rpcError) throw rpcError
      
      if (!newCompanyId) {
        throw new Error('Company creation failed - no ID returned')
      }

      console.log('Company created successfully:', newCompanyId)

      // Refresh profile to get the new company_id
      await refreshProfile()

      setSuccess(true)
      
      // Redirect after a brief delay to show success message
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (err: any) {
      console.error('Error creating company:', err)
      setError(err.message || 'Failed to create company')
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
              <span className="platform-brand-accent">XDrive</span> Company Onboarding
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
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚚</div>
              <h1 style={{ fontSize: '28px', marginBottom: '12px', color: '#fff' }}>
                Create Your Company Profile
              </h1>
              <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: '1.6' }}>
                Enter your company details to start using the XDrive Marketplace.
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
                ✓ Company created successfully! Redirecting to dashboard...
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
                  Company Name *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
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
                  placeholder="Enter your company name"
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
                {submitting ? 'Creating Company...' : 'Create Company & Continue'}
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
                <li>Your company profile will be created</li>
                <li>You'll be assigned as the admin</li>
                <li>You can start posting jobs to the marketplace</li>
                <li>You can browse and bid on other jobs</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

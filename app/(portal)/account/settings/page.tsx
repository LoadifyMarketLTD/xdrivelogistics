'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

export default function AccountSettingsPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [authLoading, user, router])

  useEffect(() => {
    if (profile) {
      setFullName((profile as any).full_name || '')
      setPhone((profile as any).phone || '')
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    try {
      setSubmitting(true)
      setError(null)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim() || null,
          phone: phone.trim() || null,
        })
        .eq('id', user.id)
      if (updateError) throw updateError
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return <div className="loading-screen"><div className="loading-text">Loading...</div></div>
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0A2239', marginBottom: '8px' }}>
          My Profile &amp; Settings
        </h1>
        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
          Update your personal details and account preferences.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">✓ Profile updated successfully!</div>}

      <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>Account Info</h2>
        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Email (cannot be changed here)</div>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>{user?.email}</div>
        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Role</div>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', textTransform: 'capitalize' }}>
          {(profile as any)?.role || 'User'}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2 className="form-section-title">Personal Details</h2>
          <div className="form-grid-2">
            <div className="form-field">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="form-input"
                placeholder="John Smith"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input"
                placeholder="+44 7xxx xxx xxx"
              />
            </div>
          </div>
        </div>

        <div className="btn-group">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      <div style={{ marginTop: '32px', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>Change Password</h2>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
          To change your password, use the forgot password flow from the login page.
        </p>
        <button
          type="button"
          onClick={() => router.push('/forgot-password')}
          className="btn-secondary"
        >
          Reset Password
        </button>
      </div>
    </div>
  )
}

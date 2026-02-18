'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import ResponsiveContainer from '@/components/layout/ResponsiveContainer'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

interface CompanyData {
  id: string
  name: string
  phone: string
  email: string
  vat_number: string
  company_number: string
  address_line1: string
  address_line2: string
  city: string
  postcode: string
  country: string
}

export default function CompanySettingsPage() {
  const router = useRouter()
  const { user, companyId, loading: authLoading } = useAuth()
  
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Form fields
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [vatNumber, setVatNumber] = useState('')
  const [companyNumber, setCompanyNumber] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [postcode, setPostcode] = useState('')
  const [country, setCountry] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
  }, [authLoading, user, router])

  useEffect(() => {
    const fetchCompany = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError(null)

        // Fetch company by created_by (only company owner can access settings)
        const { data, error: fetchError } = await supabase
          .from('companies')
          .select('*')
          .eq('created_by', user.id)
          .maybeSingle()

        if (fetchError) throw fetchError

        if (data) {
          setCompany(data)
          // Populate form fields
          setName(data.name || '')
          setPhone(data.phone || '')
          setEmail(data.email || '')
          setVatNumber(data.vat_number || '')
          setCompanyNumber(data.company_number || '')
          setAddressLine1(data.address_line1 || '')
          setAddressLine2(data.address_line2 || '')
          setCity(data.city || '')
          setPostcode(data.postcode || '')
          setCountry(data.country || '')
        } else {
          // User doesn't own a company - redirect to onboarding
          setError('You must create a company first to access settings.')
          setTimeout(() => {
            router.push('/onboarding/company')
          }, 2000)
        }
      } catch (err: any) {
        console.error('Error fetching company:', err)
        setError(err.message || 'Failed to load company details')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchCompany()
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Company name is required')
      return
    }

    if (!user) {
      setError('You must be logged in to update company details')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      setSuccess(false)

      // Update company details (updated_at is automatically set by database trigger)
      const { error: updateError } = await supabase
        .from('companies')
        .update({
          name: name.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          vat_number: vatNumber.trim() || null,
          company_number: companyNumber.trim() || null,
          address_line1: addressLine1.trim() || null,
          address_line2: addressLine2.trim() || null,
          city: city.trim() || null,
          postcode: postcode.trim() || null,
          country: country.trim() || null
        })
        .eq('created_by', user.id)

      if (updateError) throw updateError

      setSuccess(true)
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      console.error('Error updating company:', err)
      setError(err.message || 'Failed to update company details')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="loading-screen">
        <div className="loading-text">Loading...</div>
      </div>
    )
  }

  return (
    <ResponsiveContainer maxWidth="md">
      <div style={{ marginBottom: 'clamp(24px, 3vw, 32px)' }}>
        <h1 style={{
          fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Company Settings
        </h1>
        <p style={{
          fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
          color: '#6b7280',
        }}>
          Manage your company details and information.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          ✓ Company details updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="form-section">
              <h2 className="form-section-title">
                Basic Information
              </h2>
              
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="form-input"
                    placeholder="Your Company Ltd"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-input"
                    placeholder="+44 7xxx xxx xxx"
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="contact@company.com"
                />
              </div>
            </div>

            {/* Company Registration */}
            <div className="form-section">
              <h2 className="form-section-title">
                Company Registration
              </h2>
              
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label">
                    VAT Number
                  </label>
                  <input
                    type="text"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                    className="form-input"
                    placeholder="GB123456789"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">
                    Company Number
                  </label>
                  <input
                    type="text"
                    value={companyNumber}
                    onChange={(e) => setCompanyNumber(e.target.value)}
                    className="form-input"
                    placeholder="12345678"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="form-section">
              <h2 className="form-section-title">
                Address Information
              </h2>
              
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="form-input"
                    placeholder="123 Business Street"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="form-input"
                    placeholder="Suite 100"
                  />
                </div>

                <div className="form-grid-3">
                  <div className="form-field">
                    <label className="form-label">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="form-input"
                      placeholder="London"
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      Postcode
                    </label>
                    <input
                      type="text"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      className="form-input"
                      placeholder="SW1A 1AA"
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      Country
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="form-input"
                      placeholder="United Kingdom"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="btn-group">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </ResponsiveContainer>
  )
}

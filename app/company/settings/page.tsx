'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import '@/styles/dashboard.css'

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

    if (!authLoading && !companyId) {
      router.push('/onboarding/company')
      return
    }
  }, [authLoading, user, companyId, router])

  useEffect(() => {
    const fetchCompany = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError(null)

        // Fetch company by created_by (owner)
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
          setError('No company found. Please create a company first.')
          router.push('/onboarding/company')
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

      // Update company details
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
          country: country.trim() || null,
          updated_at: new Date().toISOString()
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
              <span className="platform-brand-accent">XDrive</span> Company Settings
            </div>
            <button 
              onClick={() => router.push('/dashboard')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: '#132433',
          borderRadius: '12px',
          padding: '48px',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', marginBottom: '8px', color: '#fff' }}>
              Company Settings
            </h1>
            <p style={{ fontSize: '15px', color: '#94a3b8' }}>
              Manage your company details and information.
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
              ✓ Company details updated successfully!
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
                Basic Information
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '15px'
                    }}
                    placeholder="Your Company Ltd"
                  />
                </div>

                <div>
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
                      padding: '12px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '15px'
                    }}
                    placeholder="+44 7xxx xxx xxx"
                  />
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#fff'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '15px'
                  }}
                  placeholder="contact@company.com"
                />
              </div>
            </div>

            {/* Company Registration */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
                Company Registration
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#fff'
                  }}>
                    VAT Number
                  </label>
                  <input
                    type="text"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '15px'
                    }}
                    placeholder="GB123456789"
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#fff'
                  }}>
                    Company Number
                  </label>
                  <input
                    type="text"
                    value={companyNumber}
                    onChange={(e) => setCompanyNumber(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '15px'
                    }}
                    placeholder="12345678"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
                Address Information
              </h2>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#fff'
                }}>
                  Address Line 1
                </label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '15px'
                  }}
                  placeholder="123 Business Street"
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#fff'
                }}>
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '15px'
                  }}
                  placeholder="Suite 100"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#fff'
                  }}>
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '15px'
                    }}
                    placeholder="London"
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#fff'
                  }}>
                    Postcode
                  </label>
                  <input
                    type="text"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '15px'
                    }}
                    placeholder="SW1A 1AA"
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#fff'
                  }}>
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '15px'
                    }}
                    placeholder="United Kingdom"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="action-btn primary"
                style={{
                  padding: '12px 32px',
                  fontSize: '15px',
                  fontWeight: '600',
                  opacity: submitting ? 0.6 : 1
                }}
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

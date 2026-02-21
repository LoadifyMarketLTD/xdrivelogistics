'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

interface CompanyData {
  id: string
  name: string
  phone: string | null
  email: string | null
  vat_number: string | null
  company_number: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  postcode: string | null
  country: string | null
  verified?: boolean
}

export default function CompanyProfilePage() {
  const router = useRouter()
  const { user, companyId, loading: authLoading } = useAuth()

  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [vatNumber, setVatNumber] = useState('')
  const [companyNumber, setCompanyNumber] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [postcode, setPostcode] = useState('')
  const [country, setCountry] = useState('United Kingdom')

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [authLoading, user, router])

  useEffect(() => {
    if (!user) return
    const fetchCompany = async () => {
      setLoading(true)
      setError(null)
      try {
        const id = companyId
        if (!id) {
          setError('No company linked to your account. Please complete onboarding.')
          setLoading(false)
          return
        }
        const { data, error: fetchError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', id)
          .maybeSingle()
        if (fetchError) throw fetchError
        if (data) {
          setCompany(data)
          setName(data.name || '')
          setPhone(data.phone || '')
          setEmail(data.email || '')
          setVatNumber(data.vat_number || '')
          setCompanyNumber(data.company_number || '')
          setAddressLine1(data.address_line1 || '')
          setAddressLine2(data.address_line2 || '')
          setCity(data.city || '')
          setPostcode(data.postcode || '')
          setCountry(data.country || 'United Kingdom')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load company details')
      } finally {
        setLoading(false)
      }
    }
    fetchCompany()
  }, [user, companyId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Company name is required'); return }
    if (!user || !companyId) { setError('Not authenticated'); return }
    try {
      setSubmitting(true)
      setError(null)
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
        })
        .eq('id', companyId)
      if (updateError) throw updateError
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update company details')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return <div className="loading-screen"><div className="loading-text">Loading...</div></div>
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0A2239', marginBottom: '8px' }}>
          Company Profile
        </h1>
        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
          Manage your company details and verification status.
        </p>
      </div>

      {company?.verified && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px',
          padding: '8px 16px', marginBottom: '20px', fontSize: '14px', fontWeight: '600', color: '#16a34a',
        }}>
          ✓ Verified Company
        </div>
      )}
      {!company?.verified && company && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '6px',
          padding: '8px 16px', marginBottom: '20px', fontSize: '14px', fontWeight: '600', color: '#d97706',
        }}>
          ⏳ Verification Pending — upload documents to get verified
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">✓ Company profile updated successfully!</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2 className="form-section-title">Basic Information</h2>
          <div className="form-grid-2">
            <div className="form-field">
              <label className="form-label">Company Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="form-input" placeholder="Your Company Ltd" />
            </div>
            <div className="form-field">
              <label className="form-label">Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="form-input" placeholder="+44 7xxx xxx xxx" />
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" placeholder="contact@company.com" />
          </div>
        </div>

        <div className="form-section">
          <h2 className="form-section-title">Company Registration</h2>
          <div className="form-grid-2">
            <div className="form-field">
              <label className="form-label">VAT Number</label>
              <input type="text" value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} className="form-input" placeholder="GB123456789" />
            </div>
            <div className="form-field">
              <label className="form-label">Company Number</label>
              <input type="text" value={companyNumber} onChange={(e) => setCompanyNumber(e.target.value)} className="form-input" placeholder="12345678" />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="form-section-title">Address</h2>
          <div className="form-field">
            <label className="form-label">Address Line 1</label>
            <input type="text" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} className="form-input" placeholder="123 Business Street" />
          </div>
          <div className="form-field">
            <label className="form-label">Address Line 2</label>
            <input type="text" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} className="form-input" placeholder="Suite 100" />
          </div>
          <div className="form-grid-3">
            <div className="form-field">
              <label className="form-label">City</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="form-input" placeholder="London" />
            </div>
            <div className="form-field">
              <label className="form-label">Postcode</label>
              <input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value)} className="form-input" placeholder="SW1A 1AA" />
            </div>
            <div className="form-field">
              <label className="form-label">Country</label>
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="form-input" />
            </div>
          </div>
        </div>

        <div className="btn-group">
          <button type="button" onClick={() => router.push('/account/business-docs')} className="btn-secondary">
            Manage Documents →
          </button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

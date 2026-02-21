'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

interface CompanyData {
  id: string
  name: string
  status: string
  registration_no: string | null
  vat_no: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  postcode: string | null
  country: string | null
  contact_email: string | null
  contact_phone: string | null
  website: string | null
  description: string | null
}

export const dynamic = 'force-dynamic'

export default function CompanyProfilePage() {
  const router = useRouter()
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  // Form fields
  const [name, setName] = useState('')
  const [regNo, setRegNo] = useState('')
  const [vatNo, setVatNo] = useState('')
  const [addr1, setAddr1] = useState('')
  const [addr2, setAddr2] = useState('')
  const [city, setCity] = useState('')
  const [postcode, setPostcode] = useState('')
  const [country, setCountry] = useState('UK')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [description, setDescription] = useState('')

  const gold = '#C8A64D'

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      // Find company created by this user
      const { data: companyData, error: err } = await supabase
        .from('companies')
        .select('*')
        .eq('created_by', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (err) { setError(err.message); setLoading(false); return }
      if (!companyData) { setError('No company found. Please register first.'); setLoading(false); return }

      setCompany(companyData)
      setName(companyData.name ?? '')
      setRegNo(companyData.registration_no ?? '')
      setVatNo(companyData.vat_no ?? '')
      setAddr1(companyData.address_line1 ?? '')
      setAddr2(companyData.address_line2 ?? '')
      setCity(companyData.city ?? '')
      setPostcode(companyData.postcode ?? '')
      setCountry(companyData.country ?? 'UK')
      setContactEmail(companyData.contact_email ?? '')
      setContactPhone(companyData.contact_phone ?? '')
      setWebsite(companyData.website ?? '')
      setDescription(companyData.description ?? '')
      setLoading(false)
    }
    init()
  }, [router])

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    setError('')
    setSaved(false)

    const { error: updateErr } = await supabase
      .from('companies')
      .update({
        name: name.trim(),
        registration_no: regNo.trim() || null,
        vat_no: vatNo.trim() || null,
        address_line1: addr1.trim() || null,
        address_line2: addr2.trim() || null,
        city: city.trim() || null,
        postcode: postcode.trim() || null,
        country: country.trim() || 'UK',
        contact_email: contactEmail.trim() || null,
        contact_phone: contactPhone.trim() || null,
        website: website.trim() || null,
        description: description.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', company.id)

    if (updateErr) { setError(updateErr.message) } else { setSaved(true) }
    setSaving(false)
  }

  const handleSubmitForReview = async () => {
    if (!company) return
    setSubmitting(true)
    setError('')

    const { error: rpcErr } = await supabase.rpc('submit_company_for_review', {
      p_company_id: company.id,
    })

    if (rpcErr) {
      setError(rpcErr.message)
    } else {
      // Refresh company status
      const { data } = await supabase.from('companies').select('status').eq('id', company.id).single()
      if (data) setCompany(prev => prev ? { ...prev, status: data.status } : prev)
      router.push('/pending')
    }
    setSubmitting(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 13px',
    border: '1px solid #d1d5db', borderRadius: '7px',
    color: '#1f2937', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  }

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>{label}</label>
      {children}
    </div>
  )

  if (loading) return <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>Loading…</div>

  if (error && !company) return (
    <div style={{ padding: '48px', textAlign: 'center' }}>
      <div style={{ color: '#dc2626', marginBottom: '16px' }}>{error}</div>
      <a href="/pending" style={{ color: gold }}>← Back</a>
    </div>
  )

  const isPendingReview = company?.status === 'pending_review'
  const isApproved = company?.status === 'approved'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f5f7', padding: '32px 24px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: gold, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
            Company Profile
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
            {company?.name ?? 'Your Company'}
          </h1>
          <div style={{ marginTop: '6px' }}>
            <span style={{
              fontSize: '12px', padding: '3px 10px', borderRadius: '12px', fontWeight: '600',
              backgroundColor: isApproved ? '#dcfce7' : isPendingReview ? '#fef9c3' : '#f3f4f6',
              color: isApproved ? '#16a34a' : isPendingReview ? '#713f12' : '#6b7280',
            }}>
              {company?.status ?? 'draft'}
            </span>
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '14px', marginBottom: '16px' }}>
            {error}
          </div>
        )}
        {saved && (
          <div style={{ padding: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#16a34a', fontSize: '14px', marginBottom: '16px' }}>
            ✓ Saved successfully
          </div>
        )}

        <form onSubmit={handleSave}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Company Details</h2>

            <Field label="Company Name *">
              <input type="text" value={name} onChange={e => setName(e.target.value)} required disabled={saving} style={inputStyle}
                onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Registration No.">
                <input type="text" value={regNo} onChange={e => setRegNo(e.target.value)} placeholder="Companies House No." disabled={saving} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
              </Field>
              <Field label="VAT Number">
                <input type="text" value={vatNo} onChange={e => setVatNo(e.target.value)} placeholder="GB123456789" disabled={saving} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
              </Field>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Address</h2>
            <Field label="Address Line 1">
              <input type="text" value={addr1} onChange={e => setAddr1(e.target.value)} disabled={saving} style={inputStyle}
                onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </Field>
            <Field label="Address Line 2">
              <input type="text" value={addr2} onChange={e => setAddr2(e.target.value)} disabled={saving} style={inputStyle}
                onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <Field label="City">
                <input type="text" value={city} onChange={e => setCity(e.target.value)} disabled={saving} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
              </Field>
              <Field label="Postcode">
                <input type="text" value={postcode} onChange={e => setPostcode(e.target.value)} disabled={saving} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
              </Field>
              <Field label="Country">
                <input type="text" value={country} onChange={e => setCountry(e.target.value)} disabled={saving} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
              </Field>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Contact & Info</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Contact Email">
                <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} disabled={saving} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
              </Field>
              <Field label="Contact Phone">
                <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} disabled={saving} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
              </Field>
            </div>
            <Field label="Website">
              <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://" disabled={saving} style={inputStyle}
                onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </Field>
            <Field label="Description">
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} disabled={saving}
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </Field>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button type="submit" disabled={saving} style={{
              flex: 1, padding: '13px', backgroundColor: '#ffffff',
              border: `2px solid ${gold}`, borderRadius: '8px',
              color: gold, fontSize: '14px', fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
            }}>
              {saving ? 'Saving…' : '💾 Save Profile'}
            </button>

            {!isApproved && !isPendingReview && (
              <button type="button" onClick={handleSubmitForReview} disabled={submitting || saving} style={{
                flex: 1, padding: '13px', backgroundColor: gold,
                border: 'none', borderRadius: '8px',
                color: '#ffffff', fontSize: '14px', fontWeight: '600',
                cursor: (submitting || saving) ? 'not-allowed' : 'pointer',
                opacity: (submitting || saving) ? 0.6 : 1,
              }}>
                {submitting ? 'Submitting…' : '🚀 Submit for Review'}
              </button>
            )}

            {isPendingReview && (
              <div style={{ flex: 1, padding: '13px', backgroundColor: '#fef9c3', border: '1px solid #f3d990', borderRadius: '8px', fontSize: '13px', color: '#713f12', textAlign: 'center' }}>
                ⏳ Awaiting owner review
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

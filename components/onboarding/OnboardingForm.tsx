'use client'

import { useState } from 'react'
import { type Role } from '@/lib/roles'

// ─── Shared style helpers ─────────────────────────────────────────────────────

const card: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '40px',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
  border: '1px solid #e5e7eb',
  maxWidth: '480px',
  width: '100%',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: '#374151',
  fontSize: '14px',
  fontWeight: '500',
  marginBottom: '6px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  color: '#1f2937',
  fontSize: '15px',
  outline: 'none',
  boxSizing: 'border-box',
}

const fieldWrap: React.CSSProperties = { marginBottom: '18px' }

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  role: Role
  onSave: (fields: Record<string, string | number>) => Promise<void>
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnboardingForm({ role, onSave }: Props) {
  // Driver fields
  const [basePostcode, setBasePostcode] = useState('')
  const [vehicleType, setVehicleType] = useState('')
  const [availability, setAvailability] = useState('Available')

  // Broker fields
  const [brokerCompanyName, setBrokerCompanyName] = useState('')
  const [brokerCompanyPostcode, setBrokerCompanyPostcode] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('7 days')

  // Company fields
  const [companyName, setCompanyName] = useState('')
  const [companyPostcode, setCompanyPostcode] = useState('')
  const [fleetSize, setFleetSize] = useState('')
  const [primaryServices, setPrimaryServices] = useState<string[]>([])

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const gold = '#C8A64D'

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = gold
  }
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#d1d5db'
  }

  const toggleService = (svc: string) => {
    setPrimaryServices((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]
    )
  }

  const validate = (): string => {
    if (role === 'driver') {
      if (!basePostcode.trim()) return 'Base Postcode is required'
      if (!vehicleType) return 'Vehicle Type is required'
    }
    if (role === 'broker') {
      if (!brokerCompanyName.trim()) return 'Company Name is required'
      if (!brokerCompanyPostcode.trim()) return 'Company Postcode is required'
    }
    if (role === 'company') {
      if (!companyName.trim()) return 'Company Name is required'
      if (!companyPostcode.trim()) return 'Company Postcode is required'
      if (!fleetSize || Number(fleetSize) < 1) return 'Fleet Size must be at least 1'
      if (primaryServices.length === 0) return 'Select at least one Primary Service'
    }
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const msg = validate()
    if (msg) { setError(msg); return }

    setSubmitting(true)
    try {
      let fields: Record<string, string | number> = {}
      if (role === 'driver') {
        fields = {
          driver_base_postcode: basePostcode.trim().toUpperCase(),
          driver_vehicle_type: vehicleType,
          driver_availability: availability,
        }
      } else if (role === 'broker') {
        fields = {
          broker_company_name: brokerCompanyName.trim(),
          broker_company_postcode: brokerCompanyPostcode.trim().toUpperCase(),
          broker_payment_terms: paymentTerms,
        }
      } else {
        fields = {
          company_name: companyName.trim(),
          company_postcode: companyPostcode.trim().toUpperCase(),
          company_fleet_size: Number(fleetSize),
          company_primary_services: primaryServices.join(', '),
        }
      }
      await onSave(fields)
    } catch (err: any) {
      setError(err.message || 'Failed to save. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={card}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>
          {role === 'driver' ? '🚚' : role === 'broker' ? '📋' : '🏢'}
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1f2937', margin: '0 0 6px' }}>
          {role === 'driver'
            ? 'Driver Setup'
            : role === 'broker'
            ? 'Broker Setup'
            : 'Company Setup'}
        </h2>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          Step 1 of 1 — Complete your profile to continue
        </p>
      </div>

      {error && (
        <div style={{
          marginBottom: '16px',
          padding: '10px 14px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626',
          fontSize: '14px',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* ── DRIVER FIELDS ─────────────────────────────── */}
        {role === 'driver' && (
          <>
            <div style={fieldWrap}>
              <label style={labelStyle}>Base Postcode *</label>
              <input
                type="text"
                value={basePostcode}
                onChange={(e) => setBasePostcode(e.target.value)}
                placeholder="e.g. M1 1AB"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={submitting}
              />
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>Vehicle Type *</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={submitting}
              >
                <option value="">Select vehicle type…</option>
                {['Small Van', 'SWB', 'LWB', 'Luton', '7.5t', 'HGV'].map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>Availability *</label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={submitting}
              >
                {['Available', 'Busy', 'Off'].map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* ── BROKER FIELDS ─────────────────────────────── */}
        {role === 'broker' && (
          <>
            <div style={fieldWrap}>
              <label style={labelStyle}>Company Name *</label>
              <input
                type="text"
                value={brokerCompanyName}
                onChange={(e) => setBrokerCompanyName(e.target.value)}
                placeholder="Your company name"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={submitting}
              />
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>Company Postcode *</label>
              <input
                type="text"
                value={brokerCompanyPostcode}
                onChange={(e) => setBrokerCompanyPostcode(e.target.value)}
                placeholder="e.g. SW1A 1AA"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={submitting}
              />
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>Payment Terms *</label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={submitting}
              >
                {['24-48h', '7 days', '14 days', '30 days'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* ── COMPANY FIELDS ────────────────────────────── */}
        {role === 'company' && (
          <>
            <div style={fieldWrap}>
              <label style={labelStyle}>Company Name *</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your company name"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={submitting}
              />
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>Company Postcode *</label>
              <input
                type="text"
                value={companyPostcode}
                onChange={(e) => setCompanyPostcode(e.target.value)}
                placeholder="e.g. LS1 1BA"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={submitting}
              />
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>Fleet Size *</label>
              <input
                type="number"
                min={1}
                value={fleetSize}
                onChange={(e) => setFleetSize(e.target.value)}
                placeholder="Number of vehicles"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={submitting}
              />
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>Primary Services * (select all that apply)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                {['Same Day', 'Next Day', 'Pallet', 'ADR', 'International'].map((svc) => {
                  const selected = primaryServices.includes(svc)
                  return (
                    <button
                      key={svc}
                      type="button"
                      onClick={() => toggleService(svc)}
                      style={{
                        padding: '6px 14px',
                        border: `2px solid ${selected ? gold : '#d1d5db'}`,
                        borderRadius: '20px',
                        background: selected ? '#fffbf0' : '#ffffff',
                        color: selected ? '#92741a' : '#4b5563',
                        fontSize: '13px',
                        fontWeight: selected ? '600' : '400',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {svc}
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            padding: '13px',
            backgroundColor: gold,
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '15px',
            fontWeight: '600',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.6 : 1,
            marginTop: '8px',
          }}
        >
          {submitting ? 'Saving…' : 'Save & Continue →'}
        </button>
      </form>
    </div>
  )
}

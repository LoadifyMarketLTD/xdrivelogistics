'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import '@/styles/dashboard.css'

export const dynamic = 'force-dynamic'

export default function PostJobPage() {
  const router = useRouter()
  const { user, companyId, loading: authLoading } = useAuth()
  
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    pickup_location: '',
    delivery_location: '',
    pickup_datetime: '',
    delivery_datetime: '',
    vehicle_type: '',
    load_details: '',
    pallets: '',
    weight_kg: '',
    budget: ''
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (!authLoading && !companyId) {
      router.push('/onboarding')
      return
    }
  }, [authLoading, user, companyId, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!companyId) {
      alert('You must be part of a company to post a job')
      return
    }

    if (!formData.pickup_location || !formData.delivery_location) {
      alert('Pickup and delivery locations are required')
      return
    }

    try {
      setSubmitting(true)

      const jobData: any = {
        posted_by_company_id: companyId,
        pickup_location: formData.pickup_location,
        delivery_location: formData.delivery_location,
        status: 'open'
      }

      if (formData.pickup_datetime) jobData.pickup_datetime = formData.pickup_datetime
      if (formData.delivery_datetime) jobData.delivery_datetime = formData.delivery_datetime
      if (formData.vehicle_type) jobData.vehicle_type = formData.vehicle_type
      if (formData.load_details) jobData.load_details = formData.load_details
      if (formData.pallets) jobData.pallets = parseInt(formData.pallets)
      if (formData.weight_kg) jobData.weight_kg = parseFloat(formData.weight_kg)
      if (formData.budget) jobData.budget = parseFloat(formData.budget)

      const { data, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select()
        .single()

      if (error) throw error

      console.log('Job posted successfully:', data)
      alert('Job posted successfully!')
      router.push(`/marketplace/${data.id}`)
    } catch (err: any) {
      console.error('Error posting job:', err)
      alert(`Error posting job: ${err.message}`)
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
              <span className="platform-brand-accent">XDrive</span> Post Job
            </div>
            <nav>
              <ul className="platform-links">
                <li><a href="/dashboard">Dashboard</a></li>
                <li><a href="/marketplace">Marketplace</a></li>
                <li><a href="/jobs/new" style={{ color: 'var(--gold-premium)' }}>Post Job</a></li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main className="container">
        <div style={{ marginTop: '24px', marginBottom: '16px' }}>
          <a href="/marketplace" style={{ color: 'var(--gold-premium)', fontSize: '14px' }}>
            ← Back to Marketplace
          </a>
        </div>

        <div style={{
          backgroundColor: '#132433',
          borderRadius: '12px',
          padding: '32px',
          border: '1px solid rgba(255,255,255,0.08)',
          maxWidth: '800px'
        }}>
          <h1 className="section-title" style={{ marginBottom: '24px' }}>Post a New Job</h1>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    Pickup Location *
                  </label>
                  <input
                    type="text"
                    name="pickup_location"
                    value={formData.pickup_location}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                    placeholder="e.g., Manchester, M1"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    Delivery Location *
                  </label>
                  <input
                    type="text"
                    name="delivery_location"
                    value={formData.delivery_location}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                    placeholder="e.g., London, SE1"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    Pickup Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="pickup_datetime"
                    value={formData.pickup_datetime}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    Delivery Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="delivery_datetime"
                    value={formData.delivery_datetime}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Vehicle Type
                </label>
                <select
                  name="vehicle_type"
                  value={formData.vehicle_type}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select vehicle type</option>
                  <option value="Small Van">Small Van</option>
                  <option value="Medium Van">Medium Van</option>
                  <option value="Large Van">Large Van</option>
                  <option value="Luton">Luton</option>
                  <option value="7.5 Tonne">7.5 Tonne</option>
                  <option value="Sprinter">Sprinter</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    Pallets
                  </label>
                  <input
                    type="number"
                    name="pallets"
                    value={formData.pallets}
                    onChange={handleChange}
                    min="0"
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight_kg"
                    value={formData.weight_kg}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    Budget (£)
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Load Details
                </label>
                <textarea
                  name="load_details"
                  value={formData.load_details}
                  onChange={handleChange}
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                  placeholder="Describe the load, special requirements, access restrictions, etc."
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  className="action-btn primary"
                  style={{ opacity: submitting ? 0.6 : 1 }}
                >
                  {submitting ? 'Posting...' : 'Post Job to Marketplace'}
                </button>
                <a href="/marketplace" className="action-btn secondary">
                  Cancel
                </a>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

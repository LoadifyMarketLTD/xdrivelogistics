'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import '@/styles/portal.css'

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
      router.push(`/loads/${data.id}`)
    } catch (err: any) {
      console.error('Error posting job:', err)
      alert(`Error posting job: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F5F5F5', color: '#2C3E50' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px' }}>Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F5F5' }}>
      <div style={{ 
        height: '64px', 
        backgroundColor: '#FFFFFF', 
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px'
      }}>
        <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#2C3E50' }}>Post New Job</h1>
      </div>

      <main style={{ maxWidth: '1400px', padding: '24px', margin: '0 auto' }}>
        <div style={{ marginBottom: '16px' }}>
          <a href="/loads" style={{ color: '#C8A64D', fontSize: '14px', textDecoration: 'none' }}>
            ← Back to Loads
          </a>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          padding: '32px',
          border: '1px solid #E5E7EB',
          maxWidth: '800px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: '600', color: '#2C3E50' }}>Post a New Job</h2>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#2C3E50' }}>
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
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      color: '#2C3E50',
                      fontSize: '14px'
                    }}
                    placeholder="e.g., Manchester, M1"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#2C3E50' }}>
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
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      color: '#2C3E50',
                      fontSize: '14px'
                    }}
                    placeholder="e.g., London, SE1"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#2C3E50' }}>
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
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      color: '#2C3E50',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#2C3E50' }}>
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
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      color: '#2C3E50',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#2C3E50' }}>
                  Vehicle Type
                </label>
                <select
                  name="vehicle_type"
                  value={formData.vehicle_type}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    color: '#2C3E50',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select vehicle type</option>
                  <option value="Small Van">Small Van</option>
                  <option value="Medium Van">Medium Van</option>
                  <option value="Large Van">Large Van</option>
                  <option value="Luton Van">Luton Van</option>
                  <option value="7.5 Tonne">7.5 Tonne</option>
                  <option value="Sprinter">Sprinter</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#2C3E50' }}>
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
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      color: '#2C3E50',
                      fontSize: '14px'
                    }}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#2C3E50' }}>
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
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      color: '#2C3E50',
                      fontSize: '14px'
                    }}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#2C3E50' }}>
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
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      color: '#2C3E50',
                      fontSize: '14px'
                    }}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#2C3E50' }}>
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
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    color: '#2C3E50',
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
                  style={{ 
                    padding: '12px 24px',
                    backgroundColor: '#C8A64D',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.6 : 1
                  }}
                >
                  {submitting ? 'Posting...' : 'Post Job'}
                </button>
                <a 
                  href="/loads" 
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'transparent',
                    color: '#64748B',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                >
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

'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface AddDriverModalProps {
  companyId: string
  onClose: () => void
  onSuccess: () => void
}

export default function AddDriverModal({ companyId, onClose, onSuccess }: AddDriverModalProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    license_number: '',
    phone: '',
    email: '',
    status: 'active'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: insertError } = await supabase
        .from('drivers')
        .insert([{
          company_id: companyId,
          full_name: formData.full_name,
          license_number: formData.license_number || null,
          phone: formData.phone || null,
          email: formData.email || null,
          status: formData.status
        }])

      if (insertError) throw insertError

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error adding driver:', err)
      setError(err.message || 'Failed to add driver')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Driver</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="error-banner">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="full_name">Full Name *</label>
              <input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                className="form-input"
                placeholder="John Smith"
              />
            </div>

            <div className="form-group">
              <label htmlFor="license_number">License Number</label>
              <input
                id="license_number"
                type="text"
                value={formData.license_number}
                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                className="form-input"
                placeholder="ABC12345"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="form-input"
                placeholder="+44 7XXX XXXXXX"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input"
                placeholder="john@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Driver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

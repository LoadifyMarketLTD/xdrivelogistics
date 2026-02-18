'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface AddVehicleModalProps {
  companyId: string
  onClose: () => void
  onSuccess: () => void
}

export default function AddVehicleModal({ companyId, onClose, onSuccess }: AddVehicleModalProps) {
  const [formData, setFormData] = useState({
    registration: '',
    vehicle_type: '',
    make: '',
    model: '',
    is_available: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: insertError } = await supabase
        .from('vehicles')
        .insert([{
          company_id: companyId,
          registration: formData.registration,
          vehicle_type: formData.vehicle_type || null,
          make: formData.make || null,
          model: formData.model || null,
          is_available: formData.is_available
        }])

      if (insertError) throw insertError

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error adding vehicle:', err)
      setError(err.message || 'Failed to add vehicle')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Vehicle</h2>
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
              <label htmlFor="registration">Registration Number *</label>
              <input
                id="registration"
                type="text"
                value={formData.registration}
                onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                required
                className="form-input"
                placeholder="ABC 123"
              />
            </div>

            <div className="form-group">
              <label htmlFor="vehicle_type">Vehicle Type</label>
              <select
                id="vehicle_type"
                value={formData.vehicle_type}
                onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                className="form-input"
              >
                <option value="">Select type...</option>
                <option value="Moto">Moto</option>
                <option value="Car">Car</option>
                <option value="Van">Van</option>
                <option value="SWB">SWB (Short Wheel Base)</option>
                <option value="MWB">MWB (Medium Wheel Base)</option>
                <option value="LWB">LWB (Long Wheel Base)</option>
                <option value="XLWB">XLWB (Extra Long Wheel Base)</option>
                <option value="Luton Van">Luton Van</option>
                <option value="Curtain Side">Curtain Side</option>
                <option value="Lorry">Lorry</option>
                <option value="Truck">Truck</option>
                <option value="Trailer">Trailer</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="make">Make</label>
              <input
                id="make"
                type="text"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                className="form-input"
                placeholder="Mercedes, Volvo, etc."
              />
            </div>

            <div className="form-group">
              <label htmlFor="model">Model</label>
              <input
                id="model"
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="form-input"
                placeholder="Sprinter, FH16, etc."
              />
            </div>

            <div className="form-group">
              <label htmlFor="is_available">Status</label>
              <select
                id="is_available"
                value={formData.is_available ? 'available' : 'unavailable'}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.value === 'available' })}
                className="form-input"
              >
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
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
              {loading ? 'Adding...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

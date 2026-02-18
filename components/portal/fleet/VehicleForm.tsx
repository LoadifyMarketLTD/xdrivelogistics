'use client'

import { useState, useEffect } from 'react'

interface Vehicle {
  id?: string
  vehicle_type: string
  registration: string
  make: string | null
  model: string | null
  year: number | null
  capacity_kg: number | null
  notes: string | null
  is_available: boolean
}

interface VehicleFormProps {
  vehicle?: Vehicle | null
  onSave: (vehicle: Omit<Vehicle, 'id'>) => Promise<void>
  onCancel: () => void
}

export default function VehicleForm({ vehicle, onSave, onCancel }: VehicleFormProps) {
  const [formData, setFormData] = useState<Omit<Vehicle, 'id'>>({
    vehicle_type: 'Van',
    registration: '',
    make: '',
    model: '',
    year: null,
    capacity_kg: null,
    notes: '',
    is_available: true
  })
  const [saving, setSaving] = useState(false)
  
  useEffect(() => {
    if (vehicle) {
      setFormData({
        vehicle_type: vehicle.vehicle_type,
        registration: vehicle.registration,
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year,
        capacity_kg: vehicle.capacity_kg,
        notes: vehicle.notes || '',
        is_available: vehicle.is_available
      })
    }
  }, [vehicle])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.vehicle_type || !formData.registration) {
      alert('Vehicle type and registration are required')
      return
    }
    
    setSaving(true)
    try {
      const dataToSave = {
        ...formData,
        make: formData.make || null,
        model: formData.model || null,
        notes: formData.notes || null
      }
      await onSave(dataToSave)
    } finally {
      setSaving(false)
    }
  }
  
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ background: 'var(--portal-card)', borderRadius: '12px', padding: '32px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>
          {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Vehicle Type *</label>
              <select value={formData.vehicle_type} onChange={(e) => setFormData(prev => ({ ...prev, vehicle_type: e.target.value }))} className="portal-filter-input" style={{ width: '100%' }}>
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
            
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Registration *</label>
              <input type="text" value={formData.registration} onChange={(e) => setFormData(prev => ({ ...prev, registration: e.target.value }))} className="portal-filter-input" style={{ width: '100%' }} placeholder="AB12 CDE" />
            </div>
            
            <div className="portal-grid-2" style={{ gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Make</label>
                <input type="text" value={formData.make || ''} onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))} className="portal-filter-input" style={{ width: '100%' }} placeholder="Ford" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Model</label>
                <input type="text" value={formData.model || ''} onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))} className="portal-filter-input" style={{ width: '100%' }} placeholder="Transit" />
              </div>
            </div>
            
            <div className="portal-grid-2" style={{ gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Year</label>
                <input type="number" value={formData.year || ''} onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value ? parseInt(e.target.value) : null }))} className="portal-filter-input" style={{ width: '100%' }} placeholder="2020" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Capacity (kg)</label>
                <input type="number" value={formData.capacity_kg || ''} onChange={(e) => setFormData(prev => ({ ...prev, capacity_kg: e.target.value ? parseFloat(e.target.value) : null }))} className="portal-filter-input" style={{ width: '100%' }} placeholder="1000" />
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Notes</label>
              <textarea value={formData.notes || ''} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} className="portal-filter-input" style={{ width: '100%', minHeight: '80px' }} placeholder="Additional notes..." />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="is_available" checked={formData.is_available} onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.checked }))} />
              <label htmlFor="is_available" style={{ fontSize: '13px', cursor: 'pointer' }}>Available for use</label>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onCancel} className="portal-btn portal-btn-outline" disabled={saving}>Cancel</button>
            <button type="submit" className="portal-btn portal-btn-primary" disabled={saving}>{saving ? 'Saving...' : (vehicle ? 'Update' : 'Add Vehicle')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'

interface Driver {
  id?: string
  full_name: string
  phone: string | null
  email: string | null
  license_number: string | null
  notes: string | null
  is_active: boolean
}

interface DriverFormProps {
  driver?: Driver | null
  onSave: (driver: Omit<Driver, 'id'>) => Promise<void>
  onCancel: () => void
}

export default function DriverForm({ driver, onSave, onCancel }: DriverFormProps) {
  const [formData, setFormData] = useState<Omit<Driver, 'id'>>({
    full_name: '',
    phone: '',
    email: '',
    license_number: '',
    notes: '',
    is_active: true
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  useEffect(() => {
    if (driver) {
      setFormData({
        full_name: driver.full_name,
        phone: driver.phone || '',
        email: driver.email || '',
        license_number: driver.license_number || '',
        notes: driver.notes || '',
        is_active: driver.is_active
      })
    }
  }, [driver])
  
  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.full_name?.trim()) {
      newErrors.full_name = 'Name is required'
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    
    setSaving(true)
    try {
      const dataToSave = {
        ...formData,
        phone: formData.phone || null,
        email: formData.email || null,
        license_number: formData.license_number || null,
        notes: formData.notes || null
      }
      await onSave(dataToSave)
    } catch (error) {
      console.error('Error saving driver:', error)
    } finally {
      setSaving(false)
    }
  }
  
  const handleChange = (field: keyof Omit<Driver, 'id'>, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--portal-card)',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: 'var(--portal-shadow-lg)'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: 'var(--portal-text-primary)',
          marginBottom: '24px'
        }}>
          {driver ? 'Edit Driver' : 'Add New Driver'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--portal-text-primary)', marginBottom: '6px' }}>
                Full Name *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                className="portal-filter-input"
                style={{ width: '100%' }}
                placeholder="John Doe"
              />
              {errors.full_name && (
                <span style={{ fontSize: '12px', color: 'var(--portal-error)', marginTop: '4px', display: 'block' }}>
                  {errors.full_name}
                </span>
              )}
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--portal-text-primary)', marginBottom: '6px' }}>
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="portal-filter-input"
                style={{ width: '100%' }}
                placeholder="+44 7XXX XXXXXX"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--portal-text-primary)', marginBottom: '6px' }}>
                Email
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="portal-filter-input"
                style={{ width: '100%' }}
                placeholder="driver@example.com"
              />
              {errors.email && (
                <span style={{ fontSize: '12px', color: 'var(--portal-error)', marginTop: '4px', display: 'block' }}>
                  {errors.email}
                </span>
              )}
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--portal-text-primary)', marginBottom: '6px' }}>
                License Number
              </label>
              <input
                type="text"
                value={formData.license_number || ''}
                onChange={(e) => handleChange('license_number', e.target.value)}
                className="portal-filter-input"
                style={{ width: '100%' }}
                placeholder="ABC123456"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--portal-text-primary)', marginBottom: '6px' }}>
                Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="portal-filter-input"
                style={{ width: '100%', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                placeholder="Additional notes..."
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="is_active" style={{
                fontSize: '13px',
                color: 'var(--portal-text-primary)',
                cursor: 'pointer'
              }}>
                Active Driver
              </label>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '24px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onCancel}
              className="portal-btn portal-btn-outline"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="portal-btn portal-btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : (driver ? 'Update' : 'Add Driver')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

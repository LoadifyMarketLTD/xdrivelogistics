'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

interface Driver {
  id: string
  full_name: string
  license_number: string | null
  phone: string | null
  email: string | null
  status: string
  created_at: string
}

interface Vehicle {
  id: string
  registration: string
  vehicle_type: string | null
  make: string | null
  model: string | null
  status: string
  created_at: string
}

export default function DriversVehiclesPage() {
  const { companyId } = useAuth()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!companyId) return
    
    let mounted = true
    let timeoutId: NodeJS.Timeout | null = null

    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Set timeout to ensure loading always resolves
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('Drivers/Vehicles data fetch timeout - resolving loading state')
            setLoading(false)
          }
        }, 10000) // 10 second timeout
        
        // Fetch drivers
        const { data: driversData, error: driversError } = await supabase
          .from('drivers')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })
        
        if (driversError) throw driversError
        
        // Fetch vehicles
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })
        
        if (vehiclesError) throw vehiclesError
        
        if (!mounted) return
        
        setDrivers(driversData || [])
        setVehicles(vehiclesData || [])
      } catch (err: any) {
        console.error('Error fetching data:', err)
      } finally {
        if (mounted) {
          setLoading(false)
        }
        if (timeoutId) clearTimeout(timeoutId)
      }
    }

    fetchData()

    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [companyId])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
        Loading...
      </div>
    )
  }

  return (
    <div>
      <h1 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '20px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        Drivers & Vehicles
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
      }}>
        {/* Drivers Section */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}>
            <h2 style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#374151',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
            }}>
              Drivers ({drivers.length})
            </h2>
            <button
              onClick={() => window.alert('Add driver functionality coming soon')}
              style={{
                padding: '6px 12px',
                background: '#d4af37',
                color: '#ffffff',
                border: 'none',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              + Add Driver
            </button>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
          }}>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.5fr 1fr',
              gap: '8px',
              padding: '10px 12px',
              background: '#f9fafb',
              borderBottom: '1px solid #e5e7eb',
              fontSize: '11px',
              fontWeight: '700',
              color: '#6b7280',
              textTransform: 'uppercase',
            }}>
              <div>Name</div>
              <div>License</div>
              <div>Status</div>
            </div>

            {/* Table Rows */}
            {drivers.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#9ca3af',
                fontSize: '13px',
              }}>
                No drivers registered
              </div>
            ) : (
              drivers.map((driver) => (
                <div
                  key={driver.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 1fr',
                    gap: '8px',
                    padding: '10px 12px',
                    borderBottom: '1px solid #f3f4f6',
                    fontSize: '13px',
                    color: '#374151',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f9fafb'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <div style={{ fontWeight: '600' }}>{driver.full_name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {driver.license_number || '—'}
                  </div>
                  <div>
                    <span style={{
                      padding: '2px 6px',
                      background: driver.status === 'active' ? '#d1fae5' : '#f3f4f6',
                      color: driver.status === 'active' ? '#065f46' : '#6b7280',
                      fontSize: '10px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                    }}>
                      {driver.status || 'active'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Vehicles Section */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}>
            <h2 style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#374151',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
            }}>
              Vehicles ({vehicles.length})
            </h2>
            <button
              onClick={() => window.alert('Add vehicle functionality coming soon')}
              style={{
                padding: '6px 12px',
                background: '#d4af37',
                color: '#ffffff',
                border: 'none',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              + Add Vehicle
            </button>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
          }}>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 2fr 1fr',
              gap: '8px',
              padding: '10px 12px',
              background: '#f9fafb',
              borderBottom: '1px solid #e5e7eb',
              fontSize: '11px',
              fontWeight: '700',
              color: '#6b7280',
              textTransform: 'uppercase',
            }}>
              <div>Registration</div>
              <div>Type / Model</div>
              <div>Status</div>
            </div>

            {/* Table Rows */}
            {vehicles.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#9ca3af',
                fontSize: '13px',
              }}>
                No vehicles registered
              </div>
            ) : (
              vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 2fr 1fr',
                    gap: '8px',
                    padding: '10px 12px',
                    borderBottom: '1px solid #f3f4f6',
                    fontSize: '13px',
                    color: '#374151',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f9fafb'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <div style={{ fontWeight: '600' }}>
                    {vehicle.registration}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {vehicle.vehicle_type || vehicle.make || '—'}
                    {vehicle.model && ` ${vehicle.model}`}
                  </div>
                  <div>
                    <span style={{
                      padding: '2px 6px',
                      background: vehicle.status === 'active' ? '#d1fae5' : '#f3f4f6',
                      color: vehicle.status === 'active' ? '#065f46' : '#6b7280',
                      fontSize: '10px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                    }}>
                      {vehicle.status || 'active'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import '@/styles/portal.css'

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

    const fetchData = async () => {
      try {
        setLoading(true)
        
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
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [companyId])

  if (loading) {
    return (
      <div className="loading-screen">
        Loading...
      </div>
    )
  }

  return (
    <div className="portal-layout">
      <div className="portal-header">
        <h1 className="portal-title">Drivers & Vehicles</h1>
      </div>

      <div className="portal-main">
        <div className="two-column-grid">
          {/* Drivers Section */}
          <div>
            <div className="section-header">
              <h2>Drivers ({drivers.length})</h2>
              <button
                onClick={() => window.alert('Add driver functionality coming soon')}
                className="btn-primary"
              >
                + Add Driver
              </button>
            </div>

            <div className="portal-card">
              <div className="table-container">
                <div className="table-header drivers-grid">
                  <div>Name</div>
                  <div>License</div>
                  <div>Status</div>
                </div>

                {drivers.length === 0 ? (
                  <div className="empty-state">
                    No drivers registered
                  </div>
                ) : (
                  drivers.map((driver) => (
                    <div
                      key={driver.id}
                      className="table-row drivers-grid"
                    >
                      <div className="cell-primary">{driver.full_name}</div>
                      <div className="cell-secondary">
                        {driver.license_number || '—'}
                      </div>
                      <div>
                        <span className={`status-badge ${driver.status === 'active' ? 'completed' : 'pending'}`}>
                          {driver.status || 'active'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Vehicles Section */}
          <div>
            <div className="section-header">
              <h2>Vehicles ({vehicles.length})</h2>
              <button
                onClick={() => window.alert('Add vehicle functionality coming soon')}
                className="btn-primary"
              >
                + Add Vehicle
              </button>
            </div>

            <div className="portal-card">
              <div className="table-container">
                <div className="table-header vehicles-grid">
                  <div>Registration</div>
                  <div>Type / Model</div>
                  <div>Status</div>
                </div>

                {vehicles.length === 0 ? (
                  <div className="empty-state">
                    No vehicles registered
                  </div>
                ) : (
                  vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="table-row vehicles-grid"
                    >
                      <div className="cell-primary">
                        {vehicle.registration}
                      </div>
                      <div className="cell-secondary">
                        {vehicle.vehicle_type || vehicle.make || '—'}
                        {vehicle.model && ` ${vehicle.model}`}
                      </div>
                      <div>
                        <span className={`status-badge ${vehicle.status === 'active' ? 'completed' : 'pending'}`}>
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
      </div>
    </div>
  )
}

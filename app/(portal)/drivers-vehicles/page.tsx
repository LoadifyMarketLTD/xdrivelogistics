'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import AddDriverModal from '@/components/modals/AddDriverModal'
import AddVehicleModal from '@/components/modals/AddVehicleModal'
import ResponsiveContainer from '@/components/layout/ResponsiveContainer'
import ResponsiveGrid from '@/components/layout/ResponsiveGrid'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

interface Driver {
  id: string
  full_name: string
  license_number: string | null
  phone: string | null
  email: string | null
  is_active: boolean
  created_at: string
}

interface Vehicle {
  id: string
  registration: string
  vehicle_type: string | null
  make: string | null
  model: string | null
  is_available: boolean
  created_at: string
}

export default function DriversVehiclesPage() {
  const { companyId } = useAuth()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDriver, setShowAddDriver] = useState(false)
  const [showAddVehicle, setShowAddVehicle] = useState(false)

  const fetchData = async () => {
    if (!companyId) return
    
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
      
      setDrivers(driversData || [])
      setVehicles(vehiclesData || [])
    } catch (err: any) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [companyId])

  if (loading) {
    return (
      <div className="loading-screen">
        Loading...
      </div>
    )
  }

  return (
    <ResponsiveContainer maxWidth="xl">
      <div className="portal-layout">
        <div className="portal-header">
          <h1 className="portal-title">Drivers & Vehicles</h1>
        </div>

        <div className="portal-main">
          <ResponsiveGrid columns={{ mobile: 1, tablet: 1, desktop: 2, wide: 2, ultrawide: 2 }}>
            {/* Drivers Section */}
            <div>
            <div className="section-header">
              <h2>Drivers ({drivers.length})</h2>
              <button
                onClick={() => setShowAddDriver(true)}
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
                        <span className={`status-badge ${driver.is_active ? 'completed' : 'pending'}`}>
                          {driver.is_active ? 'Active' : 'Inactive'}
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
                onClick={() => setShowAddVehicle(true)}
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
                        <span className={`status-badge ${vehicle.is_available ? 'completed' : 'pending'}`}>
                          {vehicle.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </ResponsiveGrid>
      </div>

      {/* Modals */}
      {showAddDriver && companyId && (
        <AddDriverModal
          companyId={companyId}
          onClose={() => setShowAddDriver(false)}
          onSuccess={() => {
            fetchData()
            setShowAddDriver(false)
          }}
        />
      )}

      {showAddVehicle && companyId && (
        <AddVehicleModal
          companyId={companyId}
          onClose={() => setShowAddVehicle(false)}
          onSuccess={() => {
            fetchData()
            setShowAddVehicle(false)
          }}
        />
      )}
      </div>
    </ResponsiveContainer>
  )
}

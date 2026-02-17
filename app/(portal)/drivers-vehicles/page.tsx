'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/lib/AuthContext'
import Panel from '@/components/portal/Panel'
import StatCard from '@/components/portal/StatCard'
import DriversTable from '@/components/portal/drivers/DriversTable'
import DriverForm from '@/components/portal/drivers/DriverForm'
import DriversFilters from '@/components/portal/drivers/DriversFilters'

export const dynamic = 'force-dynamic'

interface Driver {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  license_number: string | null
  notes: string | null
  is_active: boolean
  created_at: string
}

export default function DriversVehiclesPage() {
  const { companyId } = useAuth()
  const supabase = useMemo(() => createClientComponentClient(), [])
  
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  
  const fetchDrivers = async () => {
    if (!companyId) return
    
    try {
      setLoading(true)
      
      const { data, error: fetchError } = await supabase
        .from('drivers')
        .select('*')
        .eq('company_id', companyId)
        .order('full_name', { ascending: true })
      
      if (fetchError) throw fetchError
      
      setDrivers(data || [])
      setError(null)
    } catch (err: any) {
      console.error('Error fetching drivers:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchDrivers()
  }, [companyId, supabase])
  
  const handleSave = async (driverData: Omit<Driver, 'id' | 'created_at'>) => {
    if (!companyId) return
    
    try {
      if (editingDriver) {
        const { error: updateError } = await supabase
          .from('drivers')
          .update(driverData)
          .eq('id', editingDriver.id)
        
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('drivers')
          .insert([{ ...driverData, company_id: companyId }])
        
        if (insertError) throw insertError
      }
      
      await fetchDrivers()
      setShowForm(false)
      setEditingDriver(null)
    } catch (err: any) {
      console.error('Error saving driver:', err)
      alert('Failed to save driver: ' + err.message)
      throw err
    }
  }
  
  const handleDelete = async (driverId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('drivers')
        .delete()
        .eq('id', driverId)
      
      if (deleteError) throw deleteError
      
      await fetchDrivers()
    } catch (err: any) {
      console.error('Error deleting driver:', err)
      alert('Failed to delete driver: ' + err.message)
    }
  }
  
  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver)
    setShowForm(true)
  }
  
  const handleAdd = () => {
    setEditingDriver(null)
    setShowForm(true)
  }
  
  const filteredDrivers = useMemo(() => {
    return drivers.filter(driver => {
      if (activeFilter === 'active' && !driver.is_active) return false
      if (activeFilter === 'inactive' && driver.is_active) return false
      
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        if (!driver.full_name.toLowerCase().includes(search)) return false
      }
      
      return true
    })
  }, [drivers, activeFilter, searchTerm])
  
  const stats = useMemo(() => {
    const total = drivers.length
    const active = drivers.filter(d => d.is_active).length
    return { total, active }
  }, [drivers])
  
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '16px', color: 'var(--portal-text-secondary)' }}>
          Loading drivers...
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div>
        <Panel title="Drivers & Vehicles" subtitle="Manage your team">
          <div style={{ 
            padding: '40px', 
            textAlign: 'center',
            color: 'var(--portal-error)'
          }}>
            <p style={{ fontSize: '16px', marginBottom: '12px' }}>Error loading drivers</p>
            <p style={{ fontSize: '14px' }}>{error}</p>
            <p style={{ fontSize: '12px', marginTop: '12px', color: 'var(--portal-text-muted)' }}>
              Note: Run the drivers migration SQL in Supabase if the table doesn't exist.
            </p>
          </div>
        </Panel>
      </div>
    )
  }
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {drivers.length > 0 && (
        <div className="portal-grid-2">
          <StatCard 
            label="Total Drivers" 
            value={stats.total}
            change={`${stats.active} active`}
            trend="up"
          />
          <StatCard 
            label="Active Drivers" 
            value={stats.active}
            change={`${((stats.active / stats.total) * 100).toFixed(0)}% of total`}
            trend={stats.active > 0 ? 'up' : 'neutral'}
          />
        </div>
      )}
      
      <Panel 
        title="Drivers" 
        subtitle={`${filteredDrivers.length} ${filteredDrivers.length === 1 ? 'driver' : 'drivers'} found`}
        action={
          <button
            onClick={handleAdd}
            className="portal-btn portal-btn-primary"
            style={{ fontSize: '13px' }}
          >
            + Add Driver
          </button>
        }
      >
        {drivers.length > 0 && (
          <DriversFilters 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            activeFilter={activeFilter}
            onActiveChange={setActiveFilter}
          />
        )}
        
        <DriversTable 
          drivers={filteredDrivers}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Panel>
      
      {showForm && (
        <DriverForm 
          driver={editingDriver}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingDriver(null)
          }}
        />
      )}
    </div>
  )
}

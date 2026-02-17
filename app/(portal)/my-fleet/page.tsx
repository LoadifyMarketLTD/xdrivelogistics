'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/AuthContext'
import Panel from '@/components/portal/Panel'
import StatCard from '@/components/portal/StatCard'
import VehiclesTable from '@/components/portal/fleet/VehiclesTable'
import VehicleForm from '@/components/portal/fleet/VehicleForm'

export const dynamic = 'force-dynamic'

interface Vehicle {
  id: string
  vehicle_type: string
  registration: string
  make: string | null
  model: string | null
  year: number | null
  capacity_kg: number | null
  notes: string | null
  is_available: boolean
  created_at: string
}

export default function MyFleetPage() {
  const { companyId } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  
  const fetchVehicles = async () => {
    if (!companyId) return
    
    let timeoutId: NodeJS.Timeout | null = null
    
    try {
      setLoading(true)
      
      // Set timeout to ensure loading always resolves
      timeoutId = setTimeout(() => {
        console.warn('My Fleet data fetch timeout - resolving loading state')
        setLoading(false)
      }, 10000) // 10 second timeout
      
      const { data, error } = await supabase.from('vehicles').select('*').eq('company_id', companyId).order('vehicle_type', { ascending: true })
      if (error) throw error
      setVehicles(data || [])
    } catch (err: any) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }
  
  useEffect(() => { 
    if (!companyId) return
    fetchVehicles() 
  }, [companyId])
  
  const handleSave = async (data: any) => {
    if (!companyId) return
    try {
      if (editingVehicle) {
        await supabase.from('vehicles').update(data).eq('id', editingVehicle.id)
      } else {
        await supabase.from('vehicles').insert([{ ...data, company_id: companyId }])
      }
      await fetchVehicles()
      setShowForm(false)
      setEditingVehicle(null)
    } catch (err: any) {
      alert('Error: ' + err.message)
      throw err
    }
  }
  
  const handleDelete = async (id: string) => {
    try {
      await supabase.from('vehicles').delete().eq('id', id)
      await fetchVehicles()
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }
  
  const stats = useMemo(() => ({
    total: vehicles.length,
    available: vehicles.filter(v => v.is_available).length
  }), [vehicles])
  
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {vehicles.length > 0 && (
        <div className="portal-grid-2">
          <StatCard label="Total Vehicles" value={stats.total} />
          <StatCard label="Available" value={stats.available} change={`${((stats.available/stats.total)*100).toFixed(0)}% available`} />
        </div>
      )}
      
      <Panel title="Fleet Vehicles" subtitle={`${vehicles.length} vehicles`} action={
        <button onClick={() => { setEditingVehicle(null); setShowForm(true) }} className="portal-btn portal-btn-primary" style={{ fontSize: '13px' }}>+ Add Vehicle</button>
      }>
        <VehiclesTable vehicles={vehicles} onEdit={(v) => { setEditingVehicle(v); setShowForm(true) }} onDelete={handleDelete} />
      </Panel>
      
      {showForm && <VehicleForm vehicle={editingVehicle} onSave={handleSave} onCancel={() => { setShowForm(false); setEditingVehicle(null) }} />}
    </div>
  )
}

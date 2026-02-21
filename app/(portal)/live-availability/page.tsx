'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/AuthContext'
import Panel from '@/components/portal/Panel'
import StatusPill from '@/components/portal/StatusPill'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

export default function LiveAvailabilityPage() {
  const { companyId } = useAuth()
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (!companyId) return
    
    let mounted = true
    
    const fetch = async () => {
      try {
        const { data, error } = await supabase.from('vehicles').select('*').eq('company_id', companyId).eq('is_available', true)
        if (error) throw error
        if (!mounted) return
        setVehicles(data || [])
      } catch (e) {
        console.error('Error fetching available vehicles:', e)
      } finally { 
        setLoading(false) 
      }
    }
    fetch()
    
    return () => {
      mounted = false
    }
  }, [companyId])
  
  if (loading) return <div className="loading-screen"><div>Loading...</div></div>
  
  return (
    <div className="portal-layout">
      <div className="portal-header">
        <h1 className="portal-title">Live Availability</h1>
        <p className="page-description">{vehicles.length} available vehicles</p>
      </div>

      <div className="portal-main">
        <Panel title="Live Availability" subtitle={`${vehicles.length} available vehicles`}>
          {vehicles.length === 0 ? (
            <div className="portal-card">
              <div className="section-header">🔴</div>
              <p>No available vehicles</p>
            </div>
          ) : (
            <div className="portal-grid-3">
              {vehicles.map(v => (
                <div key={v.id} className="portal-card">
                  <h3 className="section-header">{v.vehicle_type}</h3>
                  <p className="page-description">{v.registration}</p>
                  {v.make && v.model && <p>{v.make} {v.model}</p>}
                  {v.capacity_kg && <p>Capacity: {v.capacity_kg} kg</p>}
                  <StatusPill status="Available" variant="success" />
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}

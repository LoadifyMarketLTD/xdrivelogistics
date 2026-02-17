'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/lib/AuthContext'
import Panel from '@/components/portal/Panel'
import StatusPill from '@/components/portal/StatusPill'

export const dynamic = 'force-dynamic'

export default function LiveAvailabilityPage() {
  const { companyId } = useAuth()
  const supabase = useMemo(() => createClientComponentClient(), [])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (!companyId) return
    const fetch = async () => {
      try {
        const { data, error } = await supabase.from('vehicles').select('*').eq('company_id', companyId).eq('is_available', true)
        if (error) throw error
        setVehicles(data || [])
      } catch (e) {
        console.error('Error fetching available vehicles:', e)
      } finally { 
        setLoading(false) 
      }
    }
    fetch()
  }, [companyId, supabase])
  
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
  
  return (
    <Panel title="Live Availability" subtitle={`${vehicles.length} available vehicles`}>
      {vehicles.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔴</div>
          <p>No available vehicles</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {vehicles.map(v => (
            <div key={v.id} className="portal-panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{v.vehicle_type}</h3>
              <div style={{ fontSize: '14px', color: 'var(--portal-text-secondary)', marginBottom: '12px' }}>{v.registration}</div>
              {v.make && v.model && <div style={{ fontSize: '13px', marginBottom: '8px' }}>{v.make} {v.model}</div>}
              {v.capacity_kg && <div style={{ fontSize: '13px', marginBottom: '8px' }}>Capacity: {v.capacity_kg} kg</div>}
              <StatusPill status="Available" variant="success" />
            </div>
          ))}
        </div>
      )}
    </Panel>
  )
}

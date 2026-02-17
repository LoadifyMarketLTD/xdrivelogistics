'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Panel from '@/components/portal/Panel'

export const dynamic = 'force-dynamic'

export default function ReturnJourneysPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    let mounted = true
    
    const fetch = async () => {
      try {
        setLoading(true)
        
        const { data } = await supabase.from('jobs').select('*').eq('status', 'completed').order('created_at', { ascending: false }).limit(10)
        
        if (!mounted) return
        
        setJobs(data || [])
      } catch (e) {
        console.error('Error fetching return journeys:', e)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    fetch()
    
    return () => {
      mounted = false
    }
  }, [])
  
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
  
  return (
    <Panel title="Return Journeys" subtitle="Optimize empty return trips">
      {jobs.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
          <p>No completed journeys available</p>
          <p style={{ fontSize: '14px', color: 'var(--portal-text-muted)', marginTop: '8px' }}>
            Return journey suggestions will appear here after deliveries are completed
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {jobs.map(job => (
            <div key={job.id} style={{ padding: '16px', background: 'var(--portal-bg-secondary)', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <div style={{ fontWeight: '500', marginBottom: '4px' }}>Return: {job.delivery_location} → {job.pickup_location}</div>
                  <div style={{ fontSize: '13px', color: 'var(--portal-text-secondary)' }}>
                    Potential savings: {((job.budget || 0) * 0.4).toFixed(0)} GBP
                  </div>
                </div>
                <button className="portal-btn portal-btn-outline" style={{ padding: '4px 12px', fontSize: '12px' }}>
                  View Route
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  )
}

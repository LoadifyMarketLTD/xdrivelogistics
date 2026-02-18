'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Panel from '@/components/portal/Panel'
import '@/styles/portal.css'

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
  
  if (loading) return <div className="loading-screen"><div>Loading...</div></div>
  
  return (
    <div className="portal-layout">
      <div className="portal-header">
        <h1 className="portal-title">Return Journeys</h1>
        <p className="page-description">Optimize empty return trips</p>
      </div>

      <div className="portal-main">
        <Panel title="Return Journeys" subtitle="Optimize empty return trips">
          {jobs.length === 0 ? (
            <div className="portal-card">
              <div className="section-header">🔄</div>
              <p>No completed journeys available</p>
              <p className="page-description">
                Return journey suggestions will appear here after deliveries are completed
              </p>
            </div>
          ) : (
            <div className="portal-list">
              {jobs.map(job => (
                <div key={job.id} className="portal-card">
                  <div className="portal-card-header">
                    <div>
                      <h3 className="section-header">Return: {job.delivery_location} → {job.pickup_location}</h3>
                      <p className="page-description">
                        Potential savings: {((job.budget || 0) * 0.4).toFixed(0)} GBP
                      </p>
                    </div>
                    <button className="btn-secondary">
                      View Route
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}

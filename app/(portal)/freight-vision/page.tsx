'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/AuthContext'
import Panel from '@/components/portal/Panel'
import StatCard from '@/components/portal/StatCard'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

export default function FreightVisionPage() {
  const { companyId } = useAuth()
  const [stats, setStats] = useState({ totalJobs: 0, completedJobs: 0, totalRevenue: 0, activeBids: 0 })
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (!companyId) return
    
    let mounted = true
    
    const fetch = async () => {
      try {
        setLoading(true)
        
        const { data: jobs } = await supabase.from('jobs').select('*').eq('posted_by_company_id', companyId)
        const { data: bids } = await supabase.from('job_bids').select('*').eq('bidder_company_id', companyId)
        
        if (!mounted) return
        
        setStats({
          totalJobs: jobs?.length || 0,
          completedJobs: jobs?.filter(j => j.status === 'completed').length || 0,
          totalRevenue: jobs?.reduce((sum, j) => sum + (j.budget || 0), 0) || 0,
          activeBids: bids?.filter(b => b.status === 'submitted').length || 0
        })
      } catch (e) {
        console.error('Error fetching freight vision data:', e)
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
  }, [companyId])
  
  if (loading) return <div className="loading-screen"><div>Loading...</div></div>
  
  return (
    <div className="portal-layout">
      <div className="portal-header">
        <h1 className="portal-title">Freight Vision</h1>
        <p className="page-description">Performance metrics and analytics</p>
      </div>

      <div className="portal-main">
        <div className="portal-grid-2">
          <StatCard label="Total Jobs Posted" value={stats.totalJobs} change={`${stats.completedJobs} completed`} />
          <StatCard label="Total Revenue" value={`£${(stats.totalRevenue/1000).toFixed(1)}k`} />
        </div>
        
        <div className="portal-grid-2">
          <StatCard label="Active Bids" value={stats.activeBids} />
          <StatCard label="Completion Rate" value={`${stats.totalJobs > 0 ? ((stats.completedJobs/stats.totalJobs)*100).toFixed(0) : 0}%`} />
        </div>
        
        <Panel title="Analytics Overview" subtitle="Performance metrics and insights">
          <div className="portal-card">
            <div className="section-header">📊</div>
            <p>Advanced Analytics</p>
            <p className="page-description">Detailed charts and visualizations coming soon</p>
          </div>
        </Panel>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/AuthContext'
import Panel from '@/components/portal/Panel'
import StatCard from '@/components/portal/StatCard'
import ResponsiveContainer from '@/components/layout/ResponsiveContainer'
import ResponsiveGrid from '@/components/layout/ResponsiveGrid'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

export default function FreightVisionPage() {
  const { companyId, user } = useAuth()
  const [stats, setStats] = useState({ totalJobs: 0, completedJobs: 0, totalRevenue: 0, activeBids: 0 })
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (!companyId) return
    
    let mounted = true
    
    const fetch = async () => {
      try {
        setLoading(true)
        
        const { data: jobs } = await supabase.from('jobs').select('*').eq('posted_by_company_id', companyId)
        const { data: bids } = await supabase.from('job_bids').select('*').eq('bidder_id', user?.id)
        
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
    <ResponsiveContainer maxWidth="xl">
      <div style={{ marginBottom: 'clamp(24px, 3vw, 32px)' }}>
        <h1 style={{
          fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Freight Vision
        </h1>
        <p style={{
          fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
          color: '#6b7280',
        }}>
          Performance metrics and analytics
        </p>
      </div>

      <div style={{ marginBottom: 'clamp(24px, 3vw, 32px)' }}>
        <ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 4, wide: 4, ultrawide: 4 }}>
          <StatCard label="Total Jobs Posted" value={stats.totalJobs} change={`${stats.completedJobs} completed`} />
          <StatCard label="Active Bids" value={stats.activeBids} />
          <StatCard label="Completion Rate" value={`${stats.totalJobs > 0 ? ((stats.completedJobs/stats.totalJobs)*100).toFixed(0) : 0}%`} />
          <StatCard label="Total Revenue" value={`£${(stats.totalRevenue/1000).toFixed(1)}k`} />
        </ResponsiveGrid>
      </div>
      
      <Panel title="Analytics Overview" subtitle="Performance metrics and insights">
        <div style={{
          padding: 'clamp(24px, 3vw, 32px)',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            marginBottom: '16px',
          }}>
            📊
          </div>
          <h3 style={{
            fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '8px',
          }}>
            Advanced Analytics
          </h3>
          <p style={{
            fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
            color: '#6b7280',
          }}>
            Detailed charts and visualizations coming soon
          </p>
        </div>
      </Panel>
    </ResponsiveContainer>
  )
}

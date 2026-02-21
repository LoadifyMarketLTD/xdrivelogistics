'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/AuthContext'
import Panel from '@/components/portal/Panel'
import StatCard from '@/components/portal/StatCard'
import ResponsiveContainer from '@/components/layout/ResponsiveContainer'
import ResponsiveGrid from '@/components/layout/ResponsiveGrid'
import dynamic from 'next/dynamic'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

// Dynamically import recharts to avoid SSR issues
const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false })
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false })
const LineChart = dynamic(() => import('recharts').then(m => m.LineChart), { ssr: false })
const Line = dynamic(() => import('recharts').then(m => m.Line), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false })
const Legend = dynamic(() => import('recharts').then(m => m.Legend), { ssr: false })
const RechartResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false })

interface JobRow {
  id: string
  status: string
  budget: number | null
  created_at: string
}

export default function FreightVisionPage() {
  const { companyId, user } = useAuth()
  const [jobs, setJobs] = useState<JobRow[]>([])
  const [activeBids, setActiveBids] = useState(0)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (!companyId) return
    let mounted = true
    const fetchData = async () => {
      try {
        setLoading(true)
        const [{ data: jobsData }, { data: bidsData }] = await Promise.all([
          supabase.from('jobs').select('id,status,budget,created_at').eq('posted_by_company_id', companyId),
          supabase.from('job_bids').select('id,status').eq('bidder_id', user?.id ?? ''),
        ])
        if (!mounted) return
        setJobs(jobsData || [])
        setActiveBids(bidsData?.filter(b => b.status === 'submitted').length || 0)
      } catch (e) {
        console.error('Error fetching freight vision data:', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [companyId, user?.id])

  // Build last-6-months chart data
  const monthlyData = (() => {
    const result: Record<string, { month: string; jobs: number; revenue: number; completed: number }> = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
      result[key] = { month: label, jobs: 0, revenue: 0, completed: 0 }
    }
    jobs.forEach(j => {
      if (!j.created_at || typeof j.created_at !== 'string') return
      const key = j.created_at.slice(0, 7)
      if (result[key]) {
        result[key].jobs++
        result[key].revenue += j.budget || 0
        if (j.status === 'completed') result[key].completed++
      }
    })
    return Object.values(result)
  })()

  const statusData = [
    { name: 'Open', value: jobs.filter(j => j.status === 'open').length, fill: '#3b82f6' },
    { name: 'Assigned', value: jobs.filter(j => j.status === 'assigned').length, fill: '#f59e0b' },
    { name: 'In Progress', value: jobs.filter(j => j.status === 'in_progress').length, fill: '#8b5cf6' },
    { name: 'Completed', value: jobs.filter(j => j.status === 'completed').length, fill: '#16A34A' },
    { name: 'Cancelled', value: jobs.filter(j => j.status === 'cancelled').length, fill: '#ef4444' },
  ].filter(d => d.value > 0)

  const totalJobs = jobs.length
  const completedJobs = jobs.filter(j => j.status === 'completed').length
  const totalRevenue = jobs.reduce((sum, j) => sum + (j.budget || 0), 0)

  if (loading) return <div className="loading-screen"><div>Loading...</div></div>
  
  return (
    <ResponsiveContainer maxWidth="xl">
      <div style={{ marginBottom: 'clamp(24px, 3vw, 32px)' }}>
        <h1 style={{
          fontSize: 'clamp(1.25rem, 2vw, 1.75rem)', fontWeight: '700', color: '#1f2937',
          marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px',
        }}>
          Freight Vision
        </h1>
        <p style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1rem)', color: '#6b7280' }}>
          Performance metrics and analytics
        </p>
      </div>

      <div style={{ marginBottom: 'clamp(24px, 3vw, 32px)' }}>
        <ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 4, wide: 4, ultrawide: 4 }}>
          <StatCard label="Total Jobs Posted" value={totalJobs} change={`${completedJobs} completed`} />
          <StatCard label="Active Bids" value={activeBids} />
          <StatCard label="Completion Rate" value={`${totalJobs > 0 ? ((completedJobs / totalJobs) * 100).toFixed(0) : 0}%`} />
          <StatCard label="Total Revenue" value={`£${(totalRevenue / 1000).toFixed(1)}k`} />
        </ResponsiveGrid>
      </div>
      
      {/* Jobs Over Time Chart */}
      <Panel title="Jobs Over Time" subtitle="Monthly job volume (last 6 months)">
        <div style={{ padding: '24px' }}>
          {totalJobs === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              No job data available yet. Post your first job to see analytics.
            </div>
          ) : (
            <RechartResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 13 }} />
                <Legend />
                <Bar dataKey="jobs" name="Total Jobs" fill="#0A2239" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#16A34A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </RechartResponsiveContainer>
          )}
        </div>
      </Panel>

      {/* Revenue Chart */}
      <div style={{ marginTop: '24px' }}>
        <Panel title="Revenue Trend" subtitle="Monthly revenue from posted jobs (last 6 months)">
          <div style={{ padding: '24px' }}>
            {totalRevenue === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                No revenue data available yet.
              </div>
            ) : (
              <RechartResponsiveContainer width="100%" height={260}>
                <LineChart data={monthlyData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={v => `£${v}`} />
                  <Tooltip contentStyle={{ fontSize: 13 }} formatter={(v: number) => [`£${v.toFixed(0)}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" name="Revenue (£)" stroke="#D4AF37" strokeWidth={2} dot={{ fill: '#D4AF37', r: 4 }} />
                </LineChart>
              </RechartResponsiveContainer>
            )}
          </div>
        </Panel>
      </div>

      {/* Job Status Breakdown */}
      {statusData.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <Panel title="Job Status Breakdown" subtitle="Current distribution of job statuses">
            <div style={{ padding: '24px' }}>
              <RechartResponsiveContainer width="100%" height={220}>
                <BarChart data={statusData} layout="vertical" margin={{ top: 0, right: 16, left: 16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} width={80} />
                  <Tooltip contentStyle={{ fontSize: 13 }} />
                  <Bar dataKey="value" name="Jobs" radius={[0, 4, 4, 0]}
                    fill="#0A2239"
                  />
                </BarChart>
              </RechartResponsiveContainer>
            </div>
          </Panel>
        </div>
      )}
    </ResponsiveContainer>
  )
}





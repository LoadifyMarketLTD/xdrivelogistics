'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/AuthContext'
import Panel from '@/components/portal/Panel'
import StatCard from '@/components/portal/StatCard'
import ResponsiveContainer from '@/components/layout/ResponsiveContainer'
import ResponsiveGrid from '@/components/layout/ResponsiveGrid'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer as RCResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend
} from 'recharts'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

interface MonthStat { month: string; jobs: number; revenue: number; completed: number }

function groupByMonth(jobs: { created_at: string; budget?: number; status?: string }[]): MonthStat[] {
  const map: Record<string, MonthStat> = {}
  for (const job of jobs) {
    const d = new Date(job.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleString('default', { month: 'short', year: '2-digit' })
    if (!map[key]) map[key] = { month: label, jobs: 0, revenue: 0, completed: 0 }
    map[key].jobs++
    map[key].revenue += job.budget ?? 0
    if (job.status === 'completed') map[key].completed++
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([, v]) => v)
}

export default function FreightVisionPage() {
  const { companyId, user } = useAuth()
  const [stats, setStats] = useState({ totalJobs: 0, completedJobs: 0, totalRevenue: 0, activeBids: 0 })
  const [chartData, setChartData] = useState<MonthStat[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (!companyId) return
    
    let mounted = true
    
    const load = async () => {
      try {
        setLoading(true)
        
        const { data: jobs } = await supabase
          .from('jobs')
          .select('id, status, budget, created_at')
          .eq('posted_by_company_id', companyId)
        const { data: bids } = await supabase
          .from('job_bids')
          .select('id, status')
          .eq('bidder_id', user?.id)
        
        if (!mounted) return
        
        setStats({
          totalJobs: jobs?.length || 0,
          completedJobs: jobs?.filter(j => j.status === 'completed').length || 0,
          totalRevenue: jobs?.reduce((sum, j) => sum + (j.budget || 0), 0) || 0,
          activeBids: bids?.filter(b => b.status === 'submitted').length || 0
        })
        setChartData(groupByMonth(jobs || []))
      } catch (e) {
        console.error('Error fetching freight vision data:', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    
    return () => { mounted = false }
  }, [companyId, user?.id])
  
  if (loading) return <div className="loading-screen"><div>Loading…</div></div>
  
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
        <p style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1rem)', color: '#6b7280' }}>
          Performance metrics and analytics
        </p>
      </div>

      {/* KPI cards */}
      <div style={{ marginBottom: 'clamp(24px, 3vw, 32px)' }}>
        <ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 4, wide: 4, ultrawide: 4 }}>
          <StatCard label="Total Jobs Posted" value={stats.totalJobs} change={`${stats.completedJobs} completed`} />
          <StatCard label="Active Bids" value={stats.activeBids} />
          <StatCard label="Completion Rate" value={`${stats.totalJobs > 0 ? ((stats.completedJobs / stats.totalJobs) * 100).toFixed(0) : 0}%`} />
          <StatCard label="Total Revenue" value={`£${(stats.totalRevenue / 1000).toFixed(1)}k`} />
        </ResponsiveGrid>
      </div>

      {chartData.length === 0 ? (
        <Panel title="Analytics Overview" subtitle="No job data yet">
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            Post your first job to start seeing analytics.
          </div>
        </Panel>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Jobs per month bar chart */}
          <Panel title="Jobs per Month" subtitle="Last 6 months">
            <div style={{ padding: '16px', height: '260px' }}>
              <RCResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="jobs" name="Jobs" fill="#C8A64D" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </RCResponsiveContainer>
            </div>
          </Panel>

          {/* Revenue trend line chart */}
          <Panel title="Revenue Trend" subtitle="Last 6 months (£)">
            <div style={{ padding: '16px', height: '260px' }}>
              <RCResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `£${v}`} />
                  <Tooltip formatter={(v: number) => [`£${v.toFixed(0)}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#1B63C6" strokeWidth={2} dot={{ r: 4 }} />
                  <Legend />
                </LineChart>
              </RCResponsiveContainer>
            </div>
          </Panel>
        </div>
      )}
    </ResponsiveContainer>
  )
}


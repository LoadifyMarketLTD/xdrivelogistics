'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/lib/AuthContext'
import Panel from '@/components/portal/Panel'
import StatCard from '@/components/portal/StatCard'
import TileList from '@/components/portal/TileList'
import ActivityList from '@/components/portal/ActivityList'
import CompliancePanel from '@/components/portal/CompliancePanel'

export const dynamic = 'force-dynamic'

interface DashboardStats {
  totalLoads: number
  activeDrivers: number
  totalRevenue: number
  completedLoads: number
}

interface Activity {
  id: string
  route: string
  vehicle: string
  pickup: string
  delivery: string
  status: string
  statusVariant: 'success' | 'warning' | 'info' | 'error'
}

export default function DashboardPage() {
  const { companyId } = useAuth()
  const supabase = useMemo(() => createClientComponentClient(), [])
  
  const [stats, setStats] = useState<DashboardStats>({
    totalLoads: 0,
    activeDrivers: 0,
    totalRevenue: 0,
    completedLoads: 0
  })
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (!companyId) return
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch jobs stats
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('posted_by_company_id', companyId)
        
        if (jobsError) throw jobsError
        
        // Fetch drivers count (placeholder - using jobs as proxy for now)
        const activeDrivers = 12 // Placeholder
        
        // Calculate stats
        const totalLoads = jobs?.length || 0
        const completedLoads = jobs?.filter(j => j.status === 'completed' || j.status === 'delivered').length || 0
        const totalRevenue = jobs?.reduce((sum, j) => sum + (j.budget || 0), 0) || 0
        
        setStats({
          totalLoads,
          activeDrivers,
          totalRevenue,
          completedLoads
        })
        
        // Transform jobs to activities
        const recentJobs = jobs?.slice(0, 10) || []
        const activityData: Activity[] = recentJobs.map(job => {
          let statusVariant: 'success' | 'warning' | 'info' | 'error' = 'info'
          let statusText = job.status || 'pending'
          
          if (job.status === 'completed' || job.status === 'delivered') {
            statusVariant = 'success'
            statusText = 'Delivered'
          } else if (job.status === 'in-transit' || job.status === 'assigned') {
            statusVariant = 'warning'
            statusText = 'In Transit'
          } else if (job.status === 'open') {
            statusVariant = 'info'
            statusText = 'Open'
          } else if (job.status === 'cancelled') {
            statusVariant = 'error'
            statusText = 'Cancelled'
          }
          
          return {
            id: job.id.substring(0, 8),
            route: `${job.pickup_location || 'N/A'} → ${job.delivery_location || 'N/A'}`,
            vehicle: job.vehicle_type || 'Van',
            pickup: job.pickup_datetime ? new Date(job.pickup_datetime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'TBD',
            delivery: job.delivery_datetime ? new Date(job.delivery_datetime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'TBD',
            status: statusText,
            statusVariant
          }
        })
        
        setActivities(activityData)
        
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [companyId, supabase])
  
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '16px', color: 'var(--portal-text-secondary)' }}>
          Loading dashboard data...
        </div>
      </div>
    )
  }
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Reports & Statistics */}
      <Panel title="Reports & Statistics" subtitle="Overview of your transport operations">
        <div className="portal-grid-2">
          <StatCard 
            label="Total Loads" 
            value={stats.totalLoads}
            change="+15% this month"
            trend="up"
          />
          <StatCard 
            label="Active Drivers" 
            value={stats.activeDrivers}
            change="+2 this week"
            trend="up"
          />
        </div>
      </Panel>
      
      {/* Accounts Payable & Reports */}
      <div className="portal-grid-2">
        <Panel title="Accounts Payable" subtitle="Payment tracking">
          <TileList 
            items={[
              { label: 'Overdue', value: '3' },
              { label: 'Due Soon', value: '7' },
              { label: 'Paid', value: stats.completedLoads },
              { label: 'Total Outstanding', value: `£${((stats.totalRevenue * 0.3) / 1000).toFixed(1)}k` }
            ]}
          />
        </Panel>
        
        <Panel title="Reports" subtitle="Generated reports">
          <TileList 
            items={[
              { label: 'Daily Reports', value: '5' },
              { label: 'Weekly Reports', value: '2' },
              { label: 'Monthly Reports', value: '1' },
              { label: 'Custom Reports', value: '0' }
            ]}
          />
        </Panel>
      </div>
      
      {/* Activity at a Glance */}
      <Panel title="Latest Bookings" subtitle="Activity at a glance">
        <ActivityList activities={activities} />
      </Panel>
      
      {/* Compliance */}
      <Panel title="Compliance" subtitle="Manage Your Suppliers">
        <CompliancePanel />
      </Panel>
    </div>
  )
}

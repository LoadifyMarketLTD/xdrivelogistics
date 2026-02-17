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

interface RecentBid {
  id: string
  jobTitle: string
  quoteAmount: number
  status: string
  createdAt: string
}

interface UrgentJob {
  id: string
  route: string
  pickupDate: string
  budget: number
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
  const [recentBids, setRecentBids] = useState<RecentBid[]>([])
  const [urgentJobs, setUrgentJobs] = useState<UrgentJob[]>([])
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
        
        // Fetch recent bids for this company
        const { data: bidsData, error: bidsError } = await supabase
          .from('job_bids')
          .select(`
            *,
            jobs:job_id (
              id,
              pickup_location,
              delivery_location
            )
          `)
          .eq('bidder_company_id', companyId)
          .order('created_at', { ascending: false })
          .limit(5)
        
        if (!bidsError && bidsData) {
          const bids: RecentBid[] = bidsData.map(bid => ({
            id: bid.id,
            jobTitle: bid.jobs ? `${bid.jobs.pickup_location} → ${bid.jobs.delivery_location}` : 'Job',
            quoteAmount: bid.quote_amount,
            status: bid.status,
            createdAt: new Date(bid.created_at).toLocaleDateString('en-GB')
          }))
          setRecentBids(bids)
        }
        
        // Fetch urgent jobs (pickup within 2 days, status open)
        const twoDaysFromNow = new Date()
        twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2)
        
        const { data: urgentData, error: urgentError } = await supabase
          .from('jobs')
          .select('*')
          .eq('status', 'open')
          .lte('pickup_datetime', twoDaysFromNow.toISOString())
          .gte('pickup_datetime', new Date().toISOString())
          .order('pickup_datetime', { ascending: true })
          .limit(5)
        
        if (!urgentError && urgentData) {
          const urgent: UrgentJob[] = urgentData.map(job => ({
            id: job.id,
            route: `${job.pickup_location} → ${job.delivery_location}`,
            pickupDate: new Date(job.pickup_datetime).toLocaleDateString('en-GB', {
              weekday: 'short',
              day: 'numeric',
              month: 'short'
            }),
            budget: job.budget || 0
          }))
          setUrgentJobs(urgent)
        }
        
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
      
      {/* Recent Bids & Urgent Jobs */}
      <div className="portal-grid-2">
        <Panel title="Recent Bids" subtitle="Your latest bid submissions">
          {recentBids.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--portal-text-secondary)' }}>
              No recent bids
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentBids.map((bid) => (
                <div
                  key={bid.id}
                  style={{
                    padding: '16px',
                    backgroundColor: 'var(--portal-bg-secondary)',
                    borderRadius: '8px',
                    border: '1px solid var(--portal-border)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--portal-card)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--portal-bg-secondary)'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600',
                      color: 'var(--portal-text-primary)',
                      flex: 1
                    }}>
                      {bid.jobTitle}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'var(--portal-accent)'
                    }}>
                      £{bid.quoteAmount.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center'
                  }}>
                    <span style={{ 
                      fontSize: '12px', 
                      color: 'var(--portal-text-muted)' 
                    }}>
                      {bid.createdAt}
                    </span>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      backgroundColor: bid.status === 'accepted' ? 'var(--portal-success-bg)' :
                                     bid.status === 'rejected' ? 'var(--portal-error-bg)' :
                                     'var(--portal-info-bg)',
                      color: bid.status === 'accepted' ? 'var(--portal-success)' :
                            bid.status === 'rejected' ? 'var(--portal-error)' :
                            'var(--portal-info)'
                    }}>
                      {bid.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
        
        <Panel title="Urgent Jobs" subtitle="Pickup within 2 days">
          {urgentJobs.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--portal-text-secondary)' }}>
              No urgent jobs at the moment
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {urgentJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => window.location.href = `/marketplace/${job.id}`}
                  style={{
                    padding: '16px',
                    backgroundColor: 'var(--portal-bg-secondary)',
                    borderRadius: '8px',
                    border: '1px solid var(--portal-border)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--portal-card)'
                    e.currentTarget.style.borderColor = 'var(--portal-accent)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--portal-bg-secondary)'
                    e.currentTarget.style.borderColor = 'var(--portal-border)'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '16px' }}>🔥</span>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600',
                      color: 'var(--portal-text-primary)',
                      flex: 1
                    }}>
                      {job.route}
                    </div>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center'
                  }}>
                    <span style={{ 
                      fontSize: '12px', 
                      color: 'var(--portal-text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      📅 {job.pickupDate}
                    </span>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: 'var(--portal-accent)'
                    }}>
                      £{job.budget.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
      
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

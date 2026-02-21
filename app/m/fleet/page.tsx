'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { brandColors } from '@/lib/brandColors'
import { useRouter } from 'next/navigation'

export default function FleetDashboardPage() {
  const { companyId, user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    activeJobs: 0,
    pendingBids: 0,
    newLoads: 0,
  })
  const [recentJobs, setRecentJobs] = useState<{ id: string; title: string; status: string; created_at: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!companyId) return

    const fetchStats = async () => {
      try {
        // Get active jobs
        const { data: jobs } = await supabase
          .from('jobs')
          .select('id')
          .eq('company_id', companyId)
          .in('status', ['open', 'assigned', 'in_progress'])

        // Get pending bids for this user
        const { data: bids } = await supabase
          .from('job_bids')
          .select('id')
          .eq('bidder_id', user?.id)
          .eq('status', 'submitted')

        // Get new loads (last 24 hours)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const { data: newLoads } = await supabase
          .from('jobs')
          .select('id')
          .eq('status', 'open')
          .gte('created_at', twentyFourHoursAgo)

        // Get recent jobs for activity feed
        const { data: recent } = await supabase
          .from('jobs')
          .select('id, title, status, created_at')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })
          .limit(5)

        setStats({
          activeJobs: jobs?.length || 0,
          pendingBids: bids?.length || 0,
          newLoads: newLoads?.length || 0,
        })
        setRecentJobs(recent || [])
      } catch (err) {
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [companyId, user?.id])

  const StatCard = ({ icon, label, value, color, onClick }: any) => (
    <button
      onClick={onClick}
      style={{
        background: brandColors.mobile.cardBackground,
        border: `1px solid ${brandColors.mobile.cardBorder}`,
        borderRadius: '12px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        width: '100%',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div style={{
        fontSize: '32px',
        marginBottom: '12px',
        textAlign: 'center',
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: '28px',
        fontWeight: '700',
        color: color || brandColors.primary.navy,
        textAlign: 'center',
        marginBottom: '4px',
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '13px',
        color: brandColors.text.secondary,
        textAlign: 'center',
      }}>
        {label}
      </div>
    </button>
  )

  const QuickAction = ({ icon, label, onClick }: any) => (
    <button
      onClick={onClick}
      style={{
        background: brandColors.primary.gold,
        border: 'none',
        borderRadius: '12px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = brandColors.primary.goldHover
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = brandColors.primary.gold
      }}
    >
      <div style={{ fontSize: '24px' }}>
        {icon}
      </div>
      <div style={{
        fontSize: '15px',
        fontWeight: '700',
        color: brandColors.text.white,
        textAlign: 'left',
      }}>
        {label}
      </div>
    </button>
  )

  if (loading) {
    return (
      <div style={{
        padding: '24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
      }}>
        <div style={{ color: brandColors.text.secondary }}>Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div style={{
      padding: '16px',
      paddingBottom: '32px',
    }}>
      {/* Welcome Section */}
      <div style={{
        marginBottom: '24px',
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: brandColors.text.primary,
          marginBottom: '4px',
        }}>
          Welcome to Fleet
        </h1>
        <p style={{
          fontSize: '14px',
          color: brandColors.text.secondary,
        }}>
          Manage your loads and operations
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <StatCard
          icon="🚛"
          label="Active Jobs"
          value={stats.activeJobs}
          color={brandColors.primary.navy}
          onClick={() => router.push('/m/fleet/loads')}
        />
        <StatCard
          icon="📝"
          label="Pending Bids"
          value={stats.pendingBids}
          color={brandColors.status.warning}
          onClick={() => router.push('/m/fleet/loads')}
        />
        <StatCard
          icon="🆕"
          label="New Loads"
          value={stats.newLoads}
          color={brandColors.status.success}
          onClick={() => router.push('/m/fleet/loads')}
        />
        <StatCard
          icon="📍"
          label="Live Tracking"
          value="View"
          color={brandColors.status.info}
          onClick={() => router.push('/m/fleet/live')}
        />
      </div>

      {/* Quick Actions */}
      <div style={{
        marginBottom: '24px',
      }}>
        <h2 style={{
          fontSize: '16px',
          fontWeight: '700',
          color: brandColors.text.primary,
          marginBottom: '12px',
        }}>
          Quick Actions
        </h2>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <QuickAction
            icon="➕"
            label="Post New Load"
            onClick={() => router.push('/jobs/new')}
          />
          <QuickAction
            icon="🔍"
            label="Browse Available Loads"
            onClick={() => router.push('/m/fleet/loads')}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{
        background: brandColors.mobile.cardBackground,
        border: `1px solid ${brandColors.mobile.cardBorder}`,
        borderRadius: '12px',
        padding: '20px',
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: brandColors.text.primary, marginBottom: '12px' }}>
          Recent Activity
        </h2>
        {recentJobs.length === 0 ? (
          <div style={{ fontSize: '13px', color: brandColors.text.secondary, textAlign: 'center', padding: '20px' }}>
            No recent jobs found
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentJobs.map((job) => (
              <button
                key={job.id}
                onClick={() => router.push(`/jobs/${job.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', background: '#f9fafb',
                  border: '1px solid #e5e7eb', borderRadius: '8px',
                  cursor: 'pointer', width: '100%', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: '600', color: brandColors.text.primary, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {job.title || `Job #${job.id.slice(0, 8)}`}
                </span>
                <span style={{
                  fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', marginLeft: '8px', flexShrink: 0,
                  background: job.status === 'completed' ? '#d1fae5' : job.status === 'open' ? '#dbeafe' : '#fef3c7',
                  color: job.status === 'completed' ? '#065f46' : job.status === 'open' ? '#1e40af' : '#92400e',
                }}>
                  {job.status}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

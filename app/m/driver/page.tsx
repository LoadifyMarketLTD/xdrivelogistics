'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { brandColors } from '@/lib/brandColors'
import { useRouter } from 'next/navigation'

export default function DriverHomePage() {
  const { profile } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    activeJobs: 0,
    completedToday: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id) return

    const fetchStats = async () => {
      try {
        // Get active jobs for this driver
        const { data: activeJobs } = await supabase
          .from('jobs')
          .select('id')
          .eq('driver_id', profile.id)
          .in('status', ['assigned', 'in_progress'])

        // Get completed jobs today
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const { data: completedJobs } = await supabase
          .from('jobs')
          .select('id')
          .eq('driver_id', profile.id)
          .eq('status', 'completed')
          .gte('updated_at', today.toISOString())

        setStats({
          activeJobs: activeJobs?.length || 0,
          completedToday: completedJobs?.length || 0,
        })
      } catch (err) {
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [profile])

  const StatCard = ({ icon, label, value, color, onClick }: any) => (
    <button
      onClick={onClick}
      style={{
        background: brandColors.mobile.cardBackground,
        border: `1px solid ${brandColors.mobile.cardBorder}`,
        borderRadius: '12px',
        padding: '20px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        width: '100%',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)'
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)'
        }
      }}
      disabled={!onClick}
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

  const QuickAction = ({ icon, label, onClick, color }: any) => (
    <button
      onClick={onClick}
      style={{
        background: color || brandColors.primary.gold,
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
        e.currentTarget.style.opacity = '0.9'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '1'
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
        <div style={{ color: brandColors.text.secondary }}>Loading...</div>
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
          Welcome, {profile?.full_name || 'Driver'}
        </h1>
        <p style={{
          fontSize: '14px',
          color: brandColors.text.secondary,
        }}>
          Ready for your next delivery?
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
          onClick={() => router.push('/m/driver/jobs')}
        />
        <StatCard
          icon="✅"
          label="Completed Today"
          value={stats.completedToday}
          color={brandColors.status.success}
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
            icon="📦"
            label="View My Jobs"
            onClick={() => router.push('/m/driver/jobs')}
            color={brandColors.primary.gold}
          />
          <QuickAction
            icon="📍"
            label="Start Navigation"
            onClick={() => router.push('/m/driver/navigation')}
            color={brandColors.status.info}
          />
          <QuickAction
            icon="📷"
            label="Upload POD"
            onClick={() => {}}
            color={brandColors.status.success}
          />
        </div>
      </div>

      {/* Current Job Card */}
      <div style={{
        background: brandColors.mobile.cardBackground,
        border: `1px solid ${brandColors.mobile.cardBorder}`,
        borderRadius: '12px',
        padding: '20px',
      }}>
        <h2 style={{
          fontSize: '16px',
          fontWeight: '700',
          color: brandColors.text.primary,
          marginBottom: '12px',
        }}>
          Current Job
        </h2>
        <div style={{
          fontSize: '13px',
          color: brandColors.text.secondary,
          textAlign: 'center',
          padding: '20px',
        }}>
          {stats.activeJobs > 0 
            ? 'Job details will appear here'
            : 'No active jobs at the moment'}
        </div>
      </div>
    </div>
  )
}

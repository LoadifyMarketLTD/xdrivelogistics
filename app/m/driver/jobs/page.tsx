'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { brandColors } from '@/lib/brandColors'
import { useRouter } from 'next/navigation'

interface Job {
  id: string
  pickup_location: string
  delivery_location: string
  pickup_datetime: string | null
  delivery_datetime: string | null
  status: string
  vehicle_type: string | null
  budget: number | null
  distance_miles: number | null
}

const STATUS_LABELS: Record<string, string> = {
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  open: 'Open',
}

const STATUS_COLORS: Record<string, string> = {
  assigned: brandColors.status.warning,
  in_progress: brandColors.status.info,
  completed: brandColors.status.success,
  cancelled: brandColors.status.error,
  open: brandColors.text.secondary,
}

type TabType = 'active' | 'recent'

export default function DriverJobsPage() {
  const { profile } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabType>('active')
  const mountedRef = useRef(true)

  const fetchJobs = useCallback(async () => {
    if (!profile?.user_id) return
    try {
      const { data } = await supabase
        .from('jobs')
        .select('id,pickup_location,delivery_location,pickup_datetime,delivery_datetime,status,vehicle_type,budget,distance_miles')
        .eq('driver_id', profile.user_id)
        .order('pickup_datetime', { ascending: false })
        .limit(50)
      if (mountedRef.current) setJobs(data || [])
    } catch (err) {
      console.error('Error fetching driver jobs:', err)
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [profile?.user_id])

  useEffect(() => {
    mountedRef.current = true
    fetchJobs()
    const interval = setInterval(fetchJobs, 30000)
    return () => {
      mountedRef.current = false
      clearInterval(interval)
    }
  }, [fetchJobs])

  const activeJobs = jobs.filter(j => ['assigned', 'in_progress'].includes(j.status))
  const recentJobs = jobs.filter(j => ['completed', 'cancelled'].includes(j.status))
  const displayJobs = tab === 'active' ? activeJobs : recentJobs

  if (loading) {
    return (
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <div style={{ color: brandColors.text.secondary }}>Loading jobs...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: '700', color: brandColors.text.primary, marginBottom: '16px' }}>
        My Jobs
      </h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {(['active', 'recent'] as TabType[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px',
              background: tab === t ? brandColors.primary.navy : brandColors.mobile.cardBackground,
              color: tab === t ? '#fff' : brandColors.text.secondary,
              boxShadow: tab === t ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {t === 'active' ? `Active (${activeJobs.length})` : `Recent (${recentJobs.length})`}
          </button>
        ))}
      </div>

      {displayJobs.length === 0 ? (
        <div style={{
          background: brandColors.mobile.cardBackground,
          border: `1px solid ${brandColors.mobile.cardBorder}`,
          borderRadius: '12px',
          padding: '40px 20px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
          <p style={{ color: brandColors.text.secondary, fontSize: '14px' }}>
            {tab === 'active' ? 'No active jobs at the moment.' : 'No recent jobs found.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {displayJobs.map(job => {
            const color = STATUS_COLORS[job.status] || brandColors.text.secondary
            return (
              <button
                key={job.id}
                onClick={() => router.push(`/jobs/${job.id}`)}
                style={{
                  background: brandColors.mobile.cardBackground,
                  border: `1px solid ${brandColors.mobile.cardBorder}`,
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: brandColors.text.primary, flex: 1, marginRight: '8px' }}>
                    {job.pickup_location} → {job.delivery_location}
                  </span>
                  <span style={{
                    fontSize: '11px', fontWeight: '600',
                    color, background: `${color}20`, borderRadius: '20px',
                    padding: '3px 10px', border: `1px solid ${color}40`, whiteSpace: 'nowrap',
                  }}>
                    {STATUS_LABELS[job.status] || job.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '13px', color: brandColors.text.secondary }}>
                  {job.pickup_datetime && <span>📅 {new Date(job.pickup_datetime).toLocaleDateString('en-GB')}</span>}
                  {job.vehicle_type && <span>🚛 {job.vehicle_type}</span>}
                  {job.budget && <span>💰 £{job.budget.toFixed(2)}</span>}
                  {job.distance_miles && <span>📍 {job.distance_miles} mi</span>}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}


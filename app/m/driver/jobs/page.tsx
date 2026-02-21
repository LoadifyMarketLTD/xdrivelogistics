'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/AuthContext'
import { brandColors } from '@/lib/brandColors'
import { useRouter } from 'next/navigation'

interface ActiveJob {
  id: string
  pickup_location: string
  delivery_location: string
  status: string
  pickup_datetime: string | null
  budget: number | null
  vehicle_type: string | null
}

const STATUS_COLOR: Record<string, string> = {
  assigned: '#d97706',
  in_progress: '#2563eb',
  completed: '#16a34a',
  pending: '#6b7280',
}

export default function DriverJobsPage() {
  const { profile } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<ActiveJob[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'active' | 'all'>('active')

  useEffect(() => {
    if (!profile?.id) { setLoading(false); return }
    const load = async () => {
      try {
        let q = supabase
          .from('jobs')
          .select('id, pickup_location, delivery_location, status, pickup_datetime, budget, vehicle_type')
          .eq('driver_id', profile.id)
          .order('pickup_datetime', { ascending: false })

        if (filter === 'active') {
          q = q.in('status', ['assigned', 'in_progress'])
        }

        const { data } = await q.limit(30)
        setJobs(data || [])
      } catch (e) {
        console.error('Driver jobs error:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [profile?.id, filter])

  if (loading) {
    return <div style={{ padding: '16px', color: brandColors.text.secondary }}>Loading jobs…</div>
  }

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontSize: '18px', fontWeight: '700', color: brandColors.text.primary, marginBottom: '12px' }}>
        My Jobs
      </h1>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {(['active', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 16px', borderRadius: '20px', border: 'none',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              background: filter === f ? brandColors.primary.gold : '#f3f4f6',
              color: filter === f ? '#ffffff' : brandColors.text.secondary,
            }}
          >
            {f === 'active' ? 'Active' : 'All Jobs'}
          </button>
        ))}
      </div>

      {jobs.length === 0 ? (
        <div style={{
          background: '#ffffff', border: '1px solid #e5e7eb',
          borderRadius: '12px', padding: '32px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📦</div>
          <p style={{ color: brandColors.text.secondary, fontSize: '14px' }}>
            {filter === 'active' ? 'No active jobs at the moment.' : 'No jobs found.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => router.push(`/jobs/${job.id}`)}
              style={{
                background: '#ffffff', border: '1px solid #e5e7eb',
                borderRadius: '12px', padding: '14px',
                textAlign: 'left', cursor: 'pointer', width: '100%',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: brandColors.text.primary }}>
                    {job.pickup_location}
                  </div>
                  <div style={{ fontSize: '12px', color: brandColors.text.secondary, margin: '2px 0' }}>
                    → {job.delivery_location}
                  </div>
                  <div style={{ fontSize: '12px', color: brandColors.text.secondary }}>
                    {job.pickup_datetime
                      ? new Date(job.pickup_datetime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                      : 'Date TBC'}
                    {job.budget ? ` · £${job.budget}` : ''}
                  </div>
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: '700',
                  padding: '3px 8px', borderRadius: '20px',
                  background: STATUS_COLOR[job.status] + '22',
                  color: STATUS_COLOR[job.status] ?? '#6b7280',
                  textTransform: 'capitalize', flexShrink: 0,
                }}>
                  {job.status.replace('_', ' ')}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


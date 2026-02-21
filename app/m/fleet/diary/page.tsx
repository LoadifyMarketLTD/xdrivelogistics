'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/AuthContext'
import { brandColors } from '@/lib/brandColors'

interface DiaryJob {
  id: string
  pickup_location: string
  delivery_location: string
  pickup_datetime: string | null
  status: string
  vehicle_type: string | null
}

function dayLabel(date: Date): string {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const d = new Date(date); d.setHours(0, 0, 0, 0)
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function FleetDiaryPage() {
  const { companyId } = useAuth()
  const [jobs, setJobs] = useState<DiaryJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!companyId) { setLoading(false); return }
    const load = async () => {
      try {
        const from = new Date()
        from.setDate(from.getDate() - 1)
        const to = new Date()
        to.setDate(to.getDate() + 7)
        const { data } = await supabase
          .from('jobs')
          .select('id, pickup_location, delivery_location, pickup_datetime, status, vehicle_type')
          .eq('posted_by_company_id', companyId)
          .gte('pickup_datetime', from.toISOString())
          .lte('pickup_datetime', to.toISOString())
          .order('pickup_datetime')
        setJobs(data || [])
      } catch (e) {
        console.error('Diary error:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [companyId])

  // Group by day
  const grouped = jobs.reduce<Record<string, DiaryJob[]>>((acc, job) => {
    const key = job.pickup_datetime
      ? new Date(job.pickup_datetime).toDateString()
      : 'No date'
    if (!acc[key]) acc[key] = []
    acc[key].push(job)
    return acc
  }, {})

  const statusColor = (s: string) => {
    if (s === 'completed') return '#16a34a'
    if (s === 'in_progress') return '#2563eb'
    if (s === 'assigned') return '#d97706'
    return '#6b7280'
  }

  if (loading) {
    return <div style={{ padding: '16px', color: brandColors.text.secondary }}>Loading diary…</div>
  }

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontSize: '18px', fontWeight: '700', color: brandColors.text.primary, marginBottom: '16px' }}>
        Diary — Next 7 Days
      </h1>

      {jobs.length === 0 ? (
        <div style={{
          background: brandColors.background.white,
          border: `1px solid ${brandColors.border?.light ?? '#e5e7eb'}`,
          borderRadius: '12px', padding: '32px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📅</div>
          <p style={{ color: brandColors.text.secondary, fontSize: '14px' }}>
            No scheduled jobs in the next 7 days.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Object.entries(grouped).map(([day, dayJobs]) => (
            <div key={day}>
              <div style={{
                fontSize: '12px', fontWeight: '700', textTransform: 'uppercase',
                letterSpacing: '0.5px', color: brandColors.text.secondary, marginBottom: '8px',
              }}>
                {day !== 'No date' ? dayLabel(new Date(day)) : 'No Date'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {dayJobs.map((job) => (
                  <div key={job.id} style={{
                    background: brandColors.background.white,
                    border: `1px solid ${brandColors.border?.light ?? '#e5e7eb'}`,
                    borderRadius: '10px', padding: '14px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: brandColors.text.primary }}>
                          {job.pickup_location} → {job.delivery_location}
                        </div>
                        <div style={{ fontSize: '12px', color: brandColors.text.secondary, marginTop: '2px' }}>
                          {job.pickup_datetime
                            ? new Date(job.pickup_datetime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                            : 'Time TBC'}
                          {job.vehicle_type ? ` · ${job.vehicle_type}` : ''}
                        </div>
                      </div>
                      <span style={{
                        fontSize: '11px', fontWeight: '600',
                        color: statusColor(job.status), textTransform: 'capitalize', flexShrink: 0,
                      }}>
                        {job.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


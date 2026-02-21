'use client'

import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { brandColors } from '@/lib/brandColors'

interface Job {
  id: string
  pickup_location: string
  delivery_location: string
  pickup_datetime: string | null
  delivery_datetime: string | null
  status: string
  vehicle_type?: string | null
  budget?: number | null
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function FleetDiaryPage() {
  const { companyId } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  useEffect(() => {
    if (!companyId) return
    const fetchJobs = async () => {
      try {
        const { data } = await supabase
          .from('jobs')
          .select('id,pickup_location,delivery_location,pickup_datetime,delivery_datetime,status,vehicle_type,budget')
          .eq('posted_by_company_id', companyId)
          .not('pickup_datetime', 'is', null)
          .order('pickup_datetime', { ascending: true })
        setJobs(data || [])
      } catch (err) {
        console.error('Error fetching diary jobs:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [companyId])

  // Build a set of dates that have jobs
  const datesWithJobs = useMemo(() => {
    const s = new Set<string>()
    jobs.forEach(j => {
      if (j.pickup_datetime) s.add(j.pickup_datetime.slice(0, 10))
    })
    return s
  }, [jobs])

  // Jobs on selected date
  const selectedDateStr = selectedDate.toISOString().slice(0, 10)
  const jobsOnDate = useMemo(
    () => jobs.filter(j => j.pickup_datetime?.slice(0, 10) === selectedDateStr),
    [jobs, selectedDateStr]
  )

  // Calendar helpers
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  const getStatusColor = (status: string) => {
    if (status === 'open') return brandColors.status.info
    if (['assigned', 'in_progress'].includes(status)) return brandColors.status.warning
    if (['completed', 'delivered'].includes(status)) return brandColors.status.success
    if (status === 'cancelled') return brandColors.status.error
    return brandColors.text.secondary
  }

  if (loading) {
    return (
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <div style={{ color: brandColors.text.secondary }}>Loading diary...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: '700', color: brandColors.text.primary, marginBottom: '16px' }}>
        Diary
      </h1>

      {/* Month navigation */}
      <div style={{
        background: brandColors.mobile.cardBackground,
        border: `1px solid ${brandColors.mobile.cardBorder}`,
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: brandColors.text.primary }}>‹</button>
          <span style={{ fontWeight: '700', color: brandColors.text.primary }}>{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: brandColors.text.primary }}>›</button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px', marginBottom: '4px' }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: '600', color: brandColors.text.light, padding: '4px 0' }}>{d}</div>
          ))}
        </div>

        {/* Calendar cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px' }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />
            const dateStr = new Date(year, month, day).toISOString().slice(0, 10)
            const isSelected = dateStr === selectedDateStr
            const hasJobs = datesWithJobs.has(dateStr)
            const isToday = dateStr === new Date().toISOString().slice(0, 10)
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(new Date(year, month, day))}
                style={{
                  textAlign: 'center',
                  padding: '6px 2px',
                  borderRadius: '8px',
                  border: isToday ? `2px solid ${brandColors.primary.gold}` : '2px solid transparent',
                  background: isSelected ? brandColors.primary.navy : 'transparent',
                  color: isSelected ? '#fff' : brandColors.text.primary,
                  fontSize: '13px',
                  fontWeight: hasJobs ? '700' : '400',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                {day}
                {hasJobs && !isSelected && (
                  <div style={{
                    width: '5px', height: '5px', borderRadius: '50%',
                    background: brandColors.primary.gold,
                    margin: '1px auto 0',
                  }} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Jobs on selected date */}
      <h2 style={{ fontSize: '15px', fontWeight: '700', color: brandColors.text.primary, marginBottom: '12px' }}>
        {selectedDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        {' '}
        <span style={{ fontWeight: '400', color: brandColors.text.secondary }}>
          ({jobsOnDate.length} job{jobsOnDate.length !== 1 ? 's' : ''})
        </span>
      </h2>

      {jobsOnDate.length === 0 ? (
        <div style={{
          background: brandColors.mobile.cardBackground,
          border: `1px solid ${brandColors.mobile.cardBorder}`,
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
        }}>
          <p style={{ color: brandColors.text.secondary, fontSize: '14px' }}>No jobs on this day.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {jobsOnDate.map(job => (
            <div key={job.id} style={{
              background: brandColors.mobile.cardBackground,
              border: `1px solid ${brandColors.mobile.cardBorder}`,
              borderRadius: '12px',
              padding: '14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: brandColors.text.primary }}>
                  {job.pickup_location} → {job.delivery_location}
                </span>
                <span style={{
                  fontSize: '11px', fontWeight: '600',
                  color: getStatusColor(job.status),
                  background: `${getStatusColor(job.status)}20`,
                  borderRadius: '20px', padding: '2px 8px',
                  border: `1px solid ${getStatusColor(job.status)}40`,
                  whiteSpace: 'nowrap',
                }}>
                  {job.status}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: brandColors.text.secondary, display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {job.pickup_datetime && (
                  <span>🕐 {new Date(job.pickup_datetime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                )}
                {job.vehicle_type && <span>🚛 {job.vehicle_type}</span>}
                {job.budget && <span>💰 £{job.budget.toFixed(2)}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


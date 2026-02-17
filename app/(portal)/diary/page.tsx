'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/lib/AuthContext'
import Calendar from 'react-calendar'
import { format, startOfMonth, endOfMonth, isSameDay, parseISO } from 'date-fns'
import { LoadingSpinner } from '@/components/Loading'
import EmptyState from '@/components/EmptyState'
import StatusBadge from '@/components/StatusBadge'
import 'react-calendar/dist/Calendar.css'

export const dynamic = 'force-dynamic'

interface Job {
  id: string
  pickup_location: string
  delivery_location: string
  pickup_datetime: string | null
  delivery_datetime: string | null
  status: string
  vehicle_type?: string
  budget?: number
  created_at: string
}

type ViewMode = 'calendar' | 'list'
type FilterMode = 'all' | 'upcoming' | 'today' | 'week' | 'month'

export default function DiaryPage() {
  const { companyId } = useAuth()
  const supabase = useMemo(() => createClientComponentClient(), [])
  
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  
  useEffect(() => {
    if (!companyId) return
    
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('posted_by_company_id', companyId)
          .not('pickup_datetime', 'is', null)
          .order('pickup_datetime', { ascending: true })
        
        if (error) throw error
        setJobs(data || [])
      } catch (e) {
        console.error('Error fetching jobs:', e)
      } finally {
        setLoading(false)
      }
    }
    
    fetchJobs()
  }, [companyId, supabase])

  // Filter jobs based on filter mode
  const filteredJobs = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekFromNow = new Date(today)
    weekFromNow.setDate(weekFromNow.getDate() + 7)
    const monthEnd = endOfMonth(now)

    return jobs.filter(job => {
      if (!job.pickup_datetime) return false
      const pickupDate = parseISO(job.pickup_datetime)

      switch (filterMode) {
        case 'today':
          return isSameDay(pickupDate, today)
        case 'upcoming':
          return pickupDate >= today
        case 'week':
          return pickupDate >= today && pickupDate <= weekFromNow
        case 'month':
          return pickupDate >= today && pickupDate <= monthEnd
        default:
          return true
      }
    })
  }, [jobs, filterMode])

  // Group jobs by date
  const jobsByDate = useMemo(() => {
    const grouped: Record<string, Job[]> = {}
    filteredJobs.forEach(job => {
      if (!job.pickup_datetime) return
      const dateKey = format(parseISO(job.pickup_datetime), 'yyyy-MM-dd')
      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey].push(job)
    })
    return grouped
  }, [filteredJobs])

  // Jobs for selected date
  const selectedDateJobs = useMemo(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd')
    return jobsByDate[dateKey] || []
  }, [jobsByDate, selectedDate])

  // Check if a date has jobs
  const tileContent = ({ date }: { date: Date }) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    const dayJobs = jobsByDate[dateKey]
    if (dayJobs && dayJobs.length > 0) {
      return (
        <div style={{
          fontSize: '10px',
          color: 'var(--gold-premium)',
          fontWeight: '600',
          marginTop: '2px'
        }}>
          {dayJobs.length} job{dayJobs.length > 1 ? 's' : ''}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <LoadingSpinner size="large" text="Loading diary..." />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
            📅 Diary & Calendar
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            View and manage your scheduled jobs
          </p>
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setViewMode('calendar')}
            style={{
              padding: '8px 16px',
              backgroundColor: viewMode === 'calendar' ? 'var(--gold-premium)' : 'transparent',
              color: viewMode === 'calendar' ? '#0B1623' : '#fff',
              border: '1px solid ' + (viewMode === 'calendar' ? 'var(--gold-premium)' : 'rgba(255,255,255,0.2)'),
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            📅 Calendar
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '8px 16px',
              backgroundColor: viewMode === 'list' ? 'var(--gold-premium)' : 'transparent',
              color: viewMode === 'list' ? '#0B1623' : '#fff',
              border: '1px solid ' + (viewMode === 'list' ? 'var(--gold-premium)' : 'rgba(255,255,255,0.2)'),
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            📋 List
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        {(['all', 'today', 'upcoming', 'week', 'month'] as FilterMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setFilterMode(mode)}
            style={{
              padding: '6px 12px',
              backgroundColor: filterMode === mode ? 'var(--gold-premium)' : 'transparent',
              color: filterMode === mode ? '#0B1623' : '#fff',
              border: '1px solid ' + (filterMode === mode ? 'var(--gold-premium)' : 'rgba(255,255,255,0.2)'),
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {mode === 'all' && `All Jobs (${jobs.length})`}
            {mode === 'today' && 'Today'}
            {mode === 'upcoming' && 'Upcoming'}
            {mode === 'week' && 'This Week'}
            {mode === 'month' && 'This Month'}
          </button>
        ))}
      </div>

      {filteredJobs.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No jobs scheduled"
          description={filterMode === 'all' 
            ? "You don't have any jobs with scheduled pickup dates yet." 
            : `No jobs found for ${filterMode}.`}
          actionLabel="Post a Job"
          actionHref="/jobs/new"
          size="large"
        />
      ) : (
        <>
          {viewMode === 'calendar' ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 400px',
              gap: '24px'
            }}>
              {/* Calendar */}
              <div style={{
                backgroundColor: '#132433',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                <style jsx global>{`
                  .react-calendar {
                    background: transparent;
                    border: none;
                    color: #fff;
                    width: 100%;
                    font-family: inherit;
                  }
                  .react-calendar__tile {
                    color: #fff;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    borderRadius: 8px;
                    padding: 12px;
                    margin: 4px;
                    transition: all 0.2s;
                  }
                  .react-calendar__tile:hover {
                    background: rgba(255,255,255,0.08);
                    borderColor: var(--gold-premium);
                  }
                  .react-calendar__tile--active {
                    background: var(--gold-premium) !important;
                    color: #0B1623 !important;
                    borderColor: var(--gold-premium) !important;
                  }
                  .react-calendar__tile--now {
                    background: rgba(217, 177, 91, 0.2);
                  }
                  .react-calendar__navigation button {
                    color: #fff;
                    fontSize: 16px;
                    fontWeight: 600;
                  }
                  .react-calendar__navigation button:hover {
                    background: rgba(255,255,255,0.08);
                  }
                  .react-calendar__month-view__weekdays {
                    color: #94a3b8;
                    fontWeight: 600;
                    fontSize: 12px;
                    textTransform: uppercase;
                  }
                `}</style>
                <Calendar
                  value={selectedDate}
                  onChange={(value) => setSelectedDate(value as Date)}
                  tileContent={tileContent}
                />
              </div>

              {/* Selected Date Jobs */}
              <div style={{
                backgroundColor: '#132433',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '16px',
                  color: '#fff'
                }}>
                  {format(selectedDate, 'EEEE, d MMMM yyyy')}
                </h3>

                {selectedDateJobs.length === 0 ? (
                  <div style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: '#94a3b8'
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📭</div>
                    <div style={{ fontSize: '14px' }}>No jobs scheduled for this date</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {selectedDateJobs.map(job => (
                      <a
                        key={job.id}
                        href={`/marketplace/${job.id}`}
                        style={{
                          padding: '16px',
                          backgroundColor: 'rgba(255,255,255,0.02)',
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.05)',
                          textDecoration: 'none',
                          transition: 'all 0.2s',
                          display: 'block'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                          e.currentTarget.style.borderColor = 'var(--gold-premium)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div style={{ fontWeight: '600', color: '#fff', fontSize: '14px' }}>
                            {job.pickup_location} → {job.delivery_location}
                          </div>
                          <StatusBadge status={job.status} size="small" />
                        </div>
                        <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                          ⏰ {format(parseISO(job.pickup_datetime!), 'HH:mm')}
                          {job.vehicle_type && ` • 🚚 ${job.vehicle_type}`}
                          {job.budget && ` • 💰 £${job.budget.toFixed(2)}`}
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* List View */
            <div style={{
              backgroundColor: '#132433',
              borderRadius: '12px',
              padding: '32px',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {Object.entries(jobsByDate)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([dateKey, dateJobs]) => (
                    <div key={dateKey}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        marginBottom: '12px',
                        color: 'var(--gold-premium)'
                      }}>
                        {format(parseISO(dateKey), 'EEEE, d MMMM yyyy')}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {dateJobs.map(job => (
                          <a
                            key={job.id}
                            href={`/marketplace/${job.id}`}
                            style={{
                              padding: '16px',
                              backgroundColor: 'rgba(255,255,255,0.02)',
                              borderRadius: '8px',
                              border: '1px solid rgba(255,255,255,0.05)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              textDecoration: 'none',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                              e.currentTarget.style.borderColor = 'var(--gold-premium)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: '600', marginBottom: '4px', color: '#fff' }}>
                                {job.pickup_location} → {job.delivery_location}
                              </div>
                              <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                                ⏰ {format(parseISO(job.pickup_datetime!), 'HH:mm')}
                                {job.vehicle_type && ` • 🚚 ${job.vehicle_type}`}
                                {job.budget && ` • 💰 £${job.budget.toFixed(2)}`}
                              </div>
                            </div>
                            <StatusBadge status={job.status} size="small" />
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

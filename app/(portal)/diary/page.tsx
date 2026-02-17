'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/AuthContext'
import Calendar from 'react-calendar'
import { format, startOfMonth, endOfMonth, isSameDay, parseISO } from 'date-fns'
import { LoadingSpinner } from '@/components/Loading'
import EmptyState from '@/components/EmptyState'
import StatusBadge from '@/components/StatusBadge'
import '@/styles/portal.css'
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
  
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  
  useEffect(() => {
    if (!companyId) return
    
    let mounted = true
    
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
        
        if (!mounted) return
        
        setJobs(data || [])
      } catch (e) {
        console.error('Error fetching jobs:', e)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    
    fetchJobs()
    
    return () => {
      mounted = false
    }
  }, [companyId])

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
        <div className="diary-tile-badge">
          {dayJobs.length} job{dayJobs.length > 1 ? 's' : ''}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <LoadingSpinner size="large" text="Loading diary..." />
      </div>
    )
  }

  return (
    <div className="portal-layout">
      <div className="portal-header">
        <h1 className="portal-title">📅 Diary & Calendar</h1>
      </div>

      <main className="portal-main">
        <div className="diary-container">
          {/* Header */}
          <div className="diary-header">
            <div>
              <p className="page-description">
                View and manage your scheduled jobs
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="diary-view-toggle">
              <button
                onClick={() => setViewMode('calendar')}
                className={viewMode === 'calendar' ? 'btn-primary' : 'btn-secondary'}
              >
                📅 Calendar
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}
              >
                📋 List
              </button>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="diary-filters">
            {(['all', 'today', 'upcoming', 'week', 'month'] as FilterMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={filterMode === mode ? 'diary-filter-active' : 'diary-filter'}
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
                <div className="diary-calendar-grid">
                  {/* Calendar */}
                  <div className="portal-card diary-calendar-card">
                    <style jsx global>{`
                      .react-calendar {
                        background: transparent;
                        border: none;
                        color: #1F2937;
                        width: 100%;
                        font-family: inherit;
                      }
                      .react-calendar__tile {
                        color: #1F2937;
                        background: #F9FAFB;
                        border: 1px solid #E5E7EB;
                        border-radius: 6px;
                        padding: 12px;
                        margin: 4px;
                        transition: all 0.2s;
                      }
                      .react-calendar__tile:hover {
                        background: #E5E7EB;
                        border-color: #2563EB;
                      }
                      .react-calendar__tile--active {
                        background: #2563EB !important;
                        color: #FFFFFF !important;
                        border-color: #2563EB !important;
                      }
                      .react-calendar__tile--now {
                        background: #DBEAFE;
                        border-color: #93C5FD;
                      }
                      .react-calendar__navigation button {
                        color: #1F2937;
                        font-size: 16px;
                        font-weight: 600;
                      }
                      .react-calendar__navigation button:hover {
                        background: #F3F4F6;
                      }
                      .react-calendar__month-view__weekdays {
                        color: #6B7280;
                        font-weight: 600;
                        font-size: 12px;
                        text-transform: uppercase;
                      }
                      .diary-tile-badge {
                        font-size: 10px;
                        color: #2563EB;
                        font-weight: 600;
                        margin-top: 2px;
                      }
                    `}</style>
                    <Calendar
                      value={selectedDate}
                      onChange={(value) => setSelectedDate(value as Date)}
                      tileContent={tileContent}
                    />
                  </div>

                  {/* Selected Date Jobs */}
                  <div className="portal-card">
                    <h3 className="section-header">
                      {format(selectedDate, 'EEEE, d MMMM yyyy')}
                    </h3>

                    {selectedDateJobs.length === 0 ? (
                      <div className="diary-empty">
                        <div className="diary-empty-icon">📭</div>
                        <div className="diary-empty-text">No jobs scheduled for this date</div>
                      </div>
                    ) : (
                      <div className="diary-job-list">
                        {selectedDateJobs.map(job => (
                          <a
                            key={job.id}
                            href={`/loads/${job.id}`}
                            className="diary-job-card"
                          >
                            <div className="diary-job-header">
                              <div className="diary-job-route">
                                {job.pickup_location} → {job.delivery_location}
                              </div>
                              <StatusBadge status={job.status} size="small" />
                            </div>
                            <div className="diary-job-details">
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
                <div className="portal-card">
                  <div className="diary-list-view">
                    {Object.entries(jobsByDate)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([dateKey, dateJobs]) => (
                        <div key={dateKey} className="diary-date-group">
                          <h3 className="diary-date-header">
                            {format(parseISO(dateKey), 'EEEE, d MMMM yyyy')}
                          </h3>
                          <div className="diary-job-list">
                            {dateJobs.map(job => (
                              <a
                                key={job.id}
                                href={`/loads/${job.id}`}
                                className="diary-job-card-list"
                              >
                                <div>
                                  <div className="diary-job-route">
                                    {job.pickup_location} → {job.delivery_location}
                                  </div>
                                  <div className="diary-job-details">
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
      </main>
    </div>
  )
}

'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/lib/AuthContext'
import Panel from '@/components/portal/Panel'
import StatusPill from '@/components/portal/StatusPill'

export const dynamic = 'force-dynamic'

export default function DiaryPage() {
  const { companyId } = useAuth()
  const supabase = useMemo(() => createClientComponentClient(), [])
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (!companyId) return
    const fetch = async () => {
      try {
        const { data } = await supabase.from('jobs').select('*').eq('posted_by_company_id', companyId).not('pickup_datetime', 'is', null).order('pickup_datetime', { ascending: true }).limit(20)
        setJobs(data || [])
      } catch (e) {} finally { setLoading(false) }
    }
    fetch()
  }, [companyId])
  
  const groupedJobs = useMemo(() => {
    const groups: Record<string, any[]> = {}
    jobs.forEach(job => {
      const date = job.pickup_datetime ? new Date(job.pickup_datetime).toLocaleDateString('en-GB') : 'No Date'
      if (!groups[date]) groups[date] = []
      groups[date].push(job)
    })
    return groups
  }, [jobs])
  
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
  
  return (
    <Panel title="Diary" subtitle="Scheduled jobs and deliveries">
      {Object.keys(groupedJobs).length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
          <p>No scheduled jobs</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {Object.entries(groupedJobs).map(([date, dateJobs]) => (
            <div key={date}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: 'var(--portal-accent)' }}>{date}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {dateJobs.map(job => (
                  <div key={job.id} style={{ padding: '12px', background: 'var(--portal-bg-secondary)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>{job.pickup_location} → {job.delivery_location}</div>
                      <div style={{ fontSize: '13px', color: 'var(--portal-text-secondary)' }}>
                        {job.pickup_datetime && new Date(job.pickup_datetime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <StatusPill status={job.status} variant={job.status === 'completed' ? 'success' : 'info'} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  )
}

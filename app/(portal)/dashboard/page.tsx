'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

interface Job {
  id: string
  pickup_location: string
  delivery_location: string
  status: string
  budget: number | null
  created_at: string
  vehicle_type: string | null
}

export default function DashboardPage() {
  const { companyId } = useAuth()
  const [recentJobs, setRecentJobs] = useState<Job[]>([])
  const [stats, setStats] = useState({
    totalJobs: 0,
    openJobs: 0,
    completedJobs: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!companyId) return
    fetchDashboardData()
  }, [companyId])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch jobs
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('posted_by_company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (jobsError) throw jobsError
      
      setRecentJobs(jobs || [])
      
      // Calculate stats
      const totalJobs = jobs?.length || 0
      const openJobs = jobs?.filter(j => j.status === 'open').length || 0
      const completedJobs = jobs?.filter(j => j.status === 'completed' || j.status === 'delivered').length || 0
      const totalRevenue = jobs?.reduce((sum, j) => sum + (j.budget || 0), 0) || 0
      
      setStats({
        totalJobs,
        openJobs,
        completedJobs,
        totalRevenue,
      })
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
        Loading dashboard...
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1400px' }}>
      <h1 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '20px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        Dashboard
      </h1>

      {/* Reports & Statistics Section */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontSize: '14px',
          fontWeight: '700',
          color: '#374151',
          marginBottom: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.3px',
        }}>
          Reports & Statistics
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
        }}>
          {/* Gross Margin Panel */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            padding: '16px',
          }}>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              marginBottom: '8px',
              fontWeight: '600',
              textTransform: 'uppercase',
            }}>
              Total Revenue
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1f2937',
            }}>
              £{stats.totalRevenue.toFixed(2)}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#9ca3af',
              marginTop: '4px',
            }}>
              From {stats.totalJobs} jobs
            </div>
          </div>

          {/* Sub-contract Spend Panel */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            padding: '16px',
          }}>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              marginBottom: '8px',
              fontWeight: '600',
              textTransform: 'uppercase',
            }}>
              Open Jobs
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1f2937',
            }}>
              {stats.openJobs}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#9ca3af',
              marginTop: '4px',
            }}>
              Awaiting assignment
            </div>
          </div>

          {/* Completed Jobs */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            padding: '16px',
          }}>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              marginBottom: '8px',
              fontWeight: '600',
              textTransform: 'uppercase',
            }}>
              Completed Jobs
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#10b981',
            }}>
              {stats.completedJobs}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#9ca3af',
              marginTop: '4px',
            }}>
              Successfully delivered
            </div>
          </div>
        </div>
      </div>

      {/* Accounts Section */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontSize: '14px',
          fontWeight: '700',
          color: '#374151',
          marginBottom: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.3px',
        }}>
          Accounts
        </h2>
        
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          padding: '20px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
          }}>
            <div>
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                marginBottom: '6px',
                fontWeight: '600',
              }}>
                Invoices Received
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
              }}>
                {recentJobs.length > 0 ? recentJobs.length : '—'}
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                marginBottom: '6px',
                fontWeight: '600',
              }}>
                Awaiting Payment
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#f59e0b',
              }}>
                £{(stats.totalRevenue * 0.3).toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                marginBottom: '6px',
                fontWeight: '600',
              }}>
                Monthly Total
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
              }}>
                £{stats.totalRevenue.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity at a Glance Section */}
      <div>
        <h2 style={{
          fontSize: '14px',
          fontWeight: '700',
          color: '#374151',
          marginBottom: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.3px',
        }}>
          Activity at a Glance
        </h2>
        
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 2fr 1fr 1fr 100px',
            gap: '12px',
            padding: '12px 16px',
            background: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
            fontSize: '12px',
            fontWeight: '700',
            color: '#6b7280',
            textTransform: 'uppercase',
          }}>
            <div>From</div>
            <div>To</div>
            <div>Vehicle</div>
            <div>Status</div>
            <div>Budget</div>
          </div>

          {/* Table Rows */}
          {recentJobs.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#9ca3af',
              fontSize: '14px',
            }}>
              No recent activity
            </div>
          ) : (
            recentJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 2fr 1fr 1fr 100px',
                  gap: '12px',
                  padding: '12px 16px',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '13px',
                  color: '#374151',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f9fafb'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <div>{job.pickup_location || '—'}</div>
                <div>{job.delivery_location || '—'}</div>
                <div>{job.vehicle_type || '—'}</div>
                <div>
                  <span style={{
                    padding: '2px 8px',
                    background: job.status === 'open' ? '#dbeafe' : 
                               job.status === 'completed' ? '#d1fae5' : '#fef3c7',
                    color: job.status === 'open' ? '#1e40af' :
                           job.status === 'completed' ? '#065f46' : '#92400e',
                    fontSize: '11px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                  }}>
                    {job.status}
                  </span>
                </div>
                <div style={{ fontWeight: '600' }}>
                  {job.budget ? `£${job.budget.toFixed(2)}` : '—'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

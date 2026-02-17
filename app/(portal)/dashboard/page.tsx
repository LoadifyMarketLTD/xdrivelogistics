'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/lib/AuthContext'

export const dynamic = 'force-dynamic'

interface DashboardStats {
  totalLoads: number
  activeDrivers: number
  totalRevenue: number
  completedLoads: number
  grossMargin: number
  accountsPayable: number
  monthlyTotal: number
  subcontractSpend: number
}

export default function DashboardPage() {
  const { companyId } = useAuth()
  const supabase = useMemo(() => createClientComponentClient(), [])
  
  const [stats, setStats] = useState<DashboardStats>({
    totalLoads: 0,
    activeDrivers: 0,
    totalRevenue: 0,
    completedLoads: 0,
    grossMargin: 0,
    accountsPayable: 0,
    monthlyTotal: 0,
    subcontractSpend: 0,
  })
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (!companyId) return
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch jobs stats
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('posted_by_company_id', companyId)
        
        if (jobsError) throw jobsError
        
        // Calculate stats
        const totalLoads = jobs?.length || 0
        const completedLoads = jobs?.filter(j => j.status === 'completed' || j.status === 'delivered').length || 0
        const totalRevenue = jobs?.reduce((sum, j) => sum + (j.budget || 0), 0) || 0
        const grossMargin = totalRevenue * 0.22 // 22% margin example
        const accountsPayable = totalRevenue * 0.15 // Example
        const monthlyTotal = totalRevenue
        const subcontractSpend = totalRevenue * 0.65 // Example
        
        setStats({
          totalLoads,
          activeDrivers: 12, // Placeholder
          totalRevenue,
          completedLoads,
          grossMargin,
          accountsPayable,
          monthlyTotal,
          subcontractSpend,
        })
        
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [companyId, supabase])
  
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '16px', color: '#6b7280' }}>
          Loading dashboard...
        </div>
      </div>
    )
  }

  const StatPanel = ({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) => (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '4px',
      padding: '16px',
    }}>
      <div style={{
        fontSize: '11px',
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '8px',
      }}>
        {title}
      </div>
      <div style={{
        fontSize: '24px',
        fontWeight: '700',
        color: '#111827',
        marginBottom: '4px',
      }}>
        {value}
      </div>
      {subtitle && (
        <div style={{
          fontSize: '12px',
          color: '#6b7280',
        }}>
          {subtitle}
        </div>
      )}
    </div>
  )

  const ActivityRow = ({ label, value, time }: { label: string; value: string; time: string }) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid #f3f4f6',
      fontSize: '13px',
    }}>
      <div style={{ flex: 1, color: '#374151' }}>{label}</div>
      <div style={{ fontWeight: '600', color: '#111827', marginRight: '12px' }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#9ca3af', minWidth: '60px', textAlign: 'right' }}>{time}</div>
    </div>
  )
  
  return (
    <div style={{
      maxWidth: '1600px',
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '16px',
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#111827',
          margin: '0 0 4px 0',
        }}>
          Dashboard
        </h1>
        <div style={{
          fontSize: '13px',
          color: '#6b7280',
        }}>
          Enterprise logistics operations overview
        </div>
      </div>

      {/* Two Column Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
      }}>
        {/* LEFT COLUMN */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {/* Gross Margin */}
          <StatPanel 
            title="Gross Margin"
            value={`£${(stats.grossMargin / 1000).toFixed(1)}k`}
            subtitle="+12% vs last month"
          />

          {/* Accounts Payable */}
          <StatPanel 
            title="Accounts Payable"
            value={`£${(stats.accountsPayable / 1000).toFixed(1)}k`}
            subtitle="3 invoices pending"
          />

          {/* Monthly Totals */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            padding: '16px',
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '12px',
            }}>
              Monthly Totals
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Revenue</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                  £{(stats.monthlyTotal / 1000).toFixed(1)}k
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Loads</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                  {stats.totalLoads}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {/* Subcontract Spend */}
          <StatPanel 
            title="Subcontract Spend"
            value={`£${(stats.subcontractSpend / 1000).toFixed(1)}k`}
            subtitle="65% of revenue"
          />

          {/* Reports */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            padding: '16px',
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '12px',
            }}>
              Reports
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Daily</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>5</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Weekly</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>2</div>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            padding: '16px',
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '12px',
            }}>
              Recent Activity
            </div>
            <div>
              <ActivityRow label="Load #1234 completed" value="£450" time="2h ago" />
              <ActivityRow label="New load posted" value="£320" time="4h ago" />
              <ActivityRow label="Quote accepted" value="£580" time="6h ago" />
              <ActivityRow label="Driver assigned" value="-" time="8h ago" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

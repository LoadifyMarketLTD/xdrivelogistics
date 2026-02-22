'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import RequireRole from '@/components/auth/RequireRole'
import ResponsiveContainer from '@/components/layout/ResponsiveContainer'
import Panel from '@/components/portal/Panel'
import StatCard from '@/components/portal/StatCard'
import ResponsiveGrid from '@/components/layout/ResponsiveGrid'
import nextDynamic from 'next/dynamic'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

const BarChart = nextDynamic(() => import('recharts').then(m => m.BarChart), { ssr: false })
const Bar = nextDynamic(() => import('recharts').then(m => m.Bar), { ssr: false })
const LineChart = nextDynamic(() => import('recharts').then(m => m.LineChart), { ssr: false })
const Line = nextDynamic(() => import('recharts').then(m => m.Line), { ssr: false })
const PieChart = nextDynamic(() => import('recharts').then(m => m.PieChart), { ssr: false })
const Pie = nextDynamic(() => import('recharts').then(m => m.Pie), { ssr: false })
const Cell = nextDynamic(() => import('recharts').then(m => m.Cell), { ssr: false })
const XAxis = nextDynamic(() => import('recharts').then(m => m.XAxis), { ssr: false })
const YAxis = nextDynamic(() => import('recharts').then(m => m.YAxis), { ssr: false })
const CartesianGrid = nextDynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false })
const Tooltip = nextDynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false })
const Legend = nextDynamic(() => import('recharts').then(m => m.Legend), { ssr: false })
const RechartResponsiveContainer = nextDynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false })

const gold = '#C8A64D'
const navy = '#0A2239'

interface PlatformStats {
  totalUsers: number
  activeUsers: number
  pendingUsers: number
  blockedUsers: number
  brokers: number
  drivers: number
  companies: number
  totalCompanies: number
  activeCompanies: number
  pendingCompanies: number
  totalJobs: number
  openJobs: number
  assignedJobs: number
  inProgressJobs: number
  completedJobs: number
  cancelledJobs: number
  totalBids: number
  acceptedBids: number
  pendingBids: number
  totalRevenue: number
  avgJobValue: number
}

interface MonthlyPoint {
  month: string
  users: number
  jobs: number
  revenue: number
  completedJobs: number
}

interface ActivityItem {
  id: string
  label: string
  time: string
  rawTime: string
  type: 'user' | 'job' | 'company' | 'bid'
}

function buildLast6Months(): Record<string, { month: string; users: number; jobs: number; revenue: number; completedJobs: number }> {
  const result: Record<string, { month: string; users: number; jobs: number; revenue: number; completedJobs: number }> = {}
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
    result[key] = { month: label, users: 0, jobs: 0, revenue: 0, completedJobs: 0 }
  }
  return result
}

export default function GlobalAnalyticsPage() {
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0, activeUsers: 0, pendingUsers: 0, blockedUsers: 0,
    brokers: 0, drivers: 0, companies: 0,
    totalCompanies: 0, activeCompanies: 0, pendingCompanies: 0,
    totalJobs: 0, openJobs: 0, assignedJobs: 0, inProgressJobs: 0,
    completedJobs: 0, cancelledJobs: 0,
    totalBids: 0, acceptedBids: 0, pendingBids: 0,
    totalRevenue: 0, avgJobValue: 0,
  })
  const [monthlyData, setMonthlyData] = useState<MonthlyPoint[]>([])
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState('')

  useEffect(() => {
    let mounted = true

    const fetchAll = async () => {
      try {
        setLoading(true)

        const [
          { data: profiles },
          { data: companies },
          { data: jobs },
          { data: bids },
        ] = await Promise.all([
          supabase.from('profiles').select('user_id, role, status, created_at'),
          supabase.from('companies').select('id, status, created_at'),
          supabase.from('jobs').select('id, status, budget, created_at, pickup_location, delivery_location'),
          supabase.from('job_bids').select('id, status, created_at'),
        ])

        if (!mounted) return

        const p = profiles ?? []
        const c = companies ?? []
        const j = jobs ?? []
        const b = bids ?? []

        // User stats
        const totalUsers = p.length
        // Users without a status field are legacy records treated as active (matching portal layout behaviour)
        const activeUsers = p.filter((u: any) => u.status === 'active' || (!u.status)).length
        const pendingUsers = p.filter((u: any) => u.status === 'pending').length
        const blockedUsers = p.filter((u: any) => u.status === 'blocked').length
        const brokers = p.filter((u: any) => u.role === 'broker').length
        const drivers = p.filter((u: any) => u.role === 'driver').length
        const companiesUsers = p.filter((u: any) => u.role === 'company' || u.role === 'company_admin').length

        // Company stats
        const totalCompanies = c.length
        const activeCompanies = c.filter((co: any) => co.status === 'active').length
        const pendingCompanies = c.filter((co: any) => co.status === 'pending').length

        // Job stats
        const totalJobs = j.length
        const openJobs = j.filter((jb: any) => jb.status === 'open').length
        const assignedJobs = j.filter((jb: any) => jb.status === 'assigned').length
        const inProgressJobs = j.filter((jb: any) => jb.status === 'in_progress').length
        const completedJobs = j.filter((jb: any) => jb.status === 'completed').length
        const cancelledJobs = j.filter((jb: any) => jb.status === 'cancelled').length

        // Bid stats
        const totalBids = b.length
        const acceptedBids = b.filter((bd: any) => bd.status === 'accepted').length
        const pendingBids = b.filter((bd: any) => bd.status === 'submitted').length

        // Revenue stats
        const totalRevenue = j.reduce((sum: number, jb: any) => sum + (jb.budget || 0), 0)
        const avgJobValue = totalJobs > 0 ? totalRevenue / totalJobs : 0

        setStats({
          totalUsers, activeUsers, pendingUsers, blockedUsers,
          brokers, drivers, companies: companiesUsers,
          totalCompanies, activeCompanies, pendingCompanies,
          totalJobs, openJobs, assignedJobs, inProgressJobs,
          completedJobs, cancelledJobs,
          totalBids, acceptedBids, pendingBids,
          totalRevenue, avgJobValue,
        })

        // Build monthly trend data
        const monthMap = buildLast6Months()
        p.forEach((u: any) => {
          if (!u.created_at) return
          const key = u.created_at.slice(0, 7)
          if (monthMap[key]) monthMap[key].users++
        })
        j.forEach((jb: any) => {
          if (!jb.created_at) return
          const key = jb.created_at.slice(0, 7)
          if (monthMap[key]) {
            monthMap[key].jobs++
            monthMap[key].revenue += jb.budget || 0
            if (jb.status === 'completed') monthMap[key].completedJobs++
          }
        })
        setMonthlyData(Object.values(monthMap))

        // Build recent activity feed
        const recentJobs: ActivityItem[] = j
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 4)
          .map((jb: any) => ({
            id: `job-${jb.id}`,
            label: `📦 New job posted: ${jb.pickup_location || '?'} → ${jb.delivery_location || '?'}`,
            time: new Date(jb.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
            rawTime: jb.created_at,
            type: 'job' as const,
          }))

        const recentUsers: ActivityItem[] = p
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 4)
          .map((u: any) => ({
            id: `user-${u.user_id}`,
            label: `👤 New ${u.role || 'user'} registered`,
            time: new Date(u.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
            rawTime: u.created_at,
            type: 'user' as const,
          }))

        const combined: ActivityItem[] = [...recentJobs, ...recentUsers]
          .sort((a, b) => new Date(b.rawTime).getTime() - new Date(a.rawTime).getTime())
          .slice(0, 8)

        setRecentActivity(combined)
        setLastUpdated(new Date().toLocaleString('en-GB'))
      } catch (err) {
        console.error('Global analytics fetch error:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchAll()
    return () => { mounted = false }
  }, [])

  const jobStatusData = [
    { name: 'Open', value: stats.openJobs, fill: '#3b82f6' },
    { name: 'Assigned', value: stats.assignedJobs, fill: '#f59e0b' },
    { name: 'In Progress', value: stats.inProgressJobs, fill: '#8b5cf6' },
    { name: 'Completed', value: stats.completedJobs, fill: '#16A34A' },
    { name: 'Cancelled', value: stats.cancelledJobs, fill: '#ef4444' },
  ].filter(d => d.value > 0)

  const userRoleData = [
    { name: 'Brokers', value: stats.brokers, fill: gold },
    { name: 'Drivers', value: stats.drivers, fill: '#3b82f6' },
    { name: 'Companies', value: stats.companies, fill: navy },
  ].filter(d => d.value > 0)

  const completionRate = stats.totalJobs > 0
    ? ((stats.completedJobs / stats.totalJobs) * 100).toFixed(1)
    : '0'
  const bidAcceptRate = stats.totalBids > 0
    ? ((stats.acceptedBids / stats.totalBids) * 100).toFixed(1)
    : '0'

  return (
    <RequireRole allowedRoles={['owner']}>
      <ResponsiveContainer maxWidth="xl">

        {/* ── HEADER ──────────────────────────────────────────── */}
        <div style={{ background: navy, borderRadius: '10px', padding: '18px 24px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: gold, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>XDrive Logistics Ltd</div>
            <div style={{ color: '#ffffff', fontSize: '22px', fontWeight: '700', marginTop: '2px' }}>🌐 Global Site Analysis</div>
            <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>Full platform analytics — owner view</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>Last updated</div>
            <div style={{ fontSize: '13px', color: '#d1d5db', fontWeight: '500' }}>{loading ? '…' : lastUpdated}</div>
          </div>
        </div>

        {/* ── TOP KPI CARDS ───────────────────────────────────── */}
        <ResponsiveGrid columns={{ mobile: 2, tablet: 2, desktop: 4, wide: 4, ultrawide: 4 }}>
          <StatCard label="Total Users" value={loading ? '…' : stats.totalUsers} change={`${stats.activeUsers} active`} trend="up" />
          <StatCard label="Total Jobs" value={loading ? '…' : stats.totalJobs} change={`${stats.openJobs} open`} trend="up" />
          <StatCard label="Completion Rate" value={loading ? '…' : `${completionRate}%`} change={`${stats.completedJobs} completed`} />
          <StatCard label="Total Budget (est.)" value={loading ? '…' : `£${(stats.totalRevenue / 1000).toFixed(1)}k`} change={`avg £${stats.avgJobValue.toFixed(0)}/job`} trend="up" />
        </ResponsiveGrid>

        {/* ── SECONDARY KPI CARDS ─────────────────────────────── */}
        <div style={{ marginTop: '16px' }}>
          <ResponsiveGrid columns={{ mobile: 2, tablet: 3, desktop: 6, wide: 6, ultrawide: 6 }}>
            <StatCard label="Brokers" value={loading ? '…' : stats.brokers} />
            <StatCard label="Drivers" value={loading ? '…' : stats.drivers} />
            <StatCard label="Companies" value={loading ? '…' : stats.totalCompanies} change={`${stats.pendingCompanies} pending`} />
            <StatCard label="Total Bids" value={loading ? '…' : stats.totalBids} change={`${bidAcceptRate}% accepted`} />
            <StatCard label="Pending Users" value={loading ? '…' : stats.pendingUsers} trend={stats.pendingUsers > 0 ? 'down' : 'neutral'} />
            <StatCard label="Blocked Users" value={loading ? '…' : stats.blockedUsers} trend={stats.blockedUsers > 0 ? 'down' : 'neutral'} />
          </ResponsiveGrid>
        </div>

        {/* ── PLATFORM HEALTH STRIP ───────────────────────────── */}
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px 20px', marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          {[
            { label: 'User Activation Rate', value: stats.totalUsers > 0 ? `${((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%` : '—', ok: stats.totalUsers > 0 && (stats.activeUsers / stats.totalUsers) > 0.7 },
            { label: 'Job Completion Rate', value: stats.totalJobs > 0 ? `${completionRate}%` : '—', ok: parseFloat(completionRate) > 50 },
            { label: 'Bid Accept Rate', value: stats.totalBids > 0 ? `${bidAcceptRate}%` : '—', ok: parseFloat(bidAcceptRate) > 30 },
            { label: 'Company Approval Rate', value: stats.totalCompanies > 0 ? `${((stats.activeCompanies / stats.totalCompanies) * 100).toFixed(1)}%` : '—', ok: stats.pendingCompanies === 0 },
          ].map(metric => (
            <div key={metric.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{metric.label}</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: loading ? '#9ca3af' : (metric.ok ? '#16A34A' : '#f97316') }}>
                {loading ? '—' : metric.value}
              </div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: loading ? '#9ca3af' : (metric.ok ? '#16A34A' : '#f97316') }} />
            </div>
          ))}
        </div>

        {/* ── CHARTS ROW ──────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>

          {/* Monthly Jobs & Users */}
          <Panel title="Monthly Platform Activity" subtitle="Jobs posted & new users over the last 6 months">
            <div style={{ padding: '16px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Loading…</div>
              ) : stats.totalJobs === 0 && stats.totalUsers === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No activity data yet.</div>
              ) : (
                <RechartResponsiveContainer width="100%" height={260}>
                  <BarChart data={monthlyData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="jobs" name="Jobs" fill={navy} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="users" name="New Users" fill={gold} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </RechartResponsiveContainer>
              )}
            </div>
          </Panel>

          {/* Job Status Pie */}
          <Panel title="Job Status Distribution" subtitle="Current breakdown of all jobs by status">
            <div style={{ padding: '16px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Loading…</div>
              ) : jobStatusData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No jobs yet.</div>
              ) : (
                <RechartResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={jobStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {jobStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </RechartResponsiveContainer>
              )}
            </div>
          </Panel>
        </div>

        {/* ── REVENUE TREND ───────────────────────────────────── */}
        <div style={{ marginTop: '20px' }}>
          <Panel title="Budget Trend" subtitle="Monthly job budgets across all jobs (last 6 months — estimated)">
            <div style={{ padding: '16px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Loading…</div>
              ) : stats.totalRevenue === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No budget data yet.</div>
              ) : (
                <RechartResponsiveContainer width="100%" height={240}>
                  <LineChart data={monthlyData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => `£${v}`} />
                    <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => [`£${v.toFixed(0)}`, 'Budget (est.)']} />
                    <Line type="monotone" dataKey="revenue" name="Budget est. (£)" stroke={gold} strokeWidth={2} dot={{ fill: gold, r: 4 }} />
                    <Line type="monotone" dataKey="completedJobs" name="Completed Jobs" stroke="#16A34A" strokeWidth={2} dot={{ fill: '#16A34A', r: 3 }} />
                  </LineChart>
                </RechartResponsiveContainer>
              )}
            </div>
          </Panel>
        </div>

        {/* ── USER ROLES + RECENT ACTIVITY ────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>

          {/* User Role Breakdown */}
          <Panel title="User Role Breakdown" subtitle="Distribution of registered users by role">
            <div style={{ padding: '16px' }}>
              {loading ? (
                <div style={{ color: '#9ca3af', fontSize: '14px' }}>Loading…</div>
              ) : (
                <>
                  {userRoleData.length > 0 && (
                    <RechartResponsiveContainer width="100%" height={180}>
                      <BarChart data={userRoleData} layout="vertical" margin={{ top: 0, right: 16, left: 16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} width={70} />
                        <Tooltip contentStyle={{ fontSize: 12 }} />
                        <Bar dataKey="value" name="Users" radius={[0, 4, 4, 0]}>
                          {userRoleData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </RechartResponsiveContainer>
                  )}
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { label: 'Active Users', value: stats.activeUsers, color: '#16A34A' },
                      { label: 'Pending Approval', value: stats.pendingUsers, color: '#f59e0b' },
                      { label: 'Blocked', value: stats.blockedUsers, color: '#ef4444' },
                      { label: 'Pending Companies', value: stats.pendingCompanies, color: '#f97316' },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ fontSize: '13px', color: '#374151' }}>{row.label}</div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: row.color }}>{row.value}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Panel>

          {/* Recent Activity */}
          <Panel title="Recent Platform Activity" subtitle="Latest events across the platform">
            <div style={{ padding: '16px' }}>
              {loading ? (
                <div style={{ color: '#9ca3af', fontSize: '14px' }}>Loading…</div>
              ) : recentActivity.length === 0 ? (
                <div style={{ color: '#9ca3af', fontSize: '14px' }}>No recent activity.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recentActivity.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, marginTop: '5px',
                        background: item.type === 'job' ? navy : item.type === 'user' ? gold : '#3b82f6',
                      }} />
                      <div>
                        <div style={{ fontSize: '12px', color: '#1f2937', fontWeight: '500' }}>{item.label}</div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>{item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Panel>
        </div>

        {/* ── QUICK ADMIN LINKS ───────────────────────────────── */}
        <div style={{ marginTop: '20px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>Admin Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            {[
              { label: '✅ Approvals', desc: `${stats.pendingUsers + stats.pendingCompanies} pending`, href: '/admin/approvals', highlight: (stats.pendingUsers + stats.pendingCompanies) > 0 },
              { label: '👥 All Users', desc: `${stats.totalUsers} total`, href: '/admin/users' },
              { label: '🏢 Companies', desc: `${stats.totalCompanies} registered`, href: '/admin/companies' },
              { label: '📦 All Loads', desc: `${stats.totalJobs} jobs`, href: '/loads' },
              { label: '💰 All Quotes', desc: `${stats.totalBids} bids`, href: '/quotes' },
              { label: '🔍 Diagnostics', desc: 'System health', href: '/diagnostics' },
            ].map(a => (
              <a
                key={a.href}
                href={a.href}
                style={{
                  display: 'block', background: '#ffffff',
                  border: `2px solid ${a.highlight ? gold : '#e5e7eb'}`,
                  borderRadius: '8px', padding: '14px', textDecoration: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 12px rgba(200,166,77,0.18)` }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px', fontSize: '13px' }}>{a.label}</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>{a.desc}</div>
              </a>
            ))}
          </div>
        </div>

      </ResponsiveContainer>
    </RequireRole>
  )
}

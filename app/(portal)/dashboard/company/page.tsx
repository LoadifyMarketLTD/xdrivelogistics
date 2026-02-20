'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import RequireRole from '@/components/auth/RequireRole'
import ResponsiveContainer from '@/components/layout/ResponsiveContainer'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

export default function CompanyDashboardPage() {
  const { user, companyId } = useAuth()
  const [stats, setStats] = useState({ postedLoads: 0, drivers: 0, vehicles: 0, acceptedLoads: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !companyId) return
    let mounted = true

    const fetchData = async () => {
      try {
        // Fetch company job IDs first so bid queries can be scoped
        const { data: companyJobs } = await supabase
          .from('jobs')
          .select('id')
          .eq('posted_by_company_id', companyId)

        const jobIds = (companyJobs ?? []).map((j: { id: string }) => j.id)

        const [{ data: drivers }, { data: vehicles }, { data: acceptedBids }] =
          await Promise.all([
            supabase.from('profiles').select('id').eq('company_id', companyId).eq('role', 'driver'),
            supabase.from('vehicles').select('id').eq('company_id', companyId),
            jobIds.length > 0
              ? supabase.from('job_bids').select('id').in('job_id', jobIds).eq('status', 'accepted')
              : Promise.resolve({ data: [] }),
          ])

        if (!mounted) return
        setStats({
          postedLoads: jobIds.length,
          drivers: drivers?.length ?? 0,
          vehicles: vehicles?.length ?? 0,
          acceptedLoads: acceptedBids?.length ?? 0,
        })
      } catch (err) {
        console.error('Company dashboard fetch error:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchData()
    return () => { mounted = false }
  }, [user, companyId])

  return (
    <RequireRole allowedRoles={['company']}>
      <ResponsiveContainer maxWidth="xl">
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Transport Company Dashboard
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '28px', fontSize: '14px' }}>
          Manage your fleet, drivers, jobs and company analytics.
        </p>

        {loading ? (
          <div className="loading-screen"><div className="loading-text">Loading…</div></div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <div className="stat-card">
                <div className="stat-label">Posted Loads</div>
                <div className="stat-value">{stats.postedLoads}</div>
                <div className="stat-description">Total company loads</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Drivers</div>
                <div className="stat-value blue">{stats.drivers}</div>
                <div className="stat-description">Registered drivers</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Vehicles</div>
                <div className="stat-value blue">{stats.vehicles}</div>
                <div className="stat-description">Fleet size</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Accepted Jobs</div>
                <div className="stat-value green">{stats.acceptedLoads}</div>
                <div className="stat-description">Won bids</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { label: '👤 Drivers & Vehicles', desc: 'Manage your fleet and drivers', href: '/drivers-vehicles' },
                { label: '🚛 My Fleet', desc: 'Vehicle inventory and details', href: '/my-fleet' },
                { label: '📦 Company Loads', desc: 'Jobs posted by your company', href: '/loads' },
                { label: '💰 Quotes', desc: 'Manage load bids and quotes', href: '/quotes' },
                { label: '📈 Freight Vision', desc: 'Analytics and reporting', href: '/freight-vision' },
                { label: '📡 Live Availability', desc: 'Driver and vehicle availability', href: '/live-availability' },
                { label: '📅 Diary', desc: 'Company schedule', href: '/diary' },
                { label: '⚙️ Company Settings', desc: 'Manage company profile', href: '/company/settings' },
              ].map((action) => (
                <a key={action.href} href={action.href} style={{ display: 'block', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', textDecoration: 'none', transition: 'border-color 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#C8A64D')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}>
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '6px' }}>{action.label}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>{action.desc}</div>
                </a>
              ))}
            </div>
          </>
        )}
      </ResponsiveContainer>
    </RequireRole>
  )
}

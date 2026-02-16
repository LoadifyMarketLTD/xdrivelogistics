'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import '@/styles/dashboard.css'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        setError(
          'Authentication check timed out. This may indicate missing Supabase configuration. ' +
          'Please check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in Netlify for all deploy contexts.'
        )
        setLoading(false)
      }
    }, 10000) // 10 second timeout

    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setError(`Authentication error: ${sessionError.message}`)
          setLoading(false)
          clearTimeout(timeout)
          return
        }
        
        if (!session) {
          clearTimeout(timeout)
          router.push('/login')
          return
        }
        
        setLoading(false)
        clearTimeout(timeout)
      } catch (err) {
        console.error('Auth check exception:', err)
        setError(
          'Failed to check authentication. Please ensure Supabase is configured correctly. ' +
          'Visit /diagnostics to verify your environment variables.'
        )
        setLoading(false)
        clearTimeout(timeout)
      }
    }

    checkAuth()

    // Cleanup timeout on unmount
    return () => clearTimeout(timeout)
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Show error state if authentication failed
  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#0F1F2E',
        color: '#fff',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '600px',
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          border: '1px solid rgba(255, 107, 107, 0.3)',
          borderRadius: '12px',
          padding: '30px',
        }}>
          <h2 style={{ color: '#ff6b6b', marginBottom: '20px' }}>⚠️ Authentication Error</h2>
          <p style={{ lineHeight: '1.6', marginBottom: '25px' }}>{error}</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href="/diagnostics"
              style={{
                padding: '12px 24px',
                backgroundColor: '#C8A64D',
                color: '#0F1F2E',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                display: 'inline-block'
              }}
            >
              View Diagnostics
            </a>
            <a 
              href="/login"
              style={{
                padding: '12px 24px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                display: 'inline-block'
              }}
            >
              Go to Login
            </a>
            <a 
              href="/"
              style={{
                padding: '12px 24px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                display: 'inline-block'
              }}
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0F1F2E', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading dashboard...</div>
          <div style={{ fontSize: '14px', color: '#94a3b8' }}>Checking authentication...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-content">
      {/* Platform Header */}
      <header className="platform-header">
        <div className="container">
          <div className="platform-nav">
            <div className="platform-brand">
              <span className="platform-brand-accent">XDrive</span> Platform
            </div>
            
            <nav>
              <ul className="platform-links">
                <li><a href="#dashboard">Dashboard</a></li>
                <li><a href="#jobs">Jobs</a></li>
                <li><a href="#invoices">Invoices</a></li>
                <li><a href="#settings">Settings</a></li>
                <li><a href="#" onClick={handleLogout} className="logout">Logout</a></li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="container">
        
        {/* KPI Cards */}
        <section className="kpi-grid">
          {/* Active Jobs Card */}
          <div className="kpi-card">
            <div className="kpi-icon">📦</div>
            <div className="kpi-number">24</div>
            <div className="kpi-label">Active Jobs</div>
          </div>
          
          {/* Revenue Card */}
          <div className="kpi-card">
            <div className="kpi-icon">💰</div>
            <div className="kpi-number">£8,420</div>
            <div className="kpi-label">This Week Revenue</div>
          </div>
          
          {/* Profit Card */}
          <div className="kpi-card">
            <div className="kpi-icon">📈</div>
            <div className="kpi-number">£156</div>
            <div className="kpi-label">Avg Profit per Job</div>
          </div>
          
          {/* On-Time Rate Card */}
          <div className="kpi-card">
            <div className="kpi-icon">⏱️</div>
            <div className="kpi-number">96%</div>
            <div className="kpi-label">On-Time Delivery Rate</div>
          </div>
        </section>

        {/* Jobs Table */}
        <section className="table-section">
          <h2 className="section-title">Recent Jobs</h2>
          
          <div className="jobs-table">
            <table>
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Pickup</th>
                  <th>Delivery</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>JOB-1001</td>
                  <td>BB1 Blackburn</td>
                  <td>L1 Liverpool</td>
                  <td>£120</td>
                  <td><span className="status-badge in-transit">In Transit</span></td>
                  <td>2026-02-16</td>
                </tr>
                <tr>
                  <td>JOB-1002</td>
                  <td>M1 Manchester</td>
                  <td>LS1 Leeds</td>
                  <td>£180</td>
                  <td><span className="status-badge delivered">Delivered</span></td>
                  <td>2026-02-15</td>
                </tr>
                <tr>
                  <td>JOB-1003</td>
                  <td>L2 Liverpool</td>
                  <td>BB2 Blackburn</td>
                  <td>£95</td>
                  <td><span className="status-badge pending">Pending</span></td>
                  <td>2026-02-16</td>
                </tr>
                <tr>
                  <td>JOB-1004</td>
                  <td>LS2 Leeds</td>
                  <td>M2 Manchester</td>
                  <td>£140</td>
                  <td><span className="status-badge in-transit">In Transit</span></td>
                  <td>2026-02-16</td>
                </tr>
                <tr>
                  <td>JOB-1005</td>
                  <td>BB3 Blackburn</td>
                  <td>L3 Liverpool</td>
                  <td>£110</td>
                  <td><span className="status-badge delivered">Delivered</span></td>
                  <td>2026-02-14</td>
                </tr>
                <tr>
                  <td>JOB-1006</td>
                  <td>M3 Manchester</td>
                  <td>BB4 Blackburn</td>
                  <td>£165</td>
                  <td><span className="status-badge in-transit">In Transit</span></td>
                  <td>2026-02-15</td>
                </tr>
                <tr>
                  <td>JOB-1007</td>
                  <td>L4 Liverpool</td>
                  <td>LS3 Leeds</td>
                  <td>£200</td>
                  <td><span className="status-badge delivered">Delivered</span></td>
                  <td>2026-02-13</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h2 className="section-title">Quick Actions</h2>
          
          <div className="actions-grid">
            <button className="action-btn primary">Create Job</button>
            <button className="action-btn success">Generate Invoice</button>
            <button className="action-btn secondary">Add Driver</button>
            <button className="action-btn secondary">Export CSV</button>
          </div>
        </section>

      </main>
    </div>
  )
}

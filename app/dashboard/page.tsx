'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import '@/styles/dashboard.css'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }
      
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
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

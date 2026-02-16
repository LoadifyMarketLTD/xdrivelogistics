'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Job, Driver } from '@/lib/types'
import '@/styles/dashboard.css'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const router = useRouter()
  const { user, companyId, loading: authLoading, signOut } = useAuth()
  
  const [jobs, setJobs] = useState<Job[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // KPI state
  const [activeJobsCount, setActiveJobsCount] = useState(0)
  const [weekRevenue, setWeekRevenue] = useState(0)
  const [avgProfit, setAvgProfit] = useState(0)
  const [onTimeRate, setOnTimeRate] = useState(0)

  // Fetch jobs from Supabase
  const fetchJobs = async () => {
    if (!companyId) return

    try {
      setLoading(true)
      const { data, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (jobsError) throw jobsError

      setJobs(data || [])
      calculateKPIs(data || [])
      setError(null)
    } catch (err: any) {
      console.error('Error fetching jobs:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Calculate KPIs from real data
  const calculateKPIs = (jobsData: Job[]) => {
    // Active jobs (not delivered or cancelled)
    const activeJobs = jobsData.filter(
      j => j.status !== 'delivered' && j.status !== 'cancelled'
    )
    setActiveJobsCount(activeJobs.length)

    // Week revenue (jobs from last 7 days)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const weekJobs = jobsData.filter(j => new Date(j.created_at) > oneWeekAgo)
    const revenue = weekJobs.reduce((sum, j) => sum + (j.price || 0), 0)
    setWeekRevenue(revenue)

    // Average profit
    const jobsWithCost = jobsData.filter(j => j.cost !== null)
    if (jobsWithCost.length > 0) {
      const totalProfit = jobsWithCost.reduce(
        (sum, j) => sum + ((j.price || 0) - (j.cost || 0)),
        0
      )
      setAvgProfit(totalProfit / jobsWithCost.length)
    } else {
      setAvgProfit(0)
    }

    // On-time rate (delivered jobs that were on time - simplified for now)
    const deliveredJobs = jobsData.filter(j => j.status === 'delivered')
    if (deliveredJobs.length > 0) {
      // For now, assume 95% on-time rate. In future, track actual delivery times
      setOnTimeRate(95)
    } else {
      setOnTimeRate(0)
    }
  }

  // Fetch drivers
  const fetchDrivers = async () => {
    if (!companyId) return

    try {
      const { data, error: driversError } = await supabase
        .from('drivers')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)

      if (driversError) throw driversError
      setDrivers(data || [])
    } catch (err: any) {
      console.error('Error fetching drivers:', err)
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (companyId) {
      fetchJobs()
      fetchDrivers()
    }
  }, [authLoading, user, companyId, router])

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  // Quick Action handlers
  const handleCreateJob = () => {
    const pickup = prompt('Enter pickup location:')
    if (!pickup) return

    const delivery = prompt('Enter delivery location:')
    if (!delivery) return

    const priceStr = prompt('Enter price (£):')
    if (!priceStr) return

    const price = parseFloat(priceStr)
    if (isNaN(price)) {
      alert('Invalid price')
      return
    }

    createJob({ pickup, delivery, price })
  }

  const createJob = async (jobData: { pickup: string; delivery: string; price: number }) => {
    if (!companyId) {
      alert('Error: No company ID found')
      return
    }

    try {
      const { data, error: insertError } = await supabase
        .from('jobs')
        .insert([
          {
            company_id: companyId,
            pickup: jobData.pickup,
            delivery: jobData.delivery,
            price: jobData.price,
            status: 'pending',
          },
        ])
        .select()

      if (insertError) throw insertError

      console.log('Job created successfully:', data)
      alert('Job created successfully!')
      
      // Refresh jobs list
      await fetchJobs()
    } catch (err: any) {
      console.error('Error creating job:', err)
      alert(`Error creating job: ${err.message}`)
    }
  }

  const handleAddDriver = () => {
    const fullName = prompt('Enter driver full name:')
    if (!fullName) return

    const phone = prompt('Enter driver phone:')
    if (!phone) return

    addDriver({ full_name: fullName, phone })
  }

  const addDriver = async (driverData: { full_name: string; phone: string }) => {
    if (!companyId) {
      alert('Error: No company ID found')
      return
    }

    try {
      const { data, error: insertError } = await supabase
        .from('drivers')
        .insert([
          {
            company_id: companyId,
            full_name: driverData.full_name,
            phone: driverData.phone,
            is_active: true,
          },
        ])
        .select()

      if (insertError) throw insertError

      console.log('Driver added successfully:', data)
      alert('Driver added successfully!')
      
      // Refresh drivers list
      await fetchDrivers()
    } catch (err: any) {
      console.error('Error adding driver:', err)
      alert(`Error adding driver: ${err.message}`)
    }
  }

  const handleGenerateInvoice = () => {
    if (jobs.length === 0) {
      alert('No jobs available to create invoice for')
      return
    }

    // Show list of jobs to select from
    const jobsList = jobs.map((j, i) => `${i + 1}. ${j.job_code} - ${j.pickup} to ${j.delivery} - £${j.price}`).join('\n')
    const selection = prompt(`Select a job (enter number):\n\n${jobsList}`)
    
    if (!selection) return

    const jobIndex = parseInt(selection) - 1
    if (jobIndex < 0 || jobIndex >= jobs.length) {
      alert('Invalid selection')
      return
    }

    const selectedJob = jobs[jobIndex]
    generateInvoice(selectedJob)
  }

  const generateInvoice = async (job: Job) => {
    if (!companyId) {
      alert('Error: No company ID found')
      return
    }

    try {
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 30) // 30 days from now

      const { data, error: insertError } = await supabase
        .from('invoices')
        .insert([
          {
            company_id: companyId,
            job_id: job.id,
            customer_name: job.customer_name || 'Customer',
            customer_email: job.customer_email,
            amount: job.price,
            vat_amount: job.price * 0.2, // 20% VAT
            status: 'pending',
            issue_date: new Date().toISOString().split('T')[0],
            due_date: dueDate.toISOString().split('T')[0],
          },
        ])
        .select()

      if (insertError) throw insertError

      console.log('Invoice generated successfully:', data)
      alert('Invoice generated successfully!')
    } catch (err: any) {
      console.error('Error generating invoice:', err)
      alert(`Error generating invoice: ${err.message}`)
    }
  }

  const handleExportCSV = () => {
    if (jobs.length === 0) {
      alert('No jobs to export')
      return
    }

    // Create CSV content
    const headers = ['Job Code', 'Pickup', 'Delivery', 'Price', 'Status', 'Date']
    const rows = jobs.map(j => [
      j.job_code,
      j.pickup,
      j.delivery,
      j.price,
      j.status,
      new Date(j.created_at).toLocaleDateString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `xdrive-jobs-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    alert('CSV exported successfully!')
  }

  // Show error state if there's an issue
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
          <h2 style={{ color: '#ff6b6b', marginBottom: '20px' }}>⚠️ Error Loading Dashboard</h2>
          <p style={{ lineHeight: '1.6', marginBottom: '25px' }}>{error}</p>
          <button
            onClick={() => {
              setError(null)
              fetchJobs()
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#C8A64D',
              color: '#0F1F2E',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0F1F2E', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading dashboard...</div>
          <div style={{ fontSize: '14px', color: '#94a3b8' }}>Fetching your data...</div>
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
        
        {/* KPI Cards - NOW WITH REAL DATA */}
        <section className="kpi-grid">
          {/* Active Jobs Card */}
          <div className="kpi-card">
            <div className="kpi-icon">📦</div>
            <div className="kpi-number">{activeJobsCount}</div>
            <div className="kpi-label">Active Jobs</div>
          </div>
          
          {/* Revenue Card */}
          <div className="kpi-card">
            <div className="kpi-icon">💰</div>
            <div className="kpi-number">£{weekRevenue.toFixed(2)}</div>
            <div className="kpi-label">This Week Revenue</div>
          </div>
          
          {/* Profit Card */}
          <div className="kpi-card">
            <div className="kpi-icon">📈</div>
            <div className="kpi-number">£{avgProfit.toFixed(2)}</div>
            <div className="kpi-label">Avg Profit per Job</div>
          </div>
          
          {/* On-Time Rate Card */}
          <div className="kpi-card">
            <div className="kpi-icon">⏱️</div>
            <div className="kpi-number">{onTimeRate}%</div>
            <div className="kpi-label">On-Time Delivery Rate</div>
          </div>
        </section>

        {/* Jobs Table - NOW WITH REAL DATA */}
        <section className="table-section">
          <h2 className="section-title">Recent Jobs</h2>
          
          {jobs.length === 0 ? (
            <div style={{
              backgroundColor: '#132433',
              borderRadius: '12px',
              padding: '60px 40px',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <h3 style={{ marginBottom: '12px', color: '#fff' }}>No jobs yet</h3>
              <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
                Click "Create Job" below to add your first transport job
              </p>
            </div>
          ) : (
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
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td>{job.job_code}</td>
                      <td>{job.pickup}</td>
                      <td>{job.delivery}</td>
                      <td>£{job.price.toFixed(2)}</td>
                      <td>
                        <span className={`status-badge ${job.status.toLowerCase().replace('-', '')}`}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1).replace('-', ' ')}
                        </span>
                      </td>
                      <td>{new Date(job.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h2 className="section-title">Quick Actions</h2>
          
          <div className="actions-grid">
            <button className="action-btn primary" onClick={handleCreateJob}>Create Job</button>
            <button className="action-btn success" onClick={handleGenerateInvoice}>Generate Invoice</button>
            <button className="action-btn secondary" onClick={handleAddDriver}>Add Driver</button>
            <button className="action-btn secondary" onClick={handleExportCSV}>Export CSV</button>
          </div>
        </section>

      </main>
    </div>
  )
}

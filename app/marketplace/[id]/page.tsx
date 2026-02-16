'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Job, JobBid, Company } from '@/lib/types'
import '@/styles/dashboard.css'

export const dynamic = 'force-dynamic'

interface JobWithCompany extends Job {
  poster_company?: Company
}

interface BidWithCompany extends JobBid {
  bidder_company?: Company
}

export default function JobDetailPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params?.id as string
  const { user, companyId, loading: authLoading } = useAuth()
  
  const [job, setJob] = useState<JobWithCompany | null>(null)
  const [bids, setBids] = useState<BidWithCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  // Bid form state
  const [quoteAmount, setQuoteAmount] = useState('')
  const [message, setMessage] = useState('')
  const [bidSuccess, setBidSuccess] = useState(false)

  const isPostedByMe = job?.posted_by_company_id === companyId
  const myBid = bids.find(b => b.bidder_company_id === companyId)

  const fetchJob = async () => {
    try {
      setLoading(true)
      
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select(`
          *,
          poster_company:companies!jobs_posted_by_company_id_fkey(*)
        `)
        .eq('id', jobId)
        .single()

      if (jobError) throw jobError
      setJob(jobData)

      // Fetch bids if user is the poster or has bid on this job
      if (companyId) {
        const { data: bidsData, error: bidsError } = await supabase
          .from('job_bids')
          .select(`
            *,
            bidder_company:companies!job_bids_bidder_company_id_fkey(*)
          `)
          .eq('job_id', jobId)
          .order('created_at', { ascending: false })

        if (bidsError) throw bidsError
        setBids(bidsData || [])
      }

      setError(null)
    } catch (err: any) {
      console.error('Error fetching job:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user && jobId) {
      fetchJob()
    }
  }, [authLoading, user, jobId, companyId, router])

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!companyId) {
      alert('You must be part of a company to bid')
      return
    }

    if (!quoteAmount || parseFloat(quoteAmount) <= 0) {
      alert('Please enter a valid quote amount')
      return
    }

    try {
      setSubmitting(true)
      
      const { data, error: bidError } = await supabase
        .from('job_bids')
        .insert([{
          job_id: jobId,
          bidder_company_id: companyId,
          bidder_user_id: user!.id,
          quote_amount: parseFloat(quoteAmount),
          message: message || null,
          status: 'submitted'
        }])
        .select()

      if (bidError) throw bidError

      console.log('Bid submitted successfully:', data)
      setBidSuccess(true)
      setQuoteAmount('')
      setMessage('')
      
      // Refresh to show the bid
      await fetchJob()
    } catch (err: any) {
      console.error('Error submitting bid:', err)
      alert(`Error submitting bid: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAcceptBid = async (bidId: string) => {
    if (!confirm('Accept this bid? This will assign the job to the bidder.')) {
      return
    }

    try {
      const { error } = await supabase.rpc('accept_bid', { p_bid_id: bidId })

      if (error) throw error

      console.log('Bid accepted successfully')
      alert('Bid accepted! Job has been assigned.')
      
      // Refresh to show updated status
      await fetchJob()
    } catch (err: any) {
      console.error('Error accepting bid:', err)
      alert(`Error accepting bid: ${err.message}`)
    }
  }

  const handleRejectBid = async (bidId: string) => {
    if (!confirm('Reject this bid?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('job_bids')
        .update({ status: 'rejected' })
        .eq('id', bidId)

      if (error) throw error

      console.log('Bid rejected successfully')
      alert('Bid rejected')
      
      // Refresh to show updated status
      await fetchJob()
    } catch (err: any) {
      console.error('Error rejecting bid:', err)
      alert(`Error rejecting bid: ${err.message}`)
    }
  }

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0F1F2E', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading job details...</div>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="dashboard-content">
        <header className="platform-header">
          <div className="container">
            <div className="platform-nav">
              <div className="platform-brand">
                <span className="platform-brand-accent">XDrive</span> Marketplace
              </div>
            </div>
          </div>
        </header>
        <main className="container">
          <div style={{
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            border: '1px solid rgba(255, 107, 107, 0.3)',
            borderRadius: '12px',
            padding: '30px',
            marginTop: '40px',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#ff6b6b', marginBottom: '20px' }}>⚠️ Error</h2>
            <p style={{ marginBottom: '25px' }}>{error || 'Job not found'}</p>
            <a href="/marketplace" className="action-btn primary">
              Back to Marketplace
            </a>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="dashboard-content">
      <header className="platform-header">
        <div className="container">
          <div className="platform-nav">
            <div className="platform-brand">
              <span className="platform-brand-accent">XDrive</span> Marketplace
            </div>
            <nav>
              <ul className="platform-links">
                <li><a href="/dashboard">Dashboard</a></li>
                <li><a href="/marketplace">Marketplace</a></li>
                <li><a href="/jobs/new">Post Job</a></li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main className="container">
        <div style={{ marginTop: '24px', marginBottom: '16px' }}>
          <a href="/marketplace" style={{ color: 'var(--gold-premium)', fontSize: '14px' }}>
            ← Back to Marketplace
          </a>
        </div>

        <div style={{
          backgroundColor: '#132433',
          borderRadius: '12px',
          padding: '32px',
          border: '1px solid rgba(255,255,255,0.08)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '28px', marginBottom: '12px', color: '#fff' }}>
                {job.pickup_location} → {job.delivery_location}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={`status-badge ${job.status}`}>
                  {job.status}
                </span>
                <span style={{ fontSize: '14px', color: '#94a3b8' }}>
                  Posted by {job.poster_company?.name || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            padding: '20px',
            backgroundColor: 'rgba(255,255,255,0.02)',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            {job.vehicle_type && (
              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Vehicle Type</div>
                <div style={{ fontSize: '16px', color: '#fff' }}>🚚 {job.vehicle_type}</div>
              </div>
            )}
            {job.pallets && (
              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Pallets</div>
                <div style={{ fontSize: '16px', color: '#fff' }}>📦 {job.pallets}</div>
              </div>
            )}
            {job.weight_kg && (
              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Weight</div>
                <div style={{ fontSize: '16px', color: '#fff' }}>⚖️ {job.weight_kg} kg</div>
              </div>
            )}
            {job.budget && (
              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Budget</div>
                <div style={{ fontSize: '16px', color: '#fff' }}>💰 £{job.budget.toFixed(2)}</div>
              </div>
            )}
          </div>

          {job.load_details && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '8px', color: '#fff' }}>Load Details</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6' }}>
                {job.load_details}
              </p>
            </div>
          )}

          {job.assigned_company_id && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: 'rgba(47,143,91,0.1)',
              border: '1px solid rgba(47,143,91,0.3)',
              borderRadius: '8px'
            }}>
              <div style={{ color: 'var(--success-green)', fontWeight: '600' }}>
                ✅ Job Assigned
              </div>
            </div>
          )}
        </div>

        {!isPostedByMe && job.status === 'open' && !myBid && (
          <div style={{
            backgroundColor: '#132433',
            borderRadius: '12px',
            padding: '32px',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <h2 className="section-title">Submit Your Bid</h2>
            
            {bidSuccess && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(47,143,91,0.1)',
                border: '1px solid rgba(47,143,91,0.3)',
                borderRadius: '8px',
                marginBottom: '20px',
                color: 'var(--success-green)'
              }}>
                ✅ Bid submitted successfully!
              </div>
            )}

            <form onSubmit={handleSubmitBid} style={{ maxWidth: '500px' }}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Quote Amount (£) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                  placeholder="Enter your quote"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Message (optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                  placeholder="Add any notes or details..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="action-btn primary"
                style={{ opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? 'Submitting...' : 'Submit Bid'}
              </button>
            </form>
          </div>
        )}

        {!isPostedByMe && myBid && (
          <div style={{
            backgroundColor: '#132433',
            borderRadius: '12px',
            padding: '32px',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <h2 className="section-title">Your Bid</h2>
            <div style={{
              padding: '20px',
              backgroundColor: 'rgba(255,255,255,0.02)',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '24px', color: '#fff', fontWeight: '700' }}>
                  £{myBid.quote_amount.toFixed(2)}
                </div>
                <span className={`status-badge ${myBid.status}`}>
                  {myBid.status}
                </span>
              </div>
              {myBid.message && (
                <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '12px' }}>
                  {myBid.message}
                </p>
              )}
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '12px' }}>
                Submitted {new Date(myBid.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {isPostedByMe && (
          <div style={{
            backgroundColor: '#132433',
            borderRadius: '12px',
            padding: '32px',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <h2 className="section-title">Bids Received ({bids.length})</h2>
            
            {bids.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>
                No bids yet. Share your job to attract carriers!
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {bids.map((bid) => (
                  <div
                    key={bid.id}
                    style={{
                      padding: '20px',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      borderRadius: '8px',
                      border: bid.status === 'accepted' ? '2px solid var(--success-green)' : '1px solid rgba(255,255,255,0.08)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '18px', color: '#fff', fontWeight: '600', marginBottom: '4px' }}>
                          {bid.bidder_company?.name || 'Unknown Company'}
                        </div>
                        <div style={{ fontSize: '24px', color: 'var(--gold-premium)', fontWeight: '700' }}>
                          £{bid.quote_amount.toFixed(2)}
                        </div>
                      </div>
                      <span className={`status-badge ${bid.status}`}>
                        {bid.status}
                      </span>
                    </div>

                    {bid.message && (
                      <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '12px', lineHeight: '1.6' }}>
                        {bid.message}
                      </p>
                    )}

                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>
                      Submitted {new Date(bid.created_at).toLocaleString()}
                    </div>

                    {bid.status === 'submitted' && job.status === 'open' && (
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          onClick={() => handleAcceptBid(bid.id)}
                          className="action-btn success"
                          style={{ fontSize: '14px', padding: '8px 16px' }}
                        >
                          ✅ Accept Bid
                        </button>
                        <button
                          onClick={() => handleRejectBid(bid.id)}
                          className="action-btn secondary"
                          style={{ fontSize: '14px', padding: '8px 16px' }}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

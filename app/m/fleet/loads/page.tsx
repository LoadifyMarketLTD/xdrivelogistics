'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { brandColors } from '@/lib/brandColors'

interface Load {
  id: string
  pickup_location: string
  delivery_location: string
  pickup_datetime: string | null
  vehicle_type: string | null
  status: string
  budget: number | null
  distance_miles?: number | null
}

export default function FleetLoadsPage() {
  const { user } = useAuth()
  const [loads, setLoads] = useState<Load[]>([])
  const [loading, setLoading] = useState(true)
  const [showBidModal, setShowBidModal] = useState(false)
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null)
  const [bidAmount, setBidAmount] = useState('')
  const [bidMessage, setBidMessage] = useState('')
  const [submittingBid, setSubmittingBid] = useState(false)
  const mountedRef = useRef(true)

  const fetchLoads = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('jobs')
        .select('id,pickup_location,delivery_location,pickup_datetime,vehicle_type,status,budget,distance_miles')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(50)
      if (mountedRef.current) setLoads(data || [])
    } catch (err) {
      console.error('Error fetching loads:', err)
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    fetchLoads()
    const interval = setInterval(fetchLoads, 30000)
    return () => {
      mountedRef.current = false
      clearInterval(interval)
    }
  }, [fetchLoads])

  const submitBid = async () => {
    if (!selectedLoad || !user) return
    const numericBid = parseFloat(bidAmount)
    if (!numericBid || numericBid <= 0) { alert('Please enter a bid amount greater than £0.00'); return }
    try {
      setSubmittingBid(true)
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error('Authentication required')
      const { data: existing } = await supabase
        .from('job_bids').select('id').eq('job_id', selectedLoad.id).eq('bidder_id', authUser.id)
      if (existing && existing.length > 0) { alert('You have already placed a bid on this load. You can view your bids from the Loads page.'); setShowBidModal(false); return }
      const { error } = await supabase.from('job_bids').insert({
        job_id: selectedLoad.id, bidder_id: authUser.id,
        amount_gbp: numericBid, bid_price_gbp: numericBid,
        message: bidMessage?.trim() || null,
        status: 'submitted',
      })
      if (error) throw error
      alert('Bid placed successfully!')
      setShowBidModal(false); setBidAmount(''); setBidMessage('')
    } catch (err: any) {
      alert('Failed to submit bid: ' + err.message)
    } finally {
      setSubmittingBid(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <div style={{ color: brandColors.text.secondary }}>Loading loads...</div>
      </div>
    )
  }

  return (
    <>
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: brandColors.text.primary }}>
            Available Loads ({loads.length})
          </h1>
          <button
            onClick={fetchLoads}
            style={{ background: 'none', border: `1px solid ${brandColors.border.light}`, borderRadius: '8px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer', color: brandColors.text.secondary }}
          >
            Refresh
          </button>
        </div>

        {loads.length === 0 ? (
          <div style={{
            background: brandColors.mobile.cardBackground,
            border: `1px solid ${brandColors.mobile.cardBorder}`,
            borderRadius: '12px',
            padding: '40px 20px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
            <p style={{ color: brandColors.text.secondary, fontSize: '14px' }}>No available loads at the moment.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loads.map(load => (
              <div key={load.id} style={{
                background: brandColors.mobile.cardBackground,
                border: `1px solid ${brandColors.mobile.cardBorder}`,
                borderRadius: '12px',
                padding: '16px',
              }}>
                <div style={{ fontSize: '15px', fontWeight: '700', color: brandColors.text.primary, marginBottom: '6px' }}>
                  {load.pickup_location} → {load.delivery_location}
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '13px', color: brandColors.text.secondary, marginBottom: '12px' }}>
                  {load.vehicle_type && <span>🚛 {load.vehicle_type}</span>}
                  {load.pickup_datetime && <span>📅 {new Date(load.pickup_datetime).toLocaleDateString('en-GB')}</span>}
                  {load.budget && <span>💰 £{load.budget.toFixed(2)}</span>}
                  {load.distance_miles && <span>📍 {load.distance_miles} mi</span>}
                </div>
                <button
                  onClick={() => { setSelectedLoad(load); setBidAmount(load.budget?.toString() || ''); setBidMessage(''); setShowBidModal(true) }}
                  style={{
                    background: brandColors.primary.gold,
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#fff',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  Quote Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showBidModal && selectedLoad && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: brandColors.text.primary, marginBottom: '8px' }}>Place Bid</h3>
            <p style={{ fontSize: '13px', color: brandColors.text.secondary, marginBottom: '16px' }}>
              {selectedLoad.pickup_location} → {selectedLoad.delivery_location}
            </p>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: brandColors.text.primary, display: 'block', marginBottom: '6px' }}>Bid Amount (£) *</label>
              <input
                type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)}
                step="0.01" min="0.01" placeholder="e.g. 250.00"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${brandColors.border.light}`, fontSize: '15px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: brandColors.text.primary, display: 'block', marginBottom: '6px' }}>Message (optional)</label>
              <textarea
                value={bidMessage} onChange={e => setBidMessage(e.target.value)}
                rows={3} placeholder="Add notes..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${brandColors.border.light}`, fontSize: '14px', resize: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowBidModal(false)} disabled={submittingBid}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: `1px solid ${brandColors.border.light}`, background: '#fff', fontSize: '15px', cursor: 'pointer', fontWeight: '600', color: brandColors.text.secondary }}>
                Cancel
              </button>
              <button onClick={submitBid} disabled={submittingBid}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: brandColors.status.success, fontSize: '15px', cursor: 'pointer', fontWeight: '700', color: '#fff' }}>
                {submittingBid ? 'Submitting...' : 'Submit Bid'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


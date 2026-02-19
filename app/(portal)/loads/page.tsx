'use client'

import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

interface Load {
  id: string
  pickup_location: string
  delivery_location: string
  pickup_datetime: string | null
  delivery_datetime: string | null
  vehicle_type: string | null
  status: string
  budget: number | null
  load_details: string | null
  pallets: number | null
  weight_kg: number | null
  posted_by_company_id: string
  created_at: string
  distance_miles?: number | null
  load_type?: string | null
}

type SortBy = 'date' | 'distance' | 'price'
type LoadTab = 'all-live' | 'on-demand' | 'regular' | 'daily-hire'

export default function LoadsPage() {
  const router = useRouter()
  const { companyId, user } = useAuth()
  
  const [loads, setLoads] = useState<Load[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedLoadId, setExpandedLoadId] = useState<string | null>(null)
  const [showBidModal, setShowBidModal] = useState(false)
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null)
  
  // Tab state
  const [activeTab, setActiveTab] = useState<LoadTab>('all-live')
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all')
  const [fromPostcode, setFromPostcode] = useState('')
  const [toPostcode, setToPostcode] = useState('')
  const [radius, setRadius] = useState('')
  const [vehicleSize, setVehicleSize] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('date')
  
  // Bid modal states
  const [bidAmount, setBidAmount] = useState('')
  const [bidMessage, setBidMessage] = useState('')
  const [submittingBid, setSubmittingBid] = useState(false)
  
  // Use ref for mounted state to prevent updates after unmount
  const mountedRef = useRef(true)
  
  // Define fetchLoads using useCallback to make it stable
  const fetchLoads = useCallback(async () => {
    if (!mountedRef.current) return
    
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      if (!mountedRef.current) return
      
      setLoads(data || [])
      setError(null)
    } catch (err: any) {
      console.error('Error fetching loads:', err)
      if (mountedRef.current) {
        setError(err.message || 'Failed to load data')
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    
    // Initial fetch
    fetchLoads()
    
    // Set up polling for real-time updates (every 30s)
    const interval = setInterval(() => {
      if (mountedRef.current) {
        fetchLoads()
      }
    }, 30000)
    
    return () => {
      mountedRef.current = false
      clearInterval(interval)
    }
  }, [fetchLoads])

  const filteredAndSortedLoads = useMemo(() => {
    let filtered = loads.filter(load => {
      // Tab filter
      if (activeTab === 'all-live') {
        // Show all open loads
        if (load.status !== 'open') return false
      } else if (activeTab === 'on-demand') {
        // Show on-demand loads (if load_type field exists)
        if (load.status !== 'open' || (load.load_type && load.load_type !== 'on-demand')) return false
      } else if (activeTab === 'regular') {
        // Show regular loads
        if (load.status !== 'open' || (load.load_type && load.load_type !== 'regular')) return false
      } else if (activeTab === 'daily-hire') {
        // Show daily hire loads
        if (load.status !== 'open' || (load.load_type && load.load_type !== 'daily-hire')) return false
      }
      
      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'live' && load.status !== 'open') return false
        if (statusFilter === 'allocated' && !['assigned', 'in-transit'].includes(load.status)) return false
        if (statusFilter === 'delivered' && !['completed', 'delivered'].includes(load.status)) return false
        if (statusFilter === 'cancelled' && load.status !== 'cancelled') return false
      }
      
      // Postcode filters
      if (fromPostcode && !load.pickup_location?.toLowerCase().includes(fromPostcode.toLowerCase())) {
        return false
      }
      if (toPostcode && !load.delivery_location?.toLowerCase().includes(toPostcode.toLowerCase())) {
        return false
      }
      
      // Vehicle filter
      if (vehicleSize && load.vehicle_type !== vehicleSize) {
        return false
      }
      
      // Date filter
      if (dateFilter && load.pickup_datetime) {
        const loadDate = new Date(load.pickup_datetime).toISOString().split('T')[0]
        if (loadDate !== dateFilter) {
          return false
        }
      }
      
      return true
    })
    
    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else if (sortBy === 'distance') {
        return (b.distance_miles || 0) - (a.distance_miles || 0)
      } else if (sortBy === 'price') {
        return (b.budget || 0) - (a.budget || 0)
      }
      return 0
    })
    
    return filtered
  }, [loads, activeTab, statusFilter, fromPostcode, toPostcode, vehicleSize, dateFilter, sortBy])

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { className: string; label: string }> = {
      'open': { className: 'live', label: 'Live' },
      'assigned': { className: 'allocated', label: 'Allocated' },
      'in-transit': { className: 'allocated', label: 'Allocated' },
      'completed': { className: 'delivered', label: 'Delivered' },
      'delivered': { className: 'delivered', label: 'Delivered' },
      'cancelled': { className: 'cancelled', label: 'Cancelled' },
    }
    
    const statusInfo = statusMap[status] || { className: 'pending', label: status }
    
    return (
      <span className={`status-badge ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    )
  }

  const handlePlaceBid = async (load: Load) => {
    setSelectedLoad(load)
    setShowBidModal(true)
    setBidAmount(load.budget?.toString() || '')
    setBidMessage('')
  }

  const submitBid = async () => {
    if (!selectedLoad || !companyId || !user) return
    
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      alert('Please enter a valid bid amount')
      return
    }
    
    try {
      setSubmittingBid(true)
      
      // Check for existing bid
      const { data: existingBids } = await supabase
        .from('job_bids')
        .select('id')
        .eq('job_id', selectedLoad.id)
        .eq('bidder_company_id', companyId)
      
      if (existingBids && existingBids.length > 0) {
        alert('You have already placed a bid on this load')
        setShowBidModal(false)
        return
      }
      
      // Submit bid
      const { error: bidError } = await supabase
        .from('job_bids')
        .insert({
          job_id: selectedLoad.id,
          bidder_company_id: companyId,
          bidder_user_id: user.id,
          quote_amount: parseFloat(bidAmount),
          message: bidMessage || null,
          status: 'submitted'
        })
      
      if (bidError) throw bidError
      
      alert('Bid placed successfully!')
      setShowBidModal(false)
      setBidAmount('')
      setBidMessage('')
    } catch (err: any) {
      console.error('Error submitting bid:', err)
      alert('Failed to submit bid: ' + err.message)
    } finally {
      setSubmittingBid(false)
    }
  }

  if (loading && loads.length === 0) {
    return (
      <div className="loading-screen">
        Loading loads...
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error">
        Error: {error}
      </div>
    )
  }

  return (
    <>
      <div>
        {/* CX-Style Tabs Row */}
        <div className="loads-tabs">
          {[
            { id: 'all-live' as LoadTab, label: 'All Live' },
            { id: 'on-demand' as LoadTab, label: 'On Demand' },
            { id: 'regular' as LoadTab, label: 'Regular Load' },
            { id: 'daily-hire' as LoadTab, label: 'Daily Hire' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? 'loads-tab-active' : 'loads-tab'}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="loads-container">
          {/* LEFT COLUMN - Filter Panel */}
          <div className="loads-sidebar">
            <h3 className="loads-sidebar-title">
              Search Filters
            </h3>

            {/* Status Filter */}
            <div className="loads-filter-group">
              <label className="loads-filter-label">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="loads-filter-select"
              >
                <option value="all">All Loads</option>
                <option value="live">Live</option>
                <option value="allocated">Allocated</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* From Postcode */}
            <div className="loads-filter-group">
              <label className="loads-filter-label">
                From Postcode
              </label>
              <input
                type="text"
                value={fromPostcode}
                onChange={(e) => setFromPostcode(e.target.value)}
                placeholder="e.g. M1"
                className="loads-filter-input"
              />
            </div>

            {/* Radius */}
            <div className="loads-filter-group">
              <label className="loads-filter-label">
                Radius (miles)
              </label>
              <input
                type="number"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                placeholder="e.g. 50"
                className="loads-filter-input"
              />
            </div>

            {/* To Postcode */}
            <div className="loads-filter-group">
              <label className="loads-filter-label">
                To Postcode
              </label>
              <input
                type="text"
                value={toPostcode}
                onChange={(e) => setToPostcode(e.target.value)}
                placeholder="e.g. B1"
                className="loads-filter-input"
              />
            </div>

            {/* Vehicle Size */}
            <div className="loads-filter-group">
              <label className="loads-filter-label">
                Vehicle Size
              </label>
              <select
                value={vehicleSize}
                onChange={(e) => setVehicleSize(e.target.value)}
                className="loads-filter-select"
              >
                <option value="">All Vehicles</option>
                <option value="Small Van">Small Van</option>
                <option value="Medium Van">Medium Van</option>
                <option value="Large Van">Large Van</option>
                <option value="Luton Van">Luton Van</option>
                <option value="7.5 Tonne">7.5 Tonne</option>
                <option value="18 Tonne">18 Tonne</option>
                <option value="Artic">Artic</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="loads-filter-group">
              <label className="loads-filter-label">
                Pickup Date
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="loads-filter-input"
              />
            </div>

            {/* Sort By */}
            <div className="loads-filter-group">
              <label className="loads-filter-label">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="loads-filter-select"
              >
                <option value="date">Date (Newest)</option>
                <option value="distance">Distance</option>
                <option value="price">Price (Highest)</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <button
              onClick={() => {
                setStatusFilter('all')
                setFromPostcode('')
                setToPostcode('')
                setRadius('')
                setVehicleSize('')
                setDateFilter('')
                setSortBy('date')
              }}
              className="btn-clear-filters"
            >
              Clear Filters
            </button>
          </div>

          {/* RIGHT COLUMN - Results List */}
          <div className="loads-results">
            {/* Header */}
            <div className="loads-results-header">
              <h2 className="loads-results-title">
                Available Loads ({filteredAndSortedLoads.length})
              </h2>
              <button
                onClick={fetchLoads}
                className="loads-refresh-btn"
              >
                Refresh
              </button>
            </div>

            {/* Loads List */}
            <div>
              {filteredAndSortedLoads.length === 0 ? (
                <div className="loads-empty">
                  <div className="loads-empty-icon">📦</div>
                  <div className="loads-empty-title">
                    No loads found
                  </div>
                  <div className="loads-empty-text">
                    {statusFilter !== 'all' || fromPostcode || toPostcode || vehicleSize || dateFilter
                      ? 'Try adjusting your filters'
                      : 'No available loads at the moment'}
                  </div>
                </div>
              ) : (
                filteredAndSortedLoads.map((load) => (
                  <div key={load.id}>
                    {/* Load Row */}
                    <div
                      className={expandedLoadId === load.id ? 'load-item-expanded' : 'load-item'}
                      onClick={() => setExpandedLoadId(expandedLoadId === load.id ? null : load.id)}
                    >
                      <div className="load-item-header">
                        <div className="load-item-content">
                          <div className="load-item-title-row">
                            <div className="load-item-title">
                              {load.pickup_location} → {load.delivery_location}
                            </div>
                            {getStatusBadge(load.status)}
                          </div>
                          <div className="load-item-details">
                            {load.vehicle_type && <span>🚛 {load.vehicle_type}</span>}
                            {load.pickup_datetime && (
                              <span>📅 {new Date(load.pickup_datetime).toLocaleDateString()}</span>
                            )}
                            {load.budget && <span>💰 £{load.budget.toFixed(2)}</span>}
                            {load.distance_miles && <span>📍 {load.distance_miles} miles</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/loads/${load.id}`)
                            }}
                            className="btn-secondary"
                            style={{ padding: '8px 16px', fontSize: '14px' }}
                          >
                            View Details
                          </button>
                          {load.status === 'open' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePlaceBid(load)
                              }}
                              className="btn-quote"
                            >
                              Quote Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {expandedLoadId === load.id && (
                      <div className="load-item-expanded-details">
                        <div className="load-details-grid">
                          {load.pallets && (
                            <div>
                              <strong>Pallets:</strong> {load.pallets}
                            </div>
                          )}
                          {load.weight_kg && (
                            <div>
                              <strong>Weight:</strong> {load.weight_kg} kg
                            </div>
                          )}
                          {load.delivery_datetime && (
                            <div>
                              <strong>Delivery:</strong>{' '}
                              {new Date(load.delivery_datetime).toLocaleDateString()}
                            </div>
                          )}
                          <div>
                            <strong>Posted:</strong>{' '}
                            {new Date(load.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        {load.load_details && (
                          <div className="load-details-full">
                            <strong>Details:</strong>
                            <div className="load-details-text">
                              {load.load_details}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      {showBidModal && selectedLoad && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">
              Place Bid
            </h3>
            
            <div className="bid-modal-info">
              <div className="bid-modal-info-title">
                {selectedLoad.pickup_location} → {selectedLoad.delivery_location}
              </div>
              <div className="bid-modal-info-text">
                {selectedLoad.vehicle_type} • Budget: £{selectedLoad.budget?.toFixed(2) || 'N/A'}
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">
                Bid Amount (£) *
              </label>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                step="0.01"
                className="form-input"
              />
            </div>

            <div className="form-field">
              <label className="form-label">
                Message (Optional)
              </label>
              <textarea
                value={bidMessage}
                onChange={(e) => setBidMessage(e.target.value)}
                rows={3}
                className="form-input"
                placeholder="Add any notes or details..."
              />
            </div>

            <div className="btn-group">
              <button
                onClick={() => setShowBidModal(false)}
                disabled={submittingBid}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={submitBid}
                disabled={submittingBid}
                className="btn-success"
              >
                {submittingBid ? 'Submitting...' : 'Submit Bid'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

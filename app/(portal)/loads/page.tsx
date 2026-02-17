'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'

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

  useEffect(() => {
    fetchLoads()
    
    // Set up polling for real-time updates (every 30s)
    const interval = setInterval(() => {
      fetchLoads()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [companyId])

  const fetchLoads = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      setLoads(data || [])
    } catch (err: any) {
      console.error('Error fetching loads:', err)
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

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
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      'open': { bg: '#dbeafe', color: '#1e40af', label: 'Live' },
      'assigned': { bg: '#fef3c7', color: '#92400e', label: 'Allocated' },
      'in-transit': { bg: '#fef3c7', color: '#92400e', label: 'Allocated' },
      'completed': { bg: '#d1fae5', color: '#065f46', label: 'Delivered' },
      'delivered': { bg: '#d1fae5', color: '#065f46', label: 'Delivered' },
      'cancelled': { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
    }
    
    const style = styles[status] || { bg: '#f3f4f6', color: '#6b7280', label: status }
    
    return (
      <span style={{
        padding: '3px 10px',
        background: style.bg,
        color: style.color,
        fontSize: '11px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        {style.label}
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
      <div>
        {/* Loading Skeleton */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          padding: '16px',
          marginBottom: '20px',
        }}>
          <div style={{
            height: '40px',
            background: '#f3f4f6',
            marginBottom: '12px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          <div style={{
            height: '20px',
            background: '#f3f4f6',
            width: '60%',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '20px',
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            padding: '16px',
            height: '400px',
          }}>
            <div style={{
              height: '20px',
              background: '#f3f4f6',
              marginBottom: '12px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{
                height: '60px',
                background: '#f3f4f6',
                marginBottom: '12px',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            ))}
          </div>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            padding: '16px',
          }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: '80px',
                background: '#f3f4f6',
                marginBottom: '12px',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px', 
        color: '#ef4444',
        background: '#fef2f2',
        border: '1px solid #fecaca',
      }}>
        Error: {error}
      </div>
    )
  }

  return (
    <>
      <div>
        {/* CX-Style Tabs Row */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderBottom: 'none',
          display: 'flex',
          gap: '0',
          marginBottom: '0',
        }}>
          {[
            { id: 'all-live' as LoadTab, label: 'All Live' },
            { id: 'on-demand' as LoadTab, label: 'On Demand' },
            { id: 'regular' as LoadTab, label: 'Regular Load' },
            { id: 'daily-hire' as LoadTab, label: 'Daily Hire' },
          ].map(tab => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 24px',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '3px solid #d4af37' : '3px solid transparent',
                background: activeTab === tab.id ? '#ffffff' : 'transparent',
                color: activeTab === tab.id ? '#1f2937' : '#6b7280',
                fontSize: '13px',
                fontWeight: activeTab === tab.id ? '700' : '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = '#f9fafb'
                  e.currentTarget.style.color = '#1f2937'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#6b7280'
                }
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 156px)' }}>
          {/* LEFT COLUMN - Filter Panel */}
          <div style={{
            width: '280px',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            padding: '16px',
            height: 'fit-content',
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Search Filters
            </h3>

            {/* Status Filter */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px',
              }}>
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #d1d5db',
                  fontSize: '13px',
                  color: '#1f2937',
                }}
              >
                <option value="all">All Loads</option>
                <option value="live">Live</option>
                <option value="allocated">Allocated</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* From Postcode */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px',
              }}>
                From Postcode
              </label>
              <input
                type="text"
                value={fromPostcode}
                onChange={(e) => setFromPostcode(e.target.value)}
                placeholder="e.g. M1"
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #d1d5db',
                  fontSize: '13px',
                  color: '#1f2937',
                }}
              />
            </div>

            {/* Radius */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px',
              }}>
                Radius (miles)
              </label>
              <input
                type="number"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                placeholder="e.g. 50"
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #d1d5db',
                  fontSize: '13px',
                  color: '#1f2937',
                }}
              />
            </div>

            {/* To Postcode */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px',
              }}>
                To Postcode
              </label>
              <input
                type="text"
                value={toPostcode}
                onChange={(e) => setToPostcode(e.target.value)}
                placeholder="e.g. B1"
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #d1d5db',
                  fontSize: '13px',
                  color: '#1f2937',
                }}
              />
            </div>

            {/* Vehicle Size */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px',
              }}>
                Vehicle Size
              </label>
              <select
                value={vehicleSize}
                onChange={(e) => setVehicleSize(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #d1d5db',
                  fontSize: '13px',
                  color: '#1f2937',
                }}
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
            <div style={{ marginBottom: '14px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px',
              }}>
                Pickup Date
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #d1d5db',
                  fontSize: '13px',
                  color: '#1f2937',
                }}
              />
            </div>

            {/* Sort By */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px',
              }}>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #d1d5db',
                  fontSize: '13px',
                  color: '#1f2937',
                }}
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
              style={{
                width: '100%',
                padding: '8px',
                background: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '8px',
              }}
            >
              Clear Filters
            </button>
          </div>

          {/* RIGHT COLUMN - Results List */}
          <div style={{
            flex: 1,
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            overflowY: 'auto',
          }}>
            {/* Header */}
            <div style={{
              padding: '12px 16px',
              background: '#f9fafb',
              borderBottom: '1px solid #e5e7eb',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <h2 style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#1f2937',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Available Loads ({filteredAndSortedLoads.length})
                </h2>
                <button
                  onClick={fetchLoads}
                  style={{
                    padding: '4px 12px',
                    background: '#ffffff',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* Loads List */}
            <div>
              {filteredAndSortedLoads.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#9ca3af',
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                    No loads found
                  </div>
                  <div style={{ fontSize: '13px' }}>
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
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #e5e7eb',
                        cursor: 'pointer',
                        background: expandedLoadId === load.id ? '#f9fafb' : '#ffffff',
                        transition: 'background 0.15s',
                      }}
                      onClick={() => setExpandedLoadId(expandedLoadId === load.id ? null : load.id)}
                      onMouseEnter={(e) => {
                        if (expandedLoadId !== load.id) {
                          e.currentTarget.style.background = '#fafafa'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (expandedLoadId !== load.id) {
                          e.currentTarget.style.background = '#ffffff'
                        }
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '6px',
                          }}>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#1f2937',
                            }}>
                              {load.pickup_location} → {load.delivery_location}
                            </div>
                            {getStatusBadge(load.status)}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            display: 'flex',
                            gap: '16px',
                          }}>
                            {load.vehicle_type && <span>🚛 {load.vehicle_type}</span>}
                            {load.pickup_datetime && (
                              <span>📅 {new Date(load.pickup_datetime).toLocaleDateString()}</span>
                            )}
                            {load.budget && <span>💰 £{load.budget.toFixed(2)}</span>}
                            {load.distance_miles && <span>📍 {load.distance_miles} miles</span>}
                          </div>
                        </div>
                        {load.status === 'open' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePlaceBid(load)
                            }}
                            style={{
                              padding: '6px 16px',
                              background: '#10b981',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              textTransform: 'uppercase',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#059669'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#10b981'
                            }}
                          >
                            Quote Now
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {expandedLoadId === load.id && (
                      <div style={{
                        padding: '16px',
                        background: '#f9fafb',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '13px',
                        color: '#374151',
                      }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '12px',
                          marginBottom: '12px',
                        }}>
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
                          <div style={{ marginTop: '8px' }}>
                            <strong>Details:</strong>
                            <div style={{ marginTop: '4px', color: '#6b7280' }}>
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
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            padding: '24px',
            width: '500px',
            maxWidth: '90%',
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '16px',
              textTransform: 'uppercase',
            }}>
              Place Bid
            </h3>
            
            <div style={{ marginBottom: '16px', padding: '12px', background: '#f9fafb', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                {selectedLoad.pickup_location} → {selectedLoad.delivery_location}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {selectedLoad.vehicle_type} • Budget: £{selectedLoad.budget?.toFixed(2) || 'N/A'}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px',
              }}>
                Bid Amount (£) *
              </label>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                step="0.01"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  color: '#1f2937',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px',
              }}>
                Message (Optional)
              </label>
              <textarea
                value={bidMessage}
                onChange={(e) => setBidMessage(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '13px',
                  color: '#1f2937',
                  resize: 'vertical',
                }}
                placeholder="Add any notes or details..."
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowBidModal(false)}
                disabled={submittingBid}
                style={{
                  padding: '8px 16px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: submittingBid ? 'not-allowed' : 'pointer',
                  opacity: submittingBid ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitBid}
                disabled={submittingBid}
                style={{
                  padding: '8px 16px',
                  background: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: submittingBid ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase',
                  opacity: submittingBid ? 0.5 : 1,
                }}
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

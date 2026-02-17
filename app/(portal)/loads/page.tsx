'use client'

import { useEffect, useState } from 'react'
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
}

export default function LoadsPage() {
  const router = useRouter()
  const { companyId } = useAuth()
  
  const [loads, setLoads] = useState<Load[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedLoadId, setExpandedLoadId] = useState<string | null>(null)
  
  // Filter states
  const [fromPostcode, setFromPostcode] = useState('')
  const [toPostcode, setToPostcode] = useState('')
  const [vehicleSize, setVehicleSize] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    fetchLoads()
  }, [companyId])

  const fetchLoads = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'open')
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

  const filteredLoads = loads.filter(load => {
    if (fromPostcode && !load.pickup_location?.toLowerCase().includes(fromPostcode.toLowerCase())) {
      return false
    }
    if (toPostcode && !load.delivery_location?.toLowerCase().includes(toPostcode.toLowerCase())) {
      return false
    }
    if (vehicleSize && load.vehicle_type !== vehicleSize) {
      return false
    }
    if (dateFilter && load.pickup_datetime) {
      const loadDate = new Date(load.pickup_datetime).toISOString().split('T')[0]
      if (loadDate !== dateFilter) {
        return false
      }
    }
    return true
  })

  const handleQuoteNow = (loadId: string) => {
    router.push(`/loads/${loadId}`)
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
        Loading loads...
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
        borderRadius: '4px'
      }}>
        Error: {error}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 96px)' }}>
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

        {/* Clear Filters Button */}
        <button
          onClick={() => {
            setFromPostcode('')
            setToPostcode('')
            setVehicleSize('')
            setDateFilter('')
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
              Available Loads ({filteredLoads.length})
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
          {filteredLoads.length === 0 ? (
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
                {fromPostcode || toPostcode || vehicleSize || dateFilter
                  ? 'Try adjusting your filters'
                  : 'No available loads at the moment'}
              </div>
            </div>
          ) : (
            filteredLoads.map((load) => (
              <div key={load.id}>
                {/* Load Row - Flat list style */}
                <div
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    background: expandedLoadId === load.id ? '#f9fafb' : '#ffffff',
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
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '6px',
                      }}>
                        {load.pickup_location} → {load.delivery_location}
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
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleQuoteNow(load.id)
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
                  </div>
                </div>

                {/* Expandable Details Section */}
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
  )
}

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
  pickup_datetime: string
  delivery_datetime: string
  vehicle_type: string
  distance_miles?: number
  status: string
  budget?: number
}

type FilterTab = 'all' | 'live' | 'allocated' | 'delivered'

export default function LoadsPage() {
  const router = useRouter()
  const { companyId } = useAuth()
  
  const [loads, setLoads] = useState<Load[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')

  useEffect(() => {
    if (!companyId) return
    
    const fetchLoads = async () => {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        setLoads(data || [])
      } catch (err: any) {
        console.error('Error fetching loads:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchLoads()
  }, [companyId])

  // Filter loads based on active tab
  const filteredLoads = useMemo(() => {
    if (activeFilter === 'all') return loads
    if (activeFilter === 'live') return loads.filter(l => l.status === 'open')
    if (activeFilter === 'allocated') return loads.filter(l => l.status === 'assigned' || l.status === 'in-transit')
    if (activeFilter === 'delivered') return loads.filter(l => l.status === 'completed' || l.status === 'delivered')
    return loads
  }, [loads, activeFilter])

  const getStatusBadge = (status: string) => {
    let bgColor = '#DBEAFE'
    let textColor = '#1E40AF'
    let label = status

    if (status === 'open') {
      bgColor = '#DBEAFE'
      textColor = '#1E40AF'
      label = 'Live'
    } else if (status === 'assigned' || status === 'in-transit') {
      bgColor = '#FED7AA'
      textColor = '#C2410C'
      label = 'Allocated'
    } else if (status === 'completed' || status === 'delivered') {
      bgColor = '#D1FAE5'
      textColor = '#065F46'
      label = 'Delivered'
    }

    return (
      <span style={{
        display: 'inline-block',
        padding: '4px 10px',
        fontSize: '11px',
        fontWeight: '600',
        borderRadius: '2px',
        backgroundColor: bgColor,
        color: textColor,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        {label}
      </span>
    )
  }

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  }

  const filterTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: loads.length },
    { key: 'live', label: 'Live', count: loads.filter(l => l.status === 'open').length },
    { key: 'allocated', label: 'Allocated', count: loads.filter(l => l.status === 'assigned' || l.status === 'in-transit').length },
    { key: 'delivered', label: 'Delivered', count: loads.filter(l => l.status === 'completed' || l.status === 'delivered').length },
  ]

  return (
    <div style={{
      maxWidth: '1600px',
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '16px',
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#111827',
          margin: '0 0 4px 0',
        }}>
          Loads
        </h1>
        <div style={{
          fontSize: '13px',
          color: '#6b7280',
        }}>
          Manage and track all transport loads
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '16px',
        borderBottom: '1px solid #e5e7eb',
      }}>
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            style={{
              background: activeFilter === tab.key ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeFilter === tab.key ? '2px solid #d4af37' : '2px solid transparent',
              padding: '10px 16px',
              fontSize: '12px',
              fontWeight: '600',
              color: activeFilter === tab.key ? '#111827' : '#6b7280',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '-1px',
            }}
            onMouseEnter={(e) => {
              if (activeFilter !== tab.key) {
                e.currentTarget.style.color = '#111827'
              }
            }}
            onMouseLeave={(e) => {
              if (activeFilter !== tab.key) {
                e.currentTarget.style.color = '#6b7280'
              }
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '4px',
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1fr 0.8fr 0.8fr 0.8fr',
          gap: '12px',
          padding: '12px 16px',
          background: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          fontSize: '11px',
          fontWeight: '600',
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          <div>From</div>
          <div>To</div>
          <div>Pickup</div>
          <div>Delivery</div>
          <div>Vehicle</div>
          <div>Distance</div>
          <div>Status</div>
          <div>Action</div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '13px',
          }}>
            Loading loads...
          </div>
        ) : filteredLoads.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '13px',
          }}>
            No loads found
          </div>
        ) : (
          filteredLoads.map((load, index) => (
            <div
              key={load.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1fr 0.8fr 0.8fr 0.8fr',
                gap: '12px',
                padding: '12px 16px',
                borderBottom: index < filteredLoads.length - 1 ? '1px solid #f3f4f6' : 'none',
                fontSize: '13px',
                color: '#374151',
                alignItems: 'center',
                maxHeight: '56px',
                minHeight: '56px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f9fafb'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <div style={{
                fontWeight: '500',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {load.pickup_location || 'N/A'}
              </div>
              <div style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {load.delivery_location || 'N/A'}
              </div>
              <div style={{ fontSize: '12px' }}>
                {formatDateTime(load.pickup_datetime)}
              </div>
              <div style={{ fontSize: '12px' }}>
                {formatDateTime(load.delivery_datetime)}
              </div>
              <div style={{ fontSize: '12px' }}>
                {load.vehicle_type || 'Van'}
              </div>
              <div style={{ fontSize: '12px' }}>
                {load.distance_miles ? `${load.distance_miles}mi` : '-'}
              </div>
              <div>
                {getStatusBadge(load.status)}
              </div>
              <div>
                <button
                  onClick={() => router.push(`/loads/${load.id}`)}
                  style={{
                    background: 'transparent',
                    border: '1px solid #d1d5db',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#374151',
                    cursor: 'pointer',
                    borderRadius: '2px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#9ca3af'
                    e.currentTarget.style.background = '#f9fafb'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db'
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

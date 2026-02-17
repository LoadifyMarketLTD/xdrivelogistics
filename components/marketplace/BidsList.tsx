'use client'

import { useState, useMemo } from 'react'
import StatusBadge from '@/components/StatusBadge'

interface Bid {
  id: string
  quote_amount: number
  message?: string | null
  status: string
  created_at: string
  bidder_company?: {
    id: string
    name: string
  }
}

interface BidsListProps {
  bids: Bid[]
  isJobOwner: boolean
  onAcceptBid?: (bidId: string) => void
  onRejectBid?: (bidId: string) => void
}

export default function BidsList({ bids, isJobOwner, onAcceptBid, onRejectBid }: BidsListProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'accepted' | 'rejected'>('all')

  // Sort and filter bids
  const filteredAndSortedBids = useMemo(() => {
    let filtered = [...bids]

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(bid => bid.status === filterStatus)
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'amount') {
        return a.quote_amount - b.quote_amount
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    return filtered
  }, [bids, filterStatus, sortBy])

  const statusCounts = {
    all: bids.length,
    submitted: bids.filter(b => b.status === 'submitted').length,
    accepted: bids.filter(b => b.status === 'accepted').length,
    rejected: bids.filter(b => b.status === 'rejected').length
  }

  return (
    <div style={{
      backgroundColor: '#132433',
      borderRadius: '12px',
      padding: '32px',
      border: '1px solid rgba(255,255,255,0.08)',
      marginBottom: '24px'
    }}>
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          marginBottom: isExpanded ? '20px' : '0'
        }}
      >
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', margin: 0 }}>
          {isJobOwner ? 'Bids Received' : 'All Bids'} ({bids.length})
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px', color: '#94a3b8' }}>
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Filters and Sort */}
          {bids.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '20px',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              {/* Status Filter */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(['all', 'submitted', 'accepted', 'rejected'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: filterStatus === status ? 'var(--gold-premium)' : 'transparent',
                      color: filterStatus === status ? '#0B1623' : '#fff',
                      border: '1px solid ' + (filterStatus === status ? 'var(--gold-premium)' : 'rgba(255,255,255,0.2)'),
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#0B1623',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '13px',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="date">Latest First</option>
                  <option value="amount">Lowest Price</option>
                </select>
              </div>
            </div>
          )}

          {/* Bids List */}
          {filteredAndSortedBids.length === 0 ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#94a3b8'
            }}>
              {bids.length === 0 ? (
                <>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                  <div style={{ fontSize: '16px', marginBottom: '8px' }}>No bids yet</div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>
                    {isJobOwner ? 'Share your job to attract carriers!' : 'Be the first to place a bid!'}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                  <div style={{ fontSize: '16px' }}>No bids match your filter</div>
                </>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredAndSortedBids.map((bid) => (
                <div
                  key={bid.id}
                  style={{
                    padding: '20px',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ fontSize: '24px', color: 'var(--gold-premium)', fontWeight: '700' }}>
                          £{bid.quote_amount.toFixed(2)}
                        </div>
                        <StatusBadge status={bid.status} size="small" />
                      </div>
                      {bid.bidder_company && (
                        <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                          by {bid.bidder_company.name}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'right' }}>
                      {new Date(bid.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                      <br />
                      {new Date(bid.created_at).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {bid.message && (
                    <div style={{
                      marginTop: '12px',
                      padding: '12px',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#94a3b8',
                      lineHeight: '1.6'
                    }}>
                      <strong style={{ color: '#fff' }}>Message:</strong> {bid.message}
                    </div>
                  )}

                  {isJobOwner && bid.status === 'submitted' && onAcceptBid && onRejectBid && (
                    <div style={{
                      marginTop: '16px',
                      paddingTop: '16px',
                      borderTop: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      gap: '12px'
                    }}>
                      <button
                        onClick={() => onAcceptBid(bid.id)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: 'var(--gold-premium)',
                          color: '#0B1623',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        ✅ Accept Bid
                      </button>
                      <button
                        onClick={() => onRejectBid(bid.id)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: 'transparent',
                          color: '#ef4444',
                          border: '1px solid #ef4444',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

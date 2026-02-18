'use client'

import React from 'react'

interface JobStatusEvent {
  id: string
  status: string
  timestamp: Date | string
  actor?: string
  notes?: string
  location?: {
    lat: number
    lng: number
  }
}

interface StatusTimelineProps {
  events: JobStatusEvent[]
  currentStatus: string
  className?: string
}

// Status order for sequential workflow
const STATUS_ORDER = {
  'ALLOCATED': 0,
  'ON_MY_WAY_TO_PICKUP': 1,
  'ON_SITE_PICKUP': 2,
  'PICKED_UP': 3,
  'ON_MY_WAY_TO_DELIVERY': 4,
  'ON_SITE_DELIVERY': 5,
  'DELIVERED': 6,
  'CANCELLED': 99, // Special - can happen anytime
}

const ALL_STATUSES = [
  'ALLOCATED',
  'ON_MY_WAY_TO_PICKUP',
  'ON_SITE_PICKUP',
  'PICKED_UP',
  'ON_MY_WAY_TO_DELIVERY',
  'ON_SITE_DELIVERY',
  'DELIVERED',
]

function getStatusOrder(status: string): number {
  return STATUS_ORDER[status as keyof typeof STATUS_ORDER] ?? -1
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'ALLOCATED': 'Allocated',
    'ON_MY_WAY_TO_PICKUP': 'On My Way to Pickup',
    'ON_SITE_PICKUP': 'On Site for Pickup',
    'PICKED_UP': 'Picked Up',
    'ON_MY_WAY_TO_DELIVERY': 'On My Way to Delivery',
    'ON_SITE_DELIVERY': 'On Site for Delivery',
    'DELIVERED': 'Delivered',
    'CANCELLED': 'Cancelled',
  }
  return labels[status] || status
}

function getStatusColor(status: string, isCompleted: boolean, isCurrent: boolean): string {
  if (status === 'CANCELLED') return '#ef4444' // Red
  if (isCompleted) return '#22c55e' // Green
  if (isCurrent) return '#d4af37' // Gold
  return '#9ca3af' // Gray
}

function formatTimestamp(timestamp: Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function StatusTimeline({ events, currentStatus, className = '' }: StatusTimelineProps) {
  const currentOrder = getStatusOrder(currentStatus)
  const isCancelled = currentStatus === 'CANCELLED'

  // Create a map of status to event
  const eventMap = new Map<string, JobStatusEvent>()
  events.forEach(event => {
    eventMap.set(event.status, event)
  })

  // Build timeline items
  const timelineItems = ALL_STATUSES.map(status => {
    const order = getStatusOrder(status)
    const event = eventMap.get(status)
    const isCompleted = event !== undefined && order < currentOrder
    const isCurrent = status === currentStatus && !isCancelled
    const isPending = !event && order > currentOrder && !isCancelled

    return {
      status,
      order,
      event,
      isCompleted,
      isCurrent,
      isPending,
    }
  })

  // Add cancelled if exists
  if (isCancelled) {
    const cancelledEvent = eventMap.get('CANCELLED')
    if (cancelledEvent) {
      timelineItems.push({
        status: 'CANCELLED',
        order: 99,
        event: cancelledEvent,
        isCompleted: false,
        isCurrent: true,
        isPending: false,
      })
    }
  }

  return (
    <div className={className}>
      <style jsx>{`
        .timeline-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .timeline-title {
          font-size: clamp(1rem, 1.5vw, 1.25rem);
          font-weight: 600;
          color: #1f2937;
          margin-bottom: clamp(16px, 2.5vw, 24px);
        }

        .timeline {
          position: relative;
          padding-left: clamp(32px, 4vw, 48px);
        }

        .timeline-item {
          position: relative;
          padding-bottom: clamp(24px, 3vw, 32px);
        }

        .timeline-item:last-child {
          padding-bottom: 0;
        }

        .timeline-line {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #e5e7eb;
        }

        .timeline-item:last-child .timeline-line {
          display: none;
        }

        .timeline-dot {
          position: absolute;
          left: -9px;
          top: 4px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }

        .timeline-dot.completed {
          background: #22c55e;
          border-color: #22c55e;
        }

        .timeline-dot.current {
          background: #d4af37;
          border-color: #d4af37;
          animation: pulse 2s infinite;
        }

        .timeline-dot.pending {
          border-color: #9ca3af;
          background: white;
        }

        .timeline-dot.cancelled {
          background: #ef4444;
          border-color: #ef4444;
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(212, 175, 55, 0);
          }
        }

        .check-icon {
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        .clock-icon {
          color: #9ca3af;
          font-size: 10px;
        }

        .timeline-content {
          padding-left: clamp(12px, 2vw, 16px);
        }

        .status-label {
          font-size: clamp(0.875rem, 1.2vw, 1rem);
          font-weight: 600;
          margin-bottom: 4px;
        }

        .status-label.completed {
          color: #22c55e;
        }

        .status-label.current {
          color: #d4af37;
        }

        .status-label.pending {
          color: #9ca3af;
        }

        .status-label.cancelled {
          color: #ef4444;
        }

        .status-meta {
          font-size: clamp(0.75rem, 1.1vw, 0.875rem);
          color: #6b7280;
          margin-bottom: 4px;
        }

        .status-timestamp {
          font-weight: 500;
        }

        .status-actor {
          color: #4b5563;
        }

        .status-notes {
          font-size: clamp(0.75rem, 1.1vw, 0.875rem);
          color: #4b5563;
          margin-top: 8px;
          padding: 8px 12px;
          background: #f9fafb;
          border-radius: 6px;
          border-left: 3px solid #d4af37;
        }

        .status-location {
          font-size: clamp(0.75rem, 1.1vw, 0.875rem);
          color: #6b7280;
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .location-icon {
          color: #d4af37;
        }
      `}</style>

      <div className="timeline-container">
        <h3 className="timeline-title">Status Timeline</h3>
        
        <div className="timeline">
          {timelineItems.map((item, index) => {
            const color = getStatusColor(item.status, item.isCompleted, item.isCurrent)
            let dotClass = 'timeline-dot'
            let labelClass = 'status-label'
            
            if (item.isCompleted) {
              dotClass += ' completed'
              labelClass += ' completed'
            } else if (item.isCurrent) {
              dotClass += ' current'
              labelClass += ' current'
            } else if (item.isPending) {
              dotClass += ' pending'
              labelClass += ' pending'
            } else if (item.status === 'CANCELLED') {
              dotClass += ' cancelled'
              labelClass += ' cancelled'
            }

            return (
              <div key={item.status} className="timeline-item">
                {index < timelineItems.length - 1 && (
                  <div className="timeline-line" />
                )}
                
                <div className={dotClass}>
                  {item.isCompleted && (
                    <span className="check-icon">✓</span>
                  )}
                  {item.isPending && (
                    <span className="clock-icon">○</span>
                  )}
                </div>

                <div className="timeline-content">
                  <div className={labelClass}>
                    {getStatusLabel(item.status)}
                  </div>

                  {item.event && (
                    <>
                      <div className="status-meta">
                        <span className="status-timestamp">
                          {formatTimestamp(item.event.timestamp)}
                        </span>
                        {item.event.actor && (
                          <span className="status-actor"> • by {item.event.actor}</span>
                        )}
                      </div>

                      {item.event.notes && (
                        <div className="status-notes">
                          {item.event.notes}
                        </div>
                      )}

                      {item.event.location && (
                        <div className="status-location">
                          <span className="location-icon">📍</span>
                          <span>
                            {item.event.location.lat.toFixed(5)}, {item.event.location.lng.toFixed(5)}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {item.isPending && (
                    <div className="status-meta">
                      Pending
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

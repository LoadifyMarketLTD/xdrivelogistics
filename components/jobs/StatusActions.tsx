'use client'

import React, { useState } from 'react'

interface StatusActionsProps {
  jobId: string
  currentStatus: string
  onStatusUpdate: (newStatus: string, notes?: string) => Promise<void>
  disabled?: boolean
  className?: string
}

// Define valid transitions
const STATUS_TRANSITIONS: Record<string, { next: string; label: string; icon: string }[]> = {
  'ALLOCATED': [
    { next: 'ON_MY_WAY_TO_PICKUP', label: 'Start Journey to Pickup', icon: '🚗' },
  ],
  'ON_MY_WAY_TO_PICKUP': [
    { next: 'ON_SITE_PICKUP', label: 'Mark On Site for Pickup', icon: '📍' },
  ],
  'ON_SITE_PICKUP': [
    { next: 'PICKED_UP', label: 'Confirm Pickup Complete', icon: '✓' },
  ],
  'PICKED_UP': [
    { next: 'ON_MY_WAY_TO_DELIVERY', label: 'Start Journey to Delivery', icon: '🚚' },
  ],
  'ON_MY_WAY_TO_DELIVERY': [
    { next: 'ON_SITE_DELIVERY', label: 'Mark On Site for Delivery', icon: '📍' },
  ],
  'ON_SITE_DELIVERY': [
    { next: 'DELIVERED', label: 'Confirm Delivery Complete', icon: '✓' },
  ],
  'DELIVERED': [],
  'CANCELLED': [],
}

function getButtonColor(nextStatus: string): string {
  if (nextStatus === 'PICKED_UP' || nextStatus === 'DELIVERED') {
    return '#22c55e' // Green for completion steps
  }
  if (nextStatus.includes('ON_SITE')) {
    return '#f59e0b' // Amber for on-site
  }
  if (nextStatus.includes('ON_MY_WAY')) {
    return '#3b82f6' // Blue for in-transit
  }
  return '#d4af37' // Gold default
}

export default function StatusActions({
  jobId,
  currentStatus,
  onStatusUpdate,
  disabled = false,
  className = '',
}: StatusActionsProps) {
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [showNotesFor, setShowNotesFor] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const availableActions = STATUS_TRANSITIONS[currentStatus] || []

  const handleStatusUpdate = async (newStatus: string) => {
    if (disabled || loading) return

    setError(null)
    setLoading(true)

    try {
      await onStatusUpdate(newStatus, notes || undefined)
      setNotes('')
      setShowNotesFor(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  if (availableActions.length === 0) {
    return (
      <div className={className}>
        <style jsx>{`
          .no-actions {
            text-align: center;
            padding: clamp(24px, 4vw, 32px);
            background: #f9fafb;
            border-radius: 12px;
            border: 2px dashed #e5e7eb;
          }

          .no-actions-text {
            font-size: clamp(0.875rem, 1.2vw, 1rem);
            color: #6b7280;
          }

          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            background: #22c55e;
            color: white;
            border-radius: 20px;
            font-weight: 600;
            margin-top: 12px;
            font-size: clamp(0.875rem, 1.2vw, 1rem);
          }

          .status-badge.cancelled {
            background: #ef4444;
          }
        `}</style>
        
        <div className="no-actions">
          <div className="no-actions-text">
            {currentStatus === 'DELIVERED' ? 'Job completed successfully!' : 'No actions available'}
          </div>
          <div className={`status-badge ${currentStatus === 'CANCELLED' ? 'cancelled' : ''}`}>
            {currentStatus === 'DELIVERED' ? '✓ Delivered' : currentStatus}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <style jsx>{`
        .actions-container {
          max-width: 600px;
          margin: 0 auto;
        }

        .actions-title {
          font-size: clamp(1rem, 1.5vw, 1.25rem);
          font-weight: 600;
          color: #1f2937;
          margin-bottom: clamp(16px, 2.5vw, 24px);
        }

        .actions-list {
          display: flex;
          flex-direction: column;
          gap: clamp(12px, 2vw, 16px);
        }

        .action-item {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .action-button {
          width: 100%;
          padding: clamp(14px, 2.5vw, 18px) clamp(20px, 3vw, 28px);
          border: none;
          border-radius: 12px;
          font-size: clamp(0.875rem, 1.3vw, 1.125rem);
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .action-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }

        .action-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-icon {
          font-size: clamp(1.25rem, 2vw, 1.5rem);
        }

        .notes-section {
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .notes-label {
          font-size: clamp(0.875rem, 1.2vw, 1rem);
          font-weight: 500;
          color: #4b5563;
          margin-bottom: 8px;
          display: block;
        }

        .notes-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: clamp(0.875rem, 1.2vw, 1rem);
          font-family: inherit;
          resize: vertical;
          min-height: 80px;
        }

        .notes-input:focus {
          outline: none;
          border-color: #d4af37;
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
        }

        .toggle-notes-button {
          background: none;
          border: none;
          color: #d4af37;
          font-size: clamp(0.875rem, 1.2vw, 1rem);
          font-weight: 500;
          cursor: pointer;
          padding: 8px 0;
          text-decoration: underline;
        }

        .toggle-notes-button:hover {
          color: #b8941f;
        }

        .error-message {
          padding: 12px 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
          font-size: clamp(0.875rem, 1.2vw, 1rem);
          margin-bottom: 16px;
        }

        .cancel-button {
          background: #ef4444;
          margin-top: clamp(16px, 2.5vw, 24px);
          padding: clamp(10px, 2vw, 14px) clamp(16px, 2.5vw, 24px);
          font-size: clamp(0.875rem, 1.2vw, 1rem);
        }

        .cancel-button:hover:not(:disabled) {
          background: #dc2626;
        }
      `}</style>

      <div className="actions-container">
        <h3 className="actions-title">Update Status</h3>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="actions-list">
          {availableActions.map((action) => {
            const buttonColor = getButtonColor(action.next)
            const showNotes = showNotesFor === action.next

            return (
              <div key={action.next} className="action-item">
                <button
                  className="action-button"
                  style={{ background: buttonColor }}
                  onClick={() => handleStatusUpdate(action.next)}
                  disabled={disabled || loading}
                >
                  <span className="action-icon">{action.icon}</span>
                  <span>{action.label}</span>
                </button>

                <button
                  className="toggle-notes-button"
                  onClick={() => setShowNotesFor(showNotes ? null : action.next)}
                  type="button"
                >
                  {showNotes ? 'Hide Notes' : 'Add Notes (Optional)'}
                </button>

                {showNotes && (
                  <div className="notes-section">
                    <label className="notes-label">
                      Notes for this status update:
                    </label>
                    <textarea
                      className="notes-input"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Enter any additional information..."
                      disabled={loading}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Allow cancellation from any status except DELIVERED/CANCELLED */}
        {currentStatus !== 'DELIVERED' && currentStatus !== 'CANCELLED' && (
          <button
            className="action-button cancel-button"
            onClick={() => {
              if (confirm('Are you sure you want to cancel this job?')) {
                handleStatusUpdate('CANCELLED')
              }
            }}
            disabled={disabled || loading}
          >
            <span className="action-icon">✕</span>
            <span>Cancel Job</span>
          </button>
        )}
      </div>
    </div>
  )
}

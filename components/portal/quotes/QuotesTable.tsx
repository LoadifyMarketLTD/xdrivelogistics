'use client'

import { useRouter } from 'next/navigation'
import StatusPill from '../StatusPill'

interface Quote {
  id: string
  created_at: string
  quote_amount: number
  message: string | null
  status: string
  job: {
    id: string
    pickup_location: string
    delivery_location: string
    pickup_datetime: string | null
    vehicle_type: string | null
    status: string
  }
}

interface QuotesTableProps {
  quotes: Quote[]
  onWithdraw?: (quoteId: string) => void
}

export default function QuotesTable({ quotes, onWithdraw }: QuotesTableProps) {
  const router = useRouter()
  
  const getStatusVariant = (status: string): 'success' | 'warning' | 'info' | 'error' => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'success'
      case 'rejected':
      case 'withdrawn':
        return 'error'
      case 'submitted':
        return 'info'
      default:
        return 'warning'
    }
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount)
  }
  
  if (quotes.length === 0) {
    return (
      <div style={{ 
        padding: '60px 20px', 
        textAlign: 'center',
        color: 'var(--portal-text-secondary)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
        <p style={{ fontSize: '16px', marginBottom: '8px' }}>No quotes found</p>
        <p style={{ fontSize: '14px' }}>Submit bids on available loads to see them here.</p>
      </div>
    )
  }
  
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        fontSize: '13px'
      }}>
        <thead>
          <tr style={{ 
            borderBottom: '2px solid var(--portal-divider)',
            color: 'var(--portal-text-secondary)',
            fontWeight: '600',
            textTransform: 'uppercase',
            fontSize: '11px',
            letterSpacing: '0.5px'
          }}>
            <th style={{ padding: '12px 8px', textAlign: 'left' }}>Date</th>
            <th style={{ padding: '12px 8px', textAlign: 'left' }}>Route</th>
            <th style={{ padding: '12px 8px', textAlign: 'left' }}>Vehicle</th>
            <th style={{ padding: '12px 8px', textAlign: 'left' }}>Pickup</th>
            <th style={{ padding: '12px 8px', textAlign: 'right' }}>Quote</th>
            <th style={{ padding: '12px 8px', textAlign: 'center' }}>Status</th>
            <th style={{ padding: '12px 8px', textAlign: 'center' }}>Job Status</th>
            <th style={{ padding: '12px 8px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((quote) => (
            <tr 
              key={quote.id}
              style={{ 
                borderBottom: '1px solid var(--portal-divider)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--portal-bg-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <td style={{ padding: '12px 8px', color: 'var(--portal-text-muted)' }}>
                {formatDate(quote.created_at)}
              </td>
              <td style={{ padding: '12px 8px', color: 'var(--portal-text-primary)', fontWeight: '500' }}>
                {quote.job.pickup_location} → {quote.job.delivery_location}
              </td>
              <td style={{ padding: '12px 8px', color: 'var(--portal-text-secondary)' }}>
                {quote.job.vehicle_type || 'Any'}
              </td>
              <td style={{ padding: '12px 8px', color: 'var(--portal-text-secondary)' }}>
                {quote.job.pickup_datetime 
                  ? new Date(quote.job.pickup_datetime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                  : 'TBD'
                }
              </td>
              <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '600', color: 'var(--portal-text-primary)' }}>
                {formatCurrency(quote.quote_amount)}
              </td>
              <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                <StatusPill 
                  status={quote.status} 
                  variant={getStatusVariant(quote.status)}
                />
              </td>
              <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                <span style={{ 
                  fontSize: '12px',
                  color: 'var(--portal-text-muted)',
                  textTransform: 'capitalize'
                }}>
                  {quote.job.status}
                </span>
              </td>
              <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button
                    onClick={() => router.push(`/loads/${quote.job.id}`)}
                    className="portal-btn portal-btn-outline"
                    style={{ 
                      padding: '4px 12px',
                      fontSize: '12px',
                      textTransform: 'none'
                    }}
                  >
                    View Job
                  </button>
                  {quote.status === 'submitted' && onWithdraw && (
                    <button
                      onClick={() => onWithdraw(quote.id)}
                      className="portal-btn portal-btn-outline"
                      style={{ 
                        padding: '4px 12px',
                        fontSize: '12px',
                        textTransform: 'none',
                        borderColor: 'var(--portal-error)',
                        color: 'var(--portal-error)'
                      }}
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

'use client'

interface StatusBadgeProps {
  status: string
  size?: 'small' | 'medium' | 'large'
}

export default function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    const statusLower = status.toLowerCase().replace(/[_-]/g, '')
    
    switch (statusLower) {
      case 'open':
        return {
          icon: '🟢',
          label: 'Open',
          bg: 'rgba(16, 185, 129, 0.2)',
          border: 'rgba(16, 185, 129, 0.4)',
          color: '#10b981'
        }
      case 'assigned':
        return {
          icon: '✅',
          label: 'Assigned',
          bg: 'rgba(59, 130, 246, 0.2)',
          border: 'rgba(59, 130, 246, 0.4)',
          color: '#3b82f6'
        }
      case 'intransit':
      case 'in-transit':
        return {
          icon: '🚚',
          label: 'In Transit',
          bg: 'rgba(245, 158, 11, 0.2)',
          border: 'rgba(245, 158, 11, 0.4)',
          color: '#f59e0b'
        }
      case 'completed':
      case 'delivered':
        return {
          icon: '✔️',
          label: 'Completed',
          bg: 'rgba(34, 197, 94, 0.2)',
          border: 'rgba(34, 197, 94, 0.4)',
          color: '#22c55e'
        }
      case 'cancelled':
        return {
          icon: '❌',
          label: 'Cancelled',
          bg: 'rgba(239, 68, 68, 0.2)',
          border: 'rgba(239, 68, 68, 0.4)',
          color: '#ef4444'
        }
      case 'submitted':
        return {
          icon: '📝',
          label: 'Submitted',
          bg: 'rgba(168, 85, 247, 0.2)',
          border: 'rgba(168, 85, 247, 0.4)',
          color: '#a855f7'
        }
      case 'rejected':
        return {
          icon: '⛔',
          label: 'Rejected',
          bg: 'rgba(239, 68, 68, 0.2)',
          border: 'rgba(239, 68, 68, 0.4)',
          color: '#ef4444'
        }
      case 'accepted':
        return {
          icon: '✅',
          label: 'Accepted',
          bg: 'rgba(34, 197, 94, 0.2)',
          border: 'rgba(34, 197, 94, 0.4)',
          color: '#22c55e'
        }
      case 'withdrawn':
        return {
          icon: '↩️',
          label: 'Withdrawn',
          bg: 'rgba(156, 163, 175, 0.2)',
          border: 'rgba(156, 163, 175, 0.4)',
          color: '#9ca3af'
        }
      default:
        return {
          icon: '⚪',
          label: status.charAt(0).toUpperCase() + status.slice(1),
          bg: 'rgba(156, 163, 175, 0.2)',
          border: 'rgba(156, 163, 175, 0.4)',
          color: '#9ca3af'
        }
    }
  }

  const config = getStatusConfig(status)
  
  const sizeStyles = {
    small: {
      padding: '4px 10px',
      fontSize: '12px',
      iconSize: '14px'
    },
    medium: {
      padding: '6px 12px',
      fontSize: '13px',
      iconSize: '16px'
    },
    large: {
      padding: '8px 16px',
      fontSize: '14px',
      iconSize: '18px'
    }
  }
  
  const currentSize = sizeStyles[size]

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: currentSize.padding,
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: '20px',
        color: config.color,
        fontSize: currentSize.fontSize,
        fontWeight: '600',
        whiteSpace: 'nowrap'
      }}
    >
      <span style={{ fontSize: currentSize.iconSize }}>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  )
}

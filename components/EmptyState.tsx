'use client'

interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  size?: 'small' | 'medium' | 'large'
}

export default function EmptyState({
  icon = '📭',
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  size = 'medium'
}: EmptyStateProps) {
  const sizes = {
    small: {
      container: '40px 20px',
      icon: '32px',
      title: '14px',
      description: '12px',
      button: '8px 16px'
    },
    medium: {
      container: '60px 40px',
      icon: '48px',
      title: '18px',
      description: '14px',
      button: '12px 24px'
    },
    large: {
      container: '80px 60px',
      icon: '64px',
      title: '24px',
      description: '16px',
      button: '14px 28px'
    }
  }

  const currentSize = sizes[size]

  return (
    <div style={{
      padding: currentSize.container,
      textAlign: 'center',
      backgroundColor: 'rgba(255,255,255,0.02)',
      borderRadius: '12px',
      border: '1px dashed rgba(255,255,255,0.1)'
    }}>
      <div style={{
        fontSize: currentSize.icon,
        marginBottom: '16px',
        opacity: 0.8
      }}>
        {icon}
      </div>
      
      <h3 style={{
        fontSize: currentSize.title,
        fontWeight: '600',
        color: '#fff',
        marginBottom: '8px'
      }}>
        {title}
      </h3>
      
      <p style={{
        fontSize: currentSize.description,
        color: '#94a3b8',
        marginBottom: actionLabel ? '24px' : '0',
        lineHeight: '1.6',
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        {description}
      </p>

      {actionLabel && (
        <div style={{ marginTop: '24px' }}>
          {actionHref ? (
            <a
              href={actionHref}
              style={{
                display: 'inline-block',
                padding: currentSize.button,
                backgroundColor: 'var(--gold-premium)',
                color: '#0B1623',
                borderRadius: '8px',
                fontSize: currentSize.description,
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(217,177,91,0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {actionLabel}
            </a>
          ) : onAction ? (
            <button
              onClick={onAction}
              style={{
                padding: currentSize.button,
                backgroundColor: 'var(--gold-premium)',
                color: '#0B1623',
                border: 'none',
                borderRadius: '8px',
                fontSize: currentSize.description,
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(217,177,91,0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {actionLabel}
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}

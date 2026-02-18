'use client'

interface ErrorBannerProps {
  error: Error | string
  onRetry?: () => void
  onDismiss?: () => void
}

// Helper to convert technical errors to user-friendly messages
function getUserFriendlyError(message: string): string {
  if (message.includes('JWT expired') || message.includes('jwt') || message.includes('token')) {
    return 'Your session has expired. Please log in again.'
  }
  if (message.includes('23503') || message.includes('foreign key') || message.includes('constraint')) {
    return 'This item cannot be deleted because it has related records.'
  }
  if (message.includes('network') || message.includes('fetch') || message.includes('Failed to fetch')) {
    return 'Network error. Please check your connection and try again.'
  }
  if (message.includes('permission') || message.includes('401') || message.includes('403') || message.includes('Unauthorized')) {
    return 'You do not have permission to perform this action.'
  }
  if (message.includes('not found') || message.includes('404')) {
    return 'The requested resource was not found.'
  }
  if (message.includes('timeout') || message.includes('timed out')) {
    return 'Request timed out. Please try again.'
  }
  // Default: show message but sanitize technical jargon
  const cleaned = message.replace(/\b[0-9]{5}\b/g, '').replace(/Error:/g, '').trim()
  return cleaned || 'An error occurred. Please try again.'
}

export default function ErrorBanner({ error, onRetry, onDismiss }: ErrorBannerProps) {
  const message = typeof error === 'string' ? error : error.message
  const userMessage = getUserFriendlyError(message)
  
  return (
    <div className="portal-error-banner">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <strong>Error:</strong> {userMessage}
        </div>
        <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
          {onRetry && (
            <button 
              onClick={onRetry} 
              className="portal-btn-outline"
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                background: 'transparent',
                border: '1px solid var(--error)',
                color: 'var(--error)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
                textTransform: 'uppercase',
              }}
            >
              Retry
            </button>
          )}
          {onDismiss && (
            <button 
              onClick={onDismiss}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                fontSize: '20px',
                color: 'var(--error)',
                cursor: 'pointer',
                padding: '0 4px',
                lineHeight: '1',
              }}
              title="Dismiss"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

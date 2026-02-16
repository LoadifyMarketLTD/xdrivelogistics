'use client'

export default function Error({ 
  error, 
  reset 
}: { 
  error: Error & { digest?: string }
  reset: () => void 
}) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#0E1A26',
      color: '#E5E7EB',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '600px',
        backgroundColor: '#132433',
        border: '1px solid rgba(255, 107, 107, 0.3)',
        borderRadius: '12px',
        padding: '32px',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          color: '#ff6b6b', 
          marginBottom: '16px',
          fontSize: '24px',
          fontWeight: 700
        }}>
          ⚠️ Dashboard Error
        </h2>
        <p style={{ 
          lineHeight: '1.6', 
          marginBottom: '24px',
          color: 'rgba(229, 231, 235, 0.9)'
        }}>
          {error.message || 'Something went wrong loading the dashboard.'}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            style={{
              padding: '12px 24px',
              backgroundColor: '#C8A64D',
              color: '#0B1623',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Try Again
          </button>
          <a 
            href="/login"
            style={{
              padding: '12px 24px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#E5E7EB',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              display: 'inline-block',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            Back to Login
          </a>
          <a 
            href="/"
            style={{
              padding: '12px 24px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#E5E7EB',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              display: 'inline-block',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  )
}

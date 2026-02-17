'use client'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: string
  text?: string
}

export function LoadingSpinner({ 
  size = 'medium', 
  color = 'var(--gold-premium)',
  text 
}: LoadingSpinnerProps) {
  const sizes = {
    small: '20px',
    medium: '40px',
    large: '60px'
  }

  const borderSizes = {
    small: '2px',
    medium: '4px',
    large: '6px'
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px'
    }}>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div
        style={{
          border: `${borderSizes[size]} solid rgba(255,255,255,0.1)`,
          borderTop: `${borderSizes[size]} solid ${color}`,
          borderRadius: '50%',
          width: sizes[size],
          height: sizes[size],
          animation: 'spin 1s linear infinite'
        }}
      />
      {text && (
        <div style={{
          fontSize: '14px',
          color: '#94a3b8',
          fontWeight: '500'
        }}>
          {text}
        </div>
      )}
    </div>
  )
}

interface LoadingOverlayProps {
  show: boolean
  text?: string
  fullScreen?: boolean
}

export function LoadingOverlay({ 
  show, 
  text = 'Loading...', 
  fullScreen = false 
}: LoadingOverlayProps) {
  if (!show) return null

  return (
    <div style={{
      position: fullScreen ? 'fixed' : 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(11, 22, 35, 0.9)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <LoadingSpinner size="large" text={text} />
    </div>
  )
}

interface ProgressBarProps {
  progress: number // 0-100
  showPercentage?: boolean
  height?: string
  color?: string
}

export function ProgressBar({ 
  progress, 
  showPercentage = true,
  height = '8px',
  color = 'var(--gold-premium)'
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress))

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        width: '100%',
        height,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: height,
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          width: `${clampedProgress}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: height,
          transition: 'width 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <style jsx>{`
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `}</style>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            animation: 'shimmer 2s infinite'
          }} />
        </div>
      </div>
      {showPercentage && (
        <div style={{
          marginTop: '8px',
          fontSize: '12px',
          color: '#94a3b8',
          textAlign: 'right'
        }}>
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  )
}

export function LoadingDots() {
  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
        }
      `}</style>
      {[0, 0.2, 0.4].map((delay, i) => (
        <div
          key={i}
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: 'var(--gold-premium)',
            borderRadius: '50%',
            animation: 'bounce 1.4s ease-in-out infinite',
            animationDelay: `${delay}s`
          }}
        />
      ))}
    </div>
  )
}

'use client'

interface SkeletonProps {
  width?: string
  height?: string
  borderRadius?: string
  variant?: 'text' | 'circular' | 'rectangular'
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  variant = 'rectangular',
  animation = 'pulse'
}: SkeletonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'text':
        return { height: '1em', borderRadius: '4px' }
      case 'circular':
        return { borderRadius: '50%', width: height, height }
      case 'rectangular':
      default:
        return { borderRadius }
    }
  }

  const getAnimationStyles = () => {
    if (animation === 'pulse') {
      return {
        animation: 'skeleton-pulse 1.5s ease-in-out infinite'
      }
    } else if (animation === 'wave') {
      return {
        animation: 'skeleton-wave 1.6s linear infinite',
        background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)',
        backgroundSize: '200% 100%'
      }
    }
    return {}
  }

  return (
    <>
      <style jsx>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes skeleton-wave {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div
        style={{
          width,
          height,
          backgroundColor: 'rgba(255,255,255,0.08)',
          ...getVariantStyles(),
          ...getAnimationStyles()
        }}
      />
    </>
  )
}

interface SkeletonGroupProps {
  count?: number
  gap?: string
}

export function SkeletonGroup({ count = 3, gap = '12px' }: SkeletonGroupProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} />
      ))}
    </div>
  )
}

export function JobCardSkeleton() {
  return (
    <div style={{
      backgroundColor: '#132433',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid rgba(255,255,255,0.08)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <Skeleton width="80px" height="24px" borderRadius="12px" />
            <Skeleton width="120px" height="24px" borderRadius="12px" />
          </div>
          <Skeleton width="60%" height="28px" />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '16px' }}>
        <Skeleton height="60px" />
        <Skeleton height="60px" />
        <Skeleton height="60px" />
        <Skeleton height="60px" />
      </div>
    </div>
  )
}

export function DashboardStatSkeleton() {
  return (
    <div style={{
      backgroundColor: 'rgba(255,255,255,0.02)',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid rgba(255,255,255,0.08)'
    }}>
      <div style={{ marginBottom: '12px' }}>
        <Skeleton width="100px" height="14px" />
      </div>
      <div style={{ marginBottom: '8px' }}>
        <Skeleton width="80px" height="36px" />
      </div>
      <Skeleton width="120px" height="12px" />
    </div>
  )
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '16px',
      padding: '16px',
      borderBottom: '1px solid rgba(255,255,255,0.05)'
    }}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} height="20px" />
      ))}
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <Skeleton variant="circular" width="48px" height="48px" />
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: '8px' }}>
          <Skeleton width="150px" height="20px" />
        </div>
        <Skeleton width="200px" height="14px" />
      </div>
    </div>
  )
}

export function ChartSkeleton({ height = '300px' }: { height?: string }) {
  return (
    <div style={{
      backgroundColor: 'rgba(255,255,255,0.02)',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid rgba(255,255,255,0.08)',
      height
    }}>
      <div style={{ marginBottom: '20px' }}>
        <Skeleton width="150px" height="20px" />
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '12px',
        height: 'calc(100% - 40px)'
      }}>
        {[60, 80, 50, 90, 70, 85, 65].map((h, i) => (
          <Skeleton key={i} width="100%" height={`${h}%`} />
        ))}
      </div>
    </div>
  )
}

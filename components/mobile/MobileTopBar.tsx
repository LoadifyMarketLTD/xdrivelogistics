'use client'

import { useRouter } from 'next/navigation'
import { brandColors } from '@/lib/brandColors'

interface MobileTopBarProps {
  title: string
  showBackButton?: boolean
  onBackClick?: () => void
  rightAction?: React.ReactNode
}

export default function MobileTopBar({ 
  title, 
  showBackButton = false, 
  onBackClick,
  rightAction 
}: MobileTopBarProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBackClick) {
      onBackClick()
    } else {
      router.back()
    }
  }

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      left: 0,
      right: 0,
      height: '56px',
      minHeight: '56px',
      background: brandColors.primary.navy,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      zIndex: 50,
      borderBottom: `1px solid ${brandColors.border.gold}`,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    }}>
      {/* Left side - Back button or spacer */}
      <div style={{ width: '48px', display: 'flex', alignItems: 'center' }}>
        {showBackButton && (
          <button
            onClick={handleBack}
            style={{
              background: 'transparent',
              border: 'none',
              color: brandColors.text.gold,
              fontSize: '24px',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ←
          </button>
        )}
      </div>

      {/* Center - Title */}
      <div style={{
        flex: 1,
        textAlign: 'center',
        fontSize: '16px',
        fontWeight: '700',
        color: brandColors.text.gold,
        letterSpacing: '0.5px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {title}
      </div>

      {/* Right side - Custom action or spacer */}
      <div style={{ width: '48px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        {rightAction}
      </div>
    </div>
  )
}

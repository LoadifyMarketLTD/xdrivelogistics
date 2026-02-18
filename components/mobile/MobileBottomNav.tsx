'use client'

import { useRouter, usePathname } from 'next/navigation'
import { brandColors } from '@/lib/brandColors'

interface NavItem {
  icon: string
  label: string
  path: string
}

interface MobileBottomNavProps {
  items: NavItem[]
}

export default function MobileBottomNav({ items }: MobileBottomNavProps) {
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/')
  }

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '68px',
      background: brandColors.mobile.navBackground,
      borderTop: `1px solid ${brandColors.border.gold}`,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '0 8px',
      zIndex: 50,
      boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
    }}>
      {items.map((item) => {
        const active = isActive(item.path)
        
        return (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 4px',
              minHeight: '60px',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              fontSize: '24px',
              lineHeight: '1',
              filter: active ? 'none' : 'grayscale(100%) opacity(0.6)',
            }}>
              {item.icon}
            </div>
            <div style={{
              fontSize: '11px',
              fontWeight: active ? '700' : '500',
              color: active ? brandColors.mobile.navActive : brandColors.mobile.navInactive,
              letterSpacing: '0.3px',
              textAlign: 'center',
            }}>
              {item.label}
            </div>
          </button>
        )
      })}
    </nav>
  )
}

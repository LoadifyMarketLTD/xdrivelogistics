'use client'

import MobileTopBar from '@/components/mobile/MobileTopBar'
import MobileBottomNav from '@/components/mobile/MobileBottomNav'
import { useAuth } from '@/lib/AuthContext'
import { brandColors } from '@/lib/brandColors'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

const fleetNavItems = [
  { icon: '📊', label: 'Dashboard', path: '/m/fleet' },
  { icon: '📦', label: 'Loads', path: '/m/fleet/loads' },
  { icon: '📍', label: 'Live', path: '/m/fleet/live' },
  { icon: '📅', label: 'Diary', path: '/m/fleet/diary' },
  { icon: '⚙️', label: 'More', path: '/m/fleet/more' },
]

export default function FleetMobileLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const rightAction = (
    <button
      onClick={handleLogout}
      style={{
        background: 'transparent',
        border: 'none',
        color: brandColors.text.gold,
        fontSize: '20px',
        cursor: 'pointer',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      title="Logout"
    >
      🚪
    </button>
  )

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: brandColors.background.light,
      overflow: 'hidden',
    }}>
      <MobileTopBar 
        title="XDrive Fleet" 
        rightAction={rightAction}
      />
      
      <main style={{
        flex: 1,
        overflowY: 'auto',
        paddingBottom: '68px', // Space for bottom nav
      }}>
        {children}
      </main>
      
      <MobileBottomNav items={fleetNavItems} />
    </div>
  )
}

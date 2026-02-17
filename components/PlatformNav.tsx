'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'

export default function PlatformNav() {
  const router = useRouter()
  const pathname = usePathname()
  const { signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  // Navigation tabs with CX-style naming
  const navTabs = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Directory', path: '/directory' },
    { name: 'Live Availability', path: '/availability' },
    { name: 'My Fleet', path: '/fleet' },
    { name: 'Return Journeys', path: '/return-journeys' },
    { name: 'Loads', path: '/marketplace' },
    { name: 'Quotes', path: '/quotes' },
    { name: 'Diary', path: '/diary' },
    { name: 'Freight Vision', path: '/freight-vision' },
    { name: 'Drivers & Vehicles', path: '/drivers' },
  ]

  const isActive = (path: string) => {
    if (path === '/marketplace') {
      return pathname.startsWith('/marketplace') || pathname.startsWith('/jobs/new')
    }
    return pathname === path
  }

  return (
    <header className="cx-platform-header">
      <div className="cx-header-container">
        {/* Brand and CTAs Row */}
        <div className="cx-header-top">
          <div className="cx-brand">
            <span className="cx-brand-accent">XDrive</span>
            <span className="cx-brand-text">Logistics</span>
          </div>

          <div className="cx-header-actions">
            <button
              onClick={() => router.push('/jobs/new')}
              className="cx-btn cx-btn-primary"
            >
              📝 POST LOAD
            </button>
            <button
              onClick={() => router.push('/loads/book-direct')}
              className="cx-btn cx-btn-secondary"
            >
              📦 BOOK DIRECT
            </button>
            <button
              onClick={handleLogout}
              className="cx-btn cx-btn-logout"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs Row */}
        <nav className="cx-nav-tabs">
          {navTabs.map((tab) => (
            <a
              key={tab.path}
              href={tab.path}
              className={`cx-nav-tab ${isActive(tab.path) ? 'cx-nav-tab-active' : ''}`}
            >
              {tab.name}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}

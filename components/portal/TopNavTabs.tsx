'use client'

import { usePathname } from 'next/navigation'

export default function TopNavTabs() {
  const pathname = usePathname()
  
  const tabs = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Directory', path: '/directory' },
    { name: 'Live Availability', path: '/live-availability' },
    { name: 'My Fleet', path: '/my-fleet' },
    { name: 'Return Journeys', path: '/return-journeys' },
    { name: 'Loads', path: '/loads' },
    { name: 'Quotes', path: '/quotes' },
    { name: 'Diary', path: '/diary' },
    { name: 'Freight Vision', path: '/freight-vision' },
    { name: 'Drivers & Vehicles', path: '/drivers-vehicles' },
  ]
  
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/')
  }
  
  return (
    <div className="portal-tabs">
      {tabs.map((tab) => (
        <a
          key={tab.path}
          href={tab.path}
          className={`portal-tab ${isActive(tab.path) ? 'active' : ''}`}
        >
          {tab.name}
        </a>
      ))}
    </div>
  )
}

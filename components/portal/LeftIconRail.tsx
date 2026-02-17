'use client'

import { usePathname } from 'next/navigation'

export default function LeftIconRail() {
  const pathname = usePathname()
  
  const icons = [
    { icon: '🏠', path: '/dashboard', label: 'Dashboard' },
    { icon: '📋', path: '/loads', label: 'Loads' },
    { icon: '💰', path: '/quotes', label: 'Quotes' },
    { icon: '🚛', path: '/my-fleet', label: 'Fleet' },
    { icon: '📅', path: '/diary', label: 'Diary' },
    { icon: '👥', path: '/directory', label: 'Directory' },
    { icon: '📊', path: '/freight-vision', label: 'Analytics' },
    { icon: '⚙️', path: '/company/settings', label: 'Settings' },
  ]
  
  const isActive = (path: string) => {
    if (path === '/loads') {
      return pathname.startsWith('/marketplace') || pathname.startsWith('/loads')
    }
    return pathname === path || pathname.startsWith(path + '/')
  }
  
  return (
    <div className="portal-left-rail">
      {icons.map((item) => (
        <a
          key={item.path}
          href={item.path}
          className={`portal-left-rail-icon ${isActive(item.path) ? 'active' : ''}`}
          title={item.label}
        >
          <span style={{ fontSize: '24px' }}>{item.icon}</span>
        </a>
      ))}
    </div>
  )
}

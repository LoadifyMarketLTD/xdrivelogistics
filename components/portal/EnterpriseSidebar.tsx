'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

interface MenuItem {
  label: string
  path: string
  icon: string
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊' },
  { label: 'Loads', path: '/loads', icon: '📦' },
  { label: 'Quotes', path: '/quotes', icon: '💰' },
  { label: 'Directory', path: '/directory', icon: '📁' },
  { label: 'Drivers', path: '/drivers-vehicles', icon: '👤' },
  { label: 'Vehicles', path: '/my-fleet', icon: '🚛' },
  { label: 'Reports', path: '/reports', icon: '📈' },
  { label: 'Settings', path: '/company/settings', icon: '⚙️' },
]

export default function EnterpriseSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileCollapsed, setIsMobileCollapsed] = useState(false)

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <div style={{
        width: '220px',
        background: '#111827',
        color: '#e5e7eb',
        position: 'fixed',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        borderRight: '1px solid #1f2937',
      }}
      className="enterprise-sidebar"
      >
        {/* Logo/Brand */}
        <div style={{
          padding: '20px 16px',
          borderBottom: '1px solid #1f2937',
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#d4af37',
            letterSpacing: '0.5px',
          }}>
            XDrive Logistics LTD
          </div>
          <div style={{
            fontSize: '11px',
            color: '#6b7280',
            marginTop: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Enterprise Exchange
          </div>
        </div>

        {/* Menu Items */}
        <nav style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 0',
        }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/')
            
            return (
              <div
                key={item.path}
                onClick={() => router.push(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  color: isActive ? '#ffffff' : '#9ca3af',
                  background: isActive ? 'rgba(255,255,255,0.04)' : 'transparent',
                  borderLeft: isActive ? '3px solid #d4af37' : '3px solid transparent',
                  fontSize: '13px',
                  fontWeight: isActive ? '600' : '400',
                  transition: 'all 0.15s',
                  marginBottom: '2px',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                    e.currentTarget.style.color = '#e5e7eb'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#9ca3af'
                  }
                }}
              >
                <span style={{ 
                  marginRight: '12px',
                  fontSize: '16px',
                  opacity: 0.9,
                }}
                className="sidebar-icon"
                >
                  {item.icon}
                </span>
                <span className="sidebar-label">{item.label}</span>
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid #1f2937',
          fontSize: '11px',
          color: '#6b7280',
        }}
        className="sidebar-footer"
        >
          <div>Version 1.0</div>
          <div style={{ marginTop: '4px' }}>© 2026 XDrive Logistics LTD</div>
        </div>
      </div>

      {/* Mobile Icon Rail - Hidden by default, shown on mobile */}
      <style jsx>{`
        @media (max-width: 768px) {
          .enterprise-sidebar {
            width: 70px !important;
          }
          .sidebar-label {
            display: none;
          }
          .sidebar-icon {
            margin-right: 0 !important;
          }
          .sidebar-footer {
            display: none;
          }
        }
      `}</style>
    </>
  )
}

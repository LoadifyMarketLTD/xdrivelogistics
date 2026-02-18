'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'

interface MenuItem {
  label: string
  path: string
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Directory', path: '/directory' },
  { label: 'Live Availability', path: '/live-availability' },
  { label: 'Loads', path: '/loads' },
  { label: 'Quotes', path: '/quotes' },
  { label: 'Diary', path: '/diary' },
  { label: 'Return Journeys', path: '/return-journeys' },
  { label: 'Freight Vision', path: '/freight-vision' },
  { label: 'Drivers & Vehicles', path: '/drivers-vehicles' },
  { label: 'Company Settings', path: '/company/settings' },
]

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, companyId } = useAuth()
  const [newLoadsCount, setNewLoadsCount] = useState(0)
  const [acceptedBidsCount, setAcceptedBidsCount] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Detect mobile viewport - only on client side to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
    
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  useEffect(() => {
    if (!companyId) return
    
    const fetchNotifications = async () => {
      try {
        // Get new loads count (posted in last 24 hours)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const { data: newLoads } = await supabase
          .from('jobs')
          .select('id')
          .eq('status', 'open')
          .gte('created_at', twentyFourHoursAgo)
        
        setNewLoadsCount(newLoads?.length || 0)
        
        // Get accepted bids count
        const { data: acceptedBids } = await supabase
          .from('job_bids')
          .select('id')
          .eq('bidder_company_id', companyId)
          .eq('status', 'accepted')
        
        setAcceptedBidsCount(acceptedBids?.length || 0)
      } catch (err) {
        console.error('Error fetching notifications:', err)
      }
    }
    
    fetchNotifications()
    
    // Refresh notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000)
    
    return () => clearInterval(interval)
  }, [companyId])

  const totalNotifications = newLoadsCount + acceptedBidsCount

  // Don't render mobile-specific UI until mounted to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#f4f5f7',
      }}>
        {/* Left Sidebar - Initial render without mobile detection */}
        <div style={{
          width: '220px',
          background: '#1f2937',
          position: 'fixed',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
        }}>
          <div style={{
            padding: '20px 16px',
            borderBottom: '1px solid #374151',
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#d4af37',
              letterSpacing: '0.5px',
            }}>
              XDrive Logistics LTD
            </div>
          </div>
        </div>
        <div style={{
          flex: 1,
          marginLeft: '220px',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            height: '56px',
            background: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
          }} />
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
          }}>
            {children}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f4f5f7',
    }}>
      {/* Mobile Menu Toggle */}
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            zIndex: 100,
            background: '#1f2937',
            color: '#ffffff',
            border: 'none',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '20px',
          }}
        >
          ☰
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40,
          }}
        />
      )}

      {/* Left Sidebar - CX Style */}
      <div style={{
        width: '220px',
        background: '#1f2937',
        position: 'fixed',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        left: isMobile ? (isMobileMenuOpen ? '0' : '-220px') : '0',
        transition: 'left 0.3s ease',
      }}>
        {/* Logo/Brand */}
        <div style={{
          padding: '20px 16px',
          borderBottom: '1px solid #374151',
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#d4af37',
            letterSpacing: '0.5px',
          }}>
            XDrive Logistics LTD
          </div>
          <div style={{
            fontSize: '11px',
            color: '#9ca3af',
            marginTop: '4px',
            letterSpacing: '0.3px',
          }}>
            Transport Exchange
          </div>
        </div>

        {/* Menu Items */}
        <nav style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 0',
        }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/')
            
            return (
              <div
                key={item.path}
                onClick={() => {
                  router.push(item.path)
                  if (isMobile) setIsMobileMenuOpen(false)
                }}
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  color: isActive ? '#ffffff' : '#d1d5db',
                  background: isActive ? '#374151' : 'transparent',
                  borderLeft: isActive ? '3px solid #d4af37' : '3px solid transparent',
                  fontSize: '13px',
                  fontWeight: isActive ? '600' : '500',
                  transition: 'all 0.15s',
                  marginBottom: '1px',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#2d3748'
                    e.currentTarget.style.color = '#ffffff'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#d1d5db'
                  }
                }}
              >
                {item.label}
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid #374151',
          fontSize: '11px',
          color: '#9ca3af',
        }}>
          <div>© 2026 XDrive Logistics</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        marginLeft: isMobile ? '0' : '220px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Top Navigation Bar */}
        <div style={{
          height: isMobile ? 'auto' : '56px',
          minHeight: '56px',
          background: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '10px 50px 10px 50px' : '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          gap: isMobile ? '10px' : '0',
        }}>
          {/* Left side - Action buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: isMobile ? 'center' : 'flex-start',
            width: isMobile ? '100%' : 'auto',
          }}>
            <button
              onClick={() => router.push('/jobs/new')}
              style={{
                background: '#d4af37',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#c29d2f'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#d4af37'
              }}
            >
              POST LOAD
            </button>
            
            <button
              onClick={() => router.push('/loads')}
              style={{
                background: '#1f2937',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#111827'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#1f2937'
              }}
            >
              BOOK DIRECT
            </button>
          </div>

          {/* Right side - Notifications, User info and actions */}
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: isMobile ? 'center' : 'flex-end',
            width: isMobile ? '100%' : 'auto',
          }}>
            {/* Notifications */}
            {totalNotifications > 0 && (
              <div style={{
                position: 'relative',
                cursor: 'pointer',
              }}
              onClick={() => router.push('/loads')}
              title={`${newLoadsCount} new loads, ${acceptedBidsCount} accepted bids`}
              >
                <span style={{ fontSize: '20px' }}>🔔</span>
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-8px',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  minWidth: '18px',
                  textAlign: 'center',
                }}>
                  {totalNotifications}
                </span>
              </div>
            )}

            <div style={{
              fontSize: '13px',
              color: '#6b7280',
            }}>
              {user?.email || 'User'}
            </div>
            
            <button
              onClick={() => router.push('/company/settings')}
              style={{
                background: 'transparent',
                color: '#6b7280',
                border: 'none',
                padding: '6px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
              title="Settings"
            >
              ⚙️
            </button>
            
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                color: '#6b7280',
                border: 'none',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ef4444'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6b7280'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
        }}>
          {children}
        </div>
      </div>
    </div>
  )
}

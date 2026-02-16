'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  // Don't show navbar on auth pages
  const authPages = ['/login', '/register', '/forgot-password', '/reset-password']
  if (authPages.includes(pathname)) {
    return null
  }

  return (
    <nav style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '64px'
      }}>
        <Link href="/" style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1f2937',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ color: '#C8A64D' }}>XDrive</span>
          <span>Logistics</span>
        </Link>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          {loading ? (
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Loading...</div>
          ) : user ? (
            <>
              <Link href="/dashboard" style={{
                color: pathname === '/dashboard' ? '#C8A64D' : '#4b5563',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '500',
                padding: '8px 16px',
                borderRadius: '6px',
                transition: 'all 0.2s',
                backgroundColor: pathname === '/dashboard' ? 'rgba(200, 166, 77, 0.1)' : 'transparent'
              }}>
                Dashboard
              </Link>
              <Link href="/marketplace" style={{
                color: pathname === '/marketplace' ? '#C8A64D' : '#4b5563',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '500',
                padding: '8px 16px',
                borderRadius: '6px',
                transition: 'all 0.2s',
                backgroundColor: pathname === '/marketplace' ? 'rgba(200, 166, 77, 0.1)' : 'transparent'
              }}>
                Marketplace
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  color: '#ef4444',
                  background: 'transparent',
                  border: '1px solid #ef4444',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ef4444'
                  e.currentTarget.style.color = '#ffffff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#ef4444'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={{
                color: '#4b5563',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '500',
                padding: '8px 16px',
                borderRadius: '6px',
                transition: 'all 0.2s'
              }}>
                Login
              </Link>
              <Link href="/register" style={{
                color: '#ffffff',
                backgroundColor: '#C8A64D',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '600',
                padding: '10px 20px',
                borderRadius: '6px',
                transition: 'all 0.2s',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#B39543'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#C8A64D'
              }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

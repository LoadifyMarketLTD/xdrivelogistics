'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { brandColors } from '@/lib/brandColors'
import { useEffect } from 'react'

export default function MobileChooserPage() {
  const router = useRouter()
  const { profile, loading } = useAuth()

  // Auto-route based on role if available
  useEffect(() => {
    if (loading) return
    
    if (profile?.role) {
      // If role is 'driver', auto-route to driver app
      if (profile.role === 'driver') {
        router.push('/m/driver')
        return
      }
      
      // For other roles (admin, dispatcher, viewer), auto-route to fleet app
      if (['admin', 'dispatcher', 'viewer'].includes(profile.role)) {
        router.push('/m/fleet')
        return
      }
    }
  }, [profile, loading, router])

  const handleFleetClick = () => {
    router.push('/m/fleet')
  }

  const handleDriverClick = () => {
    router.push('/m/driver')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${brandColors.primary.navy} 0%, ${brandColors.primary.navy} 50%, ${brandColors.background.light} 50%, ${brandColors.background.light} 100%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Logo */}
      <div style={{
        fontSize: '28px',
        fontWeight: '700',
        color: brandColors.primary.gold,
        marginBottom: '12px',
        textAlign: 'center',
        letterSpacing: '0.5px',
      }}>
        XDrive Logistics
      </div>
      
      <div style={{
        fontSize: '14px',
        color: brandColors.text.light,
        marginBottom: '48px',
        textAlign: 'center',
      }}>
        Choose your experience
      </div>

      {/* Chooser Cards */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        maxWidth: '400px',
      }}>
        {/* Fleet App Card */}
        <button
          onClick={handleFleetClick}
          style={{
            background: brandColors.background.white,
            border: `2px solid ${brandColors.border.light}`,
            borderRadius: '12px',
            padding: '32px 24px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)'
            e.currentTarget.style.borderColor = brandColors.primary.gold
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
            e.currentTarget.style.borderColor = brandColors.border.light
          }}
        >
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            🏢
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: brandColors.primary.navy,
            marginBottom: '8px',
            textAlign: 'center',
          }}>
            Fleet App
          </div>
          <div style={{
            fontSize: '14px',
            color: brandColors.text.secondary,
            textAlign: 'center',
            lineHeight: '1.5',
          }}>
            For team members, dispatchers, and office staff
          </div>
        </button>

        {/* Driver App Card */}
        <button
          onClick={handleDriverClick}
          style={{
            background: brandColors.background.white,
            border: `2px solid ${brandColors.border.light}`,
            borderRadius: '12px',
            padding: '32px 24px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)'
            e.currentTarget.style.borderColor = brandColors.primary.gold
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
            e.currentTarget.style.borderColor = brandColors.border.light
          }}
        >
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            🚛
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: brandColors.primary.navy,
            marginBottom: '8px',
            textAlign: 'center',
          }}>
            Driver App
          </div>
          <div style={{
            fontSize: '14px',
            color: brandColors.text.secondary,
            textAlign: 'center',
            lineHeight: '1.5',
          }}>
            For drivers on the road
          </div>
        </button>
      </div>

      {/* Desktop Link */}
      <div style={{
        marginTop: '48px',
        textAlign: 'center',
      }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            background: 'transparent',
            border: 'none',
            color: brandColors.text.light,
            fontSize: '13px',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          Use desktop version instead
        </button>
      </div>
    </div>
  )
}

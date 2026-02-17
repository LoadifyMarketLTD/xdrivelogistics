'use client'

import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function EnterpriseHeader() {
  const { user } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{
      height: '50px',
      background: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      {/* Left side - Branding */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '700',
          color: '#2C3E50',
          letterSpacing: '0.5px',
        }}>
          <span style={{ color: '#C8A64D' }}>XDRIVE</span> LOGISTICS
        </div>
      </div>

      {/* Right side - User info */}
      <div style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
      }}>
        <div style={{
          fontSize: '12px',
          color: '#6b7280',
        }}>
          {user?.email || 'Guest'}
        </div>
        
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
            borderRadius: '2px',
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
  )
}

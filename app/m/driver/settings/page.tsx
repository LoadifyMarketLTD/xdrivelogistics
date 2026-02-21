'use client'

import { brandColors } from '@/lib/brandColors'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'

interface SettingItemProps {
  icon: string
  label: string
  value: string
}

function SettingItem({ icon, label, value }: SettingItemProps) {
  return (
    <div style={{
      background: brandColors.mobile.cardBackground,
      border: `1px solid ${brandColors.mobile.cardBorder}`,
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    }}>
      <div style={{ fontSize: '24px' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', color: brandColors.text.secondary, marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '15px', fontWeight: '600', color: brandColors.text.primary }}>{value}</div>
      </div>
    </div>
  )
}

export default function DriverSettingsPage() {
  const { profile, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: '700', color: brandColors.text.primary, marginBottom: '16px' }}>
        Settings
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <SettingItem icon="👤" label="Driver Name" value={profile?.full_name || 'Not set'} />
        <SettingItem icon="📧" label="Email" value={profile?.email || 'Not set'} />
        <SettingItem icon="📱" label="Phone" value={profile?.phone || 'Not set'} />

        {/* Edit profile link */}
        <button
          onClick={() => router.push('/account/settings')}
          style={{
            background: brandColors.mobile.cardBackground,
            border: `1px solid ${brandColors.mobile.cardBorder}`,
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: '24px' }}>✏️</div>
          <div style={{ flex: 1, fontSize: '15px', fontWeight: '600', color: brandColors.text.primary }}>
            Edit Profile
          </div>
          <div style={{ fontSize: '18px', color: brandColors.text.secondary }}>›</div>
        </button>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          style={{
            marginTop: '8px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: '24px' }}>🚪</div>
          <div style={{ flex: 1, fontSize: '15px', fontWeight: '600', color: '#dc2626' }}>
            Sign Out
          </div>
        </button>
      </div>
    </div>
  )
}

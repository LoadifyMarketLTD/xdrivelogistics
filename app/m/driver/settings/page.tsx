'use client'

import { brandColors } from '@/lib/brandColors'
import { useAuth } from '@/lib/AuthContext'

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
      <div style={{ fontSize: '24px' }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '13px',
          color: brandColors.text.secondary,
          marginBottom: '2px',
        }}>
          {label}
        </div>
        <div style={{
          fontSize: '15px',
          fontWeight: '600',
          color: brandColors.text.primary,
        }}>
          {value}
        </div>
      </div>
    </div>
  )
}

export default function DriverSettingsPage() {
  const { profile } = useAuth()

  return (
    <div style={{
      padding: '16px',
    }}>
      <h1 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: brandColors.text.primary,
        marginBottom: '16px',
      }}>
        Settings
      </h1>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <SettingItem
          icon="👤"
          label="Driver Name"
          value={profile?.full_name || 'Not set'}
        />
        <SettingItem
          icon="📧"
          label="Email"
          value={profile?.email || 'Not set'}
        />
        <SettingItem
          icon="📱"
          label="Phone"
          value={profile?.phone || 'Not set'}
        />
        
        <div style={{
          background: brandColors.mobile.cardBackground,
          border: `1px solid ${brandColors.mobile.cardBorder}`,
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          marginTop: '12px',
        }}>
          <div style={{
            fontSize: '14px',
            color: brandColors.text.secondary,
          }}>
            Additional settings coming soon
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { brandColors } from '@/lib/brandColors'
import { useRouter } from 'next/navigation'

interface MenuItemProps {
  icon: string
  label: string
  onClick: () => void
}

function MenuItem({ icon, label, onClick }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      style={{
        background: brandColors.mobile.cardBackground,
        border: `1px solid ${brandColors.mobile.cardBorder}`,
        borderRadius: '12px',
        padding: '16px',
        cursor: 'pointer',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = brandColors.background.light
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = brandColors.mobile.cardBackground
      }}
    >
      <div style={{ fontSize: '24px' }}>
        {icon}
      </div>
      <div style={{
        fontSize: '15px',
        fontWeight: '600',
        color: brandColors.text.primary,
        textAlign: 'left',
        flex: 1,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '18px',
        color: brandColors.text.light,
      }}>
        →
      </div>
    </button>
  )
}

export default function FleetMorePage() {
  const router = useRouter()

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
        More Options
      </h1>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <MenuItem
          icon="🏢"
          label="Company Settings"
          onClick={() => router.push('/company/settings')}
        />
        <MenuItem
          icon="👥"
          label="Users"
          onClick={() => router.push('/users')}
        />
        <MenuItem
          icon="🚛"
          label="Drivers & Vehicles"
          onClick={() => router.push('/drivers-vehicles')}
        />
        <MenuItem
          icon="📊"
          label="Reports"
          onClick={() => router.push('/invoices')}
        />
        <MenuItem
          icon="💳"
          label="Invoices"
          onClick={() => router.push('/invoices')}
        />
        <MenuItem
          icon="ℹ️"
          label="Help & Support"
          onClick={() => router.push('/account/feedback')}
        />
      </div>
    </div>
  )
}

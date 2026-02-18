'use client'

import { brandColors } from '@/lib/brandColors'

export default function FleetDiaryPage() {
  return (
    <div style={{
      padding: '16px',
    }}>
      <div style={{
        background: brandColors.mobile.cardBackground,
        border: `1px solid ${brandColors.mobile.cardBorder}`,
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: brandColors.text.primary,
          marginBottom: '8px',
        }}>
          Diary
        </h2>
        <p style={{
          fontSize: '14px',
          color: brandColors.text.secondary,
        }}>
          Schedule and calendar view will be implemented here
        </p>
      </div>
    </div>
  )
}

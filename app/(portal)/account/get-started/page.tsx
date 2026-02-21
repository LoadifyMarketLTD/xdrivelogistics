'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

const STEPS = [
  {
    number: 1,
    title: 'Complete Your Profile',
    description: 'Add your personal details, contact information and profile photo.',
    action: '/account/settings',
    actionLabel: 'Go to Settings',
    icon: '👤',
  },
  {
    number: 2,
    title: 'Set Up Your Company',
    description: 'Register your company details including VAT number, address and contact info.',
    action: '/account/company-profile',
    actionLabel: 'Company Profile',
    icon: '🏢',
  },
  {
    number: 3,
    title: 'Upload Business Documents',
    description: 'Add your insurance documents, operator licence and other required certifications.',
    action: '/account/business-docs',
    actionLabel: 'Upload Docs',
    icon: '📄',
  },
  {
    number: 4,
    title: 'Add Your Fleet',
    description: 'Register your vehicles with type, capacity and availability status.',
    action: '/account/company-vehicles',
    actionLabel: 'Add Vehicles',
    icon: '🚛',
  },
  {
    number: 5,
    title: 'Invite Drivers',
    description: 'Add drivers to your account and assign them to vehicles.',
    action: '/account/users-drivers',
    actionLabel: 'Manage Drivers',
    icon: '👷',
  },
  {
    number: 6,
    title: 'Browse Loads',
    description: 'Start browsing available loads and place your first bid.',
    action: '/loads',
    actionLabel: 'View Loads',
    icon: '📦',
  },
]

export default function GetStartedPage() {
  const router = useRouter()
  const { profile } = useAuth()

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: '700',
          color: '#0A2239',
          marginBottom: '8px',
        }}>
          Get Started
        </h1>
        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}! Follow these steps to set up your XDrive account.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
      }}>
        {STEPS.map((step) => (
          <div
            key={step.number}
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#0A2239',
                color: '#D4AF37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '14px',
                flexShrink: 0,
              }}>
                {step.number}
              </div>
              <span style={{ fontSize: '22px' }}>{step.icon}</span>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                {step.title}
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
              {step.description}
            </p>
            <button
              onClick={() => router.push(step.action)}
              style={{
                marginTop: 'auto',
                background: '#D4AF37',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                borderRadius: '4px',
                alignSelf: 'flex-start',
              }}
            >
              {step.actionLabel} →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { brandColors } from '@/lib/brandColors'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function DriverSettingsPage() {
  const { profile } = useAuth()
  const router = useRouter()
  const [enableLoadAlerts, setEnableLoadAlerts] = useState(true)
  const [sendBookingConfirmation, setSendBookingConfirmation] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!profile?.id) return
    supabase
      .from('user_settings')
      .select('enable_load_alerts,send_booking_confirmation')
      .eq('user_id', profile.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setEnableLoadAlerts(data.enable_load_alerts !== false)
          setSendBookingConfirmation(data.send_booking_confirmation !== false)
        }
      })
  }, [profile?.id])

  const handleSave = async () => {
    if (!profile?.id) return
    try {
      setSaving(true)
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: profile.id,
          enable_load_alerts: enableLoadAlerts,
          send_booking_confirmation: sendBookingConfirmation,
          updated_at: new Date().toISOString(),
        })
      if (error) throw error
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      alert('Failed to save settings: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const SettingItem = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
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

  const ToggleItem = ({ icon, label, checked, onChange }: { icon: string; label: string; checked: boolean; onChange: (v: boolean) => void }) => (
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
      <div style={{ flex: 1, fontSize: '15px', fontWeight: '600', color: brandColors.text.primary }}>{label}</div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: '48px', height: '26px', borderRadius: '13px', border: 'none',
          background: checked ? brandColors.primary.navy : '#d1d5db',
          cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background 0.2s',
        }}
      >
        <span style={{
          position: 'absolute', top: '3px',
          left: checked ? '26px' : '3px',
          width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  )

  return (
    <div style={{ padding: '16px', paddingBottom: '32px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: '700', color: brandColors.text.primary, marginBottom: '16px' }}>
        Settings
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <SettingItem icon="👤" label="Driver Name" value={profile?.full_name || 'Not set'} />
        <SettingItem icon="📧" label="Email" value={profile?.email || 'Not set'} />
        <SettingItem icon="📱" label="Phone" value={profile?.phone || 'Not set'} />

        <div style={{ marginTop: '8px', marginBottom: '4px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: brandColors.text.primary }}>Notifications</h2>
        </div>

        <ToggleItem
          icon="🔔"
          label="Load Alerts"
          checked={enableLoadAlerts}
          onChange={setEnableLoadAlerts}
        />
        <ToggleItem
          icon="✉️"
          label="Booking Confirmations"
          checked={sendBookingConfirmation}
          onChange={setSendBookingConfirmation}
        />

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            marginTop: '8px',
            background: brandColors.primary.navy,
            border: 'none',
            borderRadius: '12px',
            padding: '14px',
            color: '#fff',
            fontSize: '15px',
            fontWeight: '700',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>

        {saved && (
          <div style={{ textAlign: 'center', fontSize: '14px', color: brandColors.status.success, fontWeight: '600' }}>
            ✓ Settings saved successfully
          </div>
        )}

        <button
          onClick={() => router.push('/account/settings')}
          style={{
            background: brandColors.mobile.cardBackground,
            border: `1px solid ${brandColors.mobile.cardBorder}`,
            borderRadius: '12px',
            padding: '14px',
            color: brandColors.text.primary,
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          ⚙️ Advanced Settings
        </button>
      </div>
    </div>
  )
}


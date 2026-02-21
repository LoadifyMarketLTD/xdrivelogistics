'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

interface NotificationSettings {
  show_notification_bar: boolean
  enable_load_alerts: boolean
  send_booking_confirmation: boolean
  enroute_alert_hours: number
  alert_distance_uk_miles: number
  alert_distance_euro_miles: number
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<NotificationSettings>({
    show_notification_bar: true,
    enable_load_alerts: true,
    send_booking_confirmation: true,
    enroute_alert_hours: 4,
    alert_distance_uk_miles: 10,
    alert_distance_euro_miles: 50,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    const fetchSettings = async () => {
      try {
        const { data } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()
        if (data) {
          setSettings({
            show_notification_bar: data.show_notification_bar !== false,
            enable_load_alerts: data.enable_load_alerts !== false,
            send_booking_confirmation: data.send_booking_confirmation !== false,
            enroute_alert_hours: data.enroute_alert_hours ?? 4,
            alert_distance_uk_miles: data.alert_distance_uk_miles ?? 10,
            alert_distance_euro_miles: data.alert_distance_euro_miles ?? 50,
          })
        }
      } catch (err) {
        console.error('Error fetching notification settings:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [user?.id])

  const handleSave = async () => {
    if (!user?.id) return
    try {
      setSaving(true)
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString(),
        })
      if (error) throw error
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      console.error('Error saving settings:', err)
      alert('Failed to save settings: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const ToggleRow = ({
    label, description, checked, onChange,
  }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #f3f4f6' }}>
      <div>
        <div style={{ fontWeight: '600', fontSize: '14px', color: '#1f2937' }}>{label}</div>
        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{description}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{
          width: '48px', height: '26px', borderRadius: '13px', border: 'none',
          background: checked ? '#0A2239' : '#d1d5db',
          cursor: 'pointer', position: 'relative', flexShrink: 0,
          transition: 'background 0.2s',
        }}
        aria-checked={checked}
        role="switch"
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

  if (loading) return <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>Loading...</div>

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0A2239', marginBottom: '8px' }}>
          Notifications
        </h1>
        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
          Configure how and when you receive alerts and notifications.
        </p>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>Notification Preferences</h2>

        <ToggleRow
          label="Notification Bar"
          description="Show the notification bar at the top of the portal"
          checked={settings.show_notification_bar}
          onChange={v => setSettings(s => ({ ...s, show_notification_bar: v }))}
        />
        <ToggleRow
          label="Load Alerts"
          description="Receive alerts when new loads matching your criteria are posted"
          checked={settings.enable_load_alerts}
          onChange={v => setSettings(s => ({ ...s, enable_load_alerts: v }))}
        />
        <ToggleRow
          label="Booking Confirmations"
          description="Send email confirmation when a booking is created or updated"
          checked={settings.send_booking_confirmation}
          onChange={v => setSettings(s => ({ ...s, send_booking_confirmation: v }))}
        />
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>Alert Settings</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              En-Route Alert (hours before)
            </label>
            <input
              type="number" min={1} max={24}
              value={settings.enroute_alert_hours}
              onChange={e => setSettings(s => ({ ...s, enroute_alert_hours: parseInt(e.target.value) ?? 4 }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              UK Alert Distance (miles)
            </label>
            <input
              type="number" min={1} max={500}
              value={settings.alert_distance_uk_miles}
              onChange={e => setSettings(s => ({ ...s, alert_distance_uk_miles: parseInt(e.target.value) ?? 10 }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Euro Alert Distance (miles)
            </label>
            <input
              type="number" min={1} max={2000}
              value={settings.alert_distance_euro_miles}
              onChange={e => setSettings(s => ({ ...s, alert_distance_euro_miles: parseInt(e.target.value) ?? 50 }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '12px 24px', borderRadius: '6px', border: 'none',
            background: '#0A2239', color: '#fff', fontSize: '14px',
            fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Saving...' : 'Save Notification Settings'}
        </button>
        {saved && <span style={{ fontSize: '14px', color: '#16A34A', fontWeight: '600' }}>✓ Settings saved successfully</span>}
      </div>
    </div>
  )
}


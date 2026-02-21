'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/AuthContext'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

interface NotifToggleProps {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}

function NotifToggle({ label, description, checked, onChange }: NotifToggleProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 20px', background: '#ffffff', border: '1px solid #e5e7eb',
      borderRadius: '8px', gap: '16px',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '13px', color: '#6b7280' }}>{description}</div>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
          background: checked ? '#C8A64D' : '#d1d5db', position: 'relative', flexShrink: 0,
          transition: 'background 0.2s',
        }}
      >
        <span style={{
          position: 'absolute', top: '3px',
          left: checked ? '23px' : '3px',
          width: '18px', height: '18px', borderRadius: '50%', background: '#ffffff',
          transition: 'left 0.2s',
        }} />
      </button>
    </div>
  )
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loadingPrefs, setLoadingPrefs] = useState(true)
  const [prefs, setPrefs] = useState({
    newLoads: true,
    bidUpdates: true,
    jobStatus: true,
    docExpiry: true,
    systemAlerts: false,
    emailDigest: false,
  })

  // Load existing preferences from Supabase
  useEffect(() => {
    if (!user) { setLoadingPrefs(false); return }

    const load = async () => {
      try {
        const { data } = await supabase
          .from('user_settings')
          .select('show_notification_bar,enable_load_alerts,send_booking_confirmation')
          .eq('user_id', user.id)
          .maybeSingle()

        if (data) {
          setPrefs((p) => ({
            ...p,
            newLoads: data.enable_load_alerts ?? true,
            bidUpdates: data.send_booking_confirmation ?? true,
            jobStatus: data.show_notification_bar ?? true,
          }))
        }
      } catch (e) {
        console.error('Error loading notification prefs:', e)
      } finally {
        setLoadingPrefs(false)
      }
    }
    load()
  }, [user])

  const toggle = (key: keyof typeof prefs) => (v: boolean) =>
    setPrefs((p) => ({ ...p, [key]: v }))

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setSaved(false)
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          enable_load_alerts: prefs.newLoads,
          send_booking_confirmation: prefs.bidUpdates,
          show_notification_bar: prefs.jobStatus,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

      if (error) throw error
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      console.error('Failed to save notification prefs:', msg)
    } finally {
      setSaving(false)
    }
  }

  if (loadingPrefs) {
    return (
      <div className="loading-screen"><div>Loading preferences…</div></div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0A2239', marginBottom: '8px' }}>
          Notifications
        </h1>
        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
          Choose which alerts you want to receive.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px' }}>
        <section>
          <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
            Activity
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <NotifToggle label="New Loads" description="Alert when new loads matching your profile are posted" checked={prefs.newLoads} onChange={toggle('newLoads')} />
            <NotifToggle label="Bid Updates" description="Alert when your bids are accepted, rejected or countered" checked={prefs.bidUpdates} onChange={toggle('bidUpdates')} />
            <NotifToggle label="Job Status Changes" description="Alert when a job you are involved in changes status" checked={prefs.jobStatus} onChange={toggle('jobStatus')} />
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
            Compliance &amp; Admin
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <NotifToggle label="Document Expiry Reminders" description="Reminder 30, 14 and 7 days before a document expires" checked={prefs.docExpiry} onChange={toggle('docExpiry')} />
            <NotifToggle label="System Announcements" description="Platform updates, maintenance notices and new features" checked={prefs.systemAlerts} onChange={toggle('systemAlerts')} />
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
            Email
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <NotifToggle label="Weekly Digest" description="Summary of your activity and new opportunities every Monday" checked={prefs.emailDigest} onChange={toggle('emailDigest')} />
          </div>
        </section>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '10px 24px',
              background: saving ? '#9ca3af' : '#C8A64D', color: '#ffffff', border: 'none',
              borderRadius: '8px', fontSize: '14px', fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving…' : 'Save Preferences'}
          </button>
          {saved && (
            <span style={{ fontSize: '14px', color: '#16a34a', fontWeight: '500' }}>
              ✓ Preferences saved
            </span>
          )}
        </div>
      </div>
    </div>
  )
}



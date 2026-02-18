'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { UserProfileComplete } from '@/lib/types'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

export default function EditUserPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [roles, setRoles] = useState<string[]>([])
  
  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    phone_2: '',
    job_title: '',
    department: '',
    time_zone: 'GMT',
    is_driver: false,
    web_login_allowed: true,
    email_visible_to_members: false,
    has_mobile_account: false,
    mobile_option: 'FREE',
    username: '',
    interface_language: 'English',
    // Settings
    show_notification_bar: true,
    enable_load_alerts: true,
    send_booking_confirmation: true,
    enroute_alert_hours: 4,
    alert_distance_uk_miles: 10,
    alert_distance_euro_miles: 50,
    despatch_group: ''
  })

  useEffect(() => {
    if (!userId) return
    fetchUserData()
  }, [userId])

  const fetchUserData = async () => {
    try {
      setLoading(true)

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError

      // Fetch settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      // Settings might not exist yet, that's OK
      if (settingsError && settingsError.code !== 'PGRST116') throw settingsError

      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role_name')
        .eq('user_id', userId)

      if (rolesError) throw rolesError

      setUser(profileData)
      setSettings(settingsData || {})
      setRoles(rolesData?.map(r => r.role_name) || [])

      // Populate form
      setFormData({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        phone_2: profileData.phone_2 || '',
        job_title: profileData.job_title || '',
        department: profileData.department || '',
        time_zone: profileData.time_zone || 'GMT',
        is_driver: profileData.is_driver || false,
        web_login_allowed: profileData.web_login_allowed !== false,
        email_visible_to_members: profileData.email_visible_to_members || false,
        has_mobile_account: profileData.has_mobile_account || false,
        mobile_option: profileData.mobile_option || 'FREE',
        username: profileData.username || profileData.email || '',
        interface_language: profileData.interface_language || 'English',
        show_notification_bar: settingsData?.show_notification_bar !== false,
        enable_load_alerts: settingsData?.enable_load_alerts !== false,
        send_booking_confirmation: settingsData?.send_booking_confirmation !== false,
        enroute_alert_hours: settingsData?.enroute_alert_hours || 4,
        alert_distance_uk_miles: settingsData?.alert_distance_uk_miles || 10,
        alert_distance_euro_miles: settingsData?.alert_distance_euro_miles || 50,
        despatch_group: settingsData?.despatch_group || ''
      })

    } catch (err: any) {
      console.error('Error fetching user:', err)
      alert('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          phone_2: formData.phone_2,
          job_title: formData.job_title,
          department: formData.department,
          time_zone: formData.time_zone,
          is_driver: formData.is_driver,
          web_login_allowed: formData.web_login_allowed,
          email_visible_to_members: formData.email_visible_to_members,
          has_mobile_account: formData.has_mobile_account,
          mobile_option: formData.mobile_option,
          username: formData.username,
          interface_language: formData.interface_language,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (profileError) throw profileError

      // Update or insert settings
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          show_notification_bar: formData.show_notification_bar,
          enable_load_alerts: formData.enable_load_alerts,
          send_booking_confirmation: formData.send_booking_confirmation,
          enroute_alert_hours: formData.enroute_alert_hours,
          alert_distance_uk_miles: formData.alert_distance_uk_miles,
          alert_distance_euro_miles: formData.alert_distance_euro_miles,
          despatch_group: formData.despatch_group,
          updated_at: new Date().toISOString()
        })

      if (settingsError) throw settingsError

      alert('User profile updated successfully!')
      
    } catch (err: any) {
      console.error('Error saving:', err)
      alert('Failed to save: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleRoleToggle = async (roleName: string) => {
    try {
      if (roles.includes(roleName)) {
        // Remove role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role_name', roleName)

        if (error) throw error
        setRoles(roles.filter(r => r !== roleName))
      } else {
        // Add role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role_name: roleName
          })

        if (error) throw error
        setRoles([...roles, roleName])
      }
    } catch (err: any) {
      console.error('Error updating role:', err)
      alert('Failed to update role')
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-text">Loading user profile...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ color: '#ef4444', marginBottom: '16px' }}>User not found</div>
        <button
          onClick={() => router.back()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Go Back
        </button>
      </div>
    )
  }

  const FormSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{
        fontSize: '18px',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        {title}
      </h2>
      {children}
    </div>
  )

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '8px'
        }}>
          Edit User / Company Driver
        </h1>
      </div>

      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '32px'
      }}>
        <FormSection title="Profile Details">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                First Name: <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Last Name: <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px'
                }}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Email: <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                readOnly
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: '#f3f4f6'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Phone 1: <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+44 7767308191"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Phone 2:
              </label>
              <input
                type="tel"
                value={formData.phone_2}
                onChange={(e) => setFormData({ ...formData, phone_2: e.target.value })}
                placeholder="+44 7423272138"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Job Title:
              </label>
              <input
                type="text"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                placeholder="DRIVER"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Time Zone: <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={formData.time_zone}
                onChange={(e) => setFormData({ ...formData, time_zone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="GMT">GMT</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={formData.is_driver}
                onChange={(e) => setFormData({ ...formData, is_driver: e.target.checked })}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Will this user be classified as a driver?</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={formData.web_login_allowed}
                onChange={(e) => setFormData({ ...formData, web_login_allowed: e.target.checked })}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Web Login Allowed</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={formData.email_visible_to_members}
                onChange={(e) => setFormData({ ...formData, email_visible_to_members: e.target.checked })}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Email visible to members</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={formData.has_mobile_account}
                onChange={(e) => setFormData({ ...formData, has_mobile_account: e.target.checked })}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Mobile Account</span>
            </label>
          </div>
        </FormSection>

        <FormSection title="Settings">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={formData.show_notification_bar}
                onChange={(e) => setFormData({ ...formData, show_notification_bar: e.target.checked })}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Show Notification Bar</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={formData.enable_load_alerts}
                onChange={(e) => setFormData({ ...formData, enable_load_alerts: e.target.checked })}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Enable Load Alerts</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={formData.send_booking_confirmation}
                onChange={(e) => setFormData({ ...formData, send_booking_confirmation: e.target.checked })}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Send Booking Confirmation Email</span>
            </label>
          </div>

          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', display: 'block' }}>
                UK Alert Distance:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  value={formData.alert_distance_uk_miles}
                  onChange={(e) => setFormData({ ...formData, alert_distance_uk_miles: Number(e.target.value) })}
                  style={{
                    width: '100px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px'
                  }}
                />
                <span style={{ fontSize: '14px', color: '#6b7280' }}>miles</span>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', display: 'block' }}>
                Euro Alert Distance:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  value={formData.alert_distance_euro_miles}
                  onChange={(e) => setFormData({ ...formData, alert_distance_euro_miles: Number(e.target.value) })}
                  style={{
                    width: '100px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px'
                  }}
                />
                <span style={{ fontSize: '14px', color: '#6b7280' }}>miles</span>
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection title="Roles">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {['Company Admin', 'Company User', 'Finance Director', 'Finance Bookkeeper'].map(role => (
              <label key={role} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={roles.includes(role)}
                  onChange={() => handleRoleToggle(role)}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>{role}</span>
              </label>
            ))}
          </div>
        </FormSection>

        <div style={{
          display: 'flex',
          gap: '12px',
          paddingTop: '24px',
          borderTop: '2px solid #e5e7eb'
        }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '12px 32px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#ffffff',
              backgroundColor: saving ? '#9ca3af' : '#10b981',
              border: 'none',
              borderRadius: '6px',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => router.back()}
            style={{
              padding: '12px 32px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#6b7280',
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

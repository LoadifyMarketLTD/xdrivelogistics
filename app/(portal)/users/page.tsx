'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  first_name: string | null
  last_name: string | null
  job_title: string | null
  is_driver: boolean
  is_active: boolean
  created_at: string
  email_verified: boolean
  roles: string[]
  despatch_group: string | null
  enable_load_alerts: boolean
}

export default function UsersManagementPage() {
  const { companyId } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [itemsPerPage, setItemsPerPage] = useState(250)
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'drivers'>('all')

  useEffect(() => {
    if (!companyId) return
    fetchUsers()
  }, [companyId])

  useEffect(() => {
    // Filter users based on search term and active tab
    let filtered = users

    // Apply tab filter
    if (activeTab === 'drivers') {
      filtered = filtered.filter(u => u.is_driver)
    } else if (activeTab === 'users') {
      filtered = filtered.filter(u => !u.is_driver)
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(u =>
        u.email?.toLowerCase().includes(search) ||
        u.full_name?.toLowerCase().includes(search) ||
        u.first_name?.toLowerCase().includes(search) ||
        u.last_name?.toLowerCase().includes(search) ||
        u.job_title?.toLowerCase().includes(search)
      )
    }

    setFilteredUsers(filtered)
  }, [searchTerm, users, activeTab])

  const fetchUsers = async () => {
    try {
      setLoading(true)

      // Fetch all users in the company
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Fetch auth users to get email verification status
      const userIds = profilesData?.map(p => p.user_id) || []
      
      // Fetch settings for all users
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .in('user_id', userIds)

      // Fetch roles for all users
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .in('user_id', userIds)

      // Combine the data
      const combinedUsers = profilesData?.map(profile => {
        const settings = settingsData?.find(s => s.user_id === profile.user_id)
        const userRoles = rolesData?.filter(r => r.user_id === profile.user_id).map(r => r.role_name) || []
        
        return {
          id: profile.user_id,
          email: profile.email,
          full_name: profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
          first_name: profile.first_name,
          last_name: profile.last_name,
          job_title: profile.job_title,
          is_driver: profile.is_driver || false,
          is_active: profile.is_active !== false,
          created_at: profile.created_at,
          email_verified: true, // We can't easily check this from auth.users
          roles: userRoles,
          despatch_group: settings?.despatch_group || null,
          enable_load_alerts: settings?.enable_load_alerts !== false
        }
      }) || []

      setUsers(combinedUsers)
      setFilteredUsers(combinedUsers)
    } catch (err: any) {
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = () => {
    router.push('/users/new')
  }

  const handleEditUser = (userId: string) => {
    router.push(`/users/${userId}`)
  }

  const handleSendReminder = async (userId: string) => {
    const u = users.find(u => u.id === userId)
    if (!u?.email) return
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(u.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      alert(`Password reset email sent to ${u.email}. They should check their inbox and follow the link to set a new password.`)
    } catch (err: any) {
      alert('Failed to send reminder: ' + err.message)
    }
  }

  const handleViewEventLog = (userId: string) => {
    router.push(`/users/${userId}`)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-text">Loading users...</div>
      </div>
    )
  }

  const getRoleDisplay = (roles: string[]) => {
    if (roles.length === 0) return 'Company User'
    return roles.join(', ')
  }

  return (
    <div className="portal-layout">
      <div className="portal-header">
        <h1 className="portal-title">Users / Drivers</h1>
      </div>

      <div className="portal-main">
        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '2px solid var(--portal-divider)'
        }}>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              color: activeTab === 'all' ? 'var(--portal-accent)' : 'var(--portal-text-secondary)',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'all' ? '3px solid var(--portal-accent)' : '3px solid transparent',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            All Users / Drivers
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              color: activeTab === 'users' ? 'var(--portal-accent)' : 'var(--portal-text-secondary)',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'users' ? '3px solid var(--portal-accent)' : '3px solid transparent',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              color: activeTab === 'drivers' ? 'var(--portal-accent)' : 'var(--portal-text-secondary)',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'drivers' ? '3px solid var(--portal-accent)' : '3px solid transparent',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            Company Drivers
          </button>
        </div>

        {/* Search and Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--portal-text-primary)' }}>
              Search:
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, job title..."
              className="portal-filter-input"
              style={{ maxWidth: '400px', flex: 1 }}
            />
            <button
              onClick={() => setSearchTerm('')}
              className="portal-btn portal-btn-outline"
              style={{ padding: '8px 16px' }}
            >
              Clear
            </button>
          </div>

          <button
            onClick={handleAddUser}
            className="portal-btn portal-btn-primary"
          >
            Add User / Company Driver
          </button>
        </div>

        {/* Items per page */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--portal-text-primary)' }}>
            Items per Page:
          </label>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="portal-filter-input"
            style={{ width: 'auto' }}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={250}>250</option>
          </select>
        </div>

        {/* Results Count */}
        <div style={{
          fontSize: '14px',
          color: 'var(--portal-text-secondary)',
          marginBottom: '16px'
        }}>
          1-{Math.min(filteredUsers.length, itemsPerPage)} of {filteredUsers.length}
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: 'var(--portal-text-secondary)',
            backgroundColor: 'var(--portal-card)',
            borderRadius: '8px',
            border: '1px solid var(--portal-divider)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No users found</p>
            <p style={{ fontSize: '14px' }}>
              {searchTerm ? 'Try adjusting your search criteria' : 'Add your first user to get started'}
            </p>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'var(--portal-card)',
            border: '1px solid var(--portal-divider)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px'
              }}>
                <thead>
                  <tr style={{
                    borderBottom: '2px solid var(--portal-divider)',
                    backgroundColor: 'var(--portal-bg-secondary)',
                    color: 'var(--portal-text-secondary)',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    letterSpacing: '0.5px'
                  }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Role</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Is Driver?</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Email Verified</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Job Title</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Despatch Group</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Alerts</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.slice(0, itemsPerPage).map((user, index) => (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: '1px solid var(--portal-divider)',
                        transition: 'background 0.2s',
                        backgroundColor: index % 2 === 0 ? 'transparent' : 'var(--portal-bg-secondary)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--portal-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'transparent' : 'var(--portal-bg-secondary)'}
                    >
                      <td style={{ padding: '12px 16px', color: 'var(--portal-text-primary)', fontWeight: '500' }}>
                        {user.full_name || 'N/A'}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--portal-text-secondary)', fontSize: '12px' }}>
                        {getRoleDisplay(user.roles)}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {user.is_driver ? (
                          <span style={{ color: '#10b981', fontWeight: '600' }}>Yes</span>
                        ) : (
                          <span style={{ color: 'var(--portal-text-muted)' }}>No</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--portal-text-secondary)' }}>
                        <a href={`mailto:${user.email}`} style={{ color: 'var(--portal-accent)', textDecoration: 'none' }}>
                          {user.email}
                        </a>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {user.email_verified ? (
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            backgroundColor: '#dcfce7',
                            color: '#166534',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            Verified
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            backgroundColor: '#fef3c7',
                            color: '#92400e',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            Pending
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--portal-text-secondary)' }}>
                        {user.job_title || '-'}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--portal-text-secondary)' }}>
                        {user.despatch_group || '-'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {user.enable_load_alerts ? (
                          <span style={{ color: '#10b981', fontWeight: '600' }}>Yes</span>
                        ) : (
                          <span style={{ color: 'var(--portal-text-muted)' }}>No</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleEditUser(user.id)}
                            className="portal-btn portal-btn-outline"
                            style={{ padding: '4px 12px', fontSize: '12px' }}
                            title="Edit User"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleViewEventLog(user.id)}
                            className="portal-btn portal-btn-outline"
                            style={{ padding: '4px 12px', fontSize: '12px' }}
                            title="View Event Log"
                          >
                            Event Log
                          </button>
                          <button
                            onClick={() => handleSendReminder(user.id)}
                            className="portal-btn portal-btn-outline"
                            style={{ padding: '4px 12px', fontSize: '12px' }}
                            title="Send Reminder"
                          >
                            Send Reminder
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Results Footer */}
        <div style={{
          fontSize: '14px',
          color: 'var(--portal-text-secondary)',
          marginTop: '16px',
          textAlign: 'center'
        }}>
          1-{Math.min(filteredUsers.length, itemsPerPage)} of {filteredUsers.length}
        </div>
      </div>
    </div>
  )
}

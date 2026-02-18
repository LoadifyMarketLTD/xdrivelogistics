'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/AuthContext'
import { Vehicle } from '@/lib/types'
import ResponsiveContainer from '@/components/layout/ResponsiveContainer'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

export default function MyFleetPage() {
  const { companyId, user } = useAuth()
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [itemsPerPage, setItemsPerPage] = useState(50)
  const [company, setCompany] = useState<any>(null)

  useEffect(() => {
    if (!companyId) return
    fetchData()
  }, [companyId])

  useEffect(() => {
    // Filter vehicles based on search term
    if (searchTerm) {
      const filtered = vehicles.filter(v => 
        v.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.registration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.current_location?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredVehicles(filtered)
    } else {
      setFilteredVehicles(vehicles)
    }
  }, [searchTerm, vehicles])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch vehicles
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('company_id', companyId)
        .order('driver_name', { ascending: true })

      if (vehiclesError) throw vehiclesError

      // Fetch company details
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single()

      if (companyError) throw companyError

      setVehicles(vehiclesData || [])
      setFilteredVehicles(vehiclesData || [])
      setCompany(companyData)
    } catch (err: any) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    const time = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    })
    
    if (diffDays === 0) {
      return `@ ${time}`
    } else {
      const dateStr = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short'
      })
      return `@ ${time} ${dateStr}`
    }
  }

  const handleAddVehicle = () => {
    router.push('/drivers-vehicles')
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-text">Loading fleet...</div>
      </div>
    )
  }

  return (
    <ResponsiveContainer maxWidth="xl">
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: '20px',
        margin: '0 auto'
      }}>
        {/* Main Content */}
        <div>
        {/* Header */}
        <div style={{
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '2px solid #e5e7eb'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            My Fleet
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#6b7280'
          }}>
            Update your fleet status
          </p>
        </div>

        {/* Search and Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          gap: '16px'
        }}>
          <div style={{ flex: 1, maxWidth: '400px' }}>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px',
                fontSize: '14px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                outline: 'none'
              }}
            />
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Items per Page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              style={{
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Vehicle Count */}
        <div style={{
          marginBottom: '12px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          1-{Math.min(filteredVehicles.length, itemsPerPage)} of {filteredVehicles.length}
        </div>

        {/* Vehicles Table */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            overflowX: 'auto'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px'
            }}>
              <thead>
                <tr style={{
                  backgroundColor: '#f9fafb',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Size</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                    Current Location / Last Tracked
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                    Future Vehicle Position
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                    Future Journey
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                    Advertise vehicle status to
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>
                    Tracked
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{
                      padding: '40px',
                      textAlign: 'center',
                      color: '#6b7280'
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚛</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                        No vehicles in your fleet
                      </div>
                      <div style={{ fontSize: '14px', marginBottom: '16px' }}>
                        Add vehicles to start tracking your fleet
                      </div>
                      <button
                        onClick={handleAddVehicle}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#3b82f6',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        Add Vehicle
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.slice(0, itemsPerPage).map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      style={{
                        borderBottom: '1px solid #e5e7eb',
                        transition: 'background-color 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Name */}
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                          {vehicle.driver_name || 'Unassigned'}
                          {vehicle.make && vehicle.model && `, ${vehicle.make} ${vehicle.model}`}
                        </div>
                        {vehicle.registration && (
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {vehicle.registration}
                          </div>
                        )}
                      </td>

                      {/* Size */}
                      <td style={{ padding: '16px' }}>
                        <div style={{ color: '#4b5563' }}>
                          {vehicle.vehicle_size || vehicle.vehicle_type || 'N/A'}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px' }}>
                        <div style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: vehicle.is_available ? '#dcfce7' : '#fee2e2',
                          color: vehicle.is_available ? '#166534' : '#991b1b'
                        }}>
                          {vehicle.current_status || 'Waiting for next job (available)'}
                        </div>
                      </td>

                      {/* Current Location */}
                      <td style={{ padding: '16px' }}>
                        {vehicle.current_location ? (
                          <div>
                            <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                              {vehicle.current_location}
                            </div>
                            {vehicle.last_tracked_at && (
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                {formatDateTime(vehicle.last_tracked_at)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ color: '#9ca3af', fontSize: '12px' }}>Not tracked</div>
                        )}
                      </td>

                      {/* Future Position */}
                      <td style={{ padding: '16px' }}>
                        {vehicle.future_position ? (
                          <div style={{ color: '#4b5563' }}>{vehicle.future_position}</div>
                        ) : (
                          <button
                            style={{
                              padding: '6px 12px',
                              fontSize: '12px',
                              color: '#3b82f6',
                              backgroundColor: 'transparent',
                              border: '1px solid #3b82f6',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: '500'
                            }}
                          >
                            Add Future Position
                          </button>
                        )}
                      </td>

                      {/* Future Journey */}
                      <td style={{ padding: '16px' }}>
                        {vehicle.future_journey ? (
                          <div style={{ color: '#4b5563' }}>{vehicle.future_journey}</div>
                        ) : (
                          <button
                            style={{
                              padding: '6px 12px',
                              fontSize: '12px',
                              color: '#10b981',
                              backgroundColor: 'transparent',
                              border: '1px solid #10b981',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: '500'
                            }}
                          >
                            Add
                          </button>
                        )}
                      </td>

                      {/* Advertise To */}
                      <td style={{ padding: '16px' }}>
                        <div style={{ color: '#4b5563' }}>
                          {vehicle.advertise_to || 'General Exchange'}
                        </div>
                      </td>

                      {/* Tracked */}
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={vehicle.is_tracked}
                          readOnly
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer'
                          }}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Member Info Sidebar */}
      <div>
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px'
        }}>
          {/* Member Info Header */}
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            Member info
          </h3>

          {/* Company Details */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '12px'
            }}>
              Company Details
            </h4>
            <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
              <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                {company?.name || 'XDRIVE LOGISTICS LTD'}
              </div>
              <div style={{ color: '#6b7280', marginBottom: '2px' }}>
                ID: GB 265078
              </div>
              <div style={{ color: '#6b7280', marginBottom: '8px' }}>
                Main Contact: {user?.email?.split('@')[0] || 'Ion Preda'}
              </div>
              <div style={{ color: '#4b5563', marginTop: '12px' }}>
                {company?.address || '101 CORNELIAN STREET'}
              </div>
              <div style={{ color: '#4b5563' }}>
                {company?.postcode || 'BLACKBURN BB1 9QL'}
              </div>
              <div style={{ color: '#3b82f6', marginTop: '8px' }}>
                {company?.email || 'xdrivelogisticsltd@gmail.com'}
              </div>
            </div>
          </div>

          {/* Subscription Details */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '12px'
            }}>
              Subscription details
            </h4>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
              0 Months
            </div>
            <button
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                color: '#3b82f6',
                backgroundColor: '#dbeafe',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                width: '100%'
              }}
            >
              Check Renewal Details
            </button>
          </div>

          {/* Help Section */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '12px'
            }}>
              Help
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '13px'
            }}>
              <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                Help Centre
              </a>
              <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                TERMS & CONDITIONS
              </a>
              <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                LATEST NEWS
              </a>
            </div>
          </div>

          {/* Contact Us */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '12px'
            }}>
              Contact us
            </h4>
            <button
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                color: '#ffffff',
                backgroundColor: '#10b981',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                width: '100%'
              }}
            >
              Submit a support ticket
            </button>
          </div>

          {/* User Profile */}
          <div style={{
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '12px'
            }}>
              {user?.email?.split('@')[0] || 'Ion Preda'}
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '13px'
            }}>
              <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                My profile
              </a>
              <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                Feedback
              </a>
              <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                Settings
              </a>
              <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                Get Started
              </a>
              <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                Company Profile
              </a>
              <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                Documents
              </a>
              <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                Users / Drivers
              </a>
              <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                Other
              </a>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveContainer>
  )
}

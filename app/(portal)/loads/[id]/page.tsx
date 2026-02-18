'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { JobWithTracking } from '@/lib/types'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

export default function LoadDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { companyId } = useAuth()
  const jobId = params.id as string
  
  const [job, setJob] = useState<JobWithTracking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!jobId) return
    
    const fetchJobDetails = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch job with all details
        const { data, error: fetchError } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .single()
        
        if (fetchError) throw fetchError
        
        setJob(data)
      } catch (err: any) {
        console.error('Error fetching job details:', err)
        setError(err.message || 'Failed to load job details')
      } finally {
        setLoading(false)
      }
    }
    
    fetchJobDetails()
  }, [jobId])

  if (loading) {
    return (
      <div className="loading-screen">
        Loading job details...
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="alert alert-error">
        Error: {error || 'Job not found'}
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { className: string; label: string }> = {
      'open': { className: 'live', label: 'Live' },
      'assigned': { className: 'allocated', label: 'Allocated' },
      'in-transit': { className: 'allocated', label: 'In Transit' },
      'completed': { className: 'delivered', label: 'Completed' },
      'delivered': { className: 'delivered', label: 'Delivered' },
      'cancelled': { className: 'cancelled', label: 'Cancelled' },
    }
    
    const statusInfo = statusMap[status] || { className: 'pending', label: status }
    
    return (
      <span className={`status-badge ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    )
  }

  const formatAddress = (
    addressLine1?: string | null,
    addressLine2?: string | null,
    city?: string | null,
    postcode?: string | null,
    country?: string | null
  ) => {
    const parts = [addressLine1, addressLine2, city, postcode, country].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : null
  }

  const pickupFullAddress = formatAddress(
    job.pickup_address_line1,
    job.pickup_address_line2,
    job.pickup_city,
    job.pickup_postcode,
    job.pickup_country
  )

  const deliveryFullAddress = formatAddress(
    job.delivery_address_line1,
    job.delivery_address_line2,
    job.delivery_city,
    job.delivery_postcode,
    job.delivery_country
  )

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header Section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px' 
      }}>
        <div>
          <button
            onClick={() => router.push('/loads')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--cx-blue)',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '8px',
              padding: '0'
            }}
          >
            ← Back to Loads
          </button>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '600', 
            color: 'var(--cx-text-primary)',
            margin: '8px 0'
          }}>
            Load Details
          </h1>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            color: 'var(--cx-text-secondary)', 
            margin: '4px 0'
          }}>
            <span>Job ID: {job.id}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(job.id)
                alert('Job ID copied to clipboard!')
              }}
              style={{
                background: 'none',
                border: '1px solid var(--cx-border)',
                padding: '2px 8px',
                cursor: 'pointer',
                fontSize: '12px',
                color: 'var(--cx-text-secondary)',
                borderRadius: '4px'
              }}
              title="Copy full Job ID"
            >
              📋 Copy
            </button>
          </div>
        </div>
        <div>
          {getStatusBadge(job.status)}
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* Pickup Information */}
        <div style={{
          background: 'var(--cx-card)',
          border: '1px solid var(--cx-border)',
          padding: '20px'
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '16px',
            color: 'var(--cx-text-primary)'
          }}>
            📍 Pickup Information
          </h2>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '12px', 
              fontWeight: '600', 
              color: 'var(--cx-text-secondary)',
              marginBottom: '4px'
            }}>
              Location
            </label>
            <div style={{ fontSize: '14px', color: 'var(--cx-text-primary)' }}>
              {pickupFullAddress || job.pickup_location}
            </div>
          </div>

          {job.pickup_postcode && (
            <div style={{ marginBottom: '12px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                fontWeight: '600', 
                color: 'var(--cx-text-secondary)',
                marginBottom: '4px'
              }}>
                Postcode
              </label>
              <div style={{ fontSize: '14px', color: 'var(--cx-text-primary)', fontWeight: '600' }}>
                {job.pickup_postcode}
              </div>
            </div>
          )}

          {job.pickup_datetime && (
            <div style={{ marginBottom: '12px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                fontWeight: '600', 
                color: 'var(--cx-text-secondary)',
                marginBottom: '4px'
              }}>
                Pickup Date & Time
              </label>
              <div style={{ fontSize: '14px', color: 'var(--cx-text-primary)' }}>
                {new Date(job.pickup_datetime).toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {/* Delivery Information */}
        <div style={{
          background: 'var(--cx-card)',
          border: '1px solid var(--cx-border)',
          padding: '20px'
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '16px',
            color: 'var(--cx-text-primary)'
          }}>
            🎯 Delivery Information
          </h2>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '12px', 
              fontWeight: '600', 
              color: 'var(--cx-text-secondary)',
              marginBottom: '4px'
            }}>
              Location
            </label>
            <div style={{ fontSize: '14px', color: 'var(--cx-text-primary)' }}>
              {deliveryFullAddress || job.delivery_location}
            </div>
          </div>

          {job.delivery_postcode && (
            <div style={{ marginBottom: '12px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                fontWeight: '600', 
                color: 'var(--cx-text-secondary)',
                marginBottom: '4px'
              }}>
                Postcode
              </label>
              <div style={{ fontSize: '14px', color: 'var(--cx-text-primary)', fontWeight: '600' }}>
                {job.delivery_postcode}
              </div>
            </div>
          )}

          {job.delivery_datetime && (
            <div style={{ marginBottom: '12px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                fontWeight: '600', 
                color: 'var(--cx-text-secondary)',
                marginBottom: '4px'
              }}>
                Delivery Date & Time
              </label>
              <div style={{ fontSize: '14px', color: 'var(--cx-text-primary)' }}>
                {new Date(job.delivery_datetime).toLocaleString()}
              </div>
            </div>
          )}

          {job.distance_miles && (
            <div style={{ marginBottom: '12px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                fontWeight: '600', 
                color: 'var(--cx-text-secondary)',
                marginBottom: '4px'
              }}>
                Distance
              </label>
              <div style={{ fontSize: '14px', color: 'var(--cx-text-primary)' }}>
                {job.distance_miles} miles
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Company Information */}
      {(job.booked_by_company_name || job.booked_by_company_phone || job.booked_by_company_email) && (
        <div style={{
          background: 'var(--cx-card)',
          border: '1px solid var(--cx-border)',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '16px',
            color: 'var(--cx-text-primary)'
          }}>
            🏢 Booked By
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '16px' 
          }}>
            {job.booked_by_company_name && (
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: 'var(--cx-text-secondary)',
                  marginBottom: '4px'
                }}>
                  Company Name
                </label>
                <div style={{ fontSize: '14px', color: 'var(--cx-text-primary)', fontWeight: '600' }}>
                  {job.booked_by_company_name}
                </div>
              </div>
            )}

            {job.booked_by_company_phone && (
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: 'var(--cx-text-secondary)',
                  marginBottom: '4px'
                }}>
                  Phone
                </label>
                <div style={{ fontSize: '14px', color: 'var(--cx-text-primary)' }}>
                  📞 {job.booked_by_company_phone}
                </div>
              </div>
            )}

            {job.booked_by_company_email && (
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: 'var(--cx-text-secondary)',
                  marginBottom: '4px'
                }}>
                  Email
                </label>
                <div style={{ fontSize: '14px', color: 'var(--cx-text-primary)' }}>
                  ✉️ {job.booked_by_company_email}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rate & Payment Information */}
      <div style={{
        background: 'var(--cx-card)',
        border: '1px solid var(--cx-border)',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: 'var(--cx-text-primary)'
        }}>
          💰 Rate & Payment
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '16px' 
        }}>
          {job.budget && (
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                fontWeight: '600', 
                color: 'var(--cx-text-secondary)',
                marginBottom: '4px'
              }}>
                Budget
              </label>
              <div style={{ 
                fontSize: '18px', 
                color: 'var(--cx-text-primary)', 
                fontWeight: '600' 
              }}>
                £{job.budget.toFixed(2)}
              </div>
            </div>
          )}

          {job.agreed_rate && (
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                fontWeight: '600', 
                color: 'var(--cx-text-secondary)',
                marginBottom: '4px'
              }}>
                Agreed Rate
              </label>
              <div style={{ 
                fontSize: '18px', 
                color: 'var(--cx-green)', 
                fontWeight: '600' 
              }}>
                £{job.agreed_rate.toFixed(2)}
              </div>
            </div>
          )}

          {job.payment_terms && (
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                fontWeight: '600', 
                color: 'var(--cx-text-secondary)',
                marginBottom: '4px'
              }}>
                Payment Terms
              </label>
              <div style={{ fontSize: '14px', color: 'var(--cx-text-primary)' }}>
                {job.payment_terms}
              </div>
            </div>
          )}

          {job.smartpay_enabled && (
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                fontWeight: '600', 
                color: 'var(--cx-text-secondary)',
                marginBottom: '4px'
              }}>
                Payment Method
              </label>
              <div style={{
                display: 'inline-block',
                padding: '4px 12px',
                background: 'var(--cx-green)',
                color: 'white',
                fontSize: '12px',
                fontWeight: '600',
                marginTop: '4px'
              }}>
                ⚡ SmartPay Enabled
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Information */}
      <div style={{
        background: 'var(--cx-card)',
        border: '1px solid var(--cx-border)',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: 'var(--cx-text-primary)'
        }}>
          🚛 Vehicle & Load Details
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '16px',
          marginBottom: '16px'
        }}>
          {job.vehicle_type && (
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                fontWeight: '600', 
                color: 'var(--cx-text-secondary)',
                marginBottom: '4px'
              }}>
                Vehicle Type Requested
              </label>
              <div style={{ fontSize: '14px', color: 'var(--cx-text-primary)', fontWeight: '600' }}>
                {job.vehicle_type}
              </div>
            </div>
          )}

          {job.assigned_vehicle_type && (
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                fontWeight: '600', 
                color: 'var(--cx-text-secondary)',
                marginBottom: '4px'
              }}>
                Assigned Vehicle Type
              </label>
              <div style={{ fontSize: '14px', color: 'var(--cx-green)', fontWeight: '600' }}>
                {job.assigned_vehicle_type}
              </div>
            </div>
          )}

          {job.vehicle_ref && (
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                fontWeight: '600', 
                color: 'var(--cx-text-secondary)',
                marginBottom: '4px'
              }}>
                Vehicle Reference
              </label>
              <div style={{ fontSize: '14px', color: 'var(--cx-text-primary)' }}>
                {job.vehicle_ref}
              </div>
            </div>
          )}

          {job.weight_kg && (
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                fontWeight: '600', 
                color: 'var(--cx-text-secondary)',
                marginBottom: '4px'
              }}>
                Weight
              </label>
              <div style={{ fontSize: '14px', color: 'var(--cx-text-primary)' }}>
                {job.weight_kg} kg
              </div>
            </div>
          )}
        </div>

        {/* Dimensions & Packaging */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '16px' 
        }}>
          {job.packaging && (
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                fontWeight: '600', 
                color: 'var(--cx-text-secondary)',
                marginBottom: '4px'
              }}>
                Packaging
              </label>
              <div style={{ fontSize: '14px', color: 'var(--cx-text-primary)' }}>
                {job.packaging}
              </div>
            </div>
          )}

          {job.pallets && (
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                fontWeight: '600', 
                color: 'var(--cx-text-secondary)',
                marginBottom: '4px'
              }}>
                Pallets
              </label>
              <div style={{ fontSize: '14px', color: 'var(--cx-text-primary)' }}>
                {job.pallets}
              </div>
            </div>
          )}

          {(job.length_cm || job.width_cm || job.height_cm) && (
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                fontWeight: '600', 
                color: 'var(--cx-text-secondary)',
                marginBottom: '4px'
              }}>
                Dimensions (L × W × H)
              </label>
              <div style={{ fontSize: '14px', color: 'var(--cx-text-primary)' }}>
                {job.length_cm || '?'} × {job.width_cm || '?'} × {job.height_cm || '?'} cm
              </div>
            </div>
          )}
        </div>
      </div>

      {/* References */}
      {(job.your_ref || job.cust_ref) && (
        <div style={{
          background: 'var(--cx-card)',
          border: '1px solid var(--cx-border)',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '16px',
            color: 'var(--cx-text-primary)'
          }}>
            📋 References
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '16px' 
          }}>
            {job.your_ref && (
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: 'var(--cx-text-secondary)',
                  marginBottom: '4px'
                }}>
                  Your Reference
                </label>
                <div style={{ fontSize: '14px', color: 'var(--cx-text-primary)' }}>
                  {job.your_ref}
                </div>
              </div>
            )}

            {job.cust_ref && (
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: 'var(--cx-text-secondary)',
                  marginBottom: '4px'
                }}>
                  Customer Reference
                </label>
                <div style={{ fontSize: '14px', color: 'var(--cx-text-primary)' }}>
                  {job.cust_ref}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Load Details */}
      {job.load_details && (
        <div style={{
          background: 'var(--cx-card)',
          border: '1px solid var(--cx-border)',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '16px',
            color: 'var(--cx-text-primary)'
          }}>
            📝 Additional Details
          </h2>
          
          <div style={{ 
            fontSize: '14px', 
            color: 'var(--cx-text-primary)',
            lineHeight: '1.6'
          }}>
            {job.load_details}
          </div>
        </div>
      )}
    </div>
  )
}

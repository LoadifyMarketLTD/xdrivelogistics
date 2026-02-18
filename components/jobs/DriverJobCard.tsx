'use client'

import React from 'react'

interface Job {
  id: string
  job_code?: string
  pickup_location: string
  pickup_datetime: string | null
  delivery_location: string
  delivery_datetime: string | null
  current_status?: string
  status?: string
  driver_id?: string
  posted_by_company_id: string
  vehicle_type?: string | null
  load_details?: string | null
  pallets?: number | null
  weight_kg?: number | null
}

interface Company {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  address_line1?: string | null
  city?: string | null
  postcode?: string | null
}

interface DriverJobCardProps {
  job: Job
  postingCompany: Company
  driverName?: string
  driverPhone?: string
  vehicleReg?: string
  className?: string
}

/**
 * DriverJobCard - Professional job card for drivers
 * Shows "Acting on behalf of" posting company (NOT driver's company)
 * Only displays when job is allocated/in-progress
 */
export default function DriverJobCard({
  job,
  postingCompany,
  driverName,
  driverPhone,
  vehicleReg,
  className = '',
}: DriverJobCardProps) {
  const currentStatus = job.current_status || job.status || 'ALLOCATED'
  
  return (
    <div 
      className={`driver-job-card ${className}`}
      style={{
        background: '#ffffff',
        border: '2px solid #d4af37',
        borderRadius: '12px',
        padding: 'clamp(16px, 3vw, 24px)',
        maxWidth: '900px',
        margin: '0 auto',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Header */}
      <div style={{
        borderBottom: '2px solid #d4af37',
        paddingBottom: '16px',
        marginBottom: '20px',
      }}>
        <h1 style={{
          fontSize: 'clamp(1.25rem, 2.5vw, 1.875rem)',
          fontWeight: '700',
          color: '#1f2937',
          margin: '0 0 8px 0',
          letterSpacing: '-0.025em',
        }}>
          XDrive Driver Job Card
        </h1>
        <div style={{
          fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
          color: '#6b7280',
          fontWeight: '600',
        }}>
          Job ID: {job.job_code || job.id.slice(0, 8).toUpperCase()}
        </div>
      </div>

      {/* CRITICAL: "Acting on Behalf of" - MUST be prominent */}
      <div style={{
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        border: '3px solid #d4af37',
        borderRadius: '8px',
        padding: 'clamp(14px, 2.5vw, 18px)',
        marginBottom: '24px',
        boxShadow: '0 2px 4px rgba(212, 175, 55, 0.2)',
      }}>
        <div style={{
          fontSize: 'clamp(0.75rem, 1vw, 0.875rem)',
          color: '#92400e',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '6px',
        }}>
          ⚠️ Acting on Behalf of
        </div>
        <div style={{
          fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
          color: '#1f2937',
          fontWeight: '800',
          lineHeight: '1.2',
        }}>
          {postingCompany.name}
        </div>
        {postingCompany.phone && (
          <div style={{
            fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
            color: '#4b5563',
            marginTop: '6px',
            fontWeight: '600',
          }}>
            📞 {postingCompany.phone}
          </div>
        )}
        {postingCompany.email && (
          <div style={{
            fontSize: 'clamp(0.75rem, 1vw, 0.875rem)',
            color: '#6b7280',
            marginTop: '4px',
          }}>
            ✉️ {postingCompany.email}
          </div>
        )}
      </div>

      {/* Pickup Details */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{
          fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: 'clamp(1.25rem, 1.8vw, 1.5rem)' }}>📍</span>
          Pickup Location
        </h3>
        <div style={{
          background: '#f9fafb',
          padding: 'clamp(12px, 2vw, 16px)',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
        }}>
          <div style={{
            fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
            color: '#1f2937',
            fontWeight: '600',
            marginBottom: '6px',
          }}>
            {job.pickup_location}
          </div>
          {job.pickup_datetime && (
            <div style={{
              fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span>📅</span>
              {new Date(job.pickup_datetime).toLocaleString('en-GB', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delivery Details */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{
          fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: 'clamp(1.25rem, 1.8vw, 1.5rem)' }}>🎯</span>
          Delivery Location
        </h3>
        <div style={{
          background: '#f9fafb',
          padding: 'clamp(12px, 2vw, 16px)',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
        }}>
          <div style={{
            fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
            color: '#1f2937',
            fontWeight: '600',
            marginBottom: '6px',
          }}>
            {job.delivery_location}
          </div>
          {job.delivery_datetime && (
            <div style={{
              fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span>📅</span>
              {new Date(job.delivery_datetime).toLocaleString('en-GB', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
        </div>
      </div>

      {/* Job Details Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 'clamp(12px, 2vw, 16px)',
        marginBottom: '20px',
      }}>
        {job.vehicle_type && (
          <div style={{
            background: '#f3f4f6',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
          }}>
            <div style={{
              fontSize: 'clamp(0.75rem, 1vw, 0.875rem)',
              color: '#6b7280',
              marginBottom: '4px',
              fontWeight: '500',
            }}>
              Vehicle Type
            </div>
            <div style={{
              fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
              color: '#1f2937',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span>🚛</span>
              {job.vehicle_type}
            </div>
          </div>
        )}
        
        {vehicleReg && (
          <div style={{
            background: '#f3f4f6',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
          }}>
            <div style={{
              fontSize: 'clamp(0.75rem, 1vw, 0.875rem)',
              color: '#6b7280',
              marginBottom: '4px',
              fontWeight: '500',
            }}>
              Vehicle Registration
            </div>
            <div style={{
              fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
              color: '#1f2937',
              fontWeight: '700',
              fontFamily: 'monospace',
            }}>
              {vehicleReg}
            </div>
          </div>
        )}
        
        {driverName && (
          <div style={{
            background: '#f3f4f6',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
          }}>
            <div style={{
              fontSize: 'clamp(0.75rem, 1vw, 0.875rem)',
              color: '#6b7280',
              marginBottom: '4px',
              fontWeight: '500',
            }}>
              Driver
            </div>
            <div style={{
              fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
              color: '#1f2937',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span>👤</span>
              {driverName}
            </div>
            {driverPhone && (
              <div style={{
                fontSize: 'clamp(0.75rem, 1vw, 0.875rem)',
                color: '#6b7280',
                marginTop: '2px',
              }}>
                {driverPhone}
              </div>
            )}
          </div>
        )}

        {job.pallets && job.pallets > 0 && (
          <div style={{
            background: '#f3f4f6',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
          }}>
            <div style={{
              fontSize: 'clamp(0.75rem, 1vw, 0.875rem)',
              color: '#6b7280',
              marginBottom: '4px',
              fontWeight: '500',
            }}>
              Pallets
            </div>
            <div style={{
              fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
              color: '#1f2937',
              fontWeight: '700',
            }}>
              {job.pallets}
            </div>
          </div>
        )}

        {job.weight_kg && job.weight_kg > 0 && (
          <div style={{
            background: '#f3f4f6',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
          }}>
            <div style={{
              fontSize: 'clamp(0.75rem, 1vw, 0.875rem)',
              color: '#6b7280',
              marginBottom: '4px',
              fontWeight: '500',
            }}>
              Weight
            </div>
            <div style={{
              fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
              color: '#1f2937',
              fontWeight: '700',
            }}>
              {job.weight_kg} kg
            </div>
          </div>
        )}
      </div>

      {/* Current Status Badge - Prominent */}
      <div style={{
        background: getStatusColor(currentStatus),
        color: '#ffffff',
        padding: 'clamp(16px, 2.5vw, 20px)',
        borderRadius: '8px',
        textAlign: 'center',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{
          fontSize: 'clamp(0.75rem, 1vw, 0.875rem)',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '4px',
          opacity: 0.9,
        }}>
          Current Status
        </div>
        <div style={{
          fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
          fontWeight: '800',
        }}>
          {formatStatus(currentStatus)}
        </div>
      </div>

      {/* Load Details */}
      {job.load_details && (
        <div>
          <h3 style={{
            fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Load Details
          </h3>
          <div style={{
            background: '#f9fafb',
            padding: 'clamp(12px, 2vw, 16px)',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            fontSize: 'clamp(0.875rem, 1.1vw, 1rem)',
            color: '#4b5563',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.6',
          }}>
            {job.load_details}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to get status color
function getStatusColor(status: string): string {
  const normalizedStatus = status?.toUpperCase() || 'ALLOCATED'
  
  const colors: Record<string, string> = {
    ALLOCATED: '#3b82f6', // Blue
    ON_MY_WAY_TO_PICKUP: '#8b5cf6', // Purple
    ON_SITE_PICKUP: '#f59e0b', // Amber
    PICKED_UP: '#10b981', // Green
    ON_MY_WAY_TO_DELIVERY: '#06b6d4', // Cyan
    ON_SITE_DELIVERY: '#f59e0b', // Amber
    DELIVERED: '#22c55e', // Bright Green
    CANCELLED: '#ef4444', // Red
    OPEN: '#3b82f6', // Blue (legacy)
    ASSIGNED: '#8b5cf6', // Purple (legacy)
    COMPLETED: '#22c55e', // Green (legacy)
  }
  
  return colors[normalizedStatus] || '#6b7280' // Gray fallback
}

// Helper function to format status for display
function formatStatus(status: string): string {
  const normalizedStatus = status?.toUpperCase() || 'ALLOCATED'
  
  const labels: Record<string, string> = {
    ALLOCATED: 'Allocated',
    ON_MY_WAY_TO_PICKUP: 'On My Way to Pickup',
    ON_SITE_PICKUP: 'At Pickup Location',
    PICKED_UP: 'Picked Up',
    ON_MY_WAY_TO_DELIVERY: 'On My Way to Delivery',
    ON_SITE_DELIVERY: 'At Delivery Location',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    OPEN: 'Open',
    ASSIGNED: 'Assigned',
    COMPLETED: 'Completed',
  }
  
  return labels[normalizedStatus] || normalizedStatus.replace(/_/g, ' ')
}

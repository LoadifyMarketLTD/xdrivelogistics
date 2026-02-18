'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import DriverJobCard from '@/components/jobs/DriverJobCard'
import StatusTimeline from '@/components/jobs/StatusTimeline'
import StatusActions from '@/components/jobs/StatusActions'
import EvidenceUpload from '@/components/jobs/EvidenceUpload'
import SignatureCapture from '@/components/jobs/SignatureCapture'
import EPODViewer from '@/components/jobs/EPODViewer'
import ResponsiveContainer from '@/components/layout/ResponsiveContainer'

interface Job {
  id: string
  pickup_location: string
  delivery_location: string
  pickup_datetime: string
  delivery_datetime: string
  current_status: string
  vehicle_type: string
  vehicle_reg?: string
  pallets?: number
  weight?: number
  budget?: number
  load_details?: string
  driver_id?: string
  posted_by_company_id: string
  has_pickup_evidence: boolean
  has_delivery_evidence: boolean
  pod_generated: boolean
}

interface Company {
  id: string
  name: string
  phone?: string
  email?: string
}

interface Driver {
  id: string
  full_name: string
  phone?: string
}

interface StatusEvent {
  id: string
  status: string
  timestamp: string
  changed_by?: string
  notes?: string
  location?: { lat: number; lng: number }
}

/**
 * Job Detail Page - Complete Integration Example
 * 
 * This page demonstrates all implemented components working together:
 * 1. DriverJobCard - with "Acting on behalf of" feature
 * 2. StatusTimeline - visual progress tracking
 * 3. StatusActions - big CTA buttons for status updates
 * 4. EvidenceUpload - drag & drop file upload
 * 5. SignatureCapture - canvas-based signature
 * 6. EPODViewer - complete ePOD display
 */
export default function JobDetailPage() {
  const params = useParams()
  const jobId = params?.jobId as string
  const supabase = createClientComponentClient()
  
  const [job, setJob] = useState<Job | null>(null)
  const [postingCompany, setPostingCompany] = useState<Company | null>(null)
  const [driver, setDriver] = useState<Driver | null>(null)
  const [statusEvents, setStatusEvents] = useState<StatusEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJobData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch job details
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single()

      if (jobError) throw jobError
      setJob(jobData)

      // Fetch posting company
      if (jobData.posted_by_company_id) {
        const { data: companyData } = await supabase
          .from('companies')
          .select('*')
          .eq('id', jobData.posted_by_company_id)
          .single()
        
        if (companyData) setPostingCompany(companyData)
      }

      // Fetch driver if assigned
      if (jobData.driver_id) {
        const { data: driverData } = await supabase
          .from('drivers')
          .select('*')
          .eq('id', jobData.driver_id)
          .single()
        
        if (driverData) setDriver(driverData)
      }

      // Fetch status events
      const { data: eventsData } = await supabase
        .from('job_status_events')
        .select('*')
        .eq('job_id', jobId)
        .order('timestamp', { ascending: true })

      if (eventsData) setStatusEvents(eventsData)

    } catch (err: any) {
      console.error('Error fetching job data:', err)
      setError(err.message || 'Failed to load job data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (jobId) {
      fetchJobData()
    }
  }, [jobId])

  const handleStatusUpdate = async (newStatus: string, notes?: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update status')
      }

      // Refresh job data
      await fetchJobData()
    } catch (err: any) {
      console.error('Error updating status:', err)
      alert(err.message || 'Failed to update status')
      throw err
    }
  }

  const handleEvidenceUpload = async () => {
    // Refresh job data after evidence upload
    await fetchJobData()
  }

  if (loading) {
    return (
      <ResponsiveContainer maxWidth="xl">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
          color: '#666',
        }}>
          Loading job details...
        </div>
      </ResponsiveContainer>
    )
  }

  if (error || !job) {
    return (
      <ResponsiveContainer maxWidth="xl">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          gap: '16px',
        }}>
          <div style={{
            fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
            fontWeight: 'bold',
            color: '#ef4444',
          }}>
            {error || 'Job not found'}
          </div>
          <a
            href="/jobs"
            style={{
              padding: '12px 24px',
              background: '#3b82f6',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
            }}
          >
            Back to Jobs
          </a>
        </div>
      </ResponsiveContainer>
    )
  }

  const canUploadPickupEvidence = 
    job.current_status === 'ON_SITE_PICKUP' || 
    job.current_status === 'PICKED_UP'

  const canUploadDeliveryEvidence = 
    job.current_status === 'ON_SITE_DELIVERY' || 
    job.current_status === 'DELIVERED'

  const canCaptureSignature = job.current_status === 'ON_SITE_DELIVERY'

  const showEPOD = job.current_status === 'DELIVERED' && 
    (job.has_pickup_evidence || job.has_delivery_evidence)

  return (
    <ResponsiveContainer maxWidth="xl">
      <div style={{
        padding: 'clamp(16px, 3vw, 32px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(24px, 4vw, 48px)',
      }}>
        {/* Page Header */}
        <div>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            fontWeight: 'bold',
            marginBottom: '8px',
            color: '#111',
          }}>
            Job Details
          </h1>
          <p style={{
            fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
            color: '#666',
          }}>
            Complete job information and workflow management
          </p>
        </div>

        {/* Driver Job Card - CRITICAL "Acting on behalf of" feature */}
        <section>
          <h2 style={{
            fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
            fontWeight: 'bold',
            marginBottom: 'clamp(16px, 2.5vw, 24px)',
            color: '#111',
          }}>
            Job Card
          </h2>
          <DriverJobCard
            job={job}
            postingCompany={postingCompany!}
            driverName={driver?.full_name}
            driverPhone={driver?.phone}
            vehicleReg={job.vehicle_reg}
          />
        </section>

        {/* Status Timeline */}
        <section>
          <h2 style={{
            fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
            fontWeight: 'bold',
            marginBottom: 'clamp(16px, 2.5vw, 24px)',
            color: '#111',
          }}>
            Status Timeline
          </h2>
          <StatusTimeline
            events={statusEvents}
            currentStatus={job.current_status}
          />
        </section>

        {/* Status Actions */}
        {job.current_status !== 'DELIVERED' && job.current_status !== 'CANCELLED' && (
          <section>
            <h2 style={{
              fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
              fontWeight: 'bold',
              marginBottom: 'clamp(16px, 2.5vw, 24px)',
              color: '#111',
            }}>
              Update Status
            </h2>
            <StatusActions
              jobId={jobId}
              currentStatus={job.current_status}
              onStatusUpdate={handleStatusUpdate}
            />
          </section>
        )}

        {/* Evidence Upload at Pickup */}
        {canUploadPickupEvidence && (
          <section>
            <h2 style={{
              fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
              fontWeight: 'bold',
              marginBottom: 'clamp(16px, 2.5vw, 24px)',
              color: '#111',
            }}>
              Upload Pickup Evidence
            </h2>
            <EvidenceUpload
              jobId={jobId}
              phase="pickup"
              onUploadComplete={handleEvidenceUpload}
            />
          </section>
        )}

        {/* Evidence Upload at Delivery */}
        {canUploadDeliveryEvidence && (
          <section>
            <h2 style={{
              fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
              fontWeight: 'bold',
              marginBottom: 'clamp(16px, 2.5vw, 24px)',
              color: '#111',
            }}>
              Upload Delivery Evidence
            </h2>
            <EvidenceUpload
              jobId={jobId}
              phase="delivery"
              onUploadComplete={handleEvidenceUpload}
            />
          </section>
        )}

        {/* Signature Capture */}
        {canCaptureSignature && (
          <section>
            <h2 style={{
              fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
              fontWeight: 'bold',
              marginBottom: 'clamp(16px, 2.5vw, 24px)',
              color: '#111',
            }}>
              Capture Signature
            </h2>
            <SignatureCapture
              jobId={jobId}
              phase="delivery"
              onSignatureCapture={handleEvidenceUpload}
            />
          </section>
        )}

        {/* ePOD Viewer */}
        {showEPOD && (
          <section>
            <h2 style={{
              fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
              fontWeight: 'bold',
              marginBottom: 'clamp(16px, 2.5vw, 24px)',
              color: '#111',
            }}>
              Electronic Proof of Delivery (ePOD)
            </h2>
            <EPODViewer jobId={jobId} />
          </section>
        )}

        {/* Back Button */}
        <div style={{ marginTop: 'clamp(24px, 4vw, 48px)' }}>
          <a
            href="/jobs"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#6b7280',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
              fontWeight: '500',
            }}
          >
            ← Back to Jobs
          </a>
        </div>
      </div>
    </ResponsiveContainer>
  )
}

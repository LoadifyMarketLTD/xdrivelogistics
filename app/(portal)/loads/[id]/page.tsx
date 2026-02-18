'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { JobWithTracking, TrackingEvent, ProofOfDelivery, JobDocument, JobNote } from '@/lib/types'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

export default function LoadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string
  
  const [job, setJob] = useState<JobWithTracking | null>(null)
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([])
  const [pod, setPod] = useState<ProofOfDelivery | null>(null)
  const [documents, setDocuments] = useState<JobDocument[]>([])
  const [notes, setNotes] = useState<JobNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!jobId) return
    fetchJobDetails()
  }, [jobId])

  const fetchJobDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch job with company details
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select(`
          *,
          posted_by_company:companies!posted_by_company_id(name, phone),
          assigned_company:companies!assigned_company_id(name, phone)
        `)
        .eq('id', jobId)
        .single()

      if (jobError) throw jobError
      if (!jobData) throw new Error('Job not found')

      // Fetch tracking events
      const { data: eventsData, error: eventsError } = await supabase
        .from('job_tracking_events')
        .select('*')
        .eq('job_id', jobId)
        .order('event_time', { ascending: true })

      if (eventsError) throw eventsError

      // Fetch POD
      const { data: podData, error: podError } = await supabase
        .from('proof_of_delivery')
        .select('*')
        .eq('job_id', jobId)
        .single()

      // POD might not exist yet, that's OK
      if (podError && podError.code !== 'PGRST116') throw podError

      // Fetch documents
      const { data: docsData, error: docsError} = await supabase
        .from('job_documents')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })

      if (docsError) throw docsError

      // Fetch notes
      const { data: notesData, error: notesError } = await supabase
        .from('job_notes')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })

      if (notesError) throw notesError

      setJob({
        ...jobData,
        posted_by_company_name: jobData.posted_by_company?.name || null,
        posted_by_company_phone: jobData.posted_by_company?.phone || null,
        assigned_company_name: jobData.assigned_company?.name || null,
        assigned_company_phone: jobData.assigned_company?.phone || null,
        tracking_event_count: eventsData?.length || 0,
        document_count: docsData?.length || 0,
        note_count: notesData?.length || 0
      })
      setTrackingEvents(eventsData || [])
      setPod(podData)
      setDocuments(docsData || [])
      setNotes(notesData || [])

    } catch (err: any) {
      console.error('Error fetching job details:', err)
      setError(err.message || 'Failed to load job details')
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      'open': { label: 'Live', color: '#10b981' },
      'assigned': { label: 'Assigned', color: '#3b82f6' },
      'in-transit': { label: 'In Transit', color: '#f59e0b' },
      'completed': { label: 'Delivered', color: '#6366f1' },
      'cancelled': { label: 'Cancelled', color: '#ef4444' }
    }
    
    const badge = badges[status] || { label: status, color: '#6b7280' }
    
    return (
      <span style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '4px',
        fontSize: '13px',
        fontWeight: '600',
        backgroundColor: badge.color,
        color: '#ffffff'
      }}>
        {badge.label}
      </span>
    )
  }

  const getEventIcon = (eventType: string) => {
    const icons: Record<string, string> = {
      'on_my_way_to_pickup': '🚗',
      'on_site_pickup': '📍',
      'loaded': '📦',
      'on_my_way_to_delivery': '🚛',
      'on_site_delivery': '📍',
      'delivered': '✅'
    }
    return icons[eventType] || '•'
  }

  const getEventLabel = (eventType: string) => {
    const labels: Record<string, string> = {
      'on_my_way_to_pickup': 'On my Way to Pickup',
      'on_site_pickup': 'On Site (Pickup) At',
      'loaded': 'Loaded At',
      'on_my_way_to_delivery': 'On my Way to Delivery',
      'on_site_delivery': 'On Site (Delivery) At',
      'delivered': 'Delivered On'
    }
    return labels[eventType] || eventType
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-text">Loading job details...</div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#dc2626', margin: '0 0 8px 0' }}>Error</h3>
          <p style={{ color: '#991b1b', margin: 0 }}>{error || 'Job not found'}</p>
        </div>
        <button
          onClick={() => router.push('/loads')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Back to Loads
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header with Status */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1f2937',
          margin: 0
        }}>
          Load ID: {job.load_id || job.id.slice(0, 8)}
        </h1>
        {getStatusBadge(job.status)}
      </div>

      {/* Main Job Card - CX Style */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '20px'
      }}>
        {/* From/To Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: '20px',
          marginBottom: '20px',
          paddingBottom: '20px',
          borderBottom: '2px solid #e5e7eb'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>From:</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
              {job.booked_by_company_name || 'N/A'}
            </div>
            <div style={{ fontSize: '14px', color: '#4b5563', marginTop: '4px' }}>
              {job.pickup_address_line1 || job.pickup_location}
            </div>
            {job.pickup_city && <div style={{ fontSize: '14px', color: '#4b5563' }}>{job.pickup_city}</div>}
            {job.pickup_postcode && (
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                {job.pickup_postcode}
              </div>
            )}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '24px' }}>→</span>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>To:</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
              {job.assigned_company_name || 'N/A'}
            </div>
            <div style={{ fontSize: '14px', color: '#4b5563', marginTop: '4px' }}>
              {job.delivery_address_line1 || job.delivery_location}
            </div>
            {job.delivery_city && <div style={{ fontSize: '14px', color: '#4b5563' }}>{job.delivery_city}</div>}
            {job.delivery_postcode && (
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                {job.delivery_postcode}
              </div>
            )}
          </div>
        </div>

        {/* Pickup/Delivery Times */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '20px',
          paddingBottom: '20px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Pickup:</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
              {formatDateTime(job.pickup_datetime)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Deliver:</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
              {job.delivery_datetime ? formatDateTime(job.delivery_datetime) : 'ASAP'}
            </div>
          </div>
        </div>

        {/* Status and Completion */}
        {job.status === 'completed' && job.completed_by_name && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ color: '#15803d', fontWeight: '600', fontSize: '14px' }}>
              {job.status === 'completed' ? 'Delivered' : 'Completed'}
            </div>
            <div style={{ color: '#16a34a', fontSize: '13px', marginTop: '4px' }}>
              Completed by {job.completed_by_name}
            </div>
            {job.completed_at && (
              <div style={{ color: '#16a34a', fontSize: '12px', marginTop: '2px' }}>
                {formatTime(job.completed_at)} (GMT) {formatDate(job.completed_at)}
              </div>
            )}
          </div>
        )}

        {/* Job Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Vehicle Type:</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginTop: '4px' }}>
              {job.vehicle_type || 'N/A'}
            </div>
          </div>

          {job.booked_by_company_name && (
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Booked by:</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginTop: '4px' }}>
                {job.booked_by_company_name}
              </div>
              {job.booked_by_company_ref && (
                <div style={{ fontSize: '12px', color: '#6b7280' }}>({job.booked_by_company_ref})</div>
              )}
            </div>
          )}

          {job.booked_by_phone && (
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Phone:</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#3b82f6', marginTop: '4px' }}>
                {job.booked_by_phone}
              </div>
            </div>
          )}

          {job.agreed_rate && (
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Agreed Rate (£):</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginTop: '4px' }}>
                £{job.agreed_rate.toFixed(2)}
              </div>
            </div>
          )}

          {job.distance_miles && (
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Dist:</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginTop: '4px' }}>
                {job.distance_miles} miles
              </div>
            </div>
          )}

          <div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Weight:</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginTop: '4px' }}>
              {job.weight_kg ? `${job.weight_kg} kg` : 'Not Supplied'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Packaging:</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginTop: '4px' }}>
              {job.packaging || 'Not Supplied'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Dims:</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginTop: '4px' }}>
              {job.dimensions || 'Not Supplied'}
            </div>
          </div>

          {job.requested_vehicle_type && (
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Requested:</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginTop: '4px' }}>
                {job.requested_vehicle_type}
              </div>
            </div>
          )}

          {job.vehicle_ref && (
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Vehicle Ref:</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginTop: '4px' }}>
                {job.vehicle_ref}
              </div>
            </div>
          )}

          {job.payment_terms && (
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Payment Terms:</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginTop: '4px' }}>
                {job.payment_terms}
              </div>
            </div>
          )}
        </div>

        {/* SmartPay Badge */}
        {job.smartpay_enabled && (
          <div style={{
            display: 'inline-block',
            backgroundColor: '#dbeafe',
            color: '#1e40af',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '16px'
          }}>
            SmartPay Enabled
          </div>
        )}

        {/* Load Notes */}
        {job.load_notes && (
          <div style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '12px',
            marginTop: '16px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
              Load Notes:
            </div>
            <div style={{ fontSize: '14px', color: '#1f2937', lineHeight: '1.5' }}>
              {job.load_notes}
            </div>
          </div>
        )}

        {/* References */}
        {(job.your_ref || job.cust_ref || job.items) && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb'
          }}>
            {job.your_ref && (
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Your Ref:</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginTop: '2px' }}>
                  {job.your_ref}
                </div>
              </div>
            )}
            {job.cust_ref && (
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Cust Ref:</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginTop: '2px' }}>
                  {job.cust_ref}
                </div>
              </div>
            )}
            {job.items && (
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Items:</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginTop: '2px' }}>
                  {job.items}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tracking Timeline */}
      {trackingEvents.length > 0 && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '20px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Tracking Timeline
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {trackingEvents.map((event) => (
              <div
                key={event.id}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px'
                }}
              >
                <div style={{ fontSize: '20px' }}>{getEventIcon(event.event_type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                    {getEventLabel(event.event_type)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    {formatTime(event.event_time)} (GMT) {formatDate(event.event_time)}
                  </div>
                  {event.user_name && (
                    <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '2px' }}>
                      by {event.user_name}
                    </div>
                  )}
                  {event.notes && (
                    <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px', fontStyle: 'italic' }}>
                      {event.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proof of Delivery */}
      {pod && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '20px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Proof of Delivery
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Delivered On:</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginTop: '4px' }}>
                {formatTime(pod.delivered_on)} (GMT) {formatDate(pod.delivered_on)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Received By:</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginTop: '4px' }}>
                {pod.received_by}
              </div>
            </div>
            {pod.left_at && (
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Left At:</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginTop: '4px' }}>
                  {pod.left_at}
                </div>
              </div>
            )}
            {pod.no_of_items && (
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>No of Items:</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginTop: '4px' }}>
                  {pod.no_of_items}
                </div>
              </div>
            )}
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Delivery Status:</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#10b981', marginTop: '4px' }}>
                {pod.delivery_status}
              </div>
            </div>
          </div>
          {pod.delivery_notes && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#f0fdf4',
              borderRadius: '6px',
              border: '1px solid #86efac'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#15803d', marginBottom: '6px' }}>
                Delivery Notes:
              </div>
              <div style={{ fontSize: '14px', color: '#16a34a', lineHeight: '1.5' }}>
                {pod.delivery_notes}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        marginBottom: '20px'
      }}>
        <button
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Leave Feedback
        </button>
        <button
          style={{
            padding: '10px 20px',
            backgroundColor: '#10b981',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          POD
        </button>
        <button
          style={{
            padding: '10px 20px',
            backgroundColor: '#6366f1',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Order Notes
        </button>
        <button
          style={{
            padding: '10px 20px',
            backgroundColor: '#8b5cf6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          History
        </button>
        <button
          style={{
            padding: '10px 20px',
            backgroundColor: '#f59e0b',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Documents
        </button>
        <button
          style={{
            padding: '10px 20px',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          View invoice (£)
        </button>
        <button
          onClick={() => router.push('/loads')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6b7280',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Back to Loads
        </button>
      </div>

      {/* Documents Section */}
      {documents.length > 0 && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '20px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Documents ({documents.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {documents.map((doc) => (
              <div
                key={doc.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px'
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                    {doc.document_name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    Type: {doc.document_type} • {formatDate(doc.created_at)}
                  </div>
                </div>
                <button
                  onClick={() => window.open(doc.document_url, '_blank')}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes/History Section */}
      {notes.length > 0 && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '24px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Order Notes & History ({notes.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notes.map((note) => (
              <div
                key={note.id}
                style={{
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                  borderLeft: '3px solid #3b82f6'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '8px'
                }}>
                  <div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#3b82f6',
                      padding: '2px 8px',
                      backgroundColor: '#dbeafe',
                      borderRadius: '4px'
                    }}>
                      {note.note_type}
                    </span>
                    {note.is_internal && (
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#dc2626',
                        padding: '2px 8px',
                        backgroundColor: '#fee2e2',
                        borderRadius: '4px',
                        marginLeft: '8px'
                      }}>
                        Internal
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {formatDateTime(note.created_at)}
                  </div>
                </div>
                <div style={{ fontSize: '14px', color: '#1f2937', marginBottom: '4px' }}>
                  {note.note_text}
                </div>
                {note.created_by_name && (
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    by {note.created_by_name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

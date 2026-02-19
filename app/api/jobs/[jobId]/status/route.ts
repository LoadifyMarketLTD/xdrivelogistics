import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Define valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  'ALLOCATED': ['ON_MY_WAY_TO_PICKUP', 'CANCELLED'],
  'ON_MY_WAY_TO_PICKUP': ['ON_SITE_PICKUP', 'CANCELLED'],
  'ON_SITE_PICKUP': ['PICKED_UP', 'CANCELLED'],
  'PICKED_UP': ['ON_MY_WAY_TO_DELIVERY', 'CANCELLED'],
  'ON_MY_WAY_TO_DELIVERY': ['ON_SITE_DELIVERY', 'CANCELLED'],
  'ON_SITE_DELIVERY': ['DELIVERED', 'CANCELLED'],
  'DELIVERED': [], // Terminal state
  'CANCELLED': [], // Terminal state
}

interface StatusUpdateRequest {
  status: string
  notes?: string
  location?: {
    lat: number
    lng: number
  }
}

/**
 * POST /api/jobs/[jobId]/status
 * Updates job status with validation and event logging
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const supabase = await createClient()
    const { jobId } = await params

    // Get current user
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Parse request body
    const body: StatusUpdateRequest = await request.json()
    const { status: newStatus, notes, location } = body

    if (!newStatus) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Get current job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, current_status, driver_id, posted_by_company_id')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Check if user is the assigned driver or has admin access
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, company_id')
      .eq('id', userId)
      .single()

    const isDriver = job.driver_id === userId
    const isAdmin = profile?.role === 'admin'
    const isCompanyAdmin = profile?.company_id === job.posted_by_company_id && profile?.role === 'company_admin'

    if (!isDriver && !isAdmin && !isCompanyAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to update this job status' },
        { status: 403 }
      )
    }

    // Validate status transition
    const currentStatus = job.current_status || 'ALLOCATED'
    const validNextStatuses = VALID_TRANSITIONS[currentStatus] || []

    if (!validNextStatuses.includes(newStatus)) {
      return NextResponse.json(
        {
          error: `Invalid status transition from ${currentStatus} to ${newStatus}`,
          validStatuses: validNextStatuses,
        },
        { status: 400 }
      )
    }

    // Update job status
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        current_status: newStatus,
        status_updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)

    if (updateError) {
      console.error('Error updating job status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update job status' },
        { status: 500 }
      )
    }

    // Log status event
    const { error: eventError } = await supabase
      .from('job_status_events')
      .insert({
        job_id: jobId,
        status: newStatus,
        changed_by: userId,
        changed_at: new Date().toISOString(),
        notes: notes || null,
        location: location || null,
        actor_type: isDriver ? 'driver' : (isAdmin ? 'admin' : 'company_admin'),
      })

    if (eventError) {
      console.error('Error logging status event:', eventError)
      // Don't fail the request if event logging fails
    }

    // Get updated job with events
    const { data: updatedJob, error: fetchError } = await supabase
      .from('jobs')
      .select(`
        *,
        status_events:job_status_events(
          id,
          status,
          changed_at,
          changed_by,
          notes,
          location,
          actor_type
        )
      `)
      .eq('id', jobId)
      .single()

    if (fetchError) {
      console.error('Error fetching updated job:', fetchError)
    }

    return NextResponse.json({
      success: true,
      job: updatedJob || job,
      message: `Status updated to ${newStatus}`,
    })
  } catch (error) {
    console.error('Error in status update:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/jobs/[jobId]/status
 * Get status history for a job
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const supabase = await createClient()
    const { jobId } = await params

    // Get current user
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get job to check access
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, driver_id, posted_by_company_id')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Check if user has access
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, company_id')
      .eq('id', userId)
      .single()

    const isDriver = job.driver_id === userId
    const isAdmin = profile?.role === 'admin'
    const isCompanyUser = profile?.company_id === job.posted_by_company_id

    if (!isDriver && !isAdmin && !isCompanyUser) {
      return NextResponse.json(
        { error: 'You do not have permission to view this job status' },
        { status: 403 }
      )
    }

    // Get status events
    const { data: events, error: eventsError } = await supabase
      .from('job_status_events')
      .select(`
        id,
        status,
        changed_at,
        changed_by,
        notes,
        location,
        actor_type,
        actor:profiles!job_status_events_changed_by_fkey(
          id,
          full_name,
          email
        )
      `)
      .eq('job_id', jobId)
      .order('changed_at', { ascending: true })

    if (eventsError) {
      console.error('Error fetching status events:', eventsError)
      return NextResponse.json(
        { error: 'Failed to fetch status events' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      jobId,
      events: events || [],
    })
  } catch (error) {
    console.error('Error in status fetch:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

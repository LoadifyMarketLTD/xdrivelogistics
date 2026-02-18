import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

interface EvidenceUploadRequest {
  file_url: string
  file_name: string
  file_size: number
  mime_type: string
  evidence_type: 'photo' | 'signature' | 'document' | 'note'
  phase: 'pickup' | 'delivery' | 'in_transit'
  notes?: string
  receiver_name?: string
  receiver_signature_url?: string
}

/**
 * POST /api/jobs/[jobId]/evidence
 * Upload evidence for a job (photos, signatures, documents)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { jobId } = params

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
    const body: EvidenceUploadRequest = await request.json()
    const {
      file_url,
      file_name,
      file_size,
      mime_type,
      evidence_type,
      phase,
      notes,
      receiver_name,
      receiver_signature_url,
    } = body

    // Validate required fields
    if (!file_url || !file_name || !evidence_type || !phase) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get job to check access and status
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, driver_id, current_status, posted_by_company_id')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Check if user is the assigned driver
    const isDriver = job.driver_id === userId
    
    // Get user profile for additional checks
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, company_id')
      .eq('id', userId)
      .single()

    const isAdmin = profile?.role === 'admin'
    const isCompanyAdmin = profile?.company_id === job.posted_by_company_id && profile?.role === 'company_admin'

    if (!isDriver && !isAdmin && !isCompanyAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to upload evidence for this job' },
        { status: 403 }
      )
    }

    // Validate phase based on job status
    const currentStatus = job.current_status || 'ALLOCATED'
    
    if (phase === 'pickup') {
      const validPickupStatuses = ['ON_SITE_PICKUP', 'PICKED_UP', 'ON_MY_WAY_TO_DELIVERY', 'ON_SITE_DELIVERY', 'DELIVERED']
      if (!validPickupStatuses.includes(currentStatus)) {
        return NextResponse.json(
          { error: 'Cannot upload pickup evidence before arriving at pickup location' },
          { status: 400 }
        )
      }
    }

    if (phase === 'delivery') {
      const validDeliveryStatuses = ['ON_SITE_DELIVERY', 'DELIVERED']
      if (!validDeliveryStatuses.includes(currentStatus)) {
        return NextResponse.json(
          { error: 'Cannot upload delivery evidence before arriving at delivery location' },
          { status: 400 }
        )
      }
    }

    // Insert evidence record
    const { data: evidence, error: evidenceError } = await supabase
      .from('job_evidence')
      .insert({
        job_id: jobId,
        uploaded_by: userId,
        file_url,
        file_name,
        file_size,
        mime_type,
        evidence_type,
        phase,
        notes: notes || null,
        receiver_name: receiver_name || null,
        receiver_signature_url: receiver_signature_url || null,
        uploaded_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (evidenceError) {
      console.error('Error saving evidence:', evidenceError)
      return NextResponse.json(
        { error: 'Failed to save evidence' },
        { status: 500 }
      )
    }

    // Update job evidence flags (triggers will handle this, but we can do it explicitly too)
    const updateData: any = {}
    if (phase === 'pickup') {
      updateData.has_pickup_evidence = true
    } else if (phase === 'delivery') {
      updateData.has_delivery_evidence = true
    }

    if (Object.keys(updateData).length > 0) {
      await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', jobId)
    }

    return NextResponse.json({
      success: true,
      evidence,
      message: 'Evidence uploaded successfully',
    })
  } catch (error) {
    console.error('Error in evidence upload:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/jobs/[jobId]/evidence
 * Get all evidence for a job
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { jobId } = params

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
        { error: 'You do not have permission to view evidence for this job' },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const phase = searchParams.get('phase') // Filter by phase
    const type = searchParams.get('type')   // Filter by type

    // Build query
    let query = supabase
      .from('job_evidence')
      .select(`
        *,
        uploader:profiles!job_evidence_uploaded_by_fkey(
          id,
          full_name,
          email
        )
      `)
      .eq('job_id', jobId)
      .is('deleted_at', null) // Only active evidence
      .order('uploaded_at', { ascending: false })

    if (phase) {
      query = query.eq('phase', phase)
    }

    if (type) {
      query = query.eq('evidence_type', type)
    }

    const { data: evidence, error: evidenceError } = await query

    if (evidenceError) {
      console.error('Error fetching evidence:', evidenceError)
      return NextResponse.json(
        { error: 'Failed to fetch evidence' },
        { status: 500 }
      )
    }

    // Group by phase for easier consumption
    const grouped = {
      pickup: evidence?.filter(e => e.phase === 'pickup') || [],
      delivery: evidence?.filter(e => e.phase === 'delivery') || [],
      in_transit: evidence?.filter(e => e.phase === 'in_transit') || [],
    }

    return NextResponse.json({
      jobId,
      evidence: evidence || [],
      grouped,
      total: evidence?.length || 0,
    })
  } catch (error) {
    console.error('Error in evidence fetch:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/jobs/[jobId]/evidence
 * Soft delete evidence (marks as deleted, doesn't remove from storage)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { jobId } = params

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

    // Get evidence ID from query params
    const { searchParams } = new URL(request.url)
    const evidenceId = searchParams.get('id')

    if (!evidenceId) {
      return NextResponse.json(
        { error: 'Evidence ID is required' },
        { status: 400 }
      )
    }

    // Get evidence to check ownership
    const { data: evidence, error: evidenceError } = await supabase
      .from('job_evidence')
      .select('*, job:jobs!inner(driver_id, posted_by_company_id)')
      .eq('id', evidenceId)
      .eq('job_id', jobId)
      .single()

    if (evidenceError || !evidence) {
      return NextResponse.json(
        { error: 'Evidence not found' },
        { status: 404 }
      )
    }

    // Check if user can delete (uploader, driver, or admin)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, company_id')
      .eq('id', userId)
      .single()

    const isUploader = evidence.uploaded_by === userId
    const isDriver = evidence.job.driver_id === userId
    const isAdmin = profile?.role === 'admin'

    if (!isUploader && !isDriver && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this evidence' },
        { status: 403 }
      )
    }

    // Soft delete
    const { error: deleteError } = await supabase
      .from('job_evidence')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: userId,
      })
      .eq('id', evidenceId)

    if (deleteError) {
      console.error('Error deleting evidence:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete evidence' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Evidence deleted successfully',
    })
  } catch (error) {
    console.error('Error in evidence delete:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

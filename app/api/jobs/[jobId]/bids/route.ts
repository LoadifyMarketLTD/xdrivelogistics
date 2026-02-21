import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/jobs/[jobId]/bids
 * Returns all bids for a job (only accessible by the job poster's company members)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const supabase = await createClient()
    const { jobId } = await params

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Verify the job exists and get the poster's company
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, posted_by_company_id, status')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Only the job poster's company members can view bids
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, company_id')
      .eq('user_id', userId)
      .single()

    const isJobPoster = profile?.company_id === job.posted_by_company_id
    const isAdmin = profile?.role === 'admin'

    if (!isJobPoster && !isAdmin) {
      return NextResponse.json(
        { error: 'Only the job poster can view bids' },
        { status: 403 }
      )
    }

    // Fetch all bids for this job
    const { data: bids, error: bidsError } = await supabase
      .from('job_bids')
      .select('id, created_at, bidder_id, amount_gbp, message, status')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true })

    if (bidsError) {
      console.error('Error fetching bids:', bidsError)
      return NextResponse.json({ error: 'Failed to fetch bids' }, { status: 500 })
    }

    return NextResponse.json({ bids: bids || [] })
  } catch (error) {
    console.error('Error in GET /api/jobs/[jobId]/bids:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/jobs/[jobId]/bids
 * Accept or reject a bid. Body: { bidId: string, action: 'accept' | 'reject' }
 *
 * When accepting:
 *   - Sets the accepted bid status to 'accepted'
 *   - Sets all other bids on this job to 'rejected'
 *   - Updates the job: status → 'assigned', accepted_bid_id, assigned_company_id
 *
 * When rejecting:
 *   - Sets the specified bid status to 'rejected'
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const supabase = await createClient()
    const { jobId } = await params

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const body = await request.json()
    const { bidId, action } = body as { bidId: string; action: 'accept' | 'reject' }

    if (!bidId || !action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'bidId and action (accept or reject) are required' },
        { status: 400 }
      )
    }

    // Verify the job exists and get the poster's company
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, posted_by_company_id, status')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Only the job poster's company members can accept/reject bids
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, company_id')
      .eq('user_id', userId)
      .single()

    const isJobPoster = profile?.company_id === job.posted_by_company_id
    const isAdmin = profile?.role === 'admin'

    if (!isJobPoster && !isAdmin) {
      return NextResponse.json(
        { error: 'Only the job poster can accept or reject bids' },
        { status: 403 }
      )
    }

    // Only allow bid management on open jobs
    if (job.status !== 'open') {
      return NextResponse.json(
        { error: `Cannot manage bids on a job with status '${job.status}'` },
        { status: 400 }
      )
    }

    // Verify the bid belongs to this job
    const { data: bid, error: bidError } = await supabase
      .from('job_bids')
      .select('id, bidder_id, amount_gbp, status')
      .eq('id', bidId)
      .eq('job_id', jobId)
      .single()

    if (bidError || !bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 })
    }

    if (bid.status !== 'submitted') {
      return NextResponse.json(
        { error: `Cannot ${action} a bid with status '${bid.status}'` },
        { status: 400 }
      )
    }

    if (action === 'accept') {
      // Look up the bidder's company so we can set assigned_company_id
      const { data: bidderProfile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', bid.bidder_id)
        .single()

      // 1. Mark the accepted bid as 'accepted'
      const { error: acceptError } = await supabase
        .from('job_bids')
        .update({ status: 'accepted' })
        .eq('id', bidId)

      if (acceptError) {
        console.error('Error accepting bid:', acceptError)
        return NextResponse.json({ error: 'Failed to accept bid' }, { status: 500 })
      }

      // 2. Reject all other submitted bids for this job
      const { error: rejectOthersError } = await supabase
        .from('job_bids')
        .update({ status: 'rejected' })
        .eq('job_id', jobId)
        .eq('status', 'submitted')
        .neq('id', bidId)

      if (rejectOthersError) {
        console.error('Error rejecting other bids:', rejectOthersError)
        // Non-fatal: the main accept already succeeded
      }

      // 3. Update the job to 'assigned' with the accepted bid info
      const { error: jobUpdateError } = await supabase
        .from('jobs')
        .update({
          status: 'assigned',
          accepted_bid_id: bidId,
          assigned_company_id: bidderProfile?.company_id ?? null,
        })
        .eq('id', jobId)

      if (jobUpdateError) {
        console.error('Error updating job after bid acceptance:', jobUpdateError)
        return NextResponse.json(
          { error: 'Bid accepted but failed to update job status' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Bid accepted. Job is now assigned.',
      })
    } else {
      // action === 'reject'
      const { error: rejectError } = await supabase
        .from('job_bids')
        .update({ status: 'rejected' })
        .eq('id', bidId)

      if (rejectError) {
        console.error('Error rejecting bid:', rejectError)
        return NextResponse.json({ error: 'Failed to reject bid' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Bid rejected.' })
    }
  } catch (error) {
    console.error('Error in POST /api/jobs/[jobId]/bids:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

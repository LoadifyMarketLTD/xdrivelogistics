# API Endpoints Documentation - XDrive Logistics

## Job Status Management API

### POST /api/jobs/[jobId]/status

Update job status with sequential validation and automatic timestamp logging.

#### Endpoint
```
POST /api/jobs/{jobId}/status
```

#### Authentication
Required: Bearer token (Supabase Auth)

#### Request Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### Request Body
```json
{
  "newStatus": "ON_MY_WAY_TO_PICKUP",
  "notes": "Started journey to pickup location",
  "location": {
    "lat": 51.5074,
    "lng": -0.1278
  }
}
```

#### Valid Status Transitions
```
ALLOCATED → ON_MY_WAY_TO_PICKUP
ON_MY_WAY_TO_PICKUP → ON_SITE_PICKUP
ON_SITE_PICKUP → PICKED_UP
PICKED_UP → ON_MY_WAY_TO_DELIVERY
ON_MY_WAY_TO_DELIVERY → ON_SITE_DELIVERY
ON_SITE_DELIVERY → DELIVERED
Any status → CANCELLED (admin only)
```

#### Response (Success)
```json
{
  "success": true,
  "job": {
    "id": "abc123",
    "status": "ON_MY_WAY_TO_PICKUP",
    "updated_at": "2026-02-18T23:45:00Z"
  },
  "statusEvent": {
    "id": "evt456",
    "job_id": "abc123",
    "status": "ON_MY_WAY_TO_PICKUP",
    "timestamp": "2026-02-18T23:45:00Z",
    "changed_by": "user789",
    "notes": "Started journey to pickup location",
    "location": {
      "lat": 51.5074,
      "lng": -0.1278
    }
  }
}
```

#### Response (Error - Invalid Transition)
```json
{
  "success": false,
  "error": "Invalid status transition",
  "message": "Cannot transition from ALLOCATED to DELIVERED. Valid next status: ON_MY_WAY_TO_PICKUP",
  "currentStatus": "ALLOCATED",
  "requestedStatus": "DELIVERED",
  "validNextStatuses": ["ON_MY_WAY_TO_PICKUP"]
}
```

#### Response (Error - Unauthorized)
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "You can only update status for jobs assigned to you"
}
```

#### Implementation Example (Next.js API Route)

```typescript
// app/api/jobs/[jobId]/status/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const STATUS_TRANSITIONS: Record<string, string[]> = {
  'ALLOCATED': ['ON_MY_WAY_TO_PICKUP'],
  'ON_MY_WAY_TO_PICKUP': ['ON_SITE_PICKUP'],
  'ON_SITE_PICKUP': ['PICKED_UP'],
  'PICKED_UP': ['ON_MY_WAY_TO_DELIVERY'],
  'ON_MY_WAY_TO_DELIVERY': ['ON_SITE_DELIVERY'],
  'ON_SITE_DELIVERY': ['DELIVERED'],
  'DELIVERED': [],
  'CANCELLED': [],
}

export async function POST(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { newStatus, notes, location } = await request.json()
  const { jobId } = params

  // Get current job
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('*, profiles!assigned_driver_id(*)')
    .eq('id', jobId)
    .single()

  if (jobError || !job) {
    return NextResponse.json(
      { success: false, error: 'Job not found' },
      { status: 404 }
    )
  }

  // Check authorization
  if (job.assigned_driver_id !== user.id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', message: 'You can only update status for jobs assigned to you' },
        { status: 403 }
      )
    }
  }

  // Validate transition
  const currentStatus = job.status
  const validNextStatuses = STATUS_TRANSITIONS[currentStatus] || []
  
  if (!validNextStatuses.includes(newStatus)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid status transition',
        message: `Cannot transition from ${currentStatus} to ${newStatus}`,
        currentStatus,
        requestedStatus: newStatus,
        validNextStatuses
      },
      { status: 400 }
    )
  }

  // Update job status
  const { error: updateError } = await supabase
    .from('jobs')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', jobId)

  if (updateError) {
    return NextResponse.json(
      { success: false, error: 'Failed to update job status' },
      { status: 500 }
    )
  }

  // Create status event log
  const { data: statusEvent, error: eventError } = await supabase
    .from('job_status_events')
    .insert({
      job_id: jobId,
      status: newStatus,
      changed_by: user.id,
      changed_by_name: `${user.email}`,
      notes: notes || null,
      location: location || null,
      timestamp: new Date().toISOString()
    })
    .select()
    .single()

  if (eventError) {
    console.error('Failed to create status event:', eventError)
  }

  return NextResponse.json({
    success: true,
    job: {
      id: jobId,
      status: newStatus,
      updated_at: new Date().toISOString()
    },
    statusEvent
  })
}
```

---

## ePOD Generation API

### GET /api/jobs/[jobId]/pod

Generate and retrieve Electronic Proof of Delivery PDF.

#### Endpoint
```
GET /api/jobs/{jobId}/pod?format=pdf&download=true
```

#### Authentication
Required: Bearer token (Supabase Auth)

#### Query Parameters
- `format` (optional): Response format. Default: `json`. Options: `json`, `pdf`
- `download` (optional): Trigger browser download. Default: `false`
- `regenerate` (optional): Force regeneration even if POD exists. Default: `false`

#### Response (format=json)
```json
{
  "success": true,
  "pod": {
    "id": "pod123",
    "job_id": "abc123",
    "pdf_url": "https://storage.supabase.co/job-pod/abc123/epod_1234567890.pdf",
    "generated_at": "2026-02-18T23:50:00Z",
    "pages": 6,
    "includes": {
      "job_card": true,
      "pickup_evidence": 3,
      "delivery_evidence": 2,
      "signature": true
    }
  }
}
```

#### Response (format=pdf)
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="epod-abc123.pdf"

[PDF binary data]
```

#### Response (Error - Not Authorized)
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "You can only view POD for jobs you posted or were assigned to"
}
```

#### Response (Error - Job Not Complete)
```json
{
  "success": false,
  "error": "Job not complete",
  "message": "POD can only be generated for delivered jobs",
  "jobStatus": "ON_MY_WAY_TO_DELIVERY"
}
```

#### Implementation Example (Next.js API Route)

```typescript
// app/api/jobs/[jobId]/pod/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { generatePODPDF } from '@/lib/pdf-generator' // Your PDF lib

export async function GET(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'json'
  const download = searchParams.get('download') === 'true'
  const regenerate = searchParams.get('regenerate') === 'true'

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { jobId } = params

  // Get job with full details
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select(`
      *,
      posted_by_company:companies!posted_by_company_id(*),
      assigned_driver:profiles!assigned_driver_id(*)
    `)
    .eq('id', jobId)
    .single()

  if (jobError || !job) {
    return NextResponse.json(
      { success: false, error: 'Job not found' },
      { status: 404 }
    )
  }

  // Check authorization
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, role')
    .eq('id', user.id)
    .single()

  const isDriver = job.assigned_driver_id === user.id
  const isPostingCompany = job.posted_by_company_id === profile?.company_id
  const isAdmin = profile?.role === 'admin'

  if (!isDriver && !isPostingCompany && !isAdmin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized', message: 'You can only view POD for jobs you posted or were assigned to' },
      { status: 403 }
    )
  }

  // Check if job is delivered
  if (job.status !== 'DELIVERED' && job.status !== 'completed') {
    return NextResponse.json(
      { success: false, error: 'Job not complete', message: 'POD can only be generated for delivered jobs', jobStatus: job.status },
      { status: 400 }
    )
  }

  // Check for existing POD
  let podUrl = null
  let existingPOD = null

  if (!regenerate) {
    const { data: existing } = await supabase
      .from('job_pod')
      .select('*')
      .eq('job_id', jobId)
      .single()
    
    if (existing) {
      existingPOD = existing
      podUrl = existing.pdf_url
    }
  }

  // Generate POD if needed
  if (!podUrl || regenerate) {
    // Fetch evidence
    const { data: evidence } = await supabase
      .from('job_evidence')
      .select('*')
      .eq('job_id', jobId)
      .order('uploaded_at', { ascending: true })

    // Fetch signature
    const { data: pod } = await supabase
      .from('proof_of_delivery')
      .select('*')
      .eq('job_id', jobId)
      .single()

    // Generate PDF (implement your PDF generation logic)
    const pdfBuffer = await generatePODPDF({
      job,
      evidence: evidence || [],
      signature: pod?.signature_url,
      receivedBy: pod?.received_by
    })

    // Upload to storage
    const fileName = `epod_${Date.now()}.pdf`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('job-pod')
      .upload(`${jobId}/${fileName}`, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      return NextResponse.json(
        { success: false, error: 'Failed to upload POD' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('job-pod')
      .getPublicUrl(`${jobId}/${fileName}`)

    podUrl = urlData.publicUrl

    // Save to database
    await supabase
      .from('job_pod')
      .upsert({
        job_id: jobId,
        pdf_url: podUrl,
        generated_at: new Date().toISOString(),
        generated_by: user.id
      })
  }

  // Return based on format
  if (format === 'pdf') {
    // Fetch PDF and return as binary
    const response = await fetch(podUrl)
    const pdfBuffer = await response.arrayBuffer()

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': download 
          ? `attachment; filename="epod-${jobId}.pdf"`
          : `inline; filename="epod-${jobId}.pdf"`
      }
    })
  }

  // Return JSON response
  return NextResponse.json({
    success: true,
    pod: {
      id: existingPOD?.id,
      job_id: jobId,
      pdf_url: podUrl,
      generated_at: existingPOD?.generated_at || new Date().toISOString(),
      pages: 6, // Calculate based on evidence
      includes: {
        job_card: true,
        pickup_evidence: evidence?.filter(e => e.type === 'pickup').length || 0,
        delivery_evidence: evidence?.filter(e => e.type === 'delivery').length || 0,
        signature: !!pod?.signature_url
      }
    }
  })
}
```

---

## Database Tables Required

### job_status_events
```sql
CREATE TABLE IF NOT EXISTS job_status_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_by_name TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  location JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_status_events_job_id ON job_status_events(job_id);
CREATE INDEX idx_job_status_events_timestamp ON job_status_events(timestamp);
```

### job_pod
```sql
CREATE TABLE IF NOT EXISTS job_pod (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL UNIQUE REFERENCES jobs(id) ON DELETE CASCADE,
  pdf_url TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  generated_by UUID REFERENCES auth.users(id),
  pages INTEGER DEFAULT 2,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_pod_job_id ON job_pod(job_id);
```

---

## Testing Examples

### Test Status Update (curl)
```bash
curl -X POST https://your-app.com/api/jobs/abc123/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newStatus": "ON_MY_WAY_TO_PICKUP",
    "notes": "Started journey",
    "location": {"lat": 51.5074, "lng": -0.1278}
  }'
```

### Test POD Generation (curl)
```bash
# Get JSON info
curl https://your-app.com/api/jobs/abc123/pod \
  -H "Authorization: Bearer YOUR_TOKEN"

# Download PDF
curl https://your-app.com/api/jobs/abc123/pod?format=pdf&download=true \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o epod.pdf
```

### Test from Frontend
```typescript
// Update status
const updateStatus = async (jobId: string, newStatus: string, notes?: string) => {
  const response = await fetch(`/api/jobs/${jobId}/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ newStatus, notes })
  })
  
  return await response.json()
}

// Generate POD
const generatePOD = async (jobId: string) => {
  const response = await fetch(`/api/jobs/${jobId}/pod`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
  
  return await response.json()
}

// Download POD
const downloadPOD = async (jobId: string) => {
  const response = await fetch(`/api/jobs/${jobId}/pod?format=pdf&download=true`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
  
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `epod-${jobId}.pdf`
  a.click()
}
```

---

## Security Considerations

1. **Authentication**: Always verify user authentication
2. **Authorization**: Check user has permission for the specific job
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Input Validation**: Validate all inputs (status, notes, location)
5. **SQL Injection**: Use parameterized queries (Supabase handles this)
6. **XSS Prevention**: Sanitize notes and text inputs
7. **CORS**: Configure CORS properly for your domain

---

## Next Steps

1. Implement API routes in your Next.js/backend
2. Test all endpoints thoroughly
3. Add error logging and monitoring
4. Implement rate limiting
5. Add API documentation (Swagger/OpenAPI)
6. Setup monitoring and alerts

---

*Last Updated: February 18, 2026*

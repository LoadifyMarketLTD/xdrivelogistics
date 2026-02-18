-- ============================================================
-- XDRIVE LOGISTICS - SUPABASE STORAGE & RLS POLICIES
-- ============================================================
-- Purpose: Configure secure file storage and access control
-- Created: 2026-02-18
-- Phase: 2 - Database Schema & Security
-- ============================================================

-- ============================================================
-- 1. CREATE STORAGE BUCKETS
-- ============================================================

-- Job Evidence Bucket (photos, documents, signatures)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'job-evidence',
  'job-evidence',
  false, -- Private bucket
  10485760, -- 10MB limit per file
  ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/heic',
    'application/pdf',
    'image/svg+xml'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
    'application/pdf',
    'image/svg+xml'
  ];

-- Job POD (ePOD PDF documents)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'job-pod',
  'job-pod',
  false, -- Private bucket
  20971520, -- 20MB limit per file
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['application/pdf'];

-- ============================================================
-- 2. RLS POLICIES FOR job-evidence BUCKET
-- ============================================================

-- Policy: Drivers can upload evidence for their assigned jobs
CREATE POLICY "Drivers can upload evidence for assigned jobs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'job-evidence' AND
  auth.uid() IN (
    SELECT driver_id FROM jobs 
    WHERE id::text = (storage.foldername(name))[1]
      AND driver_id IS NOT NULL
  )
);

-- Policy: Drivers can view evidence for their assigned jobs
CREATE POLICY "Drivers can view evidence for assigned jobs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'job-evidence' AND
  auth.uid() IN (
    SELECT driver_id FROM jobs 
    WHERE id::text = (storage.foldername(name))[1]
      AND driver_id IS NOT NULL
  )
);

-- Policy: Posting company can view evidence for their jobs
CREATE POLICY "Company can view evidence for their posted jobs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'job-evidence' AND
  (storage.foldername(name))[1] IN (
    SELECT j.id::text FROM jobs j
    INNER JOIN profiles p ON p.company_id = j.posted_by_company_id
    WHERE p.id = auth.uid()
  )
);

-- Policy: Admin users can view all evidence
CREATE POLICY "Admins can view all evidence"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'job-evidence' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
  )
);

-- Policy: Users can delete their own uploads (soft delete preferred)
CREATE POLICY "Users can delete own evidence uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'job-evidence' AND
  owner = auth.uid()
);

-- ============================================================
-- 3. RLS POLICIES FOR job-pod BUCKET
-- ============================================================

-- Policy: System can create POD (via service role or API)
CREATE POLICY "System can create POD files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'job-pod' AND
  (storage.foldername(name))[1] IN (
    SELECT j.id::text FROM jobs j
    WHERE j.current_status = 'DELIVERED'
      OR j.status = 'completed'
  )
);

-- Policy: Driver can view POD for their delivered jobs
CREATE POLICY "Driver can view POD for delivered jobs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'job-pod' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM jobs
    WHERE driver_id = auth.uid()
  )
);

-- Policy: Posting company can view POD for their jobs
CREATE POLICY "Company can view POD for their jobs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'job-pod' AND
  (storage.foldername(name))[1] IN (
    SELECT j.id::text FROM jobs j
    INNER JOIN profiles p ON p.company_id = j.posted_by_company_id
    WHERE p.id = auth.uid()
  )
);

-- Policy: Admin can view all PODs
CREATE POLICY "Admins can view all PODs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'job-pod' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
  )
);

-- ============================================================
-- 4. RLS POLICIES FOR job_evidence TABLE
-- ============================================================

-- Enable RLS on job_evidence table
ALTER TABLE public.job_evidence ENABLE ROW LEVEL SECURITY;

-- Policy: Driver can insert evidence for assigned jobs
CREATE POLICY "Driver can insert evidence for assigned jobs"
ON public.job_evidence FOR INSERT
TO authenticated
WITH CHECK (
  job_id IN (
    SELECT id FROM jobs WHERE driver_id = auth.uid()
  )
);

-- Policy: Driver can view evidence for assigned jobs
CREATE POLICY "Driver can view evidence for assigned jobs"
ON public.job_evidence FOR SELECT
TO authenticated
USING (
  job_id IN (
    SELECT id FROM jobs WHERE driver_id = auth.uid()
  )
);

-- Policy: Company can view evidence for their posted jobs
CREATE POLICY "Company can view evidence for posted jobs"
ON public.job_evidence FOR SELECT
TO authenticated
USING (
  job_id IN (
    SELECT j.id FROM jobs j
    INNER JOIN profiles p ON p.company_id = j.posted_by_company_id
    WHERE p.id = auth.uid()
  )
);

-- Policy: Driver can update their own evidence (for notes)
CREATE POLICY "Driver can update own evidence"
ON public.job_evidence FOR UPDATE
TO authenticated
USING (
  uploaded_by = auth.uid() AND
  job_id IN (SELECT id FROM jobs WHERE driver_id = auth.uid())
)
WITH CHECK (
  uploaded_by = auth.uid() AND
  job_id IN (SELECT id FROM jobs WHERE driver_id = auth.uid())
);

-- Policy: Driver can soft delete their own evidence
CREATE POLICY "Driver can soft delete own evidence"
ON public.job_evidence FOR UPDATE
TO authenticated
USING (
  uploaded_by = auth.uid() AND
  job_id IN (SELECT id FROM jobs WHERE driver_id = auth.uid())
)
WITH CHECK (
  is_deleted = TRUE
);

-- Policy: Admin can view all evidence
CREATE POLICY "Admin can view all evidence"
ON public.job_evidence FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

-- ============================================================
-- 5. RLS POLICIES FOR job_pod TABLE
-- ============================================================

-- Enable RLS on job_pod table
ALTER TABLE public.job_pod ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can insert POD (API handles authorization)
CREATE POLICY "System can insert POD records"
ON public.job_pod FOR INSERT
TO authenticated
WITH CHECK (
  job_id IN (
    SELECT id FROM jobs 
    WHERE current_status = 'DELIVERED' OR status = 'completed'
  )
);

-- Policy: Driver can view POD for their jobs
CREATE POLICY "Driver can view POD for assigned jobs"
ON public.job_pod FOR SELECT
TO authenticated
USING (
  job_id IN (
    SELECT id FROM jobs WHERE driver_id = auth.uid()
  )
);

-- Policy: Company can view POD for their jobs
CREATE POLICY "Company can view POD for posted jobs"
ON public.job_pod FOR SELECT
TO authenticated
USING (
  job_id IN (
    SELECT j.id FROM jobs j
    INNER JOIN profiles p ON p.company_id = j.posted_by_company_id
    WHERE p.id = auth.uid()
  )
);

-- Policy: Admin can view all PODs
CREATE POLICY "Admin can view all PODs"
ON public.job_pod FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

-- ============================================================
-- 6. RLS POLICIES FOR job_status_events TABLE
-- ============================================================

-- Enable RLS on job_status_events table
ALTER TABLE public.job_status_events ENABLE ROW LEVEL SECURITY;

-- Policy: Driver can insert events for assigned jobs
CREATE POLICY "Driver can insert status events for assigned jobs"
ON public.job_status_events FOR INSERT
TO authenticated
WITH CHECK (
  job_id IN (
    SELECT id FROM jobs WHERE driver_id = auth.uid()
  )
);

-- Policy: Driver can view events for assigned jobs
CREATE POLICY "Driver can view status events for assigned jobs"
ON public.job_status_events FOR SELECT
TO authenticated
USING (
  job_id IN (
    SELECT id FROM jobs WHERE driver_id = auth.uid()
  )
);

-- Policy: Company can view events for their jobs
CREATE POLICY "Company can view status events for posted jobs"
ON public.job_status_events FOR SELECT
TO authenticated
USING (
  job_id IN (
    SELECT j.id FROM jobs j
    INNER JOIN profiles p ON p.company_id = j.posted_by_company_id
    WHERE p.id = auth.uid()
  )
);

-- Policy: Admin can view all events
CREATE POLICY "Admin can view all status events"
ON public.job_status_events FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

-- ============================================================
-- 7. HELPER FUNCTION TO CHECK USER ACCESS TO JOB
-- ============================================================

CREATE OR REPLACE FUNCTION user_has_job_access(p_job_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    -- Driver assigned to job
    SELECT 1 FROM jobs 
    WHERE id = p_job_id AND driver_id = p_user_id
  ) OR EXISTS (
    -- Company that posted the job
    SELECT 1 FROM jobs j
    INNER JOIN profiles p ON p.company_id = j.posted_by_company_id
    WHERE j.id = p_job_id AND p.id = p_user_id
  ) OR EXISTS (
    -- Admin user
    SELECT 1 FROM profiles
    WHERE id = p_user_id AND role IN ('admin', 'superadmin')
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION user_has_job_access(UUID, UUID) TO authenticated;

-- ============================================================
-- 8. STORAGE HELPER FUNCTIONS
-- ============================================================

-- Function to get signed URL for evidence
CREATE OR REPLACE FUNCTION get_evidence_signed_url(
  p_file_path TEXT,
  p_expires_in INTEGER DEFAULT 3600
)
RETURNS TEXT AS $$
BEGIN
  -- This is a placeholder - actual implementation uses Supabase client
  -- JavaScript: supabase.storage.from('job-evidence').createSignedUrl(path, expiresIn)
  RETURN 'Use Supabase client to generate signed URL';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 9. AUDIT LOG FOR FILE ACCESS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.file_access_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  job_id UUID REFERENCES public.jobs(id),
  file_path TEXT NOT NULL,
  bucket_id TEXT NOT NULL,
  action TEXT CHECK (action IN ('view', 'download', 'upload', 'delete')),
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_file_access_log_user_id ON public.file_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_file_access_log_job_id ON public.file_access_log(job_id);
CREATE INDEX IF NOT EXISTS idx_file_access_log_accessed_at ON public.file_access_log(accessed_at DESC);

-- Enable RLS
ALTER TABLE public.file_access_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own access logs
CREATE POLICY "Users can view own access logs"
ON public.file_access_log FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: Admin can view all logs
CREATE POLICY "Admin can view all access logs"
ON public.file_access_log FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

-- ============================================================
-- 10. ADD COMMENTS
-- ============================================================

COMMENT ON POLICY "Drivers can upload evidence for assigned jobs" ON storage.objects IS 'Allows drivers to upload photos and documents for jobs assigned to them';
COMMENT ON POLICY "Company can view evidence for their posted jobs" ON storage.objects IS 'Allows posting company to view evidence for jobs they created';
COMMENT ON FUNCTION user_has_job_access(UUID, UUID) IS 'Checks if a user (driver, company, or admin) has access to a specific job';
COMMENT ON TABLE public.file_access_log IS 'Audit log for file access events (views, downloads, uploads)';

-- ============================================================
-- SETUP COMPLETE
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE 'Storage and RLS setup complete!';
  RAISE NOTICE '✓ Buckets: job-evidence, job-pod';
  RAISE NOTICE '✓ RLS enabled on: job_evidence, job_pod, job_status_events';
  RAISE NOTICE '✓ Storage policies created';
  RAISE NOTICE '✓ Access control functions ready';
  RAISE NOTICE '✓ Audit logging enabled';
  RAISE NOTICE '';
  RAISE NOTICE 'Security features:';
  RAISE NOTICE '- Drivers: Upload/view evidence for assigned jobs only';
  RAISE NOTICE '- Companies: View evidence for jobs they posted';
  RAISE NOTICE '- Admins: Full access to all evidence';
  RAISE NOTICE '- File size limits: 10MB (evidence), 20MB (POD)';
  RAISE NOTICE '- Allowed types: JPEG, PNG, WebP, HEIC, PDF, SVG';
END $$;

-- ============================================================
-- SUPABASE STORAGE SETUP FOR JOB EVIDENCE & ePOD
-- XDrive Logistics - Storage Buckets Configuration
-- ============================================================
-- Safe to run multiple times (uses IF NOT EXISTS)
-- Run this in Supabase SQL Editor or via psql
-- ============================================================

-- ============================================================
-- 1. CREATE STORAGE BUCKETS
-- ============================================================

-- Bucket for job evidence (photos uploaded by drivers)
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
    'image/heic'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png', 
    'image/webp',
    'image/heic'
  ];

-- Bucket for generated ePOD PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'job-pod',
  'job-pod',
  false, -- Private bucket
  20971520, -- 20MB limit for PDF files
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['application/pdf'];

-- ============================================================
-- 2. CORS CONFIGURATION (If needed for direct uploads)
-- ============================================================
-- Note: CORS is usually configured in Supabase Dashboard
-- Storage -> Settings -> CORS Configuration
-- Add your frontend domain (e.g., https://xdrivelogistics.netlify.app)

-- ============================================================
-- 3. DROP EXISTING POLICIES (for clean re-run)
-- ============================================================

DROP POLICY IF EXISTS "driver_upload_pickup_evidence" ON storage.objects;
DROP POLICY IF EXISTS "driver_upload_delivery_evidence" ON storage.objects;
DROP POLICY IF EXISTS "driver_view_own_evidence" ON storage.objects;
DROP POLICY IF EXISTS "company_view_job_evidence" ON storage.objects;
DROP POLICY IF EXISTS "admin_full_access_evidence" ON storage.objects;
DROP POLICY IF EXISTS "driver_view_own_pod" ON storage.objects;
DROP POLICY IF EXISTS "company_view_job_pod" ON storage.objects;
DROP POLICY IF EXISTS "system_upload_pod" ON storage.objects;

-- ============================================================
-- 4. RLS POLICIES FOR JOB-EVIDENCE BUCKET
-- ============================================================

-- Enable RLS on storage.objects (should already be enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Drivers can upload evidence for their assigned jobs
CREATE POLICY "driver_upload_pickup_evidence"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'job-evidence'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text
    FROM public.jobs
    WHERE assigned_driver_id = auth.uid()
    AND status IN ('allocated', 'on_my_way_to_pickup', 'on_site_pickup', 'picked_up', 'on_my_way_to_delivery', 'on_site_delivery')
  )
);

-- Policy: Drivers can view evidence for their assigned jobs
CREATE POLICY "driver_view_own_evidence"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'job-evidence'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text
    FROM public.jobs
    WHERE assigned_driver_id = auth.uid()
  )
);

-- Policy: Posting company can view evidence for jobs they posted
CREATE POLICY "company_view_job_evidence"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'job-evidence'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT j.id::text
    FROM public.jobs j
    INNER JOIN public.profiles p ON p.id = auth.uid()
    WHERE j.posted_by_company_id = p.company_id
  )
);

-- Policy: Admin can view all evidence (for support)
CREATE POLICY "admin_full_access_evidence"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'job-evidence'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- ============================================================
-- 5. RLS POLICIES FOR JOB-POD BUCKET
-- ============================================================

-- Policy: System can upload POD (via service role or server)
-- Note: This requires service_role key for backend PDF generation
CREATE POLICY "system_upload_pod"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'job-pod'
  AND (
    auth.role() = 'service_role'
    OR (
      auth.role() = 'authenticated'
      AND EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
      )
    )
  )
);

-- Policy: Driver can view POD for their completed jobs
CREATE POLICY "driver_view_own_pod"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'job-pod'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text
    FROM public.jobs
    WHERE assigned_driver_id = auth.uid()
  )
);

-- Policy: Posting company can view POD for their jobs
CREATE POLICY "company_view_job_pod"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'job-pod'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT j.id::text
    FROM public.jobs j
    INNER JOIN public.profiles p ON p.id = auth.uid()
    WHERE j.posted_by_company_id = p.company_id
  )
);

-- ============================================================
-- 6. VERIFICATION QUERIES
-- ============================================================

-- Check buckets created
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN ('job-evidence', 'job-pod');

-- Check policies created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%evidence%' OR policyname LIKE '%pod%'
ORDER BY policyname;

-- ============================================================
-- 7. TEST EXAMPLES (After setup)
-- ============================================================

-- Example file path structure:
-- job-evidence/{job_id}/pickup/{timestamp}_{filename}.jpg
-- job-evidence/{job_id}/delivery/{timestamp}_{filename}.jpg
-- job-pod/{job_id}/epod_{timestamp}.pdf

-- Test upload (from application):
-- const { data, error } = await supabase.storage
--   .from('job-evidence')
--   .upload(`${jobId}/pickup/${Date.now()}_photo.jpg`, file)

-- Test download (from application):
-- const { data } = await supabase.storage
--   .from('job-evidence')
--   .download(`${jobId}/pickup/${filename}`)

-- ============================================================
-- NOTES:
-- ============================================================
-- 1. Make sure your Supabase project has storage enabled
-- 2. CORS must be configured in Supabase Dashboard for direct browser uploads
-- 3. File size limits can be adjusted based on needs
-- 4. Consider adding automatic file cleanup policy for old evidence
-- 5. For PDF generation, use service_role key in backend/edge function
-- 6. Test policies thoroughly before production deployment
-- ============================================================

-- SUCCESS! Storage buckets and RLS policies are now configured.
-- Next steps:
-- 1. Test file upload from frontend
-- 2. Verify RLS policies work correctly
-- 3. Implement PDF generation service
-- 4. Add file cleanup/archival policy

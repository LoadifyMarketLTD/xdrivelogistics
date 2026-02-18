-- ============================================================
-- XDRIVE LOGISTICS - JOB EVIDENCE & ePOD MIGRATION
-- ============================================================
-- Purpose: Implement evidence upload and ePOD generation system
-- Created: 2026-02-18
-- Phase: 2 - Database Schema
-- ============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. CREATE JOB EVIDENCE TABLE
-- ============================================================
-- Stores photos, signatures, and notes for pickup and delivery

CREATE TABLE IF NOT EXISTS public.job_evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  evidence_type TEXT NOT NULL CHECK (evidence_type IN ('photo', 'signature', 'note', 'document')),
  phase TEXT NOT NULL CHECK (phase IN ('pickup', 'delivery', 'in-transit')),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER, -- bytes
  file_mime_type TEXT,
  thumbnail_url TEXT, -- for photos
  receiver_name TEXT, -- for delivery signatures
  receiver_signature_data TEXT, -- base64 or URL
  notes TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_evidence_job_id ON public.job_evidence(job_id);
CREATE INDEX IF NOT EXISTS idx_job_evidence_phase ON public.job_evidence(phase);
CREATE INDEX IF NOT EXISTS idx_job_evidence_type ON public.job_evidence(evidence_type);
CREATE INDEX IF NOT EXISTS idx_job_evidence_uploaded_by ON public.job_evidence(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_job_evidence_uploaded_at ON public.job_evidence(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_evidence_not_deleted ON public.job_evidence(job_id, is_deleted) WHERE is_deleted = FALSE;

-- ============================================================
-- 2. CREATE JOB POD (PROOF OF DELIVERY) TABLE
-- ============================================================
-- Stores generated ePOD PDF documents

CREATE TABLE IF NOT EXISTS public.job_pod (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  pdf_url TEXT NOT NULL,
  pdf_file_name TEXT,
  pdf_file_size INTEGER, -- bytes
  page_count INTEGER DEFAULT 0,
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  includes_pickup_evidence BOOLEAN DEFAULT FALSE,
  includes_delivery_evidence BOOLEAN DEFAULT FALSE,
  includes_signature BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_latest BOOLEAN DEFAULT TRUE,
  version INTEGER DEFAULT 1
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_job_pod_job_id ON public.job_pod(job_id);
CREATE INDEX IF NOT EXISTS idx_job_pod_generated_at ON public.job_pod(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_pod_is_latest ON public.job_pod(job_id, is_latest) WHERE is_latest = TRUE;

-- ============================================================
-- 3. CREATE TRIGGER TO MARK OLD PODs AS NOT LATEST
-- ============================================================

CREATE OR REPLACE FUNCTION mark_old_pods_not_latest()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark all previous PODs for this job as not latest
  UPDATE public.job_pod
  SET is_latest = FALSE
  WHERE job_id = NEW.job_id 
    AND id != NEW.id 
    AND is_latest = TRUE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_single_latest_pod ON public.job_pod;

CREATE TRIGGER ensure_single_latest_pod
  AFTER INSERT ON public.job_pod
  FOR EACH ROW
  EXECUTE FUNCTION mark_old_pods_not_latest();

-- ============================================================
-- 4. ADD EVIDENCE TRACKING TO JOBS TABLE
-- ============================================================

DO $$ 
BEGIN
  -- Add columns to track evidence status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'has_pickup_evidence') THEN
    ALTER TABLE public.jobs ADD COLUMN has_pickup_evidence BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'has_delivery_evidence') THEN
    ALTER TABLE public.jobs ADD COLUMN has_delivery_evidence BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'pod_generated') THEN
    ALTER TABLE public.jobs ADD COLUMN pod_generated BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'pod_generated_at') THEN
    ALTER TABLE public.jobs ADD COLUMN pod_generated_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_jobs_has_pickup_evidence ON public.jobs(has_pickup_evidence);
CREATE INDEX IF NOT EXISTS idx_jobs_has_delivery_evidence ON public.jobs(has_delivery_evidence);
CREATE INDEX IF NOT EXISTS idx_jobs_pod_generated ON public.jobs(pod_generated);

-- ============================================================
-- 5. CREATE FUNCTION TO UPDATE JOB EVIDENCE FLAGS
-- ============================================================

CREATE OR REPLACE FUNCTION update_job_evidence_flags()
RETURNS TRIGGER AS $$
DECLARE
  pickup_count INT;
  delivery_count INT;
BEGIN
  -- Count evidence for pickup
  SELECT COUNT(*) INTO pickup_count
  FROM public.job_evidence
  WHERE job_id = COALESCE(NEW.job_id, OLD.job_id)
    AND phase = 'pickup'
    AND is_deleted = FALSE;
  
  -- Count evidence for delivery
  SELECT COUNT(*) INTO delivery_count
  FROM public.job_evidence
  WHERE job_id = COALESCE(NEW.job_id, OLD.job_id)
    AND phase = 'delivery'
    AND is_deleted = FALSE;
  
  -- Update job flags
  UPDATE public.jobs
  SET 
    has_pickup_evidence = (pickup_count > 0),
    has_delivery_evidence = (delivery_count > 0)
  WHERE id = COALESCE(NEW.job_id, OLD.job_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 6. CREATE TRIGGER FOR EVIDENCE FLAG UPDATES
-- ============================================================

DROP TRIGGER IF EXISTS update_job_evidence_flags_trigger ON public.job_evidence;

CREATE TRIGGER update_job_evidence_flags_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.job_evidence
  FOR EACH ROW
  EXECUTE FUNCTION update_job_evidence_flags();

-- ============================================================
-- 7. CREATE FUNCTION TO UPDATE POD GENERATED FLAG
-- ============================================================

CREATE OR REPLACE FUNCTION update_pod_generated_flag()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.jobs
  SET 
    pod_generated = TRUE,
    pod_generated_at = NEW.generated_at
  WHERE id = NEW.job_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 8. CREATE TRIGGER FOR POD FLAG UPDATES
-- ============================================================

DROP TRIGGER IF EXISTS update_pod_generated_flag_trigger ON public.job_pod;

CREATE TRIGGER update_pod_generated_flag_trigger
  AFTER INSERT ON public.job_pod
  FOR EACH ROW
  EXECUTE FUNCTION update_pod_generated_flag();

-- ============================================================
-- 9. CREATE HELPER FUNCTIONS
-- ============================================================

-- Function to get evidence count for a job
CREATE OR REPLACE FUNCTION get_job_evidence_count(
  p_job_id UUID,
  p_phase TEXT DEFAULT NULL,
  p_evidence_type TEXT DEFAULT NULL
)
RETURNS INT AS $$
DECLARE
  count INT;
BEGIN
  SELECT COUNT(*) INTO count
  FROM public.job_evidence
  WHERE job_id = p_job_id
    AND is_deleted = FALSE
    AND (p_phase IS NULL OR phase = p_phase)
    AND (p_evidence_type IS NULL OR evidence_type = p_evidence_type);
  
  RETURN count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get latest ePOD for a job
CREATE OR REPLACE FUNCTION get_latest_pod(p_job_id UUID)
RETURNS TABLE (
  id UUID,
  pdf_url TEXT,
  pdf_file_name TEXT,
  page_count INTEGER,
  generated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.pdf_url,
    p.pdf_file_name,
    p.page_count,
    p.generated_at
  FROM public.job_pod p
  WHERE p.job_id = p_job_id
    AND p.is_latest = TRUE
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if job is ready for ePOD generation
CREATE OR REPLACE FUNCTION is_ready_for_pod(p_job_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  job_status TEXT;
  has_evidence BOOLEAN;
BEGIN
  -- Get job status
  SELECT current_status INTO job_status
  FROM public.jobs
  WHERE id = p_job_id;
  
  -- Check if job is delivered
  IF job_status != 'DELIVERED' THEN
    RETURN FALSE;
  END IF;
  
  -- Check if there's any evidence
  SELECT EXISTS(
    SELECT 1 FROM public.job_evidence
    WHERE job_id = p_job_id
      AND is_deleted = FALSE
  ) INTO has_evidence;
  
  RETURN has_evidence;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- 10. CREATE VIEW FOR COMPLETE JOB WITH EVIDENCE
-- ============================================================

CREATE OR REPLACE VIEW job_with_evidence AS
SELECT 
  j.*,
  (
    SELECT json_agg(
      json_build_object(
        'id', e.id,
        'type', e.evidence_type,
        'phase', e.phase,
        'file_url', e.file_url,
        'file_name', e.file_name,
        'thumbnail_url', e.thumbnail_url,
        'receiver_name', e.receiver_name,
        'notes', e.notes,
        'uploaded_at', e.uploaded_at
      )
      ORDER BY e.uploaded_at
    )
    FROM public.job_evidence e
    WHERE e.job_id = j.id
      AND e.is_deleted = FALSE
  ) AS evidence,
  (
    SELECT json_build_object(
      'id', p.id,
      'pdf_url', p.pdf_url,
      'pdf_file_name', p.pdf_file_name,
      'page_count', p.page_count,
      'generated_at', p.generated_at
    )
    FROM public.job_pod p
    WHERE p.job_id = j.id
      AND p.is_latest = TRUE
    LIMIT 1
  ) AS latest_pod
FROM public.jobs j;

-- ============================================================
-- 11. GRANT PERMISSIONS
-- ============================================================

-- Evidence table
GRANT SELECT, INSERT, UPDATE ON public.job_evidence TO authenticated;
GRANT SELECT ON public.job_evidence TO anon;

-- POD table
GRANT SELECT, INSERT ON public.job_pod TO authenticated;
GRANT SELECT ON public.job_pod TO anon;

-- View
GRANT SELECT ON job_with_evidence TO authenticated;

-- Functions
GRANT EXECUTE ON FUNCTION get_job_evidence_count(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_latest_pod(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_ready_for_pod(UUID) TO authenticated;

-- ============================================================
-- 12. ADD COMMENTS
-- ============================================================

COMMENT ON TABLE public.job_evidence IS 'Stores evidence (photos, signatures, notes) for job pickup and delivery';
COMMENT ON TABLE public.job_pod IS 'Stores generated ePOD (Electronic Proof of Delivery) PDF documents';
COMMENT ON COLUMN public.job_evidence.phase IS 'Phase of job: pickup, delivery, or in-transit';
COMMENT ON COLUMN public.job_evidence.evidence_type IS 'Type of evidence: photo, signature, note, or document';
COMMENT ON COLUMN public.job_pod.is_latest IS 'Marks the most recent ePOD for a job (only one should be TRUE per job)';
COMMENT ON FUNCTION get_job_evidence_count(UUID, TEXT, TEXT) IS 'Returns count of evidence items for a job, optionally filtered by phase and type';
COMMENT ON FUNCTION is_ready_for_pod(UUID) IS 'Checks if a job is ready for ePOD generation (DELIVERED status with evidence)';
COMMENT ON VIEW job_with_evidence IS 'Complete job information with embedded evidence and latest ePOD';

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================

-- Verify migration
DO $$
DECLARE
  evidence_count INT;
  pod_count INT;
BEGIN
  SELECT COUNT(*) INTO evidence_count FROM public.job_evidence;
  SELECT COUNT(*) INTO pod_count FROM public.job_pod;
  
  RAISE NOTICE 'Migration complete!';
  RAISE NOTICE 'Evidence table ready with % records', evidence_count;
  RAISE NOTICE 'POD table ready with % records', pod_count;
  RAISE NOTICE 'Triggers and functions created successfully';
  RAISE NOTICE 'View job_with_evidence available';
END $$;

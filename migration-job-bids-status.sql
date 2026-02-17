-- ============================================================
-- MIGRATION: Add status column to job_bids table
-- Purpose: Fix "column job_bids.status does not exist" error
-- Date: 2026-02-17
-- ============================================================

-- Add status column if it doesn't exist
ALTER TABLE public.job_bids
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'submitted';

-- Add check constraint for valid status values
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'job_bids_status_check'
  ) THEN
    ALTER TABLE public.job_bids 
    ADD CONSTRAINT job_bids_status_check 
    CHECK (status IN ('submitted', 'withdrawn', 'rejected', 'accepted'));
  END IF;
END $$;

-- Create index for status filtering (improves query performance)
CREATE INDEX IF NOT EXISTS idx_job_bids_status ON public.job_bids(status);

-- Update any existing rows that might have NULL status (safety measure)
UPDATE public.job_bids 
SET status = 'submitted' 
WHERE status IS NULL;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- This migration adds the missing status column to job_bids table
-- Expected outcome: No more "column does not exist" errors
-- Apply this in Supabase SQL Editor

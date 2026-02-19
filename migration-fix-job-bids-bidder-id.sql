-- ============================================================
-- MIGRATION: Fix job_bids table column names
-- Purpose: Fix "null value in column bidder_id" error when submitting a bid
-- Date: 2026-02-19
-- ============================================================
-- The application code inserts: bidder_company_id, bidder_user_id,
-- quote_amount, status.  This migration ensures those columns exist
-- and any old mismatched columns (company_id, bidder_id, amount) are
-- migrated / renamed to the expected names.
-- ============================================================

BEGIN;

-- -------------------------------------------------------
-- 1. Add bidder_company_id (replacing old company_id)
-- -------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'job_bids'
      AND column_name  = 'bidder_company_id'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name   = 'job_bids'
        AND column_name  = 'company_id'
    ) THEN
      -- Copy values from the old column, then rename
      ALTER TABLE public.job_bids RENAME COLUMN company_id TO bidder_company_id;
    ELSE
      ALTER TABLE public.job_bids
        ADD COLUMN bidder_company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- -------------------------------------------------------
-- 2. Add bidder_user_id (replacing old bidder_id)
-- -------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'job_bids'
      AND column_name  = 'bidder_user_id'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name   = 'job_bids'
        AND column_name  = 'bidder_id'
    ) THEN
      -- Copy values from the old column, then rename
      ALTER TABLE public.job_bids RENAME COLUMN bidder_id TO bidder_user_id;
    ELSE
      ALTER TABLE public.job_bids
        ADD COLUMN bidder_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- -------------------------------------------------------
-- 3. Add quote_amount (replacing old amount)
-- -------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'job_bids'
      AND column_name  = 'quote_amount'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name   = 'job_bids'
        AND column_name  = 'amount'
    ) THEN
      ALTER TABLE public.job_bids RENAME COLUMN amount TO quote_amount;
    ELSE
      ALTER TABLE public.job_bids ADD COLUMN quote_amount NUMERIC;
    END IF;
  END IF;
END $$;

-- -------------------------------------------------------
-- 4. Add status column if missing
-- -------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'job_bids'
      AND column_name  = 'status'
  ) THEN
    ALTER TABLE public.job_bids
      ADD COLUMN status TEXT NOT NULL DEFAULT 'submitted';
  END IF;
END $$;

-- -------------------------------------------------------
-- 5. Ensure NOT NULL constraints on required columns
-- -------------------------------------------------------

-- Remove any rows that are still NULL after the renames above.
-- These rows were created by the old schema with mismatched column names
-- and cannot be attributed to a valid company, user, or bid amount.
-- It is safer to remove them than to assign arbitrary values.
DELETE FROM public.job_bids
WHERE bidder_company_id IS NULL
   OR bidder_user_id    IS NULL
   OR quote_amount      IS NULL;

-- Apply NOT NULL
ALTER TABLE public.job_bids
  ALTER COLUMN bidder_company_id SET NOT NULL,
  ALTER COLUMN bidder_user_id    SET NOT NULL,
  ALTER COLUMN quote_amount      SET NOT NULL;

-- -------------------------------------------------------
-- 6. Add status check constraint if not already present
-- -------------------------------------------------------
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

-- -------------------------------------------------------
-- 7. Useful indexes
-- -------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_job_bids_job_id
  ON public.job_bids(job_id);

CREATE INDEX IF NOT EXISTS idx_job_bids_bidder_company
  ON public.job_bids(bidder_company_id);

CREATE INDEX IF NOT EXISTS idx_job_bids_bidder_user
  ON public.job_bids(bidder_user_id);

CREATE INDEX IF NOT EXISTS idx_job_bids_status
  ON public.job_bids(status);

COMMIT;

-- -------------------------------------------------------
-- VERIFICATION: Inspect the fixed table structure
-- -------------------------------------------------------
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'job_bids'
ORDER BY ordinal_position;

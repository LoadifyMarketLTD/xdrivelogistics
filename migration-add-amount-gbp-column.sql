-- ============================================================
-- MIGRATION: Fix job_bids table — add amount_gbp, bidder_id, status
-- Problem: "Could not find the 'amount_gbp' column of 'job_bids' in the schema cache"
-- Run this in Supabase SQL Editor
-- ============================================================

DO $$
BEGIN

  -- 1. Add bidder_id column (uuid pointing to auth.users) if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'job_bids' AND column_name = 'bidder_id'
  ) THEN
    -- Prefer renaming an existing user-identity column if present
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'job_bids' AND column_name = 'bidder_user_id'
    ) THEN
      ALTER TABLE public.job_bids RENAME COLUMN bidder_user_id TO bidder_id;
    ELSE
      ALTER TABLE public.job_bids ADD COLUMN bidder_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
  END IF;

  -- 2. Add amount_gbp column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'job_bids' AND column_name = 'amount_gbp'
  ) THEN
    -- Prefer renaming an existing amount column
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'job_bids' AND column_name = 'quote_amount'
    ) THEN
      ALTER TABLE public.job_bids RENAME COLUMN quote_amount TO amount_gbp;
      ALTER TABLE public.job_bids ALTER COLUMN amount_gbp TYPE NUMERIC(12,2);
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'job_bids' AND column_name = 'amount'
    ) THEN
      ALTER TABLE public.job_bids RENAME COLUMN amount TO amount_gbp;
      ALTER TABLE public.job_bids ALTER COLUMN amount_gbp TYPE NUMERIC(12,2);
    ELSE
      ALTER TABLE public.job_bids ADD COLUMN amount_gbp NUMERIC(12,2) NOT NULL DEFAULT 0;
    END IF;
  END IF;

  -- 3. Add status column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'job_bids' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.job_bids ADD COLUMN status TEXT NOT NULL DEFAULT 'submitted'
      CHECK (status IN ('submitted', 'withdrawn', 'rejected', 'accepted'));
  END IF;

  -- 4. Add message column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'job_bids' AND column_name = 'message'
  ) THEN
    ALTER TABLE public.job_bids ADD COLUMN message TEXT;
  END IF;

END $$;

-- 5. Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_job_bids_bidder_id ON public.job_bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_job_bids_status    ON public.job_bids(status);

-- Verification — run after migration to confirm all columns are present
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'job_bids'
ORDER BY ordinal_position;

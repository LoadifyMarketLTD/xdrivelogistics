-- ================================================================
-- COPIAZĂ TOT CE ESTE MAI JOS ȘI RULEAZĂ IN SUPABASE > SQL EDITOR
-- (Copy everything below and run it in Supabase > SQL Editor)
-- ================================================================

-- Step 1: Add missing columns to job_bids (safe – skips if already exists)
DO $$
BEGIN

  -- bidder_id  (the user who placed the bid)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'job_bids'
      AND column_name  = 'bidder_id'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name   = 'job_bids'
        AND column_name  = 'bidder_user_id'
    ) THEN
      ALTER TABLE public.job_bids RENAME COLUMN bidder_user_id TO bidder_id;
    ELSE
      ALTER TABLE public.job_bids
        ADD COLUMN bidder_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
  END IF;

  -- amount_gbp  (bid value in GBP)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'job_bids'
      AND column_name  = 'amount_gbp'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name   = 'job_bids'
        AND column_name  = 'quote_amount'
    ) THEN
      ALTER TABLE public.job_bids RENAME COLUMN quote_amount TO amount_gbp;
      ALTER TABLE public.job_bids ALTER COLUMN amount_gbp TYPE NUMERIC(12,2);
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name   = 'job_bids'
        AND column_name  = 'amount'
    ) THEN
      ALTER TABLE public.job_bids RENAME COLUMN amount TO amount_gbp;
      ALTER TABLE public.job_bids ALTER COLUMN amount_gbp TYPE NUMERIC(12,2);
    ELSE
      ALTER TABLE public.job_bids
        ADD COLUMN amount_gbp NUMERIC(12,2) NOT NULL DEFAULT 0;
    END IF;
  END IF;

  -- status  (submitted / withdrawn / rejected / accepted)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'job_bids'
      AND column_name  = 'status'
  ) THEN
    ALTER TABLE public.job_bids
      ADD COLUMN status TEXT NOT NULL DEFAULT 'submitted'
        CHECK (status IN ('submitted', 'withdrawn', 'rejected', 'accepted'));
  END IF;

  -- message  (optional note from bidder)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'job_bids'
      AND column_name  = 'message'
  ) THEN
    ALTER TABLE public.job_bids ADD COLUMN message TEXT;
  END IF;

END $$;

-- Step 2: Indexes
CREATE INDEX IF NOT EXISTS idx_job_bids_bidder_id ON public.job_bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_job_bids_status    ON public.job_bids(status);

-- Step 3: Verify — you should see columns: id, job_id, bidder_id, amount_gbp, status, message …
SELECT column_name, data_type, is_nullable, column_default
FROM   information_schema.columns
WHERE  table_schema = 'public'
  AND  table_name   = 'job_bids'
ORDER  BY ordinal_position;

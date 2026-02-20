-- Migration: Fix quote_amount NOT NULL constraint in job_bids
-- Problem: INSERT statements that omit quote_amount fail with:
--   "null value in column 'quote_amount' violates not-null constraint"
-- Solution (Option 1): Keep NOT NULL but add DEFAULT 0 as a safety net.
-- This ensures any legacy INSERT that omits the column still succeeds,
-- while the application always supplies the real bid value explicitly.

-- Step 1: Add DEFAULT 0 to quote_amount
ALTER TABLE public.job_bids
  ALTER COLUMN quote_amount SET DEFAULT 0;

-- Step 2: Backfill any existing NULL rows (in case they exist).
-- Priority: use amount_gbp value if available, otherwise default to 0.
-- Rows where both quote_amount and amount_gbp are NULL are incomplete/legacy
-- bids; setting them to 0 is intentional so the NOT NULL constraint can be
-- applied without blocking the migration.
UPDATE public.job_bids
  SET quote_amount = COALESCE(quote_amount, amount_gbp, 0)
  WHERE quote_amount IS NULL;

-- Step 3: Re-enforce NOT NULL (it should already be set, this is idempotent)
ALTER TABLE public.job_bids
  ALTER COLUMN quote_amount SET NOT NULL;

-- ============================================================
-- MIGRATION: Fix job_bids status default and constraint
-- Purpose: Fix "job_bids_status_check" violation when submitting bids.
--          The portal schema created the status column with DEFAULT 'pending'
--          and an inline CHECK allowing 'pending'. The named constraint
--          job_bids_status_check only allows 'submitted', causing new inserts
--          (which rely on the DEFAULT) to fail.
-- Date: 2026-02-21
-- ============================================================

BEGIN;

-- -------------------------------------------------------
-- 1. Update any existing 'pending' bids to 'submitted'
--    (these are bids that were never accepted/rejected)
-- -------------------------------------------------------
UPDATE public.job_bids
SET status = 'submitted'
WHERE status = 'pending';

-- -------------------------------------------------------
-- 2. Change the DEFAULT from 'pending' to 'submitted'
-- -------------------------------------------------------
ALTER TABLE public.job_bids
  ALTER COLUMN status SET DEFAULT 'submitted';

-- -------------------------------------------------------
-- 3. Drop the old inline check constraint (if it exists)
--    The inline constraint was auto-named by PostgreSQL, typically
--    something like 'job_bids_status_check' or a generated name.
--    We drop all check constraints on status that include 'pending'
--    by finding them via pg_constraint.
-- -------------------------------------------------------
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public'
      AND rel.relname = 'job_bids'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) LIKE '%pending%'
  LOOP
    EXECUTE 'ALTER TABLE public.job_bids DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
  END LOOP;
END $$;

-- -------------------------------------------------------
-- 4. Drop the named constraint if it already exists
--    (so we can re-add it cleanly with the correct values)
-- -------------------------------------------------------
ALTER TABLE public.job_bids
  DROP CONSTRAINT IF EXISTS job_bids_status_check;

-- -------------------------------------------------------
-- 5. Re-add the named constraint with the correct values
-- -------------------------------------------------------
ALTER TABLE public.job_bids
  ADD CONSTRAINT job_bids_status_check
  CHECK (status IN ('submitted', 'withdrawn', 'rejected', 'accepted'));

COMMIT;

-- -------------------------------------------------------
-- VERIFICATION
-- -------------------------------------------------------
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'job_bids'
  AND column_name  = 'status';

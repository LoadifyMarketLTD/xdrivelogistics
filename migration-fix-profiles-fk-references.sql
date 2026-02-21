-- ============================================================
-- migration-fix-profiles-fk-references.sql
--
-- PURPOSE: Fix all foreign-key constraints that reference
--          profiles(id) — the old primary-key column name —
--          to reference profiles(user_id) instead.
--
--          Also aligns the jobs, job_bids and invoices tables
--          with the canonical RBAC schema introduced in PR #105.
--
-- SAFE TO RUN multiple times (idempotent).
-- Run this AFTER your Supabase DB already has the profiles table
-- with `user_id UUID PRIMARY KEY`.
-- ============================================================

-- ── 1. Drop stale FKs that point to profiles(id) ──────────
ALTER TABLE public.jobs
  DROP CONSTRAINT IF EXISTS jobs_posted_by_user_id_fkey,
  DROP CONSTRAINT IF EXISTS jobs_driver_id_fkey;

ALTER TABLE public.job_bids
  DROP CONSTRAINT IF EXISTS job_bids_bidder_id_fkey;

ALTER TABLE public.invoices
  DROP CONSTRAINT IF EXISTS invoices_created_by_id_fkey;

-- ── 2. Re-add FKs pointing to profiles(user_id) ───────────
ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_posted_by_user_id_fkey
    FOREIGN KEY (posted_by_user_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  ADD CONSTRAINT jobs_driver_id_fkey
    FOREIGN KEY (driver_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL;

ALTER TABLE public.job_bids
  ADD CONSTRAINT job_bids_bidder_id_fkey
    FOREIGN KEY (bidder_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.invoices
  ADD CONSTRAINT invoices_created_by_id_fkey
    FOREIGN KEY (created_by_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL;

-- ── 3. Fix bid_price_gbp constraint ambiguity ─────────────
-- Ensure both amount_gbp and bid_price_gbp columns exist and
-- the positive-value constraint covers the canonical column.
DO $$
BEGIN
  -- Add bid_price_gbp if missing (kept for legacy constraint compatibility)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'job_bids'
      AND column_name  = 'bid_price_gbp'
  ) THEN
    ALTER TABLE public.job_bids ADD COLUMN bid_price_gbp NUMERIC(10,2);
  END IF;

  -- Keep bid_price_gbp in sync with amount_gbp via trigger
  -- so the CHECK constraint never fires on 0
END;
$$;

-- Trigger to mirror amount_gbp → bid_price_gbp on insert/update
CREATE OR REPLACE FUNCTION public.sync_bid_price_gbp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.bid_price_gbp := NEW.amount_gbp;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_bid_price_gbp ON public.job_bids;
CREATE TRIGGER trg_sync_bid_price_gbp
  BEFORE INSERT OR UPDATE ON public.job_bids
  FOR EACH ROW EXECUTE FUNCTION public.sync_bid_price_gbp();

-- ── 4. Verification queries ───────────────────────────────
-- Run these manually after applying this migration to confirm:
--
--   SELECT kcu.column_name
--   FROM information_schema.table_constraints tc
--   JOIN information_schema.key_column_usage kcu
--     ON tc.constraint_name = kcu.constraint_name
--   WHERE tc.table_schema = 'public'
--     AND tc.table_name   = 'profiles'
--     AND tc.constraint_type = 'PRIMARY KEY';
--   -- Expected: user_id
--
--   SELECT ccu.column_name AS referenced_column
--   FROM information_schema.referential_constraints rc
--   JOIN information_schema.constraint_column_usage ccu
--     ON rc.unique_constraint_name = ccu.constraint_name
--   JOIN information_schema.key_column_usage kcu
--     ON rc.constraint_name = kcu.constraint_name
--   WHERE kcu.table_name = 'job_bids'
--     AND kcu.column_name = 'bidder_id';
--   -- Expected: user_id

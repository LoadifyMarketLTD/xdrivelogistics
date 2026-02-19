-- ============================================================
-- MIGRATION: Fix & add all "Post a New Job" form fields
-- ============================================================
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- Safe to run multiple times (idempotent - uses IF NOT EXISTS)
--
-- Fixes:
--   "null value in column 'title' violates not-null constraint"
--   "Could not find the 'budget' column of 'jobs'"
--   "Could not find the 'pallets' column of 'jobs'"
-- ============================================================

-- FIX: Remove the 'title' NOT NULL constraint if it exists
-- (old schema had title TEXT NOT NULL - app does not use it)
ALTER TABLE public.jobs ALTER COLUMN title DROP NOT NULL;

-- Add all form fields (safe to run even if columns already exist)
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS pickup_datetime    TIMESTAMPTZ;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS delivery_datetime  TIMESTAMPTZ;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS vehicle_type       TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS cargo_type         TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS load_details       TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS pallets            INTEGER;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS boxes              INTEGER;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS bags               INTEGER;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS items              INTEGER;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS weight_kg          NUMERIC;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS budget             NUMERIC;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS assigned_company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS accepted_bid_id    UUID;

-- Index for assigned_company_id lookups
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_to ON public.jobs(assigned_company_id);

-- VERIFY: afiseaza toate coloanele tabelului jobs
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'jobs'
ORDER BY ordinal_position;

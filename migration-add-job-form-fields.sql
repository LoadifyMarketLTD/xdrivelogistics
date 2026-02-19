-- ============================================================
-- MIGRATION: Add all "Post a New Job" form fields to jobs table
-- ============================================================
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- 
-- Fixes error: "Could not find the 'budget' column of 'jobs' in the schema cache"
-- Also adds: cargo_type, boxes, bags, items, assigned_company_id, accepted_bid_id
-- ============================================================

-- 1. Budget (£) — the main missing column
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS budget NUMERIC;

-- 2. Cargo Type (e.g. Palletized, Boxed, Bagged, Loose...)
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS cargo_type TEXT;

-- 3. Boxes quantity
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS boxes INTEGER;

-- 4. Bags quantity
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS bags INTEGER;

-- 5. Items quantity (already named items in the app form)
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS items INTEGER;

-- 6. Assigned company (UUID FK → companies)
--    CORRECT column name: assigned_company_id
--    (not assigned_company, not assigned_companyid, not assigned_company_uuid)
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS assigned_company_id UUID REFERENCES public.companies(id);

-- 7. Accepted bid reference
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS accepted_bid_id UUID;

-- Index for assigned_company_id lookups
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_to ON public.jobs(assigned_company_id);

-- ============================================================
-- VERIFY: Check all form columns now exist
-- ============================================================
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'jobs'
  AND column_name IN (
    'pickup_location',
    'delivery_location',
    'pickup_datetime',
    'delivery_datetime',
    'vehicle_type',
    'cargo_type',
    'pallets',
    'boxes',
    'bags',
    'items',
    'weight_kg',
    'budget',
    'load_details',
    'assigned_company_id',
    'accepted_bid_id'
  )
ORDER BY column_name;

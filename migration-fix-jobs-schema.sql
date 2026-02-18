-- ============================================================
-- MIGRATION: Fix Jobs Table Schema Mismatch
-- ============================================================
-- This migration fixes the issue where users deployed the wrong
-- schema (supabase-schema.sql instead of supabase-marketplace-schema.sql)
-- 
-- ERROR FIXED: "column 'budget' of relation 'jobs' does not exist"
-- ============================================================

-- Check if you have the wrong schema by running:
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'jobs' AND column_name IN ('budget', 'price', 'cost', 'posted_by_company_id', 'company_id');

-- ============================================================
-- OPTION 1: Fresh Start (RECOMMENDED if no data yet)
-- ============================================================
-- If you haven't added any important data yet:
--
-- 1. Drop the existing jobs table:
--    DROP TABLE IF EXISTS public.jobs CASCADE;
--
-- 2. Run the entire supabase-marketplace-schema.sql file
--
-- This is the cleanest approach if you're just getting started.

-- ============================================================
-- OPTION 2: Migrate Existing Data (if you have data to preserve)
-- ============================================================

-- Step 1: Check current schema
DO $$ 
BEGIN
  RAISE NOTICE 'Current jobs table columns:';
END $$;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'jobs' 
ORDER BY ordinal_position;

-- Step 2: Rename old columns if they exist
ALTER TABLE public.jobs 
  RENAME COLUMN company_id TO posted_by_company_id;

ALTER TABLE public.jobs 
  RENAME COLUMN pickup TO pickup_location;

ALTER TABLE public.jobs 
  RENAME COLUMN delivery TO delivery_location;

-- Step 3: Add missing budget column
-- This combines price and cost into a single budget field
ALTER TABLE public.jobs 
  ADD COLUMN IF NOT EXISTS budget NUMERIC;

-- Copy price value to budget (if price exists)
UPDATE public.jobs 
SET budget = price 
WHERE price IS NOT NULL AND budget IS NULL;

-- Step 4: Drop old columns that aren't used
ALTER TABLE public.jobs 
  DROP COLUMN IF EXISTS price CASCADE;

ALTER TABLE public.jobs 
  DROP COLUMN IF EXISTS cost CASCADE;

ALTER TABLE public.jobs 
  DROP COLUMN IF EXISTS profit CASCADE;

ALTER TABLE public.jobs 
  DROP COLUMN IF EXISTS job_code CASCADE;

ALTER TABLE public.jobs 
  DROP COLUMN IF EXISTS customer_name CASCADE;

ALTER TABLE public.jobs 
  DROP COLUMN IF EXISTS customer_email CASCADE;

ALTER TABLE public.jobs 
  DROP COLUMN IF EXISTS customer_phone CASCADE;

ALTER TABLE public.jobs 
  DROP COLUMN IF EXISTS pickup_postcode CASCADE;

ALTER TABLE public.jobs 
  DROP COLUMN IF EXISTS delivery_postcode CASCADE;

ALTER TABLE public.jobs 
  DROP COLUMN IF EXISTS scheduled_date CASCADE;

ALTER TABLE public.jobs 
  DROP COLUMN IF EXISTS scheduled_time CASCADE;

ALTER TABLE public.jobs 
  DROP COLUMN IF EXISTS driver_id CASCADE;

ALTER TABLE public.jobs 
  DROP COLUMN IF EXISTS notes CASCADE;

-- Step 5: Add missing marketplace columns
ALTER TABLE public.jobs 
  ADD COLUMN IF NOT EXISTS vehicle_type TEXT;

ALTER TABLE public.jobs 
  ADD COLUMN IF NOT EXISTS load_details TEXT;

ALTER TABLE public.jobs 
  ADD COLUMN IF NOT EXISTS pallets INTEGER;

ALTER TABLE public.jobs 
  ADD COLUMN IF NOT EXISTS weight_kg NUMERIC;

ALTER TABLE public.jobs 
  ADD COLUMN IF NOT EXISTS pickup_datetime TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.jobs 
  ADD COLUMN IF NOT EXISTS delivery_datetime TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.jobs 
  ADD COLUMN IF NOT EXISTS assigned_company_id UUID REFERENCES public.companies(id);

ALTER TABLE public.jobs 
  ADD COLUMN IF NOT EXISTS accepted_bid_id UUID;

-- Step 6: Update status field constraints
-- Old schema: 'pending', 'confirmed', 'in-transit', 'delivered', 'cancelled'
-- New schema: 'open', 'assigned', 'in-transit', 'completed', 'cancelled'

-- Drop old constraint
ALTER TABLE public.jobs 
  DROP CONSTRAINT IF EXISTS jobs_status_check;

-- Add new constraint
ALTER TABLE public.jobs 
  ADD CONSTRAINT jobs_status_check 
  CHECK (status IN ('open', 'assigned', 'in-transit', 'completed', 'cancelled'));

-- Migrate old status values to new ones
UPDATE public.jobs SET status = 'open' WHERE status = 'pending';
UPDATE public.jobs SET status = 'completed' WHERE status = 'delivered';
UPDATE public.jobs SET status = 'completed' WHERE status = 'confirmed';

-- Step 7: Verify the migration
SELECT 
  COUNT(*) as total_jobs,
  COUNT(posted_by_company_id) as has_company_id,
  COUNT(budget) as has_budget,
  COUNT(pickup_location) as has_pickup,
  COUNT(delivery_location) as has_delivery
FROM public.jobs;

-- Step 8: Create missing indexes (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON public.jobs(posted_by_company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_to ON public.jobs(assigned_company_id);

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Check that all required columns exist
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'jobs' 
  AND column_name IN (
    'id', 
    'posted_by_company_id', 
    'pickup_location', 
    'delivery_location', 
    'budget', 
    'status',
    'created_at',
    'updated_at'
  )
ORDER BY column_name;

-- Test insert with new schema
INSERT INTO public.jobs (
  posted_by_company_id,
  pickup_location,
  delivery_location,
  budget,
  status
) VALUES (
  (SELECT id FROM public.companies LIMIT 1),  -- Use first company
  'Test Location A',
  'Test Location B',
  100.00,
  'open'
)
RETURNING id, status, budget;

-- If the insert succeeds, delete the test record:
-- DELETE FROM public.jobs WHERE pickup_location = 'Test Location A';

-- ============================================================
-- POST-MIGRATION NOTES
-- ============================================================
-- 
-- After running this migration:
-- 1. Test the application to ensure everything works
-- 2. Update any custom queries you may have written
-- 3. If you have a job_bids table, verify foreign keys still work
-- 4. Consider backing up your database before running this
-- 
-- If you encounter errors:
-- 1. Check that the companies table exists
-- 2. Verify foreign key references are valid
-- 3. Check RLS policies if you have them enabled
-- 
-- ============================================================

-- ============================================================
-- CORRECTED SQL QUERIES FOR JOBS TABLE
-- ============================================================
-- This file contains corrected SQL queries that work with the
-- marketplace schema (supabase-marketplace-schema.sql)
-- ============================================================

-- ============================================================
-- STEP 1: Get Your Company ID (Run this first)
-- ============================================================

-- Option A: If you know your company email
SELECT id, name, email 
FROM public.companies 
WHERE email = 'xdrivelogisticsltd@gmail.com';

-- Option B: Get company from your user profile
SELECT c.id, c.name, c.email 
FROM public.companies c
JOIN public.profiles p ON p.company_id = c.id
WHERE p.id = auth.uid();

-- ============================================================
-- STEP 2: Insert a Test Job (Method 1 - Direct Insert)
-- ============================================================

-- Replace 'YOUR_COMPANY_UUID_HERE' with actual UUID from Step 1
INSERT INTO public.jobs (
  posted_by_company_id,
  pickup_location,
  pickup_datetime,
  delivery_location,
  delivery_datetime,
  budget,
  vehicle_type,
  load_details,
  status
) VALUES (
  'YOUR_COMPANY_UUID_HERE',  -- Replace with actual company UUID
  'BB1 Blackburn',
  NOW() + interval '1 day',
  'M1 Manchester',
  NOW() + interval '1 day' + interval '3 hours',
  120.00,  -- Budget in GBP
  'van',
  'Test load - 1 pallet, 50kg',
  'open'
)
RETURNING id, status, created_at, pickup_location, delivery_location, budget;

-- ============================================================
-- STEP 2 Alternative: Insert Using Auth Context
-- ============================================================

-- This automatically uses the logged-in user's company
WITH user_company AS (
  SELECT company_id 
  FROM public.profiles 
  WHERE id = auth.uid()
)
INSERT INTO public.jobs (
  posted_by_company_id,
  pickup_location,
  pickup_datetime,
  delivery_location,
  delivery_datetime,
  budget,
  vehicle_type,
  load_details
) 
SELECT 
  company_id,
  'BB1 Blackburn',
  NOW() + interval '1 day',
  'M1 Manchester',
  NOW() + interval '1 day' + interval '3 hours',
  120.00,
  'van',
  'Test load - 1 pallet, 50kg'
FROM user_company
WHERE company_id IS NOT NULL
RETURNING id, status, created_at, pickup_location, delivery_location, budget;

-- ============================================================
-- STEP 3: Insert Multiple Test Jobs
-- ============================================================

-- Replace 'YOUR_COMPANY_UUID_HERE' with actual UUID
INSERT INTO public.jobs (
  posted_by_company_id,
  pickup_location,
  pickup_datetime,
  delivery_location,
  delivery_datetime,
  budget,
  vehicle_type,
  load_details
) VALUES 
  (
    'YOUR_COMPANY_UUID_HERE',
    'BB1 Blackburn',
    NOW() + interval '1 day',
    'M1 Manchester',
    NOW() + interval '1 day' + interval '3 hours',
    120.00,
    'van',
    'Test load 1 - Documents delivery'
  ),
  (
    'YOUR_COMPANY_UUID_HERE',
    'SW1A London',
    NOW() + interval '2 days',
    'B1 Birmingham',
    NOW() + interval '2 days' + interval '4 hours',
    250.00,
    'medium-van',
    'Test load 2 - 5 pallets, 200kg'
  ),
  (
    'YOUR_COMPANY_UUID_HERE',
    'LS1 Leeds',
    NOW() + interval '3 days',
    'NE1 Newcastle',
    NOW() + interval '3 days' + interval '2 hours',
    180.00,
    'large-van',
    'Test load 3 - Furniture delivery'
  )
RETURNING id, pickup_location, delivery_location, budget;

-- ============================================================
-- STEP 4: Verify Jobs Were Created
-- ============================================================

-- View all jobs for your company
SELECT 
  id,
  status,
  pickup_location,
  delivery_location,
  pickup_datetime,
  delivery_datetime,
  budget,
  vehicle_type,
  created_at
FROM public.jobs
WHERE posted_by_company_id = 'YOUR_COMPANY_UUID_HERE'
ORDER BY created_at DESC;

-- View recent jobs (last 7 days)
SELECT 
  id,
  status,
  pickup_location,
  delivery_location,
  budget,
  created_at
FROM public.jobs
WHERE posted_by_company_id = 'YOUR_COMPANY_UUID_HERE'
  AND created_at > NOW() - interval '7 days'
ORDER BY created_at DESC;

-- ============================================================
-- STEP 5: Update a Job (Optional)
-- ============================================================

-- Update job status
UPDATE public.jobs
SET 
  status = 'assigned',
  updated_at = NOW()
WHERE id = 'YOUR_JOB_UUID_HERE'
  AND posted_by_company_id = 'YOUR_COMPANY_UUID_HERE'
RETURNING id, status, updated_at;

-- Update job budget
UPDATE public.jobs
SET 
  budget = 150.00,
  updated_at = NOW()
WHERE id = 'YOUR_JOB_UUID_HERE'
  AND posted_by_company_id = 'YOUR_COMPANY_UUID_HERE'
RETURNING id, budget, updated_at;

-- ============================================================
-- STEP 6: Delete Test Jobs (Optional)
-- ============================================================

-- Delete a specific test job
DELETE FROM public.jobs
WHERE id = 'YOUR_JOB_UUID_HERE'
  AND posted_by_company_id = 'YOUR_COMPANY_UUID_HERE'
RETURNING id, pickup_location, delivery_location;

-- Delete all test jobs with "Test load" in details
DELETE FROM public.jobs
WHERE posted_by_company_id = 'YOUR_COMPANY_UUID_HERE'
  AND load_details LIKE 'Test load%'
RETURNING id, load_details;

-- ============================================================
-- USEFUL QUERIES
-- ============================================================

-- Count jobs by status
SELECT 
  status,
  COUNT(*) as count,
  SUM(budget) as total_budget
FROM public.jobs
WHERE posted_by_company_id = 'YOUR_COMPANY_UUID_HERE'
GROUP BY status
ORDER BY count DESC;

-- Find jobs scheduled for today
SELECT 
  id,
  pickup_location,
  delivery_location,
  pickup_datetime,
  budget
FROM public.jobs
WHERE posted_by_company_id = 'YOUR_COMPANY_UUID_HERE'
  AND DATE(pickup_datetime) = CURRENT_DATE
ORDER BY pickup_datetime;

-- Find jobs within budget range
SELECT 
  id,
  pickup_location,
  delivery_location,
  budget,
  status
FROM public.jobs
WHERE posted_by_company_id = 'YOUR_COMPANY_UUID_HERE'
  AND budget BETWEEN 100 AND 200
ORDER BY budget DESC;

-- ============================================================
-- NOTES
-- ============================================================
-- 
-- 1. Always replace 'YOUR_COMPANY_UUID_HERE' with your actual company UUID
-- 2. Get your company UUID using the queries in STEP 1
-- 3. All timestamps are in UTC with time zone
-- 4. Budget is stored as NUMERIC (supports decimals)
-- 5. Status must be one of: 'open', 'assigned', 'in-transit', 'completed', 'cancelled'
-- 6. pickup_location and delivery_location are required fields
-- 7. posted_by_company_id is required and must reference an existing company
-- 
-- ============================================================

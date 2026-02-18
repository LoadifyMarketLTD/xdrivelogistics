-- ============================================================
-- DIAGNOSTIC SCRIPT: Check jobs.status column configuration
-- Run this FIRST in Supabase SQL Editor to diagnose the issue
-- ============================================================

-- Check 1: What is the data type of the status column?
SELECT 
  column_name,
  data_type,
  udt_name,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'jobs'
  AND column_name = 'status';

-- Check 2: If it's an ENUM, what are the allowed values?
SELECT 
  t.typname AS enum_name,
  e.enumlabel AS enum_value,
  e.enumsortorder
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN (
  SELECT udt_name 
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'jobs'
    AND column_name = 'status'
)
ORDER BY e.enumsortorder;

-- Check 3: What CHECK constraints exist on the jobs table?
SELECT 
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
  AND rel.relname = 'jobs'
  AND con.contype = 'c'
  AND (con.conname LIKE '%status%' OR pg_get_constraintdef(con.oid) LIKE '%status%');

-- Check 4: Does the jobs table exist?
SELECT EXISTS (
  SELECT 1
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name = 'jobs'
) AS jobs_table_exists;

-- Check 5: Sample of existing status values in the table
SELECT 
  status, 
  COUNT(*) as count
FROM public.jobs
GROUP BY status
ORDER BY count DESC
LIMIT 10;

-- ============================================================
-- INTERPRETATION OF RESULTS
-- ============================================================
-- 
-- If Check 1 shows data_type = 'USER-DEFINED':
--   → status is using a PostgreSQL ENUM type
--   → Check 2 will show which values are allowed
--   → If 'completed' is missing from Check 2, that's your problem
--
-- If Check 1 shows data_type = 'text':
--   → status is using TEXT with a CHECK constraint
--   → Check 3 will show the constraint definition
--   → If 'completed' is missing from Check 3, that's your problem
--
-- Solution depends on the result:
--   - For ENUM: Use migration-delivery-tracking-FIXED.sql (handles ENUM)
--   - For TEXT: Use migration-delivery-tracking-FIXED.sql (handles TEXT too)

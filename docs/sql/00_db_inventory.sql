-- XDrive Logistics - Database Inventory Script
-- Run this in your Supabase SQL Editor to audit the database schema
-- Generated: 2026-02-17

-- ============================================
-- 1. LIST ALL TABLES
-- ============================================
SELECT 
    tablename as "Table Name",
    tableowner as "Owner"
FROM pg_tables 
WHERE schemaname='public' 
ORDER BY tablename;

-- ============================================
-- 2. LIST ALL COLUMNS FOR KEY TABLES
-- ============================================
SELECT 
    table_name as "Table",
    column_name as "Column",
    data_type as "Type",
    character_maximum_length as "Max Length",
    is_nullable as "Nullable",
    column_default as "Default"
FROM information_schema.columns
WHERE table_schema='public'
ORDER BY table_name, ordinal_position;

-- ============================================
-- 3. CHECK RLS (Row Level Security) STATUS
-- ============================================
SELECT 
    n.nspname as "Schema",
    c.relname as "Table",
    c.relrowsecurity as "RLS Enabled",
    c.relforcerowsecurity as "Force RLS"
FROM pg_class c
JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relkind='r'
ORDER BY c.relname;

-- ============================================
-- 4. LIST ALL RLS POLICIES
-- ============================================
SELECT 
    schemaname as "Schema",
    tablename as "Table",
    policyname as "Policy Name",
    permissive as "Permissive",
    roles as "Roles",
    cmd as "Command",
    qual as "USING Expression",
    with_check as "WITH CHECK Expression"
FROM pg_policies
WHERE schemaname='public'
ORDER BY tablename, policyname;

-- ============================================
-- 5. LIST ALL INDEXES
-- ============================================
SELECT 
    tablename as "Table",
    indexname as "Index Name",
    indexdef as "Definition"
FROM pg_indexes
WHERE schemaname='public'
ORDER BY tablename, indexname;

-- ============================================
-- 6. LIST ALL FOREIGN KEY CONSTRAINTS
-- ============================================
SELECT
    tc.table_name as "Table",
    kcu.column_name as "Column",
    ccu.table_name AS "Foreign Table",
    ccu.column_name AS "Foreign Column",
    tc.constraint_name as "Constraint Name"
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema='public'
ORDER BY tc.table_name, kcu.column_name;

-- ============================================
-- 7. CHECK FOR EXPECTED TABLES (APP REQUIREMENTS)
-- ============================================
-- This query checks if critical tables exist
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename='companies' AND schemaname='public') 
        THEN '✓' ELSE '✗' 
    END as "companies",
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename='jobs' AND schemaname='public') 
        THEN '✓' ELSE '✗' 
    END as "jobs",
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename='job_bids' AND schemaname='public') 
        THEN '✓' ELSE '✗' 
    END as "job_bids",
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename='drivers' AND schemaname='public') 
        THEN '✓' ELSE '✗' 
    END as "drivers",
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename='vehicles' AND schemaname='public') 
        THEN '✓' ELSE '✗' 
    END as "vehicles";

-- ============================================
-- 8. CHECK FOR EXPECTED COLUMNS IN job_bids
-- ============================================
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='job_bids' AND column_name='status' AND table_schema='public'
        ) THEN '✓' ELSE '✗' 
    END as "job_bids.status",
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='job_bids' AND column_name='quote_amount' AND table_schema='public'
        ) THEN '✓' ELSE '✗' 
    END as "job_bids.quote_amount",
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='job_bids' AND column_name='bidder_company_id' AND table_schema='public'
        ) THEN '✓' ELSE '✗' 
    END as "job_bids.bidder_company_id",
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='job_bids' AND column_name='job_id' AND table_schema='public'
        ) THEN '✓' ELSE '✗' 
    END as "job_bids.job_id";

-- ============================================
-- 9. ROW COUNTS (DATA VERIFICATION)
-- ============================================
SELECT 
    'companies' as "Table",
    COUNT(*) as "Row Count"
FROM companies
UNION ALL
SELECT 'jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'job_bids', COUNT(*) FROM job_bids
UNION ALL
SELECT 'drivers', COUNT(*) FROM drivers
UNION ALL
SELECT 'vehicles', COUNT(*) FROM vehicles
ORDER BY "Table";

-- ============================================
-- 10. CHECK AUTH TABLES
-- ============================================
-- Note: auth.users is in the auth schema, not public
SELECT 
    COUNT(*) as "Total Users"
FROM auth.users;

-- ============================================
-- EXPECTED OUTPUT SUMMARY
-- ============================================
-- After running these queries, you should see:
-- 1. List of all tables in public schema
-- 2. All columns with their types
-- 3. RLS status for each table (should be enabled)
-- 4. List of policies (should exist for data isolation)
-- 5. Indexes for performance
-- 6. Foreign key relationships
-- 7. Critical table existence check (all ✓)
-- 8. Critical column existence check (all ✓)
-- 9. Row counts (should have data if app is in use)
-- 10. User count (should match registered users)

-- If any critical checks show ✗, see migration scripts in this directory
-- for how to add the missing schema elements.

-- XDrive Logistics - Jobs Table Verification Script
-- Run this in your Supabase SQL Editor to verify jobs table configuration
-- Generated: 2026-02-18

-- ============================================
-- 1. VERIFY ENUM CONTAINS OPEN
-- ============================================
-- Check that job_status enum includes the OPEN status value
SELECT e.enumlabel
FROM pg_type t
JOIN pg_enum e ON e.enumtypid = t.oid
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname='public' AND t.typname='job_status'
ORDER BY e.enumsortorder;

-- ============================================
-- 2. VERIFY DEFAULT ON JOBS.STATUS
-- ============================================
-- Verify that jobs.status column has the correct default value
SELECT column_default, data_type, udt_name
FROM information_schema.columns
WHERE table_schema='public' AND table_name='jobs' AND column_name='status';

-- ============================================
-- 3. VERIFY POLICY EXISTS
-- ============================================
-- List all RLS policies for the jobs table
-- Note: The correct column name is 'policyname', not 'polname'
SELECT policyname
FROM pg_policies
WHERE schemaname='public' AND tablename='jobs'
ORDER BY policyname;

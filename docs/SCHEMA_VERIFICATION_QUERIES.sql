-- ============================================================
-- docs/SCHEMA_VERIFICATION_QUERIES.sql
--
-- Run these queries in Supabase SQL Editor (Role: postgres)
-- to verify the schema is consistent.
-- ============================================================

-- ── 1.1  profiles columns + primary key ───────────────────

-- Must return: user_id | uuid  (NOT id | uuid)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'profiles'
ORDER BY ordinal_position;

-- Must return: user_id
SELECT kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema  = 'public'
  AND tc.table_name    = 'profiles'
  AND tc.constraint_type = 'PRIMARY KEY';

-- ── 1.2  job_bids → profiles FK must point to user_id ─────

-- Must return: user_id
SELECT ccu.column_name AS referenced_column
FROM information_schema.referential_constraints rc
JOIN information_schema.constraint_column_usage ccu
  ON rc.unique_constraint_name = ccu.constraint_name
JOIN information_schema.key_column_usage kcu
  ON rc.constraint_name = kcu.constraint_name
WHERE kcu.table_schema = 'public'
  AND kcu.table_name   = 'job_bids'
  AND kcu.column_name  = 'bidder_id';

-- ── 1.3  jobs → profiles FK must point to user_id ─────────

-- Must return: user_id for both posted_by_user_id and driver_id
SELECT kcu.column_name AS fk_column, ccu.column_name AS referenced_column
FROM information_schema.referential_constraints rc
JOIN information_schema.key_column_usage kcu
  ON rc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON rc.unique_constraint_name = ccu.constraint_name
WHERE kcu.table_schema = 'public'
  AND kcu.table_name   = 'jobs'
  AND kcu.column_name  IN ('posted_by_user_id', 'driver_id')
ORDER BY kcu.column_name;

-- ── 1.4  invoices → profiles FK must point to user_id ─────

-- Must return: user_id
SELECT kcu.column_name AS fk_column, ccu.column_name AS referenced_column
FROM information_schema.referential_constraints rc
JOIN information_schema.key_column_usage kcu
  ON rc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON rc.unique_constraint_name = ccu.constraint_name
WHERE kcu.table_schema = 'public'
  AND kcu.table_name   = 'invoices'
  AND kcu.column_name  = 'created_by_id';

-- ── 1.5  job_bids columns (check for amount_gbp + bid_price_gbp) ──

SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'job_bids'
ORDER BY ordinal_position;

-- ── 1.6  Check constraints on job_bids.status ─────────────

-- Must return: status values include 'submitted' (not 'pending')
SELECT cc.check_clause
FROM information_schema.check_constraints cc
JOIN information_schema.table_constraints tc
  ON cc.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name   = 'job_bids'
  AND tc.constraint_type = 'CHECK';

-- ── 1.7  Confirm no ambiguous FK relationships ─────────────

-- PostgREST flags "ambiguous relationship" when two tables have
-- more than one FK path between them. Check for duplicate paths:
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name  AS referenced_table,
  ccu.column_name AS referenced_column,
  tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema    = 'public'
  AND tc.table_name IN ('job_bids', 'jobs', 'profiles', 'invoices')
ORDER BY tc.table_name, kcu.column_name;

-- ── 1.8  Row-count sanity check ───────────────────────────

SELECT
  (SELECT COUNT(*) FROM public.profiles)  AS profiles,
  (SELECT COUNT(*) FROM public.jobs)      AS jobs,
  (SELECT COUNT(*) FROM public.job_bids)  AS job_bids,
  (SELECT COUNT(*) FROM public.companies) AS companies;

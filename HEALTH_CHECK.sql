-- ============================================================
-- XDrive Logistics LTD — DATABASE HEALTH CHECK
-- Run this in Supabase SQL Editor to identify issues.
-- It only reads data; it does NOT modify anything.
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. MISSING TABLES
-- ─────────────────────────────────────────────
SELECT 'MISSING TABLE' AS issue,
       t.expected_table AS detail
FROM (VALUES
  ('profiles'),
  ('companies'),
  ('company_memberships'),
  ('user_settings'),
  ('user_roles'),
  ('drivers'),
  ('vehicles'),
  ('jobs'),
  ('job_bids'),
  ('job_status_events'),
  ('job_tracking_events'),
  ('job_evidence'),
  ('job_pod'),
  ('proof_of_delivery'),
  ('job_documents'),
  ('job_notes'),
  ('invoices'),
  ('driver_locations')
) AS t(expected_table)
WHERE NOT EXISTS (
  SELECT 1
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name = t.expected_table
)
ORDER BY t.expected_table;

-- ─────────────────────────────────────────────
-- 2. MISSING COLUMNS ON EXISTING TABLES
-- ─────────────────────────────────────────────
SELECT 'MISSING COLUMN' AS issue,
       c.tbl || '.' || c.col AS detail
FROM (VALUES
  -- profiles
  ('profiles',            'id'),
  ('profiles',            'email'),
  ('profiles',            'full_name'),
  ('profiles',            'company_id'),
  ('profiles',            'role'),
  ('profiles',            'created_at'),
  -- companies
  ('companies',           'id'),
  ('companies',           'name'),
  ('companies',           'email'),
  ('companies',           'phone'),
  ('companies',           'vat_number'),
  ('companies',           'company_number'),
  ('companies',           'address_line1'),
  ('companies',           'address_line2'),
  ('companies',           'city'),
  ('companies',           'postcode'),
  ('companies',           'country'),
  ('companies',           'created_by'),
  ('companies',           'created_at'),
  ('companies',           'updated_at'),
  ('companies',           'company_type'),   -- used in queries; missing causes errors
  -- company_memberships
  ('company_memberships', 'id'),
  ('company_memberships', 'company_id'),
  ('company_memberships', 'user_id'),
  ('company_memberships', 'role_in_company'),
  ('company_memberships', 'status'),
  ('company_memberships', 'created_at'),
  -- drivers
  ('drivers',             'id'),
  ('drivers',             'company_id'),
  ('drivers',             'full_name'),
  ('drivers',             'phone'),
  ('drivers',             'email'),
  ('drivers',             'license_number'),
  ('drivers',             'is_active'),
  ('drivers',             'created_at'),
  -- vehicles
  ('vehicles',            'id'),
  ('vehicles',            'company_id'),
  ('vehicles',            'vehicle_type'),
  ('vehicles',            'registration'),
  ('vehicles',            'make'),
  ('vehicles',            'model'),
  ('vehicles',            'is_available'),
  ('vehicles',            'created_at'),
  -- jobs
  ('jobs',                'id'),
  ('jobs',                'posted_by_company_id'),
  ('jobs',                'status'),
  ('jobs',                'current_status'),
  ('jobs',                'pickup_location'),
  ('jobs',                'delivery_location'),
  ('jobs',                'pickup_datetime'),
  ('jobs',                'delivery_datetime'),
  ('jobs',                'pickup_address_line1'),
  ('jobs',                'pickup_postcode'),
  ('jobs',                'pickup_city'),
  ('jobs',                'delivery_address_line1'),
  ('jobs',                'delivery_postcode'),
  ('jobs',                'delivery_city'),
  ('jobs',                'vehicle_type'),
  ('jobs',                'cargo_type'),
  ('jobs',                'pallets'),
  ('jobs',                'boxes'),
  ('jobs',                'bags'),
  ('jobs',                'items'),
  ('jobs',                'weight_kg'),
  ('jobs',                'budget'),
  ('jobs',                'load_details'),
  ('jobs',                'load_notes'),
  ('jobs',                'distance_miles'),
  ('jobs',                'assigned_company_id'),
  ('jobs',                'driver_id'),
  ('jobs',                'load_id'),
  ('jobs',                'your_ref'),
  ('jobs',                'cust_ref'),
  ('jobs',                'vehicle_ref'),
  ('jobs',                'agreed_rate'),
  ('jobs',                'payment_terms'),
  ('jobs',                'smartpay_enabled'),
  ('jobs',                'booked_by_company_name'),
  ('jobs',                'booked_by_company_ref'),
  ('jobs',                'booked_by_company_phone'),
  ('jobs',                'booked_by_company_email'),
  ('jobs',                'completed_by_name'),
  ('jobs',                'completed_at'),
  ('jobs',                'pod_required'),
  ('jobs',                'has_pickup_evidence'),
  ('jobs',                'has_delivery_evidence'),
  ('jobs',                'pod_generated'),
  -- Extra columns used by loads/[id] page
  ('jobs',                'dimensions'),
  ('jobs',                'requested_vehicle_type'),
  ('jobs',                'booked_by_phone'),
  -- Extra columns used by loads/page (tab filtering + distance calc)
  ('jobs',                'load_type'),
  ('jobs',                'pickup_lat'),
  ('jobs',                'pickup_lng'),
  ('jobs',                'delivery_lat'),
  ('jobs',                'delivery_lng'),
  -- job_bids — code uses bidder_id and amount_gbp
  ('job_bids',            'id'),
  ('job_bids',            'job_id'),
  ('job_bids',            'bidder_id'),      -- code column (schema uses bidder_user_id)
  ('job_bids',            'amount_gbp'),     -- code column (schema uses quote_amount)
  ('job_bids',            'message'),
  ('job_bids',            'status'),
  ('job_bids',            'created_at'),
  -- job_tracking_events
  ('job_tracking_events', 'id'),
  ('job_tracking_events', 'job_id'),
  ('job_tracking_events', 'event_type'),
  ('job_tracking_events', 'event_time'),
  ('job_tracking_events', 'user_name'),
  ('job_tracking_events', 'notes'),
  ('job_tracking_events', 'created_at'),
  -- job_documents
  ('job_documents',       'id'),
  ('job_documents',       'job_id'),
  ('job_documents',       'document_type'),
  ('job_documents',       'document_url'),
  ('job_documents',       'document_name'),
  ('job_documents',       'created_at'),
  -- job_notes
  ('job_notes',           'id'),
  ('job_notes',           'job_id'),
  ('job_notes',           'note_type'),
  ('job_notes',           'note_text'),
  ('job_notes',           'is_internal'),
  ('job_notes',           'created_by_name'),
  ('job_notes',           'created_at'),
  -- proof_of_delivery
  ('proof_of_delivery',   'id'),
  ('proof_of_delivery',   'job_id'),
  ('proof_of_delivery',   'delivered_on'),
  ('proof_of_delivery',   'received_by'),
  ('proof_of_delivery',   'left_at'),
  ('proof_of_delivery',   'no_of_items'),
  ('proof_of_delivery',   'delivery_status'),
  ('proof_of_delivery',   'delivery_notes'),
  ('proof_of_delivery',   'created_at'),
  -- invoices
  ('invoices',            'id'),
  ('invoices',            'company_id'),
  ('invoices',            'invoice_number'),
  ('invoices',            'job_id'),
  ('invoices',            'customer_name'),
  ('invoices',            'customer_email'),
  ('invoices',            'amount'),
  ('invoices',            'vat_amount'),
  ('invoices',            'status'),
  ('invoices',            'issue_date'),
  ('invoices',            'due_date'),
  ('invoices',            'created_at'),
  -- driver_locations
  ('driver_locations',    'driver_id'),
  ('driver_locations',    'lat'),
  ('driver_locations',    'lng'),
  ('driver_locations',    'updated_at')
) AS c(tbl, col)
WHERE EXISTS (
  SELECT 1
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name = c.tbl
)
AND NOT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name  = c.tbl
    AND column_name = c.col
)
ORDER BY c.tbl, c.col;

-- ─────────────────────────────────────────────
-- 3. UNIQUE CONSTRAINT: company_memberships(company_id, user_id)
-- ─────────────────────────────────────────────
SELECT CASE
  WHEN EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
     AND tc.constraint_schema = ccu.constraint_schema
    WHERE tc.table_schema      = 'public'
      AND tc.table_name        = 'company_memberships'
      AND tc.constraint_type   = 'UNIQUE'
      AND ccu.column_name      = 'company_id'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
     AND tc.constraint_schema = ccu.constraint_schema
    WHERE tc.table_schema      = 'public'
      AND tc.table_name        = 'company_memberships'
      AND tc.constraint_type   = 'UNIQUE'
      AND ccu.column_name      = 'user_id'
  )
  THEN 'OK — UNIQUE(company_id, user_id) exists'
  ELSE 'MISSING UNIQUE constraint on company_memberships(company_id, user_id)'
END AS unique_constraint_check;

-- ─────────────────────────────────────────────
-- 4. NOT NULL columns that block current code inserts
--    (job_bids.bidder_user_id, bidder_company_id, quote_amount)
-- ─────────────────────────────────────────────
SELECT 'NOT NULL BLOCKER' AS issue,
       'job_bids.' || column_name || ' is NOT NULL but code inserts use different column names' AS detail
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'job_bids'
  AND column_name  IN ('bidder_user_id', 'bidder_company_id', 'quote_amount')
  AND is_nullable  = 'NO';

-- ─────────────────────────────────────────────
-- 5. JOB_BIDS FK check: job_bids.job_id → jobs.id
-- ─────────────────────────────────────────────
SELECT CASE
  WHEN EXISTS (
    SELECT 1
    FROM information_schema.referential_constraints rc
    JOIN information_schema.key_column_usage kcu
      ON rc.constraint_name = kcu.constraint_name
     AND rc.constraint_schema = kcu.constraint_schema
    WHERE kcu.table_schema  = 'public'
      AND kcu.table_name    = 'job_bids'
      AND kcu.column_name   = 'job_id'
  )
  THEN 'OK — job_bids.job_id FK exists'
  ELSE 'MISSING FK: job_bids.job_id → jobs.id'
END AS fk_job_bids_job_id;

-- ─────────────────────────────────────────────
-- 6. SUMMARY ROW COUNT
-- ─────────────────────────────────────────────
SELECT tablename,
       (xpath('/row/c/text()',
              query_to_xml('SELECT count(*) AS c FROM public.' || quote_ident(tablename), false, false, ''))
       )[1]::text::int AS row_count
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'companies', 'company_memberships',
    'drivers', 'vehicles',
    'jobs', 'job_bids', 'job_notes', 'job_documents',
    'job_tracking_events', 'job_status_events',
    'job_evidence', 'job_pod', 'proof_of_delivery',
    'invoices', 'driver_locations'
  )
ORDER BY tablename;

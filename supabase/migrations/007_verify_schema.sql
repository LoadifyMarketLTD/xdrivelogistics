-- Verification: checks for missing tables, columns, enums, functions, triggers, RLS, and policies.
-- Read-only. Safe to run at any time.

WITH

-- ── Missing tables ───────────────────────────────────────────
expected_tables(tbl) AS (
  SELECT unnest(ARRAY[
    'profiles','companies','company_memberships','drivers','vehicles',
    'driver_documents','vehicle_documents','jobs','job_notes','job_documents',
    'job_tracking_events','job_bids','driver_locations','job_driver_distance_cache',
    'quotes','diary_events','return_journeys'
  ])
),
missing_tables AS (
  SELECT 'MISSING TABLE' AS category, tbl AS object_name, '' AS detail
  FROM expected_tables
  WHERE tbl NOT IN (
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  )
),

-- ── Missing columns ─────────────────────────────────────────
expected_cols(tbl, col) AS (
  SELECT * FROM (VALUES
    ('profiles','id'), ('profiles','full_name'), ('profiles','phone'),
    ('profiles','is_driver'), ('profiles','created_at'), ('profiles','updated_at'),
    ('companies','id'), ('companies','name'), ('companies','address_line1'),
    ('companies','address_line2'), ('companies','city'), ('companies','postcode'),
    ('companies','country'), ('companies','created_by'), ('companies','created_at'),
    ('company_memberships','id'), ('company_memberships','company_id'),
    ('company_memberships','user_id'), ('company_memberships','invited_email'),
    ('company_memberships','role_in_company'), ('company_memberships','status'),
    ('company_memberships','created_at'), ('company_memberships','updated_at'),
    ('drivers','id'), ('drivers','company_id'), ('drivers','user_id'),
    ('drivers','display_name'), ('drivers','phone'), ('drivers','email'),
    ('drivers','status'), ('drivers','created_at'),
    ('vehicles','id'), ('vehicles','company_id'), ('vehicles','assigned_driver_id'),
    ('vehicles','type'), ('vehicles','reg_plate'), ('vehicles','make'),
    ('vehicles','model'), ('vehicles','payload_kg'), ('vehicles','pallets_capacity'),
    ('vehicles','has_tail_lift'), ('vehicles','has_straps'), ('vehicles','has_blankets'),
    ('vehicles','created_at'),
    ('driver_documents','id'), ('driver_documents','driver_id'), ('driver_documents','doc_type'),
    ('driver_documents','file_path'), ('driver_documents','issued_date'),
    ('driver_documents','expiry_date'), ('driver_documents','status'),
    ('driver_documents','rejection_reason'), ('driver_documents','verified_by'),
    ('driver_documents','verified_at'), ('driver_documents','created_at'),
    ('vehicle_documents','id'), ('vehicle_documents','vehicle_id'), ('vehicle_documents','doc_type'),
    ('vehicle_documents','file_path'), ('vehicle_documents','issued_date'),
    ('vehicle_documents','expiry_date'), ('vehicle_documents','status'),
    ('vehicle_documents','rejection_reason'), ('vehicle_documents','verified_by'),
    ('vehicle_documents','verified_at'), ('vehicle_documents','created_at'),
    ('jobs','id'), ('jobs','company_id'), ('jobs','created_by'), ('jobs','status'),
    ('jobs','vehicle_type'), ('jobs','cargo_type'), ('jobs','pickup_location'),
    ('jobs','pickup_postcode'), ('jobs','pickup_lat'), ('jobs','pickup_lng'),
    ('jobs','pickup_datetime'), ('jobs','delivery_location'), ('jobs','delivery_postcode'),
    ('jobs','delivery_lat'), ('jobs','delivery_lng'), ('jobs','delivery_datetime'),
    ('jobs','weight_kg'), ('jobs','currency'), ('jobs','budget_amount'),
    ('jobs','is_fixed_price'), ('jobs','load_details'), ('jobs','is_return_journey'),
    ('jobs','customer_ref'), ('jobs','price'), ('jobs','created_at'), ('jobs','updated_at'),
    ('job_notes','id'), ('job_notes','job_id'), ('job_notes','created_by'),
    ('job_notes','note'), ('job_notes','is_internal'), ('job_notes','created_at'),
    ('job_documents','id'), ('job_documents','job_id'), ('job_documents','uploaded_by'),
    ('job_documents','doc_type'), ('job_documents','file_path'), ('job_documents','created_at'),
    ('job_tracking_events','id'), ('job_tracking_events','job_id'),
    ('job_tracking_events','created_by'), ('job_tracking_events','event_type'),
    ('job_tracking_events','message'), ('job_tracking_events','meta'),
    ('job_tracking_events','created_at'),
    ('job_bids','id'), ('job_bids','job_id'), ('job_bids','company_id'),
    ('job_bids','bidder_user_id'), ('job_bids','bidder_driver_id'),
    ('job_bids','amount'), ('job_bids','currency'), ('job_bids','message'),
    ('job_bids','status'), ('job_bids','created_at'),
    ('driver_locations','id'), ('driver_locations','driver_id'),
    ('driver_locations','lat'), ('driver_locations','lng'),
    ('driver_locations','heading'), ('driver_locations','speed_mph'),
    ('driver_locations','recorded_at'),
    ('job_driver_distance_cache','id'), ('job_driver_distance_cache','job_id'),
    ('job_driver_distance_cache','driver_id'), ('job_driver_distance_cache','miles_to_pickup'),
    ('job_driver_distance_cache','minutes_to_pickup'), ('job_driver_distance_cache','computed_at'),
    ('quotes','id'), ('quotes','company_id'), ('quotes','created_by'),
    ('quotes','customer_name'), ('quotes','customer_email'), ('quotes','customer_phone'),
    ('quotes','pickup_location'), ('quotes','delivery_location'),
    ('quotes','vehicle_type'), ('quotes','cargo_type'),
    ('quotes','amount'), ('quotes','currency'), ('quotes','status'), ('quotes','created_at'),
    ('diary_events','id'), ('diary_events','company_id'), ('diary_events','driver_id'),
    ('diary_events','vehicle_id'), ('diary_events','title'), ('diary_events','start_at'),
    ('diary_events','end_at'), ('diary_events','meta'), ('diary_events','created_at'),
    ('return_journeys','id'), ('return_journeys','company_id'), ('return_journeys','driver_id'),
    ('return_journeys','vehicle_type'), ('return_journeys','from_postcode'),
    ('return_journeys','to_postcode'), ('return_journeys','available_from'),
    ('return_journeys','available_to'), ('return_journeys','notes'),
    ('return_journeys','created_at')
  ) AS t(tbl, col)
),
missing_columns AS (
  SELECT 'MISSING COLUMN' AS category, ec.tbl AS object_name, ec.col AS detail
  FROM expected_cols ec
  WHERE EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = ec.tbl AND table_type = 'BASE TABLE'
  )
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ec.tbl AND column_name = ec.col
  )
),

-- ── Missing enums ────────────────────────────────────────────
expected_enums(ename) AS (
  SELECT unnest(ARRAY[
    'company_role','membership_status','doc_status','job_status',
    'cargo_type','vehicle_type','tracking_event_type'
  ])
),
missing_enums AS (
  SELECT 'MISSING ENUM' AS category, ename AS object_name, '' AS detail
  FROM expected_enums
  WHERE ename NOT IN (
    SELECT typname FROM pg_type
    WHERE typnamespace = 'public'::regnamespace AND typtype = 'e'
  )
),

-- ── Missing functions ────────────────────────────────────────
expected_funcs(fname) AS (
  SELECT unnest(ARRAY['is_company_member','is_company_admin','sync_job_bid_price'])
),
missing_funcs AS (
  SELECT 'MISSING FUNCTION' AS category, fname AS object_name, '' AS detail
  FROM expected_funcs
  WHERE fname NOT IN (
    SELECT routine_name FROM information_schema.routines
    WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
  )
),

-- ── Missing triggers ─────────────────────────────────────────
missing_triggers AS (
  SELECT 'MISSING TRIGGER' AS category, 'trg_sync_job_bid_price' AS object_name, '' AS detail
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_sync_job_bid_price'
  )
),

-- ── RLS disabled ─────────────────────────────────────────────
rls_off AS (
  SELECT 'RLS DISABLED' AS category, relname::text AS object_name, '' AS detail
  FROM pg_class
  WHERE relnamespace = 'public'::regnamespace
    AND relkind = 'r'
    AND NOT relrowsecurity
    AND relname IN (
      'profiles','companies','company_memberships','drivers','vehicles',
      'driver_documents','vehicle_documents','jobs','job_notes','job_documents',
      'job_tracking_events','job_bids','driver_locations',
      'job_driver_distance_cache','quotes','diary_events','return_journeys'
    )
),

-- ── Missing policies ─────────────────────────────────────────
expected_policies(tbl, pol) AS (
  SELECT * FROM (VALUES
    ('profiles',              'profiles_select_own'),
    ('profiles',              'profiles_update_own'),
    ('companies',             'companies_select_member'),
    ('companies',             'companies_insert_admin'),
    ('companies',             'companies_update_admin'),
    ('company_memberships',   'memberships_select_member'),
    ('company_memberships',   'memberships_insert_admin'),
    ('company_memberships',   'memberships_update_admin'),
    ('drivers',               'drivers_select_member'),
    ('drivers',               'drivers_all_admin'),
    ('vehicles',              'vehicles_select_member'),
    ('vehicles',              'vehicles_all_admin'),
    ('jobs',                  'jobs_all_member'),
    ('job_bids',              'bids_all_member'),
    ('quotes',                'quotes_all_member')
  ) AS p(tbl, pol)
),
missing_policies AS (
  SELECT 'MISSING POLICY' AS category, ep.tbl AS object_name, ep.pol AS detail
  FROM expected_policies ep
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = ep.tbl AND policyname = ep.pol AND schemaname = 'public'
  )
)

SELECT category, object_name, detail FROM missing_tables
UNION ALL SELECT category, object_name, detail FROM missing_columns
UNION ALL SELECT category, object_name, detail FROM missing_enums
UNION ALL SELECT category, object_name, detail FROM missing_funcs
UNION ALL SELECT category, object_name, detail FROM missing_triggers
UNION ALL SELECT category, object_name, detail FROM rls_off
UNION ALL SELECT category, object_name, detail FROM missing_policies
ORDER BY category, object_name, detail;

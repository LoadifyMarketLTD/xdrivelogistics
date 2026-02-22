-- Health check: reports missing tables, columns, constraints, and RLS status.
-- Read-only. Safe to run at any time.

WITH expected_tables AS (
  SELECT unnest(ARRAY[
    'profiles','companies','company_memberships','drivers','vehicles',
    'driver_documents','vehicle_documents','jobs','job_documents','job_notes',
    'job_tracking_events','job_bids','driver_locations','job_driver_distance_cache',
    'quotes','diary_events','return_journeys'
  ]) AS tbl
),
missing_tables AS (
  SELECT 'MISSING TABLE' AS issue_type, tbl AS detail
  FROM expected_tables
  WHERE tbl NOT IN (
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  )
),
expected_columns AS (
  SELECT * FROM (VALUES
    ('profiles',               'id'),
    ('profiles',               'full_name'),
    ('profiles',               'phone'),
    ('profiles',               'is_driver'),
    ('profiles',               'created_at'),
    ('profiles',               'updated_at'),
    ('companies',              'id'),
    ('companies',              'name'),
    ('companies',              'company_number'),
    ('companies',              'vat_number'),
    ('companies',              'email'),
    ('companies',              'phone'),
    ('companies',              'address_line1'),
    ('companies',              'address_line2'),
    ('companies',              'city'),
    ('companies',              'postcode'),
    ('companies',              'country'),
    ('companies',              'created_by'),
    ('companies',              'created_at'),
    ('company_memberships',    'id'),
    ('company_memberships',    'company_id'),
    ('company_memberships',    'user_id'),
    ('company_memberships',    'invited_email'),
    ('company_memberships',    'role_in_company'),
    ('company_memberships',    'status'),
    ('company_memberships',    'created_at'),
    ('company_memberships',    'updated_at'),
    ('drivers',                'id'),
    ('drivers',                'company_id'),
    ('drivers',                'user_id'),
    ('drivers',                'display_name'),
    ('drivers',                'phone'),
    ('drivers',                'email'),
    ('drivers',                'status'),
    ('drivers',                'created_at'),
    ('vehicles',               'id'),
    ('vehicles',               'company_id'),
    ('vehicles',               'assigned_driver_id'),
    ('vehicles',               'type'),
    ('vehicles',               'reg_plate'),
    ('vehicles',               'make'),
    ('vehicles',               'model'),
    ('vehicles',               'payload_kg'),
    ('vehicles',               'pallets_capacity'),
    ('vehicles',               'has_tail_lift'),
    ('vehicles',               'has_straps'),
    ('vehicles',               'has_blankets'),
    ('vehicles',               'created_at'),
    ('driver_documents',       'id'),
    ('driver_documents',       'driver_id'),
    ('driver_documents',       'doc_type'),
    ('driver_documents',       'file_path'),
    ('driver_documents',       'issued_date'),
    ('driver_documents',       'expiry_date'),
    ('driver_documents',       'status'),
    ('driver_documents',       'rejection_reason'),
    ('driver_documents',       'verified_by'),
    ('driver_documents',       'verified_at'),
    ('driver_documents',       'created_at'),
    ('vehicle_documents',      'id'),
    ('vehicle_documents',      'vehicle_id'),
    ('vehicle_documents',      'doc_type'),
    ('vehicle_documents',      'file_path'),
    ('vehicle_documents',      'issued_date'),
    ('vehicle_documents',      'expiry_date'),
    ('vehicle_documents',      'status'),
    ('vehicle_documents',      'rejection_reason'),
    ('vehicle_documents',      'verified_by'),
    ('vehicle_documents',      'verified_at'),
    ('vehicle_documents',      'created_at'),
    ('jobs',                   'id'),
    ('jobs',                   'company_id'),
    ('jobs',                   'created_by'),
    ('jobs',                   'status'),
    ('jobs',                   'vehicle_type'),
    ('jobs',                   'cargo_type'),
    ('jobs',                   'pickup_location'),
    ('jobs',                   'pickup_postcode'),
    ('jobs',                   'pickup_lat'),
    ('jobs',                   'pickup_lng'),
    ('jobs',                   'pickup_datetime'),
    ('jobs',                   'delivery_location'),
    ('jobs',                   'delivery_postcode'),
    ('jobs',                   'delivery_lat'),
    ('jobs',                   'delivery_lng'),
    ('jobs',                   'delivery_datetime'),
    ('jobs',                   'weight_kg'),
    ('jobs',                   'currency'),
    ('jobs',                   'budget_amount'),
    ('jobs',                   'is_fixed_price'),
    ('jobs',                   'load_details'),
    ('jobs',                   'created_at'),
    ('jobs',                   'updated_at'),
    ('job_documents',          'id'),
    ('job_documents',          'job_id'),
    ('job_documents',          'uploaded_by'),
    ('job_documents',          'doc_type'),
    ('job_documents',          'file_path'),
    ('job_documents',          'created_at'),
    ('job_tracking_events',    'id'),
    ('job_tracking_events',    'job_id'),
    ('job_tracking_events',    'created_by'),
    ('job_tracking_events',    'event_type'),
    ('job_tracking_events',    'message'),
    ('job_tracking_events',    'meta'),
    ('job_tracking_events',    'created_at'),
    ('job_bids',               'id'),
    ('job_bids',               'job_id'),
    ('job_bids',               'company_id'),
    ('job_bids',               'bidder_user_id'),
    ('job_bids',               'bidder_driver_id'),
    ('job_bids',               'amount'),
    ('job_bids',               'currency'),
    ('job_bids',               'message'),
    ('job_bids',               'status'),
    ('job_bids',               'created_at'),
    ('driver_locations',       'id'),
    ('driver_locations',       'driver_id'),
    ('driver_locations',       'lat'),
    ('driver_locations',       'lng'),
    ('driver_locations',       'heading'),
    ('driver_locations',       'speed_mph'),
    ('driver_locations',       'recorded_at'),
    ('job_driver_distance_cache','id'),
    ('job_driver_distance_cache','job_id'),
    ('job_driver_distance_cache','driver_id'),
    ('job_driver_distance_cache','miles_to_pickup'),
    ('job_driver_distance_cache','minutes_to_pickup'),
    ('job_driver_distance_cache','computed_at'),
    ('quotes',                 'id'),
    ('quotes',                 'company_id'),
    ('quotes',                 'created_by'),
    ('quotes',                 'customer_name'),
    ('quotes',                 'customer_email'),
    ('quotes',                 'customer_phone'),
    ('quotes',                 'pickup_location'),
    ('quotes',                 'delivery_location'),
    ('quotes',                 'vehicle_type'),
    ('quotes',                 'cargo_type'),
    ('quotes',                 'amount'),
    ('quotes',                 'currency'),
    ('quotes',                 'status'),
    ('quotes',                 'created_at'),
    ('diary_events',           'id'),
    ('diary_events',           'company_id'),
    ('diary_events',           'driver_id'),
    ('diary_events',           'vehicle_id'),
    ('diary_events',           'title'),
    ('diary_events',           'start_at'),
    ('diary_events',           'end_at'),
    ('diary_events',           'meta'),
    ('diary_events',           'created_at'),
    ('return_journeys',        'id'),
    ('return_journeys',        'company_id'),
    ('return_journeys',        'driver_id'),
    ('return_journeys',        'vehicle_type'),
    ('return_journeys',        'from_postcode'),
    ('return_journeys',        'to_postcode'),
    ('return_journeys',        'available_from'),
    ('return_journeys',        'available_to'),
    ('return_journeys',        'notes'),
    ('return_journeys',        'created_at')
  ) AS t(tbl, col)
),
missing_columns AS (
  SELECT 'MISSING COLUMN' AS issue_type,
         ec.tbl || '.' || ec.col AS detail
  FROM expected_columns ec
  WHERE EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = ec.tbl AND table_type = 'BASE TABLE'
  )
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ec.tbl AND column_name = ec.col
  )
),
rls_status AS (
  SELECT 'RLS DISABLED' AS issue_type, relname::text AS detail
  FROM pg_class
  WHERE relnamespace = 'public'::regnamespace
    AND relkind = 'r'
    AND NOT relrowsecurity
    AND relname IN (
      'profiles','companies','company_memberships','drivers','vehicles',
      'driver_documents','vehicle_documents','jobs','job_documents',
      'job_tracking_events','job_bids','driver_locations',
      'job_driver_distance_cache','quotes','diary_events','return_journeys'
    )
),
missing_constraints AS (
  SELECT 'MISSING UNIQUE CONSTRAINT' AS issue_type,
         detail
  FROM (VALUES
    ('company_memberships(company_id,user_id)'),
    ('company_memberships(company_id,invited_email)'),
    ('job_driver_distance_cache(job_id,driver_id)')
  ) AS c(detail)
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.constraint_type = 'UNIQUE'
      AND tc.table_name = split_part(c.detail, '(', 1)
  )
)
SELECT issue_type, detail FROM missing_tables
UNION ALL
SELECT issue_type, detail FROM missing_columns
UNION ALL
SELECT issue_type, detail FROM rls_status
UNION ALL
SELECT issue_type, detail FROM missing_constraints
ORDER BY issue_type, detail;

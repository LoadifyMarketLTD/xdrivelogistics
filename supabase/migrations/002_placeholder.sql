-- Migration 002: Health Check
-- Verifies that the expected tables exist.

SELECT
  table_name,
  CASE WHEN table_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END AS status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'profiles', 'companies', 'company_memberships', 'drivers', 'vehicles',
    'driver_documents', 'vehicle_documents', 'jobs', 'job_bids',
    'job_notes', 'job_tracking_events', 'driver_locations', 'quotes',
    'return_journeys', 'diary_events'
  )
ORDER BY table_name;

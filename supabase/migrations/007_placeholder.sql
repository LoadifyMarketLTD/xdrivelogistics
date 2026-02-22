-- Migration 007: Verify Schema
-- Reports on all expected columns for key tables.

SELECT
  c.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND c.table_name IN ('jobs', 'quotes', 'drivers', 'vehicles', 'companies', 'profiles')
ORDER BY c.table_name, c.ordinal_position;

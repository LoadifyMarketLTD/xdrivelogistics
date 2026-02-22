-- ============================================================
-- Fix: ensure address columns exist on the companies table
-- and reload the PostgREST schema cache so that inserts
-- referencing address_line1, address_line2, city and postcode
-- no longer fail with "column not found in schema cache".
-- Idempotent — safe to run on any database state.
-- ============================================================

DO $$
BEGIN
  -- ── companies.address_line1 ──────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'companies'
      AND column_name  = 'address_line1'
  ) THEN
    ALTER TABLE public.companies ADD COLUMN address_line1 text;
  END IF;

  -- ── companies.address_line2 ──────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'companies'
      AND column_name  = 'address_line2'
  ) THEN
    ALTER TABLE public.companies ADD COLUMN address_line2 text;
  END IF;

  -- ── companies.city ───────────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'companies'
      AND column_name  = 'city'
  ) THEN
    ALTER TABLE public.companies ADD COLUMN city text;
  END IF;

  -- ── companies.postcode ───────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'companies'
      AND column_name  = 'postcode'
  ) THEN
    ALTER TABLE public.companies ADD COLUMN postcode text;
  END IF;
END
$$;

-- Notify PostgREST to reload its schema cache immediately so
-- the address columns are visible without a server restart.
NOTIFY pgrst, 'reload schema';

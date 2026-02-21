-- ============================================================
-- MIGRATION: Consolidate duplicate functions
-- Purpose:   Several functions existed under two different names
--            with identical logic.  This migration:
--              1. Renames set_updated_at -> update_updated_at_column
--              2. Ensures generate_invoice_number is the canonical
--                 invoice-number trigger function (drops set_invoice_number)
--              3. Ensures current_user_company_id and get_user_company_id
--                 both exist (one delegates to the other)
-- Date: 2026-02-21
-- Safe to run multiple times (idempotent).
-- ============================================================

BEGIN;

-- ----------------------------------------------------------------
-- 1. set_updated_at  →  update_updated_at_column
--    Both do: NEW.updated_at = NOW(); RETURN NEW;
--    update_updated_at_column is the canonical name used by 12+ files.
-- ----------------------------------------------------------------

-- Ensure the canonical function exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Re-point any triggers that still call set_updated_at()
-- by dynamically updating them to call update_updated_at_column() instead.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tgrelid::regclass::text AS tbl, tgname AS trg
    FROM   pg_trigger
    WHERE  tgfoid = (
             SELECT oid FROM pg_proc p
             JOIN   pg_namespace n ON n.oid = p.pronamespace
             WHERE  n.nspname = 'public' AND p.proname = 'set_updated_at'
           )
      AND  NOT tgisinternal
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS %I ON %s; '
      'CREATE TRIGGER %I BEFORE UPDATE ON %s FOR EACH ROW '
      'EXECUTE FUNCTION public.update_updated_at_column();',
      r.trg, r.tbl, r.trg, r.tbl
    );
  END LOOP;
END $$;

-- Drop the old alias once all triggers are re-pointed
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;


-- ----------------------------------------------------------------
-- 2. set_invoice_number()  →  generate_invoice_number()
--    Both generate invoice numbers in INV-YYYY-NNNN format.
--    generate_invoice_number is the canonical name (10+ files).
-- ----------------------------------------------------------------

-- Ensure the canonical function exists
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' OR NEW.invoice_number = 'DRAFT' THEN
    NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-'
                          || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- Re-point any triggers that call set_invoice_number() (the old name)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tgrelid::regclass::text AS tbl, tgname AS trg
    FROM   pg_trigger
    WHERE  tgfoid = (
             SELECT oid FROM pg_proc p
             JOIN   pg_namespace n ON n.oid = p.pronamespace
             WHERE  n.nspname = 'public' AND p.proname = 'set_invoice_number'
           )
      AND  NOT tgisinternal
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS %I ON %s; '
      'CREATE TRIGGER %I BEFORE INSERT ON %s FOR EACH ROW '
      'EXECUTE FUNCTION public.generate_invoice_number();',
      r.trg, r.tbl, r.trg, r.tbl
    );
  END LOOP;
END $$;

-- Drop the old alias
DROP FUNCTION IF EXISTS public.set_invoice_number() CASCADE;


-- ----------------------------------------------------------------
-- 3. current_user_company_id  /  get_user_company_id  /  my_company_id
--    All return the current user's company_id from profiles.
--    Keep all three in the DB for compatibility, but make them
--    delegate to one canonical body.
-- ----------------------------------------------------------------

-- Canonical implementation
CREATE OR REPLACE FUNCTION public.current_user_company_id()
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
BEGIN
  RETURN (SELECT company_id FROM public.profiles WHERE id = auth.uid());
END;
$$;

-- Alias 1: get_user_company_id delegates to the canonical function
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
BEGIN
  RETURN public.current_user_company_id();
END;
$$;

-- Alias 2: my_company_id delegates to the canonical function
CREATE OR REPLACE FUNCTION public.my_company_id()
RETURNS UUID LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT public.current_user_company_id();
$$;


COMMIT;

-- ----------------------------------------------------------------
-- VERIFICATION
-- ----------------------------------------------------------------
SELECT proname AS function_name, prosrc AS body_preview
FROM   pg_proc p
JOIN   pg_namespace n ON n.oid = p.pronamespace
WHERE  n.nspname = 'public'
  AND  proname IN (
    'update_updated_at_column',
    'generate_invoice_number',
    'current_user_company_id',
    'get_user_company_id',
    'my_company_id',
    -- These should be gone after the migration:
    'set_updated_at',
    'set_invoice_number'
  )
ORDER BY proname;

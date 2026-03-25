-- ============================================================
-- Fix: ensure seller_profiles table exists and has the
-- sellerStatus column so that queries/policies referencing
-- seller_profiles.sellerStatus no longer throw
-- "column seller_profiles.sellerStatus does not exist".
-- Idempotent — safe to run on any database state.
-- ============================================================

DO $$
BEGIN
  -- ── seller_profiles table ────────────────────────────────
  -- Create the table if a previous migration or manual step
  -- never ran.
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name   = 'seller_profiles'
  ) THEN
    CREATE TABLE public.seller_profiles (
      id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      company_id   uuid REFERENCES public.companies(id) ON DELETE SET NULL,
      "sellerStatus" text DEFAULT 'pending',
      created_at   timestamptz DEFAULT now(),
      updated_at   timestamptz DEFAULT now()
    );
  END IF;

  -- ── seller_profiles.sellerStatus ─────────────────────────
  -- Add the column if the table already existed but the
  -- column was absent.
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'seller_profiles'
      AND column_name  = 'sellerStatus'
  ) THEN
    ALTER TABLE public.seller_profiles
      ADD COLUMN "sellerStatus" text DEFAULT 'pending';
  END IF;
END
$$;

-- Notify PostgREST to reload its schema cache immediately so
-- the new column is visible without a server restart.
NOTIFY pgrst, 'reload schema';

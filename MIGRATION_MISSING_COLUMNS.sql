-- ================================================================
-- XDRIVE LOGISTICS LTD — MIGRARE COLOANE LIPSĂ
-- ================================================================
-- Rulați în: Supabase → SQL Editor → New query → Run
-- (Run in: Supabase → SQL Editor → New query → Run)
--
-- ✅ Idempotent — sigur de rulat de mai multe ori
--    (safe to run multiple times — uses ADD COLUMN IF NOT EXISTS)
--
-- Adaugă coloanele lipsă în tabelele existente:
--   • profiles  — câmpuri onboarding (driver / broker / company)
--   • jobs      — current_status
--   • job_bids  — bidder_id, amount_gbp, status corect
-- ================================================================

-- ────────────────────────────────────────────────────────────
-- 1. PROFILES — câmpuri onboarding lipsă
-- ────────────────────────────────────────────────────────────

-- Relaxăm CHECK-ul de rol ca să permită 'driver', 'broker', 'company'
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('driver','broker','company','admin',
                    'dispatcher','viewer','company_admin'));

-- Nume afișat (separat de full_name)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Țară
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'UK';

-- ── DRIVER ──────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS driver_base_postcode TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS driver_vehicle_type TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS driver_availability TEXT DEFAULT 'Available';

-- ── BROKER / DISPATCHER ─────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS broker_company_name TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS broker_company_postcode TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS broker_payment_terms TEXT;

-- ── COMPANY OWNER ───────────────────────────────────────────
-- (câmpuri în profiles, separate față de tabelul companies)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_name TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_postcode TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_fleet_size INTEGER;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_primary_services TEXT;

-- ────────────────────────────────────────────────────────────
-- 2. JOBS — coloană current_status separată de status
-- ────────────────────────────────────────────────────────────
-- 'status' = stare generală (open | assigned | in_progress | completed | cancelled)
-- 'current_status' = stare detaliată tracking (ALLOCATED | EN_ROUTE | DELIVERED etc.)

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS current_status TEXT;

-- Coloane suplimentare folosite de aplicație (sigur dacă există deja)
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS pickup_location TEXT;

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS delivery_location TEXT;

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS pickup_datetime TIMESTAMPTZ;

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS delivery_datetime TIMESTAMPTZ;

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS posted_by_company_id UUID
    REFERENCES public.companies(id) ON DELETE SET NULL;

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS driver_id UUID
    REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS budget NUMERIC(10,2);

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS distance_miles NUMERIC(10,2);

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS load_id TEXT;

-- ────────────────────────────────────────────────────────────
-- 3. JOB_BIDS — bidder_id, amount_gbp, status corect
-- ────────────────────────────────────────────────────────────

-- Creăm tabelul dacă nu există deloc
CREATE TABLE IF NOT EXISTS public.job_bids (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id     UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  bidder_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_gbp NUMERIC(10,2) NOT NULL,
  message    TEXT,
  status     TEXT NOT NULL DEFAULT 'submitted',
  accepted_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Dacă tabelul există deja, adăugăm coloanele lipsă:

-- bidder_id (poate fi numit diferit în scheme vechi)
DO $$
BEGIN
  -- Redenumim bidder_user_id → bidder_id dacă migrarea veche a rulat
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'job_bids'
      AND column_name = 'bidder_user_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'job_bids'
      AND column_name = 'bidder_id'
  ) THEN
    ALTER TABLE public.job_bids RENAME COLUMN bidder_user_id TO bidder_id;
  END IF;

  -- Adăugăm bidder_id dacă lipsește complet
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'job_bids'
      AND column_name = 'bidder_id'
  ) THEN
    ALTER TABLE public.job_bids ADD COLUMN bidder_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- amount_gbp (poate fi numit quote_amount sau bid_amount în scheme vechi)
DO $$
BEGIN
  -- Redenumim quote_amount → amount_gbp
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'job_bids'
      AND column_name = 'quote_amount'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'job_bids'
      AND column_name = 'amount_gbp'
  ) THEN
    ALTER TABLE public.job_bids RENAME COLUMN quote_amount TO amount_gbp;
  END IF;

  -- Redenumim bid_amount → amount_gbp
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'job_bids'
      AND column_name = 'bid_amount'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'job_bids'
      AND column_name = 'amount_gbp'
  ) THEN
    ALTER TABLE public.job_bids RENAME COLUMN bid_amount TO amount_gbp;
  END IF;

  -- Adăugăm amount_gbp dacă lipsește complet
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'job_bids'
      AND column_name = 'amount_gbp'
  ) THEN
    ALTER TABLE public.job_bids ADD COLUMN amount_gbp NUMERIC(10,2) NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Coloana status cu valori corecte (TEXT, nu ENUM)
DO $$
BEGIN
  -- Adăugăm status dacă lipsește
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'job_bids'
      AND column_name = 'status'
  ) THEN
    ALTER TABLE public.job_bids ADD COLUMN status TEXT NOT NULL DEFAULT 'submitted';
  END IF;
END $$;

-- Eliminăm CHECK-uri vechi pe status (dacă erau definite cu alte valori)
ALTER TABLE public.job_bids
  DROP CONSTRAINT IF EXISTS job_bids_status_check;

-- Adăugăm CHECK cu valorile corecte folosite de aplicație
ALTER TABLE public.job_bids
  ADD CONSTRAINT job_bids_status_check
    CHECK (status IN ('submitted','accepted','rejected','withdrawn','completed'));

-- Coloana updated_at
ALTER TABLE public.job_bids
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Trigger updated_at pe job_bids
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS job_bids_updated_at ON public.job_bids;
CREATE TRIGGER job_bids_updated_at
  BEFORE UPDATE ON public.job_bids
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indecși utili
CREATE INDEX IF NOT EXISTS idx_job_bids_job_id    ON public.job_bids(job_id);
CREATE INDEX IF NOT EXISTS idx_job_bids_bidder_id ON public.job_bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_job_bids_status    ON public.job_bids(status);

-- ────────────────────────────────────────────────────────────
-- 4. RLS — activare + politici de bază (dacă nu există)
-- ────────────────────────────────────────────────────────────

ALTER TABLE public.job_bids ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bids_select" ON public.job_bids;
CREATE POLICY "bids_select" ON public.job_bids
  FOR SELECT USING (
    bidder_id = auth.uid()
    OR job_id IN (
      SELECT id FROM public.jobs
      WHERE posted_by_company_id IN (
        SELECT company_id FROM public.profiles
        WHERE id = auth.uid() AND company_id IS NOT NULL
      )
    )
  );

DROP POLICY IF EXISTS "bids_insert" ON public.job_bids;
CREATE POLICY "bids_insert" ON public.job_bids
  FOR INSERT WITH CHECK (auth.uid() = bidder_id);

DROP POLICY IF EXISTS "bids_update_own" ON public.job_bids;
CREATE POLICY "bids_update_own" ON public.job_bids
  FOR UPDATE USING (
    bidder_id = auth.uid()
    OR job_id IN (
      SELECT id FROM public.jobs
      WHERE posted_by_company_id IN (
        SELECT company_id FROM public.profiles
        WHERE id = auth.uid() AND company_id IS NOT NULL
      )
    )
  );

-- ────────────────────────────────────────────────────────────
-- 5. VERIFICARE — afișează coloanele adăugate
-- ────────────────────────────────────────────────────────────
SELECT
  table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'jobs', 'job_bids')
  AND column_name IN (
    'display_name',
    'driver_base_postcode', 'driver_vehicle_type', 'driver_availability',
    'broker_company_name', 'broker_company_postcode', 'broker_payment_terms',
    'company_name', 'company_postcode', 'company_fleet_size', 'company_primary_services',
    'current_status',
    'bidder_id', 'amount_gbp', 'status'
  )
ORDER BY table_name, column_name;

-- ================================================================
-- ✅ MIGRARE COMPLETĂ
-- Toate coloanele lipsă au fost adăugate.
-- ================================================================

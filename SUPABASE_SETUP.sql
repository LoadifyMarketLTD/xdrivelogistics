-- ================================================================
-- XDRIVE LOGISTICS LTD — SUPABASE DATABASE SETUP  (SETUP COMPLET)
-- ================================================================
-- Folosiți acest fișier dacă baza de date este GOALĂ (nouă).
-- Use this file if your database is EMPTY (brand new).
--
-- ⚡ Pentru a adăuga doar coloanele lipsă la tabele EXISTENTE,
--    folosiți fișierul:  MIGRATION_MISSING_COLUMNS.sql
-- ⚡ To add only missing columns to EXISTING tables,
--    use the file:       MIGRATION_MISSING_COLUMNS.sql
-- ================================================================
-- Copiați tot și rulați în: Supabase → SQL Editor → New query → Run
-- (Copy everything and run in: Supabase → SQL Editor → New query → Run)
--
-- ✅ Idempotent — poate fi rulat de mai multe ori în siguranță
--    (safe to run multiple times — uses IF NOT EXISTS / OR REPLACE)
-- ================================================================
-- Tabele: companies, profiles, drivers, vehicles,
--         jobs, job_bids, invoices
-- Funcții: create_company, handle_new_user
-- Triggere: auto-update updated_at, auto-create profile on signup
-- RLS:  Row-Level Security pentru toate tabelele
-- ================================================================

-- ────────────────────────────────────────────────────────────
-- 0. EXTENSII
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ────────────────────────────────────────────────────────────
-- 1. FUNCȚIE UTILĂ: actualizare automată updated_at
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- 2. COMPANIES  (companii de transport)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.companies (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  email        TEXT,
  phone        TEXT,
  address      TEXT,
  postcode     TEXT,
  city         TEXT,
  country      TEXT DEFAULT 'UK',
  vat_number   TEXT,
  company_number TEXT,
  logo_url     TEXT,
  website      TEXT,
  description  TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS companies_updated_at ON public.companies;
CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ────────────────────────────────────────────────────────────
-- 3. PROFILES  (extinde auth.users 1-la-1)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id   UUID REFERENCES public.companies(id) ON DELETE SET NULL,

  -- Rol (folosit pentru rutare după autentificare)
  role         TEXT NOT NULL DEFAULT 'driver'
                 CHECK (role IN ('driver','broker','company','admin')),

  -- Date personale
  email        TEXT,
  full_name    TEXT,
  display_name TEXT,
  phone        TEXT,
  avatar_url   TEXT,
  country      TEXT DEFAULT 'UK',
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,

  -- ── Câmpuri onboarding DRIVER ────────────────────────────
  driver_base_postcode  TEXT,
  driver_vehicle_type   TEXT,
  driver_availability   TEXT DEFAULT 'Available',

  -- ── Câmpuri onboarding BROKER ────────────────────────────
  broker_company_name     TEXT,
  broker_company_postcode TEXT,
  broker_payment_terms    TEXT,

  -- ── Câmpuri onboarding COMPANY (owner) ───────────────────
  company_name             TEXT,
  company_postcode         TEXT,
  company_fleet_size       INTEGER,
  company_primary_services TEXT,

  -- Timestamps
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role       ON public.profiles(role);

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Creare automată profil la înregistrare nouă ─────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'driver')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- 4. RPC: creare companie (apelat din onboarding)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.create_company(
  company_name TEXT,
  phone        TEXT DEFAULT NULL
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_id UUID;
  uid    UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.companies (name, phone, created_by)
  VALUES (company_name, phone, uid)
  RETURNING id INTO new_id;

  -- Leagă utilizatorul de compania nou-creată
  UPDATE public.profiles
  SET company_id = new_id
  WHERE id = uid;

  RETURN new_id;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- 5. DRIVERS  (șoferi fleet, gestionați de companie)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.drivers (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id     UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name      TEXT NOT NULL,
  license_number TEXT,
  phone          TEXT,
  email          TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drivers_company_id ON public.drivers(company_id);

DROP TRIGGER IF EXISTS drivers_updated_at ON public.drivers;
CREATE TRIGGER drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ────────────────────────────────────────────────────────────
-- 6. VEHICLES  (flota companiei)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vehicles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  registration     TEXT NOT NULL,
  vehicle_type     TEXT,   -- Small Van | Medium Van | Large Van | Luton | 7.5T | HGV etc.
  make             TEXT,
  model            TEXT,
  year             INTEGER,
  colour           TEXT,
  payload_kg       NUMERIC(10,2),
  max_pallets      INTEGER,
  has_tail_lift    BOOLEAN DEFAULT FALSE,
  has_tracking     BOOLEAN DEFAULT FALSE,
  is_available     BOOLEAN NOT NULL DEFAULT TRUE,
  current_status   TEXT DEFAULT 'available',
  current_location TEXT,
  driver_name      TEXT,
  notes            TEXT,
  mot_expiry       DATE,
  tax_expiry       DATE,
  insurance_expiry DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_company_id ON public.vehicles(company_id);

DROP TRIGGER IF EXISTS vehicles_updated_at ON public.vehicles;
CREATE TRIGGER vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ────────────────────────────────────────────────────────────
-- 7. JOBS  (bursa de transport / marketplace)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.jobs (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Cine a postat
  posted_by_company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  posted_by_user_id    UUID REFERENCES public.profiles(id)  ON DELETE SET NULL,

  -- Șofer și vehicul atribuit
  driver_id            UUID REFERENCES public.profiles(id)  ON DELETE SET NULL,
  vehicle_id           UUID REFERENCES public.vehicles(id)  ON DELETE SET NULL,

  -- Stare
  status               TEXT NOT NULL DEFAULT 'open',
                         -- open | assigned | in_progress | completed | cancelled
  current_status       TEXT,  -- status detaliat pentru tracking (ALLOCATED, DELIVERED etc.)

  -- Locații
  pickup_location      TEXT NOT NULL,
  pickup_postcode      TEXT,
  pickup_lat           DOUBLE PRECISION,
  pickup_lng           DOUBLE PRECISION,
  delivery_location    TEXT NOT NULL,
  delivery_postcode    TEXT,
  delivery_lat         DOUBLE PRECISION,
  delivery_lng         DOUBLE PRECISION,
  distance_miles       NUMERIC(10,2),

  -- Programare
  pickup_datetime      TIMESTAMPTZ,
  delivery_datetime    TIMESTAMPTZ,

  -- Detalii marfă
  vehicle_type         TEXT,
  cargo_type           TEXT,
  load_details         TEXT,
  pallets              INTEGER DEFAULT 0,
  boxes                INTEGER DEFAULT 0,
  bags                 INTEGER DEFAULT 0,
  items                INTEGER DEFAULT 0,
  weight_kg            NUMERIC(10,2),

  -- Financiar
  budget               NUMERIC(10,2),   -- buget oferit
  agreed_rate          NUMERIC(10,2),   -- preț acceptat
  currency             TEXT DEFAULT 'GBP',

  -- Referințe
  load_id              TEXT,   -- ID vizibil pentru clienți (ex. XDR-00123)
  your_ref             TEXT,
  cust_ref             TEXT,

  -- POD & evidențe
  pod_required         BOOLEAN DEFAULT TRUE,
  pod_url              TEXT,
  pod_uploaded_at      TIMESTAMPTZ,

  -- Bida acceptată
  accepted_bid_id      UUID,

  -- Timestamps
  assigned_at          TIMESTAMPTZ,
  started_at           TIMESTAMPTZ,
  completed_at         TIMESTAMPTZ,
  cancelled_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_posted_by_company ON public.jobs(posted_by_company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status            ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_driver_id         ON public.jobs(driver_id);

DROP TRIGGER IF EXISTS jobs_updated_at ON public.jobs;
CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ────────────────────────────────────────────────────────────
-- 8. JOB BIDS  (oferte pentru joburi)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.job_bids (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id     UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  bidder_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  amount_gbp NUMERIC(10,2) NOT NULL,
  message    TEXT,
  status     TEXT NOT NULL DEFAULT 'submitted'
               CHECK (status IN ('submitted','accepted','rejected','withdrawn','completed')),
  accepted_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (job_id, bidder_id)
);

CREATE INDEX IF NOT EXISTS idx_job_bids_job_id    ON public.job_bids(job_id);
CREATE INDEX IF NOT EXISTS idx_job_bids_bidder_id ON public.job_bids(bidder_id);

DROP TRIGGER IF EXISTS job_bids_updated_at ON public.job_bids;
CREATE TRIGGER job_bids_updated_at
  BEFORE UPDATE ON public.job_bids
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ────────────────────────────────────────────────────────────
-- 9. INVOICES  (facturi)
-- ────────────────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1001;

CREATE TABLE IF NOT EXISTS public.invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number  TEXT UNIQUE,
  company_id      UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  job_id          UUID REFERENCES public.jobs(id)     ON DELETE SET NULL,

  -- Date client (beneficiar)
  customer_name   TEXT NOT NULL,
  customer_email  TEXT,
  customer_address TEXT,
  customer_vat    TEXT,

  -- Sume
  amount          NUMERIC(10,2) NOT NULL DEFAULT 0,   -- suma fără TVA
  vat_rate        NUMERIC(5,2)  NOT NULL DEFAULT 20,  -- % TVA (20%)
  vat_amount      NUMERIC(10,2) NOT NULL DEFAULT 0,   -- valoare TVA
  currency        TEXT DEFAULT 'GBP',

  -- Stare & date
  status          TEXT NOT NULL DEFAULT 'pending',
                    -- pending | sent | paid | overdue | cancelled
  issue_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date        DATE,
  paid_date       DATE,
  notes           TEXT,
  pdf_url         TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON public.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_job_id     ON public.invoices(job_id);

-- Generare automată număr factură (XDR-01001, XDR-01002 etc.)
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := 'XDR-' || LPAD(nextval('invoice_number_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_invoice_number ON public.invoices;
CREATE TRIGGER trg_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.generate_invoice_number();

DROP TRIGGER IF EXISTS invoices_updated_at ON public.invoices;
CREATE TRIGGER invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ────────────────────────────────────────────────────────────
-- 10. ROW-LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────

-- Activare RLS pe toate tabelele
ALTER TABLE public.companies    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_bids     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices     ENABLE ROW LEVEL SECURITY;

-- ── COMPANIES ───────────────────────────────────────────────
DROP POLICY IF EXISTS "companies_select" ON public.companies;
CREATE POLICY "companies_select" ON public.companies
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "companies_insert" ON public.companies;
CREATE POLICY "companies_insert" ON public.companies
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "companies_update" ON public.companies;
CREATE POLICY "companies_update" ON public.companies
  FOR UPDATE USING (auth.uid() = created_by);

-- ── PROFILES ────────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_select_company" ON public.profiles;
CREATE POLICY "profiles_select_company" ON public.profiles
  FOR SELECT USING (
    company_id IS NOT NULL AND
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ── DRIVERS ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "drivers_company_select" ON public.drivers;
CREATE POLICY "drivers_company_select" ON public.drivers
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid() AND company_id IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "drivers_company_insert" ON public.drivers;
CREATE POLICY "drivers_company_insert" ON public.drivers
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid() AND company_id IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "drivers_company_update" ON public.drivers;
CREATE POLICY "drivers_company_update" ON public.drivers
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid() AND company_id IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "drivers_company_delete" ON public.drivers;
CREATE POLICY "drivers_company_delete" ON public.drivers
  FOR DELETE USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid() AND company_id IS NOT NULL
    )
  );

-- ── VEHICLES ────────────────────────────────────────────────
DROP POLICY IF EXISTS "vehicles_select" ON public.vehicles;
CREATE POLICY "vehicles_select" ON public.vehicles
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "vehicles_company_insert" ON public.vehicles;
CREATE POLICY "vehicles_company_insert" ON public.vehicles
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid() AND company_id IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "vehicles_company_update" ON public.vehicles;
CREATE POLICY "vehicles_company_update" ON public.vehicles
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid() AND company_id IS NOT NULL
    )
  );

-- ── JOBS ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "jobs_select_all" ON public.jobs;
CREATE POLICY "jobs_select_all" ON public.jobs
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "jobs_insert_company" ON public.jobs;
CREATE POLICY "jobs_insert_company" ON public.jobs
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    posted_by_company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid() AND company_id IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "jobs_update_company" ON public.jobs;
CREATE POLICY "jobs_update_company" ON public.jobs
  FOR UPDATE USING (
    posted_by_company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid() AND company_id IS NOT NULL
    )
    OR driver_id = auth.uid()
  );

-- ── JOB BIDS ────────────────────────────────────────────────
DROP POLICY IF EXISTS "bids_select" ON public.job_bids;
CREATE POLICY "bids_select" ON public.job_bids
  FOR SELECT USING (
    bidder_id = auth.uid()
    OR job_id IN (
      SELECT id FROM public.jobs
      WHERE posted_by_company_id IN (
        SELECT company_id FROM public.profiles WHERE id = auth.uid() AND company_id IS NOT NULL
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
        SELECT company_id FROM public.profiles WHERE id = auth.uid() AND company_id IS NOT NULL
      )
    )
  );

-- ── INVOICES ────────────────────────────────────────────────
DROP POLICY IF EXISTS "invoices_company_select" ON public.invoices;
CREATE POLICY "invoices_company_select" ON public.invoices
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid() AND company_id IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "invoices_company_insert" ON public.invoices;
CREATE POLICY "invoices_company_insert" ON public.invoices
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid() AND company_id IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "invoices_company_update" ON public.invoices;
CREATE POLICY "invoices_company_update" ON public.invoices
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid() AND company_id IS NOT NULL
    )
  );

-- ────────────────────────────────────────────────────────────
-- 11. PERMISIUNI (GRANTS)
-- ────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL   ON ALL TABLES    IN SCHEMA public TO authenticated, service_role;
GRANT ALL   ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, service_role;

-- ────────────────────────────────────────────────────────────
-- 12. VERIFICARE FINALĂ — liste tabele create
-- ────────────────────────────────────────────────────────────
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns c
   WHERE c.table_schema = 'public' AND c.table_name = t.table_name) AS coloane
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type  = 'BASE TABLE'
  AND table_name  IN (
    'companies','profiles','drivers','vehicles',
    'jobs','job_bids','invoices'
  )
ORDER BY table_name;

-- ================================================================
-- ✅ SETUP COMPLET — XDRIVE LOGISTICS LTD
-- ================================================================
-- Tabele: 7 (companies, profiles, drivers, vehicles,
--            jobs, job_bids, invoices)
-- Triggere: 8 (updated_at × 7 + on_auth_user_created)
-- Funcții: 4 (set_updated_at, handle_new_user,
--             create_company, generate_invoice_number)
-- RLS:     25 politici
-- ================================================================

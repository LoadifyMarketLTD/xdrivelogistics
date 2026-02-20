-- ================================================================
-- XDRIVE LOGISTICS LTD — COMPLETE DATABASE SCHEMA
-- Copiaza TOT si ruleaza in Supabase → SQL Editor → Run
-- (Copy everything and run in Supabase → SQL Editor → Run)
--
-- Contine TOATE tabelele, functiile, triggerele si politicile RLS
-- necesare pentru functionarea completa a site-ului.
-- Este idempotent — poate fi rulat de mai multe ori in siguranta.
--
-- Tables created:
--   01. profiles             — user profiles (extends auth.users)
--   02. companies            — company accounts
--   03. company_memberships  — multi-tenant user <-> company links
--   04. user_settings        — per-user notification preferences
--   05. user_roles           — named roles per user
--   06. drivers              — driver records owned by a company
--   07. vehicles             — fleet / vehicle records
--   08. driver_locations     — real-time GPS (upserted by mobile app)
--   09. jobs                 — marketplace loads (full extended schema)
--   10. job_bids             — bids / quotes from carriers
--   11. job_tracking_events  — driver timeline events
--   12. job_status_events    — status change audit log
--   13. job_evidence         — photos, signatures, documents
--   14. proof_of_delivery    — ePOD records
--   15. job_pod              — generated ePOD PDFs
--   16. job_documents        — CMR, invoices, etc.
--   17. job_notes            — internal / customer notes
--   18. invoices             — billing / invoices
-- ================================================================

-- ============================================================
-- 0. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 0b. SHARED UTILITY: auto-update updated_at on every UPDATE
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 1. PROFILES  (extends auth.users — created automatically on signup)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id                        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                     TEXT UNIQUE NOT NULL,
  full_name                 TEXT,
  first_name                TEXT,
  last_name                 TEXT,
  phone                     TEXT,
  phone_2                   TEXT,
  company_id                UUID,   -- FK wired after companies table below
  role                      TEXT NOT NULL DEFAULT 'admin'
                              CHECK (role IN ('admin','dispatcher','driver','viewer','company_admin')),
  is_active                 BOOLEAN NOT NULL DEFAULT true,
  job_title                 TEXT,
  department                TEXT,
  time_zone                 TEXT NOT NULL DEFAULT 'GMT',
  is_driver                 BOOLEAN NOT NULL DEFAULT false,
  web_login_allowed         BOOLEAN NOT NULL DEFAULT true,
  email_visible_to_members  BOOLEAN NOT NULL DEFAULT false,
  has_mobile_account        BOOLEAN NOT NULL DEFAULT false,
  mobile_option             TEXT NOT NULL DEFAULT 'FREE',
  username                  TEXT UNIQUE,
  logo_url                  TEXT,
  interface_language        TEXT NOT NULL DEFAULT 'English',
  created_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email      ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. COMPANIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.companies (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  email           TEXT,
  phone           TEXT,
  vat_number      TEXT,
  company_number  TEXT,
  address_line1   TEXT,
  address_line2   TEXT,
  city            TEXT,
  postcode        TEXT,
  country         TEXT,
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_created_by ON public.companies(created_by);

DROP TRIGGER IF EXISTS companies_updated_at ON public.companies;
CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Wire profiles → companies FK (safe to run multiple times)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_company_id_fkey;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;

-- ============================================================
-- 3. COMPANY MEMBERSHIPS  (multi-tenant: user <-> company)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.company_memberships (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id  UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'member'
                CHECK (role IN ('owner','admin','dispatcher','driver','member')),
  status      TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','inactive','invited')),
  invite_email TEXT,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT company_memberships_unique_company_user UNIQUE (company_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_company_memberships_company_id ON public.company_memberships(company_id);
CREATE INDEX IF NOT EXISTS idx_company_memberships_user_id    ON public.company_memberships(user_id);

DROP TRIGGER IF EXISTS company_memberships_updated_at ON public.company_memberships;
CREATE TRIGGER company_memberships_updated_at
  BEFORE UPDATE ON public.company_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 4. RPC: create_company  (called from onboarding)
-- ============================================================
DROP FUNCTION IF EXISTS public.create_company(text);
DROP FUNCTION IF EXISTS public.create_company(text, text);

CREATE OR REPLACE FUNCTION public.create_company(
  company_name TEXT,
  phone        TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
  uid    UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = uid AND company_id IS NOT NULL) THEN
    RAISE EXCEPTION 'User already belongs to a company';
  END IF;

  INSERT INTO public.companies (name, phone, created_by)
  VALUES (company_name, phone, uid)
  RETURNING id INTO new_id;

  UPDATE public.profiles SET company_id = new_id WHERE id = uid;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 5. USER SETTINGS  (per-user notification / alert preferences)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                   UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  show_notification_bar     BOOLEAN NOT NULL DEFAULT true,
  enable_load_alerts        BOOLEAN NOT NULL DEFAULT true,
  send_booking_confirmation BOOLEAN NOT NULL DEFAULT true,
  enroute_alert_hours       INTEGER NOT NULL DEFAULT 4,
  alert_distance_uk_miles   INTEGER NOT NULL DEFAULT 10,
  alert_distance_euro_miles INTEGER NOT NULL DEFAULT 50,
  despatch_group            TEXT,
  created_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

DROP TRIGGER IF EXISTS user_settings_updated_at ON public.user_settings;
CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 6. USER ROLES  (named roles per user)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_name  TEXT NOT NULL
               CHECK (role_name IN (
                 'Company Admin','Company User','Finance Director',
                 'Finance Bookkeeper','Driver','Dispatcher','Viewer'
               )),
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role_name)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- ============================================================
-- 7. DRIVERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.drivers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  phone           TEXT,
  email           TEXT,
  license_number  TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  notes           TEXT,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drivers_company_id ON public.drivers(company_id);
CREATE INDEX IF NOT EXISTS idx_drivers_is_active  ON public.drivers(is_active);

DROP TRIGGER IF EXISTS drivers_updated_at ON public.drivers;
CREATE TRIGGER drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 8. VEHICLES  (fleet management — full extended schema)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.vehicles (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id            UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  vehicle_type          TEXT,
  registration          TEXT NOT NULL,
  make                  TEXT,
  model                 TEXT,
  year                  INTEGER,
  notes                 TEXT,
  is_available          BOOLEAN NOT NULL DEFAULT true,
  driver_name           TEXT,
  current_status        TEXT NOT NULL DEFAULT 'available',
  current_location      TEXT,
  last_tracked_at       TIMESTAMP WITH TIME ZONE,
  future_position       TEXT,
  future_journey        TEXT,
  advertise_to          TEXT NOT NULL DEFAULT 'nobody',
  notify_when           TEXT,
  is_tracked            BOOLEAN NOT NULL DEFAULT false,
  vehicle_size          TEXT,
  telematics_id         TEXT,
  vehicle_reference     TEXT,
  internal_reference    TEXT,
  body_type             TEXT,
  notify_when_tracked   BOOLEAN NOT NULL DEFAULT false,
  vin                   TEXT,
  has_livery            BOOLEAN NOT NULL DEFAULT false,
  has_tail_lift         BOOLEAN NOT NULL DEFAULT false,
  has_hiab              BOOLEAN NOT NULL DEFAULT false,
  has_trailer           BOOLEAN NOT NULL DEFAULT false,
  has_moffet_mounty     BOOLEAN NOT NULL DEFAULT false,
  loading_capacity_m3   NUMERIC(8,2),
  length_m              NUMERIC(6,2),
  width_m               NUMERIC(6,2),
  height_m              NUMERIC(6,2),
  max_weight_kg         NUMERIC(10,2),
  created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_company_id   ON public.vehicles(company_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_is_available ON public.vehicles(is_available);

DROP TRIGGER IF EXISTS vehicles_updated_at ON public.vehicles;
CREATE TRIGGER vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 9. DRIVER LOCATIONS  (real-time GPS — upserted by mobile app)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.driver_locations (
  driver_id  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  lat        DOUBLE PRECISION NOT NULL,
  lng        DOUBLE PRECISION NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 10. JOBS  (marketplace loads — full extended schema)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.jobs (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  posted_by_company_id    UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  assigned_company_id     UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  accepted_bid_id         UUID,   -- FK to job_bids wired after job_bids table
  -- Core locations
  pickup_location         TEXT NOT NULL,
  delivery_location       TEXT NOT NULL,
  -- Extended address fields
  pickup_address_line1    TEXT,
  pickup_postcode         TEXT,
  pickup_city             TEXT,
  delivery_address_line1  TEXT,
  delivery_postcode       TEXT,
  delivery_city           TEXT,
  -- Schedule
  pickup_datetime         TIMESTAMP WITH TIME ZONE,
  delivery_datetime       TIMESTAMP WITH TIME ZONE,
  -- Cargo
  vehicle_type            TEXT,
  cargo_type              TEXT,
  load_details            TEXT,
  pallets                 INTEGER,
  boxes                   INTEGER,
  bags                    INTEGER,
  items                   INTEGER,
  weight_kg               NUMERIC(10,2),
  packaging               TEXT,
  dimensions              TEXT,
  requested_vehicle_type  TEXT,
  distance_miles          NUMERIC(10,2),
  -- Booking details
  booked_by_company_name  TEXT,
  booked_by_company_ref   TEXT,
  booked_by_phone         TEXT,
  load_id                 TEXT,
  -- Financials
  budget                  NUMERIC(12,2),
  agreed_rate             NUMERIC(12,2),
  payment_terms           TEXT,
  smartpay_enabled        BOOLEAN NOT NULL DEFAULT false,
  -- References
  your_ref                TEXT,
  cust_ref                TEXT,
  vehicle_ref             TEXT,
  -- Assignment
  assigned_driver_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  driver_id               UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Marketplace status
  status                  TEXT NOT NULL DEFAULT 'open'
                            CHECK (status IN ('open','assigned','in-transit','completed','cancelled')),
  -- Driver-facing status (mobile tracking)
  current_status          TEXT NOT NULL DEFAULT 'ALLOCATED'
                            CHECK (current_status IN (
                              'ALLOCATED','ON_MY_WAY_TO_PICKUP','ON_SITE_PICKUP',
                              'PICKED_UP','ON_MY_WAY_TO_DELIVERY','ON_SITE_DELIVERY','DELIVERED'
                            )),
  status_updated_at       TIMESTAMP WITH TIME ZONE,
  -- Completion
  completed_by_name       TEXT,
  completed_at            TIMESTAMP WITH TIME ZONE,
  -- Notes / POD flags
  load_notes              TEXT,
  pod_required            BOOLEAN NOT NULL DEFAULT false,
  pod_generated           BOOLEAN NOT NULL DEFAULT false,
  pod_generated_at        TIMESTAMP WITH TIME ZONE,
  has_pickup_evidence     BOOLEAN NOT NULL DEFAULT false,
  has_delivery_evidence   BOOLEAN NOT NULL DEFAULT false,
  -- Timestamps
  created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Ensure all extended columns exist on pre-existing jobs tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='driver_id') THEN
    ALTER TABLE public.jobs ADD COLUMN driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='assigned_driver_id') THEN
    ALTER TABLE public.jobs ADD COLUMN assigned_driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='current_status') THEN
    ALTER TABLE public.jobs ADD COLUMN current_status TEXT NOT NULL DEFAULT 'ALLOCATED';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='status_updated_at') THEN
    ALTER TABLE public.jobs ADD COLUMN status_updated_at TIMESTAMP WITH TIME ZONE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='cargo_type') THEN
    ALTER TABLE public.jobs ADD COLUMN cargo_type TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='load_details') THEN
    ALTER TABLE public.jobs ADD COLUMN load_details TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='boxes') THEN
    ALTER TABLE public.jobs ADD COLUMN boxes INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='bags') THEN
    ALTER TABLE public.jobs ADD COLUMN bags INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='items') THEN
    ALTER TABLE public.jobs ADD COLUMN items INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='pickup_address_line1') THEN
    ALTER TABLE public.jobs ADD COLUMN pickup_address_line1 TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='pickup_postcode') THEN
    ALTER TABLE public.jobs ADD COLUMN pickup_postcode TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='pickup_city') THEN
    ALTER TABLE public.jobs ADD COLUMN pickup_city TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='delivery_address_line1') THEN
    ALTER TABLE public.jobs ADD COLUMN delivery_address_line1 TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='delivery_postcode') THEN
    ALTER TABLE public.jobs ADD COLUMN delivery_postcode TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='delivery_city') THEN
    ALTER TABLE public.jobs ADD COLUMN delivery_city TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='distance_miles') THEN
    ALTER TABLE public.jobs ADD COLUMN distance_miles NUMERIC(10,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='packaging') THEN
    ALTER TABLE public.jobs ADD COLUMN packaging TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='dimensions') THEN
    ALTER TABLE public.jobs ADD COLUMN dimensions TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='requested_vehicle_type') THEN
    ALTER TABLE public.jobs ADD COLUMN requested_vehicle_type TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='booked_by_company_name') THEN
    ALTER TABLE public.jobs ADD COLUMN booked_by_company_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='booked_by_company_ref') THEN
    ALTER TABLE public.jobs ADD COLUMN booked_by_company_ref TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='booked_by_phone') THEN
    ALTER TABLE public.jobs ADD COLUMN booked_by_phone TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='load_id') THEN
    ALTER TABLE public.jobs ADD COLUMN load_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='agreed_rate') THEN
    ALTER TABLE public.jobs ADD COLUMN agreed_rate NUMERIC(12,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='payment_terms') THEN
    ALTER TABLE public.jobs ADD COLUMN payment_terms TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='smartpay_enabled') THEN
    ALTER TABLE public.jobs ADD COLUMN smartpay_enabled BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='your_ref') THEN
    ALTER TABLE public.jobs ADD COLUMN your_ref TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='cust_ref') THEN
    ALTER TABLE public.jobs ADD COLUMN cust_ref TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='vehicle_ref') THEN
    ALTER TABLE public.jobs ADD COLUMN vehicle_ref TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='completed_by_name') THEN
    ALTER TABLE public.jobs ADD COLUMN completed_by_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='completed_at') THEN
    ALTER TABLE public.jobs ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='load_notes') THEN
    ALTER TABLE public.jobs ADD COLUMN load_notes TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='pod_required') THEN
    ALTER TABLE public.jobs ADD COLUMN pod_required BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='pod_generated') THEN
    ALTER TABLE public.jobs ADD COLUMN pod_generated BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='pod_generated_at') THEN
    ALTER TABLE public.jobs ADD COLUMN pod_generated_at TIMESTAMP WITH TIME ZONE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='has_pickup_evidence') THEN
    ALTER TABLE public.jobs ADD COLUMN has_pickup_evidence BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='has_delivery_evidence') THEN
    ALTER TABLE public.jobs ADD COLUMN has_delivery_evidence BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_jobs_status           ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_current_status   ON public.jobs(current_status);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by        ON public.jobs(posted_by_company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_to      ON public.jobs(assigned_company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_driver_id        ON public.jobs(driver_id);
CREATE INDEX IF NOT EXISTS idx_jobs_pickup_datetime  ON public.jobs(pickup_datetime);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at       ON public.jobs(created_at DESC);

DROP TRIGGER IF EXISTS jobs_updated_at ON public.jobs;
CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 11. JOB BIDS  (marketplace bidding / carrier quotes)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_bids (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id      UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  bidder_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id  UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  amount_gbp  NUMERIC(12,2) NOT NULL,
  message     TEXT,
  status      TEXT NOT NULL DEFAULT 'submitted'
                CHECK (status IN ('submitted','withdrawn','rejected','accepted')),
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_bids_job_id    ON public.job_bids(job_id);
CREATE INDEX IF NOT EXISTS idx_job_bids_bidder_id ON public.job_bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_job_bids_status    ON public.job_bids(status);

DROP TRIGGER IF EXISTS job_bids_updated_at ON public.job_bids;
CREATE TRIGGER job_bids_updated_at
  BEFORE UPDATE ON public.job_bids
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Wire accepted_bid_id FK now that job_bids exists
ALTER TABLE public.jobs
  DROP CONSTRAINT IF EXISTS jobs_accepted_bid_id_fkey;
ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_accepted_bid_id_fkey
  FOREIGN KEY (accepted_bid_id) REFERENCES public.job_bids(id) ON DELETE SET NULL;

-- ============================================================
-- 12. JOB TRACKING EVENTS  (driver timeline — loads/[id] page)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_tracking_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id      UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL
                CHECK (event_type IN (
                  'on_my_way_to_pickup','on_site_pickup','loaded',
                  'on_my_way_to_delivery','on_site_delivery','delivered'
                )),
  event_time  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name   TEXT,
  notes       TEXT,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_tracking_events_job_id     ON public.job_tracking_events(job_id);
CREATE INDEX IF NOT EXISTS idx_job_tracking_events_event_type ON public.job_tracking_events(event_type);
CREATE INDEX IF NOT EXISTS idx_job_tracking_events_event_time ON public.job_tracking_events(event_time DESC);

-- ============================================================
-- 13. JOB STATUS EVENTS  (status-change audit log — API route)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_status_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id      UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  status      TEXT NOT NULL,
  changed_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  notes       TEXT,
  location    TEXT,
  actor_type  TEXT CHECK (actor_type IN ('driver','admin','company_admin'))
);

CREATE INDEX IF NOT EXISTS idx_job_status_events_job_id     ON public.job_status_events(job_id);
CREATE INDEX IF NOT EXISTS idx_job_status_events_changed_at ON public.job_status_events(changed_at DESC);

-- ============================================================
-- 14. JOB EVIDENCE  (photos, signatures, documents — API route)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_evidence (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id                 UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  uploaded_by            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_url               TEXT NOT NULL,
  file_name              TEXT NOT NULL,
  file_size              INTEGER,
  mime_type              TEXT,
  evidence_type          TEXT NOT NULL
                           CHECK (evidence_type IN ('photo','signature','document','note')),
  phase                  TEXT NOT NULL
                           CHECK (phase IN ('pickup','delivery','in_transit')),
  notes                  TEXT,
  receiver_name          TEXT,
  receiver_signature_url TEXT,
  uploaded_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at             TIMESTAMP WITH TIME ZONE,
  deleted_by             UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_job_evidence_job_id   ON public.job_evidence(job_id);
CREATE INDEX IF NOT EXISTS idx_job_evidence_phase    ON public.job_evidence(phase);
CREATE INDEX IF NOT EXISTS idx_job_evidence_uploaded ON public.job_evidence(uploaded_at DESC);

-- ============================================================
-- 15. PROOF OF DELIVERY  (ePOD records — loads/[id] page)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.proof_of_delivery (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id           UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  delivered_on     DATE NOT NULL DEFAULT CURRENT_DATE,
  received_by      TEXT NOT NULL,
  left_at          TEXT,
  no_of_items      INTEGER,
  delivery_status  TEXT NOT NULL DEFAULT 'Completed Delivery'
                     CHECK (delivery_status IN (
                       'Completed Delivery','Partial Delivery',
                       'Failed Delivery','Refused','Left Safe'
                     )),
  delivery_notes   TEXT,
  signature_url    TEXT,
  photo_urls       TEXT[],
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pod_job_id ON public.proof_of_delivery(job_id);

DROP TRIGGER IF EXISTS pod_updated_at ON public.proof_of_delivery;
CREATE TRIGGER pod_updated_at
  BEFORE UPDATE ON public.proof_of_delivery
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 16. JOB POD  (generated ePOD PDFs — API route)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_pod (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id       UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  version      INTEGER NOT NULL DEFAULT 1,
  pdf_url      TEXT NOT NULL,
  page_count   INTEGER NOT NULL DEFAULT 1,
  metadata     JSONB,
  is_latest    BOOLEAN NOT NULL DEFAULT true,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (job_id, version)
);

CREATE INDEX IF NOT EXISTS idx_job_pod_job_id    ON public.job_pod(job_id);
CREATE INDEX IF NOT EXISTS idx_job_pod_is_latest ON public.job_pod(is_latest);

-- ============================================================
-- 17. JOB DOCUMENTS  (CMR, invoices, etc — loads/[id] page)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_documents (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id         UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  document_type  TEXT NOT NULL
                   CHECK (document_type IN ('POD','Invoice','Delivery Note','CMR','Photo','Other')),
  document_url   TEXT NOT NULL,
  document_name  TEXT NOT NULL,
  uploaded_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_documents_job_id ON public.job_documents(job_id);

-- ============================================================
-- 18. JOB NOTES  (internal / customer notes — loads/[id] page)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_notes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id           UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  note_type        TEXT NOT NULL DEFAULT 'General'
                     CHECK (note_type IN (
                       'General','Status Update','Customer Communication',
                       'Internal','Issue','Resolution'
                     )),
  note_text        TEXT NOT NULL,
  is_internal      BOOLEAN NOT NULL DEFAULT false,
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_name  TEXT,
  created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_notes_job_id ON public.job_notes(job_id);

-- ============================================================
-- 19. INVOICES  (billing — invoices pages)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id       UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  invoice_number   TEXT UNIQUE NOT NULL DEFAULT 'DRAFT',
  job_id           UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  customer_name    TEXT NOT NULL,
  customer_email   TEXT,
  amount           NUMERIC(12,2) NOT NULL,
  vat_amount       NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount     NUMERIC(12,2) GENERATED ALWAYS AS (amount + vat_amount) STORED,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','sent','paid','overdue','cancelled')),
  issue_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date         DATE NOT NULL DEFAULT (CURRENT_DATE + 30),
  paid_date        DATE,
  notes            TEXT,
  created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1001;

CREATE OR REPLACE FUNCTION public.set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number = 'DRAFT' OR NEW.invoice_number IS NULL THEN
    NEW.invoice_number := 'INV-' || TO_CHAR(NOW(),'YYYY') || '-'
                          || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS invoices_set_number ON public.invoices;
CREATE TRIGGER invoices_set_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_invoice_number();

CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON public.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_job_id     ON public.invoices(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status     ON public.invoices(status);

DROP TRIGGER IF EXISTS invoices_updated_at ON public.invoices;
CREATE TRIGGER invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 20. ROW LEVEL SECURITY — enable on all tables
-- ============================================================
ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_memberships  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_locations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_bids             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_tracking_events  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_status_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_evidence         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proof_of_delivery    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_pod              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_documents        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_notes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices             ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 21. HELPER: is_company_member(company_id)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_company_member(cid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND company_id = cid
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 22. HELPER RPC: get_user_company_id
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 23. RLS POLICIES — profiles
-- ============================================================
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- ============================================================
-- 24. RLS POLICIES — companies
-- ============================================================
DROP POLICY IF EXISTS "companies_select" ON public.companies;
CREATE POLICY "companies_select" ON public.companies FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR public.is_company_member(id)
  );

DROP POLICY IF EXISTS "companies_insert" ON public.companies;
CREATE POLICY "companies_insert" ON public.companies FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "companies_update" ON public.companies;
CREATE POLICY "companies_update" ON public.companies FOR UPDATE TO authenticated
  USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

-- ============================================================
-- 25. RLS POLICIES — company_memberships
-- ============================================================
DROP POLICY IF EXISTS "memberships_select_member" ON public.company_memberships;
CREATE POLICY "memberships_select_member" ON public.company_memberships FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_company_member(company_id)
  );

DROP POLICY IF EXISTS "memberships_insert_admin" ON public.company_memberships;
CREATE POLICY "memberships_insert_admin" ON public.company_memberships FOR INSERT TO authenticated
  WITH CHECK (public.is_company_member(company_id));

DROP POLICY IF EXISTS "memberships_update_admin" ON public.company_memberships;
CREATE POLICY "memberships_update_admin" ON public.company_memberships FOR UPDATE TO authenticated
  USING (public.is_company_member(company_id))
  WITH CHECK (public.is_company_member(company_id));

-- ============================================================
-- 26. RLS POLICIES — user_settings
-- ============================================================
DROP POLICY IF EXISTS "user_settings_own" ON public.user_settings;
CREATE POLICY "user_settings_own" ON public.user_settings FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 27. RLS POLICIES — user_roles
-- ============================================================
DROP POLICY IF EXISTS "user_roles_own" ON public.user_roles;
CREATE POLICY "user_roles_own" ON public.user_roles FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 28. RLS POLICIES — drivers
-- ============================================================
DROP POLICY IF EXISTS "drivers_company" ON public.drivers;
CREATE POLICY "drivers_company" ON public.drivers FOR ALL TO authenticated
  USING (public.is_company_member(company_id))
  WITH CHECK (public.is_company_member(company_id));

-- ============================================================
-- 29. RLS POLICIES — vehicles
-- ============================================================
DROP POLICY IF EXISTS "vehicles_company" ON public.vehicles;
CREATE POLICY "vehicles_company" ON public.vehicles FOR ALL TO authenticated
  USING (public.is_company_member(company_id))
  WITH CHECK (public.is_company_member(company_id));

-- ============================================================
-- 30. RLS POLICIES — driver_locations
-- ============================================================
DROP POLICY IF EXISTS "driver_locations_own" ON public.driver_locations;
CREATE POLICY "driver_locations_own" ON public.driver_locations FOR ALL TO authenticated
  USING (driver_id = auth.uid()) WITH CHECK (driver_id = auth.uid());

-- ============================================================
-- 31. RLS POLICIES — jobs
-- ============================================================
DROP POLICY IF EXISTS "jobs_select" ON public.jobs;
CREATE POLICY "jobs_select" ON public.jobs FOR SELECT TO authenticated
  USING (
    status = 'open'
    OR public.is_company_member(posted_by_company_id)
    OR (assigned_company_id IS NOT NULL AND public.is_company_member(assigned_company_id))
    OR driver_id = auth.uid()
  );

DROP POLICY IF EXISTS "jobs_insert" ON public.jobs;
CREATE POLICY "jobs_insert" ON public.jobs FOR INSERT TO authenticated
  WITH CHECK (public.is_company_member(posted_by_company_id));

DROP POLICY IF EXISTS "jobs_update" ON public.jobs;
CREATE POLICY "jobs_update" ON public.jobs FOR UPDATE TO authenticated
  USING (
    public.is_company_member(posted_by_company_id)
    OR driver_id = auth.uid()
  );

-- ============================================================
-- 32. RLS POLICIES — job_bids
-- ============================================================
DROP POLICY IF EXISTS "job_bids_select" ON public.job_bids;
CREATE POLICY "job_bids_select" ON public.job_bids FOR SELECT TO authenticated
  USING (
    bidder_id = auth.uid()
    OR (company_id IS NOT NULL AND public.is_company_member(company_id))
    OR EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_bids.job_id
        AND public.is_company_member(j.posted_by_company_id)
    )
  );

DROP POLICY IF EXISTS "job_bids_insert" ON public.job_bids;
CREATE POLICY "job_bids_insert" ON public.job_bids FOR INSERT TO authenticated
  WITH CHECK (bidder_id = auth.uid());

DROP POLICY IF EXISTS "job_bids_update" ON public.job_bids;
CREATE POLICY "job_bids_update" ON public.job_bids FOR UPDATE TO authenticated
  USING (bidder_id = auth.uid());

-- ============================================================
-- 33. RLS POLICIES — job_tracking_events
-- ============================================================
DROP POLICY IF EXISTS "job_tracking_events_select" ON public.job_tracking_events;
CREATE POLICY "job_tracking_events_select" ON public.job_tracking_events FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_tracking_events.job_id
        AND (
          public.is_company_member(j.posted_by_company_id)
          OR (j.assigned_company_id IS NOT NULL AND public.is_company_member(j.assigned_company_id))
          OR j.driver_id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "job_tracking_events_insert" ON public.job_tracking_events;
CREATE POLICY "job_tracking_events_insert" ON public.job_tracking_events FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_tracking_events.job_id
        AND (
          public.is_company_member(j.posted_by_company_id)
          OR j.driver_id = auth.uid()
        )
    )
  );

-- ============================================================
-- 34. RLS POLICIES — job_status_events
-- ============================================================
DROP POLICY IF EXISTS "job_status_events_select" ON public.job_status_events;
CREATE POLICY "job_status_events_select" ON public.job_status_events FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_status_events.job_id
        AND (
          public.is_company_member(j.posted_by_company_id)
          OR j.driver_id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "job_status_events_insert" ON public.job_status_events;
CREATE POLICY "job_status_events_insert" ON public.job_status_events FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_status_events.job_id
        AND (
          public.is_company_member(j.posted_by_company_id)
          OR j.driver_id = auth.uid()
        )
    )
  );

-- ============================================================
-- 35. RLS POLICIES — job_evidence
-- ============================================================
DROP POLICY IF EXISTS "job_evidence_select" ON public.job_evidence;
CREATE POLICY "job_evidence_select" ON public.job_evidence FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_evidence.job_id
        AND (
          public.is_company_member(j.posted_by_company_id)
          OR j.driver_id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "job_evidence_insert" ON public.job_evidence;
CREATE POLICY "job_evidence_insert" ON public.job_evidence FOR INSERT TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_evidence.job_id
        AND (
          public.is_company_member(j.posted_by_company_id)
          OR j.driver_id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "job_evidence_update" ON public.job_evidence;
CREATE POLICY "job_evidence_update" ON public.job_evidence FOR UPDATE TO authenticated
  USING (uploaded_by = auth.uid());

-- ============================================================
-- 36. RLS POLICIES — proof_of_delivery
-- ============================================================
DROP POLICY IF EXISTS "pod_select" ON public.proof_of_delivery;
CREATE POLICY "pod_select" ON public.proof_of_delivery FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = proof_of_delivery.job_id
        AND (
          public.is_company_member(j.posted_by_company_id)
          OR j.driver_id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "pod_insert" ON public.proof_of_delivery;
CREATE POLICY "pod_insert" ON public.proof_of_delivery FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = proof_of_delivery.job_id
        AND (
          public.is_company_member(j.posted_by_company_id)
          OR j.driver_id = auth.uid()
        )
    )
  );

-- ============================================================
-- 37. RLS POLICIES — job_pod
-- ============================================================
DROP POLICY IF EXISTS "job_pod_select" ON public.job_pod;
CREATE POLICY "job_pod_select" ON public.job_pod FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_pod.job_id
        AND (
          public.is_company_member(j.posted_by_company_id)
          OR j.driver_id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "job_pod_insert" ON public.job_pod;
CREATE POLICY "job_pod_insert" ON public.job_pod FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_pod.job_id
        AND public.is_company_member(j.posted_by_company_id)
    )
  );

DROP POLICY IF EXISTS "job_pod_update" ON public.job_pod;
CREATE POLICY "job_pod_update" ON public.job_pod FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_pod.job_id
        AND public.is_company_member(j.posted_by_company_id)
    )
  );

-- ============================================================
-- 38. RLS POLICIES — job_documents
-- ============================================================
DROP POLICY IF EXISTS "job_documents_select" ON public.job_documents;
CREATE POLICY "job_documents_select" ON public.job_documents FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_documents.job_id
        AND (
          public.is_company_member(j.posted_by_company_id)
          OR j.driver_id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "job_documents_insert" ON public.job_documents;
CREATE POLICY "job_documents_insert" ON public.job_documents FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_documents.job_id
        AND (
          public.is_company_member(j.posted_by_company_id)
          OR j.driver_id = auth.uid()
        )
    )
  );

-- ============================================================
-- 39. RLS POLICIES — job_notes
-- ============================================================
DROP POLICY IF EXISTS "job_notes_select" ON public.job_notes;
CREATE POLICY "job_notes_select" ON public.job_notes FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_notes.job_id
        AND (
          public.is_company_member(j.posted_by_company_id)
          OR j.driver_id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "job_notes_insert" ON public.job_notes;
CREATE POLICY "job_notes_insert" ON public.job_notes FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_notes.job_id
        AND (
          public.is_company_member(j.posted_by_company_id)
          OR j.driver_id = auth.uid()
        )
    )
  );

-- ============================================================
-- 40. RLS POLICIES — invoices
-- ============================================================
DROP POLICY IF EXISTS "invoices_company" ON public.invoices;
CREATE POLICY "invoices_company" ON public.invoices FOR ALL TO authenticated
  USING (public.is_company_member(company_id))
  WITH CHECK (public.is_company_member(company_id));

-- ============================================================
-- 41. VERIFICATION — shows all tables and column counts
-- ============================================================
SELECT
  table_name,
  (
    SELECT COUNT(*) FROM information_schema.columns c
    WHERE c.table_schema = 'public' AND c.table_name = t.table_name
  ) AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type  = 'BASE TABLE'
  AND table_name  IN (
    'profiles','companies','company_memberships',
    'user_settings','user_roles',
    'drivers','vehicles','driver_locations',
    'jobs','job_bids',
    'job_tracking_events','job_status_events','job_evidence',
    'proof_of_delivery','job_pod',
    'job_documents','job_notes','invoices'
  )
ORDER BY table_name;

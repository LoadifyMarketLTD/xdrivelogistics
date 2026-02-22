BEGIN;

-- ============================================================
-- Migration 003: Complete Auto-Fix (idempotent)
-- Creates enums, tables, columns, functions, triggers,
-- RLS policies, and indexes from scratch if missing.
-- ============================================================

-- ─── ENUMS ──────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'company_role' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.company_role AS ENUM ('owner', 'admin', 'dispatcher', 'viewer');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_status' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.membership_status AS ENUM ('invited', 'active', 'suspended');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'doc_status' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.doc_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.job_status AS ENUM ('draft', 'posted', 'allocated', 'in_transit', 'delivered', 'cancelled', 'disputed');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cargo_type' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.cargo_type AS ENUM ('documents', 'packages', 'pallets', 'furniture', 'equipment', 'other');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_type' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.vehicle_type AS ENUM ('bicycle', 'motorbike', 'car', 'van_small', 'van_large', 'luton', 'truck_7_5t', 'truck_18t', 'artic');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tracking_event_type' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.tracking_event_type AS ENUM ('created', 'allocated', 'driver_en_route', 'arrived_pickup', 'collected', 'in_transit', 'arrived_delivery', 'delivered', 'failed', 'cancelled', 'note');
  END IF;
END $$;

-- ─── TABLES ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  is_driver boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company_number text,
  vat_number text,
  email text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  postcode text,
  country text DEFAULT 'UK',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.company_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email text,
  role_in_company public.company_role DEFAULT 'viewer',
  status public.membership_status DEFAULT 'invited',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'company_memberships_company_id_user_id_key'
  ) THEN
    ALTER TABLE public.company_memberships ADD CONSTRAINT company_memberships_company_id_user_id_key UNIQUE (company_id, user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'company_memberships_company_id_invited_email_key'
  ) THEN
    ALTER TABLE public.company_memberships ADD CONSTRAINT company_memberships_company_id_invited_email_key UNIQUE (company_id, invited_email);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name text NOT NULL,
  phone text,
  email text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  assigned_driver_id uuid REFERENCES public.drivers(id) ON DELETE SET NULL,
  type public.vehicle_type NOT NULL,
  reg_plate text,
  make text,
  model text,
  payload_kg numeric,
  pallets_capacity int,
  has_tail_lift boolean DEFAULT false,
  has_straps boolean DEFAULT false,
  has_blankets boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  doc_type text NOT NULL,
  file_path text,
  issued_date date,
  expiry_date date,
  status public.doc_status DEFAULT 'pending',
  rejection_reason text,
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vehicle_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  doc_type text NOT NULL,
  file_path text,
  issued_date date,
  expiry_date date,
  status public.doc_status DEFAULT 'pending',
  rejection_reason text,
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id),
  status public.job_status DEFAULT 'draft',
  vehicle_type public.vehicle_type,
  cargo_type public.cargo_type,
  pickup_location text,
  pickup_postcode text,
  pickup_lat double precision,
  pickup_lng double precision,
  pickup_datetime timestamptz,
  delivery_location text,
  delivery_postcode text,
  delivery_lat double precision,
  delivery_lng double precision,
  delivery_datetime timestamptz,
  pallets int,
  boxes int,
  bags int,
  items int,
  weight_kg numeric,
  length_cm numeric,
  width_cm numeric,
  height_cm numeric,
  currency text DEFAULT 'GBP',
  budget_amount numeric,
  is_fixed_price boolean DEFAULT false,
  load_details text,
  special_requirements text,
  access_restrictions text,
  job_distance_miles numeric,
  job_distance_minutes int,
  is_return_journey boolean NOT NULL DEFAULT false,
  customer_ref text,
  price numeric,
  allocated_driver_id uuid REFERENCES public.drivers(id) ON DELETE SET NULL,
  allocated_vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.job_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id),
  note text NOT NULL,
  is_internal boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.job_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES auth.users(id),
  doc_type text DEFAULT 'other',
  file_path text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.job_tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id),
  event_type public.tracking_event_type NOT NULL,
  message text,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.job_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  bidder_user_id uuid NOT NULL REFERENCES auth.users(id),
  bidder_driver_id uuid REFERENCES public.drivers(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'GBP',
  message text,
  status text DEFAULT 'submitted',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  heading int,
  speed_mph numeric,
  recorded_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.job_driver_distance_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  miles_to_pickup numeric,
  minutes_to_pickup int,
  computed_at timestamptz DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'job_driver_distance_cache_job_id_driver_id_key'
  ) THEN
    ALTER TABLE public.job_driver_distance_cache ADD CONSTRAINT job_driver_distance_cache_job_id_driver_id_key UNIQUE (job_id, driver_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id),
  customer_name text,
  customer_email text,
  customer_phone text,
  pickup_location text,
  delivery_location text,
  vehicle_type public.vehicle_type,
  cargo_type public.cargo_type,
  amount numeric,
  currency text DEFAULT 'GBP',
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.diary_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES public.drivers(id) ON DELETE SET NULL,
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
  title text NOT NULL,
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.return_journeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES public.drivers(id) ON DELETE SET NULL,
  vehicle_type public.vehicle_type,
  from_postcode text,
  to_postcode text,
  available_from timestamptz,
  available_to timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- ─── MISSING COLUMNS (idempotent) ───────────────────────────

DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_driver boolean DEFAULT false;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
END $$;

DO $$ BEGIN
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS address_line1 text;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS address_line2 text;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS city text;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS postcode text;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS company_number text;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS vat_number text;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS country text DEFAULT 'UK';
END $$;

DO $$ BEGIN
  ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS display_name text;
  ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
END $$;

DO $$ BEGIN
  ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;
  ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS has_tail_lift boolean DEFAULT false;
  ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS has_straps boolean DEFAULT false;
  ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS has_blankets boolean DEFAULT false;
  ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS payload_kg numeric;
  ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS pallets_capacity int;
END $$;

DO $$ BEGIN
  ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS is_return_journey boolean NOT NULL DEFAULT false;
  ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS customer_ref text;
  ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS price numeric;
  ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS allocated_driver_id uuid REFERENCES public.drivers(id) ON DELETE SET NULL;
  ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS allocated_vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL;
  ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS special_requirements text;
  ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS access_restrictions text;
  ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS job_distance_miles numeric;
  ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS job_distance_minutes int;
  ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS pallets int;
  ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS boxes int;
  ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS bags int;
  ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS items int;
  ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS length_cm numeric;
  ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS width_cm numeric;
  ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS height_cm numeric;
  ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
END $$;

DO $$ BEGIN
  ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS vehicle_type public.vehicle_type;
  ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS cargo_type public.cargo_type;
  ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS currency text DEFAULT 'GBP';
  ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft';
  ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS customer_phone text;
  ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS customer_email text;
  ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS customer_name text;
END $$;

-- ─── HELPER FUNCTIONS ────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_company_member(cid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_memberships
    WHERE company_id = cid AND user_id = auth.uid() AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_company_admin(cid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_memberships
    WHERE company_id = cid AND user_id = auth.uid() AND status = 'active'
      AND role_in_company IN ('owner', 'admin')
  );
$$;

-- ─── TRIGGER: sync job price from accepted bid ───────────────

CREATE OR REPLACE FUNCTION public.sync_job_bid_price()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS DISTINCT FROM 'accepted') THEN
    UPDATE public.jobs
    SET price = NEW.amount, updated_at = now()
    WHERE id = NEW.job_id;
  END IF;
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_sync_job_bid_price'
  ) THEN
    CREATE TRIGGER trg_sync_job_bid_price
      AFTER UPDATE ON public.job_bids
      FOR EACH ROW EXECUTE FUNCTION public.sync_job_bid_price();
  END IF;
END $$;

-- ─── ENABLE RLS ──────────────────────────────────────────────

ALTER TABLE public.profiles                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_memberships      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_documents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_documents        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_notes                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_documents            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_tracking_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_bids                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_locations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_driver_distance_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_events             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_journeys          ENABLE ROW LEVEL SECURITY;

-- ─── RLS POLICIES ────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_select_own') THEN
    CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_update_own') THEN
    CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_insert_own') THEN
    CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'companies_select_member') THEN
    CREATE POLICY "companies_select_member" ON public.companies FOR SELECT USING (public.is_company_member(id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'companies_insert_admin') THEN
    CREATE POLICY "companies_insert_admin" ON public.companies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'companies_update_admin') THEN
    CREATE POLICY "companies_update_admin" ON public.companies FOR UPDATE USING (public.is_company_admin(id));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'company_memberships' AND policyname = 'memberships_select_member') THEN
    CREATE POLICY "memberships_select_member" ON public.company_memberships FOR SELECT USING (public.is_company_member(company_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'company_memberships' AND policyname = 'memberships_insert_admin') THEN
    CREATE POLICY "memberships_insert_admin" ON public.company_memberships FOR INSERT WITH CHECK (public.is_company_admin(company_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'company_memberships' AND policyname = 'memberships_update_admin') THEN
    CREATE POLICY "memberships_update_admin" ON public.company_memberships FOR UPDATE USING (public.is_company_admin(company_id));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'drivers' AND policyname = 'drivers_select_member') THEN
    CREATE POLICY "drivers_select_member" ON public.drivers FOR SELECT USING (public.is_company_member(company_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'drivers' AND policyname = 'drivers_all_admin') THEN
    CREATE POLICY "drivers_all_admin" ON public.drivers FOR ALL USING (public.is_company_admin(company_id));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vehicles' AND policyname = 'vehicles_select_member') THEN
    CREATE POLICY "vehicles_select_member" ON public.vehicles FOR SELECT USING (public.is_company_member(company_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vehicles' AND policyname = 'vehicles_all_admin') THEN
    CREATE POLICY "vehicles_all_admin" ON public.vehicles FOR ALL USING (public.is_company_admin(company_id));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'driver_documents' AND policyname = 'driver_docs_all_admin') THEN
    CREATE POLICY "driver_docs_all_admin" ON public.driver_documents FOR ALL
      USING (EXISTS (SELECT 1 FROM public.drivers d WHERE d.id = driver_id AND public.is_company_admin(d.company_id)));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'driver_documents' AND policyname = 'driver_docs_select_member') THEN
    CREATE POLICY "driver_docs_select_member" ON public.driver_documents FOR SELECT
      USING (EXISTS (SELECT 1 FROM public.drivers d WHERE d.id = driver_id AND public.is_company_member(d.company_id)));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vehicle_documents' AND policyname = 'vehicle_docs_all_admin') THEN
    CREATE POLICY "vehicle_docs_all_admin" ON public.vehicle_documents FOR ALL
      USING (EXISTS (SELECT 1 FROM public.vehicles v WHERE v.id = vehicle_id AND public.is_company_admin(v.company_id)));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vehicle_documents' AND policyname = 'vehicle_docs_select_member') THEN
    CREATE POLICY "vehicle_docs_select_member" ON public.vehicle_documents FOR SELECT
      USING (EXISTS (SELECT 1 FROM public.vehicles v WHERE v.id = vehicle_id AND public.is_company_member(v.company_id)));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'jobs' AND policyname = 'jobs_all_member') THEN
    CREATE POLICY "jobs_all_member" ON public.jobs FOR ALL USING (public.is_company_member(company_id));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'job_notes' AND policyname = 'job_notes_all_member') THEN
    CREATE POLICY "job_notes_all_member" ON public.job_notes FOR ALL
      USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND public.is_company_member(j.company_id)));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'job_documents' AND policyname = 'job_docs_all_member') THEN
    CREATE POLICY "job_docs_all_member" ON public.job_documents FOR ALL
      USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND public.is_company_member(j.company_id)));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'job_tracking_events' AND policyname = 'tracking_events_all_member') THEN
    CREATE POLICY "tracking_events_all_member" ON public.job_tracking_events FOR ALL
      USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND public.is_company_member(j.company_id)));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'job_bids' AND policyname = 'bids_all_member') THEN
    CREATE POLICY "bids_all_member" ON public.job_bids FOR ALL
      USING (company_id IS NULL OR public.is_company_member(company_id));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'driver_locations' AND policyname = 'driver_locations_all_member') THEN
    CREATE POLICY "driver_locations_all_member" ON public.driver_locations FOR ALL
      USING (EXISTS (SELECT 1 FROM public.drivers d WHERE d.id = driver_id AND public.is_company_member(d.company_id)));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'job_driver_distance_cache' AND policyname = 'distance_cache_all_member') THEN
    CREATE POLICY "distance_cache_all_member" ON public.job_driver_distance_cache FOR ALL
      USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND public.is_company_member(j.company_id)));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'quotes_all_member') THEN
    CREATE POLICY "quotes_all_member" ON public.quotes FOR ALL USING (public.is_company_member(company_id));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'diary_events' AND policyname = 'diary_events_all_member') THEN
    CREATE POLICY "diary_events_all_member" ON public.diary_events FOR ALL USING (public.is_company_member(company_id));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'return_journeys' AND policyname = 'return_journeys_all_member') THEN
    CREATE POLICY "return_journeys_all_member" ON public.return_journeys FOR ALL USING (public.is_company_member(company_id));
  END IF;
END $$;

-- ─── INDEXES ─────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_company_memberships_company_id ON public.company_memberships(company_id);
CREATE INDEX IF NOT EXISTS idx_company_memberships_user_id    ON public.company_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_company_id             ON public.drivers(company_id);
CREATE INDEX IF NOT EXISTS idx_drivers_user_id                ON public.drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_company_id            ON public.vehicles(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id                ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status                    ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_by                ON public.jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_job_bids_job_id                ON public.job_bids(job_id);
CREATE INDEX IF NOT EXISTS idx_job_bids_company_id            ON public.job_bids(company_id);
CREATE INDEX IF NOT EXISTS idx_job_tracking_events_job_id     ON public.job_tracking_events(job_id);
CREATE INDEX IF NOT EXISTS idx_driver_locations_driver_id     ON public.driver_locations(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_locations_recorded_at   ON public.driver_locations(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_company_id              ON public.quotes(company_id);
CREATE INDEX IF NOT EXISTS idx_diary_events_company_id        ON public.diary_events(company_id);
CREATE INDEX IF NOT EXISTS idx_return_journeys_company_id     ON public.return_journeys(company_id);

COMMIT;

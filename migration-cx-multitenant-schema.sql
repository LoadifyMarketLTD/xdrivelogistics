-- ================================================================
-- XDrive Logistics LTD — CX-style Multi-tenant Platform Schema
-- COMPANIES + DRIVERS + VEHICLES + DOCUMENT VERIFICATION + JOBS + BIDS
--
-- One-pass schema to stop "missing table/column" errors
-- and make ON CONFLICT work + prepare for CX-like features.
-- TARGET: Supabase Postgres (public schema) + auth.users (Supabase Auth)
--
-- Safe to run multiple times (idempotent).
-- Run in Supabase SQL Editor → New query → Run
-- ================================================================

BEGIN;

-- ================================================================
-- 1.1  Extensions
-- ================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ================================================================
-- 1.2  Enums  (guarded so re-runs are safe)
-- ================================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'company_role') THEN
    CREATE TYPE public.company_role AS ENUM (
      'owner', 'admin', 'dispatcher', 'driver', 'viewer'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_status') THEN
    CREATE TYPE public.membership_status AS ENUM (
      'active', 'invited', 'suspended', 'left'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'doc_status') THEN
    CREATE TYPE public.doc_status AS ENUM (
      'pending', 'uploaded', 'in_review', 'approved', 'rejected', 'expired'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
    CREATE TYPE public.job_status AS ENUM (
      'draft', 'published', 'booked', 'in_progress', 'delivered', 'cancelled'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cargo_type') THEN
    CREATE TYPE public.cargo_type AS ENUM (
      'palletized', 'boxed_cartons', 'bagged_sacks', 'loose_items',
      'furniture', 'equipment', 'mixed_load', 'other'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_type') THEN
    CREATE TYPE public.vehicle_type AS ENUM (
      'small_van', 'swb_van', 'mwb_van', 'lwb_van',
      'luton_van', '7_5t', 'hgv'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tracking_event_type') THEN
    CREATE TYPE public.tracking_event_type AS ENUM (
      'created', 'published', 'bid_placed', 'booked', 'driver_assigned',
      'en_route_pickup', 'arrived_pickup', 'loaded',
      'en_route_delivery', 'arrived_delivery', 'delivered',
      'cancelled', 'note'
    );
  END IF;
END $$;

-- ================================================================
-- 1.3  Core tables
-- ================================================================

-- profiles: one row per auth user
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  phone      TEXT,
  is_driver  BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- companies: each tenant
CREATE TABLE IF NOT EXISTS public.companies (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT        NOT NULL,
  company_number TEXT,
  vat_number     TEXT,
  email          TEXT,
  phone          TEXT,
  address_line1  TEXT,
  address_line2  TEXT,
  city           TEXT,
  postcode       TEXT,
  country        TEXT        DEFAULT 'UK',
  created_by     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- company_memberships: many-to-many users <-> companies
CREATE TABLE IF NOT EXISTS public.company_memberships (
  id               UUID                    PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       UUID                    NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id          UUID                    REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email    TEXT,
  role_in_company  public.company_role     NOT NULL DEFAULT 'viewer',
  status           public.membership_status NOT NULL DEFAULT 'invited',
  created_at       TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ             NOT NULL DEFAULT NOW()
);

-- Unique constraint for ON CONFLICT(company_id, user_id) to work
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'company_memberships_unique_company_user'
  ) THEN
    ALTER TABLE public.company_memberships
      ADD CONSTRAINT company_memberships_unique_company_user
      UNIQUE (company_id, user_id);
  END IF;
END $$;

-- Prevent duplicate invite emails per company (nulls are excluded automatically)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'company_memberships_unique_company_invite_email'
  ) THEN
    ALTER TABLE public.company_memberships
      ADD CONSTRAINT company_memberships_unique_company_invite_email
      UNIQUE (company_id, invited_email);
  END IF;
END $$;

-- ================================================================
-- 1.4  Drivers & Vehicles (company-owned)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.drivers (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   UUID        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id      UUID        REFERENCES auth.users(id) ON DELETE SET NULL, -- linked after user registers
  display_name TEXT,
  phone        TEXT,
  email        TEXT,
  status       TEXT        NOT NULL DEFAULT 'active',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vehicles (
  id                  UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID                NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  assigned_driver_id  UUID                REFERENCES public.drivers(id) ON DELETE SET NULL,
  type                public.vehicle_type NOT NULL,
  reg_plate           TEXT,
  make                TEXT,
  model               TEXT,
  payload_kg          INTEGER,
  pallets_capacity    INTEGER,
  has_tail_lift       BOOLEAN             DEFAULT FALSE,
  has_straps          BOOLEAN             DEFAULT TRUE,
  has_blankets        BOOLEAN             DEFAULT FALSE,
  created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- ================================================================
-- 1.5  Compliance documents (driver + vehicle)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.driver_documents (
  id               UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id        UUID              NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  doc_type         TEXT              NOT NULL, -- 'driving_licence','id','cpc','digi_tacho', etc.
  file_path        TEXT,
  issued_date      DATE,
  expiry_date      DATE,
  status           public.doc_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  verified_by      UUID              REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vehicle_documents (
  id               UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id       UUID              NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  doc_type         TEXT              NOT NULL, -- 'insurance','mot','v5','operator_licence','goods_in_transit'
  file_path        TEXT,
  issued_date      DATE,
  expiry_date      DATE,
  status           public.doc_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  verified_by      UUID              REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

-- ================================================================
-- 1.6  Jobs (Loads)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.jobs (
  id                    UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID                NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by            UUID                REFERENCES auth.users(id) ON DELETE SET NULL,

  status                public.job_status   NOT NULL DEFAULT 'draft',

  vehicle_type          public.vehicle_type NOT NULL,
  cargo_type            public.cargo_type   NOT NULL DEFAULT 'other',

  -- Pickup
  pickup_location       TEXT                NOT NULL,
  pickup_postcode       TEXT,
  pickup_lat            DOUBLE PRECISION,
  pickup_lng            DOUBLE PRECISION,
  pickup_datetime       TIMESTAMPTZ         NOT NULL,

  -- Delivery
  delivery_location     TEXT                NOT NULL,
  delivery_postcode     TEXT,
  delivery_lat          DOUBLE PRECISION,
  delivery_lng          DOUBLE PRECISION,
  delivery_datetime     TIMESTAMPTZ         NOT NULL,

  -- Cargo details (all optional)
  pallets               INTEGER,
  boxes                 INTEGER,
  bags                  INTEGER,
  items                 INTEGER,
  weight_kg             NUMERIC(10,2),
  length_cm             NUMERIC(10,2),
  width_cm              NUMERIC(10,2),
  height_cm             NUMERIC(10,2),

  -- Pricing
  currency              TEXT                NOT NULL DEFAULT 'GBP',
  budget_amount         NUMERIC(12,2),
  is_fixed_price        BOOLEAN             DEFAULT FALSE,

  load_details          TEXT,
  special_requirements  TEXT,
  access_restrictions   TEXT,

  -- Computed distances (stored by app layer)
  job_distance_miles    NUMERIC(10,2),
  job_distance_minutes  INTEGER,

  created_at            TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- Backwards-compat guard: if the jobs table already existed from an older migration
-- that omitted load_details, this ensures the column is present without re-running the full table creation.
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS load_details TEXT;

-- ================================================================
-- 1.7  Job documents (POD / photos / attachments)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.job_documents (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      UUID        NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  uploaded_by UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  doc_type    TEXT        NOT NULL DEFAULT 'other', -- 'pod','photo','invoice','note'
  file_path   TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
-- 1.8  Job tracking events
-- ================================================================

CREATE TABLE IF NOT EXISTS public.job_tracking_events (
  id          UUID                        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      UUID                        NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_by  UUID                        REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type  public.tracking_event_type  NOT NULL,
  message     TEXT,
  meta        JSONB,
  created_at  TIMESTAMPTZ                 NOT NULL DEFAULT NOW()
);

-- ================================================================
-- 1.9  Bids
-- ================================================================

CREATE TABLE IF NOT EXISTS public.job_bids (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id            UUID        NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  company_id        UUID        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  bidder_user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bidder_driver_id  UUID        REFERENCES public.drivers(id) ON DELETE SET NULL,
  amount            NUMERIC(12,2) NOT NULL,
  currency          TEXT        NOT NULL DEFAULT 'GBP',
  message           TEXT,
  status            TEXT        NOT NULL DEFAULT 'submitted',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_bids_job_id   ON public.job_bids(job_id);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id   ON public.jobs(company_id);

-- ================================================================
-- 1.10  Driver live location
-- ================================================================

CREATE TABLE IF NOT EXISTS public.driver_locations (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id   UUID          NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  heading     INTEGER,
  speed_mph   NUMERIC(8,2),
  recorded_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Cache of computed driver → pickup distances (app writes; UI reads)
CREATE TABLE IF NOT EXISTS public.job_driver_distance_cache (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id            UUID        NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  driver_id         UUID        NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  miles_to_pickup   NUMERIC(10,2),
  minutes_to_pickup INTEGER,
  computed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (job_id, driver_id)
);

-- ================================================================
-- 1.11  Quotes
-- ================================================================

CREATE TABLE IF NOT EXISTS public.quotes (
  id                UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID                NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by        UUID                REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name     TEXT,
  customer_email    TEXT,
  customer_phone    TEXT,
  pickup_location   TEXT,
  delivery_location TEXT,
  vehicle_type      public.vehicle_type,
  cargo_type        public.cargo_type,
  amount            NUMERIC(12,2),
  currency          TEXT                DEFAULT 'GBP',
  status            TEXT                DEFAULT 'draft',
  created_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- ================================================================
-- 1.12  Diary events & Return journeys
-- ================================================================

CREATE TABLE IF NOT EXISTS public.diary_events (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  driver_id  UUID        REFERENCES public.drivers(id) ON DELETE SET NULL,
  vehicle_id UUID        REFERENCES public.vehicles(id) ON DELETE SET NULL,
  title      TEXT        NOT NULL,
  start_at   TIMESTAMPTZ NOT NULL,
  end_at     TIMESTAMPTZ NOT NULL,
  meta       JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.return_journeys (
  id             UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id     UUID                NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  driver_id      UUID                REFERENCES public.drivers(id) ON DELETE SET NULL,
  vehicle_type   public.vehicle_type,
  from_postcode  TEXT,
  to_postcode    TEXT,
  available_from TIMESTAMPTZ,
  available_to   TIMESTAMPTZ,
  notes          TEXT,
  created_at     TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- ================================================================
-- 1.13  updated_at trigger function + per-table triggers
-- ================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_jobs_updated_at') THEN
    CREATE TRIGGER trg_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_company_memberships_updated_at') THEN
    CREATE TRIGGER trg_company_memberships_updated_at
    BEFORE UPDATE ON public.company_memberships
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_profiles_updated_at') THEN
    CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- ================================================================
-- 1.14  Auto-create profile on signup
-- ================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_on_auth_user_created') THEN
    CREATE TRIGGER trg_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- ================================================================
-- 1.15  Row-Level Security — enable on all tables
-- ================================================================

ALTER TABLE public.profiles                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_memberships      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_documents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_documents        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_documents            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_tracking_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_bids                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_locations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_driver_distance_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_events             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_journeys          ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- 1.16  Helper functions used by RLS policies
-- ================================================================

-- Returns true when the calling user is an active member of the given company
CREATE OR REPLACE FUNCTION public.is_company_member(p_company_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_memberships m
    WHERE m.company_id = p_company_id
      AND m.user_id    = auth.uid()
      AND m.status     = 'active'
  );
$$;

-- Returns true when the calling user is an active owner/admin of the given company
CREATE OR REPLACE FUNCTION public.is_company_admin(p_company_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_memberships m
    WHERE m.company_id      = p_company_id
      AND m.user_id         = auth.uid()
      AND m.status          = 'active'
      AND m.role_in_company IN ('owner', 'admin')
  );
$$;

-- ================================================================
-- 1.17  RLS Policies
-- ================================================================

-- ---- profiles ----
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- ---- companies ----
DROP POLICY IF EXISTS "companies_select_member" ON public.companies;
CREATE POLICY "companies_select_member" ON public.companies
  FOR SELECT USING (public.is_company_member(id));

-- ---- company_memberships ----
DROP POLICY IF EXISTS "memberships_select_member" ON public.company_memberships;
CREATE POLICY "memberships_select_member" ON public.company_memberships
  FOR SELECT USING (public.is_company_member(company_id));

DROP POLICY IF EXISTS "memberships_insert_admin" ON public.company_memberships;
CREATE POLICY "memberships_insert_admin" ON public.company_memberships
  FOR INSERT WITH CHECK (public.is_company_admin(company_id));

DROP POLICY IF EXISTS "memberships_update_admin" ON public.company_memberships;
CREATE POLICY "memberships_update_admin" ON public.company_memberships
  FOR UPDATE
  USING    (public.is_company_admin(company_id))
  WITH CHECK (public.is_company_admin(company_id));

-- ---- drivers ----
DROP POLICY IF EXISTS "drivers_select_member" ON public.drivers;
CREATE POLICY "drivers_select_member" ON public.drivers
  FOR SELECT USING (public.is_company_member(company_id));

DROP POLICY IF EXISTS "drivers_write_admin" ON public.drivers;
CREATE POLICY "drivers_write_admin" ON public.drivers
  FOR ALL
  USING    (public.is_company_admin(company_id))
  WITH CHECK (public.is_company_admin(company_id));

-- ---- vehicles ----
DROP POLICY IF EXISTS "vehicles_select_member" ON public.vehicles;
CREATE POLICY "vehicles_select_member" ON public.vehicles
  FOR SELECT USING (public.is_company_member(company_id));

DROP POLICY IF EXISTS "vehicles_write_admin" ON public.vehicles;
CREATE POLICY "vehicles_write_admin" ON public.vehicles
  FOR ALL
  USING    (public.is_company_admin(company_id))
  WITH CHECK (public.is_company_admin(company_id));

-- ---- driver_documents ----
DROP POLICY IF EXISTS "driver_docs_select_member" ON public.driver_documents;
CREATE POLICY "driver_docs_select_member" ON public.driver_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.drivers d
      WHERE d.id = driver_id AND public.is_company_member(d.company_id)
    )
  );

DROP POLICY IF EXISTS "driver_docs_write_admin" ON public.driver_documents;
CREATE POLICY "driver_docs_write_admin" ON public.driver_documents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.drivers d
      WHERE d.id = driver_id AND public.is_company_admin(d.company_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.drivers d
      WHERE d.id = driver_id AND public.is_company_admin(d.company_id)
    )
  );

-- ---- vehicle_documents ----
DROP POLICY IF EXISTS "vehicle_docs_select_member" ON public.vehicle_documents;
CREATE POLICY "vehicle_docs_select_member" ON public.vehicle_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.vehicles v
      WHERE v.id = vehicle_id AND public.is_company_member(v.company_id)
    )
  );

DROP POLICY IF EXISTS "vehicle_docs_write_admin" ON public.vehicle_documents;
CREATE POLICY "vehicle_docs_write_admin" ON public.vehicle_documents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.vehicles v
      WHERE v.id = vehicle_id AND public.is_company_admin(v.company_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vehicles v
      WHERE v.id = vehicle_id AND public.is_company_admin(v.company_id)
    )
  );

-- ---- jobs ----
DROP POLICY IF EXISTS "jobs_select_member" ON public.jobs;
CREATE POLICY "jobs_select_member" ON public.jobs
  FOR SELECT USING (public.is_company_member(company_id));

DROP POLICY IF EXISTS "jobs_insert_member" ON public.jobs;
CREATE POLICY "jobs_insert_member" ON public.jobs
  FOR INSERT WITH CHECK (public.is_company_member(company_id));

DROP POLICY IF EXISTS "jobs_update_admin" ON public.jobs;
CREATE POLICY "jobs_update_admin" ON public.jobs
  FOR UPDATE
  USING    (public.is_company_admin(company_id))
  WITH CHECK (public.is_company_admin(company_id));

DROP POLICY IF EXISTS "jobs_delete_admin" ON public.jobs;
CREATE POLICY "jobs_delete_admin" ON public.jobs
  FOR DELETE USING (public.is_company_admin(company_id));

-- ---- job_documents ----
DROP POLICY IF EXISTS "job_docs_select_member" ON public.job_documents;
CREATE POLICY "job_docs_select_member" ON public.job_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id AND public.is_company_member(j.company_id)
    )
  );

DROP POLICY IF EXISTS "job_docs_write_member" ON public.job_documents;
CREATE POLICY "job_docs_write_member" ON public.job_documents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id AND public.is_company_member(j.company_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id AND public.is_company_member(j.company_id)
    )
  );

-- ---- job_tracking_events ----
DROP POLICY IF EXISTS "tracking_events_select_member" ON public.job_tracking_events;
CREATE POLICY "tracking_events_select_member" ON public.job_tracking_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id AND public.is_company_member(j.company_id)
    )
  );

DROP POLICY IF EXISTS "tracking_events_write_member" ON public.job_tracking_events;
CREATE POLICY "tracking_events_write_member" ON public.job_tracking_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id AND public.is_company_member(j.company_id)
    )
  );

-- ---- job_bids ----
DROP POLICY IF EXISTS "bids_select_member" ON public.job_bids;
CREATE POLICY "bids_select_member" ON public.job_bids
  FOR SELECT USING (public.is_company_member(company_id));

DROP POLICY IF EXISTS "bids_insert_member" ON public.job_bids;
CREATE POLICY "bids_insert_member" ON public.job_bids
  FOR INSERT WITH CHECK (
    public.is_company_member(company_id)
    AND bidder_user_id = auth.uid()
  );

-- ---- driver_locations ----
DROP POLICY IF EXISTS "driver_locations_select_member" ON public.driver_locations;
CREATE POLICY "driver_locations_select_member" ON public.driver_locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.drivers d
      WHERE d.id = driver_id AND public.is_company_member(d.company_id)
    )
  );

DROP POLICY IF EXISTS "driver_locations_write_driver" ON public.driver_locations;
CREATE POLICY "driver_locations_write_driver" ON public.driver_locations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.drivers d
      WHERE d.id = driver_id AND public.is_company_member(d.company_id)
    )
  );

-- ---- job_driver_distance_cache ----
DROP POLICY IF EXISTS "distance_cache_select_member" ON public.job_driver_distance_cache;
CREATE POLICY "distance_cache_select_member" ON public.job_driver_distance_cache
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id AND public.is_company_member(j.company_id)
    )
  );

DROP POLICY IF EXISTS "distance_cache_write_member" ON public.job_driver_distance_cache;
CREATE POLICY "distance_cache_write_member" ON public.job_driver_distance_cache
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id AND public.is_company_member(j.company_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id AND public.is_company_member(j.company_id)
    )
  );

-- ---- quotes ----
DROP POLICY IF EXISTS "quotes_select_member" ON public.quotes;
CREATE POLICY "quotes_select_member" ON public.quotes
  FOR SELECT USING (public.is_company_member(company_id));

DROP POLICY IF EXISTS "quotes_write_admin" ON public.quotes;
CREATE POLICY "quotes_write_admin" ON public.quotes
  FOR ALL
  USING    (public.is_company_admin(company_id))
  WITH CHECK (public.is_company_admin(company_id));

-- ---- diary_events ----
DROP POLICY IF EXISTS "diary_events_select_member" ON public.diary_events;
CREATE POLICY "diary_events_select_member" ON public.diary_events
  FOR SELECT USING (public.is_company_member(company_id));

DROP POLICY IF EXISTS "diary_events_write_member" ON public.diary_events;
CREATE POLICY "diary_events_write_member" ON public.diary_events
  FOR ALL
  USING    (public.is_company_member(company_id))
  WITH CHECK (public.is_company_member(company_id));

-- ---- return_journeys ----
DROP POLICY IF EXISTS "return_journeys_select_member" ON public.return_journeys;
CREATE POLICY "return_journeys_select_member" ON public.return_journeys
  FOR SELECT USING (public.is_company_member(company_id));

DROP POLICY IF EXISTS "return_journeys_write_member" ON public.return_journeys;
CREATE POLICY "return_journeys_write_member" ON public.return_journeys
  FOR ALL
  USING    (public.is_company_member(company_id))
  WITH CHECK (public.is_company_member(company_id));

COMMIT;

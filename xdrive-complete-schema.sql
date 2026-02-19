-- ============================================================
-- XDrive Logistics LTD - COMPLETE DATABASE SCHEMA
-- Copy this entire file and run it in Supabase SQL Editor
-- Safe to run multiple times (idempotent)
-- ============================================================

BEGIN;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- HELPER: updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id                       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                    TEXT UNIQUE NOT NULL,
  full_name                TEXT,
  first_name               TEXT,
  last_name                TEXT,
  phone                    TEXT,
  phone_2                  TEXT,
  company_id               UUID,
  role                     TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'dispatcher', 'driver', 'viewer')),
  job_title                TEXT,
  department               TEXT,
  time_zone                TEXT DEFAULT 'Europe/London',
  is_active                BOOLEAN DEFAULT true,
  is_driver                BOOLEAN DEFAULT false,
  web_login_allowed        BOOLEAN DEFAULT true,
  email_visible_to_members BOOLEAN DEFAULT false,
  has_mobile_account       BOOLEAN DEFAULT false,
  mobile_option            TEXT DEFAULT 'none',
  username                 TEXT UNIQUE,
  logo_url                 TEXT,
  interface_language       TEXT DEFAULT 'en',
  created_at               TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at               TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_profiles_email      ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);

-- ============================================================
-- 2. COMPANIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.companies (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  email          TEXT,
  phone          TEXT,
  vat_number     TEXT,
  company_number TEXT,
  address_line1  TEXT,
  address_line2  TEXT,
  city           TEXT,
  postcode       TEXT,
  country        TEXT,
  created_by     UUID REFERENCES auth.users(id),
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_company_id_fkey;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;

DROP TRIGGER IF EXISTS companies_updated_at ON public.companies;
CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_companies_created_by ON public.companies(created_by);

-- ============================================================
-- 3. COMPANY_MEMBERSHIPS (multi-user per company)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.company_memberships (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_in_company TEXT NOT NULL DEFAULT 'member'
    CHECK (role_in_company IN ('owner', 'admin', 'member')),
  status          TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'invited', 'disabled')),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (company_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_company_user ON public.company_memberships(company_id, user_id);

-- ============================================================
-- 4. USER_SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                   UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  show_notification_bar     BOOLEAN DEFAULT true,
  enable_load_alerts        BOOLEAN DEFAULT true,
  send_booking_confirmation BOOLEAN DEFAULT true,
  enroute_alert_hours       INTEGER DEFAULT 2,
  alert_distance_uk_miles   INTEGER DEFAULT 50,
  alert_distance_euro_miles INTEGER DEFAULT 100,
  despatch_group            TEXT,
  created_at                TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at                TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS user_settings_updated_at ON public.user_settings;
CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 5. USER_ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_name  TEXT NOT NULL CHECK (role_name IN (
    'Company Admin', 'Company User', 'Finance Director',
    'Finance Bookkeeper', 'Driver', 'Dispatcher', 'Viewer'
  )),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role_name)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- ============================================================
-- 6. DRIVERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.drivers (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id     UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name      TEXT NOT NULL,
  phone          TEXT,
  email          TEXT,
  license_number TEXT,
  is_active      BOOLEAN DEFAULT true,
  notes          TEXT,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS drivers_updated_at ON public.drivers;
CREATE TRIGGER drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_drivers_company_id ON public.drivers(company_id);
CREATE INDEX IF NOT EXISTS idx_drivers_is_active  ON public.drivers(is_active);

-- ============================================================
-- 7. VEHICLES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.vehicles (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id            UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  vehicle_type          TEXT NOT NULL,
  registration          TEXT NOT NULL,
  make                  TEXT,
  model                 TEXT,
  year                  INTEGER,
  body_type             TEXT,
  vehicle_size          TEXT,
  -- Capacity
  max_weight_kg         NUMERIC,
  loading_capacity_m3   NUMERIC,
  length_m              NUMERIC,
  width_m               NUMERIC,
  height_m              NUMERIC,
  -- References
  vehicle_reference     TEXT,
  internal_reference    TEXT,
  telematics_id         TEXT,
  vin                   TEXT,
  -- Features
  has_livery            BOOLEAN DEFAULT false,
  has_tail_lift         BOOLEAN DEFAULT false,
  has_hiab              BOOLEAN DEFAULT false,
  has_trailer           BOOLEAN DEFAULT false,
  has_moffet_mounty     BOOLEAN DEFAULT false,
  -- Tracking / availability
  is_available          BOOLEAN DEFAULT true,
  is_tracked            BOOLEAN DEFAULT false,
  current_status        TEXT DEFAULT 'available',
  current_location      TEXT,
  last_tracked_at       TIMESTAMP WITH TIME ZONE,
  driver_name           TEXT,
  future_position       TEXT,
  future_journey        TEXT,
  advertise_to          TEXT DEFAULT 'nobody',
  notify_when           TEXT,
  notify_when_tracked   BOOLEAN DEFAULT false,
  notes                 TEXT,
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS vehicles_updated_at ON public.vehicles;
CREATE TRIGGER vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_vehicles_company_id ON public.vehicles(company_id);

-- ============================================================
-- 8. JOBS (marketplace job postings)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.jobs (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Core marketplace fields
  posted_by_company_id  UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  -- status: marketplace lifecycle (open → assigned → in-transit → completed/cancelled)
  status                TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'assigned', 'in-transit', 'completed', 'cancelled')),
  -- current_status: driver workflow sequence (ALLOCATED → ON_MY_WAY_TO_PICKUP → … → DELIVERED)
  current_status        TEXT DEFAULT 'ALLOCATED'
    CHECK (current_status IN (
      'ALLOCATED', 'ON_MY_WAY_TO_PICKUP', 'ON_SITE_PICKUP',
      'LOADED', 'ON_MY_WAY_TO_DELIVERY', 'ON_SITE_DELIVERY',
      'DELIVERED', 'CANCELLED'
    )),
  status_updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Locations
  pickup_location       TEXT NOT NULL,
  delivery_location     TEXT NOT NULL,
  pickup_datetime       TIMESTAMP WITH TIME ZONE,
  delivery_datetime     TIMESTAMP WITH TIME ZONE,
  pickup_address_line1  TEXT,
  pickup_address_line2  TEXT,
  pickup_city           TEXT,
  pickup_postcode       TEXT,
  pickup_country        TEXT DEFAULT 'UK',
  delivery_address_line1 TEXT,
  delivery_address_line2 TEXT,
  delivery_city         TEXT,
  delivery_postcode     TEXT,
  delivery_country      TEXT DEFAULT 'UK',
  distance_miles        NUMERIC,

  -- Vehicle / cargo
  vehicle_type          TEXT,
  assigned_vehicle_type TEXT,
  load_details          TEXT,
  load_notes            TEXT,
  packaging             TEXT,
  cargo_type            TEXT,
  pallets               INTEGER,
  boxes                 INTEGER,
  bags                  INTEGER,
  items                 INTEGER,
  weight_kg             NUMERIC,
  length_cm             NUMERIC,
  width_cm              NUMERIC,
  height_cm             NUMERIC,

  -- Financials
  budget                NUMERIC,
  agreed_rate           NUMERIC,
  payment_terms         TEXT,
  smartpay_enabled      BOOLEAN DEFAULT false,

  -- References
  load_id               TEXT,
  your_ref              TEXT,
  cust_ref              TEXT,
  vehicle_ref           TEXT,

  -- Assignment
  assigned_company_id   UUID REFERENCES public.companies(id),
  accepted_bid_id       UUID,
  driver_id             UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- auth user ID of assigned driver
  assigned_driver_id    TEXT, -- human-readable or external driver reference
  booked_by_company_name  TEXT,
  booked_by_company_ref   TEXT,
  booked_by_company_phone TEXT,
  booked_by_company_email TEXT,

  -- Delivery completion
  on_my_way             TIMESTAMP WITH TIME ZONE,
  loaded_at             TIMESTAMP WITH TIME ZONE,
  on_site_pickup        TIMESTAMP WITH TIME ZONE,
  on_site_delivery      TIMESTAMP WITH TIME ZONE,
  delivered_on          TIMESTAMP WITH TIME ZONE,
  received_by           TEXT,
  left_at               TEXT,
  no_of_items           INTEGER,
  delivery_status       TEXT,
  pod_notes             TEXT,
  completed_by_name     TEXT,
  completed_at          TIMESTAMP WITH TIME ZONE,
  pod_required          BOOLEAN DEFAULT false,

  -- Evidence / POD flags (auto-managed by triggers)
  has_pickup_evidence   BOOLEAN DEFAULT false,
  has_delivery_evidence BOOLEAN DEFAULT false,
  pod_generated         BOOLEAN DEFAULT false,
  pod_generated_at      TIMESTAMP WITH TIME ZONE
);

DROP TRIGGER IF EXISTS jobs_updated_at ON public.jobs;
CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-set status_updated_at when current_status changes
CREATE OR REPLACE FUNCTION public.jobs_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.current_status IS DISTINCT FROM NEW.current_status THEN
    NEW.status_updated_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS jobs_current_status_updated_at ON public.jobs;
CREATE TRIGGER jobs_current_status_updated_at
  BEFORE UPDATE OF current_status ON public.jobs
  FOR EACH ROW
  WHEN (OLD.current_status IS DISTINCT FROM NEW.current_status)
  EXECUTE FUNCTION public.jobs_status_updated_at();

CREATE INDEX IF NOT EXISTS idx_jobs_status         ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_current_status ON public.jobs(current_status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at     ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by      ON public.jobs(posted_by_company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_to    ON public.jobs(assigned_company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_driver_id      ON public.jobs(driver_id);

-- ============================================================
-- 9. JOB_BIDS (marketplace bidding)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_bids (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  job_id             UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  bidder_company_id  UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  bidder_user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quote_amount       NUMERIC NOT NULL,
  message            TEXT,
  status             TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'withdrawn', 'rejected', 'accepted'))
);

DROP TRIGGER IF EXISTS job_bids_updated_at ON public.job_bids;
CREATE TRIGGER job_bids_updated_at
  BEFORE UPDATE ON public.job_bids
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_job_bids_job_id    ON public.job_bids(job_id);
CREATE INDEX IF NOT EXISTS idx_job_bids_company   ON public.job_bids(bidder_company_id);
CREATE INDEX IF NOT EXISTS idx_job_bids_status    ON public.job_bids(status);

-- ============================================================
-- 10. JOB_STATUS_EVENTS (status change audit trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_status_events (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id     UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  status     TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes      TEXT,
  location   JSONB,
  actor_type TEXT CHECK (actor_type IN ('driver', 'admin', 'company_admin')),
  -- 'timestamp' mirrors changed_at for compatibility with legacy app queries
  timestamp  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_status_events_job_id ON public.job_status_events(job_id);
CREATE INDEX IF NOT EXISTS idx_job_status_events_time   ON public.job_status_events(changed_at DESC);

-- ============================================================
-- 11. JOB_TRACKING_EVENTS (driver location events)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_tracking_events (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id     UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'on_my_way_to_pickup', 'on_site_pickup', 'loaded',
    'on_my_way_to_delivery', 'on_site_delivery', 'delivered'
  )),
  event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name  TEXT,
  notes      TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_tracking_events_job_id ON public.job_tracking_events(job_id);

-- ============================================================
-- 12. JOB_EVIDENCE (photos, signatures, files)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_evidence (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id               UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  uploaded_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_url             TEXT NOT NULL,
  file_name            TEXT,
  file_size            BIGINT,
  mime_type            TEXT,
  evidence_type        TEXT,
  phase                TEXT CHECK (phase IN ('pickup', 'delivery')),
  notes                TEXT,
  receiver_name        TEXT,
  receiver_signature_url TEXT,
  uploaded_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at           TIMESTAMP WITH TIME ZONE,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS job_evidence_updated_at ON public.job_evidence;
CREATE TRIGGER job_evidence_updated_at
  BEFORE UPDATE ON public.job_evidence
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_job_evidence_job_id ON public.job_evidence(job_id);
CREATE INDEX IF NOT EXISTS idx_job_evidence_phase  ON public.job_evidence(phase);

-- Auto-update has_pickup_evidence / has_delivery_evidence on jobs
CREATE OR REPLACE FUNCTION public.sync_job_evidence_flags()
RETURNS TRIGGER AS $$
DECLARE
  pickup_count   INT;
  delivery_count INT;
  target_job_id  UUID;
BEGIN
  target_job_id := COALESCE(NEW.job_id, OLD.job_id);
  SELECT COUNT(*) INTO pickup_count   FROM public.job_evidence WHERE job_id = target_job_id AND phase = 'pickup'   AND deleted_at IS NULL;
  SELECT COUNT(*) INTO delivery_count FROM public.job_evidence WHERE job_id = target_job_id AND phase = 'delivery' AND deleted_at IS NULL;
  UPDATE public.jobs
    SET has_pickup_evidence   = (pickup_count > 0),
        has_delivery_evidence = (delivery_count > 0)
  WHERE id = target_job_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_job_evidence_flags_trigger ON public.job_evidence;
CREATE TRIGGER sync_job_evidence_flags_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.job_evidence
  FOR EACH ROW EXECUTE FUNCTION public.sync_job_evidence_flags();

-- ============================================================
-- 13. JOB_POD (electronic proof of delivery documents)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_pod (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id       UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  version      INTEGER NOT NULL DEFAULT 1,
  pdf_url      TEXT,
  page_count   INTEGER,
  metadata     JSONB,
  is_latest    BOOLEAN DEFAULT true,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_pod_job_id       ON public.job_pod(job_id);
CREATE INDEX IF NOT EXISTS idx_job_pod_generated_at ON public.job_pod(generated_at DESC);

-- Auto-update pod_generated flag on jobs
CREATE OR REPLACE FUNCTION public.update_pod_generated_flag()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.jobs
    SET pod_generated    = true,
        pod_generated_at = NEW.generated_at
  WHERE id = NEW.job_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_pod_generated_flag_trigger ON public.job_pod;
CREATE TRIGGER update_pod_generated_flag_trigger
  AFTER INSERT ON public.job_pod
  FOR EACH ROW EXECUTE FUNCTION public.update_pod_generated_flag();

-- ============================================================
-- 14. PROOF_OF_DELIVERY (structured POD record)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.proof_of_delivery (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id           UUID NOT NULL UNIQUE REFERENCES public.jobs(id) ON DELETE CASCADE,
  delivered_on     TIMESTAMP WITH TIME ZONE,
  received_by      TEXT,
  left_at          TEXT,
  no_of_items      INTEGER,
  delivery_status  TEXT CHECK (delivery_status IN (
    'Completed Delivery', 'Partial Delivery', 'Failed Delivery', 'Refused', 'Left Safe'
  )),
  delivery_notes   TEXT,
  signature_url    TEXT,
  photo_urls       TEXT[],
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS proof_of_delivery_updated_at ON public.proof_of_delivery;
CREATE TRIGGER proof_of_delivery_updated_at
  BEFORE UPDATE ON public.proof_of_delivery
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_pod_job_id ON public.proof_of_delivery(job_id);

-- ============================================================
-- 15. JOB_DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_documents (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id        UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  document_type TEXT CHECK (document_type IN (
    'POD', 'Invoice', 'Delivery Note', 'CMR', 'Photo', 'Other'
  )),
  document_url  TEXT NOT NULL,
  document_name TEXT NOT NULL,
  uploaded_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_documents_job_id ON public.job_documents(job_id);

-- ============================================================
-- 16. JOB_NOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_notes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id          UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  note_type       TEXT DEFAULT 'General' CHECK (note_type IN (
    'General', 'Status Update', 'Customer Communication', 'Internal', 'Issue', 'Resolution'
  )),
  note_text       TEXT NOT NULL,
  is_internal     BOOLEAN DEFAULT false,
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_name TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_notes_job_id ON public.job_notes(job_id);

-- ============================================================
-- 17. INVOICES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id                UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  invoice_number            VARCHAR(20) UNIQUE NOT NULL,
  job_id                    UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  customer_name             TEXT NOT NULL,
  customer_email            TEXT,
  amount                    DECIMAL(10,2) NOT NULL,
  vat_amount                DECIMAL(10,2) DEFAULT 0,
  total_amount              DECIMAL(10,2) GENERATED ALWAYS AS (amount + COALESCE(vat_amount, 0)) STORED,
  status                    TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'paid', 'overdue', 'cancelled')),
  issue_date                DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date                  DATE NOT NULL,
  paid_date                 DATE,
  payment_terms             TEXT,
  smartpay_transaction_id   TEXT,
  invoice_url               TEXT,
  notes                     TEXT,
  created_at                TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at                TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-generate invoice number
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1001;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-'
      || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_invoice_number ON public.invoices;
CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.generate_invoice_number();

DROP TRIGGER IF EXISTS invoices_updated_at ON public.invoices;
CREATE TRIGGER invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON public.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_job_id     ON public.invoices(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status     ON public.invoices(status);

-- ============================================================
-- 18. RPC: create_company (called from app onboarding)
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_company(
  company_name TEXT,
  phone        TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_company_id UUID;
  user_id        UUID;
BEGIN
  user_id := auth.uid();
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.profiles WHERE id = user_id AND company_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'User already belongs to a company';
  END IF;
  INSERT INTO public.companies (name, phone, created_by)
  VALUES (company_name, phone, user_id)
  RETURNING id INTO new_company_id;
  UPDATE public.profiles SET company_id = new_company_id WHERE id = user_id;
  RETURN new_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 19. RLS HELPER: is the current user a member of a company?
-- ============================================================
DROP FUNCTION IF EXISTS public.is_company_member(uuid);
CREATE OR REPLACE FUNCTION public.is_company_member(p_company_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_memberships
    WHERE company_id = p_company_id AND user_id = auth.uid() AND status = 'active'
  ) OR EXISTS (
    SELECT 1 FROM public.companies
    WHERE id = p_company_id AND created_by = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND company_id = p_company_id
  );
$$;

-- ============================================================
-- 20. ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_bids          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_evidence      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_pod           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proof_of_delivery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_documents     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_notes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices          ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 21. RLS POLICIES
-- ============================================================

-- PROFILES
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- COMPANIES
DROP POLICY IF EXISTS "companies_select_member" ON public.companies;
CREATE POLICY "companies_select_member" ON public.companies
  FOR SELECT USING (public.is_company_member(id));

DROP POLICY IF EXISTS "companies_insert_owner" ON public.companies;
CREATE POLICY "companies_insert_owner" ON public.companies
  FOR INSERT WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "companies_update_owner" ON public.companies;
CREATE POLICY "companies_update_owner" ON public.companies
  FOR UPDATE USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

-- COMPANY MEMBERSHIPS
DROP POLICY IF EXISTS "memberships_select_company" ON public.company_memberships;
CREATE POLICY "memberships_select_company" ON public.company_memberships
  FOR SELECT USING (public.is_company_member(company_id));

DROP POLICY IF EXISTS "memberships_insert_owner_admin" ON public.company_memberships;
CREATE POLICY "memberships_insert_owner_admin" ON public.company_memberships
  FOR INSERT WITH CHECK (public.is_company_member(company_id));

-- USER SETTINGS
DROP POLICY IF EXISTS "user_settings_own" ON public.user_settings;
CREATE POLICY "user_settings_own" ON public.user_settings
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- USER ROLES
DROP POLICY IF EXISTS "user_roles_own" ON public.user_roles;
CREATE POLICY "user_roles_own" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_roles_company_admin" ON public.user_roles;
CREATE POLICY "user_roles_company_admin" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.company_id IN (
        SELECT company_id FROM public.profiles WHERE id = user_roles.user_id
      )
    )
  );

-- DRIVERS
DROP POLICY IF EXISTS "drivers_company" ON public.drivers;
CREATE POLICY "drivers_company" ON public.drivers
  FOR ALL USING (public.is_company_member(company_id))
  WITH CHECK (public.is_company_member(company_id));

-- VEHICLES
DROP POLICY IF EXISTS "vehicles_company" ON public.vehicles;
CREATE POLICY "vehicles_company" ON public.vehicles
  FOR ALL USING (public.is_company_member(company_id))
  WITH CHECK (public.is_company_member(company_id));

-- JOBS: open jobs visible to all authenticated users; full CRUD for poster company
DROP POLICY IF EXISTS "jobs_select" ON public.jobs;
CREATE POLICY "jobs_select" ON public.jobs
  FOR SELECT USING (
    status = 'open'
    OR public.is_company_member(posted_by_company_id)
    OR public.is_company_member(assigned_company_id)
    OR driver_id = auth.uid()
  );

DROP POLICY IF EXISTS "jobs_insert" ON public.jobs;
CREATE POLICY "jobs_insert" ON public.jobs
  FOR INSERT WITH CHECK (public.is_company_member(posted_by_company_id));

DROP POLICY IF EXISTS "jobs_update" ON public.jobs;
CREATE POLICY "jobs_update" ON public.jobs
  FOR UPDATE USING (
    public.is_company_member(posted_by_company_id)
    OR driver_id = auth.uid()
  );

DROP POLICY IF EXISTS "jobs_delete" ON public.jobs;
CREATE POLICY "jobs_delete" ON public.jobs
  FOR DELETE USING (public.is_company_member(posted_by_company_id));

-- JOB_BIDS: bidder company + poster company can see bids
DROP POLICY IF EXISTS "job_bids_select" ON public.job_bids;
CREATE POLICY "job_bids_select" ON public.job_bids
  FOR SELECT USING (
    public.is_company_member(bidder_company_id)
    OR EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_bids.job_id AND public.is_company_member(j.posted_by_company_id)
    )
  );

DROP POLICY IF EXISTS "job_bids_insert" ON public.job_bids;
CREATE POLICY "job_bids_insert" ON public.job_bids
  FOR INSERT WITH CHECK (
    public.is_company_member(bidder_company_id) AND bidder_user_id = auth.uid()
  );

DROP POLICY IF EXISTS "job_bids_update" ON public.job_bids;
CREATE POLICY "job_bids_update" ON public.job_bids
  FOR UPDATE USING (
    public.is_company_member(bidder_company_id)
    OR EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_bids.job_id AND public.is_company_member(j.posted_by_company_id)
    )
  );

-- JOB_STATUS_EVENTS: visible to job's poster + assigned company + driver
DROP POLICY IF EXISTS "job_status_events_select" ON public.job_status_events;
CREATE POLICY "job_status_events_select" ON public.job_status_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_status_events.job_id
      AND (
        public.is_company_member(j.posted_by_company_id)
        OR public.is_company_member(j.assigned_company_id)
        OR j.driver_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "job_status_events_insert" ON public.job_status_events;
CREATE POLICY "job_status_events_insert" ON public.job_status_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_status_events.job_id
      AND (
        public.is_company_member(j.posted_by_company_id)
        OR j.driver_id = auth.uid()
      )
    )
  );

-- JOB_TRACKING_EVENTS
DROP POLICY IF EXISTS "job_tracking_events_select" ON public.job_tracking_events;
CREATE POLICY "job_tracking_events_select" ON public.job_tracking_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_tracking_events.job_id
      AND (
        public.is_company_member(j.posted_by_company_id)
        OR public.is_company_member(j.assigned_company_id)
        OR j.driver_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "job_tracking_events_insert" ON public.job_tracking_events;
CREATE POLICY "job_tracking_events_insert" ON public.job_tracking_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_tracking_events.job_id
      AND (j.driver_id = auth.uid() OR public.is_company_member(j.posted_by_company_id))
    )
  );

-- JOB_EVIDENCE
DROP POLICY IF EXISTS "job_evidence_select" ON public.job_evidence;
CREATE POLICY "job_evidence_select" ON public.job_evidence
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_evidence.job_id
      AND (
        public.is_company_member(j.posted_by_company_id)
        OR public.is_company_member(j.assigned_company_id)
        OR j.driver_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "job_evidence_insert" ON public.job_evidence;
CREATE POLICY "job_evidence_insert" ON public.job_evidence
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_evidence.job_id
      AND (j.driver_id = auth.uid() OR public.is_company_member(j.posted_by_company_id))
    )
  );

DROP POLICY IF EXISTS "job_evidence_update" ON public.job_evidence;
CREATE POLICY "job_evidence_update" ON public.job_evidence
  FOR UPDATE USING (
    uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_evidence.job_id
      AND public.is_company_member(j.posted_by_company_id)
    )
  );

-- JOB_POD
DROP POLICY IF EXISTS "job_pod_select" ON public.job_pod;
CREATE POLICY "job_pod_select" ON public.job_pod
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_pod.job_id
      AND (
        public.is_company_member(j.posted_by_company_id)
        OR public.is_company_member(j.assigned_company_id)
        OR j.driver_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "job_pod_insert" ON public.job_pod;
CREATE POLICY "job_pod_insert" ON public.job_pod
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_pod.job_id
      AND public.is_company_member(j.posted_by_company_id)
    )
  );

DROP POLICY IF EXISTS "job_pod_update" ON public.job_pod;
CREATE POLICY "job_pod_update" ON public.job_pod
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_pod.job_id
      AND public.is_company_member(j.posted_by_company_id)
    )
  );

-- PROOF_OF_DELIVERY
DROP POLICY IF EXISTS "proof_of_delivery_select" ON public.proof_of_delivery;
CREATE POLICY "proof_of_delivery_select" ON public.proof_of_delivery
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = proof_of_delivery.job_id
      AND (
        public.is_company_member(j.posted_by_company_id)
        OR public.is_company_member(j.assigned_company_id)
        OR j.driver_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "proof_of_delivery_insert" ON public.proof_of_delivery;
CREATE POLICY "proof_of_delivery_insert" ON public.proof_of_delivery
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = proof_of_delivery.job_id
      AND (j.driver_id = auth.uid() OR public.is_company_member(j.posted_by_company_id))
    )
  );

DROP POLICY IF EXISTS "proof_of_delivery_update" ON public.proof_of_delivery;
CREATE POLICY "proof_of_delivery_update" ON public.proof_of_delivery
  FOR UPDATE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = proof_of_delivery.job_id
      AND public.is_company_member(j.posted_by_company_id)
    )
  );

-- JOB_DOCUMENTS
DROP POLICY IF EXISTS "job_documents_select" ON public.job_documents;
CREATE POLICY "job_documents_select" ON public.job_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_documents.job_id
      AND (
        public.is_company_member(j.posted_by_company_id)
        OR public.is_company_member(j.assigned_company_id)
      )
    )
  );

DROP POLICY IF EXISTS "job_documents_insert" ON public.job_documents;
CREATE POLICY "job_documents_insert" ON public.job_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_documents.job_id
      AND (
        public.is_company_member(j.posted_by_company_id)
        OR j.driver_id = auth.uid()
      )
    )
  );

-- JOB_NOTES
DROP POLICY IF EXISTS "job_notes_select" ON public.job_notes;
CREATE POLICY "job_notes_select" ON public.job_notes
  FOR SELECT USING (
    is_internal = false
    OR EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_notes.job_id
      AND public.is_company_member(j.posted_by_company_id)
    )
  );

DROP POLICY IF EXISTS "job_notes_insert" ON public.job_notes;
CREATE POLICY "job_notes_insert" ON public.job_notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_notes.job_id
      AND (
        public.is_company_member(j.posted_by_company_id)
        OR j.driver_id = auth.uid()
      )
    )
  );

-- INVOICES
DROP POLICY IF EXISTS "invoices_company" ON public.invoices;
CREATE POLICY "invoices_company" ON public.invoices
  FOR ALL USING (public.is_company_member(company_id))
  WITH CHECK (public.is_company_member(company_id));

-- ============================================================
-- DONE
-- ============================================================
-- Tables created:
--   profiles, companies, company_memberships
--   user_settings, user_roles
--   drivers, vehicles
--   jobs, job_bids
--   job_status_events, job_tracking_events
--   job_evidence, job_pod
--   proof_of_delivery, job_documents, job_notes
--   invoices
-- ============================================================

COMMIT;

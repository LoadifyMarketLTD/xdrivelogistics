-- ============================================================
-- XDRIVE LOGISTICS LTD — SCHEMA SQL COMPLET
-- Copiaţi tot acest fişier şi rulaţi-l în Supabase SQL Editor
-- Dashboard → SQL Editor → New query → Paste → Run
-- ============================================================
-- Versiune: 2026-02-21
-- Acoperire: auth, profiles, companies, vehicles, jobs, bids,
--             invoices, tracking, notifications, feedback,
--             documents, availability, quotes, return journeys,
--             RLS policies, storage buckets, triggers, functions
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0. EXTENSII NECESARE
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- full-text search

-- ────────────────────────────────────────────────────────────
-- 1. ENUM TYPES
-- ────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('driver','broker','company','admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE job_status AS ENUM (
    'open','assigned','in_progress','completed','cancelled','disputed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE bid_status AS ENUM ('pending','accepted','rejected','withdrawn');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM (
    'draft','sent','paid','overdue','cancelled','void'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE vehicle_status AS ENUM ('available','unavailable','maintenance','in_transit');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE document_type AS ENUM (
    'driving_licence','cpc_card','tachograph_card',
    'insurance','goods_in_transit','vehicle_mot','vehicle_tax',
    'operator_licence','contract','other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tracking_event_type AS ENUM (
    'job_created','job_assigned','pickup_confirmed',
    'in_transit','delivery_confirmed','pod_uploaded',
    'issue_reported','job_completed','job_cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'new_load','bid_accepted','bid_rejected','job_assigned',
    'delivery_complete','payment_received','system','reminder'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ────────────────────────────────────────────────────────────
-- 2. COMPANIES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                TEXT NOT NULL,
  slug                TEXT UNIQUE,
  email               TEXT,
  phone               TEXT,
  address_line1       TEXT,
  address_line2       TEXT,
  city                TEXT,
  postcode            TEXT,
  country             TEXT DEFAULT 'UK',
  company_number      TEXT,
  vat_number          TEXT,
  logo_url            TEXT,
  website             TEXT,
  description         TEXT,
  is_verified         BOOLEAN DEFAULT FALSE,
  is_active           BOOLEAN DEFAULT TRUE,
  subscription_tier   TEXT DEFAULT 'free',   -- free | starter | pro | enterprise
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 3. PROFILES  (extends auth.users 1-to-1)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id          UUID REFERENCES companies(id) ON DELETE SET NULL,
  role                user_role NOT NULL DEFAULT 'driver',
  first_name          TEXT,
  last_name           TEXT,
  full_name           TEXT GENERATED ALWAYS AS (
                        COALESCE(first_name,'') || ' ' || COALESCE(last_name,'')
                      ) STORED,
  email               TEXT,
  phone               TEXT,
  phone_2             TEXT,
  avatar_url          TEXT,
  logo_url            TEXT,
  job_title           TEXT,
  department          TEXT,
  time_zone           TEXT DEFAULT 'Europe/London',
  is_driver           BOOLEAN DEFAULT FALSE,
  is_available        BOOLEAN DEFAULT TRUE,
  licence_number      TEXT,
  cpc_number          TEXT,
  tacho_number        TEXT,
  ni_number           TEXT,
  date_of_birth       DATE,
  address_line1       TEXT,
  address_line2       TEXT,
  city                TEXT,
  postcode            TEXT,
  country             TEXT DEFAULT 'UK',
  -- notification preferences (stored as JSONB)
  notification_prefs  JSONB DEFAULT '{
    "email_new_loads": true,
    "email_bid_updates": true,
    "email_job_assigned": true,
    "email_payment": true,
    "sms_new_loads": false,
    "sms_job_assigned": true,
    "push_enabled": true
  }'::jsonb,
  -- onboarding flags
  onboarding_complete BOOLEAN DEFAULT FALSE,
  profile_complete    BOOLEAN DEFAULT FALSE,
  mobile_access       BOOLEAN DEFAULT FALSE,
  -- metadata
  last_seen_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 4. VEHICLES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicles (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id          UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  driver_id           UUID REFERENCES profiles(id) ON DELETE SET NULL,
  registration        TEXT NOT NULL,
  make                TEXT,
  model               TEXT,
  year                INTEGER,
  colour              TEXT,
  vehicle_type        TEXT,   -- Small Van | Medium Van | Large Van | Luton | 7.5T | etc.
  payload_kg          NUMERIC(10,2),
  max_pallets         INTEGER,
  has_tail_lift       BOOLEAN DEFAULT FALSE,
  has_tracking        BOOLEAN DEFAULT FALSE,
  mot_expiry          DATE,
  tax_expiry          DATE,
  insurance_expiry    DATE,
  status              vehicle_status DEFAULT 'available',
  is_available        BOOLEAN DEFAULT TRUE,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 5. JOBS  (Loads / Loads board)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  posted_by_company_id    UUID REFERENCES companies(id) ON DELETE SET NULL,
  posted_by_user_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  driver_id               UUID REFERENCES profiles(id) ON DELETE SET NULL,
  vehicle_id              UUID REFERENCES vehicles(id) ON DELETE SET NULL,

  -- Locations
  pickup_location         TEXT NOT NULL,
  pickup_postcode         TEXT,
  pickup_lat              DOUBLE PRECISION,
  pickup_lng              DOUBLE PRECISION,
  delivery_location       TEXT NOT NULL,
  delivery_postcode       TEXT,
  delivery_lat            DOUBLE PRECISION,
  delivery_lng            DOUBLE PRECISION,
  distance_miles          NUMERIC(10,2),

  -- Timing
  pickup_datetime         TIMESTAMPTZ,
  delivery_datetime       TIMESTAMPTZ,

  -- Cargo details
  vehicle_type            TEXT,
  cargo_type              TEXT,
  pallets                 INTEGER DEFAULT 0,
  boxes                   INTEGER DEFAULT 0,
  bags                    INTEGER DEFAULT 0,
  items                   INTEGER DEFAULT 0,
  weight_kg               NUMERIC(10,2),
  load_details            TEXT,

  -- Financial
  budget                  NUMERIC(10,2),
  agreed_price            NUMERIC(10,2),
  currency                TEXT DEFAULT 'GBP',

  -- Status & workflow
  status                  job_status DEFAULT 'open',
  is_return_journey       BOOLEAN DEFAULT FALSE,
  requires_tail_lift      BOOLEAN DEFAULT FALSE,
  special_instructions    TEXT,

  -- POD & evidence
  pod_url                 TEXT,
  pod_uploaded_at         TIMESTAMPTZ,
  signature_url           TEXT,

  -- Timestamps
  assigned_at             TIMESTAMPTZ,
  started_at              TIMESTAMPTZ,
  completed_at            TIMESTAMPTZ,
  cancelled_at            TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 6. JOB BIDS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_bids (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id          UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  bidder_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id      UUID REFERENCES companies(id) ON DELETE SET NULL,
  amount          NUMERIC(10,2) NOT NULL,
  currency        TEXT DEFAULT 'GBP',
  message         TEXT,
  status          bid_status DEFAULT 'pending',
  accepted_at     TIMESTAMPTZ,
  rejected_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (job_id, bidder_id)
);

-- ────────────────────────────────────────────────────────────
-- 7. JOB TRACKING EVENTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_tracking_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id          UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type      tracking_event_type NOT NULL,
  lat             DOUBLE PRECISION,
  lng             DOUBLE PRECISION,
  location_name   TEXT,
  notes           TEXT,
  photo_url       TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 8. INVOICES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number      TEXT UNIQUE,
  company_id          UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_by_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  job_id              UUID REFERENCES jobs(id) ON DELETE SET NULL,

  -- Customer (bill-to)
  customer_name       TEXT NOT NULL,
  customer_email      TEXT,
  customer_address    TEXT,
  customer_vat        TEXT,

  -- Financial
  subtotal            NUMERIC(10,2) DEFAULT 0,
  vat_rate            NUMERIC(5,2)  DEFAULT 20,
  vat_amount          NUMERIC(10,2) DEFAULT 0,
  total               NUMERIC(10,2) DEFAULT 0,
  amount_paid         NUMERIC(10,2) DEFAULT 0,
  currency            TEXT DEFAULT 'GBP',

  -- Line items stored as JSONB array
  line_items          JSONB DEFAULT '[]'::jsonb,

  -- Status & dates
  status              invoice_status DEFAULT 'draft',
  issue_date          DATE DEFAULT CURRENT_DATE,
  due_date            DATE,
  paid_at             TIMESTAMPTZ,
  notes               TEXT,
  pdf_url             TEXT,

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate invoice numbers
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1001;

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := 'XDR-' || LPAD(nextval('invoice_number_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_invoice_number ON invoices;
CREATE TRIGGER trg_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

-- ────────────────────────────────────────────────────────────
-- 9. DOCUMENTS  (driver & company documents)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id      UUID REFERENCES companies(id) ON DELETE SET NULL,
  doc_type        document_type NOT NULL,
  title           TEXT,
  file_url        TEXT NOT NULL,
  file_name       TEXT,
  file_size_bytes INTEGER,
  mime_type       TEXT,
  expiry_date     DATE,
  is_verified     BOOLEAN DEFAULT FALSE,
  verified_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  verified_at     TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 10. DRIVER AVAILABILITY
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS driver_availability (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  available_from  TIMESTAMPTZ NOT NULL,
  available_to    TIMESTAMPTZ NOT NULL,
  location        TEXT,
  postcode        TEXT,
  lat             DOUBLE PRECISION,
  lng             DOUBLE PRECISION,
  radius_miles    INTEGER DEFAULT 50,
  notes           TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 11. QUOTES  (price enquiries before posting a job)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quotes (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requested_by_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  company_id          UUID REFERENCES companies(id) ON DELETE SET NULL,
  pickup_location     TEXT NOT NULL,
  delivery_location   TEXT NOT NULL,
  vehicle_type        TEXT,
  cargo_description   TEXT,
  weight_kg           NUMERIC(10,2),
  pallets             INTEGER,
  budget_min          NUMERIC(10,2),
  budget_max          NUMERIC(10,2),
  preferred_date      TIMESTAMPTZ,
  quoted_price        NUMERIC(10,2),
  quoted_by_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  quoted_at           TIMESTAMPTZ,
  status              TEXT DEFAULT 'pending', -- pending | quoted | accepted | declined | expired
  expires_at          TIMESTAMPTZ DEFAULT NOW() + INTERVAL '72 hours',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 12. RETURN JOURNEYS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS return_journeys (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id          UUID REFERENCES jobs(id) ON DELETE SET NULL,
  driver_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id      UUID REFERENCES companies(id) ON DELETE SET NULL,
  origin          TEXT NOT NULL,
  destination     TEXT NOT NULL,
  available_from  TIMESTAMPTZ NOT NULL,
  available_to    TIMESTAMPTZ,
  vehicle_type    TEXT,
  available_space TEXT,
  budget          NUMERIC(10,2),
  notes           TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 13. NOTIFICATIONS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type            notification_type NOT NULL,
  title           TEXT NOT NULL,
  body            TEXT,
  link            TEXT,
  is_read         BOOLEAN DEFAULT FALSE,
  read_at         TIMESTAMPTZ,
  metadata        JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 14. FEEDBACK & RATINGS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submitted_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  company_id      UUID REFERENCES companies(id) ON DELETE SET NULL,
  subject         TEXT,
  message         TEXT NOT NULL,
  rating          INTEGER CHECK (rating BETWEEN 1 AND 5),
  category        TEXT DEFAULT 'general', -- general | bug | feature | billing | other
  status          TEXT DEFAULT 'open',    -- open | in_review | resolved | closed
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 15. COMPANY MEMBERS  (user ↔ company join)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS company_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role            TEXT DEFAULT 'member',   -- owner | admin | manager | member | driver
  is_active       BOOLEAN DEFAULT TRUE,
  invited_at      TIMESTAMPTZ DEFAULT NOW(),
  joined_at       TIMESTAMPTZ,
  UNIQUE (company_id, user_id)
);

-- ────────────────────────────────────────────────────────────
-- 16. LIVE AVAILABILITY  (real-time vehicle positions)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS live_availability (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_id      UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  company_id      UUID REFERENCES companies(id) ON DELETE SET NULL,
  lat             DOUBLE PRECISION,
  lng             DOUBLE PRECISION,
  location_name   TEXT,
  postcode        TEXT,
  heading         NUMERIC(5,2),    -- degrees 0-360
  speed_kmh       NUMERIC(6,2),
  is_available    BOOLEAN DEFAULT TRUE,
  available_from  TIMESTAMPTZ,
  available_to    TIMESTAMPTZ,
  notes           TEXT,
  last_ping_at    TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (driver_id)
);

-- ────────────────────────────────────────────────────────────
-- 17. DIARY / CALENDAR EVENTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS diary_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  job_id          UUID REFERENCES jobs(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  event_type      TEXT DEFAULT 'general', -- job | maintenance | meeting | holiday | other
  start_at        TIMESTAMPTZ NOT NULL,
  end_at          TIMESTAMPTZ,
  all_day         BOOLEAN DEFAULT FALSE,
  colour          TEXT DEFAULT '#D4AF37',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 18. COMPANY SETTINGS  (key-value store per company)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS company_settings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
  settings        JSONB DEFAULT '{
    "invoice_prefix": "XDR",
    "default_payment_terms_days": 30,
    "default_vat_rate": 20,
    "currency": "GBP",
    "timezone": "Europe/London",
    "auto_send_invoices": false,
    "require_pod": true,
    "allow_driver_bidding": true
  }'::jsonb,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 19. USEFUL INDEXES
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_company    ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role       ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_jobs_status         ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_company        ON jobs(posted_by_company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_driver         ON jobs(driver_id);
CREATE INDEX IF NOT EXISTS idx_jobs_pickup         ON jobs(pickup_datetime);
CREATE INDEX IF NOT EXISTS idx_jobs_created        ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bids_job            ON job_bids(job_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder         ON job_bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company    ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status     ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user  ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_tracking_job        ON job_tracking_events(job_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_company    ON vehicles(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_owner     ON documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_availability_driver ON driver_availability(driver_id);
CREATE INDEX IF NOT EXISTS idx_return_driver       ON return_journeys(driver_id);

-- Full-text search on jobs
CREATE INDEX IF NOT EXISTS idx_jobs_pickup_fts
  ON jobs USING GIN (to_tsvector('english', pickup_location || ' ' || delivery_location));

-- ────────────────────────────────────────────────────────────
-- 20. UPDATED_AT TRIGGER FUNCTION
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply to all tables with updated_at
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'companies','profiles','vehicles','jobs','job_bids',
    'invoices','documents','quotes','return_journeys',
    'live_availability','diary_events','company_settings'
  ] LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_updated_at ON %I;
      CREATE TRIGGER trg_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    ', t, t);
  END LOOP;
END $$;

-- ────────────────────────────────────────────────────────────
-- 21. TRIGGER: auto-create profile when user signs up
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'driver')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_new_user ON auth.users;
CREATE TRIGGER trg_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ────────────────────────────────────────────────────────────
-- 22. TRIGGER: auto-notify driver when bid is accepted
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION notify_bid_accepted()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status <> 'accepted' THEN
    INSERT INTO notifications (user_id, type, title, body, link, metadata)
    VALUES (
      NEW.bidder_id,
      'bid_accepted',
      'Your bid was accepted!',
      'Your bid of £' || NEW.amount || ' has been accepted.',
      '/jobs/' || NEW.job_id,
      jsonb_build_object('job_id', NEW.job_id, 'bid_id', NEW.id, 'amount', NEW.amount)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bid_accepted ON job_bids;
CREATE TRIGGER trg_bid_accepted
  AFTER UPDATE ON job_bids
  FOR EACH ROW EXECUTE FUNCTION notify_bid_accepted();

-- ────────────────────────────────────────────────────────────
-- 23. TRIGGER: auto-create company_settings on new company
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION init_company_settings()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO company_settings (company_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_company_settings ON companies;
CREATE TRIGGER trg_company_settings
  AFTER INSERT ON companies
  FOR EACH ROW EXECUTE FUNCTION init_company_settings();

-- ────────────────────────────────────────────────────────────
-- 24. HELPER FUNCTIONS
-- ────────────────────────────────────────────────────────────

-- Get open jobs near a postcode (requires lat/lng on jobs)
CREATE OR REPLACE FUNCTION get_nearby_jobs(
  p_lat   DOUBLE PRECISION,
  p_lng   DOUBLE PRECISION,
  p_miles DOUBLE PRECISION DEFAULT 50
)
RETURNS SETOF jobs LANGUAGE sql STABLE AS $$
  SELECT *
  FROM jobs
  WHERE status = 'open'
    AND (
      3958.8 * acos(
        LEAST(1.0, cos(radians(p_lat))
          * cos(radians(pickup_lat))
          * cos(radians(pickup_lng) - radians(p_lng))
          + sin(radians(p_lat)) * sin(radians(pickup_lat))
        )
      )
    ) <= p_miles
  ORDER BY pickup_datetime ASC NULLS LAST;
$$;

-- Get company stats summary
CREATE OR REPLACE FUNCTION get_company_stats(p_company_id UUID)
RETURNS TABLE (
  total_jobs      BIGINT,
  active_jobs     BIGINT,
  completed_jobs  BIGINT,
  total_drivers   BIGINT,
  total_vehicles  BIGINT,
  revenue_gbp     NUMERIC
) LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    COUNT(j.id)                                              AS total_jobs,
    COUNT(j.id) FILTER (WHERE j.status = 'in_progress')    AS active_jobs,
    COUNT(j.id) FILTER (WHERE j.status = 'completed')      AS completed_jobs,
    COUNT(DISTINCT p.id) FILTER (WHERE p.is_driver = TRUE) AS total_drivers,
    COUNT(DISTINCT v.id)                                    AS total_vehicles,
    COALESCE(SUM(j.agreed_price) FILTER (WHERE j.status = 'completed'), 0) AS revenue_gbp
  FROM companies c
  LEFT JOIN jobs j    ON j.posted_by_company_id = c.id
  LEFT JOIN profiles p ON p.company_id = c.id
  LEFT JOIN vehicles v ON v.company_id = c.id
  WHERE c.id = p_company_id;
$$;

-- Mark all notifications read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS VOID LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE user_id = p_user_id AND is_read = FALSE;
$$;

-- ────────────────────────────────────────────────────────────
-- 25. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────

-- Enable RLS
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies           ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs                ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_bids            ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices            ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents           ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_availability   ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_journeys     ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback            ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings    ENABLE ROW LEVEL SECURITY;

-- ── Helper: get current user's company_id ──
CREATE OR REPLACE FUNCTION my_company_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION my_role()
RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- ── PROFILES ──
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  USING (
    id = auth.uid()
    OR company_id = my_company_id()
    OR my_role() = 'admin'
  );

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- ── COMPANIES ──
DROP POLICY IF EXISTS "companies_select" ON companies;
CREATE POLICY "companies_select" ON companies FOR SELECT
  USING (TRUE);   -- public read

DROP POLICY IF EXISTS "companies_update_own" ON companies;
CREATE POLICY "companies_update_own" ON companies FOR UPDATE
  USING (id = my_company_id() OR my_role() = 'admin');

DROP POLICY IF EXISTS "companies_insert" ON companies;
CREATE POLICY "companies_insert" ON companies FOR INSERT
  WITH CHECK (TRUE);

-- ── JOBS ──
DROP POLICY IF EXISTS "jobs_select" ON jobs;
CREATE POLICY "jobs_select" ON jobs FOR SELECT
  USING (
    status = 'open'
    OR posted_by_company_id = my_company_id()
    OR driver_id = auth.uid()
    OR my_role() = 'admin'
  );

DROP POLICY IF EXISTS "jobs_insert" ON jobs;
CREATE POLICY "jobs_insert" ON jobs FOR INSERT
  WITH CHECK (
    posted_by_company_id = my_company_id()
    OR posted_by_user_id = auth.uid()
  );

DROP POLICY IF EXISTS "jobs_update" ON jobs;
CREATE POLICY "jobs_update" ON jobs FOR UPDATE
  USING (
    posted_by_company_id = my_company_id()
    OR driver_id = auth.uid()
    OR my_role() = 'admin'
  );

-- ── JOB BIDS ──
DROP POLICY IF EXISTS "bids_select" ON job_bids;
CREATE POLICY "bids_select" ON job_bids FOR SELECT
  USING (
    bidder_id = auth.uid()
    OR company_id = my_company_id()
    OR EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = job_id
        AND j.posted_by_company_id = my_company_id()
    )
  );

DROP POLICY IF EXISTS "bids_insert" ON job_bids;
CREATE POLICY "bids_insert" ON job_bids FOR INSERT
  WITH CHECK (bidder_id = auth.uid());

DROP POLICY IF EXISTS "bids_update" ON job_bids;
CREATE POLICY "bids_update" ON job_bids FOR UPDATE
  USING (
    bidder_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = job_id
        AND j.posted_by_company_id = my_company_id()
    )
  );

-- ── VEHICLES ──
DROP POLICY IF EXISTS "vehicles_company" ON vehicles;
CREATE POLICY "vehicles_company" ON vehicles FOR ALL
  USING (company_id = my_company_id() OR my_role() = 'admin');

-- ── INVOICES ──
DROP POLICY IF EXISTS "invoices_company" ON invoices;
CREATE POLICY "invoices_company" ON invoices FOR ALL
  USING (company_id = my_company_id() OR my_role() = 'admin');

-- ── DOCUMENTS ──
DROP POLICY IF EXISTS "documents_own" ON documents;
CREATE POLICY "documents_own" ON documents FOR ALL
  USING (
    owner_id = auth.uid()
    OR company_id = my_company_id()
    OR my_role() = 'admin'
  );

-- ── NOTIFICATIONS ──
DROP POLICY IF EXISTS "notifications_own" ON notifications;
CREATE POLICY "notifications_own" ON notifications FOR ALL
  USING (user_id = auth.uid());

-- ── DRIVER AVAILABILITY ──
DROP POLICY IF EXISTS "availability_select" ON driver_availability;
CREATE POLICY "availability_select" ON driver_availability FOR SELECT
  USING (TRUE);  -- public read

DROP POLICY IF EXISTS "availability_manage" ON driver_availability;
CREATE POLICY "availability_manage" ON driver_availability
  FOR INSERT UPDATE DELETE
  USING (driver_id = auth.uid() OR my_role() = 'admin');

-- ── LIVE AVAILABILITY ──
DROP POLICY IF EXISTS "live_avail_select" ON live_availability;
CREATE POLICY "live_avail_select" ON live_availability FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "live_avail_manage" ON live_availability;
CREATE POLICY "live_avail_manage" ON live_availability
  FOR INSERT UPDATE DELETE
  USING (driver_id = auth.uid() OR my_role() = 'admin');

-- ── RETURN JOURNEYS ──
DROP POLICY IF EXISTS "return_select" ON return_journeys;
CREATE POLICY "return_select" ON return_journeys FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "return_manage" ON return_journeys;
CREATE POLICY "return_manage" ON return_journeys
  FOR INSERT UPDATE DELETE
  USING (driver_id = auth.uid() OR company_id = my_company_id());

-- ── QUOTES ──
DROP POLICY IF EXISTS "quotes_manage" ON quotes;
CREATE POLICY "quotes_manage" ON quotes FOR ALL
  USING (
    requested_by_id = auth.uid()
    OR company_id = my_company_id()
    OR my_role() = 'admin'
  );

-- ── DIARY EVENTS ──
DROP POLICY IF EXISTS "diary_company" ON diary_events;
CREATE POLICY "diary_company" ON diary_events FOR ALL
  USING (company_id = my_company_id() OR user_id = auth.uid());

-- ── FEEDBACK ──
DROP POLICY IF EXISTS "feedback_submit" ON feedback;
CREATE POLICY "feedback_submit" ON feedback FOR INSERT
  WITH CHECK (submitted_by = auth.uid());

DROP POLICY IF EXISTS "feedback_read_own" ON feedback;
CREATE POLICY "feedback_read_own" ON feedback FOR SELECT
  USING (submitted_by = auth.uid() OR my_role() = 'admin');

-- ── COMPANY SETTINGS ──
DROP POLICY IF EXISTS "settings_company" ON company_settings;
CREATE POLICY "settings_company" ON company_settings FOR ALL
  USING (company_id = my_company_id() OR my_role() = 'admin');

-- ── JOB TRACKING EVENTS ──
DROP POLICY IF EXISTS "tracking_select" ON job_tracking_events;
CREATE POLICY "tracking_select" ON job_tracking_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = job_id
        AND (j.posted_by_company_id = my_company_id() OR j.driver_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "tracking_insert" ON job_tracking_events;
CREATE POLICY "tracking_insert" ON job_tracking_events FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ── COMPANY MEMBERS ──
DROP POLICY IF EXISTS "members_company" ON company_members;
CREATE POLICY "members_company" ON company_members FOR ALL
  USING (company_id = my_company_id() OR user_id = auth.uid());

-- ────────────────────────────────────────────────────────────
-- 26. STORAGE BUCKETS
-- ────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars',   'avatars',   TRUE,  5242880,  ARRAY['image/jpeg','image/png','image/webp']),
  ('logos',     'logos',     TRUE,  5242880,  ARRAY['image/jpeg','image/png','image/webp','image/svg+xml']),
  ('documents', 'documents', FALSE, 10485760, ARRAY['application/pdf','image/jpeg','image/png']),
  ('pod',       'pod',       FALSE, 10485760, ARRAY['application/pdf','image/jpeg','image/png']),
  ('invoices',  'invoices',  FALSE, 5242880,  ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "avatars_public_read"  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars_owner_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
CREATE POLICY "logos_public_read"    ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "logos_owner_upload"   ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logos' AND auth.uid() IS NOT NULL);
CREATE POLICY "docs_auth_read"       ON storage.objects FOR SELECT USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);
CREATE POLICY "docs_owner_upload"    ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid() IS NOT NULL);
CREATE POLICY "pod_auth_read"        ON storage.objects FOR SELECT USING (bucket_id = 'pod' AND auth.uid() IS NOT NULL);
CREATE POLICY "pod_owner_upload"     ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pod' AND auth.uid() IS NOT NULL);
CREATE POLICY "invoices_auth_read"   ON storage.objects FOR SELECT USING (bucket_id = 'invoices' AND auth.uid() IS NOT NULL);
CREATE POLICY "invoices_upload"      ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'invoices' AND auth.uid() IS NOT NULL);

-- ────────────────────────────────────────────────────────────
-- 27. GRANT PERMISSIONS
-- ────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL   ON ALL TABLES    IN SCHEMA public TO authenticated, service_role;
GRANT ALL   ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, service_role;

-- ────────────────────────────────────────────────────────────
-- ✅ SCHEMA COMPLET — XDRIVE LOGISTICS LTD
-- ────────────────────────────────────────────────────────────
-- Tabele create: 18
-- Triggere:      5  (updated_at, new_user, bid_accepted,
--                    company_settings, invoice_number)
-- Funcții:       6  (set_updated_at, handle_new_user,
--                    notify_bid_accepted, init_company_settings,
--                    get_nearby_jobs, get_company_stats,
--                    mark_all_notifications_read,
--                    generate_invoice_number, my_company_id,
--                    my_role)
-- RLS Policies:  30+
-- Storage:       5 buckets (avatars, logos, documents, pod, invoices)
-- Indexes:       16 + 1 GIN full-text
-- ────────────────────────────────────────────────────────────

-- ================================================================
-- COPIAZĂ TOT ȘI RULEAZĂ ÎN SUPABASE → SQL EDITOR → RUN
--
-- Fix 1: "column driver_id does not exist" în tabelul jobs
-- Fix 2: "Could not find the table 'public.proof_of_delivery'"
--
-- Este idempotent — poate fi rulat de mai multe ori în siguranță.
-- ================================================================

-- ============================================================
-- PART 1: Add ALL missing extended columns to the jobs table
--         (safe even if columns already exist)
-- ============================================================
DO $$
BEGIN

  -- Extended address fields
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

  -- Cargo extras
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='cargo_type') THEN
    ALTER TABLE public.jobs ADD COLUMN cargo_type TEXT;
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
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='packaging') THEN
    ALTER TABLE public.jobs ADD COLUMN packaging TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='dimensions') THEN
    ALTER TABLE public.jobs ADD COLUMN dimensions TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='requested_vehicle_type') THEN
    ALTER TABLE public.jobs ADD COLUMN requested_vehicle_type TEXT;
  END IF;

  -- Booking details
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

  -- Financials
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='agreed_rate') THEN
    ALTER TABLE public.jobs ADD COLUMN agreed_rate NUMERIC(12,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='payment_terms') THEN
    ALTER TABLE public.jobs ADD COLUMN payment_terms TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='smartpay_enabled') THEN
    ALTER TABLE public.jobs ADD COLUMN smartpay_enabled BOOLEAN NOT NULL DEFAULT false;
  END IF;

  -- References
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='your_ref') THEN
    ALTER TABLE public.jobs ADD COLUMN your_ref TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='cust_ref') THEN
    ALTER TABLE public.jobs ADD COLUMN cust_ref TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='vehicle_ref') THEN
    ALTER TABLE public.jobs ADD COLUMN vehicle_ref TEXT;
  END IF;

  -- Driver assignment — THIS IS THE COLUMN THAT WAS CAUSING THE ERROR
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='driver_id') THEN
    ALTER TABLE public.jobs ADD COLUMN driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='assigned_driver_id') THEN
    ALTER TABLE public.jobs ADD COLUMN assigned_driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  -- Driver-facing status (mobile tracking)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='current_status') THEN
    ALTER TABLE public.jobs ADD COLUMN current_status TEXT NOT NULL DEFAULT 'ALLOCATED'
      CHECK (current_status IN (
        'ALLOCATED','ON_MY_WAY_TO_PICKUP','ON_SITE_PICKUP',
        'PICKED_UP','ON_MY_WAY_TO_DELIVERY','ON_SITE_DELIVERY','DELIVERED'
      ));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='status_updated_at') THEN
    ALTER TABLE public.jobs ADD COLUMN status_updated_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Completion
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='completed_by_name') THEN
    ALTER TABLE public.jobs ADD COLUMN completed_by_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='completed_at') THEN
    ALTER TABLE public.jobs ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Notes / options
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

-- New indexes for the added columns (safe — IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_jobs_driver_id       ON public.jobs(driver_id);
CREATE INDEX IF NOT EXISTS idx_jobs_current_status  ON public.jobs(current_status);

-- ============================================================
-- PART 2: Create proof_of_delivery table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.proof_of_delivery (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id           UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  delivered_on     DATE NOT NULL DEFAULT CURRENT_DATE,
  received_by      TEXT NOT NULL,
  left_at          TEXT,
  no_of_items      INTEGER,
  delivery_status  TEXT NOT NULL DEFAULT 'Completed Delivery'
                     CHECK (delivery_status IN (
                       'Completed Delivery',
                       'Partial Delivery',
                       'Failed Delivery',
                       'Refused',
                       'Left Safe'
                     )),
  delivery_notes   TEXT,
  signature_url    TEXT,
  photo_urls       TEXT[],
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pod_job_id ON public.proof_of_delivery(job_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pod_updated_at ON public.proof_of_delivery;
CREATE TRIGGER pod_updated_at
  BEFORE UPDATE ON public.proof_of_delivery
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.proof_of_delivery ENABLE ROW LEVEL SECURITY;

-- RLS policies for proof_of_delivery
DROP POLICY IF EXISTS "pod_select" ON public.proof_of_delivery;
CREATE POLICY "pod_select" ON public.proof_of_delivery FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = proof_of_delivery.job_id
        AND (
          j.posted_by_company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
          )
          OR j.driver_id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "pod_insert" ON public.proof_of_delivery;
CREATE POLICY "pod_insert" ON public.proof_of_delivery FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = proof_of_delivery.job_id
        AND (
          j.posted_by_company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
          )
          OR j.driver_id = auth.uid()
        )
    )
  );

-- ============================================================
-- PART 3: Re-create the jobs RLS policies now that driver_id exists
-- ============================================================
DROP POLICY IF EXISTS "jobs_select" ON public.jobs;
CREATE POLICY "jobs_select" ON public.jobs FOR SELECT TO authenticated
  USING (
    status = 'open'
    OR posted_by_company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    OR (assigned_company_id IS NOT NULL AND assigned_company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
    OR driver_id = auth.uid()
  );

DROP POLICY IF EXISTS "jobs_insert" ON public.jobs;
CREATE POLICY "jobs_insert" ON public.jobs FOR INSERT TO authenticated
  WITH CHECK (
    posted_by_company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "jobs_update" ON public.jobs;
CREATE POLICY "jobs_update" ON public.jobs FOR UPDATE TO authenticated
  USING (
    posted_by_company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    OR driver_id = auth.uid()
  );

-- ============================================================
-- VERIFICATION — should show jobs + proof_of_delivery columns
-- ============================================================
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('jobs', 'proof_of_delivery')
  AND column_name IN (
    'driver_id', 'current_status', 'pod_required', 'has_pickup_evidence',
    'delivered_on', 'received_by', 'delivery_status', 'signature_url'
  )
ORDER BY table_name, column_name;

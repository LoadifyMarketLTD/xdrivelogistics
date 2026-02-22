-- Migration 008: Fix Missing Columns
-- Final pass to ensure all columns referenced in application code exist.

-- jobs: pod fields
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='pod_photo_url') THEN
    ALTER TABLE public.jobs ADD COLUMN pod_photo_url TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='pod_signature_url') THEN
    ALTER TABLE public.jobs ADD COLUMN pod_signature_url TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='pod_delivered_at') THEN
    ALTER TABLE public.jobs ADD COLUMN pod_delivered_at TIMESTAMPTZ;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='pod_received_by') THEN
    ALTER TABLE public.jobs ADD COLUMN pod_received_by TEXT;
  END IF;
END $$;

-- jobs: pricing fields
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='quoted_price') THEN
    ALTER TABLE public.jobs ADD COLUMN quoted_price NUMERIC(12,2);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='agreed_price') THEN
    ALTER TABLE public.jobs ADD COLUMN agreed_price NUMERIC(12,2);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='currency') THEN
    ALTER TABLE public.jobs ADD COLUMN currency TEXT NOT NULL DEFAULT 'GBP';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='payment_terms') THEN
    ALTER TABLE public.jobs ADD COLUMN payment_terms TEXT;
  END IF;
END $$;

-- jobs: contact fields
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='pickup_contact_name') THEN
    ALTER TABLE public.jobs ADD COLUMN pickup_contact_name TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='pickup_contact_phone') THEN
    ALTER TABLE public.jobs ADD COLUMN pickup_contact_phone TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='delivery_contact_name') THEN
    ALTER TABLE public.jobs ADD COLUMN delivery_contact_name TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='delivery_contact_phone') THEN
    ALTER TABLE public.jobs ADD COLUMN delivery_contact_phone TEXT;
  END IF;
END $$;

SELECT 'Migration 008 missing columns fixed' AS status;

-- Migration 005: Fix Quotes Columns
-- Ensures quotes table has all required columns.

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'quotes' AND column_name = 'vat_rate'
  ) THEN
    ALTER TABLE public.quotes ADD COLUMN vat_rate NUMERIC(5,2) NOT NULL DEFAULT 20;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'quotes' AND column_name = 'vat_amount'
  ) THEN
    ALTER TABLE public.quotes ADD COLUMN vat_amount NUMERIC(12,2);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'quotes' AND column_name = 'total_amount'
  ) THEN
    ALTER TABLE public.quotes ADD COLUMN total_amount NUMERIC(12,2);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'quotes' AND column_name = 'converted_to_job_id'
  ) THEN
    ALTER TABLE public.quotes ADD COLUMN converted_to_job_id UUID REFERENCES public.jobs(id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'quotes' AND column_name = 'valid_until'
  ) THEN
    ALTER TABLE public.quotes ADD COLUMN valid_until TIMESTAMPTZ;
  END IF;
END $$;

SELECT 'Migration 005 quotes columns complete' AS status;

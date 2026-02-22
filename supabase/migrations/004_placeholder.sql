-- Migration 004: Add Address Columns
-- Splits address fields into structured columns where missing.

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'address_line1'
  ) THEN
    ALTER TABLE public.companies
      ADD COLUMN address_line1 TEXT,
      ADD COLUMN address_line2 TEXT,
      ADD COLUMN address_city TEXT,
      ADD COLUMN address_county TEXT,
      ADD COLUMN address_postcode TEXT,
      ADD COLUMN address_country TEXT NOT NULL DEFAULT 'United Kingdom';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'pickup_city'
  ) THEN
    ALTER TABLE public.jobs
      ADD COLUMN pickup_city TEXT,
      ADD COLUMN pickup_postcode TEXT,
      ADD COLUMN delivery_city TEXT,
      ADD COLUMN delivery_postcode TEXT;
  END IF;
END $$;

SELECT 'Migration 004 address columns complete' AS status;

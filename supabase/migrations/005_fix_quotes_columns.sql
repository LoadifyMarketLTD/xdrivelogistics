-- Fix: ensure all expected columns exist on the quotes table.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cargo_type' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.cargo_type AS ENUM ('documents', 'packages', 'pallets', 'furniture', 'equipment', 'other');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_type' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.vehicle_type AS ENUM ('bicycle', 'motorbike', 'car', 'van_small', 'van_large', 'luton', 'truck_7_5t', 'truck_18t', 'artic');
  END IF;
  ALTER TABLE public.quotes
    ADD COLUMN IF NOT EXISTS vehicle_type public.vehicle_type,
    ADD COLUMN IF NOT EXISTS cargo_type   public.cargo_type,
    ADD COLUMN IF NOT EXISTS currency     text DEFAULT 'GBP',
    ADD COLUMN IF NOT EXISTS status       text DEFAULT 'draft';
EXCEPTION WHEN undefined_table THEN NULL;
END
$$;

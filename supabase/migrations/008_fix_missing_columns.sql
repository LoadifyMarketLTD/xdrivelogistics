-- Fix: ensure the three columns reported missing actually exist.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cargo_type' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.cargo_type AS ENUM ('documents', 'packages', 'pallets', 'furniture', 'equipment', 'other');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'display_name') THEN
    ALTER TABLE public.drivers ADD COLUMN display_name text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'company_id') THEN
    ALTER TABLE public.vehicles ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'quotes' AND column_name = 'cargo_type') THEN
    ALTER TABLE public.quotes ADD COLUMN cargo_type public.cargo_type;
  END IF;
END
$$;
NOTIFY pgrst, 'reload schema';

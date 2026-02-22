-- Migration 003: Auto-Fix Common Issues
-- Adds commonly-missing columns safely.

-- Ensure profiles has avatar_url
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- Ensure jobs has is_return_journey
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'is_return_journey'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN is_return_journey BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- Ensure jobs has customer_ref
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'customer_ref'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN customer_ref TEXT;
  END IF;
END $$;

SELECT 'Migration 003 auto-fix complete' AS status;

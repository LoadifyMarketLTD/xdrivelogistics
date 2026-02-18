-- ============================================================
-- COMPLETE SCHEMA FIX - DRIVERS AND VEHICLES TABLES
-- Run this entire script in Supabase SQL Editor
-- ============================================================
-- This script fixes both drivers and vehicles tables to match
-- the application code expectations.
--
-- WHAT THIS DOES:
-- 1. Fixes drivers table: name → full_name, adds missing columns
-- 2. Fixes vehicles table: reg → registration, adds make/model/year
-- 3. Converts status fields to is_active/is_available booleans
-- ============================================================

BEGIN;

-- ============================================================
-- PART 1: FIX DRIVERS TABLE
-- ============================================================

-- Add missing columns to drivers table
DO $$
BEGIN
  -- Add email column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'email'
  ) THEN
    ALTER TABLE public.drivers ADD COLUMN email TEXT;
  END IF;

  -- Add notes column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'notes'
  ) THEN
    ALTER TABLE public.drivers ADD COLUMN notes TEXT;
  END IF;

  -- Add is_active column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.drivers ADD COLUMN is_active BOOLEAN DEFAULT true;
    -- Convert old status to is_active
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'status'
    ) THEN
      UPDATE public.drivers SET is_active = (status = 'active') WHERE status IS NOT NULL;
    END IF;
  END IF;
  
  -- Add license_number if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'license_number'
  ) THEN
    ALTER TABLE public.drivers ADD COLUMN license_number TEXT;
    -- Copy from licence if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'licence'
    ) THEN
      UPDATE public.drivers SET license_number = licence WHERE licence IS NOT NULL;
    END IF;
  END IF;
  
  -- Add full_name if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE public.drivers ADD COLUMN full_name TEXT;
    -- Copy from name if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'name'
    ) THEN
      UPDATE public.drivers SET full_name = name WHERE name IS NOT NULL;
    END IF;
  END IF;
END $$;

-- Rename old columns if they still exist
DO $$
BEGIN
  -- Rename 'name' to 'full_name'
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'name'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE public.drivers RENAME COLUMN name TO full_name;
  END IF;

  -- Rename 'licence' to 'license_number'
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'licence'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'license_number'
  ) THEN
    ALTER TABLE public.drivers RENAME COLUMN licence TO license_number;
  END IF;
END $$;

-- Drop old status column from drivers
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'status'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.drivers DROP CONSTRAINT IF EXISTS drivers_status_check;
    ALTER TABLE public.drivers DROP COLUMN status;
  END IF;
END $$;

-- Make full_name NOT NULL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'full_name'
  ) THEN
    -- Set default for any NULL values
    UPDATE public.drivers SET full_name = 'Driver ' || SUBSTRING(id::TEXT FROM 1 FOR 8) WHERE full_name IS NULL OR full_name = '';
    -- Make it NOT NULL
    ALTER TABLE public.drivers ALTER COLUMN full_name SET NOT NULL;
  END IF;
END $$;

-- ============================================================
-- PART 2: FIX VEHICLES TABLE
-- ============================================================

-- Add missing columns to vehicles table
DO $$
BEGIN
  -- Add make column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'make'
  ) THEN
    ALTER TABLE public.vehicles ADD COLUMN make TEXT;
  END IF;

  -- Add model column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'model'
  ) THEN
    ALTER TABLE public.vehicles ADD COLUMN model TEXT;
  END IF;

  -- Add year column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'year'
  ) THEN
    ALTER TABLE public.vehicles ADD COLUMN year INTEGER;
  END IF;

  -- Add notes column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'notes'
  ) THEN
    ALTER TABLE public.vehicles ADD COLUMN notes TEXT;
  END IF;

  -- Add is_available column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'is_available'
  ) THEN
    ALTER TABLE public.vehicles ADD COLUMN is_available BOOLEAN DEFAULT true;
    -- Convert old status to is_available
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'status'
    ) THEN
      UPDATE public.vehicles SET is_available = (status = 'active') WHERE status IS NOT NULL;
    END IF;
  END IF;
  
  -- Add vehicle_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'vehicle_type'
  ) THEN
    ALTER TABLE public.vehicles ADD COLUMN vehicle_type TEXT;
    -- Copy from 'type' if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'type'
    ) THEN
      UPDATE public.vehicles SET vehicle_type = type WHERE type IS NOT NULL;
    END IF;
  END IF;
  
  -- Add registration column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'registration'
  ) THEN
    ALTER TABLE public.vehicles ADD COLUMN registration TEXT;
    -- Copy from 'reg' if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'reg'
    ) THEN
      UPDATE public.vehicles SET registration = reg WHERE reg IS NOT NULL;
    END IF;
  END IF;
  
  -- Add capacity_kg column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'capacity_kg'
  ) THEN
    ALTER TABLE public.vehicles ADD COLUMN capacity_kg NUMERIC;
    -- Copy from 'payload_kg' if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'payload_kg'
    ) THEN
      UPDATE public.vehicles SET capacity_kg = payload_kg WHERE payload_kg IS NOT NULL;
    END IF;
  END IF;
END $$;

-- Rename old columns if they still exist
DO $$
BEGIN
  -- Rename 'reg' to 'registration'
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'reg'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'registration'
  ) THEN
    ALTER TABLE public.vehicles RENAME COLUMN reg TO registration;
  END IF;

  -- Rename 'type' to 'vehicle_type'
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'type'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'vehicle_type'
  ) THEN
    ALTER TABLE public.vehicles RENAME COLUMN type TO vehicle_type;
  END IF;

  -- Rename 'payload_kg' to 'capacity_kg'
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'payload_kg'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'capacity_kg'
  ) THEN
    ALTER TABLE public.vehicles RENAME COLUMN payload_kg TO capacity_kg;
  END IF;
END $$;

-- Drop old status column from vehicles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'status'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'is_available'
  ) THEN
    ALTER TABLE public.vehicles DROP CONSTRAINT IF EXISTS vehicles_status_check;
    ALTER TABLE public.vehicles DROP COLUMN status;
  END IF;
END $$;

-- Make vehicle_type and registration NOT NULL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'vehicle_type'
  ) THEN
    UPDATE public.vehicles SET vehicle_type = 'Van' WHERE vehicle_type IS NULL OR vehicle_type = '';
    ALTER TABLE public.vehicles ALTER COLUMN vehicle_type SET NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'registration'
  ) THEN
    UPDATE public.vehicles SET registration = 'REG-' || SUBSTRING(id::TEXT FROM 1 FOR 8) WHERE registration IS NULL OR registration = '';
    ALTER TABLE public.vehicles ALTER COLUMN registration SET NOT NULL;
  END IF;
END $$;

COMMIT;

-- ============================================================
-- VERIFICATION - Check the results
-- ============================================================

SELECT 'DRIVERS TABLE SCHEMA:' as info;
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'drivers'
ORDER BY ordinal_position;

SELECT 'VEHICLES TABLE SCHEMA:' as info;
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'vehicles'
ORDER BY ordinal_position;

-- ============================================================
-- DONE! Your tables are now fixed.
-- Expected columns:
-- 
-- DRIVERS: id, company_id, full_name, phone, email, 
--          license_number, notes, is_active, created_at, updated_at
--
-- VEHICLES: id, company_id, vehicle_type, registration, make, 
--           model, year, capacity_kg, notes, is_available, 
--           created_at, updated_at
-- ============================================================

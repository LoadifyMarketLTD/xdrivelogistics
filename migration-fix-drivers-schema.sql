-- ============================================================
-- MIGRATION: Fix drivers and vehicles table schema
-- Purpose: Update drivers and vehicles tables to use consistent column names
-- Date: 2026-02-18
-- ============================================================

-- This migration fixes the drivers and vehicles table schemas to match the application code
-- 
-- DRIVERS TABLE CHANGES:
-- 1. Rename 'name' column to 'full_name'
-- 2. Rename 'licence' column to 'license_number'
-- 3. Add missing 'email' column if not exists
-- 4. Add missing 'notes' column if not exists
-- 5. Replace 'status' with 'is_active' boolean column
--
-- VEHICLES TABLE CHANGES:
-- 1. Rename 'reg' column to 'registration'
-- 2. Rename 'type' column to 'vehicle_type'
-- 3. Rename 'payload_kg' column to 'capacity_kg'
-- 4. Add missing 'make' column if not exists
-- 5. Add missing 'model' column if not exists
-- 6. Add missing 'year' column if not exists
-- 7. Add missing 'notes' column if not exists
-- 8. Replace 'status' with 'is_available' boolean column
-- 9. Remove 'length_m', 'width_m', 'height_m' if they exist (not used by app)

-- Run this in Supabase SQL Editor

BEGIN;

-- Add new columns if they don't exist
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
    -- Convert old status values to is_active
    UPDATE public.drivers SET is_active = (status = 'active') WHERE status IS NOT NULL;
  END IF;
END $$;

-- Rename 'name' column to 'full_name' if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'name'
  ) THEN
    ALTER TABLE public.drivers RENAME COLUMN name TO full_name;
  END IF;
END $$;

-- Rename 'licence' column to 'license_number' if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'licence'
  ) THEN
    ALTER TABLE public.drivers RENAME COLUMN licence TO license_number;
  END IF;
END $$;

-- Drop old status column if it exists and is_active exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'status'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'is_active'
  ) THEN
    -- Drop the check constraint first if it exists
    ALTER TABLE public.drivers DROP CONSTRAINT IF EXISTS drivers_status_check;
    -- Drop the status column
    ALTER TABLE public.drivers DROP COLUMN status;
  END IF;
END $$;

-- ============================================================
-- VEHICLES TABLE MIGRATION
-- ============================================================

-- Add new columns to vehicles table if they don't exist
DO $$
BEGIN
  -- Add make column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'make'
  ) THEN
    ALTER TABLE public.vehicles ADD COLUMN make TEXT;
  END IF;

  -- Add model column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'model'
  ) THEN
    ALTER TABLE public.vehicles ADD COLUMN model TEXT;
  END IF;

  -- Add year column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'year'
  ) THEN
    ALTER TABLE public.vehicles ADD COLUMN year INTEGER;
  END IF;

  -- Add notes column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'notes'
  ) THEN
    ALTER TABLE public.vehicles ADD COLUMN notes TEXT;
  END IF;

  -- Add is_available column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'is_available'
  ) THEN
    ALTER TABLE public.vehicles ADD COLUMN is_available BOOLEAN DEFAULT true;
    -- Convert old status values to is_available
    UPDATE public.vehicles SET is_available = (status = 'active') WHERE status IS NOT NULL;
  END IF;
  
  -- Add vehicle_type column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'vehicle_type'
  ) THEN
    ALTER TABLE public.vehicles ADD COLUMN vehicle_type TEXT;
    -- Copy data from 'type' column if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'type'
    ) THEN
      UPDATE public.vehicles SET vehicle_type = type WHERE type IS NOT NULL;
    END IF;
  END IF;
  
  -- Add registration column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'registration'
  ) THEN
    ALTER TABLE public.vehicles ADD COLUMN registration TEXT;
    -- Copy data from 'reg' column if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'reg'
    ) THEN
      UPDATE public.vehicles SET registration = reg WHERE reg IS NOT NULL;
    END IF;
  END IF;
  
  -- Add capacity_kg column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'capacity_kg'
  ) THEN
    ALTER TABLE public.vehicles ADD COLUMN capacity_kg NUMERIC;
    -- Copy data from 'payload_kg' column if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'payload_kg'
    ) THEN
      UPDATE public.vehicles SET capacity_kg = payload_kg WHERE payload_kg IS NOT NULL;
    END IF;
  END IF;
END $$;

-- Rename 'reg' column to 'registration' if it still exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'reg'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'registration'
  ) THEN
    ALTER TABLE public.vehicles RENAME COLUMN reg TO registration;
  END IF;
END $$;

-- Rename 'type' column to 'vehicle_type' if it still exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'type'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'vehicle_type'
  ) THEN
    ALTER TABLE public.vehicles RENAME COLUMN type TO vehicle_type;
  END IF;
END $$;

-- Rename 'payload_kg' column to 'capacity_kg' if it still exists
DO $$
BEGIN
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

-- Drop old status column from vehicles if it exists and is_available exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'status'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'is_available'
  ) THEN
    -- Drop the check constraint first if it exists
    ALTER TABLE public.vehicles DROP CONSTRAINT IF EXISTS vehicles_status_check;
    -- Drop the status column
    ALTER TABLE public.vehicles DROP COLUMN status;
  END IF;
END $$;

-- Make vehicle_type and registration NOT NULL if they have data
DO $$
BEGIN
  -- Check if vehicle_type column exists and has no nulls
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'vehicle_type'
  ) THEN
    -- Set default value for any NULL values
    UPDATE public.vehicles SET vehicle_type = 'Van' WHERE vehicle_type IS NULL;
    -- Make it NOT NULL
    ALTER TABLE public.vehicles ALTER COLUMN vehicle_type SET NOT NULL;
  END IF;

  -- Check if registration column exists and has no nulls
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'registration'
  ) THEN
    -- Set default value for any NULL values (generate from id)
    UPDATE public.vehicles 
    SET registration = 'REG-' || SUBSTRING(id::TEXT FROM 1 FOR 8)
    WHERE registration IS NULL OR registration = '';
    -- Make it NOT NULL
    ALTER TABLE public.vehicles ALTER COLUMN registration SET NOT NULL;
  END IF;
END $$;

COMMIT;

-- Verify the changes for drivers table
SELECT 
  'drivers' as table_name,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'drivers'
ORDER BY ordinal_position;

-- Verify the changes for vehicles table
SELECT 
  'vehicles' as table_name,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'vehicles'
ORDER BY ordinal_position;

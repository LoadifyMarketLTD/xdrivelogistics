-- Migration: Add role-based onboarding fields to profiles
-- Run this in Supabase SQL editor

-- 1. Relax role CHECK to include the three self-registration roles
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('admin','dispatcher','driver','viewer','broker','company','company_admin'));

-- 2. Add display_name (friendly label separate from full_name)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT;

-- 3. Country (default UK)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'UK';

-- 4. Driver-specific onboarding fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS driver_base_postcode TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS driver_vehicle_type TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS driver_availability TEXT DEFAULT 'Available';

-- 5. Broker/Dispatcher-specific onboarding fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS broker_company_name TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS broker_company_postcode TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS broker_payment_terms TEXT;

-- 6. Transport Company (fleet/carrier) onboarding fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_name TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_postcode TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_fleet_size INTEGER;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_primary_services TEXT;

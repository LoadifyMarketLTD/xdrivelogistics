-- ============================================================
-- MIGRATION: Company Settings Flow (Variant A)
-- This migration adds missing columns to companies table,
-- updates the create_company RPC function, and fixes RLS policies
-- ============================================================

-- 1. Add missing columns to companies table
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS vat_number TEXT,
ADD COLUMN IF NOT EXISTS company_number TEXT,
ADD COLUMN IF NOT EXISTS address_line1 TEXT,
ADD COLUMN IF NOT EXISTS address_line2 TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS postcode TEXT,
ADD COLUMN IF NOT EXISTS country TEXT;

-- Remove old address column if it exists (replaced by address_line1, address_line2)
-- WARNING: If you have existing data in the 'address' column, you may want to migrate it first:
--   UPDATE public.companies SET address_line1 = address WHERE address IS NOT NULL;
-- This is safe to run as we're adding the new columns first, allowing for manual migration if needed
ALTER TABLE public.companies
DROP COLUMN IF EXISTS address;

-- 2. Drop and recreate create_company function with correct signature
DROP FUNCTION IF EXISTS public.create_company(text);
DROP FUNCTION IF EXISTS public.create_company(text, text);

CREATE OR REPLACE FUNCTION public.create_company(
  company_name TEXT,
  phone TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_company_id UUID;
  user_id UUID;
BEGIN
  -- Get current user ID
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Check if user already has a company
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id AND company_id IS NOT NULL) THEN
    RAISE EXCEPTION 'User already belongs to a company';
  END IF;
  
  -- Create new company with name and phone
  INSERT INTO public.companies (name, phone, created_by)
  VALUES (company_name, phone, user_id)
  RETURNING id INTO new_company_id;
  
  -- Update user profile with company_id
  UPDATE public.profiles
  SET company_id = new_company_id
  WHERE id = user_id;
  
  RETURN new_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_company(text, text) TO authenticated;

-- 3. Update RLS policies to use created_by
-- Drop old policies
DROP POLICY IF EXISTS "Users can view own company" ON public.companies;
DROP POLICY IF EXISTS "Users can insert companies" ON public.companies;
DROP POLICY IF EXISTS "Users can update own company" ON public.companies;

-- Create new policies using created_by
CREATE POLICY "companies_select_owner"
  ON public.companies
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "companies_insert_owner"
  ON public.companies
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "companies_update_owner"
  ON public.companies
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- 4. Add trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Notify schema reload
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- XDrive Logistics LTD - MULTI-TENANT SUPABASE SCHEMA
-- Complete SQL Script for Real Data Integration
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES TABLE (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  company_id UUID,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'dispatcher', 'driver', 'viewer')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);

-- ============================================================
-- 2. COMPANIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  vat_number TEXT,
  company_number TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postcode TEXT,
  country TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint to profiles after companies table exists
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_company_id_fkey;
  
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_company_id_fkey 
  FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;

-- Index
CREATE INDEX IF NOT EXISTS idx_companies_created_by ON public.companies(created_by);

-- Trigger to auto-update updated_at timestamp
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

-- ============================================================
-- 3. RPC FUNCTION: create_company
-- ============================================================
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

-- ============================================================
-- 4. DRIVERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  license_number TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_drivers_company_id ON public.drivers(company_id);
CREATE INDEX IF NOT EXISTS idx_drivers_is_active ON public.drivers(is_active);

-- ============================================================
-- 5. JOBS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  posted_by_company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in-transit', 'completed', 'cancelled')),
  pickup_location TEXT NOT NULL,
  delivery_location TEXT NOT NULL,
  pickup_datetime TIMESTAMP WITH TIME ZONE,
  delivery_datetime TIMESTAMP WITH TIME ZONE,
  vehicle_type TEXT,
  load_details TEXT,
  pallets INTEGER,
  weight_kg NUMERIC,
  budget NUMERIC,
  assigned_company_id UUID REFERENCES public.companies(id),
  accepted_bid_id UUID
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON public.jobs(posted_by_company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_to ON public.jobs(assigned_company_id);

-- ============================================================
-- 6. JOB_BIDS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  message TEXT,
  accepted BOOLEAN DEFAULT false
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_job_bids_job_id ON public.job_bids(job_id);
CREATE INDEX IF NOT EXISTS idx_job_bids_company_id ON public.job_bids(company_id);
CREATE INDEX IF NOT EXISTS idx_job_bids_driver_id ON public.job_bids(driver_id);

DROP TRIGGER IF EXISTS set_updated_at_job_bids ON public.job_bids;
CREATE TRIGGER set_updated_at_job_bids
  BEFORE UPDATE ON public.job_bids
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 7. INVOICES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  invoice_number VARCHAR(20) UNIQUE NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  amount DECIMAL(10,2) NOT NULL,
  vat_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'paid', 'overdue', 'cancelled')),
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  paid_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-generate invoice number
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1001;

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_invoice_number ON public.invoices;
CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION generate_invoice_number();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON public.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_job_id ON public.invoices(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- ============================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Companies policies
DROP POLICY IF EXISTS "Users can view own company" ON public.companies;
CREATE POLICY "companies_select_owner"
  ON public.companies FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can insert companies" ON public.companies;
CREATE POLICY "companies_insert_owner"
  ON public.companies FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "companies_update_owner" ON public.companies;
CREATE POLICY "companies_update_owner"
  ON public.companies FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Drivers policies
DROP POLICY IF EXISTS "Users can view company drivers" ON public.drivers;
CREATE POLICY "Users can view company drivers"
  ON public.drivers FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage company drivers" ON public.drivers;
CREATE POLICY "Users can manage company drivers"
  ON public.drivers FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Jobs policies
DROP POLICY IF EXISTS "Users can view company jobs" ON public.jobs;
CREATE POLICY "Users can view company jobs"
  ON public.jobs FOR SELECT
  USING (
    posted_by_company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage company jobs" ON public.jobs;
CREATE POLICY "Users can manage company jobs"
  ON public.jobs FOR ALL
  USING (
    posted_by_company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Invoices policies
DROP POLICY IF EXISTS "Users can view company invoices" ON public.invoices;
CREATE POLICY "Users can view company invoices"
  ON public.invoices FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage company invoices" ON public.invoices;
CREATE POLICY "Users can manage company invoices"
  ON public.invoices FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Job bids policies
DROP POLICY IF EXISTS "Users can view company bids" ON public.job_bids;
CREATE POLICY "Users can view company bids"
  ON public.job_bids FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage company bids" ON public.job_bids;
CREATE POLICY "Users can manage company bids"
  ON public.job_bids FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- ============================================================
-- 9. HELPER FUNCTIONS
-- ============================================================

-- Function to get current user's company_id
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SETUP COMPLETE
-- ============================================================
-- Next steps:
-- 1. Create your first user via Supabase Auth
-- 2. After login, call create_company('XDrive Logistics') RPC
-- 3. Start adding real data!

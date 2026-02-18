-- ============================================================
-- XDrive Logistics LTD - PUBLIC MARKETPLACE SCHEMA
-- Courier Exchange Style - All Jobs Public
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

-- Add foreign key constraint to profiles
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
-- 3. JOBS TABLE (PUBLIC MARKETPLACE)
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
-- 4. JOB_BIDS TABLE (MARKETPLACE BIDS)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  bidder_company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  bidder_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quote_amount NUMERIC NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'withdrawn', 'rejected', 'accepted'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bids_job_id ON public.job_bids(job_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder_company ON public.job_bids(bidder_company_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON public.job_bids(status);

-- ============================================================
-- 5. HELPER FUNCTIONS
-- ============================================================

-- Function to get current user's company_id
CREATE OR REPLACE FUNCTION public.current_user_company_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user is company member
CREATE OR REPLACE FUNCTION public.is_company_member(p_company_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND company_id = p_company_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- 6. RPC: CREATE COMPANY
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
-- 7. RPC: ACCEPT BID (ATOMIC)
-- ============================================================
CREATE OR REPLACE FUNCTION public.accept_bid(p_bid_id UUID)
RETURNS VOID AS $$
DECLARE
  v_job_id UUID;
  v_posted_by UUID;
  v_bidder_company UUID;
  v_current_company UUID;
BEGIN
  -- Get current user's company
  v_current_company := current_user_company_id();
  
  IF v_current_company IS NULL THEN
    RAISE EXCEPTION 'User not associated with a company';
  END IF;
  
  -- Get bid and job details
  SELECT 
    jb.job_id,
    j.posted_by_company_id,
    jb.bidder_company_id
  INTO 
    v_job_id,
    v_posted_by,
    v_bidder_company
  FROM public.job_bids jb
  JOIN public.jobs j ON j.id = jb.job_id
  WHERE jb.id = p_bid_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bid not found';
  END IF;
  
  -- Verify current user is the poster
  IF v_posted_by != v_current_company THEN
    RAISE EXCEPTION 'Only the job poster can accept bids';
  END IF;
  
  -- Update job (assign to bidder)
  UPDATE public.jobs
  SET 
    status = 'assigned',
    assigned_company_id = v_bidder_company,
    accepted_bid_id = p_bid_id,
    updated_at = NOW()
  WHERE id = v_job_id;
  
  -- Accept the selected bid
  UPDATE public.job_bids
  SET status = 'accepted'
  WHERE id = p_bid_id;
  
  -- Reject all other bids for this job
  UPDATE public.job_bids
  SET status = 'rejected'
  WHERE job_id = v_job_id 
    AND id != p_bid_id
    AND status = 'submitted';
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_bids ENABLE ROW LEVEL SECURITY;

-- ===== PROFILES POLICIES =====
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ===== COMPANIES POLICIES =====
DROP POLICY IF EXISTS "Users can view own company" ON public.companies;
CREATE POLICY "Users can view own company"
  ON public.companies FOR SELECT
  USING (
    id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users can view all companies" ON public.companies;
CREATE POLICY "Authenticated users can view all companies"
  ON public.companies FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can create companies" ON public.companies;
CREATE POLICY "Users can create companies"
  ON public.companies FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- ===== JOBS POLICIES (PUBLIC MARKETPLACE) =====

-- SELECT: Any authenticated user can read ALL jobs
DROP POLICY IF EXISTS "Public marketplace - all jobs visible" ON public.jobs;
CREATE POLICY "Public marketplace - all jobs visible"
  ON public.jobs FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- INSERT: Only company members can post jobs
DROP POLICY IF EXISTS "Company members can post jobs" ON public.jobs;
CREATE POLICY "Company members can post jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (
    posted_by_company_id = current_user_company_id()
    AND current_user_company_id() IS NOT NULL
  );

-- UPDATE: Only poster company can update their jobs
DROP POLICY IF EXISTS "Poster company can update jobs" ON public.jobs;
CREATE POLICY "Poster company can update jobs"
  ON public.jobs FOR UPDATE
  USING (
    posted_by_company_id = current_user_company_id()
  )
  WITH CHECK (
    posted_by_company_id = current_user_company_id()
  );

-- DELETE: Only poster company can delete their jobs
DROP POLICY IF EXISTS "Poster company can delete jobs" ON public.jobs;
CREATE POLICY "Poster company can delete jobs"
  ON public.jobs FOR DELETE
  USING (
    posted_by_company_id = current_user_company_id()
  );

-- ===== JOB_BIDS POLICIES =====

-- SELECT: Bidder can see own bids, poster can see bids on their jobs
DROP POLICY IF EXISTS "Users can view relevant bids" ON public.job_bids;
CREATE POLICY "Users can view relevant bids"
  ON public.job_bids FOR SELECT
  USING (
    bidder_company_id = current_user_company_id()
    OR EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id
        AND j.posted_by_company_id = current_user_company_id()
    )
  );

-- INSERT: Any company can bid on open jobs they didn't post
DROP POLICY IF EXISTS "Companies can bid on open jobs" ON public.job_bids;
CREATE POLICY "Companies can bid on open jobs"
  ON public.job_bids FOR INSERT
  WITH CHECK (
    bidder_company_id = current_user_company_id()
    AND bidder_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id
        AND j.status = 'open'
        AND j.posted_by_company_id != current_user_company_id()
    )
  );

-- UPDATE: Bidder can withdraw, poster can accept/reject via RPC
DROP POLICY IF EXISTS "Users can update relevant bids" ON public.job_bids;
CREATE POLICY "Users can update relevant bids"
  ON public.job_bids FOR UPDATE
  USING (
    bidder_company_id = current_user_company_id()
    OR EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id
        AND j.posted_by_company_id = current_user_company_id()
    )
  )
  WITH CHECK (true);

-- ============================================================
-- SETUP COMPLETE - PUBLIC MARKETPLACE READY
-- ============================================================

-- ============================================================
-- DRIVERS TABLE MIGRATION
-- Add drivers management for Phase 2
-- Run this in Supabase SQL Editor
-- ============================================================

-- Create utility function for updating timestamps (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create drivers table
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  license_number TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_drivers_company_id ON public.drivers(company_id);
CREATE INDEX IF NOT EXISTS idx_drivers_is_active ON public.drivers(is_active);
CREATE INDEX IF NOT EXISTS idx_drivers_email ON public.drivers(email);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_drivers_updated_at ON public.drivers;
CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view drivers in their company" ON public.drivers;
DROP POLICY IF EXISTS "Users can insert drivers in their company" ON public.drivers;
DROP POLICY IF EXISTS "Users can update drivers in their company" ON public.drivers;
DROP POLICY IF EXISTS "Users can delete drivers in their company" ON public.drivers;

-- Policy: Users can view drivers in their company
CREATE POLICY "Users can view drivers in their company"
  ON public.drivers FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Policy: Users can insert drivers in their company
CREATE POLICY "Users can insert drivers in their company"
  ON public.drivers FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Policy: Users can update drivers in their company
CREATE POLICY "Users can update drivers in their company"
  ON public.drivers FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Policy: Users can delete drivers in their company
CREATE POLICY "Users can delete drivers in their company"
  ON public.drivers FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Grant permissions
GRANT ALL ON public.drivers TO authenticated;
GRANT ALL ON public.drivers TO service_role;

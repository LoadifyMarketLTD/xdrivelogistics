-- ============================================================
-- BILLING/INVOICE SYSTEM - SQL SCHEMA
-- Copy and run this in your Supabase SQL Editor
-- ============================================================

-- 1. CREATE INVOICES TABLE
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

-- 2. CREATE SEQUENCE FOR AUTO-GENERATED INVOICE NUMBERS
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1001;

-- 3. CREATE FUNCTION TO AUTO-GENERATE INVOICE NUMBERS
-- ============================================================
-- Format: INV-YYYY-XXXX (Example: INV-2026-1001)
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. CREATE TRIGGER FOR AUTO-GENERATING INVOICE NUMBERS
-- ============================================================
DROP TRIGGER IF EXISTS set_invoice_number ON public.invoices;
CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION generate_invoice_number();

-- 5. CREATE INDEXES FOR BETTER PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON public.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_job_id ON public.invoices(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 7. CREATE RLS POLICIES
-- ============================================================
-- Policy: Users can view invoices for their company
DROP POLICY IF EXISTS "Users can view company invoices" ON public.invoices;
CREATE POLICY "Users can view company invoices"
  ON public.invoices FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Policy: Users can manage (INSERT, UPDATE, DELETE) invoices for their company
DROP POLICY IF EXISTS "Users can manage company invoices" ON public.invoices;
CREATE POLICY "Users can manage company invoices"
  ON public.invoices FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- ============================================================
-- DONE! Your invoice system is ready to use.
-- ============================================================

-- OPTIONAL: Insert a test invoice (uncomment to use)
-- INSERT INTO public.invoices (
--   company_id,
--   customer_name,
--   customer_email,
--   amount,
--   vat_amount,
--   due_date,
--   notes
-- ) VALUES (
--   'YOUR_COMPANY_ID_HERE',
--   'Test Customer',
--   'test@example.com',
--   100.00,
--   20.00,
--   CURRENT_DATE + INTERVAL '30 days',
--   'Test invoice for system verification'
-- );

-- Check if table was created successfully
-- SELECT * FROM public.invoices LIMIT 5;

-- ============================================================
-- INVOICE SYSTEM - QUICK START SQL
-- Minimal version - copy and paste in Supabase SQL Editor
-- ============================================================
-- ✅ Safe to run: Folosește IF NOT EXISTS - nu va șterge date
-- ✅ Idempotent: Poți rula de mai multe ori fără probleme
-- ⚠️ Requires: Tabelele companies și jobs trebuie să existe deja
-- ⚠️ Requires: Tabelul profiles trebuie să aibă coloana company_id
--
-- NOTĂ: Pentru verificări automate, folosește INVOICE_SQL_WITH_CHECKS.sql
--        Pentru verificare prerequisite, folosește CHECK_PREREQUISITES.sql
-- ============================================================

-- Create invoices table
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

-- Auto-generate invoice numbers (INV-2026-1001, INV-2026-1002, etc.)
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON public.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_job_id ON public.invoices(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- Enable security
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS policies
DROP POLICY IF EXISTS "Users can view company invoices" ON public.invoices;
CREATE POLICY "Users can view company invoices"
  ON public.invoices FOR SELECT
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage company invoices" ON public.invoices;
CREATE POLICY "Users can manage company invoices"
  ON public.invoices FOR ALL
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- ============================================================
-- SQL CODE PENTRU INVOICE - COPIAZĂ ȘI RULEAZĂ ÎN SUPABASE
-- SQL CODE FOR INVOICE - COPY AND RUN IN SUPABASE
-- ============================================================
-- 
-- INSTRUCȚIUNI / INSTRUCTIONS:
-- 1. Deschide Supabase SQL Editor / Open Supabase SQL Editor
-- 2. Copiază TOT din acest fișier / Copy ALL from this file
-- 3. Lipește în SQL Editor / Paste in SQL Editor
-- 4. Apasă "Run" / Click "Run"
-- 
-- ============================================================

-- 1. CREATE INVOICES TABLE / CREEAZĂ TABELUL INVOICES
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

-- 2. AUTO-GENERATE INVOICE NUMBER / AUTO-GENEREAZĂ NUMĂRUL FACTURII
-- ============================================================
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

-- 3. CREATE INDEXES / CREEAZĂ INDEXURI
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON public.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_job_id ON public.invoices(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- 4. ENABLE ROW LEVEL SECURITY / ACTIVEAZĂ SECURITATEA LA NIVEL DE RÂND
-- ============================================================
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 5. CREATE RLS POLICIES / CREEAZĂ POLITICI RLS
-- ============================================================

-- Policy for viewing invoices / Politică pentru vizualizarea facturilor
DROP POLICY IF EXISTS "Users can view company invoices" ON public.invoices;
CREATE POLICY "Users can view company invoices"
  ON public.invoices FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Policy for managing invoices / Politică pentru gestionarea facturilor
DROP POLICY IF EXISTS "Users can manage company invoices" ON public.invoices;
CREATE POLICY "Users can manage company invoices"
  ON public.invoices FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- ============================================================
-- SUCCES! / SUCCESS!
-- ============================================================
-- Tabelul invoices a fost creat cu succes!
-- The invoices table has been created successfully!
-- 
-- Poți acum:
-- You can now:
-- - Crea facturi / Create invoices
-- - Urmări statusul / Track status
-- - Auto-genera numere / Auto-generate numbers
-- - Lega de joburi / Link to jobs
-- ============================================================

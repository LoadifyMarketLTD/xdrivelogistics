-- ============================================================
-- ⚠️  ATENȚIE! IMPORTANT! CITEȘTE ASTA! ⚠️
-- ============================================================
-- 
-- ❌ NU COPIA DOAR: "SQL_CODE_AICI.sql"
-- ✅ COPIAZĂ ÎNTREG CONȚINUTUL DIN ACEST FIȘIER!
--
-- ❌ NU COPIA COD CU "..." (trei puncte)!
-- ✅ COPIAZĂ CODUL COMPLET!
--
-- ERORI COMUNE:
-- - "syntax error at or near SQL_CODE_AICI" = ai copiat NUMELE
-- - "syntax error at or near .." = ai copiat cod cu ... (placeholders)
--
-- SOLUȚIE: Copiază TOT din ACEST fișier, fără ... (placeholders)!
--
-- ============================================================
-- SQL CODE COMPLET - COPIAZĂ ȘI RULEAZĂ ÎN SUPABASE
-- COMPLETE SQL CODE - COPY AND RUN IN SUPABASE
-- ============================================================
-- 
-- CONȚINUT / CONTENTS:
--   PART 1: Fix job_bids status constraint (eroare "Failed to submit bid")
--   PART 2: Create invoices table
-- 
-- INSTRUCȚIUNI / INSTRUCTIONS:
-- 1. Deschide Supabase SQL Editor / Open Supabase SQL Editor
-- 2. Selectează TOT (Ctrl+A) / Select ALL (Ctrl+A)
-- 3. Copiază TOT (Ctrl+C) / Copy ALL (Ctrl+C)
-- 4. Lipește în SQL Editor (Ctrl+V) / Paste in SQL Editor (Ctrl+V)
-- 5. Apasă "Run" / Click "Run"
-- 
-- ============================================================


-- ============================================================
-- PART 1: FIX job_bids STATUS CONSTRAINT
-- Fixes: "Failed to submit bid: new row for relation job_bids
--         violates check constraint job_bids_status_check"
-- ============================================================

-- 1a. Migrate any existing 'pending' bids to 'submitted'
UPDATE public.job_bids
SET status = 'submitted'
WHERE status = 'pending';

-- 1b. Fix the column default
ALTER TABLE public.job_bids
  ALTER COLUMN status SET DEFAULT 'submitted';

-- 1c. Drop any check constraint on job_bids.status that references 'pending'
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public'
      AND rel.relname = 'job_bids'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) LIKE '%pending%'
  LOOP
    EXECUTE 'ALTER TABLE public.job_bids DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
  END LOOP;
END $$;

-- 1d. Drop and re-add the named constraint with the correct set of values
ALTER TABLE public.job_bids
  DROP CONSTRAINT IF EXISTS job_bids_status_check;

ALTER TABLE public.job_bids
  ADD CONSTRAINT job_bids_status_check
  CHECK (status IN ('submitted', 'withdrawn', 'rejected', 'accepted'));

-- 1e. Ensure essential columns exist (safe – skips if already present)
DO $$
BEGIN
  -- bidder_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'job_bids' AND column_name = 'bidder_id'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'job_bids' AND column_name = 'bidder_user_id'
    ) THEN
      ALTER TABLE public.job_bids RENAME COLUMN bidder_user_id TO bidder_id;
    ELSE
      ALTER TABLE public.job_bids ADD COLUMN bidder_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
  END IF;

  -- amount_gbp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'job_bids' AND column_name = 'amount_gbp'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'job_bids' AND column_name = 'quote_amount'
    ) THEN
      ALTER TABLE public.job_bids RENAME COLUMN quote_amount TO amount_gbp;
      ALTER TABLE public.job_bids ALTER COLUMN amount_gbp TYPE NUMERIC(12,2);
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'job_bids' AND column_name = 'amount'
    ) THEN
      ALTER TABLE public.job_bids RENAME COLUMN amount TO amount_gbp;
      ALTER TABLE public.job_bids ALTER COLUMN amount_gbp TYPE NUMERIC(12,2);
    ELSE
      ALTER TABLE public.job_bids ADD COLUMN amount_gbp NUMERIC(12,2) NOT NULL DEFAULT 0;
    END IF;
  END IF;

  -- message
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'job_bids' AND column_name = 'message'
  ) THEN
    ALTER TABLE public.job_bids ADD COLUMN message TEXT;
  END IF;
END $$;

-- 1f. Indexes for job_bids
CREATE INDEX IF NOT EXISTS idx_job_bids_bidder_id ON public.job_bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_job_bids_status    ON public.job_bids(status);


-- ============================================================
-- PART 2: CREATE INVOICES TABLE / CREEAZĂ TABELUL INVOICES
-- ============================================================

-- 2a. Create the invoices table
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

-- 2b. Auto-generate invoice number / Auto-generează numărul facturii
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

-- 2c. Indexes for invoices
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON public.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_job_id ON public.invoices(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- 2d. Enable Row Level Security
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 2e. RLS Policies
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


-- ============================================================
-- VERIFICARE / VERIFICATION
-- ============================================================
-- Run these queries to confirm everything is correct:

-- Check job_bids.status column and constraint
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'job_bids' AND column_name = 'status';

-- Check invoices table exists
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'invoices';


-- ============================================================
-- SUCCES! / SUCCESS!
-- ============================================================
-- PART 1: job_bids status constraint fixed!
--   - Bids can now be submitted without errors.
--   - All existing 'pending' bids migrated to 'submitted'.
--
-- PART 2: invoices table created!
--   - Crea facturi / Create invoices
--   - Urmări statusul / Track status
--   - Auto-genera numere / Auto-generate numbers
--   - Lega de joburi / Link to jobs
-- ============================================================

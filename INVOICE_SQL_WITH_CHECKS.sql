-- ============================================================
-- SISTEM COMPLET DE FACTURARE - CU VERIFICĂRI PREREQUISITE
-- ============================================================
-- ✅ Safe to run: Folosește IF NOT EXISTS - nu va șterge date
-- ✅ Idempotent: Poți rula de mai multe ori fără probleme
-- ⚠️ Requires: Tabelele companies și jobs trebuie să existe
-- ⚠️ Requires: Tabelul profiles trebuie să aibă coloana company_id
--
-- IMPORTANT: Rulează mai întâi CHECK_PREREQUISITES.sql
--            pentru a verifica că totul este pregătit!
-- ============================================================

-- Enable UUID extension (safe, nu face nimic dacă există deja)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- VERIFICĂRI PREREQUISITE (oprește dacă lipsește ceva critic)
-- ============================================================

-- Verifică tabelul COMPANIES (OBLIGATORIU)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                 WHERE table_schema = 'public' 
                 AND table_name = 'companies') THEN
    RAISE EXCEPTION 'EROARE: Tabelul "companies" nu există! Creează-l mai întâi.';
  END IF;
  RAISE NOTICE '✅ Verificare: Tabelul "companies" există';
END $$;

-- Verifică tabelul PROFILES și coloana company_id (OBLIGATORIU pentru RLS)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles') THEN
    RAISE EXCEPTION 'EROARE: Tabelul "profiles" nu există! Creează-l mai întâi.';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'company_id') THEN
    RAISE EXCEPTION 'EROARE: Coloana "company_id" lipsește din tabelul "profiles"! Adaugă-o mai întâi.';
  END IF;
  
  RAISE NOTICE '✅ Verificare: Tabelul "profiles" cu coloana "company_id" există';
END $$;

-- Verifică tabelul JOBS (OPȚIONAL dar recomandat)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name = 'jobs') THEN
    RAISE NOTICE '✅ Verificare: Tabelul "jobs" există (invoices vor putea fi legate de jobs)';
  ELSE
    RAISE WARNING '⚠️  Tabelul "jobs" nu există. Invoices-urile vor fi create fără legătură la jobs.';
  END IF;
END $$;

-- ============================================================
-- 1. CREEAZĂ TABELUL INVOICES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  invoice_number VARCHAR(20) UNIQUE NOT NULL,
  job_id UUID, -- Foreign key va fi adăugată mai jos dacă tabelul jobs există
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

-- Adaugă foreign key pentru job_id doar dacă tabelul jobs există
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name = 'jobs') THEN
    -- Șterge constraint-ul existent dacă există
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'invoices_job_id_fkey' 
               AND table_name = 'invoices') THEN
      ALTER TABLE public.invoices DROP CONSTRAINT invoices_job_id_fkey;
    END IF;
    
    -- Adaugă constraint-ul
    ALTER TABLE public.invoices 
      ADD CONSTRAINT invoices_job_id_fkey 
      FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;
    
    RAISE NOTICE '✅ Foreign key pentru job_id adăugat cu succes';
  ELSE
    RAISE WARNING '⚠️  Foreign key pentru job_id nu a fost adăugat (tabelul jobs nu există)';
  END IF;
END $$;

-- ============================================================
-- 2. SECVENȚĂ PENTRU NUMERELE AUTOMATE DE FACTURI
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1001;

-- ============================================================
-- 3. FUNCȚIE PENTRU GENERAREA AUTOMATĂ A NUMERELOR
-- ============================================================
-- Format: INV-YYYY-XXXX (ex: INV-2026-1001, INV-2026-1002)
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 4. TRIGGER PENTRU GENERAREA AUTOMATĂ
-- ============================================================
DROP TRIGGER IF EXISTS set_invoice_number ON public.invoices;
CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION generate_invoice_number();

-- ============================================================
-- 5. INDEXURI PENTRU PERFORMANȚĂ
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON public.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_job_id ON public.invoices(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON public.invoices(created_at DESC);

-- ============================================================
-- 6. ACTIVEAZĂ ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. RLS POLICIES - Fiecare companie vede doar facturile sale
-- ============================================================

-- Policy pentru SELECT (citire)
DROP POLICY IF EXISTS "Users can view company invoices" ON public.invoices;
CREATE POLICY "Users can view company invoices"
  ON public.invoices FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Policy pentru INSERT, UPDATE, DELETE (gestionare completă)
DROP POLICY IF EXISTS "Users can manage company invoices" ON public.invoices;
CREATE POLICY "Users can manage company invoices"
  ON public.invoices FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- ============================================================
-- 8. TRIGGER PENTRU AUTO-UPDATE LA UPDATED_AT
-- ============================================================
CREATE OR REPLACE FUNCTION update_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_invoices_updated_at ON public.invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_invoices_updated_at();

-- ============================================================
-- VERIFICARE FINALĂ - Totul a fost creat cu succes
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================================';
  RAISE NOTICE '✅ SUCCES: Sistemul de facturare a fost creat/actualizat!';
  RAISE NOTICE '============================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Ce a fost creat:';
  RAISE NOTICE '  ✅ Tabelul "invoices" cu toate câmpurile';
  RAISE NOTICE '  ✅ Secvența "invoice_number_seq" pentru numere automate';
  RAISE NOTICE '  ✅ Funcția "generate_invoice_number()"';
  RAISE NOTICE '  ✅ Trigger "set_invoice_number"';
  RAISE NOTICE '  ✅ 4 indexuri pentru performanță';
  RAISE NOTICE '  ✅ RLS activat pe tabelul invoices';
  RAISE NOTICE '  ✅ 2 RLS policies pentru securitate';
  RAISE NOTICE '  ✅ Trigger pentru auto-update updated_at';
  RAISE NOTICE '';
  RAISE NOTICE 'Poți acum:';
  RAISE NOTICE '  → Accesa /invoices în aplicație';
  RAISE NOTICE '  → Crea prima factură';
  RAISE NOTICE '  → Testa toate funcționalitățile';
  RAISE NOTICE '';
  RAISE NOTICE 'Verificare:';
  RAISE NOTICE '  → SELECT * FROM public.invoices LIMIT 5;';
  RAISE NOTICE '============================================================';
END $$;

-- ============================================================
-- VERIFICARE PREREQUISITE - Sistem de Facturare
-- Rulează acest script pentru a verifica dacă toate tabelele
-- necesare există înainte de a crea sistemul de invoices
-- ============================================================

-- Verifică tabelul COMPANIES
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name = 'companies') THEN
    RAISE NOTICE '✅ Tabelul "companies" există';
  ELSE
    RAISE WARNING '❌ LIPSEȘTE: Tabelul "companies" nu există!';
    RAISE WARNING '   → Trebuie să creezi mai întâi tabelul companies';
  END IF;
END $$;

-- Verifică tabelul JOBS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name = 'jobs') THEN
    RAISE NOTICE '✅ Tabelul "jobs" există';
  ELSE
    RAISE WARNING '❌ LIPSEȘTE: Tabelul "jobs" nu există!';
    RAISE WARNING '   → Invoices-urile pot fi legate de jobs (opțional dar recomandat)';
  END IF;
END $$;

-- Verifică tabelul PROFILES
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name = 'profiles') THEN
    RAISE NOTICE '✅ Tabelul "profiles" există';
    
    -- Verifică coloana company_id în profiles
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'profiles' 
               AND column_name = 'company_id') THEN
      RAISE NOTICE '✅ Coloana "company_id" există în profiles';
    ELSE
      RAISE WARNING '❌ LIPSEȘTE: Coloana "company_id" nu există în profiles!';
      RAISE WARNING '   → RLS policies pentru invoices necesită această coloană';
    END IF;
  ELSE
    RAISE WARNING '❌ LIPSEȘTE: Tabelul "profiles" nu există!';
    RAISE WARNING '   → RLS policies pentru invoices necesită acest tabel';
  END IF;
END $$;

-- Verifică extensia UUID
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
    RAISE NOTICE '✅ Extensia "uuid-ossp" este activată';
  ELSE
    RAISE WARNING '⚠️  Extensia "uuid-ossp" nu este activată';
    RAISE WARNING '   → Rulează: CREATE EXTENSION IF NOT EXISTS "uuid-ossp";';
  END IF;
END $$;

-- REZUMAT FINAL
DO $$
DECLARE
  missing_count INTEGER := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'REZUMAT VERIFICARE PREREQUISITE';
  RAISE NOTICE '============================================================';
  
  -- Count missing items
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                 WHERE table_schema = 'public' AND table_name = 'companies') THEN
    missing_count := missing_count + 1;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                 WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    missing_count := missing_count + 1;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'profiles')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_schema = 'public' 
                     AND table_name = 'profiles' 
                     AND column_name = 'company_id') THEN
    missing_count := missing_count + 1;
  END IF;
  
  IF missing_count = 0 THEN
    RAISE NOTICE '✅ TOTUL OK: Toate prerequisitele sunt îndeplinite!';
    RAISE NOTICE '   → Poți rula acum INVOICE_SQL_WITH_CHECKS.sql';
  ELSE
    RAISE WARNING '❌ ATENȚIE: Lipsesc % prerequisite(e)!', missing_count;
    RAISE WARNING '   → Rezolvă problemele de mai sus înainte de a crea invoices';
  END IF;
  
  RAISE NOTICE '============================================================';
END $$;

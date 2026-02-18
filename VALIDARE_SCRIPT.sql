-- ============================================================
-- SCRIPT DE VALIDARE SQL - Verifică că totul a fost creat corect
-- SQL VALIDATION SCRIPT - Verify everything was created correctly
-- ============================================================
-- 
-- Copiază și rulează acest script în Supabase SQL Editor
-- pentru a verifica că toate obiectele au fost create cu succes
--
-- ============================================================

-- ============================================================
-- VERIFICARE 1: Tabelul invoices
-- ============================================================
SELECT 
  'Tabel invoices' AS verificare,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'invoices'
    ) THEN '✅ EXISTĂ'
    ELSE '❌ NU EXISTĂ'
  END AS status;

-- ============================================================
-- VERIFICARE 2: Coloane tabel invoices (ar trebui 14)
-- ============================================================
SELECT 
  'Coloane invoices' AS verificare,
  COUNT(*) || ' coloane' AS status
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'invoices';

-- Lista coloanelor
SELECT 
  ordinal_position AS nr,
  column_name AS coloana,
  data_type AS tip,
  is_nullable AS nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'invoices'
ORDER BY ordinal_position;

-- ============================================================
-- VERIFICARE 3: Secvența invoice_number_seq
-- ============================================================
SELECT 
  'Secvență invoice_number_seq' AS verificare,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_sequences 
      WHERE schemaname = 'public' AND sequencename = 'invoice_number_seq'
    ) THEN '✅ EXISTĂ'
    ELSE '❌ NU EXISTĂ'
  END AS status;

-- Valoarea curentă a secvenței
SELECT 
  'Valoare secvență' AS verificare,
  COALESCE(last_value::text, 'N/A') AS status
FROM pg_sequences 
WHERE schemaname = 'public' AND sequencename = 'invoice_number_seq';

-- ============================================================
-- VERIFICARE 4: Funcția generate_invoice_number
-- ============================================================
SELECT 
  'Funcție generate_invoice_number' AS verificare,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'generate_invoice_number'
    ) THEN '✅ EXISTĂ'
    ELSE '❌ NU EXISTĂ'
  END AS status;

-- ============================================================
-- VERIFICARE 5: Trigger set_invoice_number
-- ============================================================
SELECT 
  'Trigger set_invoice_number' AS verificare,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = 'set_invoice_number'
    ) THEN '✅ EXISTĂ'
    ELSE '❌ NU EXISTĂ'
  END AS status;

-- ============================================================
-- VERIFICARE 6: Indexuri (ar trebui 3)
-- ============================================================
SELECT 
  'Indexuri invoices' AS verificare,
  COUNT(*) || ' indexuri' AS status
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename = 'invoices'
  AND indexname LIKE 'idx_invoices_%';

-- Lista indexurilor
SELECT 
  indexname AS index_name,
  indexdef AS definitie
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename = 'invoices'
  AND indexname LIKE 'idx_invoices_%';

-- ============================================================
-- VERIFICARE 7: Row Level Security (RLS)
-- ============================================================
SELECT 
  'RLS activat pe invoices' AS verificare,
  CASE 
    WHEN relrowsecurity THEN '✅ ACTIVAT'
    ELSE '❌ DEZACTIVAT'
  END AS status
FROM pg_class 
WHERE relname = 'invoices' AND relnamespace = 'public'::regnamespace;

-- ============================================================
-- VERIFICARE 8: Politici RLS (ar trebui 2)
-- ============================================================
SELECT 
  'Politici RLS' AS verificare,
  COUNT(*) || ' politici' AS status
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'invoices';

-- Lista politicilor
SELECT 
  policyname AS politica,
  cmd AS comanda,
  CASE 
    WHEN qual IS NOT NULL THEN 'Cu condiții'
    ELSE 'Fără condiții'
  END AS tip
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'invoices';

-- ============================================================
-- VERIFICARE 9: Foreign Keys (ar trebui 2)
-- ============================================================
SELECT 
  'Foreign Keys' AS verificare,
  COUNT(*) || ' FK' AS status
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
  AND table_name = 'invoices' 
  AND constraint_type = 'FOREIGN KEY';

-- Lista FK-urilor
SELECT 
  constraint_name AS fk_name,
  table_name AS din_tabel,
  constraint_type AS tip
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
  AND table_name = 'invoices' 
  AND constraint_type = 'FOREIGN KEY';

-- ============================================================
-- VERIFICARE 10: Check Constraints (ar trebui cel puțin 1 pentru status)
-- ============================================================
SELECT 
  'Check Constraints' AS verificare,
  COUNT(*) || ' constraints' AS status
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
  AND table_name = 'invoices' 
  AND constraint_type = 'CHECK';

-- ============================================================
-- REZUMAT FINAL
-- ============================================================
SELECT 
  '============================================================' AS separare;

SELECT 'REZUMAT VERIFICARE' AS titlu, '' AS valoare
UNION ALL
SELECT '============================================================', ''
UNION ALL
SELECT 'Tabel invoices', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') 
  THEN '✅' ELSE '❌' END
UNION ALL
SELECT 'Coloane (14 așteptate)', 
  (SELECT COUNT(*)::text FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices')
UNION ALL
SELECT 'Secvență', 
  CASE WHEN EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'invoice_number_seq') 
  THEN '✅' ELSE '❌' END
UNION ALL
SELECT 'Funcție', 
  CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_invoice_number') 
  THEN '✅' ELSE '❌' END
UNION ALL
SELECT 'Trigger', 
  CASE WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_invoice_number') 
  THEN '✅' ELSE '❌' END
UNION ALL
SELECT 'Indexuri (3 așteptate)', 
  (SELECT COUNT(*)::text FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'invoices' AND indexname LIKE 'idx_invoices_%')
UNION ALL
SELECT 'RLS activat', 
  CASE WHEN EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices' AND relrowsecurity) 
  THEN '✅' ELSE '❌' END
UNION ALL
SELECT 'Politici RLS (2 așteptate)', 
  (SELECT COUNT(*)::text FROM pg_policies WHERE schemaname = 'public' AND tablename = 'invoices')
UNION ALL
SELECT 'Foreign Keys (2 așteptate)', 
  (SELECT COUNT(*)::text FROM information_schema.table_constraints WHERE table_schema = 'public' AND table_name = 'invoices' AND constraint_type = 'FOREIGN KEY')
UNION ALL
SELECT '============================================================', '';

-- ============================================================
-- TEST FUNCȚIONAL - Testează auto-generarea numerelor
-- ============================================================
SELECT '============================================================' AS separare;
SELECT 'TEST FUNCȚIONAL' AS titlu;
SELECT '============================================================' AS separare;

-- NOTĂ: Următoarea comandă va insera o factură de test
-- Decomentează doar dacă vrei să testezi efectiv
-- (apoi șterge-o cu comanda de mai jos)

/*
-- Inserează factură de test
INSERT INTO public.invoices (company_id, customer_name, amount, due_date)
VALUES (
  (SELECT id FROM public.companies LIMIT 1),
  'Test Customer - ȘTERGERE',
  100.00,
  CURRENT_DATE + INTERVAL '30 days'
)
RETURNING 
  invoice_number AS numar_generat,
  customer_name AS client,
  amount AS suma,
  created_at AS creat_la;

-- Verifică numărul generat
SELECT 
  invoice_number,
  customer_name,
  amount,
  status,
  created_at
FROM public.invoices 
WHERE customer_name = 'Test Customer - ȘTERGERE'
ORDER BY created_at DESC 
LIMIT 1;

-- ȘTERGE factura de test
DELETE FROM public.invoices 
WHERE customer_name = 'Test Customer - ȘTERGERE';

SELECT 'Test complet - factura ștearsă' AS rezultat;
*/

-- ============================================================
-- CONCLUZIE
-- ============================================================
SELECT '============================================================' AS separare;
SELECT 
  CASE 
    WHEN 
      (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') = 1
      AND (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices') = 14
      AND (SELECT COUNT(*) FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'invoice_number_seq') = 1
      AND (SELECT COUNT(*) FROM pg_proc WHERE proname = 'generate_invoice_number') >= 1
      AND (SELECT COUNT(*) FROM pg_trigger WHERE tgname = 'set_invoice_number') >= 1
      AND (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'invoices' AND indexname LIKE 'idx_invoices_%') = 3
      AND (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'invoices') = 2
    THEN '✅ TOTUL ESTE PERFECT! Tabelul invoices este complet funcțional!'
    ELSE '⚠️ LIPSESC UNELE COMPONENTE - Verifică erorile de mai sus'
  END AS concluzie_finala;

SELECT '============================================================' AS separare;

-- ============================================================
-- SFÂRȘIT VALIDARE
-- ============================================================

# 📘 SQL Examples - Cum să Scrii SQL Corect în PostgreSQL/Supabase

## ⚠️ Erori Comune și Cum să le Eviți

### ❌ EROARE 1: Folosirea Placeholder-elor (`...`)

**GREȘIT** (produce eroare de sintaxă):
```sql
CREATE TABLE IF NOT EXISTS ...
CREATE INDEX IF NOT EXISTS ...
```

**Eroare**:
```
ERROR: 42601: syntax error at or near ".."
```

**CORECT**:
```sql
-- Completează cu codul real, nu lăsa placeholders
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL,
  invoice_number VARCHAR(20) UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_company_id 
  ON public.invoices(company_id);
```

---

### ❌ EROARE 2: IF Statement fără DO Block

**GREȘIT** (produce eroare de sintaxă):
```sql
-- ❌ Acest cod NU funcționează în PostgreSQL
IF EXISTS (SELECT 1 FROM information_schema.tables 
           WHERE table_name = 'jobs') THEN
  ALTER TABLE public.invoices 
    ADD CONSTRAINT invoices_job_id_fkey 
    FOREIGN KEY (job_id) REFERENCES public.jobs(id);
END IF;
```

**Eroare**:
```
ERROR: 42601: syntax error at or near "IF"
LINE 1: IF EXISTS (SELECT 1 FROM information_schema.tables
        ^
```

**De ce?** În PostgreSQL, logica procedurală (IF, LOOP, etc.) trebuie să fie în **funcții** sau **DO blocks**.

**CORECT** - Opțiunea 1: Folosește DO Block:
```sql
-- ✅ Acest cod funcționează
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public'
             AND table_name = 'jobs') THEN
    
    -- Șterge constraint-ul dacă există deja
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'invoices_job_id_fkey' 
               AND table_name = 'invoices') THEN
      ALTER TABLE public.invoices DROP CONSTRAINT invoices_job_id_fkey;
    END IF;
    
    -- Adaugă constraint-ul
    ALTER TABLE public.invoices 
      ADD CONSTRAINT invoices_job_id_fkey 
      FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;
      
    RAISE NOTICE '✅ Foreign key pentru job_id adăugat';
  ELSE
    RAISE WARNING '⚠️  Tabelul jobs nu există, foreign key nu a fost adăugat';
  END IF;
END $$;
```

**CORECT** - Opțiunea 2: Creează Funcție:
```sql
-- ✅ Alternativ: Creează o funcție
CREATE OR REPLACE FUNCTION add_job_fk_if_exists()
RETURNS void AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public'
             AND table_name = 'jobs') THEN
    ALTER TABLE public.invoices 
      ADD CONSTRAINT invoices_job_id_fkey 
      FOREIGN KEY (job_id) REFERENCES public.jobs(id);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Apoi rulează funcția
SELECT add_job_fk_if_exists();
```

---

### ❌ EROARE 3: Constraint Duplicate

**GREȘIT** (produce eroare dacă rulezi de 2 ori):
```sql
-- ❌ Acest cod produce eroare la rulare repetată
ALTER TABLE public.invoices 
  ADD CONSTRAINT invoices_job_id_fkey 
  FOREIGN KEY (job_id) REFERENCES public.jobs(id);
```

**Eroare**:
```
ERROR: constraint "invoices_job_id_fkey" already exists
```

**CORECT** - Verifică înainte de adăugare:
```sql
-- ✅ Safe și idempotent
DO $$
BEGIN
  -- Verifică dacă constraint-ul există deja
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'invoices_job_id_fkey' 
    AND table_name = 'invoices'
    AND table_schema = 'public'
  ) THEN
    -- Adaugă doar dacă nu există
    ALTER TABLE public.invoices 
      ADD CONSTRAINT invoices_job_id_fkey 
      FOREIGN KEY (job_id) REFERENCES public.jobs(id);
    
    RAISE NOTICE '✅ Constraint adăugat';
  ELSE
    RAISE NOTICE 'ℹ️  Constraint există deja, nu este nevoie să-l adăugăm';
  END IF;
END $$;
```

---

### ❌ EROARE 4: Trigger fără Șterge-Creează Pattern

**GREȘIT** (produce eroare la rulare repetată):
```sql
-- ❌ Produce eroare dacă trigger-ul există deja
CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION generate_invoice_number();
```

**CORECT** - Șterge mai întâi, apoi creează:
```sql
-- ✅ Sigur și idempotent
DROP TRIGGER IF EXISTS set_invoice_number ON public.invoices;
CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION generate_invoice_number();
```

---

### ❌ EROARE 5: Policy fără Șterge-Creează Pattern

**GREȘIT**:
```sql
-- ❌ Produce eroare dacă policy există deja
CREATE POLICY "Users can view company invoices"
  ON public.invoices FOR SELECT
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
```

**CORECT**:
```sql
-- ✅ Sigur și idempotent
DROP POLICY IF EXISTS "Users can view company invoices" ON public.invoices;
CREATE POLICY "Users can view company invoices"
  ON public.invoices FOR SELECT
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
```

---

## ✅ PATTERN-URI RECOMANDATE

### Pattern 1: Crearea Tabelelor (Safe & Idempotent)

```sql
-- ✅ Folosește întotdeauna IF NOT EXISTS
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  invoice_number VARCHAR(20) UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  vat_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'paid', 'overdue', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Pattern 2: Indexuri (Safe & Idempotent)

```sql
-- ✅ IF NOT EXISTS pentru indexuri
CREATE INDEX IF NOT EXISTS idx_invoices_company_id 
  ON public.invoices(company_id);

CREATE INDEX IF NOT EXISTS idx_invoices_status 
  ON public.invoices(status);

CREATE INDEX IF NOT EXISTS idx_invoices_created_at 
  ON public.invoices(created_at DESC);
```

### Pattern 3: Secvențe (Safe & Idempotent)

```sql
-- ✅ IF NOT EXISTS pentru secvențe
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1001;
```

### Pattern 4: Funcții (Safe & Idempotent)

```sql
-- ✅ CREATE OR REPLACE pentru funcții
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || 
                          LPAD(NEXTVAL('invoice_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Pattern 5: Trigger-e (Safe & Idempotent)

```sql
-- ✅ DROP IF EXISTS + CREATE
DROP TRIGGER IF EXISTS set_invoice_number ON public.invoices;
CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION generate_invoice_number();
```

### Pattern 6: RLS Policies (Safe & Idempotent)

```sql
-- ✅ Activează RLS (safe, nu produce eroare dacă e deja activat)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- ✅ DROP IF EXISTS + CREATE pentru policies
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
```

### Pattern 7: Logică Condiționată (DO Blocks)

```sql
-- ✅ DO block pentru logică condiționată
DO $$
BEGIN
  -- Verifică dacă ceva există
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name = 'jobs') THEN
    
    -- Execută ceva doar dacă există
    RAISE NOTICE '✅ Tabelul jobs există';
    
    -- Poți adăuga mai multe acțiuni aici
    ALTER TABLE public.invoices 
      ADD CONSTRAINT invoices_job_id_fkey 
      FOREIGN KEY (job_id) REFERENCES public.jobs(id);
      
  ELSE
    -- Sau altceva dacă nu există
    RAISE WARNING '⚠️  Tabelul jobs nu există';
  END IF;
END $$;
```

### Pattern 8: Verificări și Erori

```sql
-- ✅ Verifică prerequisite și oprește dacă lipsesc
DO $$
BEGIN
  -- Verificare obligatorie
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                 WHERE table_schema = 'public' 
                 AND table_name = 'companies') THEN
    RAISE EXCEPTION 'EROARE: Tabelul "companies" nu există! Creează-l mai întâi.';
  END IF;
  
  -- Verificare cu warning (nu oprește)
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                 WHERE table_schema = 'public' 
                 AND table_name = 'jobs') THEN
    RAISE WARNING '⚠️  Tabelul "jobs" nu există (opțional)';
  END IF;
  
  -- Verificare cu info
  RAISE NOTICE '✅ Toate verificările au trecut';
END $$;
```

---

## 🎯 CHECKLIST: SQL Corect și Sigur

Când scrii SQL pentru producție, verifică:

- [ ] **IF NOT EXISTS** pentru: CREATE TABLE, CREATE INDEX, CREATE SEQUENCE
- [ ] **CREATE OR REPLACE** pentru: CREATE FUNCTION
- [ ] **DROP IF EXISTS + CREATE** pentru: TRIGGER, POLICY
- [ ] **DO $$ BEGIN ... END $$;** pentru: IF, LOOP, logică procedurală
- [ ] **RAISE NOTICE/WARNING/EXCEPTION** pentru: mesaje și erori
- [ ] **table_schema = 'public'** în: verificări information_schema
- [ ] **Fără placeholders** (`...`): cod complet și funcțional

---

## 📚 RESURSE UTILE

### Documentație PostgreSQL
- [Control Structures (IF, LOOP)](https://www.postgresql.org/docs/current/plpgsql-control-structures.html)
- [DO Statement](https://www.postgresql.org/docs/current/sql-do.html)
- [CREATE TRIGGER](https://www.postgresql.org/docs/current/sql-createtrigger.html)
- [Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

### Fișiere de Referință în Acest Repo
- `INVOICE_SQL_WITH_CHECKS.sql` - Exemple complete cu verificări
- `CHECK_PREREQUISITES.sql` - Exemple de verificări
- `supabase-schema.sql` - Schema completă

---

**Creat**: 18 Februarie 2026  
**Scop**: Ghid de referință pentru SQL corect în PostgreSQL/Supabase  
**Status**: ✅ Production Ready

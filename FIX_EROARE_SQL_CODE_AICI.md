# ❌ EROARE: "syntax error at or near SQL_CODE_AICI"

## 🔴 PROBLEMA TA

Ai primit această eroare:
```
ERROR: 42601: syntax error at or near "SQL_CODE_AICI"
LINE 1: SQL_CODE_AICI.sql
```

## 💡 CE S-A ÎNTÂMPLAT?

Ai încercat să rulezi **NUMELE FIȘIERULUI** ca și cod SQL, nu **CONȚINUTUL FIȘIERULUI**!

### ❌ CE AI FĂCUT GREȘIT:
```sql
SQL_CODE_AICI.sql   ← Acest text este un NUME DE FIȘIER, nu cod SQL!
```

### ✅ CE TREBUIA SĂ FACI:
Trebuia să copiezi **CONȚINUTUL** din fișierul `SQL_CODE_AICI.sql`, care arată așa:

```sql
-- ============================================================
-- SQL CODE PENTRU INVOICE - COPIAZĂ ȘI RULEAZĂ ÎN SUPABASE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  invoice_number VARCHAR(20) UNIQUE NOT NULL,
  ...
);

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  ...
END;
$$ LANGUAGE plpgsql;

... (și tot restul codului SQL)
```

---

## 🎯 SOLUȚIA - PASUL CU PASUL

### Pasul 1: Deschide fișierul SQL
- În GitHub/VS Code/Editor
- Caută fișierul numit: `SQL_CODE_AICI.sql`
- Click pe el pentru a-l deschide

### Pasul 2: Selectează TOT conținutul
- Click în fișier
- Apasă **Ctrl+A** (Windows/Linux) sau **Cmd+A** (Mac)
- Sau: Click la început, scroll până la sfârșit, Shift+Click la final

### Pasul 3: Copiază conținutul
- Apasă **Ctrl+C** (Windows/Linux) sau **Cmd+C** (Mac)
- Asigură-te că ai copiat TOT, de la primul `--` până la ultimul `--`

### Pasul 4: Mergi în Supabase
- Deschide https://supabase.com
- Selectează proiectul tău
- Click pe **"SQL Editor"** în meniul din stânga

### Pasul 5: Lipește codul SQL
- Click în zona de editare SQL din Supabase
- Apasă **Ctrl+V** (Windows/Linux) sau **Cmd+V** (Mac)
- Verifică că vezi codul SQL complet (CREATE TABLE, CREATE FUNCTION, etc.)

### Pasul 6: Rulează codul
- Click pe butonul verde **"Run"** (sau apasă F5)
- Așteaptă să termine execuția
- Ar trebui să vezi mesaje de succes!

---

## 📊 COMPARAȚIE: GREȘIT vs CORECT

### ❌ GREȘIT - Ce AI copiat:
```
SQL_CODE_AICI.sql
```
**Aceasta e doar un nume de fișier! Nu este cod SQL valid!**

### ✅ CORECT - Ce TREBUIA să copiezi:
```sql
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
```

**Acesta e codul SQL complet! Copiază TOT textul de mai sus!**

---

## 🎓 CE AI ÎNVĂȚAT

1. **Numele de fișier** ≠ **Conținutul fișierului**
2. **`SQL_CODE_AICI.sql`** este doar un nume, nu cod SQL
3. Trebuie să **deschizi fișierul** și să **copiezi conținutul**
4. SQL-ul real începe cu `CREATE TABLE`, `CREATE FUNCTION`, etc.

---

## ✅ CHECKLIST

- [ ] Am deschis fișierul `SQL_CODE_AICI.sql` în editor
- [ ] Am selectat TOT conținutul (Ctrl+A)
- [ ] Am copiat conținutul (Ctrl+C)
- [ ] Am deschis Supabase SQL Editor
- [ ] Am lipit conținutul (Ctrl+V)
- [ ] Văd cod SQL real (CREATE TABLE, CREATE FUNCTION)
- [ ] NU văd doar "SQL_CODE_AICI.sql"
- [ ] Am dat click pe "Run"
- [ ] A mers! ✅

---

## 🆘 ÎNCĂ AI PROBLEME?

Dacă ai urmat toți pașii și tot ai erori, verifică:

1. **Ai copiat TOT fișierul?** (de la primul `--` până la ultimul `--`)
2. **Ai copiat din fișierul corect?** (`SQL_CODE_AICI.sql`, nu alt fișier)
3. **Există tabelele necesare?** (trebuie să existe `companies` și `profiles`)
4. **Ești în proiectul corect în Supabase?**

---

## 🎯 CONCLUZIE

**NU copia NUMELE de fișier!**
**Copiază CONȚINUTUL din fișier!**

🎉 **Succes!**

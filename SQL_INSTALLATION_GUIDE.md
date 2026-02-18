# 🔍 GHID: Verificare și Instalare Sistem Facturare

## 📋 Fișiere Disponibile

### 1. **CHECK_PREREQUISITES.sql** - Script de Verificare
Verifică dacă toate tabelele necesare există înainte de instalare.

### 2. **INVOICE_SQL_WITH_CHECKS.sql** - Instalare Completă cu Verificări
Creează sistemul de facturare cu verificări automate de prerequisite.

### 3. **INVOICE_SQL_QUICK.sql** - Instalare Rapidă
Versiune simplificată fără verificări (folosește dacă ești sigur că totul există).

---

## 🚀 INSTALARE PAS CU PAS

### PASUL 1: Verifică Prerequisitele

```sql
-- Copiază și rulează în Supabase SQL Editor
-- Fișier: CHECK_PREREQUISITES.sql
```

**Ce face:**
- ✅ Verifică dacă tabelul `companies` există
- ✅ Verifică dacă tabelul `jobs` există (opțional)
- ✅ Verifică dacă tabelul `profiles` există
- ✅ Verifică dacă coloana `company_id` există în `profiles`
- ✅ Verifică extensia `uuid-ossp`

**Output așteptat:**
```
✅ Tabelul "companies" există
✅ Tabelul "jobs" există
✅ Tabelul "profiles" există
✅ Coloana "company_id" există în profiles
✅ Extensia "uuid-ossp" este activată
✅ TOTUL OK: Toate prerequisitele sunt îndeplinite!
```

---

### PASUL 2: Instalează Sistemul de Facturare

#### Opțiunea A: Cu Verificări Automate (RECOMANDAT)

```sql
-- Copiază și rulează în Supabase SQL Editor
-- Fișier: INVOICE_SQL_WITH_CHECKS.sql
```

**Avantaje:**
- ✅ Oprește automat dacă lipsește ceva critic
- ✅ Adaugă foreign key pentru jobs doar dacă tabelul există
- ✅ Mesaje clare despre ce se întâmplă
- ✅ Verificare finală cu rezumat

#### Opțiunea B: Rapid (pentru experți)

```sql
-- Copiază și rulează în Supabase SQL Editor
-- Fișier: INVOICE_SQL_QUICK.sql
```

---

## ⚠️ CE FACE DACĂ LIPSEȘTE CEVA?

### Problema: Tabelul `companies` nu există

**Soluție:**
```sql
-- Rulează mai întâi schema completă sau creează tabelul companies
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Problema: Tabelul `profiles` nu are coloana `company_id`

**Soluție:**
```sql
-- Adaugă coloana company_id în profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- Adaugă index
CREATE INDEX IF NOT EXISTS idx_profiles_company_id 
  ON public.profiles(company_id);
```

### Problema: Tabelul `jobs` nu există

**Notă:** Acest tabel este **opțional**. Invoices-urile pot fi create și fără jobs.
- Dacă vrei legătura job→invoice, creează tabelul jobs mai întâi
- Dacă nu ai nevoie, scriptul va funcționa fără el

---

## ✅ CARACTERISTICI SCRIPTURI

### Safe to Run (Sigur de Rulat)
```sql
-- Toate comenzile folosesc IF NOT EXISTS
-- Exemple (NU copia literal, folosește fișierele complete):

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL,
  ...
);

CREATE INDEX IF NOT EXISTS idx_invoices_company_id 
  ON public.invoices(company_id);

CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1001;

-- Nu șterge date existente
-- Nu produce erori dacă obiectele există deja
```

**⚠️ IMPORTANT**: Aceste sunt doar exemple ilustrative! 
Pentru SQL complet și funcțional, folosește fișierele:
- `INVOICE_SQL_WITH_CHECKS.sql` (recomandat)
- `INVOICE_SQL_QUICK.sql` (rapid)

### Idempotent (Poate fi Rulat de Mai Multe Ori)
```sql
-- Poți rula scriptul de 10 ori
-- Va produce același rezultat de fiecare dată
-- Nu va crea duplicate sau erori

DROP TRIGGER IF EXISTS ...  -- Șterge mai întâi
CREATE TRIGGER ...          -- Apoi creează

DROP POLICY IF EXISTS ...   -- Șterge mai întâi
CREATE POLICY ...           -- Apoi creează
```

---

## 🔧 VERIFICARE DUPĂ INSTALARE

### 1. Verifică că tabelul există
```sql
SELECT table_name, table_schema
FROM information_schema.tables
WHERE table_name = 'invoices';
```

### 2. Verifică structura tabelului
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'invoices'
ORDER BY ordinal_position;
```

### 3. Verifică secvența
```sql
SELECT last_value FROM invoice_number_seq;
-- Ar trebui să returneze 1000 (înainte de prima factură)
```

### 4. Verifică trigger-ul
```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'set_invoice_number';
```

### 5. Verifică RLS policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'invoices';
```

### 6. Test creare factură
```sql
-- Înlocuiește YOUR_COMPANY_ID cu un ID real de companie
INSERT INTO public.invoices (
  company_id,
  customer_name,
  customer_email,
  amount,
  vat_amount,
  due_date
) VALUES (
  'YOUR_COMPANY_ID',
  'Test Customer',
  'test@example.com',
  100.00,
  20.00,
  CURRENT_DATE + INTERVAL '30 days'
);

-- Verifică că numărul a fost generat automat
SELECT invoice_number, customer_name, amount, vat_amount
FROM public.invoices
ORDER BY created_at DESC
LIMIT 1;

-- Ar trebui să vezi: INV-2026-1001
```

---

## 🎯 TROUBLESHOOTING

### Eroare: "relation 'companies' does not exist"
**Cauză:** Tabelul companies nu există  
**Soluție:** Rulează schema completă sau creează tabelul companies

### Eroare: "column 'company_id' does not exist in profiles"
**Cauză:** Coloana company_id lipsește din profiles  
**Soluție:** Adaugă coloana (vezi secțiunea "CE FACE DACĂ LIPSEȘTE CEVA")

### Eroare: "permission denied for table invoices"
**Cauză:** RLS policies blochează accesul  
**Soluție:** Verifică că user-ul are company_id setat în profiles
```sql
-- Verifică company_id pentru user-ul curent
SELECT id, email, company_id 
FROM public.profiles 
WHERE id = auth.uid();
```

### Eroare: "duplicate key value violates unique constraint"
**Cauză:** Invoice number duplicate (foarte rar)  
**Soluție:** Secvența se va auto-corecta la următoarea inserare

---

## 📊 COMPARAȚIE SCRIPTURI

| Feature | CHECK_PREREQUISITES | INVOICE_SQL_WITH_CHECKS | INVOICE_SQL_QUICK |
|---------|-------------------|------------------------|-------------------|
| Verifică prerequisite | ✅ Doar verifică | ✅ Verifică și oprește | ❌ Nu verifică |
| Creează invoices | ❌ Nu | ✅ Da | ✅ Da |
| Mesaje detaliate | ✅ Da | ✅ Da | ⚠️ Minime |
| Safe to run | ✅ Da | ✅ Da | ✅ Da |
| Idempotent | ✅ Da | ✅ Da | ✅ Da |
| Recomandat pentru | Verificare înainte | Instalare primă dată | Reinstalare/Update |

---

## 🎓 BEST PRACTICES

### 1. Prima Instalare
```bash
1. Rulează: CHECK_PREREQUISITES.sql
2. Rezolvă orice probleme găsite
3. Rulează: INVOICE_SQL_WITH_CHECKS.sql
4. Verifică că totul funcționează
```

### 2. Update/Reinstalare
```bash
1. Poți rula direct: INVOICE_SQL_WITH_CHECKS.sql
   (va actualiza doar ce trebuie, nu va șterge date)
```

### 3. Producție
```bash
1. Testează mai întâi în development
2. Fă backup la baza de date
3. Rulează INVOICE_SQL_WITH_CHECKS.sql
4. Verifică funcționalitatea
```

---

## 📞 SUPORT

Dacă ai probleme:
1. Rulează `CHECK_PREREQUISITES.sql` pentru diagnostic
2. Verifică mesajele de eroare din output
3. Consultă secțiunea TROUBLESHOOTING
4. Verifică că ai acces ca administrator în Supabase

---

**Creat**: 18 Februarie 2026  
**Versiune**: 1.0  
**Status**: Production Ready ✅

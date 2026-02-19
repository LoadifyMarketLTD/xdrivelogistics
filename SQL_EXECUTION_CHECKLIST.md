# 📋 SQL Execution Checklist - XDrive Logistics

## Răspuns Rapid: "Trebuie să rulez SQL scheme noi?"

**DA - Probabil trebuie să rulezi câteva scheme SQL noi:**

### 🎯 Top Priority (Foarte Probabil Lipsesc):

1. ✅ **INVOICE_SQL_QUICK.sql** (4.4KB) - Pentru sistemul de facturi
2. ✅ **migration-storage-buckets-setup.sql** (7.6KB) - Pentru storage ePOD
3. ✅ **migration-job-evidence.sql** (13KB) - Pentru photos și signatures
4. ✅ **migration-job-status-workflow.sql** (9.9KB) - Pentru status tracking

---

## 📊 Toate Fișierele SQL Găsite (31 Total - 266KB)

### Categorie 1: MAIN SCHEMAS (6 files - 64KB)

| File | Size | Status | Descriere |
|------|------|--------|-----------|
| supabase-marketplace-schema.sql | 13K | ✅ Probabil rulat | Schema principală: companies, jobs, bids |
| supabase-portal-schema.sql | 19K | ✅ Probabil rulat | Portal features complete |
| supabase-drivers-migration.sql | 3.0K | ✅ Probabil rulat | Tabelul drivers cu RLS |
| supabase-vehicles-migration.sql | 2.5K | ✅ Probabil rulat | Tabelul vehicles cu RLS |
| supabase-schema.sql | 12K | ⚠️ Verifică | Schema alternativă |
| supabase-setup-old.sql | 15K | ❌ NU folosi | Versiune veche |

### Categorie 2: INVOICE SYSTEM (3 files - 17KB)

| File | Size | Priority | Descriere |
|------|------|----------|-----------|
| INVOICE_SQL_QUICK.sql | 4.4K | ⭐ HIGH | Versiune rapidă, minimală - RECOMANDATĂ |
| INVOICE_SQL_WITH_CHECKS.sql | 8.8K | 🔸 Medium | Cu verificări complete |
| INVOICE_SQL_SCHEMA.sql | 3.9K | 🔹 Low | Doar schema, fără policies |

**Recomandare:** Rulează **INVOICE_SQL_QUICK.sql** dacă nu ai tabelul `invoices`.

### Categorie 3: MIGRATIONS - ePOD & Storage (15 files - 140KB)

#### 🌟 Essential Migrations:

| File | Size | Priority | Descriere |
|------|------|----------|-----------|
| migration-storage-buckets-setup.sql | 7.6K | ⭐⭐⭐ CRITICAL | Storage buckets: job-evidence, job-pod |
| migration-job-evidence.sql | 13K | ⭐⭐⭐ CRITICAL | Tabel pentru photos, signatures |
| migration-job-status-workflow.sql | 9.9K | ⭐⭐ HIGH | Status tracking cu history |
| migration-storage-rls-policies.sql | 14K | ⭐⭐ HIGH | RLS pentru storage (securitate) |

#### 🔧 Feature Enhancements:

| File | Size | Priority | Descriere |
|------|------|----------|-----------|
| migration-delivery-tracking-FIXED.sql | 22K | ⭐ Medium | Delivery tracking (versiune fixată) |
| migration-user-profile-enhancement.sql | 9.7K | 🔸 Medium | Îmbunătățiri profiles |
| migration-vehicle-details-enhancement.sql | 4.5K | 🔸 Medium | Îmbunătățiri vehicles |
| migration-fix-jobs-schema.sql | 8.0K | 🔸 Medium | Fix-uri pentru jobs table |
| migration-fix-drivers-schema.sql | 11K | 🔸 Medium | Fix-uri pentru drivers table |
| migration-fleet-tracking.sql | 4.4K | 🔹 Low | Fleet management extra |
| migration-company-settings.sql | 3.5K | 🔹 Low | Company settings table |
| migration-job-bids-status.sql | 1.4K | 🔹 Low | Bids status enum |

#### ❌ NU Folosi (Versiuni Vechi/Duplicate):

| File | Size | Status | Motiv |
|------|------|--------|-------|
| migration-delivery-tracking.sql | 18K | ❌ SKIP | Are erori, folosește FIXED |
| migration-delivery-tracking-STEP-1-ENUM.sql | 2.8K | ❌ SKIP | Part 1 of 2 (folosește FIXED) |
| migration-delivery-tracking-STEP-2-MAIN.sql | 24K | ❌ SKIP | Part 2 of 2 (folosește FIXED) |

### Categorie 4: DIAGNOSTIC & FIX FILES (7 files - 48KB)

| File | Size | Tip | Când să-l folosești |
|------|------|-----|---------------------|
| CHECK_PREREQUISITES.sql | 3.9K | 🔍 Diagnostic | Pentru verificare înainte de migrations |
| VALIDARE_SCRIPT.sql | 10K | 🔍 Diagnostic | Validare după rulare |
| diagnostic-company-membership.sql | 3.5K | 🔍 Diagnostic | Debug RLS policies |
| diagnostic-jobs-status.sql | 2.5K | 🔍 Diagnostic | Verificare jobs status |
| fix-company-membership-rls.sql | 9.0K | 🔧 Fix | Dacă RLS nu funcționează |
| RUN_THIS_SQL_FIX.sql | 15K | 🔧 Fix | Fix pentru erori specifice |
| SQL_CODE_AICI.sql | 4.7K | 📝 Template | Template pentru custom SQL |

---

## 🎯 Ordine Recomandată de Execuție

### Setup Complet Nou (Database Gol):

```
PRIORITATE 1 - SCHEME DE BAZĂ:
┌──────────────────────────────────────────────┐
│ 1️⃣ supabase-marketplace-schema.sql          │ ← START HERE
│ 2️⃣ supabase-portal-schema.sql               │
│ 3️⃣ supabase-drivers-migration.sql           │
│ 4️⃣ supabase-vehicles-migration.sql          │
└──────────────────────────────────────────────┘

PRIORITATE 2 - FEATURES ESENȚIALE:
┌──────────────────────────────────────────────┐
│ 5️⃣ INVOICE_SQL_QUICK.sql                    │ Pentru facturi
│ 6️⃣ migration-storage-buckets-setup.sql      │ Pentru storage
│ 7️⃣ migration-job-evidence.sql               │ Pentru ePOD
│ 8️⃣ migration-job-status-workflow.sql        │ Pentru tracking
└──────────────────────────────────────────────┘

PRIORITATE 3 - ADVANCED FEATURES (opțional):
┌──────────────────────────────────────────────┐
│ 9️⃣ migration-storage-rls-policies.sql       │
│ 🔟 migration-delivery-tracking-FIXED.sql    │
│ 1️⃣1️⃣ migration-user-profile-enhancement.sql  │
│ 1️⃣2️⃣ migration-vehicle-details-enhancement.sql│
└──────────────────────────────────────────────┘
```

### Dacă Ai Deja Schema de Bază:

```
VERIFICĂ ȘI ADAUGĂ CE LIPSEȘTE:
┌──────────────────────────────────────────────┐
│ ❓ Ai tabel invoices?                        │
│    ❌ Nu → Rulează INVOICE_SQL_QUICK.sql    │
│                                              │
│ ❓ Ai storage buckets?                       │
│    ❌ Nu → Rulează migration-storage-buckets│
│                                              │
│ ❓ Ai tabel job_evidence?                    │
│    ❌ Nu → Rulează migration-job-evidence   │
│                                              │
│ ❓ Ai tabel job_status_events?               │
│    ❌ Nu → Rulează migration-job-status     │
└──────────────────────────────────────────────┘
```

---

## 🔍 Cum Verifici Ce Ai Deja Rulat

### Pas 1: Verifică Tabele Existente

Rulează în **Supabase SQL Editor**:

```sql
-- Listează toate tabelele
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Pas 2: Compară cu Lista Așteptată

**Scheme de Bază (trebuie să existe):**
- ✅ `companies` → supabase-marketplace-schema.sql rulat
- ✅ `profiles` → supabase-portal-schema.sql rulat
- ✅ `jobs` → supabase-marketplace-schema.sql rulat
- ✅ `bids` → supabase-marketplace-schema.sql rulat
- ✅ `drivers` → supabase-drivers-migration.sql rulat
- ✅ `vehicles` → supabase-vehicles-migration.sql rulat

**Features Extra:**
- ✅ `invoices` → INVOICE_SQL_QUICK.sql rulat
- ✅ `job_evidence` → migration-job-evidence.sql rulat
- ✅ `job_status_events` → migration-job-status-workflow.sql rulat
- ✅ `delivery_tracking` → migration-delivery-tracking-FIXED.sql rulat

### Pas 3: Verifică Storage Buckets

```sql
-- Check storage buckets
SELECT * FROM storage.buckets;
```

**Buckets așteptate:**
- ✅ `job-evidence` → migration-storage-buckets-setup.sql rulat
- ✅ `job-pod` → migration-storage-buckets-setup.sql rulat

### Pas 4: Verifică RLS Policies

```sql
-- Check RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

Toate tabelele ar trebui să aibă `rowsecurity = true`.

---

## ⚠️ CE NU TREBUIE RULAT

### ❌ Fișiere Diagnostic (Doar Pentru Verificare):

- **CHECK_PREREQUISITES.sql** - Rulează doar pentru a verifica, nu modifică nimic
- **VALIDARE_SCRIPT.sql** - Rulează după migrations pentru validare
- **diagnostic-company-membership.sql** - Debug queries, nu modifications
- **diagnostic-jobs-status.sql** - Verificări status, nu changes

### ❌ Fișiere Vechi/Depreciate:

- **supabase-setup-old.sql** - Versiune veche, folosește marketplace + portal
- **migration-delivery-tracking.sql** - Are erori, folosește versiunea FIXED
- **migration-delivery-tracking-STEP-1/2** - Împărțit în 2 parts, folosește FIXED

### ❌ Fișiere Fix (Doar Dacă Ai Probleme):

- **fix-company-membership-rls.sql** - Rulează doar dacă RLS nu funcționează
- **RUN_THIS_SQL_FIX.sql** - Rulează doar dacă ai erori specifice

---

## 📋 Checklist de Execuție

Folosește acest checklist pentru tracking:

### ✅ Setup Inițial (Database Nou)

```
□ 1. supabase-marketplace-schema.sql
     └─ Creează: companies, profiles, jobs, bids
     └─ Verificare: SELECT * FROM companies LIMIT 1;

□ 2. supabase-portal-schema.sql
     └─ Adaugă: portal features, auth setup
     └─ Verificare: SELECT * FROM profiles LIMIT 1;

□ 3. supabase-drivers-migration.sql
     └─ Creează: drivers table cu RLS
     └─ Verificare: SELECT * FROM drivers LIMIT 1;

□ 4. supabase-vehicles-migration.sql
     └─ Creează: vehicles table cu RLS
     └─ Verificare: SELECT * FROM vehicles LIMIT 1;
```

### 💰 Invoice System

```
□ 5. INVOICE_SQL_QUICK.sql
     └─ Creează: invoices table
     └─ Adaugă: auto-generate invoice numbers
     └─ Verificare: SELECT * FROM invoices LIMIT 1;
     └─ Test: INSERT INTO invoices (...) VALUES (...);
```

### 📸 ePOD & Evidence System

```
□ 6. migration-storage-buckets-setup.sql
     └─ Creează: job-evidence, job-pod buckets
     └─ Adaugă: RLS policies pentru storage
     └─ Verificare: SELECT * FROM storage.buckets;

□ 7. migration-job-evidence.sql
     └─ Creează: job_evidence table
     └─ Setup: upload photos/signatures
     └─ Verificare: SELECT * FROM job_evidence LIMIT 1;

□ 8. migration-job-status-workflow.sql
     └─ Creează: job_status_events table
     └─ Setup: status tracking cu history
     └─ Verificare: SELECT * FROM job_status_events LIMIT 1;
```

### 🚚 Advanced Features (Opțional)

```
□ 9. migration-storage-rls-policies.sql
     └─ Adaugă: RLS policies detaliate pentru storage
     └─ Verificare: Check policies in Dashboard

□ 10. migration-delivery-tracking-FIXED.sql
      └─ Creează: delivery_tracking tables
      └─ Setup: status enums, triggers
      └─ Verificare: SELECT * FROM delivery_tracking LIMIT 1;

□ 11. migration-user-profile-enhancement.sql
      └─ Adaugă: columns extra în profiles
      └─ Verificare: SELECT column_name FROM information_schema.columns 
                    WHERE table_name = 'profiles';

□ 12. migration-vehicle-details-enhancement.sql
      └─ Adaugă: columns extra în vehicles
      └─ Verificare: SELECT column_name FROM information_schema.columns 
                    WHERE table_name = 'vehicles';
```

---

## 🔧 Troubleshooting Common Errors

### Error: "relation does not exist"

**Cauză:** Încerci să creezi ceva care depinde de alt tabel inexistent.

**Soluție:** Rulează migrations în ordine:
1. Întâi marketplace-schema (creează companies, jobs)
2. Apoi portal-schema (creează profiles)
3. Apoi drivers/vehicles (depind de companies)
4. Apoi restul

### Error: "function does not exist"

**Cauză:** Lipsește funcția `update_updated_at_column()`.

**Soluție:** Migrations-urile moderne o includ automat. Asigură-te că:
- Copiezi ÎNTREAGA migrare (nu doar o parte)
- Funcția este definită la începutul fișierului

### Error: "permission denied"

**Cauză:** User-ul nu are permisiuni suficiente.

**Soluție:**
- Loghează-te ca project owner
- Sau rulează: `GRANT ALL ON schema_name TO user_name;`

### Error: "already exists"

**Cauză:** Ai rulat deja migration-ul.

**Soluție:** 
- ✅ Normal! Migrations folosesc `IF NOT EXISTS`
- Skip acest migration
- Sau drop table/function și re-run (ATENȚIE: pierzi datele!)

### Error: "enum already exists"

**Cauză:** Ai rulat deja partea cu enum-uri.

**Soluție:**
```sql
-- Drop enum dacă vrei să re-creezi
DROP TYPE IF EXISTS delivery_status CASCADE;
-- Apoi re-run migration
```

---

## ✅ Success Indicators

După ce rulezi migrations, ar trebui să vezi:

### În Table Editor:

```
✅ companies
✅ profiles
✅ jobs
✅ bids
✅ drivers
✅ vehicles
✅ invoices (dacă ai rulat invoice migration)
✅ job_evidence (dacă ai rulat evidence migration)
✅ job_status_events (dacă ai rulat status migration)
```

### În Storage:

```
✅ job-evidence bucket
✅ job-pod bucket
✅ RLS policies active pe fiecare
```

### În SQL Editor (verificare):

```sql
-- Toate tabelele cu RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Rezultat așteptat: toate cu rowsecurity = true
```

---

## 📝 Notes & Best Practices

### Înainte de Rulare:

1. ✅ **Backup** database-ul (dacă ai date importante)
2. ✅ **Citește** întreaga migrare înainte de run
3. ✅ **Verifică** dependințele (ce tabele trebuie să existe)
4. ✅ **Testează** într-un environment de dev dacă ai

### După Rulare:

1. ✅ **Verifică** cu queries că totul e creat corect
2. ✅ **Testează** RLS policies (încearcă să accesezi date)
3. ✅ **Documentează** ce ai rulat (acest checklist!)
4. ✅ **Monitorizează** logs pentru erori

### Tips:

- 💡 Rulează câte o migrare pe rând
- 💡 Verifică success după fiecare
- 💡 Nu modifica migrations după ce le-ai rulat
- 💡 Păstrează un log cu ce ai rulat și când
- 💡 În producție, testează întâi în staging

---

## 🚀 Next Steps După Rularea Migrations

După ce ai rulat toate migrations-urile necesare:

### 1. Testare Funcționalitate

```
□ Test login/register flow
□ Test company creation
□ Test driver add/edit/delete
□ Test vehicle add/edit/delete
□ Test job creation
□ Test invoice generation
□ Test photo upload (evidence)
□ Test signature capture
□ Test ePOD generation
```

### 2. Verificare RLS

```
□ Log in ca user normal
□ Verifică că vezi doar data ta
□ Verifică că nu poți vedea data altora
□ Test insert/update/delete permissions
```

### 3. Performance Check

```
□ Verifică indexes sunt create
□ Run EXPLAIN ANALYZE pe queries importante
□ Adaugă indexes extra dacă e nevoie
```

### 4. Documentation Update

```
□ Actualizează docs cu ce ai rulat
□ Notează orice issues întâlnite
□ Documentează soluții la probleme
```

---

## 📚 Related Documentation

- **HOW_TO_RUN_MIGRATIONS.md** - Tutorial detaliat pentru migrations
- **SQL_SCHEMES_TO_RUN_IN_SUPABASE.md** - Ghid alternativ
- **PRODUCTION_DEPLOYMENT_GUIDE.md** - Deployment în producție
- **API_ENDPOINTS_DOCUMENTATION.md** - API-uri care folosesc aceste tabele

---

## 🎯 Summary

**Total SQL Files:** 31 (266KB)

**Must Run (Minimum):**
1. supabase-marketplace-schema.sql
2. supabase-portal-schema.sql
3. supabase-drivers-migration.sql
4. supabase-vehicles-migration.sql

**Should Run (Recommended):**
5. INVOICE_SQL_QUICK.sql
6. migration-storage-buckets-setup.sql
7. migration-job-evidence.sql
8. migration-job-status-workflow.sql

**Optional (Nice to Have):**
- migration-delivery-tracking-FIXED.sql
- migration-user-profile-enhancement.sql
- migration-vehicle-details-enhancement.sql
- migration-storage-rls-policies.sql

**Don't Run:**
- supabase-setup-old.sql (vechi)
- migration-delivery-tracking.sql (are erori)
- diagnostic-*.sql (doar verificare, nu modifications)

---

**Last Updated:** 2026-02-19  
**Version:** 1.0  
**Status:** ✅ Complete and Verified

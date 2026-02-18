# 📋 SQL PENTRU SUPABASE SQL EDITOR

## ⚡ QUICK START - Rulează Acesta:

### Fișierul Recomandat: `migration-delivery-tracking-FIXED.sql`

Copiază tot conținutul din fișierul `migration-delivery-tracking-FIXED.sql` și rulează-l în **Supabase SQL Editor**.

## 🎯 Ce Rezolvă Această Versiune:

✅ **Rezolvă eroarea**: `invalid input value for enum job_status: "completed"`  
✅ **Auto-detectează** dacă status e ENUM sau TEXT  
✅ **Adaugă automat** 'completed' la valorile permise  
✅ **Sigur să rulezi de mai multe ori** (idempotent)  

## 📂 Fișiere Disponibile:

### 1. `migration-delivery-tracking-FIXED.sql` ⭐ RECOMANDAT
**Rulează pe acesta!**
- Versiunea completă și fixată
- Rezolvă automat problema cu enum
- 22KB, ~500 linii
- Include toate funcțiile și tabelele

### 2. `diagnostic-jobs-status.sql` (OPȚIONAL)
- Doar pentru diagnostic
- Nu modifică nimic
- Arată ce tip de coloană status ai
- Util pentru debugging

### 3. `migration-delivery-tracking.sql` (VERSIUNEA VECHE)
- Versiunea originală actualizată
- Poți folosi și pe aceasta, dar -FIXED e mai bună

## 🚀 Pași Completi:

### Pasul 1: Copiază SQL-ul
```bash
# Deschide fișierul:
migration-delivery-tracking-FIXED.sql
```

### Pasul 2: Rulează în Supabase
1. Intră în **Supabase Dashboard**
2. Mergi la **SQL Editor**
3. Lipește tot codul
4. Click pe **"Run"** sau **"RUN"**

### Pasul 3: Verifică Rezultatul
Ar trebui să vezi:
```
✅ Migration completed successfully!
Created tables: job_tracking_events, job_documents, job_notes, job_feedback, job_invoices
Added 60+ tracking fields to jobs table
Created helper functions: add_tracking_event, update_job_pod, update_job_status
Created view: jobs_with_tracking
Configured RLS policies for all new tables
```

## 📊 Ce Se Creează:

### 5 Tabele Noi:
- `job_tracking_events` - Evenimente timeline
- `job_documents` - Documente POD, facturi, poze
- `job_notes` - Notițe job-uri
- `job_feedback` - Rating-uri
- `job_invoices` - Facturi

### 60+ Câmpuri Noi în `jobs`:
- Tracking timestamps
- POD fields
- Payment fields (SmartPay)
- Adrese complete (cu postcode)
- Dimensiuni (L x W x H)
- Referințe (vehicle_ref, your_ref, cust_ref)

### 3 Funcții Helper:
- `add_tracking_event()`
- `update_job_pod()`
- `update_job_status()`

### 1 View:
- `jobs_with_tracking`

### RLS Policies:
- Securitate pe toate tabelele
- Acces bazat pe company_id

## ⚠️ Note Importante:

1. **Rulează DUPĂ schema principală**
2. **Nu șterge date existente**
3. **Poate fi rulat de mai multe ori** (safe)
4. **Backwards compatible** cu codul existent

## 🐛 Dacă Ai Erori:

### Eroare: "relation jobs does not exist"
```sql
-- Verifică dacă tabelul jobs există:
SELECT * FROM information_schema.tables 
WHERE table_name = 'jobs' AND table_schema = 'public';
```
👉 Trebuie să rulezi mai întâi schema principală (supabase-marketplace-schema.sql)

### Eroare: "enum value already exists"
✅ E normal! Înseamnă că fix-ul deja a rulat odată. Continuă cu restul migration-ului.

### Eroare: "function already exists"
✅ E OK! Funcțiile sunt create cu `CREATE OR REPLACE`, deci se suprascriu.

### Alta eroare?
Rulează `diagnostic-jobs-status.sql` și trimite-mi output-ul.

## 📞 Contact:

Dacă ai probleme:
1. Rulează `diagnostic-jobs-status.sql`
2. Trimite output-ul diagnosticului
3. Specifică exact ce eroare primești

---

## 🎉 Success!

După ce rulează cu succes, aplicația Next.js va putea folosi:
- Toate câmpurile noi de tracking
- Funcțiile helper pentru POD
- View-ul jobs_with_tracking
- Toate tabelele de tracking

Pagina `/loads/[id]` va afișa toate informațiile noi! ✨

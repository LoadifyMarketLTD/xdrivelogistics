# Ghid Complet de Configurare Supabase - XDrive Logistics

## 📋 ANALIZĂ STRUCTURALĂ COMPLETĂ

### 1. STRUCTURA APLICAȚIEI ACTUALE

```
✅ IMPLEMENTAT:
- Next.js 16 cu App Router
- Autentificare Supabase (email + parolă)
- Pagini publice (homepage, login, forgot password, reset password)
- Dashboard (UI gata, dar cu date mock)
- Formulare de contact și cerere de ofertă
- Stiluri complete (public + dashboard)

❌ LIPSEȘTE:
- Tabele în baza de date
- API routes pentru salvarea datelor
- Gestionare job-uri reale
- Sistem de facturare
- Gestionare utilizatori (admin, șoferi, clienți)
```

### 2. FLUXURI DE AUTENTIFICARE

#### Login:
```
Utilizator → /login → Email + Parolă → Supabase Auth → /dashboard
```

#### Recuperare Parolă:
```
Utilizator → /forgot-password → Email → Link reset → /reset-password → Parolă nouă → /login
```

#### Protecție Rute:
```
/dashboard → Verifică sesiune → Redirecționează la /login dacă nu e autentificat
```

### 3. BAZA DE DATE NECESARĂ

**6 Tabele Principale:**

1. **users** - Profiluri utilizatori (admin, șoferi, clienți)
2. **quotes** - Cereri de ofertă de la formular
3. **jobs** - Transporturi confirmate
4. **invoices** - Facturi și plăți
5. **audit_logs** - Istoric acțiuni (securitate)
6. **notifications** - Notificări utilizatori

---

## 🚀 PAȘI DE CONFIGURARE SUPABASE

### PAS 1: Accesează Proiectul Supabase

1. Deschide: https://app.supabase.com/project/jqxlauexhkonixtjvljw
2. Autentifică-te cu contul tău

### PAS 2: Configurează Autentificarea

1. Mergi la **Authentication** → **Settings** → **URL Configuration**
2. Adaugă:
   - Site URL: `http://localhost:3000` (pentru development)
   - Site URL: `https://xdrivelogistics.co.uk` (pentru production)
   - Redirect URLs:
     ```
     http://localhost:3000/reset-password
     https://xdrivelogistics.co.uk/reset-password
     http://localhost:3000/auth/callback
     https://xdrivelogistics.co.uk/auth/callback
     ```

3. Mergi la **Authentication** → **Providers** → **Email**
4. Activează:
   - ✅ Enable Email provider
   - ✅ Confirm email (opțional, recomandat pentru producție)
   - ✅ Secure email change (recomandat)

### PAS 3: Creează Baza de Date (CEL MAI IMPORTANT!)

1. Mergi la **SQL Editor** în Supabase
2. Click pe **New Query**
3. **Copiază ÎNTREG codul SQL** din fișierul `supabase-setup.sql`
4. Click pe **RUN** (sau Ctrl+Enter)
5. Așteaptă confirmarea: ✅ "Success. No rows returned"

**Acest SQL va crea automat:**
- Toate cele 6 tabele
- Indexuri pentru performanță
- Trigger-uri pentru auto-generare coduri (JOB-000001, INV-2024-00001)
- Row Level Security (RLS) pentru securitate
- Politici de acces (admin vede tot, user-ii văd doar datele lor)
- Funcții pentru timestamps automatice

### PAS 4: Creează Primul Utilizator Admin

1. Mergi la **Authentication** → **Users** în Supabase
2. Click **Add user** → **Create new user**
3. Completează:
   - Email: `xdrivelogisticsltd@gmail.com`
   - Password: `Johnny2000$$` (sau alta mai sigură)
   - ✅ Auto Confirm User
4. Click **Create user**
5. **Notează User ID** (de exemplu: `123e4567-e89b-12d3-a456-426614174000`)

6. Mergi înapoi la **SQL Editor**
7. Rulează acest query pentru a-l face admin:
   ```sql
   UPDATE public.users 
   SET role = 'admin', full_name = 'XDrive Admin'
   WHERE email = 'xdrivelogisticsltd@gmail.com';
   ```

### PAS 5: Verifică Configurația

1. Mergi la **Table Editor** în Supabase
2. Ar trebui să vezi toate tabelele:
   - users
   - quotes
   - jobs
   - invoices
   - audit_logs
   - notifications
   - dashboard_stats (view)

3. Click pe **users** → ar trebui să vezi utilizatorul admin creat

### PAS 6: Configurează Storage (Opțional, dar Recomandat)

1. Mergi la **Storage**
2. Creează bucket-uri:
   - **documents** (pentru facturi PDF, documente)
     - Public: ❌ No
     - File size limit: 10 MB
   - **photos** (pentru poze POD - Proof of Delivery)
     - Public: ❌ No
     - File size limit: 5 MB

---

## 🔐 SETĂRI DE SECURITATE

### Politici Row Level Security (RLS) - DEJA CONFIGURATE!

SQL-ul creat automat a setat:

✅ **Users:**
- Utilizatorii văd doar propriul profil
- Admin-ii văd toți utilizatorii

✅ **Quotes:**
- Oricine poate trimite o cerere de ofertă (formular public)
- Admin-ii văd toate cererile

✅ **Jobs:**
- Clienții văd doar job-urile lor
- Șoferii văd job-urile alocate lor
- Admin-ii văd toate job-urile

✅ **Invoices:**
- Clienții văd doar facturile lor
- Admin-ii văd toate facturile

✅ **Notifications:**
- Fiecare utilizator vede doar notificările proprii

---

## 📧 CONFIGURARE EMAIL (Pentru Reset Parolă)

### Opțiunea 1: Email Implicit Supabase (Cel Mai Simplu)

Supabase trimite deja email-uri automat pentru:
- Resetare parolă
- Confirmare email
- Schimbare email

**Nu trebuie să faci nimic!** Funcționează din start.

### Opțiunea 2: SMTP Custom (Recomandat pentru Producție)

1. Mergi la **Settings** → **Auth** → **SMTP Settings**
2. Activează **Enable Custom SMTP**
3. Completează:
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: xdrivelogisticsltd@gmail.com
   Password: [App Password generat în Gmail]
   Sender Email: xdrivelogisticsltd@gmail.com
   Sender Name: XDrive Logistics
   ```

4. Pentru Gmail App Password:
   - Mergi la https://myaccount.google.com/security
   - Activează 2-Step Verification
   - Generează App Password
   - Folosește acea parolă în SMTP settings

---

## 🎨 PERSONALIZARE EMAIL TEMPLATES

1. Mergi la **Authentication** → **Email Templates**
2. Personalizează:

**Reset Password Email:**
```html
<h2>Resetare Parolă - XDrive Logistics</h2>
<p>Bună ziua,</p>
<p>Ai solicitat resetarea parolei pentru contul tău XDrive Logistics.</p>
<p>Click pe link-ul de mai jos pentru a seta o parolă nouă:</p>
<p><a href="{{ .ConfirmationURL }}">Resetează Parola</a></p>
<p>Dacă nu ai solicitat această resetare, ignora acest email.</p>
<p>Link-ul este valabil 1 oră.</p>
<hr>
<p>Ai nevoie de ajutor? Contactează-ne:</p>
<p>📞 <a href="tel:07423272138">07423272138</a> (Call/WhatsApp)</p>
```

---

## 🧪 TESTARE

### Test 1: Login
1. Deschide http://localhost:3000/login
2. Loghează-te cu: `xdrivelogisticsltd@gmail.com` / `Johnny2000$$`
3. Ar trebui să te redirecteze la `/dashboard`

### Test 2: Forgot Password
1. Deschide http://localhost:3000/forgot-password
2. Introdu email-ul
3. Verifică inbox-ul pentru link-ul de reset
4. Click pe link → ar trebui să te ducă la `/reset-password`
5. Setează parolă nouă
6. Testează login cu noua parolă

### Test 3: Route Protection
1. Deschide browser în Incognito
2. Încearcă să accesezi http://localhost:3000/dashboard
3. Ar trebui să te redirecteze automat la `/login`

### Test 4: Logout
1. Loghează-te
2. În dashboard, click pe **Logout**
3. Ar trebui să te redirecteze la homepage `/`

---

## 📊 VERIFICARE FINALĂ

Rulează aceste query-uri în SQL Editor pentru verificare:

```sql
-- 1. Verifică că toate tabelele există
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Verifică utilizatorul admin
SELECT id, email, role, created_at 
FROM public.users 
WHERE role = 'admin';

-- 3. Verifică politicile RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- 4. Test inserare quote (simula formular)
INSERT INTO public.quotes (
  email, phone, full_name,
  pickup_location, dropoff_location,
  service_type, vehicle_type,
  scheduled_date, load_details
) VALUES (
  'test@example.com',
  '07123456789',
  'Test Customer',
  'London SW1A 1AA',
  'Manchester M1 1AE',
  'next-day',
  'medium-van',
  CURRENT_DATE + 1,
  'Test parcel - 20kg'
) RETURNING *;
```

---

## 🔑 CREDENȚIALE FINALE

**Supabase Project:**
- URL: `https://jqxlauexhkonixtjvljw.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (deja în .env.local)

**Admin User:**
- Email: `xdrivelogisticsltd@gmail.com`
- Parolă: `Johnny2000$$` (SCHIMB-O după primul login!)

**Dashboard:**
- https://app.supabase.com/project/jqxlauexhkonixtjvljw

---

## ⚠️ IMPORTANT - SECURITATE

1. **Schimbă parola admin** după primul login
2. **NU expune** Service Role Key în frontend
3. **Folosește doar** Anon Key în variabilele NEXT_PUBLIC_*
4. **Activează** Confirm Email pentru utilizatori noi în producție
5. **Configurează** SMTP custom înainte de lansare în producție
6. **Backup database** înainte de modificări majore

---

## 📝 PAȘI URMĂTORI (După Configurare)

1. ✅ Configurare completă Supabase (ACEST GHID)
2. 🔄 Conectare dashboard la date reale (în loc de mock data)
3. 🔄 Salvare formulare de contact în tabela quotes
4. 🔄 Creare API routes pentru CRUD operations
5. 🔄 Implementare sistem de facturare
6. 🔄 Adăugare gestionare șoferi
7. 🔄 Notificări în timp real
8. 🔄 Upload documente (POD)

---

## 🆘 SUPORT

Dacă întâmpini probleme:
1. Verifică console-ul browser (F12) pentru erori
2. Verifică Supabase logs: **Logs** → **Postgres Logs**
3. Testează fiecare query SQL individual
4. Verifică că RLS e configurat corect

**Contact dezvoltator pentru ajutor tehnic.**

---

✅ **SUCCES! Baza de date este gata de utilizare!**

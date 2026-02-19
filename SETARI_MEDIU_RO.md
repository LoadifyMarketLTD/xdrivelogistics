# 🚀 Setări Variabile de Mediu - XDrive Logistics

## ⚠️ ATENȚIE: Aplicație Hibridă - Necesită 5 Variabile!

Această aplicație este HIBRIDĂ și necesită DOUĂ seturi de variabile:
- **NEXT_PUBLIC_*** pentru Portalul Next.js (dashboard-ul principal)
- **VITE_*** pentru Landing Page-ul Vite (pagina de aterizare)

## 📋 Variabilele Necesare - TOATE 5!

```bash
# ============================================================================
# PORTAL NEXT.JS (Dashboard-ul Principal)
# ============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://jqxlauexhkonixtjvljw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGxhdWV4aGtvbml4dGp2bGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTM2MzYsImV4cCI6MjA1NTI4OTYzNn0.yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO
NEXT_PUBLIC_SITE_URL=https://xdrivelogistics.co.uk

# ============================================================================
# LANDING PAGE VITE (Pagina de Aterizare)
# ============================================================================
VITE_SUPABASE_URL=https://jqxlauexhkonixtjvljw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGxhdWV4aGtvbml4dGp2bGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTM2MzYsImV4cCI6MjA1NTI4OTYzNn0.yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO
```

**Important**: 
- Acestea sunt chei publice client și NU sunt secrete
- Sunt sigure pentru a fi expuse în browser
- Ambele seturi conectează la ACELAȘI proiect Supabase
- Fără AMBELE seturi, aplicația NU va funcționa complet

---

## 🎯 Configurare Rapidă în Netlify

### Pasul 1: Accesează Setările de Mediu

1. Intră în **Netlify Dashboard**
2. Selectează site-ul tău: **xdrivelogistics**
3. Mergi la: **Site settings** → **Environment variables**

### Pasul 2: Adaugă TOATE cele 5 Variabile

Pentru **FIECARE** dintre cele 5 variabile de mai sus:

1. Click pe **"Add a variable"** sau **"Add single variable"**
2. **Key** (Cheie): Introdu numele variabilei (ex: `NEXT_PUBLIC_SUPABASE_URL`)
3. **Value** (Valoare): Introdu valoarea corespunzătoare
4. **Scopes** (Contexte): ✅ **BIFEAZĂ "All scopes"** și **"All deploy contexts"**:
   - ✅ **Production** (deploy-uri pe branch-ul principal)
   - ✅ **Deploy Previews** (preview-uri pentru PR-uri)
   - ✅ **Branch deploys** (deploy-uri pe toate branch-urile)
5. **NU** bifa "Keep this value secret" - acestea sunt chei publice client
6. Click pe **"Add variable"**

### Pasul 3: Verifică Setările

După ce ai adăugat toate cele **5 variabile**, verifică că ai:

- ✅ `NEXT_PUBLIC_SUPABASE_URL` → Toate contexte
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Toate contexte
- ✅ `NEXT_PUBLIC_SITE_URL` → Toate contexte
- ✅ `VITE_SUPABASE_URL` → Toate contexte
- ✅ `VITE_SUPABASE_ANON_KEY` → Toate contexte

**Greșeală comună**: 
- Lipsa variabilelor VITE_* → Landing page-ul nu va funcționa
- Lipsa variabilelor NEXT_PUBLIC_* → Portalul nu va funcționa
- Setarea doar pentru Production → Erori în preview-urile PR-urilor!

### Pasul 4: Șterge Cache-ul și Redeploy

1. Mergi la tab-ul **Deploys**
2. Click pe butonul **"Trigger deploy"**
3. Selectează **"Clear cache and deploy"**

Acest lucru asigură:
- Cache-ul vechi este eliminat
- Build-ul nou folosește noile variabile de mediu
- Nu există probleme de configurare veche

---

## 💻 Configurare Locală (Pentru Dezvoltare)

### Pasul 1: Creează Fișierul .env.local

```bash
cp .env.example .env.local
```

### Pasul 2: Fișierul .env.local Va Conține TOATE 5 Variabilele:

```bash
# Portal Next.js
NEXT_PUBLIC_SUPABASE_URL=https://jqxlauexhkonixtjvljw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGxhdWV4aGtvbml4dGp2bGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTM2MzYsImV4cCI6MjA1NTI4OTYzNn0.yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Landing Page Vite
VITE_SUPABASE_URL=https://jqxlauexhkonixtjvljw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGxhdWV4aGtvbml4dGp2bGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTM2MzYsImV4cCI6MjA1NTI4OTYzNn0.yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO
```

### Pasul 3: Pornește Serverul de Dezvoltare

```bash
npm run dev
```

Aplicația va rula pe: http://localhost:3000

### Pasul 4: Verifică Configurarea

Vizitează: http://localhost:3000/diagnostics pentru a verifica că variabilele sunt corect încărcate.

---

## ✅ Verificare După Configurare

După ce ai configurat variabilele și ai redeploy, verifică:

### 1. Log-urile de Build
În log-urile de deploy, ar trebui să vezi:
```
✓ Compiled successfully
✓ Generating static pages
✅ Build completed
```

### 2. Funcționalitate Runtime
Vizitează site-ul și testează:
- ✅ Pagina de login se încarcă fără erori
- ✅ Autentificarea funcționează
- ✅ Dashboard-ul este accesibil după login
- ✅ Nu există erori în consolă despre credențiale Supabase lipsă

### 3. Verificare Console Browser
Deschide consola browser-ului pe orice pagină:
- ✅ NU ar trebui să vezi: "Missing Supabase credentials" error
- ✅ NU ar trebui să vezi: Erori de conexiune către placeholder.supabase.co

---

## 🔧 Rezolvare Probleme

### Problema: Build-ul reușește dar login-ul nu funcționează

**Cauză**: Variabilele de mediu nu sunt setate, aplicația folosește valori placeholder.

**Soluție**:
1. Verifică dacă variabilele sunt setate în UI-ul Netlify
2. Verifică că sunt setate pentru contextul de deploy corect (Production/Preview/Branch)
3. Verifică că numele variabilelor sunt exact corecte (case-sensitive)
4. Declanșează "Clear cache and deploy"

### Problema: Deploy-ul preview al PR-ului eșuează

**Cauză**: Variabilele de mediu sunt setate doar pentru contextul Production.

**Soluție**:
1. Înapoi la Environment variables în Netlify
2. Editează fiecare variabilă
3. Asigură-te că "Deploy Previews" este bifat
4. Salvează și redeploy

### Problema: Eroare "Missing Supabase credentials" în browser

**Cauză**: Corect! Aplicația funcționează conform așteptărilor - variabilele de mediu lipsesc.

**Soluție**: Urmează Pasul 2 de mai sus pentru a adăuga variabilele.

---

## 📚 Resurse Suplimentare

- [NETLIFY_SETUP.md](./NETLIFY_SETUP.md) - Ghid detaliat pentru Netlify (în engleză)
- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) - Documentație completă (în engleză)
- [.env.example](./.env.example) - Fișier de exemplu cu toate variabilele

---

## ⚠️ Important: Migrare de la Vite la Next.js

Această aplicație a fost migrată de la **Vite** la **Next.js**.

### ❌ GREȘIT (Vechile variabile Vite):
```bash
VITE_SUPABASE_URL         # ❌ NU folosi
VITE_SUPABASE_ANON_KEY    # ❌ NU folosi
VITE_SITE_URL             # ❌ NU folosi
```

### ✅ CORECT (Noile variabile Next.js):
```bash
NEXT_PUBLIC_SUPABASE_URL         # ✅ CORECT
NEXT_PUBLIC_SUPABASE_ANON_KEY    # ✅ CORECT
NEXT_PUBLIC_SITE_URL             # ✅ CORECT
```

---

## 🎉 După Configurare

Odată ce variabilele de mediu sunt configurate corect:

1. ✅ Build-ul va reuși
2. ✅ Toate verificările Netlify vor trece
3. ✅ Autentificarea va funcționa în producție
4. ✅ Fără erori misterioase
5. ✅ Preview-urile PR-urilor vor funcționa corect

**Ești gata să faci merge la PR-ul tău!** 🎉

---

*Ultima actualizare: 19 Februarie 2026*

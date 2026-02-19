# Configurare Chei API Supabase - Ghid Complet

## 🎯 RĂSPUNS RAPID

**Aplicația XDrive Logistics este HIBRIDĂ și necesită 5 variabile de mediu:**

| Variabilă | Valoare | Scop |
|-----------|---------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jqxlauexhkonixtjvljw.supabase.co` | Next.js Portal |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO` | Next.js Portal |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` (dev) sau `https://xdrivelogistics.co.uk` (prod) | Next.js Portal |
| `VITE_SUPABASE_URL` | `https://jqxlauexhkonixtjvljw.supabase.co` | Vite Landing Page |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO` | Vite Landing Page |

✅ **Setați TOATE cele 5 variabile în Netlify pentru "All scopes" și "All deploy contexts"**  
✅ **NU marcați ca "Secret"** - sunt chei publice pentru client  
✅ **După setare:** "Clear cache and deploy" în Netlify

---

## CARE ESTE ANON KEY? 🔑

**RĂSPUNS IMPORTANT:** Cheia ANON (sau "anon key") este cheia JWT (token-ul lung) care se termină cu `yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO`.

### Formatul Cheilor Supabase

Supabase oferă două formate pentru chei:

#### 1. Formatul Nou (UI Supabase - pentru referință)
```
sb_publishable_yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO  ← Aceasta este doar o etichetă
sb_secret_fzdCj...  ← Cheia secretă (NU se folosește în client)
```

#### 2. Formatul JWT (Folosit în Cod)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGxhdWV4aGtvbml4dGp2bGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTM2MzYsImV4cCI6MjA1NTI4OTYzNn0.yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO
```

**👆 ACEASTA ESTE CHEIA ANON COMPLETĂ care trebuie folosită în aplicație!**

## Explicație Tehnică

În interfața Supabase Dashboard, veți vedea:
- **Publishable Key**: `sb_publishable_yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO`
- **Secret Key**: `sb_secret_fzdCj...` (parțial ascuns)

Însă pentru a utiliza Supabase în aplicație, trebuie să folosiți **token-ul JWT complet** care:
- Începe cu: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.`
- Se termină cu: `yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO`

Partea finală (`yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO`) este aceeași în ambele formate - aceasta confirmă că JWT-ul corespunde cu publishable key-ul.

## Configurare Corectă în Proiect

⚠️ **IMPORTANT:** Această aplicație este HIBRIDĂ și necesită AMBELE seturi de variabile:
- `NEXT_PUBLIC_*` pentru portalul Next.js (dashboard-ul principal)
- `VITE_*` pentru landing page-ul Vite (pagina de aterizare legacy)

### Fișierul `.env.local` (Dezvoltare Locală)

```bash
# ============================================================================
# CONFIGURARE NEXT.JS PORTAL (NEXT_PUBLIC_* prefix)
# ============================================================================

# Supabase URL
NEXT_PUBLIC_SUPABASE_URL=https://jqxlauexhkonixtjvljw.supabase.co

# ANON KEY - Token JWT Complet (NU formatul sb_publishable_)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGxhdWV4aGtvbml4dGp2bGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTM2MzYsImV4cCI6MjA1NTI4OTYzNn0.yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO

# Site URL pentru redirecturi
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ============================================================================
# CONFIGURARE VITE LANDING PAGE (VITE_* prefix)
# ============================================================================

# Supabase URL pentru Vite (același proiect)
VITE_SUPABASE_URL=https://jqxlauexhkonixtjvljw.supabase.co

# ANON KEY pentru Vite (același token JWT)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGxhdWV4aGtvbml4dGp2bGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTM2MzYsImV4cCI6MjA1NTI4OTYzNn0.yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO
```

### Netlify (Producție)

În Netlify Dashboard → Site Settings → Environment Variables, adăugați **TOATE cele 5 variabile**:

| Variabilă | Valoare |
|-----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jqxlauexhkonixtjvljw.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGxhdWV4aGtvbml4dGp2bGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTM2MzYsImV4cCI6MjA1NTI4OTYzNn0.yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO` |
| `NEXT_PUBLIC_SITE_URL` | `https://xdrivelogistics.co.uk` |
| `VITE_SUPABASE_URL` | `https://jqxlauexhkonixtjvljw.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGxhdWV4aGtvbml4dGp2bGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTM2MzYsImV4cCI6MjA1NTI4OTYzNn0.yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO` |

**📋 Pași Netlify:**
1. Setați fiecare variabilă pentru **"All scopes"** și **"All deploy contexts"**
2. **NU** marcați ca "Secret" - sunt chei publice pentru client
3. După setare, faceți **"Clear cache and deploy"**

## Unde Găsesc Cheile în Supabase Dashboard?

1. Navigați la: https://app.supabase.com/project/jqxlauexhkonixtjvljw/settings/api
2. În secțiunea **"Project API keys"** veți vedea:
   - **anon** / **public** key: Acesta este token-ul JWT lung
   - **service_role** key: NU folosiți aceasta în client (doar pe server)

## Securitate

✅ **SIGUR pentru client-side:**
- `NEXT_PUBLIC_SUPABASE_URL` - URL-ul public
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Cheia JWT anon (token-ul lung)

❌ **NU folosiți în client-side:**
- `service_role` key (cheia secretă) - doar pentru server/backend
- `sb_secret_*` - doar pentru operațiuni privilegiate pe server

## Verificare

Pentru a verifica că cheile funcționează:

```bash
# 1. Copiați .env.example la .env.local
cp .env.example .env.local

# 2. Porniți serverul de dezvoltare
npm run dev

# 3. Accesați diagnostics
# Deschideți: http://localhost:3000/diagnostics
```

Ar trebui să vedeți:
```
✅ NEXT_PUBLIC_SUPABASE_URL: https://jqxlauexhkonixtjvljw.supabase.co
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: eyJhbGci... (primii 50 caractere)
```

## Întrebări Frecvente

### Q: De ce am nevoie de două seturi de variabile (NEXT_PUBLIC_* și VITE_*)?
**A:** Aplicația este hibridă:
- **Next.js Portal** (dashboard-ul principal) folosește `NEXT_PUBLIC_*`
- **Vite Landing Page** (pagina de aterizare) folosește `VITE_*`
- Ambele componente conectează la același proiect Supabase, dar folosesc prefixe diferite pentru compatibilitate cu framework-urile respective.

### Q: De ce nu folosim formatul `sb_publishable_*`?
**A:** Formatul `sb_publishable_*` este o etichetă descriptivă din UI-ul Supabase. Codul actual al aplicației Supabase și bibliotecile client așteaptă token-ul JWT complet.

### Q: Este sigur să public ANON KEY în cod?
**A:** Da! ANON KEY este special proiectată pentru a fi folosită public. Securitatea este asigurată prin:
- Row Level Security (RLS) policies în baza de date
- Restricții la nivel de tabel
- Politici de autentificare și autorizare

### Q: Ce se întâmplă dacă folosesc formatul greșit?
**A:** Aplicația nu se va putea conecta la Supabase și veți vedea erori de autentificare în consolă.

### Q: Trebuie să setez TOATE cele 5 variabile în Netlify?
**A:** Da! Fără toate cele 5 variabile, diferitele părți ale aplicației nu vor funcționa corect:
- Fără `NEXT_PUBLIC_*`: Portalul/Dashboard-ul nu va funcționa
- Fără `VITE_*`: Landing page-ul nu va funcționa
- Fără `NEXT_PUBLIC_SITE_URL`: Redirecturile de autentificare vor eșua

## Resurse Adiționale

- [Documentație Supabase - API Keys](https://supabase.com/docs/guides/api#api-keys)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- `ENVIRONMENT_VARIABLES.md` - Ghid complet variabile de mediu (Engleză)
- `SETARI_MEDIU_RO.md` - Ghid rapid în Română

---

**Actualizat:** 2026-02-19  
**Pentru Proiect:** XDrive Logistics

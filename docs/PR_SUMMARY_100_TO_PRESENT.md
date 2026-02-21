# XDrive Logistics — Rezumat complet PR #100 → Prezent

> Generat: 2026-02-21 · Repo: `LoadifyMarketLTD/xdrivelogistics`

---

## Cuprins

| PR | Titlu | Status | Data merge | Fișiere | +/- linii |
|----|-------|--------|-----------|---------|-----------|
| [#100](#pr-100) | Fix bid constraint, OG metadata, missing routes, nav roles + audit | ✅ Merged | 2026-02-21 | 51 | +3060 / -34 |
| [#101](#pr-101) | Fix Supabase SQL 42601 error (binary screenshot blobs) | ✅ Merged | 2026-02-21 | 92 | +3217 / -412 |
| [#102](#pr-102) | Fix GitHub PR conflict detection (two-parent merge commit) | ✅ Merged | 2026-02-21 | 73 | +1547 / -1520 |
| [#103](#pr-103) | Fix `job_bids` status constraint + consolidate duplicate SQL functions | ✅ Merged | 2026-02-21 | 9 | +823 / -166 |
| [#104](#pr-104) | Define account types on login/register + authoritative Supabase SQL | ✅ Merged | 2026-02-21 | 6 | +963 / -34 |
| [#105](#pr-105) | RBAC multi-role auth: login flows, approval gating, company invite | ✅ Merged | 2026-02-21 | 26 | +2932 / -969 |
| [#106](#pr-106) | Enable Supabase Confirm Email flow + `profiles.user_id` fix | 🔄 Open (draft) | — | 9 | +279 / -33 |
| [#107](#pr-107) | Create comprehensive summary for PR #100 → prezent | 🔄 Open (draft) | — | — | — |

---

## PR #100

**Titlu:** Fix bid constraint, OG metadata, missing routes, nav roles + full audit report with 22 route screenshots  
**Branch:** `copilot/audit-compliance-check` → `main`  
**Autor:** Copilot  
**Creat:** 2026-02-20 · **Merged:** 2026-02-21 01:30 UTC  
**Fișiere modificate:** 51 · **Linii adăugate:** +3 060 · **Linii șterse:** -34  
**Link:** https://github.com/LoadifyMarketLTD/xdrivelogistics/pull/100

### Ce s-a rezolvat

#### 🐛 P0 — Constraint `job_bids_bid_price_gbp_positive` violat
UI-ul trimitea doar `amount_gbp`; coloana `bid_price_gbp` rămânea `0` la fiecare insert.

```ts
// Înainte
.insert({ job_id, bidder_id, amount_gbp: Number(bidAmount), message })

// După — dual-column + 3-layer guard
const numericBid = Number(bidAmount)
if (isNaN(numericBid) || numericBid <= 0) return
.insert({ ..., amount_gbp: numericBid, bid_price_gbp: numericBid })
```

S-a adăugat și atributul `min="0.01"` pe câmpul input ca protecție browser.

#### 🐛 P0 — Thumbnail Netlify preview gol
Lipsea `metadataBase` în root layout → URL-ul OG relativ nu se putea rezolva. S-au adăugat `metadataBase`, bloc complet `openGraph`, Twitter card și `/public/og-image.png`.

#### 🗺️ 10 rute lipsă adăugate sub `app/(portal)/account/`
| Rută | Tip |
|------|-----|
| `get-started` | Funcțională |
| `company-profile` | Funcțională |
| `business-docs` | Funcțională |
| `settings` | Funcțională |
| `feedback` | Funcțională |
| `users-drivers` | Redirect → `/drivers-vehicles` |
| `company-vehicles` | Redirect → `/my-fleet` |
| `vehicle-tracking` | Coming Soon |
| `mobile-accounts` | Coming Soon |
| `notifications` | Coming Soon |

Alias-uri de rute: `/availability` → `/live-availability`, `/fleet` → `/my-fleet`.

#### 🧭 Corecții roluri nav (`config/nav.ts`)
- **Directory**: broker-only → toate rolurile
- **Return Journeys**: driver-only → toate rolurile
- **Post Load**: adăugat rolul `company`
- Sidebar împărțit în secțiuni `main` / `account` cu separator cu etichetă

#### 🖼️ Logo în bara de sus desktop (`PortalLayout.tsx`)
O singură linie adăugată — logo-ul exista deja în sidebar și mobile header; acum apare și în bara de top desktop.

#### 📋 Raport conformitate + dovezi screenshot
`docs/PR100_COMPLIANCE_REPORT.md` cu 22 screenshot-uri autentificate acoperind toate rutele obligatorii: 3 dashboard-uri de rol, `/loads`, `/quotes`, `/diary`, `/drivers-vehicles`, `/company/settings`, toate rutele `/account/*`, ambele alias-uri de rute.

### Gaps cunoscute (documentate)
- Validarea ofertei pe server lipsește (doar client-side)
- `window.alert()` nu a fost înlocuit cu toast
- Imaginea OG este copie a logo-ului — necesită asset branded 1200×630
- `/invoices` nu este legat în sidebar

---

## PR #101

**Titlu:** Fix Supabase SQL 42601 error caused by mis-committed binary screenshot blobs  
**Branch:** `copilot/fix-site-opening-errors` → `main`  
**Autor:** Copilot  
**Creat:** 2026-02-21 10:06 · **Merged:** 2026-02-21 11:43 UTC  
**Fișiere modificate:** 92 · **Linii adăugate:** +3 217 · **Linii șterse:** -412  
**Link:** https://github.com/LoadifyMarketLTD/xdrivelogistics/pull/101

### Ce s-a rezolvat

#### 🐛 Eroare Postgres `42601` la deschiderea Supabase SQL Editor
Fișierele PNG binare comise în `audit/screenshots/` cauzau eroarea de sintaxă când utilizatorii navigau la acea listare GitHub și lipeau conținutul în Supabase SQL Editor.

#### Modificări
- **`.gitignore`** — adăugate `audit/`, `docs/screenshots/**/*.png`, `docs/proof/**/*.png` pentru a preveni urmărirea blob-urilor PNG
- **54 fișiere PNG binare eliminate** din git tracking via `git rm --cached` din `audit/screenshots/`, `docs/proof/pr100/`, `docs/screenshots/`

#### 📌 Ghid fișier SQL corect
Fișierul de lipit în Supabase SQL Editor este **`XDRIVE_COMPLETE_SQL_SCHEMA.sql`** din rădăcina repo (965 de linii):

Schema conține: **18 tabele · 5 trigger-e · 10 funcții · 30+ politici RLS · 5 bucket-uri storage**

---

## PR #102

**Titlu:** Fix GitHub PR conflict detection by creating proper two-parent merge commit  
**Branch:** `copilot/verify-project-functionality` → `main`  
**Autor:** Copilot  
**Creat:** 2026-02-21 11:02 · **Merged:** 2026-02-21 12:20 UTC  
**Fișiere modificate:** 73 · **Linii adăugate:** +1 547 · **Linii șterse:** -1 520  
**Link:** https://github.com/LoadifyMarketLTD/xdrivelogistics/pull/102

### Ce s-a rezolvat

#### 🔧 Detecție conflicte PR GitHub incorectă
Merge-ul anterior folosea `--allow-unrelated-histories` pe un clone shallow/grafted, producând un commit cu un singur părinte. GitHub nu vedea niciun ancestor comun cu `main` și marca toate fișierele diferite drept conflicte.

**Cauza:**
```
# Stare anterioară — un singur părinte, fără legătură cu istoricul main
commit f8e2a89
  parent: 17cc993  (branch-ul nostru doar)
  # 220085a (main) NU era înregistrat ca părinte → conflicte pe 15 fișiere
```

**Soluția** — `git commit-tree` pentru a construi un commit merge cu ambele branch-uri ca părinți:
```
commit 05e5bc8
  parent 1: f8e2a89  — branch-ul nostru (toate implementările intacte)
  parent 2: 220085a  — HEAD main (PR #101)
  tree:     76fbc1c  — neschimbat, același conținut
```

Niciun conținut de fișier nu a fost modificat — doar graful de commit-uri a fost corectat.

---

## PR #103

**Titlu:** Fix `job_bids` status check constraint violation + consolidate duplicate SQL functions  
**Branch:** `copilot/fix-job-bids-check-constraint` → `main`  
**Autor:** Copilot  
**Creat:** 2026-02-21 12:26 · **Merged:** 2026-02-21 13:09 UTC  
**Fișiere modificate:** 9 · **Linii adăugate:** +823 · **Linii șterse:** -166  
**Link:** https://github.com/LoadifyMarketLTD/xdrivelogistics/pull/103

### Ce s-a rezolvat

#### 🐛 Constraint `job_bids_status_check` violat
Insert-urile noi de ofertă eșuau cu `violates check constraint "job_bids_status_check"` deoarece `supabase-portal-schema.sql` seta `status DEFAULT 'pending'` în timp ce constraint-ul named permitea doar `('submitted','withdrawn','rejected','accepted')`.

**Fix:**
- `supabase-portal-schema.sql`: `DEFAULT 'pending'` → `DEFAULT 'submitted'`; constraint inline actualizat
- `app/(portal)/loads/page.tsx`, `app/m/fleet/loads/page.tsx`: `status: 'submitted'` explicit pe insert
- `migration-fix-job-bids-status-default.sql` *(nou)*: migrează rândurile existente `'pending'`, repară default-ul coloanei

#### 🔧 Consolidare funcții SQL duplicate
Trei grupe de logică identică existau sub nume diferite:

| Nume canonic | Alias eliminat |
|---|---|
| `update_updated_at_column()` | `set_updated_at()` |
| `generate_invoice_number()` | `set_invoice_number()` |
| `current_user_company_id()` | `get_user_company_id()` / `my_company_id()` → delegate spre el |

- `migration-consolidate-duplicate-functions.sql` *(nou)*: redirecționează trigger-ele de la numele vechi, șterge funcțiile vechi, instalează wrapper-e de compatibilitate

#### 📄 Fix UX copy-paste SQL
`SQL_CODE_AICI_README.md` începea cu `# 🎯 SQL CODE AICI…`; când era copiat raw în Supabase, `#` era interpretat ca operator XOR PostgreSQL și `🎯` cauza eroare imediată de sintaxă.
- Adăugat comentariu HTML `<!-- -->` ca primă linie
- Eliminat emoji-urile din heading-ul `#`
- `README.md`: secțiune nouă `## DATABASE SETUP` cu SQL-ul complet inline

---

## PR #104

**Titlu:** Define account types on login/register pages + add authoritative Supabase SQL setup files  
**Branch:** `copilot/define-login-pages` → `main`  
**Autor:** Copilot  
**Creat:** 2026-02-21 13:26 · **Merged:** 2026-02-21 13:57 UTC  
**Fișiere modificate:** 6 · **Linii adăugate:** +963 · **Linii șterse:** -34  
**Link:** https://github.com/LoadifyMarketLTD/xdrivelogistics/pull/104

### Ce s-a rezolvat

#### 👤 UX Roluri — Login & Register
Proprietarii de companie nu aveau nicio modalitate de a identifica ce rol le corespunde.

- **`lib/roles.ts`**: adăugate exporturi `ROLE_DESCRIPTION` și `ROLE_ICON`; eticheta `company` redenumită `"Transport Company"` → `"Transport Company (Owner)"`
- **`app/login/page.tsx`**: card de referință „Account Types" adăugat sub formular — afișează toate 3 rolurile cu icon + descriere
- **`app/register/page.tsx`**: cardurile de selecție rol afișează acum icon + descriere

```ts
export const ROLE_DESCRIPTION: Record<string, string> = {
  driver:  'Browse and bid on available freight loads, manage your availability and schedule.',
  broker:  'Post loads to the marketplace, review carrier bids and manage shipments.',
  company: 'Manage your fleet and drivers, post company jobs and track performance as a company owner or administrator.',
}
```

#### 🗄️ Fișiere SQL Setup
Două fișiere noi, idempotente și gata de copy-paste în Supabase SQL Editor:

**`SUPABASE_SETUP.sql`** — bază de date nouă:
Schema completă: `companies`, `profiles`, `drivers`, `vehicles`, `jobs`, `job_bids`, `invoices`, trigger-e, RPC `create_company`, trigger `handle_new_user`, 25 politici RLS.

**`MIGRATION_MISSING_COLUMNS.sql`** — bază de date existentă:

| Tabel | Coloane adăugate |
|-------|-----------------|
| `profiles` | `display_name`, `driver_base_postcode`, `driver_vehicle_type`, `driver_availability`, `broker_company_name`, `broker_company_postcode`, `broker_payment_terms`, `company_name`, `company_postcode`, `company_fleet_size`, `company_primary_services` |
| `jobs` | `current_status`, `posted_by_company_id`, `pickup_location`, `delivery_location`, `budget`, `driver_id`, `load_id` |
| `job_bids` | `bidder_id` (FK → `profiles`), `amount_gbp`, `status` cu CHECK (`submitted`\|`accepted`\|`rejected`\|`withdrawn`\|`completed`) |

---

## PR #105

**Titlu:** RBAC multi-role auth: separate login flows, approval gating, company invite system  
**Branch:** `copilot/separate-login-for-roles` → `main`  
**Autor:** Copilot  
**Creat:** 2026-02-21 15:45 · **Merged:** 2026-02-21 17:28 UTC  
**Fișiere modificate:** 26 · **Linii adăugate:** +2 932 · **Linii șterse:** -969  
**Link:** https://github.com/LoadifyMarketLTD/xdrivelogistics/pull/105

### Ce s-a rezolvat

Pagina de login unică nu avea conștientizare a rolului — proprietarul vedea un formular de onboarding driver după autentificare, toate rolurile împărtășeau un singur traseu de înregistrare și nu exista gate de aprobare.

#### 🔐 Auth & Rutare
| Rută | Comportament |
|------|-------------|
| `/login` | Email + parolă simplificat; redirecționează la `/post-login` la succes |
| `/post-login` | Apelează RPC `get_my_role_status()`; rutează după rezultat: `pending` → `/pending`, `blocked` → `/blocked`, fără profil → `/onboarding`, `owner` → `/admin/approvals`, `broker` → `/dashboard/broker`, `company_admin` → `/dashboard/company`, `driver` → `/dashboard/driver` |
| `/onboarding` | Selecție rol broker/company; apelează `register_broker_pending` sau `register_company_pending` RPC |
| `/pending` | Ecran de status; `company_admin` primește link să completeze profilul; buton Refresh re-apelează RPC |
| `/blocked` | Ecran cont suspendat cu contact suport |

#### 🛡️ Protecție rute — `middleware.ts`
Protejează `/dashboard/*`, `/admin/*`, `/owner`:
- Neautentificat → `/login`
- `status ≠ active` → `/pending` sau `/blocked`
- Excepție: `company_admin` pending poate accesa `/dashboard/company/profile` pentru a completa profilul înainte de aprobare

#### 📝 Înregistrare
- `/register` — selecție rol: Broker / Company / Driver (anunț invite-only, fără auto-înregistrare pentru șoferi)
- `/register/broker` → RPC `register_broker_pending` → `/pending`
- `/register/company` → RPC `register_company_pending` → `/pending`

#### ✅ Aprobări Owner (`/admin/approvals`)
Listează brokeri și companii în așteptare cu acțiuni Approve/Reject susținute de RPC-uri: `approve_broker`, `reject_broker`, `approve_company`, `reject_company`.

#### 🏢 Profil Companie & Șoferi
- `/dashboard/company/profile` — editare detalii companie; „Submit for Review" apelează RPC `submit_company_for_review`
- `/dashboard/company/drivers` — listează șoferi activi; generează link-uri de invitație cu token hex de 48 caractere:
  ```
  https://xdrivelogistics.co.uk/invite/accept?token=<48-hex>
  ```

#### 🔗 Accept invitație șofer (`/invite/accept`)
Validează token-ul server-side via RPC `accept_driver_invite` — creează profil `driver` cu `status=active` și inserează rând `company_members`. Fără altă cale de auto-înregistrare pentru șoferi.

#### 🗄️ Baza de date (`supabase/sql/001_rbac_company_invites_full_functions.sql`)
Tabele: `profiles` (PK `user_id`), `companies`, `company_members`, `invites`. 9 funcții RPC `SECURITY DEFINER` — fără service role key necesar. RLS pe toate tabelele via helper `is_owner()`.

#### 🧩 RBAC Helpers (`lib/rbac.ts`)
```ts
export function routeForRoleStatus(row: RoleStatusRow): string {
  if (row.status === 'pending') return '/pending'
  if (row.status === 'blocked') return '/blocked'
  switch (row.role) {
    case 'owner':         return '/admin/approvals'
    case 'broker':        return '/dashboard/broker'
    case 'company_admin': return '/dashboard/company'
    case 'driver':        return '/dashboard/driver'
  }
}
```

#### 🔑 Owner Bootstrap
```sql
INSERT INTO public.profiles (user_id, role, status, full_name)
VALUES ('<your-supabase-user-id>', 'owner', 'active', 'Site Owner')
ON CONFLICT (user_id) DO UPDATE SET role = 'owner', status = 'active';
```

**Variabile de mediu necesare:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`

---

## PR #106

**Titlu:** Enable Supabase Confirm Email flow + in-app welcome banners (zero-cost)  
**Branch:** `copilot/enable-confirm-email-flow` → `main`  
**Autor:** Copilot  
**Status:** 🔄 **Open — Draft** (în lucru)  
**Creat:** 2026-02-21 18:03 UTC  
**Fișiere modificate:** 9 · **Linii adăugate:** +279 · **Linii șterse:** -33  
**Link:** https://github.com/LoadifyMarketLTD/xdrivelogistics/pull/106

### Ce se lucrează

Fix global `profiles.id` → `profiles.user_id` — toate interogările Supabase care foloseau `.eq('id', userId)` pe tabela `profiles` sunt greșite deoarece cheia primară s-a schimbat la `user_id` în PR #105.

#### Fișiere de corectat
| Fișier | Modificare |
|--------|-----------|
| `lib/profile.ts` | `Profile` interface: `id` → `user_id`; `getProfile()` query |
| `lib/AuthContext.tsx` | `.eq('id', userId)` → `.eq('user_id', userId)` |
| `lib/getUserRole.ts` | `.eq('id', userId)` → `.eq('user_id', userId)` |
| `app/(portal)/account/settings/page.tsx` | `.eq('id', user.id)` → `.eq('user_id', user.id)` |
| `app/(portal)/account/mobile-accounts/page.tsx` | Fix select `id` → `user_id` + `.eq('id',...)` × 2 + `u.id` × 2 |
| `app/diagnostics/page.tsx` | `.eq('id', ...)` → `.eq('user_id', ...)` |
| `app/(portal)/users/[id]/page.tsx` | `.eq('id', userId)` × 3 |
| `app/api/jobs/[jobId]/bids/route.ts` | `.eq('id', userId)` × 3 pe `profiles` |
| `app/api/jobs/[jobId]/status/route.ts` | `.eq('id', userId)` × 2 pe `profiles` |
| `app/api/jobs/[jobId]/evidence/route.ts` | `.eq('id', userId)` × 3 pe `profiles` |
| `app/(portal)/dashboard/company/page.tsx` | `.select('id')` → `.select('user_id')` pe `profiles` |
| `app/auth/callback/route.ts` | Înlocuiește handler GET (folosește `url.origin` pentru redirect) |

---

## PR #107

**Titlu:** [WIP] Create comprehensive summary for PR #100 → prezent  
**Branch:** `copilot/summary-for-pr-100` → `main`  
**Autor:** Copilot  
**Status:** 🔄 **Open — Draft** (în lucru)  
**Creat:** 2026-02-21 18:48 UTC  
**Link:** https://github.com/LoadifyMarketLTD/xdrivelogistics/pull/107

### Ce se lucrează
Crearea acestui document de rezumat complet.

---

## Statistici cumulative (PR #100 → #106)

| Metric | Valoare |
|--------|---------|
| **PR-uri merged** | 6 (#100–#105) |
| **PR-uri open/draft** | 2 (#106, #107) |
| **Fișiere modificate total** | ~266 |
| **Linii adăugate** | ~12 521 |
| **Linii șterse** | ~3 135 |
| **Commit-uri** | 31 |

---

## Cronologie vizuală

```
20 Feb 2026
  └── PR #100 merged ── Fix bid constraint + audit + 10 rute + OG metadata

21 Feb 2026
  ├── PR #101 merged ── Eliminat PNG binare din git; fix SQL 42601
  ├── PR #102 merged ── Fix merge commit cu 2 părinți (GitHub conflict detection)
  ├── PR #103 merged ── Fix status 'pending'→'submitted'; consolidate SQL functions
  ├── PR #104 merged ── UX roluri login/register; SUPABASE_SETUP.sql + MIGRATION_MISSING_COLUMNS.sql
  ├── PR #105 merged ── RBAC complet: login separat per rol, aprobare, invitații companie
  ├── PR #106 open   ── Fix global profiles.user_id + Confirm Email flow  [IN LUCRU]
  └── PR #107 open   ── Rezumat complet PR #100→prezent                   [ACEST DOCUMENT]
```

---

## Arii funcționale acoperite

### ✅ Autentificare & Autorizare
- Login separat per rol cu rutare post-login inteligentă
- Gate de aprobare pentru brokeri și companii
- Sistem de invitații pentru șoferi (token hex 48 caractere)
- Middleware de protecție rute (`/dashboard/*`, `/admin/*`)
- RBAC complet: `owner`, `broker`, `company_admin`, `driver`

### ✅ Baza de date Supabase
- Fix constraint `job_bids_bid_price_gbp_positive` (dual-column insert)
- Fix constraint `job_bids_status_check` (`pending` → `submitted`)
- Consolidare funcții SQL duplicate (3 grupe)
- Fișiere SQL canonice: `SUPABASE_SETUP.sql`, `MIGRATION_MISSING_COLUMNS.sql`
- 9 funcții RPC `SECURITY DEFINER` pentru logică de scriere
- Schema completă: 18 tabele, 5 triggere, 10 funcții, 30+ politici RLS

### ✅ UI / UX
- Card „Account Types" pe pagina de login
- Carduri de selecție rol cu icon + descriere pe pagina de register
- Logo în bara de top desktop
- 10 rute account noi (`/account/get-started`, `/account/settings` etc.)
- Corecții roluri în navigarea principală
- Sidebar împărțit în secțiuni `main` / `account`

### ✅ SEO & Social
- `metadataBase` adăugat în root layout
- Bloc complet `openGraph` + Twitter card
- `/public/og-image.png` adăugat

### ✅ Infrastructură & Calitate cod
- `.gitignore` actualizat (fișiere PNG, `audit/`)
- Fix git history (commit cu 2 părinți pentru GitHub PR conflict detection)
- Fix UX copy-paste SQL (emoji → ASCII, comentariu HTML protector)
- Secțiune `DATABASE SETUP` adăugată în `README.md`

### 🔄 În lucru (PR #106)
- Migrate toate interogările `profiles.id` → `profiles.user_id`
- Enable Supabase Confirm Email flow
- In-app welcome banners

---

*Document generat automat de Copilot coding agent · PR #107*

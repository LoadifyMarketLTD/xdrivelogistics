# XDrive Logistics LTD - COMPLETE STRUCTURAL ANALYSIS
**Generated:** 2026-02-16  
**Repository:** LoadifyMarketLTD/xdrivelogistics  
**Type:** Next.js 16 + Supabase Public Marketplace Application

---

## 1️⃣ PROJECT TREE

```
xdrivelogistics/
├── app/                           # Next.js App Router (pages & routes)
│   ├── company/
│   │   └── settings/page.tsx      # Company settings management
│   ├── dashboard/
│   │   ├── error.tsx              # Error boundary
│   │   ├── loading.tsx            # Loading state
│   │   └── page.tsx               # Main dashboard
│   ├── diagnostics/
│   │   └── page.tsx               # System diagnostics page
│   ├── forgot-password/
│   │   └── page.tsx               # Password reset request
│   ├── jobs/
│   │   └── new/page.tsx           # Post new job form
│   ├── login/
│   │   └── page.tsx               # User login
│   ├── marketplace/
│   │   ├── [id]/page.tsx          # Job detail & bidding (dynamic)
│   │   └── page.tsx               # Job listing & filtering
│   ├── onboarding/
│   │   ├── company/page.tsx       # Company creation form
│   │   ├── driver/page.tsx        # Driver onboarding (legacy)
│   │   └── page.tsx               # Onboarding router
│   ├── register/
│   │   └── page.tsx               # User registration
│   ├── reset-password/
│   │   └── page.tsx               # Password reset completion
│   ├── ClientScripts.tsx          # Client-side scripts loader
│   ├── ContactForm.tsx            # Contact form component
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout with AuthProvider
│   └── page.tsx                   # Home/landing page
│
├── components/
│   └── Navbar.tsx                 # Navigation bar component
│
├── lib/
│   ├── AuthContext.tsx            # Auth context provider & hooks
│   ├── supabaseClient.ts          # Supabase client singleton
│   └── types.ts                   # TypeScript interfaces for DB
│
├── styles/
│   ├── dashboard.css              # Platform-wide dashboard styles
│   └── public.css                 # Public-facing page styles
│
├── public/
│   ├── background.jpg/webp        # Hero background images
│   ├── logo.png/webp              # XDrive logo assets
│   ├── robots.txt                 # SEO crawl rules
│   └── sitemap.xml                # SEO sitemap
│
├── supabase-marketplace-schema.sql  # Current active schema
├── supabase-schema.sql              # Internal company schema (legacy)
├── migration-company-settings.sql   # Company settings migration
│
├── netlify.toml                   # Netlify deployment config
├── next.config.js                 # Next.js configuration
├── package.json                   # Dependencies & scripts
├── tailwind.config.js             # Tailwind CSS config
├── tsconfig.json                  # TypeScript config
│
└── [DOCS]/                        # Documentation files
    ├── ANALIZA_STRUCTURALA.md
    ├── DATABASE_SETUP.md
    ├── IMPLEMENTATION_COMPLETE.md
    ├── MARKETPLACE_MVP_GUIDE.md
    ├── MIGRATION_COMPLETE.md
    ├── NETLIFY_SETUP.md
    ├── README.md
    ├── SECURITY.md
    └── ...
```

---

## 2️⃣ ROUTES (Next.js App Router)

### Public Routes (No Auth Required)
| Route | File | Type | Description |
|-------|------|------|-------------|
| `/` | `app/page.tsx` | Static | Landing page with hero & contact form |
| `/login` | `app/login/page.tsx` | Static | Email/password login form |
| `/register` | `app/register/page.tsx` | Static | User registration form |
| `/forgot-password` | `app/forgot-password/page.tsx` | Static | Password reset request |
| `/reset-password` | `app/reset-password/page.tsx` | Static | Password reset completion |

### Protected Routes (Auth Required)
| Route | File | Type | Supabase Calls | Notes |
|-------|------|------|----------------|-------|
| `/dashboard` | `app/dashboard/page.tsx` | Dynamic | ✅ `jobs`, `job_bids` | Shows posted jobs, assigned jobs, and bids |
| `/marketplace` | `app/marketplace/page.tsx` | Dynamic | ✅ `jobs` with company JOIN | Public job board with filters |
| `/marketplace/[id]` | `app/marketplace/[id]/page.tsx` | Dynamic | ✅ `jobs`, `job_bids`, RPC `accept_bid` | Job detail, submit bid, accept/reject bids |
| `/jobs/new` | `app/jobs/new/page.tsx` | Dynamic | ✅ INSERT into `jobs` | Post new job form |
| `/onboarding` | `app/onboarding/page.tsx` | Dynamic | Redirects to `/onboarding/company` | Router page |
| `/onboarding/company` | `app/onboarding/company/page.tsx` | Dynamic | ✅ RPC `create_company` | Company creation form |
| `/company/settings` | `app/company/settings/page.tsx` | Dynamic | ✅ `companies` SELECT/UPDATE | Company profile management |
| `/diagnostics` | `app/diagnostics/page.tsx` | Dynamic | ✅ Various diagnostic queries | System health check page |

### Server Actions / API Routes
**None.** All Supabase calls are made directly from client components using `@supabase/supabase-js`.

---

## 3️⃣ SUPABASE INTEGRATION

### Client Configuration
**File:** `lib/supabaseClient.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Runtime validation (browser only)
// Build-time allows placeholders
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Environment Variables Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public key

### Auth Context
**File:** `lib/AuthContext.tsx`

Provides global authentication state:
```typescript
interface AuthContextType {
  user: User | null              // Supabase auth user
  profile: Profile | null         // User profile from profiles table
  companyId: string | null        // Current user's company ID
  loading: boolean                // Auth initialization state
  error: string | null            // Auth errors
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}
```

**How it works:**
1. Listens to `supabase.auth.onAuthStateChange()`
2. When user logs in, fetches profile from `profiles` table
3. Extracts `company_id` from profile
4. Provides `useAuth()` hook to all components

### RLS (Row Level Security) Dependencies
All protected routes depend on:
- `auth.uid()` - Current authenticated user ID
- `current_user_company_id()` - RPC function returning user's company ID

### Server-Side Auth
**Not used.** All authentication is client-side via `@supabase/supabase-js`.

---

## 4️⃣ JOB CREATION FLOW

### Route: `/jobs/new`
**File:** `app/jobs/new/page.tsx`

#### Flow:
1. **Auth Check:** Redirects to `/login` if not authenticated
2. **Company Check:** Redirects to `/onboarding` if no company
3. **Form Submission:** Calls `supabase.from('jobs').insert()`
4. **Success:** Redirects to `/marketplace/{job_id}`

#### Insert Call (Line 78-82):
```typescript
const { data, error } = await supabase
  .from('jobs')
  .insert([jobData])
  .select()
  .single()
```

#### Columns Inserted:
```typescript
{
  posted_by_company_id: companyId,        // FK to companies
  pickup_location: string,                 // Required
  delivery_location: string,               // Required
  status: 'open',                          // Default
  pickup_datetime: string | null,          // Optional timestamptz
  delivery_datetime: string | null,        // Optional timestamptz
  vehicle_type: string | null,             // Optional
  load_details: string | null,             // Optional textarea
  pallets: number | null,                  // Optional integer
  weight_kg: number | null,                // Optional numeric
  budget: number | null                    // Optional numeric (£)
}
```

**Note:** The code expects a `pallets` column to exist in the `jobs` table.

---

## 5️⃣ BIDS FLOW

### Bid Submission
**File:** `app/marketplace/[id]/page.tsx` (Lines 91-134)

#### Flow:
1. User views job detail page (`/marketplace/{job_id}`)
2. If not the poster and job is `open`, bid form appears
3. User enters `quote_amount` and optional `message`
4. Calls `supabase.from('job_bids').insert()`

#### Insert Call (Lines 107-117):
```typescript
const { data, error } = await supabase
  .from('job_bids')
  .insert([{
    job_id: jobId,
    bidder_company_id: companyId,           // ✅ Uses bidder_company_id
    bidder_user_id: user!.id,
    quote_amount: parseFloat(quoteAmount),
    message: message || null,
    status: 'submitted'
  }])
  .select()
```

### Bid Acceptance
**File:** `app/marketplace/[id]/page.tsx` (Lines 136-155)

Calls RPC function:
```typescript
const { error } = await supabase.rpc('accept_bid', { p_bid_id: bidId })
```

**RPC Logic (supabase-marketplace-schema.sql):**
1. Verifies caller is the job poster
2. Updates job: `status='assigned'`, `assigned_company_id`, `accepted_bid_id`
3. Updates accepted bid: `status='accepted'`
4. Rejects all other submitted bids: `status='rejected'`

### Columns Used:
✅ **`bidder_company_id`** - Used correctly throughout  
✅ **`bidder_user_id`** - Used for audit trail  
❌ **`bidder_id`** - Not used (doesn't exist in schema)

---

## 6️⃣ PROFILE + COMPANY LOGIC

### User Registration Flow
1. **Register:** `app/register/page.tsx` → `supabase.auth.signUp()`
2. **Trigger:** Database trigger `on_auth_user_created` creates profile
3. **Redirect:** User lands on `/dashboard`
4. **Check:** Dashboard sees no `company_id` → redirects to `/onboarding`
5. **Onboarding:** `/onboarding` → redirects to `/onboarding/company`
6. **Create Company:** User fills form → calls `create_company` RPC
7. **Link:** RPC creates company and updates profile's `company_id`
8. **Complete:** User redirected to `/dashboard` with full access

### Company Creation RPC
**Function:** `create_company(company_name TEXT, phone TEXT)`

**Logic:**
1. Gets `auth.uid()` (current user)
2. Checks if user already has a company
3. Inserts into `companies` table with `created_by = auth.uid()`
4. Updates `profiles` table: `company_id = new_company_id` for current user
5. Returns new company ID

### Ownership Model
- **Company:** Created by one user (`created_by` field)
- **Profile:** Links to company via `company_id`
- **Jobs:** Posted by company (`posted_by_company_id`)
- **Bids:** Submitted by company (`bidder_company_id`)

**Note:** Currently, only the company creator can manage company settings (checked via `created_by` in settings page).

---

## 7️⃣ DATABASE EXPECTATIONS

### Current Active Schema
**File:** `supabase-marketplace-schema.sql`

### Table: `public.profiles`
| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | UUID | NO | PK, FK to auth.users |
| `email` | TEXT | NO | Unique |
| `full_name` | TEXT | YES | |
| `phone` | TEXT | YES | |
| `company_id` | UUID | YES | FK to companies |
| `role` | TEXT | NO | Enum: admin, dispatcher, driver, viewer |
| `is_active` | BOOLEAN | NO | Default true |
| `created_at` | TIMESTAMPTZ | NO | |
| `updated_at` | TIMESTAMPTZ | NO | |

### Table: `public.companies`
| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | UUID | NO | PK |
| `name` | TEXT | NO | |
| `email` | TEXT | YES | |
| `phone` | TEXT | YES | |
| `vat_number` | TEXT | YES | |
| `company_number` | TEXT | YES | |
| `address_line1` | TEXT | YES | |
| `address_line2` | TEXT | YES | |
| `city` | TEXT | YES | |
| `postcode` | TEXT | YES | |
| `country` | TEXT | YES | |
| `created_by` | UUID | YES | FK to auth.users |
| `created_at` | TIMESTAMPTZ | NO | |
| `updated_at` | TIMESTAMPTZ | NO | Auto-updated by trigger |

### Table: `public.jobs`
| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | UUID | NO | PK |
| `created_at` | TIMESTAMPTZ | NO | |
| `updated_at` | TIMESTAMPTZ | NO | |
| `posted_by_company_id` | UUID | NO | FK to companies |
| `status` | TEXT | NO | Enum: open, assigned, in-transit, completed, cancelled |
| `pickup_location` | TEXT | NO | ✅ Used in code |
| `delivery_location` | TEXT | NO | ✅ Used in code |
| `pickup_datetime` | TIMESTAMPTZ | YES | ✅ Used in code |
| `delivery_datetime` | TIMESTAMPTZ | YES | ✅ Used in code |
| `vehicle_type` | TEXT | YES | ✅ Used in code |
| `load_details` | TEXT | YES | ✅ Used in code |
| `pallets` | INTEGER | YES | ✅ Used in code |
| `weight_kg` | NUMERIC | YES | ✅ Used in code |
| `budget` | NUMERIC | YES | ✅ Used in code |
| `assigned_company_id` | UUID | YES | FK to companies |
| `accepted_bid_id` | UUID | YES | FK to job_bids |

**✅ ALL COLUMNS EXIST IN SCHEMA - No missing columns issue**

### Table: `public.job_bids`
| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | UUID | NO | PK |
| `created_at` | TIMESTAMPTZ | NO | |
| `job_id` | UUID | NO | FK to jobs |
| `bidder_company_id` | UUID | NO | ✅ Used correctly in code |
| `bidder_user_id` | UUID | NO | FK to auth.users |
| `quote_amount` | NUMERIC | NO | |
| `message` | TEXT | YES | |
| `status` | TEXT | NO | Enum: submitted, withdrawn, rejected, accepted |

**✅ `bidder_company_id` exists and is used correctly**

### Missing Columns Analysis
**None.** All columns referenced in the frontend code exist in the marketplace schema.

### Potential Schema Cache Issue
If users report "Could not find the 'pallets' column" error, it would be due to:
1. Schema not applied to Supabase database
2. PostgREST schema cache not refreshed
3. Different schema file was used (e.g., `supabase-schema.sql` instead of `supabase-marketplace-schema.sql`)

**Solution:**
1. Confirm `supabase-marketplace-schema.sql` is applied
2. In Supabase Dashboard → Settings → API → Click "Reload schema cache"
3. Or run: `NOTIFY pgrst, 'reload schema'`

---

## 8️⃣ DEPLOY CONFIG

### Next.js Configuration
**File:** `next.config.js`

```javascript
const nextConfig = {
  // Removed 'output: standalone' for Netlify compatibility
  // Netlify uses @netlify/plugin-nextjs which requires standard Next.js output
}
```

### Netlify Configuration
**File:** `netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
```

### Dependencies (package.json)
```json
{
  "dependencies": {
    "@supabase/auth-helpers-nextjs": "^0.8.7",
    "@supabase/supabase-js": "^2.95.3",
    "@tailwindcss/postcss": "^4.1.18",
    "next": "^16.1.6",
    "react": "^19.2.4",
    "react-dom": "^19.2.4"
  }
}
```

**Versions:**
- **Next.js:** 16.1.6 (App Router)
- **React:** 19.2.4
- **Supabase JS:** 2.95.3
- **Auth Helpers:** 0.8.7 (Used minimally - mostly direct client usage)

### Build Output
- **Directory:** `.next/` (published to Netlify)
- **Plugin:** `@netlify/plugin-nextjs` handles Next.js serverless functions
- **Environment Variables:** Set in Netlify UI (not in code)

### Required Environment Variables (Netlify)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://jqxlauexhkonixtjvljw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=https://xdrivelogistics.co.uk
```

---

## 📋 SUMMARY & KEY FINDINGS

### ✅ What Works
1. **Schema is complete** - All columns used in code exist in `supabase-marketplace-schema.sql`
2. **Bidding logic** - Uses `bidder_company_id` correctly throughout
3. **Auth flow** - Proper user → profile → company linking
4. **RLS policies** - Public marketplace visibility with proper ownership checks
5. **Job posting** - All fields (pallets, weight_kg, budget, etc.) supported

### ⚠️ Potential Issues
1. **Schema Cache** - If "pallets column not found" error occurs:
   - Verify correct schema file applied
   - Reload PostgREST schema cache in Supabase
2. **No server actions** - All DB calls are client-side (could be more secure with server actions)
3. **Single company per user** - No multi-company membership support
4. **No load_type field** - Code uses `load_details` text field, not structured enum

### 🎯 To Fix "Pallets Column" Error
1. **Verify schema applied:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_schema = 'public' 
     AND table_name = 'jobs';
   ```
2. **If missing, run:** `supabase-marketplace-schema.sql` in Supabase SQL Editor
3. **Reload schema cache:** Supabase Dashboard → API Settings → "Reload schema cache"
4. **Test:** Post a job with pallets field populated

### 📝 Next Steps (If Implementing Fixes)
1. Add `load_type` enum column to jobs table
2. Add pickup/delivery postcode fields (optional, for future filtering)
3. Consider server actions for sensitive operations (accepting bids, etc.)
4. Add company team member management (currently only creator has full access)
5. Add more vehicle types or make it a searchable field

---

**Document Status:** ✅ Complete  
**Analysis Date:** 2026-02-16  
**Read-Only Mode:** No modifications made to repository

# XDrive Logistics LTD

A modern logistics and courier exchange platform built with React, TypeScript, and Supabase.

This is a hybrid application that uses **Vite** for the landing page and **Next.js** for the portal application.

---

## 🔧 DATABASE SETUP — Run This SQL in Supabase First

> **Copy the block below → open [Supabase SQL Editor](https://supabase.com/dashboard) → paste → click Run.**
> Safe to run multiple times (all statements are idempotent).

```sql
-- ============================================================
-- XDRIVE LOGISTICS — COMPLETE DATABASE SETUP / FIX SCRIPT
-- Copy everything below and run in Supabase → SQL Editor
-- ============================================================
--
-- PART 1: Fix job_bids status constraint
--         (fixes "Failed to submit bid" error)
-- PART 2: Create invoices table
-- ============================================================


-- ============================================================
-- PART 1: FIX job_bids STATUS CONSTRAINT
-- Fixes: "Failed to submit bid: new row for relation job_bids
--         violates check constraint job_bids_status_check"
-- ============================================================

-- 1a. Migrate any existing 'pending' bids to 'submitted'
UPDATE public.job_bids
SET status = 'submitted'
WHERE status = 'pending';

-- 1b. Fix the column default
ALTER TABLE public.job_bids
  ALTER COLUMN status SET DEFAULT 'submitted';

-- 1c. Drop any check constraint that references 'pending'
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public'
      AND rel.relname = 'job_bids'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) LIKE '%pending%'
  LOOP
    EXECUTE 'ALTER TABLE public.job_bids DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
  END LOOP;
END $$;

-- 1d. Re-add the constraint with the correct values
ALTER TABLE public.job_bids
  DROP CONSTRAINT IF EXISTS job_bids_status_check;

ALTER TABLE public.job_bids
  ADD CONSTRAINT job_bids_status_check
  CHECK (status IN ('submitted', 'withdrawn', 'rejected', 'accepted'));

-- 1e. Ensure required columns exist (skips safely if already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'job_bids' AND column_name = 'bidder_id'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'job_bids' AND column_name = 'bidder_user_id'
    ) THEN
      ALTER TABLE public.job_bids RENAME COLUMN bidder_user_id TO bidder_id;
    ELSE
      ALTER TABLE public.job_bids ADD COLUMN bidder_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'job_bids' AND column_name = 'amount_gbp'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'job_bids' AND column_name = 'quote_amount'
    ) THEN
      ALTER TABLE public.job_bids RENAME COLUMN quote_amount TO amount_gbp;
      ALTER TABLE public.job_bids ALTER COLUMN amount_gbp TYPE NUMERIC(12,2);
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'job_bids' AND column_name = 'amount'
    ) THEN
      ALTER TABLE public.job_bids RENAME COLUMN amount TO amount_gbp;
      ALTER TABLE public.job_bids ALTER COLUMN amount_gbp TYPE NUMERIC(12,2);
    ELSE
      ALTER TABLE public.job_bids ADD COLUMN amount_gbp NUMERIC(12,2) NOT NULL DEFAULT 0;
    END IF;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'job_bids' AND column_name = 'message'
  ) THEN
    ALTER TABLE public.job_bids ADD COLUMN message TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_job_bids_bidder_id ON public.job_bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_job_bids_status    ON public.job_bids(status);


-- ============================================================
-- PART 2: CREATE INVOICES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.invoices (
  id             UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id     UUID         NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  invoice_number VARCHAR(20)  UNIQUE NOT NULL,
  job_id         UUID         REFERENCES public.jobs(id) ON DELETE CASCADE,
  customer_name  TEXT         NOT NULL,
  customer_email TEXT,
  amount         DECIMAL(10,2) NOT NULL,
  vat_amount     DECIMAL(10,2) DEFAULT 0,
  status         TEXT         DEFAULT 'pending'
                   CHECK (status IN ('pending', 'sent', 'paid', 'overdue', 'cancelled')),
  issue_date     DATE         NOT NULL DEFAULT CURRENT_DATE,
  due_date       DATE         NOT NULL,
  paid_date      DATE,
  notes          TEXT,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1001;

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

DROP TRIGGER IF EXISTS set_invoice_number ON public.invoices;
CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON public.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_job_id     ON public.invoices(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status     ON public.invoices(status);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view company invoices" ON public.invoices;
CREATE POLICY "Users can view company invoices"
  ON public.invoices FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can manage company invoices" ON public.invoices;
CREATE POLICY "Users can manage company invoices"
  ON public.invoices FOR ALL
  USING (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ));


-- ============================================================
-- VERIFICATION — run these to confirm everything worked
-- ============================================================
SELECT column_name, column_default
FROM   information_schema.columns
WHERE  table_schema = 'public' AND table_name = 'job_bids' AND column_name = 'status';

SELECT table_name FROM information_schema.tables
WHERE  table_schema = 'public' AND table_name = 'invoices';
-- ============================================================
-- SUCCESS! Bids can now be submitted. Invoices table is ready.
-- ============================================================
```

> See [`SQL_CODE_AICI_README.md`](SQL_CODE_AICI_README.md) for a detailed explanation of what this script does.

---

## 🔧 Environment Variables

This project is a **hybrid application** and requires **TWO sets of environment variables**:
- **NEXT_PUBLIC_*** for the Next.js portal (main dashboard)
- **VITE_*** for the Vite-based landing page

All values are **public** and safe to expose in client-side code.

### Required Environment Variables

```bash
# ============================================================================
# NEXT.JS PORTAL (Dashboard/Main Application)
# ============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://jqxlauexhkonixtjvljw.supabase.co

# ANON KEY - This is the JWT token (NOT the sb_publishable_ format from Dashboard)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGxhdWV4aGtvbml4dGp2bGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTM2MzYsImV4cCI6MjA1NTI4OTYzNn0.yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO

NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ============================================================================
# VITE LANDING PAGE (Legacy landing page)
# ============================================================================
VITE_SUPABASE_URL=https://jqxlauexhkonixtjvljw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGxhdWV4aGtvbml4dGp2bGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTM2MzYsImV4cCI6MjA1NTI4OTYzNn0.yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO
```

**For Production (Netlify):**
```bash
NEXT_PUBLIC_SITE_URL=https://xdrivelogistics.co.uk
```

> **Important:** Both NEXT_PUBLIC_* and VITE_* variables must be set for the application to work correctly. The Next.js portal and Vite landing page both connect to the same Supabase project but use different variable prefixes.
> 
> **❓ Which key is the ANON KEY?** See `CONFIGURARE_CHEI_SUPABASE.md` (🇷🇴 Romanian guide) for a detailed explanation of Supabase key formats.

### Setup Instructions

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **The values are pre-configured** in `.env.example` - you can use them as-is for development

3. **For Netlify deployment:**
   - Add **ALL 5 environment variables** in Netlify Dashboard → Site Settings → Environment Variables:
     * `NEXT_PUBLIC_SUPABASE_URL`
     * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     * `NEXT_PUBLIC_SITE_URL` (use `https://xdrivelogistics.co.uk`)
     * `VITE_SUPABASE_URL`
     * `VITE_SUPABASE_ANON_KEY`
   - Set them for **ALL scopes** and **ALL deploy contexts** (Production, Deploy Previews, Branch deploys)
   - **DO NOT** mark as "Secret" - these are public client keys
   - After setting, trigger **"Clear cache and deploy"**
   - See `CONFIGURARE_CHEI_SUPABASE.md` (🇷🇴 Romanian) or `ENVIRONMENT_VARIABLES.md` (English) for detailed instructions

## 🚀 Getting Started

### Install Dependencies

```bash
npm install
```

### Development

**Landing Page (Vite):**
```bash
npm run dev
```
This starts the Vite development server on `http://localhost:5173`

**Portal Application (Next.js):**
The portal is integrated with the landing page during build. For local development with the portal, you'll need to build and run Next.js separately in the project directory.

### Build

```bash
npm run build
```

This builds both the landing page (Vite) and portal (Next.js).

### Preview Production Build

```bash
npm run preview
```

## 📚 Documentation

### Environment Variables & API Keys
- ✅ **`NETLIFY_CONFIG_COMPLETE.md`** - 🇷🇴 **Configuration Complete!** Verification & next steps
- 📋 **`POST_DEPLOYMENT_CHECKLIST.md`** - 🇷🇴 **What to do after configuring Netlify**
- 🚀 **`VALORILE_PENTRU_NETLIFY.md`** - 🇷🇴 **Valorile exacte pentru Netlify** (Ready to copy-paste!)
- 📋 **`TABEL_VALORI_NETLIFY.md`** - 🇷🇴 **Tabel rapid** cu toate cele 5 variabile
- `CONFIGURARE_CHEI_SUPABASE.md` - 🇷🇴 Complete Romanian guide for Supabase API keys (ANON KEY explained!)
- `SETARI_MEDIU_RO.md` - 🇷🇴 Romanian quick start guide for environment variables
- `ENVIRONMENT_VARIABLES.md` - Comprehensive environment setup guide (English)
- `SUPABASE_KEYS_SUMMARY.md` - Quick reference summary
- `verify-env-vars.sh` - Bash script to verify environment variables locally

### Deployment & Database
- ✅ **`NETLIFY_CONFIG_COMPLETE.md`** - Post-configuration guide
- `NETLIFY_SETUP.md` - Netlify deployment configuration
- `DATABASE_SETUP.md` - Database schema and migrations

## 🔌 Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Portal:** Next.js 15
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI, Shadcn/ui

---

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

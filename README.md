# XDrive Logistics LTD

A modern logistics and courier exchange platform built with React, TypeScript, and Supabase.

This is a hybrid application that uses **Vite** for the landing page and **Next.js** for the portal application.

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

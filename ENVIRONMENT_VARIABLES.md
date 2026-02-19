# Environment Variables Configuration for XDrive Logistics

## ⚠️ IMPORTANT: Hybrid Application - Both Next.js AND Vite

This application is a **HYBRID** system with:
- **Next.js** for the portal/dashboard (requires `NEXT_PUBLIC_*` variables)
- **Vite** for the landing page (requires `VITE_*` variables)

## Required Environment Variables - ALL 5 ARE NEEDED!

### Complete Variable List

Set these in your Netlify environment variables (or .env.local for local development):

```bash
# ============================================================================
# NEXT.JS PORTAL (Dashboard/Main Application)
# ============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://jqxlauexhkonixtjvljw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGxhdWV4aGtvbml4dGp2bGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTM2MzYsImV4cCI6MjA1NTI4OTYzNn0.yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO
NEXT_PUBLIC_SITE_URL=https://xdrivelogistics.co.uk  # Production, use http://localhost:3000 for dev

# ============================================================================
# VITE LANDING PAGE (Legacy Landing Page)
# ============================================================================
VITE_SUPABASE_URL=https://jqxlauexhkonixtjvljw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGxhdWV4aGtvbml4dGp2bGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTM2MzYsImV4cCI6MjA1NTI4OTYzNn0.yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO
```

### Why Both Sets?

| Prefix | Used By | Purpose |
|--------|---------|---------|
| `NEXT_PUBLIC_*` | Next.js Portal | Main dashboard and application features |
| `VITE_*` | Vite Landing Page | Public-facing landing/marketing page |

**⚠️ Critical:** Without BOTH sets of variables:
- Missing `NEXT_PUBLIC_*` = Portal/Dashboard won't work
- Missing `VITE_*` = Landing page won't work
- Both connect to the SAME Supabase project

## Netlify Deployment Configuration

### Step 1: Set Environment Variables in Netlify

1. Go to your Netlify site dashboard
2. Navigate to: **Site settings** → **Environment variables**
3. Add **ALL 5 variables** for **ALL deploy contexts** (Production, Deploy Previews, Branch deploys):

| Variable Name | Value | Deploy Contexts | Used By |
|--------------|-------|-----------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jqxlauexhkonixtjvljw.supabase.co` | All | Next.js Portal |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO` | All | Next.js Portal |
| `NEXT_PUBLIC_SITE_URL` | `https://xdrivelogistics.co.uk` | All | Next.js Portal |
| `VITE_SUPABASE_URL` | `https://jqxlauexhkonixtjvljw.supabase.co` | All | Vite Landing Page |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO` | All | Vite Landing Page |

**Important Settings:**
- ✅ Set for **"All scopes"**
- ✅ Set for **"All deploy contexts"**
- ❌ Do **NOT** mark as "Secret" (these are public client keys)

### Step 2: Clear Cache and Redeploy

After setting environment variables:
1. Go to **Deploys** tab
2. Click **Clear cache and deploy site**
3. This ensures the new environment variables are used

### Step 3: Verify Variables are Set

Visit `https://your-site.netlify.app/diagnostics` after deployment to verify environment variables are correctly configured.

## Local Development

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. The `.env.example` file already contains all 5 variables with correct values:
   ```bash
   # Next.js Portal variables
   NEXT_PUBLIC_SUPABASE_URL=https://jqxlauexhkonixtjvljw.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   
   # Vite Landing Page variables  
   VITE_SUPABASE_URL=https://jqxlauexhkonixtjvljw.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Build Commands

### Development
```bash
npm run dev        # Start development server on http://localhost:3000
```

### Production Build
```bash
npm run build      # Build for production
npm run start      # Start production server
```

## Common Issues

### Issue: "Missing Supabase credentials" error
**Solution**: Make sure you set ALL 5 environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for the Portal
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the Landing Page
- `NEXT_PUBLIC_SITE_URL` for authentication redirects

### Issue: Landing page works but portal doesn't (or vice versa)
**Solution**: You're missing one set of variables. Both `NEXT_PUBLIC_*` AND `VITE_*` are required.

### Issue: Environment variables not updating
**Solution**: 
1. Clear Netlify cache
2. Trigger a new deploy
3. Make sure variables are set for ALL deploy contexts

### Issue: Variables work locally but not on Netlify
**Solution**: 
1. Check that ALL 5 variables are set in Netlify dashboard
2. Make sure they're not marked as "secret" (they're public client keys)
3. Clear cache and redeploy

## About This Hybrid Application

This application uses a **hybrid architecture**:

- **Next.js Portal** (app/portal directory): The main application with authentication, dashboard, and business features
  - Requires: `NEXT_PUBLIC_*` variables
  - Build system: Next.js with `process.env.NEXT_PUBLIC_*`

- **Vite Landing Page** (legacy): The public-facing marketing/landing page
  - Requires: `VITE_*` variables  
  - Build system: Vite with `import.meta.env.VITE_*`

Both components connect to the **same Supabase project** (jqxlauexhkonixtjvljw) but use different environment variable prefixes due to their different build systems.

**Changes made:**
- Build system: Vite → Next.js
- Environment prefix: `VITE_` → `NEXT_PUBLIC_`
- Environment access: `import.meta.env.VITE_*` → `process.env.NEXT_PUBLIC_*`

All code has been updated to use the Next.js conventions.

# Environment Variables Configuration for XDrive Logistics

## ⚠️ IMPORTANT: Next.js Environment Variables (NOT Vite)

This application has been migrated from **Vite** to **Next.js**. 

## Correct Environment Variable Prefix: NEXT_PUBLIC_

### Required Environment Variables

Set these in your Netlify environment variables (or .env.local for local development):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://jqxlauexhkonixtjvljw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=https://xdrivelogistics.co.uk
```

### ❌ OLD (Vite - NO LONGER USED):
```bash
VITE_SUPABASE_URL         # ❌ WRONG - Don't use this
VITE_SUPABASE_ANON_KEY    # ❌ WRONG - Don't use this
VITE_SITE_URL             # ❌ WRONG - Don't use this
```

### ✅ NEW (Next.js - CORRECT):
```bash
NEXT_PUBLIC_SUPABASE_URL         # ✅ CORRECT
NEXT_PUBLIC_SUPABASE_ANON_KEY    # ✅ CORRECT
NEXT_PUBLIC_SITE_URL             # ✅ CORRECT
```

## Netlify Deployment Configuration

### Step 1: Set Environment Variables in Netlify

1. Go to your Netlify site dashboard
2. Navigate to: **Site settings** → **Environment variables**
3. Add the following variables for **ALL deploy contexts** (Production, Deploy Previews, Branch deploys):

| Variable Name | Value | Deploy Contexts |
|--------------|-------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jqxlauexhkonixtjvljw.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | All |
| `NEXT_PUBLIC_SITE_URL` | `https://xdrivelogistics.co.uk` (production) or your deploy preview URL | All |

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

2. Update `.env.local` with your values:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://jqxlauexhkonixtjvljw.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
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
**Solution**: Make sure you set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (NOT the old `VITE_` prefixed variables)

### Issue: Environment variables not updating
**Solution**: 
1. Clear Netlify cache
2. Trigger a new deploy
3. Make sure variables are set for ALL deploy contexts

### Issue: Variables work locally but not on Netlify
**Solution**: 
1. Check that variables are set in Netlify dashboard
2. Make sure they're not marked as "secret" (they're public client keys)
3. Clear cache and redeploy

## Migration Notes

This application was previously built with Vite and used `VITE_` prefixed environment variables accessed via `import.meta.env`.

**Changes made:**
- Build system: Vite → Next.js
- Environment prefix: `VITE_` → `NEXT_PUBLIC_`
- Environment access: `import.meta.env.VITE_*` → `process.env.NEXT_PUBLIC_*`

All code has been updated to use the Next.js conventions.

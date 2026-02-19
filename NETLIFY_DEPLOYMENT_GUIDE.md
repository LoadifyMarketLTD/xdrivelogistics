# Netlify Deployment Guide - Unified Architecture

## Overview

This project uses a **unified deployment architecture** that integrates a Vite-built landing page into a Next.js application for seamless Netlify deployment with `@netlify/plugin-nextjs`.

## Architecture

### Sequential Build Process

```
1. Vite Build:     npm run build:landing  → dist/
2. Integration:    npm run integrate:landing → copy dist/* to public/
3. Next.js Build:  npm run build:portal   → .next/
4. Deploy:         Netlify deploys .next/ with plugin
```

### Result

- **/** → Landing page (Vite SPA loaded dynamically from public/)
- **/login, /dashboard/\*** → Next.js SSR portal routes
- **/api/\*** → Next.js API routes

## Netlify Configuration

### netlify.toml

```toml
[build]
  command = "npm run build:all"
  # No publish directive - @netlify/plugin-nextjs handles deployment

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

**Important:**
- ❌ Do NOT set `publish` directive - conflicts with Next.js plugin
- ❌ Do NOT add manual `[[redirects]]` - plugin handles routing
- ✅ Plugin requires exclusive deployment control

### Netlify Environment Variables

Set these in your Netlify site settings (not secrets, they're public keys):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app

# Optional: Also support Vite prefix for the landing page
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Build Scripts

### package.json

```json
{
  "scripts": {
    "build": "npm run build:all",
    "build:landing": "tsc -b tsconfig.app.json && vite build",
    "build:portal": "next build",
    "integrate:landing": "bash scripts/integrate-landing.sh",
    "build:all": "npm run build:landing && npm run integrate:landing && npm run build:portal"
  }
}
```

### scripts/integrate-landing.sh

This script copies the Vite build output from `dist/` to Next.js `public/` directory, preserving the `_redirects` file if it exists.

## Technical Details

### TypeScript Configuration

- **tsconfig.json** - Next.js configuration (app/, lib/, components/)
- **tsconfig.app.json** - Vite configuration (src/)
- Path alias `@/*` points to root for Next.js compatibility

### Environment Variables

The `lib/supabaseClient.ts` file supports both:
- **Vite**: `import.meta.env.VITE_*`
- **Next.js**: `process.env.NEXT_PUBLIC_*`

This allows the Supabase client to work in both environments.

### Landing Page Integration

The root page (`app/page.tsx`) dynamically loads the Vite landing page by:
1. Fetching `/index.html` at runtime
2. Extracting CSS and JS asset paths
3. Dynamically injecting them into the page

This approach is cache-friendly and works with Vite's content-hashed filenames.

## Build Artifacts

The following are build outputs and should NOT be committed:

```
dist/               # Vite build output
.next/              # Next.js build output
public/index.html   # Copied from dist/
public/assets/      # Copied from dist/
```

These are listed in `.gitignore`.

## Deployment Steps

### First-Time Setup

1. **Connect Repository to Netlify**
   - Go to Netlify Dashboard
   - Click "New site from Git"
   - Select GitHub and the repository

2. **Configure Build Settings**
   - Build command: `npm run build:all`
   - Publish directory: Leave empty (plugin handles it)
   - Node version: 20 or higher (>=20.0.0)

3. **Add Environment Variables**
   - Go to Site settings → Environment variables
   - Add the variables listed above

4. **Enable Plugin** (auto-configured from netlify.toml)
   - The `@netlify/plugin-nextjs` will be installed automatically

5. **Deploy**
   - Trigger a deploy from Git push or manual deploy

### Subsequent Deployments

Simply push to your branch - Netlify will automatically:
1. Run `npm install`
2. Run `npm run build:all`
3. Deploy via `@netlify/plugin-nextjs`

## Troubleshooting

### Build Fails at Vite Step

- Check that `src/` files are valid TypeScript
- Run `npm run build:landing` locally to debug

### Build Fails at Next.js Step

- Check that `app/` files are valid
- Ensure environment variables are set (or use placeholders)
- Run `npm run build:portal` locally to debug

### Landing Page Doesn't Load

- Check browser console for asset loading errors
- Verify `/index.html` is accessible
- Check that `public/assets/` contains the Vite build files

### Portal Routes Don't Work

- Check Netlify function logs for Next.js SSR errors
- Verify Supabase environment variables are set
- Check middleware.ts for authentication issues

## Local Development

```bash
# Install dependencies
npm install

# Run Vite landing page dev server
npm run dev

# Build everything
npm run build

# Test production build locally
npm run build && npx next start
```

## Success Criteria

✅ Vite build completes successfully  
✅ Integration script copies files to public/  
✅ Next.js build completes with all pages  
✅ Netlify deploy succeeds with green checks  
✅ Landing page loads at /  
✅ Portal routes work (/login, /dashboard, etc.)  
✅ No conflicting configuration errors

## Support

For issues with this deployment setup, check:
- Netlify deploy logs
- Browser console for client-side errors
- Netlify function logs for SSR errors

---

**Last Updated:** February 2026  
**Architecture:** Unified Vite + Next.js with @netlify/plugin-nextjs

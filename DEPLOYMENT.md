# XDrive Logistics - Deployment Guide

## Framework: VITE (React + TypeScript)

This is a **Vite-based React application** serving as the marketing landing page for XDrive Logistics.

### Evidence:
- ✅ `index.html` present in root
- ✅ `vite.config.ts` configuration file
- ✅ Entry point: `src/main.tsx`
- ✅ Build command uses Vite: `npm run build`
- ✅ Output directory: `dist/`

**Note**: The `app/` directory contains a legacy Next.js portal application that is NOT currently being built or deployed.

## Netlify Configuration

### Build Settings

Set these in Netlify UI → Site Settings → Build & Deploy:

```
Base directory: (leave empty)
Build command: npm run build
Publish directory: dist
```

### netlify.toml (Already Configured)

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

The redirect rule ensures all routes fall back to `index.html` for SPA routing.

### Plugins

**IMPORTANT**: Do NOT use the Next.js plugin!
- Ensure `@netlify/plugin-nextjs` is NOT installed
- This is a Vite/React SPA, not a Next.js app

## Environment Variables

### Current App (Marketing Landing Page)

The current Vite build in `src/` is a **marketing landing page** that does NOT require any environment variables. It doesn't connect to Supabase or any backend services.

**Required Netlify Environment Variables**: NONE

### Future Portal Integration

If you plan to integrate the portal app (currently in `app/` directory), you will need:

For Vite apps, use `VITE_` prefix:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SITE_URL=https://xdrivelogistics.co.uk
```

For Next.js apps, use `NEXT_PUBLIC_` prefix:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://xdrivelogistics.co.uk
```

## Build Process

### Local Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm install
npm run build
npm run preview  # Test production build locally
```

### Build Output
- ✅ Successful build creates `dist/` directory
- ✅ Single-page application with client-side routing
- ✅ All assets bundled and optimized

## Pages & Features

Current marketing site includes:
- ✅ Landing page with hero section
- ✅ Services overview
- ✅ How it works
- ✅ Benefits
- ✅ Testimonials
- ✅ Call to action
- ✅ Login modal (UI only, no authentication yet)

## Deployment Checklist

- [x] Framework detected: Vite
- [x] netlify.toml configured correctly
- [x] Build command: `npm run build`
- [x] Publish directory: `dist`
- [x] SPA fallback redirect configured
- [x] No Next.js plugin enabled
- [x] Environment variables: None required
- [x] Build passes locally
- [x] Accessibility issues fixed
- [x] No runtime errors

## Known Issues (Non-Blocking)

1. ESLint warnings in `src/` directory (fast-refresh rules)
   - These are warnings only and don't affect build or runtime
   - Primarily about exporting constants alongside components
   
2. TypeScript/ESLint errors in `app/` directory
   - Not relevant as this directory is not being built
   - Legacy Next.js portal code

## Verification

After deployment to Netlify:
1. Site should load at your Netlify URL
2. Navigation should work smoothly
3. Login modal should open and close properly
4. No console errors in browser DevTools
5. All images and assets should load

## Support

For issues or questions:
- Check Netlify build logs
- Verify netlify.toml matches above configuration
- Ensure no plugins are interfering with build
- Contact: 07423 272138

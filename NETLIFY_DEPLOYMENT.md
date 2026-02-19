# XDrive Logistics - Netlify Deployment Guide

## 🏗️ Hybrid Build Architecture

This project uses a **hybrid build system** combining:
- **Vite** for the public landing page (`src/` → `dist/`)
- **Next.js App Router** for the authenticated portal (`app/` → `.next/`)

## 📦 Build Process

### Local Development

```bash
# Install dependencies
npm install

# Development servers
npm run dev          # Vite landing page (port 5173)
npm run dev:portal   # Next.js portal (port 3000)
```

### Production Build

```bash
# Set environment variables
export VITE_SUPABASE_URL=https://jqxlauexhkonixtjvljw.supabase.co
export VITE_SUPABASE_ANON_KEY=your_anon_key
export VITE_SITE_URL=https://xdrivelogistics.co.uk

# Build both applications
npm run build:all

# Verify outputs
ls -la dist/   # Vite landing page
ls -la .next/  # Next.js portal
```

## 🌐 Netlify Deployment

### Configuration (`netlify.toml`)

```toml
[build]
  command = "npm run build:all"
  publish = "dist"
  
[[plugins]]
  package = "@netlify/plugin-nextjs"
  [plugins.inputs]
    publish = ".next"
```

### How It Works

1. **Build Phase**:
   - Netlify runs `npm run build:all`
   - Vite builds landing page → `dist/`
   - Next.js builds portal → `.next/`

2. **Deploy Phase**:
   - Landing page published from `dist/` (static assets)
   - Next.js portal converted to serverless functions by `@netlify/plugin-nextjs`

3. **Runtime Routing**:
   - **`/`** and public routes → Static files from `dist/`
   - **`/login`, `/dashboard/*`, `/api/*`** → Next.js serverless functions
   - **`/*` (fallback)** → Landing page SPA (`/index.html`)

### Route Mapping

| Route Pattern | Handler | Purpose |
|---------------|---------|---------|
| `/` | `dist/index.html` | Landing page |
| `/login` | Next.js function | Authentication |
| `/register` | Next.js function | User registration |
| `/dashboard/*` | Next.js function | Portal dashboard |
| `/api/*` | Next.js function | API endpoints |
| `/jobs/*` | Next.js function | Job management |
| `/loads/*` | Next.js function | Load management |
| `/invoices/*` | Next.js function | Billing |
| `/*` (other) | `dist/index.html` | Landing SPA fallback |

## 🔐 Environment Variables

### Required Variables (Set in Netlify Dashboard)

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://jqxlauexhkonixtjvljw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...  # Your anon key
VITE_SITE_URL=https://xdrivelogistics.co.uk

# Optional: Next.js alternatives (auto-mapped in next.config.js)
NEXT_PUBLIC_SUPABASE_URL=https://jqxlauexhkonixtjvljw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

**Note**: The `VITE_*` variables are automatically mapped to `NEXT_PUBLIC_*` in `next.config.js` for Next.js compatibility.

### Variable Mapping

```javascript
// next.config.js
env: {
  NEXT_PUBLIC_SUPABASE_URL: 
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
}
```

## 🚨 Troubleshooting

### Build Fails

1. **Clear Netlify build cache**:
   - Go to Netlify Dashboard
   - Site Settings → Build & Deploy → Environment
   - Click "Clear build cache and deploy site"

2. **Check environment variables**:
   - Verify all `VITE_*` variables are set
   - Ensure they're available for all deploy contexts (Production, Branch, Deploy Previews)

3. **Review build logs**:
   - Look for TypeScript errors
   - Check for missing dependencies
   - Verify both `dist/` and `.next/` are created

### Deployment Fails

1. **Plugin issues**:
   - Ensure `@netlify/plugin-nextjs` is in `devDependencies`
   - Version should be `^5.15.8` or later

2. **Redirect conflicts**:
   - Check `netlify.toml` redirects are not conflicting
   - Ensure `force = true` is set for portal routes

3. **Function errors**:
   - Check Netlify function logs
   - Verify Next.js SSR is working
   - Test serverless functions individually

### Runtime Issues

1. **Landing page not loading**:
   - Check `dist/index.html` exists
   - Verify static assets are in `dist/`
   - Test SPA fallback with non-existent routes

2. **Portal routes 404**:
   - Verify Next.js functions are deployed
   - Check function logs for errors
   - Test `/login` and `/dashboard` specifically

3. **Environment variables not working**:
   - Rebuild to pick up new env vars
   - Clear cache before rebuilding
   - Check browser console for credential errors

## 📊 Deployment Checklist

- [ ] All dependencies installed (`package.json`)
- [ ] Environment variables set in Netlify
- [ ] Build command is `npm run build:all`
- [ ] Publish directory is `dist`
- [ ] `@netlify/plugin-nextjs` is configured
- [ ] All redirects are defined in `netlify.toml`
- [ ] Test locally with `npm run build:all`
- [ ] Clear Netlify cache before deploying
- [ ] Monitor build logs for errors
- [ ] Test all routes after deployment

## 🎯 Expected Build Output

```
dist/
├── index.html           # Landing page entry
├── assets/
│   ├── index-[hash].js  # Bundled JavaScript
│   └── index-[hash].css # Bundled CSS
├── logo.png
└── ... (other static assets)

.next/
├── BUILD_ID
├── app-build-manifest.json
├── static/
├── server/
└── ... (Next.js output)
```

## 📝 Additional Notes

- TypeScript checking is disabled for landing build to speed up deployment
- Next.js portal still has full TypeScript support with `ignoreBuildErrors: true`
- Both builds use the same `node_modules/` for efficiency
- Landing page uses Vite's fast HMR during development
- Portal uses Next.js's file-based routing and SSR

## 🔗 Useful Links

- [Netlify Next.js Plugin Docs](https://github.com/netlify/netlify-plugin-nextjs)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)

---

**Last Updated**: 2026-02-19  
**Deployment Status**: ✅ Working with hybrid build configuration

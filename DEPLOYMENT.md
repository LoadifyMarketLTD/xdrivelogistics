# XDrive Logistics - Deployment Guide

## Framework: Next.js (App Router)

This is a **Next.js application** serving both the marketing landing page and the portal for XDrive Logistics.

### Architecture
- **`app/(marketing)/`** – Marketing landing page components
- **`app/(portal)/`** – Authenticated portal routes
- **`app/page.tsx`** – Root page (renders landing page)
- **`app/api/`** – API routes

## Netlify Configuration

### Build Settings

The `netlify.toml` is already configured:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Netlify Environment Variables

Set these in your Netlify site settings:

```bash
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
npm run start  # Test production build locally
```

### Build Output
- ✅ Successful build creates `.next/` directory
- ✅ Served by `@netlify/plugin-nextjs` on Netlify

## Pages & Features

- ✅ Landing page (`/`) with hero, services, how-it-works, benefits, testimonials
- ✅ Portal routes (`/login`, `/dashboard/*`, etc.)
- ✅ API routes (`/api/*`)

## TypeScript Configuration

A single `tsconfig.json` covers the entire project:
- `app/**/*` – Next.js app router pages and layouts
- `lib/**/*` – Shared utilities and Supabase client
- `components/**/*` – Shared UI components
- `middleware.ts` – Auth middleware

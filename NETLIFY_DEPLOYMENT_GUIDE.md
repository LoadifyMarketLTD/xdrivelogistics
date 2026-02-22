# Netlify Deployment Guide

## Overview

This project uses Next.js (App Router) and is deployed on Netlify using `@netlify/plugin-nextjs`.

## Architecture

- **`/`** – Marketing landing page (Next.js SSR/SSG)
- **`/login`, `/dashboard/*`** – Next.js portal routes
- **`/api/*`** – Next.js API routes

## Netlify Configuration

### netlify.toml

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Netlify Environment Variables

Set these in your Netlify site settings (not secrets — they are public keys):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
```

## Build Scripts

### package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint ."
  }
}
```

## TypeScript Configuration

A single `tsconfig.json` configured for Next.js covers the entire project.

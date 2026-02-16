# Old Static Site (DEPRECATED)

⚠️ **This directory contains the old static HTML site and is no longer used.**

## Migration Completed

The site has been migrated to Next.js with Supabase authentication. The new application is located in the `/app` directory.

### What's in this directory:

- `index.html` - Old public homepage (now replaced by `app/page.tsx`)
- `dashboard/` - Old dashboard with hardcoded authentication (now replaced by `app/dashboard/page.tsx`)

### Security Note

The old `dashboard/dashboard.js` file contained hardcoded passwords for client-side authentication. This was **NOT secure** and has been replaced with proper server-backed Supabase authentication.

**Do not use these files in production.**

### New Structure

- Public site: `app/page.tsx` (served at `/`)
- Login page: `app/login/page.tsx` (served at `/login`)
- Dashboard: `app/dashboard/page.tsx` (served at `/dashboard` - protected)
- Forgot password: `app/forgot-password/page.tsx`
- Reset password: `app/reset-password/page.tsx`

All authentication is now handled by Supabase Auth with proper session management.

# XDrive Portal Screenshots

This directory contains authenticated UI screenshots of the XDrive portal for visual verification and documentation purposes.

## Capture Information

**Date**: 2026-02-17  
**Time**: 15:16 UTC  
**Branch**: `copilot/cleanup-xdrive-portal-ui`  
**Build Status**: Production build successful (0 errors, 0 warnings)  
**Authentication**: Authenticated screenshots using real Supabase session  

## Environment

**Supabase Project**: Production environment  
**Application URL**: http://localhost:3000 (local build)  
**Authentication Method**: Manual login via Playwright browser  

## Screenshot Files

### Desktop (1440x900)
- `desktop-login.png` - Login page (unauthenticated)
- `desktop-dashboard.png` - Dashboard with real metrics (authenticated)
- `desktop-loads.png` - Loads page with filters and list (authenticated)
- `desktop-directory.png` - Company directory with search (authenticated)

### Mobile (390x844 - iPhone 12 size)
- `mobile-login.png` - Login page mobile view
- `mobile-dashboard.png` - Dashboard mobile view
- `mobile-loads.png` - Loads page mobile view
- `mobile-directory.png` - Directory page mobile view

## Design Verification

All screenshots confirm:
- ✅ Flat enterprise design (CX-style)
- ✅ 220px dark sidebar (#1f2937)
- ✅ Gold accent color (#d4af37)
- ✅ 1px solid borders
- ✅ Table/list-based layouts (NO card grids)
- ✅ No marketing content
- ✅ No rounded SaaS UI elements
- ✅ Real Supabase data displayed

## Capture Process

Screenshots were captured using Playwright automation with manual authentication:

1. Production build created: `npm run build`
2. Application started: `npm start`
3. Playwright browser launched in headed mode
4. Manual login performed in browser
5. Session cookies preserved
6. Screenshots captured at both desktop and mobile viewports
7. Full-page captures (includes all scrollable content)

## Security Note

**NO credentials are stored in this repository.**  
Authentication was performed manually in the Playwright browser using environment-secured credentials.

## Usage

To capture new screenshots:

```bash
# Install dependencies
npm ci

# Build the application
npm run build

# Start the production server (in one terminal)
npm start

# Run the screenshot script (in another terminal)
npx ts-node scripts/capture-screenshots.ts

# Follow the prompts to authenticate manually
```

The script will:
1. Open a browser window
2. Navigate to the login page
3. Pause for manual authentication
4. Capture all screenshots after confirmation
5. Save to this directory

---

**Last Updated**: 2026-02-17 15:16 UTC

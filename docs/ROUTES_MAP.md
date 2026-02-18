# XDrive Logistics - Complete Route Map

Generated: 2026-02-17

## Route Structure

| Route Path | File | Type | Auth Required | Has Loading | Has Error | Notes |
|------------|------|------|---------------|-------------|-----------|-------|
| `/` | app/page.tsx | Landing | No | No | No | Redirects to portal/login |
| `/login` | app/login/page.tsx | Auth | No | No | No | Login form |
| `/register` | app/register/page.tsx | Auth | No | No | No | Registration form |
| `/forgot-password` | app/forgot-password/page.tsx | Auth | No | No | No | Password reset request |
| `/reset-password` | app/reset-password/page.tsx | Auth | No | No | No | Password reset form |
| `/onboarding` | app/onboarding/page.tsx | Onboarding | Yes | No | No | Choose company/driver path |
| `/onboarding/company` | app/onboarding/company/page.tsx | Onboarding | Yes | No | No | Company onboarding |
| `/onboarding/driver` | app/onboarding/driver/page.tsx | Onboarding | Yes | No | No | Driver onboarding |
| `/dashboard` | app/(portal)/dashboard/page.tsx | Portal | Yes | No | No | Main dashboard with stats |
| `/loads` | app/(portal)/loads/page.tsx | Portal | Yes | No | No | Available loads listing |
| `/quotes` | app/(portal)/quotes/page.tsx | Portal | Yes | No | No | Quotes/bids management |
| `/diary` | app/(portal)/diary/page.tsx | Portal | Yes | No | No | Calendar view of jobs |
| `/directory` | app/(portal)/directory/page.tsx | Portal | Yes | No | No | Company directory |
| `/drivers-vehicles` | app/(portal)/drivers-vehicles/page.tsx | Portal | Yes | No | No | Fleet management |
| `/my-fleet` | app/(portal)/my-fleet/page.tsx | Portal | Yes | No | No | Vehicle fleet view |
| `/live-availability` | app/(portal)/live-availability/page.tsx | Portal | Yes | No | No | Available vehicles |
| `/return-journeys` | app/(portal)/return-journeys/page.tsx | Portal | Yes | No | No | Return trip optimization |
| `/freight-vision` | app/(portal)/freight-vision/page.tsx | Portal | Yes | No | No | Analytics dashboard |
| `/company/settings` | app/company/settings/page.tsx | Settings | Yes | No | No | Company profile settings |
| `/jobs/new` | app/jobs/new/page.tsx | Job Creation | Yes | No | No | Create new job/load |
| `/diagnostics` | app/diagnostics/page.tsx | Debug | Yes | No | No | System diagnostics |

## Layouts

| Path | File | Purpose |
|------|------|---------|
| Root | app/layout.tsx | Root layout with AuthProvider |
| Portal | app/(portal)/layout.tsx | Portal layout with sidebar navigation |

## Dynamic Routes

None currently - all routes are static

## Missing Files

- ❌ No custom `loading.tsx` files (using default Next.js loading)
- ❌ No custom `error.tsx` files (using default Next.js error boundary)
- ❌ No `not-found.tsx` files (using default 404)

## Route Groups

- `(portal)` - Protected portal pages with sidebar layout
- No route group - Public pages (auth, landing)

## Auth Protection

All routes under `(portal)` and `/company/*`, `/jobs/*`, `/onboarding/*` require authentication via AuthContext.
Auth checks are handled in:
1. Root layout (AuthProvider wrapper)
2. Portal layout (redirect if no user/companyId)
3. Individual pages (useEffect checks)

## Total Routes: 23

- Public: 5 (login, register, forgot-password, reset-password, landing)
- Protected Portal: 11 (dashboard, loads, quotes, diary, directory, drivers-vehicles, my-fleet, live-availability, return-journeys, freight-vision, diagnostics)
- Protected Other: 4 (company/settings, jobs/new, onboarding, onboarding/company, onboarding/driver)
- Layouts: 2 (root, portal)

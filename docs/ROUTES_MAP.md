# COMPLETE ROUTE MAP - XDrive Logistics

**Generated:** 2026-02-17  
**Total Routes:** 23 pages + 2 layouts

---

## PUBLIC ROUTES (No Authentication Required)

### Landing Page
| Route | File | Has Loading | Has Error | Has Not-Found | Protected | Notes |
|-------|------|-------------|-----------|---------------|-----------|-------|
| `/` | `app/page.tsx` | ❌ | ❌ | ❌ | ❌ | Public landing page |

### Authentication Routes
| Route | File | Has Loading | Has Error | Has Not-Found | Protected | Notes |
|-------|------|-------------|-----------|---------------|-----------|-------|
| `/login` | `app/login/page.tsx` | ❌ | ❌ | ❌ | ❌ | Login page |
| `/register` | `app/register/page.tsx` | ❌ | ❌ | ❌ | ❌ | Registration page |
| `/forgot-password` | `app/forgot-password/page.tsx` | ❌ | ❌ | ❌ | ❌ | Password recovery |
| `/reset-password` | `app/reset-password/page.tsx` | ❌ | ❌ | ❌ | ❌ | Password reset |

### Onboarding Routes (Requires Authentication)
| Route | File | Has Loading | Has Error | Has Not-Found | Protected | Notes |
|-------|------|-------------|-----------|---------------|-----------|-------|
| `/onboarding` | `app/onboarding/page.tsx` | ❌ | ❌ | ❌ | ✅ User Only | Onboarding start |
| `/onboarding/company` | `app/onboarding/company/page.tsx` | ❌ | ❌ | ❌ | ✅ User Only | Company setup |
| `/onboarding/driver` | `app/onboarding/driver/page.tsx` | ❌ | ❌ | ❌ | ✅ User Only | Driver profile setup |

### Diagnostics
| Route | File | Has Loading | Has Error | Has Not-Found | Protected | Notes |
|-------|------|-------------|-----------|---------------|-----------|-------|
| `/diagnostics` | `app/diagnostics/page.tsx` | ❌ | ❌ | ❌ | ❌ | System diagnostics |

---

## PORTAL ROUTES (Requires User + Company)

**All routes in (portal) group require:**
- ✅ Authenticated user
- ✅ Company profile completed (companyId present)
- Protected by: `app/(portal)/layout.tsx`

**Layout:** `app/(portal)/layout.tsx` - Portal wrapper with auth checks and sidebar

### Core Portal Pages
| Route | File | Has Loading | Has Error | Has Not-Found | In Sidebar | Notes |
|-------|------|-------------|-----------|---------------|------------|-------|
| `/dashboard` | `app/(portal)/dashboard/page.tsx` | ❌ | ❌ | ❌ | ✅ | Main dashboard |
| `/loads` | `app/(portal)/loads/page.tsx` | ❌ | ❌ | ❌ | ✅ | Loads marketplace |
| `/quotes` | `app/(portal)/quotes/page.tsx` | ❌ | ❌ | ❌ | ✅ | Quotes management |
| `/directory` | `app/(portal)/directory/page.tsx` | ❌ | ❌ | ❌ | ✅ | Company directory |
| `/drivers-vehicles` | `app/(portal)/drivers-vehicles/page.tsx` | ❌ | ❌ | ❌ | ✅ | Drivers & vehicles |
| `/my-fleet` | `app/(portal)/my-fleet/page.tsx` | ❌ | ❌ | ❌ | ❌ | Fleet management |
| `/live-availability` | `app/(portal)/live-availability/page.tsx` | ❌ | ❌ | ❌ | ❌ | Real-time availability |
| `/freight-vision` | `app/(portal)/freight-vision/page.tsx` | ❌ | ❌ | ❌ | ❌ | Analytics dashboard |
| `/diary` | `app/(portal)/diary/page.tsx` | ❌ | ❌ | ❌ | ❌ | Calendar/scheduling |
| `/return-journeys` | `app/(portal)/return-journeys/page.tsx` | ❌ | ❌ | ❌ | ❌ | Return journey planning |

---

## COMPANY & JOB ROUTES (Requires User + Company)

| Route | File | Has Loading | Has Error | Has Not-Found | In Sidebar | Notes |
|-------|------|-------------|-----------|---------------|------------|-------|
| `/company/settings` | `app/company/settings/page.tsx` | ❌ | ❌ | ❌ | ✅ | Company configuration |
| `/jobs/new` | `app/jobs/new/page.tsx` | ❌ | ❌ | ❌ | ❌ | Create new job posting |

---

## LAYOUT HIERARCHY

```
app/layout.tsx (Root - AuthProvider wrapper)
├── app/page.tsx (Public landing)
├── app/login/page.tsx (Public auth)
├── app/register/page.tsx (Public auth)
├── app/forgot-password/page.tsx (Public auth)
├── app/reset-password/page.tsx (Public auth)
├── app/diagnostics/page.tsx (Public utility)
├── app/onboarding/page.tsx (Semi-protected)
├── app/onboarding/company/page.tsx (Semi-protected)
├── app/onboarding/driver/page.tsx (Semi-protected)
├── app/(portal)/layout.tsx (Protected Portal Layout)
│   ├── app/(portal)/dashboard/page.tsx
│   ├── app/(portal)/loads/page.tsx
│   ├── app/(portal)/quotes/page.tsx
│   ├── app/(portal)/directory/page.tsx
│   ├── app/(portal)/drivers-vehicles/page.tsx
│   ├── app/(portal)/my-fleet/page.tsx
│   ├── app/(portal)/live-availability/page.tsx
│   ├── app/(portal)/freight-vision/page.tsx
│   ├── app/(portal)/diary/page.tsx
│   └── app/(portal)/return-journeys/page.tsx
├── app/company/settings/page.tsx (Protected, outside portal group)
└── app/jobs/new/page.tsx (Protected, outside portal group)
```

---

## DYNAMIC ROUTE SEGMENTS

**None detected** - All routes are static paths.

---

## MISSING ROUTE FILES

### No loading.tsx files found
- Recommendation: Add loading states for portal pages that fetch data

### No error.tsx files found
- Recommendation: Add error boundaries for better error handling

### No not-found.tsx files found
- Recommendation: Add custom 404 pages at route group levels

---

## AUTHENTICATION FLOW

1. **Public Access:**
   - `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/diagnostics`

2. **User Authenticated (No Company):**
   - Redirect to `/onboarding/company`
   - Can access: `/onboarding`, `/onboarding/company`, `/onboarding/driver`

3. **User + Company Authenticated:**
   - Full portal access
   - All routes in `(portal)` group
   - `/company/settings`, `/jobs/new`

4. **Protection Logic:**
   - Implemented in: `app/(portal)/layout.tsx`
   - Checks: `user` AND `companyId` from AuthContext
   - Redirects unauthenticated → `/login`
   - Redirects no company → `/onboarding/company`

---

## NOTES

- **Route Groups:** Using `(portal)` for protected pages (doesn't affect URL)
- **Auth Context:** Global auth state via `@/lib/AuthContext`
- **Supabase:** Authentication provider
- **Redirect Strategy:** Layout-level protection (not middleware)
- **Loading States:** Currently shows inline "Loading portal..." text during auth checks

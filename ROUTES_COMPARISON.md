# Route Comparison: Before vs After Cleanup

## Before Cleanup (26 routes)

```
✓ /
✓ /_not-found
✓ /company/settings
✓ /dashboard
✓ /diagnostics
✓ /diary
✓ /directory
✗ /directory-demo          ← REMOVED
✓ /drivers-vehicles
✓ /forgot-password
✓ /freight-vision
✗ /jobs/new                ← REMOVED
✓ /live-availability
✓ /loads
✓ /login
✗ /marketplace             ← REMOVED
✗ /marketplace/[id]        ← REMOVED
✓ /my-fleet
✓ /onboarding
✓ /onboarding/company
✓ /onboarding/driver
✗ /portal-demo             ← REMOVED
✓ /quotes
✓ /register
✓ /reset-password
✓ /return-journeys
```

**Total: 26 routes (5 removed)**

---

## After Cleanup (21 routes)

```
✓ /                        - Home page
✓ /_not-found              - 404 page
✓ /company/settings        - Company settings
✓ /dashboard               - Main dashboard
✓ /diagnostics             - Diagnostics page
✓ /diary                   - Calendar & diary
✓ /directory               - Company directory
✓ /drivers-vehicles        - Driver & vehicle management
✓ /forgot-password         - Password recovery
✓ /freight-vision          - Analytics dashboard
✓ /live-availability       - Live availability view
✓ /loads                   - Load management
✓ /login                   - User login
✓ /my-fleet                - Fleet management
✓ /onboarding              - Initial onboarding
✓ /onboarding/company      - Company onboarding
✓ /onboarding/driver       - Driver onboarding
✓ /quotes                  - Quote management
✓ /register                - User registration
✓ /reset-password          - Password reset
✓ /return-journeys         - Return journey management
```

**Total: 21 routes (all approved)**

---

## Removed Routes (5)

| Route | Reason | Replacement |
|-------|--------|-------------|
| `/marketplace` | Legacy marketplace listing page | Use `/loads` instead |
| `/marketplace/[id]` | Legacy job detail page | Load detail view TBD |
| `/portal-demo` | Demo/prototype page | Removed - not needed |
| `/directory-demo` | Demo/prototype page | Use `/directory` instead |
| `/jobs/new` | Legacy job posting page | Job posting via `/loads` TBD |

---

## Route Categories

### 🏠 Public Routes (1)
- `/` - Home page

### 🔐 Authentication Routes (4)
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`

### 📋 Onboarding Routes (3)
- `/onboarding`
- `/onboarding/company`
- `/onboarding/driver`

### 🚛 Portal Routes (12)
- `/dashboard`
- `/directory`
- `/live-availability`
- `/my-fleet`
- `/return-journeys`
- `/loads`
- `/quotes`
- `/diary`
- `/freight-vision`
- `/drivers-vehicles`
- `/company/settings`
- `/diagnostics`

### 🔧 System Routes (1)
- `/_not-found`

---

## Route Access Control

All routes follow these access patterns:

### Public Access
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Password recovery
- `/reset-password` - Password reset

### Authenticated Only
- All portal routes (12 routes)
- All onboarding routes (3 routes)
- Company settings

### Protected by Layout
Portal routes are wrapped in `(portal)` layout group which:
- ✅ Checks authentication
- ✅ Validates company association
- ✅ Redirects to login if not authenticated
- ✅ Redirects to onboarding if no company
- ✅ Wraps in PortalShell component

---

## URL Changes Impact

### Broken URLs (Intentional)
These URLs will now return 404:
- `/marketplace` → 404
- `/marketplace/*` → 404
- `/portal-demo` → 404
- `/directory-demo` → 404
- `/jobs/new` → 404

### Migration Path
Users should be directed to:
- `/marketplace` users → `/loads`
- `/portal-demo` users → `/dashboard`
- `/directory-demo` users → `/directory`
- `/jobs/new` users → `/loads` (posting TBD)

---

## Navigation Updates

### Removed Navigation Items
- "Loads" no longer links to `/marketplace`
- "POST LOAD" button removed from EnterpriseHeader
- "Browse Exchange" button removed
- "Back to Marketplace" removed from QuickActions

### Active Navigation Items
All portal tabs remain functional:
- Dashboard → `/dashboard`
- Directory → `/directory`
- Live Availability → `/live-availability`
- My Fleet → `/my-fleet`
- Return Journeys → `/return-journeys`
- Loads → `/loads`
- Quotes → `/quotes`
- Diary → `/diary`
- Freight Vision → `/freight-vision`
- Drivers & Vehicles → `/drivers-vehicles`

---

## Final Verification

✅ All 21 routes build successfully  
✅ No broken internal links  
✅ No 404s during navigation  
✅ All portal pages accessible when authenticated  
✅ Authentication flow works correctly  
✅ Onboarding flow works correctly  

---

**Last Updated:** February 17, 2026  
**Build Version:** Next.js 16.1.6  
**Total Active Routes:** 21

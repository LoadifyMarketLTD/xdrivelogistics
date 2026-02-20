# Audit Changelog

Branch: `copilot/audit-compliance-check`

---

## Commit: `3b49a71` — "Fix bid submit constraint error, add OG metadata, create missing account routes"

### Changes

#### FIX: Bid submission DB constraint violation
- **File:** `app/(portal)/loads/page.tsx`
- **Why:** Production Supabase DB has `CHECK (bid_price_gbp > 0)` constraint. UI only wrote `amount_gbp`, leaving `bid_price_gbp` at its `0` default → constraint violation on every insert.
- **What changed:**
  - Added `bid_price_gbp: numericBid` to `.insert()` payload (line 332)
  - Added second NaN/zero guard with `Number()` cast (lines 319–323)
  - Added `min="0.01"` + `placeholder` on bid amount `<input>` (line 707)

#### FIX: OpenGraph metadata for Netlify preview
- **File:** `app/layout.tsx`
- **Why:** No OG tags existed → Netlify preview thumbnail rendered blank/white.
- **What changed:**
  - Added `metadataBase: new URL('https://xdrivelogistics.co.uk')`
  - Added full `openGraph` block: title, description, url, siteName, og:image (1200×630)
  - Added `twitter` card metadata
- **File:** `public/og-image.png` — created (copy of logo.png as baseline)

#### NEW: Account section pages (10 pages)
- `app/(portal)/account/get-started/page.tsx` — 6-step onboarding wizard cards
- `app/(portal)/account/company-profile/page.tsx` — company details editor + verification badge
- `app/(portal)/account/business-docs/page.tsx` — document upload + expiry status tracking
- `app/(portal)/account/users-drivers/page.tsx` — link to drivers-vehicles
- `app/(portal)/account/company-vehicles/page.tsx` — link to my-fleet
- `app/(portal)/account/vehicle-tracking/page.tsx` — Coming Soon placeholder
- `app/(portal)/account/mobile-accounts/page.tsx` — Coming Soon placeholder
- `app/(portal)/account/notifications/page.tsx` — Coming Soon placeholder
- `app/(portal)/account/settings/page.tsx` — profile editor (full_name, phone) + password reset
- `app/(portal)/account/feedback/page.tsx` — star rating + message feedback form

#### NEW: Route aliases
- `app/(portal)/availability/page.tsx` — server redirect → `/live-availability`
- `app/(portal)/fleet/page.tsx` — server redirect → `/my-fleet`

#### FIX: Nav config — role visibility
- **File:** `config/nav.ts`
- **Why:** Directory only visible to brokers; Return Journeys only to drivers. CX module list requires these accessible to all roles.
- **What changed:**
  - `Directory`: `allowedRoles` changed from `['broker']` → `['driver', 'broker', 'company']`
  - `Return Journeys`: `allowedRoles` changed from `['driver']` → `['driver', 'broker', 'company']`
  - `Post Load`: `allowedRoles` changed from `['broker']` → `['broker', 'company']` (companies also post loads)
  - Added `section` field to all nav items (`'main'` | `'account'`)
  - Added 4 account-section nav items

#### FIX: Sidebar renders account section
- **File:** `components/layout/PortalLayout.tsx`
- **Why:** Sidebar needed to render account nav items as a separate labeled group.
- **What changed:**
  - Split `visibleNavItems` into `section !== 'account'` (main) and `section === 'account'` (account)
  - Added "ACCOUNT" divider label between sections

---

## Audit Actions (this commit)

- **File:** `AUDIT_REPORT.md` — created (full audit report)
- **File:** `AUDIT_CHANGELOG.md` — created (this file)
- **File:** `config/nav.ts` — role fix (Directory, Return Journeys, Post Load)
- **Build result:** ✅ 51 pages, 0 errors
- **Lint result:** 2 pre-existing errors (not introduced here)

---

## Known Pre-existing Issues (NOT introduced by this audit)

| File | Issue | Status |
|---|---|---|
| `app/onboarding/page.tsx:40` | ESLint error: `setState` called synchronously in `useEffect` | Pre-existing |
| `components/auth/RequireRole.tsx:25` | ESLint error: `setState` called synchronously in `useEffect` | Pre-existing |
| Multiple files | ESLint warnings: `no-explicit-any`, `no-unused-vars` | Pre-existing |
| `@next/swc` | Version mismatch 15.5.7 vs Next.js 15.5.11 | Pre-existing |

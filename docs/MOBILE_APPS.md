# XDrive Mobile Apps

This document describes the mobile app implementation for XDrive Logistics.

## Overview

XDrive now has **two separate mobile applications**:
1. **Fleet App** - For team members, dispatchers, and office staff
2. **Driver App** - For drivers on the road

These are distinct from the desktop portal and provide native mobile-app-like experiences.

## Routes

### Mobile Chooser
- **Route:** `/m`
- **Purpose:** Let users choose between Fleet or Driver app
- **Auto-routing:** If user has a role, automatically routes to the appropriate app
  - `driver` role → `/m/driver`
  - `admin`, `dispatcher`, `viewer` roles → `/m/fleet`

### Fleet Mobile App
- **Entry:** `/m/fleet`
- **Pages:**
  - Dashboard (`/m/fleet`) - Overview with stats and quick actions
  - Loads (`/m/fleet/loads`) - Manage loads and jobs
  - Live Tracking (`/m/fleet/live`) - Real-time vehicle tracking
  - Diary (`/m/fleet/diary`) - Schedule and calendar
  - More (`/m/fleet/more`) - Settings and additional options

### Driver Mobile App
- **Entry:** `/m/driver`
- **Pages:**
  - Home (`/m/driver`) - Driver dashboard with active jobs
  - Jobs (`/m/driver/jobs`) - View and manage assigned jobs
  - Navigation (`/m/driver/navigation`) - Turn-by-turn directions
  - Settings (`/m/driver/settings`) - Profile and preferences

## Responsive Routing

### Desktop (≥1024px)
- Users access the full desktop portal as usual
- No changes to existing desktop experience
- Routes: `/dashboard`, `/loads`, etc.

### Mobile (<1024px)
- Automatic redirect to `/m` (mobile chooser)
- Users select Fleet or Driver app
- Mobile-optimized UX with bottom navigation

### Excluded Routes
The following routes are NOT redirected on mobile:
- `/login`, `/register` - Authentication pages
- `/forgot-password`, `/reset-password` - Password recovery
- `/onboarding` - New user setup
- `/` - Public marketing page

## Mobile UX Features

### App-like Shell
- **Top Bar:** Fixed at top with app title and actions
- **Bottom Navigation:** 3-5 main items with icons and labels
- **Content Area:** Scrollable main content between top and bottom

### Design Principles
1. **Large Touch Targets:** Minimum 44px tap areas
2. **XDrive Branding:** Uses centralized brand palette (`lib/brandColors.ts`)
3. **Distinct from CX Fleet:** Unique spacing, typography, and layout
4. **No Dense Tables:** Mobile-friendly card-based layouts
5. **No Desktop Sidebar:** Full-width mobile experience

## Brand Colors

All colors are centralized in `lib/brandColors.ts`:

```typescript
brandColors = {
  primary: {
    navy: '#0A2239',  // XDrive Navy
    gold: '#D4AF37',  // XDrive Gold
  },
  // ... more colors
}
```

## Components

### Mobile-Specific Components
Located in `components/mobile/`:

1. **MobileTopBar** - Fixed header with title and actions
2. **MobileBottomNav** - Bottom navigation with icons
3. **MobileRedirect** - Handles responsive routing logic

### Reusable Across Apps
Both Fleet and Driver apps use the same components with different configurations.

## Development

### Running Locally
```bash
npm run dev
```
Then visit:
- http://localhost:3000/m - Mobile chooser
- http://localhost:3000/m/fleet - Fleet app
- http://localhost:3000/m/driver - Driver app

### Building
```bash
npm run build
```

### Testing Mobile View
1. Open DevTools
2. Toggle device toolbar (Cmd/Ctrl + Shift + M)
3. Select mobile device or set width < 1024px
4. Navigate to any portal route
5. Should auto-redirect to `/m`

## Screenshots

See `docs/screenshots/mobile-apps/` for visual documentation of all screens.

## Architecture

### Route Structure
```
app/
├── m/                          # Mobile apps root
│   ├── layout.tsx             # Auth wrapper for mobile
│   ├── page.tsx               # Chooser page
│   ├── fleet/                 # Fleet app
│   │   ├── layout.tsx         # Fleet shell (top bar + bottom nav)
│   │   ├── page.tsx           # Fleet dashboard
│   │   ├── loads/page.tsx
│   │   ├── live/page.tsx
│   │   ├── diary/page.tsx
│   │   └── more/page.tsx
│   └── driver/                # Driver app
│       ├── layout.tsx         # Driver shell (top bar + bottom nav)
│       ├── page.tsx           # Driver home
│       ├── jobs/page.tsx
│       ├── navigation/page.tsx
│       └── settings/page.tsx
└── (portal)/                   # Desktop portal (unchanged)
    ├── layout.tsx             # Includes MobileRedirect
    └── ...
```

### Layout Hierarchy
```
Root Layout (AuthProvider)
└── Mobile Layout (Auth Check)
    ├── Fleet Layout (Top Bar + Bottom Nav)
    │   └── Fleet Pages
    └── Driver Layout (Top Bar + Bottom Nav)
        └── Driver Pages
```

## Future Enhancements

### Fleet App
- [ ] Load management with filters
- [ ] Live tracking map integration
- [ ] Calendar/diary functionality
- [ ] Advanced settings

### Driver App
- [ ] Job acceptance workflow
- [ ] POD (Proof of Delivery) capture
- [ ] Turn-by-turn navigation
- [ ] Real-time status updates

### Both Apps
- [ ] Push notifications
- [ ] Offline support
- [ ] Progressive Web App (PWA) features
- [ ] Geolocation services

## Notes

- Desktop portal remains unchanged
- Mobile apps coexist with desktop portal
- No breaking changes to existing functionality
- Old mobile responsive code in `PortalLayout.tsx` can remain for fallback

## Support

For issues or questions about the mobile apps, please contact the development team.

import type { Role } from '@/lib/roles'

export interface NavItem {
  label: string
  path: string
  icon: string
  allowedRoles: Role[]
  section?: string
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: '📊',
    allowedRoles: ['driver', 'broker', 'company'],
    section: 'main',
  },
  {
    label: 'Loads',
    path: '/loads',
    icon: '📦',
    allowedRoles: ['driver', 'broker', 'company'],
    section: 'main',
  },
  {
    label: 'Quotes',
    path: '/quotes',
    icon: '💰',
    allowedRoles: ['driver', 'broker', 'company'],
    section: 'main',
  },
  {
    label: 'Return Journeys',
    path: '/return-journeys',
    icon: '🔄',
    allowedRoles: ['driver'],
    section: 'main',
  },
  {
    label: 'Post Load',
    path: '/jobs/new',
    icon: '➕',
    allowedRoles: ['broker'],
    section: 'main',
  },
  {
    label: 'Directory',
    path: '/directory',
    icon: '📁',
    allowedRoles: ['broker'],
    section: 'main',
  },
  {
    label: 'Live Availability',
    path: '/live-availability',
    icon: '📡',
    allowedRoles: ['broker', 'company'],
    section: 'main',
  },
  {
    label: 'Drivers & Vehicles',
    path: '/drivers-vehicles',
    icon: '👤',
    allowedRoles: ['company'],
    section: 'main',
  },
  {
    label: 'My Fleet',
    path: '/my-fleet',
    icon: '🚛',
    allowedRoles: ['company'],
    section: 'main',
  },
  {
    label: 'Freight Vision',
    path: '/freight-vision',
    icon: '📈',
    allowedRoles: ['company'],
    section: 'main',
  },
  {
    label: 'Diary',
    path: '/diary',
    icon: '📅',
    allowedRoles: ['driver', 'broker', 'company'],
    section: 'main',
  },
  // Account section
  {
    label: 'Get Started',
    path: '/account/get-started',
    icon: '🚀',
    allowedRoles: ['driver', 'broker', 'company'],
    section: 'account',
  },
  {
    label: 'Company Profile',
    path: '/account/company-profile',
    icon: '🏢',
    allowedRoles: ['broker', 'company'],
    section: 'account',
  },
  {
    label: 'Business Docs',
    path: '/account/business-docs',
    icon: '📄',
    allowedRoles: ['broker', 'company'],
    section: 'account',
  },
  {
    label: 'Settings',
    path: '/account/settings',
    icon: '⚙️',
    allowedRoles: ['driver', 'broker', 'company'],
    section: 'account',
  },
]


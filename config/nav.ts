import type { Role } from '@/lib/roles'

export interface NavItem {
  label: string
  path: string
  icon: string
  allowedRoles: Role[]
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: '📊',
    allowedRoles: ['driver', 'broker', 'company'],
  },
  {
    label: 'Loads',
    path: '/loads',
    icon: '📦',
    allowedRoles: ['driver', 'broker', 'company'],
  },
  {
    label: 'Quotes',
    path: '/quotes',
    icon: '💰',
    allowedRoles: ['driver', 'broker', 'company'],
  },
  {
    label: 'Return Journeys',
    path: '/return-journeys',
    icon: '🔄',
    allowedRoles: ['driver'],
  },
  {
    label: 'Post Load',
    path: '/jobs/new',
    icon: '➕',
    allowedRoles: ['broker'],
  },
  {
    label: 'Directory',
    path: '/directory',
    icon: '📁',
    allowedRoles: ['broker'],
  },
  {
    label: 'Live Availability',
    path: '/live-availability',
    icon: '📡',
    allowedRoles: ['broker', 'company'],
  },
  {
    label: 'Drivers & Vehicles',
    path: '/drivers-vehicles',
    icon: '👤',
    allowedRoles: ['company'],
  },
  {
    label: 'My Fleet',
    path: '/my-fleet',
    icon: '🚛',
    allowedRoles: ['company'],
  },
  {
    label: 'Freight Vision',
    path: '/freight-vision',
    icon: '📈',
    allowedRoles: ['company'],
  },
  {
    label: 'Diary',
    path: '/diary',
    icon: '📅',
    allowedRoles: ['driver', 'broker', 'company'],
  },
  {
    label: 'Company Settings',
    path: '/company/settings',
    icon: '⚙️',
    allowedRoles: ['broker', 'company'],
  },
]

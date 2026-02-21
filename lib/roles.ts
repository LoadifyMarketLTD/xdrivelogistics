export const ROLES = ['owner', 'driver', 'broker', 'company_admin', 'company'] as const
export type Role = (typeof ROLES)[number]

export type UserStatus = 'pending' | 'active' | 'blocked'

/** Roles shown on the public register page */
export const REGISTERABLE_ROLES = ['broker', 'company_admin'] as const

export const ROLE_LABEL: Record<Role, string> = {
  owner: 'Site Owner',
  driver: 'Driver',
  broker: 'Broker / Dispatcher',
  company_admin: 'Transport Company',
  company: 'Transport Company',
}

export const ROLE_DESCRIPTION: Record<Role, string> = {
  owner: 'Platform owner with full admin access.',
  driver: 'Browse and bid on available freight loads, manage your availability and schedule.',
  broker: 'Post loads to the marketplace, review carrier bids and manage shipments.',
  company_admin: 'Manage your fleet and drivers, post company jobs and track performance.',
  company: 'Manage your fleet and drivers, post company jobs and track performance.',
}

export const ROLE_ICON: Record<Role, string> = {
  owner: '👑',
  driver: '🚚',
  broker: '📋',
  company_admin: '🏢',
  company: '🏢',
}

export const DEFAULT_ROLE: Role = 'driver'

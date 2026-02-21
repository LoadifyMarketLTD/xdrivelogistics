export const ROLES = ['driver', 'broker', 'company'] as const
export type Role = (typeof ROLES)[number]

export const ROLE_LABEL: Record<Role, string> = {
  driver: 'Driver',
  broker: 'Broker / Dispatcher',
  company: 'Transport Company (Owner)',
}

export const ROLE_DESCRIPTION: Record<Role, string> = {
  driver: 'Browse and bid on available freight loads, manage your availability and schedule.',
  broker: 'Post loads to the marketplace, review carrier bids and manage shipments.',
  company: 'Manage your fleet and drivers, post company jobs and track performance as a company owner or administrator.',
}

export const ROLE_ICON: Record<Role, string> = {
  driver: '🚚',
  broker: '📋',
  company: '🏢',
}

export const DEFAULT_ROLE: Role = 'driver'

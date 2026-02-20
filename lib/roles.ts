export const ROLES = ['driver', 'broker', 'company'] as const
export type Role = (typeof ROLES)[number]

export const ROLE_LABEL: Record<Role, string> = {
  driver: 'Driver',
  broker: 'Broker / Dispatcher',
  company: 'Transport Company',
}

export const DEFAULT_ROLE: Role = 'driver'

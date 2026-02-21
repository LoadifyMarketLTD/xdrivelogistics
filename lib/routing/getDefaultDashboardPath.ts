/**
 * Returns the default dashboard path for a given role.
 * Single source of truth for role-based routing.
 */
export function getDefaultDashboardPath(role?: string | null): string {
  if (role === 'owner') return '/owner'
  if (role === 'broker') return '/broker'
  if (role === 'company_admin' || role === 'company') return '/company'
  if (role === 'driver') return '/driver'
  return '/onboarding'
}

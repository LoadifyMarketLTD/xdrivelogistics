/**
 * Returns the default dashboard path for a given role.
 * Single source of truth for role-based routing.
 *
 * @param role - The user's role string (e.g. 'driver', 'company', 'broker') or null/undefined.
 * @returns The route path to redirect to. Falls back to '/onboarding' when role is unknown or missing.
 */
export function getDefaultDashboardPath(role?: string | null): string {
  if (role === 'broker') return '/dashboard/broker'
  if (role === 'company') return '/dashboard/company'
  if (role === 'driver') return '/dashboard/driver'
  return '/onboarding'
}

/**
 * Returns the default dashboard path for a given role.
 * Single source of truth for role-based routing.
 * Owner → /admin/approvals (existing admin area)
 * Others → existing portal routes under /dashboard/
 */
export function getDefaultDashboardPath(role?: string | null): string {
  if (role === 'owner') return '/admin/approvals'
  if (role === 'broker') return '/dashboard/broker'
  if (role === 'company_admin' || role === 'company') return '/dashboard/company'
  if (role === 'driver') return '/dashboard/driver'
  return '/onboarding'
}

/**
 * RBAC helper — uses existing supabase client from lib/supabaseClient.ts
 * Calls DB RPC functions so all role/status logic lives in Postgres.
 */
import { supabase } from '@/lib/supabaseClient'

export type UserRole = 'owner' | 'broker' | 'company_admin' | 'driver'
export type UserStatus = 'pending' | 'active' | 'blocked'
export type RoleStatusRow = { role: UserRole; status: UserStatus }

/**
 * Returns the next route for a given role+status combination.
 * Uses existing portal routes — single source of truth.
 */
export function routeForRoleStatus(row: RoleStatusRow): string {
  if (row.status === 'pending') return '/pending'
  if (row.status === 'blocked') return '/blocked'
  switch (row.role) {
    case 'owner':         return '/admin/approvals'
    case 'broker':        return '/dashboard/broker'
    case 'company_admin': return '/dashboard/company'
    case 'driver':        return '/dashboard/driver'
    default:              return '/pending'
  }
}

/**
 * Calls public.get_my_role_status() and returns the first row or null.
 * Returns null when no profile row exists (new user → onboarding).
 */
export async function getMyRoleStatus(): Promise<RoleStatusRow | null> {
  const { data, error } = await supabase.rpc('get_my_role_status')
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : null
  return row ?? null
}

/** True if there is an active Supabase session. */
export async function isLoggedIn(): Promise<boolean> {
  const { data } = await supabase.auth.getSession()
  return !!data.session
}

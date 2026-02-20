import { supabase } from '@/lib/supabaseClient'
import { DEFAULT_ROLE, ROLES, type Role } from '@/lib/roles'
import type { SupabaseClient } from '@supabase/supabase-js'

// ─── Profile shape (mirrors AuthContext + onboarding fields) ──────────────────
export interface Profile {
  id: string
  email: string
  full_name: string | null
  display_name: string | null
  phone: string | null
  company_id: string | null
  role: string
  country: string | null
  is_active: boolean
  // Driver fields
  driver_base_postcode: string | null
  driver_vehicle_type: string | null
  driver_availability: string | null
  // Broker fields
  broker_company_name: string | null
  broker_company_postcode: string | null
  broker_payment_terms: string | null
  // Company fields
  company_name: string | null
  company_postcode: string | null
  company_fleet_size: number | null
  company_primary_services: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the currently authenticated Supabase user, or null. */
export async function getCurrentUser(client: SupabaseClient = supabase) {
  const {
    data: { user },
  } = await client.auth.getUser()
  return user ?? null
}

/** Fetches the full profile row for a given user id. */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  return data ?? null
}

/**
 * Resolves the user's role:
 * 1. profiles.role
 * 2. auth user_metadata.role
 * 3. DEFAULT_ROLE ("driver")
 */
export async function getRole(userId: string): Promise<Role> {
  try {
    const profile = await getProfile(userId)
    if (profile?.role && ROLES.includes(profile.role as Role)) {
      return profile.role as Role
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    const metaRole = user?.user_metadata?.role
    if (metaRole && ROLES.includes(metaRole as Role)) {
      return metaRole as Role
    }
  } catch {
    // silently fall back
  }
  return DEFAULT_ROLE
}

/**
 * Returns true when the role-specific required onboarding fields are missing
 * from the profile, meaning the onboarding form must be shown.
 */
export function needsOnboarding(role: Role = DEFAULT_ROLE, profile: Partial<Profile> | null): boolean {
  if (!profile) return true
  switch (role) {
    case 'driver':
      return !profile.driver_base_postcode || !profile.driver_vehicle_type
    case 'broker':
      return !profile.broker_company_name || !profile.broker_company_postcode
    case 'company':
      return (
        !profile.company_name ||
        !profile.company_postcode ||
        profile.company_fleet_size == null
      )
    default:
      return false
  }
}

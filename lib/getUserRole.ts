import { supabase } from '@/lib/supabaseClient'
import { DEFAULT_ROLE, ROLES, type Role } from '@/lib/roles'

export async function getUserRole(userId: string): Promise<Role> {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle()

    if (data?.role && ROLES.includes(data.role as Role)) {
      return data.role as Role
    }

    // Fall back to auth user_metadata
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const metaRole = user?.user_metadata?.role
    if (metaRole && ROLES.includes(metaRole as Role)) {
      return metaRole as Role
    }
  } catch {
    // Silently fall back to default
  }

  return DEFAULT_ROLE
}

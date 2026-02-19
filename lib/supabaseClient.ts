import { createClient } from '@supabase/supabase-js'

/**
 * IMPORTANT:
 * - In Next.js, NEXT_PUBLIC_* vars are injected at BUILD time.
 * - If they are missing in Netlify at build, the app will compile with `undefined`,
 *   and any hardcoded fallback can break auth (invalid key) and cause login loops.
 * - So: no hardcoded defaults here. Fail fast when env is missing.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (typeof window !== 'undefined') {
  console.log('[Supabase] NEXT_PUBLIC_SUPABASE_URL present:', !!supabaseUrl)
  console.log('[Supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY present:', !!supabaseAnonKey)

  if (!isSupabaseConfigured) {
    console.error(
      '[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY at build time. Auth is disabled until env vars are set in Netlify.'
    )
  }
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

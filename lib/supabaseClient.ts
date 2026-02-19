import { createClient } from '@supabase/supabase-js'

/**
 * IMPORTANT:
 * - In Next.js, NEXT_PUBLIC_* vars are injected at BUILD time.
 * - If they are missing in Netlify at build, the app will compile with `undefined`,
 *   and any hardcoded fallback can break auth (invalid key) and cause login loops.
 * - So: no hardcoded defaults here. Fail fast when env is missing.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.error(
    '[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY at build time. Auth is disabled until env vars are set in Netlify.'
  )
}

// Always export a client so callers never receive null.
// When env vars are absent the placeholder strings ensure auth calls fail with a
// clear network/credentials error rather than crashing the module at load time.
export const supabase = createClient(
  supabaseUrl ?? 'https://not-configured.invalid',
  supabaseAnonKey ?? 'NEXT_PUBLIC_SUPABASE_ANON_KEY-not-configured',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)

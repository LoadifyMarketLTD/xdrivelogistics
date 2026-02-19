import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.error(
    '[Supabase] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Auth is disabled until env vars are set.'
  )
}

// Always export a client so callers never receive null.
// When env vars are absent the placeholder strings ensure auth calls fail with a
// clear network/credentials error rather than crashing the module at load time.
export const supabase = createClient(
  supabaseUrl ?? 'https://not-configured.invalid',
  supabaseAnonKey ?? 'VITE_SUPABASE_ANON_KEY-not-configured'
)

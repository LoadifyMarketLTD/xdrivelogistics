import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.error(
    '[Supabase] VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY are not set. ' +
    'Set these env vars in your Netlify dashboard for every deploy context.'
  )
}

// Guard with clearly-invalid placeholders so the module loads; calls will fail with a clear network/auth error.
export const supabase = createClient(
  supabaseUrl ?? 'https://VITE_SUPABASE_URL-not-configured.supabase.co',
  supabaseAnonKey ?? 'VITE_SUPABASE_ANON_KEY-not-configured'
)

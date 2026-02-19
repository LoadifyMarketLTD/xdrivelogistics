import { createClient } from '@supabase/supabase-js'

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// True only when both env vars are explicitly set — no hardcoded fallback.
export const isSupabaseConfigured = !!(envUrl && envKey)

if (typeof window !== 'undefined' && !isSupabaseConfigured) {
  console.error(
    '[Supabase] NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY are not set. ' +
    'Set these env vars in your Netlify dashboard for every deploy context (Production, Deploy Previews, Branch deploys).'
  )
}

// createClient requires non-empty strings; use clearly-invalid placeholders so the module
// loads during SSG — individual API calls will fail with a clear network/auth error rather
// than a silent redirect loop using a baked-in key.
export const supabase = createClient(
  envUrl ?? 'https://NEXT_PUBLIC_SUPABASE_URL-not-configured.supabase.co',
  envKey ?? 'NEXT_PUBLIC_SUPABASE_ANON_KEY-not-configured'
)

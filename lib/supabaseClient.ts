import { createBrowserClient } from '@supabase/ssr'

/**
 * IMPORTANT:
 * - In Next.js, NEXT_PUBLIC_* vars are injected at BUILD time.
 * - If they are missing in Netlify at build, the app will compile with `undefined`,
 *   and any hardcoded fallback can break auth (invalid key) and cause login loops.
 * - So: no hardcoded defaults here. Fail fast when env is missing.
 *
 * WHY createBrowserClient (not plain createClient):
 * createBrowserClient from @supabase/ssr stores the auth session in cookies
 * (not just localStorage). This allows the Next.js middleware — which uses
 * createServerClient and reads from cookies — to find the session and validate
 * the user on every protected route. Without cookie-based storage the middleware
 * always sees an unauthenticated request and redirects to /login, which then
 * reads the localStorage session and redirects to /post-login, causing an
 * infinite redirect loop for every logged-in user.
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
export const supabase = createBrowserClient(
  supabaseUrl ?? 'https://not-configured.invalid',
  supabaseAnonKey ?? 'NEXT_PUBLIC_SUPABASE_ANON_KEY-not-configured',
)

/**
 * Centralized environment variable validation.
 * Import from this module instead of accessing process.env directly.
 * Throws a clear error at startup if required variables are missing.
 */

export function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `[env] Missing required environment variable: ${name}. ` +
        'Set it in your .env.local file (development) or in your Netlify site settings (production).'
    )
  }
  return value
}

export function optionalEnv(name: string): string | undefined {
  return process.env[name]
}

/**
 * NEXT_PUBLIC_* variables are injected at build time and safe to expose in the browser.
 * They must be set in Netlify for ALL deploy contexts (production, preview, branch).
 */
export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? '',
} as const

/** Returns true when all required public env vars are present. */
export const isEnvConfigured = !!(
  env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

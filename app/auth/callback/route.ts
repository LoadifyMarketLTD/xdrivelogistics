import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Supabase Auth callback handler.
 * Handles the PKCE code exchange for email confirmation links sent by
 * Supabase Auth (Confirm email flow). After a successful exchange the user
 * is redirected to /post-login which routes them to the correct page.
 *
 * Supabase "Site URL" must be set to NEXT_PUBLIC_SITE_URL and the following
 * redirect URL must be whitelisted in Supabase Auth → URL Configuration:
 *   https://xdrivelogistics.co.uk/**
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/post-login'

  // Determine the base URL to redirect back to our app
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    `${requestUrl.protocol}//${requestUrl.host}`

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        // Successful confirmation — send user into the portal routing logic
        return NextResponse.redirect(new URL(next, siteUrl))
      }
    } catch {
      // Fall through to error redirect
    }
  }

  // Auth confirmation failed — send to login with an error hint
  return NextResponse.redirect(
    new URL('/login?error=auth_callback_failed', siteUrl)
  )
}

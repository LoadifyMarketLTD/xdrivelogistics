import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Skip session refresh when env vars are absent (e.g. deploy previews not yet configured).
  // This prevents a broken-key from causing redirect loops on every request.
  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  let mutableResponse = response

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          mutableResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          mutableResponse.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          mutableResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          mutableResponse.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
      set(name: string, value: string, options: any) {
        // Only set on response (request cookies are immutable in Next middleware)
        response.cookies.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        response.cookies.set({ name, value: '', ...options })
      },
    },
  })

  // Refresh session (server components rely on this)
  await supabase.auth.getUser()

  return mutableResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - public folder static assets (images, fonts, js, css, html, ico)
     */
    '/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|woff|woff2|ttf|eot|html)$).*)',
  ],
}

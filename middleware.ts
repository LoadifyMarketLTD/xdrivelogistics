import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/** Routes that require authentication + active status */
const PROTECTED_PREFIXES = ['/dashboard', '/admin', '/owner']

/** Pending company_admin users may access this route while awaiting approval */
const PENDING_COMPANY_ALLOWED = '/dashboard/company/profile'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Create response FIRST
  const response = NextResponse.next()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars missing, skip auth checks
  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        response.cookies.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        response.cookies.set({ name, value: '', ...options })
      },
    },
  })

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser()

  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p))

  if (!isProtected) {
    return response
  }

  // Not authenticated → redirect to login
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Fetch profile to check role and status.
  // Only select columns that are guaranteed to exist in the schema.
  // Selecting a non-existent column causes PostgREST to return an error
  // which silently makes `data` null and breaks routing for all users.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('user_id', user.id)
    .maybeSingle()

  // Fall back to JWT metadata when the DB query returns null (e.g. transient
  // RLS/network issue) so a verified owner is never bounced back to /post-login.
  const role: string =
    profile?.role ??
    (user.user_metadata?.role as string | undefined) ??
    (user.app_metadata?.role as string | undefined) ??
    ''
  const isActive = profile?.status === 'active' || profile?.status == null
  const isNotActive = profile?.status === 'pending' || profile?.status === 'blocked'

  // /admin routes: owner only
  if (pathname.startsWith('/admin')) {
    if (role !== 'owner' || !isActive) {
      return NextResponse.redirect(new URL('/post-login', request.url))
    }
    return response
  }

  // /owner route: owner only
  if (pathname.startsWith('/owner')) {
    if (role !== 'owner' || !isActive) {
      return NextResponse.redirect(new URL('/post-login', request.url))
    }
    return response
  }

  // /dashboard routes: active users only, with special pending exception
  if (pathname.startsWith('/dashboard')) {
    if (!isActive && isNotActive) {
      // Pending company_admin may ONLY access the company profile page
      if (role === 'company_admin' && pathname.startsWith(PENDING_COMPANY_ALLOWED)) {
        return response
      }
      const dest = profile?.status === 'blocked' ? '/blocked' : '/pending'
      return NextResponse.redirect(new URL(dest, request.url))
    }
    return response
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}


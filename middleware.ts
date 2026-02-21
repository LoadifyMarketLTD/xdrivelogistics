import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/** Routes that require authentication + active status */
const PROTECTED_PREFIXES = ['/dashboard', '/admin', '/owner']

/** Pending company_admin users may access this route while awaiting approval */
const PENDING_COMPANY_ALLOWED = '/dashboard/company/profile'

/** Roles that are allowed to access /dashboard routes */
const DASHBOARD_ROLES = ['owner', 'broker', 'company_admin', 'driver']

/**
 * The platform owner email. When this account has no profile row yet
 * (new deployment / profile deleted) the middleware bootstraps them
 * directly to the admin panel instead of sending them to onboarding
 * where they could only register as broker/company.
 */
const OWNER_EMAIL = (process.env.OWNER_EMAIL ?? 'xdrivelogisticsltd@gmail.com').toLowerCase()

type RoleStatus = { role: string; status: string }

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Short-circuit immediately for non-protected routes.
  // Public pages (landing, login, register, pending, post-login, etc.) never
  // wait on any Supabase network call.
  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p))
  if (!isProtected) {
    return NextResponse.next()
  }

  // Create response FIRST so cookie mutations propagate to the browser.
  const response = NextResponse.next()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars missing at build/runtime, let the request through —
  // client-side guards will handle auth in this case.
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

  // 1. Validate the JWT (server-side, authoritative).
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Use the RPC as the single source of truth for role + status.
  //    get_my_role_status() is SECURITY DEFINER — it bypasses RLS and uses
  //    auth.uid() from the JWT, making it immune to RLS misconfigurations and
  //    missing columns that break a raw profiles SELECT.
  const { data: rpcData } = await supabase.rpc('get_my_role_status')
  const row = Array.isArray(rpcData) ? (rpcData[0] as RoleStatus | undefined) : null

  // No profile row → owner email gets sent straight to admin (the DB trigger
  // in 003_bootstrap_owner_by_email.sql will create the row on next RPC call);
  // everyone else goes to onboarding.
  if (!row) {
    if (user.email && user.email.toLowerCase() === OWNER_EMAIL) {
      return NextResponse.redirect(new URL('/dashboard/owner', request.url))
    }
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  const { role, status } = row

  // Handle non-active statuses before route-specific checks
  if (status === 'pending') {
    // Owner never needs approval — treat as active
    if (role === 'owner') {
      return response
    }
    // Pending company_admin may still complete their company profile
    if (role === 'company_admin' && pathname.startsWith(PENDING_COMPANY_ALLOWED)) {
      return response
    }
    return NextResponse.redirect(new URL('/pending', request.url))
  }

  if (status === 'blocked') {
    return NextResponse.redirect(new URL('/blocked', request.url))
  }

  // /admin and /owner routes: owner only
  if (pathname.startsWith('/admin') || pathname.startsWith('/owner')) {
    if (role !== 'owner') {
      return NextResponse.redirect(new URL('/post-login', request.url))
    }
    return response
  }

  // /dashboard routes: any active recognised role may enter.
  // An unrecognised or empty role is treated as unroutable → /post-login.
  if (pathname.startsWith('/dashboard')) {
    if (!role || !DASHBOARD_ROLES.includes(role)) {
      return NextResponse.redirect(new URL('/post-login', request.url))
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


'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

// Routes that should NOT trigger mobile redirect
const EXCLUDED_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/onboarding',
  '/m', // Already on mobile
]

// Portal routes that should redirect to mobile on mobile devices
const PORTAL_ROUTES = [
  '/dashboard',
  '/directory',
  '/live-availability',
  '/loads',
  '/quotes',
  '/diary',
  '/return-journeys',
  '/freight-vision',
  '/drivers-vehicles',
  '/company',
  '/users',
  '/jobs',
]

export default function MobileRedirect() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Check if mobile viewport
    const isMobile = window.innerWidth < 1024

    // Don't redirect if not mobile
    if (!isMobile) return

    // Don't redirect if on excluded routes
    const isExcluded = EXCLUDED_ROUTES.some(route => pathname.startsWith(route))
    if (isExcluded) return

    // Don't redirect if on marketing pages (root and public pages)
    if (pathname === '/') return

    // Redirect portal routes to mobile chooser
    const isPortalRoute = PORTAL_ROUTES.some(route => pathname.startsWith(route))
    if (isPortalRoute) {
      router.push('/m')
    }
  }, [pathname, router])

  return null
}

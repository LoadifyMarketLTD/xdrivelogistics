import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/post-login'

  if (!code) {
    return NextResponse.redirect(new URL('/login', url.origin))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('exchangeCodeForSession error:', error)
    return NextResponse.redirect(new URL('/login', url.origin))
  }

  return NextResponse.redirect(new URL(next, url.origin))
}

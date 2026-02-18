import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LandingPage from './(marketing)/_components/LandingPage'

export default async function Home() {
  const supabase = await createClient()
  
  // Server-side auth check
  const { data: { session } } = await supabase.auth.getSession()
  
  // If user is authenticated, redirect to dashboard
  if (session) {
    redirect('/dashboard')
  }
  
  // Otherwise, show landing page
  return <LandingPage />
}

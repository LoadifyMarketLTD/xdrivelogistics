import { createClient } from '@supabase/supabase-js'

// Public anon credentials – not secrets; protected by Supabase RLS policies.
// These are the same values documented in .env.example and safe to ship in the browser.
const DEFAULT_SUPABASE_URL = 'https://jqxlauexhkonixtjvljw.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGxhdWV4aGtvbml4dGp2bGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTM2MzYsImV4cCI6MjA1NTI4OTYzNn0.yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO'

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Log whether environment variables are present (values are public/non-secret)
if (typeof window !== 'undefined') {
  console.log('[Supabase] NEXT_PUBLIC_SUPABASE_URL present:', !!envUrl)
  console.log('[Supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY present:', !!envKey)
  if (!envUrl) console.warn('[Supabase] NEXT_PUBLIC_SUPABASE_URL is not set – using hardcoded default')
  if (!envKey) console.warn('[Supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY is not set – using hardcoded default')
}

const supabaseUrl = envUrl || DEFAULT_SUPABASE_URL
const supabaseAnonKey = envKey || DEFAULT_SUPABASE_ANON_KEY

// True when both env vars are explicitly configured (not falling back to defaults).
export const isSupabaseConfigured = !!(envUrl && envKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


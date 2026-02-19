import { createClient } from '@supabase/supabase-js'

// Public anon credentials – not secrets; protected by Supabase RLS policies.
// These are the same values documented in .env.example and safe to ship in the browser.
const DEFAULT_SUPABASE_URL = 'https://jqxlauexhkonixtjvljw.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGxhdWV4aGtvbml4dGp2bGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTM2MzYsImV4cCI6MjA1NTI4OTYzNn0.yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY

// Always true because defaults are embedded above; kept for API compatibility.
export const isSupabaseConfigured = true

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


import { createClient } from '@supabase/supabase-js'

// Next.js will map VITE_* to NEXT_PUBLIC_* via next.config.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Warn if credentials are missing but don't throw - allows build to complete
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️  Supabase credentials not found!\n' +
    'Required environment variables:\n' +
    '- VITE_SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)\n' +
    '- VITE_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)\n\n' +
    'Using placeholder values for build. Runtime authentication will fail without real credentials.\n' +
    'Set these in Netlify environment variables for production.'
  )
}

// Create client with valid placeholder values if credentials missing
// This allows the build to complete successfully
// At runtime with real credentials from Netlify, everything will work correctly
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder'
)

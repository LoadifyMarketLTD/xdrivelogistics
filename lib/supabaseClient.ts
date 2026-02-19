import { createClient } from '@supabase/supabase-js'

// Support both Vite and Next.js environment variables
const supabaseUrl = 
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_SUPABASE_URL
    : process.env.NEXT_PUBLIC_SUPABASE_URL

const supabaseAnonKey = 
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_SUPABASE_ANON_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate that credentials are present and not placeholder values
const hasValidCredentials = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  supabaseAnonKey !== 'placeholder-key' &&
  supabaseUrl.includes('supabase.co')

if (!hasValidCredentials) {
  console.error(
    '❌ Invalid or missing Supabase credentials!\n' +
    'Required environment variables:\n' +
    '- VITE_SUPABASE_URL (Vite) or NEXT_PUBLIC_SUPABASE_URL (Next.js)\n' +
    '- VITE_SUPABASE_ANON_KEY (Vite) or NEXT_PUBLIC_SUPABASE_ANON_KEY (Next.js)\n\n' +
    'Please set these in your Netlify environment variables.\n' +
    'See NETLIFY_DEPLOYMENT_GUIDE.md for instructions.'
  )
}

// Create Supabase client with proper credentials
// If credentials are invalid, we still create the client but mark it as invalid
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Export a flag to check if credentials are valid
export const isSupabaseConfigured = hasValidCredentials

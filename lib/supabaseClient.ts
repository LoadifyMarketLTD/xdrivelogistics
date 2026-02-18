import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Check if we're in a browser environment (runtime) vs build time
const isBrowser = typeof window !== 'undefined'

// At runtime, require valid credentials. At build time, allow placeholders.
if (isBrowser && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error(
    '❌ Missing Supabase credentials!\n' +
    'Required environment variables:\n' +
    '- VITE_SUPABASE_URL\n' +
    '- VITE_SUPABASE_ANON_KEY\n\n' +
    'Please set these in your Netlify environment variables.\n' +
    'See NETLIFY_SETUP.md for instructions.'
  )
}

// Create client with real credentials if available, otherwise use placeholders for build
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key-for-build-only')

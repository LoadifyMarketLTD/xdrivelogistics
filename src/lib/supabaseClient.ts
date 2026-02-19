import { createClient } from '@supabase/supabase-js'

// Use Vite environment variables for the landing page
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Missing Supabase credentials!\n' +
    'Required environment variables in Netlify:\n' +
    '- VITE_SUPABASE_URL\n' +
    '- VITE_SUPABASE_ANON_KEY\n\n' +
    'Current Netlify setup with VITE_* variables will work automatically.\n' +
    'See NETLIFY_SETUP.md for instructions.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

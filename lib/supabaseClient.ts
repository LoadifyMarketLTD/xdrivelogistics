import { createClient } from '@supabase/supabase-js'

// Next.js will map VITE_* to NEXT_PUBLIC_* via next.config.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Missing Supabase credentials!\n' +
    'Required environment variables in Netlify:\n' +
    '- VITE_SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)\n' +
    '- VITE_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)\n\n' +
    'Current Netlify setup with VITE_* variables will work automatically.\n' +
    'See NETLIFY_SETUP.md for instructions.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

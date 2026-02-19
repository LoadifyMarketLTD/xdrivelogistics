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

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️  Missing Supabase credentials!\n' +
    'Required environment variables:\n' +
    '- VITE_SUPABASE_URL (Vite) or NEXT_PUBLIC_SUPABASE_URL (Next.js)\n' +
    '- VITE_SUPABASE_ANON_KEY (Vite) or NEXT_PUBLIC_SUPABASE_ANON_KEY (Next.js)\n\n' +
    'Please set these in your Netlify environment variables.\n' +
    'See NETLIFY_DEPLOYMENT_GUIDE.md for instructions.'
  )
}

// Use placeholder credentials during build to allow static page generation
// At runtime on Netlify, actual environment variables will be available
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

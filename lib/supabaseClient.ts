import { createClient } from '@supabase/supabase-js'

// Vite uses import.meta.env for environment variables
// Support both VITE_ and NEXT_PUBLIC_ prefixes for compatibility
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                    import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
                    'https://jqxlauexhkonixtjvljw.supabase.co'

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                        import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGxhdWV4aGtvbml4dGp2bGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTM2MzYsImV4cCI6MjA1NTI4OTYzNn0.yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO'

// Check if we're in a browser environment (runtime) vs build time
const isBrowser = typeof window !== 'undefined'

// At runtime, require valid credentials. At build time, allow placeholders.
if (isBrowser && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn(
    '⚠️ Supabase credentials not found!\n' +
    'Required environment variables:\n' +
    '- VITE_SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)\n' +
    '- VITE_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)\n\n' +
    'Using fallback credentials from .env.example'
  )
}

// Create client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

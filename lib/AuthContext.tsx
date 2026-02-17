'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  company_id: string | null
  role: string
  is_active: boolean
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  companyId: string | null
  loading: boolean
  error: string | null
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setProfile(data)
        setCompanyId(data.company_id)
      } else {
        // Profile doesn't exist yet - this is OK for new users
        setProfile(null)
        setCompanyId(null)
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err)
      setError(err.message)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setCompanyId(null)
  }

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout | null = null

    // Check active session
    const initializeAuth = async () => {
      try {
        // Set timeout to ensure loading always resolves
        timeoutId = setTimeout(() => {
          if (mounted && loading) {
            console.warn('Auth initialization timeout - resolving loading state')
            setLoading(false)
          }
        }, 5000) // 5 second timeout

        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return

        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        }
      } catch (err) {
        console.error('Error initializing auth:', err)
      } finally {
        if (mounted) {
          setLoading(false)
        }
        if (timeoutId) clearTimeout(timeoutId)
      }
    }

    initializeAuth()

    // Listen for auth changes
    // Note: We don't set loading=true here to avoid showing loading screens
    // during normal auth state changes. The profile fetch is fast and pages
    // handle the transition gracefully with their own loading states.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setCompanyId(null)
      }
    })

    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    profile,
    companyId,
    loading,
    error,
    refreshProfile,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

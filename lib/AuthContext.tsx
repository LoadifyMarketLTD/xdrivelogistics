'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

interface Profile {
  user_id: string
  email: string
  full_name: string | null
  display_name: string | null
  phone: string | null
  company_id: string | null
  role: string
  status: string | null
  country: string | null
  is_active: boolean
  // Driver onboarding fields
  driver_base_postcode: string | null
  driver_vehicle_type: string | null
  driver_availability: string | null
  // Broker onboarding fields
  broker_company_name: string | null
  broker_company_postcode: string | null
  broker_payment_terms: string | null
  // Company onboarding fields
  company_name: string | null
  company_postcode: string | null
  company_fleet_size: number | null
  company_primary_services: string | null
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  companyId: string | null
  loading: boolean
  profileLoading: boolean
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
  const [profileLoading, setProfileLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async (userId: string) => {
    try {
      setProfileLoading(true)

      // Race the query against a 10-second timeout so profileLoading is never
      // permanently stuck when the database is slow or unreachable.
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timed out')), 10000)
      )

      const { data, error } = await Promise.race([queryPromise, timeoutPromise])

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
    } finally {
      setProfileLoading(false)
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

    // Event-driven auth initialization - no timeouts
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Error getting session:', sessionError)
        }
        
        if (!mounted) return

        // Set user immediately once we know auth status
        setUser(session?.user ?? null)
        
        // Set loading=false as soon as auth status is known
        // Profile fetch runs async and doesn't block
        setLoading(false)

        // Fetch profile async without blocking
        if (session?.user) {
          fetchProfile(session.user.id)
        }
      } catch (err) {
        console.error('Error initializing auth:', err)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Subscribe to auth state changes.
    // Skip INITIAL_SESSION because initializeAuth() already handles the first
    // session load; acting on it here would trigger a second concurrent profile
    // fetch immediately on every mount.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      if (event === 'INITIAL_SESSION') return  // handled by initializeAuth above

      setUser(session?.user ?? null)

      if (session?.user) {
        // Fetch profile without blocking
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setCompanyId(null)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    profile,
    companyId,
    loading,
    profileLoading,
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

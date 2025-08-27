'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {}
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Create user profile ONLY on signup, not login
      if (event === 'SIGNED_UP' && session?.user) {
        await createUserProfile(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const createUserProfile = async (userId: string) => {
    // Use upsert to safely handle profile creation (prevents duplicate key errors)
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        tier: 'free',
        pages_used_today: 0,
        pages_used_month: 0,
        last_reset_date: new Date().toISOString().split('T')[0]
      }, {
        onConflict: 'id'
      })

    if (error) {
      console.error('Error creating user profile:', error)
    } else {
      console.log('User profile created successfully for:', userId)
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    }
  }

  const value = {
    user,
    session,
    loading,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
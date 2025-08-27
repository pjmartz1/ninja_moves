import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for user profiles
export interface UserProfile {
  id: string
  tier: 'free' | 'starter' | 'professional' | 'business' | 'enterprise'
  pages_used_today: number
  pages_used_month: number
  last_reset_date: string
  created_at: string
}

// Helper function to get user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

// Helper function to update user usage
export async function updateUserUsage(userId: string, pagesUsed: number) {
  // Try to get existing profile first (with proper error handling)
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (!profile || profileError) {
    console.log('No existing profile found, creating/updating with upsert...')
    
    // Use upsert to handle both create and update scenarios safely
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        tier: profile?.tier || 'free', // Preserve existing tier if available
        pages_used_today: pagesUsed,
        pages_used_month: (profile?.pages_used_month || 0) + pagesUsed,
        last_reset_date: new Date().toISOString().split('T')[0]
      }, {
        onConflict: 'id' // Specify the conflict resolution column
      })
    
    if (error) {
      console.error('Error upserting user profile:', error)
    } else {
      console.log('User profile upserted successfully')
    }
    return
  }

  // Check if we need to reset daily counter
  const today = new Date().toISOString().split('T')[0]
  const shouldResetDaily = profile.last_reset_date !== today

  const updates: Partial<UserProfile> = {
    pages_used_today: shouldResetDaily ? pagesUsed : profile.pages_used_today + pagesUsed,
    pages_used_month: profile.pages_used_month + pagesUsed,
    last_reset_date: today
  }

  const { error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)

  if (error) console.error('Error updating user usage:', error)
}

// Helper function to check user limits
export async function checkUserLimits(userId: string, tier: string): Promise<{ canProcess: boolean, reason?: string }> {
  const limits = {
    free: { daily: 5, monthly: 50 },
    starter: { daily: 50, monthly: 500 },
    professional: { daily: 150, monthly: 1500 },
    business: { daily: 500, monthly: 5000 },
    enterprise: { daily: -1, monthly: -1 } // Unlimited
  }

  const profile = await getUserProfile(userId)
  if (!profile) return { canProcess: true } // New user

  const tierLimits = limits[tier as keyof typeof limits] || limits.free

  if (tierLimits.daily > 0 && profile.pages_used_today >= tierLimits.daily) {
    return { canProcess: false, reason: 'Daily limit exceeded' }
  }

  if (tierLimits.monthly > 0 && profile.pages_used_month >= tierLimits.monthly) {
    return { canProcess: false, reason: 'Monthly limit exceeded' }
  }

  return { canProcess: true }
}
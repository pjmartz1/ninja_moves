'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { getUserProfile, UserProfile } from '@/lib/supabase'
import { 
  UserCircleIcon, 
  DocumentTextIcon, 
  CalendarDaysIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

export default function UserDashboard() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    
    setLoading(true)
    const userProfile = await getUserProfile(user.id)
    setProfile(userProfile)
    setLoading(false)
  }

  if (!user) return null

  const tierLimits = {
    free: { daily: 5, monthly: 50 },
    starter: { daily: 50, monthly: 500 },
    professional: { daily: 150, monthly: 1500 },
    business: { daily: 500, monthly: 5000 },
    enterprise: { daily: -1, monthly: -1 }
  }

  const currentLimits = tierLimits[profile?.tier || 'free']
  const dailyPercentage = currentLimits.daily > 0 
    ? Math.min(((profile?.pages_used_today || 0) / currentLimits.daily) * 100, 100)
    : 0
  const monthlyPercentage = currentLimits.monthly > 0
    ? Math.min(((profile?.pages_used_month || 0) / currentLimits.monthly) * 100, 100)
    : 0

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <UserCircleIcon className="h-10 w-10 text-gray-400" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {user.email}
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                {profile?.tier || 'free'} Plan
              </span>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center space-x-2 text-gray-500 hover:text-gray-700"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2" />
          Usage Statistics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 flex items-center">
                <CalendarDaysIcon className="h-4 w-4 mr-1" />
                Today
              </span>
              <span className="text-sm text-gray-500">
                {profile?.pages_used_today || 0} / {currentLimits.daily > 0 ? currentLimits.daily : '∞'} pages
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${dailyPercentage}%` }}
              />
            </div>
            {dailyPercentage > 80 && (
              <p className="text-sm text-orange-600 mt-1">
                You're approaching your daily limit
              </p>
            )}
          </div>

          {/* Monthly Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 flex items-center">
                <DocumentTextIcon className="h-4 w-4 mr-1" />
                This Month
              </span>
              <span className="text-sm text-gray-500">
                {profile?.pages_used_month || 0} / {currentLimits.monthly > 0 ? currentLimits.monthly : '∞'} pages
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${monthlyPercentage}%` }}
              />
            </div>
            {monthlyPercentage > 80 && (
              <p className="text-sm text-orange-600 mt-1">
                Consider upgrading to avoid monthly limits
              </p>
            )}
          </div>
        </div>

        {/* Upgrade CTA */}
        {profile?.tier === 'free' && (monthlyPercentage > 50 || dailyPercentage > 70) && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Need more extractions?
            </h4>
            <p className="text-sm text-blue-700 mb-3">
              Upgrade to our Starter plan for 50 daily extractions and priority processing.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
              Upgrade to Starter - $19.99/month
            </button>
          </div>
        )}

        {/* Account Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <CogIcon className="h-4 w-4 mr-1" />
            Account
          </h4>
          <div className="space-y-2">
            <button className="text-sm text-blue-600 hover:text-blue-700">
              View extraction history
            </button>
            <button className="text-sm text-blue-600 hover:text-blue-700 block">
              Download usage report
            </button>
            <button className="text-sm text-blue-600 hover:text-blue-700 block">
              Manage billing
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
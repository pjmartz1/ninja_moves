'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { getUserProfile, UserProfile } from '@/lib/supabase'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Calendar, 
  TrendingUp, 
  Crown,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

export default function UsageWidget() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

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
  const dailyUsed = profile?.pages_used_today || 0
  const monthlyUsed = profile?.pages_used_month || 0
  const dailyRemaining = Math.max(0, currentLimits.daily - dailyUsed)
  const monthlyRemaining = Math.max(0, currentLimits.monthly - monthlyUsed)
  
  const dailyPercentage = currentLimits.daily > 0 
    ? Math.min((dailyUsed / currentLimits.daily) * 100, 100)
    : 0
  const monthlyPercentage = currentLimits.monthly > 0
    ? Math.min((monthlyUsed / currentLimits.monthly) * 100, 100)
    : 0

  const needsUpgrade = (profile?.tier === 'free' && (dailyPercentage > 70 || monthlyPercentage > 50))
  const tierColors = {
    free: 'bg-gray-100 text-gray-800',
    starter: 'bg-blue-100 text-blue-800',
    professional: 'bg-purple-100 text-purple-800', 
    business: 'bg-orange-100 text-orange-800',
    enterprise: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800'
  }

  if (loading) {
    return (
      <Card className="border border-orange-100">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-orange-100 shadow-sm">
      <CardContent className="p-4">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Badge className={`${tierColors[profile?.tier || 'free']} font-medium`}>
              {profile?.tier === 'enterprise' && <Crown className="h-3 w-3 mr-1" />}
              {profile?.tier || 'Free'} Plan
            </Badge>
            <span className="text-sm text-gray-600">
              {currentLimits.daily > 0 ? `${dailyRemaining} left today` : '∞ daily'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Progress Indicators */}
        <div className="space-y-2">
          {/* Daily Usage */}
          <div>
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Today
              </span>
              <span>{dailyUsed} / {currentLimits.daily > 0 ? currentLimits.daily : '∞'}</span>
            </div>
            <Progress 
              value={dailyPercentage} 
              className="h-1.5"
              style={{
                backgroundColor: dailyPercentage > 80 ? '#fef3c7' : '#f3f4f6'
              }}
            />
          </div>

          {expanded && (
            <>
              {/* Monthly Usage */}
              <div>
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span className="flex items-center">
                    <FileText className="h-3 w-3 mr-1" />
                    This Month
                  </span>
                  <span>{monthlyUsed} / {currentLimits.monthly > 0 ? currentLimits.monthly : '∞'}</span>
                </div>
                <Progress 
                  value={monthlyPercentage} 
                  className="h-1.5"
                  style={{
                    backgroundColor: monthlyPercentage > 80 ? '#fef3c7' : '#f3f4f6'
                  }}
                />
              </div>

              {/* Upgrade CTA */}
              {needsUpgrade && (
                <div className="mt-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-sm font-medium text-orange-900">Need more extractions?</h5>
                      <p className="text-xs text-orange-700 mt-1">
                        Upgrade to Starter for 50 daily extractions
                      </p>
                    </div>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1 h-auto">
                      Upgrade
                    </Button>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <button className="hover:text-orange-600 transition-colors">
                    View History
                  </button>
                  <button className="hover:text-orange-600 transition-colors">
                    Billing
                  </button>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>{((monthlyUsed / currentLimits.monthly) * 100).toFixed(0)}% used</span>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
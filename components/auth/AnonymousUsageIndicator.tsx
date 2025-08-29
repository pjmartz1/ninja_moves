'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  FileText, 
  Calendar, 
  Crown,
  AlertTriangle
} from 'lucide-react'

interface AnonymousUsageIndicatorProps {
  onSignUpClick?: () => void
}

export default function AnonymousUsageIndicator({ onSignUpClick }: AnonymousUsageIndicatorProps) {
  const [pagesUsedToday, setPagesUsedToday] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get anonymous usage from localStorage
    const today = new Date().toDateString()
    const stored = localStorage.getItem('anonymous_usage')
    
    if (stored) {
      try {
        const usage = JSON.parse(stored)
        if (usage.date === today) {
          setPagesUsedToday(usage.pages || 0)
        } else {
          // Reset for new day
          localStorage.setItem('anonymous_usage', JSON.stringify({ date: today, pages: 0 }))
          setPagesUsedToday(0)
        }
      } catch {
        localStorage.setItem('anonymous_usage', JSON.stringify({ date: today, pages: 0 }))
        setPagesUsedToday(0)
      }
    } else {
      localStorage.setItem('anonymous_usage', JSON.stringify({ date: today, pages: 0 }))
      setPagesUsedToday(0)
    }
    
    setLoading(false)
  }, [])

  const dailyLimit = 1
  const remaining = Math.max(0, dailyLimit - pagesUsedToday)
  const percentage = (pagesUsedToday / dailyLimit) * 100
  const isLimitReached = pagesUsedToday >= dailyLimit

  if (loading) {
    return (
      <Card className="border border-orange-100">
        <CardContent className="p-3">
          <div className="animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-orange-100 shadow-sm">
      <CardContent className="p-3">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Badge className="bg-gray-100 text-gray-800 font-medium text-xs">
              Free Trial
            </Badge>
            <span className="text-xs text-gray-600">
              {remaining} left today
            </span>
          </div>
          {isLimitReached && (
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          )}
        </div>

        {/* Progress Indicator */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              Today
            </span>
            <span>{pagesUsedToday} / {dailyLimit}</span>
          </div>
          <Progress 
            value={percentage} 
            className="h-1.5"
          />
        </div>

        {/* Upgrade CTA */}
        {(isLimitReached || percentage > 50) && (
          <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
            <div className="flex items-start justify-between">
              <div>
                <h5 className="text-sm font-medium text-orange-900">
                  {isLimitReached ? 'Daily limit reached!' : 'Need more extractions?'}
                </h5>
                <p className="text-xs text-orange-700 mt-1">
                  Sign up free for 5 daily extractions
                </p>
              </div>
              <Button 
                size="sm" 
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1 h-auto"
                onClick={onSignUpClick}
              >
                <Crown className="h-3 w-3 mr-1" />
                Sign Up
              </Button>
            </div>
          </div>
        )}

        {/* Quick info */}
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500">
            <FileText className="h-3 w-3 inline mr-1" />
            Free accounts get 5 daily extractions
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
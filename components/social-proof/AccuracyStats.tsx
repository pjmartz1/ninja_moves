'use client'

import React, { useState, useEffect } from 'react'
import { TrendingUp, Users, Award, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import { getApiUrl } from '@/lib/config'

interface AccuracyStatsProps {
  className?: string
  variant?: 'homepage' | 'compact' | 'detailed'
}

interface SocialProofData {
  accuracy_proof: {
    rate: string
    message: string
    total_users: string
    recent_feedback: number
  }
  trust_indicators: string[]
  last_updated: string
}

export default function AccuracyStats({ 
  className = '', 
  variant = 'homepage' 
}: AccuracyStatsProps) {
  const [data, setData] = useState<SocialProofData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchAccuracyStats()
  }, [])

  const fetchAccuracyStats = async () => {
    try {
      const response = await fetch(getApiUrl('/social-proof'))
      if (response.ok) {
        const result = await response.json()
        setData(result)
      } else {
        setError(true)
      }
    } catch (error) {
      console.error('Error fetching accuracy stats:', error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-20 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  if (error || !data) {
    // Fallback display
    return (
      <div className={`bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-3">
          <Award className="w-6 h-6 text-green-600" />
          <div className="text-center">
            <div className="text-2xl font-bold text-green-800">95%+</div>
            <div className="text-sm text-green-600">Accuracy Rate</div>
          </div>
        </div>
      </div>
    )
  }

  const renderHomepageVariant = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-8 ${className}`}
    >
      <div className="text-center">
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center space-x-4 mb-6"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <div className="text-4xl font-bold text-green-800">
              {data.accuracy_proof.rate}
            </div>
            <div className="text-lg text-green-600 font-medium">
              Accuracy Rate
            </div>
          </div>
        </motion.div>
        
        <p className="text-green-700 text-lg mb-4">
          {data.accuracy_proof.message}
        </p>

        <div className="flex items-center justify-center space-x-6 text-sm text-green-600">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{data.accuracy_proof.total_users} users</span>
          </div>
          <div className="flex items-center space-x-1">
            <Target className="w-4 h-4" />
            <span>Real feedback</span>
          </div>
          <div className="flex items-center space-x-1">
            <Award className="w-4 h-4" />
            <span>Continuously improving</span>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const renderCompactVariant = () => (
    <div className={`inline-flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium ${className}`}>
      <TrendingUp className="w-4 h-4" />
      <span>{data.accuracy_proof.rate} accurate</span>
      <span>•</span>
      <Users className="w-4 h-4" />
      <span>{data.accuracy_proof.total_users} users</span>
    </div>
  )

  const renderDetailedVariant = () => (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 shadow-sm ${className}`}>
      <div className="grid grid-cols-2 gap-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {data.accuracy_proof.rate}
          </div>
          <div className="text-sm text-gray-600">Accuracy Rate</div>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {data.accuracy_proof.total_users}
          </div>
          <div className="text-sm text-gray-600">Happy Users</div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-center text-sm text-gray-600">
          {data.accuracy_proof.message}
        </p>
      </div>

      {data.accuracy_proof.recent_feedback > 0 && (
        <div className="mt-3 text-center">
          <span className="inline-flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>{data.accuracy_proof.recent_feedback} recent feedback</span>
          </span>
        </div>
      )}
    </div>
  )

  switch (variant) {
    case 'compact':
      return renderCompactVariant()
    case 'detailed':
      return renderDetailedVariant()
    default:
      return renderHomepageVariant()
  }
}
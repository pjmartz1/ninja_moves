'use client'

import React, { useState } from 'react'
import { CheckCircle2, XCircle, MessageSquare, TrendingUp, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getApiUrl } from '@/lib/config'

interface AccuracyFeedbackWidgetProps {
  fileId: string
  extractionMethod: string
  onFeedbackSubmitted?: (feedback: { isAccurate: boolean; stats: any }) => void
}

interface FeedbackStats {
  accuracy_rate: number
  total_feedback: number
  accurate_count: number
}

export default function AccuracyFeedbackWidget({ 
  fileId, 
  extractionMethod, 
  onFeedbackSubmitted 
}: AccuracyFeedbackWidgetProps) {
  const [feedback, setFeedback] = useState<boolean | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [stats, setStats] = useState<FeedbackStats | null>(null)

  const handleFeedbackSubmit = async (isAccurate: boolean) => {
    if (isSubmitted) return

    setFeedback(isAccurate)
    
    // If negative feedback, show notes option
    if (!isAccurate) {
      setShowNotes(true)
      return
    }

    await submitFeedback(isAccurate)
  }

  const submitFeedback = async (isAccurate: boolean, notes: string = '') => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`${getApiUrl('/feedback/accuracy')}?file_id=${fileId}&is_accurate=${isAccurate}&extraction_method=${extractionMethod}&additional_notes=${encodeURIComponent(notes)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const result = await response.json()
        setStats(result)
        setIsSubmitted(true)
        
        // Call callback if provided
        if (onFeedbackSubmitted) {
          onFeedbackSubmitted({
            isAccurate,
            stats: result
          })
        }
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNotesSubmit = async () => {
    if (feedback !== null) {
      await submitFeedback(feedback, additionalNotes)
    }
  }

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900">
                Thank you for your feedback!
              </h3>
              <p className="text-sm text-green-700">
                Your input helps us improve accuracy for everyone
              </p>
            </div>
          </div>
          
          {/* Social Proof Display */}
          {stats && (
            <div className="text-right">
              <div className="flex items-center space-x-2 text-green-800">
                <TrendingUp className="w-4 h-4" />
                <span className="font-bold text-lg">
                  {stats.accuracy_rate.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-green-600">
                <Users className="w-3 h-3" />
                <span>{stats.total_feedback} users</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <CheckCircle2 className="w-6 h-6 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Table extracted successfully!
          </h3>
        </div>

        <p className="text-gray-600 mb-6">
          Was this table extraction accurate?
        </p>

        <AnimatePresence mode="wait">
          {!showNotes ? (
            <motion.div 
              key="buttons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center space-x-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFeedbackSubmit(true)}
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Yes, looks good</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFeedbackSubmit(false)}
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <XCircle className="w-5 h-5" />
                <span>Needs work</span>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="text-left">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What went wrong? (Optional)
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="e.g., Missing columns, incorrect data, formatting issues..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={handleNotesSubmit}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</span>
                </button>

                <button
                  onClick={() => submitFeedback(false, '')}
                  disabled={isSubmitting}
                  className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Skip
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Social Proof Teaser */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 pt-4 border-t border-orange-200"
        >
          <p className="text-xs text-gray-500">
            📊 Join thousands of users helping us maintain 95%+ accuracy
          </p>
        </motion.div>
      </div>
    </div>
  )
}
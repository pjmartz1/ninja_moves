'use client'

import { useEffect, useState } from 'react'
import { SparklesIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

interface ProgressBarProps {
  progress: number
  className?: string
}

export default function ProgressBar({ progress, className = '' }: ProgressBarProps) {
  const [displayProgress, setDisplayProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Animate progress changes
    setIsAnimating(true)
    const timer = setTimeout(() => {
      setDisplayProgress(progress)
      setIsAnimating(false)
    }, 100)

    // Update status message based on progress
    if (progress === 0) {
      setStatusMessage('Ready to process...')
    } else if (progress < 20) {
      setStatusMessage('🔍 Validating PDF file...')
    } else if (progress < 40) {
      setStatusMessage('📊 Analyzing document structure...')
    } else if (progress < 60) {
      setStatusMessage('🎯 Detecting tables...')
    } else if (progress < 80) {
      setStatusMessage('⚡ Extracting table data...')
    } else if (progress < 100) {
      setStatusMessage('✨ Finalizing results...')
    } else {
      setStatusMessage('🎉 Processing complete!')
    }

    return () => clearTimeout(timer)
  }, [progress])

  const getProgressColor = () => {
    if (progress === 100) return 'from-emerald-500 to-green-500'
    if (progress >= 80) return 'from-amber-500 to-yellow-500'
    return 'from-orange-500 to-amber-500'
  }

  return (
    <div className={`w-full animate-slide-up ${className}`}>
      {/* Premium header with status */}
      <div className="bg-gradient-to-r from-orange-25 to-amber-25 rounded-2xl p-6 border border-orange-100 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className={`bg-gradient-to-br ${getProgressColor()} rounded-full p-2 shadow-medium ${progress > 0 && progress < 100 ? 'animate-pulse-subtle' : ''}`}>
                {progress === 100 ? (
                  <CheckCircleIcon className="h-5 w-5 text-white" />
                ) : progress > 0 ? (
                  <SparklesIcon className="h-5 w-5 text-white animate-bounce-subtle" />
                ) : (
                  <ClockIcon className="h-5 w-5 text-white" />
                )}
              </div>
              {progress > 0 && progress < 100 && (
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full opacity-20 animate-glow"></div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {progress === 100 ? 'Success!' : progress > 0 ? 'Processing...' : 'Ready'}
              </h3>
              <p className="text-sm font-medium text-gray-600 animate-fade-in">
                {statusMessage}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              {Math.round(displayProgress)}%
            </div>
            <div className="text-xs text-gray-500 font-medium">
              {progress === 100 ? 'Complete' : progress > 0 ? 'In Progress' : 'Waiting'}
            </div>
          </div>
        </div>
        
        {/* Premium progress bar */}
        <div className="relative">
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-700 ease-out rounded-full shadow-sm ${isAnimating ? 'animate-shimmer' : ''}`}
              style={{ 
                width: `${displayProgress}%`,
                backgroundImage: progress > 0 && progress < 100 ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)' : undefined,
                backgroundSize: progress > 0 && progress < 100 ? '200px 100%' : undefined,
                animation: progress > 0 && progress < 100 ? 'shimmer 2s infinite' : undefined,
              }}
              role="progressbar"
              aria-valuenow={displayProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          {/* Progress indicator dots */}
          <div className="absolute -top-1 flex justify-between w-full">
            {[25, 50, 75].map((milestone) => (
              <div
                key={milestone}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  displayProgress >= milestone 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-glow-orange scale-110' 
                    : 'bg-gray-300'
                }`}
                style={{ marginLeft: `${milestone}%`, transform: 'translateX(-50%)' }}
              />
            ))}
          </div>
        </div>
        
        {/* Processing details */}
        {progress > 0 && progress < 100 && (
          <div className="mt-6 space-y-3 animate-fade-in">
            {/* Processing animation with premium spinner */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-8 h-8 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin shadow-medium"></div>
                <div className="absolute inset-0 w-8 h-8 border-3 border-transparent border-b-amber-500 rounded-full animate-spin animation-delay-500"></div>
              </div>
              <span className="ml-3 text-base font-medium text-gray-700">
                AI is analyzing your PDF...
              </span>
            </div>
            
            {/* Estimated time remaining with premium styling */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 text-center border border-orange-100">
              <div className="flex items-center justify-center space-x-2">
                <ClockIcon className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-semibold text-gray-700">
                  Estimated time: {Math.max(1, Math.ceil((100 - progress) / 10))} seconds
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Processing at lightning speed ⚡
              </div>
            </div>
          </div>
        )}

        {/* Success state */}
        {progress === 100 && (
          <div className="mt-6 animate-scale-in">
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center justify-center space-x-3">
                <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
                <span className="text-lg font-bold text-emerald-800">
                  Tables extracted successfully!
                </span>
              </div>
              <div className="text-center mt-2">
                <span className="text-sm text-emerald-700 font-medium">
                  Your data is ready for download below
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
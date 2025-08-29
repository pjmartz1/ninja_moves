'use client'

import React, { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import FileUploaderTwoColumn from '@/components/upload/FileUploaderTwoColumn'
import ProgressBar from '@/components/upload/ProgressBar'
import DownloadButtons from '@/components/results/DownloadButtons'
import AuthModal from '@/components/auth/AuthModal'
import UserDashboard from '@/components/auth/UserDashboard'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { SimpleHero } from '@/components/ui/simple-hero'
import { SimpleFeatures } from '@/components/ui/simple-features'
import AccuracyFeedbackWidget from '@/components/feedback/AccuracyFeedbackWidget'
import AccuracyStats from '@/components/social-proof/AccuracyStats'
import { getApiUrl, apiRequest } from '@/lib/config'
import { Zap, Target, ShieldCheck } from 'lucide-react'

export default function HomePage() {
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authView, setAuthView] = useState<'sign_in' | 'sign_up'>('sign_in')
  const [showUserDashboard, setShowUserDashboard] = useState(false)

  const handleSignInClick = () => {
    setAuthView('sign_in')
    setShowAuthModal(true)
  }

  const handleSignUpClick = () => {
    setAuthView('sign_up')
    setShowAuthModal(true)
  }

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true)
    setProcessingProgress(0)
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(getApiUrl('/extract'), {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setExtractedData(data)
        setProcessingProgress(100)
      } else {
        throw new Error('Extraction failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsProcessing(false)
      clearInterval(progressInterval)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header - upgraded to shadcn/ui but preserving all text and styling */}
      <Header 
        onSignInClick={handleSignInClick}
        onSignUpClick={handleSignUpClick}
      />

      {/* Hero Section with Simple Implementation */}
      <SimpleHero 
        backgroundVariant="orange"
        waveColor="#f97316"
      />

      {/* User Dashboard & Upload Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Upload Your PDF Document</h2>
          {/* User Dashboard - Show when logged in */}
          {user && (
            <div className="mb-8">
              <UserDashboard />
            </div>
          )}
          
          {!isProcessing && !extractedData && (
            <FileUploaderTwoColumn onFileUpload={handleFileUpload} />
          )}
          
          {isProcessing && (
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100">
              <ProgressBar progress={processingProgress} />
            </div>
          )}
          
          {extractedData && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100">
                <DownloadButtons tables={extractedData.tables || []} processingTime={extractedData.processing_time || 0} />
              </div>
              
              {/* Accuracy Feedback Widget */}
              <AccuracyFeedbackWidget
                fileId={extractedData.file_id || 'unknown'}
                extractionMethod={extractedData.extraction_method || 'unknown'}
                onFeedbackSubmitted={(feedback) => {
                  console.log('Feedback submitted:', feedback)
                }}
              />
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Why Choose PDF2Excel.app</h2>
          <SimpleFeatures
            features={[
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Extract tables in under 1 second with our optimized AI engine powered by advanced algorithms"
              },
              {
                icon: ShieldCheck,
                title: "Enterprise Secure",
                description: "Files auto-deleted after processing with enterprise-grade security and privacy protection"
              },
              {
                icon: Target,
                title: "95%+ Accuracy",
                description: "Advanced AI algorithms ensure precise table structure recognition across all document types"
              }
            ]}
          />
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        view={authView}
      />
    </main>
  )
}

function OriginalHomePage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authView, setAuthView] = useState<'sign_in' | 'sign_up'>('sign_in')

  const handleSignInClick = () => {
    setAuthView('sign_in')
    setShowAuthModal(true)
  }

  const handleSignUpClick = () => {
    setAuthView('sign_up')
    setShowAuthModal(true)
  }

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true)
    setProcessingProgress(0)
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(getApiUrl('/extract'), {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setExtractedData(data)
        setProcessingProgress(100)
      } else {
        throw new Error('Extraction failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsProcessing(false)
      clearInterval(progressInterval)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header - upgraded to shadcn/ui but preserving all text and styling */}
      <Header 
        onSignInClick={handleSignInClick}
        onSignUpClick={handleSignUpClick}
      />

      {/* Hero Section with Simple Implementation */}
      <SimpleHero 
        backgroundVariant="orange"
        waveColor="#f97316"
      />

      {/* Upload Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {!isProcessing && !extractedData && (
            <FileUploaderTwoColumn onFileUpload={handleFileUpload} />
          )}
          
          {isProcessing && (
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100">
              <ProgressBar progress={processingProgress} />
            </div>
          )}
          
          {extractedData && (
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100">
              <DownloadButtons tables={extractedData.tables || []} processingTime={extractedData.processing_time || 0} />
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <SimpleFeatures
        features={[
          {
            icon: Zap,
            title: "Lightning Fast",
            description: "Extract tables in under 30 seconds with our optimized AI engine powered by advanced algorithms"
          },
          {
            icon: Target,
            title: "95%+ Accuracy", 
            description: "Advanced AI algorithms ensure precise table structure recognition across all document types"
          },
          {
            icon: ShieldCheck,
            title: "Enterprise Secure",
            description: "Files auto-deleted after processing with enterprise-grade security and privacy protection"
          }
        ]}
      />

      {/* Modals */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        view={authView}
      />
    </main>
  )
}
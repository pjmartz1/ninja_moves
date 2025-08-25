'use client'

import React, { useState } from 'react'
import FileUploader from '@/components/upload/FileUploader'
import ProgressBar from '@/components/upload/ProgressBar'
import DownloadButtons from '@/components/results/DownloadButtons'
import AuthModal from '@/components/auth/AuthModal'
import UserDashboard from '@/components/auth/UserDashboard'
import Header from '@/components/layout/Header'
import { SimpleHero } from '@/components/ui/simple-hero'
import { SimpleFeatures } from '@/components/ui/simple-features'
import { Zap, Target, ShieldCheck } from 'lucide-react'

export default function OldDesignPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

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

      const response = await fetch('http://localhost:8000/extract', {
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
      <Header />

      {/* Hero Section with Simple Implementation */}
      <SimpleHero 
        backgroundVariant="orange"
        waveColor="#f97316"
      />

      {/* Upload Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {!isProcessing && !extractedData && (
            <FileUploader onFileUpload={handleFileUpload} />
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
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </main>
  )
}
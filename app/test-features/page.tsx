'use client'

import React from 'react'
import { AnimatedFeatureIcon } from '@/components/ui/animated-feature-icon'
import { Zap, Target, ShieldCheck } from 'lucide-react'

export default function TestFeaturesPage() {
  console.log('TestFeaturesPage rendering...')
  
  try {
    return (
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-8">
        <h1 className="text-2xl font-bold text-center mb-8">Features Section Test</h1>
        
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <AnimatedFeatureIcon
                icon={Zap}
                title="Lightning Fast"
                description="Extract tables in under 30 seconds with our optimized AI engine powered by advanced algorithms"
                delay={0.2}
              />
              
              <AnimatedFeatureIcon
                icon={Target}
                title="95%+ Accuracy"
                description="Advanced AI algorithms ensure precise table structure recognition across all document types"
                delay={0.4}
              />
              
              <AnimatedFeatureIcon
                icon={ShieldCheck}
                title="Enterprise Secure"
                description="Files auto-deleted after processing with enterprise-grade security and privacy protection"
                delay={0.6}
              />
            </div>
          </div>
        </div>
        
        <p className="text-center text-lg mt-8">If you see three animated feature cards above, AnimatedFeatureIcon works!</p>
      </main>
    )
  } catch (error) {
    console.error('Error rendering AnimatedFeatureIcon:', error)
    return <div className="p-8 text-red-500">ERROR: AnimatedFeatureIcon failed to render - {String(error)}</div>
  }
}
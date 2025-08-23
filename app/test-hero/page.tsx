'use client'

import React from 'react'
import { PDFTableProHero } from '@/components/ui/hero-highlight-demo'

export default function TestHeroPage() {
  console.log('TestHeroPage rendering...')
  
  try {
    return (
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-center mb-4">Hero Component Test</h1>
          
          <PDFTableProHero 
            backgroundVariant="orange"
            waveColor="#f97316"
          />
          
          <p className="text-center text-lg mt-8">If you see an interactive hero section above, it works!</p>
        </div>
      </main>
    )
  } catch (error) {
    console.error('Error rendering PDFTableProHero:', error)
    return <div className="p-8 text-red-500">ERROR: Hero component failed to render - {String(error)}</div>
  }
}
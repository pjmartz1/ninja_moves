'use client'

import React from 'react'
import Header from '@/components/layout/Header'

export default function TestHeaderPage() {
  console.log('TestHeaderPage rendering...')
  
  try {
    return (
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <Header onSignInClick={() => console.log('Sign in clicked')} />
        
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-center mb-8">Header Test</h1>
          <p className="text-center text-lg">If you see the header above, it works!</p>
        </div>
      </main>
    )
  } catch (error) {
    console.error('Error rendering Header:', error)
    return <div className="p-8 text-red-500">ERROR: Header failed to render - {String(error)}</div>
  }
}
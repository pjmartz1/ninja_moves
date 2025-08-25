'use client'

import React, { useState } from 'react'
import PricingSection from '@/components/pricing/PricingSection'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AuthModal from '@/components/auth/AuthModal'

export default function PricingPageClient() {
  const [showAuthModal, setShowAuthModal] = useState(false)

  return (
    <main className="min-h-screen bg-white">
      {/* Header with consistent navigation */}
      <Header onSignInClick={() => setShowAuthModal(true)} />
      
      {/* Pricing Section */}
      <PricingSection />
      
      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </main>
  )
}
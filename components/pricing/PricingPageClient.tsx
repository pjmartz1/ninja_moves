'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import PricingSection from '@/components/pricing/PricingSection'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AuthModal from '@/components/auth/AuthModal'
import { useAuth } from '@/components/auth/AuthProvider'
import { getStripe } from '@/lib/stripe'
import { toast } from 'sonner'
import type { PricingPlan } from '@/lib/stripe'

export default function PricingPageClient() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<PricingPlan | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  const handleSelectPlan = async (plan: PricingPlan) => {
    // Handle free plan - just open auth modal for registration
    if (plan === 'FREE') {
      if (!user) {
        setShowAuthModal(true)
        return
      }
      // User is already logged in, redirect to dashboard
      router.push('/dashboard')
      return
    }

    // Handle paid plans
    if (!user) {
      // User needs to authenticate first
      toast.error('Please sign in to upgrade to a paid plan')
      setShowAuthModal(true)
      return
    }

    try {
      setLoadingPlan(plan)
      
      // Create Stripe checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe checkout
      const stripe = await getStripe()
      if (!stripe) {
        throw new Error('Stripe failed to initialize')
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error(error instanceof Error ? error.message : 'Payment failed. Please try again.')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header with consistent navigation */}
      <Header />
      
      {/* Pricing Section */}
      <PricingSection onSelectPlan={handleSelectPlan} loadingPlan={loadingPlan} />
      
      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </main>
  )
}
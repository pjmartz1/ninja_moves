import { loadStripe, Stripe as StripeJS } from '@stripe/stripe-js'
import Stripe from 'stripe'

// Frontend Stripe instance
let stripePromise: Promise<StripeJS | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

// Backend Stripe instance (for API routes)
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
      typescript: true,
    })
  : null

// Pricing configuration matching our CLAUDE.md strategy
export const PRICING_PLANS = {
  FREE: {
    name: 'Free',
    description: 'Perfect for trying out PDFTablePro',
    price: 0,
    interval: null,
    features: [
      '5 PDF pages daily',
      '50 pages monthly',
      'All export formats (CSV, Excel, JSON)',
      'Email support',
      'Usage dashboard'
    ],
    limits: {
      daily: 5,
      monthly: 50,
    },
    stripePriceId: null,
    popular: false,
  },
  STARTER: {
    name: 'Starter',
    description: 'Great for individuals and small teams',
    price: 1999, // $19.99 in cents
    interval: 'month',
    features: [
      '500 pages/month',
      'All export formats',
      'Batch processing (up to 3 files)',
      'Email support',
      'Usage analytics',
      '25% more pages vs competitors'
    ],
    limits: {
      daily: 50,
      monthly: 500,
    },
    stripePriceId: 'price_starter_monthly', // To be replaced with actual Stripe price ID
    popular: false,
  },
  PROFESSIONAL: {
    name: 'Professional',
    description: 'Perfect for growing businesses',
    price: 4999, // $49.99 in cents
    interval: 'month',
    features: [
      '1,500 pages/month',
      'Unlimited batch processing',
      'API access (5,000 calls/month)',
      'Priority processing (<15 seconds)',
      'Advanced table detection',
      '50% more pages vs competitors'
    ],
    limits: {
      daily: 150,
      monthly: 1500,
    },
    stripePriceId: 'price_professional_monthly',
    popular: true,
  },
  BUSINESS: {
    name: 'Business',
    description: 'For teams processing large volumes',
    price: 7999, // $79.99 in cents
    interval: 'month',
    features: [
      '5,000 pages/month',
      'Full API access (25,000 calls/month)',
      'White-label options',
      'Custom integrations',
      'Phone + email support',
      '25% more pages vs competitors'
    ],
    limits: {
      daily: 500,
      monthly: 5000,
    },
    stripePriceId: 'price_business_monthly',
    popular: false,
  },
} as const

export type PricingPlan = keyof typeof PRICING_PLANS
export type PricingPlanConfig = typeof PRICING_PLANS[PricingPlan]

// Utility functions
export function formatPrice(priceInCents: number): string {
  if (priceInCents === 0) return 'Free'
  return `$${(priceInCents / 100).toFixed(2)}`
}

export function getPlanByStripePriceId(stripePriceId: string): PricingPlan | null {
  for (const [key, plan] of Object.entries(PRICING_PLANS)) {
    if (plan.stripePriceId === stripePriceId) {
      return key as PricingPlan
    }
  }
  return null
}

export function getUserTierLimits(tier: string): { daily: number; monthly: number } {
  const plan = PRICING_PLANS[tier as PricingPlan]
  return plan ? plan.limits : PRICING_PLANS.FREE.limits
}
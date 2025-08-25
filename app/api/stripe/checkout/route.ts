import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRICING_PLANS, type PricingPlan } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment processing is not configured. Please contact support.' },
        { status: 503 }
      )
    }

    const { plan, userId } = await request.json()

    // Validate plan
    if (!plan || !PRICING_PLANS[plan as PricingPlan]) {
      return NextResponse.json(
        { error: 'Invalid pricing plan' },
        { status: 400 }
      )
    }

    // Validate user authentication
    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      )
    }

    const planConfig = PRICING_PLANS[plan as PricingPlan]

    // Handle free plan (no Stripe checkout needed)
    if (plan === 'FREE') {
      // Update user profile to free tier
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          tier: 'free',
          stripe_customer_id: null,
          stripe_subscription_id: null,
        })

      if (error) {
        console.error('Error updating user profile:', error)
        return NextResponse.json(
          { error: 'Failed to update user profile' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Successfully downgraded to free plan'
      })
    }

    // Get or create Stripe customer
    let customerId: string

    // Check if user already has a Stripe customer ID
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    if (userProfile?.stripe_customer_id) {
      customerId = userProfile.stripe_customer_id
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: userProfile?.email || undefined,
        metadata: {
          supabase_user_id: userId,
        },
      })
      customerId = customer.id

      // Update user profile with customer ID
      await supabase
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      line_items: [
        {
          price: planConfig.stripePriceId!,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.nextUrl.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/pricing?cancelled=true`,
      metadata: {
        supabase_user_id: userId,
        plan: plan,
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
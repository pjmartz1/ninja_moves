import { NextRequest, NextResponse } from 'next/server'
import { stripe, getPlanByStripePriceId } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  // Initialize Supabase client for server-side operations (inside function to avoid build-time errors)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
  // Check if Stripe is configured
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe webhook processing not available' },
      { status: 503 }
    )
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.supabase_user_id
        const plan = session.metadata?.plan

        if (!userId || !plan) {
          console.error('Missing user ID or plan in session metadata')
          break
        }

        // Update user profile with subscription info
        const { error } = await supabase
          .from('user_profiles')
          .upsert({
            id: userId,
            tier: plan.toLowerCase(),
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          })

        if (error) {
          console.error('Error updating user profile:', error)
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by customer ID
        const { data: userProfile, error: findError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (findError || !userProfile) {
          console.error('User not found for customer:', customerId)
          break
        }

        // Get plan from subscription
        const priceId = subscription.items.data[0]?.price?.id
        const plan = getPlanByStripePriceId(priceId)

        if (!plan) {
          console.error('Plan not found for price ID:', priceId)
          break
        }

        // Update user profile
        const { error } = await supabase
          .from('user_profiles')
          .update({
            tier: plan.toLowerCase(),
            stripe_subscription_id: subscription.id,
          })
          .eq('id', userProfile.id)

        if (error) {
          console.error('Error updating user subscription:', error)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by customer ID
        const { data: userProfile, error: findError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (findError || !userProfile) {
          console.error('User not found for customer:', customerId)
          break
        }

        // Downgrade to free plan
        const { error } = await supabase
          .from('user_profiles')
          .update({
            tier: 'free',
            stripe_subscription_id: null,
          })
          .eq('id', userProfile.id)

        if (error) {
          console.error('Error downgrading user to free:', error)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Reset monthly usage for successful payment
        const { data: userProfile, error: findError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (findError || !userProfile) {
          console.error('User not found for customer:', customerId)
          break
        }

        // Reset monthly usage
        const currentDate = new Date()
        const { error } = await supabase
          .from('user_profiles')
          .update({
            pages_used_month: 0,
            last_reset_date: currentDate.toISOString().split('T')[0],
          })
          .eq('id', userProfile.id)

        if (error) {
          console.error('Error resetting monthly usage:', error)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`Payment failed for invoice: ${invoice.id}`)
        // Could implement email notifications or grace period logic here
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
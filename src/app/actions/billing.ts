'use server'

import Stripe from 'stripe'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

function getPlatformStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  return new Stripe(key, { typescript: true })
}

export async function createCheckoutSessionAction(): Promise<{
  url?: string
  error?: string
}> {
  const user = await currentUser()
  if (!user) return { error: 'Not authenticated' }

  const dbUser = await db.user.findUniqueOrThrow({ where: { clerkId: user.id } })

  const priceId = process.env.STRIPE_PRICE_ID
  if (!priceId) return { error: 'Billing is not configured' }

  const stripe = getPlatformStripeClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  let stripeCustomerId = dbUser.stripeCustomerId
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({ email: dbUser.email })
    stripeCustomerId = customer.id
    await db.user.update({
      where: { id: dbUser.id },
      data: { stripeCustomerId },
    })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: { trial_period_days: 14 },
    success_url: `${appUrl}/billing/success`,
    cancel_url: `${appUrl}/billing/cancel`,
  })

  return { url: session.url ?? undefined }
}

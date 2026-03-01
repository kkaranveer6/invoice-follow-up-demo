import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'

export async function POST(req: NextRequest): Promise<Response> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return new Response('Webhook secret not configured', { status: 500 })
  }

  const sig = req.headers.get('stripe-signature')
  if (!sig) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY ?? ''
  const stripe = new Stripe(stripeKey, { typescript: true })

  const rawBody = await req.text()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  const subscription = event.data.object as Stripe.Subscription

  if (
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.updated'
  ) {
    await db.user.update({
      where: { stripeCustomerId: subscription.customer as string },
      data: { subscriptionStatus: subscription.status },
    })
  }

  if (event.type === 'customer.subscription.deleted') {
    await db.user.update({
      where: { stripeCustomerId: subscription.customer as string },
      data: { subscriptionStatus: 'inactive' },
    })
  }

  return new Response('OK', { status: 200 })
}

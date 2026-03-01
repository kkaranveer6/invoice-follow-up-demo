import { describe, it, expect, vi, beforeEach } from 'vitest'

const { MockStripe, mockConstructEvent } = vi.hoisted(() => {
  const mockConstructEvent = vi.fn()
  const MockStripe = vi.fn().mockImplementation(() => ({
    webhooks: { constructEvent: mockConstructEvent },
  }))
  return { MockStripe, mockConstructEvent }
})
vi.mock('stripe', () => ({ default: MockStripe }))

vi.mock('@/lib/db', () => ({
  db: {
    user: {
      update: vi.fn().mockResolvedValue({}),
    },
  },
}))

import { POST } from './route'
import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

function makeRequest(sig = 'test-sig') {
  return new NextRequest('http://localhost:3000/api/webhooks/stripe', {
    method: 'POST',
    body: JSON.stringify({ type: 'customer.subscription.created' }),
    headers: { 'stripe-signature': sig },
  })
}

function makeSubscriptionEvent(type: string, status: string, customerId = 'cus_123') {
  return {
    type,
    data: {
      object: {
        customer: customerId,
        status,
      },
    },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.STRIPE_SECRET_KEY = 'sk_test_platform_key'
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret'
})

describe('POST /api/webhooks/stripe', () => {
  it('returns 400 if stripe-signature header is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      body: '{}',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 if signature verification fails', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('No signatures found matching the expected signature for payload')
    })

    const res = await POST(makeRequest())
    expect(res.status).toBe(400)
  })

  it('returns 500 if STRIPE_WEBHOOK_SECRET is not set', async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET

    const res = await POST(makeRequest())
    expect(res.status).toBe(500)
  })

  it('sets subscriptionStatus from event on customer.subscription.created', async () => {
    mockConstructEvent.mockReturnValue(
      makeSubscriptionEvent('customer.subscription.created', 'trialing'),
    )

    const res = await POST(makeRequest())

    expect(res.status).toBe(200)
    expect(db.user.update).toHaveBeenCalledWith({
      where: { stripeCustomerId: 'cus_123' },
      data: { subscriptionStatus: 'trialing' },
    })
  })

  it('syncs subscriptionStatus on customer.subscription.updated', async () => {
    mockConstructEvent.mockReturnValue(
      makeSubscriptionEvent('customer.subscription.updated', 'active'),
    )

    const res = await POST(makeRequest())

    expect(res.status).toBe(200)
    expect(db.user.update).toHaveBeenCalledWith({
      where: { stripeCustomerId: 'cus_123' },
      data: { subscriptionStatus: 'active' },
    })
  })

  it('sets subscriptionStatus to inactive on customer.subscription.deleted', async () => {
    mockConstructEvent.mockReturnValue(
      makeSubscriptionEvent('customer.subscription.deleted', 'canceled'),
    )

    const res = await POST(makeRequest())

    expect(res.status).toBe(200)
    expect(db.user.update).toHaveBeenCalledWith({
      where: { stripeCustomerId: 'cus_123' },
      data: { subscriptionStatus: 'inactive' },
    })
  })

  it('returns 200 and does nothing for unhandled event types', async () => {
    mockConstructEvent.mockReturnValue({ type: 'payment_intent.created', data: { object: {} } })

    const res = await POST(makeRequest())

    expect(res.status).toBe(200)
    expect(db.user.update).not.toHaveBeenCalled()
  })
})

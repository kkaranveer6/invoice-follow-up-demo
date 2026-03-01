import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@clerk/nextjs/server', () => ({
  currentUser: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUniqueOrThrow: vi.fn(),
      update: vi.fn(),
    },
  },
}))

const { MockStripe, mockCustomersCreate, mockSessionsCreate } = vi.hoisted(() => {
  const mockCustomersCreate = vi.fn()
  const mockSessionsCreate = vi.fn()
  const MockStripe = vi.fn().mockImplementation(() => ({
    customers: { create: mockCustomersCreate },
    checkout: { sessions: { create: mockSessionsCreate } },
  }))
  return { MockStripe, mockCustomersCreate, mockSessionsCreate }
})
vi.mock('stripe', () => ({ default: MockStripe }))

import { createCheckoutSessionAction } from './billing'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

const mockDbUser = {
  id: 'user_1',
  clerkId: 'clerk_1',
  email: 'test@example.com',
  stripeCustomerId: null,
  subscriptionStatus: 'inactive',
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.STRIPE_SECRET_KEY = 'sk_test_platform_key'
  process.env.STRIPE_PRICE_ID = 'price_test_123'
  process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'
})

describe('createCheckoutSessionAction', () => {
  it('returns error if user is not authenticated', async () => {
    vi.mocked(currentUser).mockResolvedValue(null)

    const result = await createCheckoutSessionAction()
    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('creates a Stripe customer if one does not exist, then creates checkout session', async () => {
    vi.mocked(currentUser).mockResolvedValue({ id: 'clerk_1' } as never)
    vi.mocked(db.user.findUniqueOrThrow).mockResolvedValue(mockDbUser)
    vi.mocked(db.user.update).mockResolvedValue({ ...mockDbUser, stripeCustomerId: 'cus_new' })
    mockCustomersCreate.mockResolvedValue({ id: 'cus_new' })
    mockSessionsCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/session_abc' })

    const result = await createCheckoutSessionAction()

    expect(mockCustomersCreate).toHaveBeenCalledWith({ email: 'test@example.com' })
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: 'user_1' },
      data: { stripeCustomerId: 'cus_new' },
    })
    expect(mockSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'subscription',
        customer: 'cus_new',
        subscription_data: { trial_period_days: 14 },
        success_url: 'https://example.com/billing/success',
        cancel_url: 'https://example.com/billing/cancel',
      }),
    )
    expect(result).toEqual({ url: 'https://checkout.stripe.com/session_abc' })
  })

  it('reuses existing stripeCustomerId without creating a new customer', async () => {
    vi.mocked(currentUser).mockResolvedValue({ id: 'clerk_1' } as never)
    vi.mocked(db.user.findUniqueOrThrow).mockResolvedValue({
      ...mockDbUser,
      stripeCustomerId: 'cus_existing',
    })
    mockSessionsCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/session_xyz' })

    await createCheckoutSessionAction()

    expect(mockCustomersCreate).not.toHaveBeenCalled()
    expect(mockSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ customer: 'cus_existing' }),
    )
  })

  it('returns error if STRIPE_PRICE_ID is not set', async () => {
    delete process.env.STRIPE_PRICE_ID
    vi.mocked(currentUser).mockResolvedValue({ id: 'clerk_1' } as never)
    vi.mocked(db.user.findUniqueOrThrow).mockResolvedValue({
      ...mockDbUser,
      stripeCustomerId: 'cus_existing',
    })

    const result = await createCheckoutSessionAction()
    expect(result).toEqual({ error: 'Billing is not configured' })
  })
})

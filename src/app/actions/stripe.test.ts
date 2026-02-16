import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@clerk/nextjs/server', () => ({
  currentUser: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUniqueOrThrow: vi.fn(),
      update: vi.fn().mockResolvedValue({}),
    },
  },
}))

vi.mock('@/lib/crypto', () => ({
  encrypt: vi.fn().mockReturnValue('encrypted_key_data'),
}))

const { MockStripe, mockRetrieve } = vi.hoisted(() => {
  const mockRetrieve = vi.fn()
  const MockStripe = vi.fn().mockImplementation(() => ({
    accounts: { retrieve: mockRetrieve },
  }))
  return { MockStripe, mockRetrieve }
})
vi.mock('stripe', () => ({
  default: MockStripe,
}))

import { connectStripeAccount, disconnectStripeAccount } from './stripe'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { encrypt } from '@/lib/crypto'

const mockUser = {
  id: 'user_1',
  clerkId: 'clerk_1',
  email: 'test@example.com',
  stripeApiKey: null,
  stripeConnected: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
}

describe('connectStripeAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns error if user is not authenticated', async () => {
    vi.mocked(currentUser).mockResolvedValue(null)

    const result = await connectStripeAccount('sk_test_abc')
    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('returns error if key does not start with sk_', async () => {
    vi.mocked(currentUser).mockResolvedValue({ id: 'clerk_1' } as unknown as Awaited<ReturnType<typeof currentUser>>)
    vi.mocked(db.user.findUniqueOrThrow).mockResolvedValue(mockUser)

    const result = await connectStripeAccount('pk_test_abc')
    expect(result).toEqual({
      error:
        'Invalid API key format. Must be a Stripe secret key (starts with sk_).',
    })
  })

  it('returns error if Stripe API key is invalid', async () => {
    vi.mocked(currentUser).mockResolvedValue({ id: 'clerk_1' } as unknown as Awaited<ReturnType<typeof currentUser>>)
    vi.mocked(db.user.findUniqueOrThrow).mockResolvedValue(mockUser)
    mockRetrieve.mockRejectedValue(new Error('Invalid API Key'))

    const result = await connectStripeAccount('sk_test_invalid')
    expect(result).toEqual({
      error:
        'Invalid Stripe API key. Could not connect to your Stripe account.',
    })
  })

  it('encrypts key and saves on success', async () => {
    vi.mocked(currentUser).mockResolvedValue({ id: 'clerk_1' } as unknown as Awaited<ReturnType<typeof currentUser>>)
    vi.mocked(db.user.findUniqueOrThrow).mockResolvedValue(mockUser)
    mockRetrieve.mockResolvedValue({ id: 'acct_123' })

    const result = await connectStripeAccount('sk_test_valid123')

    expect(encrypt).toHaveBeenCalledWith('sk_test_valid123')
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: 'user_1' },
      data: {
        stripeApiKey: 'encrypted_key_data',
        stripeConnected: true,
      },
    })
    expect(result).toEqual({ success: true })
  })
})

describe('disconnectStripeAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns error if user is not authenticated', async () => {
    vi.mocked(currentUser).mockResolvedValue(null)

    const result = await disconnectStripeAccount()
    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('clears Stripe key and sets stripeConnected to false', async () => {
    vi.mocked(currentUser).mockResolvedValue({ id: 'clerk_1' } as unknown as Awaited<ReturnType<typeof currentUser>>)
    vi.mocked(db.user.findUniqueOrThrow).mockResolvedValue({
      ...mockUser,
      stripeApiKey: 'encrypted_key_data',
      stripeConnected: true,
    })

    const result = await disconnectStripeAccount()

    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: 'user_1' },
      data: {
        stripeApiKey: null,
        stripeConnected: false,
      },
    })
    expect(result).toEqual({ success: true })
  })
})

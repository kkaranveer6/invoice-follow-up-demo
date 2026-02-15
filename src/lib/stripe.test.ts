import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUniqueOrThrow: vi.fn(),
    },
  },
}))

vi.mock('@/lib/crypto', () => ({
  decrypt: vi.fn(),
}))

const { MockStripe } = vi.hoisted(() => ({
  MockStripe: vi.fn(),
}))
vi.mock('stripe', () => ({
  default: MockStripe,
}))

import { getStripeClient } from './stripe'
import { db } from '@/lib/db'
import { decrypt } from '@/lib/crypto'

describe('getStripeClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws if user has no Stripe API key', async () => {
    vi.mocked(db.user.findUniqueOrThrow).mockResolvedValue({
      id: 'user_1',
      clerkId: 'clerk_1',
      email: 'test@example.com',
      stripeApiKey: null,
      stripeConnected: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    })

    await expect(getStripeClient('user_1')).rejects.toThrow(
      'No Stripe API key',
    )
  })

  it('decrypts the key and creates a Stripe client', async () => {
    vi.mocked(db.user.findUniqueOrThrow).mockResolvedValue({
      id: 'user_1',
      clerkId: 'clerk_1',
      email: 'test@example.com',
      stripeApiKey: 'encrypted_key_data',
      stripeConnected: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    })
    vi.mocked(decrypt).mockReturnValue('sk_test_decrypted123')

    const client = await getStripeClient('user_1')

    expect(decrypt).toHaveBeenCalledWith('encrypted_key_data')
    expect(MockStripe).toHaveBeenCalledWith('sk_test_decrypted123', {
      typescript: true,
    })
    expect(client).toBeDefined()
  })
})

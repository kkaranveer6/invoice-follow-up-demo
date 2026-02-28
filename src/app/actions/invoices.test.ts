import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCurrentUser = vi.hoisted(() => vi.fn())
const mockInvoicesList = vi.hoisted(() => vi.fn())
const mockDbUserFindUniqueOrThrow = vi.hoisted(() => vi.fn())
const mockDbUserUpdate = vi.hoisted(() => vi.fn())
const mockDbInvoiceUpsert = vi.hoisted(() => vi.fn())
const mockMarkOverdueInvoices = vi.hoisted(() => vi.fn())

vi.mock('@clerk/nextjs/server', () => ({ currentUser: mockCurrentUser }))

vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUniqueOrThrow: mockDbUserFindUniqueOrThrow,
      update: mockDbUserUpdate,
    },
    invoice: {
      upsert: mockDbInvoiceUpsert,
    },
  },
}))

vi.mock('@/lib/stripe', () => ({
  getStripeClient: vi.fn().mockResolvedValue({
    invoices: { list: mockInvoicesList },
  }),
}))

vi.mock('@/lib/invoices', () => ({
  markOverdueInvoices: mockMarkOverdueInvoices,
}))

import { syncInvoicesAction } from './invoices'

const mockDbUser = {
  id: 'user_1',
  clerkId: 'clerk_1',
  email: 'test@example.com',
  stripeApiKey: 'encrypted',
  stripeConnected: true,
  lastSyncedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
}

function makeStripeInvoice(overrides: Record<string, unknown> = {}) {
  return {
    id: 'in_stripe_1',
    status: 'open',
    amount_due: 5000,
    currency: 'usd',
    due_date: Math.floor(Date.now() / 1000) + 86400, // tomorrow
    customer_email: 'client@example.com',
    customer_name: 'Acme Corp',
    number: 'INV-001',
    hosted_invoice_url: 'https://invoice.stripe.com/abc',
    ...overrides,
  }
}

describe('syncInvoicesAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDbUserFindUniqueOrThrow.mockResolvedValue(mockDbUser)
    mockDbUserUpdate.mockResolvedValue({})
    mockDbInvoiceUpsert.mockResolvedValue({})
    mockMarkOverdueInvoices.mockResolvedValue(0)
  })

  it('returns error if not authenticated', async () => {
    mockCurrentUser.mockResolvedValue(null)

    const result = await syncInvoicesAction()

    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('upserts open invoices as unpaid', async () => {
    mockCurrentUser.mockResolvedValue({ id: 'clerk_1' })
    mockInvoicesList.mockResolvedValue({
      data: [makeStripeInvoice({ status: 'open' })],
      has_more: false,
    })

    const result = await syncInvoicesAction()

    expect(mockDbInvoiceUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { externalInvoiceId: 'in_stripe_1' },
        create: expect.objectContaining({
          status: 'unpaid',
          customerEmail: 'client@example.com',
        }),
        update: expect.objectContaining({ status: 'unpaid' }),
      }),
    )
    expect(result).toEqual({ synced: 1 })
  })

  it('upserts paid invoices as paid', async () => {
    mockCurrentUser.mockResolvedValue({ id: 'clerk_1' })
    mockInvoicesList.mockResolvedValue({
      data: [makeStripeInvoice({ status: 'paid' })],
      has_more: false,
    })

    await syncInvoicesAction()

    expect(mockDbInvoiceUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ status: 'paid' }),
        update: expect.objectContaining({ status: 'paid' }),
      }),
    )
  })

  it('skips invoices with no customer_email', async () => {
    mockCurrentUser.mockResolvedValue({ id: 'clerk_1' })
    mockInvoicesList.mockResolvedValue({
      data: [makeStripeInvoice({ customer_email: null })],
      has_more: false,
    })

    const result = await syncInvoicesAction()

    expect(mockDbInvoiceUpsert).not.toHaveBeenCalled()
    expect(result).toEqual({ synced: 0 })
  })

  it('skips invoices with no due_date', async () => {
    mockCurrentUser.mockResolvedValue({ id: 'clerk_1' })
    mockInvoicesList.mockResolvedValue({
      data: [makeStripeInvoice({ due_date: null })],
      has_more: false,
    })

    const result = await syncInvoicesAction()

    expect(mockDbInvoiceUpsert).not.toHaveBeenCalled()
    expect(result).toEqual({ synced: 0 })
  })

  it('skips draft, void, and uncollectible invoices', async () => {
    mockCurrentUser.mockResolvedValue({ id: 'clerk_1' })
    mockInvoicesList.mockResolvedValue({
      data: [
        makeStripeInvoice({ status: 'draft' }),
        makeStripeInvoice({ id: 'in_2', status: 'void' }),
        makeStripeInvoice({ id: 'in_3', status: 'uncollectible' }),
      ],
      has_more: false,
    })

    const result = await syncInvoicesAction()

    expect(mockDbInvoiceUpsert).not.toHaveBeenCalled()
    expect(result).toEqual({ synced: 0 })
  })

  it('paginates when has_more is true', async () => {
    mockCurrentUser.mockResolvedValue({ id: 'clerk_1' })
    mockInvoicesList
      .mockResolvedValueOnce({
        data: [makeStripeInvoice({ id: 'in_1' })],
        has_more: true,
      })
      .mockResolvedValueOnce({
        data: [makeStripeInvoice({ id: 'in_2' })],
        has_more: false,
      })

    const result = await syncInvoicesAction()

    expect(mockInvoicesList).toHaveBeenCalledTimes(2)
    expect(mockInvoicesList).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ starting_after: 'in_1' }),
    )
    expect(result).toEqual({ synced: 2 })
  })

  it('calls markOverdueInvoices after syncing', async () => {
    mockCurrentUser.mockResolvedValue({ id: 'clerk_1' })
    mockInvoicesList.mockResolvedValue({ data: [], has_more: false })

    await syncInvoicesAction()

    expect(mockMarkOverdueInvoices).toHaveBeenCalledWith('user_1')
  })

  it('updates lastSyncedAt on the user after sync', async () => {
    mockCurrentUser.mockResolvedValue({ id: 'clerk_1' })
    mockInvoicesList.mockResolvedValue({ data: [], has_more: false })

    await syncInvoicesAction()

    expect(mockDbUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user_1' },
      data: { lastSyncedAt: expect.any(Date) },
    })
  })

  it('returns error if Stripe throws', async () => {
    mockCurrentUser.mockResolvedValue({ id: 'clerk_1' })
    mockInvoicesList.mockRejectedValue(new Error('Stripe down'))

    const result = await syncInvoicesAction()

    expect(result).toEqual({ error: 'Failed to sync invoices.' })
  })
})

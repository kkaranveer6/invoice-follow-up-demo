import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCustomersList = vi.fn()
const mockInvoicesList = vi.fn()

vi.mock('@/lib/stripe', () => ({
  getStripeClient: vi.fn(),
}))

import { getCustomersWithInvoiceSummary } from './stripe-data'
import { getStripeClient } from '@/lib/stripe'

const fakeStripe = {
  customers: { list: mockCustomersList },
  invoices: { list: mockInvoicesList },
}

describe('getCustomersWithInvoiceSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getStripeClient).mockResolvedValue(fakeStripe as any)
  })

  it('returns customers with invoice status counts', async () => {
    mockCustomersList.mockResolvedValue({
      data: [
        { id: 'cus_1', name: 'Alice', email: 'alice@example.com' },
        { id: 'cus_2', name: 'Bob', email: 'bob@example.com' },
      ],
      has_more: false,
    })

    mockInvoicesList.mockImplementation(async (params: { customer: string }) => {
      if (params.customer === 'cus_1') {
        return {
          data: [
            { status: 'open' },
            { status: 'open' },
            { status: 'paid' },
            { status: 'draft' },
          ],
          has_more: false,
        }
      }
      return {
        data: [
          { status: 'paid' },
          { status: 'void' },
          { status: 'uncollectible' },
        ],
        has_more: false,
      }
    })

    const result = await getCustomersWithInvoiceSummary('user_1')

    expect(result.customers).toHaveLength(2)

    expect(result.customers[0]).toEqual({
      id: 'cus_1',
      name: 'Alice',
      email: 'alice@example.com',
      invoiceSummary: {
        draft: 1,
        open: 2,
        paid: 1,
        void: 0,
        uncollectible: 0,
      },
    })

    expect(result.customers[1]).toEqual({
      id: 'cus_2',
      name: 'Bob',
      email: 'bob@example.com',
      invoiceSummary: {
        draft: 0,
        open: 0,
        paid: 1,
        void: 1,
        uncollectible: 1,
      },
    })
  })

  it('passes cursor and limit to Stripe', async () => {
    mockCustomersList.mockResolvedValue({ data: [], has_more: false })

    await getCustomersWithInvoiceSummary('user_1', 'cus_cursor', 10)

    expect(mockCustomersList).toHaveBeenCalledWith(
      expect.objectContaining({
        starting_after: 'cus_cursor',
        limit: 10,
      }),
    )
  })

  it('defaults to limit of 20 with no cursor', async () => {
    mockCustomersList.mockResolvedValue({ data: [], has_more: false })

    await getCustomersWithInvoiceSummary('user_1')

    expect(mockCustomersList).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 20 }),
    )
    const callArgs = mockCustomersList.mock.calls[0][0]
    expect(callArgs).not.toHaveProperty('starting_after')
  })

  it('returns hasMore flag from Stripe', async () => {
    mockCustomersList.mockResolvedValue({
      data: [{ id: 'cus_1', name: 'Test', email: 'test@example.com' }],
      has_more: true,
    })

    mockInvoicesList.mockResolvedValue({ data: [], has_more: false })

    const result = await getCustomersWithInvoiceSummary('user_1')

    expect(result.hasMore).toBe(true)
  })

  it('handles customer with no invoices', async () => {
    mockCustomersList.mockResolvedValue({
      data: [{ id: 'cus_1', name: 'Empty', email: 'empty@example.com' }],
      has_more: false,
    })

    mockInvoicesList.mockResolvedValue({ data: [], has_more: false })

    const result = await getCustomersWithInvoiceSummary('user_1')

    expect(result.customers[0].invoiceSummary).toEqual({
      draft: 0,
      open: 0,
      paid: 0,
      void: 0,
      uncollectible: 0,
    })
  })

  it('paginates invoices when has_more is true', async () => {
    mockCustomersList.mockResolvedValue({
      data: [{ id: 'cus_1', name: 'Paginated', email: 'pag@example.com' }],
      has_more: false,
    })

    mockInvoicesList.mockImplementation(async (params: { customer: string; starting_after?: string }) => {
      if (!params.starting_after) {
        return {
          data: [
            { id: 'inv_1', status: 'open' },
            { id: 'inv_2', status: 'paid' },
          ],
          has_more: true,
        }
      }
      return {
        data: [
          { id: 'inv_3', status: 'paid' },
          { id: 'inv_4', status: 'draft' },
        ],
        has_more: false,
      }
    })

    const result = await getCustomersWithInvoiceSummary('user_1')

    expect(mockInvoicesList).toHaveBeenCalledTimes(2)
    expect(mockInvoicesList).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: 'cus_1',
        starting_after: 'inv_2',
      }),
    )
    expect(result.customers[0].invoiceSummary).toEqual({
      draft: 1,
      open: 1,
      paid: 2,
      void: 0,
      uncollectible: 0,
    })
  })

  it('propagates Stripe API errors', async () => {
    const stripeError = new Error('Stripe API rate limit exceeded')
    mockCustomersList.mockRejectedValue(stripeError)

    await expect(getCustomersWithInvoiceSummary('user_1')).rejects.toThrow(
      'Stripe API rate limit exceeded',
    )
  })
})

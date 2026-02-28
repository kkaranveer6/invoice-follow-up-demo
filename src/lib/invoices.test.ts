import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUpdateMany = vi.hoisted(() => vi.fn())

vi.mock('@/lib/db', () => ({
  db: {
    invoice: {
      updateMany: mockUpdateMany,
    },
  },
}))

import { markOverdueInvoices } from './invoices'

describe('markOverdueInvoices', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('bulk-updates unpaid invoices past due date to overdue', async () => {
    mockUpdateMany.mockResolvedValue({ count: 3 })

    const result = await markOverdueInvoices('user_1')

    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: {
        userId: 'user_1',
        status: 'unpaid',
        dueDate: { lt: expect.any(Date) },
      },
      data: { status: 'overdue' },
    })
    expect(result).toBe(3)
  })

  it('returns 0 when no invoices are overdue', async () => {
    mockUpdateMany.mockResolvedValue({ count: 0 })

    const result = await markOverdueInvoices('user_1')

    expect(result).toBe(0)
  })
})

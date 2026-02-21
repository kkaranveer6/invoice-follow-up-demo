import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSendEmail = vi.hoisted(() => vi.fn())
const mockDbInvoiceFindMany = vi.hoisted(() => vi.fn())
const mockDbInvoiceUpdate = vi.hoisted(() => vi.fn())
const mockDbEmailLogCreate = vi.hoisted(() => vi.fn())

vi.mock('@/lib/email', () => ({ sendEmail: mockSendEmail }))
vi.mock('@/lib/db', () => ({
  db: {
    invoice: {
      findMany: mockDbInvoiceFindMany,
      update: mockDbInvoiceUpdate,
    },
    emailLog: {
      create: mockDbEmailLogCreate,
    },
  },
}))

import { processReminders, needsReminder } from './reminders'

// Helper: build a mock invoice
function makeInvoice(overrides: Record<string, unknown> = {}) {
  return {
    id: 'inv_1',
    customerEmail: 'client@example.com',
    customerName: 'Acme Corp',
    invoiceNumber: 'INV-001',
    amount: 50000,
    currency: 'usd',
    paymentLink: 'https://pay.stripe.com/abc',
    remindersEnabled: true,
    reminderCount: 0,
    dueDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    status: 'overdue',
    ...overrides,
  }
}

describe('needsReminder', () => {
  const now = new Date()

  it('returns true for reminderCount=0 and daysOverdue >= 3', () => {
    const invoice = makeInvoice({
      reminderCount: 0,
      dueDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    })
    expect(needsReminder(invoice, now)).toBe(true)
  })

  it('returns false for reminderCount=0 and daysOverdue < 3', () => {
    const invoice = makeInvoice({
      reminderCount: 0,
      dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    })
    expect(needsReminder(invoice, now)).toBe(false)
  })

  it('returns true for reminderCount=1 and daysOverdue >= 7', () => {
    const invoice = makeInvoice({
      reminderCount: 1,
      dueDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    })
    expect(needsReminder(invoice, now)).toBe(true)
  })

  it('returns false for reminderCount=1 and daysOverdue < 7', () => {
    const invoice = makeInvoice({
      reminderCount: 1,
      dueDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    })
    expect(needsReminder(invoice, now)).toBe(false)
  })

  it('returns true for reminderCount=2 and daysOverdue >= 14', () => {
    const invoice = makeInvoice({
      reminderCount: 2,
      dueDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
    })
    expect(needsReminder(invoice, now)).toBe(true)
  })

  it('returns false for reminderCount=2 and daysOverdue < 14', () => {
    const invoice = makeInvoice({
      reminderCount: 2,
      dueDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    })
    expect(needsReminder(invoice, now)).toBe(false)
  })

  it('returns false for reminderCount >= 3', () => {
    const invoice = makeInvoice({
      reminderCount: 3,
      dueDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    })
    expect(needsReminder(invoice, now)).toBe(false)
  })
})

describe('processReminders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends a reminder and updates DB for qualifying invoice', async () => {
    const invoice = makeInvoice()
    mockDbInvoiceFindMany.mockResolvedValue([invoice])
    mockSendEmail.mockResolvedValue(undefined)
    mockDbInvoiceUpdate.mockResolvedValue({})
    mockDbEmailLogCreate.mockResolvedValue({})

    const result = await processReminders()

    expect(mockSendEmail).toHaveBeenCalledOnce()
    expect(mockDbInvoiceUpdate).toHaveBeenCalledWith({
      where: { id: 'inv_1' },
      data: {
        reminderCount: 1,
        lastReminderSentAt: expect.any(Date),
      },
    })
    expect(mockDbEmailLogCreate).toHaveBeenCalledWith({
      data: {
        invoiceId: 'inv_1',
        template: 'friendly',
        status: 'sent',
      },
    })
    expect(result).toEqual({ sent: 1, skipped: 0, failed: 0 })
  })

  it('skips invoice that does not meet cadence threshold', async () => {
    const now = new Date()
    const invoice = makeInvoice({
      reminderCount: 0,
      dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // only 1 day overdue
    })
    mockDbInvoiceFindMany.mockResolvedValue([invoice])

    const result = await processReminders()

    expect(mockSendEmail).not.toHaveBeenCalled()
    expect(result).toEqual({ sent: 0, skipped: 1, failed: 0 })
  })

  it('logs failure and continues if sendEmail throws', async () => {
    const invoice = makeInvoice()
    mockDbInvoiceFindMany.mockResolvedValue([invoice])
    mockSendEmail.mockRejectedValue(new Error('Email failed'))
    mockDbEmailLogCreate.mockResolvedValue({})

    const result = await processReminders()

    expect(mockDbInvoiceUpdate).not.toHaveBeenCalled()
    expect(mockDbEmailLogCreate).toHaveBeenCalledWith({
      data: {
        invoiceId: 'inv_1',
        template: 'friendly',
        status: 'failed',
      },
    })
    expect(result).toEqual({ sent: 0, skipped: 0, failed: 1 })
  })
})

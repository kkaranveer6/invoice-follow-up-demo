import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSend = vi.hoisted(() => vi.fn())

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}))

beforeEach(() => {
  vi.clearAllMocks()
  process.env.RESEND_API_KEY = 'test_key'
  process.env.RESEND_FROM_EMAIL = 'reminders@example.com'
})

import { sendEmail } from './email'

describe('sendEmail', () => {
  it('calls Resend with correct params and returns success', async () => {
    mockSend.mockResolvedValue({ data: { id: 'msg_123' }, error: null })

    await sendEmail({
      to: 'client@example.com',
      subject: 'Invoice due',
      body: 'Please pay now.',
    })

    expect(mockSend).toHaveBeenCalledWith({
      from: 'reminders@example.com',
      to: 'client@example.com',
      subject: 'Invoice due',
      text: 'Please pay now.',
    })
  })

  it('throws if Resend returns an error', async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: 'Bad request' } })

    await expect(
      sendEmail({ to: 'client@example.com', subject: 'Subject', body: 'Body' }),
    ).rejects.toThrow('Bad request')
  })

  it('throws if RESEND_API_KEY is not set', async () => {
    delete process.env.RESEND_API_KEY

    await expect(
      sendEmail({ to: 'client@example.com', subject: 'Subject', body: 'Body' }),
    ).rejects.toThrow('RESEND_API_KEY')
  })

  it('throws if RESEND_FROM_EMAIL is not set', async () => {
    delete process.env.RESEND_FROM_EMAIL

    await expect(
      sendEmail({ to: 'client@example.com', subject: 'Subject', body: 'Body' }),
    ).rejects.toThrow('RESEND_FROM_EMAIL')
  })
})

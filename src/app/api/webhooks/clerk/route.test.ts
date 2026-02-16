import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockVerifyWebhook = vi.hoisted(() => vi.fn())

vi.mock('@clerk/nextjs/webhooks', () => ({
  verifyWebhook: mockVerifyWebhook,
}))

vi.mock('@/lib/db', () => ({
  db: {
    user: {
      upsert: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
    },
  },
}))

import { POST } from './route'
import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

function makeRequest() {
  return new NextRequest('http://localhost:3000/api/webhooks/clerk', {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

describe('POST /api/webhooks/clerk', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 if verification fails', async () => {
    mockVerifyWebhook.mockRejectedValue(new Error('Invalid signature'))

    const res = await POST(makeRequest())
    expect(res.status).toBe(400)
  })

  it('upserts user on user.created event', async () => {
    mockVerifyWebhook.mockResolvedValue({
      type: 'user.created',
      data: {
        id: 'clerk_123',
        primary_email_address_id: 'email_1',
        email_addresses: [
          { id: 'email_1', email_address: 'user@example.com' },
        ],
      },
    })

    const res = await POST(makeRequest())

    expect(res.status).toBe(200)
    expect(db.user.upsert).toHaveBeenCalledWith({
      where: { clerkId: 'clerk_123' },
      create: { clerkId: 'clerk_123', email: 'user@example.com' },
      update: { email: 'user@example.com', deletedAt: null },
    })
  })

  it('soft-deletes user on user.deleted event', async () => {
    mockVerifyWebhook.mockResolvedValue({
      type: 'user.deleted',
      data: { id: 'clerk_123' },
    })

    const res = await POST(makeRequest())

    expect(res.status).toBe(200)
    expect(db.user.update).toHaveBeenCalledWith({
      where: { clerkId: 'clerk_123' },
      data: { deletedAt: expect.any(Date) },
    })
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockProcessReminders = vi.hoisted(() => vi.fn())

vi.mock('@/lib/reminders', () => ({
  processReminders: mockProcessReminders,
}))

import { POST } from './route'
import { NextRequest } from 'next/server'

function makeRequest(authHeader?: string) {
  return new NextRequest('http://localhost:3000/api/internal/process-reminders', {
    method: 'POST',
    headers: authHeader ? { Authorization: authHeader } : {},
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.INTERNAL_API_SECRET = 'test-secret-123'
})

describe('POST /api/internal/process-reminders', () => {
  it('returns 401 if Authorization header is missing', async () => {
    const res = await POST(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns 401 if secret does not match', async () => {
    const res = await POST(makeRequest('Bearer wrong-secret'))
    expect(res.status).toBe(401)
  })

  it('returns 200 with result on valid secret', async () => {
    mockProcessReminders.mockResolvedValue({ sent: 2, skipped: 1, failed: 0 })

    const res = await POST(makeRequest('Bearer test-secret-123'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ sent: 2, skipped: 1, failed: 0 })
    expect(mockProcessReminders).toHaveBeenCalledOnce()
  })

  it('returns 500 if processReminders throws', async () => {
    mockProcessReminders.mockRejectedValue(new Error('DB down'))

    const res = await POST(makeRequest('Bearer test-secret-123'))

    expect(res.status).toBe(500)
  })

  it('returns 401 if INTERNAL_API_SECRET is not set', async () => {
    delete process.env.INTERNAL_API_SECRET

    const res = await POST(makeRequest('Bearer test-secret-123'))
    expect(res.status).toBe(401)
  })
})

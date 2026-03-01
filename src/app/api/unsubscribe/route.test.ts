import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockDecrypt = vi.hoisted(() => vi.fn())
const mockDbInvoiceFindUnique = vi.hoisted(() => vi.fn())
const mockDbInvoiceUpdate = vi.hoisted(() => vi.fn())

vi.mock('@/lib/crypto', () => ({ decrypt: mockDecrypt }))
vi.mock('@/lib/db', () => ({
  db: {
    invoice: {
      findUnique: mockDbInvoiceFindUnique,
      update: mockDbInvoiceUpdate,
    },
  },
}))

import { GET } from './route'
import { NextRequest } from 'next/server'

function makeRequest(token?: string) {
  const url = token
    ? `http://localhost:3000/api/unsubscribe?token=${encodeURIComponent(token)}`
    : 'http://localhost:3000/api/unsubscribe'
  return new NextRequest(url)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/unsubscribe', () => {
  it('returns 400 if token query param is missing', async () => {
    const res = await GET(makeRequest())
    expect(res.status).toBe(400)
  })

  it('returns 400 if token cannot be decrypted (tampered/invalid)', async () => {
    mockDecrypt.mockImplementation(() => {
      throw new Error('Unsupported state or unable to authenticate data')
    })
    const res = await GET(makeRequest('badtoken'))
    expect(res.status).toBe(400)
  })

  it('returns 200 with neutral message if invoice is not found', async () => {
    mockDecrypt.mockReturnValue('inv_notexist')
    mockDbInvoiceFindUnique.mockResolvedValue(null)

    const res = await GET(makeRequest('validtoken'))

    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('unsubscribed')
    expect(mockDbInvoiceUpdate).not.toHaveBeenCalled()
  })

  it('sets remindersEnabled=false and returns 200 with invoice number on valid token', async () => {
    mockDecrypt.mockReturnValue('inv_1')
    mockDbInvoiceFindUnique.mockResolvedValue({
      id: 'inv_1',
      invoiceNumber: 'INV-001',
      remindersEnabled: true,
    })
    mockDbInvoiceUpdate.mockResolvedValue({})

    const res = await GET(makeRequest('validtoken'))

    expect(res.status).toBe(200)
    expect(mockDbInvoiceUpdate).toHaveBeenCalledWith({
      where: { id: 'inv_1' },
      data: { remindersEnabled: false },
    })
    const html = await res.text()
    expect(html).toContain('INV-001')
  })

  it('response has Content-Type text/html', async () => {
    mockDecrypt.mockReturnValue('inv_1')
    mockDbInvoiceFindUnique.mockResolvedValue({
      id: 'inv_1',
      invoiceNumber: 'INV-001',
    })
    mockDbInvoiceUpdate.mockResolvedValue({})

    const res = await GET(makeRequest('validtoken'))
    expect(res.headers.get('Content-Type')).toContain('text/html')
  })
})

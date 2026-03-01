import { describe, it, expect } from 'vitest'
import { getTemplate, interpolateTemplate } from './email-templates'

describe('getTemplate', () => {
  it('returns friendly for reminderCount 0', () => {
    expect(getTemplate(0).name).toBe('friendly')
  })

  it('returns professional for reminderCount 1', () => {
    expect(getTemplate(1).name).toBe('professional')
  })

  it('returns firm for reminderCount 2', () => {
    expect(getTemplate(2).name).toBe('firm')
  })
})

describe('interpolateTemplate', () => {
  it('replaces all variables in subject and body', () => {
    const template = {
      name: 'friendly' as const,
      subject: 'Invoice {{invoiceNumber}} due',
      body: 'Hi {{clientName}}, pay {{amount}} at {{paymentLink}}',
    }
    const vars = {
      clientName: 'Acme Corp',
      invoiceNumber: 'INV-001',
      amount: '$500.00',
      paymentLink: 'https://pay.example.com/abc',
      unsubscribeLink: 'https://app.example.com/api/unsubscribe?token=abc123',
    }
    const result = interpolateTemplate(template, vars)
    expect(result.subject).toBe('Invoice INV-001 due')
    expect(result.body).toContain('Hi Acme Corp')
    expect(result.body).toContain('$500.00')
    expect(result.body).toContain('https://pay.example.com/abc')
  })

  it('includes unsubscribe link in body footer', () => {
    const template = {
      name: 'friendly' as const,
      subject: 'Subject',
      body: 'Body text',
    }
    const vars = {
      clientName: 'Test',
      invoiceNumber: 'INV-001',
      amount: '$100.00',
      paymentLink: 'https://example.com',
      unsubscribeLink: 'https://app.example.com/api/unsubscribe?token=abc123',
    }
    const result = interpolateTemplate(template, vars)
    expect(result.body).toContain('https://app.example.com/api/unsubscribe?token=abc123')
  })
})

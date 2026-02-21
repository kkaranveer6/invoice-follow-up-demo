import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { getTemplate, interpolateTemplate } from '@/lib/email-templates'

interface Invoice {
  id: string
  customerEmail: string
  customerName: string
  invoiceNumber: string
  amount: number
  currency: string
  paymentLink: string
  remindersEnabled: boolean
  reminderCount: number
  dueDate: Date
}

interface ProcessResult {
  sent: number
  skipped: number
  failed: number
}

export function needsReminder(invoice: Invoice, now: Date): boolean {
  if (invoice.reminderCount >= 3) return false

  const daysOverdue = Math.floor(
    (now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (invoice.reminderCount === 0 && daysOverdue >= 3) return true
  if (invoice.reminderCount === 1 && daysOverdue >= 7) return true
  if (invoice.reminderCount === 2 && daysOverdue >= 14) return true

  return false
}

export async function processReminders(): Promise<ProcessResult> {
  const now = new Date()
  const result: ProcessResult = { sent: 0, skipped: 0, failed: 0 }

  const invoices = await db.invoice.findMany({
    where: {
      status: 'overdue',
      remindersEnabled: true,
      reminderCount: { lt: 3 },
    },
  })

  for (const invoice of invoices) {
    if (!needsReminder(invoice, now)) {
      result.skipped++
      continue
    }

    const template = getTemplate(invoice.reminderCount)
    const { subject, body } = interpolateTemplate(template, {
      clientName: invoice.customerName,
      invoiceNumber: invoice.invoiceNumber,
      amount: `${(invoice.amount / 100).toFixed(2)} ${invoice.currency.toUpperCase()}`,
      paymentLink: invoice.paymentLink,
    })

    try {
      await sendEmail({ to: invoice.customerEmail, subject, body })

      await db.invoice.update({
        where: { id: invoice.id },
        data: {
          reminderCount: invoice.reminderCount + 1,
          lastReminderSentAt: now,
        },
      })

      await db.emailLog.create({
        data: {
          invoiceId: invoice.id,
          template: template.name,
          status: 'sent',
        },
      })

      result.sent++
    } catch {
      await db.emailLog.create({
        data: {
          invoiceId: invoice.id,
          template: template.name,
          status: 'failed',
        },
      })

      result.failed++
    }
  }

  return result
}

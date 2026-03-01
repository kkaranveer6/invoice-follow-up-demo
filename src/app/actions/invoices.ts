'use server'

import { currentUser } from '@clerk/nextjs/server'
import { InvoiceStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { getStripeClient } from '@/lib/stripe'
import { markOverdueInvoices } from '@/lib/invoices'

const SKIP_STATUSES = new Set(['draft', 'void', 'uncollectible'])

export async function syncInvoicesAction(): Promise<{
  synced?: number
  error?: string
}> {
  const user = await currentUser()
  if (!user) return { error: 'Not authenticated' }

  const dbUser = await db.user.findUniqueOrThrow({
    where: { clerkId: user.id },
  })

  try {
    const stripe = await getStripeClient(dbUser.id)

    let hasMore = true
    let startingAfter: string | undefined
    let synced = 0

    while (hasMore) {
      const params: { limit: number; starting_after?: string } = { limit: 100 }
      if (startingAfter) params.starting_after = startingAfter

      const response = await stripe.invoices.list(params)

      for (const invoice of response.data) {
        if (!invoice.customer_email) {
          console.warn(`Skipping invoice ${invoice.id}: no customer email`)
          continue
        }

        if (!invoice.due_date) {
          console.warn(`Skipping invoice ${invoice.id}: no due date`)
          continue
        }

        if (!invoice.status || SKIP_STATUSES.has(invoice.status)) continue

        const status: InvoiceStatus = invoice.status === 'paid' ? InvoiceStatus.paid : InvoiceStatus.unpaid
        const dueDate = new Date(invoice.due_date * 1000)

        const data = {
          userId: dbUser.id,
          externalInvoiceId: invoice.id,
          amount: invoice.amount_due,
          currency: invoice.currency,
          dueDate,
          status,
          customerEmail: invoice.customer_email,
          customerName: invoice.customer_name ?? '',
          invoiceNumber: invoice.number ?? '',
          paymentLink: invoice.hosted_invoice_url ?? '',
        }

        await db.invoice.upsert({
          where: { externalInvoiceId: invoice.id },
          create: data,
          update: {
            amount: data.amount,
            currency: data.currency,
            dueDate: data.dueDate,
            status: data.status,
            customerEmail: data.customerEmail,
            customerName: data.customerName,
            invoiceNumber: data.invoiceNumber,
            paymentLink: data.paymentLink,
          },
        })

        synced++
      }

      hasMore = response.has_more
      if (response.data.length > 0) {
        startingAfter = response.data[response.data.length - 1].id
      }
    }

    await markOverdueInvoices(dbUser.id)

    await db.user.update({
      where: { id: dbUser.id },
      data: { lastSyncedAt: new Date() },
    })

    return { synced }
  } catch (err) {
    console.error('syncInvoicesAction error:', err)
    return { error: 'Failed to sync invoices.' }
  }
}

export async function toggleRemindersAction(
  invoiceId: string,
  enabled: boolean,
): Promise<{ success?: boolean; error?: string }> {
  const user = await currentUser()
  if (!user) return { error: 'Not authenticated' }

  const dbUser = await db.user.findUniqueOrThrow({
    where: { clerkId: user.id },
  })

  const invoice = await db.invoice.findFirst({
    where: { id: invoiceId, userId: dbUser.id },
  })

  if (!invoice) return { error: 'Invoice not found' }

  await db.invoice.update({
    where: { id: invoiceId },
    data: { remindersEnabled: enabled },
  })

  revalidatePath('/dashboard/invoices')
  return { success: true }
}

export async function pauseAllRemindersAction(
  enabled: boolean,
): Promise<{ success?: boolean; error?: string }> {
  const user = await currentUser()
  if (!user) return { error: 'Not authenticated' }

  const dbUser = await db.user.findUniqueOrThrow({
    where: { clerkId: user.id },
  })

  await db.invoice.updateMany({
    where: { userId: dbUser.id },
    data: { remindersEnabled: enabled },
  })

  return { success: true }
}

import { db } from '@/lib/db'

export async function markOverdueInvoices(userId: string): Promise<number> {
  const result = await db.invoice.updateMany({
    where: {
      userId,
      status: 'unpaid',
      dueDate: { lt: new Date() },
    },
    data: { status: 'overdue' },
  })

  return result.count
}

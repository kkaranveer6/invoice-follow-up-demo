import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ReminderToggle } from '@/components/reminder-toggle'
import { FileText } from 'lucide-react'
import { InvoiceStatus } from '@prisma/client'

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  if (status === 'paid') {
    return <Badge variant="secondary" className="bg-green-100 text-green-700">Paid</Badge>
  }
  if (status === 'overdue') {
    return <Badge variant="secondary" className="bg-red-100 text-red-700">Overdue</Badge>
  }
  return <Badge variant="secondary" className="bg-amber-100 text-amber-700">Unpaid</Badge>
}

export default async function InvoicesPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id },
  })

  if (!dbUser || !dbUser.stripeConnected) {
    redirect('/dashboard/settings')
  }

  const invoices = await db.invoice.findMany({
    where: { userId: dbUser.id },
    orderBy: { dueDate: 'asc' },
  })

  if (invoices.length === 0) {
    return (
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">Invoices</h1>

        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-slate-400" />
            <p className="mt-4 text-lg font-medium text-slate-900">No invoices found</p>
            <p className="mt-1 text-sm text-slate-600">
              Invoices will appear here once they are synced from Stripe.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-slate-900">Invoices</h1>
      <p className="mt-1 text-sm text-slate-600">
        Manage reminder schedules for each invoice.
      </p>

      <div className="mt-6 rounded-xl border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reminders</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow
                key={invoice.id}
                className={!invoice.remindersEnabled ? 'opacity-60' : undefined}
              >
                <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                <TableCell>
                  <div>{invoice.customerName}</div>
                  <div className="text-xs text-slate-500">{invoice.customerEmail}</div>
                </TableCell>
                <TableCell>{formatAmount(invoice.amount, invoice.currency)}</TableCell>
                <TableCell className="text-slate-600">{formatDate(invoice.dueDate)}</TableCell>
                <TableCell>
                  <StatusBadge status={invoice.status} />
                </TableCell>
                <TableCell>
                  <ReminderToggle
                    invoiceId={invoice.id}
                    initialEnabled={invoice.remindersEnabled}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type { Invoice } from '@prisma/client'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CreditCard, FileText, Mail, AlertCircle } from 'lucide-react'
import { SyncButton } from './_components/SyncButton'

const MAX_REMINDERS = 3

function formatAmount(amount: number, currency: string): string {
  return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function daysOverdue(dueDate: Date): number {
  return Math.max(
    0,
    Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24)),
  )
}

interface InvoiceSectionProps {
  title: string
  invoices: Invoice[]
  badgeClass: string
  accentClass: string
  statusLabel: string
}

function InvoiceSection({
  title,
  invoices,
  badgeClass,
  accentClass,
  statusLabel,
}: InvoiceSectionProps) {
  if (invoices.length === 0) return null

  return (
    <div className="mt-8">
      <h2
        className={`mb-3 border-l-4 pl-3 text-lg font-semibold text-slate-900 ${accentClass}`}
      >
        {title} ({invoices.length})
      </h2>
      <div className="rounded-xl border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Last Reminder</TableHead>
              <TableHead>Reminders</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => {
              const overdueDays =
                invoice.status === 'overdue' ? daysOverdue(invoice.dueDate) : null

              return (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <Badge variant="secondary" className={badgeClass}>
                      {statusLabel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">
                      {invoice.customerName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {invoice.customerEmail}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {invoice.invoiceNumber}
                  </TableCell>
                  <TableCell className="text-slate-900">
                    {formatAmount(invoice.amount, invoice.currency)}
                  </TableCell>
                  <TableCell>
                    <div>{formatDate(invoice.dueDate)}</div>
                    {overdueDays !== null && (
                      <div className="mt-0.5 text-xs font-medium text-red-600">
                        {overdueDays}d overdue
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {invoice.lastReminderSentAt
                      ? formatDate(invoice.lastReminderSentAt)
                      : 'Never'}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {invoice.reminderCount} / {MAX_REMINDERS} sent
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id },
  })

  if (!dbUser || !dbUser.stripeConnected) {
    redirect('/dashboard/settings')
  }

  const displayName = user.firstName ?? dbUser.email

  const [invoiceCount, remindersSent, invoices] =
    await Promise.all([
      db.invoice.count({ where: { userId: dbUser.id } }),
      db.emailLog.count({
        where: { invoice: { userId: dbUser.id }, status: 'sent' },
      }),
      db.invoice.findMany({
        where: { userId: dbUser.id },
        orderBy: { dueDate: 'asc' },
      }),
    ])

  const overdue = invoices.filter((i) => i.status === 'overdue')
  const unpaid = invoices.filter((i) => i.status === 'unpaid')
  const paid = invoices.filter((i) => i.status === 'paid')

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-slate-900">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Welcome back, {displayName}
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Stripe Status
            </CardTitle>
            <CreditCard className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <Badge
              variant="default"
              className="bg-green-100 text-green-700 hover:bg-green-100"
            >
              Connected
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Invoices Synced
            </CardTitle>
            <FileText className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">{invoiceCount}</p>
            <div className="mt-3">
              <SyncButton lastSyncedAt={dbUser.lastSyncedAt} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Reminders Sent
            </CardTitle>
            <Mail className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">{remindersSent}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Overdue
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                overdue.length > 0 ? 'text-red-600' : 'text-slate-900'
              }`}
            >
              {overdue.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <InvoiceSection
        title="Overdue"
        invoices={overdue}
        badgeClass="bg-red-100 text-red-700"
        accentClass="border-red-400"
        statusLabel="Overdue"
      />
      <InvoiceSection
        title="Unpaid"
        invoices={unpaid}
        badgeClass="bg-amber-100 text-amber-700"
        accentClass="border-amber-400"
        statusLabel="Unpaid"
      />
      <InvoiceSection
        title="Paid"
        invoices={paid}
        badgeClass="bg-green-100 text-green-700"
        accentClass="border-green-400"
        statusLabel="Paid"
      />
    </div>
  )
}

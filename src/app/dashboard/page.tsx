import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LayoutDashboard, CreditCard, FileText } from 'lucide-react'
import { SyncButton } from './_components/SyncButton'

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

  const [invoiceCount, remindersSent] = await Promise.all([
    db.invoice.count({ where: { userId: dbUser.id } }),
    db.emailLog.count({ where: { invoice: { userId: dbUser.id }, status: 'sent' } }),
  ])

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-slate-900">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Welcome back, {displayName}
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Stripe Status
            </CardTitle>
            <CreditCard className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
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
            <LayoutDashboard className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">{remindersSent}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

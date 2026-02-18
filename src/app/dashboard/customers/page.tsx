import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import {
  getCustomersWithInvoiceSummary,
  type CustomerWithInvoiceSummary,
} from '@/lib/stripe-data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Users } from 'lucide-react'

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>
}) {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id },
  })

  if (!dbUser || !dbUser.stripeConnected) {
    redirect('/dashboard/settings')
  }

  const { cursor } = await searchParams

  let customers: CustomerWithInvoiceSummary[] = []
  let hasMore = false

  try {
    const result = await getCustomersWithInvoiceSummary(dbUser.id, cursor)
    customers = result.customers
    hasMore = result.hasMore
  } catch {
    return (
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">
          Customers
        </h1>

        <Alert variant="destructive" className="mt-6">
          <AlertTitle>Failed to load customers</AlertTitle>
          <AlertDescription>
            There was a problem fetching your customers from Stripe. Please{' '}
            <Link href="/dashboard/settings" className="underline font-medium">
              check your settings
            </Link>{' '}
            or{' '}
            <Link
              href="/dashboard/customers"
              className="underline font-medium"
            >
              try again
            </Link>
            .
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (customers.length === 0) {
    return (
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">
          Customers
        </h1>

        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-slate-400" />
            <p className="mt-4 text-lg font-medium text-slate-900">
              No customers found
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Customers will appear here once they exist in your Stripe account.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const lastCustomerId = customers[customers.length - 1].id

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-slate-900">
        Customers
      </h1>

      <div className="mt-6 rounded-xl border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Draft</TableHead>
              <TableHead>Open</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Void</TableHead>
              <TableHead>Uncollectible</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  {customer.name ?? '\u2014'}
                </TableCell>
                <TableCell className="text-slate-600">
                  {customer.email ?? '\u2014'}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 text-slate-700"
                  >
                    {customer.invoiceSummary.draft}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-700"
                  >
                    {customer.invoiceSummary.open}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700"
                  >
                    {customer.invoiceSummary.paid}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="destructive">
                    {customer.invoiceSummary.void}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="bg-red-50 text-red-600"
                  >
                    {customer.invoiceSummary.uncollectible}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" asChild>
            <Link href={`?cursor=${lastCustomerId}`}>Next page</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

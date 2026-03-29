import { DEMO_CUSTOMERS } from '@/lib/demo-data'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function CustomersPage() {
  const customers = DEMO_CUSTOMERS

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
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                    {customer.invoiceSummary.draft}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                    {customer.invoiceSummary.open}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {customer.invoiceSummary.paid}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="destructive">
                    {customer.invoiceSummary.void}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-red-50 text-red-600">
                    {customer.invoiceSummary.uncollectible}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

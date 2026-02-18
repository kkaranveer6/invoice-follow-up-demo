import { getStripeClient } from '@/lib/stripe'

export interface InvoiceSummary {
  draft: number
  open: number
  paid: number
  void: number
  uncollectible: number
}

export interface CustomerWithInvoiceSummary {
  id: string
  name: string | null
  email: string | null
  invoiceSummary: InvoiceSummary
}

export interface CustomersResult {
  customers: CustomerWithInvoiceSummary[]
  hasMore: boolean
}

export async function getCustomersWithInvoiceSummary(
  userId: string,
  cursor?: string,
  limit: number = 20,
): Promise<CustomersResult> {
  const stripe = await getStripeClient(userId)

  const listParams: { limit: number; starting_after?: string } = { limit }
  if (cursor) {
    listParams.starting_after = cursor
  }

  const customersResponse = await stripe.customers.list(listParams)

  const customers = await Promise.all(
    customersResponse.data.map(async (customer) => {
      const invoiceSummary: InvoiceSummary = {
        draft: 0,
        open: 0,
        paid: 0,
        void: 0,
        uncollectible: 0,
      }

      let hasMore = true
      let startingAfter: string | undefined

      while (hasMore) {
        const invoiceParams: { customer: string; limit: number; starting_after?: string } = {
          customer: customer.id,
          limit: 100,
        }
        if (startingAfter) {
          invoiceParams.starting_after = startingAfter
        }

        const invoicesResponse = await stripe.invoices.list(invoiceParams)

        for (const invoice of invoicesResponse.data) {
          const status = invoice.status as keyof InvoiceSummary
          if (status in invoiceSummary) {
            invoiceSummary[status]++
          }
        }

        hasMore = invoicesResponse.has_more
        if (invoicesResponse.data.length > 0) {
          startingAfter = invoicesResponse.data[invoicesResponse.data.length - 1].id
        }
      }

      return {
        id: customer.id,
        name: customer.name ?? null,
        email: customer.email ?? null,
        invoiceSummary,
      }
    }),
  )

  return {
    customers,
    hasMore: customersResponse.has_more,
  }
}

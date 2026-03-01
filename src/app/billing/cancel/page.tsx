import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function BillingCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50/50 to-white">
      <div className="text-center max-w-md px-6">
        <h1 className="font-heading text-3xl font-bold text-slate-900">
          Subscription cancelled
        </h1>
        <p className="mt-4 text-slate-600">
          No worries — you can subscribe any time to start sending invoice reminders.
        </p>
        <Button asChild variant="outline" className="mt-8">
          <Link href="/pricing">Back to Pricing</Link>
        </Button>
      </div>
    </div>
  )
}

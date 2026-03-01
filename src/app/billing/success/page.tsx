import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function BillingSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50/50 to-white">
      <div className="text-center max-w-md px-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 text-3xl">
          ✓
        </div>
        <h1 className="mt-6 font-heading text-3xl font-bold text-slate-900">
          You&apos;re subscribed!
        </h1>
        <p className="mt-4 text-slate-600">
          Your 14-day free trial has started. Connect your Stripe account to begin sending
          automated invoice reminders.
        </p>
        <Button asChild className="mt-8">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}

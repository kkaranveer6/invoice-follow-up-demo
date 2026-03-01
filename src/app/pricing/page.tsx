import { SubscribeButton } from './subscribe-button'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 to-white">
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-slate-900">
          Simple, transparent pricing
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          Start with a 14-day free trial. No credit card charged until the trial ends.
        </p>

        <div className="mx-auto mt-12 max-w-sm rounded-2xl border bg-white p-8 shadow-sm text-left">
          <p className="text-sm font-medium text-indigo-600 uppercase tracking-wide">Pro</p>
          <p className="mt-2 text-4xl font-bold text-slate-900">
            $29
            <span className="text-lg font-normal text-slate-500"> / month</span>
          </p>
          <ul className="mt-6 space-y-3 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Automatic overdue invoice detection
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Up to 3 escalating email reminders
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Signed one-click unsubscribe links
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> 14-day free trial
            </li>
          </ul>
          <SubscribeButton />
        </div>
      </div>
    </div>
  )
}

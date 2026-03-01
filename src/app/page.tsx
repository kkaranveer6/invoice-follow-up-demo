import Link from "next/link";
import { FileSearch, Mail, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="font-heading text-lg font-bold text-indigo-600">Invoice Follow-Up</span>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>
      {/* Hero section */}
      <section className="bg-gradient-to-b from-indigo-50/50 to-white">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:py-32">
          <h1 className="font-heading text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Never chase invoices again
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Connect your Stripe account, and Invoice Follow-Up automatically
            sends escalating email reminders to overdue clients.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
          <p className="mt-8 text-sm text-slate-400">
            Join hundreds of businesses automating invoice collections
          </p>
        </div>
      </section>

      {/* Features section */}
      <section className="bg-white py-24">
        <h2 className="text-center font-heading text-3xl font-bold text-slate-900">
          How it works
        </h2>
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 px-6 md:grid-cols-3">
          <div>
            <div className="inline-flex rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <FileSearch className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-heading text-lg font-semibold">
              Detect Overdue Invoices
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Connects to your Stripe account and automatically identifies
              invoices past their due date.
            </p>
          </div>
          <div>
            <div className="inline-flex rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-heading text-lg font-semibold">
              Smart Email Reminders
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Sends a series of escalating reminders — friendly nudge, firm
              follow-up, and final notice.
            </p>
          </div>
          <div>
            <div className="inline-flex rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-heading text-lg font-semibold">
              Set It & Forget It
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Configure once, and the system handles follow-ups automatically.
              Focus on your business, not collections.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing section */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-heading text-3xl font-bold text-slate-900">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
            Start with a 14-day free trial. No credit card required.
          </p>
          <div className="mx-auto mt-12 max-w-sm rounded-2xl border bg-white p-8 text-left shadow-sm">
            <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">
              Pro
            </p>
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
            <Button className="mt-8 w-full" asChild>
              <Link href="/sign-up">Start free trial</Link>
            </Button>
            <p className="mt-3 text-center text-xs text-slate-400">
              14-day free trial · No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center">
        <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
          <Link href="/privacy" className="hover:text-slate-600">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-slate-600">
            Terms of Service
          </Link>
        </div>
        <p className="mt-3 text-sm text-slate-400">Invoice Follow-Up © 2026</p>
      </footer>
    </div>
  );
}

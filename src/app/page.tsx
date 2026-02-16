import Link from "next/link";
import { FileSearch, Mail, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="bg-gradient-to-b from-indigo-50/50 to-white">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:py-32">
          <h1 className="font-heading text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Never chase invoices again
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Automatically detect overdue invoices from your Stripe account and
            send smart email reminders. Set it up once and let it work for you.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
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

      {/* Footer */}
      <footer className="border-t py-8 text-center">
        <p className="text-sm text-slate-400">Invoice Follow-Up © 2026</p>
      </footer>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'

export function StaticSettingsPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-slate-900">
        Settings
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Manage your account and integrations.
      </p>

      <Alert className="mt-6 max-w-lg border-sky-200 bg-sky-50 text-sky-800">
        <Info className="h-4 w-4 text-sky-600" />
        <AlertDescription>
          Demo mode — settings are not functional in this demo. In the real app,
          you can connect your Stripe account and manage reminder preferences here.
        </AlertDescription>
      </Alert>

      <Card className="mt-6 max-w-lg opacity-50 pointer-events-none">
        <CardHeader>
          <CardTitle className="font-heading">Stripe Connection</CardTitle>
          <CardDescription>
            Paste your Stripe secret key to connect your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-9 rounded-md border bg-slate-50" />
          <div className="mt-4 flex gap-3">
            <div className="h-9 w-32 rounded-md bg-slate-200" />
            <div className="h-9 w-24 rounded-md border bg-white" />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4 max-w-lg opacity-50 pointer-events-none">
        <CardHeader>
          <CardTitle className="font-heading">Reminder Settings</CardTitle>
          <CardDescription>
            Control reminder emails for all invoices at once.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Pause all reminders</p>
              <p className="text-xs text-slate-500 mt-0.5">
                When paused, no reminder emails will be sent for any invoice.
              </p>
            </div>
            <div className="h-6 w-11 rounded-full bg-slate-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

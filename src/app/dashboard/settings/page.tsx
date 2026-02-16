'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  connectStripeAccount,
  disconnectStripeAccount,
} from '@/app/actions/stripe'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await connectStripeAccount(apiKey)

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess('Stripe account connected successfully.')
        setApiKey('')
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleDisconnect() {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await disconnectStripeAccount()

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess('Stripe account disconnected.')
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-slate-900">
        Settings
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Manage your account and integrations.
      </p>

      <Card className="mt-8 max-w-lg">
        <CardHeader>
          <CardTitle className="font-heading">Stripe Connection</CardTitle>
          <CardDescription>
            Paste your Stripe secret key to connect your account. Your key is
            encrypted before storage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleConnect}>
            <div className="space-y-2">
              <Label htmlFor="apiKey">Stripe Secret Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk_test_..."
                required
              />
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mt-4 border-green-200 bg-green-50 text-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="mt-6 flex gap-3">
              <Button type="submit" disabled={loading || !apiKey}>
                {loading ? 'Connecting...' : 'Connect Stripe'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleDisconnect}
                disabled={loading}
              >
                Disconnect
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

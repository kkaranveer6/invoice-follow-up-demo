'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  connectStripeAccount,
  disconnectStripeAccount,
} from '@/app/actions/stripe'

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
      <h2 className="text-2xl font-bold">Settings</h2>

      <div className="mt-8 max-w-lg rounded-lg border bg-white p-6">
        <h3 className="text-lg font-semibold">Stripe Connection</h3>
        <p className="mt-1 text-sm text-gray-600">
          Paste your Stripe secret key to connect your account. Your key is
          encrypted before storage.
        </p>

        <form onSubmit={handleConnect} className="mt-4">
          <label htmlFor="apiKey" className="block text-sm font-medium">
            Stripe Secret Key
          </label>
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk_test_..."
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            required
          />

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          {success && <p className="mt-2 text-sm text-green-600">{success}</p>}

          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              disabled={loading || !apiKey}
              className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect Stripe'}
            </button>
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={loading}
              className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Disconnect
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

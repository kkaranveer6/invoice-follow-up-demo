'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { syncInvoicesAction } from '@/app/actions/invoices'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'

interface SyncButtonProps {
  lastSyncedAt: Date | null
}

export function SyncButton({ lastSyncedAt }: SyncButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [syncedCount, setSyncedCount] = useState<number | null>(null)

  async function handleSync() {
    setLoading(true)
    setError(null)
    setSyncedCount(null)

    try {
      const result = await syncInvoicesAction()

      if (result.error) {
        setError(result.error)
      } else {
        setSyncedCount(result.synced ?? 0)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button onClick={handleSync} disabled={loading} variant="outline" size="sm">
        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Syncing…' : 'Sync Invoices'}
      </Button>

      {lastSyncedAt && (
        <p className="text-xs text-slate-500">
          Last synced: {lastSyncedAt.toLocaleString()}
        </p>
      )}
      {!lastSyncedAt && (
        <p className="text-xs text-slate-500">Never synced</p>
      )}

      {error && (
        <Alert variant="destructive" className="max-w-xs">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {syncedCount !== null && (
        <Alert className="max-w-xs border-green-200 bg-green-50 text-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>Synced {syncedCount} invoices.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

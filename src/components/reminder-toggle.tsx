'use client'

import { useOptimistic, useTransition, useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toggleRemindersAction } from '@/app/actions/invoices'

interface ReminderToggleProps {
  invoiceId: string
  initialEnabled: boolean
}

export function ReminderToggle({ invoiceId, initialEnabled }: ReminderToggleProps) {
  const [optimisticEnabled, setOptimisticEnabled] = useOptimistic(initialEnabled)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState(false)

  function handleToggle(checked: boolean) {
    setError(false)
    startTransition(async () => {
      setOptimisticEnabled(checked)
      const result = await toggleRemindersAction(invoiceId, checked)
      if (result.error) {
        setError(true)
      }
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Switch
          checked={optimisticEnabled}
          onCheckedChange={handleToggle}
          disabled={isPending}
          aria-label="Toggle reminders"
        />
        {!optimisticEnabled && (
          <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-xs">
            Paused
          </Badge>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500">Failed to update. Try again.</p>
      )}
    </div>
  )
}

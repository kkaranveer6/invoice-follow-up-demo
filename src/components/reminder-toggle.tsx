'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

interface ReminderToggleProps {
  invoiceId: string
  initialEnabled: boolean
}

export function ReminderToggle({ invoiceId: _, initialEnabled }: ReminderToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled)

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={enabled}
        onCheckedChange={setEnabled}
        aria-label="Toggle reminders"
      />
      {!enabled && (
        <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-xs">
          Paused
        </Badge>
      )}
    </div>
  )
}

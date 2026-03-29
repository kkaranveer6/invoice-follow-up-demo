interface SyncButtonProps {
  lastSyncedAt: Date | null
}

export function SyncButton({ lastSyncedAt }: SyncButtonProps) {
  return (
    <p className="text-xs text-slate-500">
      {lastSyncedAt
        ? `Last synced: ${lastSyncedAt.toLocaleString()}`
        : 'Never synced'}
    </p>
  )
}

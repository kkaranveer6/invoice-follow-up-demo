export default function DashboardLoading() {
  return (
    <div>
      {/* Page title skeleton */}
      <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
      <div className="mt-2 h-4 w-64 animate-pulse rounded bg-slate-200" />

      {/* Stat cards skeleton */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-4 animate-pulse rounded bg-slate-200" />
            </div>
            <div
              className={`mt-4 animate-pulse rounded bg-slate-200 ${
                i === 0 ? 'h-5 w-20 rounded-full' : 'h-8 w-16'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Invoice section skeleton (repeated three times) */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="mt-8">
          <div className="mb-3 h-6 w-36 animate-pulse rounded bg-slate-200" />
          <div className="rounded-xl border bg-white shadow-sm p-4 space-y-3">
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j} className="h-10 w-full animate-pulse rounded bg-slate-100" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

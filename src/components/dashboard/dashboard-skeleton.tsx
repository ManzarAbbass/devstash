function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className ?? ""}`} />
}

export function DashboardSkeleton() {
  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center gap-2 border-b border-border px-4 py-2">
        <Skeleton className="size-5" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mx-auto h-9 w-full max-w-md" />
        <Skeleton className="ml-auto h-8 w-8" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-60 shrink-0 border-r border-border md:block">
          <div className="flex flex-col gap-4 p-4">
            <Skeleton className="h-4 w-20" />
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
            <Skeleton className="h-4 w-28" />
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-full" />
              ))}
            </div>
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto p-6">
          <DashboardContentSkeleton />
        </main>
      </div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <Skeleton className="size-10 rounded-lg" />
      <div className="flex flex-col gap-1">
        <Skeleton className="h-7 w-12" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

export function CollectionCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-5 rounded" />
        <Skeleton className="h-4 flex-1" />
      </div>
      <Skeleton className="h-3 w-3/4" />
      <div className="flex items-center gap-2">
        <Skeleton className="size-4 rounded" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

export function ItemCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Skeleton className="size-4 rounded" />
        <Skeleton className="h-4 flex-1" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}

export function DashboardContentSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-8 w-32" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <section>
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CollectionCardSkeleton key={i} />
          ))}
        </div>
      </section>
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="size-4" />
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <ItemCardSkeleton key={i} />
          ))}
        </div>
      </section>
      <section>
        <Skeleton className="mb-4 h-5 w-28" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <ItemCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  )
}

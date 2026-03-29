import { Skeleton } from '@/components/ui/Skeleton';

export default function RecepcaoLoading() {
  return (
    <div className="space-y-4 p-4 pb-20" style={{ background: 'var(--bb-depth-1)' }}>
      {/* Header: title + clock */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-20 rounded-lg" />
      </div>

      {/* Quick stat cards (2x2) */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      {/* Next classes list */}
      <Skeleton className="h-40 rounded-xl" />

      {/* Check-in queue / pending list */}
      <Skeleton className="h-48 rounded-xl" />

      {/* Pending tasks */}
      <Skeleton className="h-32 rounded-xl" />
    </div>
  );
}

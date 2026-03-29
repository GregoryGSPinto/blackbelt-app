import { Skeleton } from '@/components/ui/Skeleton';

export default function SuperAdminLoading() {
  return (
    <div className="min-h-screen p-6 space-y-6" style={{ background: 'var(--bb-depth-1)' }}>
      {/* Header: Mission Control title */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>

      {/* KPI cards (6 cols on large) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      {/* Two-column: alerts + charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <Skeleton className="h-5 w-36" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>

      {/* Another two-column: academies + revenue */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    </div>
  );
}

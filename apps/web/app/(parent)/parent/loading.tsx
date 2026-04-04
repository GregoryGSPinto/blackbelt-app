import { Skeleton } from '@/components/ui/Skeleton';

export default function ParentLoading() {
  return (
    <div className="min-h-screen p-6 space-y-6" style={{ background: 'var(--bb-depth-1)' }}>
      {/* Header: greeting */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Children cards (2 cols) */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-3 p-4 rounded-xl" style={{ background: 'var(--bb-depth-2)' }}>
            <div className="flex items-center gap-3">
              <Skeleton variant="circle" className="h-12 w-12" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* Today's classes */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>

      {/* Financial section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>

      {/* Communications */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-28" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

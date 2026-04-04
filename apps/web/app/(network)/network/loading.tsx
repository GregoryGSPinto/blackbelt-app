import { Skeleton } from '@/components/ui/Skeleton';

export default function NetworkLoading() {
  return (
    <div className="min-h-screen p-6 space-y-6" style={{ background: 'var(--bb-depth-1)' }}>
      {/* Header: title + search */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-10 w-64 rounded-lg" />
      </div>

      {/* Network map / connection cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-3 p-4 rounded-xl" style={{ background: 'var(--bb-depth-2)' }}>
            <div className="flex items-center gap-3">
              <Skeleton variant="circle" className="h-12 w-12" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

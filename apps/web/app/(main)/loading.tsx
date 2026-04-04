import { Skeleton } from '@/components/ui/Skeleton';

export default function MainLoading() {
  return (
    <div className="min-h-screen p-6 space-y-6" style={{ background: 'var(--bb-depth-1)' }}>
      {/* Header: student name + belt badge */}
      <div className="flex items-center gap-4">
        <Skeleton variant="circle" className="h-14 w-14" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>

      {/* Weekly calendar strip */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Skeleton key={i} className="h-16 w-12 rounded-lg" />
        ))}
      </div>

      {/* Next class card */}
      <Skeleton className="h-28 rounded-xl" />

      {/* Progress + stats cards */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      {/* Quick links / content list */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

import { Skeleton } from '@/components/ui/Skeleton';

export default function TeenLoading() {
  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bb-depth-1)' }}>
      {/* Hero: avatar + XP bar */}
      <div className="flex flex-col items-center pt-8 px-4 space-y-3">
        <Skeleton variant="circle" className="h-20 w-20" />
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-28" />
        {/* XP bar */}
        <Skeleton className="h-3 w-64 rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-5">
        {/* Level / rank card */}
        <Skeleton className="h-28 rounded-xl" />

        {/* Weekly streak */}
        <Skeleton className="h-20 rounded-xl" />

        {/* Achievements grid */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-28" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

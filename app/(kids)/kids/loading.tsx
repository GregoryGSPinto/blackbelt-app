import { Skeleton } from '@/components/ui/Skeleton';

export default function KidsLoading() {
  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bb-depth-1)' }}>
      {/* Hero: mascot + name + belt */}
      <div className="flex flex-col items-center pt-8 px-4 space-y-3">
        <Skeleton variant="circle" className="h-24 w-24" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-24 rounded-md" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-5">
        {/* Belt journey card (tall) */}
        <Skeleton className="h-44 rounded-2xl" />

        {/* Stars / streak card */}
        <Skeleton className="h-28 rounded-2xl" />

        {/* Sticker album grid */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-36" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-20 w-20 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Exchange store card */}
        <Skeleton className="h-36 rounded-2xl" />

        {/* Weekly missions */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

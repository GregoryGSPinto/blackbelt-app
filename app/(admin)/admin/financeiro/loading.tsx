import { Skeleton } from '@/components/ui/Skeleton';

export default function FinanceiroLoading() {
  return (
    <div className="min-h-screen p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

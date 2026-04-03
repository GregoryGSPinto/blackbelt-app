import { Skeleton } from '@/components/ui/Skeleton';

export default function AcademiasLoading() {
  return (
    <div className="min-h-screen p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

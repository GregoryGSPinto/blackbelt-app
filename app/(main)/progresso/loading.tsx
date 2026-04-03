import { Skeleton } from '@/components/ui/Skeleton';

export default function ProgressoLoading() {
  return (
    <div className="min-h-screen p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-7 w-36" />
      </div>
      <Skeleton className="h-48 rounded-xl" />
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

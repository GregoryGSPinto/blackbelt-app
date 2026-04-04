import { Skeleton } from '@/components/ui/Skeleton';

export default function ReceitaLoading() {
  return (
    <div className="min-h-screen p-4 sm:p-6 space-y-6">
      <Skeleton className="h-8 w-40" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

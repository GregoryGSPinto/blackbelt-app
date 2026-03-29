import { Skeleton } from '@/components/ui/Skeleton';

export default function PublicLoading() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bb-depth-1)' }}>
      {/* Hero section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="text-center space-y-4">
          <Skeleton className="mx-auto h-10 w-72" />
          <Skeleton className="mx-auto h-5 w-96" />
          <Skeleton className="mx-auto h-5 w-80" />
        </div>

        {/* CTA buttons */}
        <div className="flex justify-center gap-4">
          <Skeleton className="h-12 w-40 rounded-xl" />
          <Skeleton className="h-12 w-36 rounded-xl" />
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-12">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>

        {/* Content section */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mt-12">
          <Skeleton className="h-64 rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-36 rounded-lg mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

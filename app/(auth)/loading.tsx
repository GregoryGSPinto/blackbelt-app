import { Skeleton } from '@/components/ui/Skeleton';

export default function AuthLoading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ background: 'var(--bb-depth-1)' }}
    >
      <div className="w-full max-w-sm space-y-6">
        {/* Logo placeholder */}
        <div className="flex justify-center">
          <Skeleton className="h-12 w-40 rounded-lg" />
        </div>

        {/* Title */}
        <div className="space-y-2 text-center">
          <Skeleton className="mx-auto h-7 w-36" />
          <Skeleton className="mx-auto h-4 w-52" />
        </div>

        {/* Email field */}
        <Skeleton className="h-11 w-full rounded-lg" />

        {/* Password field */}
        <Skeleton className="h-11 w-full rounded-lg" />

        {/* Submit button */}
        <Skeleton className="h-11 w-full rounded-lg" />

        {/* Divider */}
        <Skeleton className="mx-auto h-4 w-24" />

        {/* OAuth buttons */}
        <div className="space-y-3">
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>

        {/* Footer links */}
        <div className="flex justify-center gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

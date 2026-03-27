import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center h-screen" style={{ background: 'var(--bb-depth-1)' }}>
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--bb-brand)', borderTopColor: 'transparent' }}
        />
        <Skeleton variant="text" className="h-4 w-32" />
        <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>Carregando...</p>
      </div>
    </div>
  );
}

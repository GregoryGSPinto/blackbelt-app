'use client';

export default function ParentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center h-screen" style={{ background: 'var(--bb-depth-1)' }}>
      <div className="max-w-md text-center p-8">
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--bb-ink-100)' }}>
          Algo deu errado
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--bb-ink-60)' }}>
          {error.message || 'Ocorreu um erro inesperado.'}
        </p>
        {error.digest && (
          <p className="text-xs mb-4" style={{ color: 'var(--bb-ink-40)' }}>
            Codigo: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="px-6 py-3 rounded-lg text-white font-semibold transition-opacity hover:opacity-90"
          style={{ background: 'var(--bb-brand)' }}
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

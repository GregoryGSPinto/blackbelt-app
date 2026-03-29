'use client';

export default function CockpitError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-6"
      style={{ color: 'var(--bb-ink-1)' }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ background: 'var(--bb-depth-2)' }}
      >
        <span className="text-2xl" role="img" aria-label="Aviso">
          &#9888;&#65039;
        </span>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Algo deu errado</h2>
        <p className="text-sm mb-1" style={{ color: 'var(--bb-ink-3)' }}>
          {error.message || 'Erro inesperado. Tente novamente.'}
        </p>
        {error.digest && (
          <p className="text-xs font-mono" style={{ color: 'var(--bb-ink-3)' }}>
            Código: {error.digest}
          </p>
        )}
      </div>
      <button
        onClick={reset}
        aria-label="Tentar novamente"
        className="px-6 py-2 rounded-lg font-medium transition-colors"
        style={{ background: 'var(--bb-brand)', color: '#fff' }}
      >
        Tentar novamente
      </button>
    </div>
  );
}

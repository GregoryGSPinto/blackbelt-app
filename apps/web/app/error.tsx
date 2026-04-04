'use client';

import { useEffect } from 'react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for monitoring
    console.error('[RootError]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-6" style={{ color: 'var(--bb-ink-100)' }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--bb-depth-3)' }}>
        <span className="text-2xl" role="img" aria-label="Aviso">&#9888;&#65039;</span>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Algo deu errado</h2>
        <p className="text-sm mb-1" style={{ color: 'var(--bb-ink-60)' }}>
          {error.message || 'Ocorreu um erro inesperado. Nossa equipe foi notificada.'}
        </p>
        {error.digest && (
          <p className="text-xs font-mono" style={{ color: 'var(--bb-ink-40)' }}>
            Código: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-6 py-2 rounded-lg font-medium transition-colors"
          style={{ background: 'var(--bb-brand)', color: '#fff' }}
        >
          Tentar novamente
        </button>
        <button
          onClick={() => { window.location.href = '/'; }}
          className="px-6 py-2 rounded-lg font-medium transition-colors"
          style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)' }}
        >
          Voltar ao início
        </button>
      </div>
    </div>
  );
}

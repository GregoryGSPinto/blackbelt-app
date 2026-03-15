'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/Button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="rounded-xl border border-red-200 bg-red-50 p-8">
        <h2 className="text-xl font-bold text-red-700">Algo deu errado</h2>
        <p className="mt-2 text-sm text-red-600">
          Ocorreu um erro inesperado. Nossa equipe foi notificada.
        </p>
        {error.digest && (
          <p className="mt-1 text-xs text-bb-gray-400">Código: {error.digest}</p>
        )}
        <div className="mt-4 flex justify-center gap-3">
          <Button variant="danger" onClick={reset}>Tentar novamente</Button>
          <Button variant="ghost" onClick={() => window.location.href = '/'}>Voltar ao início</Button>
        </div>
      </div>
    </div>
  );
}

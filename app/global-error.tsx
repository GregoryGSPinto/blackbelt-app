'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
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
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{
          display: 'flex',
          minHeight: '100vh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#C62828' }}>
            Erro Crítico
          </h1>
          <p style={{ marginTop: '8px', color: '#666' }}>
            A aplicação encontrou um erro inesperado.
          </p>
          {error.digest && (
            <p style={{ marginTop: '4px', fontSize: '12px', color: '#999' }}>
              Código: {error.digest}
            </p>
          )}
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{
                padding: '8px 24px',
                background: '#C62828',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Tentar novamente
            </button>
            <a
              href="/"
              style={{
                padding: '8px 24px',
                background: 'transparent',
                color: '#666',
                border: '1px solid #ccc',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Voltar para o inicio
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}

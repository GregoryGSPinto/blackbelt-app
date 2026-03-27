'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface GlobalErrorBoundaryProps {
  children: ReactNode;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<GlobalErrorBoundaryProps, GlobalErrorBoundaryState> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): GlobalErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[GlobalErrorBoundary]', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex min-h-screen items-center justify-center p-6"
          style={{ backgroundColor: 'var(--bb-depth-1)', color: 'var(--bb-ink-100)' }}
        >
          <div className="w-full max-w-md text-center">
            {/* Icon */}
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ backgroundColor: 'color-mix(in srgb, #EF4444 15%, transparent)' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#EF4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            {/* Message */}
            <h1 className="mt-6 text-xl font-bold">Algo deu errado</h1>
            <p
              className="mt-3 text-sm"
              style={{ color: 'var(--bb-ink-60)' }}
            >
              Ocorreu um erro inesperado. Tente recarregar a pagina.
            </p>

            {/* Error detail (dev only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre
                className="mt-4 max-h-32 overflow-auto rounded-lg p-3 text-left text-xs"
                style={{
                  backgroundColor: 'var(--bb-depth-2)',
                  color: 'var(--bb-ink-60)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              >
                {this.state.error.message}
              </pre>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={this.handleReload}
                className="rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--bb-brand-gradient)' }}
              >
                Tentar novamente
              </button>
              <button
                onClick={this.handleReset}
                className="rounded-xl px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: 'var(--bb-depth-2)',
                  color: 'var(--bb-ink-80)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              >
                Fechar erro
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

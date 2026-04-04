'use client';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function ErrorState({
  message = 'Algo deu errado. Tente novamente.',
  onRetry,
  isRetrying,
}: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl p-8 text-center"
      style={{
        backgroundColor: 'var(--bb-depth-2)',
        border: '1px solid var(--bb-glass-border)',
      }}
    >
      {/* Icon */}
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ backgroundColor: 'color-mix(in srgb, #EF4444 15%, transparent)' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
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
      <p
        className="mt-4 text-sm font-medium"
        style={{ color: 'var(--bb-ink-80)' }}
      >
        {message}
      </p>

      {/* Retry button */}
      {onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="mt-4 rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{
            background: 'var(--bb-brand-gradient)',
            color: '#fff',
          }}
        >
          {isRetrying ? 'Tentando...' : 'Tentar novamente'}
        </button>
      )}
    </div>
  );
}

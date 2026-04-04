'use client';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div
        className="mb-4"
        style={{ color: 'var(--bb-ink-3)' }}
      >
        {icon}
      </div>
      <h3
        className="text-base font-semibold mb-1"
        style={{ color: 'var(--bb-ink-2)' }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="text-sm max-w-xs"
          style={{ color: 'var(--bb-ink-3)' }}
        >
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          aria-label={action.label}
          className="mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            border: '1px solid var(--bb-brand)',
            color: 'var(--bb-brand)',
            background: 'transparent',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

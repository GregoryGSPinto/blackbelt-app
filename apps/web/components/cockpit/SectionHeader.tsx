'use client';

interface SectionHeaderProps {
  title: string;
  action?: { label: string; onClick: () => void; icon?: React.ReactNode };
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2
        className="text-base font-semibold"
        style={{ color: 'var(--bb-ink-1)' }}
      >
        {title}
      </h2>
      {action && (
        <button
          onClick={action.onClick}
          aria-label={action.label}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          style={{
            border: '1px solid var(--bb-brand)',
            color: 'var(--bb-brand)',
            background: 'transparent',
          }}
        >
          {action.icon}
          {action.label}
        </button>
      )}
    </div>
  );
}

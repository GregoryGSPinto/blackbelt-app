'use client';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps {
  label: string;
  variant: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: 'var(--bb-success)', text: 'var(--bb-success)' },
  warning: { bg: 'var(--bb-warning)', text: 'var(--bb-warning)' },
  danger: { bg: 'var(--bb-danger)', text: 'var(--bb-danger)' },
  info: { bg: 'var(--bb-brand)', text: 'var(--bb-brand)' },
  neutral: { bg: 'var(--bb-ink-3)', text: 'var(--bb-ink-3)' },
};

export function StatusBadge({ label, variant }: StatusBadgeProps) {
  const style = variantStyles[variant];

  return (
    <span
      className="relative inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium overflow-hidden"
      style={{ color: style.text }}
    >
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background: style.bg,
          opacity: 0.12,
        }}
      />
      <span className="relative">{label}</span>
    </span>
  );
}

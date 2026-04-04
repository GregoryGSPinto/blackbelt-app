'use client';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  size?: 'sm' | 'md';
}

export function Toggle({ checked, onChange, disabled = false, label, description, size = 'md' }: ToggleProps) {
  const trackSize = size === 'sm' ? 'w-9 h-5' : 'w-11 h-6';
  const thumbSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const translate = size === 'sm' ? 'translate-x-4' : 'translate-x-5';

  return (
    <label className={`inline-flex items-center gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex shrink-0 ${trackSize} items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2`}
        style={{
          background: checked ? 'var(--bb-brand)' : 'var(--bb-depth-3)',
          borderColor: checked ? 'var(--bb-brand)' : 'var(--bb-glass-border)',
          '--tw-ring-color': 'var(--bb-brand)',
        } as React.CSSProperties}
      >
        <span
          className={`inline-block ${thumbSize} rounded-full bg-white shadow-sm transform transition-transform duration-200 ${checked ? translate : 'translate-x-0.5'}`}
        />
      </button>
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{label}</span>}
          {description && <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{description}</span>}
        </div>
      )}
    </label>
  );
}

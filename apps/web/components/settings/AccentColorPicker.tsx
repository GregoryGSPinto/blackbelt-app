'use client';

import { useAccentColor } from '@/lib/hooks/useAccentColor';
import { useToast } from '@/lib/hooks/useToast';

export function AccentColorPicker() {
  const { accentColor, setAccentColor, ACCENT_COLORS } = useAccentColor();
  const { toast } = useToast();

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
        Cor de destaque
      </h3>
      <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
        Personalize a cor de destaque da sua interface.
      </p>
      <div className="flex flex-wrap gap-3">
        {ACCENT_COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => {
              setAccentColor(c.value);
              toast(`Cor alterada para ${c.name}`, 'success');
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-transform hover:scale-110"
            style={{
              background: c.value,
              borderColor: accentColor === c.value ? 'var(--bb-ink-100)' : 'transparent',
            }}
            title={c.name}
            aria-label={`Selecionar cor ${c.name}`}
          >
            {accentColor === c.value && (
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

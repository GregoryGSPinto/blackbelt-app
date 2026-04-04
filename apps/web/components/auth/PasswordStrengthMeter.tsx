'use client';

import type { CSSProperties } from 'react';

export interface PasswordStrengthMeterProps {
  strength: number;
}

interface StrengthLevel {
  width: string;
  color: string;
  label: string;
}

const STRENGTH_LEVELS: Record<number, StrengthLevel> = {
  1: { width: '25%', color: 'var(--bb-error)', label: 'FRACA' },
  2: { width: '50%', color: 'var(--bb-warning)', label: 'RAZOAVEL' },
  3: { width: '75%', color: '#eab308', label: 'BOM' },
  4: { width: '100%', color: 'var(--bb-success)', label: 'FORTE' },
};

export function PasswordStrengthMeter({ strength }: PasswordStrengthMeterProps) {
  if (strength <= 0) return null;

  const level = STRENGTH_LEVELS[strength];
  if (!level) return null;

  return (
    <div className="flex flex-col gap-1">
      <div
        className="h-1.5 w-full overflow-hidden"
        style={
          {
            backgroundColor: 'var(--bb-depth-4)',
            borderRadius: 'var(--bb-radius-md)',
          } as CSSProperties
        }
      >
        <div
          className="h-full transition-all duration-500 ease-out"
          style={
            {
              width: level.width,
              backgroundColor: level.color,
              borderRadius: 'var(--bb-radius-md)',
            } as CSSProperties
          }
        />
      </div>
      <span
        className="text-xs font-semibold tracking-wide"
        style={{ color: level.color }}
      >
        {level.label}
      </span>
    </div>
  );
}
PasswordStrengthMeter.displayName = 'PasswordStrengthMeter';

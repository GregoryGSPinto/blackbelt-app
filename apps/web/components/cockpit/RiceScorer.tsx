'use client';

interface RiceScorerProps {
  impact: number;
  urgency: number;
  effort: number;
  onChange?: (field: string, value: number) => void;
  readonly?: boolean;
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

export function RiceScorer({ impact, urgency, effort, onChange, readonly }: RiceScorerProps) {
  const score = impact * 3 + urgency * 2 + effort * 1;

  let scoreColor = 'var(--bb-danger)';
  if (score >= 20) scoreColor = 'var(--bb-success)';
  else if (score >= 15) scoreColor = 'var(--bb-warning)';

  const fields: Array<{ key: string; label: string; value: number }> = [
    { key: 'impact', label: 'I', value: impact },
    { key: 'urgency', label: 'U', value: urgency },
    { key: 'effort', label: 'E', value: effort },
  ];

  return (
    <div className="flex items-center gap-2">
      {fields.map((f) => (
        <label key={f.key} className="flex items-center gap-1">
          <span
            className="text-xs font-semibold"
            style={{ color: 'var(--bb-ink-3)' }}
          >
            {f.label}
          </span>
          <input
            type="number"
            min={1}
            max={5}
            value={f.value}
            readOnly={readonly}
            aria-label={`${f.label} (1-5)`}
            onChange={(e) => {
              if (!readonly && onChange) {
                onChange(f.key, clamp(Number(e.target.value), 1, 5));
              }
            }}
            className="w-10 rounded px-1.5 py-0.5 text-center text-sm font-medium"
            style={{
              background: 'var(--bb-depth-1)',
              color: 'var(--bb-ink-1)',
              border: '1px solid var(--bb-ink-3)',
            }}
          />
        </label>
      ))}
      <span
        className="ml-1 text-sm font-bold"
        style={{ color: scoreColor }}
      >
        = {score}
      </span>
    </div>
  );
}

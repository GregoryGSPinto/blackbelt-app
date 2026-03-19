'use client';

import { forwardRef } from 'react';
import { X } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'search';
  options?: FilterOption[];
  placeholder?: string;
}

interface ListFiltersProps {
  filters: FilterConfig[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
}

// ── Component ──────────────────────────────────────────────────────

const ListFilters = forwardRef<HTMLDivElement, ListFiltersProps>(
  function ListFilters({ filters, values, onChange, onClear }, ref) {
    const activeFilters = Object.entries(values).filter(
      ([, v]) => v && v !== 'all' && v !== '',
    );

    return (
      <div ref={ref} className="space-y-2">
        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-50)' }}>
            Filtros:
          </span>
          {filters.map((filter) => {
            if (filter.type === 'search') {
              return (
                <input
                  key={filter.key}
                  type="text"
                  value={values[filter.key] ?? ''}
                  onChange={(e) => onChange(filter.key, e.target.value)}
                  placeholder={filter.placeholder ?? `Buscar...`}
                  className="h-8 w-40 rounded-lg border px-3 text-xs"
                  style={{
                    background: 'var(--bb-depth-3)',
                    border: '1px solid var(--bb-glass-border)',
                    color: 'var(--bb-ink-100)',
                  }}
                />
              );
            }

            return (
              <select
                key={filter.key}
                value={values[filter.key] ?? 'all'}
                onChange={(e) => onChange(filter.key, e.target.value)}
                className="h-8 rounded-lg border px-2 text-xs"
                style={{
                  background: 'var(--bb-depth-3)',
                  border: '1px solid var(--bb-glass-border)',
                  color: 'var(--bb-ink-100)',
                }}
              >
                <option value="all">{filter.label}</option>
                {filter.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            );
          })}
        </div>

        {/* Active filter tags */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
              Ativos:
            </span>
            {activeFilters.map(([key, value]) => {
              const config = filters.find((f) => f.key === key);
              const label = config?.options?.find((o) => o.value === value)?.label ?? value;
              return (
                <span
                  key={key}
                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    background: 'var(--bb-brand-surface, rgba(239,68,68,0.1))',
                    color: 'var(--bb-brand)',
                  }}
                >
                  {config?.label}: {label}
                  <button
                    onClick={() => onChange(key, 'all')}
                    className="ml-0.5 hover:opacity-70"
                    aria-label={`Remover filtro ${config?.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
            <button
              onClick={onClear}
              className="text-[10px] font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--bb-ink-40)' }}
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>
    );
  },
);

ListFilters.displayName = 'ListFilters';

export { ListFilters };

'use client';

import { forwardRef, useState, useEffect } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { getDependents } from '@/lib/api/family.service';
import type { DependentInfo } from '@/lib/api/family.service';

// ── Types ──────────────────────────────────────────────────────────────

interface DependentSelectorProps {
  guardianPersonId: string;
  activeDependentId: string | null;
  onSelect: (dependentId: string) => void;
}

// ── Helpers ─────────────────────────────────────────────────────────────

function calcAge(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const today = new Date();
  const birth = new Date(dateStr);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function ageLabel(age: number | null): string {
  if (age === null) return '';
  if (age >= 5 && age <= 12) return 'Kids';
  if (age >= 13 && age <= 17) return 'Teen';
  return '';
}

// ── Component ──────────────────────────────────────────────────────────

const DependentSelector = forwardRef<HTMLDivElement, DependentSelectorProps>(
  function DependentSelector({ guardianPersonId, activeDependentId, onSelect }, ref) {
    const [dependents, setDependents] = useState<DependentInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      let cancelled = false;
      (async () => {
        try {
          const list = await getDependents(guardianPersonId);
          if (!cancelled) {
            setDependents(list);
            // Auto-select first if none selected
            if (!activeDependentId && list.length > 0) {
              onSelect(list[0].id);
            }
          }
        } catch {
          // silent
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }, [guardianPersonId]); // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) {
      return (
        <div ref={ref} className="flex gap-2 px-4 py-2">
          <div className="h-10 w-24 animate-pulse rounded-full" style={{ background: 'var(--bb-depth-3)' }} />
          <div className="h-10 w-24 animate-pulse rounded-full" style={{ background: 'var(--bb-depth-3)' }} />
        </div>
      );
    }

    if (dependents.length === 0) return null;
    if (dependents.length === 1) {
      return (
        <div ref={ref} className="flex items-center gap-2 px-4 py-2">
          <Avatar name={dependents[0].fullName} size="sm" />
          <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
            {dependents[0].fullName}
          </span>
          {dependents[0].birthDate != null && (
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: 'var(--bb-brand-surface)', color: 'var(--bb-brand)' }}>
              {ageLabel(calcAge(dependents[0].birthDate))}
            </span>
          )}
        </div>
      );
    }

    return (
      <div ref={ref} className="flex gap-2 overflow-x-auto px-4 py-2" style={{ scrollbarWidth: 'none' }}>
        {dependents.map((dep) => {
          const isActive = dep.id === activeDependentId;
          const age = calcAge(dep.birthDate ?? null);
          return (
            <button
              key={dep.id}
              onClick={() => onSelect(dep.id)}
              className="flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all"
              style={{
                background: isActive ? 'var(--bb-brand)' : 'var(--bb-depth-2)',
                color: isActive ? '#fff' : 'var(--bb-ink-80)',
                border: isActive ? '2px solid var(--bb-brand)' : '1px solid var(--bb-glass-border)',
              }}
            >
              <Avatar name={dep.fullName} size="sm" />
              <span>{dep.fullName.split(' ')[0]}</span>
              {age !== null && (
                <span className="text-[10px] opacity-75">{ageLabel(age)}</span>
              )}
            </button>
          );
        })}
      </div>
    );
  },
);

DependentSelector.displayName = 'DependentSelector';

export { DependentSelector };
export type { DependentSelectorProps };

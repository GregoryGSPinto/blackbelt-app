'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { getGuardianLinks } from '@/lib/api/guardian-links.service';
import type { GuardianLink } from '@/lib/types/guardian';
import {
  CheckSquareIcon,
  CalendarIcon,
  ClockIcon,
  ChevronRightIcon,
} from '@/components/shell/icons';

// ────────────────────────────────────────────────────────────
// Mock: Upcoming classes per child
// ────────────────────────────────────────────────────────────

interface UpcomingClass {
  id: string;
  child_id: string;
  class_name: string;
  date: string;
  time: string;
  day_label: string;
}

const MOCK_UPCOMING_CLASSES: UpcomingClass[] = [
  { id: 'uc-1', child_id: 'sophia', class_name: 'BJJ Teen Avancado', date: '2026-03-31', time: '16:00', day_label: 'Terca, 31/03' },
  { id: 'uc-2', child_id: 'sophia', class_name: 'BJJ Teen Avancado', date: '2026-04-02', time: '16:00', day_label: 'Quinta, 02/04' },
  { id: 'uc-3', child_id: 'helena', class_name: 'BJJ Kids', date: '2026-03-31', time: '15:00', day_label: 'Terca, 31/03' },
  { id: 'uc-4', child_id: 'helena', class_name: 'Judo Kids', date: '2026-04-01', time: '14:00', day_label: 'Quarta, 01/04' },
];

// ────────────────────────────────────────────────────────────
// Skeleton
// ────────────────────────────────────────────────────────────

function PreCheckinSkeleton() {
  return (
    <div className="p-4 lg:p-6 space-y-4">
      <Skeleton variant="text" className="h-8 w-56" />
      <Skeleton variant="text" className="h-4 w-72" />
      <div className="space-y-4">
        <Skeleton variant="card" className="h-48" />
        <Skeleton variant="card" className="h-48" />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────

export default function PreCheckinPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState<GuardianLink[]>([]);
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());

  const guardianId = profile?.id ?? 'prof-guardian-1';

  const loadData = useCallback(async () => {
    try {
      const data = await getGuardianLinks(guardianId);
      setLinks(data);
    } finally {
      setLoading(false);
    }
  }, [guardianId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleConfirm(classItem: UpcomingClass, childName: string) {
    setConfirmed((prev) => new Set(prev).add(classItem.id));
    toast(`Pre-check-in de ${childName} confirmado para ${classItem.class_name}`, 'success');
  }

  if (loading) return <PreCheckinSkeleton />;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--bb-brand-surface)' }}
          >
            <CheckSquareIcon className="h-5 w-5 text-[var(--bb-brand)]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[var(--bb-ink-100)]">
              Pre-check-in
            </h1>
            <p className="text-sm text-[var(--bb-ink-60)]">
              Confirme a presenca dos seus filhos nas proximas aulas
            </p>
          </div>
        </div>
      </div>

      {/* Children list */}
      {links.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckSquareIcon className="mx-auto h-10 w-10 text-[var(--bb-ink-40)]" />
          <p className="mt-3 text-sm font-medium text-[var(--bb-ink-60)]">
            Nenhum filho vinculado encontrado
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {links.map((link) => {
            const childClasses = MOCK_UPCOMING_CLASSES.filter(
              (c) => c.child_id === link.child_id,
            );
            const childName = link.child_name ?? 'Filho';

            return (
              <Card key={link.id} className="p-4">
                {/* Child header */}
                <div className="flex items-center gap-3 mb-4">
                  <Avatar name={childName} size="md" />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-[var(--bb-ink-100)]">
                      {childName}
                    </h3>
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                      style={{
                        backgroundColor:
                          link.child_role === 'aluno_teen'
                            ? 'var(--bb-info-surface)'
                            : 'var(--bb-warning-surface)',
                        color:
                          link.child_role === 'aluno_teen'
                            ? 'var(--bb-info)'
                            : 'var(--bb-warning)',
                      }}
                    >
                      {link.child_role === 'aluno_teen' ? 'Teen' : 'Kids'}
                    </span>
                  </div>
                  <ChevronRightIcon className="h-4 w-4 text-[var(--bb-ink-40)]" />
                </div>

                {/* Upcoming classes */}
                {childClasses.length === 0 ? (
                  <p className="text-sm text-[var(--bb-ink-40)] text-center py-3">
                    Nenhuma aula agendada
                  </p>
                ) : (
                  <div className="space-y-2">
                    {childClasses.map((cls) => {
                      const isConfirmed = confirmed.has(cls.id);
                      return (
                        <div
                          key={cls.id}
                          className="flex items-center justify-between rounded-[var(--bb-radius-sm)] border p-3 transition-all"
                          style={{
                            borderColor: isConfirmed
                              ? 'var(--bb-success)'
                              : 'var(--bb-glass-border)',
                            background: isConfirmed
                              ? 'var(--bb-success-surface)'
                              : 'var(--bb-depth-4)',
                          }}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-[var(--bb-ink-100)]">
                              {cls.class_name}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3 text-[var(--bb-ink-40)]" />
                                <span className="text-xs text-[var(--bb-ink-60)]">
                                  {cls.day_label}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ClockIcon className="h-3 w-3 text-[var(--bb-ink-40)]" />
                                <span className="text-xs text-[var(--bb-ink-60)]">
                                  {cls.time}
                                </span>
                              </div>
                            </div>
                          </div>
                          {isConfirmed ? (
                            <span
                              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"
                              style={{
                                backgroundColor: 'var(--bb-success-surface)',
                                color: 'var(--bb-success)',
                              }}
                            >
                              <CheckSquareIcon className="h-3.5 w-3.5" />
                              Confirmado
                            </span>
                          ) : (
                            <button
                              onClick={() => handleConfirm(cls, childName)}
                              className="min-h-[44px] rounded-[var(--bb-radius-sm)] px-4 py-2 text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95"
                              style={{ background: 'var(--bb-brand-gradient)' }}
                            >
                              Confirmar presenca
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

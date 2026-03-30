'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { getUpcomingClasses } from '@/lib/api/parent-checkin.service';
import { preCheckin, cancelPreCheckin } from '@/lib/api/pre-checkin.service';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { translateError } from '@/lib/utils/error-translator';
import {
  CheckSquareIcon,
  CalendarIcon,
  ClockIcon,
} from '@/components/shell/icons';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

interface UpcomingClass {
  id: string;
  child_id: string;
  child_name: string;
  student_id: string;
  class_id: string;
  class_name: string;
  date: string;
  time: string;
  day_label: string;
}

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
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState<Set<string>>(new Set());
  const [cancelling, setCancelling] = useState<Set<string>>(new Set());
  const [preCheckinIds, setPreCheckinIds] = useState<Map<string, string>>(new Map());

  const guardianId = profile?.id ?? '';

  const loadData = useCallback(async () => {
    if (!guardianId) return;
    try {
      const data = await getUpcomingClasses(guardianId);
      setUpcomingClasses(data);
    } finally {
      setLoading(false);
    }
  }, [guardianId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleConfirm(cls: UpcomingClass) {
    const key = cls.id;
    setConfirming((prev) => new Set(prev).add(key));
    try {
      const academyId = getActiveAcademyId();
      const result = await preCheckin(academyId, cls.student_id, cls.class_id, cls.date);
      setConfirmed((prev) => new Set(prev).add(key));
      if (result) {
        setPreCheckinIds((prev) => new Map(prev).set(key, result.id));
      }
      toast(`Pre-check-in de ${cls.child_name} confirmado para ${cls.class_name}`, 'success');
    } catch (error) {
      toast(translateError(error), 'error');
    } finally {
      setConfirming((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }

  async function handleCancel(cls: UpcomingClass) {
    const key = cls.id;
    const pcId = preCheckinIds.get(key);
    if (!pcId) return;
    setCancelling((prev) => new Set(prev).add(key));
    try {
      const success = await cancelPreCheckin(pcId);
      if (success) {
        setConfirmed((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
        setPreCheckinIds((prev) => {
          const next = new Map(prev);
          next.delete(key);
          return next;
        });
        toast(`Pre-check-in de ${cls.child_name} cancelado`, 'success');
      } else {
        toast('Erro ao cancelar pre-check-in', 'error');
      }
    } catch (error) {
      toast(translateError(error), 'error');
    } finally {
      setCancelling((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }

  if (loading) return <PreCheckinSkeleton />;

  // Group classes by child
  const childMap = new Map<string, { name: string; classes: UpcomingClass[] }>();
  for (const cls of upcomingClasses) {
    const existing = childMap.get(cls.child_id);
    if (existing) {
      existing.classes.push(cls);
    } else {
      childMap.set(cls.child_id, { name: cls.child_name, classes: [cls] });
    }
  }

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
      {childMap.size === 0 ? (
        <Card className="p-8 text-center">
          <CheckSquareIcon className="mx-auto h-10 w-10 text-[var(--bb-ink-40)]" />
          <p className="mt-3 text-sm font-medium text-[var(--bb-ink-60)]">
            Nenhuma aula agendada para os proximos dias
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {[...childMap.entries()].map(([childId, { name: childName, classes: childClasses }]) => (
            <Card key={childId} className="p-4">
              {/* Child header */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar name={childName} size="md" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-[var(--bb-ink-100)]">
                    {childName}
                  </h3>
                  <span className="text-xs text-[var(--bb-ink-60)]">
                    {childClasses.length} aula{childClasses.length !== 1 ? 's' : ''} agendada{childClasses.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Upcoming classes */}
              <div className="space-y-2">
                {childClasses.map((cls) => {
                  const isConfirmed = confirmed.has(cls.id);
                  const isConfirming = confirming.has(cls.id);
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
                        <div className="flex items-center gap-2">
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
                          <button
                            onClick={() => handleCancel(cls)}
                            disabled={cancelling.has(cls.id)}
                            className="rounded-[var(--bb-radius-sm)] px-3 py-1.5 text-xs font-bold text-[var(--bb-error)] transition-all hover:bg-[rgba(239,68,68,0.08)] disabled:opacity-60"
                          >
                            {cancelling.has(cls.id) ? 'Cancelando...' : 'Cancelar'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleConfirm(cls)}
                          disabled={isConfirming}
                          className="min-h-[44px] rounded-[var(--bb-radius-sm)] px-4 py-2 text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
                          style={{ background: 'var(--bb-brand-gradient)' }}
                        >
                          {isConfirming ? 'Confirmando...' : 'Confirmar presenca'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

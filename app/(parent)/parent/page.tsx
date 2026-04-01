'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Toggle } from '@/components/ui/Toggle';
import { getParentDashboard } from '@/lib/api/parent.service';
import type { FilhoResumoDTO, NotificacaoParentDTO } from '@/lib/api/parent.service';
import { getTodayClasses, doParentCheckin } from '@/lib/api/parent-checkin.service';
import type { ParentChildClass } from '@/lib/api/parent-checkin.service';
import { getGuardianLinks, updateGuardianPermissions } from '@/lib/api/guardian-links.service';
import type { GuardianLink } from '@/lib/types/guardian';
import { translateError } from '@/lib/utils/error-translator';
import { AttendanceMethod } from '@/lib/types';
import {
  CalendarIcon,
  DollarIcon,
  MessageIcon,
  BellIcon,
  BarChartIcon,
  CheckSquareIcon,
  ChevronRightIcon,
  ClockIcon,
  UsersIcon,
  ShieldIcon,
} from '@/components/shell/icons';

const GUARDIAN_RESOLUTION_ATTEMPTS = 4;
const GUARDIAN_RESOLUTION_DELAY_MS = 750;

// ────────────────────────────────────────────────────────────
// Belt color mapping
// ────────────────────────────────────────────────────────────

const BELT_COLORS: Record<string, string> = {
  white: 'var(--bb-ink-20)',
  gray: '#9ca3af',
  yellow: '#fbbf24',
  orange: '#f97316',
  green: '#22c55e',
  blue: '#3b82f6',
  purple: '#a855f7',
  brown: '#92400e',
  black: '#1f2937',
};

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function formatLastAttendance(iso: string | null): string {
  if (!iso) return 'Sem registro';
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return `Hoje, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atras`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function childHasntBeenThisWeek(ultimaAula: string | null): boolean {
  if (!ultimaAula) return true;
  const date = new Date(ultimaAula);
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  return date < monday;
}

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  em_dia: { label: 'Em dia', color: 'var(--bb-success)', bg: 'var(--bb-success-surface)' },
  pendente: { label: 'Pendente', color: 'var(--bb-warning)', bg: 'var(--bb-warning-surface)' },
  atrasado: { label: 'Atrasado', color: 'var(--bb-error)', bg: 'rgba(239, 68, 68, 0.08)' },
};

// ────────────────────────────────────────────────────────────
// Components
// ────────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title }: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon className="h-4 w-4 text-[var(--bb-brand)]" />
      <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--bb-ink-40)]">{title}</h2>
    </div>
  );
}

function ChildCard({ child }: { child: FilhoResumoDTO }) {
  const router = useRouter();
  const beltColor = BELT_COLORS[child.belt] ?? BELT_COLORS.white;
  const isAbsent = childHasntBeenThisWeek(child.ultima_aula);
  const freqPercent = child.presenca_mes.total > 0
    ? Math.round((child.presenca_mes.presentes / child.presenca_mes.total) * 100)
    : 0;

  return (
    <Card className="p-4">
      {/* Absent alert */}
      {isAbsent && (
        <div
          className="mb-3 flex items-center gap-2 rounded-[var(--bb-radius-sm)] p-2.5"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
        >
          <BellIcon className="h-3.5 w-3.5 text-[var(--bb-error)]" />
          <span className="text-xs font-medium text-[var(--bb-error)]">
            {child.display_name} nao foi a academia esta semana
          </span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Avatar name={child.display_name} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-bold text-[var(--bb-ink-100)]">{child.display_name}</h3>
            <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
              style={{
                backgroundColor: child.role === 'aluno_teen' ? 'var(--bb-info-surface)' : 'var(--bb-warning-surface)',
                color: child.role === 'aluno_teen' ? 'var(--bb-info)' : 'var(--bb-warning)',
              }}
            >
              {child.role === 'aluno_teen' ? 'Teen' : 'Kids'}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-3 w-12 rounded-sm shadow-sm" style={{ backgroundColor: beltColor }} />
            <span className="text-xs font-medium text-[var(--bb-ink-60)]">{child.belt_label}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[var(--bb-radius-sm)] bg-[var(--bb-depth-4)] p-2.5">
          <p className="text-[10px] font-semibold uppercase text-[var(--bb-ink-40)]">Ultima Presenca</p>
          <p className="mt-0.5 text-xs font-bold text-[var(--bb-ink-100)]">{formatLastAttendance(child.ultima_aula)}</p>
        </div>
        <div className="rounded-[var(--bb-radius-sm)] bg-[var(--bb-depth-4)] p-2.5">
          <p className="text-[10px] font-semibold uppercase text-[var(--bb-ink-40)]">Frequencia Mensal</p>
          <p className="mt-0.5 text-xs font-bold text-[var(--bb-ink-100)]">
            {child.presenca_mes.presentes}/{child.presenca_mes.total} ({freqPercent}%)
          </p>
        </div>
        <div className="rounded-[var(--bb-radius-sm)] bg-[var(--bb-depth-4)] p-2.5">
          <p className="text-[10px] font-semibold uppercase text-[var(--bb-ink-40)]">Pagamento</p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
              style={{
                backgroundColor: STATUS_LABEL[child.pagamento_status]?.bg ?? 'var(--bb-success-surface)',
                color: STATUS_LABEL[child.pagamento_status]?.color ?? 'var(--bb-success)',
              }}
            >
              {STATUS_LABEL[child.pagamento_status]?.label ?? 'Em dia'}
            </span>
          </div>
        </div>
        <div className="rounded-[var(--bb-radius-sm)] bg-[var(--bb-depth-4)] p-2.5">
          <p className="text-[10px] font-semibold uppercase text-[var(--bb-ink-40)]">Idade</p>
          <p className="mt-0.5 text-xs font-bold text-[var(--bb-ink-100)]">{child.idade} anos</p>
        </div>
      </div>

      {child.proxima_aula && (
        <div className="mt-3 flex items-center gap-2 rounded-[var(--bb-radius-sm)] border border-[var(--bb-glass-border)] bg-[var(--bb-brand-surface)] p-2.5">
          <CalendarIcon className="h-4 w-4 text-[var(--bb-brand)]" />
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase text-[var(--bb-ink-40)]">Proxima Aula</p>
            <p className="text-xs font-bold text-[var(--bb-ink-100)]">{child.proxima_aula}</p>
          </div>
          <ChevronRightIcon className="h-4 w-4 text-[var(--bb-ink-40)]" />
        </div>
      )}

      {/* Journey link */}
      {child.student_id && (
        <button
          onClick={() => router.push(`/parent/jornada/${child.student_id}`)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-[var(--bb-radius-sm)] border border-[var(--bb-glass-border)] p-2 text-xs font-semibold text-[var(--bb-brand)] transition-colors hover:bg-[var(--bb-brand-surface)]"
        >
          <BarChartIcon className="h-3.5 w-3.5" />
          Ver Jornada
        </button>
      )}
    </Card>
  );
}

// ────────────────────────────────────────────────────────────
// Quick Check-in Card
// ────────────────────────────────────────────────────────────

function QuickCheckinCard({
  classes,
  onCheckin,
}: {
  classes: ParentChildClass[];
  onCheckin: (cls: ParentChildClass) => Promise<void>;
}) {
  const router = useRouter();
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  async function handleQuickCheckin(cls: ParentChildClass) {
    const key = `${cls.child_id}-${cls.class_id}`;
    setCheckingIn(key);
    try {
      await onCheckin(cls);
    } finally {
      setCheckingIn(null);
    }
  }

  if (classes.length === 0) return null;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckSquareIcon className="h-4 w-4 text-[var(--bb-brand)]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--bb-ink-40)]">Check-in Rapido</h3>
        </div>
        <button
          onClick={() => router.push('/parent/checkin')}
          className="text-xs font-semibold text-[var(--bb-brand)] transition-colors hover:opacity-80"
        >
          Ver todos
        </button>
      </div>
      <div className="space-y-2">
        {classes.map((cls) => {
          const key = `${cls.child_id}-${cls.class_id}`;
          const isLoading = checkingIn === key;
          return (
            <div
              key={key}
              className="flex items-center justify-between rounded-[var(--bb-radius-sm)] border border-[var(--bb-glass-border)] p-3"
              style={{ background: cls.checked_in ? 'var(--bb-success-surface)' : 'var(--bb-depth-4)' }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[var(--bb-ink-100)]">{cls.child_name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <ClockIcon className="h-3 w-3 text-[var(--bb-ink-40)]" />
                  <span className="text-xs text-[var(--bb-ink-60)]">{cls.time} — {cls.class_name}</span>
                </div>
              </div>
              {cls.checked_in ? (
                <span className="rounded-full px-3 py-1.5 text-xs font-bold" style={{ backgroundColor: 'var(--bb-success-surface)', color: 'var(--bb-success)' }}>
                  Presente
                </span>
              ) : (
                <button
                  onClick={() => handleQuickCheckin(cls)}
                  disabled={isLoading}
                  className="rounded-[var(--bb-radius-sm)] px-3 py-1.5 text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: 'var(--bb-brand-gradient)' }}
                >
                  {isLoading ? 'Enviando...' : 'Check-in'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────
// Notifications Section
// ────────────────────────────────────────────────────────────

function NotificationsSection({ notificacoes }: { notificacoes: NotificacaoParentDTO[] }) {
  const router = useRouter();

  if (notificacoes.length === 0) {
    return (
      <Card className="p-6 text-center">
        <BellIcon className="mx-auto h-8 w-8 text-[var(--bb-ink-40)]" />
        <p className="mt-2 text-sm font-medium text-[var(--bb-ink-60)]">
          Nenhuma notificacao recente
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {notificacoes.slice(0, 5).map((n) => (
        <Card
          key={n.id}
          interactive
          className={`p-4 ${!n.read ? 'border-[var(--bb-brand)]/30 bg-[var(--bb-brand-surface)]' : ''}`}
          onClick={() => router.push('/parent/notificacoes')}
        >
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: !n.read ? 'var(--bb-brand-surface-hover)' : 'var(--bb-depth-4)',
                color: !n.read ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
              }}
            >
              <BellIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--bb-ink-100)]">{n.message}</p>
              <p className="mt-1 text-[10px] text-[var(--bb-ink-40)]">{n.time}</p>
            </div>
            {!n.read && (
              <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--bb-brand)]" />
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Skeleton
// ────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="p-4 lg:p-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton variant="text" className="h-7 w-48" />
          <Skeleton variant="text" className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton variant="card" className="h-56" />
          <Skeleton variant="card" className="h-56" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton variant="card" className="h-36" />
          <Skeleton variant="card" className="h-36" />
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          <Skeleton variant="card" className="h-20" />
          <Skeleton variant="card" className="h-20" />
          <Skeleton variant="card" className="h-20" />
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Guardian Management Section
// ────────────────────────────────────────────────────────────

const RELATIONSHIP_LABELS: Record<string, string> = {
  parent: 'Pai/Mae',
  legal_guardian: 'Responsavel Legal',
  other: 'Outro',
};

function GuardianManagementSection({ guardianId }: { guardianId: string }) {
  const { toast } = useToast();
  const [links, setLinks] = useState<GuardianLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadLinks = useCallback(async () => {
    try {
      const data = await getGuardianLinks(guardianId);
      setLinks(data);
    } catch {
      // handled by service
    } finally {
      setLoadingLinks(false);
    }
  }, [guardianId]);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  async function handleToggle(
    link: GuardianLink,
    field: 'can_precheckin' | 'can_view_grades' | 'can_manage_payments',
    value: boolean,
  ) {
    setUpdatingId(link.id);
    try {
      const updated = await updateGuardianPermissions(link.id, { [field]: value });
      setLinks((prev) =>
        prev.map((l) => (l.id === link.id ? { ...l, ...updated } : l)),
      );
      toast('Permissao atualizada', 'success');
    } catch (error) {
      toast(translateError(error), 'error');
    } finally {
      setUpdatingId(null);
    }
  }

  if (loadingLinks) {
    return (
      <div className="space-y-3">
        <Skeleton variant="card" className="h-24" />
        <Skeleton variant="card" className="h-24" />
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <Card className="p-6 text-center">
        <UsersIcon className="mx-auto h-8 w-8 text-[var(--bb-ink-40)]" />
        <p className="mt-2 text-sm font-medium text-[var(--bb-ink-60)]">
          Nenhum filho vinculado
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {links.map((link) => {
        const childName = link.child_name ?? 'Filho';
        const isUpdating = updatingId === link.id;
        return (
          <Card key={link.id} className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={childName} size="md" />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-[var(--bb-ink-100)]">
                  {childName}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
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
                  <span className="text-[10px] text-[var(--bb-ink-40)]">
                    {RELATIONSHIP_LABELS[link.relationship] ?? link.relationship}
                  </span>
                </div>
              </div>
              <ShieldIcon className="h-4 w-4 text-[var(--bb-ink-40)]" />
            </div>

            <div
              className="space-y-2 rounded-[var(--bb-radius-sm)] p-3"
              style={{ backgroundColor: 'var(--bb-depth-4)' }}
            >
              <Toggle
                size="sm"
                checked={link.can_precheckin}
                onChange={(v) => handleToggle(link, 'can_precheckin', v)}
                disabled={isUpdating}
                label="Pre-check-in"
                description="Confirmar presenca antecipada"
              />
              <Toggle
                size="sm"
                checked={link.can_view_grades}
                onChange={(v) => handleToggle(link, 'can_view_grades', v)}
                disabled={isUpdating}
                label="Ver notas"
                description="Visualizar avaliacoes e notas"
              />
              <Toggle
                size="sm"
                checked={link.can_manage_payments}
                onChange={(v) => handleToggle(link, 'can_manage_payments', v)}
                disabled={isUpdating}
                label="Gerenciar pagamentos"
                description="Pagar mensalidades e ver faturas"
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────

export default function ParentDashboardPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filhos, setFilhos] = useState<FilhoResumoDTO[]>([]);
  const [notificacoes, setNotificacoes] = useState<NotificacaoParentDTO[]>([]);
  const [todayClasses, setTodayClasses] = useState<ParentChildClass[]>([]);
  const [guardianId, setGuardianId] = useState<string | null>(profile?.id ?? null);
  const [guardianResolved, setGuardianResolved] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function resolveGuardian() {
      if (profile?.id) {
        if (mounted) {
          setGuardianId(profile.id);
          setGuardianResolved(true);
        }
        return;
      }

      try {
        for (let attempt = 0; attempt < GUARDIAN_RESOLUTION_ATTEMPTS; attempt += 1) {
          const response = await fetch('/api/parent/current-guardian', {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
          });
          const payload = await response.json();

          if (response.ok && payload.profileId) {
            if (mounted) {
              setGuardianId(payload.profileId as string);
              setGuardianResolved(true);
            }
            return;
          }

          if (attempt < GUARDIAN_RESOLUTION_ATTEMPTS - 1) {
            await new Promise((resolve) => window.setTimeout(resolve, GUARDIAN_RESOLUTION_DELAY_MS));
          }
        }
      } finally {
        if (mounted) {
          setGuardianResolved(true);
        }
      }
    }

    void resolveGuardian();
    return () => {
      mounted = false;
    };
  }, [profile?.id]);

  const loadData = useCallback(async () => {
    if (!guardianId) return;
    setLoadError(null);
    try {
      const [dashboard, classes] = await Promise.all([
        getParentDashboard(guardianId),
        getTodayClasses(guardianId),
      ]);
      setFilhos(dashboard.filhos);
      setNotificacoes(dashboard.notificacoes);
      setTodayClasses(classes);
    } catch (error) {
      setLoadError(translateError(error));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guardianId]);

  useEffect(() => {
    if (!guardianResolved) {
      return;
    }

    if (!guardianId) {
      setLoading(false);
      return;
    }

    void loadData();
  }, [guardianId, guardianResolved, loadData]);

  async function handleQuickCheckin(cls: ParentChildClass) {
    if (!guardianId) {
      toast('Nao foi possivel resolver o responsavel autenticado.', 'error');
      return;
    }

    try {
      await doParentCheckin(cls.student_id, cls.class_id, AttendanceMethod.Manual);
      toast(`Check-in de ${cls.child_name} realizado!`, 'success');
      // Refresh today's classes
      const updated = await getTodayClasses(guardianId);
      setTodayClasses(updated);
    } catch (error) {
      toast(translateError(error), 'error');
    }
  }

  if (loading || !guardianResolved) return <DashboardSkeleton />;
  if (!guardianId) {
    return (
      <div className="p-4 lg:p-6">
        <Card className="p-2">
          <EmptyState
            variant="error"
            title="Nao foi possivel identificar o responsavel"
            description="Atualize a pagina ou troque de perfil para restaurar o contexto da familia."
            actionLabel="Atualizar"
            onAction={() => window.location.reload()}
          />
        </Card>
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="p-4 lg:p-6">
        <Card className="p-2">
          <EmptyState
            variant="error"
            title="Nao foi possivel carregar a rotina da familia"
            description={loadError}
            actionLabel="Tentar novamente"
            onAction={() => {
              setLoading(true);
              void loadData();
            }}
          />
        </Card>
      </div>
    );
  }

  const firstName = profile?.display_name?.split(' ')[0] ?? 'Responsavel';

  return (
    <div className="p-4 lg:p-6" data-stagger>

      {/* Greeting */}
      <section className="animate-reveal">
        <h1 className="text-2xl font-extrabold text-[var(--bb-ink-100)]">Ola, {firstName}!</h1>
        <p className="mt-1 text-sm text-[var(--bb-ink-60)]">Acompanhe a evolucao dos seus filhos</p>
      </section>

      {/* Quick Check-in + Children Cards */}
      <section className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Quick Check-in - left column on desktop */}
        <div className="xl:col-span-1 animate-reveal">
          <QuickCheckinCard classes={todayClasses} onCheckin={handleQuickCheckin} />
          {todayClasses.length === 0 && (
            <Card className="p-6 text-center">
              <CheckSquareIcon className="mx-auto h-8 w-8 text-[var(--bb-ink-40)]" />
              <p className="mt-2 text-sm font-medium text-[var(--bb-ink-60)]">
                Nenhuma aula agendada para hoje
              </p>
            </Card>
          )}
        </div>

        {/* Children cards */}
        <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filhos.length === 0 ? (
            <Card className="col-span-full p-8 text-center">
              <UsersIcon className="mx-auto h-10 w-10 text-[var(--bb-ink-40)]" />
              <h3 className="mt-3 text-sm font-bold text-[var(--bb-ink-60)]">Nenhum filho vinculado</h3>
              <p className="mt-1 text-xs text-[var(--bb-ink-40)]">
                Solicite a vinculacao de seus filhos na recepcao da academia.
              </p>
            </Card>
          ) : (
            filhos.map((child) => (
              <div key={child.student_id} className="animate-reveal">
                <ChildCard child={child} />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Notifications + Quick Actions */}
      <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Notifications */}
        <div className="animate-reveal">
          <SectionHeader icon={BellIcon} title="Notificacoes" />
          <NotificationsSection notificacoes={notificacoes} />
        </div>

        {/* Quick Actions */}
        <div className="animate-reveal">
          <SectionHeader icon={CheckSquareIcon} title="Acoes Rapidas" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: CheckSquareIcon, label: 'Check-in', color: 'var(--bb-brand)', bg: 'var(--bb-brand-surface)', href: '/parent/checkin' },
              { icon: CheckSquareIcon, label: 'Pre-check-in', color: 'var(--bb-success)', bg: 'var(--bb-success-surface)', href: '/parent/precheckin' },
              { icon: CalendarIcon, label: 'Ver Presenca', color: 'var(--bb-success)', bg: 'var(--bb-success-surface)', href: '/parent/presencas' },
              { icon: DollarIcon, label: 'Pagamentos', color: 'var(--bb-brand)', bg: 'var(--bb-brand-surface)', href: '/parent/pagamentos' },
              { icon: MessageIcon, label: 'Falar com Professor', color: 'var(--bb-info)', bg: 'var(--bb-info-surface)', href: '/parent/mensagens' },
              { icon: BarChartIcon, label: 'Relatorios', color: 'var(--bb-warning)', bg: 'var(--bb-warning-surface)', href: '/parent/relatorios' },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => router.push(action.href)}
                className="flex flex-col items-center gap-2 rounded-[var(--bb-radius-lg)] border border-[var(--bb-glass-border)] p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--bb-glass-border-hover)] hover:shadow-[var(--bb-shadow-sm)]"
                style={{ backgroundColor: action.bg }}
              >
                <action.icon className="h-6 w-6" style={{ color: action.color }} />
                <span className="text-center text-[11px] font-bold leading-tight text-[var(--bb-ink-80)]">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Guardian Management */}
      {guardianId && (
        <section className="mt-6 animate-reveal">
          <SectionHeader icon={UsersIcon} title="Filhos Vinculados" />
          <GuardianManagementSection guardianId={guardianId} />
        </section>
      )}
    </div>
  );
}

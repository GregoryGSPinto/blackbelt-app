'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { Toggle } from '@/components/ui/Toggle';
import { getGuardianLinks, updateGuardianPermissions } from '@/lib/api/guardian-links.service';
import type { GuardianLink } from '@/lib/types/guardian';
import {
  CalendarIcon,
  DollarIcon,
  MessageIcon,
  BellIcon,
  BarChartIcon,
  CheckSquareIcon,
  VideoIcon,
  ChevronRightIcon,
  ClockIcon,
  UsersIcon,
  ShieldIcon,
} from '@/components/shell/icons';

// ────────────────────────────────────────────────────────────
// Mock Data
// ────────────────────────────────────────────────────────────

interface ChildMock {
  id: string;
  name: string;
  age: number;
  type: 'teen' | 'kids';
  belt: string;
  beltColor: string;
  className: string;
  lastAttendance: string;
  monthlyAttendance: number[];
  videosWatched: number;
  nextClass: string;
  nextClassTime: string;
}

interface MensalidadeMock {
  id: string;
  childName: string;
  plan: string;
  amount: number;
  dueDate: string;
  status: 'em_dia' | 'pendente' | 'atrasado';
}

interface HistoryItemMock {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: 'pago' | 'pendente';
}

interface ComunicadoMock {
  id: string;
  title: string;
  preview: string;
  date: string;
  urgent: boolean;
}

interface AttendanceChartMock {
  month: string;
  sophia: number;
  helena: number;
}

interface TodayClassMock {
  id: string;
  childName: string;
  className: string;
  time: string;
  checkedIn: boolean;
}

const MOCK_CHILDREN: ChildMock[] = [
  {
    id: 'sophia',
    name: 'Sophia',
    age: 15,
    type: 'teen',
    belt: 'Faixa Verde',
    beltColor: 'var(--bb-belt-green)',
    className: 'BJJ Teen Avançado',
    lastAttendance: 'Hoje, 16:30',
    monthlyAttendance: [8, 10, 9, 7],
    videosWatched: 12,
    nextClass: 'Terça, 16:00',
    nextClassTime: 'BJJ Teen Avançado',
  },
  {
    id: 'helena',
    name: 'Helena',
    age: 8,
    type: 'kids',
    belt: 'Faixa Cinza',
    beltColor: 'var(--bb-belt-gray)',
    className: 'BJJ Kids',
    lastAttendance: 'Quinta, 15:00',
    monthlyAttendance: [6, 7, 8, 5],
    videosWatched: 5,
    nextClass: 'Terça, 15:00',
    nextClassTime: 'BJJ Kids',
  },
];

const MOCK_MENSALIDADES: MensalidadeMock[] = [
  { id: 'mens-1', childName: 'Sophia', plan: 'Teen Avançado', amount: 149, dueDate: '20/03/2026', status: 'em_dia' },
  { id: 'mens-2', childName: 'Helena', plan: 'Kids', amount: 99, dueDate: '20/03/2026', status: 'pendente' },
];

const MOCK_HISTORY: HistoryItemMock[] = [
  { id: 'h-1', description: 'Sophia — Teen Avançado (Fev)', amount: 149, date: '20/02/2026', status: 'pago' },
  { id: 'h-2', description: 'Helena — Kids (Fev)', amount: 99, date: '20/02/2026', status: 'pago' },
  { id: 'h-3', description: 'Sophia — Teen Avançado (Jan)', amount: 149, date: '20/01/2026', status: 'pago' },
];

const MOCK_COMUNICADOS: ComunicadoMock[] = [
  { id: 'com-1', title: 'Campeonato Regional — Inscrições Abertas', preview: 'Inscreva seu filho no campeonato regional de Jiu-Jitsu. Vagas limitadas para as categorias Kids e Teen.', date: '15/03/2026', urgent: true },
  { id: 'com-2', title: 'Horário Especial — Semana Santa', preview: 'A academia funcionará em horário reduzido durante a Semana Santa. Confira os horários atualizados.', date: '12/03/2026', urgent: false },
  { id: 'com-3', title: 'Novo Professor de Judô', preview: 'Bem-vindo ao Prof. Rafael, que ministrará as aulas de Judô às quartas e sextas.', date: '08/03/2026', urgent: false },
];

const MOCK_ATTENDANCE_CHART: AttendanceChartMock[] = [
  { month: 'Jan', sophia: 18, helena: 14 },
  { month: 'Fev', sophia: 20, helena: 16 },
  { month: 'Mar', sophia: 15, helena: 12 },
];

const MOCK_TODAY_CLASSES: TodayClassMock[] = [
  { id: 'tc-1', childName: 'Sophia', className: 'BJJ Teen Avançado', time: '16:00', checkedIn: false },
  { id: 'tc-2', childName: 'Helena', className: 'BJJ Kids', time: '15:00', checkedIn: false },
];

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  em_dia: { label: 'Em dia', color: 'var(--bb-success)', bg: 'var(--bb-success-surface)' },
  pendente: { label: 'Pendente', color: 'var(--bb-warning)', bg: 'var(--bb-warning-surface)' },
  atrasado: { label: 'Atrasado', color: 'var(--bb-error)', bg: 'rgba(239, 68, 68, 0.08)' },
  pago: { label: 'Pago', color: 'var(--bb-success)', bg: 'var(--bb-success-surface)' },
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

function MiniBarChart({ values, max }: { values: number[]; max: number }) {
  return (
    <div className="flex items-end gap-1">
      {values.map((v, i) => (
        <div
          key={i}
          className="w-3 rounded-sm transition-all duration-300"
          style={{
            height: `${Math.max((v / max) * 28, 4)}px`,
            backgroundColor: v >= max * 0.7 ? 'var(--bb-success)' : 'var(--bb-warning)',
          }}
        />
      ))}
    </div>
  );
}

function AttendanceBarChart({ data }: { data: AttendanceChartMock[] }) {
  const maxVal = Math.max(...data.flatMap((d) => [d.sophia, d.helena]));
  const barW = 20;
  const gap = 6;
  const groupW = barW * 2 + gap;
  const chartH = 100;
  const chartW = data.length * groupW + (data.length - 1) * 24 + 40;

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH + 30}`} className="w-full" aria-label="Gráfico de presença dos filhos nos últimos 3 meses">
      {data.map((d, i) => {
        const x = 20 + i * (groupW + 24);
        const hSophia = maxVal > 0 ? (d.sophia / maxVal) * chartH : 0;
        const hHelena = maxVal > 0 ? (d.helena / maxVal) * chartH : 0;
        return (
          <g key={d.month}>
            <rect x={x} y={chartH - hSophia} width={barW} height={hSophia} rx={4} fill="var(--bb-brand)" opacity={0.85}>
              <animate attributeName="height" from="0" to={hSophia} dur="0.6s" fill="freeze" />
              <animate attributeName="y" from={chartH} to={chartH - hSophia} dur="0.6s" fill="freeze" />
            </rect>
            <text x={x + barW / 2} y={chartH - hSophia - 4} textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--bb-ink-60)">{d.sophia}</text>
            <rect x={x + barW + gap} y={chartH - hHelena} width={barW} height={hHelena} rx={4} fill="var(--bb-info)" opacity={0.7}>
              <animate attributeName="height" from="0" to={hHelena} dur="0.6s" fill="freeze" />
              <animate attributeName="y" from={chartH} to={chartH - hHelena} dur="0.6s" fill="freeze" />
            </rect>
            <text x={x + barW + gap + barW / 2} y={chartH - hHelena - 4} textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--bb-ink-60)">{d.helena}</text>
            <text x={x + groupW / 2} y={chartH + 16} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--bb-ink-40)">{d.month}</text>
          </g>
        );
      })}
    </svg>
  );
}

function ChildCard({ child }: { child: ChildMock }) {
  const weekLabels = ['S1', 'S2', 'S3', 'S4'];
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Avatar name={child.name} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-bold text-[var(--bb-ink-100)]">{child.name}</h3>
            <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
              style={{
                backgroundColor: child.type === 'teen' ? 'var(--bb-info-surface)' : 'var(--bb-warning-surface)',
                color: child.type === 'teen' ? 'var(--bb-info)' : 'var(--bb-warning)',
              }}
            >
              {child.type}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-3 w-12 rounded-sm shadow-sm" style={{ backgroundColor: child.beltColor }} />
            <span className="text-xs font-medium text-[var(--bb-ink-60)]">{child.belt}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[var(--bb-radius-sm)] bg-[var(--bb-depth-4)] p-2.5">
          <p className="text-[10px] font-semibold uppercase text-[var(--bb-ink-40)]">Turma</p>
          <p className="mt-0.5 text-xs font-bold text-[var(--bb-ink-100)]">{child.className}</p>
        </div>
        <div className="rounded-[var(--bb-radius-sm)] bg-[var(--bb-depth-4)] p-2.5">
          <p className="text-[10px] font-semibold uppercase text-[var(--bb-ink-40)]">Última Presença</p>
          <p className="mt-0.5 text-xs font-bold text-[var(--bb-ink-100)]">{child.lastAttendance}</p>
        </div>
        <div className="rounded-[var(--bb-radius-sm)] bg-[var(--bb-depth-4)] p-2.5">
          <p className="text-[10px] font-semibold uppercase text-[var(--bb-ink-40)]">Frequência Mensal</p>
          <div className="mt-1.5 flex items-end gap-1">
            <MiniBarChart values={child.monthlyAttendance} max={12} />
            <div className="ml-1 flex gap-1">
              {weekLabels.map((lbl) => (
                <span key={lbl} className="text-[8px] text-[var(--bb-ink-40)]">{lbl}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-[var(--bb-radius-sm)] bg-[var(--bb-depth-4)] p-2.5">
          <p className="text-[10px] font-semibold uppercase text-[var(--bb-ink-40)]">Vídeos Assistidos</p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <VideoIcon className="h-3.5 w-3.5 text-[var(--bb-brand)]" />
            <span className="text-lg font-extrabold text-[var(--bb-ink-100)]">{child.videosWatched}</span>
            <span className="text-[10px] text-[var(--bb-ink-40)]">este mês</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-[var(--bb-radius-sm)] border border-[var(--bb-glass-border)] bg-[var(--bb-brand-surface)] p-2.5">
        <CalendarIcon className="h-4 w-4 text-[var(--bb-brand)]" />
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase text-[var(--bb-ink-40)]">Próxima Aula</p>
          <p className="text-xs font-bold text-[var(--bb-ink-100)]">{child.nextClass} — {child.nextClassTime}</p>
        </div>
        <ChevronRightIcon className="h-4 w-4 text-[var(--bb-ink-40)]" />
      </div>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────
// Quick Check-in Card
// ────────────────────────────────────────────────────────────

function QuickCheckinCard({ classes }: { classes: TodayClassMock[] }) {
  const router = useRouter();
  const [checkedIn, setCheckedIn] = useState<Record<string, boolean>>({});

  function handleQuickCheckin(classId: string) {
    setCheckedIn((prev) => ({ ...prev, [classId]: true }));
  }

  if (classes.length === 0) return null;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckSquareIcon className="h-4 w-4 text-[var(--bb-brand)]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--bb-ink-40)]">Check-in Rápido</h3>
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
          const done = checkedIn[cls.id] || cls.checkedIn;
          return (
            <div
              key={cls.id}
              className="flex items-center justify-between rounded-[var(--bb-radius-sm)] border border-[var(--bb-glass-border)] p-3"
              style={{ background: done ? 'var(--bb-success-surface)' : 'var(--bb-depth-4)' }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[var(--bb-ink-100)]">{cls.childName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <ClockIcon className="h-3 w-3 text-[var(--bb-ink-40)]" />
                  <span className="text-xs text-[var(--bb-ink-60)]">{cls.time} — {cls.className}</span>
                </div>
              </div>
              {done ? (
                <span className="rounded-full px-3 py-1.5 text-xs font-bold" style={{ backgroundColor: 'var(--bb-success-surface)', color: 'var(--bb-success)' }}>
                  Presente
                </span>
              ) : (
                <button
                  onClick={() => handleQuickCheckin(cls.id)}
                  className="rounded-[var(--bb-radius-sm)] px-3 py-1.5 text-xs font-bold text-white transition-all hover:opacity-90"
                  style={{ background: 'var(--bb-brand-gradient)' }}
                >
                  Check-in
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
    } catch {
      toast('Erro ao atualizar permissao', 'error');
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
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showAllHistory, setShowAllHistory] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <DashboardSkeleton />;

  const firstName = profile?.display_name?.split(' ')[0] ?? 'Patrícia';
  const visibleHistory = showAllHistory ? MOCK_HISTORY : MOCK_HISTORY.slice(0, 2);

  return (
    <div className="p-4 lg:p-6" data-stagger>

      {/* ─── Greeting ─── */}
      <section className="animate-reveal">
        <h1 className="text-2xl font-extrabold text-[var(--bb-ink-100)]">Olá, {firstName}!</h1>
        <p className="mt-1 text-sm text-[var(--bb-ink-60)]">Acompanhe a evolução dos seus filhos</p>
      </section>

      {/* ─── Quick Check-in + Children Cards ─── */}
      <section className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Quick Check-in - left column on desktop */}
        <div className="xl:col-span-1 animate-reveal">
          <QuickCheckinCard classes={MOCK_TODAY_CLASSES} />
        </div>

        {/* Children cards - right columns on desktop */}
        <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {MOCK_CHILDREN.map((child) => (
            <div key={child.id} className="animate-reveal">
              <ChildCard child={child} />
            </div>
          ))}
        </div>
      </section>

      {/* ─── Financial + Comunicados side by side on desktop ─── */}
      <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Financial */}
        <div className="animate-reveal">
          <SectionHeader icon={DollarIcon} title="Financeiro" />
          <Card className="p-4">
            <p className="mb-3 text-xs font-semibold text-[var(--bb-ink-60)]">Mensalidades pendentes</p>
            <div className="space-y-3">
              {MOCK_MENSALIDADES.map((m) => {
                const st = STATUS_LABEL[m.status] ?? STATUS_LABEL.em_dia;
                return (
                  <div key={m.id} className="flex items-center justify-between rounded-[var(--bb-radius-sm)] border border-[var(--bb-glass-border)] p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[var(--bb-ink-100)]">{m.childName} — {m.plan}</p>
                      <p className="mt-0.5 text-xs text-[var(--bb-ink-40)]">Vence: {m.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: st.bg, color: st.color }}>{st.label}</span>
                      <span className="text-sm font-extrabold text-[var(--bb-ink-100)]">R${m.amount}</span>
                      {m.status === 'pendente' && (
                        <button className="ml-1 rounded-[var(--bb-radius-sm)] px-3 py-1.5 text-xs font-bold text-white transition-all hover:opacity-90" style={{ background: 'var(--bb-brand-gradient)' }}>Pagar</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 border-t border-[var(--bb-glass-border)] pt-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[var(--bb-ink-40)]">Histórico</p>
                <button onClick={() => setShowAllHistory(!showAllHistory)} className="text-xs font-semibold text-[var(--bb-brand)] transition-colors hover:opacity-80">
                  {showAllHistory ? 'Ver menos' : 'Ver tudo'}
                </button>
              </div>
              <div className="mt-2 space-y-2">
                {visibleHistory.map((h) => {
                  const st = STATUS_LABEL[h.status] ?? STATUS_LABEL.pago;
                  return (
                    <div key={h.id} className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-xs font-medium text-[var(--bb-ink-80)]">{h.description}</p>
                        <p className="text-[10px] text-[var(--bb-ink-40)]">{h.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--bb-ink-100)]">R${h.amount}</span>
                        <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold" style={{ backgroundColor: st.bg, color: st.color }}>{st.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Comunicados */}
        <div className="animate-reveal">
          <SectionHeader icon={BellIcon} title="Comunicados" />
          <div className="space-y-3">
            {MOCK_COMUNICADOS.map((c) => (
              <Card key={c.id} interactive className={`p-4 ${c.urgent ? 'border-[var(--bb-brand)]/30 bg-[var(--bb-brand-surface)]' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: c.urgent ? 'var(--bb-brand-surface-hover)' : 'var(--bb-depth-4)',
                      color: c.urgent ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                    }}
                  >
                    <BellIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-[var(--bb-ink-100)]">{c.title}</p>
                      {c.urgent && (
                        <span className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--bb-brand)' }}>Urgente</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-[var(--bb-ink-60)] line-clamp-2">{c.preview}</p>
                    <p className="mt-1.5 text-[10px] text-[var(--bb-ink-40)]">{c.date}</p>
                  </div>
                  <ChevronRightIcon className="mt-1 h-4 w-4 shrink-0 text-[var(--bb-ink-40)]" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Evolution Chart + Quick Actions side by side on desktop ─── */}
      <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Evolution Chart */}
        <div className="animate-reveal">
          <SectionHeader icon={BarChartIcon} title="Evolução — Presença" />
          <Card className="p-4">
            <p className="mb-2 text-xs text-[var(--bb-ink-60)]">Presenças por mês nos últimos 3 meses</p>
            <AttendanceBarChart data={MOCK_ATTENDANCE_CHART} />
            <div className="mt-3 flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: 'var(--bb-brand)', opacity: 0.85 }} />
                <span className="text-[10px] font-semibold text-[var(--bb-ink-60)]">Sophia</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: 'var(--bb-info)', opacity: 0.7 }} />
                <span className="text-[10px] font-semibold text-[var(--bb-ink-60)]">Helena</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="animate-reveal">
          <SectionHeader icon={CheckSquareIcon} title="Acoes Rapidas" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: CheckSquareIcon, label: 'Check-in', color: 'var(--bb-brand)', bg: 'var(--bb-brand-surface)', href: '/parent/checkin' },
              { icon: CheckSquareIcon, label: 'Pre-check-in', color: 'var(--bb-success)', bg: 'var(--bb-success-surface)', href: '/parent/precheckin' },
              { icon: CalendarIcon, label: 'Ver Presenca', color: 'var(--bb-success)', bg: 'var(--bb-success-surface)', href: '/parent/presencas' },
              { icon: DollarIcon, label: 'Pagar Mensalidade', color: 'var(--bb-brand)', bg: 'var(--bb-brand-surface)', href: '/parent/pagamentos' },
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

      {/* ─── Guardian Management ─── */}
      <section className="mt-6 animate-reveal">
        <SectionHeader icon={UsersIcon} title="Filhos Vinculados" />
        <GuardianManagementSection guardianId={profile?.id ?? 'prof-guardian-1'} />
      </section>
    </div>
  );
}

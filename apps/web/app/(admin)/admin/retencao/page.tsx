'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  getRetentionData,
  markStudentContacted,
  type RetentionData,
  type RetentionFilters,
  type AtRiskStudent,
} from '@/lib/api/retention.service';
import { getAlunosEmRisco, getChurnMetrics, getChurnTrend, marcarAcaoTomada, type AlunoRisco, type ChurnMetrics, type ChurnTrendPoint } from '@/lib/api/churn-prediction.service';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { PlanGate } from '@/components/plans/PlanGate';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

// ── Dynamic Recharts (no SSR) ──────────────────────────────────────
const LineChart = dynamic(() => import('recharts').then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then((m) => m.Line), { ssr: false });
const RXAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const RYAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const RTooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const RResponsiveContainer = dynamic(
  () => import('recharts').then((m) => m.ResponsiveContainer),
  { ssr: false },
);

// ── Constants ──────────────────────────────────────────────────────────

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
};

const TREND_ICONS: Record<string, string> = {
  declining: '↓',
  stable: '→',
  improving: '↑',
};

const TREND_LABELS: Record<string, string> = {
  declining: 'Em queda',
  stable: 'Estavel',
  improving: 'Melhorando',
};

const BELT_LABELS: Record<string, string> = {
  white: 'Branca',
  gray: 'Cinza',
  yellow: 'Amarela',
  orange: 'Laranja',
  green: 'Verde',
  blue: 'Azul',
  purple: 'Roxa',
  brown: 'Marrom',
  black: 'Preta',
};

// ── Helpers ────────────────────────────────────────────────────────────

function formatMonth(monthStr: string): string {
  const parts = monthStr.split('-');
  return MONTH_LABELS[parts[1]] ?? parts[1];
}

// ── Page ───────────────────────────────────────────────────────────────

export default function RetencaoPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RetentionData | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<AtRiskStudent | null>(null);
  const [period, setPeriod] = useState<RetentionFilters['period']>('12m');
  const [modalityFilter, setModalityFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [churnTab, setChurnTab] = useState<'risco' | 'recuperados' | 'cancelados' | 'tendencia'>('risco');
  const [alunosRisco, setAlunosRisco] = useState<AlunoRisco[]>([]);
  const [churnMetrics, setChurnMetrics] = useState<ChurnMetrics | null>(null);
  const [churnTrend, setChurnTrend] = useState<ChurnTrendPoint[]>([]);

  // ── Fetch data ─────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getRetentionData(getActiveAcademyId(), {
        period,
        modality: modalityFilter || undefined,
        className: classFilter || undefined,
      });
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [period, modalityFilter, classFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Fetch churn data ─────────────────────────────────────────────
  useEffect(() => {
    getAlunosEmRisco(getActiveAcademyId()).then(setAlunosRisco).catch(() => {});
    getChurnMetrics(getActiveAcademyId()).then(setChurnMetrics).catch(() => {});
    getChurnTrend(getActiveAcademyId()).then(setChurnTrend).catch(() => {});
  }, []);

  // ── Churn actions ─────────────────────────────────────────────────
  async function handleMarcarAcao(studentId: string, acao: string) {
    await marcarAcaoTomada(studentId, acao);
    setAlunosRisco((prev) =>
      prev.map((a) => (a.id === studentId ? { ...a, statusAcao: 'acao_tomada' as const } : a)),
    );
  }

  // ── Derived values ─────────────────────────────────────────────────

  const modalities = useMemo(() => {
    if (!data) return [];
    const set = new Set(data.atRiskStudents.map((s) => s.modality));
    return Array.from(set).sort();
  }, [data]);

  const classNames = useMemo(() => {
    if (!data) return [];
    const set = new Set(data.atRiskStudents.map((s) => s.className));
    return Array.from(set).sort();
  }, [data]);

  // ── Actions ────────────────────────────────────────────────────────

  async function handleMarkContacted(student: AtRiskStudent) {
    await markStudentContacted(student.id);
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        atRiskStudents: prev.atRiskStudents.map((s) =>
          s.id === student.id ? { ...s, contacted: true } : s,
        ),
      };
    });
    setSelectedStudent(null);
  }

  // ── Skeleton ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton variant="card" className="h-64" />
          <Skeleton variant="card" className="col-span-2 h-64" />
        </div>
        <Skeleton variant="card" className="h-64" />
        <Skeleton variant="card" className="h-96" />
      </div>
    );
  }

  if (!data) return null;

  const { summary, monthlyData, churnReasons, atRiskStudents } = data;

  return (
    <PlanGate module="churn_prediction">
      <div className="space-y-6 p-6">
        {/* Title */}
        <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          Retencao de Alunos
        </h1>

        {/* Filters */}
        <Card className="flex flex-wrap items-center gap-3 p-4">
          <div
            className="flex overflow-hidden"
            style={{
              borderRadius: 'var(--bb-radius-sm)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            {(['3m', '6m', '12m'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="px-3 py-1.5 text-sm font-medium transition-colors"
                style={{
                  background: period === p ? 'var(--bb-brand)' : 'transparent',
                  color: period === p ? '#fff' : 'var(--bb-ink-60)',
                }}
              >
                {p === '3m' ? '3 meses' : p === '6m' ? '6 meses' : '12 meses'}
              </button>
            ))}
          </div>

          <select
            value={modalityFilter}
            onChange={(e) => setModalityFilter(e.target.value)}
            className="px-3 py-1.5 text-sm"
            style={{
              borderRadius: 'var(--bb-radius-sm)',
              background: 'var(--bb-depth-4)',
              color: 'var(--bb-ink-80)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            <option value="">Todas Modalidades</option>
            {modalities.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-1.5 text-sm"
            style={{
              borderRadius: 'var(--bb-radius-sm)',
              background: 'var(--bb-depth-4)',
              color: 'var(--bb-ink-80)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            <option value="">Todas Turmas</option>
            {classNames.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Card>

        {/* Donut + Metric Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5" data-stagger>
          {/* Large Donut */}
          <Card className="animate-reveal flex flex-col items-center justify-center p-6 lg:col-span-2">
            <RetentionDonut
              retention={summary.currentRetention}
              goal={summary.retentionGoal}
            />
            <p className="mt-3 text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Retencao Atual
            </p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
              Meta: {summary.retentionGoal}%
            </p>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 lg:col-span-3" data-stagger>
            <StatCard
              label="Taxa de Churn"
              value={`${summary.churnRate}%`}
              detail="no periodo"
              variant="danger"
            />
            <StatCard
              label="Alunos Ativos"
              value={summary.totalActive.toString()}
              detail={`${summary.totalChurned} cancelamentos`}
              variant="default"
            />
            <StatCard
              label="Frequencia Media"
              value={`${summary.avgFrequency} treinos`}
              detail="por aluno ativo / mes"
              variant={summary.avgFrequency >= 8 ? 'default' : 'warning'}
            />
            <StatCard
              label="Turma com Mais Churn"
              value={summary.classWithMostChurn}
              detail="no periodo"
              variant="danger"
            />
          </div>
        </div>

        {/* Retention Chart (12 months) */}
        <Card className="animate-reveal p-6">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
            Retencao Mensal
          </h2>
          <RetentionLineChart data={monthlyData} />
        </Card>

        {/* Churn Reasons */}
        <Card className="animate-reveal p-6">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
            Motivos de Cancelamento
          </h2>
          <div className="space-y-3">
            {churnReasons.map((reason) => (
              <div key={reason.reason} className="flex items-center gap-3">
                <span className="w-40 truncate text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                  {reason.label}
                </span>
                <div
                  className="h-3 flex-1 overflow-hidden"
                  style={{
                    borderRadius: 'var(--bb-radius-sm)',
                    background: 'var(--bb-depth-4)',
                  }}
                >
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${reason.percentage}%`,
                      borderRadius: 'var(--bb-radius-sm)',
                      background: 'var(--bb-brand)',
                      opacity: 0.7 + reason.percentage * 0.003,
                    }}
                  />
                </div>
                <span className="w-16 text-right text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                  {reason.count} ({reason.percentage.toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* At-Risk Students List */}
        <Card className="animate-reveal overflow-hidden p-0">
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
          >
            <h2 className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
              Alunos em Risco ({atRiskStudents.length})
            </h2>
            <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
              Ordenados por urgencia
            </span>
          </div>

          {/* Mobile: Cards */}
          <div className="md:hidden">
            {atRiskStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center text-xs font-bold"
                  style={{
                    borderRadius: '50%',
                    background: 'var(--bb-depth-4)',
                    color: 'var(--bb-ink-60)',
                  }}
                >
                  {student.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                    {student.name}
                    {student.contacted && (
                      <span className="ml-2 text-[10px]" style={{ color: 'var(--bb-ink-60)' }}>
                        (contatado)
                      </span>
                    )}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                    {student.className} | {student.daysWithoutTraining}d sem treinar
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <TrendBadge trend={student.trend} />
                  <button
                    onClick={() => setSelectedStudent(student)}
                    className="text-xs font-medium transition-colors"
                    style={{ color: 'var(--bb-brand)' }}
                  >
                    Agir
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                    {['Aluno', 'Faixa', 'Turma', 'Dias sem treinar', 'Tendencia', 'Ultimo check-in', 'Status', 'Acao'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium"
                        style={{
                          color: 'var(--bb-ink-60)',
                          background: 'var(--bb-depth-4)',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {atRiskStudents.map((student) => (
                    <tr
                      key={student.id}
                      style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center text-[10px] font-bold"
                            style={{
                              borderRadius: '50%',
                              background: 'var(--bb-depth-4)',
                              color: 'var(--bb-ink-60)',
                            }}
                          >
                            {student.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                            {student.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize" style={{ color: 'var(--bb-ink-80)' }}>
                        {BELT_LABELS[student.belt] ?? student.belt}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--bb-ink-80)' }}>
                        {student.className}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="font-bold"
                          style={{
                            color: student.daysWithoutTraining >= 10
                              ? 'var(--bb-error)'
                              : student.daysWithoutTraining >= 7
                                ? 'var(--bb-warning)'
                                : 'var(--bb-ink-80)',
                          }}
                        >
                          {student.daysWithoutTraining}d
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <TrendBadge trend={student.trend} />
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--bb-ink-60)' }}>
                        {student.lastCheckin
                          ? new Date(student.lastCheckin).toLocaleDateString('pt-BR')
                          : '---'}
                      </td>
                      <td className="px-4 py-3">
                        {student.contacted ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium"
                            style={{
                              borderRadius: 'var(--bb-radius-sm)',
                              background: 'var(--bb-brand-surface)',
                              color: 'var(--bb-brand)',
                            }}
                          >
                            Contatado
                          </span>
                        ) : (
                          <span
                            className="px-2 py-0.5 text-[10px] font-medium"
                            style={{
                              borderRadius: 'var(--bb-radius-sm)',
                              background: 'var(--bb-depth-4)',
                              color: 'var(--bb-ink-60)',
                            }}
                          >
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="px-3 py-1 text-xs font-medium text-white transition-colors"
                          style={{
                            borderRadius: 'var(--bb-radius-sm)',
                            background: 'var(--bb-brand)',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                        >
                          Agir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {atRiskStudents.length === 0 && (
            <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Nenhum aluno em risco neste periodo
            </div>
          )}
        </Card>

        {/* ═══ CHURN PREDICTION TABS ═══════════════════════════════════ */}
        <Card className="animate-reveal overflow-hidden p-0">
          <div
            className="flex items-center gap-0 px-0"
            style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
          >
            {([
              { key: 'risco' as const, label: 'Alunos em Risco' },
              { key: 'recuperados' as const, label: 'Recuperados' },
              { key: 'cancelados' as const, label: 'Cancelados' },
              { key: 'tendencia' as const, label: 'Tendência' },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setChurnTab(tab.key)}
                className="px-4 py-3 text-sm font-medium transition-colors"
                style={{
                  color: churnTab === tab.key ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                  borderBottom: churnTab === tab.key ? '2px solid var(--bb-brand)' : '2px solid transparent',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {/* TAB: Alunos em Risco */}
            {churnTab === 'risco' && (
              <div className="space-y-3">
                {alunosRisco.length === 0 && (
                  <p className="py-8 text-center text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                    Nenhum aluno em risco identificado
                  </p>
                )}
                {alunosRisco.map((aluno) => (
                  <div
                    key={aluno.id}
                    className="flex items-center justify-between rounded-lg p-3"
                    style={{ background: 'var(--bb-depth-3)' }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ background: aluno.risco === 'alto' ? '#EF4444' : '#F59E0B' }}
                        />
                        <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                          {aluno.nome}
                        </p>
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                          style={{
                            background: aluno.risco === 'alto' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                            color: aluno.risco === 'alto' ? '#EF4444' : '#F59E0B',
                          }}
                        >
                          {aluno.risco.toUpperCase()}
                        </span>
                      </div>
                      <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                        Score: {aluno.score} | {aluno.motivos.slice(0, 2).join(', ')}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 ml-3">
                      <a
                        href={`https://wa.me/5531999990001?text=${encodeURIComponent('Oi ' + aluno.nome + ', tudo bem? Sentimos sua falta nos treinos!')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md px-3 py-1.5 text-xs font-medium"
                        style={{ background: '#25D366', color: '#fff' }}
                      >
                        WhatsApp
                      </a>
                      {aluno.statusAcao === 'pendente' ? (
                        <button
                          onClick={() => handleMarcarAcao(aluno.id, 'contato_whatsapp')}
                          className="rounded-md px-3 py-1.5 text-xs font-medium"
                          style={{ background: 'var(--bb-brand)', color: '#fff' }}
                        >
                          Ação tomada
                        </button>
                      ) : (
                        <span
                          className="rounded-md px-3 py-1.5 text-[10px] font-medium"
                          style={{ background: 'var(--bb-brand-surface)', color: 'var(--bb-brand)' }}
                        >
                          {aluno.statusAcao === 'acao_tomada' ? 'Em acompanhamento' : aluno.statusAcao === 'recuperado' ? 'Recuperado' : 'Cancelou'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: Recuperados */}
            {churnTab === 'recuperados' && (
              <div className="py-8 text-center">
                {churnMetrics ? (
                  <>
                    <p className="text-4xl font-extrabold" style={{ color: '#22C55E' }}>
                      {churnMetrics.recuperados}
                    </p>
                    <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                      alunos recuperados (taxa: {churnMetrics.taxaRecuperacao}%)
                    </p>
                    <div className="mx-auto mt-4 h-2 w-48 overflow-hidden rounded-full" style={{ background: 'var(--bb-depth-4)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${churnMetrics.taxaRecuperacao}%`, background: '#22C55E', transition: 'width 0.8s ease' }}
                      />
                    </div>
                    <p className="mt-2 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      De {churnMetrics.recuperados + churnMetrics.cancelados} alunos que estiveram em risco
                    </p>
                  </>
                ) : (
                  <Skeleton className="mx-auto h-4 w-32" />
                )}
              </div>
            )}

            {/* TAB: Cancelados */}
            {churnTab === 'cancelados' && (
              <div className="py-8 text-center">
                {churnMetrics ? (
                  <>
                    <p className="text-4xl font-extrabold" style={{ color: '#EF4444' }}>
                      {churnMetrics.cancelados}
                    </p>
                    <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                      alunos cancelaram no periodo
                    </p>
                    <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-4">
                      <div className="rounded-lg p-4" style={{ background: 'var(--bb-depth-3)' }}>
                        <p className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{churnMetrics.alto}</p>
                        <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Risco alto atual</p>
                      </div>
                      <div className="rounded-lg p-4" style={{ background: 'var(--bb-depth-3)' }}>
                        <p className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{churnMetrics.medio}</p>
                        <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Risco medio atual</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <Skeleton className="mx-auto h-4 w-32" />
                )}
              </div>
            )}

            {/* TAB: Tendencia */}
            {churnTab === 'tendencia' && (
              <div>
                {churnTrend.length > 0 ? (
                  <div style={{ height: '300px' }}>
                    <RResponsiveContainer width="100%" height="100%">
                      <LineChart data={churnTrend} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                        <RXAxis
                          dataKey="mes"
                          tick={{ fill: 'var(--bb-ink-40)', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <RYAxis
                          tick={{ fill: 'var(--bb-ink-40)', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          width={40}
                        />
                        <RTooltip
                          contentStyle={{
                            backgroundColor: 'var(--bb-depth-4, #1a1a2e)',
                            border: '1px solid var(--bb-glass-border)',
                            borderRadius: '8px',
                            color: 'var(--bb-ink-100)',
                            fontSize: '12px',
                          }}
                        />
                        <Line type="monotone" dataKey="risco" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} name="Em Risco" />
                        <Line type="monotone" dataKey="cancelados" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} name="Cancelados" />
                        <Line type="monotone" dataKey="recuperados" stroke="#22C55E" strokeWidth={2} dot={{ r: 4 }} name="Recuperados" />
                      </LineChart>
                    </RResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                    Dados de tendencia nao disponiveis
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Student Action Modal */}
        <Modal
          open={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={selectedStudent?.name ?? ''}
        >
          {selectedStudent && (
            <div className="space-y-4">
              {/* Profile */}
              <div className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center text-lg font-bold"
                  style={{
                    borderRadius: '50%',
                    background: 'var(--bb-depth-4)',
                    color: 'var(--bb-ink-60)',
                  }}
                >
                  {selectedStudent.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                    {selectedStudent.name}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                    Faixa {BELT_LABELS[selectedStudent.belt] ?? selectedStudent.belt} |{' '}
                    {selectedStudent.className}
                  </p>
                </div>
              </div>

              {/* Alert */}
              <div
                className="p-4"
                style={{
                  borderRadius: 'var(--bb-radius-md)',
                  background: 'var(--bb-depth-4)',
                  borderLeft: '4px solid var(--bb-error)',
                }}
              >
                <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                  {selectedStudent.daysWithoutTraining} dias sem treinar
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                  Tendencia: {TREND_LABELS[selectedStudent.trend]}
                  {selectedStudent.lastCheckin && (
                    <> | Ultimo check-in: {new Date(selectedStudent.lastCheckin).toLocaleDateString('pt-BR')}</>
                  )}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <p className="text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>
                  ACOES
                </p>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => setSelectedStudent(null)}
                >
                  Enviar Mensagem
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setSelectedStudent(null)}
                >
                  Agendar Conversa
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => handleMarkContacted(selectedStudent)}
                >
                  {selectedStudent.contacted ? 'Ja Contatado' : 'Marcar como Contatado'}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </PlanGate>
  );
}

// ── Retention Donut Component ──────────────────────────────────────────

function RetentionDonut({
  retention,
  goal,
}: {
  retention: number;
  goal: number;
}) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const retentionOffset = circumference - (retention / 100) * circumference;
  const goalAngle = (goal / 100) * 360 - 90;
  const goalRad = (goalAngle * Math.PI) / 180;
  const goalX = 60 + radius * Math.cos(goalRad);
  const goalY = 60 + radius * Math.sin(goalRad);

  const color = retention >= goal ? 'var(--bb-success)' : retention >= goal - 3 ? 'var(--bb-warning)' : 'var(--bb-error)';

  return (
    <div className="relative h-44 w-44">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="14"
          style={{ stroke: 'var(--bb-depth-4)' }}
        />
        {/* Retention arc */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={retentionOffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1s ease-out',
          }}
        />
        {/* Goal marker */}
        <circle
          cx={goalX}
          cy={goalY}
          r="4"
          fill="none"
          strokeWidth="2"
          style={{ stroke: 'var(--bb-ink-60)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          {retention}
        </span>
        <span className="text-sm font-medium" style={{ color }}>
          %
        </span>
      </div>
    </div>
  );
}

// ── Retention Line Chart (SVG) ─────────────────────────────────────────

function RetentionLineChart({
  data,
}: {
  data: RetentionData['monthlyData'];
}) {
  if (data.length === 0) return null;

  const chartWidth = 800;
  const chartHeight = 200;
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const minVal = Math.min(...data.map((d) => d.retention)) - 2;
  const maxVal = Math.max(...data.map((d) => d.retention)) + 2;
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => ({
    x: padding.left + (i / Math.max(data.length - 1, 1)) * innerWidth,
    y: padding.top + innerHeight - ((d.retention - minVal) / range) * innerHeight,
    value: d.retention,
    label: formatMonth(d.month),
    churned: d.churned,
    newStudents: d.newStudents,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Area fill
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + innerHeight} L ${points[0].x} ${padding.top + innerHeight} Z`;

  // Gridlines
  const gridLines = 5;
  const gridValues = Array.from({ length: gridLines }, (_, i) =>
    minVal + (range * i) / (gridLines - 1),
  );

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full"
        style={{ minWidth: '500px' }}
      >
        {/* Grid lines */}
        {gridValues.map((val, i) => {
          const y = padding.top + innerHeight - ((val - minVal) / range) * innerHeight;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + innerWidth}
                y2={y}
                strokeDasharray="4,4"
                style={{ stroke: 'var(--bb-glass-border)' }}
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                className="text-[10px]"
                style={{ fill: 'var(--bb-ink-60)' }}
              >
                {val.toFixed(1)}%
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path
          d={areaD}
          style={{ fill: 'var(--bb-brand)', opacity: 0.1 }}
        />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ stroke: 'var(--bb-brand)' }}
        />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              style={{
                fill: 'var(--bb-depth-3)',
                stroke: 'var(--bb-brand)',
              }}
              strokeWidth="2"
            />
            {/* Month label */}
            <text
              x={p.x}
              y={padding.top + innerHeight + 16}
              textAnchor="middle"
              className="text-[10px]"
              style={{ fill: 'var(--bb-ink-60)' }}
            >
              {p.label}
            </text>
            {/* Value label */}
            <text
              x={p.x}
              y={p.y - 10}
              textAnchor="middle"
              className="text-[9px] font-semibold"
              style={{ fill: 'var(--bb-ink-80)' }}
            >
              {p.value}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  detail,
  variant,
}: {
  label: string;
  value: string;
  detail: string;
  variant: 'default' | 'danger' | 'warning';
}) {
  const valueColor =
    variant === 'danger'
      ? 'var(--bb-error)'
      : variant === 'warning'
        ? 'var(--bb-warning)'
        : 'var(--bb-ink-100)';

  return (
    <Card className="animate-reveal p-4">
      <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
        {label}
      </p>
      <p className="mt-1 text-xl font-bold" style={{ color: valueColor }}>
        {value}
      </p>
      <p className="mt-0.5 text-[10px]" style={{ color: 'var(--bb-ink-60)' }}>
        {detail}
      </p>
    </Card>
  );
}

// ── Trend Badge ────────────────────────────────────────────────────────

function TrendBadge({ trend }: { trend: AtRiskStudent['trend'] }) {
  const colors: Record<string, { bg: string; text: string }> = {
    declining: { bg: 'rgba(239, 68, 68, 0.12)', text: 'var(--bb-error)' },
    stable: { bg: 'rgba(234, 179, 8, 0.12)', text: 'var(--bb-warning)' },
    improving: { bg: 'var(--bb-success-surface)', text: 'var(--bb-success)' },
  };

  const c = colors[trend] ?? colors.stable;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium"
      style={{
        borderRadius: 'var(--bb-radius-sm)',
        background: c.bg,
        color: c.text,
      }}
    >
      {TREND_ICONS[trend]} {TREND_LABELS[trend]}
    </span>
  );
}

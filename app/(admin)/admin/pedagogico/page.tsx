'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  GraduationCapIcon,
  UsersIcon,
  AwardIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  CalendarIcon,

  CheckCircleIcon,
  PlusIcon,
  XIcon,
  ChevronDownIcon,
  BookOpenIcon,
  FileTextIcon,
  FilterIcon,
} from '@/components/shell/icons';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import {
  getPedagogicoDashboard,
  getAnaliseProfessor,
  getCurriculos,
  getReunioes,
  getOcorrencias,
  createOcorrencia,
  createReuniao,
  gerarRelatorioPedagogico,
} from '@/lib/api/pedagogico.service';
import type {
  PedagogicoDashboardDTO,
  AnaliseProfessor,
  CurriculoAcademia,
  ReuniaoPedagogica,
  Ocorrencia,
  RelatorioPedagogicoMensal,
  SaudeTurma,
  RankingProfessor,
} from '@/lib/api/pedagogico.service';
import { PlanGate } from '@/components/plans/PlanGate';
import { translateError } from '@/lib/utils/error-translator';

// ── Dynamic Recharts (no SSR) ──────────────────────────────────────
const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });
const Legend = dynamic(() => import('recharts').then((m) => m.Legend), { ssr: false });

// ── Constants ──────────────────────────────────────────────────────
const ACADEMY_ID = 'academy-guerreiros';

type TabKey = 'visao-geral' | 'professores' | 'turmas' | 'curriculo' | 'reunioes' | 'ocorrencias';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'visao-geral', label: 'Visao Geral' },
  { key: 'professores', label: 'Professores' },
  { key: 'turmas', label: 'Turmas' },
  { key: 'curriculo', label: 'Curriculo' },
  { key: 'reunioes', label: 'Reunioes' },
  { key: 'ocorrencias', label: 'Ocorrencias' },
];

// ── Helpers ────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 75) return '#22C55E';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
}

function scoreBg(score: number): string {
  if (score >= 75) return 'rgba(34,197,94,0.1)';
  if (score >= 50) return 'rgba(245,158,11,0.1)';
  return 'rgba(239,68,68,0.1)';
}

function urgenciaColor(urgencia: string): string {
  if (urgencia === 'alta') return '#EF4444';
  if (urgencia === 'media') return '#F59E0B';
  return '#6B7280';
}

function tipoOcorrenciaColor(tipo: string): { bg: string; text: string } {
  switch (tipo) {
    case 'positiva': return { bg: 'rgba(34,197,94,0.1)', text: '#22C55E' };
    case 'disciplina':
    case 'comportamento': return { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B' };
    case 'seguranca': return { bg: 'rgba(239,68,68,0.1)', text: '#EF4444' };
    default: return { bg: 'rgba(107,114,128,0.1)', text: '#6B7280' };
  }
}

function tipoOcorrenciaLabel(tipo: string): string {
  const map: Record<string, string> = {
    positiva: 'Positiva',
    comportamento: 'Comportamento',
    disciplina: 'Disciplina',
    seguranca: 'Seguranca',
    observacao: 'Observacao',
  };
  return map[tipo] ?? tipo;
}

function gravidadeLabel(g: string): string {
  const map: Record<string, string> = { leve: 'Leve', moderada: 'Moderada', grave: 'Grave' };
  return map[g] ?? g;
}

function timelineIcon(tipo: string): string {
  const map: Record<string, string> = {
    graduacao: '\uD83E\uDD4B',
    avaliacao: '\uD83D\uDCCB',
    reuniao: '\uD83E\uDD1D',
    curriculo: '\uD83D\uDCDA',
    ocorrencia: '\uD83D\uDCDD',
    plano_aula: '\uD83D\uDCD6',
    alerta: '\u26A0\uFE0F',
  };
  return map[tipo] ?? '\u2705';
}

function tendenciaArrow(t: string): string {
  if (t === 'subindo') return '\u2191';
  if (t === 'caindo') return '\u2193';
  return '\u2192';
}

function tendenciaColor(t: string): string {
  if (t === 'subindo') return '#22C55E';
  if (t === 'caindo') return '#EF4444';
  return 'var(--bb-ink-60)';
}

function formatDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return d;
  }
}

function formatDateTime(d: string): string {
  try {
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return d;
  }
}

// ── Tooltip Style ──────────────────────────────────────────────────
const chartTooltipStyle: React.CSSProperties = {
  backgroundColor: 'var(--bb-depth-4, #1a1a2e)',
  border: '1px solid var(--bb-glass-border)',
  borderRadius: '8px',
  boxShadow: 'var(--bb-shadow-md)',
  color: 'var(--bb-ink-100)',
  fontSize: '12px',
};

// ── Skeleton Component ─────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="space-y-2">
        <Skeleton variant="text" className="h-8 w-72" />
        <Skeleton variant="text" className="h-4 w-96" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} variant="text" className="h-10 w-28" />)}
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} variant="card" className="h-28" />)}
      </div>
      <Skeleton variant="card" className="h-64" />
      <Skeleton variant="card" className="h-48" />
    </div>
  );
}

function TabSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-40" />)}
      </div>
      <Skeleton variant="card" className="h-64" />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════

export default function AdminPedagogicoPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>('visao-geral');
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<PedagogicoDashboardDTO | null>(null);

  // Tab-specific data
  const [professoresAnalise, setProfessoresAnalise] = useState<Record<string, AnaliseProfessor>>({});
  const [expandedProfessor, setExpandedProfessor] = useState<string | null>(null);
  const [curriculos, setCurriculos] = useState<CurriculoAcademia[]>([]);
  const [expandedCurriculo, setExpandedCurriculo] = useState<string | null>(null);
  const [reunioes, setReunioes] = useState<ReuniaoPedagogica[]>([]);
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [relatorio, setRelatorio] = useState<RelatorioPedagogicoMensal | null>(null);
  const [gerandoRelatorio, setGerandoRelatorio] = useState(false);

  // Tab loading states
  const [tabLoading, setTabLoading] = useState<Record<TabKey, boolean>>({
    'visao-geral': false,
    professores: false,
    turmas: false,
    curriculo: false,
    reunioes: false,
    ocorrencias: false,
  });

  // Ocorrencias filters
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroGravidade, setFiltroGravidade] = useState<string>('todos');

  // Modals
  const [reuniaoModalOpen, setReuniaoModalOpen] = useState(false);
  const [ocorrenciaModalOpen, setOcorrenciaModalOpen] = useState(false);

  // New reuniao form
  const [novaReuniao, setNovaReuniao] = useState({ titulo: '', data: '', hora: '', participantes: '', pauta: '' });

  // New ocorrencia form
  const [novaOcorrencia, setNovaOcorrencia] = useState({
    alunoNome: '', tipo: 'observacao' as Ocorrencia['tipo'], gravidade: 'leve' as Ocorrencia['gravidade'],
    descricao: '', acaoTomada: '', responsavelNotificado: false,
  });

  // ── Load dashboard ─────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const data = await getPedagogicoDashboard(ACADEMY_ID);
        setDashboard(data);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [toast]);

  // ── Load tab data on demand ────────────────────────────────────
  useEffect(() => {
    async function loadTabData() {
      if (activeTab === 'curriculo' && curriculos.length === 0) {
        setTabLoading((prev) => ({ ...prev, curriculo: true }));
        try {
          const data = await getCurriculos(ACADEMY_ID);
          setCurriculos(data);
        } catch (err) {
          toast(translateError(err), 'error');
        } finally {
          setTabLoading((prev) => ({ ...prev, curriculo: false }));
        }
      }
      if (activeTab === 'reunioes' && reunioes.length === 0) {
        setTabLoading((prev) => ({ ...prev, reunioes: true }));
        try {
          const data = await getReunioes(ACADEMY_ID);
          setReunioes(data);
        } catch (err) {
          toast(translateError(err), 'error');
        } finally {
          setTabLoading((prev) => ({ ...prev, reunioes: false }));
        }
      }
      if (activeTab === 'ocorrencias' && ocorrencias.length === 0) {
        setTabLoading((prev) => ({ ...prev, ocorrencias: true }));
        try {
          const data = await getOcorrencias(ACADEMY_ID);
          setOcorrencias(data);
        } catch (err) {
          toast(translateError(err), 'error');
        } finally {
          setTabLoading((prev) => ({ ...prev, ocorrencias: false }));
        }
      }
    }
    loadTabData();
  }, [activeTab, curriculos.length, reunioes.length, ocorrencias.length, toast]);

  // ── Load professor analysis ────────────────────────────────────
  async function loadProfessorAnalise(professorId: string) {
    if (professoresAnalise[professorId]) return;
    try {
      const analise = await getAnaliseProfessor(professorId);
      setProfessoresAnalise((prev) => ({ ...prev, [professorId]: analise }));
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  // ── Generate report ────────────────────────────────────────────
  async function handleGerarRelatorio() {
    setGerandoRelatorio(true);
    try {
      const data = await gerarRelatorioPedagogico(ACADEMY_ID, new Date().toISOString().slice(0, 7));
      setRelatorio(data);
      toast('Relatorio gerado com sucesso', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setGerandoRelatorio(false);
    }
  }

  // ── Create reuniao ─────────────────────────────────────────────
  async function handleCreateReuniao() {
    if (!novaReuniao.titulo || !novaReuniao.data) {
      toast('Preencha titulo e data', 'error');
      return;
    }
    try {
      const created = await createReuniao({
        academyId: ACADEMY_ID,
        titulo: novaReuniao.titulo,
        data: `${novaReuniao.data}T${novaReuniao.hora || '14:00'}:00Z`,
        participantes: novaReuniao.participantes.split(',').map((p) => ({
          professorId: p.trim(),
          professorNome: p.trim(),
          presente: false,
        })),
        pauta: novaReuniao.pauta ? [{ titulo: novaReuniao.pauta, descricao: '', responsavel: '', status: 'pendente' as const }] : [],
      });
      setReunioes((prev) => [created, ...prev]);
      setReuniaoModalOpen(false);
      setNovaReuniao({ titulo: '', data: '', hora: '', participantes: '', pauta: '' });
      toast('Reuniao agendada com sucesso', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  // ── Create ocorrencia ──────────────────────────────────────────
  async function handleCreateOcorrencia() {
    if (!novaOcorrencia.descricao) {
      toast('Preencha a descricao', 'error');
      return;
    }
    try {
      const created = await createOcorrencia({
        academyId: ACADEMY_ID,
        alunoNome: novaOcorrencia.alunoNome,
        tipo: novaOcorrencia.tipo,
        gravidade: novaOcorrencia.gravidade,
        descricao: novaOcorrencia.descricao,
        acaoTomada: novaOcorrencia.acaoTomada,
        responsavelNotificado: novaOcorrencia.responsavelNotificado,
        data: new Date().toISOString().split('T')[0],
      });
      setOcorrencias((prev) => [created, ...prev]);
      setOcorrenciaModalOpen(false);
      setNovaOcorrencia({ alunoNome: '', tipo: 'observacao', gravidade: 'leve', descricao: '', acaoTomada: '', responsavelNotificado: false });
      toast('Ocorrencia registrada com sucesso', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  if (loading || !dashboard) return <PageSkeleton />;

  const { resumo, saudeTurmas, rankingProfessores, alunosAtencao, timeline } = dashboard;

  // ── Filtered ocorrencias ───────────────────────────────────────
  const filteredOcorrencias = ocorrencias.filter((o) => {
    if (filtroTipo !== 'todos' && o.tipo !== filtroTipo) return false;
    if (filtroGravidade !== 'todos' && o.gravidade !== filtroGravidade) return false;
    return true;
  });

  // ── Sorted reunioes (future first) ─────────────────────────────
  const sortedReunioes = [...reunioes].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  const nextReuniao = sortedReunioes.find((r) => r.status === 'agendada');
  const pastReunioes = sortedReunioes.filter((r) => r.status !== 'agendada');

  return (
    <PlanGate module="pedagogico">
      <div className="min-h-screen space-y-6 p-4 sm:p-6">
        {/* ═══ HEADER ═══════════════════════════════════════════════════ */}
        <div>
          <div className="flex items-center gap-3">
            <GraduationCapIcon className="h-7 w-7" style={{ color: 'var(--bb-brand)' }} />
            <h1
              className="font-extrabold"
              style={{ fontSize: 'clamp(24px, 4vw, 32px)', color: 'var(--bb-ink-100)', lineHeight: 1.2 }}
            >
              Coordenacao Pedagogica
            </h1>
          </div>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Acompanhe a saude pedagogica da sua academia, evolucao de turmas, professores e alunos.
          </p>
        </div>

        {/* ═══ TABS ═════════════════════════════════════════════════════ */}
        <div className="flex gap-1 overflow-x-auto rounded-lg p-1" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className="whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all min-h-[44px]"
              style={{
                background: activeTab === tab.key ? 'var(--bb-brand)' : 'transparent',
                color: activeTab === tab.key ? '#fff' : 'var(--bb-ink-60)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══ TAB CONTENT ══════════════════════════════════════════════ */}

        {/* ── TAB 1: VISAO GERAL ─────────────────────────────────────── */}
        {activeTab === 'visao-geral' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
              {[
                { label: 'Presenca Geral', value: `${resumo.mediaPresencaGeral}%`, icon: <UsersIcon className="h-4 w-4" />, color: scoreColor(resumo.mediaPresencaGeral) },
                { label: 'Evolucao Media', value: resumo.mediaEvolucaoGeral.toFixed(1), icon: <TrendingUpIcon className="h-4 w-4" />, color: '#3B82F6' },
                { label: 'Avaliacoes/mes', value: String(resumo.alunosEvoluidosMes), icon: <FileTextIcon className="h-4 w-4" />, color: '#8B5CF6' },
                { label: 'Graduacoes', value: String(resumo.graduacoesRealizadasMes), icon: <AwardIcon className="h-4 w-4" />, color: '#A855F7' },
                { label: 'Estagnados', value: String(resumo.alunosEstagnadosMes), icon: <AlertTriangleIcon className="h-4 w-4" />, color: '#F59E0B', warning: resumo.alunosEstagnadosMes > 0 },
                { label: 'Prontos p/ graduar', value: String(resumo.graduacoesProntas), icon: <GraduationCapIcon className="h-4 w-4" />, color: '#22C55E' },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="p-4 transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: 'var(--bb-depth-2)',
                    border: kpi.warning ? `1px solid ${kpi.color}` : '1px solid var(--bb-glass-border)',
                    borderRadius: 'var(--bb-radius-lg)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ color: kpi.color }}>{kpi.icon}</span>
                    <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>{kpi.label}</span>
                  </div>
                  <p className="mt-2 text-2xl font-extrabold" style={{ color: kpi.color }}>
                    {kpi.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Saude das Turmas */}
            <div
              className="p-5"
              style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}
            >
              <h2 className="mb-4 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                Saude das Turmas
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {saudeTurmas.map((turma) => (
                  <TurmaHealthCard key={turma.turmaId} turma={turma} />
                ))}
              </div>
            </div>

            {/* Alunos que precisam de atencao */}
            <div
              className="p-5"
              style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}
            >
              <h2 className="mb-4 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                Alunos que precisam de atencao
              </h2>
              <div className="space-y-3">
                {alunosAtencao.map((aluno) => (
                  <div
                    key={aluno.alunoId}
                    className="flex flex-col gap-2 rounded-lg p-3 sm:flex-row sm:items-center sm:justify-between"
                    style={{ background: 'var(--bb-depth-3)' }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-1 inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                        style={{ background: urgenciaColor(aluno.urgencia) }}
                      />
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                          {aluno.alunoNome}
                          <span className="ml-2 text-xs font-normal" style={{ color: 'var(--bb-ink-40)' }}>
                            {aluno.faixa} &middot; {aluno.turma}
                          </span>
                        </p>
                        <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-60)' }}>{aluno.motivo}</p>
                      </div>
                    </div>
                    <span
                      className="inline-flex self-start whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium sm:self-center"
                      style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}
                    >
                      {aluno.acaoSugerida}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Pedagogica */}
            <div
              className="p-5"
              style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}
            >
              <h2 className="mb-4 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                Timeline Pedagogica
              </h2>
              <div className="space-y-3">
                {timeline.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="mt-0.5 text-lg">{timelineIcon(item.tipo)}</span>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--bb-ink-100)' }}>{item.descricao}</p>
                      <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{formatDate(item.data)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gerar Relatorio */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                type="button"
                disabled={gerandoRelatorio}
                onClick={handleGerarRelatorio}
                className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-50 min-h-[44px]"
                style={{ background: 'var(--bb-brand)', color: '#fff' }}
              >
                <FileTextIcon className="h-4 w-4" />
                {gerandoRelatorio ? 'Gerando...' : 'Gerar Relatorio Mensal'}
              </button>
            </div>

            {/* Relatorio Preview */}
            {relatorio && (
              <div
                className="space-y-4 p-5"
                style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-brand)', borderRadius: 'var(--bb-radius-lg)' }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold" style={{ color: 'var(--bb-brand)' }}>
                    Relatorio Pedagogico - {relatorio.mes}
                  </h2>
                  <button type="button" onClick={() => setRelatorio(null)} aria-label="Fechar relatorio">
                    <XIcon className="h-4 w-4" style={{ color: 'var(--bb-ink-60)' }} />
                  </button>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--bb-ink-80)' }}>{relatorio.resumoExecutivo}</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: 'Alunos', value: relatorio.metricas.totalAlunos },
                    { label: 'Presenca', value: `${relatorio.metricas.presencaMedia}%` },
                    { label: 'Graduacoes', value: relatorio.metricas.graduacoes },
                    { label: 'Retencao', value: `${relatorio.metricas.retencao}%` },
                  ].map((m) => (
                    <div key={m.label} className="rounded-lg p-3" style={{ background: 'var(--bb-depth-3)' }}>
                      <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{m.label}</p>
                      <p className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>{m.value}</p>
                    </div>
                  ))}
                </div>
                {relatorio.metaProximoMes.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase" style={{ color: 'var(--bb-ink-40)' }}>Metas proximo mes</p>
                    <div className="space-y-1">
                      {relatorio.metaProximoMes.map((meta, i) => (
                        <p key={i} className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                          &bull; {meta.descricao} <span style={{ color: 'var(--bb-ink-40)' }}>({meta.responsavel})</span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: PROFESSORES ─────────────────────────────────────── */}
        {activeTab === 'professores' && (
          <div className="space-y-6">
            {/* Ranking Cards */}
            <div className="space-y-4">
              {rankingProfessores.map((prof) => (
                <ProfessorCard
                  key={prof.professorId}
                  professor={prof}
                  analise={professoresAnalise[prof.professorId]}
                  expanded={expandedProfessor === prof.professorId}
                  onToggle={() => {
                    if (expandedProfessor === prof.professorId) {
                      setExpandedProfessor(null);
                    } else {
                      setExpandedProfessor(prof.professorId);
                      loadProfessorAnalise(prof.professorId);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: TURMAS ──────────────────────────────────────────── */}
        {activeTab === 'turmas' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {saudeTurmas.map((turma) => (
              <div
                key={turma.turmaId}
                className="p-4"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                  borderRadius: 'var(--bb-radius-lg)',
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{turma.turmaNome}</p>
                    <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{turma.professorNome} &middot; {turma.modalidade}</p>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-bold"
                    style={{ background: scoreBg(turma.score), color: scoreColor(turma.score) }}
                  >
                    {turma.score}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Presenca</p>
                    <p className="text-sm font-bold" style={{ color: scoreColor(turma.presencaMedia) }}>{turma.presencaMedia}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Evolucao</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>{turma.evolucaoMedia.toFixed(1)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Tendencia</p>
                    <p className="text-sm font-bold" style={{ color: tendenciaColor(turma.tendencia) }}>
                      {tendenciaArrow(turma.tendencia)} {turma.tendencia}
                    </p>
                  </div>
                </div>
                {turma.alertas.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {turma.alertas.map((alerta, i) => (
                      <p key={i} className="flex items-center gap-1.5 text-xs" style={{ color: '#F59E0B' }}>
                        <AlertTriangleIcon className="h-3 w-3 flex-shrink-0" />
                        {alerta}
                      </p>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className="flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all hover:opacity-80 min-h-[36px]"
                    style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
                  >
                    Ver alunos
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all hover:opacity-80 min-h-[36px]"
                    style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
                  >
                    Ver curriculo
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB 4: CURRICULO ───────────────────────────────────────── */}
        {activeTab === 'curriculo' && (
          <div className="space-y-4">
            {tabLoading.curriculo ? <TabSkeleton /> : (
              curriculos.map((cur) => (
                <div
                  key={cur.id}
                  className="p-5"
                  style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <BookOpenIcon className="h-4 w-4" style={{ color: 'var(--bb-brand)' }} />
                        <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{cur.nome}</p>
                      </div>
                      <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-40)' }}>{cur.modalidade} &middot; {cur.modulos.length} modulos</p>
                      <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>{cur.descricao}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedCurriculo(expandedCurriculo === cur.id ? null : cur.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-md transition-all hover:bg-[var(--bb-depth-4)]"
                      aria-label={expandedCurriculo === cur.id ? 'Recolher' : 'Expandir'}
                    >
                      <ChevronDownIcon
                        className="h-4 w-4 transition-transform"
                        style={{
                          color: 'var(--bb-ink-60)',
                          transform: expandedCurriculo === cur.id ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                      />
                    </button>
                  </div>

                  {/* Progress by turma */}
                  {cur.progressoTurmas.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {cur.progressoTurmas.map((pt) => (
                        <div key={pt.turmaId} className="flex items-center gap-3">
                          <span className="w-32 text-xs font-medium truncate" style={{ color: 'var(--bb-ink-80)' }}>{pt.turmaNome}</span>
                          <div className="flex-1">
                            <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--bb-ink-20)' }}>
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${pt.percentualConcluido}%`,
                                  background: pt.percentualConcluido >= 75 ? '#22C55E' : pt.percentualConcluido >= 40 ? '#F59E0B' : '#EF4444',
                                }}
                              />
                            </div>
                          </div>
                          <span className="w-16 text-right text-xs font-mono" style={{ color: 'var(--bb-ink-60)' }}>{pt.percentualConcluido}%</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Expanded modules */}
                  {expandedCurriculo === cur.id && (
                    <div className="mt-4 space-y-3" style={{ borderTop: '1px solid var(--bb-glass-border)', paddingTop: '16px' }}>
                      {cur.modulos.map((mod) => (
                        <div key={mod.id} className="rounded-lg p-3" style={{ background: 'var(--bb-depth-3)' }}>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{mod.nome}</p>
                            <span className="rounded px-2 py-0.5 text-[10px] font-bold" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}>
                              {mod.faixa}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-40)' }}>{mod.descricao}</p>
                          <div className="mt-2 space-y-1">
                            {mod.tecnicas.map((tec) => (
                              <div key={tec.id} className="flex items-center gap-2 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                                <span style={{ color: 'var(--bb-brand)' }}>&bull;</span>
                                <span style={{ color: 'var(--bb-ink-80)' }}>{tec.nome}</span>
                                <span>&mdash; {tec.posicao}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TAB 5: REUNIOES ────────────────────────────────────────── */}
        {activeTab === 'reunioes' && (
          <div className="space-y-4">
            {tabLoading.reunioes ? <TabSkeleton /> : (
              <>
                {/* Action button */}
                <button
                  type="button"
                  onClick={() => setReuniaoModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-80 min-h-[44px]"
                  style={{ background: 'var(--bb-brand)', color: '#fff' }}
                >
                  <PlusIcon className="h-4 w-4" />
                  Agendar Reuniao
                </button>

                {/* Next meeting pinned */}
                {nextReuniao && (
                  <div
                    className="p-5"
                    style={{ background: 'var(--bb-depth-2)', border: '2px solid var(--bb-brand)', borderRadius: 'var(--bb-radius-lg)' }}
                  >
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" style={{ color: 'var(--bb-brand)' }} />
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--bb-brand)' }}>Proxima Reuniao</span>
                    </div>
                    <p className="mt-2 text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{nextReuniao.titulo}</p>
                    <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                      {formatDateTime(nextReuniao.data)} &middot; {nextReuniao.participantes.length} participantes
                    </p>
                    {nextReuniao.pauta.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-semibold uppercase" style={{ color: 'var(--bb-ink-40)' }}>Pauta</p>
                        {nextReuniao.pauta.map((p, i) => (
                          <p key={i} className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>&bull; {p.titulo}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Past meetings */}
                {pastReunioes.map((r) => (
                  <div
                    key={r.id}
                    className="p-5"
                    style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{r.titulo}</p>
                        <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                          {formatDateTime(r.data)} &middot; {r.participantes.filter((p) => p.presente).length}/{r.participantes.length} presentes
                        </p>
                      </div>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{
                          background: r.status === 'concluida' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                          color: r.status === 'concluida' ? '#22C55E' : '#F59E0B',
                        }}
                      >
                        {r.status === 'concluida' ? 'Concluida' : r.status}
                      </span>
                    </div>
                    {r.ata && (
                      <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--bb-ink-60)' }}>{r.ata}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {r.decisoes.length > 0 && (
                        <span className="rounded-md px-2 py-0.5 text-[10px] font-bold" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>
                          {r.decisoes.length} decisoes
                        </span>
                      )}
                      {r.acoesDefinidas.length > 0 && (
                        <span className="rounded-md px-2 py-0.5 text-[10px] font-bold" style={{ background: 'rgba(168,85,247,0.1)', color: '#A855F7' }}>
                          {r.acoesDefinidas.length} acoes
                        </span>
                      )}
                      {r.ata && (
                        <span className="rounded-md px-2 py-0.5 text-[10px] font-bold" style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>
                          Ata registrada
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ── TAB 6: OCORRENCIAS ─────────────────────────────────────── */}
        {activeTab === 'ocorrencias' && (
          <div className="space-y-4">
            {tabLoading.ocorrencias ? <TabSkeleton /> : (
              <>
                {/* Action + Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setOcorrenciaModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-80 min-h-[44px]"
                    style={{ background: 'var(--bb-brand)', color: '#fff' }}
                  >
                    <PlusIcon className="h-4 w-4" />
                    Nova Ocorrencia
                  </button>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5">
                      <FilterIcon className="h-3.5 w-3.5" style={{ color: 'var(--bb-ink-40)' }} />
                      <select
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        className="rounded-md px-2 py-1.5 text-xs min-h-[36px]"
                        style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
                      >
                        <option value="todos">Todos os tipos</option>
                        <option value="positiva">Positiva</option>
                        <option value="comportamento">Comportamento</option>
                        <option value="disciplina">Disciplina</option>
                        <option value="seguranca">Seguranca</option>
                        <option value="observacao">Observacao</option>
                      </select>
                    </div>
                    <select
                      value={filtroGravidade}
                      onChange={(e) => setFiltroGravidade(e.target.value)}
                      className="rounded-md px-2 py-1.5 text-xs min-h-[36px]"
                      style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
                    >
                      <option value="todos">Todas gravidades</option>
                      <option value="leve">Leve</option>
                      <option value="moderada">Moderada</option>
                      <option value="grave">Grave</option>
                    </select>
                  </div>
                </div>

                {/* Ocorrencias list */}
                <div className="space-y-3">
                  {filteredOcorrencias.map((oc) => {
                    const colors = tipoOcorrenciaColor(oc.tipo);
                    return (
                      <div
                        key={oc.id}
                        className="p-4"
                        style={{
                          background: 'var(--bb-depth-2)',
                          borderLeft: `4px solid ${colors.text}`,
                          borderRadius: 'var(--bb-radius-lg)',
                          border: `1px solid var(--bb-glass-border)`,
                          borderLeftColor: colors.text,
                          borderLeftWidth: '4px',
                        }}
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{oc.alunoNome}</span>
                              <span className="rounded px-1.5 py-0.5 text-[10px] font-bold" style={{ background: colors.bg, color: colors.text }}>
                                {tipoOcorrenciaLabel(oc.tipo)}
                              </span>
                              <span
                                className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                                style={{
                                  background: oc.gravidade === 'grave' ? 'rgba(239,68,68,0.1)' : oc.gravidade === 'moderada' ? 'rgba(245,158,11,0.1)' : 'rgba(107,114,128,0.1)',
                                  color: oc.gravidade === 'grave' ? '#EF4444' : oc.gravidade === 'moderada' ? '#F59E0B' : '#6B7280',
                                }}
                              >
                                {gravidadeLabel(oc.gravidade)}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                              {oc.turmaNome} &middot; {oc.professorNome} &middot; {formatDate(oc.data)}
                            </p>
                          </div>
                          {oc.responsavelNotificado && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium" style={{ color: '#22C55E' }}>
                              <CheckCircleIcon className="h-3 w-3" /> Responsavel notificado
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-80)' }}>{oc.descricao}</p>
                        {oc.acaoTomada && (
                          <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                            <span className="font-semibold">Acao tomada:</span> {oc.acaoTomada}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  {filteredOcorrencias.length === 0 && (
                    <p className="py-8 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                      Nenhuma ocorrencia encontrada com os filtros selecionados.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══ MODAL: Nova Reuniao ══════════════════════════════════════ */}
        {reuniaoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setReuniaoModalOpen(false)} />
            <div
              className="relative z-10 w-full max-w-lg space-y-4 rounded-xl p-6"
              style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Agendar Reuniao</h3>
                <button type="button" onClick={() => setReuniaoModalOpen(false)} aria-label="Fechar">
                  <XIcon className="h-5 w-5" style={{ color: 'var(--bb-ink-60)' }} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>Titulo</label>
                  <input
                    type="text"
                    value={novaReuniao.titulo}
                    onChange={(e) => setNovaReuniao((p) => ({ ...p, titulo: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 text-sm min-h-[44px]"
                    style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
                    placeholder="Ex: Reuniao Pedagogica - Abril"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>Data</label>
                    <input
                      type="date"
                      value={novaReuniao.data}
                      onChange={(e) => setNovaReuniao((p) => ({ ...p, data: e.target.value }))}
                      className="w-full rounded-lg px-3 py-2 text-sm min-h-[44px]"
                      style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>Hora</label>
                    <input
                      type="time"
                      value={novaReuniao.hora}
                      onChange={(e) => setNovaReuniao((p) => ({ ...p, hora: e.target.value }))}
                      className="w-full rounded-lg px-3 py-2 text-sm min-h-[44px]"
                      style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>Participantes (separados por virgula)</label>
                  <input
                    type="text"
                    value={novaReuniao.participantes}
                    onChange={(e) => setNovaReuniao((p) => ({ ...p, participantes: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 text-sm min-h-[44px]"
                    style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
                    placeholder="Prof. Ricardo, Prof. Camila"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>Pauta</label>
                  <textarea
                    value={novaReuniao.pauta}
                    onChange={(e) => setNovaReuniao((p) => ({ ...p, pauta: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 text-sm"
                    rows={3}
                    style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)', resize: 'vertical' }}
                    placeholder="Itens da pauta..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReuniaoModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium min-h-[44px]"
                  style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateReuniao}
                  className="rounded-lg px-4 py-2 text-sm font-semibold min-h-[44px]"
                  style={{ background: 'var(--bb-brand)', color: '#fff' }}
                >
                  Agendar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ MODAL: Nova Ocorrencia ═══════════════════════════════════ */}
        {ocorrenciaModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setOcorrenciaModalOpen(false)} />
            <div
              className="relative z-10 w-full max-w-lg space-y-4 overflow-y-auto rounded-xl p-6"
              style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', maxHeight: '90vh' }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Nova Ocorrencia</h3>
                <button type="button" onClick={() => setOcorrenciaModalOpen(false)} aria-label="Fechar">
                  <XIcon className="h-5 w-5" style={{ color: 'var(--bb-ink-60)' }} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>Aluno</label>
                  <input
                    type="text"
                    value={novaOcorrencia.alunoNome}
                    onChange={(e) => setNovaOcorrencia((p) => ({ ...p, alunoNome: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 text-sm min-h-[44px]"
                    style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
                    placeholder="Nome do aluno"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>Tipo</label>
                    <select
                      value={novaOcorrencia.tipo}
                      onChange={(e) => setNovaOcorrencia((p) => ({ ...p, tipo: e.target.value as Ocorrencia['tipo'] }))}
                      className="w-full rounded-lg px-3 py-2 text-sm min-h-[44px]"
                      style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
                    >
                      <option value="observacao">Observacao</option>
                      <option value="positiva">Positiva</option>
                      <option value="comportamento">Comportamento</option>
                      <option value="disciplina">Disciplina</option>
                      <option value="seguranca">Seguranca</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>Gravidade</label>
                    <select
                      value={novaOcorrencia.gravidade}
                      onChange={(e) => setNovaOcorrencia((p) => ({ ...p, gravidade: e.target.value as Ocorrencia['gravidade'] }))}
                      className="w-full rounded-lg px-3 py-2 text-sm min-h-[44px]"
                      style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
                    >
                      <option value="leve">Leve</option>
                      <option value="moderada">Moderada</option>
                      <option value="grave">Grave</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>Descricao</label>
                  <textarea
                    value={novaOcorrencia.descricao}
                    onChange={(e) => setNovaOcorrencia((p) => ({ ...p, descricao: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 text-sm"
                    rows={3}
                    style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)', resize: 'vertical' }}
                    placeholder="Descreva a ocorrencia..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>Acao tomada</label>
                  <textarea
                    value={novaOcorrencia.acaoTomada}
                    onChange={(e) => setNovaOcorrencia((p) => ({ ...p, acaoTomada: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 text-sm"
                    rows={2}
                    style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)', resize: 'vertical' }}
                    placeholder="Que acao foi tomada?"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={novaOcorrencia.responsavelNotificado}
                    onChange={(e) => setNovaOcorrencia((p) => ({ ...p, responsavelNotificado: e.target.checked }))}
                    className="h-4 w-4 rounded"
                    style={{ accentColor: 'var(--bb-brand)' }}
                  />
                  <span className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>Notificar responsavel</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOcorrenciaModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium min-h-[44px]"
                  style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateOcorrencia}
                  className="rounded-lg px-4 py-2 text-sm font-semibold min-h-[44px]"
                  style={{ background: 'var(--bb-brand)', color: '#fff' }}
                >
                  Registrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PlanGate>
  );
}

// ════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════════════════════════════

// ── Turma Health Card ──────────────────────────────────────────────

function TurmaHealthCard({ turma }: { turma: SaudeTurma }) {
  return (
    <div
      className="rounded-lg p-3"
      style={{ background: 'var(--bb-depth-3)', borderLeft: `3px solid ${scoreColor(turma.score)}` }}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--bb-ink-100)' }}>{turma.turmaNome}</p>
          <p className="text-[11px]" style={{ color: 'var(--bb-ink-40)' }}>{turma.professorNome}</p>
        </div>
        <span
          className="ml-2 rounded-full px-2 py-0.5 text-xs font-bold"
          style={{ background: scoreBg(turma.score), color: scoreColor(turma.score) }}
        >
          {turma.score}
        </span>
      </div>
      <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
        Presenca {turma.presencaMedia}% &middot; {turma.alunos} alunos
      </p>
    </div>
  );
}

// ── Professor Card ─────────────────────────────────────────────────

function ProfessorCard({
  professor,
  analise,
  expanded,
  onToggle,
}: {
  professor: RankingProfessor;
  analise: AnaliseProfessor | undefined;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="overflow-hidden"
      style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}
    >
      {/* Main row */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-[var(--bb-depth-3)]"
      >
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ background: scoreColor(professor.score) }}
          >
            {professor.score}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{professor.professorNome}</p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{professor.faixa}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden gap-4 text-center sm:flex">
            <div>
              <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Turmas</p>
              <p className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>{professor.turmas}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Alunos</p>
              <p className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>{professor.alunosTotal}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Presenca</p>
              <p className="text-sm font-bold" style={{ color: scoreColor(professor.presencaMediaTurmas) }}>{professor.presencaMediaTurmas}%</p>
            </div>
          </div>
          <ChevronDownIcon
            className="h-5 w-5 transition-transform"
            style={{
              color: 'var(--bb-ink-40)',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="space-y-4 px-5 pb-5" style={{ borderTop: '1px solid var(--bb-glass-border)', paddingTop: '16px' }}>
          {/* Alerts */}
          {professor.alertas.length > 0 && (
            <div className="space-y-1">
              {professor.alertas.map((a, i) => (
                <p key={i} className="flex items-center gap-1.5 text-xs" style={{ color: '#F59E0B' }}>
                  <AlertTriangleIcon className="h-3 w-3 flex-shrink-0" />
                  {a}
                </p>
              ))}
            </div>
          )}

          {analise ? (
            <>
              {/* Pontos Fortes */}
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase" style={{ color: '#22C55E' }}>Pontos Fortes</p>
                <div className="space-y-1">
                  {analise.pontosFortes.map((p, i) => (
                    <p key={i} className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>&bull; {p}</p>
                  ))}
                </div>
              </div>

              {/* Pontos a Melhorar */}
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase" style={{ color: '#F59E0B' }}>Pontos a Melhorar</p>
                <div className="space-y-1">
                  {analise.pontosAMelhorar.map((p, i) => (
                    <p key={i} className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>&bull; {p}</p>
                  ))}
                </div>
              </div>

              {/* Acoes Sugeridas */}
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase" style={{ color: 'var(--bb-brand)' }}>Acoes Sugeridas</p>
                <div className="space-y-1">
                  {analise.acoesSugeridas.map((a, i) => (
                    <p key={i} className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>&bull; {a}</p>
                  ))}
                </div>
              </div>

              {/* Comparativo Chart */}
              {analise.comparativo.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase" style={{ color: 'var(--bb-ink-40)' }}>Comparativo vs Media da Academia</p>
                  <div style={{ height: '220px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analise.comparativo.map((c) => ({
                          metrica: c.metrica.length > 15 ? c.metrica.slice(0, 15) + '...' : c.metrica,
                          Professor: c.valor,
                          Academia: c.mediaAcademia,
                        }))}
                        margin={{ top: 5, right: 10, bottom: 5, left: 0 }}
                      >
                        <XAxis dataKey="metrica" tick={{ fill: 'var(--bb-ink-40)', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'var(--bb-ink-40)', fontSize: 10 }} axisLine={false} tickLine={false} width={35} />
                        <Tooltip contentStyle={chartTooltipStyle} />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Bar dataKey="Professor" fill="var(--bb-brand)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Academia" fill="var(--bb-ink-20)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-2">
              <Skeleton variant="text" className="h-4 w-64" />
              <Skeleton variant="text" className="h-4 w-48" />
              <Skeleton variant="card" className="h-40" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  listRelatorios,
  getRelatorioMetricas,
} from '@/lib/api/relatorio-aula.service';
import type {
  RelatorioAula,
  RelatorioMetricas,
} from '@/lib/api/relatorio-aula.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import {
  BarChartIcon,
  SearchIcon,
  FilterIcon,
  UsersIcon,
  CalendarIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ClockIcon,
} from '@/components/shell/icons';
import { translateError } from '@/lib/utils/error-translator';

// ── Helpers ───────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function presencaColor(taxa: number): string {
  if (taxa >= 80) return 'var(--bb-success)';
  if (taxa >= 60) return 'var(--bb-warning)';
  return 'var(--bb-error)';
}

// ── Turma filter options (mock) ──────────────────────────────────────
const TURMAS_FILTER = [
  { id: '', label: 'Todas as turmas' },
  { id: 'turma-1', label: 'BJJ Fundamentos' },
  { id: 'turma-2', label: 'BJJ All Levels' },
  { id: 'turma-3', label: 'Judo Adulto' },
  { id: 'turma-4', label: 'BJJ Avancado' },
];

const PERIODOS = [
  { id: '', label: 'Todo periodo' },
  { id: '7d', label: 'Ultimos 7 dias' },
  { id: '30d', label: 'Ultimos 30 dias' },
  { id: '90d', label: 'Ultimos 90 dias' },
];

// ── Loading skeleton ─────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="min-h-screen p-4 sm:p-6 space-y-6">
      {/* Header skeleton */}
      <Skeleton variant="text" className="h-8 w-56" />
      <Skeleton variant="text" className="h-4 w-36" />

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="card" className="h-24" />
        ))}
      </div>

      {/* Filter skeleton */}
      <div className="flex gap-3">
        <Skeleton variant="text" className="h-11 w-48" />
        <Skeleton variant="text" className="h-11 w-40" />
      </div>

      {/* Cards skeleton */}
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} variant="card" className="h-28" />
      ))}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────
export default function ProfessorRelatoriosPage() {
  const { toast } = useToast();

  const [relatorios, setRelatorios] = useState<RelatorioAula[]>([]);
  const [metricas, setMetricas] = useState<RelatorioMetricas | null>(null);
  const [loading, setLoading] = useState(true);

  const [filtroTurma, setFiltroTurma] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState('');
  const [busca, setBusca] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filtros: { turmaId?: string; periodo?: string } = {};
      if (filtroTurma) filtros.turmaId = filtroTurma;
      if (filtroPeriodo) filtros.periodo = filtroPeriodo;

      const [relData, metData] = await Promise.all([
        listRelatorios('prof-1', filtros),
        getRelatorioMetricas('prof-1'),
      ]);
      setRelatorios(relData);
      setMetricas(metData);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [filtroTurma, filtroPeriodo, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // Filter by search text
  const filtered = relatorios.filter((r) => {
    if (!busca) return true;
    const term = busca.toLowerCase();
    return (
      r.turmaNome.toLowerCase().includes(term) ||
      r.modalidade.toLowerCase().includes(term) ||
      (r.temaAula ?? '').toLowerCase().includes(term)
    );
  });

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bb-depth-1)' }}>
      <div className="mx-auto max-w-2xl space-y-6 px-4 pt-6 sm:px-6">
        {/* ── Header ──────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2">
            <BarChartIcon className="h-6 w-6" style={{ color: 'var(--bb-brand)' }} />
            <h1
              className="text-2xl font-extrabold"
              style={{ color: 'var(--bb-ink-100)' }}
            >
              Relatorios Pos-Aula
            </h1>
          </div>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
            Acompanhe presenca, destaques e dificuldades de cada aula
          </p>
        </section>

        {/* ── Summary Stats (4 cards) ─────────────────────────── */}
        {metricas && (
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Aulas este mes */}
            <div
              className="flex flex-col items-center justify-center gap-1 p-4"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                borderRadius: 'var(--bb-radius-lg)',
                boxShadow: 'var(--bb-shadow-sm)',
              }}
            >
              <CalendarIcon
                className="h-5 w-5"
                style={{ color: 'var(--bb-info)' }}
              />
              <span
                className="text-2xl font-bold"
                style={{ color: 'var(--bb-ink-100)' }}
              >
                {metricas.aulasEsteMes}
              </span>
              <span className="text-[11px]" style={{ color: 'var(--bb-ink-40)' }}>
                Aulas este mes
              </span>
            </div>

            {/* Media presenca */}
            <div
              className="flex flex-col items-center justify-center gap-1 p-4"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                borderRadius: 'var(--bb-radius-lg)',
                boxShadow: 'var(--bb-shadow-sm)',
              }}
            >
              <UsersIcon
                className="h-5 w-5"
                style={{ color: presencaColor(metricas.mediaPresenca) }}
              />
              <span
                className="text-2xl font-bold"
                style={{ color: 'var(--bb-ink-100)' }}
              >
                {metricas.mediaPresenca}%
              </span>
              <span className="text-[11px]" style={{ color: 'var(--bb-ink-40)' }}>
                Media presenca
              </span>
            </div>

            {/* Melhor turma */}
            <div
              className="flex flex-col items-center justify-center gap-1 p-4"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                borderRadius: 'var(--bb-radius-lg)',
                boxShadow: 'var(--bb-shadow-sm)',
              }}
            >
              <TrendingUpIcon
                className="h-5 w-5"
                style={{ color: 'var(--bb-success)' }}
              />
              <span
                className="text-lg font-bold leading-tight text-center"
                style={{ color: 'var(--bb-ink-100)' }}
              >
                {metricas.melhorTurma.presenca}%
              </span>
              <span
                className="text-[11px] text-center truncate w-full"
                style={{ color: 'var(--bb-ink-40)' }}
              >
                {metricas.melhorTurma.nome}
              </span>
            </div>

            {/* Aluno mais frequente */}
            <div
              className="flex flex-col items-center justify-center gap-1 p-4"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                borderRadius: 'var(--bb-radius-lg)',
                boxShadow: 'var(--bb-shadow-sm)',
              }}
            >
              <CheckCircleIcon
                className="h-5 w-5"
                style={{ color: 'var(--bb-success)' }}
              />
              <span
                className="text-lg font-bold leading-tight text-center"
                style={{ color: 'var(--bb-ink-100)' }}
              >
                {metricas.alunoMaisFrequente.presenca}%
              </span>
              <span
                className="text-[11px] text-center truncate w-full"
                style={{ color: 'var(--bb-ink-40)' }}
              >
                {metricas.alunoMaisFrequente.nome}
              </span>
            </div>
          </section>
        )}

        {/* ── Filter Row ──────────────────────────────────────── */}
        <section className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div
            className="relative flex-1"
          >
            <SearchIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: 'var(--bb-ink-40)' }}
            />
            <input
              type="text"
              placeholder="Buscar por turma ou tema..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="min-h-[44px] w-full rounded-lg pl-9 pr-3 text-sm outline-none"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-100)',
              }}
            />
          </div>

          {/* Turma filter */}
          <div className="relative">
            <FilterIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: 'var(--bb-ink-40)' }}
            />
            <select
              value={filtroTurma}
              onChange={(e) => setFiltroTurma(e.target.value)}
              className="min-h-[44px] appearance-none rounded-lg pl-9 pr-8 text-sm outline-none"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-100)',
              }}
            >
              {TURMAS_FILTER.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Period filter */}
          <div className="relative">
            <ClockIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: 'var(--bb-ink-40)' }}
            />
            <select
              value={filtroPeriodo}
              onChange={(e) => setFiltroPeriodo(e.target.value)}
              className="min-h-[44px] appearance-none rounded-lg pl-9 pr-8 text-sm outline-none"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-100)',
              }}
            >
              {PERIODOS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* ── Report count ────────────────────────────────────── */}
        <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
          {filtered.length} relatorio{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* ── Report Cards ────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-2 py-16"
          >
            <BarChartIcon className="h-10 w-10" style={{ color: 'var(--bb-ink-20)' }} />
            <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
              Nenhum relatorio encontrado
            </p>
          </div>
        ) : (
          <section className="space-y-3">
            {filtered.map((rel) => {
              const isExpanded = expandedIds.has(rel.id);
              const pColor = presencaColor(rel.taxaPresenca);

              return (
                <div
                  key={rel.id}
                  style={{
                    background: 'var(--bb-depth-2)',
                    border: '1px solid var(--bb-glass-border)',
                    borderRadius: 'var(--bb-radius-lg)',
                    boxShadow: 'var(--bb-shadow-sm)',
                    overflow: 'hidden',
                  }}
                >
                  {/* ── Card Header (clickable) ──────────── */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(rel.id)}
                    className="flex w-full items-center gap-3 p-4 text-left min-h-[44px] transition-colors"
                    style={{ background: 'transparent' }}
                  >
                    {/* Left: date + turma */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <CalendarIcon
                          className="h-4 w-4 flex-shrink-0"
                          style={{ color: 'var(--bb-ink-40)' }}
                        />
                        <span
                          className="text-xs"
                          style={{ color: 'var(--bb-ink-60)' }}
                        >
                          {formatDate(rel.data)} - {rel.horario}
                        </span>
                      </div>
                      <h3
                        className="mt-1 text-sm font-semibold truncate"
                        style={{ color: 'var(--bb-ink-100)' }}
                      >
                        {rel.turmaNome}
                      </h3>
                      <span
                        className="text-xs"
                        style={{ color: 'var(--bb-ink-40)' }}
                      >
                        {rel.modalidade}
                        {rel.temaAula ? ` - ${rel.temaAula}` : ''}
                      </span>
                    </div>

                    {/* Center: Presenca bar + percentage */}
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span
                        className="text-lg font-bold"
                        style={{ color: pColor }}
                      >
                        {rel.taxaPresenca}%
                      </span>
                      {/* Mini progress bar */}
                      <div
                        className="h-1.5 w-16 overflow-hidden"
                        style={{
                          background: 'var(--bb-depth-4)',
                          borderRadius: 'var(--bb-radius-full)',
                        }}
                      >
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${Math.min(rel.taxaPresenca, 100)}%`,
                            background: pColor,
                            borderRadius: 'var(--bb-radius-full)',
                          }}
                        />
                      </div>
                      {/* Comparatives */}
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-0.5 text-[10px]">
                          {rel.presencaVsMediaTurma >= 0 ? (
                            <TrendingUpIcon
                              className="h-3 w-3"
                              style={{ color: 'var(--bb-success)' }}
                            />
                          ) : (
                            <TrendingDownIcon
                              className="h-3 w-3"
                              style={{ color: 'var(--bb-error)' }}
                            />
                          )}
                          <span
                            style={{
                              color:
                                rel.presencaVsMediaTurma >= 0
                                  ? 'var(--bb-success)'
                                  : 'var(--bb-error)',
                            }}
                          >
                            {rel.presencaVsMediaTurma > 0 ? '+' : ''}
                            {rel.presencaVsMediaTurma}% media
                          </span>
                        </span>
                        <span className="flex items-center gap-0.5 text-[10px]">
                          {rel.presencaVsAulaAnterior >= 0 ? (
                            <TrendingUpIcon
                              className="h-3 w-3"
                              style={{ color: 'var(--bb-success)' }}
                            />
                          ) : (
                            <TrendingDownIcon
                              className="h-3 w-3"
                              style={{ color: 'var(--bb-error)' }}
                            />
                          )}
                          <span
                            style={{
                              color:
                                rel.presencaVsAulaAnterior >= 0
                                  ? 'var(--bb-success)'
                                  : 'var(--bb-error)',
                            }}
                          >
                            {rel.presencaVsAulaAnterior > 0 ? '+' : ''}
                            {rel.presencaVsAulaAnterior}% ant.
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Chevron */}
                    {isExpanded ? (
                      <ChevronDownIcon
                        className="h-5 w-5 flex-shrink-0"
                        style={{ color: 'var(--bb-ink-40)' }}
                      />
                    ) : (
                      <ChevronRightIcon
                        className="h-5 w-5 flex-shrink-0"
                        style={{ color: 'var(--bb-ink-40)' }}
                      />
                    )}
                  </button>

                  {/* ── Expanded Detail ──────────────────── */}
                  {isExpanded && (
                    <div
                      className="space-y-4 px-4 pb-4"
                      style={{
                        borderTop: '1px solid var(--bb-glass-border)',
                      }}
                    >
                      {/* Meta info */}
                      <div
                        className="mt-4 flex flex-wrap gap-3 text-xs"
                        style={{ color: 'var(--bb-ink-60)' }}
                      >
                        <span className="flex items-center gap-1">
                          <UsersIcon className="h-3.5 w-3.5" />
                          {rel.totalPresentes}/{rel.totalMatriculados} presentes
                        </span>
                        {rel.tipoAula && (
                          <span className="flex items-center gap-1">
                            <BarChartIcon className="h-3.5 w-3.5" />
                            {rel.tipoAula}
                          </span>
                        )}
                        {rel.intensidade && (
                          <span className="flex items-center gap-1">
                            <TrendingUpIcon className="h-3.5 w-3.5" />
                            Intensidade: {rel.intensidade}
                          </span>
                        )}
                      </div>

                      {/* Tecnicas */}
                      {rel.tecnicasEnsinadas && rel.tecnicasEnsinadas.length > 0 && (
                        <div>
                          <p
                            className="mb-1.5 text-xs font-semibold uppercase tracking-wider"
                            style={{ color: 'var(--bb-ink-40)' }}
                          >
                            Tecnicas ensinadas
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {rel.tecnicasEnsinadas.map((t) => (
                              <span
                                key={t}
                                className="rounded-full px-2.5 py-1 text-xs"
                                style={{
                                  background: 'var(--bb-brand-surface)',
                                  color: 'var(--bb-brand)',
                                }}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Presentes */}
                      {rel.alunosPresentes.length > 0 && (
                        <div>
                          <p
                            className="mb-1.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-1"
                            style={{ color: 'var(--bb-success)' }}
                          >
                            <CheckCircleIcon className="h-3.5 w-3.5" />
                            Presentes ({rel.alunosPresentes.length})
                          </p>
                          <div className="space-y-1">
                            {rel.alunosPresentes.map((a) => (
                              <div
                                key={a.nome}
                                className="flex items-center gap-2 rounded-md px-3 py-2 min-h-[44px]"
                                style={{ background: 'var(--bb-depth-3)' }}
                              >
                                <span
                                  className="flex-1 text-sm"
                                  style={{ color: 'var(--bb-ink-100)' }}
                                >
                                  {a.nome}
                                </span>
                                <span
                                  className="text-xs"
                                  style={{ color: 'var(--bb-ink-40)' }}
                                >
                                  {a.faixa}
                                </span>
                                <span
                                  className="rounded-full px-2 py-0.5 text-[10px]"
                                  style={{
                                    background: 'var(--bb-depth-4)',
                                    color: 'var(--bb-ink-60)',
                                  }}
                                >
                                  {a.metodoCheckin}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Ausentes */}
                      {rel.alunosAusentes.length > 0 && (
                        <div>
                          <p
                            className="mb-1.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-1"
                            style={{ color: 'var(--bb-error)' }}
                          >
                            <AlertTriangleIcon className="h-3.5 w-3.5" />
                            Ausentes ({rel.alunosAusentes.length})
                          </p>
                          <div className="space-y-1">
                            {rel.alunosAusentes.map((a) => (
                              <div
                                key={a.nome}
                                className="flex items-center gap-2 rounded-md px-3 py-2 min-h-[44px]"
                                style={{ background: 'var(--bb-depth-3)' }}
                              >
                                <span
                                  className="flex-1 text-sm"
                                  style={{ color: 'var(--bb-ink-100)' }}
                                >
                                  {a.nome}
                                </span>
                                <span
                                  className="text-xs"
                                  style={{ color: 'var(--bb-ink-40)' }}
                                >
                                  {a.faixa}
                                </span>
                                {a.diasDesdeUltimoTreino > 7 && (
                                  <span
                                    className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium"
                                    style={{
                                      background: 'rgba(239,68,68,0.12)',
                                      color: 'var(--bb-error)',
                                    }}
                                  >
                                    <AlertTriangleIcon className="h-3 w-3" />
                                    {a.diasDesdeUltimoTreino}d sem treino
                                  </span>
                                )}
                                {a.diasDesdeUltimoTreino > 0 &&
                                  a.diasDesdeUltimoTreino <= 7 && (
                                    <span
                                      className="rounded-full px-2 py-0.5 text-[10px]"
                                      style={{
                                        background: 'rgba(234,179,8,0.12)',
                                        color: 'var(--bb-warning)',
                                      }}
                                    >
                                      {a.diasDesdeUltimoTreino}d sem treino
                                    </span>
                                  )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Destaques */}
                      {rel.destaques && rel.destaques.length > 0 && (
                        <div>
                          <p
                            className="mb-1.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-1"
                            style={{ color: 'var(--bb-brand)' }}
                          >
                            <TrendingUpIcon className="h-3.5 w-3.5" />
                            Destaques
                          </p>
                          <div className="space-y-1">
                            {rel.destaques.map((d) => (
                              <div
                                key={`${d.aluno}-${d.motivo}`}
                                className="flex items-start gap-2 rounded-md px-3 py-2"
                                style={{
                                  background: 'var(--bb-brand-surface)',
                                }}
                              >
                                <CheckCircleIcon
                                  className="mt-0.5 h-4 w-4 flex-shrink-0"
                                  style={{ color: 'var(--bb-brand)' }}
                                />
                                <div className="min-w-0">
                                  <span
                                    className="text-sm font-medium"
                                    style={{ color: 'var(--bb-ink-100)' }}
                                  >
                                    {d.aluno}
                                  </span>
                                  <p
                                    className="text-xs"
                                    style={{ color: 'var(--bb-ink-60)' }}
                                  >
                                    {d.motivo}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Dificuldades */}
                      {rel.dificuldades && rel.dificuldades.length > 0 && (
                        <div>
                          <p
                            className="mb-1.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-1"
                            style={{ color: 'var(--bb-warning)' }}
                          >
                            <AlertTriangleIcon className="h-3.5 w-3.5" />
                            Dificuldades
                          </p>
                          <div className="space-y-1">
                            {rel.dificuldades.map((d) => (
                              <div
                                key={`${d.aluno}-${d.observacao}`}
                                className="flex items-start gap-2 rounded-md px-3 py-2"
                                style={{
                                  background: 'rgba(234,179,8,0.08)',
                                }}
                              >
                                <AlertTriangleIcon
                                  className="mt-0.5 h-4 w-4 flex-shrink-0"
                                  style={{ color: 'var(--bb-warning)' }}
                                />
                                <div className="min-w-0">
                                  <span
                                    className="text-sm font-medium"
                                    style={{ color: 'var(--bb-ink-100)' }}
                                  >
                                    {d.aluno}
                                  </span>
                                  <p
                                    className="text-xs"
                                    style={{ color: 'var(--bb-ink-60)' }}
                                  >
                                    {d.observacao}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Observacoes */}
                      {rel.observacoes && (
                        <div>
                          <p
                            className="mb-1.5 text-xs font-semibold uppercase tracking-wider"
                            style={{ color: 'var(--bb-ink-40)' }}
                          >
                            Observacoes
                          </p>
                          <p
                            className="text-sm leading-relaxed rounded-md px-3 py-2"
                            style={{
                              background: 'var(--bb-depth-3)',
                              color: 'var(--bb-ink-80)',
                            }}
                          >
                            {rel.observacoes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}

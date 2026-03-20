'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import {
  getHealthOverview,
  listAcademiaHealthScores,
} from '@/lib/api/superadmin-health.service';
import type {
  HealthOverview,
  AcademiaHealthScore,
  HealthFator,
} from '@/lib/api/superadmin-health.service';
import {
  SearchIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@/components/shell/icons';
import { translateError } from '@/lib/utils/error-translator';

// -- Constants ----------------------------------------------------------------

const GREEN = '#22c55e';
const AMBER = '#f59e0b';
const RED = '#ef4444';
const BLUE = '#3b82f6';

const cardStyle = {
  background: 'var(--bb-depth-3)',
  border: '1px solid var(--bb-glass-border)',
  boxShadow: 'var(--bb-shadow-sm)',
};

const inputStyle = {
  background: 'var(--bb-depth-2)',
  border: '1px solid var(--bb-glass-border)',
  borderRadius: 'var(--bb-radius-md)',
  color: 'var(--bb-ink-100)',
  fontSize: 14,
};

// -- Helpers ------------------------------------------------------------------

function getScoreColor(score: number): string {
  if (score >= 80) return GREEN;
  if (score >= 60) return AMBER;
  return RED;
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Saudavel';
  if (score >= 60) return 'Atencao';
  return 'Critico';
}

function getTrendIcon(tendencia: AcademiaHealthScore['tendencia']) {
  switch (tendencia) {
    case 'subindo':
      return { icon: ArrowUpIcon, color: GREEN, label: 'Subindo' };
    case 'caindo':
      return { icon: ArrowDownIcon, color: RED, label: 'Caindo' };
    default:
      return { icon: null, color: 'var(--bb-ink-40)', label: 'Estavel' };
  }
}

function getFatorStatusColor(valor: number): string {
  if (valor >= 80) return GREEN;
  if (valor >= 60) return AMBER;
  return RED;
}

type SortDirection = 'asc' | 'desc';

// -- Component ----------------------------------------------------------------

export default function SuperAdminHealthPage() {
  const { toast } = useToast();

  const [overview, setOverview] = useState<HealthOverview | null>(null);
  const [academias, setAcademias] = useState<AcademiaHealthScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // -- Data Loading -----------------------------------------------------------

  const loadData = useCallback(async () => {
    try {
      const [ov, scores] = await Promise.all([
        getHealthOverview(),
        listAcademiaHealthScores(),
      ]);
      setOverview(ov);
      setAcademias(scores);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // -- Derived data -----------------------------------------------------------

  const filteredAndSorted = useMemo(() => {
    let result = academias;

    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter((a) =>
        a.academiaNome.toLowerCase().includes(term),
      );
    }

    result = [...result].sort((a, b) =>
      sortDir === 'asc' ? a.score - b.score : b.score - a.score,
    );

    return result;
  }, [academias, search, sortDir]);

  const criticalCount = useMemo(
    () => academias.filter((a) => a.score < 60).length,
    [academias],
  );

  const warningCount = useMemo(
    () => academias.filter((a) => a.score >= 60 && a.score < 80).length,
    [academias],
  );

  // -- Toggle expand ----------------------------------------------------------

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  // -- Toggle sort ------------------------------------------------------------

  const toggleSort = useCallback(() => {
    setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  // -- Skeleton ---------------------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton variant="text" className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-24" />
          ))}
        </div>
        <Skeleton variant="text" className="h-10 w-full" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <div>
        <h1
          className="font-bold"
          style={{ fontSize: 28, color: 'var(--bb-ink-100)' }}
        >
          Health Score das Academias
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Visao geral da saude de todas as academias na plataforma
        </p>
      </div>

      {/* ── SUMMARY CARDS ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Average Score */}
        <div className="rounded-xl p-4" style={cardStyle}>
          <div className="mb-2 flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: `${BLUE}18` }}
            >
              <CheckCircleIcon className="h-4 w-4" style={{ color: BLUE }} />
            </div>
            <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
              Score Medio
            </span>
          </div>
          <p className="text-2xl font-bold" style={{ color: overview ? getScoreColor(overview.mediaGeral) : BLUE }}>
            {overview?.mediaGeral.toFixed(1) ?? '--'}
          </p>
        </div>

        {/* Critical */}
        <div className="rounded-xl p-4" style={cardStyle}>
          <div className="mb-2 flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: `${RED}18` }}
            >
              <AlertTriangleIcon className="h-4 w-4" style={{ color: RED }} />
            </div>
            <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
              Criticas (&lt;60)
            </span>
          </div>
          <p className="text-2xl font-bold" style={{ color: RED }}>
            {criticalCount}
          </p>
        </div>

        {/* Warning */}
        <div className="rounded-xl p-4" style={cardStyle}>
          <div className="mb-2 flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: `${AMBER}18` }}
            >
              <AlertTriangleIcon className="h-4 w-4" style={{ color: AMBER }} />
            </div>
            <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
              Atencao (60-79)
            </span>
          </div>
          <p className="text-2xl font-bold" style={{ color: AMBER }}>
            {warningCount}
          </p>
        </div>
      </div>

      {/* ── SEARCH + SORT ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <SearchIcon
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: 'var(--bb-ink-40)' }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar academia..."
            className="h-10 w-full pl-10 pr-3 text-sm outline-none"
            style={inputStyle}
          />
        </div>

        <button
          onClick={toggleSort}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            color: 'var(--bb-ink-60)',
          }}
        >
          Score
          {sortDir === 'desc' ? (
            <ArrowDownIcon className="h-3.5 w-3.5" />
          ) : (
            <ArrowUpIcon className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* ── ACADEMIA LIST ───────────────────────────────────────────── */}
      <div className="space-y-3">
        {filteredAndSorted.length === 0 && (
          <div className="rounded-xl py-12 text-center" style={cardStyle}>
            <p style={{ color: 'var(--bb-ink-40)' }}>
              Nenhuma academia encontrada.
            </p>
          </div>
        )}

        {filteredAndSorted.map((academia) => {
          const scoreColor = getScoreColor(academia.score);
          const scoreLabel = getScoreLabel(academia.score);
          const trend = getTrendIcon(academia.tendencia);
          const TrendIcon = trend.icon;
          const isExpanded = expandedId === academia.academiaId;

          return (
            <div
              key={academia.academiaId}
              className="overflow-hidden rounded-xl"
              style={{
                ...cardStyle,
                borderLeft: `4px solid ${scoreColor}`,
              }}
            >
              {/* Main row — clickable */}
              <button
                onClick={() => toggleExpand(academia.academiaId)}
                className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-[var(--bb-depth-4)]/50"
              >
                {/* Score badge */}
                <div
                  className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg"
                  style={{ background: `${scoreColor}15` }}
                >
                  <span
                    className="text-lg font-bold leading-none"
                    style={{ color: scoreColor }}
                  >
                    {academia.score}
                  </span>
                  <span
                    className="text-[9px] font-medium"
                    style={{ color: scoreColor }}
                  >
                    {scoreLabel}
                  </span>
                </div>

                {/* Academy info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: 'var(--bb-ink-100)' }}
                    >
                      {academia.academiaNome}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        background: 'var(--bb-depth-5)',
                        color: 'var(--bb-ink-60)',
                      }}
                    >
                      {academia.plano}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    <span>{academia.alunosAtivos}/{academia.alunosTotal} alunos ativos</span>
                    <span>{academia.mesesNaPlataforma} meses</span>
                    {TrendIcon && (
                      <span className="flex items-center gap-0.5" style={{ color: trend.color }}>
                        <TrendIcon className="h-3 w-3" />
                        {trend.label}
                      </span>
                    )}
                    {!TrendIcon && (
                      <span style={{ color: trend.color }}>{trend.label}</span>
                    )}
                  </div>
                </div>

                {/* Expand chevron */}
                {isExpanded ? (
                  <ChevronDownIcon className="h-5 w-5 shrink-0" style={{ color: 'var(--bb-ink-40)' }} />
                ) : (
                  <ChevronRightIcon className="h-5 w-5 shrink-0" style={{ color: 'var(--bb-ink-40)' }} />
                )}
              </button>

              {/* Expanded factors */}
              {isExpanded && (
                <div
                  className="border-t px-4 pb-4 pt-3"
                  style={{ borderColor: 'var(--bb-glass-border)' }}
                >
                  {/* Factors table */}
                  <p
                    className="mb-2 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--bb-ink-40)' }}
                  >
                    Fatores de Saude
                  </p>
                  <div className="space-y-2">
                    {academia.fatores.map((fator: HealthFator) => {
                      const fatorColor = getFatorStatusColor(fator.valor);
                      return (
                        <div key={fator.nome}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                              {fator.nome}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
                                peso {fator.peso}x
                              </span>
                              <span
                                className="text-xs font-bold"
                                style={{ color: fatorColor }}
                              >
                                {fator.valor}
                              </span>
                            </div>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--bb-depth-5)]">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(fator.valor, 100)}%`,
                                background: fatorColor,
                              }}
                            />
                          </div>
                          {fator.detalhe && (
                            <p className="mt-0.5 text-[10px]" style={{ color: 'var(--bb-ink-30)' }}>
                              {fator.detalhe}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Extra info */}
                  <div
                    className="mt-3 grid grid-cols-2 gap-2 rounded-lg p-3 sm:grid-cols-4"
                    style={{ background: 'var(--bb-depth-2)' }}
                  >
                    <div>
                      <p className="text-[10px] uppercase" style={{ color: 'var(--bb-ink-40)' }}>Inadimplencia</p>
                      <p className="text-sm font-semibold" style={{ color: academia.inadimplencia > 15 ? RED : 'var(--bb-ink-100)' }}>
                        {academia.inadimplencia.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase" style={{ color: 'var(--bb-ink-40)' }}>Features</p>
                      <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                        {academia.featuresUsadas.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase" style={{ color: 'var(--bb-ink-40)' }}>Ultimo Login</p>
                      <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                        {new Date(academia.ultimoLoginAdmin).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase" style={{ color: 'var(--bb-ink-40)' }}>Meses</p>
                      <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                        {academia.mesesNaPlataforma}
                      </p>
                    </div>
                  </div>

                  {/* Recommendation */}
                  {academia.recomendacao && (
                    <div
                      className="mt-3 rounded-lg p-3"
                      style={{
                        background: `${BLUE}08`,
                        border: `1px solid ${BLUE}20`,
                      }}
                    >
                      <p className="text-[10px] font-semibold uppercase" style={{ color: BLUE }}>
                        Recomendacao
                      </p>
                      <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-80)' }}>
                        {academia.recomendacao}
                      </p>
                    </div>
                  )}

                  {/* Features used */}
                  {academia.featuresUsadas.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-1 text-[10px] uppercase" style={{ color: 'var(--bb-ink-40)' }}>
                        Features Utilizadas
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {academia.featuresUsadas.map((feature) => (
                          <span
                            key={feature}
                            className="rounded px-1.5 py-0.5 text-[10px]"
                            style={{
                              background: `${GREEN}12`,
                              color: GREEN,
                            }}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

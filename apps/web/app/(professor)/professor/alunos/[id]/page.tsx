'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getAluno360, addNotaAluno } from '@/lib/api/professor-aluno360.service';
import type { Aluno360 } from '@/lib/api/professor-aluno360.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import {
  UserIcon,
  CalendarIcon,
  AwardIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  HeartIcon,
  ClockIcon,
  ChevronRightIcon,
  StarIcon,
  CheckCircleIcon,
  XIcon,
  EditIcon,
  MessageIcon,
  UsersIcon,
  ShieldIcon,
} from '@/components/shell/icons';
import { translateError } from '@/lib/utils/error-translator';

// ── Constants ───────────────────────────────────────────────────────

const BELT_COLORS: Record<string, string> = {
  white: '#F5F5F5',
  gray: '#9CA3AF',
  yellow: '#EAB308',
  orange: '#EA580C',
  green: '#16A34A',
  blue: '#2563EB',
  purple: '#9333EA',
  brown: '#92400E',
  black: '#0A0A0A',
};

const BELT_LABEL: Record<string, string> = {
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

const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

type TabKey = 'jornada' | 'presenca' | 'avaliacao' | 'notas' | 'info';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'jornada', label: 'Jornada' },
  { key: 'presenca', label: 'Presenca' },
  { key: 'avaliacao', label: 'Avaliacao' },
  { key: 'notas', label: 'Notas' },
  { key: 'info', label: 'Info' },
];

const NOTA_TIPO_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  observacao: {
    label: 'Observacao',
    bg: 'var(--bb-info-surface)',
    text: 'var(--bb-info)',
  },
  destaque: {
    label: 'Destaque',
    bg: 'var(--bb-success-surface)',
    text: 'var(--bb-success)',
  },
  atencao: {
    label: 'Atencao',
    bg: 'var(--bb-warning-surface)',
    text: 'var(--bb-warning)',
  },
  restricao: {
    label: 'Restricao',
    bg: 'var(--bb-error-surface)',
    text: 'var(--bb-error)',
  },
};

const SITUACAO_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  em_dia: {
    label: 'Em dia',
    bg: 'var(--bb-success-surface)',
    text: 'var(--bb-success)',
  },
  atrasado: {
    label: 'Atrasado',
    bg: 'var(--bb-warning-surface)',
    text: 'var(--bb-warning)',
  },
  inadimplente: {
    label: 'Inadimplente',
    bg: 'var(--bb-error-surface)',
    text: 'var(--bb-error)',
  },
};

// ── SVG Radar Chart (dynamic axes from criterios) ───────────────────

interface DynamicRadarChartProps {
  criterios: { slug: string; nome: string; nota: number }[];
  maxNota?: number;
  size?: number;
}

function DynamicRadarChart({
  criterios,
  maxNota = 10,
  size = 240,
}: DynamicRadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.34;
  const n = criterios.length;
  if (n < 3) return null;

  const angles = criterios.map(
    (_, i) => (Math.PI * 2 * i) / n - Math.PI / 2,
  );

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const polygonPoints = criterios
    .map((c, i) => {
      const r = (c.nota / maxNota) * maxRadius;
      const x = cx + r * Math.cos(angles[i]);
      const y = cy + r * Math.sin(angles[i]);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto"
    >
      {/* Grid polygons */}
      {gridLevels.map((level) => {
        const r = level * maxRadius;
        const points = angles
          .map((a) => `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`)
          .join(' ');
        return (
          <polygon
            key={level}
            points={points}
            fill="none"
            stroke="var(--bb-glass-border)"
            strokeWidth="1"
          />
        );
      })}

      {/* Axis lines */}
      {angles.map((a, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={cx + maxRadius * Math.cos(a)}
          y2={cy + maxRadius * Math.sin(a)}
          stroke="var(--bb-glass-border)"
          strokeWidth="1"
        />
      ))}

      {/* Data polygon */}
      <polygon
        points={polygonPoints}
        fill="var(--bb-brand-surface)"
        stroke="var(--bb-brand)"
        strokeWidth="2"
        opacity="0.85"
      />

      {/* Data points */}
      {criterios.map((c, i) => {
        const r = (c.nota / maxNota) * maxRadius;
        const x = cx + r * Math.cos(angles[i]);
        const y = cy + r * Math.sin(angles[i]);
        return <circle key={i} cx={x} cy={y} r="3.5" fill="var(--bb-brand)" />;
      })}

      {/* Labels */}
      {criterios.map((c, i) => {
        const labelR = maxRadius + 22;
        const x = cx + labelR * Math.cos(angles[i]);
        const y = cy + labelR * Math.sin(angles[i]);
        const shortName = c.nome.length > 12 ? c.nome.slice(0, 11) + '...' : c.nome;
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--bb-ink-60)"
            fontSize="9"
            fontWeight="500"
          >
            {shortName}
          </text>
        );
      })}

      {/* Score values */}
      {criterios.map((c, i) => {
        const r = (c.nota / maxNota) * maxRadius;
        const offsetR = r + 12;
        const x = cx + offsetR * Math.cos(angles[i]);
        const y = cy + offsetR * Math.sin(angles[i]);
        return (
          <text
            key={`val-${i}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--bb-brand)"
            fontSize="10"
            fontWeight="700"
          >
            {c.nota}
          </text>
        );
      })}
    </svg>
  );
}

// ── Skeleton Loading ────────────────────────────────────────────────

function Aluno360Skeleton() {
  return (
    <div className="space-y-4 p-4">
      {/* Hero skeleton */}
      <div
        className="flex items-center gap-4 rounded-[var(--bb-radius-lg)] p-4"
        style={{ background: 'var(--bb-depth-2)' }}
      >
        <Skeleton variant="circle" className="h-16 w-16" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      {/* Tabs skeleton */}
      <div className="flex gap-2 px-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-20 rounded-[var(--bb-radius-md)]" />
        ))}
      </div>
      {/* Content skeleton */}
      <div className="space-y-3 px-4">
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </div>
    </div>
  );
}

// ── Page Component ──────────────────────────────────────────────────

export default function ProfessorAluno360Page() {
  const { id } = useParams();
  const { toast } = useToast();

  const [aluno, setAluno] = useState<Aluno360 | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('jornada');

  // Note form state
  const [notaTexto, setNotaTexto] = useState('');
  const [notaTipo, setNotaTipo] = useState<
    'observacao' | 'destaque' | 'atencao' | 'restricao'
  >('observacao');
  const [savingNota, setSavingNota] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getAluno360(id as string);
        if (!cancelled) setAluno(data);
      } catch (err) {
        if (!cancelled) toast(translateError(err), 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, toast]);

  const handleAddNota = useCallback(async () => {
    if (!notaTexto.trim() || !aluno) return;
    setSavingNota(true);
    try {
      const result = await addNotaAluno(aluno.id, {
        texto: notaTexto.trim(),
        tipo: notaTipo,
      });
      setAluno((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          notasProfessores: [
            {
              id: result.id,
              professorNome: result.professorNome,
              data: result.data,
              texto: result.texto,
              tipo: result.tipo,
            },
            ...prev.notasProfessores,
          ],
        };
      });
      setNotaTexto('');
      toast('Nota adicionada com sucesso', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSavingNota(false);
    }
  }, [aluno, notaTexto, notaTipo, toast]);

  if (loading) return <Aluno360Skeleton />;
  if (!aluno) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Aluno nao encontrado.
        </p>
      </div>
    );
  }

  const beltColor = BELT_COLORS[aluno.faixaAtual] ?? '#D4D4D4';
  const beltLabel = BELT_LABEL[aluno.faixaAtual] ?? aluno.faixaAtual;
  const beltTextColor =
    aluno.faixaAtual === 'white' || aluno.faixaAtual === 'yellow'
      ? '#1a1a1a'
      : '#ffffff';

  return (
    <div className="space-y-4 pb-24">
      {/* ── Hero Card ────────────────────────────────────────────── */}
      <div
        className="p-4"
        style={{ background: 'var(--bb-depth-2)' }}
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          {aluno.avatar ? (
            <img
              src={aluno.avatar}
              alt={aluno.nome}
              className="h-16 w-16 rounded-[var(--bb-radius-full)] object-cover"
              style={{
                border: `3px solid ${beltColor}`,
                boxShadow: 'var(--bb-shadow-sm)',
              }}
            />
          ) : (
            <div
              className="flex h-16 w-16 items-center justify-center rounded-[var(--bb-radius-full)]"
              style={{
                background: beltColor,
                color: beltTextColor,
                boxShadow: 'var(--bb-shadow-sm)',
              }}
            >
              <UserIcon className="h-7 w-7" />
            </div>
          )}

          {/* Name + belt info */}
          <div className="min-w-0 flex-1">
            <h1
              className="truncate text-lg font-bold"
              style={{ color: 'var(--bb-ink-100)' }}
            >
              {aluno.nome}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1 rounded-[var(--bb-radius-full)] px-2.5 py-0.5 text-xs font-semibold"
                style={{
                  background: beltColor,
                  color: beltTextColor,
                }}
              >
                <AwardIcon className="h-3 w-3" />
                {beltLabel}
                {aluno.graus > 0 && ` ${aluno.graus}o grau`}
              </span>
              <span
                className="text-xs"
                style={{ color: 'var(--bb-ink-60)' }}
              >
                {aluno.idade} anos
              </span>
            </div>
            <p
              className="mt-1 text-xs"
              style={{ color: 'var(--bb-ink-40)' }}
            >
              <ClockIcon className="mr-1 inline h-3 w-3" />
              {aluno.tempoNaFaixaAtual} na faixa atual
            </p>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ───────────────────────────────────────── */}
      <div className="flex gap-1 overflow-x-auto px-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="min-h-[44px] whitespace-nowrap rounded-[var(--bb-radius-md)] px-3.5 py-2 text-sm font-medium transition-colors"
            style={{
              background:
                activeTab === tab.key
                  ? 'var(--bb-brand)'
                  : 'var(--bb-depth-3)',
              color:
                activeTab === tab.key
                  ? '#ffffff'
                  : 'var(--bb-ink-60)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ──────────────────────────────────────────── */}
      <div className="px-4">
        {activeTab === 'jornada' && <TabJornada aluno={aluno} />}
        {activeTab === 'presenca' && <TabPresenca aluno={aluno} />}
        {activeTab === 'avaliacao' && <TabAvaliacao aluno={aluno} />}
        {activeTab === 'notas' && (
          <TabNotas
            aluno={aluno}
            notaTexto={notaTexto}
            notaTipo={notaTipo}
            savingNota={savingNota}
            onNotaTextoChange={setNotaTexto}
            onNotaTipoChange={setNotaTipo}
            onSubmitNota={handleAddNota}
          />
        )}
        {activeTab === 'info' && <TabInfo aluno={aluno} />}
      </div>
    </div>
  );
}

// ── TAB: Jornada ────────────────────────────────────────────────────

function TabJornada({ aluno }: { aluno: Aluno360 }) {
  return (
    <div className="space-y-6">
      {/* Belt History Timeline */}
      <div>
        <h2
          className="mb-3 flex items-center gap-2 text-sm font-semibold"
          style={{ color: 'var(--bb-ink-80)' }}
        >
          <AwardIcon className="h-4 w-4" />
          Historico de Faixas
        </h2>
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-[15px] top-2 bottom-2 w-0.5"
            style={{ background: 'var(--bb-glass-border)' }}
          />
          {aluno.historicoFaixas.map((h, idx) => {
            const color = BELT_COLORS[h.faixa] ?? '#D4D4D4';
            const label = BELT_LABEL[h.faixa] ?? h.faixa;
            const isLast = idx === aluno.historicoFaixas.length - 1;
            return (
              <div key={idx} className="relative mb-4 pl-10">
                <div
                  className="absolute left-[10px] top-2.5 h-3 w-3 rounded-[var(--bb-radius-full)] border-2"
                  style={{
                    borderColor: color,
                    backgroundColor: isLast ? color : 'var(--bb-depth-2)',
                  }}
                />
                <div
                  className="rounded-[var(--bb-radius-md)] p-3"
                  style={{
                    background: 'var(--bb-depth-2)',
                    border: isLast
                      ? `1px solid ${color}`
                      : '1px solid var(--bb-glass-border)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: 'var(--bb-ink-100)' }}
                    >
                      Faixa {label}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: 'var(--bb-ink-40)' }}
                    >
                      {new Date(h.data).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p
                    className="mt-0.5 text-xs"
                    style={{ color: 'var(--bb-ink-60)' }}
                  >
                    Prof. {h.professor}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Competicoes */}
      <div>
        <h2
          className="mb-3 flex items-center gap-2 text-sm font-semibold"
          style={{ color: 'var(--bb-ink-80)' }}
        >
          <StarIcon className="h-4 w-4" />
          Competicoes
        </h2>
        {aluno.competicoes.length === 0 ? (
          <p
            className="rounded-[var(--bb-radius-md)] py-6 text-center text-sm"
            style={{
              color: 'var(--bb-ink-40)',
              background: 'var(--bb-depth-2)',
            }}
          >
            Nenhuma competicao registrada.
          </p>
        ) : (
          <div className="space-y-2">
            {aluno.competicoes.map((c, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-[var(--bb-radius-md)] p-3"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--bb-radius-full)]"
                  style={{
                    background:
                      c.resultado === 'Ouro'
                        ? '#FEF3C7'
                        : c.resultado === 'Prata'
                          ? '#F3F4F6'
                          : c.resultado === 'Bronze'
                            ? '#FED7AA'
                            : 'var(--bb-depth-3)',
                    color:
                      c.resultado === 'Ouro'
                        ? '#B45309'
                        : c.resultado === 'Prata'
                          ? '#4B5563'
                          : c.resultado === 'Bronze'
                            ? '#9A3412'
                            : 'var(--bb-ink-60)',
                  }}
                >
                  <AwardIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-medium"
                    style={{ color: 'var(--bb-ink-100)' }}
                  >
                    {c.nome}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: 'var(--bb-ink-60)' }}
                  >
                    {c.categoria} &middot;{' '}
                    {new Date(c.data).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span
                  className="shrink-0 rounded-[var(--bb-radius-full)] px-2 py-0.5 text-xs font-bold"
                  style={{
                    background:
                      c.resultado === 'Ouro'
                        ? '#FEF3C7'
                        : c.resultado === 'Prata'
                          ? '#F3F4F6'
                          : c.resultado === 'Bronze'
                            ? '#FED7AA'
                            : 'var(--bb-depth-3)',
                    color:
                      c.resultado === 'Ouro'
                        ? '#B45309'
                        : c.resultado === 'Prata'
                          ? '#4B5563'
                          : c.resultado === 'Bronze'
                            ? '#9A3412'
                            : 'var(--bb-ink-60)',
                  }}
                >
                  {c.resultado}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── TAB: Presenca ───────────────────────────────────────────────────

function TabPresenca({ aluno }: { aluno: Aluno360 }) {
  const maxFreq = Math.max(...aluno.frequenciaSemanal, 1);

  return (
    <div className="space-y-5">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<CheckCircleIcon className="h-4 w-4" />}
          label="Total"
          value={String(aluno.presencaTotal)}
          color="var(--bb-brand)"
        />
        <StatCard
          icon={<CalendarIcon className="h-4 w-4" />}
          label="Ultimos 30 dias"
          value={String(aluno.presencaUltimos30Dias)}
          color="var(--bb-info)"
        />
        <StatCard
          icon={<TrendingUpIcon className="h-4 w-4" />}
          label="Media (%)"
          value={`${aluno.presencaMedia}%`}
          color={
            aluno.presencaMedia >= 70
              ? 'var(--bb-success)'
              : aluno.presencaMedia >= 40
                ? 'var(--bb-warning)'
                : 'var(--bb-error)'
          }
        />
        <StatCard
          icon={<StarIcon className="h-4 w-4" />}
          label="Sequencia atual"
          value={String(aluno.sequenciaAtual)}
          subtitle={`Recorde: ${aluno.maiorSequencia}`}
          color="var(--bb-brand)"
        />
      </div>

      {/* Weekday frequency heatmap bar chart */}
      <div
        className="rounded-[var(--bb-radius-lg)] p-4"
        style={{
          background: 'var(--bb-depth-2)',
          border: '1px solid var(--bb-glass-border)',
        }}
      >
        <h3
          className="mb-3 text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--bb-ink-60)' }}
        >
          Frequencia Semanal
        </h3>
        <div className="flex items-end justify-between gap-2" style={{ height: '100px' }}>
          {WEEKDAY_LABELS.map((day, idx) => {
            const freq = aluno.frequenciaSemanal[idx] ?? 0;
            const heightPct = maxFreq > 0 ? (freq / maxFreq) * 100 : 0;
            const intensity =
              freq === 0
                ? 'var(--bb-depth-4)'
                : freq <= 1
                  ? 'var(--bb-brand-surface)'
                  : freq <= 2
                    ? 'var(--bb-info)'
                    : freq <= 3
                      ? 'var(--bb-brand)'
                      : 'var(--bb-success)';
            return (
              <div
                key={day}
                className="flex flex-1 flex-col items-center gap-1"
                style={{ height: '100%', justifyContent: 'flex-end' }}
              >
                <span
                  className="text-[10px] font-bold"
                  style={{ color: 'var(--bb-ink-60)' }}
                >
                  {freq}
                </span>
                <div
                  className="w-full rounded-t-[var(--bb-radius-md)]"
                  style={{
                    height: `${Math.max(heightPct, 8)}%`,
                    minHeight: '6px',
                    background: intensity,
                    transition: 'height 0.3s ease',
                  }}
                />
                <span
                  className="text-[10px] font-medium"
                  style={{ color: 'var(--bb-ink-40)' }}
                >
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ultimo checkin + warning */}
      <div
        className="rounded-[var(--bb-radius-lg)] p-4"
        style={{
          background: 'var(--bb-depth-2)',
          border: '1px solid var(--bb-glass-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <ClockIcon
            className="h-5 w-5 shrink-0"
            style={{ color: 'var(--bb-ink-60)' }}
          />
          <div className="min-w-0 flex-1">
            <p
              className="text-xs"
              style={{ color: 'var(--bb-ink-40)' }}
            >
              Ultimo check-in
            </p>
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--bb-ink-100)' }}
            >
              {aluno.ultimoCheckin
                ? new Date(aluno.ultimoCheckin).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Nunca'}
            </p>
          </div>
        </div>

        {aluno.diasDesdeUltimoTreino > 3 && (
          <div
            className="mt-3 flex items-center gap-2 rounded-[var(--bb-radius-md)] p-2.5"
            style={{
              background: 'var(--bb-warning-surface)',
            }}
          >
            <AlertTriangleIcon
              className="h-4 w-4 shrink-0"
              style={{ color: 'var(--bb-warning)' }}
            />
            <p
              className="text-xs font-medium"
              style={{ color: 'var(--bb-warning)' }}
            >
              {aluno.diasDesdeUltimoTreino} dias sem treinar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── TAB: Avaliacao ──────────────────────────────────────────────────

function TabAvaliacao({ aluno }: { aluno: Aluno360 }) {
  if (!aluno.ultimaAvaliacao) {
    return (
      <p
        className="rounded-[var(--bb-radius-md)] py-10 text-center text-sm"
        style={{
          color: 'var(--bb-ink-40)',
          background: 'var(--bb-depth-2)',
        }}
      >
        Nenhuma avaliacao registrada.
      </p>
    );
  }

  const av = aluno.ultimaAvaliacao;

  return (
    <div className="space-y-5">
      {/* Radar Chart */}
      <div
        className="rounded-[var(--bb-radius-lg)] p-4"
        style={{
          background: 'var(--bb-depth-2)',
          border: '1px solid var(--bb-glass-border)',
        }}
      >
        <h3
          className="mb-1 text-center text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--bb-ink-60)' }}
        >
          Ultima Avaliacao
        </h3>
        <p
          className="mb-2 text-center text-[10px]"
          style={{ color: 'var(--bb-ink-40)' }}
        >
          {new Date(av.data).toLocaleDateString('pt-BR')}
        </p>
        <DynamicRadarChart criterios={av.criterios} size={260} />
        <p
          className="mt-2 text-center text-xs"
          style={{ color: 'var(--bb-ink-40)' }}
        >
          Media geral:{' '}
          <span
            className="font-bold"
            style={{ color: 'var(--bb-brand)' }}
          >
            {av.mediaGeral.toFixed(1)}
          </span>
          /10
        </p>
      </div>

      {/* Criterios breakdown */}
      <div
        className="rounded-[var(--bb-radius-lg)] p-4"
        style={{
          background: 'var(--bb-depth-2)',
          border: '1px solid var(--bb-glass-border)',
        }}
      >
        <h3
          className="mb-3 text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--bb-ink-60)' }}
        >
          Detalhamento
        </h3>
        <div className="space-y-2.5">
          {av.criterios.map((c) => (
            <div key={c.slug} className="flex items-center gap-3">
              <span
                className="min-w-0 flex-1 truncate text-xs"
                style={{ color: 'var(--bb-ink-80)' }}
              >
                {c.nome}
              </span>
              <div className="flex items-center gap-2">
                <div
                  className="h-1.5 w-20 rounded-[var(--bb-radius-full)]"
                  style={{ background: 'var(--bb-depth-4)' }}
                >
                  <div
                    className="h-full rounded-[var(--bb-radius-full)]"
                    style={{
                      width: `${(c.nota / 10) * 100}%`,
                      background:
                        c.nota >= 7
                          ? 'var(--bb-success)'
                          : c.nota >= 4
                            ? 'var(--bb-warning)'
                            : 'var(--bb-error)',
                    }}
                  />
                </div>
                <span
                  className="w-7 text-right text-xs font-bold"
                  style={{
                    color:
                      c.nota >= 7
                        ? 'var(--bb-success)'
                        : c.nota >= 4
                          ? 'var(--bb-warning)'
                          : 'var(--bb-error)',
                  }}
                >
                  {c.nota}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evolucao Media */}
      {aluno.evolucaoMedia.length > 0 && (
        <div
          className="rounded-[var(--bb-radius-lg)] p-4"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
          }}
        >
          <h3
            className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'var(--bb-ink-60)' }}
          >
            <TrendingUpIcon className="h-3.5 w-3.5" />
            Evolucao da Media
          </h3>
          <div className="space-y-2">
            {aluno.evolucaoMedia.map((e, idx) => {
              const prev = idx > 0 ? aluno.evolucaoMedia[idx - 1].media : null;
              const diff = prev !== null ? e.media - prev : null;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-[var(--bb-radius-md)] px-3 py-2"
                  style={{ background: 'var(--bb-depth-3)' }}
                >
                  <span
                    className="text-xs"
                    style={{ color: 'var(--bb-ink-60)' }}
                  >
                    {new Date(e.data).toLocaleDateString('pt-BR', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-bold"
                      style={{ color: 'var(--bb-brand)' }}
                    >
                      {e.media.toFixed(1)}
                    </span>
                    {diff !== null && (
                      <span
                        className="text-[10px] font-medium"
                        style={{
                          color:
                            diff > 0
                              ? 'var(--bb-success)'
                              : diff < 0
                                ? 'var(--bb-error)'
                                : 'var(--bb-ink-40)',
                        }}
                      >
                        {diff > 0 ? '+' : ''}
                        {diff.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── TAB: Notas ──────────────────────────────────────────────────────

interface TabNotasProps {
  aluno: Aluno360;
  notaTexto: string;
  notaTipo: 'observacao' | 'destaque' | 'atencao' | 'restricao';
  savingNota: boolean;
  onNotaTextoChange: (v: string) => void;
  onNotaTipoChange: (v: 'observacao' | 'destaque' | 'atencao' | 'restricao') => void;
  onSubmitNota: () => void;
}

function TabNotas({
  aluno,
  notaTexto,
  notaTipo,
  savingNota,
  onNotaTextoChange,
  onNotaTipoChange,
  onSubmitNota,
}: TabNotasProps) {
  return (
    <div className="space-y-5">
      {/* Add new note form */}
      <div
        className="rounded-[var(--bb-radius-lg)] p-4"
        style={{
          background: 'var(--bb-depth-2)',
          border: '1px solid var(--bb-glass-border)',
        }}
      >
        <h3
          className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--bb-ink-60)' }}
        >
          <EditIcon className="h-3.5 w-3.5" />
          Adicionar Nota
        </h3>

        {/* Tipo selector */}
        <div className="mb-3 flex flex-wrap gap-2">
          {(
            Object.keys(NOTA_TIPO_CONFIG) as Array<
              'observacao' | 'destaque' | 'atencao' | 'restricao'
            >
          ).map((tipo) => {
            const cfg = NOTA_TIPO_CONFIG[tipo];
            const isActive = notaTipo === tipo;
            return (
              <button
                key={tipo}
                onClick={() => onNotaTipoChange(tipo)}
                className="min-h-[44px] rounded-[var(--bb-radius-md)] px-3 py-2 text-xs font-medium transition-colors"
                style={{
                  background: isActive ? cfg.bg : 'var(--bb-depth-3)',
                  color: isActive ? cfg.text : 'var(--bb-ink-40)',
                  border: isActive
                    ? `1px solid ${cfg.text}`
                    : '1px solid var(--bb-glass-border)',
                }}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>

        <textarea
          value={notaTexto}
          onChange={(e) => onNotaTextoChange(e.target.value)}
          placeholder="Escreva sua observacao sobre o aluno..."
          rows={3}
          className="w-full resize-none rounded-[var(--bb-radius-md)] px-3 py-2.5 text-sm"
          style={{
            background: 'var(--bb-depth-3)',
            color: 'var(--bb-ink-100)',
            border: '1px solid var(--bb-glass-border)',
          }}
        />

        <button
          onClick={onSubmitNota}
          disabled={!notaTexto.trim() || savingNota}
          className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[var(--bb-radius-md)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
          style={{ background: 'var(--bb-brand)' }}
        >
          <MessageIcon className="h-4 w-4" />
          {savingNota ? 'Salvando...' : 'Adicionar Nota'}
        </button>
      </div>

      {/* Notes list */}
      <div>
        <h3
          className="mb-3 text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--bb-ink-60)' }}
        >
          Notas ({aluno.notasProfessores.length})
        </h3>
        {aluno.notasProfessores.length === 0 ? (
          <p
            className="rounded-[var(--bb-radius-md)] py-6 text-center text-sm"
            style={{
              color: 'var(--bb-ink-40)',
              background: 'var(--bb-depth-2)',
            }}
          >
            Nenhuma nota registrada.
          </p>
        ) : (
          <div className="space-y-2">
            {aluno.notasProfessores.map((nota) => {
              const tipoCfg = NOTA_TIPO_CONFIG[nota.tipo] ?? NOTA_TIPO_CONFIG.observacao;
              return (
                <div
                  key={nota.id}
                  className="rounded-[var(--bb-radius-md)] p-3"
                  style={{
                    background: 'var(--bb-depth-2)',
                    border: '1px solid var(--bb-glass-border)',
                  }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className="rounded-[var(--bb-radius-full)] px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        background: tipoCfg.bg,
                        color: tipoCfg.text,
                      }}
                    >
                      {tipoCfg.label}
                    </span>
                    <span
                      className="text-[10px]"
                      style={{ color: 'var(--bb-ink-40)' }}
                    >
                      {new Date(nota.data).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p
                    className="text-sm"
                    style={{ color: 'var(--bb-ink-80)' }}
                  >
                    {nota.texto}
                  </p>
                  <p
                    className="mt-1.5 text-[10px]"
                    style={{ color: 'var(--bb-ink-40)' }}
                  >
                    Por {nota.professorNome}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── TAB: Info ───────────────────────────────────────────────────────

function TabInfo({ aluno }: { aluno: Aluno360 }) {
  const sitCfg = SITUACAO_CONFIG[aluno.situacaoFinanceira] ?? SITUACAO_CONFIG.em_dia;

  return (
    <div className="space-y-5">
      {/* Turmas Inscritas */}
      <div>
        <h3
          className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--bb-ink-60)' }}
        >
          <UsersIcon className="h-3.5 w-3.5" />
          Turmas Inscritas
        </h3>
        {aluno.turmasInscritas.length === 0 ? (
          <p
            className="rounded-[var(--bb-radius-md)] py-6 text-center text-sm"
            style={{
              color: 'var(--bb-ink-40)',
              background: 'var(--bb-depth-2)',
            }}
          >
            Nenhuma turma inscrita.
          </p>
        ) : (
          <div className="space-y-2">
            {aluno.turmasInscritas.map((t) => (
              <div
                key={t.id}
                className="flex min-h-[44px] items-center gap-3 rounded-[var(--bb-radius-md)] p-3"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--bb-radius-md)]"
                  style={{ background: 'var(--bb-brand-surface)' }}
                >
                  <CalendarIcon
                    className="h-4 w-4"
                    style={{ color: 'var(--bb-brand)' }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-medium"
                    style={{ color: 'var(--bb-ink-100)' }}
                  >
                    {t.nome}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: 'var(--bb-ink-60)' }}
                  >
                    {t.horario} &middot; {t.modalidade}
                  </p>
                </div>
                <ChevronRightIcon
                  className="h-4 w-4 shrink-0"
                  style={{ color: 'var(--bb-ink-20)' }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Restricoes Medicas */}
      <div>
        <h3
          className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--bb-ink-60)' }}
        >
          <HeartIcon className="h-3.5 w-3.5" />
          Restricoes Medicas
        </h3>
        {aluno.restricoesMedicas.length === 0 ? (
          <p
            className="rounded-[var(--bb-radius-md)] py-4 text-center text-sm"
            style={{
              color: 'var(--bb-ink-40)',
              background: 'var(--bb-depth-2)',
            }}
          >
            Nenhuma restricao registrada.
          </p>
        ) : (
          <div className="space-y-2">
            {aluno.restricoesMedicas.map((r, idx) => (
              <div
                key={idx}
                className="rounded-[var(--bb-radius-md)] p-3"
                style={{
                  background: r.ativa
                    ? 'var(--bb-error-surface)'
                    : 'var(--bb-depth-2)',
                  border: r.ativa
                    ? '1px solid var(--bb-error)'
                    : '1px solid var(--bb-glass-border)',
                }}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangleIcon
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{
                      color: r.ativa ? 'var(--bb-error)' : 'var(--bb-ink-40)',
                    }}
                  />
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{
                        color: r.ativa
                          ? 'var(--bb-error)'
                          : 'var(--bb-ink-60)',
                      }}
                    >
                      {r.descricao}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className="text-[10px]"
                        style={{ color: 'var(--bb-ink-40)' }}
                      >
                        Desde{' '}
                        {new Date(r.desde).toLocaleDateString('pt-BR')}
                      </span>
                      <span
                        className="rounded-[var(--bb-radius-full)] px-1.5 py-0.5 text-[10px] font-semibold"
                        style={{
                          background: r.ativa
                            ? 'var(--bb-error-surface)'
                            : 'var(--bb-success-surface)',
                          color: r.ativa
                            ? 'var(--bb-error)'
                            : 'var(--bb-success)',
                        }}
                      >
                        {r.ativa ? 'Ativa' : 'Resolvida'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lesoes */}
      {aluno.lesoes.length > 0 && (
        <div>
          <h3
            className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'var(--bb-ink-60)' }}
          >
            <ShieldIcon className="h-3.5 w-3.5" />
            Lesoes
          </h3>
          <div className="space-y-2">
            {aluno.lesoes.map((l, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-[var(--bb-radius-md)] p-3"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              >
                {l.recuperado ? (
                  <CheckCircleIcon
                    className="h-4 w-4 shrink-0"
                    style={{ color: 'var(--bb-success)' }}
                  />
                ) : (
                  <XIcon
                    className="h-4 w-4 shrink-0"
                    style={{ color: 'var(--bb-error)' }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className="text-sm"
                    style={{ color: 'var(--bb-ink-80)' }}
                  >
                    {l.descricao}
                  </p>
                  <p
                    className="text-[10px]"
                    style={{ color: 'var(--bb-ink-40)' }}
                  >
                    {new Date(l.data).toLocaleDateString('pt-BR')} &middot;{' '}
                    {l.recuperado ? 'Recuperado' : 'Em tratamento'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Financeiro + Plano */}
      <div
        className="rounded-[var(--bb-radius-lg)] p-4"
        style={{
          background: 'var(--bb-depth-2)',
          border: '1px solid var(--bb-glass-border)',
        }}
      >
        <h3
          className="mb-3 text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--bb-ink-60)' }}
        >
          Plano e Financeiro
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span
              className="text-sm"
              style={{ color: 'var(--bb-ink-60)' }}
            >
              Plano
            </span>
            <span
              className="text-sm font-semibold"
              style={{ color: 'var(--bb-ink-100)' }}
            >
              {aluno.plano} ({aluno.planoPeriodo})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span
              className="text-sm"
              style={{ color: 'var(--bb-ink-60)' }}
            >
              Situacao financeira
            </span>
            <span
              className="rounded-[var(--bb-radius-full)] px-2.5 py-0.5 text-xs font-semibold"
              style={{
                background: sitCfg.bg,
                color: sitCfg.text,
              }}
            >
              {sitCfg.label}
            </span>
          </div>
        </div>
      </div>

      {/* Contato */}
      <div
        className="rounded-[var(--bb-radius-lg)] p-4"
        style={{
          background: 'var(--bb-depth-2)',
          border: '1px solid var(--bb-glass-border)',
        }}
      >
        <h3
          className="mb-3 text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--bb-ink-60)' }}
        >
          Contato
        </h3>
        <div className="space-y-2.5">
          <div className="flex min-h-[44px] items-center gap-3">
            <MessageIcon
              className="h-4 w-4 shrink-0"
              style={{ color: 'var(--bb-ink-40)' }}
            />
            <span
              className="text-sm"
              style={{ color: 'var(--bb-ink-80)' }}
            >
              {aluno.email}
            </span>
          </div>
          <div className="flex min-h-[44px] items-center gap-3">
            <UserIcon
              className="h-4 w-4 shrink-0"
              style={{ color: 'var(--bb-ink-40)' }}
            />
            <span
              className="text-sm"
              style={{ color: 'var(--bb-ink-80)' }}
            >
              {aluno.telefone}
            </span>
          </div>
          <div className="flex min-h-[44px] items-center gap-3">
            <CalendarIcon
              className="h-4 w-4 shrink-0"
              style={{ color: 'var(--bb-ink-40)' }}
            />
            <span
              className="text-sm"
              style={{ color: 'var(--bb-ink-80)' }}
            >
              Nascimento:{' '}
              {new Date(aluno.dataNascimento).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Stat Card Helper ────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  color: string;
}) {
  return (
    <div
      className="rounded-[var(--bb-radius-lg)] p-3"
      style={{
        background: 'var(--bb-depth-2)',
        border: '1px solid var(--bb-glass-border)',
      }}
    >
      <div
        className="mb-1 flex items-center gap-1.5"
        style={{ color: 'var(--bb-ink-40)' }}
      >
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-xl font-bold" style={{ color }}>
        {value}
      </p>
      {subtitle && (
        <p
          className="mt-0.5 text-[10px]"
          style={{ color: 'var(--bb-ink-40)' }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getSemana,
  type PlanoAula,
  type SemanaPlanejamento,
  type TecnicaPlano,
} from '@/lib/api/plano-aula.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import {
  FileTextIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  ClockIcon,
  BookOpenIcon,
  UsersIcon,
  CheckCircleIcon,
} from '@/components/shell/icons';
import { translateError } from '@/lib/utils/error-translator';

// ── Helpers ─────────────────────────────────────────────────────────────

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'] as const;

const STATUS_CONFIG: Record<
  PlanoAula['status'],
  { label: string; color: string; bg: string }
> = {
  planejado: {
    label: 'Planejado',
    color: 'var(--bb-info)',
    bg: 'color-mix(in srgb, var(--bb-info) 12%, transparent)',
  },
  em_andamento: {
    label: 'Em Andamento',
    color: 'var(--bb-warning)',
    bg: 'color-mix(in srgb, var(--bb-warning) 12%, transparent)',
  },
  concluido: {
    label: 'Concluido',
    color: 'var(--bb-success)',
    bg: 'color-mix(in srgb, var(--bb-success) 12%, transparent)',
  },
  cancelado: {
    label: 'Cancelado',
    color: 'var(--bb-error)',
    bg: 'color-mix(in srgb, var(--bb-error) 12%, transparent)',
  },
};

const PRATICA_LABEL: Record<string, string> = {
  drill: 'Drill',
  sparring_posicional: 'Sparring Posicional',
  sparring_livre: 'Sparring Livre',
};

function getISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function offsetWeek(weekStr: string, offset: number): string {
  const [yearPart, weekPart] = weekStr.split('-W');
  const year = parseInt(yearPart, 10);
  const week = parseInt(weekPart, 10);
  // Get Monday of the current ISO week
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const mondayOfWeek1 = new Date(jan4.getTime() - ((jan4.getUTCDay() || 7) - 1) * 86400000);
  const target = new Date(mondayOfWeek1.getTime() + (week - 1 + offset) * 7 * 86400000);
  return getISOWeek(target);
}

function weekRangeLabel(weekStr: string): string {
  const [yearPart, weekPart] = weekStr.split('-W');
  const year = parseInt(yearPart, 10);
  const week = parseInt(weekPart, 10);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const mondayOfWeek1 = new Date(jan4.getTime() - ((jan4.getUTCDay() || 7) - 1) * 86400000);
  const monday = new Date(mondayOfWeek1.getTime() + (week - 1) * 7 * 86400000);
  const sunday = new Date(monday.getTime() + 6 * 86400000);
  const fmt = (d: Date) =>
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  return `${fmt(monday)} - ${fmt(sunday)}`;
}

function getDiaDaSemana(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return DIAS_SEMANA[d.getDay()];
}

// ── Component ───────────────────────────────────────────────────────────

export default function PlanoAulaPage() {
  const { toast } = useToast();
  const [currentWeek, setCurrentWeek] = useState(() => getISOWeek(new Date()));
  const [semana, setSemana] = useState<SemanaPlanejamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchSemana = useCallback(
    async (week: string) => {
      setLoading(true);
      setExpandedId(null);
      try {
        const data = await getSemana('prof-1', week);
        setSemana(data);
      } catch (err) {
        toast(translateError(err), 'error');
        setSemana(null);
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    fetchSemana(currentWeek);
  }, [currentWeek, fetchSemana]);

  function handlePrevWeek() {
    setCurrentWeek((prev) => offsetWeek(prev, -1));
  }

  function handleNextWeek() {
    setCurrentWeek((prev) => offsetWeek(prev, 1));
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  // ── Loading skeleton ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen pb-24" style={{ background: 'var(--bb-depth-1)' }}>
        <div className="mx-auto max-w-lg space-y-4 px-4 pt-6">
          <Skeleton variant="text" className="h-8 w-48" />
          <Skeleton variant="text" className="h-12 w-full" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────

  const aulas = semana?.aulas ?? [];

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bb-depth-1)' }}>
      <div className="mx-auto max-w-lg space-y-5 px-4 pt-6">
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          <FileTextIcon className="h-6 w-6" style={{ color: 'var(--bb-brand)' }} />
          <h1
            className="text-2xl font-extrabold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Plano de Aula
          </h1>
        </div>

        {/* ── Week selector ───────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{
            background: 'var(--bb-depth-2)',
            borderRadius: 'var(--bb-radius-lg)',
            border: '1px solid var(--bb-glass-border)',
            boxShadow: 'var(--bb-shadow-sm)',
          }}
        >
          <button
            type="button"
            onClick={handlePrevWeek}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] transition-opacity hover:opacity-70"
            aria-label="Semana anterior"
          >
            <ChevronLeftIcon className="h-5 w-5" style={{ color: 'var(--bb-ink-60)' }} />
          </button>

          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4" style={{ color: 'var(--bb-brand)' }} />
              <span
                className="text-sm font-bold"
                style={{ color: 'var(--bb-ink-100)' }}
              >
                {weekRangeLabel(currentWeek)}
              </span>
            </div>
            <span
              className="text-xs"
              style={{ color: 'var(--bb-ink-40)' }}
            >
              Semana {currentWeek.split('-W')[1]}
            </span>
          </div>

          <button
            type="button"
            onClick={handleNextWeek}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] transition-opacity hover:opacity-70"
            aria-label="Proxima semana"
          >
            <ChevronRightIcon className="h-5 w-5" style={{ color: 'var(--bb-ink-60)' }} />
          </button>
        </div>

        {/* ── Theme of the week ───────────────────────────────── */}
        {semana?.tema && (
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{
              background: 'var(--bb-brand-surface)',
              borderRadius: 'var(--bb-radius-md)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            <BookOpenIcon className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--bb-brand)' }} />
            <div>
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--bb-ink-40)' }}
              >
                Tema da Semana
              </span>
              <p
                className="text-sm font-bold"
                style={{ color: 'var(--bb-ink-100)' }}
              >
                {semana.tema}
              </p>
            </div>
          </div>
        )}

        {/* ── Day cards ───────────────────────────────────────── */}
        {aulas.length === 0 ? (
          <div
            className="flex flex-col items-center gap-3 py-16 text-center"
            style={{ color: 'var(--bb-ink-40)' }}
          >
            <FileTextIcon className="h-12 w-12 opacity-30" />
            <p className="text-sm">Nenhum plano de aula nesta semana.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {aulas.map((aula) => {
              const isExpanded = expandedId === aula.id;
              const statusCfg = STATUS_CONFIG[aula.status];
              const dia = getDiaDaSemana(aula.data);

              return (
                <div
                  key={aula.id}
                  style={{
                    background: 'var(--bb-depth-2)',
                    borderRadius: 'var(--bb-radius-lg)',
                    border: '1px solid var(--bb-glass-border)',
                    boxShadow: 'var(--bb-shadow-sm)',
                    overflow: 'hidden',
                  }}
                >
                  {/* ── Card header (clickable) ────────────────── */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(aula.id)}
                    className="flex w-full items-start gap-3 p-4 text-left transition-colors min-h-[44px]"
                    style={{ color: 'var(--bb-ink-100)' }}
                  >
                    {/* Day badge */}
                    <div
                      className="flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center"
                      style={{
                        background: 'var(--bb-brand-surface)',
                        borderRadius: 'var(--bb-radius-md)',
                      }}
                    >
                      <span
                        className="text-xs font-bold"
                        style={{ color: 'var(--bb-brand)' }}
                      >
                        {dia}
                      </span>
                      <span
                        className="text-[10px]"
                        style={{ color: 'var(--bb-ink-40)' }}
                      >
                        {new Date(aula.data + 'T12:00:00').getDate()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold truncate" style={{ color: 'var(--bb-ink-100)' }}>
                          {aula.turmaNome}
                        </h3>
                        {/* Status badge */}
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold flex-shrink-0"
                          style={{
                            color: statusCfg.color,
                            background: statusCfg.bg,
                          }}
                        >
                          {statusCfg.label}
                        </span>
                      </div>

                      {/* Duration */}
                      <div className="mt-1 flex items-center gap-3 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" />
                          {aula.duracaoTotal}min
                        </span>
                        <span className="flex items-center gap-1">
                          <UsersIcon className="h-3 w-3" />
                          {aula.nivelFoco}
                        </span>
                      </div>

                      {/* Brief: aquecimento + tecnicas */}
                      <p
                        className="mt-1.5 text-xs truncate"
                        style={{ color: 'var(--bb-ink-40)' }}
                      >
                        {aula.aquecimento.descricao}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {aula.tecnicaPrincipal.tecnicas.map((t, i) => (
                          <span
                            key={i}
                            className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
                            style={{
                              background: 'var(--bb-depth-3)',
                              color: 'var(--bb-ink-60)',
                            }}
                          >
                            {t.nome}
                          </span>
                        ))}
                      </div>

                      {/* Pratica tipo */}
                      <div
                        className="mt-1 flex items-center gap-1 text-xs"
                        style={{ color: 'var(--bb-ink-40)' }}
                      >
                        <PlayIcon className="h-3 w-3" />
                        <span>{PRATICA_LABEL[aula.pratica.tipo] ?? aula.pratica.tipo}</span>
                      </div>
                    </div>

                    {/* Chevron */}
                    <ChevronRightIcon
                      className="h-5 w-5 flex-shrink-0 transition-transform"
                      style={{
                        color: 'var(--bb-ink-20)',
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      }}
                    />
                  </button>

                  {/* ── Expanded detail ────────────────────────── */}
                  {isExpanded && (
                    <div
                      className="space-y-4 px-4 pb-4"
                      style={{
                        borderTop: '1px solid var(--bb-glass-border)',
                        background: 'var(--bb-depth-3)',
                      }}
                    >
                      <div className="pt-4" />

                      {/* Aquecimento */}
                      <DetailSection
                        icon={<PlayIcon className="h-4 w-4" />}
                        title="Aquecimento"
                        duration={aula.aquecimento.duracaoMinutos}
                      >
                        <p className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                          {aula.aquecimento.descricao}
                        </p>
                      </DetailSection>

                      {/* Tecnica Principal */}
                      <DetailSection
                        icon={<BookOpenIcon className="h-4 w-4" />}
                        title="Tecnica Principal"
                        duration={aula.tecnicaPrincipal.duracaoMinutos}
                      >
                        <div className="space-y-2">
                          {aula.tecnicaPrincipal.tecnicas.map((t, i) => (
                            <TecnicaCard key={i} tecnica={t} />
                          ))}
                          {aula.tecnicaPrincipal.observacoes && (
                            <p
                              className="text-xs italic"
                              style={{ color: 'var(--bb-ink-40)' }}
                            >
                              {aula.tecnicaPrincipal.observacoes}
                            </p>
                          )}
                        </div>
                      </DetailSection>

                      {/* Pratica */}
                      <DetailSection
                        icon={<UsersIcon className="h-4 w-4" />}
                        title={PRATICA_LABEL[aula.pratica.tipo] ?? aula.pratica.tipo}
                        duration={aula.pratica.duracaoMinutos}
                      >
                        <p className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                          {aula.pratica.descricao}
                        </p>
                        {aula.pratica.regras && (
                          <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                            <span className="font-semibold">Regras:</span> {aula.pratica.regras}
                          </p>
                        )}
                      </DetailSection>

                      {/* Encerramento */}
                      <DetailSection
                        icon={<CheckCircleIcon className="h-4 w-4" />}
                        title="Encerramento"
                        duration={aula.encerramento.duracaoMinutos}
                      >
                        <p className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                          {aula.encerramento.descricao}
                        </p>
                      </DetailSection>

                      {/* Materiais */}
                      {aula.materiais && (
                        <div>
                          <p
                            className="text-xs font-semibold uppercase tracking-wider mb-1"
                            style={{ color: 'var(--bb-ink-40)' }}
                          >
                            Materiais
                          </p>
                          <p className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                            {aula.materiais}
                          </p>
                        </div>
                      )}

                      {/* Notas */}
                      {aula.notas && (
                        <div>
                          <p
                            className="text-xs font-semibold uppercase tracking-wider mb-1"
                            style={{ color: 'var(--bb-ink-40)' }}
                          >
                            Notas
                          </p>
                          <p className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                            {aula.notas}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────

function DetailSection({
  icon,
  title,
  duration,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  duration: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <span style={{ color: 'var(--bb-brand)' }}>{icon}</span>
        <span
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: 'var(--bb-ink-60)' }}
        >
          {title}
        </span>
        <span
          className="ml-auto flex items-center gap-1 text-[10px]"
          style={{ color: 'var(--bb-ink-40)' }}
        >
          <ClockIcon className="h-3 w-3" />
          {duration}min
        </span>
      </div>
      {children}
    </div>
  );
}

function TecnicaCard({ tecnica }: { tecnica: TecnicaPlano }) {
  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: 'var(--bb-depth-2)',
        border: '1px solid var(--bb-glass-border)',
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-sm font-semibold"
          style={{ color: 'var(--bb-ink-100)' }}
        >
          {tecnica.nome}
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{
            background: 'var(--bb-brand-surface)',
            color: 'var(--bb-brand)',
          }}
        >
          {tecnica.posicao}
        </span>
      </div>
      {tecnica.descricao && (
        <p
          className="mt-1 text-xs"
          style={{ color: 'var(--bb-ink-60)' }}
        >
          {tecnica.descricao}
        </p>
      )}
    </div>
  );
}

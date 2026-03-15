'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAlunoDashboard } from '@/lib/api/aluno.service';
import type {
  AlunoDashboardDTO,
  DiaSemanaDTO,
  DiaStatus,
} from '@/lib/api/aluno.service';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';

// ── Belt color mapping ─────────────────────────────────────────────────

const BELT_COLOR_MAP: Record<string, string> = {
  white: '#FAFAFA',
  gray: '#9CA3AF',
  yellow: '#EAB308',
  orange: '#EA580C',
  green: '#16A34A',
  blue: '#2563EB',
  purple: '#9333EA',
  brown: '#92400E',
  black: '#0A0A0A',
};

const BELT_LABEL_MAP: Record<string, string> = {
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

function formatTimeUntil(startTime: string): string {
  const now = new Date();
  const [h, m] = startTime.split(':').map(Number);
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return 'Agora';
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  if (hours > 0) return `Em ${hours}h ${minutes}min`;
  return `Em ${minutes}min`;
}

function isClassNow(startTime: string, endTime: string): boolean {
  const now = new Date();
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const start = new Date(now);
  start.setHours(sh, sm, 0, 0);
  const end = new Date(now);
  end.setHours(eh, em, 0, 0);
  return now >= start && now <= end;
}

function getDayStatusIcon(status: DiaStatus): string {
  switch (status) {
    case 'done': return '\u2705';
    case 'scheduled': return '\uD83D\uDFE0';
    case 'rest': return '\uD83D\uDE34';
    case 'missed': return '\u274C';
  }
}

function getDayStatusClass(status: DiaStatus): string {
  switch (status) {
    case 'done': return 'bg-bb-success/10 border-bb-success text-bb-success';
    case 'scheduled': return 'bg-bb-warning/10 border-bb-warning text-bb-warning';
    case 'rest': return 'bg-bb-gray-100 border-bb-gray-300 text-bb-gray-500';
    case 'missed': return 'bg-bb-error/10 border-bb-error text-bb-error';
  }
}

// ── Mini Heatmap Component ─────────────────────────────────────────────

function MiniHeatmap({ diasPresentes, totalDays }: { diasPresentes: number[]; totalDays: number }) {
  const presentSet = useMemo(() => new Set(diasPresentes), [diasPresentes]);
  return (
    <div className="flex flex-wrap gap-1">
      {Array.from({ length: totalDays }, (_, i) => {
        const day = i + 1;
        const isPresent = presentSet.has(day);
        return (
          <div
            key={day}
            className={cn(
              'h-3 w-3 rounded-sm',
              isPresent ? 'bg-bb-success' : 'bg-bb-gray-300',
            )}
            title={`Dia ${day}: ${isPresent ? 'Presente' : 'Ausente'}`}
          />
        );
      })}
    </div>
  );
}

// ── Week Calendar Component ────────────────────────────────────────────

function WeekCalendar({ semana }: { semana: DiaSemanaDTO[] }) {
  const today = new Date().toISOString().split('T')[0];
  return (
    <div className="grid grid-cols-6 gap-2">
      {semana.map((dia) => {
        const isToday = dia.date === today;
        return (
          <div
            key={dia.date}
            className={cn(
              'flex flex-col items-center rounded-lg border p-2 text-center transition-all',
              getDayStatusClass(dia.status),
              isToday && 'ring-2 ring-bb-red ring-offset-1',
            )}
          >
            <span className="text-[10px] font-semibold uppercase">{dia.day_short}</span>
            <span className="mt-0.5 text-lg">{getDayStatusIcon(dia.status)}</span>
            {dia.classes.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {dia.classes.map((cls, idx) => (
                  <p key={idx} className="text-[9px] leading-tight opacity-80">{cls}</p>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Dashboard Skeleton ─────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton variant="text" className="h-8 w-3/4" />
      <Skeleton variant="card" className="h-36" />
      <Skeleton variant="card" className="h-28" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton variant="card" className="h-24" />
        <Skeleton variant="card" className="h-24" />
      </div>
      <Skeleton variant="card" className="h-20" />
      <Skeleton variant="card" className="h-32" />
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────

export default function StudentDashboardPage() {
  const [data, setData] = useState<AlunoDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const d = await getAlunoDashboard('stu-1');
      setData(d);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  if (loading) return <DashboardSkeleton />;
  if (!data) return null;

  const freqPct = data.frequenciaMes.total_aulas > 0
    ? Math.round((data.frequenciaMes.presencas / data.frequenciaMes.total_aulas) * 100)
    : 0;
  const freqDelta = freqPct - data.frequenciaMesAnteriorPct;
  const freqDeltaStr = freqDelta >= 0 ? `\u2191${freqDelta}%` : `\u2193${Math.abs(freqDelta)}%`;

  const classIsNow = data.proximaAula
    ? isClassNow(data.proximaAula.start_time, data.proximaAula.end_time)
    : false;

  const daysActive = Math.round(
    (new Date().getTime() - new Date(data.membro_desde).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="relative space-y-4 p-4 pb-24">
      {/* Pull-to-refresh indicator */}
      {refreshing && (
        <div className="flex items-center justify-center py-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-bb-red border-t-transparent" />
        </div>
      )}

      {/* ── Emotional Header ────────────────────────────────────── */}
      <section>
        <h1 className="text-2xl font-bold text-bb-black">
          Fala, {data.student_name}! {'\uD83D\uDD25'} {daysActive} dias. Top {data.ranking_position} da academia.
        </h1>
        <p className="mt-1 text-sm text-bb-gray-500">
          {data.ranking_position}/{data.total_academy_students} alunos
        </p>
      </section>

      {/* ── Hero Card: Next Class ───────────────────────────────── */}
      {data.proximaAula ? (
        <Card variant="elevated" className="relative overflow-hidden border-l-4 border-bb-red p-4">
          {classIsNow && (
            <div className="absolute right-3 top-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bb-red opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-bb-red" />
              </span>
            </div>
          )}
          <p className="text-xs font-semibold uppercase text-bb-gray-500">
            {classIsNow ? 'Aula Agora' : 'Proxima Aula'}
          </p>
          <p className="mt-1 text-lg font-bold text-bb-black">
            {data.proximaAula.modality_name} {data.proximaAula.level_label && `\u00B7 ${data.proximaAula.level_label}`}
          </p>
          <p className="text-sm text-bb-gray-500">
            {data.proximaAula.start_time} \u00B7 Prof. {data.proximaAula.professor_name} \u00B7{' '}
            {classIsNow ? 'AGORA' : formatTimeUntil(data.proximaAula.start_time)}
          </p>
          <Button
            variant="primary"
            size="md"
            className={cn(
              'mt-3 w-full',
              classIsNow && 'animate-pulse',
            )}
          >
            {classIsNow ? 'Check-in Agora \u2192' : 'Check-in \u2192'}
          </Button>
        </Card>
      ) : (
        <Card variant="elevated" className="p-4 text-center">
          <p className="text-lg">{'\uD83D\uDE34'}</p>
          <p className="font-semibold text-bb-black">Descansa!</p>
          {data.proximaAulaAmanha ? (
            <p className="mt-1 text-sm text-bb-gray-500">
              Amanha: {data.proximaAulaAmanha.modality_name} {data.proximaAulaAmanha.start_time}
            </p>
          ) : (
            <p className="mt-1 text-sm text-bb-gray-500">Sem aulas agendadas para amanha.</p>
          )}
        </Card>
      )}

      {/* ── Belt Progression Card ───────────────────────────────── */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-bb-gray-500">Progressao de Faixa</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge
                variant="belt"
                beltColor={BELT_COLOR_MAP[data.progressoFaixa.faixa_atual]}
                size="md"
              >
                {BELT_LABEL_MAP[data.progressoFaixa.faixa_atual]}
              </Badge>
              <span className="text-bb-gray-500">{'\u2192'}</span>
              <Badge
                variant="belt"
                beltColor={BELT_COLOR_MAP[data.progressoFaixa.proxima_faixa]}
                size="md"
              >
                {BELT_LABEL_MAP[data.progressoFaixa.proxima_faixa]}
              </Badge>
            </div>
          </div>
          <span className="text-3xl font-bold text-bb-red">{data.progressoFaixa.percentual}%</span>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-bb-gray-300">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${data.progressoFaixa.percentual}%`,
              backgroundColor: BELT_COLOR_MAP[data.progressoFaixa.proxima_faixa],
            }}
          />
        </div>
        <p className="mt-1 text-xs text-bb-gray-500">
          {data.progressoFaixa.aulas_concluidas}/{data.progressoFaixa.aulas_necessarias} aulas
        </p>

        {/* Requirements */}
        {data.progressoFaixa.requisitos.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {data.progressoFaixa.requisitos.map((req) => (
              <div key={req.label} className="flex items-center gap-2 text-xs">
                <span>{req.completo ? '\u2705' : '\u26AA'}</span>
                <span className={cn('flex-1', req.completo ? 'text-bb-success' : 'text-bb-gray-700')}>
                  {req.label}
                </span>
                <span className="font-mono text-bb-gray-500">
                  {req.atual}/{req.necessario}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Frequency Card ──────────────────────────────────────── */}
      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-bb-gray-500">Frequencia</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-bb-black">
                {data.frequenciaMes.presencas}/{data.frequenciaMes.total_aulas}
              </span>
              <span className="text-sm text-bb-gray-500">({freqPct}%)</span>
              <span
                className={cn(
                  'text-sm font-medium',
                  freqDelta >= 0 ? 'text-bb-success' : 'text-bb-error',
                )}
              >
                {freqDeltaStr}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-bb-gray-500">{data.frequenciaMes.mes_label}</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl">{'\uD83D\uDD25'}</span>
            <span className="text-xl font-bold text-bb-red">{data.streak}</span>
            <span className="text-[10px] text-bb-gray-500">streak</span>
          </div>
        </div>
        <div className="mt-3">
          <MiniHeatmap
            diasPresentes={data.frequenciaMes.dias_presentes}
            totalDays={new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()}
          />
        </div>
      </Card>

      {/* ── Achievements ────────────────────────────────────────── */}
      {data.ultimasConquistas.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold text-bb-black">Conquistas</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {data.ultimasConquistas.map((conquista) => (
              <Card key={conquista.id} className="flex w-20 flex-shrink-0 flex-col items-center p-3 text-center">
                <span className="text-2xl">{conquista.icon}</span>
                <p className="mt-1 text-[10px] font-medium leading-tight text-bb-black">{conquista.name}</p>
              </Card>
            ))}
          </div>
          {data.proximaConquista && (
            <Card variant="outlined" className="mt-2 flex items-center gap-3 p-3">
              <span className="text-xl opacity-50">{data.proximaConquista.icon}</span>
              <div className="flex-1">
                <p className="text-xs font-semibold text-bb-black">
                  Proxima: {data.proximaConquista.name}
                </p>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bb-gray-300">
                  <div
                    className="h-full rounded-full bg-bb-warning"
                    style={{
                      width: `${Math.round((data.proximaConquista.progress_current / data.proximaConquista.progress_target) * 100)}%`,
                    }}
                  />
                </div>
                <p className="mt-0.5 text-[10px] text-bb-gray-500">
                  Faltam {data.proximaConquista.progress_target - data.proximaConquista.progress_current} dias
                </p>
              </div>
            </Card>
          )}
        </section>
      )}

      {/* ── Continue Watching ───────────────────────────────────── */}
      {data.continuarAssistindo && (
        <section>
          <h2 className="mb-2 font-semibold text-bb-black">Continuar Assistindo</h2>
          <Card variant="outlined" className="flex items-center gap-3 p-3">
            <div className="flex h-14 w-20 flex-shrink-0 items-center justify-center rounded bg-bb-gray-300 text-sm text-bb-gray-500">
              {'\u25B6\uFE0F'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-bb-black">{data.continuarAssistindo.title}</p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bb-gray-300">
                <div
                  className="h-full rounded-full bg-bb-red"
                  style={{ width: `${data.continuarAssistindo.progress_pct}%` }}
                />
              </div>
              <p className="mt-0.5 text-[10px] text-bb-gray-500">
                {Math.round(data.continuarAssistindo.watched_seconds / 60)}min de{' '}
                {Math.round(data.continuarAssistindo.duration / 60)}min
              </p>
            </div>
            <Button variant="primary" size="sm">
              Continuar
            </Button>
          </Card>
        </section>
      )}

      {/* ── My Week ─────────────────────────────────────────────── */}
      <section>
        <h2 className="mb-2 font-semibold text-bb-black">Minha Semana</h2>
        <WeekCalendar semana={data.semana} />
      </section>

      {/* ── Recommended Content ─────────────────────────────────── */}
      {data.conteudoRecomendado.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold text-bb-black">Recomendado para Voce</h2>
          <div className="space-y-2">
            {data.conteudoRecomendado.map((video) => (
              <Card key={video.video_id} className="flex items-center gap-3 p-3">
                <div className="flex h-12 w-16 flex-shrink-0 items-center justify-center rounded bg-bb-gray-300 text-xs text-bb-gray-500">
                  {video.duration}min
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-bb-black">{video.title}</p>
                  <Badge
                    variant="belt"
                    beltColor={BELT_COLOR_MAP[video.belt_level]}
                    size="sm"
                  >
                    {BELT_LABEL_MAP[video.belt_level]}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ── Mobile FAB: Check-in (visible when class active) ──── */}
      {data.proximaAula && (
        <div className="fixed bottom-20 right-4 z-50 md:hidden">
          <button
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-full bg-bb-red text-bb-white shadow-lg transition-transform active:scale-95',
              classIsNow && 'animate-bounce',
            )}
            aria-label="Check-in"
            onClick={handleRefresh}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

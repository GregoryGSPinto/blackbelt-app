'use client';

import { forwardRef } from 'react';
import type { TournamentMatch } from '@/lib/api/compete.service';
import {
  ClockIcon,
  TrophyIcon,
} from '@/components/shell/icons';

// ── Types ──────────────────────────────────────────────────────────────

interface LiveScoreboardProps {
  match: TournamentMatch;
  area: number;
  categoryLabel?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ── Component ──────────────────────────────────────────────────────────

const LiveScoreboard = forwardRef<HTMLDivElement, LiveScoreboardProps>(
  function LiveScoreboard({ match, area, categoryLabel }, ref) {
    const isLive = match.status === 'in_progress';
    const isFinished = match.status === 'completed';

    const winnerIsA = match.winner_id === match.athlete1_id;
    const winnerIsB = match.winner_id === match.athlete2_id;

    return (
      <div
        ref={ref}
        className="overflow-hidden"
        style={{
          background: 'var(--bb-depth-2)',
          border: isLive ? '2px solid var(--bb-brand)' : '1px solid var(--bb-glass-border)',
          borderRadius: 'var(--bb-radius-lg)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-2"
          style={{
            background: 'var(--bb-depth-3)',
            borderBottom: '1px solid var(--bb-glass-border)',
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold"
              style={{ background: 'var(--bb-brand-surface)', color: 'var(--bb-brand)' }}
            >
              A{area}
            </span>
            <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
              {categoryLabel ?? match.category_name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Status indicator */}
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{
                background: isLive
                  ? 'rgba(239,68,68,0.15)'
                  : isFinished
                    ? 'rgba(168,85,247,0.15)'
                    : 'rgba(107,114,128,0.15)',
                color: isLive ? '#EF4444' : isFinished ? '#A855F7' : '#6B7280',
              }}
            >
              {isLive ? 'Em luta' : isFinished ? 'Finalizada' : 'Aguardando'}
            </span>
            {isLive && (
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  background: '#EF4444',
                  animation: 'bb-pulse 1.5s ease-in-out infinite',
                }}
              />
            )}
          </div>
        </div>

        {/* Scoreboard body */}
        <div className="flex">
          {/* Fighter A - Red corner */}
          <div
            className="flex-1 flex flex-col items-center py-4 px-3"
            style={{
              background: isFinished && winnerIsA ? 'var(--bb-brand-surface)' : 'transparent',
              borderRight: '1px solid var(--bb-glass-border)',
            }}
          >
            {/* Corner label */}
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider mb-2"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}
            >
              Vermelho
            </span>

            {/* Name */}
            <p
              className="text-sm font-bold text-center truncate max-w-full"
              style={{
                color: isFinished && winnerIsA ? 'var(--bb-brand)' : 'var(--bb-ink-100)',
              }}
            >
              {match.athlete1_name || 'A definir'}
            </p>

            {/* Score */}
            <p
              className="text-4xl font-extrabold mt-3"
              style={{
                color: isFinished && winnerIsA ? 'var(--bb-brand)' : 'var(--bb-ink-100)',
              }}
            >
              {match.score_athlete1}
            </p>

            {/* Advantages / Penalties */}
            <div className="mt-2 flex gap-3">
              <div className="text-center">
                <p className="text-lg font-bold" style={{ color: '#EAB308' }}>
                  {match.advantages_athlete1}
                </p>
                <p className="text-[9px] uppercase" style={{ color: 'var(--bb-ink-40)' }}>
                  Vant.
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold" style={{ color: '#EF4444' }}>
                  {match.penalties_athlete1}
                </p>
                <p className="text-[9px] uppercase" style={{ color: 'var(--bb-ink-40)' }}>
                  Pen.
                </p>
              </div>
            </div>

            {/* Winner indicator */}
            {isFinished && winnerIsA && (
              <div
                className="mt-3 flex items-center gap-1 rounded-full px-3 py-1"
                style={{ background: 'var(--bb-brand-surface)' }}
              >
                <TrophyIcon className="h-3.5 w-3.5" style={{ color: 'var(--bb-brand)' }} />
                <span className="text-[10px] font-bold" style={{ color: 'var(--bb-brand)' }}>
                  VENCEDOR
                </span>
              </div>
            )}
          </div>

          {/* Fighter B - Blue corner */}
          <div
            className="flex-1 flex flex-col items-center py-4 px-3"
            style={{
              background: isFinished && winnerIsB ? 'var(--bb-brand-surface)' : 'transparent',
            }}
          >
            {/* Corner label */}
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider mb-2"
              style={{ background: 'rgba(59,130,246,0.15)', color: '#3B82F6' }}
            >
              Azul
            </span>

            {/* Name */}
            <p
              className="text-sm font-bold text-center truncate max-w-full"
              style={{
                color: isFinished && winnerIsB ? 'var(--bb-brand)' : 'var(--bb-ink-100)',
              }}
            >
              {match.athlete2_name || 'A definir'}
            </p>

            {/* Score */}
            <p
              className="text-4xl font-extrabold mt-3"
              style={{
                color: isFinished && winnerIsB ? 'var(--bb-brand)' : 'var(--bb-ink-100)',
              }}
            >
              {match.score_athlete2}
            </p>

            {/* Advantages / Penalties */}
            <div className="mt-2 flex gap-3">
              <div className="text-center">
                <p className="text-lg font-bold" style={{ color: '#EAB308' }}>
                  {match.advantages_athlete2}
                </p>
                <p className="text-[9px] uppercase" style={{ color: 'var(--bb-ink-40)' }}>
                  Vant.
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold" style={{ color: '#EF4444' }}>
                  {match.penalties_athlete2}
                </p>
                <p className="text-[9px] uppercase" style={{ color: 'var(--bb-ink-40)' }}>
                  Pen.
                </p>
              </div>
            </div>

            {/* Winner indicator */}
            {isFinished && winnerIsB && (
              <div
                className="mt-3 flex items-center gap-1 rounded-full px-3 py-1"
                style={{ background: 'var(--bb-brand-surface)' }}
              >
                <TrophyIcon className="h-3.5 w-3.5" style={{ color: 'var(--bb-brand)' }} />
                <span className="text-[10px] font-bold" style={{ color: 'var(--bb-brand)' }}>
                  VENCEDOR
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer: Timer + Method */}
        <div
          className="flex items-center justify-between px-4 py-2"
          style={{
            background: 'var(--bb-depth-3)',
            borderTop: '1px solid var(--bb-glass-border)',
          }}
        >
          <div className="flex items-center gap-1.5">
            <ClockIcon className="h-3.5 w-3.5" style={{ color: 'var(--bb-ink-40)' }} />
            <span
              className="text-sm font-mono font-bold"
              style={{ color: isLive ? 'var(--bb-brand)' : 'var(--bb-ink-60)' }}
            >
              {formatTime(match.duration_seconds ?? 0)}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
              {match.status === 'completed' ? '' : `/ ${formatTime(match.duration_seconds ?? 0)}`}
            </span>
          </div>
          {match.method && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ background: 'var(--bb-brand-surface)', color: 'var(--bb-brand)' }}
            >
              {match.method}
            </span>
          )}
        </div>

        {/* CSS for pulse animation */}
        <style>{`
          @keyframes bb-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>
      </div>
    );
  },
);

LiveScoreboard.displayName = 'LiveScoreboard';

export { LiveScoreboard };

'use client';

import { forwardRef, useMemo } from 'react';
import type { TournamentMatch } from '@/lib/api/compete.service';

// ── Types ──────────────────────────────────────────────────────────────

interface BracketViewProps {
  matches: TournamentMatch[];
  categoryLabel: string;
}

// ── Constants ──────────────────────────────────────────────────────────

const MATCH_W = 220;
const MATCH_H = 64;
const GAP_X = 60;
const GAP_Y = 24;
const PADDING = 24;

function getRoundLabel(round: number, totalRounds: number): string {
  const fromFinal = totalRounds - round;
  if (fromFinal === 0) return 'Final';
  if (fromFinal === 1) return 'Semi';
  if (fromFinal === 2) return 'Quartas';
  if (fromFinal === 3) return 'Oitavas';
  return `Rodada ${round}`;
}

// ── Component ──────────────────────────────────────────────────────────

const BracketView = forwardRef<HTMLDivElement, BracketViewProps>(
  function BracketView({ matches, categoryLabel }, ref) {
    const { rounds, totalRounds, svgWidth, svgHeight, matchPositions } = useMemo(() => {
      if (matches.length === 0) {
        return { rounds: {} as Record<number, TournamentMatch[]>, totalRounds: 0, svgWidth: 0, svgHeight: 0, matchPositions: new Map<string, { x: number; y: number }>() };
      }

      // Group by round
      const roundMap: Record<number, TournamentMatch[]> = {};
      let maxRound = 0;
      for (const m of matches) {
        if (!roundMap[m.round]) roundMap[m.round] = [];
        roundMap[m.round].push(m);
        if (m.round > maxRound) maxRound = m.round;
      }

      // Sort each round by match_number
      for (const r of Object.keys(roundMap)) {
        roundMap[Number(r)].sort((a, b) => a.match_number - b.match_number);
      }

      const tRounds = maxRound;
      const firstRoundCount = roundMap[1]?.length ?? 1;

      // Calculate SVG dimensions
      const width = PADDING * 2 + tRounds * MATCH_W + (tRounds - 1) * GAP_X;
      const height = PADDING * 2 + 30 + firstRoundCount * MATCH_H + (firstRoundCount - 1) * GAP_Y;

      // Calculate match positions
      const positions = new Map<string, { x: number; y: number }>();

      for (let round = 1; round <= tRounds; round++) {
        const roundMatches = roundMap[round] ?? [];
        const matchCount = roundMatches.length;
        const x = PADDING + (round - 1) * (MATCH_W + GAP_X);

        // Vertical spacing increases per round to center between previous round matches
        const totalH = height - PADDING * 2 - 30;
        const slotH = matchCount > 0 ? totalH / matchCount : totalH;

        for (let i = 0; i < matchCount; i++) {
          const y = PADDING + 30 + i * slotH + slotH / 2 - MATCH_H / 2;
          positions.set(roundMatches[i].id, { x, y });
        }
      }

      return {
        rounds: roundMap,
        totalRounds: tRounds,
        svgWidth: width,
        svgHeight: height,
        matchPositions: positions,
      };
    }, [matches]);

    if (matches.length === 0) {
      return (
        <div ref={ref} className="py-8 text-center">
          <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
            Nenhuma luta nesta chave.
          </p>
        </div>
      );
    }

    return (
      <div ref={ref} className="space-y-3">
        <h3 className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          {categoryLabel}
        </h3>

        <div className="overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
          <svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="block"
          >
            {/* Round labels */}
            {Array.from({ length: totalRounds }, (_, i) => i + 1).map((round) => {
              const x = PADDING + (round - 1) * (MATCH_W + GAP_X) + MATCH_W / 2;
              return (
                <text
                  key={`round-label-${round}`}
                  x={x}
                  y={PADDING + 14}
                  textAnchor="middle"
                  fill="var(--bb-ink-40)"
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="inherit"
                >
                  {getRoundLabel(round, totalRounds)}
                </text>
              );
            })}

            {/* Connection lines */}
            {matches.map((match) => {
              const pos = matchPositions.get(match.id);
              if (!pos || match.round <= 1) return null;

              // Find the two source matches from previous round that feed into this match
              const prevRound = rounds[match.round - 1] ?? [];
              const sourceIndex = (match.match_number - 1) * 2;
              const sourceMatches = prevRound.slice(sourceIndex, sourceIndex + 2);

              return sourceMatches.map((src) => {
                const srcPos = matchPositions.get(src.id);
                if (!srcPos) return null;

                const x1 = srcPos.x + MATCH_W;
                const y1 = srcPos.y + MATCH_H / 2;
                const x2 = pos.x;
                const y2 = pos.y + MATCH_H / 2;
                const midX = x1 + (x2 - x1) / 2;

                return (
                  <path
                    key={`line-${src.id}-${match.id}`}
                    d={`M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`}
                    fill="none"
                    stroke="var(--bb-glass-border)"
                    strokeWidth="1.5"
                  />
                );
              });
            })}

            {/* Match boxes */}
            {matches.map((match) => {
              const pos = matchPositions.get(match.id);
              if (!pos) return null;

              const isInProgress = match.status === 'in_progress';
              const isFinished = match.status === 'completed';

              return (
                <g key={match.id} transform={`translate(${pos.x}, ${pos.y})`}>
                  {/* Match box background */}
                  <rect
                    width={MATCH_W}
                    height={MATCH_H}
                    rx={8}
                    ry={8}
                    fill="var(--bb-depth-2)"
                    stroke={isInProgress ? 'var(--bb-brand)' : 'var(--bb-glass-border)'}
                    strokeWidth={isInProgress ? 2 : 1}
                  >
                    {isInProgress && (
                      <animate
                        attributeName="stroke-opacity"
                        values="1;0.4;1"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    )}
                  </rect>

                  {/* Divider line */}
                  <line
                    x1={0}
                    y1={MATCH_H / 2}
                    x2={MATCH_W}
                    y2={MATCH_H / 2}
                    stroke="var(--bb-glass-border)"
                    strokeWidth="0.5"
                  />

                  {/* Fighter A */}
                  <text
                    x={8}
                    y={MATCH_H / 2 - 8}
                    fill={
                      isFinished && match.winner_id === match.athlete1_id
                        ? 'var(--bb-brand)'
                        : 'var(--bb-ink-100)'
                    }
                    fontSize="11"
                    fontWeight={
                      isFinished && match.winner_id === match.athlete1_id ? '700' : '500'
                    }
                    fontFamily="inherit"
                  >
                    {match.athlete1_name || 'A definir'}
                  </text>
                  {/* Score A */}
                  <text
                    x={MATCH_W - 8}
                    y={MATCH_H / 2 - 8}
                    textAnchor="end"
                    fill={
                      isFinished && match.winner_id === match.athlete1_id
                        ? 'var(--bb-brand)'
                        : 'var(--bb-ink-80)'
                    }
                    fontSize="12"
                    fontWeight="700"
                    fontFamily="inherit"
                  >
                    {match.score_athlete1}
                  </text>

                  {/* Fighter B */}
                  <text
                    x={8}
                    y={MATCH_H / 2 + 18}
                    fill={
                      isFinished && match.winner_id === match.athlete2_id
                        ? 'var(--bb-brand)'
                        : 'var(--bb-ink-100)'
                    }
                    fontSize="11"
                    fontWeight={
                      isFinished && match.winner_id === match.athlete2_id ? '700' : '500'
                    }
                    fontFamily="inherit"
                  >
                    {match.athlete2_name || 'A definir'}
                  </text>
                  {/* Score B */}
                  <text
                    x={MATCH_W - 8}
                    y={MATCH_H / 2 + 18}
                    textAnchor="end"
                    fill={
                      isFinished && match.winner_id === match.athlete2_id
                        ? 'var(--bb-brand)'
                        : 'var(--bb-ink-80)'
                    }
                    fontSize="12"
                    fontWeight="700"
                    fontFamily="inherit"
                  >
                    {match.score_athlete2}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  },
);

BracketView.displayName = 'BracketView';

export { BracketView };

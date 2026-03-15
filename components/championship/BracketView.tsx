'use client';

import { forwardRef } from 'react';
import type { MatchDTO } from '@/lib/api/brackets.service';

interface BracketViewProps {
  matches: MatchDTO[];
  totalRounds: number;
  onMatchClick?: (match: MatchDTO) => void;
}

const ROUND_LABELS: Record<number, string> = {
  1: 'Oitavas',
  2: 'Quartas',
  3: 'Semifinal',
  4: 'Final',
};

function getRoundLabel(round: number, totalRounds: number): string {
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return 'Final';
  if (fromEnd === 1) return 'Semifinal';
  if (fromEnd === 2) return 'Quartas';
  if (fromEnd === 3) return 'Oitavas';
  return ROUND_LABELS[round] ?? `Rodada ${round}`;
}

function formatMethod(method: string | null): string {
  if (!method) return '';
  const labels: Record<string, string> = {
    submission: 'Finalização',
    points: 'Pontos',
    dq: 'Desclassificação',
    walkover: 'W.O.',
  };
  return labels[method] ?? method;
}

const BracketView = forwardRef<HTMLDivElement, BracketViewProps>(function BracketView(
  { matches, totalRounds, onMatchClick },
  ref,
) {
  const rounds = Array.from({ length: totalRounds }, (_, i) => i + 1);

  return (
    <div ref={ref} className="overflow-x-auto pb-4">
      <div className="inline-flex min-w-max gap-0">
        {rounds.map((round) => {
          const roundMatches = matches
            .filter((m) => m.round === round)
            .sort((a, b) => a.position - b.position);

          // Calculate spacing: each subsequent round needs more vertical spacing
          // to align with the connecting matches from the previous round
          const matchHeight = 80; // approximate height of a match card
          const gap = round === 1 ? 8 : 0;
          const spaceBetween = Math.pow(2, round - 1) * (matchHeight + gap) - matchHeight;

          return (
            <div key={round} className="flex flex-col" style={{ minWidth: 220 }}>
              {/* Round Header */}
              <div className="mb-3 px-2 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-bb-gray-500">
                  {getRoundLabel(round, totalRounds)}
                </span>
              </div>

              {/* Matches */}
              <div
                className="flex flex-1 flex-col justify-around"
                style={{ gap: `${spaceBetween}px` }}
              >
                {roundMatches.map((match) => {
                  const isComplete = !!match.winner_id;
                  const aIsWinner = match.winner_id === match.fighter_a_id && isComplete;
                  const bIsWinner = match.winner_id === match.fighter_b_id && isComplete;

                  return (
                    <div key={match.id} className="flex items-center">
                      {/* Connector line from previous round */}
                      {round > 1 && (
                        <div className="flex h-full w-4 flex-col items-center justify-center">
                          <div className="h-px w-full bg-bb-gray-300" />
                        </div>
                      )}

                      {/* Match Card */}
                      <button
                        type="button"
                        onClick={() => onMatchClick?.(match)}
                        className={`flex-1 rounded-lg border transition-all ${
                          isComplete
                            ? 'border-bb-gray-200 bg-white'
                            : 'border-bb-gray-200 bg-bb-gray-50'
                        } hover:border-bb-primary/40 hover:shadow-sm`}
                        style={{ minHeight: `${matchHeight}px` }}
                      >
                        {/* Fighter A */}
                        <div
                          className={`flex items-center justify-between border-b border-bb-gray-100 px-3 py-2 ${
                            aIsWinner
                              ? 'bg-green-50 font-semibold text-green-700'
                              : isComplete && !aIsWinner
                                ? 'text-bb-gray-400'
                                : 'text-bb-black'
                          }`}
                        >
                          <span className="truncate text-xs">
                            {match.fighter_a_name ?? 'A definir'}
                          </span>
                          {match.score_a !== null && (
                            <span className="ml-2 min-w-[20px] text-right text-xs font-bold">
                              {match.score_a}
                            </span>
                          )}
                        </div>

                        {/* Fighter B */}
                        <div
                          className={`flex items-center justify-between px-3 py-2 ${
                            bIsWinner
                              ? 'bg-green-50 font-semibold text-green-700'
                              : isComplete && !bIsWinner
                                ? 'text-bb-gray-400'
                                : 'text-bb-black'
                          }`}
                        >
                          <span className="truncate text-xs">
                            {match.fighter_b_name ?? 'A definir'}
                          </span>
                          {match.score_b !== null && (
                            <span className="ml-2 min-w-[20px] text-right text-xs font-bold">
                              {match.score_b}
                            </span>
                          )}
                        </div>

                        {/* Method/Info row */}
                        {isComplete && match.method && (
                          <div className="border-t border-bb-gray-100 px-3 py-1 text-center">
                            <span className="text-[10px] text-bb-gray-400">
                              {formatMethod(match.method)}
                              {match.notes ? ` - ${match.notes}` : ''}
                            </span>
                          </div>
                        )}

                        {/* Mat & Time */}
                        {match.mat_number && !isComplete && (
                          <div className="border-t border-bb-gray-100 px-3 py-1 text-center">
                            <span className="text-[10px] text-bb-gray-400">
                              Mat {match.mat_number}
                              {match.scheduled_time
                                ? ` - ${new Date(match.scheduled_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                                : ''}
                            </span>
                          </div>
                        )}
                      </button>

                      {/* Connector line to next round */}
                      {round < totalRounds && (
                        <div className="flex h-full w-4 flex-col items-center justify-center">
                          <div className="h-px w-full bg-bb-gray-300" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

BracketView.displayName = 'BracketView';
export { BracketView };

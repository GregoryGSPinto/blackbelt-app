'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  getTournament,
  getBracket,
  getCategories,
  type Tournament,
  type TournamentMatch,
  type TournamentCategory,
} from '@/lib/api/compete.service';
import {
  AwardIcon,
  ChevronRightIcon,
} from '@/components/shell/icons';

// -- Helpers -----------------------------------------------------------------

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// -- Match Detail Modal ------------------------------------------------------

function MatchDetailModal({ match, onClose }: { match: TournamentMatch; onClose: () => void }) {
  const winnerName = match.winner_id
    ? (match.winner_id === match.athlete1_id ? match.athlete1_name : match.athlete2_name)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-md rounded-xl p-6"
        style={{ backgroundColor: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded p-1"
          style={{ color: 'var(--bb-ink-40)' }}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <p className="mb-4 text-center text-xs" style={{ color: 'var(--bb-ink-40)' }}>
          Round {match.round} - Luta {match.match_number}
          {match.area != null && ` | Area ${match.area}`}
        </p>

        <div className="flex items-center gap-4">
          {/* Fighter A */}
          <div className="flex-1 text-center">
            <p className="text-sm font-bold" style={{ color: match.winner_id === match.athlete1_id ? '#22c55e' : 'var(--bb-ink-100)' }}>
              {match.athlete1_name ?? '\u2014'}
            </p>
            <p className="mt-2 text-3xl font-black" style={{ color: 'var(--bb-ink-100)' }}>{match.score_athlete1}</p>
            <div className="mt-1 text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
              V: {match.advantages_athlete1} | P: {match.penalties_athlete1}
            </div>
          </div>

          <span className="text-xs font-bold" style={{ color: 'var(--bb-ink-40)' }}>VS</span>

          {/* Fighter B */}
          <div className="flex-1 text-center">
            <p className="text-sm font-bold" style={{ color: match.winner_id === match.athlete2_id ? '#22c55e' : 'var(--bb-ink-100)' }}>
              {match.athlete2_name ?? '\u2014'}
            </p>
            <p className="mt-2 text-3xl font-black" style={{ color: 'var(--bb-ink-100)' }}>{match.score_athlete2}</p>
            <div className="mt-1 text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
              V: {match.advantages_athlete2} | P: {match.penalties_athlete2}
            </div>
          </div>
        </div>

        {winnerName && (
          <div className="mt-4 rounded-lg p-3 text-center" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--bb-radius-sm)' }}>
            <p className="text-sm font-bold" style={{ color: '#22c55e' }}>
              Vencedor: {winnerName}
            </p>
            {match.method && (
              <p className="mt-0.5 text-xs" style={{ color: '#22c55e' }}>
                por {match.method}
                {match.duration_seconds != null && ` | ${formatTime(match.duration_seconds)}`}
              </p>
            )}
          </div>
        )}

        {match.status === 'pending' && (
          <div className="mt-4 text-center">
            <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
              {match.scheduled_time
                ? `Agendado para ${new Date(match.scheduled_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                : 'Aguardando'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// -- Bracket Match Slot ------------------------------------------------------

function BracketMatchSlot({ match, onClick }: { match: TournamentMatch; onClick: () => void }) {
  const isFinished = match.status === 'completed';
  const isLive = match.status === 'in_progress';

  return (
    <button
      onClick={onClick}
      className="w-48 text-left transition-all hover:-translate-y-0.5"
      style={{
        backgroundColor: 'var(--bb-depth-3)',
        border: `1px solid ${isLive ? 'var(--bb-brand)' : 'var(--bb-glass-border)'}`,
        borderRadius: 'var(--bb-radius-sm)',
      }}
    >
      {/* Fighter A */}
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{
          borderBottom: '1px solid var(--bb-glass-border)',
          opacity: isFinished && match.winner_id !== match.athlete1_id ? 0.4 : 1,
          backgroundColor: isFinished && match.winner_id === match.athlete1_id ? 'rgba(34,197,94,0.1)' : 'transparent',
        }}
      >
        <span className="truncate text-xs font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
          {match.athlete1_name ?? '\u2014'}
        </span>
        <span className="ml-2 text-xs font-bold" style={{ color: 'var(--bb-ink-80)' }}>
          {isFinished || isLive ? match.score_athlete1 : ''}
        </span>
      </div>
      {/* Fighter B */}
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{
          opacity: isFinished && match.winner_id !== match.athlete2_id ? 0.4 : 1,
          backgroundColor: isFinished && match.winner_id === match.athlete2_id ? 'rgba(34,197,94,0.1)' : 'transparent',
        }}
      >
        <span className="truncate text-xs font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
          {match.athlete2_name ?? '\u2014'}
        </span>
        <span className="ml-2 text-xs font-bold" style={{ color: 'var(--bb-ink-80)' }}>
          {isFinished || isLive ? match.score_athlete2 : ''}
        </span>
      </div>
      {/* Status */}
      {isLive && (
        <div className="px-3 py-1 text-center" style={{ backgroundColor: 'var(--bb-brand)' }}>
          <span className="text-[10px] font-bold text-white">AO VIVO</span>
        </div>
      )}
    </button>
  );
}

// -- Main Page ---------------------------------------------------------------

export default function BracketPage() {
  const params = useParams();
  const slug = params.slug as string;
  const categoriaId = params.categoriaId as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [category, setCategory] = useState<TournamentCategory | null>(null);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<TournamentMatch | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const t = await getTournament(slug);
        setTournament(t);
        const [bracket, cats] = await Promise.all([
          getBracket(categoriaId),
          getCategories(t.id),
        ]);
        setMatches(bracket.matches);
        const cat = cats.find((c) => c.id === categoriaId);
        if (cat) setCategory(cat);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, categoriaId]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4" style={{ backgroundColor: 'var(--bb-depth-1)' }}>
        <svg className="h-8 w-8 animate-spin" style={{ color: 'var(--bb-brand)' }} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
          <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>Carregando chave...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4" style={{ backgroundColor: 'var(--bb-depth-1)' }}>
        <AwardIcon className="h-12 w-12" style={{ color: 'var(--bb-ink-40)' }} />
        <p className="text-lg font-semibold" style={{ color: 'var(--bb-ink-80)' }}>Torneio nao encontrado</p>
      </div>
    );
  }

  // Organize matches by round
  const rounds: Record<number, TournamentMatch[]> = {};
  matches.forEach((m) => {
    if (!rounds[m.round]) rounds[m.round] = [];
    rounds[m.round].push(m);
  });
  const sortedRounds = Object.keys(rounds).map(Number).sort((a, b) => a - b);
  const maxRound = Math.max(...sortedRounds, 0);

  const roundLabels: Record<number, string> = {};
  sortedRounds.forEach((r) => {
    if (r === maxRound) roundLabels[r] = 'Final';
    else if (r === maxRound - 1) roundLabels[r] = 'Semifinais';
    else if (r === maxRound - 2) roundLabels[r] = 'Quartas';
    else roundLabels[r] = `Round ${r}`;
  });

  // Find winner of the final
  const finalMatch = rounds[maxRound]?.[0];
  const champion = finalMatch?.winner_id
    ? (finalMatch.winner_id === finalMatch.athlete1_id ? finalMatch.athlete1_name : finalMatch.athlete2_name)
    : null;

  const categoryLabel = category
    ? `${category.modality} ${category.belt_min ?? ''}–${category.belt_max ?? ''} ${category.weight_min ?? ''}–${category.weight_max ?? ''}kg ${category.age_min ?? ''}–${category.age_max ?? ''} ${category.gender === 'male' ? 'Masculino' : category.gender === 'female' ? 'Feminino' : 'Misto'}`
    : '';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bb-depth-1)' }}>
      {/* Header */}
      <div
        className="border-b px-4 py-6 sm:px-6"
        style={{ backgroundColor: 'var(--bb-depth-2)', borderColor: 'var(--bb-glass-border)' }}
      >
        <div className="mx-auto max-w-6xl">
          <Link
            href={`/compete/${slug}`}
            className="mb-3 inline-flex items-center gap-1.5 text-sm"
            style={{ color: 'var(--bb-ink-40)' }}
          >
            <ChevronRightIcon className="h-4 w-4 rotate-180" /> {tournament.name}
          </Link>
          <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            Chaveamento
          </h1>
          {category && (
            <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              {categoryLabel}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Champion banner */}
        {champion && (
          <div
            className="mb-6 flex items-center justify-center gap-3 rounded-xl p-4"
            style={{ backgroundColor: 'var(--bb-brand-surface)', border: '1px solid var(--bb-brand)', boxShadow: 'var(--bb-brand-glow)', borderRadius: 'var(--bb-radius-lg)' }}
          >
            <AwardIcon className="h-6 w-6 text-yellow-500" />
            <div className="text-center">
              <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Campeao</p>
              <p className="text-lg font-black" style={{ color: 'var(--bb-ink-100)' }}>{champion}</p>
            </div>
          </div>
        )}

        {/* Bracket */}
        {matches.length === 0 ? (
          <div className="py-16 text-center">
            <AwardIcon className="mx-auto h-12 w-12" style={{ color: 'var(--bb-ink-40)' }} />
            <p className="mt-4 font-semibold" style={{ color: 'var(--bb-ink-80)' }}>Chave ainda nao gerada</p>
            <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
              A chave sera gerada apos o encerramento das inscricoes
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-8" style={{ minWidth: `${sortedRounds.length * 220}px` }}>
              {sortedRounds.map((round) => {
                const roundMatches = rounds[round].sort((a, b) => a.match_number - b.match_number);
                return (
                  <div key={round} className="flex flex-col">
                    {/* Round label */}
                    <div className="mb-4 text-center">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
                        {roundLabels[round]}
                      </span>
                    </div>

                    {/* Matches with spacing */}
                    <div
                      className="flex flex-1 flex-col justify-around"
                      style={{ gap: `${Math.pow(2, round - 1) * 16}px` }}
                    >
                      {roundMatches.map((match) => (
                        <div key={match.id} className="relative flex items-center">
                          <BracketMatchSlot
                            match={match}
                            onClick={() => setSelectedMatch(match)}
                          />
                          {/* Connector line to next round */}
                          {round < maxRound && (
                            <div
                              className="absolute -right-4 h-px w-4"
                              style={{ top: '50%', backgroundColor: 'var(--bb-glass-border)' }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Match Detail Modal */}
      {selectedMatch && (
        <MatchDetailModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  );
}

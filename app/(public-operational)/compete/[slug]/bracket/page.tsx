'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  getTournament,
  getCategories,
  getBracket,
  type Tournament,
  type TournamentCategory,
  type TournamentMatch,
} from '@/lib/api/compete.service';
import {
  AwardIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@/components/shell/icons';


function getRoundLabel(round: number, maxRound: number): string {
  const fromFinal = maxRound - round;
  if (fromFinal === 0) return 'Final';
  if (fromFinal === 1) return 'Semifinal';
  if (fromFinal === 2) return 'Quartas';
  if (fromFinal === 3) return 'Oitavas';
  return `Rodada ${round}`;
}

function BracketMatch({ match }: { match: TournamentMatch }) {
  const aWon = match.winner_id === match.athlete1_id;
  const bWon = match.winner_id === match.athlete2_id;
  const isFinished = match.status === 'completed';
  const isLive = match.status === 'in_progress';

  return (
    <div
      className="w-52 flex-shrink-0 overflow-hidden rounded-lg"
      style={{
        backgroundColor: 'var(--bb-depth-2)',
        border: isLive ? '2px solid var(--bb-brand)' : '1px solid var(--bb-glass-border)',
        borderRadius: 'var(--bb-radius-sm)',
      }}
    >
      {/* Fighter A */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{
          backgroundColor: aWon ? 'var(--bb-brand-surface)' : 'transparent',
          borderBottom: '1px solid var(--bb-glass-border)',
        }}
      >
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-xs font-medium"
            style={{ color: aWon ? 'var(--bb-brand)' : 'var(--bb-ink-100)' }}
          >
            {match.athlete1_name || 'A definir'}
          </p>
        </div>
        <div className="ml-2 flex items-center gap-1">
          {isFinished && (
            <span className="text-xs font-bold" style={{ color: aWon ? 'var(--bb-brand)' : 'var(--bb-ink-60)' }}>
              {match.score_athlete1}
            </span>
          )}
          {isLive && (
            <span className="text-xs font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {match.score_athlete1}
            </span>
          )}
        </div>
      </div>

      {/* Fighter B */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ backgroundColor: bWon ? 'var(--bb-brand-surface)' : 'transparent' }}
      >
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-xs font-medium"
            style={{ color: bWon ? 'var(--bb-brand)' : 'var(--bb-ink-100)' }}
          >
            {match.athlete2_name || 'A definir'}
          </p>
        </div>
        <div className="ml-2 flex items-center gap-1">
          {isFinished && (
            <span className="text-xs font-bold" style={{ color: bWon ? 'var(--bb-brand)' : 'var(--bb-ink-60)' }}>
              {match.score_athlete2}
            </span>
          )}
          {isLive && (
            <span className="text-xs font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {match.score_athlete2}
            </span>
          )}
        </div>
      </div>

      {/* Method */}
      {isFinished && match.method && (
        <div
          className="px-3 py-1 text-center text-[9px]"
          style={{ backgroundColor: 'var(--bb-depth-3)', color: 'var(--bb-ink-40)' }}
        >
          {match.method}
        </div>
      )}
      {isLive && (
        <div
          className="flex items-center justify-center gap-1 px-3 py-1 text-[9px] font-bold"
          style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#dc2626' }}
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
          AO VIVO
        </div>
      )}
    </div>
  );
}

export default function BracketPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [categories, setCategories] = useState<TournamentCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBracket, setLoadingBracket] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const t = await getTournament(slug);
        setTournament(t);
        const cats = await getCategories(t.id);
        setCategories(cats);
        if (cats.length > 0) {
          setSelectedCategory(cats[0].id);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  useEffect(() => {
    if (!selectedCategory) return;
    async function loadBracket() {
      setLoadingBracket(true);
      try {
        const bracket = await getBracket(selectedCategory);
        setMatches(bracket.matches);
      } finally {
        setLoadingBracket(false);
      }
    }
    loadBracket();
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4" style={{ backgroundColor: 'var(--bb-depth-1)' }}>
        <svg className="h-8 w-8 animate-spin" style={{ color: 'var(--bb-brand)' }} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
          <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>Carregando chaves...</p>
      </div>
    );
  }

  // Group matches by round
  const rounds = matches.reduce<Record<number, TournamentMatch[]>>((acc, match) => {
    if (!acc[match.round]) acc[match.round] = [];
    acc[match.round].push(match);
    return acc;
  }, {});

  const sortedRounds = Object.keys(rounds).map(Number).sort((a, b) => a - b);
  const maxRound = sortedRounds.length > 0 ? sortedRounds[sortedRounds.length - 1] : 0;

  const selectedCatObj = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bb-depth-1)' }}>
      {/* Header */}
      <div
        className="border-b px-4 py-6 sm:px-6"
        style={{ background: 'var(--bb-brand-gradient)' }}
      >
        <div className="mx-auto max-w-7xl">
          <Link href={`/compete/${slug}`} className="text-xs text-white/60 hover:underline">
            {tournament?.name}
          </Link>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-white sm:text-3xl">
            <AwardIcon className="h-7 w-7" />
            Chaves
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Category selector */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Categoria:</label>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none px-4 py-2.5 pr-10 text-sm outline-none"
              style={{
                backgroundColor: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-100)',
                borderRadius: 'var(--bb-radius-sm)',
                minWidth: '250px',
              }}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--bb-ink-40)' }} />
          </div>
          {selectedCatObj && (
            <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
              {selectedCatObj.registered_count} atletas inscritos
            </span>
          )}
        </div>

        {/* Bracket visualization */}
        {loadingBracket ? (
          <div className="flex items-center justify-center py-20">
            <svg className="h-8 w-8 animate-spin" style={{ color: 'var(--bb-brand)' }} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
              <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        ) : matches.length === 0 ? (
          <div className="py-20 text-center">
            <AwardIcon className="mx-auto h-12 w-12" style={{ color: 'var(--bb-ink-40)' }} />
            <p className="mt-4 font-semibold" style={{ color: 'var(--bb-ink-80)' }}>Chave nao disponivel</p>
            <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
              A chave sera publicada apos o encerramento das inscricoes
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="flex items-stretch gap-6" style={{ minWidth: `${sortedRounds.length * 240}px` }}>
              {sortedRounds.map((round) => {
                const roundMatches = rounds[round].sort((a, b) => a.match_number - b.match_number);
                const label = getRoundLabel(round, maxRound);

                return (
                  <div key={round} className="flex flex-col">
                    {/* Round label */}
                    <div className="mb-3 text-center">
                      <span
                        className="rounded-full px-3 py-1 text-xs font-semibold"
                        style={{
                          backgroundColor: round === maxRound ? 'var(--bb-brand-surface)' : 'var(--bb-depth-3)',
                          color: round === maxRound ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                        }}
                      >
                        {label}
                      </span>
                    </div>

                    {/* Matches */}
                    <div className="flex flex-1 flex-col justify-around gap-4">
                      {roundMatches.map((match) => (
                        <BracketMatch key={match.id} match={match} />
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Champion connector */}
              {sortedRounds.length > 0 && (() => {
                const finalMatches = rounds[maxRound];
                const finalMatch = finalMatches?.[0];
                const winnerName = finalMatch?.winner_id
                  ? (finalMatch.winner_id === finalMatch.athlete1_id ? finalMatch.athlete1_name : finalMatch.athlete2_name)
                  : null;
                if (!winnerName) return null;
                return (
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-2">
                      <ChevronRightIcon className="h-6 w-6" style={{ color: 'var(--bb-ink-40)' }} />
                    </div>
                    <div
                      className="w-52 rounded-xl p-4 text-center"
                      style={{
                        background: 'var(--bb-brand-gradient)',
                        borderRadius: 'var(--bb-radius-lg)',
                        boxShadow: 'var(--bb-shadow-md)',
                      }}
                    >
                      <div className="text-2xl">&#127942;</div>
                      <p className="mt-1 text-sm font-bold text-white">{winnerName}</p>
                      <p className="text-xs text-white/70">Campeao</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

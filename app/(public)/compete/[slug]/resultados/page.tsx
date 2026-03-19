'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  getTournament,
  getCompletedMatches,
  getMedalTable,
  getCategories,
  type Tournament,
  type TournamentMatch,
  type MedalTableEntry,
  type TournamentCategory,
} from '@/lib/api/compete.service';
import {
  AwardIcon,
  FilterIcon,
  ChevronDownIcon,
  TrendingUpIcon,
} from '@/components/shell/icons';

export default function ResultadosPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [medalTable, setMedalTable] = useState<MedalTableEntry[]>([]);
  const [results, setResults] = useState<TournamentMatch[]>([]);
  const [categories, setCategories] = useState<TournamentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const t = await getTournament(slug);
        setTournament(t);
        const [medals, res, cats] = await Promise.all([
          getMedalTable(t.id),
          getCompletedMatches(t.id),
          getCategories(t.id),
        ]);
        setMedalTable(medals);
        setResults(res);
        setCategories(cats);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const filteredResults = categoryFilter
    ? results.filter((r) => r.categoryId === categoryFilter)
    : results;

  // Build a map of categoryId -> category name
  const categoryNameMap = categories.reduce<Record<string, string>>((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {});

  // Group results by category
  const grouped = filteredResults.reduce<Record<string, TournamentMatch[]>>((acc, match) => {
    const key = categoryNameMap[match.categoryId] ?? `Categoria ${match.categoryId}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(match);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4" style={{ backgroundColor: 'var(--bb-depth-1)' }}>
        <svg className="h-8 w-8 animate-spin" style={{ color: 'var(--bb-brand)' }} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
          <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>Carregando resultados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bb-depth-1)' }}>
      {/* Header */}
      <div
        className="border-b px-4 py-6 sm:px-6"
        style={{ background: 'var(--bb-brand-gradient)' }}
      >
        <div className="mx-auto max-w-6xl">
          <Link href={`/compete/${slug}`} className="text-xs text-white/60 hover:underline">
            {tournament?.name}
          </Link>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-white sm:text-3xl">
            <AwardIcon className="h-7 w-7" />
            Resultados
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Medal Table */}
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            <TrendingUpIcon className="h-5 w-5" style={{ color: 'var(--bb-brand)' }} />
            Quadro de medalhas
          </h2>
          <div
            className="overflow-hidden rounded-xl"
            style={{
              backgroundColor: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 'var(--bb-radius-lg)',
            }}
          >
            {medalTable.length === 0 ? (
              <p className="py-12 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                Quadro de medalhas ainda nao disponivel
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                      <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: 'var(--bb-ink-40)' }}>#</th>
                      <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: 'var(--bb-ink-40)' }}>Academia</th>
                      <th className="hidden px-4 py-3 text-center text-xs font-bold sm:table-cell" style={{ color: 'var(--bb-ink-40)' }}>Atletas</th>
                      <th className="px-4 py-3 text-center text-xs font-bold" style={{ color: '#eab308' }}>Ouro</th>
                      <th className="px-4 py-3 text-center text-xs font-bold" style={{ color: '#9ca3af' }}>Prata</th>
                      <th className="px-4 py-3 text-center text-xs font-bold" style={{ color: '#d97706' }}>Bronze</th>
                      <th className="px-4 py-3 text-center text-xs font-bold" style={{ color: 'var(--bb-ink-40)' }}>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medalTable.map((entry) => (
                      <tr
                        key={entry.academyId}
                        style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                      >
                        <td className="px-4 py-3">
                          <span
                            className="text-sm font-bold"
                            style={{ color: entry.position <= 3 ? 'var(--bb-brand)' : 'var(--bb-ink-40)' }}
                          >
                            {entry.position}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{entry.academyName}</p>
                        </td>
                        <td className="hidden px-4 py-3 text-center sm:table-cell" style={{ color: 'var(--bb-ink-60)' }}>{entry.totalAthletes}</td>
                        <td className="px-4 py-3 text-center font-bold" style={{ color: 'var(--bb-ink-100)' }}>{entry.gold}</td>
                        <td className="px-4 py-3 text-center font-bold" style={{ color: 'var(--bb-ink-100)' }}>{entry.silver}</td>
                        <td className="px-4 py-3 text-center font-bold" style={{ color: 'var(--bb-ink-100)' }}>{entry.bronze}</td>
                        <td className="px-4 py-3 text-center font-bold" style={{ color: 'var(--bb-brand)' }}>{entry.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Results by category */}
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              Resultados por categoria
            </h2>
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4" style={{ color: 'var(--bb-ink-40)' }} />
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="appearance-none px-3 py-2 pr-8 text-sm outline-none"
                  style={{
                    backgroundColor: 'var(--bb-depth-2)',
                    border: '1px solid var(--bb-glass-border)',
                    color: 'var(--bb-ink-80)',
                    borderRadius: 'var(--bb-radius-sm)',
                  }}
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--bb-ink-40)' }} />
              </div>

              <button
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium"
                style={{
                  border: '1px solid var(--bb-glass-border)',
                  color: 'var(--bb-ink-80)',
                  borderRadius: 'var(--bb-radius-sm)',
                }}
                onClick={() => {
                  // placeholder: download results
                }}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Baixar
              </button>
            </div>
          </div>

          {Object.keys(grouped).length === 0 ? (
            <div className="py-16 text-center">
              <AwardIcon className="mx-auto h-12 w-12" style={{ color: 'var(--bb-ink-40)' }} />
              <p className="mt-4 font-semibold" style={{ color: 'var(--bb-ink-80)' }}>Nenhum resultado disponivel</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                Os resultados serao publicados ao final das lutas
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([catLabel, matches]) => {
                // Find final match (highest round)
                const sortedByRound = [...matches].sort((a, b) => b.round - a.round);
                const finalMatch = sortedByRound[0];

                return (
                  <div
                    key={catLabel}
                    className="overflow-hidden rounded-xl"
                    style={{
                      backgroundColor: 'var(--bb-depth-2)',
                      border: '1px solid var(--bb-glass-border)',
                      borderRadius: 'var(--bb-radius-lg)',
                    }}
                  >
                    <div
                      className="flex items-center justify-between px-4 py-3"
                      style={{ borderBottom: '1px solid var(--bb-glass-border)', backgroundColor: 'var(--bb-depth-3)' }}
                    >
                      <h3 className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>{catLabel}</h3>
                      <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{matches.length} lutas</span>
                    </div>

                    {/* Winners highlight */}
                    {finalMatch?.winnerName && (
                      <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm" style={{ backgroundColor: 'rgba(234,179,8,0.15)', color: '#eab308' }}>
                          1
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>{finalMatch.winnerName}</p>
                          <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                            {finalMatch.method && `Venceu por ${finalMatch.method}`}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Matches list */}
                    <div className="divide-y" style={{ borderColor: 'var(--bb-glass-border)' }}>
                      {sortedByRound.map((match) => (
                        <div key={match.id} className="flex items-center justify-between px-4 py-2.5">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="flex-shrink-0 text-[10px] font-medium" style={{ color: 'var(--bb-ink-40)' }}>
                              R{match.round}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm" style={{ color: 'var(--bb-ink-100)' }}>
                                <span className={match.winnerId === match.fighterAId ? 'font-bold' : ''}>
                                  {match.fighterAName ?? 'A definir'}
                                </span>
                                <span style={{ color: 'var(--bb-ink-40)' }}> vs </span>
                                <span className={match.winnerId === match.fighterBId ? 'font-bold' : ''}>
                                  {match.fighterBName ?? 'A definir'}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                              {match.scoreA} x {match.scoreB}
                            </p>
                            {match.method && (
                              <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>{match.method}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

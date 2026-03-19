'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  getAthleteRanking,
  getAcademyRanking,
  getCircuits,
  type AthleteProfile,
  type AcademyTournamentStats,
  type TournamentCircuit,
} from '@/lib/api/compete.service';
import {
  TrendingUpIcon,
  FilterIcon,
  ChevronDownIcon,
} from '@/components/shell/icons';

type Tab = 'athletes' | 'academies';

const MODALITIES = ['BJJ', 'No-Gi', 'Judo', 'MMA', 'Muay Thai'];

export default function CompeteRankingPage() {
  const [tab, setTab] = useState<Tab>('athletes');
  const [athletes, setAthletes] = useState<AthleteProfile[]>([]);
  const [academies, setAcademies] = useState<AcademyTournamentStats[]>([]);
  const [circuits, setCircuits] = useState<TournamentCircuit[]>([]);
  const [loading, setLoading] = useState(true);
  const [circuitFilter, setCircuitFilter] = useState('');
  const [modalityFilter, setModalityFilter] = useState('');

  useEffect(() => {
    getCircuits().then(setCircuits);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'athletes') {
        const data = await getAthleteRanking(modalityFilter || undefined);
        setAthletes(data);
      } else {
        const data = await getAcademyRanking(circuitFilter || undefined);
        setAcademies(data);
      }
    } finally {
      setLoading(false);
    }
  }, [tab, circuitFilter, modalityFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bb-depth-1)' }}>
      {/* Header */}
      <div
        className="px-4 py-8 sm:px-6 sm:py-12"
        style={{ background: 'var(--bb-brand-gradient)' }}
      >
        <div className="mx-auto max-w-6xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-white/90" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <TrendingUpIcon className="h-4 w-4" />
            BlackBelt Compete
          </div>
          <h1 className="text-3xl font-black text-white sm:text-4xl">Ranking</h1>
          <p className="mx-auto mt-2 max-w-lg text-white/70">
            Classificacao oficial de atletas e academias no circuito BlackBelt Compete
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Tab toggle */}
        <div className="mb-6 flex items-center justify-center gap-1 rounded-xl p-1" style={{ backgroundColor: 'var(--bb-depth-2)', borderRadius: 'var(--bb-radius-lg)', width: 'fit-content', margin: '0 auto 1.5rem' }}>
          <button
            onClick={() => setTab('athletes')}
            className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-all"
            style={{
              backgroundColor: tab === 'athletes' ? 'var(--bb-brand)' : 'transparent',
              color: tab === 'athletes' ? 'white' : 'var(--bb-ink-60)',
              borderRadius: 'var(--bb-radius-sm)',
            }}
          >
            Atletas
          </button>
          <button
            onClick={() => setTab('academies')}
            className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-all"
            style={{
              backgroundColor: tab === 'academies' ? 'var(--bb-brand)' : 'transparent',
              color: tab === 'academies' ? 'white' : 'var(--bb-ink-60)',
              borderRadius: 'var(--bb-radius-sm)',
            }}
          >
            Academias
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          <FilterIcon className="h-4 w-4" style={{ color: 'var(--bb-ink-40)' }} />
          <div className="relative">
            <select
              value={circuitFilter}
              onChange={(e) => setCircuitFilter(e.target.value)}
              className="appearance-none px-3 py-2 pr-8 text-sm outline-none"
              style={{
                backgroundColor: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-80)',
                borderRadius: 'var(--bb-radius-sm)',
              }}
            >
              <option value="">Todos os circuitos</option>
              {circuits.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--bb-ink-40)' }} />
          </div>

          <div className="relative">
            <select
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value)}
              className="appearance-none px-3 py-2 pr-8 text-sm outline-none"
              style={{
                backgroundColor: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-80)',
                borderRadius: 'var(--bb-radius-sm)',
              }}
            >
              <option value="">Todas as modalidades</option>
              {MODALITIES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--bb-ink-40)' }} />
          </div>
        </div>

        {/* Scoring info */}
        <div
          className="mb-6 rounded-lg p-3 text-center text-xs"
          style={{
            backgroundColor: 'var(--bb-brand-surface)',
            color: 'var(--bb-brand)',
            borderRadius: 'var(--bb-radius-sm)',
          }}
        >
          <strong>Pontuacao:</strong> Ouro = 9pts | Prata = 3pts | Bronze = 1pt.
          Multiplicadores: Local (1x) | Estadual (2x) | Nacional (3x)
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <svg className="h-8 w-8 animate-spin" style={{ color: 'var(--bb-brand)' }} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
              <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>Carregando ranking...</p>
          </div>
        ) : tab === 'athletes' ? (
          /* Athletes ranking */
          <>
            {/* Top 3 podium */}
            {athletes.length >= 3 && (
              <div className="mb-6 flex items-end justify-center gap-3">
                {[athletes[1], athletes[0], athletes[2]].map((a, idx) => {
                  const place = idx === 0 ? 2 : idx === 1 ? 1 : 3;
                  const heights = { 1: 'h-28', 2: 'h-20', 3: 'h-16' };
                  const medals = { 1: '&#129351;', 2: '&#129352;', 3: '&#129353;' };

                  return (
                    <Link
                      key={a.id}
                      href={`/compete/atleta/${a.id}`}
                      className="group flex w-28 flex-col items-center sm:w-36"
                    >
                      <div
                        className="mb-2 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full text-lg font-bold text-white sm:h-16 sm:w-16"
                        style={{
                          backgroundColor: place === 1 ? 'var(--bb-brand)' : 'var(--bb-depth-3)',
                          color: place === 1 ? 'white' : 'var(--bb-ink-60)',
                        }}
                      >
                        {a.avatar_url ? (
                          <img src={a.avatar_url} alt={a.display_name} className="h-full w-full object-cover" />
                        ) : (
                          a.display_name.charAt(0)
                        )}
                      </div>
                      <p className="truncate text-center text-xs font-semibold group-hover:underline" style={{ color: 'var(--bb-ink-100)', maxWidth: '100%' }}>
                        {a.display_name}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>{a.academy_id}</p>
                      <div
                        className={`mt-2 w-full flex items-center justify-center rounded-t-lg ${heights[place as 1 | 2 | 3]}`}
                        style={{
                          background: place === 1 ? 'var(--bb-brand-gradient)' : 'var(--bb-depth-2)',
                          border: '1px solid var(--bb-glass-border)',
                          borderBottom: 'none',
                          borderRadius: 'var(--bb-radius-sm) var(--bb-radius-sm) 0 0',
                        }}
                      >
                        <span className="text-2xl" dangerouslySetInnerHTML={{ __html: medals[place as 1 | 2 | 3] }} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Full table */}
            <div
              className="overflow-hidden rounded-xl"
              style={{
                backgroundColor: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                borderRadius: 'var(--bb-radius-lg)',
              }}
            >
              {athletes.length === 0 ? (
                <p className="py-16 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>Nenhum atleta encontrado</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                        <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: 'var(--bb-ink-40)' }}>#</th>
                        <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: 'var(--bb-ink-40)' }}>Atleta</th>
                        <th className="hidden px-4 py-3 text-left text-xs font-bold sm:table-cell" style={{ color: 'var(--bb-ink-40)' }}>Academia</th>
                        <th className="hidden px-4 py-3 text-center text-xs font-bold md:table-cell" style={{ color: 'var(--bb-ink-40)' }}>Faixa</th>
                        <th className="px-4 py-3 text-center text-xs font-bold" style={{ color: 'var(--bb-ink-40)' }}>Pts</th>
                        <th className="hidden px-4 py-3 text-center text-xs font-bold sm:table-cell" style={{ color: '#eab308' }}>Ouro</th>
                        <th className="hidden px-4 py-3 text-center text-xs font-bold sm:table-cell" style={{ color: '#9ca3af' }}>Prata</th>
                        <th className="hidden px-4 py-3 text-center text-xs font-bold sm:table-cell" style={{ color: '#d97706' }}>Bronze</th>
                      </tr>
                    </thead>
                    <tbody>
                      {athletes.map((a, index) => (
                        <tr
                          key={a.id}
                          className="transition-colors"
                          style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                        >
                          <td className="px-4 py-3">
                            <span className="text-sm font-bold" style={{ color: index < 3 ? 'var(--bb-brand)' : 'var(--bb-ink-40)' }}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Link href={`/compete/atleta/${a.id}`} className="hover:underline">
                              <p className="font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{a.display_name}</p>
                              <p className="text-xs sm:hidden" style={{ color: 'var(--bb-ink-40)' }}>{a.academy_id}</p>
                            </Link>
                          </td>
                          <td className="hidden px-4 py-3 sm:table-cell" style={{ color: 'var(--bb-ink-60)' }}>{a.academy_id}</td>
                          <td className="hidden px-4 py-3 text-center md:table-cell">
                            <span className="rounded px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)' }}>
                              {a.belt}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-bold" style={{ color: 'var(--bb-ink-100)' }}>{a.ranking_points}</td>
                          <td className="hidden px-4 py-3 text-center sm:table-cell" style={{ color: 'var(--bb-ink-60)' }}>{a.medals_gold || '-'}</td>
                          <td className="hidden px-4 py-3 text-center sm:table-cell" style={{ color: 'var(--bb-ink-60)' }}>{a.medals_silver || '-'}</td>
                          <td className="hidden px-4 py-3 text-center sm:table-cell" style={{ color: 'var(--bb-ink-60)' }}>{a.medals_bronze || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Academies ranking */
          <div
            className="overflow-hidden rounded-xl"
            style={{
              backgroundColor: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 'var(--bb-radius-lg)',
            }}
          >
            {academies.length === 0 ? (
              <p className="py-16 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>Nenhuma academia encontrada</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                      <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: 'var(--bb-ink-40)' }}>#</th>
                      <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: 'var(--bb-ink-40)' }}>Academia</th>
                      <th className="hidden px-4 py-3 text-center text-xs font-bold sm:table-cell" style={{ color: 'var(--bb-ink-40)' }}>Atletas</th>
                      <th className="px-4 py-3 text-center text-xs font-bold" style={{ color: 'var(--bb-ink-40)' }}>Pts</th>
                      <th className="px-4 py-3 text-center text-xs font-bold" style={{ color: '#eab308' }}>Ouro</th>
                      <th className="hidden px-4 py-3 text-center text-xs font-bold sm:table-cell" style={{ color: '#9ca3af' }}>Prata</th>
                      <th className="hidden px-4 py-3 text-center text-xs font-bold sm:table-cell" style={{ color: '#d97706' }}>Bronze</th>
                    </tr>
                  </thead>
                  <tbody>
                    {academies.map((a) => (
                      <tr
                        key={a.academy_id}
                        className="transition-colors"
                        style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                      >
                        <td className="px-4 py-3">
                          <span className="text-sm font-bold" style={{ color: a.ranking_position <= 3 ? 'var(--bb-brand)' : 'var(--bb-ink-40)' }}>
                            {a.ranking_position}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{a.academy_name}</p>
                        </td>
                        <td className="hidden px-4 py-3 text-center sm:table-cell" style={{ color: 'var(--bb-ink-60)' }}>{a.total_athletes}</td>
                        <td className="px-4 py-3 text-center font-bold" style={{ color: 'var(--bb-ink-100)' }}>{a.total_points}</td>
                        <td className="px-4 py-3 text-center font-bold" style={{ color: 'var(--bb-ink-100)' }}>{a.medals_gold || '-'}</td>
                        <td className="hidden px-4 py-3 text-center sm:table-cell" style={{ color: 'var(--bb-ink-60)' }}>{a.medals_silver || '-'}</td>
                        <td className="hidden px-4 py-3 text-center sm:table-cell" style={{ color: 'var(--bb-ink-60)' }}>{a.medals_bronze || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  getAthleteProfile,
  getAthleteResults,
  type AthleteProfile,
  type TournamentMatch,
} from '@/lib/api/compete.service';
import {
  AwardIcon,
  TrendingUpIcon,
} from '@/components/shell/icons';

export default function AtletaPage() {
  const params = useParams();
  const id = params.id as string;

  const [athlete, setAthlete] = useState<AthleteProfile | null>(null);
  const [matchHistory, setMatchHistory] = useState<TournamentMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [data, matches] = await Promise.all([
          getAthleteProfile(id),
          getAthleteResults(id),
        ]);
        setAthlete(data);
        setMatchHistory(matches);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4" style={{ backgroundColor: 'var(--bb-depth-1)' }}>
        <svg className="h-8 w-8 animate-spin" style={{ color: 'var(--bb-brand)' }} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
          <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>Carregando perfil...</p>
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4" style={{ backgroundColor: 'var(--bb-depth-1)' }}>
        <AwardIcon className="h-12 w-12" style={{ color: 'var(--bb-ink-40)' }} />
        <p className="text-lg font-semibold" style={{ color: 'var(--bb-ink-80)' }}>Atleta nao encontrado</p>
        <Link href="/compete/ranking" className="text-sm underline" style={{ color: 'var(--bb-brand)' }}>
          Voltar para ranking
        </Link>
      </div>
    );
  }

  const totalFights = athlete.wins + athlete.losses + athlete.draws;
  const winRateDisplay = totalFights > 0
    ? `${((athlete.wins / totalFights) * 100).toFixed(0)}%`
    : '0%';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bb-depth-1)' }}>
      {/* Profile header */}
      <div
        className="relative px-4 pb-8 pt-8 sm:px-6 sm:pt-12"
        style={{ background: 'var(--bb-brand-gradient)' }}
      >
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:gap-6">
            {/* Photo */}
            <div
              className="relative flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white/20 text-3xl font-bold text-white sm:h-32 sm:w-32"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 'var(--bb-radius-lg)',
              }}
            >
              {athlete.avatar_url ? (
                <Image src={athlete.avatar_url} alt={athlete.display_name} fill className="object-cover" />
              ) : (
                athlete.display_name.charAt(0)
              )}
            </div>

            <div className="text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-2xl font-black text-white sm:text-3xl">{athlete.display_name}</h1>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm text-white/70 sm:justify-start">
                <span>{athlete.belt}</span>
                {athlete.weight && (
                  <>
                    <span>|</span>
                    <span>{athlete.weight}kg</span>
                  </>
                )}
              </div>
            </div>

            {/* Ranking badge */}
            {athlete.ranking_points > 0 && (
              <div className="sm:ml-auto">
                <div
                  className="flex flex-col items-center rounded-xl px-6 py-3"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    borderRadius: 'var(--bb-radius-lg)',
                  }}
                >
                  <span className="text-xs text-white/60">Pontos</span>
                  <span className="text-3xl font-black text-white">{athlete.ranking_points}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {[
            { label: 'Vitorias', value: athlete.wins, color: '#16a34a' },
            { label: 'Derrotas', value: athlete.losses, color: '#dc2626' },
            { label: 'Empates', value: athlete.draws, color: 'var(--bb-ink-60)' },
            { label: 'Aproveitamento', value: winRateDisplay, color: 'var(--bb-brand)' },
            { label: 'Pontos', value: athlete.ranking_points, color: 'var(--bb-brand)' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-4 text-center"
              style={{
                backgroundColor: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                borderRadius: 'var(--bb-radius-lg)',
              }}
            >
              <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-40)' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Medals */}
        <div
          className="mb-6 flex items-center justify-center gap-8 rounded-xl p-4"
          style={{
            backgroundColor: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          <div className="text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full text-lg" style={{ backgroundColor: 'rgba(234,179,8,0.15)' }}>
              &#129351;
            </div>
            <p className="mt-1 text-lg font-black" style={{ color: 'var(--bb-ink-100)' }}>{athlete.medals_gold}</p>
            <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>Ouro</p>
          </div>
          <div className="text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full text-lg" style={{ backgroundColor: 'rgba(156,163,175,0.15)' }}>
              &#129352;
            </div>
            <p className="mt-1 text-lg font-black" style={{ color: 'var(--bb-ink-100)' }}>{athlete.medals_silver}</p>
            <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>Prata</p>
          </div>
          <div className="text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full text-lg" style={{ backgroundColor: 'rgba(217,119,6,0.15)' }}>
              &#129353;
            </div>
            <p className="mt-1 text-lg font-black" style={{ color: 'var(--bb-ink-100)' }}>{athlete.medals_bronze}</p>
            <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>Bronze</p>
          </div>
        </div>

        {/* Match History */}
        <section className="mb-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            <TrendingUpIcon className="h-5 w-5" style={{ color: 'var(--bb-brand)' }} />
            Historico de lutas
          </h2>
          <div
            className="overflow-hidden rounded-xl"
            style={{
              backgroundColor: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 'var(--bb-radius-lg)',
            }}
          >
            {matchHistory.length === 0 ? (
              <p className="py-12 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                Nenhuma luta registrada
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                      <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: 'var(--bb-ink-40)' }}>Oponente</th>
                      <th className="px-4 py-3 text-center text-xs font-bold" style={{ color: 'var(--bb-ink-40)' }}>Placar</th>
                      <th className="px-4 py-3 text-center text-xs font-bold" style={{ color: 'var(--bb-ink-40)' }}>Resultado</th>
                      <th className="hidden px-4 py-3 text-left text-xs font-bold sm:table-cell" style={{ color: 'var(--bb-ink-40)' }}>Metodo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchHistory.map((match) => {
                      const isAthleteA = match.athlete1_id === id;
                      const opponentName = isAthleteA ? match.athlete2_name : match.athlete1_name;
                      const won = match.winner_id === id;
                      const isDraw = match.winner_id == null && match.status === 'completed';

                      return (
                        <tr key={match.id} style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                          <td className="px-4 py-3">
                            <p className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>{opponentName ?? 'Desconhecido'}</p>
                            <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                              Rodada {match.round}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                              {match.score_athlete1} x {match.score_athlete2}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                              style={{
                                backgroundColor:
                                  won ? 'rgba(34,197,94,0.15)' :
                                  isDraw ? 'rgba(156,163,175,0.15)' :
                                  'rgba(239,68,68,0.15)',
                                color:
                                  won ? '#16a34a' :
                                  isDraw ? 'var(--bb-ink-60)' :
                                  '#dc2626',
                              }}
                            >
                              {won ? 'Vitoria' : isDraw ? 'Empate' : 'Derrota'}
                            </span>
                          </td>
                          <td className="hidden px-4 py-3 sm:table-cell" style={{ color: 'var(--bb-ink-60)' }}>{match.method ?? '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import {
  getActiveLeague,
  getMyAcademyRank,
  type LeagueDTO,
  type AcademyLeagueStats,
} from '@/lib/api/leagues.service';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

const RANK_STYLE: Record<number, { bg: string; border: string; text: string }> = {
  1: { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-600' },
  2: { bg: 'bg-gray-50', border: 'border-gray-400', text: 'text-gray-600' },
  3: { bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-600' },
};

const RANK_EMOJI: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function LigaPage() {
  const [league, setLeague] = useState<LeagueDTO | null>(null);
  const [myStats, setMyStats] = useState<AcademyLeagueStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getActiveLeague(),
      getMyAcademyRank('ac-1'),
    ])
      .then(([l, stats]) => {
        setLeague(l);
        setMyStats(stats);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!league || !myStats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-white">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <p className="text-sm font-medium uppercase tracking-wider opacity-80">Liga Inter-Academias</p>
        <h1 className="mt-1 text-2xl font-bold">{league.name}</h1>
        <p className="mt-2 text-sm opacity-80">
          {new Date(league.start_date).toLocaleDateString('pt-BR')} - {new Date(league.end_date).toLocaleDateString('pt-BR')}
        </p>
      </div>

      {/* My Academy */}
      <Card className="border-2 border-bb-primary/20 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bb-primary/10 text-xl font-bold text-bb-primary">
            #{myStats.rank}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-bb-black">Sua Academia</h2>
            <p className="text-sm text-bb-gray-500">{league.academies.find((a) => a.academy_id === myStats.academy_id)?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-bb-primary">{myStats.per_capita_avg.toFixed(1)}</p>
            <p className="text-xs text-bb-gray-500">pts/aluno</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-bb-gray-50 p-2">
            <p className="text-lg font-bold text-bb-black">{myStats.total_points.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-bb-gray-500">Total pts</p>
          </div>
          <div className="rounded-xl bg-bb-gray-50 p-2">
            <p className="text-lg font-bold text-bb-black">{myStats.student_count}</p>
            <p className="text-xs text-bb-gray-500">Alunos</p>
          </div>
          <div className="rounded-xl bg-bb-gray-50 p-2">
            <p className="text-lg font-bold text-bb-black">#{myStats.rank}</p>
            <p className="text-xs text-bb-gray-500">Posição</p>
          </div>
        </div>
      </Card>

      {/* Personal Contribution - Top Contributors */}
      <Card className="p-5">
        <h2 className="text-lg font-bold text-bb-black">Top Contribuintes da Sua Academia</h2>
        <div className="mt-3 space-y-2">
          {myStats.top_contributors.map((c, i) => (
            <div key={c.student_id} className="flex items-center gap-3 rounded-xl p-2 hover:bg-bb-gray-50">
              <span className="w-6 text-center text-sm font-bold text-bb-gray-500">{i + 1}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bb-gray-200 text-xs font-bold text-bb-gray-500">
                {c.student_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <p className="flex-1 text-sm font-medium text-bb-black">{c.student_name}</p>
              <span className="text-sm font-bold text-bb-primary">{c.points.toLocaleString('pt-BR')} pts</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Standings */}
      <Card className="p-5">
        <h2 className="mb-4 text-lg font-bold text-bb-black">Classificação</h2>
        <div className="space-y-2">
          {league.academies.map((academy) => {
            const style = RANK_STYLE[academy.rank];
            const isMyAcademy = academy.academy_id === myStats.academy_id;
            return (
              <div
                key={academy.academy_id}
                className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                  isMyAcademy
                    ? 'border-bb-primary/30 bg-bb-primary/5'
                    : style
                      ? `${style.border} ${style.bg}`
                      : 'border-bb-gray-200 hover:bg-bb-gray-50'
                }`}
              >
                <span className="w-8 text-center text-lg font-bold">
                  {RANK_EMOJI[academy.rank] ?? (
                    <span className="text-bb-gray-500">#{academy.rank}</span>
                  )}
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bb-gray-200 text-xs font-bold text-bb-gray-500">
                  {academy.name.split(' ').slice(0, 2).map((w) => w[0]).join('')}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-bb-black">
                    {academy.name}
                    {isMyAcademy && <span className="ml-2 text-xs text-bb-primary">(Sua)</span>}
                  </p>
                  <p className="text-xs text-bb-gray-500">{academy.student_count} alunos</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-bb-black">{academy.per_capita_avg.toFixed(1)}</p>
                  <p className="text-xs text-bb-gray-500">pts/aluno</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Prizes */}
      <Card className="p-5">
        <h2 className="mb-3 text-lg font-bold text-bb-black">Prêmios</h2>
        <div className="space-y-2">
          {league.prizes.map((prize, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl bg-bb-gray-50 p-3">
              <span className="text-xl">{RANK_EMOJI[i + 1] ?? '🏅'}</span>
              <p className="text-sm text-bb-gray-500">{prize}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Rules */}
      <Card className="p-5">
        <h2 className="mb-2 text-lg font-bold text-bb-black">Regras</h2>
        <p className="text-sm leading-relaxed text-bb-gray-500">{league.rules}</p>
      </Card>
    </div>
  );
}

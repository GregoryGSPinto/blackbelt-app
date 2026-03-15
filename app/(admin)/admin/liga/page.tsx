'use client';

import { useEffect, useState } from 'react';
import {
  getActiveLeague,
  getMyAcademyRank,
  toggleOptIn,
  type LeagueDTO,
  type AcademyLeagueStats,
} from '@/lib/api/leagues.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

export default function AdminLigaPage() {
  const [league, setLeague] = useState<LeagueDTO | null>(null);
  const [stats, setStats] = useState<AcademyLeagueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    Promise.all([
      getActiveLeague(),
      getMyAcademyRank('ac-1'),
    ])
      .then(([l, s]) => {
        setLeague(l);
        setStats(s);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleToggleOptIn() {
    if (!stats) return;
    setToggling(true);
    try {
      await toggleOptIn('ac-1', !stats.opted_in);
      setStats((prev) => prev ? { ...prev, opted_in: !prev.opted_in } : prev);
    } finally {
      setToggling(false);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!league || !stats) return null;

  const myAcademy = league.academies.find((a) => a.academy_id === stats.academy_id);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-bb-black">Liga Inter-Academias</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-bb-gray-500">
            {stats.opted_in ? 'Participando' : 'Não participando'}
          </span>
          <button
            onClick={handleToggleOptIn}
            disabled={toggling}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              stats.opted_in ? 'bg-bb-primary' : 'bg-bb-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                stats.opted_in ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {!stats.opted_in && (
        <Card className="border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm font-medium text-yellow-800">
            Sua academia não está participando da liga atual. Ative a participação para entrar na competição.
          </p>
          <Button variant="primary" className="mt-3" onClick={handleToggleOptIn} disabled={toggling}>
            {toggling ? 'Processando...' : 'Entrar na Liga'}
          </Button>
        </Card>
      )}

      {/* Academy Overview */}
      <Card className="p-5">
        <h2 className="text-lg font-bold text-bb-black">Desempenho na Liga</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-bb-gray-50 p-3 text-center">
            <p className="text-2xl font-bold text-bb-primary">#{stats.rank}</p>
            <p className="text-xs text-bb-gray-500">Posição</p>
          </div>
          <div className="rounded-xl bg-bb-gray-50 p-3 text-center">
            <p className="text-2xl font-bold text-bb-black">{stats.total_points.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-bb-gray-500">Total Pontos</p>
          </div>
          <div className="rounded-xl bg-bb-gray-50 p-3 text-center">
            <p className="text-2xl font-bold text-bb-black">{stats.per_capita_avg.toFixed(1)}</p>
            <p className="text-xs text-bb-gray-500">Pts/Aluno</p>
          </div>
          <div className="rounded-xl bg-bb-gray-50 p-3 text-center">
            <p className="text-2xl font-bold text-bb-black">{stats.student_count}</p>
            <p className="text-xs text-bb-gray-500">Alunos Ativos</p>
          </div>
        </div>
      </Card>

      {/* League Standings */}
      <Card className="p-5">
        <h2 className="mb-4 text-lg font-bold text-bb-black">Classificação Geral</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bb-gray-200 text-left text-xs text-bb-gray-500">
                <th className="pb-2 pr-2">#</th>
                <th className="pb-2 pr-2">Academia</th>
                <th className="pb-2 pr-2 text-right">Total Pts</th>
                <th className="pb-2 pr-2 text-right">Alunos</th>
                <th className="pb-2 text-right">Pts/Aluno</th>
              </tr>
            </thead>
            <tbody>
              {league.academies.map((academy) => {
                const isMe = academy.academy_id === stats.academy_id;
                return (
                  <tr
                    key={academy.academy_id}
                    className={`border-b border-bb-gray-100 ${isMe ? 'bg-bb-primary/5 font-semibold' : ''}`}
                  >
                    <td className="py-3 pr-2">
                      {academy.rank <= 3
                        ? ['🥇', '🥈', '🥉'][academy.rank - 1]
                        : `#${academy.rank}`}
                    </td>
                    <td className="py-3 pr-2">
                      {academy.name}
                      {isMe && <span className="ml-1 text-xs text-bb-primary">(Sua)</span>}
                    </td>
                    <td className="py-3 pr-2 text-right">{academy.total_points.toLocaleString('pt-BR')}</td>
                    <td className="py-3 pr-2 text-right">{academy.student_count}</td>
                    <td className="py-3 text-right font-bold">{academy.per_capita_avg.toFixed(1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Top Contributing Students */}
      <Card className="p-5">
        <h2 className="mb-4 text-lg font-bold text-bb-black">Top Alunos Contribuintes</h2>
        <div className="space-y-2">
          {stats.top_contributors.map((c, i) => (
            <div key={c.student_id} className="flex items-center gap-3 rounded-xl border border-bb-gray-200 p-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bb-primary/10 text-sm font-bold text-bb-primary">
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-bb-black">{c.student_name}</p>
              </div>
              <span className="text-sm font-bold text-bb-primary">{c.points.toLocaleString('pt-BR')} pts</span>
              <span className="text-xs text-bb-gray-500">
                {myAcademy ? ((c.points / myAcademy.total_points) * 100).toFixed(1) : 0}%
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Rules */}
      <Card className="p-5">
        <h2 className="mb-2 text-lg font-bold text-bb-black">Regras da Liga</h2>
        <p className="text-sm leading-relaxed text-bb-gray-500">{league.rules}</p>
        <div className="mt-3 space-y-1">
          {league.prizes.map((prize, i) => (
            <p key={i} className="text-sm text-bb-gray-500">
              <span className="font-medium text-bb-black">{['🥇', '🥈', '🥉'][i]}</span> {prize}
            </p>
          ))}
        </div>
      </Card>
    </div>
  );
}

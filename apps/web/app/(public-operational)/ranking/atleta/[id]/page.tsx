'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getAthleteProfile, type AthleteProfileDTO } from '@/lib/api/federation-ranking.service';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

const BELT_COLORS: Record<string, string> = {
  Branca: 'bg-white border border-bb-gray-300 text-bb-gray-600',
  Azul: 'bg-blue-600 text-white',
  Roxa: 'bg-purple-600 text-white',
  Marrom: 'bg-amber-800 text-white',
  Preta: 'bg-bb-black text-white',
};

const RESULT_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  gold: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Ouro' },
  silver: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Prata' },
  bronze: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Bronze' },
  eliminated: { bg: 'bg-red-50', text: 'text-red-500', label: 'Eliminado' },
};

const IMPORTANCE_LABEL: Record<string, { label: string; color: string }> = {
  local: { label: 'Local (1x)', color: 'text-bb-gray-400' },
  estadual: { label: 'Estadual (2x)', color: 'text-blue-600' },
  nacional: { label: 'Nacional (3x)', color: 'text-purple-600' },
};

export default function AtletaProfilePage() {
  const params = useParams();
  const athleteId = params.id as string;

  const [profile, setProfile] = useState<AthleteProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAthleteProfile(athleteId)
      .then(setProfile)
      .finally(() => setLoading(false));
  }, [athleteId]);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!profile) return <div className="py-20 text-center text-bb-gray-500">Atleta não encontrado</div>;

  const winRate = Math.round(profile.win_rate * 100);
  const submissionRate = Math.round(profile.submission_rate * 100);

  return (
    <div className="min-h-screen bg-bb-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-bb-black to-[var(--bb-depth-5)] px-4 py-10 text-[var(--bb-ink-100)] sm:px-6">
        <div className="mx-auto max-w-4xl">
          <Link href="/ranking" className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--bb-ink-60)] hover:text-[var(--bb-ink-100)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Ranking
          </Link>

          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bb-glass)] text-xl font-bold">
              {profile.athlete_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{profile.athlete_name}</h1>
              <p className="mt-1 text-sm text-[var(--bb-ink-60)]">{profile.academy}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`rounded px-2 py-0.5 text-xs font-bold ${BELT_COLORS[profile.belt] ?? 'bg-bb-gray-200 text-bb-gray-600'}`}>
                  {profile.belt}
                </span>
                <span className="rounded bg-[var(--bb-glass)] px-2 py-0.5 text-xs">{profile.weight_class}</span>
                <span className="rounded bg-[var(--bb-glass)] px-2 py-0.5 text-xs">{profile.region}</span>
                <span className="rounded bg-[var(--bb-glass)] px-2 py-0.5 text-xs">{profile.age} anos</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">#{profile.ranking_position}</p>
              <p className="text-sm text-[var(--bb-ink-40)]">Ranking</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-bb-primary">{profile.total_points}</p>
            <p className="text-xs text-bb-gray-500">Pontos</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-bb-black">{profile.total_fights}</p>
            <p className="text-xs text-bb-gray-500">Lutas</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{winRate}%</p>
            <p className="text-xs text-bb-gray-500">Win rate</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{submissionRate}%</p>
            <p className="text-xs text-bb-gray-500">Finalizações</p>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Win/Loss bar */}
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-bold text-bb-black">Desempenho</h2>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-green-600">{profile.total_wins}V</span>
                    <span className="text-red-500">{profile.total_losses}D</span>
                  </div>
                  <div className="flex h-3 overflow-hidden rounded-full bg-red-200">
                    <div
                      className="rounded-l-full bg-green-500 transition-all"
                      style={{ width: `${winRate}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-yellow-50 p-3">
                  <p className="text-xl font-bold text-yellow-700">{profile.gold}</p>
                  <p className="text-[10px] text-bb-gray-500">Ouro</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-xl font-bold text-gray-600">{profile.silver}</p>
                  <p className="text-[10px] text-bb-gray-500">Prata</p>
                </div>
                <div className="rounded-xl bg-orange-50 p-3">
                  <p className="text-xl font-bold text-orange-700">{profile.bronze}</p>
                  <p className="text-[10px] text-bb-gray-500">Bronze</p>
                </div>
              </div>
            </Card>

            {/* Competition history */}
            <Card className="p-5">
              <h2 className="mb-4 text-sm font-bold text-bb-black">Histórico de Competições</h2>
              <div className="space-y-2">
                {profile.history.map((h, i) => {
                  const resultStyle = RESULT_STYLE[h.result];
                  const importanceInfo = IMPORTANCE_LABEL[h.importance];

                  return (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-bb-gray-100 p-3">
                      <div className="text-center">
                        <p className="text-xs font-bold text-bb-black">
                          {new Date(h.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </p>
                        <p className="text-[10px] text-bb-gray-400">
                          {new Date(h.date).getFullYear()}
                        </p>
                      </div>
                      <div className="h-10 w-px bg-bb-gray-200" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-bb-black">{h.championship_name}</p>
                        <p className="text-[10px] text-bb-gray-500">{h.category}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${resultStyle.bg} ${resultStyle.text}`}>
                          {resultStyle.label}
                        </span>
                        <div className="mt-1 flex items-center justify-end gap-1">
                          <span className={`text-[10px] font-medium ${importanceInfo.color}`}>{importanceInfo.label}</span>
                          {h.points_earned > 0 && (
                            <span className="text-[10px] font-bold text-bb-primary">+{h.points_earned}pts</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Achievements */}
            {profile.achievements.length > 0 && (
              <Card className="p-5">
                <h2 className="mb-3 text-sm font-bold text-bb-black">Conquistas</h2>
                <div className="space-y-2">
                  {profile.achievements.map((ach, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-bb-gray-50 p-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-bb-black">{ach}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Info card */}
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-bold text-bb-black">Informações</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-bb-gray-500">Academia</span>
                  <span className="font-medium text-bb-black">{profile.academy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bb-gray-500">Faixa</span>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${BELT_COLORS[profile.belt] ?? ''}`}>{profile.belt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bb-gray-500">Peso</span>
                  <span className="font-medium text-bb-black">{profile.weight_class}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bb-gray-500">Região</span>
                  <span className="font-medium text-bb-black">{profile.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bb-gray-500">Idade</span>
                  <span className="font-medium text-bb-black">{profile.age} anos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bb-gray-500">Competições</span>
                  <span className="font-medium text-bb-black">{profile.history.length}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

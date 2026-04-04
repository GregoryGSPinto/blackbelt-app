'use client';

import { useEffect, useState } from 'react';
import {
  getCurrentSeason,
  getSeasonLeaderboard,
  getMySeasonProgress,
  type SeasonDTO,
  type LeaderboardEntry,
  type SeasonProgress,
} from '@/lib/api/seasons.service';
import { SEASONS } from '@/lib/mocks/seasons.mock';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { PlanGate } from '@/components/plans/PlanGate';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { ComingSoon } from '@/components/shared/ComingSoon';

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  diamond: { label: 'Diamante', color: 'text-cyan-400', bg: 'bg-cyan-50' },
  gold: { label: 'Ouro', color: 'text-yellow-500', bg: 'bg-yellow-50' },
  silver: { label: 'Prata', color: 'text-gray-400', bg: 'bg-gray-50' },
  bronze: { label: 'Bronze', color: 'text-orange-600', bg: 'bg-orange-50' },
};

const RANK_EMOJI: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

function daysUntil(dateStr: string) {
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

export default function SeasonPage() {
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [season, setSeason] = useState<SeasonDTO | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [progress, setProgress] = useState<SeasonProgress | null>(null);
  const [tab, setTab] = useState<'current' | 'history'>('current');
  const [loading, setLoading] = useState(true);

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);
  useEffect(() => {
    Promise.all([
      getCurrentSeason(getActiveAcademyId()),
      getSeasonLeaderboard('season-3'),
      getMySeasonProgress('student-1', 'season-3'),
    ])
      .then(([s, lb, p]) => {
        setSeason(s);
        setLeaderboard(lb);
        setProgress(p);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/dashboard" backLabel="Voltar ao Dashboard" />;
  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!season || !progress) return null;

  const daysLeft = daysUntil(season.end_date);
  const tierCfg = TIER_CONFIG[progress.tier] ?? TIER_CONFIG.bronze;

  return (
    <PlanGate module="teen_module">
    <div className="space-y-6">
      {/* Season Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-bb-primary to-indigo-700 p-6 text-white">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-white/5" />
        <p className="text-sm font-medium uppercase tracking-wider opacity-80">Temporada Ativa</p>
        <h1 className="mt-1 text-2xl font-bold">{season.name}</h1>
        <div className="mt-3 flex items-center gap-4 text-sm">
          <span className="rounded-full bg-white/20 px-3 py-1">
            {daysLeft} dias restantes
          </span>
          <span className="opacity-80">
            {new Date(season.start_date).toLocaleDateString('pt-BR')} - {new Date(season.end_date).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>

      {/* My Progress */}
      <Card className="p-5">
        <h2 className="text-lg font-bold text-bb-black">Meu Progresso</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="text-center">
            <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${tierCfg.bg}`}>
              <span className={`text-xl font-bold ${tierCfg.color}`}>{tierCfg.label.charAt(0)}</span>
            </div>
            <p className={`mt-1 text-sm font-bold ${tierCfg.color}`}>{tierCfg.label}</p>
            <p className="text-xs text-bb-gray-500">Tier</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-bb-black">{progress.season_points.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-bb-gray-500">Pontos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-bb-black">#{progress.rank}</p>
            <p className="text-xs text-bb-gray-500">Ranking</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-bb-black">{progress.streak_this_season}</p>
            <p className="text-xs text-bb-gray-500">Streak</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-bb-gray-100 px-3 py-1 text-xs text-bb-gray-500">
            {progress.classes_attended_this_season} aulas
          </span>
          {progress.achievements_this_season.map((a) => (
            <span key={a} className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">{a}</span>
          ))}
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('current')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${tab === 'current' ? 'bg-bb-primary text-white' : 'bg-bb-gray-100 text-bb-gray-500'}`}
        >
          Leaderboard
        </button>
        <button
          onClick={() => setTab('history')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${tab === 'history' ? 'bg-bb-primary text-white' : 'bg-bb-gray-100 text-bb-gray-500'}`}
        >
          Temporadas Anteriores
        </button>
      </div>

      {tab === 'current' && (
        <>
          {/* Leaderboard Top 20 */}
          <Card className="p-5">
            <h2 className="mb-4 text-lg font-bold text-bb-black">Leaderboard - Top 20</h2>
            <div className="space-y-2">
              {leaderboard.length === 0 && (
                <EmptyState
                  icon="🏅"
                  title="Leaderboard vazio"
                  description="Ainda não há participantes nesta temporada. Faça check-in para entrar no ranking!"
                  variant="first-time"
                />
              )}
              {leaderboard.map((entry) => {
                const entryTier = TIER_CONFIG[entry.tier] ?? TIER_CONFIG.bronze;
                const isMe = entry.student_id === 'student-1';
                return (
                  <div
                    key={entry.student_id}
                    className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${isMe ? 'bg-bb-primary/5 ring-1 ring-bb-primary/20' : 'hover:bg-bb-gray-50'}`}
                  >
                    <span className="w-8 text-center text-lg font-bold text-bb-gray-500">
                      {RANK_EMOJI[entry.rank] ?? `#${entry.rank}`}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bb-gray-200 text-sm font-bold text-bb-gray-500">
                      {entry.student_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-bb-black">
                        {entry.student_name}
                        {isMe && <span className="ml-2 text-xs text-bb-primary">(Você)</span>}
                      </p>
                      <span className={`text-xs font-medium ${entryTier.color}`}>{entryTier.label}</span>
                    </div>
                    <span className="text-sm font-bold text-bb-black">{entry.points.toLocaleString('pt-BR')} pts</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Rewards by Tier */}
          <Card className="p-5">
            <h2 className="mb-4 text-lg font-bold text-bb-black">Recompensas da Temporada</h2>
            <div className="space-y-3">
              {season.rewards.map((rw, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-bb-gray-200 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-lg">
                    {i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🎖️'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-bb-black">Top {rw.rank_range}</p>
                    <p className="text-sm text-bb-gray-500">{rw.reward_value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-bb-gray-50 p-3">
              <p className="text-xs font-medium text-bb-gray-500">Como ganhar pontos:</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-bb-gray-500">
                <span>Check-in: <strong className="text-bb-black">10 pts</strong></span>
                <span>Desafio: <strong className="text-bb-black">25-100 pts</strong></span>
                <span>Conquista: <strong className="text-bb-black">50 pts</strong></span>
                <span>Avaliação +: <strong className="text-bb-black">30 pts</strong></span>
                <span>Trazer amigo: <strong className="text-bb-black">100 pts</strong></span>
              </div>
            </div>
          </Card>
        </>
      )}

      {tab === 'history' && (
        <div className="space-y-3">
          {SEASONS.filter((s) => s.status === 'ended').map((s) => (
            <Card key={s.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-bb-black">{s.name}</h3>
                  <p className="mt-1 text-xs text-bb-gray-500">
                    {new Date(s.start_date).toLocaleDateString('pt-BR')} - {new Date(s.end_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className="rounded-full bg-bb-gray-100 px-3 py-1 text-xs font-medium text-bb-gray-500">Encerrada</span>
              </div>
              <div className="mt-3 space-y-1">
                {s.rewards.slice(0, 2).map((rw, i) => (
                  <p key={i} className="text-xs text-bb-gray-500">Top {rw.rank_range}: {rw.reward_value}</p>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
    </PlanGate>
  );
}

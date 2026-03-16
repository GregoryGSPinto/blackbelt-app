'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLibrary } from '@/lib/api/streaming.service';
import type { StreamingLibrary, StreamingSeries, StreamingTrail, WatchProgress } from '@/lib/types/streaming';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';

interface WeeklyChallenge {
  title: string;
  description: string;
  current: number;
  target: number;
  xpReward: number;
}

export default function TeenBibliotecaPage() {
  const [library, setLibrary] = useState<StreamingLibrary | null>(null);
  const [loading, setLoading] = useState(true);
  const [weeklyChallenge] = useState<WeeklyChallenge[]>([
    {
      title: 'Maratona Semanal',
      description: 'Assista 3 vídeos esta semana',
      current: 1,
      target: 3,
      xpReward: 50,
    },
    {
      title: 'Quiz Master',
      description: 'Acerte 5 quizzes seguidos',
      current: 3,
      target: 5,
      xpReward: 80,
    },
    {
      title: 'Trilha Ninja',
      description: 'Complete 1 trilha inteira',
      current: 0,
      target: 1,
      xpReward: 120,
    },
  ]);
  const { toast: showToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const data = await getLibrary('stu-teen-sophia', 'aluno_teen', 'white');
        setLibrary(data);
      } catch {
        showToast('Erro ao carregar biblioteca', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0E] px-4 py-6">
        <Skeleton className="h-40 w-full rounded-2xl mb-6 bg-purple-900/20" />
        <Skeleton className="h-6 w-48 mb-4 bg-purple-900/20" />
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36 rounded-xl bg-purple-900/20" />
          ))}
        </div>
        <Skeleton className="h-6 w-40 mb-4 bg-purple-900/20" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 w-40 flex-shrink-0 rounded-xl bg-purple-900/20" />
          ))}
        </div>
      </div>
    );
  }

  if (!library) return null;

  const continueWatching = library.continue_watching ?? [];
  const trails = library.trails ?? [];
  const allSeries = library.all_series ?? [];

  const rankingData = [
    { name: 'Sophia', videos: 15, emoji: '🥇' },
    { name: 'Valentina', videos: 12, emoji: '🥈' },
    { name: 'Lucas', videos: 8, emoji: '🥉' },
  ];

  const badges = [
    { icon: '📺', label: 'Estudioso', desc: '10 vídeos assistidos', unlocked: true },
    { icon: '🎯', label: 'Maratonista', desc: '5 vídeos em 1 dia', unlocked: false },
    { icon: '📚', label: 'Trilha Completa', desc: 'Finalize uma trilha', unlocked: false },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0E] text-white pb-28">
      {/* Hero Banner */}
      <div
        className="relative mx-4 mt-4 rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 50%, #EC4899 100%)',
        }}
      >
        <div className="relative z-10 p-6">
          <p className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-1">
            Streaming BlackBelt
          </p>
          <h1 className="text-2xl font-extrabold mb-2">
            Evolua seu jogo, conquiste XP
          </h1>
          <p className="text-sm text-white/70">
            Assista, aprenda e suba no ranking
          </p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
      </div>

      {/* Desafios da Semana */}
      <section className="px-4 mt-6">
        <h2 className="text-lg font-extrabold text-white mb-3 flex items-center gap-2">
          <span className="text-xl">🏆</span> Desafios da Semana
        </h2>
        <div className="space-y-3">
          {weeklyChallenge.map((challenge, idx) => (
            <div
              key={idx}
              className="bg-[#161622] border border-purple-500/20 rounded-xl p-4 transition-all duration-200 hover:border-purple-500/40"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-white">{challenge.description}</p>
                <span className="text-xs font-bold text-purple-400 bg-purple-500/15 px-2 py-1 rounded-full">
                  +{challenge.xpReward} XP
                </span>
              </div>
              <div className="w-full bg-[#1E1E2E] rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${(challenge.current / challenge.target) * 100}%`,
                    background: 'linear-gradient(90deg, #7C3AED, #06B6D4)',
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5 font-semibold">
                {challenge.current}/{challenge.target}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Continuar Assistindo */}
      {continueWatching.length > 0 && (
        <section className="px-4 mt-8">
          <h2 className="text-lg font-extrabold text-white mb-3">
            Continuar Assistindo
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {continueWatching.map((item: WatchProgress) => {
              const pct = item.total_seconds > 0 ? Math.round((item.progress_seconds / item.total_seconds) * 100) : 0;
              const remaining = Math.ceil((item.total_seconds - item.progress_seconds) / 60);
              return (
                <Link
                  key={item.video_id}
                  href={`/dashboard/conteudo/series-fund`}
                  className="flex-shrink-0 w-44 group"
                >
                  <div className="relative bg-[#161622] rounded-xl overflow-hidden border border-purple-500/10 transition-all duration-200 group-hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] group-hover:border-purple-500/30">
                    <div className="relative h-24 bg-gradient-to-br from-purple-600/40 to-cyan-600/40 flex items-center justify-center">
                      <span className="text-4xl">🎬</span>
                      <span className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                        +15 XP
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-bold text-white truncate">{item.video_id}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{remaining}min restantes</p>
                      <div className="w-full bg-[#1E1E2E] rounded-full h-1.5 mt-2 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: 'linear-gradient(90deg, #7C3AED, #EC4899)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Ranking de Vídeos */}
      <section className="px-4 mt-8">
        <h2 className="text-lg font-extrabold text-white mb-3 flex items-center gap-2">
          <span className="text-xl">🔥</span> Ranking da Turma
        </h2>
        <div className="bg-[#161622] border border-purple-500/20 rounded-xl p-4 flex items-center justify-around">
          {rankingData.map((r, idx) => (
            <div key={idx} className="text-center">
              <span className="text-2xl">{r.emoji}</span>
              <p className="text-sm font-bold text-white mt-1">{r.name}</p>
              <p className="text-xs text-purple-400 font-semibold">{r.videos} vídeos</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trilhas */}
      {trails.length > 0 && (
        <section className="px-4 mt-8">
          <h2 className="text-lg font-extrabold text-white mb-3 flex items-center gap-2">
            <span className="text-xl">🗺️</span> Trilhas de Aprendizado
          </h2>
          <div className="space-y-3">
            {trails.map((trail: StreamingTrail) => {
              const totalVids = trail.total_videos;
              const completedCount = trail.series.reduce((acc, s) => acc + s.videos.length, 0);
              const progressPercent = totalVids > 0 ? Math.min((completedCount / totalVids) * 50, 100) : 0;

              return (
                <div
                  key={trail.id}
                  className="bg-[#161622] border border-purple-500/10 rounded-xl p-4 transition-all duration-200 hover:border-purple-500/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-white">{trail.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{trail.description}</p>
                    </div>
                    <span className="text-xs font-bold text-cyan-400 bg-cyan-500/15 px-2 py-1 rounded-full">
                      +{trail.total_videos * 10} XP
                    </span>
                  </div>
                  <div className="w-full bg-[#1E1E2E] rounded-full h-2 overflow-hidden mt-2">
                    <div
                      className="h-full rounded-full transition-all duration-200"
                      style={{
                        width: `${progressPercent}%`,
                        background: 'linear-gradient(90deg, #7C3AED, #06B6D4)',
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 font-semibold">
                    {trail.series.length} séries · {trail.total_videos} vídeos
                  </p>
                  <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
                    {trail.series.map((series: StreamingSeries) => (
                      <Link
                        key={series.id}
                        href={`/dashboard/conteudo/${series.id}`}
                        className="flex-shrink-0"
                      >
                        <div className="w-28 bg-[#1E1E2E] rounded-lg p-2 border border-purple-500/10 hover:border-purple-500/30 transition-all duration-200">
                          <div className="h-16 rounded-md flex items-center justify-center mb-2 relative" style={{ background: series.gradient_css }}>
                            <span className="text-2xl">🎥</span>
                            <span className="absolute top-1 right-1 bg-purple-600 text-white text-[8px] font-bold px-1 py-0.5 rounded">
                              +{series.videos.length * 10} XP
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-white truncate">{series.title}</p>
                          <p className="text-[9px] text-gray-500">{series.videos.length} eps</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Por Modalidade */}
      {allSeries.length > 0 && (
        <section className="px-4 mt-8">
          <h2 className="text-lg font-extrabold text-white mb-3 flex items-center gap-2">
            <span className="text-xl">🥋</span> Por Modalidade
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {Array.from(new Set(allSeries.map((s) => s.modality))).map((mod) => {
              const modSeries = allSeries.filter((s) => s.modality === mod);
              const emoji = mod === 'BJJ' ? '🥋' : mod === 'Judô' ? '🏋️' : '🎯';
              return (
                <div key={mod} className="group">
                  <div className="bg-[#161622] border border-purple-500/10 rounded-xl overflow-hidden transition-all duration-200 group-hover:shadow-[0_0_20px_rgba(124,58,237,0.25)] group-hover:border-purple-500/30">
                    <div className="h-20 bg-gradient-to-br from-purple-600/30 to-cyan-600/30 flex items-center justify-center">
                      <span className="text-3xl">{emoji}</span>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-bold text-white">{mod}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{modSeries.length} séries</p>
                    </div>
                  </div>
                  <div className="mt-2 space-y-2">
                    {modSeries.slice(0, 3).map((series) => (
                      <Link key={series.id} href={`/dashboard/conteudo/${series.id}`} className="block">
                        <div className="bg-[#1E1E2E] rounded-lg p-3 flex items-center gap-3 border border-purple-500/5 transition-all duration-200 hover:border-purple-500/20">
                          <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 relative" style={{ background: series.gradient_css }}>
                            <span className="text-xl">🎬</span>
                            <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[8px] font-bold px-1 rounded">+15 XP</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{series.title}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{series.videos.length} episódios</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Badges Desbloqueáveis */}
      <section className="px-4 mt-8 mb-8">
        <h2 className="text-lg font-extrabold text-white mb-3 flex items-center gap-2">
          <span className="text-xl">🏅</span> Badges Desbloqueáveis
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {badges.map((badge, idx) => (
            <div
              key={idx}
              className={`bg-[#161622] border rounded-xl p-4 text-center transition-all duration-200 ${
                badge.unlocked
                  ? 'border-purple-500/30 shadow-[0_0_15px_rgba(124,58,237,0.2)]'
                  : 'border-gray-800/50 opacity-50'
              }`}
            >
              <span className="text-3xl">{badge.icon}</span>
              <p className="text-xs font-bold text-white mt-2">{badge.label}</p>
              <p className="text-[10px] text-gray-500 mt-1">{badge.desc}</p>
              {badge.unlocked && (
                <span className="inline-block mt-2 text-[9px] font-bold text-green-400 bg-green-500/15 px-2 py-0.5 rounded-full">
                  Desbloqueado
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

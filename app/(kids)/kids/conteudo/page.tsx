'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLibrary } from '@/lib/api/streaming.service';
import type { StreamingLibrary, StreamingSeries, WatchProgress } from '@/lib/types/streaming';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';

const FUN_NAMES: Record<string, { emoji: string; name: string }> = {
  'Postura base e equilíbrio': { emoji: '🦁', name: 'O Leão Forte' },
  'Fuga de montada': { emoji: '🐊', name: 'O Rolo do Jacaré' },
  'Raspagem guarda fechada': { emoji: '🐒', name: 'Salto do Macaco' },
  'Passagem de guarda básica': { emoji: '🦅', name: 'Voo da Águia' },
  'Armlock do mount': { emoji: '🐍', name: 'Abraço da Cobra' },
  'Triângulo da guarda': { emoji: '🐢', name: 'Escudo da Tartaruga' },
  'Queda Osoto Gari': { emoji: '🐻', name: 'Empurrão do Urso' },
  'Kimura da meia-guarda': { emoji: '🦊', name: 'Truque da Raposa' },
  'Guilhotina em pé': { emoji: '🦈', name: 'Mordida do Tubarão' },
  'Rolamento e quedas': { emoji: '🐼', name: 'Cambalhota do Panda' },
};

const SERIES_THEMES = [
  { gradient: 'linear-gradient(135deg, #FF6B6B, #FF8E53)', emoji: '🦁' },
  { gradient: 'linear-gradient(135deg, #4ECDC4, #44CF6C)', emoji: '🐊' },
  { gradient: 'linear-gradient(135deg, #A18CD1, #FBC2EB)', emoji: '🐒' },
  { gradient: 'linear-gradient(135deg, #667EEA, #764BA2)', emoji: '🦅' },
  { gradient: 'linear-gradient(135deg, #F093FB, #F5576C)', emoji: '🐍' },
  { gradient: 'linear-gradient(135deg, #4FACFE, #00F2FE)', emoji: '🐢' },
  { gradient: 'linear-gradient(135deg, #43E97B, #38F9D7)', emoji: '🦊' },
  { gradient: 'linear-gradient(135deg, #FA709A, #FEE140)', emoji: '🦈' },
];

function getFunName(title: string): { emoji: string; name: string } {
  if (FUN_NAMES[title]) return FUN_NAMES[title];
  const fallbackEmojis = ['🐯', '🐲', '🦄', '🐬', '🦋', '🐙', '🦜', '🐘'];
  const idx = title.length % fallbackEmojis.length;
  return { emoji: fallbackEmojis[idx], name: title };
}

function getTheme(index: number) {
  return SERIES_THEMES[index % SERIES_THEMES.length];
}

export default function KidsAventurasPage() {
  const [library, setLibrary] = useState<StreamingLibrary | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalStars, setTotalStars] = useState(0);
  const { toast: showToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const data = await getLibrary('stu-kids-demo', 'aluno_kids', 'white');
        setLibrary(data);

        // Calculate total stars from watch progress
        let stars = 0;
        if (data.continue_watching) {
          data.continue_watching.forEach((item: WatchProgress) => {
            if (item.completed) stars += 2;
            else if (item.progress_seconds > 0) stars += 1;
          });
        }
        if (data.trails) {
          data.trails.forEach((trail) => {
            trail.series.forEach((series) => {
              const total = series.videos?.length ?? 0;
              const watched = data.continue_watching.filter((cw) => cw.completed && series.videos.some((v) => v.id === cw.video_id)).length;
              stars += watched * 2;
              if (total > 0 && watched === total) stars += 5;
            });
          });
        }
        setTotalStars(Math.max(stars, 6));
      } catch {
        showToast('Ops! Tente de novo', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F1E] px-4 py-6">
        <div className="flex justify-center mb-6">
          <Skeleton className="h-20 w-48 rounded-3xl bg-blue-900/20" />
        </div>
        <Skeleton className="h-8 w-56 mx-auto mb-6 rounded-2xl bg-purple-900/20" />
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-44 rounded-[20px] bg-blue-900/15" />
          ))}
        </div>
        <Skeleton className="h-8 w-48 mx-auto mb-4 rounded-2xl bg-pink-900/15" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-44 rounded-[20px] bg-green-900/15" />
          ))}
        </div>
      </div>
    );
  }

  if (!library) return null;

  const trails = library.trails ?? [];

  // Build adventure sections from available data
  const allSeries: StreamingSeries[] = library.all_series ?? [];
  trails.forEach((trail) => {
    trail.series.forEach((s) => {
      if (!allSeries.find((x) => x.id === s.id)) allSeries.push(s);
    });
  });

  const recentVideos = allSeries.slice(0, 4);
  const mainSeries = allSeries.slice(0, 3);
  const heroSeries = allSeries.slice(2, 5);
  const movementSeries = allSeries.slice(4, 7);

  return (
    <div className="min-h-screen bg-[#0F0F1E] text-white pb-28" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Stars Header */}
      <div className="pt-6 pb-2 px-4">
        <div className="flex items-center justify-center">
          <div
            className="inline-flex items-center gap-3 px-6 py-3 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              animation: 'float 3s ease-in-out infinite',
            }}
          >
            <span className="text-4xl" style={{ animation: 'float 2s ease-in-out infinite' }}>⭐</span>
            <span className="text-3xl font-black text-[#0F0F1E] tracking-tight">
              {totalStars}
            </span>
            <span className="text-sm font-bold text-[#0F0F1E]/70">estrelas</span>
          </div>
        </div>
      </div>

      {/* Star system explanation */}
      <div className="px-4 mt-3 mb-2">
        <div className="bg-[#1A1A30] rounded-2xl p-3 flex items-center justify-around text-center border border-yellow-500/10">
          <div>
            <p className="text-lg font-black">+2 ⭐</p>
            <p className="text-[10px] text-gray-400 font-bold">Assistir tudo</p>
          </div>
          <div className="w-px h-8 bg-gray-700" />
          <div>
            <p className="text-lg font-black">+1 ⭐</p>
            <p className="text-[10px] text-gray-400 font-bold">Quiz certo</p>
          </div>
          <div className="w-px h-8 bg-gray-700" />
          <div>
            <p className="text-lg font-black">+5 ⭐</p>
            <p className="text-[10px] text-gray-400 font-bold">Série completa</p>
          </div>
        </div>
      </div>

      {/* Novas Aventuras */}
      <section className="px-4 mt-6">
        <h2 className="text-xl font-black text-center mb-4 tracking-wide">
          <span className="text-2xl mr-1">🌟</span> Novas Aventuras!
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {recentVideos.map((series, idx) => {
            const theme = getTheme(idx);
            const firstEp = series.videos?.[0];
            const funName = getFunName(firstEp?.title ?? series.title);
            const sTotal = series.videos?.length ?? 0;
            const sWatched = library.continue_watching.filter((cw) => cw.completed && series.videos?.some((v) => v.id === cw.video_id)).length;
            const starsEarned = sWatched * 2 + (sTotal > 0 && sWatched === sTotal ? 5 : 0);

            return (
              <Link key={series.id} href={`/kids/conteudo/${series.id}`} className="block">
                <div
                  className="rounded-[20px] overflow-hidden border-2 border-white/10 transition-transform duration-200 active:scale-95"
                  style={{ background: theme.gradient }}
                >
                  {/* Star badge */}
                  <div className="relative">
                    <div className="absolute top-2 right-2 bg-[#0F0F1E]/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 z-10">
                      <span className="text-xs">⭐</span>
                      <span className="text-xs font-black text-yellow-300">{starsEarned}</span>
                    </div>
                  </div>

                  {/* Giant emoji */}
                  <div className="flex items-center justify-center pt-5 pb-2">
                    <span
                      className="text-[80px] leading-none"
                      style={{ animation: 'float 3s ease-in-out infinite', animationDelay: `${idx * 0.5}s` }}
                    >
                      {funName.emoji}
                    </span>
                  </div>

                  {/* Title */}
                  <div className="px-3 pb-4">
                    <p className="text-sm font-black text-white text-center leading-tight drop-shadow-lg">
                      {funName.name}
                    </p>
                    {/* Star progress */}
                    <div className="flex items-center justify-center gap-1 mt-2">
                      {Array.from({ length: Math.min(sTotal, 5) }).map((_, i) => (
                        <span key={i} className="text-sm">
                          {i < sWatched ? '⭐' : '☆'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Aventura no Tatame */}
      <section className="px-4 mt-8">
        <h2 className="text-xl font-black text-center mb-4 tracking-wide">
          <span className="text-2xl mr-1">🦁</span> Aventura no Tatame
        </h2>
        <div className="space-y-3">
          {mainSeries.map((series, idx) => {
            const funName = getFunName(series.videos?.[0]?.title ?? series.title);
            const theme = getTheme(idx + 4);
            const sTotal = series.videos?.length ?? 0;
            const sWatched = library.continue_watching.filter((cw) => cw.completed && series.videos?.some((v) => v.id === cw.video_id)).length;
            const starsEarned = sWatched * 2;

            return (
              <Link key={series.id} href={`/kids/conteudo/${series.id}`} className="block">
                <div
                  className="rounded-[20px] p-4 flex items-center gap-4 border-2 border-white/10 transition-transform duration-200 active:scale-[0.98]"
                  style={{ background: theme.gradient }}
                >
                  <span
                    className="text-[56px] leading-none flex-shrink-0"
                    style={{ animation: 'float 3s ease-in-out infinite', animationDelay: `${idx * 0.3}s` }}
                  >
                    {funName.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-black text-white drop-shadow-lg truncate pr-2">
                        {funName.name}
                      </p>
                      <span className="flex-shrink-0 bg-[#0F0F1E]/60 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
                        <span className="text-xs">⭐</span>
                        <span className="text-xs font-black text-yellow-300">{starsEarned}</span>
                      </span>
                    </div>
                    <p className="text-xs text-white/70 font-bold mt-1">
                      {sWatched} de {sTotal} episódios
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      {Array.from({ length: Math.min(sTotal, 5) }).map((_, i) => (
                        <span key={i} className="text-sm">
                          {i < sWatched ? '⭐' : '☆'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Heróis do Tatame */}
      <section className="px-4 mt-8">
        <h2 className="text-xl font-black text-center mb-4 tracking-wide">
          <span className="text-2xl mr-1">🦸</span> Heróis do Tatame
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {heroSeries.map((series, idx) => {
            const funName = getFunName(series.videos?.[0]?.title ?? series.title);
            const theme = getTheme(idx + 2);
            const sTotal = series.videos?.length ?? 0;
            const sWatched = library.continue_watching.filter((cw) => cw.completed && series.videos?.some((v) => v.id === cw.video_id)).length;
            const starsEarned = sWatched * 2;

            return (
              <Link key={series.id} href={`/kids/conteudo/${series.id}`} className="flex-shrink-0 w-40">
                <div
                  className="rounded-[20px] overflow-hidden border-2 border-white/10 transition-transform duration-200 active:scale-95"
                  style={{ background: theme.gradient }}
                >
                  <div className="relative">
                    <div className="absolute top-2 right-2 bg-[#0F0F1E]/60 backdrop-blur-sm rounded-full px-1.5 py-0.5 flex items-center gap-0.5 z-10">
                      <span className="text-[10px]">⭐</span>
                      <span className="text-[10px] font-black text-yellow-300">{starsEarned}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center pt-4 pb-1">
                    <span
                      className="text-[60px] leading-none"
                      style={{ animation: 'float 3s ease-in-out infinite', animationDelay: `${idx * 0.4}s` }}
                    >
                      {funName.emoji}
                    </span>
                  </div>
                  <div className="px-3 pb-3">
                    <p className="text-xs font-black text-white text-center leading-tight drop-shadow-lg">
                      {funName.name}
                    </p>
                    <div className="flex items-center justify-center gap-0.5 mt-1.5">
                      {Array.from({ length: Math.min(sTotal, 5) }).map((_, i) => (
                        <span key={i} className="text-[10px]">
                          {i < sWatched ? '⭐' : '☆'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Dança Marcial */}
      <section className="px-4 mt-8 mb-8">
        <h2 className="text-xl font-black text-center mb-4 tracking-wide">
          <span className="text-2xl mr-1">💃</span> Danca Marcial
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {movementSeries.map((series, idx) => {
            const danceEmojis = ['💃', '🕺', '🤸', '🧘'];
            const danceNames = ['Ginga Ninja', 'Passos do Dragão', 'Acrobacia Espacial', 'Yoga do Guerreiro'];
            const theme = getTheme(idx + 6);
            const sTotal = series.videos?.length ?? 0;
            const sWatched = library.continue_watching.filter((cw) => cw.completed && series.videos?.some((v) => v.id === cw.video_id)).length;
            const starsEarned = sWatched * 2;

            return (
              <Link key={series.id} href={`/kids/conteudo/${series.id}`} className="block">
                <div
                  className="rounded-[20px] overflow-hidden border-2 border-white/10 transition-transform duration-200 active:scale-95"
                  style={{ background: theme.gradient }}
                >
                  <div className="relative">
                    <div className="absolute top-2 right-2 bg-[#0F0F1E]/60 backdrop-blur-sm rounded-full px-1.5 py-0.5 flex items-center gap-0.5 z-10">
                      <span className="text-[10px]">⭐</span>
                      <span className="text-[10px] font-black text-yellow-300">{starsEarned}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center pt-4 pb-1">
                    <span
                      className="text-[70px] leading-none"
                      style={{ animation: 'float 3s ease-in-out infinite', animationDelay: `${idx * 0.6}s` }}
                    >
                      {danceEmojis[idx % danceEmojis.length]}
                    </span>
                  </div>
                  <div className="px-3 pb-4">
                    <p className="text-sm font-black text-white text-center leading-tight drop-shadow-lg">
                      {danceNames[idx % danceNames.length]}
                    </p>
                    <div className="flex items-center justify-center gap-0.5 mt-2">
                      {Array.from({ length: Math.min(sTotal, 5) }).map((_, i) => (
                        <span key={i} className="text-sm">
                          {i < sWatched ? '⭐' : '☆'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Float animation keyframes */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}

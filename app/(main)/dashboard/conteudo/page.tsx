'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { getLibrary } from '@/lib/api/streaming.service';
import type { StreamingLibrary, StreamingVideo, WatchProgress, StreamingTrail } from '@/lib/types/streaming';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { useStudentId } from '@/lib/hooks/useStudentId';

/* ────────────────────────────────────────────────────────────── */
/*  Video Card                                                    */
/* ────────────────────────────────────────────────────────────── */

function VideoCard({
  video,
  progress,
  onClick,
  index = 0,
}: {
  video: StreamingVideo;
  progress?: WatchProgress;
  onClick?: () => void;
  index?: number;
}) {
  const remaining = progress
    ? Math.ceil((video.duration_seconds - progress.progress_seconds) / 60)
    : Math.ceil(video.duration_seconds / 60);
  const progressPct = progress
    ? Math.round((progress.progress_seconds / video.duration_seconds) * 100)
    : 0;
  const isLocked = video.min_belt !== 'white';

  const href = video.series_id
    ? `/dashboard/conteudo/${video.series_id}`
    : `/dashboard/conteudo/standalone?v=${video.id}`;

  const inner = (
    <div
      className="group flex-shrink-0 cursor-pointer"
      style={{
        width: 'clamp(160px, 30vw, 240px)',
        animation: 'fadeSlideUp .45s ease both',
        animationDelay: `${index * 60}ms`,
      }}
      onClick={isLocked ? onClick : undefined}
    >
      <div className="relative overflow-hidden rounded-xl transition-all duration-[350ms] ease-[cubic-bezier(.4,0,.2,1)] group-hover:scale-[1.06] group-hover:-translate-y-1.5 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
        {/* Thumbnail gradient */}
        <div
          className="aspect-video w-full flex items-center justify-center"
          style={{ background: video.gradient_css }}
        >
          <span className="text-4xl opacity-30 group-hover:opacity-60 transition-opacity">
            🥋
          </span>

          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all">
            <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-red-600/50">
              <svg
                className="h-5 w-5 text-white ml-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {/* Duration badge */}
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
            {Math.ceil(video.duration_seconds / 60)}min
          </span>

          {/* Lock overlay */}
          {isLocked && (
            <div className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center">
              <span className="text-2xl">🔒</span>
              <p className="text-[10px] text-white/80 mt-1 px-3 text-center">
                Disponível a partir da faixa {video.min_belt}
              </p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {progressPct > 0 && (
          <div className="h-1 bg-[var(--bb-depth-4)]">
            <div
              className="h-full bg-red-600 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </div>

      <div className="mt-2 px-0.5">
        <p className="text-xs font-semibold text-[var(--bb-ink-100)] truncate">{video.title}</p>
        <p className="text-[10px] text-[var(--bb-ink-60)] truncate">
          {video.professor_name} · {remaining}min restantes
        </p>
      </div>
    </div>
  );

  if (isLocked) return inner;
  return <Link href={href}>{inner}</Link>;
}

/* ────────────────────────────────────────────────────────────── */
/*  Trail Card                                                    */
/* ────────────────────────────────────────────────────────────── */

function TrailCard({
  trail,
  index = 0,
  onLockedClick,
}: {
  trail: StreamingTrail;
  index?: number;
  onLockedClick?: () => void;
}) {
  const progressPct = 0; // progress requires TrailProgress data
  const isCompleted = false;
  const isLocked = trail.min_belt !== 'white';

  return (
    <div
      className="group flex-shrink-0 cursor-pointer"
      style={{
        width: 'clamp(240px, 38vw, 280px)',
        animation: 'fadeSlideUp .45s ease both',
        animationDelay: `${index * 80}ms`,
      }}
      onClick={isLocked ? onLockedClick : undefined}
    >
      <div className="relative overflow-hidden rounded-2xl transition-all duration-[350ms] ease-[cubic-bezier(.4,0,.2,1)] group-hover:scale-[1.06] group-hover:-translate-y-1.5 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
        <div
          className="aspect-video w-full flex flex-col items-start justify-end p-4"
          style={{ background: trail.gradient_css }}
        >
          {/* Certificate badge */}
          {isCompleted && (
            <span className="absolute top-3 right-3 bg-yellow-500/90 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
              Certificado ✓
            </span>
          )}

          <h3 className="text-sm font-bold text-white drop-shadow-md">
            {trail.name}
          </h3>
          <p className="text-[11px] text-white/70 mt-0.5">
            {trail.total_videos} aulas · {trail.total_duration}
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-[var(--bb-depth-4)]">
          <div
            className="h-full bg-red-600 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Lock overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center rounded-2xl">
            <span className="text-3xl">🔒</span>
            <p className="text-[11px] text-white/80 mt-1.5 px-4 text-center">
              Disponível a partir da faixa {trail.min_belt}
            </p>
          </div>
        )}
      </div>

      <div className="mt-2 px-0.5">
        <p className="text-[10px] text-[var(--bb-ink-60)] truncate">{trail.description}</p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Horizontal Section                                            */
/* ────────────────────────────────────────────────────────────── */

function HorizontalSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="px-4 mb-3">
        <h2 className="text-base font-bold text-[var(--bb-ink-100)]">{title}</h2>
        {subtitle && (
          <p className="text-[11px] text-[var(--bb-ink-40)] mt-0.5">{subtitle}</p>
        )}
      </div>
      <div
        className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        {children}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Loading Skeleton                                              */
/* ────────────────────────────────────────────────────────────── */

function LibrarySkeleton() {
  return (
    <div className="min-h-screen px-4 pt-16 pb-24 bg-[var(--bb-depth-1)]">
      {/* Hero skeleton */}
      <Skeleton className="w-full h-56 rounded-2xl bg-[var(--bb-depth-3)] mb-8" />

      {/* Section skeletons */}
      {[1, 2, 3].map((s) => (
        <div key={s} className="mb-8">
          <Skeleton className="w-36 h-4 rounded bg-[var(--bb-depth-3)] mb-3" />
          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3, 4].map((c) => (
              <div
                key={c}
                className="flex-shrink-0"
                style={{ width: 'clamp(160px, 30vw, 240px)' }}
              >
                <Skeleton className="aspect-video w-full rounded-xl bg-[var(--bb-depth-3)]" />
                <Skeleton className="w-24 h-3 mt-2 rounded bg-[var(--bb-depth-3)]" />
                <Skeleton className="w-16 h-2 mt-1 rounded bg-[var(--bb-depth-3)]" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Main Page                                                     */
/* ────────────────────────────────────────────────────────────── */

const MODALITY_FILTERS = ['Todos', 'BJJ', 'Judô', 'Prep. Física'] as const;

export default function BibliotecaStreamingPage() {
  const { toast } = useToast();
  const { studentId } = useStudentId();

  const [library, setLibrary] = useState<StreamingLibrary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalityFilter, setModalityFilter] = useState('Todos');
  const [activeTab, setActiveTab] = useState('BJJ');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getLibrary(studentId ?? 'stu-1', 'aluno_adulto', 'white')
      .then(setLibrary)
      .catch(() => toast('Erro ao carregar biblioteca', 'error'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLockedClick = useCallback(
    (belt: string) => {
      toast(`Evolua para faixa ${belt} para desbloquear`, 'info');
    },
    [toast],
  );

  const toggleSearch = useCallback(() => {
    setSearchOpen((prev) => {
      if (!prev) setTimeout(() => searchRef.current?.focus(), 100);
      return !prev;
    });
  }, []);

  /* ── Derived data ────────────────────────────────────────── */

  const allVideos = library?.all_series.flatMap((s) => s.videos) ?? [];

  const filteredVideos = allVideos.filter((v) => {
    const matchSearch =
      !search ||
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.professor_name.toLowerCase().includes(search.toLowerCase());
    const matchModality =
      modalityFilter === 'Todos' || v.modality === modalityFilter;
    return matchSearch && matchModality;
  });

  const continueWatching = library?.continue_watching ?? [];
  const recommended = library?.recommended ?? [];
  const trails = library?.trails ?? [];

  const newVideos = [...allVideos]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 12);

  const treinoCasa = allVideos.filter((v) => v.tags?.includes('treino_casa'));

  const videosByModality = filteredVideos.filter(
    (v) => v.modality === activeTab,
  );

  const professorGroups = allVideos.reduce<
    Record<string, StreamingVideo[]>
  >((acc, v) => {
    const key = v.professor_name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(v);
    return acc;
  }, {});

  const progressMap = new Map<string, WatchProgress>();
  continueWatching.forEach((cw) => {
    progressMap.set(cw.video_id, cw);
  });

  const heroVideo =
    continueWatching.length > 0
      ? allVideos.find((v) => v.id === continueWatching[0].video_id)
      : allVideos[0];
  const heroSeries = heroVideo
    ? library?.all_series.find((s) => s.id === heroVideo.series_id)
    : library?.all_series[0];
  const heroProgress = heroVideo
    ? progressMap.get(heroVideo.id)
    : undefined;

  /* ── Render ──────────────────────────────────────────────── */

  if (loading) return <LibrarySkeleton />;

  if (!library || allVideos.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[var(--bb-depth-1)]">
        <span className="text-5xl mb-4">🥋</span>
        <h2 className="text-lg font-bold text-[var(--bb-ink-100)] mb-1">
          Nenhum conteúdo disponível
        </h2>
        <p className="text-sm text-[var(--bb-ink-40)] text-center mb-6">
          A biblioteca será atualizada em breve com aulas exclusivas.
        </p>
        <Link
          href="/dashboard"
          className="bg-red-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-red-600/30"
        >
          Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 bg-[var(--bb-depth-1)]">
      {/* Global animation keyframes */}
      <style jsx global>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{ backgroundColor: 'color-mix(in srgb, var(--bb-depth-1) 85%, transparent)' }}
      >
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-red-600">BB</span>
            <span className="text-base font-semibold text-[var(--bb-ink-100)]">
              Biblioteca
            </span>
          </div>
          <div className="flex items-center gap-2">
            {searchOpen && (
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar aula ou professor..."
                className="bg-[var(--bb-depth-3)] text-[var(--bb-ink-100)] text-xs rounded-lg px-3 py-1.5 w-44 outline-none placeholder-[var(--bb-ink-40)] transition-all"
              />
            )}
            <button
              onClick={toggleSearch}
              className="p-2 rounded-lg hover:bg-[var(--bb-depth-3)] transition-colors"
            >
              <svg
                className="h-5 w-5 text-[var(--bb-ink-80)]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx={11} cy={11} r={8} />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {MODALITY_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setModalityFilter(f)}
              className={`flex-shrink-0 text-xs font-semibold px-4 py-1.5 rounded-full transition-colors ${
                modalityFilter === f
                  ? 'bg-red-600 text-white'
                  : 'bg-[var(--bb-depth-3)] text-[var(--bb-ink-60)] hover:bg-[var(--bb-depth-4)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {/* ── HERO BANNER ────────────────────────────────────── */}
      {heroSeries && heroVideo && (
        <section
          className="mx-4 mt-4 relative overflow-hidden"
          style={{ borderRadius: 16, minHeight: 220 }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                heroVideo.gradient_css ||
                'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

          <div className="relative flex items-end justify-between p-5 min-h-[220px]">
            <div className="flex-1 pr-4">
              <p className="text-[11px] text-red-400 font-semibold uppercase tracking-wider mb-1">
                {heroSeries.modality}
              </p>
              <h1 className="text-3xl font-extrabold text-white leading-tight mb-1">
                {heroSeries.title}
              </h1>
              <p className="text-xs text-white/80 line-clamp-2 mb-2">
                {heroSeries.description}
              </p>
              <p className="text-[11px] text-white/60 mb-3">
                Prof. {heroVideo.professor_name} ·{' '}
                {heroSeries.videos.length} aulas
                {heroProgress && (
                  <span>
                    {' '}
                    ·{' '}
                    {Math.ceil(
                      (heroVideo.duration_seconds -
                        heroProgress.progress_seconds) /
                        60,
                    )}
                    min restantes
                  </span>
                )}
              </p>

              {/* Hero progress bar */}
              {heroProgress && (
                <div className="w-full max-w-[200px] h-1.5 bg-white/20 rounded-full mb-3">
                  <div
                    className="h-full bg-red-600 rounded-full"
                    style={{
                      width: `${Math.round(
                        (heroProgress.progress_seconds /
                          heroVideo.duration_seconds) *
                          100,
                      )}%`,
                    }}
                  />
                </div>
              )}

              <Link
                href={`/dashboard/conteudo/${heroSeries.id}`}
                className="inline-flex items-center gap-2 bg-red-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-red-600/40 hover:bg-red-700 transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                {heroProgress ? 'Continuar' : 'Assistir'}
              </Link>
            </div>

            <span className="text-7xl opacity-20 select-none">🥋</span>
          </div>
        </section>
      )}

      {/* ── SECTION 1: Continuar Assistindo ────────────────── */}
      {continueWatching.length > 0 && (
        <HorizontalSection title="Continuar Assistindo">
          {continueWatching.map((cw, i) => {
            const video = allVideos.find((v) => v.id === cw.video_id);
            if (!video) return null;
            return (
              <VideoCard
                key={video.id}
                video={video}
                progress={cw}
                index={i}
                onClick={() =>
                  video.min_belt !== 'white' &&
                  handleLockedClick(video.min_belt)
                }
              />
            );
          })}
        </HorizontalSection>
      )}

      {/* ── SECTION 2: Recomendado Para Você ───────────────── */}
      {recommended.length > 0 && (
        <HorizontalSection
          title="Recomendado Para Você"
          subtitle="Baseado na sua faixa · Reforce seus fundamentos"
        >
          {recommended.flatMap((s) => s.videos).slice(0, 8).map((video, i) => (
            <VideoCard
              key={video.id}
              video={video}
              progress={progressMap.get(video.id)}
              index={i}
              onClick={() =>
                video.min_belt !== 'white' &&
                handleLockedClick(video.min_belt)
              }
            />
          ))}
        </HorizontalSection>
      )}

      {/* ── SECTION 3: Trilhas Oficiais ────────────────────── */}
      {trails.length > 0 && (
        <HorizontalSection
          title="Trilhas Oficiais"
          subtitle="Siga o caminho completo até a próxima faixa"
        >
          {trails.map((trail, i) => (
            <TrailCard
              key={trail.id}
              trail={trail}
              index={i}
              onLockedClick={() => handleLockedClick(trail.min_belt)}
            />
          ))}
        </HorizontalSection>
      )}

      {/* ── SECTION 4: Por Modalidade ──────────────────────── */}
      <section className="mt-8 px-4">
        <h2 className="text-base font-bold text-[var(--bb-ink-100)] mb-3">Por Modalidade</h2>
        <div className="flex gap-2 mb-4">
          {['BJJ', 'Judô', 'Prep. Física'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-colors ${
                activeTab === tab
                  ? 'bg-red-600 text-white'
                  : 'bg-[var(--bb-depth-3)] text-[var(--bb-ink-60)] hover:bg-[var(--bb-depth-4)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {videosByModality.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {videosByModality.slice(0, 12).map((video, i) => (
              <VideoCard
                key={video.id}
                video={video}
                progress={progressMap.get(video.id)}
                index={i}
                onClick={() =>
                  video.min_belt !== 'white' &&
                  handleLockedClick(video.min_belt)
                }
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--bb-ink-40)] py-6 text-center">
            Nenhum vídeo encontrado para {activeTab}
          </p>
        )}
      </section>

      {/* ── SECTION 5: Por Professor ───────────────────────── */}
      {Object.keys(professorGroups).length > 0 && (
        <section className="mt-8">
          <div className="px-4 mb-3">
            <h2 className="text-base font-bold text-[var(--bb-ink-100)]">Por Professor</h2>
          </div>
          <div className="flex gap-2 px-4 mb-4 overflow-x-auto scrollbar-hide">
            {Object.entries(professorGroups).map(([name, videos]) => (
              <button
                key={name}
                onClick={() => setSearch(name)}
                className="flex-shrink-0 bg-[var(--bb-depth-3)] hover:bg-[var(--bb-depth-4)] text-[var(--bb-ink-80)] text-xs font-medium px-4 py-2 rounded-full transition-colors"
              >
                {name} ({videos.length})
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── SECTION 6: Novidades ───────────────────────────── */}
      {newVideos.length > 0 && (
        <HorizontalSection title="Novidades" subtitle="Adicionados recentemente">
          {newVideos.map((video, i) => (
            <VideoCard
              key={video.id}
              video={video}
              progress={progressMap.get(video.id)}
              index={i}
              onClick={() =>
                video.min_belt !== 'white' &&
                handleLockedClick(video.min_belt)
              }
            />
          ))}
        </HorizontalSection>
      )}

      {/* ── SECTION 7: Treino em Casa ──────────────────────── */}
      {treinoCasa.length > 0 && (
        <HorizontalSection
          title="Treino em Casa"
          subtitle="Pratique onde quiser, sem equipamento"
        >
          {treinoCasa.map((video, i) => (
            <VideoCard
              key={video.id}
              video={video}
              progress={progressMap.get(video.id)}
              index={i}
              onClick={() =>
                video.min_belt !== 'white' &&
                handleLockedClick(video.min_belt)
              }
            />
          ))}
        </HorizontalSection>
      )}
    </div>
  );
}

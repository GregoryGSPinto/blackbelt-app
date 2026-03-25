'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  listVideos, listSeries, listTrails, listMaterials,
  getContentStats, createVideo,
  publishVideo, unpublishVideo, deleteVideo, duplicateVideo,
  createSeries, deleteSeries,
  createTrail, deleteTrail,
  createMaterial, deleteMaterial,
  setQuizForVideo, getQuizForVideo,
} from '@/lib/api/content-management.service';
import { uploadVideo } from '@/lib/api/video-storage.service';
import type { UploadProgress } from '@/lib/types/video-storage';
import { handleServiceError } from '@/lib/api/errors';
import type {
  ContentVideo, ContentStats, VideoFormData, SeriesFormData,
  AcademicMaterial, AcademicMaterialInput,
  QuizQuestionInput,
} from '@/lib/types/content-management';
import type { StreamingSeries, StreamingTrail } from '@/lib/types/streaming';
import { GRADIENT_PRESETS } from '@/lib/mocks/content-management.mock';
import { Skeleton } from '@/components/ui/Skeleton';
import { PlanGate } from '@/components/plans/PlanGate';
import { useToast } from '@/lib/hooks/useToast';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

// ── Helpers ──────────────────────────────────────────────────────────

function fmtDuration(s: number): string {
  const m = Math.floor(s / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h${m % 60}min` : `${m}min`;
}

function fmtBytes(b: number): string {
  if (b === 0) return '—';
  if (b < 1_000_000) return `${(b / 1_000).toFixed(0)} KB`;
  return `${(b / 1_000_000).toFixed(1)} MB`;
}

const BELT_OPTIONS = [
  { value: 'white', label: 'Branca' },
  { value: 'blue', label: 'Azul' },
  { value: 'purple', label: 'Roxa' },
  { value: 'brown', label: 'Marrom' },
  { value: 'black', label: 'Preta' },
];

const MODALITY_OPTIONS = ['BJJ', 'Judo', 'Muay Thai', 'Wrestling', 'MMA'];

const CATEGORY_OPTIONS = [
  { value: 'fundamentos', label: 'Fundamentos' },
  { value: 'intermediario', label: 'Intermediario' },
  { value: 'avancado', label: 'Avancado' },
  { value: 'competicao', label: 'Competicao' },
  { value: 'preparacao', label: 'Preparacao' },
  { value: 'especial', label: 'Especial' },
];

const MATERIAL_TYPES = [
  { value: 'lesson_plan', label: 'Plano de Aula' },
  { value: 'pdf', label: 'PDF' },
  { value: 'document', label: 'Documento' },
  { value: 'image', label: 'Imagem' },
  { value: 'link', label: 'Link Externo' },
];

type Tab = 'videos' | 'playlists' | 'trilhas' | 'material' | 'analytics';

// ── Loading skeleton ────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton variant="text" className="h-8 w-64" />
      <Skeleton variant="text" className="h-4 w-48" />
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="card" className="h-20" />)}
      </div>
      <Skeleton variant="card" className="h-96" />
    </div>
  );
}

// ── Shared input styles ─────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)',
  borderRadius: 'var(--bb-radius-sm)', color: 'var(--bb-ink-100)',
  padding: '8px 12px', width: '100%', fontSize: '14px',
};
const selectStyle: React.CSSProperties = { ...inputStyle };
const labelStyle: React.CSSProperties = { color: 'var(--bb-ink-80)', fontSize: '13px', fontWeight: 500 };

// ══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════

export default function ProfessorConteudoPage() {
  const [tab, setTab] = useState<Tab>('videos');
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [videos, setVideos] = useState<ContentVideo[]>([]);
  const [series, setSeries] = useState<StreamingSeries[]>([]);
  const [trails, setTrails] = useState<StreamingTrail[]>([]);
  const [materials, setMaterials] = useState<AcademicMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterPublished, setFilterPublished] = useState<boolean | undefined>(undefined);

  // Modals
  const [showNewVideo, setShowNewVideo] = useState(false);
  const [showNewSeries, setShowNewSeries] = useState(false);
  const [showNewTrail, setShowNewTrail] = useState(false);
  const [showNewMaterial, setShowNewMaterial] = useState(false);
  const [quizEditVideoId, setQuizEditVideoId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const [st, v, se, tr, ma] = await Promise.all([
        getContentStats(getActiveAcademyId()),
        listVideos(getActiveAcademyId(), { search: search || undefined, is_published: filterPublished }),
        listSeries(getActiveAcademyId()),
        listTrails(getActiveAcademyId()),
        listMaterials(getActiveAcademyId()),
      ]);
      setStats(st);
      setVideos(v.videos);
      setSeries(se);
      setTrails(tr);
      setMaterials(ma.materials);
    } catch (error) {
      handleServiceError(error, 'content.page');
    } finally {
      setLoading(false);
    }
  }, [search, filterPublished]);

  useEffect(() => { reload(); }, [reload]);

  if (loading || !stats) return <PageSkeleton />;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'videos', label: '\uD83D\uDCF9 Videos', count: stats.total_videos },
    { key: 'playlists', label: '\uD83D\uDCDA Playlists', count: stats.total_series },
    { key: 'trilhas', label: '\uD83D\uDDFA\uFE0F Trilhas', count: stats.total_trails },
    { key: 'material', label: '\uD83D\uDCC4 Material', count: stats.total_materials },
    { key: 'analytics', label: '\uD83D\uDCCA Analytics', count: 0 },
  ];

  return (
    <PlanGate module="conteudo">
      <div className="min-h-screen space-y-6 p-6" data-stagger>
        {/* Header */}
        <section className="animate-reveal flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display font-bold" style={{ fontSize: '28px', color: 'var(--bb-ink-100)' }}>
              Gestao de Conteudo
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Videos, playlists e material academico
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowNewVideo(true)}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: '#22C55E' }}
            >
              + Novo Video
            </button>
            <button
              onClick={() => tab === 'material' ? setShowNewMaterial(true) : setShowNewSeries(true)}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}
            >
              {tab === 'material' ? '+ Material' : '+ Nova Playlist'}
            </button>
          </div>
        </section>

        {/* Tabs */}
        <section className="animate-reveal">
          <div className="flex gap-1 overflow-x-auto pb-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  background: tab === t.key ? 'var(--bb-brand-surface)' : 'transparent',
                  color: tab === t.key ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                  fontWeight: tab === t.key ? 600 : 400,
                }}
              >
                {t.label}{t.count > 0 ? ` (${t.count})` : ''}
              </button>
            ))}
          </div>
        </section>

        {/* Tab content */}
        {tab === 'videos' && (
          <VideosTab
            stats={stats} videos={videos}
            search={search} setSearch={setSearch}
            filterPublished={filterPublished} setFilterPublished={setFilterPublished}
            onPublish={async (id) => { await publishVideo(id); reload(); }}
            onUnpublish={async (id) => { await unpublishVideo(id); reload(); }}
            onDelete={async (id) => { if (confirm('Excluir este video e seu quiz?')) { await deleteVideo(id); reload(); } }}
            onDuplicate={async (id) => { await duplicateVideo(id); reload(); }}
            onEditQuiz={(id) => setQuizEditVideoId(id)}
          />
        )}
        {tab === 'playlists' && (
          <PlaylistsTab
            series={series} videos={videos}
            onNewSeries={() => setShowNewSeries(true)}
            onDelete={async (id) => { if (confirm('Excluir esta playlist? Videos serao movidos para "sem serie".')) { await deleteSeries(id); reload(); } }}
          />
        )}
        {tab === 'trilhas' && (
          <TrailsTab
            trails={trails}
            onNewTrail={() => setShowNewTrail(true)}
            onDelete={async (id) => { if (confirm('Excluir esta trilha?')) { await deleteTrail(id); reload(); } }}
          />
        )}
        {tab === 'material' && (
          <MaterialTab
            materials={materials}
            onNewMaterial={() => setShowNewMaterial(true)}
            onDelete={async (id) => { if (confirm('Excluir este material?')) { await deleteMaterial(id); reload(); } }}
          />
        )}
        {tab === 'analytics' && <AnalyticsTab stats={stats} videos={videos} />}

        {/* Modals */}
        {showNewVideo && (
          <NewVideoModal
            series={series}
            onClose={() => setShowNewVideo(false)}
            onCreated={() => { setShowNewVideo(false); reload(); }}
          />
        )}
        {showNewSeries && (
          <NewSeriesModal
            onClose={() => setShowNewSeries(false)}
            onCreated={() => { setShowNewSeries(false); reload(); }}
          />
        )}
        {showNewTrail && (
          <NewTrailModal
            series={series}
            onClose={() => setShowNewTrail(false)}
            onCreated={() => { setShowNewTrail(false); reload(); }}
          />
        )}
        {showNewMaterial && (
          <NewMaterialModal
            series={series}
            onClose={() => setShowNewMaterial(false)}
            onCreated={() => { setShowNewMaterial(false); reload(); }}
          />
        )}
        {quizEditVideoId && (
          <QuizEditor
            videoId={quizEditVideoId}
            videoTitle={videos.find(v => v.id === quizEditVideoId)?.title ?? ''}
            onClose={() => setQuizEditVideoId(null)}
            onSaved={() => { setQuizEditVideoId(null); reload(); }}
          />
        )}
      </div>
    </PlanGate>
  );
}

// ══════════════════════════════════════════════════════════════════════
// TAB: VIDEOS
// ══════════════════════════════════════════════════════════════════════

function VideosTab({
  stats, videos, search, setSearch, filterPublished, setFilterPublished,
  onPublish, onUnpublish, onDelete, onDuplicate, onEditQuiz,
}: {
  stats: ContentStats;
  videos: ContentVideo[];
  search: string;
  setSearch: (s: string) => void;
  filterPublished: boolean | undefined;
  setFilterPublished: (v: boolean | undefined) => void;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onEditQuiz: (id: string) => void;
}) {
  const miniStats = [
    { icon: '\uD83D\uDCF9', value: stats.total_videos, label: 'Total' },
    { icon: '\u2705', value: stats.published_videos, label: 'Publicados' },
    { icon: '\uD83D\uDCDD', value: stats.draft_videos, label: 'Rascunho' },
    { icon: '\uD83D\uDC41\uFE0F', value: stats.total_views, label: 'Views' },
  ];

  return (
    <>
      {/* Mini stats */}
      <section className="animate-reveal grid grid-cols-2 gap-3 sm:grid-cols-4">
        {miniStats.map((s) => (
          <div
            key={s.label}
            className="p-4 text-center"
            style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-md)' }}
          >
            <p className="text-xl">{s.icon}</p>
            <p className="mt-1 text-lg font-bold font-mono" style={{ color: 'var(--bb-ink-100)' }}>{s.value.toLocaleString()}</p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{s.label}</p>
          </div>
        ))}
      </section>

      {/* Filters */}
      <section className="animate-reveal flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <input
            type="text" placeholder="Buscar por titulo..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="text-sm" style={inputStyle}
          />
        </div>
        <div className="flex gap-2">
          {[
            { label: 'Todos', val: undefined },
            { label: 'Publicados', val: true },
            { label: 'Rascunhos', val: false },
          ].map((f) => (
            <button
              key={f.label}
              onClick={() => setFilterPublished(f.val)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: filterPublished === f.val ? 'var(--bb-brand-surface)' : 'var(--bb-depth-4)',
                color: filterPublished === f.val ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* Video list */}
      <section className="animate-reveal space-y-3">
        {videos.length === 0 ? (
          <p className="py-12 text-center text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Nenhum video encontrado.
          </p>
        ) : (
          videos.map((video) => (
            <VideoCard
              key={video.id} video={video}
              onPublish={onPublish} onUnpublish={onUnpublish}
              onDelete={onDelete} onDuplicate={onDuplicate}
              onEditQuiz={onEditQuiz}
            />
          ))
        )}
      </section>
    </>
  );
}

function VideoCard({
  video, onPublish, onUnpublish, onDelete, onDuplicate, onEditQuiz,
}: {
  video: ContentVideo;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onEditQuiz: (id: string) => void;
}) {
  return (
    <div
      className="flex flex-col gap-4 p-4 sm:flex-row"
      style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}
    >
      {/* Thumbnail */}
      <div
        className="flex h-24 w-full shrink-0 items-center justify-center overflow-hidden sm:w-40"
        style={{
          borderRadius: 'var(--bb-radius-sm)',
          background: video.thumbnail_url
            ? `url(${video.thumbnail_url}) center/cover`
            : 'var(--bb-depth-4)',
        }}
      >
        {!video.thumbnail_url && (
          <span className="text-2xl">{'\uD83C\uDFAC'}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
            {video.title}
          </h3>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{
              background: video.is_published ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
              color: video.is_published ? '#22C55E' : '#F59E0B',
            }}
          >
            {video.is_published ? '\u2705 Publicado' : '\uD83D\uDCDD Rascunho'}
          </span>
        </div>
        <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
          {video.series_title ? `Serie: ${video.series_title} \u00B7 Ep. ${video.order}` : 'Sem serie \u00B7 Avulso'}
          {' \u00B7 '}{video.modality} \u00B7 Faixa: {BELT_OPTIONS.find(b => b.value === video.min_belt)?.label ?? video.min_belt}
          {' \u00B7 '}{fmtDuration(video.duration_seconds)}
        </p>
        <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
          {'\uD83D\uDC41\uFE0F'} {video.views} views
          {video.quiz_count > 0
            ? ` \u00B7 \uD83D\uDCDD Quiz: ${video.quiz_count} perguntas`
            : ' \u00B7 \u26A0\uFE0F Sem quiz'}
        </p>

        {/* Actions */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => onEditQuiz(video.id)}
            className="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
            style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}
          >
            {video.quiz_count > 0 ? '\uD83D\uDCDD Quiz' : '\uD83D\uDCDD Criar Quiz'}
          </button>
          {video.is_published ? (
            <button
              onClick={() => onUnpublish(video.id)}
              className="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
              style={{ background: 'var(--bb-depth-4)', color: '#F59E0B' }}
            >
              {'\u23F8\uFE0F'} Despublicar
            </button>
          ) : (
            <button
              onClick={() => onPublish(video.id)}
              className="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}
            >
              {'\u25B6\uFE0F'} Publicar
            </button>
          )}
          <button
            onClick={() => onDuplicate(video.id)}
            className="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
            style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}
          >
            {'\uD83D\uDCCB'} Duplicar
          </button>
          <button
            onClick={() => onDelete(video.id)}
            className="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}
          >
            {'\uD83D\uDDD1\uFE0F'} Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// TAB: PLAYLISTS
// ══════════════════════════════════════════════════════════════════════

function PlaylistsTab({
  series, videos, onNewSeries, onDelete,
}: {
  series: StreamingSeries[];
  videos: ContentVideo[];
  onNewSeries: () => void;
  onDelete: (id: string) => void;
}) {
  const orphanVideos = videos.filter(v => !v.series_id);

  return (
    <section className="animate-reveal space-y-4">
      {series.length === 0 && orphanVideos.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>Nenhuma playlist criada.</p>
          <button onClick={onNewSeries} className="mt-3 rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ background: 'var(--bb-brand)' }}>
            + Nova Playlist
          </button>
        </div>
      ) : (
        <>
          {series.map((s) => {
            const seriesVideos = videos.filter(v => v.series_id === s.id).sort((a, b) => a.order - b.order);
            const publishedCount = seriesVideos.filter(v => v.is_published).length;
            const draftCount = seriesVideos.length - publishedCount;
            return (
              <div
                key={s.id} className="overflow-hidden"
                style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}
              >
                {/* Header with gradient */}
                <div className="flex items-center gap-4 p-4">
                  <div className="h-14 w-14 shrink-0 rounded-lg" style={{ background: s.gradient_css }} />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                      {s.title} ({seriesVideos.length} videos)
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                      {s.modality} &middot; Faixa: {BELT_OPTIONS.find(b => b.value === s.min_belt)?.label ?? s.min_belt}
                      {publishedCount > 0 && ` · ${publishedCount} publicados`}
                      {draftCount > 0 && ` · ${draftCount} rascunhos`}
                    </p>
                  </div>
                  <button
                    onClick={() => onDelete(s.id)}
                    className="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
                    style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}
                  >
                    Excluir
                  </button>
                </div>

                {/* Episodes */}
                <div className="px-4 pb-4">
                  <div className="space-y-1.5">
                    {seriesVideos.map((v) => (
                      <div
                        key={v.id} className="flex items-center gap-3 rounded-md px-3 py-2"
                        style={{ background: 'var(--bb-depth-3)' }}
                      >
                        <span className="w-5 text-center text-xs font-mono font-bold" style={{ color: 'var(--bb-ink-40)' }}>
                          {v.order}
                        </span>
                        <span className="flex-1 truncate text-xs" style={{ color: 'var(--bb-ink-100)' }}>
                          {v.is_published ? '' : '(rascunho) '}{v.title}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                          {fmtDuration(v.duration_seconds)}
                        </span>
                        <span className="text-xs">
                          {v.is_published ? '\u2705' : '\uD83D\uDCDD'}
                        </span>
                      </div>
                    ))}
                    {seriesVideos.length === 0 && (
                      <p className="py-4 text-center text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                        Nenhum video nesta playlist. Ao criar um video, selecione esta playlist.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Orphan videos (without playlist) */}
          {orphanVideos.length > 0 && (
            <div
              className="overflow-hidden"
              style={{ background: 'var(--bb-depth-2)', border: '1px dashed var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}
            >
              <div className="p-4">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}>
                  Videos sem playlist ({orphanVideos.length})
                </h3>
                <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  Estes videos nao pertencem a nenhuma playlist. Edite o video para adicionar a uma playlist.
                </p>
              </div>
              <div className="px-4 pb-4 space-y-1.5">
                {orphanVideos.map((v) => (
                  <div
                    key={v.id} className="flex items-center gap-3 rounded-md px-3 py-2"
                    style={{ background: 'var(--bb-depth-3)' }}
                  >
                    <span className="flex-1 truncate text-xs" style={{ color: 'var(--bb-ink-100)' }}>
                      {v.title}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      {fmtDuration(v.duration_seconds)}
                    </span>
                    <span className="text-xs">
                      {v.is_published ? '\u2705' : '\uD83D\uDCDD'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New playlist button at bottom */}
          <button onClick={onNewSeries}
            className="w-full rounded-lg py-3 text-sm font-medium transition-colors"
            style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)', border: '1px dashed var(--bb-glass-border)' }}>
            + Nova Playlist
          </button>
        </>
      )}
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════
// TAB: TRAILS
// ══════════════════════════════════════════════════════════════════════

function TrailsTab({
  trails, onNewTrail, onDelete,
}: {
  trails: StreamingTrail[];
  onNewTrail: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section className="animate-reveal space-y-4">
      {trails.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>Nenhuma trilha criada.</p>
          <button onClick={onNewTrail} className="mt-3 rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ background: 'var(--bb-brand)' }}>
            + Nova Trilha
          </button>
        </div>
      ) : (
        trails.map((t) => (
          <div
            key={t.id} className="p-4"
            style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                  {'\uD83D\uDDFA\uFE0F'} {t.name}
                </h3>
                <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                  {t.series.length} serie{t.series.length > 1 ? 's' : ''} \u00B7 {t.total_videos} videos \u00B7 {t.total_duration}
                  {' \u00B7 Faixa: '}{BELT_OPTIONS.find(b => b.value === t.min_belt)?.label ?? t.min_belt}
                  {' \u00B7 '}{'\uD83C\uDF93'} Certificado: {t.certificate_available ? 'Sim' : 'Nao'}
                </p>
              </div>
              <button
                onClick={() => onDelete(t.id)}
                className="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
                style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}
              >
                {'\uD83D\uDDD1\uFE0F'}
              </button>
            </div>
            {t.series.length > 0 && (
              <div className="mt-3 space-y-1">
                {t.series.map((s, i) => (
                  <p key={s.id} className="text-xs" style={{ color: 'var(--bb-ink-80)' }}>
                    {i + 1}. {s.title} ({s.videos.length} videos)
                  </p>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════
// TAB: MATERIAL
// ══════════════════════════════════════════════════════════════════════

function MaterialTab({
  materials, onNewMaterial, onDelete,
}: {
  materials: AcademicMaterial[];
  onNewMaterial: () => void;
  onDelete: (id: string) => void;
}) {
  const typeIcons: Record<string, string> = {
    pdf: '\uD83D\uDCC4', document: '\uD83D\uDCC3', image: '\uD83D\uDDBC\uFE0F',
    link: '\uD83D\uDD17', lesson_plan: '\uD83D\uDCD6',
  };
  return (
    <section className="animate-reveal space-y-3">
      {materials.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>Nenhum material academico.</p>
          <button onClick={onNewMaterial} className="mt-3 rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ background: 'var(--bb-brand)' }}>
            + Novo Material
          </button>
        </div>
      ) : (
        materials.map((m) => (
          <div
            key={m.id} className="flex items-start gap-4 p-4"
            style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}
          >
            <span className="mt-0.5 text-2xl">{typeIcons[m.type] ?? '\uD83D\uDCC1'}</span>
            <div className="flex-1 min-w-0">
              <h3 className="truncate text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                {m.title}
              </h3>
              <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                Tipo: {MATERIAL_TYPES.find(t => t.value === m.type)?.label ?? m.type}
                {m.file_size_bytes > 0 ? ` \u00B7 ${fmtBytes(m.file_size_bytes)}` : ''}
                {' \u00B7 '}{m.modality} \u00B7 Faixa: {BELT_OPTIONS.find(b => b.value === m.min_belt)?.label ?? m.min_belt}
              </p>
              <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                {'\uD83D\uDCE5'} {m.downloads} downloads
                {m.series_id && ` \u00B7 Vinculado a serie`}
                {' \u00B7 '}{m.is_published ? '\u2705 Publicado' : '\uD83D\uDCDD Rascunho'}
              </p>
            </div>
            <button
              onClick={() => onDelete(m.id)}
              className="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}
            >
              {'\uD83D\uDDD1\uFE0F'}
            </button>
          </div>
        ))
      )}
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════
// TAB: ANALYTICS
// ══════════════════════════════════════════════════════════════════════

function AnalyticsTab({ stats, videos }: { stats: ContentStats; videos: ContentVideo[] }) {
  const topVideos = [...videos]
    .filter(v => v.views > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const problemVideos = [...videos]
    .filter(v => v.views > 10 && v.completions / v.views < 0.5)
    .slice(0, 3);

  const medals = ['\uD83E\uDD47', '\uD83E\uDD48', '\uD83E\uDD49', '4.', '5.'];

  const analyticsCards = [
    { icon: '\uD83D\uDC41\uFE0F', value: stats.total_views.toLocaleString(), label: 'Views' },
    { icon: '\u2705', value: stats.total_completions.toLocaleString(), label: 'Conclusoes' },
    { icon: '\uD83D\uDCDD', value: `${stats.avg_quiz_score}%`, label: 'Quiz Avg' },
    { icon: '\u23F1\uFE0F', value: '8:32', label: 'Tempo Med' },
  ];

  return (
    <>
      <section className="animate-reveal grid grid-cols-2 gap-3 sm:grid-cols-4">
        {analyticsCards.map((c) => (
          <div
            key={c.label} className="p-4 text-center"
            style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-md)' }}
          >
            <p className="text-xl">{c.icon}</p>
            <p className="mt-1 text-lg font-bold font-mono" style={{ color: 'var(--bb-ink-100)' }}>{c.value}</p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{c.label}</p>
          </div>
        ))}
      </section>

      {/* Top videos */}
      <section className="animate-reveal">
        <div className="p-5" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}>
          <h3 className="mb-3 font-mono text-xs uppercase" style={{ letterSpacing: '0.08em', color: 'var(--bb-ink-40)' }}>
            Top Videos (mais assistidos)
          </h3>
          <div className="space-y-2">
            {topVideos.map((v, i) => (
              <div key={v.id} className="flex items-center gap-3 rounded-md px-3 py-2" style={{ background: 'var(--bb-depth-3)' }}>
                <span className="text-sm">{medals[i] ?? `${i + 1}.`}</span>
                <span className="flex-1 truncate text-sm" style={{ color: 'var(--bb-ink-100)' }}>
                  {v.title}
                </span>
                <span className="text-xs font-mono" style={{ color: 'var(--bb-ink-60)' }}>
                  {v.views} views \u00B7 {v.views > 0 ? Math.round((v.completions / v.views) * 100) : 0}% conclusao
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem videos */}
      {problemVideos.length > 0 && (
        <section className="animate-reveal">
          <div className="p-5" style={{ background: 'var(--bb-depth-2)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--bb-radius-lg)' }}>
            <h3 className="mb-3 font-mono text-xs uppercase" style={{ letterSpacing: '0.08em', color: '#F59E0B' }}>
              {'\u26A0\uFE0F'} Videos com problema
            </h3>
            <div className="space-y-2">
              {problemVideos.map((v) => (
                <p key={v.id} className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                  {'\u26A0\uFE0F'} &quot;{v.title}&quot; — so {v.views > 0 ? Math.round((v.completions / v.views) * 100) : 0}% concluiram
                </p>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
// MODAL: NEW VIDEO (Upload-only, multi-step)
// ══════════════════════════════════════════════════════════════════════

const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

function NewVideoModal({
  series, onClose, onCreated,
}: {
  series: StreamingSeries[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [saving, setSaving] = useState(false);
  const [fileError, setFileError] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [modality, setModality] = useState('BJJ');
  const [minBelt, setMinBelt] = useState('white');
  const [difficulty, setDifficulty] = useState('iniciante');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [seriesId, setSeriesId] = useState<string | null>(null);
  const [publishNow, setPublishNow] = useState(true);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionInput[]>([]);

  function validateFile(f: File): boolean {
    setFileError('');
    if (!ACCEPTED_VIDEO_TYPES.includes(f.type)) {
      setFileError('Formato nao suportado. Use MP4, MOV ou WebM.');
      return false;
    }
    if (f.size > MAX_FILE_SIZE) {
      setFileError('Arquivo muito grande. Maximo: 500MB.');
      return false;
    }
    return true;
  }

  function handleFileSelect(f: File) {
    if (validateFile(f)) {
      setFile(f);
      setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
      setStep(2);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFileSelect(f);
  }

  function handleRecordClick() {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
      fileInputRef.current.removeAttribute('capture');
    }
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) { setTags([...tags, t]); }
    setTagInput('');
  }

  function addQuizQuestion() {
    if (quizQuestions.length >= 5) return;
    setQuizQuestions([...quizQuestions, { question: '', options: ['', '', ''], correct_index: 0 }]);
  }

  function updateQuestion(idx: number, field: string, value: string | number | string[]) {
    setQuizQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  }

  function removeQuestion(idx: number) {
    setQuizQuestions(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    if (!file) return;
    setSaving(true);
    setUploading(true);
    try {
      // Upload via unified storage service
      await uploadVideo(file, {
        title,
        description,
        academy_id: getActiveAcademyId(),
        professor_id: 'prof-andre',
        modality,
        belt_level: minBelt,
        difficulty,
        tags,
        audience: [],
        class_ids: [],
      }, (progress) => setUploadProgress(progress));

      // Also create video entry in content management
      const seriesVideos = seriesId ? series.find(s => s.id === seriesId)?.videos ?? [] : [];
      const data: VideoFormData = {
        source: 'upload', source_url: '',
        embed_url: '', source_video_id: '',
        thumbnail_url: '', duration_seconds: 0,
        original_title: file.name,
        title, description, modality, min_belt: minBelt, tags,
        series_id: seriesId, order: seriesVideos.length + 1,
        is_published: publishNow, is_free: false, quiz_questions: quizQuestions,
      };
      await createVideo(getActiveAcademyId(), 'prof-andre', data);
      setStep(4);
    } catch {
      toast('Erro ao enviar video.', 'error');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto"
        style={{
          background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)',
          borderRadius: 'var(--bb-radius-lg)', boxShadow: 'var(--bb-shadow-lg)',
        }}
      >
        {/* Step 1: Upload file */}
        {step === 1 && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Novo Video</h2>
              <button onClick={onClose} className="text-lg" style={{ color: 'var(--bb-ink-60)' }}>{'\u2715'}</button>
            </div>

            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={() => setDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-xl p-8 text-center transition-all"
              style={{
                border: `2px dashed ${dragging ? 'var(--bb-brand)' : 'var(--bb-glass-border)'}`,
                background: dragging ? 'var(--bb-brand-surface)' : 'var(--bb-depth-3)',
              }}
            >
              <p className="text-3xl mb-2">{'\uD83D\uDCC1'}</p>
              <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                Arraste o video aqui
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--bb-ink-60)' }}>
                ou clique para selecionar
              </p>
              <p className="text-xs mt-3" style={{ color: 'var(--bb-ink-40)' }}>
                Formatos: MP4, MOV, WebM &middot; Max: 500MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>

            {fileError && (
              <p className="text-xs font-medium" style={{ color: '#EF4444' }}>{fileError}</p>
            )}

            {/* Record button */}
            <button
              onClick={handleRecordClick}
              className="w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
              style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
            >
              Gravar agora
            </button>
          </div>
        )}

        {/* Step 2: Video metadata */}
        {step === 2 && file && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Detalhes do Video</h2>
              <button onClick={onClose} className="text-lg" style={{ color: 'var(--bb-ink-60)' }}>{'\u2715'}</button>
            </div>

            {/* File info */}
            <div className="flex items-center gap-3 rounded-lg p-3" style={{ background: 'var(--bb-depth-3)' }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg" style={{ background: 'var(--bb-brand-surface)' }}>
                <span className="text-lg">{'\uD83C\uDFAC'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{file.name}</p>
                <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{fmtBytes(file.size)}</p>
              </div>
              <button onClick={() => { setFile(null); setStep(1); }} className="text-xs" style={{ color: '#EF4444' }}>Trocar</button>
            </div>

            <div>
              <label style={labelStyle}>Titulo *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 text-sm" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Descricao</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                rows={3} className="mt-1 resize-none text-sm" style={inputStyle} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>Modalidade</label>
                <select value={modality} onChange={(e) => setModality(e.target.value)} className="mt-1 text-sm" style={selectStyle}>
                  {MODALITY_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Faixa minima</label>
                <select value={minBelt} onChange={(e) => setMinBelt(e.target.value)} className="mt-1 text-sm" style={selectStyle}>
                  {BELT_OPTIONS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Dificuldade</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="mt-1 text-sm" style={selectStyle}>
                <option value="iniciante">Iniciante</option>
                <option value="intermediario">Intermediario</option>
                <option value="avancado">Avancado</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tags</label>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {tags.map(t => (
                  <span key={t} className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                    style={{ background: 'var(--bb-brand-surface)', color: 'var(--bb-brand)' }}>
                    {t}
                    <button onClick={() => setTags(tags.filter(x => x !== t))} className="text-xs">{'\u2715'}</button>
                  </span>
                ))}
                <input type="text" value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  placeholder="+ tag" className="text-xs" style={{ ...inputStyle, width: '80px', padding: '4px 8px' }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Playlist/Serie</label>
              <select value={seriesId ?? ''} onChange={(e) => setSeriesId(e.target.value || null)} className="mt-1 text-sm" style={selectStyle}>
                <option value="">Sem serie</option>
                {series.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
              <input type="checkbox" checked={publishNow} onChange={(e) => setPublishNow(e.target.checked)} />
              Publicar imediatamente
            </label>
            <div className="flex gap-2">
              <button onClick={() => { setFile(null); setStep(1); }} className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}>
                Voltar
              </button>
              <button onClick={() => setStep(3)} disabled={!title.trim()}
                className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--bb-brand)' }}>
                Proximo: Quiz
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Quiz */}
        {step === 3 && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Quiz (opcional)</h2>
              <button onClick={onClose} className="text-lg" style={{ color: 'var(--bb-ink-60)' }}>{'\u2715'}</button>
            </div>
            <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
              Adicione perguntas sobre o video. O aluno responde apos assistir.
            </p>

            {quizQuestions.map((q, qi) => (
              <div key={qi} className="rounded-lg p-4 space-y-2" style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: 'var(--bb-ink-100)' }}>Pergunta {qi + 1}</span>
                  <button onClick={() => removeQuestion(qi)} className="text-xs" style={{ color: '#EF4444' }}>Remover</button>
                </div>
                <input type="text" value={q.question} onChange={(e) => updateQuestion(qi, 'question', e.target.value)}
                  placeholder="Pergunta..." className="text-sm" style={inputStyle} />
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuestion(qi, 'correct_index', oi)}
                      className="shrink-0 text-sm"
                      style={{ color: q.correct_index === oi ? '#22C55E' : 'var(--bb-ink-40)' }}
                    >
                      {q.correct_index === oi ? '\u25C9' : '\u25CB'}
                    </button>
                    <input type="text" value={opt}
                      onChange={(e) => {
                        const newOpts = [...q.options];
                        newOpts[oi] = e.target.value;
                        updateQuestion(qi, 'options', newOpts);
                      }}
                      placeholder={`Opcao ${String.fromCharCode(65 + oi)}`}
                      className="text-sm" style={inputStyle} />
                    {q.correct_index === oi && (
                      <span className="shrink-0 text-xs" style={{ color: '#22C55E' }}>Correta</span>
                    )}
                  </div>
                ))}
                <input type="text" value={q.timestamp_hint ?? ''}
                  onChange={(e) => updateQuestion(qi, 'timestamp_hint', e.target.value)}
                  placeholder="Dica: Reveja 2:15" className="text-xs" style={{ ...inputStyle, fontSize: '12px' }} />
              </div>
            ))}

            {quizQuestions.length < 5 && (
              <button onClick={addQuizQuestion} className="w-full rounded-lg py-2 text-sm font-medium transition-colors"
                style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)', border: '1px dashed var(--bb-glass-border)' }}>
                + Adicionar Pergunta (max 5)
              </button>
            )}

            {/* Upload progress (shown during save) */}
            {uploading && uploadProgress && (
              <div className="rounded-lg p-3 space-y-2" style={{ background: 'var(--bb-depth-3)' }}>
                <div className="flex justify-between text-xs" style={{ color: 'var(--bb-ink-80)' }}>
                  <span>Enviando...</span>
                  <span>{uploadProgress.percentage}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--bb-depth-4)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${uploadProgress.percentage}%`, background: 'var(--bb-brand)' }} />
                </div>
                <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  {fmtBytes(uploadProgress.loaded)} / {fmtBytes(uploadProgress.total)}
                  {uploadProgress.estimated_seconds_remaining !== null && ` — ${Math.ceil(uploadProgress.estimated_seconds_remaining / 60)}min restantes`}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setStep(2)} disabled={uploading} className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}>
                Voltar
              </button>
              <button onClick={() => { setQuizQuestions([]); handleSave(); }} disabled={saving}
                className="rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}>
                Pular Quiz
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: '#22C55E' }}>
                {saving ? 'Enviando...' : 'Publicar'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="p-6 space-y-4 text-center">
            <p className="text-4xl">{'\u2705'}</p>
            <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Video enviado!</h2>
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              &quot;{title}&quot; foi adicionado{seriesId ? ' a serie selecionada' : ' como avulso'}.
            </p>
            <div className="space-y-1 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
              <p>Status: {publishNow ? 'Publicado' : 'Rascunho'}</p>
              <p>Quiz: {quizQuestions.length > 0 ? `${quizQuestions.length} perguntas` : 'Sem quiz'}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => { setStep(1); setFile(null); setTitle(''); setDescription(''); setTags([]); setQuizQuestions([]); setUploadProgress(null); }}
                className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--bb-brand)' }}>
                Adicionar Outro Video
              </button>
              <button onClick={onCreated} className="w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}>
                Voltar para Gestao
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// MODAL: NEW SERIES
// ══════════════════════════════════════════════════════════════════════

function NewSeriesModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [modality, setModality] = useState('BJJ');
  const [minBelt, setMinBelt] = useState('white');
  const [category, setCategory] = useState<SeriesFormData['category']>('fundamentos');
  const [gradient, setGradient] = useState(GRADIENT_PRESETS[0].css);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await createSeries(getActiveAcademyId(), 'prof-andre', {
        title, description, modality, min_belt: minBelt,
        gradient_css: gradient, tags, category, is_published: true,
      });
      onCreated();
    } catch {
      toast('Erro ao criar playlist.', 'error');
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)', boxShadow: 'var(--bb-shadow-lg)' }}>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>{'\uD83C\uDFAC'} Nova Playlist</h2>
            <button onClick={onClose} className="text-lg" style={{ color: 'var(--bb-ink-60)' }}>{'\u2715'}</button>
          </div>
          <div>
            <label style={labelStyle}>Titulo *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 text-sm" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Descricao</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mt-1 resize-none text-sm" style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Modalidade</label>
              <select value={modality} onChange={(e) => setModality(e.target.value)} className="mt-1 text-sm" style={selectStyle}>
                {MODALITY_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Faixa minima</label>
              <select value={minBelt} onChange={(e) => setMinBelt(e.target.value)} className="mt-1 text-sm" style={selectStyle}>
                {BELT_OPTIONS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Categoria</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as SeriesFormData['category'])} className="mt-1 text-sm" style={selectStyle}>
              {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Gradiente</label>
            <div className="mt-2 grid grid-cols-6 gap-2">
              {GRADIENT_PRESETS.map((g) => (
                <button key={g.name} onClick={() => setGradient(g.css)} title={g.name}
                  className="h-10 w-full rounded-lg transition-transform"
                  style={{ background: g.css, border: gradient === g.css ? '2px solid var(--bb-brand)' : '1px solid var(--bb-glass-border)', transform: gradient === g.css ? 'scale(1.1)' : 'scale(1)' }} />
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Tags</label>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {tags.map(t => (
                <span key={t} className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs" style={{ background: 'var(--bb-brand-surface)', color: 'var(--bb-brand)' }}>
                  {t} <button onClick={() => setTags(tags.filter(x => x !== t))} className="text-xs">{'\u2715'}</button>
                </span>
              ))}
              <input type="text" value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const v = tagInput.trim().toLowerCase(); if (v && !tags.includes(v)) setTags([...tags, v]); setTagInput(''); } }}
                placeholder="+ tag" className="text-xs" style={{ ...inputStyle, width: '80px', padding: '4px 8px' }} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}>
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving || !title.trim()}
              className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50" style={{ background: '#22C55E' }}>
              {saving ? 'Criando...' : 'Criar Playlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// MODAL: NEW TRAIL
// ══════════════════════════════════════════════════════════════════════

function NewTrailModal({ series, onClose, onCreated }: { series: StreamingSeries[]; onClose: () => void; onCreated: () => void }) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [minBelt, setMinBelt] = useState('white');
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
  const [certificate, setCertificate] = useState(false);
  const [saving, setSaving] = useState(false);

  function toggleSeries(id: string) {
    setSelectedSeries(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function handleSave() {
    if (!name.trim() || selectedSeries.length === 0) return;
    setSaving(true);
    try {
      await createTrail(getActiveAcademyId(), { name, description, min_belt: minBelt, series_ids: selectedSeries, certificate_available: certificate });
      onCreated();
    } catch {
      toast('Erro ao criar trilha.', 'error');
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)', boxShadow: 'var(--bb-shadow-lg)' }}>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>{'\uD83D\uDDFA\uFE0F'} Nova Trilha</h2>
            <button onClick={onClose} className="text-lg" style={{ color: 'var(--bb-ink-60)' }}>{'\u2715'}</button>
          </div>
          <div>
            <label style={labelStyle}>Nome *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 text-sm" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Descricao</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mt-1 resize-none text-sm" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Faixa minima</label>
            <select value={minBelt} onChange={(e) => setMinBelt(e.target.value)} className="mt-1 text-sm" style={selectStyle}>
              {BELT_OPTIONS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Selecionar series *</label>
            <div className="mt-2 space-y-2">
              {series.map((s) => (
                <button key={s.id} onClick={() => toggleSeries(s.id)} className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors"
                  style={{ background: selectedSeries.includes(s.id) ? 'var(--bb-brand-surface)' : 'var(--bb-depth-3)', border: selectedSeries.includes(s.id) ? '1px solid var(--bb-brand)' : '1px solid var(--bb-glass-border)' }}>
                  <div className="h-8 w-8 shrink-0 rounded" style={{ background: s.gradient_css }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{s.title}</p>
                    <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{s.videos.length} videos</p>
                  </div>
                  {selectedSeries.includes(s.id) && <span className="ml-auto">{'\u2705'}</span>}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
            <input type="checkbox" checked={certificate} onChange={(e) => setCertificate(e.target.checked)} />
            Certificado ao completar
          </label>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}>
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving || !name.trim() || selectedSeries.length === 0}
              className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50" style={{ background: '#22C55E' }}>
              {saving ? 'Criando...' : 'Criar Trilha'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// MODAL: NEW MATERIAL
// ══════════════════════════════════════════════════════════════════════

function NewMaterialModal({ series, onClose, onCreated }: { series: StreamingSeries[]; onClose: () => void; onCreated: () => void }) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<AcademicMaterialInput['type']>('pdf');
  const [fileUrl, setFileUrl] = useState('');
  const [modality, setModality] = useState('BJJ');
  const [minBelt, setMinBelt] = useState('white');
  const [seriesId, setSeriesId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await createMaterial(getActiveAcademyId(), 'prof-andre', {
        title, description, type, file_url: fileUrl || '/mock/uploaded-file.pdf',
        modality, min_belt: minBelt, tags: [], series_id: seriesId, is_published: true,
      });
      onCreated();
    } catch {
      toast('Erro ao criar material.', 'error');
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)', boxShadow: 'var(--bb-shadow-lg)' }}>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>{'\uD83D\uDCC4'} Novo Material</h2>
            <button onClick={onClose} className="text-lg" style={{ color: 'var(--bb-ink-60)' }}>{'\u2715'}</button>
          </div>
          <div>
            <label style={labelStyle}>Titulo *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 text-sm" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Descricao</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mt-1 resize-none text-sm" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value as AcademicMaterialInput['type'])} className="mt-1 text-sm" style={selectStyle}>
              {MATERIAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>{type === 'link' ? 'URL' : 'URL do arquivo'}</label>
            <input type="text" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)}
              placeholder={type === 'link' ? 'https://...' : 'Upload simulado (cole URL)'} className="mt-1 text-sm" style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Modalidade</label>
              <select value={modality} onChange={(e) => setModality(e.target.value)} className="mt-1 text-sm" style={selectStyle}>
                {MODALITY_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Faixa minima</label>
              <select value={minBelt} onChange={(e) => setMinBelt(e.target.value)} className="mt-1 text-sm" style={selectStyle}>
                {BELT_OPTIONS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Vincular a serie (opcional)</label>
            <select value={seriesId ?? ''} onChange={(e) => setSeriesId(e.target.value || null)} className="mt-1 text-sm" style={selectStyle}>
              <option value="">Nenhuma</option>
              {series.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}>
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving || !title.trim()}
              className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50" style={{ background: '#22C55E' }}>
              {saving ? 'Criando...' : 'Criar Material'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// QUIZ EDITOR (inline modal)
// ══════════════════════════════════════════════════════════════════════

function QuizEditor({
  videoId, videoTitle, onClose, onSaved,
}: {
  videoId: string; videoTitle: string; onClose: () => void; onSaved: () => void;
}) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<QuizQuestionInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getQuizForVideo(videoId).then((existing) => {
      if (existing.length > 0) {
        setQuestions(existing.map(q => ({ question: q.question, options: q.options, correct_index: q.correct_index, timestamp_hint: q.timestamp_hint })));
      }
      setLoading(false);
    });
  }, [videoId]);

  function addQuestion() {
    if (questions.length >= 5) return;
    setQuestions([...questions, { question: '', options: ['', '', ''], correct_index: 0 }]);
  }

  function update(idx: number, field: string, value: string | number | string[]) {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  }

  function remove(idx: number) {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await setQuizForVideo(videoId, questions);
      onSaved();
    } catch {
      toast('Erro ao salvar quiz.', 'error');
    } finally { setSaving(false); }
  }

  if (loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)', boxShadow: 'var(--bb-shadow-lg)' }}>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {'\uD83D\uDCDD'} Quiz: &quot;{videoTitle}&quot;
            </h2>
            <button onClick={onClose} className="text-lg" style={{ color: 'var(--bb-ink-60)' }}>{'\u2715'}</button>
          </div>

          {questions.map((q, qi) => (
            <div key={qi} className="rounded-lg p-4 space-y-2" style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                  Pergunta {qi + 1} de {questions.length}
                </span>
                <button onClick={() => remove(qi)} className="text-xs" style={{ color: '#EF4444' }}>
                  {'\uD83D\uDDD1\uFE0F'} Remover
                </button>
              </div>
              <input type="text" value={q.question} onChange={(e) => update(qi, 'question', e.target.value)}
                placeholder="Pergunta..." className="text-sm" style={inputStyle} />
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <button onClick={() => update(qi, 'correct_index', oi)} className="shrink-0 text-sm"
                    style={{ color: q.correct_index === oi ? '#22C55E' : 'var(--bb-ink-40)' }}>
                    {q.correct_index === oi ? '\u25C9' : '\u25CB'}
                  </button>
                  <input type="text" value={opt}
                    onChange={(e) => {
                      const newOpts = [...q.options];
                      newOpts[oi] = e.target.value;
                      update(qi, 'options', newOpts);
                    }}
                    placeholder={`Opcao ${String.fromCharCode(65 + oi)}`} className="text-sm" style={inputStyle} />
                  {q.correct_index === oi && <span className="shrink-0 text-xs" style={{ color: '#22C55E' }}>Correta {'\u2705'}</span>}
                </div>
              ))}
              <input type="text" value={q.timestamp_hint ?? ''}
                onChange={(e) => update(qi, 'timestamp_hint', e.target.value)}
                placeholder="Dica (se errar): Reveja o minuto 2:15" className="text-xs" style={{ ...inputStyle, fontSize: '12px' }} />
            </div>
          ))}

          {questions.length < 5 && (
            <button onClick={addQuestion} className="w-full rounded-lg py-2 text-sm font-medium transition-colors"
              style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)', border: '1px dashed var(--bb-glass-border)' }}>
              + Adicionar Pergunta (max 5)
            </button>
          )}

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
              style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}>
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: '#22C55E' }}>
              {saving ? 'Salvando...' : 'Salvar Quiz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { listTrainingVideos, type TrainingVideoDTO } from '@/lib/api/training-video.service';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ComingSoon } from '@/components/shared/ComingSoon';

const STATUS_LABEL: Record<string, string> = { processing: 'Processando', ready: 'Pronto', failed: 'Falhou' };
const STATUS_COLOR: Record<string, string> = { processing: 'bg-[var(--bb-warning)]/10 text-[var(--bb-warning)]', ready: 'bg-[var(--bb-success)]/10 text-[var(--bb-success)]', failed: 'bg-[var(--bb-brand-primary)]/10 text-[var(--bb-brand-primary)]' };

export default function VideosGalleryPage() {
  const [videos, setVideos] = useState<TrainingVideoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [professorFilter, setProfessorFilter] = useState('');

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);

  useEffect(() => {
    async function load() {
      try {
        const data = await listTrainingVideos({ student_id: 'student-1' });
        setVideos(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const classes = [...new Set(videos.map((v) => v.class_name))];
  const professors = [...new Set(videos.map((v) => v.uploaded_by_name))];

  const filtered = videos.filter((v) => {
    if (dateFilter && !v.created_at.startsWith(dateFilter)) return false;
    if (classFilter && v.class_name !== classFilter) return false;
    if (professorFilter && v.uploaded_by_name !== professorFilter) return false;
    return true;
  });

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/dashboard" backLabel="Voltar ao Dashboard" />;
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader title="Meus Vídeos" subtitle="Vídeos de treino gravados pelos professores" />

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          type="month"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          placeholder="Filtrar por mês"
          className="rounded-lg border border-[var(--bb-glass-border)] px-3 py-2 text-sm"
        />
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="rounded-lg border border-[var(--bb-glass-border)] px-3 py-2 text-sm"
        >
          <option value="">Todas as turmas</option>
          {classes.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={professorFilter}
          onChange={(e) => setProfessorFilter(e.target.value)}
          className="rounded-lg border border-[var(--bb-glass-border)] px-3 py-2 text-sm"
        >
          <option value="">Todos os professores</option>
          {professors.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {(dateFilter || classFilter || professorFilter) && (
          <button
            onClick={() => { setDateFilter(''); setClassFilter(''); setProfessorFilter(''); }}
            className="rounded-lg px-3 py-2 text-sm text-bb-primary hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum vídeo encontrado"
          description="Você ainda não tem vídeos de treino gravados."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((video) => (
            <a
              key={video.id}
              href={`/progresso/videos/${video.id}`}
              className="group overflow-hidden rounded-[var(--bb-radius-lg)] border border-[var(--bb-glass-border)] bg-[var(--bb-depth-3)] shadow-[var(--bb-shadow-sm)] transition-shadow hover:shadow-[var(--bb-shadow-md)]"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-[var(--bb-depth-1)]">
                <div className="flex h-full items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[var(--bb-ink-40)] group-hover:text-bb-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
                  {formatDuration(video.duration)}
                </div>
                {video.ai_analysis && (
                  <div className="absolute left-2 top-2 rounded bg-bb-primary/90 px-1.5 py-0.5 text-xs font-bold text-white">
                    IA {video.ai_analysis.overall_score}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[var(--bb-ink-100)]">{video.class_name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[video.status]}`}>
                    {STATUS_LABEL[video.status]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--bb-ink-40)]">
                  {video.uploaded_by_name} &middot; {formatDate(video.created_at)}
                </p>
                {video.annotations.length > 0 && (
                  <p className="mt-1 text-xs text-bb-primary">
                    {video.annotations.length} anotação{video.annotations.length > 1 ? 'ões' : ''}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

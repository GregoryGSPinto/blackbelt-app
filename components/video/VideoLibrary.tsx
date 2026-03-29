'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Trash2, RefreshCw, Film, Clock, Eye, Loader2, Pencil, X, Check, Upload, HardDrive } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';

interface Video {
  id: string;
  title: string;
  duration: number;
  status: string;
  views: number;
  embedUrl: string;
  thumbnailUrl: string;
  uploadedAt: string;
  encodeProgress: number;
  size: number;
}

interface VideoLibraryProps {
  canDelete?: boolean;
  canUpload?: boolean;
  onSwitchToUpload?: () => void;
  className?: string;
}

type SortBy = 'date' | 'title' | 'views';

export function VideoLibrary({ canDelete = false, onSwitchToUpload, className }: VideoLibraryProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<SortBy>('date');

  // Edit title state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Video | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await fetch(`/api/videos?${params}`);
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('[VideoLibrary] fetch error:', err);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // 5B: Client-side sorting
  const sortedVideos = useMemo(() => {
    const sorted = [...videos];
    switch (sortBy) {
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
        break;
      case 'views':
        sorted.sort((a, b) => b.views - a.views);
        break;
      case 'date':
      default:
        sorted.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        break;
    }
    return sorted;
  }, [videos, sortBy]);

  // 5A: Edit title handler
  const handleEditStart = (video: Video) => {
    setEditingId(video.id);
    setEditTitle(video.title);
  };

  const handleEditSave = async (videoId: string) => {
    if (!editTitle.trim()) return;
    try {
      const res = await fetch(`/api/videos/${videoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle.trim() }),
      });
      if (res.ok) {
        setVideos((prev) => prev.map((v) => v.id === videoId ? { ...v, title: editTitle.trim() } : v));
        if (selectedVideo?.id === videoId) {
          setSelectedVideo((prev) => prev ? { ...prev, title: editTitle.trim() } : null);
        }
      }
    } catch { /* silent */ }
    setEditingId(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditTitle('');
  };

  // 5E: Modal delete handler
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/videos/${deleteTarget.id}`, { method: 'DELETE' });
      setVideos((prev) => prev.filter((v) => v.id !== deleteTarget.id));
      if (selectedVideo?.id === deleteTarget.id) setSelectedVideo(null);
    } catch { /* silent */ }
    setDeleting(false);
    setDeleteTarget(null);
  };

  // 5C: Storage calculation
  const totalStorage = useMemo(() => {
    const bytes = videos.reduce((sum, v) => sum + (v.size || 0), 0);
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }, [videos]);

  function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  // 5F: Status badge
  function StatusBadge({ status, encodeProgress }: { status: string; encodeProgress: number }) {
    if (status === 'ready') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--bb-success, #22C55E)' }}>
          Disponível
        </span>
      );
    }
    if (status === 'error') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--bb-error, #EF4444)' }}>
          Erro
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--bb-brand, #D4AF37)' }}>
        Processando {encodeProgress > 0 ? `${encodeProgress}%` : ''}
      </span>
    );
  }

  return (
    <div className={className}>
      {/* Selected video player */}
      {selectedVideo && (
        <div className="mb-6">
          <VideoPlayer
            videoId={selectedVideo.id}
            title={selectedVideo.title}
            thumbnailUrl={selectedVideo.thumbnailUrl}
            autoplay
          />
          <h3 className="mt-3 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            {selectedVideo.title}
          </h3>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--bb-ink-40)' }}>
              <Eye size={12} /> {selectedVideo.views} views
            </span>
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--bb-ink-40)' }}>
              <Clock size={12} /> {formatDuration(selectedVideo.duration)}
            </span>
          </div>
        </div>
      )}

      {/* Search + sort + refresh */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--bb-ink-40)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar vídeos..."
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm"
            style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))', color: 'var(--bb-ink-100)' }}
          />
        </div>
        {/* 5B: Sort select */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="px-3 py-2 rounded-lg text-sm"
          style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))', color: 'var(--bb-ink-100)' }}
        >
          <option value="date">Mais recentes</option>
          <option value="title">A-Z</option>
          <option value="views">Mais vistos</option>
        </select>
        <button onClick={fetchVideos} className="p-2 rounded-lg" style={{ background: 'var(--bb-depth-3)' }} aria-label="Atualizar lista de vídeos">
          <RefreshCw size={16} style={{ color: 'var(--bb-ink-60)' }} />
        </button>
      </div>

      {/* 5C: Stats bar */}
      <div className="flex items-center gap-4 mb-3">
        <span className="text-xs flex items-center gap-1" style={{ color: 'var(--bb-ink-40)' }}>
          <Film size={12} /> {total} vídeo{total !== 1 ? 's' : ''}
        </span>
        <span className="text-xs flex items-center gap-1" style={{ color: 'var(--bb-ink-40)' }}>
          <HardDrive size={12} /> {totalStorage}
        </span>
      </div>

      {/* Video grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--bb-brand, #D4AF37)' }} />
        </div>
      ) : videos.length === 0 ? (
        /* 5D: Improved empty state */
        <div className="text-center py-16">
          <Film size={48} className="mx-auto mb-4" style={{ color: 'var(--bb-ink-20)' }} />
          <p className="text-base font-medium mb-1" style={{ color: 'var(--bb-ink-60)' }}>
            Nenhum vídeo na biblioteca
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--bb-ink-40)' }}>
            Envie seu primeiro vídeo-aula para seus alunos assistirem!
          </p>
          {onSwitchToUpload && (
            <button
              onClick={onSwitchToUpload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: 'var(--bb-brand, #D4AF37)', color: 'var(--bb-ink-100)' }}
              aria-label="Enviar primeiro vídeo"
            >
              <Upload size={16} /> Enviar primeiro vídeo
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedVideos.map((video) => (
            <div
              key={video.id}
              className="rounded-xl overflow-hidden cursor-pointer group transition-transform hover:scale-[1.02]"
              style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))' }}
              onClick={() => setSelectedVideo(video)}
            >
              <div className="relative" style={{ aspectRatio: '16/9', background: 'var(--bb-depth-2, #111)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                />
                {video.status === 'processing' && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
                    <Loader2 size={24} className="animate-spin" style={{ color: 'var(--bb-brand, #D4AF37)' }} />
                    <span className="ml-2 text-xs text-white">Processando... {video.encodeProgress}%</span>
                  </div>
                )}
                {video.status === 'ready' && video.duration > 0 && (
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-xs font-mono text-white" style={{ background: 'rgba(0,0,0,0.7)' }}>
                    {formatDuration(video.duration)}
                  </span>
                )}
              </div>
              <div className="p-3">
                {/* 5A: Inline edit title */}
                {editingId === video.id ? (
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleEditSave(video.id); if (e.key === 'Escape') handleEditCancel(); }}
                      autoFocus
                      className="flex-1 px-2 py-1 rounded text-sm"
                      style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-brand, #D4AF37)', color: 'var(--bb-ink-100)' }}
                    />
                    <button onClick={() => handleEditSave(video.id)} className="p-1 rounded hover:bg-green-500/20" aria-label="Salvar título">
                      <Check size={14} style={{ color: 'var(--bb-success, #22C55E)' }} />
                    </button>
                    <button onClick={handleEditCancel} className="p-1 rounded hover:bg-red-500/20" aria-label="Cancelar edição">
                      <X size={14} style={{ color: 'var(--bb-error, #EF4444)' }} />
                    </button>
                  </div>
                ) : (
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--bb-ink-100)' }}>
                    {video.title}
                  </p>
                )}
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      {video.views} views
                    </span>
                    {/* 5F: Status badge */}
                    <StatusBadge status={video.status} encodeProgress={video.encodeProgress} />
                  </div>
                  {canDelete && editingId !== video.id && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditStart(video); }}
                        className="p-1 rounded hover:bg-blue-500/20 transition-colors"
                        title="Editar título"
                        aria-label="Editar título"
                      >
                        <Pencil size={14} style={{ color: 'var(--bb-ink-40)' }} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(video); }}
                        className="p-1 rounded hover:bg-red-500/20 transition-colors"
                        title="Excluir vídeo"
                        aria-label="Excluir vídeo"
                      >
                        <Trash2 size={14} style={{ color: 'var(--bb-error, #EF4444)' }} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5E: Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div
            className="w-full max-w-sm rounded-xl p-6 space-y-4"
            style={{ background: 'var(--bb-depth-1)', border: '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))' }}
          >
            <h3 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              Excluir vídeo
            </h3>
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Tem certeza que deseja excluir <strong style={{ color: 'var(--bb-ink-100)' }}>{deleteTarget.title}</strong>?
            </p>
            <p className="text-xs" style={{ color: 'var(--bb-error, #EF4444)' }}>
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-60)' }}
                aria-label="Cancelar exclusão"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'var(--bb-error, #EF4444)', color: 'var(--bb-depth-1, #fff)' }}
                aria-label="Confirmar exclusão permanente"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Excluir permanentemente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

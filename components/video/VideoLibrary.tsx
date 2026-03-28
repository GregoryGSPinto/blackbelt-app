'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, RefreshCw, Film, Clock, Eye, Loader2 } from 'lucide-react';
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
  className?: string;
}

export function VideoLibrary({ canDelete = false, className }: VideoLibraryProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [total, setTotal] = useState(0);

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

  const handleDelete = async (videoId: string) => {
    if (!confirm('Excluir este vídeo permanentemente?')) return;
    try {
      await fetch(`/api/videos/${videoId}`, { method: 'DELETE' });
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
      if (selectedVideo?.id === videoId) setSelectedVideo(null);
    } catch { /* silent */ }
  };

  function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
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

      {/* Search + refresh */}
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
        <button onClick={fetchVideos} className="p-2 rounded-lg" style={{ background: 'var(--bb-depth-3)' }}>
          <RefreshCw size={16} style={{ color: 'var(--bb-ink-60)' }} />
        </button>
      </div>

      {/* Total */}
      <p className="text-xs mb-3" style={{ color: 'var(--bb-ink-40)' }}>
        {total} vídeo{total !== 1 ? 's' : ''} na biblioteca
      </p>

      {/* Video grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin" style={{ color: '#D4AF37' }} />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12">
          <Film size={40} className="mx-auto mb-3" style={{ color: 'var(--bb-ink-20)' }} />
          <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
            Nenhum vídeo encontrado
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="rounded-xl overflow-hidden cursor-pointer group transition-transform hover:scale-[1.02]"
              style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))' }}
              onClick={() => setSelectedVideo(video)}
            >
              <div className="relative" style={{ aspectRatio: '16/9', background: '#111' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                />
                {video.status === 'processing' && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
                    <Loader2 size={24} className="animate-spin" style={{ color: '#D4AF37' }} />
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
                <p className="text-sm font-medium truncate" style={{ color: 'var(--bb-ink-100)' }}>
                  {video.title}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    {video.views} views
                  </span>
                  {canDelete && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(video.id); }}
                      className="p-1 rounded hover:bg-red-500/20 transition-colors"
                      title="Excluir vídeo"
                    >
                      <Trash2 size={14} style={{ color: '#EF4444' }} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

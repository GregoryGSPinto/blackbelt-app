'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getVideo } from '@/lib/api/content.service';
import type { VideoDetail } from '@/lib/api/content.service';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export default function VideoPlayerPage() {
  const params = useParams();
  const id = params.id as string;
  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const v = await getVideo(id);
        setVideo(v);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="space-y-4 p-4"><Skeleton variant="card" className="h-48" /><Skeleton variant="text" className="h-8 w-64" /></div>;
  if (!video) return null;

  return (
    <div className="space-y-4 pb-8">
      {/* Player placeholder */}
      <div className="relative flex aspect-video w-full items-center justify-center bg-black">
        <div className="text-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
          </svg>
          <p className="mt-2 text-sm opacity-60">Player de vídeo</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="h-1 overflow-hidden rounded-full bg-white/30">
            <div className="h-full w-1/3 rounded-full bg-bb-red" />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-white/80">
            <span>{Math.floor(video.duration * 0.33)}:00 / {video.duration}:00</span>
            <div className="flex gap-3">
              <button className="hover:text-white">1x</button>
              <button className="hover:text-white">⛶</button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4">
        {/* Info */}
        <div>
          <h1 className="text-xl font-bold text-bb-black">{video.title}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-bb-gray-500">
            <Badge variant="belt" size="sm">{video.belt_level}</Badge>
            <span>{video.professor_name}</span>
            <span>·</span>
            <span>{video.duration} min</span>
            <span>·</span>
            <span>{video.modality_name}</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <p className={`text-sm text-bb-gray-500 ${!expanded ? 'line-clamp-2' : ''}`}>{video.description}</p>
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-bb-red hover:underline">
            {expanded ? 'Mostrar menos' : 'Mostrar mais'}
          </button>
        </div>

        {/* Series navigation */}
        {video.series_title && (
          <Card className="p-3">
            <p className="text-xs text-bb-gray-500">Série: {video.series_title}</p>
            <div className="mt-2 flex gap-2">
              {video.episode_number && video.episode_number > 1 && (
                <button className="text-xs text-bb-red hover:underline">← Episódio anterior</button>
              )}
              {video.episode_number && video.total_episodes && video.episode_number < video.total_episodes && (
                <button className="text-xs text-bb-red hover:underline">Próximo episódio →</button>
              )}
            </div>
          </Card>
        )}

        {/* Related */}
        {video.related_videos.length > 0 && (
          <section>
            <h2 className="mb-2 font-semibold text-bb-black">Vídeos Relacionados</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {video.related_videos.map((v) => (
                <Link key={v.id} href={`/dashboard/conteudo/${v.id}`}>
                  <Card className="overflow-hidden">
                    <div className="h-24 w-full" style={{ backgroundColor: v.thumbnail_color }}>
                      <span className="float-right m-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">{v.duration}min</span>
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium text-bb-black truncate">{v.title}</p>
                      <p className="text-[10px] text-bb-gray-500">{v.professor_name}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

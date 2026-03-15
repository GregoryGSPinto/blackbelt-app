'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { listVideos, getSeries } from '@/lib/api/content.service';
import type { VideoCardDTO, SeriesDTO } from '@/lib/api/content.service';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { BeltLevel } from '@/lib/types';

const BELTS = Object.values(BeltLevel);

export default function ConteudoPage() {
  const [videos, setVideos] = useState<VideoCardDTO[]>([]);
  const [series, setSeries] = useState<SeriesDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBelt, setFilterBelt] = useState<string>('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [v, s] = await Promise.all([listVideos('academy-1'), getSeries('academy-1')]);
        setVideos(v); setSeries(s);
      } finally { setLoading(false); }
    }
    load();
  }, []);

  const filtered = videos.filter((v) => {
    if (filterBelt && v.belt_level !== filterBelt) return false;
    if (search && !v.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const continueWatching = videos.filter((v) => v.progress && v.progress > 0 && v.progress < 100);

  if (loading) return <div className="space-y-4 p-4"><Skeleton variant="text" className="h-8 w-48" /><div className="grid grid-cols-2 gap-3">{[1,2,3,4].map((i)=><Skeleton key={i} variant="card" className="h-40" />)}</div></div>;

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-xl font-bold text-bb-black">Conteúdo</h1>
      <input type="text" placeholder="Buscar vídeos..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-bb-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-bb-red" />
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterBelt('')} className={`rounded-full px-3 py-1 text-xs font-medium ${!filterBelt ? 'bg-bb-red text-white' : 'bg-bb-gray-100 text-bb-gray-500'}`}>Todas</button>
        {BELTS.map((b) => (
          <button key={b} onClick={() => setFilterBelt(b)} className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${filterBelt === b ? 'bg-bb-red text-white' : 'bg-bb-gray-100 text-bb-gray-500'}`}>{b}</button>
        ))}
      </div>

      {continueWatching.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold text-bb-black">Continuar Assistindo</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {continueWatching.map((v) => (
              <Link key={v.id} href={`/dashboard/conteudo/${v.id}`} className="flex-shrink-0 w-48">
                <Card className="overflow-hidden">
                  <div className="h-24 w-full" style={{ backgroundColor: v.thumbnail_color }} />
                  <div className="h-1 bg-bb-gray-300"><div className="h-full bg-bb-red" style={{ width: `${v.progress}%` }} /></div>
                  <div className="p-2"><p className="text-xs font-medium text-bb-black truncate">{v.title}</p></div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {series.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold text-bb-black">Séries</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {series.map((s) => (
              <Card key={s.id} className="flex-shrink-0 w-40 overflow-hidden">
                <div className="h-20 w-full" style={{ backgroundColor: s.thumbnail_color }} />
                <div className="p-2"><p className="text-xs font-medium text-bb-black truncate">{s.title}</p><p className="text-[10px] text-bb-gray-500">{s.video_count} vídeos</p></div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-2 font-semibold text-bb-black">Todos os Vídeos</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <Link key={v.id} href={v.is_locked ? '#' : `/dashboard/conteudo/${v.id}`} className={v.is_locked ? 'opacity-50' : ''}>
              <Card className="overflow-hidden">
                <div className="relative h-32 w-full" style={{ backgroundColor: v.thumbnail_color }}>
                  <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">{v.duration}min</span>
                  {v.is_locked && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><span className="text-2xl">🔒</span></div>}
                </div>
                <div className="p-3">
                  <Badge variant="belt" size="sm">{v.belt_level}</Badge>
                  <p className="mt-1 text-sm font-medium text-bb-black">{v.title}</p>
                  <p className="text-xs text-bb-gray-500">{v.professor_name}</p>
                  {v.progress !== undefined && v.progress > 0 && (
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-bb-gray-300"><div className="h-full bg-bb-red" style={{ width: `${v.progress}%` }} /></div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

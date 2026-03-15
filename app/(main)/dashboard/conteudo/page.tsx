'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStreamingHome, getTrails } from '@/lib/api/streaming.service';
import type { StreamingSection, StreamingVideoCard, TrailDTO } from '@/lib/api/streaming.service';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

// ────────────────────────────────────────────────────────────
// Belt label helpers
// ────────────────────────────────────────────────────────────
const BELT_LABEL: Record<string, string> = {
  white: 'Branca', gray: 'Cinza', yellow: 'Amarela', orange: 'Laranja',
  green: 'Verde', blue: 'Azul', purple: 'Roxa', brown: 'Marrom', black: 'Preta',
};

function formatDuration(min: number): string {
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h${m}min` : `${h}h`;
}

// ────────────────────────────────────────────────────────────
// Video card component
// ────────────────────────────────────────────────────────────
function VideoCard({ video }: { video: StreamingVideoCard }) {
  return (
    <Link
      href={video.is_locked ? '#' : `/dashboard/conteudo/${video.id}`}
      className="group flex-shrink-0 w-44 sm:w-52"
    >
      <div className="relative overflow-hidden rounded-lg">
        {/* Thumbnail */}
        <div
          className="aspect-video w-full transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: video.thumbnail_color }}
        >
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/20" />

          {/* Play button on hover */}
          {!video.is_locked && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bb-white/90 shadow-lg">
                <svg className="h-5 w-5 text-bb-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}

          {/* Duration badge */}
          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-bb-white">
            {formatDuration(video.duration_minutes)}
          </span>

          {/* Lock overlay */}
          {video.is_locked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
              <svg className="h-6 w-6 text-bb-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="mt-1 px-2 text-center text-[9px] font-medium text-bb-white/80">
                {video.lock_reason}
              </p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {video.progress_percent > 0 && !video.is_locked && (
          <div className="h-0.5 bg-bb-gray-700">
            <div
              className="h-full bg-bb-red-500 transition-all"
              style={{ width: `${video.progress_percent}%` }}
            />
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="mt-1.5 px-0.5">
        <p className="truncate text-xs font-medium text-bb-white group-hover:text-bb-red-500 transition-colors">
          {video.title}
        </p>
        <p className="truncate text-[10px] text-bb-gray-400">
          {video.professor_name} &middot; {BELT_LABEL[video.belt_level] ?? video.belt_level}
        </p>
      </div>
    </Link>
  );
}

// ────────────────────────────────────────────────────────────
// Trail card component
// ────────────────────────────────────────────────────────────
function TrailCard({ trail }: { trail: TrailDTO }) {
  const completionPercent = trail.total_videos > 0
    ? Math.round((trail.completed_videos / trail.total_videos) * 100)
    : 0;

  return (
    <div className="group flex-shrink-0 w-56 sm:w-64">
      <div className="relative overflow-hidden rounded-lg">
        <div
          className="flex h-32 flex-col justify-end p-3 transition-transform duration-300 group-hover:scale-105"
          style={{
            backgroundColor: trail.thumbnail_color,
            backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 100%)`,
          }}
        >
          {trail.is_completed && (
            <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
              <svg className="h-3.5 w-3.5 text-bb-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          <p className="text-sm font-bold text-bb-white">{trail.title}</p>
          <p className="text-[10px] text-bb-white/70">{trail.description}</p>
        </div>
        {/* Trail progress */}
        <div className="h-1 bg-bb-gray-700">
          <div
            className="h-full transition-all"
            style={{
              width: `${completionPercent}%`,
              backgroundColor: trail.is_completed ? '#22C55E' : trail.thumbnail_color,
            }}
          />
        </div>
      </div>
      <div className="mt-1 flex items-center justify-between px-0.5">
        <p className="text-[10px] text-bb-gray-400">
          {trail.completed_videos}/{trail.total_videos} videos
        </p>
        <p className="text-[10px] text-bb-gray-400">
          {BELT_LABEL[trail.belt_level] ?? trail.belt_level}
        </p>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Section component
// ────────────────────────────────────────────────────────────
function StreamingRow({ section }: { section: StreamingSection }) {
  return (
    <section>
      <h2 className="mb-3 text-base font-bold text-bb-white">{section.title}</h2>
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
        {section.videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// Main page
// ────────────────────────────────────────────────────────────
export default function ConteudoPage() {
  const [sections, setSections] = useState<StreamingSection[]>([]);
  const [trails, setTrails] = useState<TrailDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [sec, tr] = await Promise.all([
          getStreamingHome('stu-1'),
          getTrails('academy-1'),
        ]);
        setSections(sec);
        setTrails(tr);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Simple search filter across all sections
  const filteredSections = search.trim()
    ? sections
        .map((s) => ({
          ...s,
          videos: s.videos.filter((v) =>
            v.title.toLowerCase().includes(search.toLowerCase()) ||
            v.professor_name.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((s) => s.videos.length > 0)
    : sections;

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-bb-gray-900 p-4 space-y-6">
        <Skeleton variant="text" className="h-10 w-full bg-bb-gray-800" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton variant="text" className="h-6 w-40 bg-bb-gray-800" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((j) => (
                <Skeleton key={j} variant="card" className="h-28 w-44 flex-shrink-0 bg-bb-gray-800" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bb-gray-900 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bb-gray-900/95 backdrop-blur-sm px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-xl font-bold text-bb-white">Conteudo</h1>
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bb-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar videos, professores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-bb-gray-700 bg-bb-gray-800 py-2.5 pl-10 pr-4 text-sm text-bb-white placeholder-bb-gray-500 outline-none focus:border-bb-red-500"
          />
        </div>
      </div>

      <div className="space-y-6 px-4 pt-2">
        {/* Trails section */}
        {trails.length > 0 && !search.trim() && (
          <section>
            <h2 className="mb-3 text-base font-bold text-bb-white">Trilhas Oficiais</h2>
            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
              {trails.map((trail) => (
                <TrailCard key={trail.id} trail={trail} />
              ))}
            </div>
          </section>
        )}

        {/* Video sections */}
        {filteredSections.map((section) => (
          <StreamingRow key={section.id} section={section} />
        ))}

        {/* Empty state for search */}
        {search.trim() && filteredSections.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <svg className="h-12 w-12 text-bb-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="mt-3 text-sm text-bb-gray-500">Nenhum video encontrado para &ldquo;{search}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  );
}

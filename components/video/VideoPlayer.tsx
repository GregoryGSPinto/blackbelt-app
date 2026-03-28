'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

interface VideoPlayerProps {
  videoId: string;
  title?: string;
  thumbnailUrl?: string;
  className?: string;
  autoplay?: boolean;
}

const LIBRARY_ID = '626933';
const CDN_HOST = 'vz-1ea2733d-15c.b-cdn.net';

export function VideoPlayer({ videoId, title, thumbnailUrl, className, autoplay = false }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(autoplay);

  const embedUrl = `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}?autoplay=${autoplay ? 'true' : 'false'}&loop=false&muted=false&preload=true&responsive=true`;
  const thumbnail = thumbnailUrl || `https://${CDN_HOST}/${videoId}/thumbnail.jpg`;

  if (!playing && !autoplay) {
    return (
      <div
        className={`relative rounded-xl overflow-hidden cursor-pointer group ${className || ''}`}
        onClick={() => setPlaying(true)}
        style={{ aspectRatio: '16/9', background: '#000' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnail}
          alt={title || 'Vídeo'}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
            style={{ background: 'rgba(212,175,55,0.9)' }}
          >
            <Play size={28} fill="#000" color="#000" className="ml-1" />
          </div>
        </div>
        {title && (
          <div className="absolute bottom-0 left-0 right-0 p-4" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
            <p className="text-sm font-medium text-white truncate">{title}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${className || ''}`} style={{ aspectRatio: '16/9' }}>
      <iframe
        src={embedUrl}
        loading="lazy"
        className="w-full h-full border-0"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

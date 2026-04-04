'use client';

import { Film } from 'lucide-react';
import { VideoLibrary } from '@/components/video/VideoLibrary';

export default function AlunoVideoAulasPage() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--bb-ink-100)' }}>
        <Film size={24} style={{ color: '#D4AF37' }} />
        Vídeo-Aulas
      </h1>
      <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
        Assista as aulas gravadas pelos professores da sua academia.
      </p>
      <VideoLibrary canDelete={false} />
    </div>
  );
}

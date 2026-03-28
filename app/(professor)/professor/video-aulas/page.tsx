'use client';

import { useState } from 'react';
import { Film, Upload as UploadIcon, List } from 'lucide-react';
import { VideoUploader } from '@/components/video/VideoUploader';
import { VideoLibrary } from '@/components/video/VideoLibrary';

export default function VideoAulasPage() {
  const [tab, setTab] = useState<'library' | 'upload'>('library');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--bb-ink-100)' }}>
          <Film size={24} style={{ color: '#D4AF37' }} />
          Vídeo-Aulas
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('library')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{
            background: tab === 'library' ? '#D4AF37' : 'var(--bb-depth-3)',
            color: tab === 'library' ? '#000' : 'var(--bb-ink-60)',
          }}
        >
          <List size={16} /> Biblioteca
        </button>
        <button
          onClick={() => setTab('upload')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{
            background: tab === 'upload' ? '#D4AF37' : 'var(--bb-depth-3)',
            color: tab === 'upload' ? '#000' : 'var(--bb-ink-60)',
          }}
        >
          <UploadIcon size={16} /> Upload
        </button>
      </div>

      {/* Content */}
      {tab === 'upload' && (
        <VideoUploader
          onUploadComplete={() => {
            setRefreshKey((k) => k + 1);
            setTab('library');
          }}
        />
      )}

      {tab === 'library' && (
        <VideoLibrary key={refreshKey} canDelete canUpload />
      )}
    </div>
  );
}

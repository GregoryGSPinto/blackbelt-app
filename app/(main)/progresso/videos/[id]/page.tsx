'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getTrainingVideoById, type TrainingVideoDTO } from '@/lib/api/training-video.service';
import { AnnotatedPlayer } from '@/components/video/AnnotatedPlayer';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';

export default function StudentVideoDetailPage() {
  const params = useParams();
  const videoId = params.id as string;
  const [video, setVideo] = useState<TrainingVideoDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getTrainingVideoById(videoId);
        setVideo(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [videoId]);

  const scoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="p-4">
        <p className="text-bb-gray-500">Vídeo não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title={video.class_name}
        subtitle={`${video.uploaded_by_name} · ${formatDate(video.created_at)}`}
      />

      {/* Video Player (read-only) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnnotatedPlayer
          videoUrl={video.file_url}
          annotations={video.annotations}
          duration={video.duration}
          readOnly
        />
      </div>

      {/* Professor Annotations */}
      {video.annotations.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-3 text-base font-bold text-bb-black">Observações do Professor</h2>
          <div className="space-y-2">
            {video.annotations.map((ann) => (
              <div key={ann.id} className="rounded-lg border border-bb-gray-200 bg-white p-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${ann.color === 'green' ? 'bg-green-500' : ann.color === 'red' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  <span className="text-xs font-bold text-bb-primary">
                    {Math.floor(ann.timestamp_sec / 60)}:{(ann.timestamp_sec % 60).toString().padStart(2, '0')}
                  </span>
                  <span className="text-xs text-bb-gray-500">{ann.author_name}</span>
                </div>
                <p className="mt-1 text-sm text-bb-gray-700">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Analysis */}
      {video.ai_analysis && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-3 text-base font-bold text-bb-black">Análise por IA</h2>

          {/* Scores */}
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-bb-gray-200 bg-white p-3 text-center">
              <p className="text-xs text-bb-gray-500">Geral</p>
              <p className={`text-2xl font-bold ${scoreColor(video.ai_analysis.overall_score)}`}>{video.ai_analysis.overall_score}</p>
            </div>
            <div className="rounded-lg border border-bb-gray-200 bg-white p-3 text-center">
              <p className="text-xs text-bb-gray-500">Postura</p>
              <p className={`text-2xl font-bold ${scoreColor(video.ai_analysis.posture_score)}`}>{video.ai_analysis.posture_score}</p>
            </div>
            <div className="rounded-lg border border-bb-gray-200 bg-white p-3 text-center">
              <p className="text-xs text-bb-gray-500">Equilíbrio</p>
              <p className={`text-2xl font-bold ${scoreColor(video.ai_analysis.balance_score)}`}>{video.ai_analysis.balance_score}</p>
            </div>
            <div className="rounded-lg border border-bb-gray-200 bg-white p-3 text-center">
              <p className="text-xs text-bb-gray-500">Técnica</p>
              <p className={`text-2xl font-bold ${scoreColor(video.ai_analysis.technique_score)}`}>{video.ai_analysis.technique_score}</p>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-4 rounded-lg border border-bb-gray-200 bg-white p-4">
            <h3 className="text-sm font-bold text-bb-black">Resumo</h3>
            <p className="mt-1 text-sm text-bb-gray-700">{video.ai_analysis.summary}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Highlights */}
            <div className="rounded-lg border border-bb-gray-200 bg-white p-4">
              <h3 className="text-sm font-bold text-green-700">Pontos Fortes</h3>
              <ul className="mt-2 space-y-1.5">
                {video.ai_analysis.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-bb-gray-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* Corrections */}
            <div className="rounded-lg border border-bb-gray-200 bg-white p-4">
              <h3 className="text-sm font-bold text-red-700">Pontos de Melhoria</h3>
              <ul className="mt-2 space-y-1.5">
                {video.ai_analysis.corrections.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-bb-gray-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

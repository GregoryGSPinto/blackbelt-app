'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getTrainingVideoById, addAnnotation, type TrainingVideoDTO } from '@/lib/api/training-video.service';
import { analyzeVideo, compareExecution, type VideoAnalysis, type ComparisonResult } from '@/lib/api/video-analysis.service';
import { AnnotatedPlayer } from '@/components/video/AnnotatedPlayer';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';

type Tab = 'manual' | 'ai' | 'comparison';

export default function AnaliseVideoPage() {
  const params = useParams();
  const videoId = params.id as string;
  const { toast } = useToast();
  const [video, setVideo] = useState<TrainingVideoDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('manual');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<VideoAnalysis | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [comparing, setComparing] = useState(false);
  const [manualNote, setManualNote] = useState('');

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

  const handleAddAnnotation = useCallback(async (annotation: { timestamp_sec: number; type: 'circle' | 'arrow' | 'text'; color: 'green' | 'red' | 'yellow'; content: string; x: number; y: number }) => {
    if (!video) return;
    try {
      const newAnn = await addAnnotation(video.id, {
        author_id: 'prof-1',
        author_name: 'Prof. Carlos Silva',
        ...annotation,
      });
      setVideo((prev) => prev ? { ...prev, annotations: [...prev.annotations, newAnn] } : prev);
      toast('Anotação adicionada', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }, [video, toast]);

  const handleAnalyzeAI = useCallback(async () => {
    if (!video) return;
    setAnalyzing(true);
    try {
      const result = await analyzeVideo(video.id);
      setAiAnalysis(result);
      setActiveTab('ai');
      toast('Análise IA concluída', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setAnalyzing(false);
    }
  }, [video, toast]);

  const handleCompare = useCallback(async () => {
    if (!video) return;
    setComparing(true);
    try {
      const result = await compareExecution('ref-vid-1', video.id);
      setComparison(result);
      setActiveTab('comparison');
      toast('Comparação concluída', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setComparing(false);
    }
  }, [video, toast]);

  const handleShare = useCallback(() => {
    toast('Link compartilhado com o aluno', 'success');
  }, [toast]);

  const handleExport = useCallback(() => {
    toast('Relatório exportado em PDF', 'success');
  }, [toast]);

  const scoreStyle = (score: number): React.CSSProperties => {
    if (score >= 85) return { color: 'var(--bb-success)' };
    if (score >= 70) return { color: 'var(--bb-warning)' };
    return { color: 'var(--bb-danger)' };
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bb-gray-900">
        <Spinner size="lg" className="text-bb-white" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bb-gray-900 p-4">
        <p className="text-bb-gray-400">Vídeo não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bb-gray-900 text-bb-white">
      {/* Header */}
      <div className="border-b border-bb-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Análise de Vídeo</h1>
            <p className="text-sm text-bb-gray-500">{video.student_name} &middot; {video.class_name}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleShare}>Compartilhar</Button>
            <Button variant="ghost" onClick={handleExport}>Exportar</Button>
          </div>
        </div>
      </div>

      {/* Split layout */}
      <div className="flex flex-col lg:flex-row">
        {/* Left — Video player (60%) */}
        <div className="w-full p-4 lg:w-[60%]">
          <AnnotatedPlayer
            videoUrl={video.file_url}
            annotations={video.annotations}
            duration={video.duration}
            readOnly={false}
            onAddAnnotation={handleAddAnnotation}
          />
        </div>

        {/* Right — Analysis panel (40%) */}
        <div className="w-full border-t border-bb-gray-700 lg:w-[40%] lg:border-l lg:border-t-0">
          {/* Actions bar */}
          <div className="flex gap-2 border-b border-bb-gray-700 p-4">
            <Button onClick={handleAnalyzeAI} loading={analyzing} disabled={analyzing}>
              {analyzing ? 'Analisando...' : 'Analisar com IA'}
            </Button>
            <Button variant="secondary" onClick={handleCompare} loading={comparing} disabled={comparing}>
              Comparar
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-bb-gray-700">
            {(['manual', 'ai', 'comparison'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-bb-primary text-bb-primary'
                    : 'text-bb-gray-500 hover:text-bb-gray-300'
                }`}
              >
                {tab === 'manual' ? 'Manual' : tab === 'ai' ? 'IA' : 'Comparação'}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto p-4">
            {/* Manual tab */}
            {activeTab === 'manual' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-bb-gray-300">Anotações do Professor</h3>
                  <p className="text-xs text-bb-gray-500">{video.annotations.length} anotações</p>
                </div>

                {video.annotations.length === 0 ? (
                  <p className="text-sm text-bb-gray-500">Use as ferramentas de desenho no vídeo para adicionar anotações.</p>
                ) : (
                  <div className="space-y-2">
                    {video.annotations.map((ann) => (
                      <div key={ann.id} className="rounded-lg bg-bb-gray-800 p-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ background: ann.color === 'green' ? 'var(--bb-success)' : ann.color === 'red' ? 'var(--bb-danger)' : 'var(--bb-warning)' }} />
                          <span className="text-xs font-medium text-bb-gray-300">
                            {Math.floor(ann.timestamp_sec / 60)}:{(ann.timestamp_sec % 60).toString().padStart(2, '0')}
                          </span>
                          <span className="rounded bg-bb-gray-700 px-1.5 py-0.5 text-xs text-bb-gray-400">{ann.type}</span>
                        </div>
                        <p className="mt-1 text-sm text-bb-gray-300">{ann.content}</p>
                        <p className="mt-1 text-xs text-bb-gray-500">{ann.author_name}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick note */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-bb-gray-300">Nota Rápida</h3>
                  <textarea
                    value={manualNote}
                    onChange={(e) => setManualNote(e.target.value)}
                    placeholder="Adicione uma observação geral..."
                    className="w-full rounded-lg border border-bb-gray-600 bg-bb-gray-800 px-3 py-2 text-sm text-white placeholder-bb-gray-500"
                    rows={3}
                  />
                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (manualNote.trim()) {
                        handleAddAnnotation({ timestamp_sec: 0, type: 'text', color: 'green', content: manualNote, x: 50, y: 50 });
                        setManualNote('');
                      }
                    }}
                    disabled={!manualNote.trim()}
                  >
                    Adicionar Nota
                  </Button>
                </div>
              </div>
            )}

            {/* AI tab */}
            {activeTab === 'ai' && (
              <div className="space-y-4">
                {!aiAnalysis && !video.ai_analysis ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mb-3 h-12 w-12 text-bb-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-bb-gray-400">Nenhuma análise IA ainda.</p>
                    <p className="text-xs text-bb-gray-500">Clique em &quot;Analisar com IA&quot; para gerar.</p>
                  </div>
                ) : (
                  (() => {
                    const analysis = aiAnalysis || (video.ai_analysis ? {
                      overall_score: video.ai_analysis.overall_score,
                      posture_score: video.ai_analysis.posture_score,
                      balance_score: video.ai_analysis.balance_score,
                      technique_score: video.ai_analysis.technique_score,
                      highlights: video.ai_analysis.highlights,
                      corrections: video.ai_analysis.corrections,
                      summary: video.ai_analysis.summary,
                    } : null);
                    if (!analysis) return null;
                    return (
                      <>
                        {/* Score cards */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-lg bg-bb-gray-800 p-3 text-center">
                            <p className="text-xs text-bb-gray-500">Geral</p>
                            <p className="text-2xl font-bold" style={scoreStyle(analysis.overall_score)}>{analysis.overall_score}</p>
                          </div>
                          <div className="rounded-lg bg-bb-gray-800 p-3 text-center">
                            <p className="text-xs text-bb-gray-500">Postura</p>
                            <p className="text-2xl font-bold" style={scoreStyle(analysis.posture_score)}>{analysis.posture_score}</p>
                          </div>
                          <div className="rounded-lg bg-bb-gray-800 p-3 text-center">
                            <p className="text-xs text-bb-gray-500">Equilíbrio</p>
                            <p className="text-2xl font-bold" style={scoreStyle(analysis.balance_score)}>{analysis.balance_score}</p>
                          </div>
                          <div className="rounded-lg bg-bb-gray-800 p-3 text-center">
                            <p className="text-xs text-bb-gray-500">Técnica</p>
                            <p className="text-2xl font-bold" style={scoreStyle(analysis.technique_score)}>{analysis.technique_score}</p>
                          </div>
                        </div>

                        {/* Summary */}
                        <div>
                          <h4 className="text-sm font-bold text-bb-gray-300">Resumo</h4>
                          <p className="mt-1 text-sm text-bb-gray-400">{analysis.summary}</p>
                        </div>

                        {/* Highlights */}
                        <div>
                          <h4 className="text-sm font-bold" style={{ color: 'var(--bb-success)' }}>Pontos Fortes</h4>
                          <ul className="mt-1 space-y-1">
                            {analysis.highlights.map((h, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-bb-gray-400">
                                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: 'var(--bb-success)' }} />
                                {h}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Corrections */}
                        <div>
                          <h4 className="text-sm font-bold" style={{ color: 'var(--bb-danger)' }}>Correções</h4>
                          <ul className="mt-1 space-y-1">
                            {analysis.corrections.map((c, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-bb-gray-400">
                                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: 'var(--bb-danger)' }} />
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    );
                  })()
                )}
              </div>
            )}

            {/* Comparison tab */}
            {activeTab === 'comparison' && (
              <div className="space-y-4">
                {!comparison ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mb-3 h-12 w-12 text-bb-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <p className="text-sm text-bb-gray-400">Nenhuma comparação ainda.</p>
                    <p className="text-xs text-bb-gray-500">Clique em &quot;Comparar&quot; para comparar com uma referência.</p>
                  </div>
                ) : (
                  <>
                    {/* Similarity score */}
                    <div className="rounded-lg bg-bb-gray-800 p-4 text-center">
                      <p className="text-xs text-bb-gray-500">Similaridade com Referência</p>
                      <p className="text-3xl font-bold" style={scoreStyle(comparison.similarity_score)}>{comparison.similarity_score}%</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-bb-gray-800 p-3 text-center">
                        <p className="text-xs text-bb-gray-500">Dif. Postura</p>
                        <p className="text-lg font-bold text-[var(--bb-warning)]">{comparison.posture_diff}%</p>
                      </div>
                      <div className="rounded-lg bg-bb-gray-800 p-3 text-center">
                        <p className="text-xs text-bb-gray-500">Dif. Timing</p>
                        <p className="text-lg font-bold text-[var(--bb-warning)]">{comparison.timing_diff}%</p>
                      </div>
                    </div>

                    {/* Differences */}
                    <div>
                      <h4 className="text-sm font-bold text-bb-gray-300">Diferenças Principais</h4>
                      <ul className="mt-1 space-y-1">
                        {comparison.key_differences.map((d, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-bb-gray-400">
                            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--bb-warning)]" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="text-sm font-bold text-bb-primary">Recomendações</h4>
                      <ul className="mt-1 space-y-1">
                        {comparison.recommendations.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-bb-gray-400">
                            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-bb-primary" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

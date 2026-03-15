'use client';

import { useState, useCallback } from 'react';
import {
  analyzeMatch,
  addAnnotation,
  getAnnotations,
  shareAnalysis,
  type MatchAnalysis,
  type ManualAnnotation,
  type MatchEventType,
} from '@/lib/api/match-analysis.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';

const MOCK_STUDENTS = [
  { id: 'student-1', name: 'Lucas Silva', belt: 'Azul' },
  { id: 'student-2', name: 'Marina Costa', belt: 'Roxa' },
  { id: 'student-3', name: 'Pedro Santos', belt: 'Branca' },
];

const MOCK_VIDEOS = [
  { id: 'video-1', label: 'Lucas vs Marcos — Copa Regional 2026', student_id: 'student-1' },
  { id: 'video-2', label: 'Marina vs Julia — Treino sparring', student_id: 'student-2' },
  { id: 'video-3', label: 'Pedro vs Rafael — Campeonato interno', student_id: 'student-3' },
];

const EVENT_ICONS: Record<MatchEventType, string> = {
  takedown: '🤼', sweep: '🔄', pass: '🚀', mount: '⬆️', back_take: '🔙',
  submission_attempt: '🎯', submission: '🏆', escape: '🏃', stand_up: '🧍', penalty: '🟡',
};

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ProfessorAnaliseLutaPage() {
  const { toast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedVideo, setSelectedVideo] = useState('');
  const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null);
  const [annotations, setAnnotations] = useState<ManualAnnotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [annotationText, setAnnotationText] = useState('');
  const [annotationTime, setAnnotationTime] = useState('');
  const [addingAnnotation, setAddingAnnotation] = useState(false);

  const filteredVideos = selectedStudent
    ? MOCK_VIDEOS.filter((v) => v.student_id === selectedStudent)
    : MOCK_VIDEOS;

  const handleAnalyze = useCallback(async () => {
    if (!selectedVideo) return;
    setLoading(true);
    try {
      const [result, anns] = await Promise.all([
        analyzeMatch(selectedVideo),
        getAnnotations(selectedVideo),
      ]);
      setAnalysis(result);
      setAnnotations(anns);
    } catch {
      toast('Erro ao analisar luta', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedVideo, toast]);

  const handleAddAnnotation = useCallback(async () => {
    if (!annotationText.trim() || !annotationTime || !selectedVideo) return;
    setAddingAnnotation(true);
    try {
      const timeParts = annotationTime.split(':');
      const sec = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1] || '0');
      const ann = await addAnnotation(selectedVideo, sec, annotationText);
      setAnnotations((prev) => [...prev, ann]);
      setAnnotationText('');
      setAnnotationTime('');
      toast('Anotação adicionada', 'success');
    } catch {
      toast('Erro ao adicionar anotação', 'error');
    } finally {
      setAddingAnnotation(false);
    }
  }, [annotationText, annotationTime, selectedVideo, toast]);

  const handleShare = useCallback(async () => {
    if (!selectedVideo || !selectedStudent) return;
    try {
      await shareAnalysis(selectedVideo, selectedStudent);
      toast('Análise compartilhada com o aluno!', 'success');
    } catch {
      toast('Erro ao compartilhar', 'error');
    }
  }, [selectedVideo, selectedStudent, toast]);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-bold text-bb-black">Análise de Lutas — Professor</h1>

      {/* Selectors */}
      <Card className="p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-bb-gray-500">Aluno</label>
            <select
              value={selectedStudent}
              onChange={(e) => { setSelectedStudent(e.target.value); setSelectedVideo(''); setAnalysis(null); }}
              className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Todos os alunos</option>
              {MOCK_STUDENTS.map((s) => (
                <option key={s.id} value={s.id}>{s.name} — {s.belt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-bb-gray-500">Vídeo</label>
            <select
              value={selectedVideo}
              onChange={(e) => { setSelectedVideo(e.target.value); setAnalysis(null); }}
              className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Selecione um vídeo</option>
              {filteredVideos.map((v) => (
                <option key={v.id} value={v.id}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="primary" onClick={handleAnalyze} disabled={!selectedVideo || loading}>
            {loading ? <span className="flex items-center gap-2"><Spinner /> Analisando...</span> : 'Analisar Luta'}
          </Button>
          {analysis && selectedStudent && (
            <Button variant="secondary" onClick={handleShare}>
              Compartilhar com Aluno
            </Button>
          )}
        </div>
      </Card>

      {loading && <div className="flex justify-center py-10"><Spinner /></div>}

      {analysis && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3">
            <Card className="p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{analysis.points_breakdown.student_total}</p>
              <p className="text-[10px] text-bb-gray-500">Pts Aluno</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-2xl font-bold text-red-600">{analysis.points_breakdown.opponent_total}</p>
              <p className="text-[10px] text-bb-gray-500">Pts Oponente</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-2xl font-bold text-bb-black">{formatTime(analysis.duration_sec)}</p>
              <p className="text-[10px] text-bb-gray-500">Duração</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{analysis.submission_attempts.filter((s) => s.athlete === 'student').length}</p>
              <p className="text-[10px] text-bb-gray-500">Finalizações</p>
            </Card>
          </div>

          {/* Timeline */}
          <Card className="p-4">
            <h2 className="mb-3 font-semibold text-bb-black">Linha do Tempo</h2>
            <div className="max-h-[300px] space-y-1 overflow-y-auto">
              {analysis.timeline.map((event) => (
                <div key={event.id} className={`flex items-center gap-2 rounded p-2 text-xs ${
                  event.athlete === 'student' ? 'bg-blue-50' : 'bg-red-50'
                }`}>
                  <span className="w-10 font-mono text-bb-gray-400">{formatTime(event.timestamp_sec)}</span>
                  <span>{EVENT_ICONS[event.event_type]}</span>
                  <span className="flex-1 text-bb-black">{event.description}</span>
                  {event.points > 0 && (
                    <span className="font-bold text-green-600">+{event.points}</span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Tactical Summary */}
          <Card className="p-4">
            <h2 className="mb-2 font-semibold text-bb-black">Resumo Tático (IA)</h2>
            <p className="text-xs leading-relaxed text-bb-gray-600">{analysis.tactical_summary}</p>
          </Card>

          {/* Manual Annotations */}
          <Card className="p-4">
            <h2 className="mb-3 font-semibold text-bb-black">Anotações do Professor</h2>

            {/* Existing annotations */}
            {annotations.length > 0 && (
              <div className="mb-4 space-y-2">
                {annotations.sort((a, b) => a.timestamp_sec - b.timestamp_sec).map((ann) => (
                  <div key={ann.id} className="flex items-start gap-2 rounded-lg bg-yellow-50 p-3">
                    <span className="flex-shrink-0 font-mono text-xs text-bb-gray-400">
                      {formatTime(ann.timestamp_sec)}
                    </span>
                    <p className="text-xs text-bb-black">{ann.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add annotation form */}
            <div className="space-y-2 rounded-lg border border-dashed border-bb-gray-300 p-3">
              <p className="text-xs font-medium text-bb-gray-500">Nova Anotação</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={annotationTime}
                  onChange={(e) => setAnnotationTime(e.target.value)}
                  placeholder="M:SS"
                  className="w-16 rounded-lg border border-bb-gray-300 px-2 py-1.5 text-xs"
                />
                <input
                  type="text"
                  value={annotationText}
                  onChange={(e) => setAnnotationText(e.target.value)}
                  placeholder="Escreva sua observação..."
                  className="flex-1 rounded-lg border border-bb-gray-300 px-3 py-1.5 text-xs"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAnnotation()}
                />
                <Button
                  variant="primary"
                  onClick={handleAddAnnotation}
                  disabled={addingAnnotation || !annotationText.trim() || !annotationTime}
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </Card>

          {/* Improvement Areas */}
          <Card className="p-4">
            <h2 className="mb-3 font-semibold text-bb-black">Áreas de Melhoria</h2>
            <div className="space-y-2">
              {analysis.improvement_areas.map((area, idx) => (
                <div key={idx} className={`rounded-lg border p-3 ${
                  area.priority === 'high' ? 'border-red-200 bg-red-50' :
                  area.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                  'border-green-200 bg-green-50'
                }`}>
                  <p className="text-xs font-bold text-bb-black">{area.area}</p>
                  <p className="mt-0.5 text-xs text-bb-gray-600">{area.description}</p>
                  <ul className="mt-1">
                    {area.suggested_drills.map((d, i) => (
                      <li key={i} className="text-[11px] text-bb-gray-500">• {d}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

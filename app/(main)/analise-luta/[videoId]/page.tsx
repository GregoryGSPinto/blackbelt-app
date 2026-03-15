'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  analyzeMatch,
  type MatchAnalysis,
  type MatchEvent,
  type MatchEventType,
} from '@/lib/api/match-analysis.service';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

const EVENT_ICONS: Record<MatchEventType, string> = {
  takedown: '🤼',
  sweep: '🔄',
  pass: '🚀',
  mount: '⬆️',
  back_take: '🔙',
  submission_attempt: '🎯',
  submission: '🏆',
  escape: '🏃',
  stand_up: '🧍',
  penalty: '🟡',
};

const EVENT_LABELS: Record<MatchEventType, string> = {
  takedown: 'Takedown',
  sweep: 'Raspagem',
  pass: 'Passagem',
  mount: 'Montada',
  back_take: 'Costas',
  submission_attempt: 'Tentativa',
  submission: 'Finalização',
  escape: 'Fuga',
  stand_up: 'Em pé',
  penalty: 'Penalidade',
};

const PRIORITY_COLORS: Record<string, string> = {
  high: 'border-red-300 bg-red-50',
  medium: 'border-yellow-300 bg-yellow-50',
  low: 'border-green-300 bg-green-50',
};

const PRIORITY_LABELS: Record<string, string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AnaliseLutaPage() {
  const params = useParams();
  const videoId = params.videoId as string;
  const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<MatchEvent | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'positions' | 'summary'>('timeline');

  useEffect(() => {
    analyzeMatch(videoId)
      .then(setAnalysis)
      .finally(() => setLoading(false));
  }, [videoId]);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!analysis) return <div className="p-4 text-center text-bb-gray-500">Análise não encontrada</div>;

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-xl font-bold text-bb-black">Análise de Luta</h1>

      {/* Video Player Placeholder */}
      <Card className="overflow-hidden">
        <div className="relative flex h-48 items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 sm:h-64">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-2 text-sm text-white/60">Player de vídeo</p>
            <p className="text-xs text-white/40">Duração: {formatTime(analysis.duration_sec)}</p>
          </div>
          {selectedEvent && (
            <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-black/70 p-2 backdrop-blur-sm">
              <p className="text-xs text-white">
                {EVENT_ICONS[selectedEvent.event_type]} {formatTime(selectedEvent.timestamp_sec)} — {selectedEvent.description}
              </p>
            </div>
          )}
        </div>

        {/* Event Timeline Bar */}
        <div className="relative h-10 bg-bb-gray-100 px-2">
          <div className="absolute inset-x-2 top-1/2 h-1 -translate-y-1/2 rounded bg-bb-gray-300" />
          {analysis.timeline.map((event) => {
            const leftPct = (event.timestamp_sec / analysis.duration_sec) * 100;
            const isStudent = event.athlete === 'student';
            return (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className={`absolute top-1/2 z-10 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs transition-transform hover:scale-125 ${
                  isStudent ? 'bg-blue-500' : 'bg-red-500'
                } ${selectedEvent?.id === event.id ? 'ring-2 ring-white scale-125' : ''}`}
                style={{ left: `${Math.max(3, Math.min(97, leftPct))}%` }}
                title={`${formatTime(event.timestamp_sec)} — ${event.description}`}
              >
                <span className="text-[8px]">{EVENT_ICONS[event.event_type]}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Score Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-blue-50 p-4 text-center">
          <p className="text-xs font-medium text-blue-600">Aluno</p>
          <p className="text-3xl font-bold text-blue-700">{analysis.points_breakdown.student_total}</p>
          <p className="text-[10px] text-blue-500">
            {analysis.points_breakdown.student_advantages} vantagens
          </p>
        </Card>
        <Card className="bg-red-50 p-4 text-center">
          <p className="text-xs font-medium text-red-600">Oponente</p>
          <p className="text-3xl font-bold text-red-700">{analysis.points_breakdown.opponent_total}</p>
          <p className="text-[10px] text-red-500">
            {analysis.points_breakdown.opponent_advantages} vantagens
          </p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-bb-gray-100 p-1">
        {(['timeline', 'positions', 'summary'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-md py-2 text-xs font-medium transition-colors ${
              activeTab === tab ? 'bg-white text-bb-black shadow-sm' : 'text-bb-gray-500'
            }`}
          >
            {tab === 'timeline' ? 'Eventos' : tab === 'positions' ? 'Posições' : 'Resumo Tático'}
          </button>
        ))}
      </div>

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <Card className="p-4">
          <div className="space-y-2">
            {analysis.timeline.map((event) => {
              const isStudent = event.athlete === 'student';
              return (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-bb-gray-50 ${
                    selectedEvent?.id === event.id ? 'border-bb-primary bg-bb-primary/5' : 'border-bb-gray-200'
                  }`}
                >
                  <span className="flex-shrink-0 text-xs font-mono text-bb-gray-400 w-10">
                    {formatTime(event.timestamp_sec)}
                  </span>
                  <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm ${
                    isStudent ? 'bg-blue-100' : 'bg-red-100'
                  }`}>
                    {EVENT_ICONS[event.event_type]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-bb-black">
                        {EVENT_LABELS[event.event_type]}
                      </span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                        isStudent ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {isStudent ? 'Aluno' : 'Oponente'}
                      </span>
                      {event.points > 0 && (
                        <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[9px] font-bold text-green-700">
                          +{event.points}pts
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-bb-gray-500">{event.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Positions Tab */}
      {activeTab === 'positions' && (
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold text-bb-black">Tempo por Posição</h3>
          <div className="space-y-3">
            {analysis.positions.map((pos, idx) => {
              const color = pos.athlete === 'student' ? 'bg-blue-500' : pos.athlete === 'opponent' ? 'bg-red-500' : 'bg-gray-400';
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-bb-black">{pos.position}</span>
                    <span className="text-bb-gray-500">{formatTime(pos.time_spent_sec)} ({pos.percentage}%)</span>
                  </div>
                  <div className="mt-1 h-3 overflow-hidden rounded-full bg-bb-gray-100">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pos.percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Points breakdown */}
          <h3 className="mb-3 mt-6 text-sm font-semibold text-bb-black">Pontuação por Categoria</h3>
          <div className="space-y-2">
            {analysis.points_breakdown.categories.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg bg-bb-gray-50 p-2">
                <span className="text-xs font-medium text-bb-black">{cat.category}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-blue-600">{cat.student}</span>
                  <span className="text-[10px] text-bb-gray-400">vs</span>
                  <span className="text-xs font-bold text-red-600">{cat.opponent}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Submissions */}
          <h3 className="mb-3 mt-6 text-sm font-semibold text-bb-black">Tentativas de Finalização</h3>
          <div className="space-y-2">
            {analysis.submission_attempts.map((sub) => (
              <div key={sub.id} className={`flex items-center gap-3 rounded-lg border p-2 ${sub.success ? 'border-green-300 bg-green-50' : 'border-bb-gray-200'}`}>
                <span className="text-xs font-mono text-bb-gray-400">{formatTime(sub.timestamp_sec)}</span>
                <div className="flex-1">
                  <p className="text-xs font-medium text-bb-black">{sub.technique}</p>
                  <p className="text-[10px] text-bb-gray-500">
                    {sub.athlete === 'student' ? 'Aluno' : 'Oponente'}
                    {sub.defense_used && ` — Defesa: ${sub.defense_used}`}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${sub.success ? 'bg-green-200 text-green-700' : 'bg-bb-gray-200 text-bb-gray-500'}`}>
                  {sub.success ? 'Sucesso' : 'Defendida'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="mb-2 text-sm font-semibold text-bb-black">Resumo Tático</h3>
            <p className="text-xs leading-relaxed text-bb-gray-600">{analysis.tactical_summary}</p>
          </Card>

          <h3 className="text-sm font-semibold text-bb-black">Áreas de Melhoria</h3>
          {analysis.improvement_areas.map((area, idx) => (
            <Card key={idx} className={`border p-4 ${PRIORITY_COLORS[area.priority]}`}>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-bb-black">{area.area}</h4>
                <span className="rounded-full bg-white/50 px-2 py-0.5 text-[10px] font-medium">
                  Prioridade {PRIORITY_LABELS[area.priority]}
                </span>
              </div>
              <p className="mt-1 text-xs text-bb-gray-600">{area.description}</p>
              <div className="mt-2">
                <p className="text-[10px] font-semibold uppercase text-bb-gray-500">Drills Sugeridos</p>
                <ul className="mt-1 space-y-1">
                  {area.suggested_drills.map((drill, i) => (
                    <li key={i} className="text-xs text-bb-gray-600">• {drill}</li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { forwardRef, useState, useCallback, useRef } from 'react';

interface DashboardData {
  userName: string;
  checkinsYesterday: number;
  revenueYesterday: number;
  newStudents: number;
  absenceAlerts: number;
  classesToday: number;
  pendingPayments: number;
}

interface VoiceSummaryProps {
  data: DashboardData;
  className?: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function buildSummaryText(data: DashboardData): string {
  const greeting = getGreeting();
  const parts: string[] = [
    `${greeting} ${data.userName}.`,
  ];

  if (data.checkinsYesterday > 0) {
    parts.push(`Ontem foram ${data.checkinsYesterday} check-ins`);
  }

  if (data.revenueYesterday > 0) {
    parts.push(`${formatCurrency(data.revenueYesterday)} recebidos`);
  }

  if (data.newStudents > 0) {
    parts.push(`${data.newStudents} novo${data.newStudents > 1 ? 's' : ''} aluno${data.newStudents > 1 ? 's' : ''} cadastrado${data.newStudents > 1 ? 's' : ''}`);
  }

  if (data.classesToday > 0) {
    parts.push(`Hoje você tem ${data.classesToday} aula${data.classesToday > 1 ? 's' : ''} programada${data.classesToday > 1 ? 's' : ''}`);
  }

  if (data.absenceAlerts > 0) {
    parts.push(`${data.absenceAlerts} aluno${data.absenceAlerts > 1 ? 's' : ''} com alerta de ausência`);
  }

  if (data.pendingPayments > 0) {
    parts.push(`${data.pendingPayments} pagamento${data.pendingPayments > 1 ? 's' : ''} pendente${data.pendingPayments > 1 ? 's' : ''}`);
  }

  return parts.join('. ') + '.';
}

const VoiceSummary = forwardRef<HTMLDivElement, VoiceSummaryProps>(
  function VoiceSummary({ data, className }, ref) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [summaryText] = useState(() => buildSummaryText(data));
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const handlePlay = useCallback(() => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;

      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(summaryText);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Try to use a Brazilian Portuguese voice
      const voices = window.speechSynthesis.getVoices();
      const ptBrVoice = voices.find((v) => v.lang === 'pt-BR')
        ?? voices.find((v) => v.lang.startsWith('pt'));
      if (ptBrVoice) utterance.voice = ptBrVoice;

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      utteranceRef.current = utterance;
      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    }, [isPlaying, summaryText]);

    return (
      <div
        ref={ref}
        className={`flex items-center gap-3 rounded-xl bg-gradient-to-r from-bb-gray-900 to-bb-gray-700 p-4 text-bb-white ${className ?? ''}`}
      >
        <button
          onClick={handlePlay}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bb-white/20 transition-colors hover:bg-bb-white/30"
          aria-label={isPlaying ? 'Parar resumo em voz' : 'Ouvir resumo em voz'}
        >
          {isPlaying ? (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-bb-white/70">Resumo do dia</p>
          <p className="mt-0.5 truncate text-sm">{summaryText}</p>
        </div>
      </div>
    );
  },
);

VoiceSummary.displayName = 'VoiceSummary';

export { VoiceSummary };
export type { VoiceSummaryProps, DashboardData };

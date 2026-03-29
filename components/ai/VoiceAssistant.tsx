'use client';

import { forwardRef, useState, useCallback, useRef, useEffect } from 'react';
import {
  startListening,
  stopListening,
  processCommand,
  type VoiceResponse,
  type VoiceCommandType,
} from '@/lib/api/voice-assistant.service';

const COMMAND_ICON: Record<VoiceCommandType, string> = {
  start_timer: '⏱️',
  stop_timer: '⏹️',
  next_exercise: '🏋️',
  time_remaining: '⏳',
  check_posture: '🧍',
  register_attendance: '✅',
  next_training: '📅',
  match_result: '🥋',
  unknown: '❓',
};

const SUGGESTED_COMMANDS = [
  'Iniciar cronômetro',
  'Próximo exercício',
  'Registrar presença',
  'Qual meu próximo treino?',
];

const VoiceAssistant = forwardRef<HTMLDivElement, object>(function VoiceAssistant(_, ref) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState<VoiceResponse | null>(null);
  const [processing, setProcessing] = useState(false);
  const [history, setHistory] = useState<{ transcript: string; response: VoiceResponse }[]>([]);
  const pulseRef = useRef<HTMLDivElement>(null);

  // Simulate listening animation
  useEffect(() => {
    if (!isListening || !pulseRef.current) return;
    const el = pulseRef.current;
    el.style.animation = 'none';
    // Force reflow
    void el.offsetHeight;
    el.style.animation = '';
  }, [isListening]);

  const handleToggleListening = useCallback(async () => {
    if (isListening) {
      // Stop listening and process
      setProcessing(true);
      try {
        const state = await stopListening();
        setIsListening(false);
        if (state.transcript) {
          setTranscript(state.transcript);
          const result = await processCommand(state.transcript);
          setResponse(result);
          setHistory((prev) => [...prev, { transcript: state.transcript, response: result }]);
        }
      } catch {
        // handled by service
      } finally {
        setProcessing(false);
      }
    } else {
      // Start listening
      try {
        await startListening();
        setIsListening(true);
        setTranscript('');
        setResponse(null);
      } catch {
        // handled by service
      }
    }
  }, [isListening]);

  const handleQuickCommand = useCallback(async (command: string) => {
    setProcessing(true);
    setTranscript(command);
    try {
      const result = await processCommand(command);
      setResponse(result);
      setHistory((prev) => [...prev, { transcript: command, response: result }]);
    } catch {
      // handled by service
    } finally {
      setProcessing(false);
    }
  }, []);

  return (
    <div ref={ref}>
      {/* Floating Mic Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-bb-primary text-white shadow-lg transition-transform hover:scale-110"
        aria-label="Assistente de Voz"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 z-50 flex w-[340px] flex-col rounded-xl border border-bb-gray-200 shadow-2xl sm:w-[380px]" style={{ background: 'var(--bb-depth-1)' }}>
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-xl bg-bb-primary px-4 py-3">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="font-bold text-white">Assistente de Voz</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mic Area */}
          <div className="flex flex-col items-center py-6">
            <div className="relative">
              {/* Pulse rings */}
              {isListening && (
                <>
                  <div
                    ref={pulseRef}
                    className="absolute inset-0 animate-ping rounded-full opacity-30"
                    style={{ animationDuration: '1.5s', background: 'var(--bb-danger)' }}
                  />
                  <div
                    className="absolute -inset-2 animate-pulse rounded-full opacity-20"
                    style={{ animationDuration: '1s', background: 'var(--bb-danger)' }}
                  />
                  <div
                    className="absolute -inset-4 animate-pulse rounded-full opacity-10"
                    style={{ animationDuration: '2s', background: 'var(--bb-danger)' }}
                  />
                </>
              )}
              <button
                onClick={handleToggleListening}
                disabled={processing}
                className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full transition-all ${
                  isListening
                    ? 'text-white shadow-lg'
                    : processing
                    ? 'bg-bb-gray-300 text-bb-gray-500'
                    : 'bg-bb-primary text-white hover:bg-bb-primary/90'
                }`}
                style={isListening ? { background: 'var(--bb-danger)', boxShadow: '0 10px 15px -3px color-mix(in srgb, var(--bb-danger) 30%, transparent)' } : undefined}
              >
                {processing ? (
                  <svg className="h-6 w-6 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="mt-3 text-xs text-bb-gray-500">
              {isListening
                ? 'Ouvindo... Toque para parar'
                : processing
                ? 'Processando...'
                : 'Toque para falar'}
            </p>
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="mx-4 mb-3 rounded-lg bg-bb-gray-100 p-3">
              <p className="text-[10px] font-medium uppercase text-bb-gray-400">Você disse:</p>
              <p className="mt-0.5 text-sm text-bb-black">&ldquo;{transcript}&rdquo;</p>
            </div>
          )}

          {/* Response */}
          {response && (
            <div className="mx-4 mb-3 rounded-lg border border-bb-gray-200 p-3" style={{ background: 'var(--bb-depth-1)' }}>
              <div className="flex items-start gap-2">
                <span className="text-lg">{COMMAND_ICON[response.command_type]}</span>
                <div>
                  <p className="text-sm text-bb-black">{response.text_response}</p>
                  {response.action && (
                    <button className="mt-1 text-xs font-medium text-bb-primary hover:underline">
                      Abrir &rarr;
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Commands */}
          <div className="border-t border-bb-gray-100 p-3">
            <p className="mb-2 text-[10px] font-medium uppercase text-bb-gray-400">Comandos rápidos</p>
            <div className="flex flex-wrap gap-1">
              {SUGGESTED_COMMANDS.map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => handleQuickCommand(cmd)}
                  disabled={processing}
                  className="rounded-full bg-bb-gray-100 px-3 py-1 text-xs text-bb-gray-700 hover:bg-bb-gray-200 disabled:opacity-50"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="max-h-[200px] overflow-y-auto border-t border-bb-gray-100 p-3">
              <p className="mb-2 text-[10px] font-medium uppercase text-bb-gray-400">Histórico</p>
              <div className="space-y-2">
                {[...history].reverse().map((item, idx) => (
                  <div key={idx} className="rounded-lg bg-bb-gray-50 p-2">
                    <p className="text-[10px] text-bb-gray-400">&ldquo;{item.transcript}&rdquo;</p>
                    <p className="mt-0.5 text-xs text-bb-gray-600">{item.response.text_response}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

VoiceAssistant.displayName = 'VoiceAssistant';
export { VoiceAssistant };

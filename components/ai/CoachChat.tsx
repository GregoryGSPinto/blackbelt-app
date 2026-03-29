'use client';

import { forwardRef, useState, useCallback } from 'react';
import { answerQuestion } from '@/lib/api/ai-coach.service';

interface ChatMessage {
  id: string;
  role: 'user' | 'coach';
  content: string;
}

const QUICK_SUGGESTIONS = [
  'Como melhorar minha guarda?',
  'Plano de treino para esta semana',
  'Dica do dia',
];

const CoachChat = forwardRef<HTMLDivElement>(function CoachChat(_, ref) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'coach', content: 'Olá! Sou o Coach IA do BlackBelt. Como posso ajudar no seu treino hoje?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const answer = await answerQuestion('student-1', text);
      setMessages((prev) => [...prev, { id: `c-${Date.now()}`, role: 'coach', content: answer }]);
    } catch {
      setMessages((prev) => [...prev, { id: `e-${Date.now()}`, role: 'coach', content: 'Desculpe, tive um problema. Tente novamente.' }]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  return (
    <div ref={ref}>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-bb-primary text-2xl text-white shadow-lg transition-transform hover:scale-110"
        aria-label="Coach IA"
      >
        🧠
      </button>

      {/* Chat Drawer */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[380px] flex-col rounded-xl border border-bb-gray-200 shadow-2xl md:h-[560px]" style={{ background: 'var(--bb-depth-1)' }}>
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-xl bg-bb-primary px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧠</span>
              <span className="font-bold text-white">Coach IA</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Fechar coach IA" className="text-white/80 hover:text-white">✕</button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user' ? 'bg-bb-primary text-white' : 'bg-bb-gray-100 text-bb-black'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-bb-gray-100 px-3 py-2 text-sm text-bb-gray-500">
                  Pensando...
                </div>
              </div>
            )}
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1 border-t border-bb-gray-100 px-4 py-2">
              {QUICK_SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => handleSend(s)} className="rounded-full bg-bb-gray-100 px-3 py-1 text-xs text-bb-gray-700 hover:bg-bb-gray-200">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2 border-t border-bb-gray-200 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder="Pergunte algo..."
              className="flex-1 rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
              disabled={loading}
            />
            <button
              onClick={() => handleSend(input)}
              disabled={loading || !input.trim()}
              className="rounded-lg bg-bb-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

CoachChat.displayName = 'CoachChat';
export { CoachChat };

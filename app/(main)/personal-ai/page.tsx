'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getDailyBriefing,
  chat,
  getWeeklyPlan,
  type DailyBriefing,
  type WeeklyPlan,
  type ChatMessage,
  type AIResponse,
  type ToneType,
} from '@/lib/api/personal-ai.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

const QUICK_ACTIONS = [
  { label: 'Meu plano', icon: '📋', message: 'Qual meu plano para esta semana?' },
  { label: 'Próxima aula', icon: '🥋', message: 'Qual minha próxima aula?' },
  { label: 'Dica de técnica', icon: '💡', message: 'Me dê uma dica de técnica' },
  { label: 'Controle de peso', icon: '⚖️', message: 'Como está meu peso?' },
];

const TONE_OPTIONS: { value: ToneType; label: string; icon: string }[] = [
  { value: 'motivational', label: 'Motivacional', icon: '🔥' },
  { value: 'technical', label: 'Técnico', icon: '🎯' },
  { value: 'casual', label: 'Casual', icon: '😎' },
];

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function PersonalAIPage() {
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [tone, setTone] = useState<ToneType>('motivational');
  const [showWeeklyPlan, setShowWeeklyPlan] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    getDailyBriefing('student-1')
      .then(setBriefing)
      .finally(() => setLoading(false));
  }, []);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || chatLoading) return;
    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setChatLoading(true);

    try {
      const response: AIResponse = await chat('student-1', text, newMessages);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.message, timestamp: new Date().toISOString() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Desculpe, tive um problema. Tente novamente.', timestamp: new Date().toISOString() },
      ]);
    } finally {
      setChatLoading(false);
    }
  }, [messages, chatLoading]);

  const handleLoadWeeklyPlan = useCallback(async () => {
    setShowWeeklyPlan(true);
    if (!weeklyPlan) {
      const plan = await getWeeklyPlan('student-1');
      setWeeklyPlan(plan);
    }
  }, [weeklyPlan]);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-bb-black">Meu Assistente IA</h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="rounded-lg p-2 text-bb-gray-500 hover:bg-bb-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-bb-black">Configurações</h2>
          <div>
            <p className="mb-2 text-xs text-bb-gray-500">Tom da IA</p>
            <div className="flex gap-2">
              {TONE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTone(opt.value)}
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    tone === opt.value
                      ? 'bg-bb-primary text-white'
                      : 'bg-bb-gray-100 text-bb-gray-500 hover:bg-bb-gray-200'
                  }`}
                >
                  <span>{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Daily Briefing */}
      {briefing && (
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-bb-primary to-bb-primary/80 p-4 text-white">
            <p className="text-sm font-medium opacity-80">Briefing do Dia</p>
            <p className="mt-1 text-lg font-bold leading-tight">{briefing.greeting}</p>
          </div>
          <div className="space-y-3 p-4">
            {/* Today's class */}
            {briefing.todays_class && (
              <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3">
                <span className="text-xl">🥋</span>
                <div>
                  <p className="text-sm font-semibold text-bb-black">{briefing.todays_class.name}</p>
                  <p className="text-xs text-bb-gray-500">{briefing.todays_class.time} — {briefing.todays_class.professor}</p>
                </div>
              </div>
            )}

            {/* Focus suggestion */}
            <div className="flex items-start gap-3 rounded-lg bg-yellow-50 p-3">
              <span className="text-xl">🎯</span>
              <div>
                <p className="text-xs font-semibold text-yellow-700">Foco do Dia</p>
                <p className="text-xs text-yellow-800">{briefing.focus_suggestion}</p>
              </div>
            </div>

            {/* Competition countdown */}
            {briefing.competition_countdown && (
              <div className="flex items-center gap-3 rounded-lg bg-red-50 p-3">
                <span className="text-xl">🏆</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-red-700">{briefing.competition_countdown.name}</p>
                  <p className="text-xs text-red-600">Faltam {briefing.competition_countdown.days_remaining} dias</p>
                </div>
                <span className="text-2xl font-bold text-red-600">{briefing.competition_countdown.days_remaining}</span>
              </div>
            )}

            {/* Weight check */}
            {briefing.weight_check && (
              <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3">
                <span className="text-xl">⚖️</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-green-700">Controle de Peso</p>
                  <p className="text-xs text-green-600">
                    {briefing.weight_check.current}kg → {briefing.weight_check.target}kg ({briefing.weight_check.diff > 0 ? '-' : '+'}{Math.abs(briefing.weight_check.diff)}kg)
                  </p>
                </div>
              </div>
            )}

            {/* Streak */}
            <div className="flex items-center gap-3 rounded-lg bg-purple-50 p-3">
              <span className="text-xl">🔥</span>
              <p className="text-xs text-purple-700">{briefing.streak_info}</p>
            </div>

            {/* Quote */}
            <p className="border-l-2 border-bb-gray-300 pl-3 text-xs italic text-bb-gray-500">
              {briefing.motivational_quote}
            </p>
          </div>
        </Card>
      )}

      {/* Weekly Plan Button */}
      <Button variant="secondary" className="w-full" onClick={handleLoadWeeklyPlan}>
        📋 Ver Plano Semanal
      </Button>

      {/* Weekly Plan */}
      {showWeeklyPlan && weeklyPlan && (
        <Card className="p-4">
          <h2 className="mb-1 font-semibold text-bb-black">Plano Semanal</h2>
          <p className="mb-3 text-xs text-bb-gray-500">{weeklyPlan.summary}</p>
          <div className="space-y-2">
            {weeklyPlan.days.map((day) => (
              <div
                key={day.date}
                className={`rounded-lg border p-3 ${day.has_class ? 'border-blue-200 bg-blue-50' : 'border-bb-gray-200 bg-bb-gray-50'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-bb-gray-500">{DAY_LABELS[day.day_of_week]}</span>
                    <span className="text-sm font-semibold text-bb-black">{day.label}</span>
                  </div>
                  {day.has_class && (
                    <span className="rounded-full bg-blue-200 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                      {day.class_time}
                    </span>
                  )}
                </div>
                {day.class_name && <p className="mt-1 text-xs font-medium text-blue-700">{day.class_name}</p>}
                <p className="mt-1 text-xs text-bb-gray-600">{day.focus}</p>
                {day.tips.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {day.tips.map((tip, i) => (
                      <li key={i} className="text-[11px] text-bb-gray-500">• {tip}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-2 rounded-lg bg-green-50 p-3">
            <p className="text-xs font-semibold text-green-700">Meta da Semana</p>
            <p className="text-xs text-green-600">{weeklyPlan.weekly_goal}</p>
            <p className="text-xs text-green-600">🍎 {weeklyPlan.nutrition_tip}</p>
            <p className="text-xs text-green-600">🧊 {weeklyPlan.recovery_tip}</p>
          </div>
        </Card>
      )}

      {/* Chat Interface */}
      <Card className="overflow-hidden">
        <div className="bg-bb-primary px-4 py-3">
          <p className="font-semibold text-white">Chat com IA Pessoal</p>
          <p className="text-xs text-white/70">Pergunte qualquer coisa sobre seu treino</p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 overflow-x-auto border-b border-bb-gray-100 p-3">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => handleSend(action.message)}
              className="flex flex-shrink-0 items-center gap-1 rounded-full bg-bb-gray-100 px-3 py-1.5 text-xs font-medium text-bb-gray-700 hover:bg-bb-gray-200"
            >
              <span>{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="max-h-[400px] space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <p className="text-center text-sm text-bb-gray-400">
              Use os atalhos acima ou digite sua pergunta
            </p>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === 'user' ? 'bg-bb-primary text-white' : 'bg-bb-gray-100 text-bb-black'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-bb-gray-100 px-3 py-2 text-sm text-bb-gray-500">
                Pensando...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2 border-t border-bb-gray-200 p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Pergunte algo..."
            className="flex-1 rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
            disabled={chatLoading}
          />
          <Button
            variant="primary"
            onClick={() => handleSend(input)}
            disabled={chatLoading || !input.trim()}
          >
            Enviar
          </Button>
        </div>
      </Card>
    </div>
  );
}

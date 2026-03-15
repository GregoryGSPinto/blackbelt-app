'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  getConversations,
  getMessages,
  sendMessage,
  getStudentContext,
  getSuggestedMessages,
  markRead,
  type ConversationDTO,
  type MessageDTO,
  type StudentContextDTO,
  type SuggestedMessageDTO,
} from '@/lib/api/mensagens.service';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function healthColor(score: number): string {
  if (score >= 70) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  if (score >= 30) return 'text-orange-600';
  return 'text-red-600';
}

function healthBg(score: number): string {
  if (score >= 70) return 'bg-green-500';
  if (score >= 50) return 'bg-yellow-500';
  if (score >= 30) return 'bg-orange-500';
  return 'bg-red-500';
}

function planStatusLabel(status: string | null): { label: string; cls: string } {
  switch (status) {
    case 'active':
      return { label: 'Ativo', cls: 'bg-green-100 text-green-700' };
    case 'past_due':
      return { label: 'Em atraso', cls: 'bg-red-100 text-red-700' };
    case 'cancelled':
      return { label: 'Cancelado', cls: 'bg-bb-gray-100 text-bb-gray-500' };
    default:
      return { label: 'N/A', cls: 'bg-bb-gray-100 text-bb-gray-500' };
  }
}

const BELT_COLORS: Record<string, string> = {
  white: '#FAFAFA',
  gray: '#9CA3AF',
  yellow: '#EAB308',
  orange: '#EA580C',
  green: '#16A34A',
  blue: '#2563EB',
  purple: '#9333EA',
  brown: '#92400E',
  black: '#0A0A0A',
};

export default function MensagensPage() {
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [selectedConv, setSelectedConv] = useState<ConversationDTO | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [studentContext, setStudentContext] = useState<StudentContextDTO | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestedMessageDTO[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [contextLoading, setContextLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getConversations('prof-1')
      .then(setConversations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  async function handleSelectConversation(conv: ConversationDTO) {
    setSelectedConv(conv);
    setMobileView('chat');
    setMessagesLoading(true);
    setContextLoading(true);
    setStudentContext(null);
    setSuggestions([]);

    try {
      const msgs = await getMessages(conv.id);
      setMessages(msgs);
      if (conv.unread_count > 0) {
        await markRead(conv.id);
        setConversations((prev) =>
          prev.map((c) => (c.id === conv.id ? { ...c, unread_count: 0 } : c)),
        );
      }
    } catch {
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }

    try {
      const [ctx, sugs] = await Promise.all([
        getStudentContext(conv.participant_id),
        conv.is_at_risk ? getSuggestedMessages(conv.participant_id) : Promise.resolve([]),
      ]);
      setStudentContext(ctx);
      setSuggestions(sugs);
    } catch {
      setStudentContext(null);
      setSuggestions([]);
    } finally {
      setContextLoading(false);
    }
  }

  async function handleSend() {
    if (!newMessage.trim() || !selectedConv) return;
    setSending(true);
    try {
      const msg = await sendMessage(selectedConv.id, newMessage.trim());
      setMessages((prev) => [...prev, msg]);
      setNewMessage('');
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConv.id
            ? { ...c, last_message: msg.content, last_message_time: 'Agora' }
            : c,
        ),
      );
    } catch {
      // Error handled by service
    } finally {
      setSending(false);
    }
  }

  function handleSuggestionClick(content: string) {
    setNewMessage(content);
  }

  function handleBackToList() {
    setMobileView('list');
    setSelectedConv(null);
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Conversation List - Left Panel */}
      <div
        className={`flex w-full flex-col border-r border-bb-gray-300 bg-bb-white md:w-80 lg:w-96 ${
          mobileView === 'chat' ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="border-b border-bb-gray-300 p-4">
          <h1 className="text-lg font-bold text-bb-black">Mensagens</h1>
          <p className="text-xs text-bb-gray-500">
            {conversations.filter((c) => c.unread_count > 0).length} nao lidas
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => handleSelectConversation(conv)}
              className={`flex w-full items-start gap-3 border-b border-bb-gray-100 p-4 text-left transition-colors hover:bg-bb-gray-100 ${
                selectedConv?.id === conv.id ? 'bg-bb-gray-100' : ''
              }`}
            >
              <div className="relative">
                <Avatar size="md" name={conv.participant_name} src={conv.participant_avatar} />
                {conv.is_at_risk && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate text-sm font-semibold text-bb-black">
                    {conv.participant_name}
                  </span>
                  <span className="ml-2 shrink-0 text-xs text-bb-gray-500">
                    {conv.last_message_time}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className="inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: BELT_COLORS[conv.participant_belt] ?? '#D4D4D4' }}
                  />
                  <p className="truncate text-xs text-bb-gray-500">{conv.last_message}</p>
                </div>
                {conv.unread_count > 0 && (
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-bb-red text-[10px] font-bold text-bb-white">
                    {conv.unread_count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area - Center */}
      <div
        className={`flex flex-1 flex-col ${
          mobileView === 'list' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 border-b border-bb-gray-300 bg-bb-white px-4 py-3">
              <button
                onClick={handleBackToList}
                className="text-bb-gray-500 hover:text-bb-black md:hidden"
                aria-label="Voltar"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <Avatar size="sm" name={selectedConv.participant_name} src={selectedConv.participant_avatar} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-bb-black">{selectedConv.participant_name}</p>
                <div className="flex items-center gap-1">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: BELT_COLORS[selectedConv.participant_belt] ?? '#D4D4D4' }}
                  />
                  <span className="text-xs capitalize text-bb-gray-500">{selectedConv.participant_belt}</span>
                </div>
              </div>
              <button
                onClick={() => setShowContext(!showContext)}
                className={`rounded-lg p-2 transition-colors ${
                  showContext ? 'bg-bb-red text-bb-white' : 'text-bb-gray-500 hover:bg-bb-gray-100'
                }`}
                aria-label="Contexto do aluno"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>

            {/* Suggested Messages for at-risk students */}
            {suggestions.length > 0 && (
              <div className="flex gap-2 overflow-x-auto border-b border-bb-gray-100 bg-red-50 px-4 py-2">
                <span className="shrink-0 text-xs font-medium text-red-600">Sugestoes:</span>
                {suggestions.map((sug) => (
                  <button
                    key={sug.id}
                    onClick={() => handleSuggestionClick(sug.content)}
                    className="shrink-0 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
                  >
                    {sug.label}
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-bb-gray-100 p-4">
              {messagesLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Spinner />
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${msg.is_mine ? 'justify-end' : 'justify-start'}`}
                    >
                      {!msg.is_mine && (
                        <Avatar size="sm" name={msg.from_name} src={msg.from_avatar} />
                      )}
                      <div
                        className={`max-w-[70%] rounded-xl px-4 py-2 ${
                          msg.is_mine
                            ? 'rounded-br-sm bg-bb-red text-bb-white'
                            : 'rounded-bl-sm bg-bb-white text-bb-black'
                        }`}
                      >
                        {!msg.is_mine && (
                          <p className="mb-0.5 text-[10px] font-semibold text-bb-gray-500">
                            {msg.from_name}
                          </p>
                        )}
                        <p className="text-sm">{msg.content}</p>
                        <div className={`mt-1 flex items-center gap-1 ${msg.is_mine ? 'justify-end' : 'justify-start'}`}>
                          <span className={`text-[10px] ${msg.is_mine ? 'text-red-200' : 'text-bb-gray-500'}`}>
                            {formatTime(msg.sent_at)}
                          </span>
                          {msg.is_mine && (
                            <svg
                              className={`h-3 w-3 ${msg.read_at ? 'text-blue-300' : 'text-red-200'}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2.5}
                            >
                              {msg.read_at ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m0 0l4-4M11 14l4-4" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              )}
                            </svg>
                          )}
                        </div>
                      </div>
                      {msg.is_mine && (
                        <Avatar size="sm" name={msg.from_name} src={msg.from_avatar} />
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-bb-gray-300 bg-bb-white p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Digite uma mensagem..."
                  className="flex-1 rounded-lg border border-bb-gray-300 px-4 py-2 text-sm text-bb-black placeholder:text-bb-gray-500 focus:border-bb-red focus:outline-none"
                />
                <Button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  loading={sending}
                  size="md"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <svg className="mb-4 h-16 w-16 text-bb-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h2 className="text-lg font-semibold text-bb-gray-500">Selecione uma conversa</h2>
            <p className="mt-1 text-sm text-bb-gray-500">Escolha uma conversa na lista ao lado</p>
          </div>
        )}
      </div>

      {/* Context Sidebar - Right Panel */}
      {showContext && selectedConv && (
        <div className="hidden w-80 flex-col overflow-y-auto border-l border-bb-gray-300 bg-bb-white lg:flex">
          {contextLoading ? (
            <div className="flex h-full items-center justify-center">
              <Spinner />
            </div>
          ) : studentContext ? (
            <div className="p-4">
              {/* Student Profile */}
              <div className="mb-4 flex flex-col items-center text-center">
                <Avatar size="lg" name={studentContext.display_name} src={studentContext.avatar} />
                <h3 className="mt-2 text-sm font-bold text-bb-black">{studentContext.display_name}</h3>
                <Badge
                  variant="belt"
                  beltColor={BELT_COLORS[studentContext.belt] ?? '#D4D4D4'}
                  className="mt-1"
                >
                  Faixa {studentContext.belt}
                </Badge>
              </div>

              <div className="space-y-4">
                {/* Health Score */}
                <Card variant="outlined" className="p-3">
                  <p className="text-xs font-medium text-bb-gray-500">Health Score</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-bb-gray-100">
                      <div
                        className={`h-full rounded-full ${healthBg(studentContext.health_score)}`}
                        style={{ width: `${studentContext.health_score}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold ${healthColor(studentContext.health_score)}`}>
                      {studentContext.health_score}
                    </span>
                  </div>
                  {studentContext.is_at_risk && (
                    <p className="mt-1 text-xs font-medium text-red-600">Em risco de evasao</p>
                  )}
                </Card>

                {/* Last Attendance */}
                <Card variant="outlined" className="p-3">
                  <p className="text-xs font-medium text-bb-gray-500">Ultima Presenca</p>
                  <p className="mt-1 text-sm font-semibold text-bb-black">
                    {studentContext.last_attendance
                      ? new Date(studentContext.last_attendance).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Nenhuma'}
                  </p>
                </Card>

                {/* Streak */}
                <Card variant="outlined" className="p-3">
                  <p className="text-xs font-medium text-bb-gray-500">Streak</p>
                  <div className="mt-1 flex items-center gap-2">
                    {studentContext.streak > 0 && (
                      <span className="text-lg">
                        {studentContext.streak >= 7 ? '\uD83D\uDD25' : '\u2B50'}
                      </span>
                    )}
                    <span className="text-sm font-bold text-bb-black">
                      {studentContext.streak} {studentContext.streak === 1 ? 'dia' : 'dias'}
                    </span>
                  </div>
                </Card>

                {/* Latest Evaluation */}
                <Card variant="outlined" className="p-3">
                  <p className="text-xs font-medium text-bb-gray-500">Ultima Avaliacao</p>
                  {studentContext.latest_evaluation ? (
                    <div className="mt-2 space-y-2">
                      {[
                        { label: 'Tecnica', value: studentContext.latest_evaluation.technique },
                        { label: 'Disciplina', value: studentContext.latest_evaluation.discipline },
                        { label: 'Presenca', value: studentContext.latest_evaluation.attendance },
                        { label: 'Evolucao', value: studentContext.latest_evaluation.evolution },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <span className="text-xs text-bb-gray-500">{item.label}</span>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 10 }, (_, i) => (
                              <span
                                key={i}
                                className={`inline-block h-1.5 w-1.5 rounded-full ${
                                  i < item.value ? 'bg-bb-red' : 'bg-bb-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-1 text-xs font-medium text-bb-gray-700">{item.value}</span>
                          </div>
                        </div>
                      ))}
                      <p className="text-[10px] text-bb-gray-500">
                        {new Date(studentContext.latest_evaluation.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-bb-gray-500">Nenhuma avaliacao registrada</p>
                  )}
                </Card>

                {/* Current Plan */}
                <Card variant="outlined" className="p-3">
                  <p className="text-xs font-medium text-bb-gray-500">Plano Atual</p>
                  {studentContext.current_plan ? (
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-sm font-semibold text-bb-black">
                        {studentContext.current_plan}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          planStatusLabel(studentContext.plan_status).cls
                        }`}
                      >
                        {planStatusLabel(studentContext.plan_status).label}
                      </span>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-bb-gray-500">Sem plano ativo</p>
                  )}
                </Card>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-bb-gray-500">Contexto indisponivel</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

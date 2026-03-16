'use client';

import { useEffect, useState, useRef } from 'react';
import {
  getConversations,
  getMessages,
  sendMessage,
  markRead,
  type ConversationDTO,
  type MessageDTO,
} from '@/lib/api/mensagens.service';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

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

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function ProfessorMensagensPage() {
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [selectedConv, setSelectedConv] = useState<ConversationDTO | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getConversations('prof-1')
      .then(setConversations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSelectConversation(conv: ConversationDTO) {
    setSelectedConv(conv);
    setMobileView('chat');
    setMessagesLoading(true);

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

  if (conversations.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          title="Nenhuma conversa"
          description="Voce nao possui mensagens no momento."
        />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Conversation List */}
      <div
        className={`flex w-full flex-col border-r border-bb-gray-300 bg-bb-white md:w-80 lg:w-96 ${
          mobileView === 'chat' ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="border-b border-bb-gray-300 p-4">
          <h1 className="text-lg font-bold text-bb-gray-900">Mensagens</h1>
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
                  <span className="truncate text-sm font-semibold text-bb-gray-900">
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
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-bb-red text-[10px] font-bold text-white">
                    {conv.unread_count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
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
                className="text-bb-gray-500 hover:text-bb-gray-900 md:hidden"
                aria-label="Voltar"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <Avatar size="sm" name={selectedConv.participant_name} src={selectedConv.participant_avatar} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-bb-gray-900">{selectedConv.participant_name}</p>
                <div className="flex items-center gap-1">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: BELT_COLORS[selectedConv.participant_belt] ?? '#D4D4D4' }}
                  />
                  <span className="text-xs capitalize text-bb-gray-500">{selectedConv.participant_belt}</span>
                </div>
              </div>
            </div>

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
                            ? 'rounded-br-sm bg-bb-red text-white'
                            : 'rounded-bl-sm bg-bb-white text-bb-gray-900'
                        }`}
                      >
                        {!msg.is_mine && (
                          <p className="mb-0.5 text-[10px] font-semibold text-bb-gray-500">
                            {msg.from_name}
                          </p>
                        )}
                        <p className="text-sm">{msg.content}</p>
                        <span className={`mt-1 block text-[10px] ${msg.is_mine ? 'text-right text-red-200' : 'text-bb-gray-500'}`}>
                          {formatTime(msg.sent_at)}
                        </span>
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
                  className="flex-1 rounded-lg border border-bb-gray-300 px-4 py-2 text-sm text-bb-gray-900 placeholder:text-bb-gray-500 focus:border-bb-red focus:outline-none"
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
    </div>
  );
}

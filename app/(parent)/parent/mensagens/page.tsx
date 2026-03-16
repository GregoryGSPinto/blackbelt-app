'use client';

import { useState, useEffect, useRef } from 'react';
import { getConversations, getMessages, sendMessage } from '@/lib/api/mensagens.service';
import type { ConversationDTO, MessageDTO } from '@/lib/api/mensagens.service';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────

export default function ParentMensagensPage() {
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getConversations('prof-guardian-1')
      .then(setConversations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedConv) return;
    setMessagesLoading(true);
    getMessages(selectedConv)
      .then((msgs) => {
        setMessages(msgs);
        setTimeout(
          () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }),
          100,
        );
      })
      .catch(() => setMessages([]))
      .finally(() => setMessagesLoading(false));
  }, [selectedConv]);

  async function handleSend() {
    if (!newMessage.trim() || !selectedConv) return;
    setSending(true);
    try {
      const msg = await sendMessage(selectedConv, newMessage.trim());
      setMessages((prev) => [...prev, msg]);
      setNewMessage('');
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConv
            ? { ...c, last_message: msg.content, last_message_time: 'Agora' }
            : c,
        ),
      );
    } finally {
      setSending(false);
    }
  }

  const selectedConvData = conversations.find((c) => c.id === selectedConv);

  // ── Loading State ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-bb-gray-50 p-4">
        <div className="mx-auto max-w-lg space-y-3">
          <Skeleton variant="text" className="h-8 w-48" />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="card" className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  // ── Empty State ────────────────────────────────────────────
  if (conversations.length === 0 && !selectedConv) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bb-gray-50 p-4">
        <div className="text-center">
          <svg
            className="mx-auto mb-4 h-16 w-16 text-bb-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h2 className="text-lg font-bold text-bb-gray-900">Nenhuma conversa</h2>
          <p className="mt-1 text-sm text-bb-gray-500">
            Voce ainda nao tem conversas com professores.
          </p>
        </div>
      </div>
    );
  }

  // ── Chat View ──────────────────────────────────────────────
  if (selectedConv && selectedConvData) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col bg-bb-gray-50">
        {/* Chat Header */}
        <div className="flex items-center gap-3 border-b border-bb-gray-300 bg-white px-4 py-3">
          <button
            onClick={() => setSelectedConv(null)}
            className="text-bb-gray-500 hover:text-bb-gray-900"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <Avatar name={selectedConvData.participant_name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-bb-gray-900">
              {selectedConvData.participant_name}
            </p>
            <p className="text-xs text-bb-gray-500">Professor</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {messagesLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-bb-gray-300 border-t-bb-red-500" />
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.is_mine ? 'justify-end' : 'justify-start'}`}
                >
                  {!msg.is_mine && (
                    <Avatar name={msg.from_name} size="sm" src={msg.from_avatar} />
                  )}
                  <div
                    className={`ml-2 max-w-[75%] rounded-2xl px-4 py-2 ${
                      msg.is_mine
                        ? 'rounded-br-sm bg-bb-red-500 text-white'
                        : 'rounded-bl-sm bg-white text-bb-gray-900'
                    }`}
                  >
                    {!msg.is_mine && (
                      <p className="mb-0.5 text-[10px] font-semibold text-bb-gray-500">
                        {msg.from_name}
                      </p>
                    )}
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={`mt-1 text-[10px] ${
                        msg.is_mine ? 'text-white/70' : 'text-bb-gray-500'
                      }`}
                    >
                      {formatTime(msg.sent_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-bb-gray-300 bg-white p-3">
          <div className="flex gap-2">
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
              placeholder="Digite sua mensagem..."
              className="flex-1 rounded-full border border-bb-gray-300 px-4 py-2 text-sm text-bb-gray-900 placeholder:text-bb-gray-500 outline-none focus:border-bb-red-500"
            />
            <button
              onClick={handleSend}
              disabled={sending || !newMessage.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-bb-red-500 text-white transition-colors hover:bg-bb-red-500/90 disabled:opacity-50"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Conversation List ──────────────────────────────────────
  return (
    <div className="min-h-screen bg-bb-gray-50 pb-24">
      <div className="mx-auto max-w-lg px-4 pt-6">
        <h1 className="text-xl font-bold text-bb-gray-900">Mensagens</h1>
        <p className="text-sm text-bb-gray-500">
          {conversations.filter((c) => c.unread_count > 0).length} nao lidas
        </p>

        <div className="mt-4 space-y-2">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConv(conv.id)}
              className="flex w-full items-center gap-3 rounded-xl bg-white p-4 text-left shadow-sm transition-colors hover:bg-bb-gray-100"
            >
              <div className="relative">
                <Avatar name={conv.participant_name} size="md" src={conv.participant_avatar} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-semibold text-bb-gray-900">
                    {conv.participant_name}
                  </p>
                  <span className="ml-2 shrink-0 text-xs text-bb-gray-500">
                    {conv.last_message_time}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-bb-gray-500">{conv.last_message}</p>
              </div>
              {conv.unread_count > 0 && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bb-red-500 text-[10px] font-bold text-white">
                  {conv.unread_count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

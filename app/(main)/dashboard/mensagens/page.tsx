'use client';

import { useState, useEffect, useRef } from 'react';
import { getConversations, getMessages, sendMessage } from '@/lib/api/mensagens.service';
import type { ConversationDTO, MessageDTO } from '@/lib/api/mensagens.service';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { useStudentId } from '@/lib/hooks/useStudentId';

export default function AlunoMensagensPage() {
  const { studentId, loading: studentLoading } = useStudentId();
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (studentLoading || !studentId) return; getConversations(studentId).then(setConversations).catch(() => {}).finally(() => setLoading(false)); }, [studentId, studentLoading]);
  useEffect(() => {
    if (!selectedConv) return;
    getMessages(selectedConv).then((msgs) => { setMessages(msgs); setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); });
  }, [selectedConv]);

  async function handleSend() {
    if (!newMessage.trim() || !selectedConv) return;
    setSending(true);
    try {
      await sendMessage(selectedConv, newMessage);
      setMessages((prev) => [...prev, { id: `msg-${Date.now()}`, from_id: studentId ?? '', from_name: 'Eu', from_avatar: null, content: newMessage, sent_at: new Date().toISOString(), read_at: null, is_mine: true }]);
      setNewMessage('');
    } finally { setSending(false); }
  }

  const selectedConvData = conversations.find((c) => c.id === selectedConv);

  if (loading) return <div className="space-y-2 p-4">{[1,2,3].map((i) => <Skeleton key={i} variant="card" className="h-16" />)}</div>;

  if (selectedConv) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col">
        <div className="flex items-center gap-3 border-b border-bb-gray-300 bg-white px-4 py-3">
          <button onClick={() => setSelectedConv(null)} className="text-bb-gray-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></button>
          <Avatar name={selectedConvData?.participant_name ?? ''} size="sm" />
          <span className="font-medium text-bb-black">{selectedConvData?.participant_name}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.is_mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${msg.is_mine ? 'bg-bb-red text-white' : 'bg-bb-gray-100 text-bb-black'}`}>
                <p className="text-sm">{msg.content}</p>
                <p className={`mt-1 text-[10px] ${msg.is_mine ? 'text-white/70' : 'text-bb-gray-500'}`}>{new Date(msg.sent_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t border-bb-gray-300 bg-white p-3"><div className="flex gap-2">
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Digite sua mensagem..." className="flex-1 rounded-full border border-bb-gray-300 px-4 py-2 text-sm outline-none focus:border-bb-red" />
          <button onClick={handleSend} disabled={sending || !newMessage.trim()} className="flex h-10 w-10 items-center justify-center rounded-full bg-bb-red text-white disabled:opacity-50"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>
        </div></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold text-bb-black">Mensagens</h1>
      <div className="space-y-2">
        {conversations.map((conv) => (
          <button key={conv.id} onClick={() => setSelectedConv(conv.id)} className="flex w-full items-center gap-3 rounded-lg bg-white p-3 text-left shadow-sm hover:bg-bb-gray-100">
            <Avatar name={conv.participant_name} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between"><p className="font-medium text-bb-black">{conv.participant_name}</p><span className="text-xs text-bb-gray-500">{conv.last_message_time}</span></div>
              <p className="truncate text-sm text-bb-gray-500">{conv.last_message}</p>
            </div>
            {conv.unread_count > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-bb-red text-[10px] text-white">{conv.unread_count}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

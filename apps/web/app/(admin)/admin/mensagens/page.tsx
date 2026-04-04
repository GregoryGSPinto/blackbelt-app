'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Role } from '@/lib/types/domain';
import {
  ConversationList,
  ChatView,
  NewConversationModal,
  BroadcastComposer,
} from '@/components/shared/messaging';
import { getOrCreateConversation } from '@/lib/api/mensagens.service';
import type { Conversation, Contact } from '@/lib/types/messaging';
import { PlanGate } from '@/components/plans/PlanGate';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

export default function AdminMensagensPage() {
  const { profile } = useAuth();
  const profileId = profile?.id ?? '';
  const academyId = getActiveAcademyId();

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [newConvOpen, setNewConvOpen] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [listKey, setListKey] = useState(0);

  const handleSelectConversation = useCallback((conv: Conversation) => {
    setSelectedConversation(conv);
    setMobileView('chat');
  }, []);

  const handleBack = useCallback(() => {
    setMobileView('list');
    setSelectedConversation(null);
  }, []);

  const handleNewConversation = useCallback(() => {
    setNewConvOpen(true);
  }, []);

  const handleSelectContact = useCallback(
    async (contact: Contact) => {
      setNewConvOpen(false);
      try {
        const conv = await getOrCreateConversation(
          profileId,
          contact.profile_id,
          academyId,
        );
        setSelectedConversation(conv);
        setMobileView('chat');
      } catch {
        // Error handled by service
      }
    },
    [profileId, academyId],
  );

  const handleBroadcastSent = useCallback(() => {
    setBroadcastOpen(false);
    setListKey((k) => k + 1);
  }, []);

  return (
    <PlanGate module="mensagens">
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* ── LIST PANEL ────────────────────────────────────── */}
        <div
          className={`flex w-full flex-col md:w-80 lg:w-96 ${
            mobileView === 'chat' ? 'hidden md:flex' : 'flex'
          }`}
          style={{
            borderRight: '1px solid var(--bb-glass-border)',
          }}
        >
          <ConversationList
            key={listKey}
            profileId={profileId}
            role={Role.Admin}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            selectedConversationId={selectedConversation?.id}
            canBroadcast
            onComposeBroadcast={() => setBroadcastOpen(true)}
            className="h-full"
          />
        </div>

        {/* ── CHAT PANEL ────────────────────────────────────── */}
        <div
          className={`flex flex-1 flex-col ${
            mobileView === 'list' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {selectedConversation ? (
            <ChatView
              conversationId={selectedConversation.id}
              currentProfileId={profileId}
              otherParticipant={selectedConversation.other_participant}
              onBack={handleBack}
              className="h-full"
            />
          ) : (
            <EmptyChat />
          )}
        </div>

        {/* ── MODALS ────────────────────────────────────────── */}
        <NewConversationModal
          open={newConvOpen}
          profileId={profileId}
          role={Role.Admin}
          academyId={academyId}
          onSelect={handleSelectContact}
          onClose={() => setNewConvOpen(false)}
        />

        <BroadcastComposer
          open={broadcastOpen}
          academyId={academyId}
          senderId={profileId}
          role={Role.Admin}
          onSent={handleBroadcastSent}
          onClose={() => setBroadcastOpen(false)}
        />
      </div>
    </PlanGate>
  );
}

function EmptyChat() {
  return (
    <div
      className="flex h-full flex-col items-center justify-center"
      style={{ background: 'var(--bb-depth-2)' }}
    >
      <svg
        className="mb-4 h-16 w-16"
        style={{ color: 'var(--bb-ink-40)' }}
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
      <h2
        className="text-lg font-semibold"
        style={{ color: 'var(--bb-ink-60)' }}
      >
        Selecione uma conversa
      </h2>
      <p
        className="mt-1 text-sm"
        style={{ color: 'var(--bb-ink-40)' }}
      >
        Escolha uma conversa na lista ao lado
      </p>
    </div>
  );
}

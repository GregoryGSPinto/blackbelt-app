'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { Role } from '@/lib/types/domain';
import {
  ConversationList,
  ChatView,
  NewConversationModal,
  BroadcastComposer,
} from '@/components/shared/messaging';
import { EmptyState } from '@/components/ui/EmptyState';
import { getOrCreateConversation } from '@/lib/api/mensagens.service';
import type { Conversation, Contact } from '@/lib/types/messaging';
import { PlanGate } from '@/components/plans/PlanGate';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

export default function ProfessorMensagensPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
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
        toast('Erro ao carregar mensagens', 'error');
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
        {/* ── LIST (mobile: full, desktop: sidebar) ─────── */}
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
            role={Role.Professor}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            selectedConversationId={selectedConversation?.id}
            canBroadcast
            onComposeBroadcast={() => setBroadcastOpen(true)}
            className="h-full"
          />
        </div>

        {/* ── CHAT ──────────────────────────────────────── */}
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
            <div
              className="flex h-full flex-col items-center justify-center"
              style={{ background: 'var(--bb-depth-2)' }}
            >
              <EmptyState
                icon="💬"
                title="Selecione uma conversa"
                description="Escolha uma conversa na lista ao lado ou inicie uma nova."
                actionLabel="Nova Conversa"
                onAction={handleNewConversation}
                variant="default"
              />
            </div>
          )}
        </div>

        {/* ── MODALS ────────────────────────────────────── */}
        <NewConversationModal
          open={newConvOpen}
          profileId={profileId}
          role={Role.Professor}
          academyId={academyId}
          onSelect={handleSelectContact}
          onClose={() => setNewConvOpen(false)}
        />

        <BroadcastComposer
          open={broadcastOpen}
          academyId={academyId}
          senderId={profileId}
          role={Role.Professor}
          onSent={handleBroadcastSent}
          onClose={() => setBroadcastOpen(false)}
        />
      </div>
    </PlanGate>
  );
}

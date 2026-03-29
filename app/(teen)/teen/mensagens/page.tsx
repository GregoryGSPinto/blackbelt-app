'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { Role } from '@/lib/types/domain';
import {
  ConversationList,
  ChatView,
  NewConversationModal,
} from '@/components/shared/messaging';
import { EmptyState } from '@/components/ui/EmptyState';
import { getOrCreateConversation } from '@/lib/api/mensagens.service';
import type { Conversation, Contact } from '@/lib/types/messaging';

export default function TeenMensagensPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const profileId = profile?.id ?? 'prof-lucas-001';
  const academyId = 'acad-001';

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [newConvOpen, setNewConvOpen] = useState(false);

  const handleSelectConversation = useCallback((conv: Conversation) => {
    setSelectedConversation(conv);
    setMobileView('chat');
  }, []);

  const handleBack = useCallback(() => {
    setMobileView('list');
    setSelectedConversation(null);
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

  // Mobile: show list or chat
  if (mobileView === 'chat' && selectedConversation) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col md:hidden">
        <ChatView
          conversationId={selectedConversation.id}
          currentProfileId={profileId}
          otherParticipant={selectedConversation.other_participant}
          onBack={handleBack}
          className="h-full"
        />
      </div>
    );
  }

  return (
    <>
      {/* Mobile list */}
      <div className="min-h-screen pb-24 md:hidden">
        <ConversationList
          profileId={profileId}
          role={Role.AlunoTeen}
          onSelectConversation={handleSelectConversation}
          onNewConversation={() => setNewConvOpen(true)}
          selectedConversationId={null}
          canBroadcast={false}
        />
      </div>

      {/* Desktop: side by side */}
      <div className="hidden h-[calc(100vh-4rem)] overflow-hidden md:flex">
        <div
          className="flex w-80 flex-col lg:w-96"
          style={{ borderRight: '1px solid var(--bb-glass-border)' }}
        >
          <ConversationList
            profileId={profileId}
            role={Role.AlunoTeen}
            onSelectConversation={handleSelectConversation}
            onNewConversation={() => setNewConvOpen(true)}
            selectedConversationId={selectedConversation?.id}
            canBroadcast={false}
            className="h-full"
          />
        </div>
        <div className="flex flex-1 flex-col">
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
                title="Fale com seus professores"
                description="Selecione uma conversa ao lado ou inicie uma nova para tirar dúvidas."
                actionLabel="Nova Conversa"
                onAction={() => setNewConvOpen(true)}
                variant="default"
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal — teen only contacts professors */}
      <NewConversationModal
        open={newConvOpen}
        profileId={profileId}
        role={Role.AlunoTeen}
        academyId={academyId}
        onSelect={handleSelectContact}
        onClose={() => setNewConvOpen(false)}
      />
    </>
  );
}

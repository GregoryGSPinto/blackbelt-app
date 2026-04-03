'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Role } from '@/lib/types/domain';
import {
  ConversationList,
  ChatView,
  NewConversationModal,
} from '@/components/shared/messaging';
import { getOrCreateConversation } from '@/lib/api/mensagens.service';
import type { Conversation, Contact } from '@/lib/types/messaging';
import { PlanGate } from '@/components/plans/PlanGate';
import { Skeleton } from '@/components/ui/Skeleton';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

export default function ParentMensagensPage() {
  const { profile } = useAuth();
  const profileId = profile?.id ?? '';
  const academyId = getActiveAcademyId();

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
        // Error handled by service
      }
    },
    [profileId, academyId],
  );

  // Don't render messaging UI until we have a real profile + academy
  if (!profileId || !academyId) {
    return (
      <PlanGate module="mensagens">
        <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
          <Skeleton className="h-4 w-32" />
        </div>
      </PlanGate>
    );
  }

  // Build child context string
  const childContext =
    selectedConversation?.other_participant.children_linked.length
      ? undefined
      : 'Sobre: Sophia (Amarela, BJJ Kids)';

  // Mobile: show list or chat
  if (mobileView === 'chat' && selectedConversation) {
    return (
      <PlanGate module="mensagens">
        <div className="flex h-[calc(100vh-8rem)] flex-col md:hidden">
          <ChatView
            conversationId={selectedConversation.id}
            currentProfileId={profileId}
            otherParticipant={selectedConversation.other_participant}
            onBack={handleBack}
            childContext={childContext}
            className="h-full"
          />
        </div>
      </PlanGate>
    );
  }

  return (
    <PlanGate module="mensagens">
      <>
        {/* Mobile list */}
        <div className="md:hidden">
          <ConversationList
            profileId={profileId}
            role={Role.Responsavel}
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
              role={Role.Responsavel}
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
                childContext={childContext}
                className="h-full"
              />
            ) : (
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
                  Converse com os professores sobre seus filhos
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        <NewConversationModal
          open={newConvOpen}
          profileId={profileId}
          role={Role.Responsavel}
          academyId={academyId}
          onSelect={handleSelectContact}
          onClose={() => setNewConvOpen(false)}
        />
      </>
    </PlanGate>
  );
}

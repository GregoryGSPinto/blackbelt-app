'use client';

import { forwardRef, useState, useEffect, useCallback, type HTMLAttributes } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  getConversations,
  getBroadcasts,
} from '@/lib/api/mensagens.service';
import type { Conversation, BroadcastMessage, Contact } from '@/lib/types/messaging';
import { SearchIcon, PlusIcon, MegaphoneIcon } from '@/components/shell/icons';

// ────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────

const ROLE_BADGE_COLORS: Record<string, string> = {
  Admin: '#ef4444',
  Professor: '#3b82f6',
  Aluno: '#10b981',
  Aluna: '#10b981',
  'Aluno Teen': '#8b5cf6',
  Responsavel: '#f59e0b',
  Recepcao: '#6b7280',
};

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `${diffMin} min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays}d`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

// ────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────

export interface ConversationListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  profileId: string;
  role: string;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation: () => void;
  selectedConversationId?: string | null;
  canBroadcast?: boolean;
  onComposeBroadcast?: () => void;
}

// ────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────

const ConversationList = forwardRef<HTMLDivElement, ConversationListProps>(
  function ConversationList(
    {
      profileId,
      role: _role,
      onSelectConversation,
      onNewConversation,
      selectedConversationId,
      canBroadcast = false,
      onComposeBroadcast,
      className,
      ...props
    },
    ref,
  ) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const loadData = useCallback(async () => {
      try {
        const [convs, bcasts] = await Promise.all([
          getConversations(profileId),
          getBroadcasts(profileId),
        ]);
        setConversations(convs);
        setBroadcasts(bcasts);
      } catch {
        // Error handled by service
      } finally {
        setLoading(false);
      }
    }, [profileId]);

    useEffect(() => {
      loadData();
    }, [loadData]);

    const filteredConversations = conversations.filter((c) =>
      c.other_participant.display_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    );

    const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

    if (loading) {
      return (
        <div ref={ref} className={className} {...props}>
          <div className="space-y-3 p-4">
            <Skeleton variant="text" className="h-10 w-full" />
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="card" className="h-16" />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`flex flex-col ${className ?? ''}`}
        style={{ background: 'var(--bb-depth-2)' }}
        {...props}
      >
        {/* Header */}
        <div
          className="px-4 py-3"
          style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2
                className="text-lg font-bold"
                style={{ color: 'var(--bb-ink-100)' }}
              >
                Mensagens
              </h2>
              {totalUnread > 0 && (
                <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                  {totalUnread} nao lida{totalUnread !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {canBroadcast && onComposeBroadcast && (
                <button
                  onClick={onComposeBroadcast}
                  className="flex h-8 w-8 items-center justify-center transition-colors"
                  style={{
                    borderRadius: 'var(--bb-radius-md)',
                    background: 'var(--bb-depth-4)',
                    color: 'var(--bb-ink-60)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--bb-brand)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--bb-ink-60)';
                  }}
                  aria-label="Enviar comunicado"
                  title="Enviar comunicado"
                >
                  <MegaphoneIcon className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={onNewConversation}
                className="flex h-8 items-center gap-1 px-3 text-sm font-medium text-white transition-colors"
                style={{
                  borderRadius: 'var(--bb-radius-md)',
                  background: 'var(--bb-brand)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Nova
              </button>
            </div>
          </div>

          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 py-2"
            style={{
              background: 'var(--bb-depth-3)',
              borderRadius: 'var(--bb-radius-md)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            <SearchIcon className="h-4 w-4" style={{ color: 'var(--bb-ink-40)' }} />
            <input
              type="text"
              placeholder="Buscar conversa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-60"
              style={{ color: 'var(--bb-ink-100)' }}
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 && !loading && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                {searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
              </p>
            </div>
          )}

          {filteredConversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isSelected={conv.id === selectedConversationId}
              onClick={() => onSelectConversation(conv)}
            />
          ))}

          {/* Broadcasts section */}
          {broadcasts.length > 0 && (
            <>
              <div
                className="px-4 py-2 mt-1"
                style={{ borderTop: '1px solid var(--bb-glass-border)' }}
              >
                <p
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: 'var(--bb-ink-40)' }}
                >
                  Comunicados
                </p>
              </div>
              {broadcasts.map((b) => (
                <BroadcastItem key={b.id} broadcast={b} />
              ))}
            </>
          )}
        </div>
      </div>
    );
  },
);

ConversationList.displayName = 'ConversationList';

// ────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ────────────────────────────────────────────────────────────

function ConversationItem({
  conversation,
  isSelected,
  onClick,
}: {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { other_participant: other } = conversation;
  const badgeColor = ROLE_BADGE_COLORS[other.role_badge] ?? 'var(--bb-ink-40)';

  return (
    <button
      onClick={onClick}
      className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors"
      style={{
        background: isSelected ? 'var(--bb-brand-surface)' : 'transparent',
        borderBottom: '1px solid var(--bb-glass-border)',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.background = 'var(--bb-depth-3)';
      }}
      onMouseLeave={(e) => {
        if (!isSelected)
          e.currentTarget.style.background = 'transparent';
      }}
    >
      <div className="relative shrink-0">
        <Avatar
          name={other.display_name}
          src={other.avatar_url}
          size="md"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="truncate text-sm font-semibold"
              style={{ color: 'var(--bb-ink-100)' }}
            >
              {other.display_name}
            </span>
            <span
              className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold"
              style={{
                background: `${badgeColor}20`,
                color: badgeColor,
              }}
            >
              {other.role_badge}
            </span>
          </div>
          <span
            className="ml-2 shrink-0 text-[11px]"
            style={{ color: 'var(--bb-ink-40)' }}
          >
            {formatRelativeTime(conversation.last_message_at)}
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between">
          <p
            className="truncate text-xs"
            style={{
              color: conversation.unread_count > 0
                ? 'var(--bb-ink-80)'
                : 'var(--bb-ink-40)',
              fontWeight: conversation.unread_count > 0 ? 600 : 400,
            }}
          >
            {conversation.last_message_text ?? 'Nenhuma mensagem ainda'}
          </p>
          {conversation.unread_count > 0 && (
            <span
              className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ background: 'var(--bb-brand)' }}
            >
              {conversation.unread_count}
            </span>
          )}
        </div>
        {other.classes_in_common.length > 0 && (
          <p
            className="mt-0.5 truncate text-[10px]"
            style={{ color: 'var(--bb-ink-40)' }}
          >
            {other.classes_in_common.join(', ')}
          </p>
        )}
      </div>
    </button>
  );
}

function BroadcastItem({ broadcast }: { broadcast: BroadcastMessage }) {
  return (
    <div
      className="flex items-start gap-3 px-4 py-3"
      style={{
        borderBottom: '1px solid var(--bb-glass-border)',
        background: 'var(--bb-brand-surface)',
      }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ background: 'var(--bb-depth-4)' }}
      >
        <MegaphoneIcon className="h-4 w-4" style={{ color: 'var(--bb-brand)' }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            {broadcast.subject ?? 'Comunicado'}
          </span>
          <span
            className="text-[11px]"
            style={{ color: 'var(--bb-ink-40)' }}
          >
            {formatRelativeTime(broadcast.created_at)}
          </span>
        </div>
        <p
          className="mt-0.5 text-xs line-clamp-2"
          style={{ color: 'var(--bb-ink-60)' }}
        >
          {broadcast.text}
        </p>
        <p
          className="mt-0.5 text-[10px]"
          style={{ color: 'var(--bb-ink-40)' }}
        >
          {broadcast.sender_name} &middot; {broadcast.read_count}/{broadcast.total_recipients} leram
        </p>
      </div>
    </div>
  );
}

export { ConversationList };
export type { Contact as ConversationContact };

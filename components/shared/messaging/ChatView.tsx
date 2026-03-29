'use client';

import {
  forwardRef,
  useState,
  useEffect,
  useRef,
  useCallback,
  type HTMLAttributes,
} from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  getMessages,
  sendMessage,
  markAsRead,
} from '@/lib/api/mensagens.service';
import type { ConversationMessage, Contact } from '@/lib/types/messaging';
import { ChevronLeftIcon, SendIcon } from '@/components/shell/icons';
import { ReportButton } from '@/components/shared/ReportButton';
import { BlockUserButton } from '@/components/shared/BlockUserButton';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { filterProfanity } from '@/lib/utils/profanity-filter';

// ────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateGroup(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor(
    (today.getTime() - msgDate.getTime()) / 86400000,
  );

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function shouldShowDateGroup(
  messages: ConversationMessage[],
  index: number,
): boolean {
  if (index === 0) return true;
  const curr = new Date(messages[index].created_at).toDateString();
  const prev = new Date(messages[index - 1].created_at).toDateString();
  return curr !== prev;
}

// ────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────

export interface ChatViewProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  conversationId: string;
  currentProfileId: string;
  otherParticipant: Contact;
  onBack: () => void;
  childContext?: string;
}

// ────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────

const ChatView = forwardRef<HTMLDivElement, ChatViewProps>(
  function ChatView(
    {
      conversationId,
      currentProfileId,
      otherParticipant,
      onBack,
      childContext,
      className,
      ...props
    },
    ref,
  ) {
    const [messages, setMessages] = useState<ConversationMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior });
      }, 50);
    }, []);

    // Load messages
    useEffect(() => {
      let cancelled = false;
      setLoading(true);

      async function load() {
        try {
          const msgs = await getMessages(conversationId);
          if (!cancelled) {
            setMessages(msgs);
            scrollToBottom('auto');
          }
          // Mark as read
          await markAsRead(conversationId, currentProfileId).catch(() => {});
        } catch {
          if (!cancelled) setMessages([]);
        } finally {
          if (!cancelled) setLoading(false);
        }
      }

      load();
      return () => {
        cancelled = true;
      };
    }, [conversationId, currentProfileId, scrollToBottom]);

    async function handleSend() {
      const raw = newMessage.trim();
      if (!raw || sending) return;

      // Profanity filter — replace offensive words before sending
      const { clean: text } = filterProfanity(raw);

      setSending(true);
      try {
        const msg = await sendMessage(
          conversationId,
          currentProfileId,
          text,
        );
        setMessages((prev) => [...prev, msg]);
        setNewMessage('');
        scrollToBottom();
        inputRef.current?.focus();
      } catch {
        // Error handled by service
      } finally {
        setSending(false);
      }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    }

    return (
      <div
        ref={ref}
        className={`flex h-full flex-col ${className ?? ''}`}
        style={{ background: 'var(--bb-depth-2)' }}
        {...props}
      >
        {/* ── HEADER ─────────────────────────────────────────── */}
        <div
          className="flex items-center gap-3 px-4 py-3 shrink-0"
          style={{
            background: 'var(--bb-depth-3)',
            borderBottom: '1px solid var(--bb-glass-border)',
          }}
        >
          <button
            onClick={onBack}
            className="transition-colors md:hidden"
            style={{ color: 'var(--bb-ink-60)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--bb-ink-100)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--bb-ink-60)';
            }}
            aria-label="Voltar"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <Avatar
            name={otherParticipant.display_name}
            src={otherParticipant.avatar_url}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p
              className="text-sm font-semibold"
              style={{ color: 'var(--bb-ink-100)' }}
            >
              {otherParticipant.display_name}
            </p>
            <div className="flex items-center gap-2">
              <span
                className="text-[11px]"
                style={{ color: 'var(--bb-ink-40)' }}
              >
                {otherParticipant.role_badge}
              </span>
              {otherParticipant.classes_in_common.length > 0 && (
                <span
                  className="text-[11px]"
                  style={{ color: 'var(--bb-ink-40)' }}
                >
                  &middot; {otherParticipant.classes_in_common.join(', ')}
                </span>
              )}
            </div>
            {childContext && (
              <p
                className="text-[11px]"
                style={{ color: 'var(--bb-brand)' }}
              >
                {childContext}
              </p>
            )}
          </div>
        </div>

        {/* ── MESSAGES ───────────────────────────────────────── */}
        <div
          className="flex-1 overflow-y-auto px-4 py-3"
          style={{ background: 'var(--bb-depth-2)' }}
        >
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
                >
                  <Skeleton
                    variant="card"
                    className="h-12"
                    style={{ width: `${40 + Math.random() * 30}%` }}
                  />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p
                className="text-sm"
                style={{ color: 'var(--bb-ink-40)' }}
              >
                Nenhuma mensagem ainda. Inicie a conversa!
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((msg, idx) => {
                const isMine = msg.sender_id === currentProfileId;
                const showDate = shouldShowDateGroup(messages, idx);
                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="my-3 flex items-center justify-center">
                        <span
                          className="rounded-full px-3 py-1 text-[11px] font-medium"
                          style={{
                            background: 'var(--bb-depth-4)',
                            color: 'var(--bb-ink-40)',
                          }}
                        >
                          {formatDateGroup(msg.created_at)}
                        </span>
                      </div>
                    )}
                    <div
                      className={`flex items-end gap-2 mb-1 ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMine && (
                        <Avatar
                          name={otherParticipant.display_name}
                          src={otherParticipant.avatar_url}
                          size="sm"
                        />
                      )}
                      <div
                        className="max-w-[75%] px-3 py-2"
                        style={{
                          background: isMine
                            ? 'var(--bb-brand)'
                            : 'var(--bb-depth-3)',
                          color: isMine ? '#ffffff' : 'var(--bb-ink-100)',
                          borderRadius: isMine
                            ? 'var(--bb-radius-lg) var(--bb-radius-lg) 4px var(--bb-radius-lg)'
                            : 'var(--bb-radius-lg) var(--bb-radius-lg) var(--bb-radius-lg) 4px',
                          border: isMine
                            ? 'none'
                            : '1px solid var(--bb-glass-border)',
                        }}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.text}
                        </p>
                        <div
                          className={`mt-1 flex items-center gap-1 ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          <span
                            className="text-[10px]"
                            style={{
                              color: isMine
                                ? 'rgba(255,255,255,0.7)'
                                : 'var(--bb-ink-40)',
                            }}
                          >
                            {formatTime(msg.created_at)}
                          </span>
                          {isMine && (
                            <span
                              className="text-[10px]"
                              style={{
                                color: msg.read_at
                                  ? 'rgba(255,255,255,0.9)'
                                  : 'rgba(255,255,255,0.5)',
                              }}
                            >
                              {msg.read_at ? '\u2713\u2713' : '\u2713'}
                            </span>
                          )}
                          {!isMine && (
                            <>
                              <ReportButton
                                contentType="message"
                                contentId={msg.id}
                                reportedUserId={msg.sender_id}
                                userId={currentProfileId}
                                academyId={getActiveAcademyId()}
                              />
                              <BlockUserButton
                                userId={msg.sender_id}
                                userName={otherParticipant.display_name}
                                size="sm"
                              />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ── INPUT ───────────────────────────────────────────── */}
        <div
          className="shrink-0 px-4 py-3"
          style={{
            background: 'var(--bb-depth-3)',
            borderTop: '1px solid var(--bb-glass-border)',
          }}
        >
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none"
              style={{
                color: 'var(--bb-ink-100)',
                background: 'var(--bb-depth-2)',
                borderRadius: 'var(--bb-radius-lg)',
                border: '1px solid var(--bb-glass-border)',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              className="flex h-10 w-10 shrink-0 items-center justify-center text-white transition-all disabled:opacity-40"
              style={{
                background: 'var(--bb-brand)',
                borderRadius: 'var(--bb-radius-md)',
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              aria-label="Enviar mensagem"
            >
              {sending ? (
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <SendIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  },
);

ChatView.displayName = 'ChatView';

export { ChatView };

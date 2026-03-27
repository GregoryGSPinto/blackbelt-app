'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import {
  listFeedback,
  getFeedbackCount,
  markAsRead,
  replyToFeedback,
  resolveFeedback,
} from '@/lib/api/feedback.service';
import type { UserFeedback, FeedbackType, FeedbackStatus } from '@/lib/api/feedback.service';

// ── Labels ────────────────────────────────────────────────────────

const TYPE_LABEL: Record<FeedbackType, string> = {
  suggestion: 'Sugestao',
  bug: 'Bug',
  praise: 'Elogio',
  complaint: 'Reclamacao',
  other: 'Outro',
};

const TYPE_COLOR: Record<FeedbackType, { color: string; bg: string }> = {
  suggestion: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  bug: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  praise: { color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  complaint: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  other: { color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
};

const STATUS_LABEL: Record<FeedbackStatus, string> = {
  new: 'Novo',
  read: 'Lido',
  replied: 'Respondido',
  resolved: 'Resolvido',
};

const STATUS_COLOR: Record<FeedbackStatus, { color: string; bg: string }> = {
  new: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  read: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  replied: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  resolved: { color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
};

const STATUS_TABS: { value: FeedbackStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'new', label: 'Novos' },
  { value: 'read', label: 'Lidos' },
  { value: 'replied', label: 'Respondidos' },
  { value: 'resolved', label: 'Resolvidos' },
];

// ── Stars ─────────────────────────────────────────────────────────

function RatingStars({ rating }: { rating: number | null }) {
  if (!rating) return <span style={{ color: 'var(--bb-ink-40)' }} className="text-xs">-</span>;
  return (
    <span className="text-sm" style={{ color: 'var(--bb-brand)' }}>
      {Array.from({ length: 5 }, (_, i) => (i < rating ? '\u2605' : '\u2606')).join('')}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────

export default function AdminFeedbacksPage() {
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<FeedbackType | ''>('');
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | ''>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showReplyFor, setShowReplyFor] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Stats
  const [statsTotal, setStatsTotal] = useState(0);
  const [statsNew, setStatsNew] = useState(0);
  const [statsReplied, setStatsReplied] = useState(0);
  const [statsResolved, setStatsResolved] = useState(0);

  const academyId = getActiveAcademyId();

  // ── Load data ──────────────────────────────────────────────────
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, filterStatus]);

  async function loadData() {
    setLoading(true);
    try {
      const filters: { status?: FeedbackStatus; type?: FeedbackType } = {};
      if (filterStatus) filters.status = filterStatus;
      if (filterType) filters.type = filterType;

      const [items, total, newCount, repliedCount, resolvedCount] = await Promise.all([
        listFeedback(academyId, Object.keys(filters).length > 0 ? filters : undefined),
        getFeedbackCount(academyId),
        getFeedbackCount(academyId, 'new'),
        getFeedbackCount(academyId, 'replied'),
        getFeedbackCount(academyId, 'resolved'),
      ]);
      setFeedbacks(items);
      setStatsTotal(total);
      setStatsNew(newCount);
      setStatsReplied(repliedCount);
      setStatsResolved(resolvedCount);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  // ── Actions ────────────────────────────────────────────────────

  async function handleMarkAsRead(fb: UserFeedback) {
    setActionLoading(fb.id);
    try {
      const updated = await markAsRead(fb.id);
      if (updated) {
        setFeedbacks((prev) => prev.map((f) => (f.id === fb.id ? updated : f)));
        setStatsNew((c) => Math.max(0, c - 1));
        toast('Feedback marcado como lido.', 'success');
      } else {
        toast('Erro ao marcar como lido.', 'error');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReply(fb: UserFeedback) {
    if (replyText.trim().length === 0) {
      toast('Digite uma resposta.', 'error');
      return;
    }
    setActionLoading(fb.id);
    try {
      const updated = await replyToFeedback(fb.id, replyText.trim());
      if (updated) {
        setFeedbacks((prev) => prev.map((f) => (f.id === fb.id ? updated : f)));
        setReplyText('');
        setShowReplyFor(null);
        setStatsReplied((c) => c + 1);
        if (fb.status === 'new') setStatsNew((c) => Math.max(0, c - 1));
        toast('Resposta enviada com sucesso.', 'success');
      } else {
        toast('Erro ao enviar resposta.', 'error');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleResolve(fb: UserFeedback) {
    setActionLoading(fb.id);
    try {
      const updated = await resolveFeedback(fb.id);
      if (updated) {
        setFeedbacks((prev) => prev.map((f) => (f.id === fb.id ? updated : f)));
        setStatsResolved((c) => c + 1);
        if (fb.status === 'new') setStatsNew((c) => Math.max(0, c - 1));
        if (fb.status === 'replied') setStatsReplied((c) => Math.max(0, c - 1));
        toast('Feedback resolvido.', 'success');
      } else {
        toast('Erro ao resolver feedback.', 'error');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setActionLoading(null);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // ── Loading skeleton ───────────────────────────────────────────

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-6 sm:px-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="card" className="h-20" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="card" className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6" data-stagger>
      {/* ── Header ──────────────────────────────────────────────── */}
      <section className="animate-reveal mb-6">
        <h1
          className="text-2xl font-extrabold"
          style={{ color: 'var(--bb-ink-100)' }}
        >
          Feedbacks
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Visualize e gerencie os feedbacks enviados pelos usuarios.
        </p>
      </section>

      {/* ── Stats ───────────────────────────────────────────────── */}
      <section className="animate-reveal mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total', value: statsTotal },
          { label: 'Novos', value: statsNew, color: '#3B82F6' },
          { label: 'Respondidos', value: statsReplied, color: '#22c55e' },
          { label: 'Resolvidos', value: statsResolved, color: '#6B7280' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg p-3"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
              {s.label}
            </p>
            <p
              className="mt-1 text-xl font-bold"
              style={{ color: s.color ?? 'var(--bb-ink-100)' }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </section>

      {/* ── Filter Bar ──────────────────────────────────────────── */}
      <section className="animate-reveal mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status tabs */}
        <div
          className="flex gap-1 overflow-x-auto rounded-lg p-1"
          style={{ background: 'var(--bb-depth-2)' }}
        >
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value as FeedbackStatus | '')}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition-all"
              style={{
                background:
                  filterStatus === tab.value ? 'var(--bb-brand)' : 'transparent',
                color: filterStatus === tab.value ? '#fff' : 'var(--bb-ink-60)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Type dropdown */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as FeedbackType | '')}
          className="rounded-lg px-3 py-2 text-sm outline-none"
          style={{
            background: 'var(--bb-depth-2)',
            color: 'var(--bb-ink-100)',
            border: '1px solid var(--bb-glass-border)',
          }}
        >
          <option value="">Todos os tipos</option>
          {Object.entries(TYPE_LABEL).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
      </section>

      {/* ── Empty State ─────────────────────────────────────────── */}
      {feedbacks.length === 0 && (
        <div
          className="animate-reveal flex flex-col items-center justify-center rounded-xl py-16 text-center"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mb-3 h-12 w-12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--bb-ink-20)' }}
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-60)' }}>
            Nenhum feedback encontrado.
          </p>
          <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
            {filterType || filterStatus
              ? 'Tente ajustar os filtros.'
              : 'Os feedbacks dos usuarios aparecerão aqui.'}
          </p>
        </div>
      )}

      {/* ── Feedback List ───────────────────────────────────────── */}
      {feedbacks.length > 0 && (
        <div className="animate-reveal space-y-3">
          {feedbacks.map((fb) => {
            const isExpanded = expandedId === fb.id;
            const typeStyle = TYPE_COLOR[fb.type];
            const statusStyle = STATUS_COLOR[fb.status];
            const isReplyOpen = showReplyFor === fb.id;

            return (
              <div
                key={fb.id}
                className="overflow-hidden rounded-xl transition-all"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                  boxShadow: isExpanded ? 'var(--bb-shadow-lg)' : 'none',
                }}
              >
                {/* Row Summary */}
                <button
                  onClick={() => {
                    setExpandedId(isExpanded ? null : fb.id);
                    setShowReplyFor(null);
                    setReplyText(fb.admin_reply ?? '');
                  }}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors sm:items-center"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bb-depth-3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {/* Date */}
                  <span
                    className="hidden shrink-0 text-xs sm:block"
                    style={{ color: 'var(--bb-ink-40)', minWidth: '120px' }}
                  >
                    {formatDate(fb.created_at)}
                  </span>

                  {/* Type Badge */}
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{ color: typeStyle.color, background: typeStyle.bg }}
                  >
                    {TYPE_LABEL[fb.type]}
                  </span>

                  {/* Rating */}
                  <span className="hidden shrink-0 sm:block">
                    <RatingStars rating={fb.rating} />
                  </span>

                  {/* Message Preview */}
                  <span
                    className="flex-1 truncate text-sm"
                    style={{ color: 'var(--bb-ink-80)' }}
                  >
                    {fb.message}
                  </span>

                  {/* Status Badge */}
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{ color: statusStyle.color, background: statusStyle.bg }}
                  >
                    {STATUS_LABEL[fb.status]}
                  </span>

                  {/* Chevron */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 shrink-0 transition-transform"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      color: 'var(--bb-ink-40)',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div
                    className="px-4 pb-4 pt-1"
                    style={{ borderTop: '1px solid var(--bb-glass-border)' }}
                  >
                    {/* Mobile date + rating */}
                    <div className="mb-3 flex items-center gap-3 sm:hidden">
                      <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                        {formatDate(fb.created_at)}
                      </span>
                      <RatingStars rating={fb.rating} />
                    </div>

                    {/* Full message */}
                    <p
                      className="mb-3 whitespace-pre-wrap text-sm"
                      style={{ color: 'var(--bb-ink-80)' }}
                    >
                      {fb.message}
                    </p>

                    {/* Page URL */}
                    {fb.page_url && (
                      <p className="mb-3 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                        Pagina:{' '}
                        <span style={{ color: 'var(--bb-ink-60)' }}>{fb.page_url}</span>
                      </p>
                    )}

                    {/* Existing reply */}
                    {fb.admin_reply && (
                      <div
                        className="mb-3 rounded-lg p-3"
                        style={{
                          background: 'var(--bb-depth-3)',
                          border: '1px solid var(--bb-glass-border)',
                        }}
                      >
                        <p
                          className="mb-1 text-xs font-semibold"
                          style={{ color: 'var(--bb-ink-60)' }}
                        >
                          Resposta do admin:
                        </p>
                        <p className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                          {fb.admin_reply}
                        </p>
                      </div>
                    )}

                    {/* Reply textarea — appears when "Responder" is clicked */}
                    {isReplyOpen && fb.status !== 'resolved' && (
                      <div className="mb-3">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Escreva uma resposta..."
                          rows={3}
                          className="mb-2 w-full resize-none rounded-lg px-3 py-2 text-sm outline-none"
                          style={{
                            background: 'var(--bb-depth-3)',
                            color: 'var(--bb-ink-100)',
                            border: '1px solid var(--bb-glass-border)',
                          }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReply(fb)}
                            disabled={
                              actionLoading === fb.id || replyText.trim().length === 0
                            }
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
                            style={{ background: 'var(--bb-brand)', color: '#fff' }}
                          >
                            Enviar resposta
                          </button>
                          <button
                            onClick={() => {
                              setShowReplyFor(null);
                              setReplyText(fb.admin_reply ?? '');
                            }}
                            className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                            style={{
                              background: 'var(--bb-depth-3)',
                              color: 'var(--bb-ink-60)',
                              border: '1px solid var(--bb-glass-border)',
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2">
                      {fb.status === 'new' && (
                        <button
                          onClick={() => handleMarkAsRead(fb)}
                          disabled={actionLoading === fb.id}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                          style={{
                            background: 'var(--bb-depth-3)',
                            color: 'var(--bb-ink-80)',
                            border: '1px solid var(--bb-glass-border)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bb-depth-4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--bb-depth-3)';
                          }}
                        >
                          Marcar como lido
                        </button>
                      )}

                      {fb.status !== 'resolved' && !isReplyOpen && (
                        <button
                          onClick={() => {
                            setShowReplyFor(fb.id);
                            setReplyText(fb.admin_reply ?? '');
                          }}
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                          style={{ background: 'var(--bb-brand)', color: '#fff' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.9';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1';
                          }}
                        >
                          Responder
                        </button>
                      )}

                      {fb.status !== 'resolved' && (
                        <button
                          onClick={() => handleResolve(fb)}
                          disabled={actionLoading === fb.id}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                          style={{
                            background: 'rgba(16,185,129,0.1)',
                            color: '#10B981',
                            border: '1px solid rgba(16,185,129,0.2)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(16,185,129,0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(16,185,129,0.1)';
                          }}
                        >
                          Resolver
                        </button>
                      )}

                      {fb.status === 'resolved' && (
                        <span
                          className="flex items-center gap-1.5 text-xs font-medium"
                          style={{ color: '#10B981' }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <path d="m9 11 3 3L22 4" />
                          </svg>
                          Resolvido
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

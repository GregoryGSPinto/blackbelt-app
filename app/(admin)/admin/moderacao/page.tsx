'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Clock,
  Loader2,
  X,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import {
  getReports,
  resolveReport,
  dismissReport,
  hideMessage,
  setReportStatus,
} from '@/lib/api/moderation.service';
import type { ContentReport } from '@/lib/api/moderation.service';

// ── Tab definitions ─────────────────────────────────────────

type TabKey = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'pending', label: 'Pendentes' },
  { key: 'reviewed', label: 'Em revisão' },
  { key: 'resolved', label: 'Resolvidos' },
  { key: 'dismissed', label: 'Dispensados' },
];

// ── Labels ──────────────────────────────────────────────────

const REASON_LABEL: Record<string, string> = {
  spam: 'Spam',
  harassment: 'Assédio ou bullying',
  inappropriate: 'Conteúdo inadequado',
  hate_speech: 'Discurso de ódio',
  violence: 'Violência ou ameaça',
  other: 'Outro motivo',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pendente', color: 'var(--bb-warning)', bg: 'rgba(245,158,11,0.1)' },
  reviewed: { label: 'Em revisão', color: 'var(--bb-brand)', bg: 'rgba(99,102,241,0.1)' },
  resolved: { label: 'Resolvido', color: 'var(--bb-success)', bg: 'rgba(16,185,129,0.1)' },
  dismissed: { label: 'Dispensado', color: 'var(--bb-ink-40)', bg: 'rgba(107,114,128,0.1)' },
};

// ── Component ───────────────────────────────────────────────

export default function ModeracaoPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [resolveModal, setResolveModal] = useState<ContentReport | null>(null);
  const [resolution, setResolution] = useState('');
  const [hideMsg, setHideMsg] = useState(false);
  const { toast } = useToast();

  const loadReports = useCallback(async (tab: TabKey) => {
    setLoading(true);
    try {
      const data = await getReports({ status: tab });
      setReports(data);
    } catch {
      toast('Erro ao carregar denúncias', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadReports(activeTab);
  }, [activeTab, loadReports]);

  function handleTabChange(tab: TabKey) {
    setActiveTab(tab);
  }

  async function handleReview(report: ContentReport) {
    setActionLoading(report.id);
    try {
      await setReportStatus(report.id, 'reviewed');
      toast('Denúncia em revisão', 'success');
      await loadReports(activeTab);
    } catch {
      toast('Erro ao atualizar denúncia', 'error');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDismiss(report: ContentReport) {
    setActionLoading(report.id);
    try {
      await dismissReport(report.id);
      toast('Denúncia dispensada', 'success');
      await loadReports(activeTab);
    } catch {
      toast('Erro ao dispensar denúncia', 'error');
    } finally {
      setActionLoading(null);
    }
  }

  function openResolveModal(report: ContentReport) {
    setResolveModal(report);
    setResolution('');
    setHideMsg(false);
  }

  async function handleResolve() {
    if (!resolveModal) return;
    setActionLoading(resolveModal.id);
    try {
      await resolveReport(resolveModal.id, resolution);
      if (hideMsg && resolveModal.content_id) {
        await hideMessage(resolveModal.content_id);
      }
      toast('Denúncia resolvida', 'success');
      setResolveModal(null);
      await loadReports(activeTab);
    } catch {
      toast('Erro ao resolver denúncia', 'error');
    } finally {
      setActionLoading(null);
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: 'var(--bb-brand-surface)', color: 'var(--bb-brand)' }}
        >
          <Shield size={20} />
        </div>
        <div>
          <h1
            className="text-xl font-bold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Moderação de Conteúdo
          </h1>
          <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
            Gerencie denúncias e conteúdo reportado
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div
        className="flex gap-1 rounded-xl p-1 mb-6 overflow-x-auto"
        style={{ background: 'var(--bb-depth-3)' }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className="flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all"
            style={{
              minHeight: '44px',
              background: activeTab === tab.key ? 'var(--bb-brand)' : 'transparent',
              color: activeTab === tab.key ? '#fff' : 'var(--bb-ink-60)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="card" className="h-28" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-xl"
          style={{ background: 'var(--bb-depth-3)' }}
        >
          <CheckCircle size={48} style={{ color: 'var(--bb-ink-20)' }} />
          <p
            className="mt-4 text-base font-medium"
            style={{ color: 'var(--bb-ink-60)' }}
          >
            Nenhuma denúncia nesta categoria
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--bb-ink-40)' }}>
            As denúncias aparecerão aqui quando forem recebidas
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const status = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.pending;
            const isActioning = actionLoading === report.id;

            return (
              <div
                key={report.id}
                className="rounded-xl p-4"
                style={{
                  background: 'var(--bb-depth-3)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: 'var(--bb-ink-100)' }}
                      >
                        {report.reporter_name || 'Usuário anônimo'}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                        reportou
                      </span>
                      <span
                        className="text-sm font-medium"
                        style={{ color: 'var(--bb-ink-80)' }}
                      >
                        {report.reported_user_name || 'Usuário desconhecido'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{ background: status.bg, color: status.color }}
                      >
                        {status.label}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                        style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}
                      >
                        {report.content_type === 'message' ? 'Mensagem' : report.content_type}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                        style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}
                      >
                        {REASON_LABEL[report.reason] ?? report.reason}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Clock size={12} style={{ color: 'var(--bb-ink-30)' }} />
                    <span className="text-xs" style={{ color: 'var(--bb-ink-30)' }}>
                      {formatDate(report.created_at)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {report.description && (
                  <div
                    className="rounded-lg px-3 py-2 mb-3 text-sm"
                    style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}
                  >
                    {report.description}
                  </div>
                )}

                {/* Actions */}
                {(report.status === 'pending' || report.status === 'reviewed') && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {report.status === 'pending' && (
                      <button
                        onClick={() => handleReview(report)}
                        disabled={isActioning}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-opacity disabled:opacity-50"
                        style={{
                          background: 'var(--bb-brand-surface)',
                          color: 'var(--bb-brand)',
                          minHeight: '44px',
                        }}
                      >
                        {isActioning ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                        Revisar
                      </button>
                    )}
                    <button
                      onClick={() => openResolveModal(report)}
                      disabled={isActioning}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-opacity disabled:opacity-50"
                      style={{
                        background: 'rgba(16,185,129,0.1)',
                        color: 'var(--bb-success)',
                        minHeight: '44px',
                      }}
                    >
                      <CheckCircle size={14} />
                      Resolver
                    </button>
                    <button
                      onClick={() => handleDismiss(report)}
                      disabled={isActioning}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-opacity disabled:opacity-50"
                      style={{
                        background: 'var(--bb-depth-4)',
                        color: 'var(--bb-ink-40)',
                        minHeight: '44px',
                      }}
                    >
                      {isActioning ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                      Dispensar
                    </button>
                  </div>
                )}

                {/* Resolved info */}
                {report.resolved_at && (
                  <p className="text-xs mt-2" style={{ color: 'var(--bb-ink-30)' }}>
                    {report.status === 'resolved' ? 'Resolvido' : 'Dispensado'} em{' '}
                    {formatDate(report.resolved_at)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setResolveModal(null);
          }}
        >
          <div
            className="w-full max-w-md rounded-xl p-6 relative"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Resolver denúncia"
          >
            <button
              onClick={() => setResolveModal(null)}
              className="absolute top-4 right-4"
              style={{ color: 'var(--bb-ink-60)' }}
            >
              <X size={18} />
            </button>

            <h3
              className="text-lg font-bold mb-4"
              style={{ color: 'var(--bb-ink-100)' }}
            >
              Resolver denúncia
            </h3>

            <div className="space-y-4">
              <div>
                <label
                  className="text-xs font-medium block mb-1"
                  style={{ color: 'var(--bb-ink-80)' }}
                >
                  Resolução
                </label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                  style={{
                    background: 'var(--bb-depth-3)',
                    border: '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
                    color: 'var(--bb-ink-100)',
                  }}
                  placeholder="Descreva a ação tomada..."
                />
              </div>

              {resolveModal.content_type === 'message' && resolveModal.content_id && (
                <label
                  className="flex items-center gap-2 cursor-pointer"
                  style={{ minHeight: '44px' }}
                >
                  <input
                    type="checkbox"
                    checked={hideMsg}
                    onChange={(e) => setHideMsg(e.target.checked)}
                    className="h-4 w-4 rounded"
                    style={{ accentColor: 'var(--bb-brand)' }}
                  />
                  <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                    <EyeOff size={14} />
                    Ocultar a mensagem reportada
                  </span>
                </label>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setResolveModal(null)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium"
                  style={{
                    background: 'var(--bb-depth-3)',
                    color: 'var(--bb-ink-80)',
                    minHeight: '44px',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleResolve}
                  disabled={actionLoading === resolveModal.id}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50"
                  style={{
                    background: 'var(--bb-success)',
                    color: '#fff',
                    minHeight: '44px',
                  }}
                >
                  {actionLoading === resolveModal.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  Resolver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  User,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { listClearances, reviewClearance } from '@/lib/api/health-declaration.service';
import type { MedicalClearance, ClearanceStatus, ClearanceType } from '@/lib/api/health-declaration.service';

// ── Labels & Colors ───────────────────────────────────────────────

const STATUS_LABEL: Record<ClearanceStatus, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  denied: 'Negado',
  expired: 'Expirado',
};

const STATUS_COLOR: Record<ClearanceStatus, { color: string; bg: string }> = {
  pending: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  approved: { color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
  denied: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  expired: { color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
};

const STATUS_ICON: Record<ClearanceStatus, typeof Clock> = {
  pending: Clock,
  approved: CheckCircle2,
  denied: XCircle,
  expired: AlertTriangle,
};

const CLEARANCE_TYPE_LABEL: Record<ClearanceType, string> = {
  general: 'Geral',
  post_injury: 'Pos-lesao',
  post_surgery: 'Pos-cirurgia',
  annual: 'Anual',
  competition: 'Competicao',
  parq_follow_up: 'PAR-Q Follow-up',
};

type TabKey = 'pending' | 'approved' | 'denied' | 'expired';

const TABS: { key: TabKey; label: string; status: ClearanceStatus }[] = [
  { key: 'pending', label: 'Pendentes', status: 'pending' },
  { key: 'approved', label: 'Aprovados', status: 'approved' },
  { key: 'denied', label: 'Negados', status: 'denied' },
  { key: 'expired', label: 'Expirados', status: 'expired' },
];

// ── Skeleton ──────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <Skeleton variant="text" className="h-6 w-6" />
        <Skeleton variant="text" className="h-8 w-48" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="text" className="h-10 w-24" />
        ))}
      </div>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} variant="card" className="h-40" />
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────

export default function AtestadosPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [clearances, setClearances] = useState<MedicalClearance[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      try {
        const academyId = getActiveAcademyId();
        const data = await listClearances(academyId);
        setClearances(data);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ─────────────────────────────────────────────────────

  async function handleReview(clearance: MedicalClearance, decision: 'approved' | 'denied') {
    setReviewingId(clearance.id);
    try {
      const notes = reviewNotes[clearance.id] || undefined;
      const updated = await reviewClearance(clearance.id, decision, 'admin', notes);
      if (updated) {
        setClearances((prev) => prev.map((c) => (c.id === clearance.id ? updated : c)));
        toast(decision === 'approved' ? 'Atestado aprovado' : 'Atestado negado', 'success');
        setReviewNotes((prev) => {
          const next = { ...prev };
          delete next[clearance.id];
          return next;
        });
      } else {
        toast('Erro ao processar atestado', 'error');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setReviewingId(null);
    }
  }

  // ── Filter by tab ───────────────────────────────────────────────

  const currentTab = TABS.find((t) => t.key === activeTab)!;
  const filtered = clearances.filter((c) => c.status === currentTab.status);

  // Count per tab
  const counts: Record<TabKey, number> = {
    pending: clearances.filter((c) => c.status === 'pending').length,
    approved: clearances.filter((c) => c.status === 'approved').length,
    denied: clearances.filter((c) => c.status === 'denied').length,
    expired: clearances.filter((c) => c.status === 'expired').length,
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/saude" className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors" style={{ background: 'var(--bb-depth-3)' }}>
          <ArrowLeft size={16} style={{ color: 'var(--bb-ink-60)' }} />
        </Link>
        <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Atestados Medicos</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex flex-shrink-0 items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all duration-200"
            style={{
              borderRadius: 'var(--bb-radius-md)',
              background: activeTab === tab.key ? 'var(--bb-brand)' : 'transparent',
              color: activeTab === tab.key ? '#fff' : 'var(--bb-ink-60)',
              border: activeTab === tab.key ? '1px solid var(--bb-brand)' : '1px solid transparent',
            }}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                style={{
                  background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : 'var(--bb-depth-3)',
                  color: activeTab === tab.key ? '#fff' : 'var(--bb-ink-60)',
                }}
              >
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Clearance Cards */}
      <div className="space-y-3">
        {filtered.map((clearance) => {
          const StatusIcon = STATUS_ICON[clearance.status];
          const isReviewing = reviewingId === clearance.id;

          return (
            <Card
              key={clearance.id}
              className="p-4"
              style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{ background: STATUS_COLOR[clearance.status].bg }}
                  >
                    <StatusIcon size={18} style={{ color: STATUS_COLOR[clearance.status].color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <User size={14} style={{ color: 'var(--bb-ink-40)' }} />
                      <span className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                        {clearance.profile_id.slice(0, 8)}...
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                      {CLEARANCE_TYPE_LABEL[clearance.clearance_type]}
                    </p>
                  </div>
                </div>

                <span
                  className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                  style={{
                    color: STATUS_COLOR[clearance.status].color,
                    background: STATUS_COLOR[clearance.status].bg,
                  }}
                >
                  {STATUS_LABEL[clearance.status]}
                </span>
              </div>

              {/* Details */}
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {clearance.doctor_name && (
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Medico</p>
                    <p className="mt-0.5 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                      {clearance.doctor_name}
                      {clearance.doctor_crm ? ` (CRM: ${clearance.doctor_crm})` : ''}
                    </p>
                  </div>
                )}
                {clearance.doctor_specialty && (
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Especialidade</p>
                    <p className="mt-0.5 text-sm" style={{ color: 'var(--bb-ink-80)' }}>{clearance.doctor_specialty}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Validade</p>
                  <p className="mt-0.5 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                    {clearance.valid_from ? new Date(clearance.valid_from).toLocaleDateString('pt-BR') : '—'}
                    {' ate '}
                    {clearance.valid_until ? new Date(clearance.valid_until).toLocaleDateString('pt-BR') : 'Indeterminado'}
                  </p>
                </div>
                {clearance.document_url && (
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Documento</p>
                    <a
                      href={clearance.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 inline-flex items-center gap-1 text-sm font-medium"
                      style={{ color: 'var(--bb-brand)' }}
                    >
                      Ver documento <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>

              {/* Notes */}
              {clearance.notes && (
                <div className="mt-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Observacoes</p>
                  <p className="mt-0.5 text-sm" style={{ color: 'var(--bb-ink-60)' }}>{clearance.notes}</p>
                </div>
              )}

              {/* Review actions (pending only) */}
              {clearance.status === 'pending' && (
                <div className="mt-4 space-y-3" style={{ borderTop: '1px solid var(--bb-glass-border)', paddingTop: '12px' }}>
                  <textarea
                    placeholder="Observacoes sobre a revisao (opcional)..."
                    value={reviewNotes[clearance.id] || ''}
                    onChange={(e) => setReviewNotes((prev) => ({ ...prev, [clearance.id]: e.target.value }))}
                    rows={2}
                    className="w-full resize-none rounded-lg px-3 py-2 text-sm"
                    style={{
                      background: 'var(--bb-depth-3)',
                      border: '1px solid var(--bb-glass-border)',
                      color: 'var(--bb-ink-100)',
                      borderRadius: 'var(--bb-radius-md)',
                    }}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={isReviewing}
                      loading={isReviewing}
                      onClick={() => handleReview(clearance, 'approved')}
                    >
                      <CheckCircle2 size={14} className="mr-1" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={isReviewing}
                      loading={isReviewing}
                      onClick={() => handleReview(clearance, 'denied')}
                    >
                      <XCircle size={14} className="mr-1" />
                      Negar
                    </Button>
                  </div>
                </div>
              )}

              {/* Reviewed info */}
              {clearance.reviewed_at && (
                <div className="mt-3 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  Revisado em {new Date(clearance.reviewed_at).toLocaleDateString('pt-BR')}
                </div>
              )}
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <FileCheck size={40} className="mx-auto mb-3" style={{ color: 'var(--bb-ink-20)' }} />
            <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
              Nenhum atestado {STATUS_LABEL[currentTab.status].toLowerCase()} encontrado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

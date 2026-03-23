'use client';

import { useState, useEffect } from 'react';
import {
  getAutorizacoes,
  respondAutorizacao,
  getControleParental,
  updatePermission,
} from '@/lib/api/responsavel-autorizacoes.service';
import type {
  Autorizacao,
  ControleParental,
} from '@/lib/api/responsavel-autorizacoes.service';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  ShieldIcon,
  CheckIcon,
  XIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@/components/shell/icons';

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<Autorizacao['type'], { label: string; emoji: string }> = {
  evento: { label: 'Evento', emoji: '\uD83C\uDFC6' },
  viagem: { label: 'Viagem', emoji: '\u2708\uFE0F' },
  foto: { label: 'Uso de Imagem', emoji: '\uD83D\uDCF8' },
  saida_sozinho: { label: 'Saida', emoji: '\uD83D\uDEB6' },
  contato_emergencia: { label: 'Emergencia', emoji: '\uD83D\uDCDE' },
};

const STATUS_STYLES: Record<
  Autorizacao['status'],
  { label: string; bg: string; text: string }
> = {
  pendente: {
    label: 'Pendente',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
  },
  autorizado: {
    label: 'Autorizado',
    bg: 'bg-green-50',
    text: 'text-green-700',
  },
  negado: {
    label: 'Negado',
    bg: 'bg-red-50',
    text: 'text-red-700',
  },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'Agora';
  if (diffHours < 24) return `${diffHours}h atras`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Ontem';
  return `${diffDays} dias atras`;
}

// ────────────────────────────────────────────────────────────
// Skeleton
// ────────────────────────────────────────────────────────────

function AutorizacoesSkeleton() {
  return (
    <div className="p-4 lg:p-6">
      <div className="space-y-4">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton variant="text" className="h-10 w-40" />
          <Skeleton variant="text" className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton variant="card" className="h-40" />
          <Skeleton variant="card" className="h-40" />
          <Skeleton variant="card" className="h-40" />
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Toggle Switch
// ────────────────────────────────────────────────────────────

function ToggleSwitch({
  enabled,
  onToggle,
  disabled,
}: {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        enabled ? 'bg-[var(--bb-brand)]' : 'bg-[var(--bb-ink-20)]'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// ────────────────────────────────────────────────────────────
// Authorization Card
// ────────────────────────────────────────────────────────────

function AutorizacaoCard({
  auth,
  onRespond,
  responding,
}: {
  auth: Autorizacao;
  onRespond: (id: string, status: 'autorizado' | 'negado') => void;
  responding: string | null;
}) {
  const typeInfo = TYPE_LABELS[auth.type];
  const statusInfo = STATUS_STYLES[auth.status];
  const isResponding = responding === auth.id;

  return (
    <Card className="overflow-hidden p-0">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 pb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--bb-depth-4)] text-lg">
          {typeInfo.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-bold text-[var(--bb-ink-100)]">
              {auth.title}
            </h3>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-full bg-[var(--bb-depth-4)] px-2 py-0.5 text-[10px] font-semibold text-[var(--bb-ink-60)]">
              {auth.student_name}
            </span>
            <span className="rounded-full bg-[var(--bb-depth-4)] px-2 py-0.5 text-[10px] font-semibold text-[var(--bb-ink-40)]">
              {typeInfo.label}
            </span>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusInfo.bg} ${statusInfo.text}`}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Description */}
      <div className="px-4 pb-3">
        <p className="text-xs leading-relaxed text-[var(--bb-ink-60)]">
          {auth.description}
        </p>
        <p className="mt-2 text-[10px] text-[var(--bb-ink-40)]">
          Solicitado {timeAgo(auth.requested_at)}
        </p>
      </div>

      {/* Action Buttons (only for pending) */}
      {auth.status === 'pendente' && (
        <div className="flex border-t border-[var(--bb-glass-border)]">
          <button
            onClick={() => onRespond(auth.id, 'negado')}
            disabled={isResponding}
            className="flex flex-1 items-center justify-center gap-2 py-3 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            <XIcon className="h-3.5 w-3.5" />
            Negar
          </button>
          <div className="w-px bg-[var(--bb-glass-border)]" />
          <button
            onClick={() => onRespond(auth.id, 'autorizado')}
            disabled={isResponding}
            className="flex flex-1 items-center justify-center gap-2 py-3 text-xs font-bold text-green-600 transition-colors hover:bg-green-50 disabled:opacity-50"
          >
            <CheckIcon className="h-3.5 w-3.5" />
            Autorizar
          </button>
        </div>
      )}

      {/* Responded info */}
      {auth.status !== 'pendente' && auth.responded_at && (
        <div className="border-t border-[var(--bb-glass-border)] px-4 py-2">
          <p className="text-[10px] text-[var(--bb-ink-40)]">
            Respondido em {formatDate(auth.responded_at)}
          </p>
        </div>
      )}
    </Card>
  );
}

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────

type TabKey = 'autorizacoes' | 'controle';

export default function AutorizacoesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('autorizacoes');
  const [autorizacoes, setAutorizacoes] = useState<Autorizacao[]>([]);
  const [controles, setControles] = useState<ControleParental[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState('stu-sophia');

  useEffect(() => {
    async function load() {
      try {
        const [auths, ctrlSophia, ctrlMiguel] = await Promise.all([
          getAutorizacoes('prof-guardian-1'),
          getControleParental('stu-sophia'),
          getControleParental('stu-miguel'),
        ]);
        setAutorizacoes(auths);
        setControles([ctrlSophia, ctrlMiguel]);
      } catch {
        // Error handled by service
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleRespond(id: string, status: 'autorizado' | 'negado') {
    setResponding(id);
    try {
      const updated = await respondAutorizacao(id, status);
      setAutorizacoes((prev) =>
        prev.map((a) => (a.id === id ? updated : a)),
      );
    } catch {
      // Error handled by service
    } finally {
      setResponding(null);
    }
  }

  async function handleTogglePermission(studentId: string, key: string, currentEnabled: boolean) {
    const compositeKey = `${studentId}-${key}`;
    setTogglingKey(compositeKey);
    try {
      await updatePermission(studentId, key, !currentEnabled);
      setControles((prev) =>
        prev.map((ctrl) => {
          if (ctrl.student_id !== studentId) return ctrl;
          return {
            ...ctrl,
            permissions: ctrl.permissions.map((p) =>
              p.key === key ? { ...p, enabled: !currentEnabled } : p,
            ),
          };
        }),
      );
    } catch {
      // Error handled by service
    } finally {
      setTogglingKey(null);
    }
  }

  if (loading) return <AutorizacoesSkeleton />;

  const pendentes = autorizacoes.filter((a) => a.status === 'pendente');
  const respondidas = autorizacoes.filter((a) => a.status !== 'pendente');
  const selectedControle = controles.find((c) => c.student_id === selectedChildId);

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    {
      key: 'autorizacoes',
      label: 'Autorizacoes',
      count: pendentes.length,
    },
    { key: 'controle', label: 'Controle Parental' },
  ];

  return (
    <div className="p-4 lg:p-6">
      <div>
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bb-brand-surface)]">
            <ShieldIcon className="h-5 w-5 text-[var(--bb-brand)]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[var(--bb-ink-100)]">
              Autorizacoes
            </h1>
            <p className="text-sm text-[var(--bb-ink-60)]">
              Gerencie permissoes dos seus filhos
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-[var(--bb-brand)] text-white shadow-md'
                  : 'bg-[var(--bb-depth-3)] text-[var(--bb-ink-60)] ring-1 ring-[var(--bb-glass-border)]'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    activeTab === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── Autorizacoes Tab ─── */}
        {activeTab === 'autorizacoes' && (
          <div className="mt-4 space-y-6">
            {/* Pending */}
            {pendentes.length > 0 && (
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-amber-500" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--bb-ink-40)]">
                    Pendentes ({pendentes.length})
                  </h2>
                </div>
                <div className="space-y-3">
                  {pendentes.map((auth) => (
                    <AutorizacaoCard
                      key={auth.id}
                      auth={auth}
                      onRespond={handleRespond}
                      responding={responding}
                    />
                  ))}
                </div>
              </section>
            )}

            {pendentes.length === 0 && (
              <Card className="p-6 text-center">
                <CheckCircleIcon className="mx-auto h-10 w-10 text-green-400" />
                <p className="mt-2 text-sm font-bold text-[var(--bb-ink-100)]">
                  Tudo em dia!
                </p>
                <p className="mt-1 text-xs text-[var(--bb-ink-60)]">
                  Nao ha autorizacoes pendentes no momento.
                </p>
              </Card>
            )}

            {/* Responded */}
            {respondidas.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--bb-ink-40)]">
                  Historico
                </h2>
                <div className="space-y-3">
                  {respondidas.map((auth) => (
                    <AutorizacaoCard
                      key={auth.id}
                      auth={auth}
                      onRespond={handleRespond}
                      responding={responding}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ─── Controle Parental Tab ─── */}
        {activeTab === 'controle' && (
          <div className="mt-4 space-y-4">
            {/* Child Selector */}
            {controles.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {controles.map((ctrl) => (
                  <button
                    key={ctrl.student_id}
                    onClick={() => setSelectedChildId(ctrl.student_id)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                      selectedChildId === ctrl.student_id
                        ? 'bg-[var(--bb-brand)] text-white shadow-md'
                        : 'bg-[var(--bb-depth-3)] text-[var(--bb-ink-60)] ring-1 ring-[var(--bb-glass-border)]'
                    }`}
                  >
                    {ctrl.student_name}
                  </button>
                ))}
              </div>
            )}

            {/* Permissions */}
            {selectedControle && (
              <Card className="divide-y divide-[var(--bb-glass-border)] p-0">
                {selectedControle.permissions.map((perm) => {
                  const compositeKey = `${selectedControle.student_id}-${perm.key}`;
                  const isToggling = togglingKey === compositeKey;

                  return (
                    <div key={perm.key} className="flex items-start gap-3 p-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[var(--bb-ink-100)]">
                          {perm.label}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-[var(--bb-ink-60)]">
                          {perm.description}
                        </p>
                      </div>
                      <ToggleSwitch
                        enabled={perm.enabled}
                        disabled={isToggling}
                        onToggle={() =>
                          handleTogglePermission(
                            selectedControle.student_id,
                            perm.key,
                            perm.enabled,
                          )
                        }
                      />
                    </div>
                  );
                })}
              </Card>
            )}

            {!selectedControle && (
              <Card className="p-6 text-center">
                <p className="text-sm text-[var(--bb-ink-60)]">
                  Selecione um filho para gerenciar permissoes.
                </p>
              </Card>
            )}
          </div>
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}

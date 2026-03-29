'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Server,
  Database,
  GitBranch,
  Video,
  ExternalLink,
  Plus,
  Rocket,
  AlertTriangle,
  Bug,
  Search,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Package,
  Key,
  X,
  Clock,
  FileCode,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  getDeployLog,
  createDeployEntry,
  getErrorLog,
  createError,
  updateErrorStatus,
  getTableRowCounts,
} from '@/lib/api/cockpit.service';
import type { DeployLogItem, ErrorLogItem } from '@/lib/api/cockpit.service';
import { SectionHeader } from '@/components/cockpit/SectionHeader';
import { StatusBadge } from '@/components/cockpit/StatusBadge';
import { EmptyState } from '@/components/cockpit/EmptyState';
import { ConfirmDialog } from '@/components/cockpit/ConfirmDialog';
import { CockpitSkeleton } from '@/components/cockpit/CockpitSkeleton';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeDate(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin}min atrás`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h atrás`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return 'ontem';
  if (diffD < 7) return `${diffD}d atrás`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function truncate(str: string | null, len: number): string {
  if (!str) return '—';
  return str.length > len ? str.slice(0, len) + '...' : str;
}

type ErrorStatusFilter = 'todos' | 'novo' | 'investigando' | 'resolvido' | 'wont_fix';
type SeverityFilter = 'todos' | 'critical' | 'high' | 'medium' | 'low';

const ERROR_STATUS_LABELS: Record<ErrorStatusFilter, string> = {
  todos: 'Todos',
  novo: 'Novo',
  investigando: 'Investigando',
  resolvido: 'Resolvido',
  wont_fix: "Won't Fix",
};

const SEVERITY_LABELS: Record<SeverityFilter, string> = {
  todos: 'Todos',
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

function severityVariant(s: string): 'danger' | 'warning' | 'info' | 'neutral' {
  switch (s) {
    case 'critical': return 'danger';
    case 'high': return 'warning';
    case 'medium': return 'info';
    default: return 'neutral';
  }
}

function errorStatusVariant(s: string): 'danger' | 'warning' | 'success' | 'neutral' | 'info' {
  switch (s) {
    case 'novo': return 'danger';
    case 'investigando': return 'warning';
    case 'resolvido': return 'success';
    case 'wont_fix': return 'neutral';
    default: return 'info';
  }
}

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

interface InfraService {
  name: string;
  icon: React.ReactNode;
  status: string;
  variant: 'success' | 'warning' | 'danger';
  detail: string;
  tier: string;
  url: string;
}

const INFRA_SERVICES: InfraService[] = [
  {
    name: 'Vercel',
    icon: <Rocket className="h-5 w-5" />,
    status: 'Online',
    variant: 'success',
    detail: 'blackbeltv2.vercel.app',
    tier: 'Hobby Tier',
    url: 'https://vercel.com/dashboard',
  },
  {
    name: 'Supabase',
    icon: <Database className="h-5 w-5" />,
    status: 'Online',
    variant: 'success',
    detail: 'tdplmmodmumryzdosmpv',
    tier: 'Free Tier',
    url: 'https://supabase.com/dashboard',
  },
  {
    name: 'GitHub',
    icon: <GitBranch className="h-5 w-5" />,
    status: 'Online',
    variant: 'success',
    detail: 'GregoryGSPinto/blackbelt-v2',
    tier: 'branch: main',
    url: 'https://github.com/GregoryGSPinto/blackbelt-v2',
  },
  {
    name: 'Bunny Stream',
    icon: <Video className="h-5 w-5" />,
    status: 'Online',
    variant: 'success',
    detail: 'Library ID: 626933',
    tier: 'CDN Host',
    url: 'https://dash.bunny.net',
  },
];

interface StackDep {
  name: string;
  version: string;
}

const STACK_DEPS: StackDep[] = [
  { name: 'Next.js', version: '14.2.x' },
  { name: 'React', version: '18.3.x' },
  { name: 'TypeScript', version: '5.9.x' },
  { name: '@supabase/ssr', version: '0.9.x' },
  { name: 'Capacitor', version: '8.x' },
  { name: 'Tailwind CSS', version: '3.4.x' },
  { name: 'Recharts', version: '3.8.x' },
  { name: 'Lucide React', version: '0.577.x' },
];

interface SecurityItem {
  label: string;
  ok: boolean;
}

const SECURITY_CHECKLIST: SecurityItem[] = [
  { label: 'RLS ativo em todas as tabelas', ok: true },
  { label: 'Auth check em API routes', ok: true },
  { label: 'Headers de segurança', ok: true },
  { label: 'Rate limiting em routes críticas', ok: true },
  { label: 'Sentry não configurado', ok: false },
  { label: 'Chaves não rotacionadas desde setup', ok: false },
];

interface EnvVar {
  name: string;
  status: 'vercel' | 'local' | 'missing';
}

const ENV_VARS: EnvVar[] = [
  { name: 'NEXT_PUBLIC_SUPABASE_URL', status: 'vercel' },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', status: 'vercel' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', status: 'vercel' },
  { name: 'BUNNY_API_KEY', status: 'vercel' },
  { name: 'BUNNY_LIBRARY_ID', status: 'vercel' },
  { name: 'BUNNY_CDN_HOST', status: 'vercel' },
  { name: 'RESEND_API_KEY', status: 'vercel' },
  { name: 'NEXT_PUBLIC_POSTHOG_KEY', status: 'vercel' },
  { name: 'SENTRY_DSN', status: 'missing' },
  { name: 'SENTRY_AUTH_TOKEN', status: 'missing' },
  { name: 'NEXT_PUBLIC_MOCK', status: 'local' },
];

function envStatusIcon(status: EnvVar['status']): string {
  switch (status) {
    case 'vercel': return '\u{1F7E2}';  // green circle
    case 'local': return '\u{1F7E1}';   // yellow circle
    case 'missing': return '\u{1F534}'; // red circle
  }
}

function envStatusLabel(status: EnvVar['status']): string {
  switch (status) {
    case 'vercel': return 'No Vercel';
    case 'local': return 'Só local';
    case 'missing': return 'Não configurada';
  }
}

// ---------------------------------------------------------------------------
// Deploy form defaults
// ---------------------------------------------------------------------------

interface DeployForm {
  commit_sha: string;
  commit_message: string;
  branch: string;
  tag: string;
  status: string;
  duration_seconds: string;
  files_changed: string;
  lines_added: string;
  lines_removed: string;
}

const EMPTY_DEPLOY_FORM: DeployForm = {
  commit_sha: '',
  commit_message: '',
  branch: 'main',
  tag: '',
  status: 'success',
  duration_seconds: '',
  files_changed: '',
  lines_added: '',
  lines_removed: '',
};

interface ErrorForm {
  error_type: string;
  severity: string;
  message: string;
  affected_route: string;
  stack_trace: string;
}

const EMPTY_ERROR_FORM: ErrorForm = {
  error_type: 'runtime',
  severity: 'medium',
  message: '',
  affected_route: '',
  stack_trace: '',
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function CtoPage() {
  const { toast } = useToast();

  // --- Data state ---
  const [loading, setLoading] = useState(true);
  const [deploys, setDeploys] = useState<DeployLogItem[]>([]);
  const [errors, setErrors] = useState<ErrorLogItem[]>([]);
  const [tableCounts, setTableCounts] = useState<Array<{ table_name: string; row_count: number }>>([]);

  // --- UI state ---
  const [statusFilter, setStatusFilter] = useState<ErrorStatusFilter>('todos');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('todos');
  const [showDeployForm, setShowDeployForm] = useState(false);
  const [showErrorForm, setShowErrorForm] = useState(false);
  const [deployForm, setDeployForm] = useState<DeployForm>(EMPTY_DEPLOY_FORM);
  const [errorForm, setErrorForm] = useState<ErrorForm>(EMPTY_ERROR_FORM);
  const [savingDeploy, setSavingDeploy] = useState(false);
  const [savingError, setSavingError] = useState(false);
  const [resolveTarget, setResolveTarget] = useState<ErrorLogItem | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [wontFixTarget, setWontFixTarget] = useState<ErrorLogItem | null>(null);
  const [showDbSection, setShowDbSection] = useState(true);
  const [showEnvSection, setShowEnvSection] = useState(true);

  // --- Data fetching ---
  const fetchDeploys = useCallback(async () => {
    try {
      const data = await getDeployLog('blackbelt', 20);
      setDeploys(data);
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }, [toast]);

  const fetchErrors = useCallback(async (statusParam?: string) => {
    try {
      const s = statusParam === 'todos' ? undefined : statusParam;
      const data = await getErrorLog('blackbelt', s);
      setErrors(data);
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }, [toast]);

  const fetchTables = useCallback(async () => {
    try {
      const data = await getTableRowCounts();
      setTableCounts(data.sort((a, b) => b.row_count - a.row_count).slice(0, 20));
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }, [toast]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await Promise.all([fetchDeploys(), fetchErrors(statusFilter), fetchTables()]);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch errors when status filter changes
  useEffect(() => {
    if (!loading) {
      fetchErrors(statusFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Filter errors by severity client-side
  const filteredErrors = severityFilter === 'todos'
    ? errors
    : errors.filter((e) => e.severity === severityFilter);

  // --- Deploy form handlers ---
  async function handleSaveDeploy() {
    if (!deployForm.commit_message.trim()) {
      toast('Mensagem do commit é obrigatória', 'error');
      return;
    }
    setSavingDeploy(true);
    try {
      const result = await createDeployEntry({
        product: 'blackbelt',
        commit_sha: deployForm.commit_sha || null,
        commit_message: deployForm.commit_message,
        branch: deployForm.branch || 'main',
        tag: deployForm.tag || null,
        status: deployForm.status || 'success',
        duration_seconds: deployForm.duration_seconds ? Number(deployForm.duration_seconds) : null,
        files_changed: deployForm.files_changed ? Number(deployForm.files_changed) : null,
        lines_added: deployForm.lines_added ? Number(deployForm.lines_added) : null,
        lines_removed: deployForm.lines_removed ? Number(deployForm.lines_removed) : null,
      });
      if (result) {
        toast('Deploy registrado com sucesso', 'success');
        setDeploys((prev) => [result, ...prev]);
        setShowDeployForm(false);
        setDeployForm(EMPTY_DEPLOY_FORM);
      } else {
        toast('Erro ao registrar deploy', 'error');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSavingDeploy(false);
    }
  }

  // --- Error form handlers ---
  async function handleSaveError() {
    if (!errorForm.message.trim()) {
      toast('Mensagem do erro é obrigatória', 'error');
      return;
    }
    setSavingError(true);
    try {
      const result = await createError({
        product: 'blackbelt',
        error_type: errorForm.error_type || null,
        severity: errorForm.severity || 'medium',
        message: errorForm.message,
        affected_route: errorForm.affected_route || null,
        frequency: 1,
        status: 'novo',
      });
      if (result) {
        toast('Erro registrado com sucesso', 'success');
        setErrors((prev) => [result, ...prev]);
        setShowErrorForm(false);
        setErrorForm(EMPTY_ERROR_FORM);
      } else {
        toast('Erro ao registrar', 'error');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSavingError(false);
    }
  }

  // --- Error status update ---
  async function handleInvestigate(item: ErrorLogItem) {
    try {
      const ok = await updateErrorStatus(item.id, 'investigando');
      if (ok) {
        toast('Status atualizado para investigando', 'success');
        setErrors((prev) =>
          prev.map((e) => (e.id === item.id ? { ...e, status: 'investigando' } : e)),
        );
      }
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleResolve() {
    if (!resolveTarget) return;
    try {
      const ok = await updateErrorStatus(resolveTarget.id, 'resolvido', resolutionText);
      if (ok) {
        toast('Erro marcado como resolvido', 'success');
        setErrors((prev) =>
          prev.map((e) =>
            e.id === resolveTarget.id
              ? { ...e, status: 'resolvido', resolution: resolutionText }
              : e,
          ),
        );
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setResolveTarget(null);
      setResolutionText('');
    }
  }

  async function handleWontFix() {
    if (!wontFixTarget) return;
    try {
      const ok = await updateErrorStatus(wontFixTarget.id, 'wont_fix');
      if (ok) {
        toast("Erro marcado como Won't Fix", 'success');
        setErrors((prev) =>
          prev.map((e) => (e.id === wontFixTarget.id ? { ...e, status: 'wont_fix' } : e)),
        );
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setWontFixTarget(null);
    }
  }

  // --- Render ---
  if (loading) return <CockpitSkeleton />;

  const totalRows = tableCounts.reduce((sum, t) => sum + t.row_count, 0);

  return (
    <div className="p-4 sm:p-6 space-y-8 pb-20">
      {/* ============================================================ */}
      {/* 1. Status de Infra */}
      {/* ============================================================ */}
      <section>
        <h2
          className="text-base font-semibold mb-4"
          style={{ color: 'var(--bb-ink-1)' }}
        >
          Status de Infra
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {INFRA_SERVICES.map((svc) => (
            <div
              key={svc.name}
              className="rounded-xl p-4 flex items-start gap-3"
              style={{ background: 'var(--bb-depth-2)' }}
            >
              <div
                className="mt-0.5 shrink-0"
                style={{ color: 'var(--bb-ink-3)' }}
              >
                {svc.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: 'var(--bb-ink-1)' }}
                  >
                    {svc.name}
                  </span>
                  <StatusBadge label={svc.status} variant={svc.variant} />
                </div>
                <p
                  className="text-xs truncate"
                  style={{ color: 'var(--bb-ink-3)' }}
                >
                  {svc.detail}
                </p>
                <p
                  className="text-xs"
                  style={{ color: 'var(--bb-ink-3)' }}
                >
                  {svc.tier}
                </p>
              </div>
              <a
                href={svc.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Abrir painel do ${svc.name}`}
                className="shrink-0 mt-0.5 transition-colors"
                style={{ color: 'var(--bb-ink-3)' }}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. Deploy Log */}
      {/* ============================================================ */}
      <section>
        <SectionHeader
          title="Deploys"
          action={{
            label: 'Registrar Deploy',
            onClick: () => setShowDeployForm(true),
            icon: <Plus className="h-4 w-4" />,
          }}
        />

        {/* Deploy form */}
        {showDeployForm && (
          <div
            className="mt-4 rounded-xl p-4 space-y-3"
            style={{ background: 'var(--bb-depth-2)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-sm font-semibold"
                style={{ color: 'var(--bb-ink-1)' }}
              >
                Registrar Deploy
              </span>
              <button
                onClick={() => setShowDeployForm(false)}
                aria-label="Fechar formulário de deploy"
                style={{ color: 'var(--bb-ink-3)' }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Commit SHA"
                aria-label="Commit SHA"
                value={deployForm.commit_sha}
                onChange={(e) => setDeployForm((f) => ({ ...f, commit_sha: e.target.value }))}
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: 'var(--bb-depth-1)',
                  color: 'var(--bb-ink-1)',
                  border: '1px solid var(--bb-depth-2)',
                }}
              />
              <input
                type="text"
                placeholder="Branch"
                aria-label="Branch"
                value={deployForm.branch}
                onChange={(e) => setDeployForm((f) => ({ ...f, branch: e.target.value }))}
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: 'var(--bb-depth-1)',
                  color: 'var(--bb-ink-1)',
                  border: '1px solid var(--bb-depth-2)',
                }}
              />
            </div>
            <input
              type="text"
              placeholder="Mensagem do commit *"
              aria-label="Mensagem do commit"
              value={deployForm.commit_message}
              onChange={(e) => setDeployForm((f) => ({ ...f, commit_message: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{
                background: 'var(--bb-depth-1)',
                color: 'var(--bb-ink-1)',
                border: '1px solid var(--bb-depth-2)',
              }}
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Tag"
                aria-label="Tag"
                value={deployForm.tag}
                onChange={(e) => setDeployForm((f) => ({ ...f, tag: e.target.value }))}
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: 'var(--bb-depth-1)',
                  color: 'var(--bb-ink-1)',
                  border: '1px solid var(--bb-depth-2)',
                }}
              />
              <select
                aria-label="Status do deploy"
                value={deployForm.status}
                onChange={(e) => setDeployForm((f) => ({ ...f, status: e.target.value }))}
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: 'var(--bb-depth-1)',
                  color: 'var(--bb-ink-1)',
                  border: '1px solid var(--bb-depth-2)',
                }}
              >
                <option value="success">Sucesso</option>
                <option value="failed">Falhou</option>
                <option value="cancelled">Cancelado</option>
              </select>
              <input
                type="number"
                placeholder="Duração (s)"
                aria-label="Duração em segundos"
                value={deployForm.duration_seconds}
                onChange={(e) => setDeployForm((f) => ({ ...f, duration_seconds: e.target.value }))}
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: 'var(--bb-depth-1)',
                  color: 'var(--bb-ink-1)',
                  border: '1px solid var(--bb-depth-2)',
                }}
              />
              <input
                type="number"
                placeholder="Arquivos alterados"
                aria-label="Arquivos alterados"
                value={deployForm.files_changed}
                onChange={(e) => setDeployForm((f) => ({ ...f, files_changed: e.target.value }))}
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: 'var(--bb-depth-1)',
                  color: 'var(--bb-ink-1)',
                  border: '1px solid var(--bb-depth-2)',
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Linhas adicionadas"
                aria-label="Linhas adicionadas"
                value={deployForm.lines_added}
                onChange={(e) => setDeployForm((f) => ({ ...f, lines_added: e.target.value }))}
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: 'var(--bb-depth-1)',
                  color: 'var(--bb-ink-1)',
                  border: '1px solid var(--bb-depth-2)',
                }}
              />
              <input
                type="number"
                placeholder="Linhas removidas"
                aria-label="Linhas removidas"
                value={deployForm.lines_removed}
                onChange={(e) => setDeployForm((f) => ({ ...f, lines_removed: e.target.value }))}
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: 'var(--bb-depth-1)',
                  color: 'var(--bb-ink-1)',
                  border: '1px solid var(--bb-depth-2)',
                }}
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => {
                  setShowDeployForm(false);
                  setDeployForm(EMPTY_DEPLOY_FORM);
                }}
                aria-label="Cancelar registro de deploy"
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  background: 'var(--bb-depth-1)',
                  color: 'var(--bb-ink-2)',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveDeploy}
                disabled={savingDeploy}
                aria-label="Salvar deploy"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ background: 'var(--bb-brand)', color: '#fff' }}
              >
                {savingDeploy ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        )}

        {/* Deploy list */}
        <div className="mt-4 space-y-2">
          {deploys.length === 0 ? (
            <EmptyState
              icon={<Rocket className="h-10 w-10" />}
              title="Nenhum deploy registrado"
              description="Registre seu primeiro deploy para acompanhar o histórico."
              action={{ label: 'Registrar Deploy', onClick: () => setShowDeployForm(true) }}
            />
          ) : (
            deploys.map((d) => (
              <div
                key={d.id}
                className="rounded-lg p-3 sm:p-4"
                style={{ background: 'var(--bb-depth-2)' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className="text-xs font-mono"
                        style={{ color: 'var(--bb-ink-3)' }}
                      >
                        {d.commit_sha ? d.commit_sha.slice(0, 8) : '—'}
                      </span>
                      <StatusBadge
                        label={d.status === 'success' ? 'Sucesso' : d.status === 'failed' ? 'Falhou' : d.status}
                        variant={d.status === 'success' ? 'success' : d.status === 'failed' ? 'danger' : 'neutral'}
                      />
                      {d.tag && (
                        <StatusBadge label={d.tag} variant="info" />
                      )}
                    </div>
                    <p
                      className="text-sm mb-1"
                      style={{ color: 'var(--bb-ink-1)' }}
                    >
                      {truncate(d.commit_message, 80)}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className="text-xs"
                        style={{ color: 'var(--bb-ink-3)' }}
                      >
                        {relativeDate(d.deployed_at)}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: 'var(--bb-ink-3)' }}
                      >
                        <GitBranch className="inline h-3 w-3 mr-0.5" />
                        {d.branch}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: 'var(--bb-ink-3)' }}
                      >
                        <Clock className="inline h-3 w-3 mr-0.5" />
                        {formatDuration(d.duration_seconds)}
                      </span>
                      {d.files_changed !== null && (
                        <span
                          className="text-xs"
                          style={{ color: 'var(--bb-ink-3)' }}
                        >
                          <FileCode className="inline h-3 w-3 mr-0.5" />
                          {d.files_changed} arquivo{d.files_changed !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  {d.vercel_url && (
                    <a
                      href={d.vercel_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Abrir deploy ${d.commit_sha ?? 'no Vercel'}`}
                      className="shrink-0"
                      style={{ color: 'var(--bb-ink-3)' }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {deploys.length > 0 && (
          <div className="mt-3 flex justify-end">
            <a
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir Vercel Dashboard"
              className="flex items-center gap-1 text-xs font-medium"
              style={{ color: 'var(--bb-brand)' }}
            >
              Vercel Dashboard
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* 3. Error Tracking */}
      {/* ============================================================ */}
      <section>
        <SectionHeader
          title="Erros"
          action={{
            label: 'Registrar Erro',
            onClick: () => setShowErrorForm(true),
            icon: <Plus className="h-4 w-4" />,
          }}
        />

        {/* Filter pills — status */}
        <div className="mt-4 flex flex-wrap gap-2">
          {(Object.keys(ERROR_STATUS_LABELS) as ErrorStatusFilter[]).map((key) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              aria-label={`Filtrar por status: ${ERROR_STATUS_LABELS[key]}`}
              className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
              style={{
                background: statusFilter === key ? 'var(--bb-brand)' : 'var(--bb-depth-2)',
                color: statusFilter === key ? '#fff' : 'var(--bb-ink-2)',
              }}
            >
              {ERROR_STATUS_LABELS[key]}
            </button>
          ))}
        </div>

        {/* Filter pills — severity */}
        <div className="mt-2 flex flex-wrap gap-2">
          {(Object.keys(SEVERITY_LABELS) as SeverityFilter[]).map((key) => {
            const colors: Record<SeverityFilter, string> = {
              todos: 'var(--bb-ink-3)',
              critical: 'var(--bb-danger)',
              high: 'var(--bb-warning)',
              medium: 'var(--bb-brand)',
              low: 'var(--bb-ink-3)',
            };
            const isActive = severityFilter === key;
            return (
              <button
                key={key}
                onClick={() => setSeverityFilter(key)}
                aria-label={`Filtrar por severidade: ${SEVERITY_LABELS[key]}`}
                className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
                style={{
                  background: isActive ? colors[key] : 'var(--bb-depth-2)',
                  color: isActive ? '#fff' : colors[key],
                  border: isActive ? 'none' : `1px solid ${colors[key]}`,
                }}
              >
                {SEVERITY_LABELS[key]}
              </button>
            );
          })}
        </div>

        {/* Error form */}
        {showErrorForm && (
          <div
            className="mt-4 rounded-xl p-4 space-y-3"
            style={{ background: 'var(--bb-depth-2)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-sm font-semibold"
                style={{ color: 'var(--bb-ink-1)' }}
              >
                Registrar Erro
              </span>
              <button
                onClick={() => setShowErrorForm(false)}
                aria-label="Fechar formulário de erro"
                style={{ color: 'var(--bb-ink-3)' }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                aria-label="Tipo do erro"
                value={errorForm.error_type}
                onChange={(e) => setErrorForm((f) => ({ ...f, error_type: e.target.value }))}
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: 'var(--bb-depth-1)',
                  color: 'var(--bb-ink-1)',
                  border: '1px solid var(--bb-depth-2)',
                }}
              >
                <option value="runtime">Runtime</option>
                <option value="build">Build</option>
                <option value="api">API</option>
                <option value="database">Database</option>
                <option value="auth">Auth</option>
                <option value="integration">Integration</option>
              </select>
              <select
                aria-label="Severidade do erro"
                value={errorForm.severity}
                onChange={(e) => setErrorForm((f) => ({ ...f, severity: e.target.value }))}
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: 'var(--bb-depth-1)',
                  color: 'var(--bb-ink-1)',
                  border: '1px solid var(--bb-depth-2)',
                }}
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Mensagem do erro *"
              aria-label="Mensagem do erro"
              value={errorForm.message}
              onChange={(e) => setErrorForm((f) => ({ ...f, message: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{
                background: 'var(--bb-depth-1)',
                color: 'var(--bb-ink-1)',
                border: '1px solid var(--bb-depth-2)',
              }}
            />
            <input
              type="text"
              placeholder="Rota afetada (ex: /api/checkin)"
              aria-label="Rota afetada"
              value={errorForm.affected_route}
              onChange={(e) => setErrorForm((f) => ({ ...f, affected_route: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{
                background: 'var(--bb-depth-1)',
                color: 'var(--bb-ink-1)',
                border: '1px solid var(--bb-depth-2)',
              }}
            />
            <textarea
              placeholder="Stack trace (opcional)"
              aria-label="Stack trace"
              rows={3}
              value={errorForm.stack_trace}
              onChange={(e) => setErrorForm((f) => ({ ...f, stack_trace: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none font-mono"
              style={{
                background: 'var(--bb-depth-1)',
                color: 'var(--bb-ink-1)',
                border: '1px solid var(--bb-depth-2)',
              }}
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => {
                  setShowErrorForm(false);
                  setErrorForm(EMPTY_ERROR_FORM);
                }}
                aria-label="Cancelar registro de erro"
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  background: 'var(--bb-depth-1)',
                  color: 'var(--bb-ink-2)',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveError}
                disabled={savingError}
                aria-label="Salvar erro"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ background: 'var(--bb-brand)', color: '#fff' }}
              >
                {savingError ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        )}

        {/* Error list */}
        <div className="mt-4 space-y-2">
          {filteredErrors.length === 0 ? (
            <EmptyState
              icon={<Bug className="h-10 w-10" />}
              title="Nenhum erro encontrado"
              description={
                statusFilter === 'todos'
                  ? 'Registre um erro para começar o rastreamento.'
                  : `Nenhum erro com status "${ERROR_STATUS_LABELS[statusFilter]}".`
              }
            />
          ) : (
            filteredErrors.map((err) => (
              <div
                key={err.id}
                className="rounded-lg p-3 sm:p-4"
                style={{ background: 'var(--bb-depth-2)' }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {err.error_type && (
                      <StatusBadge label={err.error_type} variant="info" />
                    )}
                    <StatusBadge label={err.severity} variant={severityVariant(err.severity)} />
                    <StatusBadge
                      label={err.status === 'wont_fix' ? "Won't Fix" : err.status.charAt(0).toUpperCase() + err.status.slice(1)}
                      variant={errorStatusVariant(err.status)}
                    />
                  </div>
                </div>
                <p
                  className="text-sm mb-1"
                  style={{ color: 'var(--bb-ink-1)' }}
                >
                  {err.message}
                </p>
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  {err.affected_route && (
                    <span
                      className="text-xs font-mono"
                      style={{ color: 'var(--bb-ink-3)' }}
                    >
                      {err.affected_route}
                    </span>
                  )}
                  <span
                    className="text-xs"
                    style={{ color: 'var(--bb-ink-3)' }}
                  >
                    {err.frequency} ocorrência{err.frequency !== 1 ? 's' : ''}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: 'var(--bb-ink-3)' }}
                  >
                    Primeiro: {relativeDate(err.first_seen)}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: 'var(--bb-ink-3)' }}
                  >
                    Último: {relativeDate(err.last_seen)}
                  </span>
                </div>
                {err.resolution && (
                  <p
                    className="text-xs italic mb-2"
                    style={{ color: 'var(--bb-success)' }}
                  >
                    Resolução: {err.resolution}
                  </p>
                )}
                {err.status !== 'resolvido' && err.status !== 'wont_fix' && (
                  <div className="flex gap-2 flex-wrap">
                    {err.status === 'novo' && (
                      <button
                        onClick={() => handleInvestigate(err)}
                        aria-label={`Investigar erro: ${err.message}`}
                        className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                        style={{
                          border: '1px solid var(--bb-warning)',
                          color: 'var(--bb-warning)',
                          background: 'transparent',
                        }}
                      >
                        <Search className="inline h-3 w-3 mr-1" />
                        Investigar
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setResolveTarget(err);
                        setResolutionText('');
                      }}
                      aria-label={`Resolver erro: ${err.message}`}
                      className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                      style={{
                        border: '1px solid var(--bb-success)',
                        color: 'var(--bb-success)',
                        background: 'transparent',
                      }}
                    >
                      Resolver
                    </button>
                    <button
                      onClick={() => setWontFixTarget(err)}
                      aria-label={`Marcar Won't Fix: ${err.message}`}
                      className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                      style={{
                        border: '1px solid var(--bb-ink-3)',
                        color: 'var(--bb-ink-3)',
                        background: 'transparent',
                      }}
                    >
                      Won&apos;t Fix
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Resolve dialog */}
      {resolveTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setResolveTarget(null);
              setResolutionText('');
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-xl p-6"
            style={{ background: 'var(--bb-depth-2)' }}
            role="dialog"
            aria-modal="true"
            aria-label="Resolver erro"
          >
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: 'var(--bb-ink-1)' }}
            >
              Resolver Erro
            </h3>
            <p
              className="text-sm mb-4"
              style={{ color: 'var(--bb-ink-3)' }}
            >
              {resolveTarget.message}
            </p>
            <textarea
              placeholder="Descreva a resolução..."
              aria-label="Descrição da resolução"
              rows={3}
              value={resolutionText}
              onChange={(e) => setResolutionText(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none mb-4"
              style={{
                background: 'var(--bb-depth-1)',
                color: 'var(--bb-ink-1)',
                border: '1px solid var(--bb-depth-2)',
              }}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setResolveTarget(null);
                  setResolutionText('');
                }}
                aria-label="Cancelar resolução"
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  background: 'var(--bb-depth-1)',
                  color: 'var(--bb-ink-2)',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleResolve}
                aria-label="Confirmar resolução"
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'var(--bb-success)', color: '#fff' }}
              >
                Resolver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Won't Fix confirm dialog */}
      <ConfirmDialog
        open={!!wontFixTarget}
        onClose={() => setWontFixTarget(null)}
        onConfirm={handleWontFix}
        title="Marcar como Won't Fix"
        message={
          wontFixTarget
            ? `Tem certeza que deseja marcar "${truncate(wontFixTarget.message, 60)}" como Won't Fix? Este erro não será corrigido.`
            : ''
        }
        confirmLabel="Won't Fix"
        variant="warning"
      />

      {/* ============================================================ */}
      {/* 4. Stack & Dependências */}
      {/* ============================================================ */}
      <section>
        <h2
          className="text-base font-semibold mb-4"
          style={{ color: 'var(--bb-ink-1)' }}
        >
          Stack &amp; Dependências
        </h2>
        <div
          className="rounded-xl p-4"
          style={{ background: 'var(--bb-depth-2)' }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {STACK_DEPS.map((dep) => (
              <div key={dep.name} className="flex items-center gap-2">
                <Package className="h-4 w-4 shrink-0" style={{ color: 'var(--bb-ink-3)' }} />
                <div>
                  <p
                    className="text-xs font-medium"
                    style={{ color: 'var(--bb-ink-1)' }}
                  >
                    {dep.name}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: 'var(--bb-ink-3)' }}
                  >
                    {dep.version}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Security checklist */}
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: 'var(--bb-ink-1)' }}
          >
            <Shield className="inline h-4 w-4 mr-1" />
            Checklist de Segurança
          </h3>
          <ul className="space-y-2">
            {SECURITY_CHECKLIST.map((item) => (
              <li key={item.label} className="flex items-center gap-2">
                {item.ok ? (
                  <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: 'var(--bb-success)' }} />
                ) : (
                  <ShieldAlert className="h-4 w-4 shrink-0" style={{ color: 'var(--bb-warning)' }} />
                )}
                <span
                  className="text-sm"
                  style={{ color: item.ok ? 'var(--bb-ink-2)' : 'var(--bb-warning)' }}
                >
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. Database Overview */}
      {/* ============================================================ */}
      <section>
        <button
          onClick={() => setShowDbSection((v) => !v)}
          aria-label={showDbSection ? 'Recolher Database Overview' : 'Expandir Database Overview'}
          className="flex items-center gap-2 w-full text-left mb-4"
        >
          <h2
            className="text-base font-semibold"
            style={{ color: 'var(--bb-ink-1)' }}
          >
            Database Overview
          </h2>
          {showDbSection ? (
            <ChevronUp className="h-4 w-4" style={{ color: 'var(--bb-ink-3)' }} />
          ) : (
            <ChevronDown className="h-4 w-4" style={{ color: 'var(--bb-ink-3)' }} />
          )}
        </button>
        {showDbSection && (
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--bb-depth-2)' }}
          >
            <div className="flex items-center gap-4 flex-wrap mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-3)' }}>
                  Tabelas
                </p>
                <p className="text-lg font-bold" style={{ color: 'var(--bb-ink-1)' }}>
                  {tableCounts.length}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-3)' }}>
                  Total de Linhas
                </p>
                <p className="text-lg font-bold" style={{ color: 'var(--bb-ink-1)' }}>
                  {totalRows.toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-3)' }}>
                  Migrations
                </p>
                <p className="text-lg font-bold" style={{ color: 'var(--bb-ink-1)' }}>
                  ~82
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-3)' }}>
                  Tag Atual
                </p>
                <p className="text-lg font-bold" style={{ color: 'var(--bb-brand)' }}>
                  v3.5.0-tested
                </p>
              </div>
            </div>
            <div className="space-y-1">
              {tableCounts.map((t) => {
                const maxRows = tableCounts[0]?.row_count || 1;
                const pct = Math.max((t.row_count / maxRows) * 100, 2);
                return (
                  <div key={t.table_name} className="flex items-center gap-3">
                    <span
                      className="text-xs font-mono w-40 sm:w-48 truncate shrink-0"
                      style={{ color: 'var(--bb-ink-2)' }}
                    >
                      {t.table_name}
                    </span>
                    <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'var(--bb-depth-1)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: 'var(--bb-brand)',
                          opacity: 0.7,
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-mono w-12 text-right shrink-0"
                      style={{ color: 'var(--bb-ink-3)' }}
                    >
                      {t.row_count.toLocaleString('pt-BR')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* 6. Variáveis de Ambiente */}
      {/* ============================================================ */}
      <section>
        <button
          onClick={() => setShowEnvSection((v) => !v)}
          aria-label={showEnvSection ? 'Recolher Variáveis de Ambiente' : 'Expandir Variáveis de Ambiente'}
          className="flex items-center gap-2 w-full text-left mb-4"
        >
          <h2
            className="text-base font-semibold"
            style={{ color: 'var(--bb-ink-1)' }}
          >
            <Key className="inline h-4 w-4 mr-1" />
            Variáveis de Ambiente
          </h2>
          {showEnvSection ? (
            <ChevronUp className="h-4 w-4" style={{ color: 'var(--bb-ink-3)' }} />
          ) : (
            <ChevronDown className="h-4 w-4" style={{ color: 'var(--bb-ink-3)' }} />
          )}
        </button>
        {showEnvSection && (
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--bb-depth-2)' }}
          >
            <p
              className="text-xs mb-3"
              style={{ color: 'var(--bb-ink-3)' }}
            >
              Valores não exibidos por segurança. Apenas os nomes e status de configuração.
            </p>
            <div className="space-y-2">
              {ENV_VARS.map((v) => (
                <div key={v.name} className="flex items-center gap-3">
                  <span className="text-sm">{envStatusIcon(v.status)}</span>
                  <span
                    className="text-xs font-mono flex-1"
                    style={{ color: 'var(--bb-ink-2)' }}
                  >
                    {v.name}
                  </span>
                  <span
                    className="text-xs shrink-0"
                    style={{ color: 'var(--bb-ink-3)' }}
                  >
                    {envStatusLabel(v.status)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-3" style={{ borderTop: '1px solid var(--bb-depth-1)' }}>
              <div className="flex items-center gap-1">
                <span className="text-xs">{envStatusIcon('vercel')}</span>
                <span className="text-xs" style={{ color: 'var(--bb-ink-3)' }}>No Vercel</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs">{envStatusIcon('local')}</span>
                <span className="text-xs" style={{ color: 'var(--bb-ink-3)' }}>Só local</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs">{envStatusIcon('missing')}</span>
                <span className="text-xs" style={{ color: 'var(--bb-ink-3)' }}>Não configurada</span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

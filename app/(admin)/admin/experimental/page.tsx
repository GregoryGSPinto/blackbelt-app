'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import {
  listTrialStudents,
  getTrialMetrics,
  generateFollowUpWhatsAppLink,
  extendTrial,
  cancelTrial,
} from '@/lib/api/trial.service';
import type { TrialStudent, TrialMetrics, TrialStatus, TrialSource } from '@/lib/api/trial.service';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  UserPlus, Search, TrendingUp, Users,
  AlertTriangle, MoreVertical, Plus, Phone, Clock,
} from 'lucide-react';

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', label: 'Ativo' },
  converted: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', label: 'Convertido' },
  expired: { bg: 'rgba(234,179,8,0.15)', text: '#eab308', label: 'Expirado' },
  cancelled: { bg: 'rgba(156,163,175,0.15)', text: '#9ca3af', label: 'Cancelado' },
  no_show: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', label: 'Não compareceu' },
};

const SOURCE_LABELS: Record<string, string> = {
  walk_in: 'Presencial',
  website: 'Site',
  instagram: 'Instagram',
  facebook: 'Facebook',
  google: 'Google',
  referral: 'Indicação',
  event: 'Evento',
  whatsapp: 'WhatsApp',
  other: 'Outro',
};

function daysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function DaysBadge({ endDate }: { endDate: string }) {
  const days = daysRemaining(endDate);
  let bg = 'rgba(34,197,94,0.15)';
  let text = '#22c55e';
  let label = `${days}d restantes`;

  if (days <= 0) {
    bg = 'rgba(239,68,68,0.15)'; text = '#ef4444'; label = 'Expirado';
  } else if (days <= 3) {
    bg = 'rgba(234,179,8,0.15)'; text = '#eab308'; label = `${days}d restantes`;
  }

  return (
    <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: bg, color: text }}>
      {label}
    </span>
  );
}

export default function ExperimentalListPage() {
  const { toast } = useToast();
  const [students, setStudents] = useState<TrialStudent[]>([]);
  const [metrics, setMetrics] = useState<TrialMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [filterStatus, setFilterStatus] = useState<TrialStatus | ''>('');
  const [filterSource, setFilterSource] = useState<TrialSource | ''>('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const aid = getActiveAcademyId();
      const [s, m] = await Promise.all([
        listTrialStudents(aid),
        getTrialMetrics(aid),
      ]);
      setStudents(s);
      setMetrics(m);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    let result = students;
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || s.phone.includes(q),
      );
    }
    if (filterStatus) result = result.filter((s) => s.status === filterStatus);
    if (filterSource) result = result.filter((s) => s.source === filterSource);
    return result;
  }, [students, debouncedSearch, filterStatus, filterSource]);

  async function handleExtend(id: string) {
    try {
      const updated = await extendTrial(id, 3);
      if (updated) {
        setStudents((prev) => prev.map((s) => (s.id === id ? updated : s)));
        toast('Trial estendido em 3 dias', 'success');
      }
    } catch (err) { toast(translateError(err), 'error'); }
    setMenuOpen(null);
  }

  async function handleCancel(id: string) {
    try {
      const updated = await cancelTrial(id);
      if (updated) {
        setStudents((prev) => prev.map((s) => (s.id === id ? updated : s)));
        toast('Trial cancelado', 'success');
      }
    } catch (err) { toast(translateError(err), 'error'); }
    setMenuOpen(null);
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="card" className="h-20" />)}
        </div>
        {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-16" />)}
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          Alunos Experimentais
        </h1>
        <Link
          href="/admin/experimental/novo"
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white"
          style={{ background: '#22c55e' }}
        >
          <Plus className="h-4 w-4" /> Cadastrar
        </Link>
      </div>

      {/* KPIs */}
      {metrics && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KPICard icon={<Users className="h-5 w-5" style={{ color: 'var(--bb-brand)' }} />} label="Em Trial Agora" value={metrics.active_now} />
          <KPICard icon={<TrendingUp className="h-5 w-5" style={{ color: '#22c55e' }} />} label="Taxa de Conversão" value={`${metrics.conversion_rate}%`} />
          <KPICard icon={<Clock className="h-5 w-5" style={{ color: '#3b82f6' }} />} label="Média de Aulas" value={metrics.avg_classes_attended} />
          <KPICard icon={<AlertTriangle className="h-5 w-5" style={{ color: '#eab308' }} />} label="Expiram em 3 dias" value={metrics.expiring_in_3_days} />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1" style={{ minWidth: 180 }}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--bb-ink-40)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou telefone..."
            className="w-full rounded-lg py-2 pl-9 pr-3 text-sm"
            style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as TrialStatus | '')}
          className="rounded-lg px-3 py-2 text-sm"
          style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
        >
          <option value="">Todos os status</option>
          {Object.entries(STATUS_STYLES).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value as TrialSource | '')}
          className="rounded-lg px-3 py-2 text-sm"
          style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
        >
          <option value="">Todas as fontes</option>
          {Object.entries(SOURCE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16" style={{ color: 'var(--bb-ink-40)' }}>
          <UserPlus className="h-10 w-10" />
          <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-60)' }}>
            {search || filterStatus || filterSource
              ? 'Nenhum aluno encontrado com esses filtros'
              : 'Nenhum aluno experimental cadastrado'}
          </p>
          {!search && !filterStatus && !filterSource && (
            <Link href="/admin/experimental/novo" className="text-sm font-medium" style={{ color: 'var(--bb-brand)' }}>
              Cadastrar primeiro aluno experimental
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => {
            const style = STATUS_STYLES[s.status] ?? STATUS_STYLES.active;
            return (
              <div
                key={s.id}
                className="relative flex items-center gap-3 rounded-xl p-3 transition-colors hover:brightness-95"
                style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
              >
                {/* Initials avatar */}
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: 'var(--bb-brand)' }}
                >
                  {s.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
                </div>

                {/* Info */}
                <Link href={`/admin/experimental/${s.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold truncate" style={{ color: 'var(--bb-ink-100)' }}>
                      {s.name}
                    </span>
                    <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: style.bg, color: style.text }}>
                      {style.label}
                    </span>
                    {s.status === 'active' && <DaysBadge endDate={s.trial_end_date} />}
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    <span>{s.modalities_interest.join(', ')}</span>
                    <span>{SOURCE_LABELS[s.source] ?? s.source}</span>
                    <span>{s.trial_classes_attended} aulas</span>
                  </div>
                </Link>

                {/* Quick actions */}
                <div className="flex items-center gap-1">
                  <a
                    href={`https://wa.me/55${s.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ color: '#25D366' }}
                    title="WhatsApp"
                  >
                    <Phone className="h-4 w-4" />
                  </a>

                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === s.id ? null : s.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ color: 'var(--bb-ink-40)' }}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {menuOpen === s.id && (
                      <div
                        className="absolute right-0 top-full z-20 mt-1 min-w-[160px] rounded-lg py-1 shadow-lg"
                        style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}
                      >
                        <Link
                          href={`/admin/experimental/${s.id}`}
                          className="block px-3 py-2 text-xs hover:brightness-90"
                          style={{ color: 'var(--bb-ink-80)' }}
                        >
                          Ver detalhes
                        </Link>
                        {s.status === 'active' && (
                          <>
                            <button
                              onClick={() => { window.open(generateFollowUpWhatsAppLink(s, daysRemaining(s.trial_end_date) <= 2 ? 'expiry' : 'day3'), '_blank'); setMenuOpen(null); }}
                              className="block w-full px-3 py-2 text-left text-xs hover:brightness-90"
                              style={{ color: 'var(--bb-ink-80)' }}
                            >
                              Enviar lembrete WhatsApp
                            </button>
                            <button
                              onClick={() => handleExtend(s.id)}
                              className="block w-full px-3 py-2 text-left text-xs hover:brightness-90"
                              style={{ color: 'var(--bb-ink-80)' }}
                            >
                              Estender +3 dias
                            </button>
                            <Link
                              href={`/admin/experimental/${s.id}?action=convert`}
                              className="block px-3 py-2 text-xs font-semibold"
                              style={{ color: '#22c55e' }}
                            >
                              Converter em aluno
                            </Link>
                            <button
                              onClick={() => handleCancel(s.id)}
                              className="block w-full px-3 py-2 text-left text-xs hover:brightness-90"
                              style={{ color: '#ef4444' }}
                            >
                              Cancelar trial
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function KPICard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-xl p-3" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>{label}</span>
      </div>
      <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{value}</p>
    </div>
  );
}

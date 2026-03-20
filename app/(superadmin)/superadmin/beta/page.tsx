'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getAllFeedback,
  updateFeedbackStatus,
  updateFeedbackPriority,
  getFeedbackStats,
  type BetaFeedback,
} from '@/lib/api/beta-feedback.service';
import { getNpsData, type NpsResult } from '@/lib/api/beta-nps.service';
import {
  getBetaDashboardData,
  getBetaAcademyDetails,
  type BetaDashboardData,
} from '@/lib/api/beta-analytics.service';
import {
  getAllChangelog,
  createChangelogEntry,
  publishChangelogEntry,
  type ChangelogEntry,
} from '@/lib/api/beta-changelog.service';
import { betaMessageTemplates } from '@/lib/templates/beta-messages';

const AMBER = '#f59e0b';

const TABS = ['Overview', 'Feedback', 'NPS', 'Analytics', 'Changelog'] as const;
type Tab = typeof TABS[number];

// ═══ OVERVIEW TAB ═══
function OverviewTab() {
  const [dashboard, setDashboard] = useState<BetaDashboardData | null>(null);
  const [academies, setAcademies] = useState<Record<string, unknown>[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<{ total: number; by_status: Record<string, number>; avg_resolution_hours: number } | null>(null);
  const [nps, setNps] = useState<{ nps_score: number } | null>(null);

  useEffect(() => {
    getBetaDashboardData().then(setDashboard);
    getBetaAcademyDetails().then(setAcademies);
    getFeedbackStats().then(setFeedbackStats);
    getNpsData().then(setNps);
  }, []);

  if (!dashboard) return <LoadingSpinner />;

  const bugsOpen = feedbackStats?.by_status?.new || 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Academias Ativas" value={`${dashboard.active_academies}/${dashboard.total_academies}`} />
        <KpiCard label="Usuarios Ativos (7d)" value={String(dashboard.active_users_7d)} />
        <KpiCard label="Sessoes (7d)" value={String(dashboard.total_sessions_7d)} />
        <KpiCard label="NPS Atual" value={nps ? `${nps.nps_score >= 0 ? '+' : ''}${nps.nps_score}` : '—'} />
        <KpiCard label="Bugs Abertos" value={String(bugsOpen)} highlight={bugsOpen > 0} />
        <KpiCard label="Resolucao Media" value={feedbackStats ? `${feedbackStats.avg_resolution_hours}h` : '—'} />
      </div>

      {/* Academies List */}
      <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
        <h3 className="mb-3 text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>Academias Beta</h3>
        {academies.length === 0 && (
          <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>Nenhuma academia cadastrada no beta.</p>
        )}
        <div className="space-y-2">
          {academies.map((a, i) => {
            const academy = a.academies as Record<string, unknown> | null;
            const status = a.status as string;
            const statusColor = status === 'active' ? '#22c55e' : status === 'paused' ? '#f59e0b' : '#ef4444';
            return (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg p-3"
                style={{ background: 'var(--bb-depth-3)' }}
              >
                <div className="h-3 w-3 rounded-full" style={{ background: statusColor }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--bb-ink-100)' }}>
                    {(academy?.name as string) || 'Academia'}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    {a.contact_name as string} | {a.contact_phone as string}
                  </p>
                </div>
                <span className="text-xs capitalize" style={{ color: statusColor }}>{status}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* WhatsApp Templates */}
      <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
        <h3 className="mb-3 text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>Templates WhatsApp</h3>
        <div className="space-y-2">
          {Object.entries(betaMessageTemplates).map(([key, template]) => (
            <div key={key} className="rounded-lg p-3" style={{ background: 'var(--bb-depth-3)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase" style={{ color: AMBER }}>{key.replace(/_/g, ' ')}</p>
                <button
                  onClick={() => { navigator.clipboard.writeText(template); }}
                  className="rounded-md px-2 py-1 text-xs font-medium transition-colors"
                  style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}
                >
                  Copiar
                </button>
              </div>
              <p className="text-xs whitespace-pre-wrap line-clamp-3" style={{ color: 'var(--bb-ink-60)' }}>{template}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══ FEEDBACK TAB ═══
function FeedbackTab() {
  const [items, setItems] = useState<BetaFeedback[]>([]);
  const [stats, setStats] = useState<{ total: number; by_status: Record<string, number>; by_type: Record<string, number> } | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [feedbackData, statsData] = await Promise.all([
      getAllFeedback({
        status: filterStatus || undefined,
        type: filterType || undefined,
      }),
      getFeedbackStats(),
    ]);
    setItems(feedbackData);
    setStats(statsData);
    setLoading(false);
  }, [filterStatus, filterType]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleStatusChange(id: string, status: BetaFeedback['status']) {
    await updateFeedbackStatus(id, status);
    loadData();
  }

  async function handlePriorityChange(id: string, priority: BetaFeedback['priority']) {
    await updateFeedbackPriority(id, priority);
    loadData();
  }

  const priorityColors: Record<string, string> = {
    critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#6b7280',
  };
  const typeLabels: Record<string, string> = {
    bug: 'Bug', feature_request: 'Sugestao', usability: 'Usabilidade', praise: 'Elogio', general: 'Geral',
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard label="Total" value={String(stats.total)} />
          <KpiCard label="Novos" value={String(stats.by_status.new || 0)} />
          <KpiCard label="Em Progresso" value={String(stats.by_status.in_progress || 0)} />
          <KpiCard label="Resolvidos" value={String(stats.by_status.resolved || 0)} />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm outline-none"
          style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
        >
          <option value="">Todos os status</option>
          <option value="new">Novo</option>
          <option value="reviewing">Revisando</option>
          <option value="in_progress">Em progresso</option>
          <option value="resolved">Resolvido</option>
          <option value="wont_fix">Nao vai corrigir</option>
          <option value="duplicate">Duplicado</option>
        </select>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm outline-none"
          style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
        >
          <option value="">Todos os tipos</option>
          <option value="bug">Bug</option>
          <option value="feature_request">Sugestao</option>
          <option value="usability">Usabilidade</option>
          <option value="praise">Elogio</option>
          <option value="general">Geral</option>
        </select>
      </div>

      {/* List */}
      {loading ? <LoadingSpinner /> : (
        <div className="space-y-2">
          {items.length === 0 && (
            <p className="py-8 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>Nenhum feedback encontrado.</p>
          )}
          {items.map(item => (
            <div
              key={item.id}
              className="rounded-xl p-4"
              style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
                  style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}
                >
                  {typeLabels[item.feedback_type] || item.feedback_type}
                </span>
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
                  style={{ background: `${priorityColors[item.priority]}20`, color: priorityColors[item.priority] }}
                >
                  {item.priority}
                </span>
                <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  {item.user_name} ({item.user_role}) | {item.page_url}
                </span>
              </div>
              <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--bb-ink-100)' }}>{item.title}</h4>
              <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--bb-ink-60)' }}>{item.description}</p>
              {item.screenshot_url && (
                <a href={item.screenshot_url} target="_blank" rel="noopener noreferrer" className="mb-3 inline-block">
                  <img src={item.screenshot_url} alt="Screenshot" className="h-16 rounded-lg object-cover" />
                </a>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={item.status}
                  onChange={e => handleStatusChange(item.id, e.target.value as BetaFeedback['status'])}
                  className="rounded-md px-2 py-1 text-xs outline-none"
                  style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
                >
                  <option value="new">Novo</option>
                  <option value="reviewing">Revisando</option>
                  <option value="in_progress">Em progresso</option>
                  <option value="resolved">Resolvido</option>
                  <option value="wont_fix">Nao corrigir</option>
                  <option value="duplicate">Duplicado</option>
                </select>
                <select
                  value={item.priority}
                  onChange={e => handlePriorityChange(item.id, e.target.value as BetaFeedback['priority'])}
                  className="rounded-md px-2 py-1 text-xs outline-none"
                  style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
                >
                  <option value="critical">Critico</option>
                  <option value="high">Alto</option>
                  <option value="medium">Medio</option>
                  <option value="low">Baixo</option>
                </select>
                <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  {new Date(item.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══ NPS TAB ═══
function NpsTab() {
  const [data, setData] = useState<{ responses: NpsResult[]; nps_score: number; promoters: number; passives: number; detractors: number; total: number } | null>(null);

  useEffect(() => { getNpsData().then(setData); }, []);

  if (!data) return <LoadingSpinner />;

  const gaugeColor = data.nps_score < 0 ? '#ef4444' : data.nps_score <= 50 ? '#f59e0b' : '#22c55e';

  return (
    <div className="space-y-6">
      {/* NPS Score */}
      <div className="rounded-xl p-6 text-center" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
        <p className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--bb-ink-40)' }}>NPS Score</p>
        <p className="text-5xl font-black" style={{ color: gaugeColor }}>
          {data.nps_score >= 0 ? '+' : ''}{data.nps_score}
        </p>
        <p className="text-sm mt-2" style={{ color: 'var(--bb-ink-60)' }}>
          {data.total} respostas
        </p>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
          <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>{data.promoters}</p>
          <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Promotores (9-10)</p>
        </div>
        <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
          <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{data.passives}</p>
          <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Passivos (7-8)</p>
        </div>
        <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
          <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>{data.detractors}</p>
          <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Detratores (0-6)</p>
        </div>
      </div>

      {/* Responses */}
      <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
        <h3 className="mb-3 text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>Respostas Individuais</h3>
        <div className="space-y-2">
          {data.responses.length === 0 && (
            <p className="py-4 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>Nenhuma resposta ainda.</p>
          )}
          {data.responses.map(r => {
            const scoreColor = r.score <= 6 ? '#ef4444' : r.score <= 8 ? '#f59e0b' : '#22c55e';
            return (
              <div key={r.id} className="rounded-lg p-3" style={{ background: 'var(--bb-depth-3)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: scoreColor }}>
                    {r.score}
                  </span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{r.user_name}</p>
                    <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>{r.user_role} | {new Date(r.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                {r.reason && <p className="text-xs mt-1" style={{ color: 'var(--bb-ink-80)' }}><strong>Razao:</strong> {r.reason}</p>}
                {r.what_would_improve && <p className="text-xs mt-1" style={{ color: 'var(--bb-ink-80)' }}><strong>Melhoraria:</strong> {r.what_would_improve}</p>}
                {r.favorite_feature && <p className="text-xs mt-1" style={{ color: 'var(--bb-ink-80)' }}><strong>Feature favorita:</strong> {r.favorite_feature}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══ ANALYTICS TAB ═══
function AnalyticsTab() {
  const [data, setData] = useState<BetaDashboardData | null>(null);

  useEffect(() => { getBetaDashboardData().then(setData); }, []);

  if (!data) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* DAU Chart */}
      <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
        <h3 className="mb-3 text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>Usuarios Ativos Diarios (30d)</h3>
        {data.dau_chart.length === 0 ? (
          <p className="py-8 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>Sem dados ainda.</p>
        ) : (
          <div className="flex items-end gap-1 h-32">
            {data.dau_chart.map(d => {
              const max = Math.max(...data.dau_chart.map(x => x.count), 1);
              const height = (d.count / max) * 100;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1" title={`${d.date}: ${d.count}`}>
                  <div className="w-full rounded-t" style={{ height: `${height}%`, background: AMBER, minHeight: '2px' }} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Features */}
      <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
        <h3 className="mb-3 text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>Top Features (7d)</h3>
        {data.top_features.length === 0 ? (
          <p className="py-4 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>Sem dados ainda.</p>
        ) : (
          <div className="space-y-2">
            {data.top_features.map(f => {
              const max = Math.max(...data.top_features.map(x => x.count), 1);
              const width = (f.count / max) * 100;
              return (
                <div key={f.feature}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: 'var(--bb-ink-80)' }}>{f.feature}</span>
                    <span style={{ color: 'var(--bb-ink-40)' }}>{f.count}</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'var(--bb-depth-3)' }}>
                    <div className="h-full rounded-full" style={{ width: `${width}%`, background: AMBER }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Device & Roles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
          <h3 className="mb-3 text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>Dispositivos</h3>
          {data.devices.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>Sem dados.</p>
          ) : (
            <div className="space-y-2">
              {data.devices.map(d => (
                <div key={d.type} className="flex items-center justify-between">
                  <span className="text-sm capitalize" style={{ color: 'var(--bb-ink-80)' }}>{d.type}</span>
                  <span className="text-sm font-bold" style={{ color: AMBER }}>{d.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
          <h3 className="mb-3 text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>Perfis</h3>
          {data.roles.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>Sem dados.</p>
          ) : (
            <div className="space-y-2">
              {data.roles.map(r => (
                <div key={r.role} className="flex items-center justify-between">
                  <span className="text-sm capitalize" style={{ color: 'var(--bb-ink-80)' }}>{r.role}</span>
                  <span className="text-sm font-bold" style={{ color: AMBER }}>{r.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══ CHANGELOG TAB ═══
function ChangelogTab() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [version, setVersion] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [changes, setChanges] = useState<{ type: 'fix' | 'feature' | 'improvement'; text: string }[]>([{ type: 'feature', text: '' }]);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    const data = await getAllChangelog();
    setEntries(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  async function handleSaveDraft() {
    if (!version || !title) return;
    await createChangelogEntry({
      version,
      title,
      description,
      changes: changes.filter(c => c.text.trim()),
      published_at: null,
      is_draft: true,
    });
    setShowForm(false);
    setVersion('');
    setTitle('');
    setDescription('');
    setChanges([{ type: 'feature', text: '' }]);
    loadEntries();
  }

  async function handlePublish(id: string) {
    await publishChangelogEntry(id);
    loadEntries();
  }

  const typeColors: Record<string, { bg: string; color: string }> = {
    feature: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
    improvement: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
    fix: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowForm(!showForm)}
        className="rounded-lg px-4 py-2 text-sm font-medium text-black transition-colors"
        style={{ background: AMBER }}
      >
        {showForm ? 'Cancelar' : '+ Nova entrada'}
      </button>

      {showForm && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>Versao</label>
              <input
                type="text"
                value={version}
                onChange={e => setVersion(e.target.value)}
                placeholder="0.9.3"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>Titulo</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Titulo da release"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>Descricao (markdown)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
              style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>Mudancas</label>
            {changes.map((change, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <select
                  value={change.type}
                  onChange={e => {
                    const updated = [...changes];
                    updated[i] = { ...change, type: e.target.value as 'fix' | 'feature' | 'improvement' };
                    setChanges(updated);
                  }}
                  className="rounded-lg px-2 py-2 text-xs outline-none"
                  style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
                >
                  <option value="feature">Novo</option>
                  <option value="improvement">Melhoria</option>
                  <option value="fix">Correcao</option>
                </select>
                <input
                  type="text"
                  value={change.text}
                  onChange={e => {
                    const updated = [...changes];
                    updated[i] = { ...change, text: e.target.value };
                    setChanges(updated);
                  }}
                  placeholder="Descricao da mudanca"
                  className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
                />
              </div>
            ))}
            <button
              onClick={() => setChanges([...changes, { type: 'feature', text: '' }])}
              className="text-xs font-medium"
              style={{ color: AMBER }}
            >
              + Adicionar mudanca
            </button>
          </div>
          <button
            onClick={handleSaveDraft}
            disabled={!version || !title}
            className="rounded-lg px-4 py-2 text-sm font-medium text-black transition-colors disabled:opacity-40"
            style={{ background: AMBER }}
          >
            Salvar rascunho
          </button>
        </div>
      )}

      {/* Entries list */}
      {loading ? <LoadingSpinner /> : (
        <div className="space-y-2">
          {entries.length === 0 && (
            <p className="py-8 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>Nenhuma entrada no changelog.</p>
          )}
          {entries.map(entry => (
            <div key={entry.id} className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-md px-2 py-0.5 text-xs font-bold" style={{ background: 'rgba(245,158,11,0.15)', color: AMBER }}>
                    v{entry.version}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    {entry.published_at ? new Date(entry.published_at).toLocaleDateString('pt-BR') : 'Rascunho'}
                  </span>
                  {entry.is_draft && (
                    <span className="rounded px-1.5 py-0.5 text-[10px] font-bold" style={{ background: 'rgba(245,158,11,0.15)', color: AMBER }}>
                      DRAFT
                    </span>
                  )}
                </div>
                {entry.is_draft && (
                  <button
                    onClick={() => handlePublish(entry.id)}
                    className="rounded-md px-3 py-1 text-xs font-medium text-black"
                    style={{ background: AMBER }}
                  >
                    Publicar
                  </button>
                )}
              </div>
              <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--bb-ink-100)' }}>{entry.title}</h4>
              <div className="space-y-1">
                {entry.changes.map((change, i) => {
                  const tc = typeColors[change.type] || typeColors.improvement;
                  return (
                    <div key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold" style={{ background: tc.bg, color: tc.color }}>
                        {change.type === 'feature' ? 'Novo' : change.type === 'fix' ? 'Fix' : 'Melhoria'}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--bb-ink-80)' }}>{change.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══ SHARED COMPONENTS ═══
function KpiCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: 'var(--bb-depth-2)',
        border: highlight ? '1px solid #ef4444' : '1px solid var(--bb-glass-border)',
      }}
    >
      <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{label}</p>
      <p className="text-xl font-bold" style={{ color: highlight ? '#ef4444' : AMBER }}>{value}</p>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" style={{ color: AMBER }} />
    </div>
  );
}

// ═══ MAIN PAGE ═══
export default function BetaDashboardPage() {
  const [tab, setTab] = useState<Tab>('Overview');

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black" style={{ color: 'var(--bb-ink-100)' }}>Beta Program</h1>
        <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>Monitoramento do soft launch com academias reais</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl p-1" style={{ background: 'var(--bb-depth-2)' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{
              background: tab === t ? AMBER : 'transparent',
              color: tab === t ? '#000' : 'var(--bb-ink-60)',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'Overview' && <OverviewTab />}
      {tab === 'Feedback' && <FeedbackTab />}
      {tab === 'NPS' && <NpsTab />}
      {tab === 'Analytics' && <AnalyticsTab />}
      {tab === 'Changelog' && <ChangelogTab />}
    </div>
  );
}

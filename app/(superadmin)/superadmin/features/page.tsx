'use client';

import { useState, useEffect, useCallback, type CSSProperties } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import {
  listFeatureFlags,
  toggleFeatureGlobal,
  updateFeatureFlag,
  createFeatureFlag,
  type FeatureWithStats,
  type FeatureFlag,
  type CategoriaFeature,
} from '@/lib/api/superadmin-features.service';
import { translateError } from '@/lib/utils/error-translator';

// ── Constants ───────────────────────────────────────────────────────────

const CATEGORIA_STYLES: Record<CategoriaFeature, { bg: string; text: string; label: string }> = {
  core: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', label: 'Core' },
  premium: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', label: 'Premium' },
  beta: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', label: 'Beta' },
  experimental: { bg: 'rgba(168,85,247,0.15)', text: '#a855f7', label: 'Experimental' },
};

const PLANOS_ALL = ['Starter', 'Pro', 'Black Belt', 'Enterprise'];

function adoptionColor(pct: number): string {
  if (pct >= 70) return '#22c55e';
  if (pct >= 30) return '#f59e0b';
  return '#ef4444';
}

// ── Page ────────────────────────────────────────────────────────────────

export default function FeaturesPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [features, setFeatures] = useState<FeatureWithStats[]>([]);

  // Configure modal
  const [configFeature, setConfigFeature] = useState<FeatureWithStats | null>(null);
  const [cfgNome, setCfgNome] = useState('');
  const [cfgDescricao, setCfgDescricao] = useState('');
  const [cfgCategoria, setCfgCategoria] = useState<CategoriaFeature>('core');
  const [cfgStatusGlobal, setCfgStatusGlobal] = useState(false);
  const [cfgPlanos, setCfgPlanos] = useState<string[]>([]);
  const [cfgIncluidas, setCfgIncluidas] = useState('');
  const [cfgExcluidas, setCfgExcluidas] = useState('');
  const [cfgRollout, setCfgRollout] = useState(100);
  const [saving, setSaving] = useState(false);

  // New feature modal
  const [showNew, setShowNew] = useState(false);
  const [newNome, setNewNome] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newDescricao, setNewDescricao] = useState('');
  const [newCategoria, setNewCategoria] = useState<CategoriaFeature>('core');
  const [newStatusGlobal, setNewStatusGlobal] = useState(true);
  const [newPlanos, setNewPlanos] = useState<string[]>([]);
  const [newIncluidas, setNewIncluidas] = useState('');
  const [newExcluidas, setNewExcluidas] = useState('');
  const [newRollout, setNewRollout] = useState(100);
  const [creating, setCreating] = useState(false);

  // Toggle loading
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const data = await listFeatureFlags();
      setFeatures(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Helpers ───────────────────────────────────────────────────────────

  function openConfig(feat: FeatureWithStats) {
    setConfigFeature(feat);
    setCfgNome(feat.nome);
    setCfgDescricao(feat.descricao);
    setCfgCategoria(feat.categoria);
    setCfgStatusGlobal(feat.statusGlobal);
    setCfgPlanos([...feat.regras.planos]);
    setCfgIncluidas(feat.regras.academiasIncluidas.join(', '));
    setCfgExcluidas(feat.regras.academiasExcluidas.join(', '));
    setCfgRollout(feat.rolloutPercentual);
  }

  function closeConfig() {
    setConfigFeature(null);
  }

  function resetNewForm() {
    setNewNome('');
    setNewSlug('');
    setNewDescricao('');
    setNewCategoria('core');
    setNewStatusGlobal(true);
    setNewPlanos([]);
    setNewIncluidas('');
    setNewExcluidas('');
    setNewRollout(100);
    setShowNew(false);
  }

  function togglePlano(plano: string, setter: React.Dispatch<React.SetStateAction<string[]>>) {
    setter((prev) =>
      prev.includes(plano) ? prev.filter((p) => p !== plano) : [...prev, plano],
    );
  }

  // Compute academy preview count
  function previewCount(): number {
    // Simplified preview: rollout percentage of 62 total academies
    return Math.round((cfgRollout / 100) * 62);
  }

  function previewCountNew(): number {
    return Math.round((newRollout / 100) * 62);
  }

  // ── Actions ───────────────────────────────────────────────────────────

  async function handleToggle(feat: FeatureWithStats) {
    setTogglingId(feat.id);
    try {
      const updated = await toggleFeatureGlobal(feat.id, !feat.statusGlobal);
      setFeatures((prev) =>
        prev.map((f) => f.id === feat.id ? { ...f, ...updated } : f),
      );
      toast(
        updated.statusGlobal
          ? `Feature "${feat.nome}" ativada.`
          : `Feature "${feat.nome}" desativada.`,
        'success',
      );
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleSaveConfig() {
    if (!configFeature) return;
    setSaving(true);
    try {
      const payload: Partial<FeatureFlag> = {
        nome: cfgNome.trim(),
        descricao: cfgDescricao.trim(),
        categoria: cfgCategoria,
        statusGlobal: cfgStatusGlobal,
        regras: {
          planos: cfgPlanos,
          academiasIncluidas: cfgIncluidas.split(',').map((s) => s.trim()).filter(Boolean),
          academiasExcluidas: cfgExcluidas.split(',').map((s) => s.trim()).filter(Boolean),
        },
        rolloutPercentual: cfgRollout,
      };
      const updated = await updateFeatureFlag(configFeature.id, payload);
      setFeatures((prev) =>
        prev.map((f) => f.id === configFeature.id ? { ...f, ...updated } : f),
      );
      toast('Feature atualizada!', 'success');
      closeConfig();
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateNew() {
    if (!newNome.trim()) {
      toast('Nome e obrigatorio.', 'error');
      return;
    }
    if (!newSlug.trim()) {
      toast('Slug e obrigatorio.', 'error');
      return;
    }
    setCreating(true);
    try {
      const payload: Omit<FeatureFlag, 'id' | 'criadoEm' | 'atualizadoEm'> = {
        nome: newNome.trim(),
        slug: newSlug.trim(),
        descricao: newDescricao.trim(),
        categoria: newCategoria,
        statusGlobal: newStatusGlobal,
        regras: {
          planos: newPlanos,
          academiasIncluidas: newIncluidas.split(',').map((s) => s.trim()).filter(Boolean),
          academiasExcluidas: newExcluidas.split(',').map((s) => s.trim()).filter(Boolean),
        },
        rolloutPercentual: newRollout,
      };
      const created = await createFeatureFlag(payload);
      const withStats: FeatureWithStats = {
        ...created,
        stats: {
          featureSlug: created.slug,
          totalAcademiasComAcesso: 0,
          totalAcademiasUsando: 0,
          taxaAdocao: 0,
          ultimoUso: new Date().toISOString(),
        },
      };
      setFeatures((prev) => [withStats, ...prev]);
      toast('Feature criada!', 'success');
      resetNewForm();
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setCreating(false);
    }
  }

  // ── Overview stats ────────────────────────────────────────────────────

  const totalFeatures = features.length;
  const coreCount = features.filter((f) => f.categoria === 'core').length;
  const premiumCount = features.filter((f) => f.categoria === 'premium').length;
  const betaCount = features.filter((f) => f.categoria === 'beta').length;
  const experimentalCount = features.filter((f) => f.categoria === 'experimental').length;
  const avgAdoption = totalFeatures > 0
    ? Math.round(features.reduce((sum, f) => sum + f.stats.taxaAdocao, 0) / totalFeatures)
    : 0;

  // ── Loading ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} variant="card" className="h-20" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="table-row" className="h-14" />
          ))}
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────

  const inputStyle: CSSProperties = {
    background: 'var(--bb-depth-2)',
    color: 'var(--bb-ink-100)',
    border: '1px solid var(--bb-glass-border)',
  };

  const overviewCards = [
    { label: 'Total features', value: totalFeatures, color: '#f59e0b' },
    { label: 'Core', value: coreCount, color: '#3b82f6' },
    { label: 'Premium', value: premiumCount, color: '#22c55e' },
    { label: 'Beta', value: betaCount, color: '#f59e0b' },
    { label: 'Experimental', value: experimentalCount, color: '#a855f7' },
    { label: 'Media adocao', value: `${avgAdoption}%`, color: avgAdoption >= 50 ? '#22c55e' : '#f59e0b' },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            Feature Flags
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Controle de funcionalidades da plataforma
          </p>
        </div>
        <Button
          onClick={() => setShowNew(true)}
          style={{ background: '#f59e0b', color: '#fff' }}
        >
          + Nova Feature
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {overviewCards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg p-3 text-center"
            style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}
          >
            <p className="text-xl font-bold" style={{ color: card.color }}>
              {card.value}
            </p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* Features Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
              {['Feature', 'Categoria', 'Planos', 'Rollout %', 'Adocao %', 'Toggle Global', ''].map((h) => (
                <th
                  key={h}
                  className="px-3 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--bb-ink-40)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feat) => {
              const cat = CATEGORIA_STYLES[feat.categoria];
              const adoption = feat.stats.taxaAdocao;
              const aColor = adoptionColor(adoption);
              const isToggling = togglingId === feat.id;

              return (
                <tr
                  key={feat.id}
                  className="transition-colors"
                  style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = 'var(--bb-depth-2)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = 'transparent';
                  }}
                >
                  {/* Name */}
                  <td className="px-3 py-3">
                    <p className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                      {feat.nome}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      {feat.slug}
                    </p>
                  </td>

                  {/* Categoria */}
                  <td className="px-3 py-3">
                    <span
                      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ background: cat.bg, color: cat.text }}
                    >
                      {cat.label}
                    </span>
                  </td>

                  {/* Planos */}
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {feat.regras.planos.length > 0 ? feat.regras.planos.map((p) => (
                        <span
                          key={p}
                          className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                          style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}
                        >
                          {p}
                        </span>
                      )) : (
                        <span className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
                          Todos
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Rollout */}
                  <td className="px-3 py-3">
                    <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                      {feat.rolloutPercentual}%
                    </span>
                  </td>

                  {/* Adocao */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-16 overflow-hidden rounded-full"
                        style={{ background: 'var(--bb-depth-4)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${adoption}%`, background: aColor }}
                        />
                      </div>
                      <span className="text-xs font-medium tabular-nums" style={{ color: aColor }}>
                        {adoption}%
                      </span>
                    </div>
                  </td>

                  {/* Toggle */}
                  <td className="px-3 py-3">
                    <button
                      disabled={isToggling}
                      onClick={() => handleToggle(feat)}
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50"
                      style={{
                        background: feat.statusGlobal ? '#f59e0b' : 'var(--bb-depth-4)',
                        border: `1px solid ${feat.statusGlobal ? '#f59e0b' : 'var(--bb-glass-border)'}`,
                      }}
                      aria-label={`Toggle ${feat.nome}`}
                    >
                      <span
                        className="inline-block h-4 w-4 rounded-full transition-transform"
                        style={{
                          background: '#fff',
                          transform: feat.statusGlobal ? 'translateX(22px)' : 'translateX(3px)',
                        }}
                      />
                    </button>
                  </td>

                  {/* Configurar */}
                  <td className="px-3 py-3">
                    <button
                      onClick={() => openConfig(feat)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                      style={{
                        background: 'rgba(245,158,11,0.1)',
                        color: '#f59e0b',
                        border: '1px solid rgba(245,158,11,0.3)',
                      }}
                    >
                      Configurar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {features.length === 0 && (
          <div className="py-12 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
            Nenhuma feature cadastrada.
          </div>
        )}
      </div>

      {/* ─── Configure Modal ───────────────────────────────────────────── */}
      <Modal open={!!configFeature} onClose={closeConfig} title="Configurar Feature">
        {configFeature && (
          <div className="space-y-4">
            {/* Nome */}
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                Nome
              </label>
              <input
                type="text"
                value={cfgNome}
                onChange={(e) => setCfgNome(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>

            {/* Descricao */}
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                Descricao
              </label>
              <textarea
                value={cfgDescricao}
                onChange={(e) => setCfgDescricao(e.target.value)}
                rows={2}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                Categoria
              </label>
              <select
                value={cfgCategoria}
                onChange={(e) => setCfgCategoria(e.target.value as CategoriaFeature)}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
              >
                <option value="core">Core</option>
                <option value="premium">Premium</option>
                <option value="beta">Beta</option>
                <option value="experimental">Experimental</option>
              </select>
            </div>

            {/* Status Global */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                Status Global
              </label>
              <button
                onClick={() => setCfgStatusGlobal(!cfgStatusGlobal)}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                style={{
                  background: cfgStatusGlobal ? '#f59e0b' : 'var(--bb-depth-4)',
                  border: `1px solid ${cfgStatusGlobal ? '#f59e0b' : 'var(--bb-glass-border)'}`,
                }}
              >
                <span
                  className="inline-block h-4 w-4 rounded-full transition-transform"
                  style={{
                    background: '#fff',
                    transform: cfgStatusGlobal ? 'translateX(22px)' : 'translateX(3px)',
                  }}
                />
              </button>
            </div>

            {/* Planos */}
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                Planos
              </label>
              <div className="flex flex-wrap gap-2">
                {PLANOS_ALL.map((plano) => (
                  <label
                    key={plano}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer"
                    style={{
                      background: cfgPlanos.includes(plano) ? 'rgba(245,158,11,0.12)' : 'var(--bb-depth-4)',
                      color: cfgPlanos.includes(plano) ? '#f59e0b' : 'var(--bb-ink-60)',
                      border: `1px solid ${cfgPlanos.includes(plano) ? '#f59e0b' : 'var(--bb-glass-border)'}`,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={cfgPlanos.includes(plano)}
                      onChange={() => togglePlano(plano, setCfgPlanos)}
                      className="hidden"
                    />
                    {plano}
                  </label>
                ))}
              </div>
            </div>

            {/* Academias incluidas */}
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                Academias incluidas
              </label>
              <input
                type="text"
                value={cfgIncluidas}
                onChange={(e) => setCfgIncluidas(e.target.value)}
                placeholder="IDs separados por virgula"
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>

            {/* Academias excluidas */}
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                Academias excluidas
              </label>
              <input
                type="text"
                value={cfgExcluidas}
                onChange={(e) => setCfgExcluidas(e.target.value)}
                placeholder="IDs separados por virgula"
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>

            {/* Rollout % */}
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                Rollout %
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={cfgRollout}
                  onChange={(e) => setCfgRollout(Number(e.target.value))}
                  className="flex-1 accent-amber-500"
                />
                <span
                  className="w-12 text-center text-sm font-bold tabular-nums"
                  style={{ color: '#f59e0b' }}
                >
                  {cfgRollout}%
                </span>
              </div>
              <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                Esta configuracao da acesso a {previewCount()} academias
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" className="flex-1" onClick={closeConfig}>
                Cancelar
              </Button>
              <Button
                className="flex-1"
                loading={saving}
                onClick={handleSaveConfig}
                style={{ background: '#f59e0b', color: '#fff' }}
              >
                Salvar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── New Feature Modal ─────────────────────────────────────────── */}
      <Modal open={showNew} onClose={resetNewForm} title="Nova Feature">
        <div className="space-y-4">
          {/* Nome */}
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Nome *
            </label>
            <input
              type="text"
              value={newNome}
              onChange={(e) => setNewNome(e.target.value)}
              placeholder="Ex: Streaming ao Vivo"
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>

          {/* Slug */}
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Slug *
            </label>
            <input
              type="text"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder="Ex: streaming-ao-vivo"
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>

          {/* Descricao */}
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Descricao
            </label>
            <textarea
              value={newDescricao}
              onChange={(e) => setNewDescricao(e.target.value)}
              rows={2}
              placeholder="Descricao da funcionalidade..."
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Categoria
            </label>
            <select
              value={newCategoria}
              onChange={(e) => setNewCategoria(e.target.value as CategoriaFeature)}
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={inputStyle}
            >
              <option value="core">Core</option>
              <option value="premium">Premium</option>
              <option value="beta">Beta</option>
              <option value="experimental">Experimental</option>
            </select>
          </div>

          {/* Status Global */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Status Global
            </label>
            <button
              onClick={() => setNewStatusGlobal(!newStatusGlobal)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{
                background: newStatusGlobal ? '#f59e0b' : 'var(--bb-depth-4)',
                border: `1px solid ${newStatusGlobal ? '#f59e0b' : 'var(--bb-glass-border)'}`,
              }}
            >
              <span
                className="inline-block h-4 w-4 rounded-full transition-transform"
                style={{
                  background: '#fff',
                  transform: newStatusGlobal ? 'translateX(22px)' : 'translateX(3px)',
                }}
              />
            </button>
          </div>

          {/* Planos */}
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Planos
            </label>
            <div className="flex flex-wrap gap-2">
              {PLANOS_ALL.map((plano) => (
                <label
                  key={plano}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer"
                  style={{
                    background: newPlanos.includes(plano) ? 'rgba(245,158,11,0.12)' : 'var(--bb-depth-4)',
                    color: newPlanos.includes(plano) ? '#f59e0b' : 'var(--bb-ink-60)',
                    border: `1px solid ${newPlanos.includes(plano) ? '#f59e0b' : 'var(--bb-glass-border)'}`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={newPlanos.includes(plano)}
                    onChange={() => togglePlano(plano, setNewPlanos)}
                    className="hidden"
                  />
                  {plano}
                </label>
              ))}
            </div>
          </div>

          {/* Academias incluidas */}
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Academias incluidas
            </label>
            <input
              type="text"
              value={newIncluidas}
              onChange={(e) => setNewIncluidas(e.target.value)}
              placeholder="IDs separados por virgula"
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>

          {/* Academias excluidas */}
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Academias excluidas
            </label>
            <input
              type="text"
              value={newExcluidas}
              onChange={(e) => setNewExcluidas(e.target.value)}
              placeholder="IDs separados por virgula"
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>

          {/* Rollout % */}
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Rollout %
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                value={newRollout}
                onChange={(e) => setNewRollout(Number(e.target.value))}
                className="flex-1 accent-amber-500"
              />
              <span
                className="w-12 text-center text-sm font-bold tabular-nums"
                style={{ color: '#f59e0b' }}
              >
                {newRollout}%
              </span>
            </div>
            <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
              Esta configuracao da acesso a {previewCountNew()} academias
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={resetNewForm}>
              Cancelar
            </Button>
            <Button
              className="flex-1"
              loading={creating}
              disabled={!newNome.trim() || !newSlug.trim()}
              onClick={handleCreateNew}
              style={{ background: '#f59e0b', color: '#fff' }}
            >
              Criar Feature
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

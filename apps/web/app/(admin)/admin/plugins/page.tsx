'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Plugin, PluginCategory } from '@/lib/types/plugins';
import { ComingSoon } from '@/components/shared/ComingSoon';
import {
  listPlugins,
  installPlugin,
  uninstallPlugin,
  updatePluginConfig,
} from '@/lib/api/plugins.service';

const CATEGORY_LABELS: Record<PluginCategory, string> = {
  analytics: 'Analytics',
  communication: 'Comunicacao',
  payment: 'Pagamento',
  automation: 'Automacao',
  integration: 'Integracao',
};

const ALL_CATEGORIES: PluginCategory[] = ['analytics', 'communication', 'payment', 'automation', 'integration'];

export default function PluginsPage() {
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<PluginCategory | 'all'>('all');
  const [configModal, setConfigModal] = useState<Plugin | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string | boolean | number>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);
  useEffect(() => {
    listPlugins().then((p) => {
      setPlugins(p);
    }).catch((err) => {
      console.error('[PluginsPage]', err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const filtered = plugins.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const handleToggle = useCallback(async (plugin: Plugin) => {
    if (plugin.status === 'active') {
      await uninstallPlugin(plugin.id);
      setPlugins((prev) =>
        prev.map((p) => (p.id === plugin.id ? { ...p, status: 'inactive' as const, installedAt: null } : p))
      );
    } else {
      const updated = await installPlugin(plugin.id);
      setPlugins((prev) =>
        prev.map((p) => (p.id === plugin.id ? updated : p))
      );
    }
  }, []);

  const openConfig = useCallback((plugin: Plugin) => {
    setConfigModal(plugin);
    setConfigValues({ ...plugin.config });
  }, []);

  const handleSaveConfig = useCallback(async () => {
    if (!configModal) return;
    setSaving(true);
    const updated = await updatePluginConfig(configModal.id, configValues);
    setPlugins((prev) =>
      prev.map((p) => (p.id === configModal.id ? updated : p))
    );
    setSaving(false);
    setConfigModal(null);
  }, [configModal, configValues]);

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/admin" backLabel="Voltar ao Dashboard" />;
  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <PageHeader title="Plugins" subtitle="Gerencie extensoes e integracoes da plataforma" />

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Buscar plugins..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-bb-gray-200 px-4 py-2 text-sm sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              categoryFilter === 'all'
                ? 'bg-bb-red text-white'
                : 'bg-bb-gray-100 text-bb-gray-600 hover:bg-bb-gray-200'
            }`}
          >
            Todos
          </button>
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-bb-red text-white'
                  : 'bg-bb-gray-100 text-bb-gray-600 hover:bg-bb-gray-200'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Plugin Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((plugin) => (
          <div
            key={plugin.id}
            className="flex flex-col rounded-xl border border-bb-gray-200 p-5 transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bb-gray-100 text-bb-gray-600">
                <span className="text-lg font-bold">{plugin.name.charAt(0)}</span>
              </div>
              <Badge variant={plugin.status === 'active' ? 'active' : 'inactive'}>
                {plugin.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <h3 className="mb-1 font-semibold text-bb-gray-900">{plugin.name}</h3>
            <p className="mb-2 text-xs text-bb-gray-500">{CATEGORY_LABELS[plugin.category]} &middot; v{plugin.version}</p>
            <p className="mb-4 flex-1 text-sm text-bb-gray-600">{plugin.description}</p>
            <div className="flex gap-2">
              <Button
                variant={plugin.status === 'active' ? 'danger' : 'primary'}
                onClick={() => handleToggle(plugin)}
              >
                {plugin.status === 'active' ? 'Desinstalar' : 'Instalar'}
              </Button>
              {plugin.status === 'active' && (
                <Button variant="ghost" onClick={() => openConfig(plugin)}>
                  Configurar
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-bb-gray-500">
          Nenhum plugin encontrado.
        </div>
      )}

      {/* Config Modal */}
      {configModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-lg rounded-2xl p-6 shadow-xl" style={{ background: 'var(--bb-depth-1)' }}>
            <h2 className="mb-4 text-lg font-bold text-bb-gray-900">
              Configurar {configModal.name}
            </h2>
            <div className="space-y-4">
              {configModal.configSchema.map((field) => (
                <div key={field.key}>
                  <label className="mb-1 block text-sm font-medium text-bb-gray-700">
                    {field.label} {field.required && <span className="text-bb-red">*</span>}
                  </label>
                  {field.type === 'boolean' ? (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={Boolean(configValues[field.key] ?? field.defaultValue)}
                        onChange={(e) =>
                          setConfigValues((prev) => ({ ...prev, [field.key]: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-bb-gray-300"
                      />
                      <span className="text-sm text-bb-gray-600">Ativado</span>
                    </label>
                  ) : field.type === 'select' ? (
                    <select
                      value={String(configValues[field.key] ?? field.defaultValue ?? '')}
                      onChange={(e) =>
                        setConfigValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      className="w-full rounded-lg border border-bb-gray-200 px-3 py-2 text-sm"
                    >
                      <option value="">Selecione...</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'number' ? (
                    <input
                      type="number"
                      value={Number(configValues[field.key] ?? field.defaultValue ?? 0)}
                      onChange={(e) =>
                        setConfigValues((prev) => ({ ...prev, [field.key]: Number(e.target.value) }))
                      }
                      className="w-full rounded-lg border border-bb-gray-200 px-3 py-2 text-sm"
                    />
                  ) : (
                    <input
                      type="text"
                      value={String(configValues[field.key] ?? field.defaultValue ?? '')}
                      onChange={(e) =>
                        setConfigValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      className="w-full rounded-lg border border-bb-gray-200 px-3 py-2 text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfigModal(null)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSaveConfig}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

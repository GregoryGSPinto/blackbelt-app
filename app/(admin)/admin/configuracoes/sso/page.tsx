'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import type { SSOConfig, SSOProvider } from '@/lib/api/sso.service';
import { getSSOConfig, updateSSOConfig, testSSOConnection } from '@/lib/api/sso.service';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { ComingSoon } from '@/components/shared/ComingSoon';

const PROVIDERS: { value: SSOProvider; label: string }[] = [
  { value: 'google', label: 'Google Workspace' },
  { value: 'azure', label: 'Microsoft Azure AD' },
  { value: 'saml', label: 'SAML 2.0 Genérico' },
];

export default function SSOConfigPage() {
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [config, setConfig] = useState<SSOConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error: string | null } | null>(null);

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);
  useEffect(() => {
    getSSOConfig(getActiveAcademyId()).then((c) => { setConfig(c); }).catch((err) => { console.error('[SSOConfigPage]', err); }).finally(() => { setLoading(false); });
  }, []);

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    const updated = await updateSSOConfig(getActiveAcademyId(), config);
    setConfig(updated);
    setSaving(false);
  }

  async function handleTest() {
    const result = await testSSOConnection(getActiveAcademyId());
    setTestResult(result);
  }

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/admin" backLabel="Voltar ao Dashboard" />;
  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!config) return <div className="p-6 text-bb-gray-500">SSO disponível apenas no plano Enterprise.</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <PageHeader title="Single Sign-On (SSO)" subtitle="Configure login corporativo para sua academia" />

      <div className="rounded-xl border border-bb-gray-200 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-bb-gray-900">Ativar SSO</h3>
            <p className="text-sm text-bb-gray-500">Permitir login via provedor corporativo</p>
          </div>
          <Toggle checked={config.enabled} onChange={(v) => setConfig({ ...config, enabled: v })} label="Ativar SSO" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-bb-gray-700">Provedor</label>
          <select value={config.provider} onChange={(e) => setConfig({ ...config, provider: e.target.value as SSOProvider })} className="w-full rounded-lg border border-bb-gray-200 px-3 py-2">
            {PROVIDERS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-bb-gray-700">Client ID</label>
          <input value={config.clientId} onChange={(e) => setConfig({ ...config, clientId: e.target.value })} placeholder="Seu Client ID" className="w-full rounded-lg border border-bb-gray-200 px-3 py-2" />
        </div>

        {config.provider === 'azure' && (
          <div>
            <label className="mb-1 block text-sm font-medium text-bb-gray-700">Tenant ID</label>
            <input value={config.tenantId ?? ''} onChange={(e) => setConfig({ ...config, tenantId: e.target.value })} placeholder="Seu Tenant ID" className="w-full rounded-lg border border-bb-gray-200 px-3 py-2" />
          </div>
        )}

        {config.provider === 'saml' && (
          <div>
            <label className="mb-1 block text-sm font-medium text-bb-gray-700">Metadata URL</label>
            <input value={config.samlMetadataUrl ?? ''} onChange={(e) => setConfig({ ...config, samlMetadataUrl: e.target.value })} placeholder="https://idp.example.com/metadata" className="w-full rounded-lg border border-bb-gray-200 px-3 py-2" />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-bb-gray-900">Forçar SSO</h3>
            <p className="text-sm text-bb-gray-500">Desabilitar login com email/senha</p>
          </div>
          <Toggle checked={config.forceSSO} onChange={(v) => setConfig({ ...config, forceSSO: v })} label="Forçar SSO" />
        </div>
      </div>

      <div className="rounded-xl border border-bb-gray-200 p-4 space-y-3">
        <h3 className="font-medium text-bb-gray-900">Mapeamento de Roles</h3>
        <p className="text-sm text-bb-gray-500">Associe grupos do provedor a roles do BlackBelt</p>
        {Object.entries(config.roleMapping).map(([group, role]) => (
          <div key={group} className="flex items-center gap-2 text-sm">
            <span className="rounded bg-bb-gray-100 px-2 py-1">{group}</span>
            <span className="text-bb-gray-400">&rarr;</span>
            <span className="font-medium text-bb-gray-700">{role}</span>
          </div>
        ))}
      </div>

      {testResult && (
        <div className="rounded-xl border p-4" style={{ borderColor: testResult.success ? 'var(--bb-success)' : 'var(--bb-danger)', background: testResult.success ? 'color-mix(in srgb, var(--bb-success) 8%, transparent)' : 'color-mix(in srgb, var(--bb-danger) 8%, transparent)' }}>
          <p style={{ color: testResult.success ? 'var(--bb-success)' : 'var(--bb-danger)' }}>
            {testResult.success ? 'Conexão SSO funcionando!' : `Erro: ${testResult.error}`}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Configuração'}
        </Button>
        <Button variant="secondary" onClick={handleTest}>Testar Conexão</Button>
      </div>
    </div>
  );
}

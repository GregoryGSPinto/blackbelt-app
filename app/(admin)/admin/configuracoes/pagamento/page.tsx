'use client';

import { useState, useEffect, type CSSProperties } from 'react';
import {
  getGatewayConfig,
  saveGatewayConfig,
  testGatewayConnection,
  getGatewayStatus,
  syncCustomers,
  type GatewayStatus,
} from '@/lib/api/payment-gateway.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import {
  SettingsIcon,
  CheckCircleIcon,
  RefreshIcon,
  CreditCardIcon,
  DollarIcon,
} from '@/components/shell/icons';
import { translateError } from '@/lib/utils/error-translator';

// ── Constants ────────────────────────────────────────────────────────

const ACADEMY_ID = 'academy-bb-001';

const cardStyle: CSSProperties = {
  background: 'var(--bb-depth-3)',
  border: '1px solid var(--bb-glass-border)',
  borderRadius: 'var(--bb-radius-lg)',
};

const inputStyle: CSSProperties = {
  background: 'var(--bb-depth-2)',
  border: '1px solid var(--bb-glass-border)',
  borderRadius: 'var(--bb-radius-sm)',
  color: 'var(--bb-ink-100)',
};

const labelStyle: CSSProperties = {
  color: 'var(--bb-ink-80)',
};

// ── Loading skeleton ─────────────────────────────────────────────────

function PaymentSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Skeleton variant="text" className="h-8 w-64" />
      <Skeleton variant="text" className="h-4 w-80" />
      <Skeleton variant="card" className="h-24" />
      <Skeleton variant="card" className="h-64" />
      <Skeleton variant="card" className="h-40" />
    </div>
  );
}

// ── Toggle switch ────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ToggleSwitch({
  enabled,
  onToggle,
  label,
}: {
  enabled: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={onToggle}
      className="relative inline-flex h-7 w-12 flex-shrink-0 items-center transition-colors duration-200"
      style={{
        borderRadius: '9999px',
        background: enabled ? 'var(--bb-brand)' : 'var(--bb-ink-20)',
        minWidth: '48px',
        minHeight: '44px',
      }}
    >
      <span
        className="inline-block h-5 w-5 transform transition-transform duration-200"
        style={{
          borderRadius: '50%',
          background: '#fff',
          transform: enabled ? 'translateX(24px)' : 'translateX(4px)',
        }}
      />
    </button>
  );
}

// ── Eye icons for show/hide ──────────────────────────────────────────

function IconEye({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

// ── Main page component ──────────────────────────────────────────────

export default function AdminPagamentoConfigPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Form state
  const [provider, setProvider] = useState<'asaas' | 'stripe' | 'mock'>('asaas');
  const [apiKey, setApiKey] = useState('');
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');

  // Status
  const [status, setStatus] = useState<GatewayStatus | null>(null);
  const [lastSyncCount, setLastSyncCount] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [config, gatewayStatus] = await Promise.all([
          getGatewayConfig(ACADEMY_ID),
          getGatewayStatus(ACADEMY_ID),
        ]);
        if (config) {
          setProvider(config.provider);
          setApiKey(config.apiKey ?? '');
          setEnvironment(config.environment);
        }
        setStatus(gatewayStatus);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [toast]);

  // ── Handlers ────────────────────────────────────────────────────────

  async function handleTestConnection() {
    setTesting(true);
    try {
      const success = await testGatewayConnection({ provider, apiKey, environment });
      if (success) {
        toast('Conexao estabelecida com sucesso!', 'success');
        setStatus((prev) => prev ? { ...prev, connected: true, provider } : { connected: true, provider });
      } else {
        toast('Falha na conexao. Verifique sua API Key.', 'error');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setTesting(false);
    }
  }

  async function handleSyncCustomers() {
    setSyncing(true);
    try {
      const result = await syncCustomers(ACADEMY_ID);
      setLastSyncCount(result.synced);
      setStatus((prev) => prev ? { ...prev, lastSync: new Date().toISOString() } : prev);
      toast(`${result.synced} clientes sincronizados com sucesso!`, 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSyncing(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveGatewayConfig(ACADEMY_ID, {
        provider,
        apiKey,
        environment,
        academyId: ACADEMY_ID,
        connected: status?.connected ?? false,
      });
      toast('Configuracoes de pagamento salvas!', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  function formatLastSync(iso?: string): string {
    if (!iso) return 'Nunca sincronizado';
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // ── Loading ─────────────────────────────────────────────────────────

  if (loading) return <PaymentSkeleton />;

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen p-4 sm:p-6 animate-reveal overflow-x-hidden">
      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <CreditCardIcon className="h-6 w-6" style={{ color: 'var(--bb-brand)' }} />
          <h1
            className="font-display text-xl font-bold sm:text-2xl"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Configuracoes de Pagamento
          </h1>
        </div>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Configure o gateway de pagamento para cobrar mensalidades automaticamente
        </p>
      </div>

      <div data-stagger className="space-y-6 max-w-3xl">
        {/* ── Status card ──────────────────────────────────────────── */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <CheckCircleIcon className="h-4 w-4" style={{ color: 'var(--bb-ink-40)' }} />
            <h2
              className="font-display text-sm font-semibold uppercase"
              style={{ color: 'var(--bb-ink-60)', letterSpacing: '0.06em' }}
            >
              Status da Conexao
            </h2>
          </div>
          <div style={cardStyle} className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{
                    background: status?.connected ? '#22C55E' : '#EF4444',
                    boxShadow: status?.connected
                      ? '0 0 8px rgba(34,197,94,0.4)'
                      : '0 0 8px rgba(239,68,68,0.4)',
                  }}
                />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                    {status?.connected ? 'Conectado' : 'Desconectado'}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                    {status?.connected
                      ? `Gateway: ${status.provider.charAt(0).toUpperCase() + status.provider.slice(1)}`
                      : 'Nenhum gateway configurado'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  Ultima sincronizacao
                </p>
                <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                  {formatLastSync(status?.lastSync)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Gateway configuration ────────────────────────────────── */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" style={{ color: 'var(--bb-ink-40)' }} />
            <h2
              className="font-display text-sm font-semibold uppercase"
              style={{ color: 'var(--bb-ink-60)', letterSpacing: '0.06em' }}
            >
              Configuracao do Gateway
            </h2>
          </div>
          <div style={cardStyle} className="p-4 sm:p-6 space-y-5">
            {/* Provider select */}
            <div>
              <label className="mb-1 block text-sm font-medium" style={labelStyle}>
                Provedor de Pagamento
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as 'asaas' | 'stripe' | 'mock')}
                className="w-full px-3 py-2.5 text-sm outline-none transition-colors"
                style={inputStyle}
              >
                <option value="asaas">Asaas (recomendado para Brasil)</option>
                <option value="stripe">Stripe</option>
              </select>
            </div>

            {/* API Key */}
            <div>
              <label className="mb-1 block text-sm font-medium" style={labelStyle}>
                API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={provider === 'asaas' ? '$aact_xxxxxxxxxx...' : 'sk_live_xxxxxxxxxx...'}
                  className="w-full px-3 py-2.5 pr-12 text-sm font-mono outline-none transition-colors"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  aria-label={showApiKey ? 'Ocultar API Key' : 'Mostrar API Key'}
                  style={{ minHeight: '44px', minWidth: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {showApiKey ? (
                    <IconEyeOff size={16} color="var(--bb-ink-40)" />
                  ) : (
                    <IconEye size={16} color="var(--bb-ink-40)" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                {provider === 'asaas'
                  ? 'Encontre sua API Key em Minha Conta > Integracoes no painel do Asaas'
                  : 'Encontre sua API Key em Developers > API Keys no painel do Stripe'}
              </p>
            </div>

            {/* Environment toggle */}
            <div>
              <label className="mb-2 block text-sm font-medium" style={labelStyle}>
                Ambiente
              </label>
              <div
                className="inline-flex overflow-hidden"
                style={{
                  borderRadius: 'var(--bb-radius-sm)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setEnvironment('sandbox')}
                  className="px-4 py-2.5 text-sm font-medium transition-colors"
                  style={{
                    background: environment === 'sandbox' ? 'var(--bb-brand)' : 'var(--bb-depth-2)',
                    color: environment === 'sandbox' ? '#fff' : 'var(--bb-ink-60)',
                    minHeight: '44px',
                  }}
                >
                  Sandbox (teste)
                </button>
                <button
                  type="button"
                  onClick={() => setEnvironment('production')}
                  className="px-4 py-2.5 text-sm font-medium transition-colors"
                  style={{
                    background: environment === 'production' ? 'var(--bb-brand)' : 'var(--bb-depth-2)',
                    color: environment === 'production' ? '#fff' : 'var(--bb-ink-60)',
                    minHeight: '44px',
                  }}
                >
                  Producao
                </button>
              </div>
              {environment === 'sandbox' && (
                <p className="mt-2 text-xs" style={{ color: '#EAB308' }}>
                  Modo sandbox ativo — nenhuma cobranca real sera gerada
                </p>
              )}
              {environment === 'production' && (
                <p className="mt-2 text-xs" style={{ color: '#22C55E' }}>
                  Modo producao — cobrancas reais serao processadas
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── Actions ──────────────────────────────────────────────── */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <RefreshIcon className="h-4 w-4" style={{ color: 'var(--bb-ink-40)' }} />
            <h2
              className="font-display text-sm font-semibold uppercase"
              style={{ color: 'var(--bb-ink-60)', letterSpacing: '0.06em' }}
            >
              Acoes
            </h2>
          </div>
          <div style={cardStyle} className="p-4 sm:p-6 space-y-4">
            {/* Test connection */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                  Testar Conexao
                </p>
                <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                  Verifica se a API Key e valida e o gateway esta acessivel
                </p>
              </div>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing || !apiKey.trim()}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                  borderRadius: 'var(--bb-radius-sm)',
                  color: 'var(--bb-ink-100)',
                  minHeight: '44px',
                }}
              >
                <CheckCircleIcon className="h-4 w-4" />
                {testing ? 'Testando...' : 'Testar'}
              </button>
            </div>

            <div style={{ borderBottom: '1px solid var(--bb-glass-border)' }} />

            {/* Sync customers */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                  Sincronizar Clientes
                </p>
                <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                  Importa e sincroniza alunos com o gateway de pagamento
                </p>
                {lastSyncCount !== null && (
                  <p className="mt-1 text-xs font-medium" style={{ color: '#22C55E' }}>
                    {lastSyncCount} clientes sincronizados
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleSyncCustomers}
                disabled={syncing || !status?.connected}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                  borderRadius: 'var(--bb-radius-sm)',
                  color: 'var(--bb-ink-100)',
                  minHeight: '44px',
                }}
              >
                <RefreshIcon className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Sincronizando...' : 'Sincronizar'}
              </button>
            </div>
          </div>
        </section>

        {/* ── Webhook info ─────────────────────────────────────────── */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <DollarIcon className="h-4 w-4" style={{ color: 'var(--bb-ink-40)' }} />
            <h2
              className="font-display text-sm font-semibold uppercase"
              style={{ color: 'var(--bb-ink-60)', letterSpacing: '0.06em' }}
            >
              Webhook de Pagamento
            </h2>
          </div>
          <div
            className="p-4 sm:p-6"
            style={{
              background: 'var(--bb-brand-surface)',
              border: '1px solid var(--bb-brand)',
              borderRadius: 'var(--bb-radius-lg)',
            }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
              URL do Webhook
            </p>
            <div
              className="mt-2 flex items-center gap-2 overflow-hidden px-3 py-2.5 font-mono text-xs"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                borderRadius: 'var(--bb-radius-sm)',
                color: 'var(--bb-ink-80)',
              }}
            >
              <span className="truncate flex-1">
                https://blackbeltv2.vercel.app/api/webhooks/payment
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('https://blackbeltv2.vercel.app/api/webhooks/payment');
                  toast('URL copiada!', 'success');
                }}
                className="flex-shrink-0 text-xs font-medium transition-colors"
                style={{ color: 'var(--bb-brand)', minHeight: '44px', display: 'flex', alignItems: 'center' }}
              >
                Copiar
              </button>
            </div>
            <p className="mt-3 text-xs leading-relaxed" style={{ color: 'var(--bb-ink-60)' }}>
              Configure esta URL no painel do{' '}
              <strong style={{ color: 'var(--bb-ink-80)' }}>
                {provider === 'asaas' ? 'Asaas' : 'Stripe'}
              </strong>{' '}
              para receber notificacoes automaticas de pagamento. Quando um boleto for pago ou um PIX
              confirmado, o status da mensalidade sera atualizado automaticamente no BlackBelt.
            </p>
          </div>
        </section>

        {/* ── Save button ──────────────────────────────────────────── */}
        <div className="flex items-center gap-4 pb-8">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all disabled:opacity-50"
            style={{
              background: 'var(--bb-brand)',
              color: '#fff',
              borderRadius: 'var(--bb-radius-sm)',
              boxShadow: 'var(--bb-shadow-md)',
              minHeight: '44px',
            }}
          >
            <CreditCardIcon className="h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar Configuracoes'}
          </button>

          {status?.lastSync && (
            <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
              Ultima sincronizacao: {formatLastSync(status.lastSync)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

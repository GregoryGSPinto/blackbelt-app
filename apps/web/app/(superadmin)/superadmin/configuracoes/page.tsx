'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useToast } from '@/lib/hooks/useToast';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  SettingsSection,
  SettingsToggle,
  SettingsInput,
  SettingsAvatar,
} from '@/components/shared/settings';
import {
  getUserPreferences,
  changePassword,
  uploadAvatar,
} from '@/lib/api/preferences.service';
import type { UserPreferences } from '@/lib/types/preferences';
import { translateError } from '@/lib/utils/error-translator';
import { useAuth } from '@/lib/hooks/useAuth';
import { ErrorState } from '@/components/ui/ErrorState';
import { logServiceError } from '@/lib/api/errors';

// ── Constants ────────────────────────────────────────────────────────

const TABS = [
  { key: 'perfil', label: 'Meu Perfil' },
  { key: 'seguranca', label: 'Seguranca' },
  { key: 'plataforma', label: 'Plataforma' },
  { key: 'storage', label: 'Storage' },
  { key: 'apis', label: 'APIs' },
  { key: 'aparencia', label: 'Aparencia' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

type ThemeOption = 'light' | 'dark' | 'system';

const THEME_OPTIONS: { value: ThemeOption; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'system', label: 'Sistema' },
];

// ── Loading Skeleton ─────────────────────────────────────────────────

function SettingsSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Skeleton variant="text" className="h-8 w-48" />
      <div className="flex gap-2 overflow-x-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="text" className="h-10 w-28 flex-shrink-0" />
        ))}
      </div>
      <Skeleton variant="card" className="h-64" />
      <Skeleton variant="card" className="h-48" />
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────

export default function SuperadminConfiguracoesPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { profile, isLoading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('perfil');
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  useEffect(() => {
    if (authLoading) return;

    async function load() {
      if (!profile?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoadError(null);
        const p = await getUserPreferences(profile.id);
        setPrefs(p);
      } catch (err) {
        logServiceError(err, 'SuperadminConfiguracoesPage');
        setLoadError(translateError(err));
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [authLoading, profile?.id, toast]);

  async function handleSalvarSenha() {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      toast('Preencha todos os campos.', 'error');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      toast('As senhas nao coincidem.', 'error');
      return;
    }
    try {
      await changePassword(senhaAtual, novaSenha);
      toast('Senha alterada com sucesso!', 'success');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  if (loading || authLoading) return <SettingsSkeleton />;

  if (loadError || !profile?.id || !prefs) {
    return (
      <div className="p-4 sm:p-6">
        <ErrorState
          title="Configuracoes indisponiveis"
          description={loadError || 'Nao foi possivel carregar as configuracoes.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold sm:text-2xl" style={{ color: 'var(--bb-ink-100)' }}>
          Configuracoes do Superadmin
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Configuracoes globais da plataforma BlackBelt
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className="flex-shrink-0 px-4 py-2.5 text-sm font-medium transition-all duration-200"
            style={{
              borderRadius: 'var(--bb-radius-md)',
              background: activeTab === tab.key ? 'var(--bb-brand-surface)' : 'transparent',
              color: activeTab === tab.key ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
              border: activeTab === tab.key ? '1px solid var(--bb-brand)' : '1px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* ── Meu Perfil ─────────────────────────────────────────── */}
        {activeTab === 'perfil' && (
          <>
            <SettingsSection icon="user" title="Foto de Perfil">
              <SettingsAvatar
                name={profile.display_name || 'Superadmin'}
                onUpload={async (file) => {
                  try {
                    await uploadAvatar(profile.id, file);
                    toast('Avatar atualizado!', 'success');
                  } catch (err) {
                    toast(translateError(err), 'error');
                  }
                }}
                size="lg"
              />
            </SettingsSection>

            <SettingsSection icon="user" title="Informacoes Pessoais">
              <SettingsInput
                label="Nome completo"
                value={profile.display_name || 'Superadmin'}
                onSave={() => toast('Nome atualizado!', 'success')}
              />
              <SettingsInput
                label="Email"
                value="gregoryguimaraes12@gmail.com"
                type="email"
                onSave={() => toast('Email atualizado!', 'success')}
              />
            </SettingsSection>
          </>
        )}

        {/* ── Seguranca ──────────────────────────────────────────── */}
        {activeTab === 'seguranca' && (
          <>
            <SettingsSection icon="lock" title="Alterar Senha">
              <div className="space-y-3">
                <SettingsInput
                  label="Senha atual"
                  value={senhaAtual}
                  type="password"
                  placeholder="Senha atual"
                  onSave={(v) => setSenhaAtual(v)}
                />
                <SettingsInput
                  label="Nova senha"
                  value={novaSenha}
                  type="password"
                  placeholder="Nova senha (min. 12 caracteres)"
                  onSave={(v) => setNovaSenha(v)}
                  validation={(v) => (v.length < 12 ? 'Minimo 12 caracteres para superadmin' : null)}
                />
                <SettingsInput
                  label="Confirmar nova senha"
                  value={confirmarSenha}
                  type="password"
                  placeholder="Confirme a nova senha"
                  onSave={(v) => setConfirmarSenha(v)}
                />
                <button
                  type="button"
                  onClick={handleSalvarSenha}
                  className="mt-2 px-6 py-2.5 text-sm font-semibold text-white"
                  style={{ background: 'var(--bb-brand)', borderRadius: 'var(--bb-radius-md)' }}
                >
                  Alterar senha
                </button>
              </div>
            </SettingsSection>

            <SettingsSection icon="shield" title="Autenticacao Multi-Fator">
              <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                MFA e obrigatorio para contas superadmin.
              </p>
              <SettingsToggle
                label="MFA via TOTP"
                description="Autenticacao por app (Google Authenticator, Authy)"
                enabled={true}
                onChange={() => toast('MFA obrigatorio para superadmin', 'info')}
                disabled
              />
            </SettingsSection>
          </>
        )}

        {/* ── Plataforma ─────────────────────────────────────────── */}
        {activeTab === 'plataforma' && (
          <>
            <SettingsSection icon="server" title="Configuracoes da Plataforma">
              <SettingsToggle
                label="Modo manutencao"
                description="Colocar a plataforma em modo de manutencao"
                enabled={false}
                onChange={() => toast('Modo manutencao ativado', 'info')}
              />
              <SettingsToggle
                label="Registro de novas academias"
                description="Permitir que novas academias se cadastrem"
                enabled={true}
                onChange={() => toast('Salvo!', 'success')}
              />
              <SettingsToggle
                label="Periodo de trial"
                description="Permitir trial gratuito para novas academias"
                enabled={true}
                onChange={() => toast('Salvo!', 'success')}
              />
            </SettingsSection>

            <SettingsSection icon="server" title="Limites Globais">
              <SettingsInput
                label="Tamanho maximo de upload (MB)"
                value="500"
                type="number"
                onSave={() => toast('Salvo!', 'success')}
                suffix="MB"
              />
              <SettingsInput
                label="Maximo de academias por conta"
                value="10"
                type="number"
                onSave={() => toast('Salvo!', 'success')}
              />
              <SettingsInput
                label="Dias de trial padrao"
                value="14"
                type="number"
                onSave={() => toast('Salvo!', 'success')}
                suffix="dias"
              />
            </SettingsSection>

            <SettingsSection icon="server" title="Feature Flags">
              <SettingsToggle
                label="Marketplace"
                description="Habilitar modulo de marketplace"
                enabled={true}
                onChange={() => toast('Salvo!', 'success')}
              />
              <SettingsToggle
                label="IA Coach"
                description="Habilitar funcionalidades de IA"
                enabled={true}
                onChange={() => toast('Salvo!', 'success')}
              />
              <SettingsToggle
                label="Campeonatos"
                description="Habilitar modulo de campeonatos"
                enabled={true}
                onChange={() => toast('Salvo!', 'success')}
              />
              <SettingsToggle
                label="Wearables"
                description="Habilitar integracao com wearables"
                enabled={false}
                onChange={() => toast('Salvo!', 'success')}
              />
            </SettingsSection>
          </>
        )}

        {/* ── Storage ────────────────────────────────────────────── */}
        {activeTab === 'storage' && (
          <SettingsSection icon="database" title="Configuracao de Storage">
            <p className="mb-3 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Configure provedores de armazenamento para videos e arquivos.
            </p>
            <Link
              href="/superadmin/configuracoes/storage"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200"
              style={{ background: 'var(--bb-brand)', borderRadius: 'var(--bb-radius-md)' }}
            >
              Abrir configuracao de storage
              <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </SettingsSection>
        )}

        {/* ── APIs ───────────────────────────────────────────────── */}
        {activeTab === 'apis' && (
          <>
            <SettingsSection icon="code" title="Chaves de API">
              <p className="mb-3 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                Gerencie chaves de API para integracao com servicos externos.
              </p>
              <SettingsInput
                label="OpenAI API Key"
                value="sk-...redacted"
                type="password"
                onSave={() => toast('API key atualizada!', 'success')}
              />
              <SettingsInput
                label="Google Maps API Key"
                value="AIza...redacted"
                type="password"
                onSave={() => toast('API key atualizada!', 'success')}
              />
              <SettingsInput
                label="SendGrid API Key"
                value="SG...redacted"
                type="password"
                onSave={() => toast('API key atualizada!', 'success')}
              />
            </SettingsSection>

            <SettingsSection icon="code" title="Webhooks">
              <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                Configure webhooks para eventos da plataforma.
              </p>
              <SettingsToggle
                label="Webhook de eventos"
                description="Enviar eventos para URL externa"
                enabled={false}
                onChange={() => toast('Salvo!', 'success')}
              />
              <SettingsInput
                label="URL do webhook"
                value=""
                placeholder="https://..."
                onSave={() => toast('URL atualizada!', 'success')}
              />
            </SettingsSection>

            <SettingsSection icon="code" title="Rate Limiting">
              <SettingsInput
                label="Limite de requests por minuto"
                value="100"
                type="number"
                onSave={() => toast('Salvo!', 'success')}
                suffix="req/min"
              />
              <SettingsInput
                label="Limite de uploads por hora"
                value="50"
                type="number"
                onSave={() => toast('Salvo!', 'success')}
                suffix="uploads/h"
              />
            </SettingsSection>
          </>
        )}

        {/* ── Aparencia ──────────────────────────────────────────── */}
        {activeTab === 'aparencia' && (
          <SettingsSection icon="palette" title="Tema">
            <div className="flex gap-3">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTheme(opt.value)}
                  className="flex-1 py-3 text-sm font-semibold transition-all duration-200"
                  style={{
                    borderRadius: 'var(--bb-radius-md)',
                    background: theme === opt.value ? 'var(--bb-brand-surface)' : 'var(--bb-depth-4)',
                    color: theme === opt.value ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                    border: theme === opt.value ? '2px solid var(--bb-brand)' : '1px solid var(--bb-glass-border)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </SettingsSection>
        )}
      </div>
    </div>
  );
}

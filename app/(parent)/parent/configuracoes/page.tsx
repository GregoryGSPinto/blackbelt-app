'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useToast } from '@/lib/hooks/useToast';
import { ParentalControlPanel } from '@/components/parent/ParentalControlPanel';
import { Skeleton } from '@/components/ui/Skeleton';
import { TutorialSettings } from '@/components/shared/TutorialSettings';
import {
  SettingsSection,
  SettingsToggle,
  SettingsInput,
  SettingsAvatar,
  DangerZone,
} from '@/components/shared/settings';
import {
  getUserPreferences,
  updateUserPreferences,
  changePassword,
  exportUserData,
  deleteAccount,
  uploadAvatar,
} from '@/lib/api/preferences.service';
import type { UserPreferences } from '@/lib/types/preferences';
import { translateError } from '@/lib/utils/error-translator';
import { useAuth } from '@/lib/hooks/useAuth';

// ── Constants ────────────────────────────────────────────────────────

const TABS = [
  { key: 'perfil', label: 'Meu Perfil' },
  { key: 'filhos', label: 'Meus Filhos' },
  { key: 'controle_parental', label: 'Controle Parental' },
  { key: 'seguranca', label: 'Seguranca' },
  { key: 'notificacoes', label: 'Notificacoes' },
  { key: 'aparencia', label: 'Aparencia' },
  { key: 'avancado', label: 'Avancado' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

type ThemeOption = 'light' | 'dark' | 'system';

const THEME_OPTIONS: { value: ThemeOption; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'system', label: 'Sistema' },
];

const PLACEHOLDER_PARENT_NAME = 'Maria Silva';
const PLACEHOLDER_PARENT_EMAIL = 'maria@email.com';
const PLACEHOLDER_PARENT_PHONE = '(11) 96666-0000';

const MOCK_CHILDREN = [
  { id: 'child-1', name: 'Pedro Silva', age: 8, belt: 'Branca', avatar: null as string | null },
  { id: 'child-2', name: 'Ana Silva', age: 12, belt: 'Amarela', avatar: null as string | null },
  { id: 'child-3', name: 'Lucas Silva', age: 15, belt: 'Verde', avatar: null as string | null },
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

export default function ParentConfiguracoesPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { profile, isLoading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('perfil');
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const profileId = profile?.id ?? '';

  useEffect(() => {
    if (authLoading) return;

    async function load() {
      if (!profileId) {
        setLoading(false);
        return;
      }
      try {
        const p = await getUserPreferences(profileId);
        setPrefs(p);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [authLoading, profileId, toast]);

  const savePref = useCallback(
    async (partial: Partial<UserPreferences>) => {
      try {
        if (!profileId) throw new Error('Perfil ativo nao encontrado.');
        await updateUserPreferences(profileId, partial);
        setPrefs((p) => (p ? { ...p, ...partial } : p));
        toast('Salvo!', 'success');
      } catch (err) {
        toast(translateError(err), 'error');
      }
    },
    [profileId, toast],
  );

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

  if (loading || authLoading || !prefs) return <SettingsSkeleton />;

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold sm:text-2xl" style={{ color: 'var(--bb-ink-100)' }}>
          Configuracoes
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Gerencie sua conta e acompanhe seus filhos
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
                name={profile?.display_name || 'Responsavel'}
                onUpload={async (file) => {
                  try {
                    if (!profileId) throw new Error('Perfil ativo nao encontrado.');
                    await uploadAvatar(profileId, file);
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
                value={profile?.display_name || PLACEHOLDER_PARENT_NAME}
                onSave={() => toast('Nome atualizado!', 'success')}
              />
              <SettingsInput
                label="Email"
                value={PLACEHOLDER_PARENT_EMAIL}
                type="email"
                onSave={() => toast('Email atualizado!', 'success')}
              />
              <SettingsInput
                label="Telefone"
                value={PLACEHOLDER_PARENT_PHONE}
                type="tel"
                onSave={() => toast('Telefone atualizado!', 'success')}
              />
            </SettingsSection>
          </>
        )}

        {/* ── Meus Filhos ────────────────────────────────────────── */}
        {activeTab === 'filhos' && (
          <>
            {MOCK_CHILDREN.map((child) => (
              <SettingsSection key={child.id} icon="users" title={child.name}>
                <div className="flex items-center gap-4 mb-4">
                  <SettingsAvatar
                    name={child.name}
                    src={child.avatar ?? undefined}
                    onUpload={async () => {
                      toast('Avatar do filho atualizado!', 'success');
                    }}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                      {child.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                      {child.age} anos - Faixa {child.belt}
                    </p>
                  </div>
                </div>

                <SettingsToggle
                  label="Receber atualizacoes de frequencia"
                  description="Notificar quando o filho fizer check-in ou faltar"
                  enabled={true}
                  onChange={() => toast('Salvo!', 'success')}
                />
                <SettingsToggle
                  label="Receber avaliacoes do professor"
                  description="Notificar sobre novas avaliacoes"
                  enabled={true}
                  onChange={() => toast('Salvo!', 'success')}
                />
                <SettingsToggle
                  label="Receber relatorio mensal"
                  description="Resumo mensal por email"
                  enabled={true}
                  onChange={() => toast('Salvo!', 'success')}
                />
              </SettingsSection>
            ))}
            <Link
              href="/parent/filhos/novo"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold transition-opacity"
              style={{ background: 'var(--bb-brand)', color: '#fff' }}
            >
              + Adicionar Filho
            </Link>
          </>
        )}

        {/* ── Controle Parental ──────────────────────────────────── */}
        {activeTab === 'controle_parental' && (
          <>
            {MOCK_CHILDREN.filter((c) => c.age >= 13 && c.age <= 17).length === 0 ? (
              <div className="rounded-lg p-6 text-center" style={{ background: 'var(--bb-depth-1)', border: '1px solid var(--bb-glass-border)' }}>
                <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                  Controle parental disponivel apenas para filhos adolescentes (13-17 anos).
                </p>
              </div>
            ) : (
              MOCK_CHILDREN.filter((c) => c.age >= 13 && c.age <= 17).map((child) => (
                <ParentalControlPanel
                  key={child.id}
                  studentName={child.name}
                  profileId={child.id}
                  onSave={() => toast('Controle parental atualizado!', 'success')}
                />
              ))
            )}
          </>
        )}

        {/* ── Seguranca ──────────────────────────────────────────── */}
        {activeTab === 'seguranca' && (
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
                placeholder="Nova senha"
                onSave={(v) => setNovaSenha(v)}
                validation={(v) => (v.length < 8 ? 'Minimo 8 caracteres' : null)}
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
        )}

        {/* ── Notificacoes ───────────────────────────────────────── */}
        {activeTab === 'notificacoes' && (
          <>
            <SettingsSection icon="bell" title="Notificacoes Push">
              <SettingsToggle
                label="Notificacoes push"
                description="Receba alertas no dispositivo"
                enabled={prefs.notifications_push}
                onChange={(v) => savePref({ notifications_push: v })}
              />
              <SettingsToggle
                label="Sons"
                enabled={prefs.notifications_sound}
                onChange={(v) => savePref({ notifications_sound: v })}
              />
              <SettingsToggle
                label="Vibracao"
                enabled={prefs.notifications_vibration}
                onChange={(v) => savePref({ notifications_vibration: v })}
              />
            </SettingsSection>

            <SettingsSection icon="bell" title="Tipos de Notificacao">
              {Object.entries(prefs.notifications_app).map(([key, enabled]) => (
                <SettingsToggle
                  key={key}
                  label={key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  enabled={enabled}
                  onChange={(v) =>
                    savePref({ notifications_app: { ...prefs.notifications_app, [key]: v } })
                  }
                />
              ))}
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

        {/* ── Avancado ───────────────────────────────────────────── */}
        {activeTab === 'avancado' && (
          <>
            <TutorialSettings />

            <SettingsSection icon="settings" title="Exportacao de Dados (LGPD)">
              <p className="mb-3 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                Exporte todos os dados da sua conta e dos seus filhos.
              </p>
              <button
                type="button"
                onClick={async () => {
                  try {
                    if (!profileId) throw new Error('Perfil ativo nao encontrado.');
                    await exportUserData(profileId);
                    toast('Exportacao iniciada!', 'success');
                  } catch (err) {
                    toast(translateError(err), 'error');
                  }
                }}
                className="px-4 py-2 text-sm font-medium"
                style={{ background: 'var(--bb-depth-4)', borderRadius: 'var(--bb-radius-md)', color: 'var(--bb-ink-80)' }}
              >
                Exportar meus dados
              </button>
            </SettingsSection>

            <DangerZone
              items={[
                {
                  label: 'Excluir minha conta',
                  description: 'A solicitacao e registrada agora e a exclusao definitiva ocorre em ate 30 dias. Os vinculos de acesso do responsavel sao encerrados.',
                  action: async () => {
                    if (!profileId) throw new Error('Perfil ativo nao encontrado.');
                    await deleteAccount(profileId, 'EXCLUIR MINHA CONTA');
                    toast('Solicitacao registrada. A exclusao definitiva ocorre em ate 30 dias.', 'success');
                  },
                  confirmText: 'EXCLUIR MINHA CONTA',
                },
              ]}
            />
          </>
        )}
      </div>
    </div>
  );
}

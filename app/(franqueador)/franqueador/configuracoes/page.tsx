'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useToast } from '@/lib/hooks/useToast';
import { useAuth } from '@/lib/hooks/useAuth';
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

// ── Constants ────────────────────────────────────────────────────────

const TABS = [
  { key: 'perfil', label: 'Meu Perfil' },
  { key: 'seguranca', label: 'Seguranca' },
  { key: 'rede', label: 'Rede' },
  { key: 'notificacoes', label: 'Notificacoes' },
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
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="text" className="h-10 w-28 flex-shrink-0" />
        ))}
      </div>
      <Skeleton variant="card" className="h-64" />
      <Skeleton variant="card" className="h-48" />
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────

export default function FranqueadorConfiguracoesPage() {
  const { theme, setTheme } = useTheme();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('perfil');
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const profileId = profile?.id ?? '';

  useEffect(() => {
    async function load() {
      if (!profileId) return;
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
  }, [profileId]); // eslint-disable-line react-hooks/exhaustive-deps

  const savePref = useCallback(
    async (partial: Partial<UserPreferences>) => {
      if (!profileId) return;
      try {
        await updateUserPreferences(profileId, partial);
        setPrefs((p) => (p ? { ...p, ...partial } : p));
        toast('Salvo!', 'success');
      } catch (err) {
        toast(translateError(err), 'error');
      }
    },
    [toast, profileId],
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

  if (loading || !prefs) return <SettingsSkeleton />;

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold sm:text-2xl" style={{ color: 'var(--bb-ink-100)' }}>
          Configuracoes
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Gerencie configuracoes da rede de franquias
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
                name={profile?.display_name ?? 'Franqueador'}
                onUpload={async (file) => {
                  try {
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
                value={profile?.display_name ?? ''}
                onSave={() => toast('Nome atualizado!', 'success')}
              />
              <SettingsInput
                label="Email"
                value=""
                type="email"
                onSave={() => toast('Email atualizado!', 'success')}
              />
              <SettingsInput
                label="Telefone"
                value=""
                type="tel"
                onSave={() => toast('Telefone atualizado!', 'success')}
              />
            </SettingsSection>
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

        {/* ── Rede ───────────────────────────────────────────────── */}
        {activeTab === 'rede' && (
          <>
            <SettingsSection icon="network" title="Configuracoes da Rede">
              <SettingsInput
                label="Nome da rede"
                value="Guerreiros BJJ Network"
                onSave={() => toast('Salvo!', 'success')}
              />
              <SettingsInput
                label="Percentual de royalties (%)"
                value="10"
                type="number"
                onSave={() => toast('Salvo!', 'success')}
                suffix="%"
              />
              <SettingsInput
                label="Taxa de marketing (%)"
                value="2"
                type="number"
                onSave={() => toast('Salvo!', 'success')}
                suffix="%"
              />
            </SettingsSection>

            <SettingsSection icon="network" title="Padronizacao">
              <SettingsToggle
                label="Forcar identidade visual"
                description="Todas as unidades devem usar as cores e logo da rede"
                enabled={true}
                onChange={() => toast('Salvo!', 'success')}
              />
              <SettingsToggle
                label="Curriculo padronizado"
                description="Unidades devem seguir o curriculo definido pela rede"
                enabled={true}
                onChange={() => toast('Salvo!', 'success')}
              />
              <SettingsToggle
                label="Precos padronizados"
                description="Unidades devem seguir a tabela de precos da rede"
                enabled={false}
                onChange={() => toast('Salvo!', 'success')}
              />
            </SettingsSection>

            <SettingsSection icon="network" title="Comunicacao">
              <SettingsToggle
                label="Comunicados centralizados"
                description="Enviar comunicados para todas as unidades simultaneamente"
                enabled={true}
                onChange={() => toast('Salvo!', 'success')}
              />
              <SettingsToggle
                label="Relatorios automaticos"
                description="Receber relatorio consolidado semanal de todas as unidades"
                enabled={true}
                onChange={() => toast('Salvo!', 'success')}
              />
            </SettingsSection>

            <TutorialSettings />

            <SettingsSection icon="settings" title="Exportacao de Dados">
              <p className="mb-3 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                Exporte dados consolidados de toda a rede.
              </p>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await exportUserData(profileId);
                    toast('Exportacao iniciada!', 'success');
                  } catch (err) {
                    toast(translateError(err), 'error');
                  }
                }}
                className="px-4 py-2 text-sm font-medium"
                style={{ background: 'var(--bb-depth-4)', borderRadius: 'var(--bb-radius-md)', color: 'var(--bb-ink-80)' }}
              >
                Exportar dados da rede
              </button>
            </SettingsSection>

            <DangerZone
              items={[
                {
                  label: 'Excluir minha conta',
                  description: 'A solicitacao e registrada agora e a exclusao definitiva ocorre em ate 30 dias. As unidades continuam ativas.',
                  action: async () => {
                    await deleteAccount(profileId, 'EXCLUIR MINHA CONTA');
                    toast('Solicitacao registrada. A exclusao definitiva ocorre em ate 30 dias.', 'success');
                  },
                  confirmText: 'EXCLUIR MINHA CONTA',
                },
              ]}
            />
          </>
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
            </SettingsSection>

            <SettingsSection icon="bell" title="Alertas da Rede">
              <SettingsToggle
                label="Nova unidade cadastrada"
                description="Notificar quando uma nova unidade for adicionada"
                enabled={true}
                onChange={() => toast('Salvo!', 'success')}
              />
              <SettingsToggle
                label="Alerta de royalties"
                description="Notificar quando royalties estiverem pendentes"
                enabled={true}
                onChange={() => toast('Salvo!', 'success')}
              />
              <SettingsToggle
                label="Relatorio semanal"
                description="Receber resumo semanal de performance"
                enabled={true}
                onChange={() => toast('Salvo!', 'success')}
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

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useToast } from '@/lib/hooks/useToast';
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

// ── Constants ────────────────────────────────────────────────────────

const TABS = [
  { key: 'perfil', label: 'Meu Perfil' },
  { key: 'seguranca', label: 'Seguranca' },
  { key: 'jogo', label: 'Jogo' },
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

const AVATAR_EMOJIS = ['', '', '', '', '', '', '', '', '', '', '', ''];

const MOCK_PROFILE_ID = 'teen-1';

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

export default function TeenConfiguracoesPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('perfil');
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const p = await getUserPreferences(MOCK_PROFILE_ID);
        setPrefs(p);
      } catch {
        toast('Erro ao carregar configuracoes', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const savePref = useCallback(
    async (partial: Partial<UserPreferences>) => {
      try {
        await updateUserPreferences(MOCK_PROFILE_ID, partial);
        setPrefs((p) => (p ? { ...p, ...partial } : p));
        toast('Salvo!', 'success');
      } catch {
        toast('Erro ao salvar', 'error');
      }
    },
    [toast],
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
    } catch {
      toast('Erro ao alterar senha.', 'error');
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
          Customize seu perfil de guerreiro
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
                name="Teen"
                onUpload={async (file) => {
                  try {
                    await uploadAvatar(MOCK_PROFILE_ID, file);
                    toast('Avatar atualizado!', 'success');
                  } catch {
                    toast('Erro ao enviar avatar.', 'error');
                  }
                }}
                size="lg"
              />
            </SettingsSection>

            <SettingsSection icon="user" title="Identidade de Guerreiro">
              <SettingsInput
                label="Nickname"
                value={prefs.nickname}
                placeholder="Seu apelido no ranking"
                onSave={(v) => savePref({ nickname: v })}
              />
              <div className="py-2">
                <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                  Avatar emoji
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => savePref({ avatar_emoji: emoji })}
                      className="flex h-12 w-12 items-center justify-center text-2xl transition-all duration-200"
                      style={{
                        borderRadius: 'var(--bb-radius-md)',
                        background: prefs.avatar_emoji === emoji ? 'var(--bb-brand-surface)' : 'var(--bb-depth-4)',
                        border: prefs.avatar_emoji === emoji ? '2px solid var(--bb-brand)' : '1px solid var(--bb-glass-border)',
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <SettingsInput
                label="Titulo exibido"
                value={prefs.displayed_title}
                placeholder="Ex: Guerreiro Imparavel"
                onSave={(v) => savePref({ displayed_title: v })}
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

        {/* ── Jogo ───────────────────────────────────────────────── */}
        {activeTab === 'jogo' && (
          <>
            <SettingsSection icon="gamepad" title="Privacidade no Jogo">
              <SettingsToggle
                label="Mostrar no ranking"
                description="Seu nickname aparece no ranking da academia"
                enabled={prefs.privacy_show_ranking}
                onChange={(v) => savePref({ privacy_show_ranking: v })}
              />
              <SettingsToggle
                label="Mostrar streak"
                description="Outros jogadores podem ver seu streak"
                enabled={prefs.privacy_show_streak}
                onChange={(v) => savePref({ privacy_show_streak: v })}
              />
              <SettingsToggle
                label="Mostrar conquistas"
                description="Suas badges e conquistas ficam visiveis"
                enabled={prefs.privacy_show_achievements}
                onChange={(v) => savePref({ privacy_show_achievements: v })}
              />
            </SettingsSection>

            <SettingsSection icon="gamepad" title="Notificacoes do Jogo">
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

            <SettingsSection icon="dumbbell" title="Metas de Treino">
              <SettingsInput
                label="Meta semanal (treinos)"
                value={String(prefs.training_goal_weekly)}
                type="number"
                onSave={(v) => savePref({ training_goal_weekly: parseInt(v, 10) })}
                suffix="treinos"
              />
              <SettingsToggle
                label="Contar finais de semana"
                description="Finais de semana contam para o streak"
                enabled={prefs.streak_count_weekends}
                onChange={(v) => savePref({ streak_count_weekends: v })}
              />
            </SettingsSection>
          </>
        )}

        {/* ── Aparencia ──────────────────────────────────────────── */}
        {activeTab === 'aparencia' && (
          <>
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

            <SettingsSection icon="palette" title="Sons e Vibracao">
              <SettingsToggle
                label="Sons de notificacao"
                enabled={prefs.notifications_sound}
                onChange={(v) => savePref({ notifications_sound: v })}
              />
              <SettingsToggle
                label="Vibracao"
                enabled={prefs.notifications_vibration}
                onChange={(v) => savePref({ notifications_vibration: v })}
              />
            </SettingsSection>
          </>
        )}

        {/* ── Avancado ───────────────────────────────────────────── */}
        {activeTab === 'avancado' && (
          <>
            <TutorialSettings />

            <SettingsSection icon="settings" title="Exportacao de Dados (LGPD)">
              <p className="mb-3 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                Exporte todos os seus dados.
              </p>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await exportUserData(MOCK_PROFILE_ID);
                    toast('Exportacao iniciada!', 'success');
                  } catch {
                    toast('Erro ao exportar.', 'error');
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
                  description: 'Sua conta sera excluida permanentemente.',
                  action: async () => {
                    await deleteAccount(MOCK_PROFILE_ID, 'EXCLUIR');
                    toast('Conta excluida.', 'success');
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

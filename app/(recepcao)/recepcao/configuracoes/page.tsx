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
  deleteAccount,
  uploadAvatar,
} from '@/lib/api/preferences.service';
import type { UserPreferences } from '@/lib/types/preferences';
import { translateError } from '@/lib/utils/error-translator';

// ── Constants ────────────────────────────────────────────────────────

const TABS = [
  { key: 'perfil', label: 'Meu Perfil' },
  { key: 'seguranca', label: 'Seguranca' },
  { key: 'notificacoes', label: 'Notificacoes' },
  { key: 'aparencia', label: 'Aparencia' },
  { key: 'atendimento', label: 'Atendimento' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

type ThemeOption = 'light' | 'dark' | 'system';

const THEME_OPTIONS: { value: ThemeOption; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'system', label: 'Sistema' },
];

const MOCK_PROFILE_ID = 'recepcao-1';

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

export default function RecepcaoConfiguracoesPage() {
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
      } catch (err) {
        toast(translateError(err), 'error');
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
      } catch (err) {
        toast(translateError(err), 'error');
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
          Personalize o atendimento da recepcao
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
                name="Recepcao"
                onUpload={async (file) => {
                  try {
                    await uploadAvatar(MOCK_PROFILE_ID, file);
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
                value="Recepcao"
                onSave={() => toast('Nome atualizado!', 'success')}
              />
              <SettingsInput
                label="Email"
                value="recepcao@guerreirosbjj.com.br"
                type="email"
                onSave={() => toast('Email atualizado!', 'success')}
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

        {/* ── Atendimento ────────────────────────────────────────── */}
        {activeTab === 'atendimento' && (
          <>
            <SettingsSection icon="headset" title="Cadastro Rapido">
              <SettingsToggle
                label="Registrar pagamentos"
                description="Permitir registro de pagamentos na recepcao"
                enabled={prefs.register_payments}
                onChange={(v) => savePref({ register_payments: v })}
              />
              <SettingsToggle
                label="Recibo automatico"
                description="Gerar recibo automaticamente ao registrar pagamento"
                enabled={prefs.auto_receipt}
                onChange={(v) => savePref({ auto_receipt: v })}
              />
              <SettingsToggle
                label="Fechamento de caixa obrigatorio"
                description="Exigir fechamento de caixa ao final do turno"
                enabled={prefs.mandatory_cash_closing}
                onChange={(v) => savePref({ mandatory_cash_closing: v })}
              />
            </SettingsSection>

            <SettingsSection icon="headset" title="Aula Experimental">
              <SettingsInput
                label="Duracao padrao da aula experimental (dias)"
                value={String(prefs.trial_duration_days)}
                type="number"
                onSave={(v) => savePref({ trial_duration_days: parseInt(v, 10) })}
                suffix="dias"
              />
              <SettingsToggle
                label="Lembrete automatico"
                description="Enviar lembrete ao aluno experimental antes do vencimento"
                enabled={prefs.trial_auto_reminder}
                onChange={(v) => savePref({ trial_auto_reminder: v })}
              />
            </SettingsSection>

            <SettingsSection icon="headset" title="Padroes de Cadastro">
              <SettingsInput
                label="Turma padrao"
                value={prefs.default_class}
                placeholder="Ex: Turma Iniciantes"
                onSave={(v) => savePref({ default_class: v })}
              />
              <SettingsInput
                label="Modalidade padrao"
                value={prefs.default_modality}
                placeholder="Ex: Jiu-Jitsu"
                onSave={(v) => savePref({ default_modality: v })}
              />
            </SettingsSection>

            <TutorialSettings />

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

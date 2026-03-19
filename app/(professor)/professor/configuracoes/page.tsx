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
  { key: 'notificacoes', label: 'Notificacoes' },
  { key: 'aparencia', label: 'Aparencia' },
  { key: 'modo-aula', label: 'Modo Aula' },
  { key: 'avancado', label: 'Avancado' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

type ThemeOption = 'light' | 'dark' | 'system';

const THEME_OPTIONS: { value: ThemeOption; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'system', label: 'Sistema' },
];

const TIMER_SOUNDS: { value: string; label: string }[] = [
  { value: 'bell', label: 'Sino' },
  { value: 'buzzer', label: 'Buzina' },
  { value: 'whistle', label: 'Apito' },
  { value: 'gong', label: 'Gongo' },
];

const MOCK_PROFILE_ID = 'professor-1';

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

export default function ProfessorConfiguracoesPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('perfil');
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);

  // Password
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // ── Load ─────────────────────────────────────────────────────────

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
        <h1
          className="font-display text-xl font-bold sm:text-2xl"
          style={{ color: 'var(--bb-ink-100)' }}
        >
          Configuracoes
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Personalize sua experiencia como professor
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
                name="Professor"
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

            <SettingsSection icon="user" title="Informacoes Pessoais">
              <SettingsInput
                label="Nome completo"
                value="Professor Silva"
                onSave={() => toast('Nome atualizado!', 'success')}
              />
              <SettingsInput
                label="Email"
                value="professor@guerreirosbjj.com.br"
                type="email"
                onSave={() => toast('Email atualizado!', 'success')}
              />
              <SettingsInput
                label="Telefone"
                value="(11) 98888-0000"
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
                placeholder="Digite sua senha atual"
                onSave={(v) => setSenhaAtual(v)}
              />
              <SettingsInput
                label="Nova senha"
                value={novaSenha}
                type="password"
                placeholder="Digite a nova senha"
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
                style={{
                  background: 'var(--bb-brand)',
                  borderRadius: 'var(--bb-radius-md)',
                }}
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
                description="Reproduzir som ao receber notificacao"
                enabled={prefs.notifications_sound}
                onChange={(v) => savePref({ notifications_sound: v })}
              />
              <SettingsToggle
                label="Vibracao"
                description="Vibrar ao receber notificacao"
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
                    savePref({
                      notifications_app: { ...prefs.notifications_app, [key]: v },
                    })
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

        {/* ── Modo Aula ──────────────────────────────────────────── */}
        {activeTab === 'modo-aula' && (
          <>
            <SettingsSection icon="timer" title="Timer de Rounds">
              <SettingsInput
                label="Duracao do round"
                value={prefs.timer_round_duration}
                onSave={(v) => savePref({ timer_round_duration: v })}
                suffix="min:seg"
              />
              <SettingsInput
                label="Intervalo"
                value={prefs.timer_interval}
                onSave={(v) => savePref({ timer_interval: v })}
                suffix="min:seg"
              />
              <SettingsInput
                label="Numero de rounds"
                value={String(prefs.timer_rounds)}
                type="number"
                onSave={(v) => savePref({ timer_rounds: parseInt(v, 10) })}
              />
              <div className="py-2">
                <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                  Som do timer
                </label>
                <div className="flex flex-wrap gap-2">
                  {TIMER_SOUNDS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => savePref({ timer_sound: s.value })}
                      className="px-3 py-2 text-sm font-medium transition-all duration-200"
                      style={{
                        borderRadius: 'var(--bb-radius-md)',
                        background: prefs.timer_sound === s.value ? 'var(--bb-brand-surface)' : 'var(--bb-depth-4)',
                        color: prefs.timer_sound === s.value ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                        border: prefs.timer_sound === s.value ? '1px solid var(--bb-brand)' : '1px solid var(--bb-glass-border)',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <SettingsToggle
                label="Vibracao no timer"
                description="Vibrar quando o round terminar"
                enabled={prefs.timer_vibration}
                onChange={(v) => savePref({ timer_vibration: v })}
              />
            </SettingsSection>

            <SettingsSection icon="settings" title="Chamada">
              <SettingsToggle
                label="Mostrar foto dos alunos"
                description="Exibir foto na lista de chamada"
                enabled={prefs.attendance_show_photo}
                onChange={(v) => savePref({ attendance_show_photo: v })}
              />
              <SettingsToggle
                label="Som ao registrar presenca"
                description="Reproduzir som ao confirmar check-in"
                enabled={prefs.attendance_sound}
                onChange={(v) => savePref({ attendance_sound: v })}
              />
            </SettingsSection>

            <SettingsSection icon="settings" title="Tela de Aula">
              <SettingsToggle
                label="Manter tela ligada"
                description="Prevenir que a tela apague durante a aula"
                enabled={prefs.class_mode_screen_on}
                onChange={(v) => savePref({ class_mode_screen_on: v })}
              />
              <SettingsToggle
                label="Brilho maximo"
                description="Aumentar brilho automaticamente no modo aula"
                enabled={prefs.class_mode_brightness}
                onChange={(v) => savePref({ class_mode_brightness: v })}
              />
            </SettingsSection>

            <SettingsSection icon="settings" title="Pos-Aula">
              <SettingsToggle
                label="Lembrete de diario"
                description="Lembrar de preencher diario de aula"
                enabled={prefs.post_class_diary_reminder}
                onChange={(v) => savePref({ post_class_diary_reminder: v })}
              />
              <SettingsInput
                label="Avaliar apos (aulas)"
                value={String(prefs.post_class_evaluation_after)}
                type="number"
                onSave={(v) => savePref({ post_class_evaluation_after: parseInt(v, 10) })}
              />
              <SettingsToggle
                label="Resumo automatico"
                description="Gerar resumo da aula com IA apos cada sessao"
                enabled={prefs.post_class_auto_summary}
                onChange={(v) => savePref({ post_class_auto_summary: v })}
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
                Exporte todos os seus dados em formato compativel com a LGPD.
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
                style={{
                  background: 'var(--bb-depth-4)',
                  borderRadius: 'var(--bb-radius-md)',
                  color: 'var(--bb-ink-80)',
                }}
              >
                Exportar meus dados
              </button>
            </SettingsSection>

            <DangerZone
              items={[
                {
                  label: 'Excluir minha conta',
                  description: 'Sua conta sera excluida permanentemente. Essa acao e irreversivel.',
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

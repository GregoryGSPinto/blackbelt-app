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
import { translateError } from '@/lib/utils/error-translator';

// ── Constants ────────────────────────────────────────────────────────

const TABS = [
  { key: 'perfil', label: 'Meu Perfil' },
  { key: 'seguranca', label: 'Seguranca' },
  { key: 'notificacoes', label: 'Notificacoes' },
  { key: 'aparencia', label: 'Aparencia' },
  { key: 'treino', label: 'Treino' },
  { key: 'avancado', label: 'Avancado' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

type ThemeOption = 'light' | 'dark' | 'system';

const THEME_OPTIONS: { value: ThemeOption; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'system', label: 'Sistema' },
];

const REST_DAYS: { value: string; label: string }[] = [
  { value: 'sunday', label: 'Domingo' },
  { value: 'saturday', label: 'Sabado' },
  { value: 'none', label: 'Nenhum' },
];

const VIDEO_QUALITY: { value: string; label: string }[] = [
  { value: 'auto', label: 'Automatico' },
  { value: '1080p', label: '1080p' },
  { value: '720p', label: '720p' },
  { value: '480p', label: '480p' },
];

const MOCK_PROFILE_ID = 'aluno-1';

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

export default function AlunoConfiguracoesPage() {
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
          Personalize sua experiencia de treino
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
                name="Aluno"
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
                value="Aluno Silva"
                onSave={() => toast('Nome atualizado!', 'success')}
              />
              <SettingsInput
                label="Email"
                value="aluno@email.com"
                type="email"
                onSave={() => toast('Email atualizado!', 'success')}
              />
              <SettingsInput
                label="Telefone"
                value="(11) 97777-0000"
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

            <SettingsSection icon="bell" title="Lembretes de Treino">
              <SettingsToggle
                label="Treino perdido"
                description="Avisar quando voce perder um treino agendado"
                enabled={prefs.training_reminder_missed}
                onChange={(v) => savePref({ training_reminder_missed: v })}
              />
              <SettingsToggle
                label="Meta semanal"
                description="Lembrete sobre progresso da meta semanal"
                enabled={prefs.training_reminder_weekly_goal}
                onChange={(v) => savePref({ training_reminder_weekly_goal: v })}
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

        {/* ── Treino ─────────────────────────────────────────────── */}
        {activeTab === 'treino' && (
          <>
            <SettingsSection icon="dumbbell" title="Metas de Treino">
              <SettingsInput
                label="Meta semanal (treinos)"
                value={String(prefs.training_goal_weekly)}
                type="number"
                onSave={(v) => savePref({ training_goal_weekly: parseInt(v, 10) })}
                suffix="treinos"
              />
              <SettingsInput
                label="Meta mensal de frequencia (%)"
                value={String(prefs.training_goal_monthly_percent)}
                type="number"
                onSave={(v) => savePref({ training_goal_monthly_percent: parseInt(v, 10) })}
                suffix="%"
              />
            </SettingsSection>

            <SettingsSection icon="dumbbell" title="Streak">
              <SettingsToggle
                label="Contar finais de semana"
                description="Incluir sabado e domingo na contagem de streak"
                enabled={prefs.streak_count_weekends}
                onChange={(v) => savePref({ streak_count_weekends: v })}
              />
              <div className="py-2">
                <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                  Dia de descanso
                </label>
                <div className="flex flex-wrap gap-2">
                  {REST_DAYS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => savePref({ streak_rest_day: d.value })}
                      className="px-3 py-2 text-sm font-medium transition-all duration-200"
                      style={{
                        borderRadius: 'var(--bb-radius-md)',
                        background: prefs.streak_rest_day === d.value ? 'var(--bb-brand-surface)' : 'var(--bb-depth-4)',
                        color: prefs.streak_rest_day === d.value ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                        border: prefs.streak_rest_day === d.value ? '1px solid var(--bb-brand)' : '1px solid var(--bb-glass-border)',
                      }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </SettingsSection>

            <SettingsSection icon="user" title="Privacidade">
              <SettingsToggle
                label="Mostrar no ranking"
                description="Exibir sua posicao no ranking da academia"
                enabled={prefs.privacy_show_ranking}
                onChange={(v) => savePref({ privacy_show_ranking: v })}
              />
              <SettingsToggle
                label="Mostrar streak"
                description="Exibir seu streak publicamente"
                enabled={prefs.privacy_show_streak}
                onChange={(v) => savePref({ privacy_show_streak: v })}
              />
              <SettingsToggle
                label="Mostrar conquistas"
                description="Exibir suas conquistas para outros alunos"
                enabled={prefs.privacy_show_achievements}
                onChange={(v) => savePref({ privacy_show_achievements: v })}
              />
              <SettingsToggle
                label="Anotacoes do professor"
                description="Permitir que professores vejam suas anotacoes"
                enabled={prefs.privacy_professor_notes}
                onChange={(v) => savePref({ privacy_professor_notes: v })}
              />
            </SettingsSection>

            <SettingsSection icon="settings" title="Videos">
              <div className="py-2">
                <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                  Qualidade do video
                </label>
                <div className="flex flex-wrap gap-2">
                  {VIDEO_QUALITY.map((q) => (
                    <button
                      key={q.value}
                      type="button"
                      onClick={() => savePref({ video_quality: q.value })}
                      className="px-3 py-2 text-sm font-medium transition-all duration-200"
                      style={{
                        borderRadius: 'var(--bb-radius-md)',
                        background: prefs.video_quality === q.value ? 'var(--bb-brand-surface)' : 'var(--bb-depth-4)',
                        color: prefs.video_quality === q.value ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                        border: prefs.video_quality === q.value ? '1px solid var(--bb-brand)' : '1px solid var(--bb-glass-border)',
                      }}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
              <SettingsToggle
                label="Download offline"
                description="Permitir download de videos para assistir offline"
                enabled={prefs.video_download_offline}
                onChange={(v) => savePref({ video_download_offline: v })}
              />
              <SettingsToggle
                label="Reproduzir proximo automaticamente"
                description="Iniciar o proximo video da trilha automaticamente"
                enabled={prefs.video_autoplay_next}
                onChange={(v) => savePref({ video_autoplay_next: v })}
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
                  description: 'Sua conta e todos os dados serao excluidos permanentemente.',
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

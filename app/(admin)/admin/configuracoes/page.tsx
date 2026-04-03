'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
  getAcademySettings,
  updateAcademySettings,
  changePassword,
  exportUserData,
  deleteAccount,
  deactivateAcademy,
  deleteAcademy,
  uploadAvatar,
  uploadAcademyLogo,
} from '@/lib/api/preferences.service';
import type { UserPreferences, AcademySettings } from '@/lib/types/preferences';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { useAuth } from '@/lib/hooks/useAuth';

// ── Constants ────────────────────────────────────────────────────────

const TABS = [
  { key: 'perfil', label: 'Meu Perfil', icon: 'user' },
  { key: 'academia', label: 'Academia', icon: 'building' },
  { key: 'seguranca', label: 'Seguranca', icon: 'lock' },
  { key: 'notificacoes', label: 'Notificacoes', icon: 'bell' },
  { key: 'aparencia', label: 'Aparencia', icon: 'palette' },
  { key: 'integracoes', label: 'Integracoes', icon: 'plug' },
  { key: 'avancado', label: 'Avancado', icon: 'settings' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

type ThemeOption = 'light' | 'dark' | 'system';

const THEME_OPTIONS: { value: ThemeOption; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'system', label: 'Sistema' },
];

const DAY_NAMES: Record<string, string> = {
  monday: 'Segunda',
  tuesday: 'Terca',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sabado',
  sunday: 'Domingo',
};

// ── Loading Skeleton ─────────────────────────────────────────────────

function SettingsSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Skeleton variant="text" className="h-8 w-48" />
      <Skeleton variant="text" className="h-4 w-64" />
      <div className="flex gap-2 overflow-x-auto">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} variant="text" className="h-10 w-28 flex-shrink-0" />
        ))}
      </div>
      <Skeleton variant="card" className="h-64" />
      <Skeleton variant="card" className="h-48" />
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────

export default function AdminConfiguracoesPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { profile, isLoading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('perfil');
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [academy, setAcademy] = useState<AcademySettings | null>(null);

  // Password state
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const activeAcademyId = getActiveAcademyId();
  const profileId = profile?.id ?? '';

  // ── Load data ────────────────────────────────────────────────────

  useEffect(() => {
    if (authLoading) return;

    async function load() {
      if (!profileId || !activeAcademyId) {
        setLoading(false);
        return;
      }

      try {
        const [p, a] = await Promise.all([
          getUserPreferences(profileId),
          getAcademySettings(activeAcademyId),
        ]);
        setPrefs(p);
        setAcademy(a);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeAcademyId, authLoading, profileId, toast]);

  // ── Save helpers ─────────────────────────────────────────────────

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

  const saveAcademy = useCallback(
    async (partial: Partial<AcademySettings>) => {
      try {
        if (!activeAcademyId) throw new Error('Academia ativa nao encontrada.');
        await updateAcademySettings(activeAcademyId, partial);
        setAcademy((a) => (a ? { ...a, ...partial } : a));
        toast('Salvo!', 'success');
      } catch (err) {
        toast(translateError(err), 'error');
      }
    },
    [activeAcademyId, toast],
  );

  // ── Handlers ─────────────────────────────────────────────────────

  async function handleSalvarSenha() {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      toast('Preencha todos os campos.', 'error');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      toast('As senhas nao coincidem.', 'error');
      return;
    }
    if (novaSenha.length < 8) {
      toast('A nova senha deve ter no minimo 8 caracteres.', 'error');
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

  async function handleUploadAvatar(file: File) {
    try {
      if (!profileId) throw new Error('Perfil ativo nao encontrado.');
      await uploadAvatar(profileId, file);
      toast('Avatar atualizado!', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleUploadLogo(file: File) {
    try {
      if (!activeAcademyId) throw new Error('Academia ativa nao encontrada.');
      await uploadAcademyLogo(activeAcademyId, file);
      toast('Logo atualizada!', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  // ── Loading state ────────────────────────────────────────────────

  if (loading || authLoading) return <SettingsSkeleton />;

  if (!profileId || !activeAcademyId) {
    return (
      <div className="min-h-screen p-4 sm:p-6">
        <div
          className="rounded-xl border p-6"
          style={{ borderColor: 'var(--bb-danger)', background: 'color-mix(in srgb, var(--bb-danger) 8%, transparent)' }}
        >
          <h1 className="text-lg font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Configuracoes indisponiveis</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Nao foi possivel identificar o perfil ou a academia ativos. Refaça o login ou selecione o perfil novamente.
          </p>
        </div>
      </div>
    );
  }

  if (!prefs || !academy) return <SettingsSkeleton />;

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div className="min-h-screen p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="font-display text-xl font-bold sm:text-2xl"
          style={{ color: 'var(--bb-ink-100)' }}
        >
          Configuracoes
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Gerencie as configuracoes da sua academia e perfil
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

      {/* Tab content */}
      <div className="space-y-6">
        {/* ── Meu Perfil ────────────────────────────────────────────── */}
        {activeTab === 'perfil' && (
          <>
            <SettingsSection icon="user" title="Foto de Perfil">
                <SettingsAvatar
                name={profile?.display_name || 'Administrador'}
                onUpload={handleUploadAvatar}
                size="lg"
              />
            </SettingsSection>

            <SettingsSection icon="user" title="Informacoes Pessoais">
              <SettingsInput
                label="Nome completo"
                value={profile?.display_name || 'Administrador'}
                onSave={(v) => savePref({ nickname: v })}
              />
              <SettingsInput
                label="Email"
                value="admin@guerreirosbjj.com.br"
                type="email"
                onSave={() => toast('Email atualizado!', 'success')}
              />
              <SettingsInput
                label="Telefone"
                value="(11) 99999-0000"
                type="tel"
                onSave={() => toast('Telefone atualizado!', 'success')}
              />
            </SettingsSection>
          </>
        )}

        {/* ── Academia ──────────────────────────────────────────────── */}
        {activeTab === 'academia' && (
          <>
            <SettingsSection icon="building" title="Logo da Academia">
              <SettingsAvatar
                name={academy.name}
                onUpload={handleUploadLogo}
                size="lg"
              />
            </SettingsSection>

            <SettingsSection icon="building" title="Dados da Academia">
              <SettingsInput
                label="Nome da academia"
                value={academy.name}
                onSave={(v) => saveAcademy({ name: v })}
              />
              <SettingsInput
                label="CNPJ"
                value={academy.cnpj}
                onSave={(v) => saveAcademy({ cnpj: v })}
              />
              <SettingsInput
                label="Razao Social"
                value={academy.legal_name}
                onSave={(v) => saveAcademy({ legal_name: v })}
              />
              <SettingsInput
                label="Telefone"
                value={academy.phone}
                type="tel"
                onSave={(v) => saveAcademy({ phone: v })}
              />
              <SettingsInput
                label="Email"
                value={academy.email}
                type="email"
                onSave={(v) => saveAcademy({ email: v })}
              />
              <SettingsInput
                label="Website"
                value={academy.website}
                onSave={(v) => saveAcademy({ website: v })}
              />
              <SettingsInput
                label="Instagram"
                value={academy.instagram}
                onSave={(v) => saveAcademy({ instagram: v })}
              />
            </SettingsSection>

            <SettingsSection icon="building" title="Endereco">
              <SettingsInput
                label="CEP"
                value={academy.cep}
                onSave={(v) => saveAcademy({ cep: v })}
              />
              <SettingsInput
                label="Rua"
                value={academy.street}
                onSave={(v) => saveAcademy({ street: v })}
              />
              <SettingsInput
                label="Bairro"
                value={academy.neighborhood}
                onSave={(v) => saveAcademy({ neighborhood: v })}
              />
              <SettingsInput
                label="Cidade"
                value={academy.city}
                onSave={(v) => saveAcademy({ city: v })}
              />
              <SettingsInput
                label="Estado"
                value={academy.state}
                onSave={(v) => saveAcademy({ state: v })}
              />
            </SettingsSection>

            <SettingsSection icon="building" title="Horarios de Funcionamento">
              {Object.entries(academy.hours).map(([day, hours]) => (
                <div key={day} className="flex items-center justify-between gap-3 py-2">
                  <span className="w-24 text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                    {DAY_NAMES[day] ?? day}
                  </span>
                  <SettingsToggle
                    label=""
                    enabled={hours.is_open}
                    onChange={(v) => {
                      const newHours = { ...academy.hours, [day]: { ...hours, is_open: v } };
                      saveAcademy({ hours: newHours });
                    }}
                  />
                  {hours.is_open && (
                    <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                      {hours.open} - {hours.close}
                    </span>
                  )}
                </div>
              ))}
            </SettingsSection>

            <SettingsSection icon="settings" title="Check-in">
              <SettingsInput
                label="Tolerancia de atraso (minutos)"
                value={String(academy.late_tolerance_minutes)}
                type="number"
                onSave={(v) => saveAcademy({ late_tolerance_minutes: parseInt(v, 10) })}
              />
              <SettingsToggle
                label="Permitir check-in fora do horario"
                description="Alunos podem fazer check-in mesmo sem turma no horario"
                enabled={academy.allow_off_schedule_checkin}
                onChange={(v) => saveAcademy({ allow_off_schedule_checkin: v })}
              />
            </SettingsSection>

            <SettingsSection icon="settings" title="Graduacoes">
              <SettingsInput
                label="Frequencia minima para graduacao (%)"
                value={String(academy.min_attendance_for_graduation)}
                type="number"
                onSave={(v) => saveAcademy({ min_attendance_for_graduation: parseInt(v, 10) })}
              />
              <SettingsToggle
                label="Aprovacao de video antes de publicar"
                description="Videos enviados precisam ser aprovados por admin/professor"
                enabled={academy.require_approval_before_publish}
                onChange={(v) => saveAcademy({ require_approval_before_publish: v })}
              />
              <SettingsInput
                label="Tamanho maximo de video (MB)"
                value={String(academy.max_video_size_mb)}
                type="number"
                onSave={(v) => saveAcademy({ max_video_size_mb: parseInt(v, 10) })}
              />
            </SettingsSection>
          </>
        )}

        {/* ── Seguranca ─────────────────────────────────────────────── */}
        {activeTab === 'seguranca' && (
          <>
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
                  validation={(v) => (v !== novaSenha ? 'As senhas nao coincidem' : null)}
                />
                <button
                  type="button"
                  onClick={handleSalvarSenha}
                  className="mt-2 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200"
                  style={{
                    background: 'var(--bb-brand)',
                    borderRadius: 'var(--bb-radius-md)',
                  }}
                >
                  Alterar senha
                </button>
              </div>
            </SettingsSection>

            <SettingsSection icon="shield" title="Sessoes Ativas">
              <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                Gerencie suas sessoes ativas e dispositivos conectados.
              </p>
            </SettingsSection>
          </>
        )}

        {/* ── Notificacoes ──────────────────────────────────────────── */}
        {activeTab === 'notificacoes' && (
          <>
            <SettingsSection icon="bell" title="Notificacoes Push">
              <SettingsToggle
                label="Notificacoes push"
                description="Receba notificacoes no dispositivo"
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

            <SettingsSection icon="bell" title="Notificacoes do App">
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

            <SettingsSection icon="bell" title="Notificacoes por Email">
              {Object.entries(prefs.notifications_email).map(([key, enabled]) => (
                <SettingsToggle
                  key={key}
                  label={key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  enabled={enabled}
                  onChange={(v) =>
                    savePref({
                      notifications_email: { ...prefs.notifications_email, [key]: v },
                    })
                  }
                />
              ))}
            </SettingsSection>

            <SettingsSection icon="bell" title="Notificacoes via WhatsApp">
              {Object.entries(prefs.notifications_whatsapp).map(([key, enabled]) => (
                <SettingsToggle
                  key={key}
                  label={key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  enabled={enabled}
                  onChange={(v) =>
                    savePref({
                      notifications_whatsapp: { ...prefs.notifications_whatsapp, [key]: v },
                    })
                  }
                />
              ))}
            </SettingsSection>
          </>
        )}

        {/* ── Aparencia ─────────────────────────────────────────────── */}
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

            <SettingsSection icon="palette" title="Marca da Academia">
              <SettingsInput
                label="Cor primaria"
                value={academy.primary_color}
                onSave={(v) => saveAcademy({ primary_color: v })}
                suffix="HEX"
              />
              <SettingsInput
                label="Cor secundaria"
                value={academy.secondary_color}
                onSave={(v) => saveAcademy({ secondary_color: v })}
                suffix="HEX"
              />
              <Link
                href="/admin/configuracoes/marca"
                className="mt-3 inline-block text-sm font-medium transition-colors duration-200"
                style={{ color: 'var(--bb-brand)' }}
              >
                Configurar white-label completo &rarr;
              </Link>
            </SettingsSection>

            <SettingsSection icon="palette" title="Idioma e Regiao">
              <SettingsInput
                label="Idioma"
                value={prefs.language}
                onSave={(v) => savePref({ language: v })}
              />
              <SettingsInput
                label="Fuso horario"
                value={prefs.timezone}
                onSave={(v) => savePref({ timezone: v })}
              />
              <SettingsInput
                label="Moeda"
                value={prefs.currency}
                onSave={(v) => savePref({ currency: v })}
              />
            </SettingsSection>
          </>
        )}

        {/* ── Integracoes ───────────────────────────────────────────── */}
        {activeTab === 'integracoes' && (
          <>
            <SettingsSection icon="plug" title="Pagamento">
              <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                Integre com gateways de pagamento (Stripe, PagSeguro).
              </p>
              <Link
                href="/admin/configuracoes/pagamento"
                className="mt-3 inline-block text-sm font-medium"
                style={{ color: 'var(--bb-brand)' }}
              >
                Configurar pagamento &rarr;
              </Link>
            </SettingsSection>

            <SettingsSection icon="plug" title="WhatsApp Business">
              <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                Envie notificacoes automaticas via WhatsApp Business API.
              </p>
              <button
                type="button"
                className="mt-3 px-4 py-2 text-sm font-medium"
                style={{
                  background: 'var(--bb-depth-4)',
                  borderRadius: 'var(--bb-radius-md)',
                  color: 'var(--bb-ink-80)',
                }}
              >
                Conectar WhatsApp
              </button>
            </SettingsSection>

            <SettingsSection icon="plug" title="Google Calendar">
              <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                Sincronize turmas e eventos com o Google Calendar.
              </p>
              <button
                type="button"
                className="mt-3 px-4 py-2 text-sm font-medium"
                style={{
                  background: 'var(--bb-depth-4)',
                  borderRadius: 'var(--bb-radius-md)',
                  color: 'var(--bb-ink-80)',
                }}
              >
                Conectar Google Calendar
              </button>
            </SettingsSection>

            <SettingsSection icon="plug" title="SSO (Single Sign-On)">
              <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                Configure login via Google, Facebook ou Microsoft.
              </p>
              <Link
                href="/admin/configuracoes/sso"
                className="mt-3 inline-block text-sm font-medium"
                style={{ color: 'var(--bb-brand)' }}
              >
                Configurar SSO &rarr;
              </Link>
            </SettingsSection>
          </>
        )}

        {/* ── Avancado ──────────────────────────────────────────────── */}
        {activeTab === 'avancado' && (
          <>
            <TutorialSettings />

            <SettingsSection icon="settings" title="Exportacao de Dados (LGPD)">
              <p className="mb-3 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                Exporte todos os dados da sua conta em formato compativel com a LGPD.
              </p>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await exportUserData(profileId);
                    toast('Exportacao iniciada! Voce recebera o arquivo por email.', 'success');
                  } catch (err) {
                    toast(translateError(err), 'error');
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

            <SettingsSection icon="settings" title="Log de Auditoria">
              <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                Veja todas as acoes realizadas na plataforma.
              </p>
              <Link
                href="/admin/configuracoes/audit-log"
                className="mt-3 inline-block text-sm font-medium"
                style={{ color: 'var(--bb-brand)' }}
              >
                Ver log de auditoria &rarr;
              </Link>
            </SettingsSection>

            <DangerZone
              items={[
                {
                  label: 'Desativar academia',
                  description: 'A academia sera desativada e os alunos nao poderao acessar.',
                  action: async () => {
                    await deactivateAcademy(activeAcademyId);
                    toast('Academia desativada.', 'success');
                  },
                  confirmText: 'DESATIVAR',
                },
                {
                  label: 'Excluir academia',
                  description: 'Todos os dados serao removidos permanentemente. Essa acao e irreversivel.',
                  action: async () => {
                    await deleteAcademy(activeAcademyId, academy.name);
                    toast('Academia excluida.', 'success');
                  },
                  confirmText: academy.name,
                },
                {
                  label: 'Excluir minha conta',
                  description: 'A solicitacao e registrada agora e a exclusao definitiva ocorre em ate 30 dias.',
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
      </div>
    </div>
  );
}

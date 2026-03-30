'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useToast } from '@/lib/hooks/useToast';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  SettingsSection,
  SettingsToggle,
  SettingsInput,
  SettingsAvatar,
  DangerZone,
} from '@/components/shared/settings';
import {
  getProfileSettings,
  updateProfileSettings,
  changeProfilePassword,
  exportProfileData,
  deleteProfileAccount,
} from '@/lib/api/profile-settings.service';
import type { ProfileRole, ProfileSettingsData } from '@/lib/api/profile-settings.service';
import { translateError } from '@/lib/utils/error-translator';

// ── Types ───────────────────────────────────────────────────────────

interface ProfileSettingsPageProps {
  role: ProfileRole;
}

// ── Kids Emoji Picker ───────────────────────────────────────────────

const KIDS_EMOJI_OPTIONS = ['🥋', '🐉', '🦁', '🐯', '🦊', '🐼', '🦸', '🏆', '⭐', '🔥', '💪', '🎯', '🛡️', '🌟', '🎨', '🚀'];
const KIDS_COLOR_OPTIONS = [
  { value: '#DC2626', label: 'Vermelho' },
  { value: '#2563EB', label: 'Azul' },
  { value: '#16A34A', label: 'Verde' },
  { value: '#9333EA', label: 'Roxo' },
  { value: '#EA580C', label: 'Laranja' },
  { value: '#CA8A04', label: 'Amarelo' },
  { value: '#EC4899', label: 'Rosa' },
  { value: '#06B6D4', label: 'Ciano' },
];

// ── Theme Options ───────────────────────────────────────────────────

type ThemeOption = 'light' | 'dark' | 'system';

const THEME_OPTIONS: { value: ThemeOption; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'system', label: 'Sistema' },
];

// ── Loading Skeleton ────────────────────────────────────────────────

function ProfileSettingsSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Skeleton variant="text" className="h-8 w-48" />
      <div className="flex justify-center">
        <Skeleton variant="circle" className="h-24 w-24 rounded-full" />
      </div>
      <Skeleton variant="card" className="h-48" />
      <Skeleton variant="card" className="h-32" />
      <Skeleton variant="card" className="h-32" />
      <Skeleton variant="card" className="h-24" />
    </div>
  );
}

// ── Section: Avatar / Emoji (Kids) ──────────────────────────────────

function AvatarSection({
  role,
  data,
  onUpdate,
}: {
  role: ProfileRole;
  data: ProfileSettingsData;
  onUpdate: (partial: Partial<ProfileSettingsData>) => void;
}) {
  const { toast } = useToast();

  if (role === 'aluno_kids') {
    return (
      <SettingsSection icon="user" title="Meu Avatar">
        <div className="flex flex-col items-center gap-4">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full text-5xl"
            style={{
              background: data.favorite_color ?? 'var(--bb-brand-surface)',
              border: '4px solid var(--bb-glass-border)',
            }}
          >
            {data.favorite_emoji ?? '🥋'}
          </div>
          <div>
            <p className="mb-2 text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Escolha seu emoji:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {KIDS_EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onUpdate({ favorite_emoji: emoji })}
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-xl transition-all duration-200"
                  style={{
                    background: data.favorite_emoji === emoji ? 'var(--bb-brand-surface)' : 'var(--bb-depth-4)',
                    border: data.favorite_emoji === emoji ? '2px solid var(--bb-brand)' : '1px solid var(--bb-glass-border)',
                  }}
                  aria-label={`Emoji ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection icon="user" title="Foto de Perfil">
      <SettingsAvatar
        name={data.display_name}
        src={data.avatar_url ?? undefined}
        onUpload={async () => {
          // Mock upload
          toast('Avatar atualizado!', 'success');
        }}
        size="lg"
      />
    </SettingsSection>
  );
}

// ── Section: Dados Pessoais ─────────────────────────────────────────

function PersonalDataSection({
  role,
  data,
  onUpdate,
}: {
  role: ProfileRole;
  data: ProfileSettingsData;
  onUpdate: (partial: Partial<ProfileSettingsData>) => void;
}) {
  const { toast } = useToast();

  if (role === 'aluno_kids') {
    return (
      <SettingsSection icon="user" title="Sobre Mim">
        <SettingsInput
          label="Meu apelido"
          value={data.nickname ?? ''}
          placeholder="Como voce quer ser chamado?"
          onSave={(v) => {
            onUpdate({ nickname: v });
            toast('Apelido salvo!', 'success');
          }}
        />
        <div className="py-2">
          <p className="mb-2 text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
            Minha cor favorita:
          </p>
          <div className="flex flex-wrap gap-2">
            {KIDS_COLOR_OPTIONS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => {
                  onUpdate({ favorite_color: color.value });
                  toast('Cor atualizada!', 'success');
                }}
                className="flex h-11 items-center gap-2 rounded-lg px-3 transition-all duration-200"
                style={{
                  background: data.favorite_color === color.value ? 'var(--bb-brand-surface)' : 'var(--bb-depth-4)',
                  border: data.favorite_color === color.value ? `2px solid ${color.value}` : '1px solid var(--bb-glass-border)',
                  color: 'var(--bb-ink-80)',
                }}
                aria-label={`Cor ${color.label}`}
              >
                <span className="h-4 w-4 rounded-full" style={{ background: color.value }} />
                <span className="text-xs font-medium">{color.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div
          className="mt-4 rounded-lg p-4 text-center"
          style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)' }}
        >
          <p className="text-3xl">{data.favorite_emoji ?? '⭐'}</p>
          <p className="mt-2 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            {data.stars_count ?? 0} Estrelas
          </p>
          <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
            Continue treinando para ganhar mais!
          </p>
        </div>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection icon="user" title="Dados Pessoais">
      <SettingsInput
        label="Nome completo"
        value={data.display_name}
        onSave={(v) => {
          onUpdate({ display_name: v });
          toast('Nome atualizado!', 'success');
        }}
      />
      <SettingsInput
        label="Email"
        value={data.email}
        type="email"
        readOnly
        onSave={() => {}}
      />
      <SettingsInput
        label="Telefone"
        value={data.phone}
        type="tel"
        placeholder="(00) 00000-0000"
        onSave={(v) => {
          onUpdate({ phone: v });
          toast('Telefone atualizado!', 'success');
        }}
      />
      <SettingsInput
        label="CPF"
        value={data.cpf}
        placeholder="000.000.000-00"
        onSave={(v) => {
          onUpdate({ cpf: v });
          toast('CPF atualizado!', 'success');
        }}
      />
    </SettingsSection>
  );
}

// ── Section: Alterar Senha ──────────────────────────────────────────

function PasswordSection() {
  const { toast } = useToast();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSalvarSenha() {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      toast('Preencha todos os campos.', 'error');
      return;
    }
    if (novaSenha.length < 8) {
      toast('A nova senha precisa ter no minimo 8 caracteres.', 'error');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      toast('As senhas nao coincidem.', 'error');
      return;
    }
    setSaving(true);
    try {
      await changeProfilePassword(senhaAtual, novaSenha);
      toast('Senha alterada com sucesso!', 'success');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
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
          placeholder="Minimo 8 caracteres"
          onSave={(v) => setNovaSenha(v)}
          validation={(v) => (v.length < 8 ? 'Minimo 8 caracteres' : null)}
        />
        <SettingsInput
          label="Confirmar nova senha"
          value={confirmarSenha}
          type="password"
          placeholder="Repita a nova senha"
          onSave={(v) => setConfirmarSenha(v)}
        />
        <button
          type="button"
          onClick={handleSalvarSenha}
          disabled={saving}
          className="mt-2 min-h-[44px] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: 'var(--bb-brand)', borderRadius: 'var(--bb-radius-md)' }}
        >
          {saving ? 'Salvando...' : 'Alterar senha'}
        </button>
      </div>
    </SettingsSection>
  );
}

// ── Section: Notificacoes ───────────────────────────────────────────

function NotificationsSection({
  data,
  onUpdate,
}: {
  data: ProfileSettingsData;
  onUpdate: (partial: Partial<ProfileSettingsData>) => void;
}) {
  return (
    <SettingsSection icon="bell" title="Notificacoes">
      <SettingsToggle
        label="Notificacoes push"
        description="Receba alertas no dispositivo"
        enabled={data.notification_push}
        onChange={(v) => onUpdate({ notification_push: v })}
      />
      <SettingsToggle
        label="Notificacoes por email"
        description="Receba avisos importantes por email"
        enabled={data.notification_email}
        onChange={(v) => onUpdate({ notification_email: v })}
      />
      <SettingsToggle
        label="Notificacoes por SMS"
        description="Receba lembretes por SMS"
        enabled={data.notification_sms}
        onChange={(v) => onUpdate({ notification_sms: v })}
      />
    </SettingsSection>
  );
}

// ── Section: Preferencias (Tema) ────────────────────────────────────

function ThemeSection() {
  const { theme, setTheme } = useTheme();

  return (
    <SettingsSection icon="palette" title="Preferencias">
      <div>
        <p className="mb-2 text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
          Tema
        </p>
        <div className="flex gap-3">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className="min-h-[44px] flex-1 py-3 text-sm font-semibold transition-all duration-200"
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
      </div>
    </SettingsSection>
  );
}

// ── Section: LGPD Export ────────────────────────────────────────────

function LgpdSection() {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const data = await exportProfileData();
      // Create download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blackbelt-meus-dados-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast('Dados exportados com sucesso!', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setExporting(false);
    }
  }

  return (
    <SettingsSection icon="shield" title="Exportar Dados (LGPD)">
      <p className="mb-3 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
        Exporte todos os seus dados pessoais em formato JSON, conforme previsto na Lei Geral de Protecao de Dados (LGPD).
      </p>
      <button
        type="button"
        onClick={handleExport}
        disabled={exporting}
        className="min-h-[44px] px-4 py-2 text-sm font-medium disabled:opacity-50"
        style={{
          background: 'var(--bb-depth-4)',
          borderRadius: 'var(--bb-radius-md)',
          color: 'var(--bb-ink-80)',
          border: '1px solid var(--bb-glass-border)',
        }}
      >
        {exporting ? 'Exportando...' : 'Exportar meus dados'}
      </button>
    </SettingsSection>
  );
}

// ── Section: Danger Zone ────────────────────────────────────────────

function DangerSection() {
  const { toast } = useToast();

  return (
    <DangerZone
      items={[
        {
          label: 'Excluir minha conta',
          description:
            'Todos os seus dados serao excluidos permanentemente. Esta acao nao pode ser desfeita.',
          action: async () => {
            try {
              await deleteProfileAccount();
              toast('Conta excluida com sucesso.', 'success');
            } catch (err) {
              toast(translateError(err), 'error');
            }
          },
          confirmText: 'EXCLUIR MINHA CONTA',
        },
      ]}
    />
  );
}

// ── Section: Admin — Dados da Academia ──────────────────────────────

function AdminAcademySection({ data }: { data: ProfileSettingsData }) {
  const { toast } = useToast();
  return (
    <SettingsSection icon="building" title="Dados da Academia">
      <SettingsInput
        label="Nome da academia"
        value={data.academy_name ?? ''}
        onSave={() => toast('Nome da academia atualizado!', 'success')}
      />
      <SettingsInput
        label="CNPJ"
        value={data.academy_cnpj ?? ''}
        placeholder="00.000.000/0000-00"
        onSave={() => toast('CNPJ atualizado!', 'success')}
      />
      <SettingsInput
        label="Endereco"
        value={data.academy_address ?? ''}
        onSave={() => toast('Endereco atualizado!', 'success')}
      />
      {data.saas_plan && (
        <SettingsInput
          label="Plano SaaS"
          value={data.saas_plan}
          readOnly
          onSave={() => {}}
        />
      )}
    </SettingsSection>
  );
}

// ── Section: Professor — Graduacao & Bio ────────────────────────────

function ProfessorSection({
  data,
  onUpdate,
}: {
  data: ProfileSettingsData;
  onUpdate: (partial: Partial<ProfileSettingsData>) => void;
}) {
  const { toast } = useToast();

  return (
    <>
      <SettingsSection icon="user" title="Graduacao e Formacao">
        <SettingsInput
          label="Graduacao / Faixa"
          value={data.graduation ?? ''}
          onSave={(v) => {
            onUpdate({ graduation: v });
            toast('Graduacao atualizada!', 'success');
          }}
        />
        <SettingsInput
          label="CREF"
          value={data.cref ?? ''}
          placeholder="000000-G/UF"
          onSave={(v) => {
            onUpdate({ cref: v });
            toast('CREF atualizado!', 'success');
          }}
        />
      </SettingsSection>

      <SettingsSection icon="user" title="Bio e Especialidades">
        <div className="py-2">
          <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
            Bio
          </label>
          <textarea
            value={data.bio ?? ''}
            onChange={() => {}}
            rows={3}
            className="w-full resize-none rounded-lg px-3 py-2 text-sm"
            style={{
              backgroundColor: 'var(--bb-depth-5)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 'var(--bb-radius-md)',
              color: 'var(--bb-ink-100)',
            }}
            placeholder="Conte um pouco sobre voce..."
            readOnly
          />
        </div>
        {data.specialties && data.specialties.length > 0 && (
          <div className="py-2">
            <p className="mb-2 text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Especialidades
            </p>
            <div className="flex flex-wrap gap-2">
              {data.specialties.map((spec) => (
                <span
                  key={spec}
                  className="rounded-full px-3 py-1.5 text-xs font-medium"
                  style={{
                    background: 'var(--bb-brand-surface)',
                    color: 'var(--bb-brand)',
                    border: '1px solid var(--bb-brand)',
                  }}
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}
      </SettingsSection>
    </>
  );
}

// ── Section: Recepcao — Turno e Permissoes ──────────────────────────

function RecepcaoSection({ data }: { data: ProfileSettingsData }) {
  return (
    <SettingsSection icon="timer" title="Turno e Permissoes">
      <SettingsInput
        label="Turno de trabalho"
        value={data.work_shift ?? ''}
        readOnly
        onSave={() => {}}
      />
      {data.permissions && data.permissions.length > 0 && (
        <div className="py-2">
          <p className="mb-2 text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
            Permissoes ativas
          </p>
          <div className="flex flex-wrap gap-2">
            {data.permissions.map((perm) => (
              <span
                key={perm}
                className="rounded-full px-3 py-1.5 text-xs font-medium"
                style={{
                  background: 'var(--bb-depth-4)',
                  color: 'var(--bb-ink-80)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              >
                {perm}
              </span>
            ))}
          </div>
        </div>
      )}
    </SettingsSection>
  );
}

// ── Section: Aluno — Dados Fisicos ──────────────────────────────────

function AlunoPhysicalSection({
  data,
  onUpdate,
}: {
  data: ProfileSettingsData;
  onUpdate: (partial: Partial<ProfileSettingsData>) => void;
}) {
  const { toast } = useToast();

  return (
    <SettingsSection icon="dumbbell" title="Dados Fisicos e Objetivos">
      <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-4">
        <SettingsInput
          label="Peso (kg)"
          value={data.weight != null ? String(data.weight) : ''}
          type="number"
          placeholder="Ex: 80"
          suffix="kg"
          onSave={(v) => {
            onUpdate({ weight: parseFloat(v) || undefined });
            toast('Peso atualizado!', 'success');
          }}
        />
        <SettingsInput
          label="Altura (cm)"
          value={data.height != null ? String(data.height) : ''}
          type="number"
          placeholder="Ex: 175"
          suffix="cm"
          onSave={(v) => {
            onUpdate({ height: parseFloat(v) || undefined });
            toast('Altura atualizada!', 'success');
          }}
        />
      </div>
      <SettingsInput
        label="Objetivo"
        value={data.objective ?? ''}
        placeholder="Ex: Competicao, Saude, Defesa pessoal"
        onSave={(v) => {
          onUpdate({ objective: v });
          toast('Objetivo atualizado!', 'success');
        }}
      />
      <SettingsInput
        label="Nivel"
        value={data.level ?? ''}
        placeholder="Ex: Iniciante, Intermediario, Avancado"
        onSave={(v) => {
          onUpdate({ level: v });
          toast('Nivel atualizado!', 'success');
        }}
      />
      <div className="py-2">
        <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
          Lesoes ou restricoes
        </label>
        <textarea
          defaultValue={data.injuries ?? ''}
          rows={2}
          className="w-full resize-none rounded-lg px-3 py-2 text-sm"
          style={{
            backgroundColor: 'var(--bb-depth-5)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-md)',
            color: 'var(--bb-ink-100)',
          }}
          placeholder="Descreva lesoes, limitacoes fisicas..."
          readOnly
        />
      </div>
    </SettingsSection>
  );
}

// ── Section: Teen — XP/Gamificacao ──────────────────────────────────

function TeenGamificationSection({ data }: { data: ProfileSettingsData }) {
  const pct = data.xp_next_level
    ? Math.round(((data.xp_current ?? 0) / data.xp_next_level) * 100)
    : 0;

  return (
    <SettingsSection icon="gamepad" title="Gamificacao">
      <div
        className="rounded-lg p-4"
        style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)' }}
      >
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            Level {data.xp_level ?? 1}
          </span>
          <span style={{ color: 'var(--bb-ink-60)' }}>
            {data.xp_current?.toLocaleString('pt-BR') ?? 0} / {data.xp_next_level?.toLocaleString('pt-BR') ?? 0} XP
          </span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full" style={{ background: 'var(--bb-depth-3)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(to right, var(--bb-brand), var(--bb-warning))',
            }}
          />
        </div>
      </div>
      {data.linked_guardian && (
        <div className="mt-3 py-2">
          <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
            Responsavel vinculado
          </p>
          <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            {data.linked_guardian}
          </p>
        </div>
      )}
    </SettingsSection>
  );
}

// ── Section: Responsavel — Filhos e Controles ───────────────────────

function ResponsavelSection({
  data,
  onUpdate,
}: {
  data: ProfileSettingsData;
  onUpdate: (partial: Partial<ProfileSettingsData>) => void;
}) {
  return (
    <>
      {/* Filhos vinculados */}
      <SettingsSection icon="users" title="Filhos Vinculados">
        {data.linked_children && data.linked_children.length > 0 ? (
          <div className="space-y-2">
            {data.linked_children.map((child) => (
              <div
                key={child.id}
                className="flex items-center justify-between rounded-lg p-3"
                style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                    style={{ background: 'var(--bb-brand-surface)', color: 'var(--bb-brand)' }}
                  >
                    {child.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                      {child.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      Faixa {child.belt}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
            Nenhum filho vinculado.
          </p>
        )}
      </SettingsSection>

      {/* Controles parentais */}
      {data.parental_controls && (
        <SettingsSection icon="shield" title="Controles Parentais">
          <SettingsToggle
            label="Chat habilitado"
            description="Permitir que seus filhos enviem mensagens"
            enabled={data.parental_controls.chat_enabled}
            onChange={(v) =>
              onUpdate({
                parental_controls: { ...data.parental_controls!, chat_enabled: v },
              })
            }
          />
          <SettingsToggle
            label="Filtro de conteudo"
            description="Restringir conteudo apenas para a faixa etaria"
            enabled={data.parental_controls.content_filter}
            onChange={(v) =>
              onUpdate({
                parental_controls: { ...data.parental_controls!, content_filter: v },
              })
            }
          />
          <SettingsInput
            label="Tempo maximo de tela (minutos)"
            value={String(data.parental_controls.max_screen_time_minutes)}
            type="number"
            suffix="min"
            onSave={(v) =>
              onUpdate({
                parental_controls: {
                  ...data.parental_controls!,
                  max_screen_time_minutes: parseInt(v, 10),
                },
              })
            }
          />
        </SettingsSection>
      )}
    </>
  );
}

// ── Section: Franqueador — Rede ─────────────────────────────────────

function FranqueadorNetworkSection({ data }: { data: ProfileSettingsData }) {
  return (
    <SettingsSection icon="network" title="Rede de Academias">
      {data.network_academies && data.network_academies.length > 0 ? (
        <div className="space-y-2">
          {data.network_academies.map((acad) => (
            <div
              key={acad.id}
              className="flex items-center justify-between rounded-lg p-3"
              style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)' }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                  {acad.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  {acad.city}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
          Nenhuma academia na rede.
        </p>
      )}
    </SettingsSection>
  );
}

// ── Page Title Map ──────────────────────────────────────────────────

const ROLE_TITLE_MAP: Record<ProfileRole, string> = {
  admin: 'Configuracoes do Perfil',
  professor: 'Configuracoes do Perfil',
  recepcao: 'Configuracoes do Perfil',
  aluno_adulto: 'Configuracoes do Perfil',
  aluno_teen: 'Configuracoes do Perfil',
  aluno_kids: 'Meu Cantinho',
  responsavel: 'Configuracoes do Perfil',
  franqueador: 'Configuracoes do Perfil',
  superadmin: 'Configuracoes do Perfil',
};

const ROLE_SUBTITLE_MAP: Record<ProfileRole, string> = {
  admin: 'Gerencie seus dados e configuracoes da academia',
  professor: 'Gerencie seus dados e formacao profissional',
  recepcao: 'Gerencie suas informacoes pessoais',
  aluno_adulto: 'Gerencie seus dados pessoais e de treino',
  aluno_teen: 'Personalize seu perfil e acompanhe sua evolucao',
  aluno_kids: 'Personalize seu avatar e suas preferencias!',
  responsavel: 'Gerencie seus dados e controles parentais',
  franqueador: 'Gerencie seus dados e acompanhe a rede',
  superadmin: 'Dados pessoais e configuracoes da plataforma',
};

// ── Main Component ──────────────────────────────────────────────────

export default function ProfileSettingsPage({ role }: ProfileSettingsPageProps) {
  const { toast } = useToast();
  const [data, setData] = useState<ProfileSettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await getProfileSettings(role);
        setData(result);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [role]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdate = useCallback(
    async (partial: Partial<ProfileSettingsData>) => {
      try {
        await updateProfileSettings(role, partial);
        setData((prev) => (prev ? { ...prev, ...partial } : prev));
        toast('Salvo!', 'success');
      } catch (err) {
        toast(translateError(err), 'error');
      }
    },
    [role, toast],
  );

  if (loading) return <ProfileSettingsSkeleton />;

  if (!data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
        <p className="text-4xl">{'⚙️'}</p>
        <h2 className="mt-4 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          Perfil indisponivel
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
          Nao foi possivel carregar suas configuracoes.
        </p>
      </div>
    );
  }

  const isKids = role === 'aluno_kids';

  return (
    <div className="min-h-screen p-4 pb-24 sm:p-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold sm:text-2xl" style={{ color: 'var(--bb-ink-100)' }}>
          {ROLE_TITLE_MAP[role]}
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          {ROLE_SUBTITLE_MAP[role]}
        </p>
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl space-y-6">
        {/* 1. Avatar / Emoji */}
        <AvatarSection role={role} data={data} onUpdate={handleUpdate} />

        {/* 2. Dados pessoais */}
        <PersonalDataSection role={role} data={data} onUpdate={handleUpdate} />

        {/* 3. Role-specific sections */}
        {role === 'admin' && <AdminAcademySection data={data} />}
        {role === 'professor' && <ProfessorSection data={data} onUpdate={handleUpdate} />}
        {role === 'recepcao' && <RecepcaoSection data={data} />}
        {(role === 'aluno_adulto' || role === 'aluno_teen') && (
          <AlunoPhysicalSection data={data} onUpdate={handleUpdate} />
        )}
        {role === 'aluno_teen' && <TeenGamificationSection data={data} />}
        {role === 'responsavel' && <ResponsavelSection data={data} onUpdate={handleUpdate} />}
        {role === 'franqueador' && <FranqueadorNetworkSection data={data} />}

        {/* 4. Alterar senha — exceto kids */}
        {!isKids && <PasswordSection />}

        {/* 5. Notificacoes */}
        <NotificationsSection data={data} onUpdate={handleUpdate} />

        {/* 6. Preferencias (tema) */}
        <ThemeSection />

        {/* 7. LGPD */}
        <LgpdSection />

        {/* 8. Danger zone — exceto kids */}
        {!isKids && <DangerSection />}
      </div>
    </div>
  );
}

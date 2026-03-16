'use client';

import { useState, type CSSProperties } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// ── Inline SVG icons (lucide-style, stroke-width 1.5) ────────────────
function IconSun({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function IconMoon({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function IconMonitor({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

function IconBell({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconShield({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconBuilding({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
    </svg>
  );
}

// ── Icon type ─────────────────────────────────────────────────────────
type IconComponent = React.ComponentType<{ size?: number; color: string }>;

// ── Toggle switch ────────────────────────────────────────────────────
function ToggleSwitch({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className="relative inline-flex h-6 w-11 flex-shrink-0 items-center transition-colors duration-200"
      style={{
        borderRadius: '9999px',
        background: enabled ? 'var(--bb-brand)' : 'var(--bb-ink-20)',
      }}
    >
      <span
        className="inline-block h-4 w-4 transform transition-transform duration-200"
        style={{
          borderRadius: '50%',
          background: '#fff',
          transform: enabled ? 'translateX(24px)' : 'translateX(4px)',
        }}
      />
    </button>
  );
}

// ── Notification row ──────────────────────────────────────────────────
function NotificationRow({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
    >
      <div className="flex-1 pr-4">
        <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
          {label}
        </p>
        <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
          {description}
        </p>
      </div>
      <ToggleSwitch enabled={enabled} onToggle={onToggle} />
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: IconComponent;
  title: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon size={16} color="var(--bb-ink-40)" />
      <h2
        className="font-display text-sm font-semibold uppercase"
        style={{
          color: 'var(--bb-ink-60)',
          letterSpacing: '0.06em',
        }}
      >
        {title}
      </h2>
    </div>
  );
}

// ── Card wrapper ──────────────────────────────────────────────────────
const cardStyle: CSSProperties = {
  background: 'var(--bb-depth-3)',
  border: '1px solid var(--bb-glass-border)',
  borderRadius: 'var(--bb-radius-lg)',
};

// ── Theme option button ───────────────────────────────────────────────
function ThemeButton({
  icon: Icon,
  label,
  value,
  currentTheme,
  onClick,
}: {
  icon: IconComponent;
  label: string;
  value: 'light' | 'dark' | 'system';
  currentTheme: string;
  onClick: () => void;
}) {
  const isActive = currentTheme === value;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 flex-col items-center gap-2 py-4 transition-all duration-200"
      style={{
        borderRadius: 'var(--bb-radius-md)',
        background: isActive ? 'var(--bb-brand-surface)' : 'var(--bb-depth-4)',
        border: isActive
          ? '2px solid var(--bb-brand)'
          : '1px solid var(--bb-glass-border)',
      }}
    >
      <Icon
        size={20}
        color={isActive ? 'var(--bb-brand)' : 'var(--bb-ink-40)'}
      />
      <span
        className="text-xs font-medium"
        style={{ color: isActive ? 'var(--bb-brand)' : 'var(--bb-ink-60)' }}
      >
        {label}
      </span>
    </button>
  );
}

// ── Mock academy data ─────────────────────────────────────────────────
const MOCK_ACADEMY = {
  name: 'Guerreiros BJJ',
  cnpj: '12.345.678/0001-00',
  email: 'contato@guerreirosbjj.com.br',
};

// ── Main page component ──────────────────────────────────────────────
export default function AdminConfiguracoesPage() {
  const { theme, setTheme } = useTheme();

  // Notification toggles
  const [notifications, setNotifications] = useState({
    novosAlunos: true,
    pagamentos: true,
    checkins: false,
    alertasSistema: true,
  });

  // Password form
  const [passwords, setPasswords] = useState({
    current: '',
    newPassword: '',
    confirm: '',
  });
  const [passwordError, setPasswordError] = useState('');

  function toggleNotification(key: keyof typeof notifications) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');

    if (!passwords.current || !passwords.newPassword || !passwords.confirm) {
      setPasswordError('Preencha todos os campos.');
      return;
    }

    if (passwords.newPassword.length < 8) {
      setPasswordError('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (passwords.newPassword !== passwords.confirm) {
      setPasswordError('As senhas nao coincidem.');
      return;
    }

    // Mock success
    setPasswords({ current: '', newPassword: '', confirm: '' });
  }

  return (
    <div className="min-h-screen space-y-6 p-6">
      {/* ── Page title ────────────────────────────────────────────── */}
      <h1
        className="font-display text-xl font-bold"
        style={{ color: 'var(--bb-ink-100)' }}
      >
        Configuracoes
      </h1>

      {/* ── SECTION 1: Tema ───────────────────────────────────────── */}
      <section>
        <SectionHeader icon={IconSun} title="Tema" />
        <div style={cardStyle} className="p-4">
          <div className="flex gap-3">
            <ThemeButton
              icon={IconSun}
              label="Claro"
              value="light"
              currentTheme={theme}
              onClick={() => setTheme('light')}
            />
            <ThemeButton
              icon={IconMoon}
              label="Escuro"
              value="dark"
              currentTheme={theme}
              onClick={() => setTheme('dark')}
            />
            <ThemeButton
              icon={IconMonitor}
              label="Sistema"
              value="system"
              currentTheme={theme}
              onClick={() => setTheme('system')}
            />
          </div>
        </div>
      </section>

      {/* ── SECTION 2: Notificacoes ───────────────────────────────── */}
      <section>
        <SectionHeader icon={IconBell} title="Notificacoes" />
        <div style={cardStyle} className="overflow-hidden">
          <NotificationRow
            label="Novos alunos"
            description="Receber alerta quando um novo aluno se cadastrar"
            enabled={notifications.novosAlunos}
            onToggle={() => toggleNotification('novosAlunos')}
          />
          <NotificationRow
            label="Pagamentos"
            description="Notificar sobre pagamentos recebidos e em atraso"
            enabled={notifications.pagamentos}
            onToggle={() => toggleNotification('pagamentos')}
          />
          <NotificationRow
            label="Check-ins"
            description="Alerta a cada check-in realizado na academia"
            enabled={notifications.checkins}
            onToggle={() => toggleNotification('checkins')}
          />
          <NotificationRow
            label="Alertas do sistema"
            description="Notificacoes sobre atualizacoes e manutencao"
            enabled={notifications.alertasSistema}
            onToggle={() => toggleNotification('alertasSistema')}
          />
        </div>
      </section>

      {/* ── SECTION 3: Seguranca ──────────────────────────────────── */}
      <section>
        <SectionHeader icon={IconShield} title="Seguranca" />
        <div style={cardStyle} className="p-4">
          <h3
            className="mb-4 text-sm font-medium"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Trocar senha
          </h3>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              label="Senha atual"
              type="password"
              placeholder="Digite sua senha atual"
              value={passwords.current}
              onChange={(e) =>
                setPasswords((prev) => ({ ...prev, current: e.target.value }))
              }
            />
            <Input
              label="Nova senha"
              type="password"
              placeholder="Digite a nova senha"
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))
              }
              helperText="Minimo de 8 caracteres"
            />
            <Input
              label="Confirmar nova senha"
              type="password"
              placeholder="Repita a nova senha"
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords((prev) => ({ ...prev, confirm: e.target.value }))
              }
              error={passwordError || undefined}
            />

            <Button type="submit" variant="primary" size="md">
              Atualizar senha
            </Button>
          </form>
        </div>
      </section>

      {/* ── SECTION 4: Dados da Academia ──────────────────────────── */}
      <section>
        <SectionHeader icon={IconBuilding} title="Dados da Academia" />
        <div style={cardStyle} className="p-4">
          <div className="space-y-4">
            <Input
              label="Nome da academia"
              value={MOCK_ACADEMY.name}
              readOnly
            />
            <Input
              label="CNPJ"
              value={MOCK_ACADEMY.cnpj}
              readOnly
            />
            <Input
              label="Email"
              type="email"
              value={MOCK_ACADEMY.email}
              readOnly
            />
          </div>

          <p
            className="mt-3 text-xs"
            style={{ color: 'var(--bb-ink-40)' }}
          >
            Para alterar os dados da academia, entre em contato com o suporte.
          </p>
        </div>
      </section>
    </div>
  );
}

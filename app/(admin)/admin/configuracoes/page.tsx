'use client';

import { useState, useEffect, type CSSProperties } from 'react';
import Link from 'next/link';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useToast } from '@/lib/hooks/useToast';
import { TutorialSettings } from '@/components/shared/TutorialSettings';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { BeltLevel } from '@/lib/types/domain';

// ── Inline SVG icons (lucide-style, stroke-width 1.5) ────────────────

function IconBuilding({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
    </svg>
  );
}

function IconUsers({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconAward({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
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

function IconPlug({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22v-5" />
      <path d="M9 8V2" />
      <path d="M15 8V2" />
      <path d="M18 8v5a6 6 0 0 1-12 0V8z" />
    </svg>
  );
}

function IconCreditCard({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function IconDownload({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

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

function IconLock({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconUpload({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function IconChevronRight({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// ── Icon type ─────────────────────────────────────────────────────────
type IconComponent = React.ComponentType<{ size?: number; color: string }>;

// ── Card style ────────────────────────────────────────────────────────
const cardStyle: CSSProperties = {
  background: 'var(--bb-depth-3)',
  border: '1px solid var(--bb-glass-border)',
  borderRadius: 'var(--bb-radius-lg)',
};

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

// ── Toggle switch (44px touch target) ────────────────────────────────
function ToggleSwitch({
  enabled,
  onToggle,
  label,
}: {
  enabled: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={onToggle}
      className="relative inline-flex h-7 w-12 flex-shrink-0 items-center transition-colors duration-200"
      style={{
        borderRadius: '9999px',
        background: enabled ? 'var(--bb-brand)' : 'var(--bb-ink-20)',
        minWidth: '48px',
        minHeight: '44px',
      }}
    >
      <span
        className="inline-block h-5 w-5 transform transition-transform duration-200"
        style={{
          borderRadius: '50%',
          background: '#fff',
          transform: enabled ? 'translateX(24px)' : 'translateX(4px)',
        }}
      />
    </button>
  );
}

// ── Toggle row ───────────────────────────────────────────────────────
function ToggleRow({
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
      className="flex items-center justify-between gap-4 px-4 py-3"
      style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
          {label}
        </p>
        <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
          {description}
        </p>
      </div>
      <ToggleSwitch enabled={enabled} onToggle={onToggle} label={label} />
    </div>
  );
}

// ── Theme button ─────────────────────────────────────────────────────
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
        minHeight: '44px',
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

// ── Mock data ────────────────────────────────────────────────────────

const MOCK_ACADEMY = {
  name: 'Guerreiros BJJ',
  cnpj: '12.345.678/0001-00',
  address: 'Rua das Artes Marciais, 123 - Centro, Sao Paulo/SP',
  phone: '(11) 99999-0000',
  email: 'contato@guerreirosbjj.com.br',
  brandColors: {
    primary: '#EF4444',
    secondary: '#B91C1C',
  },
};

const MOCK_MODALITIES = [
  { id: 'bjj', name: 'Jiu-Jitsu', enabled: true },
  { id: 'muay-thai', name: 'Muay Thai', enabled: true },
  { id: 'judo', name: 'Judo', enabled: false },
  { id: 'karate', name: 'Karate', enabled: false },
  { id: 'boxe', name: 'Boxe', enabled: true },
  { id: 'wrestling', name: 'Wrestling', enabled: false },
  { id: 'mma', name: 'MMA', enabled: true },
  { id: 'capoeira', name: 'Capoeira', enabled: false },
];

interface GradCriteria {
  belt: BeltLevel;
  label: string;
  attendance: number;
  months: number;
  quizAvg: number;
  color: string;
  textColor: string;
}

const MOCK_GRAD_CRITERIA: GradCriteria[] = [
  { belt: BeltLevel.White, label: 'Branca', attendance: 0, months: 0, quizAvg: 0, color: 'var(--bb-belt-white)', textColor: '#1a1a1a' },
  { belt: BeltLevel.Gray, label: 'Cinza', attendance: 20, months: 3, quizAvg: 60, color: 'var(--bb-belt-gray)', textColor: '#fff' },
  { belt: BeltLevel.Yellow, label: 'Amarela', attendance: 30, months: 4, quizAvg: 65, color: 'var(--bb-belt-yellow)', textColor: '#1a1a1a' },
  { belt: BeltLevel.Orange, label: 'Laranja', attendance: 40, months: 6, quizAvg: 70, color: 'var(--bb-belt-orange)', textColor: '#fff' },
  { belt: BeltLevel.Green, label: 'Verde', attendance: 50, months: 8, quizAvg: 70, color: 'var(--bb-belt-green)', textColor: '#fff' },
  { belt: BeltLevel.Blue, label: 'Azul', attendance: 60, months: 12, quizAvg: 75, color: 'var(--bb-belt-blue)', textColor: '#fff' },
  { belt: BeltLevel.Purple, label: 'Roxa', attendance: 80, months: 18, quizAvg: 80, color: 'var(--bb-belt-purple)', textColor: '#fff' },
  { belt: BeltLevel.Brown, label: 'Marrom', attendance: 100, months: 24, quizAvg: 85, color: 'var(--bb-belt-brown)', textColor: '#fff' },
  { belt: BeltLevel.Black, label: 'Preta', attendance: 150, months: 36, quizAvg: 90, color: 'var(--bb-belt-black)', textColor: '#fff' },
];

const MOCK_INTEGRATIONS: Array<{
  id: string;
  name: string;
  description: string;
  icon: string;
}> = [
  {
    id: 'pagamento',
    name: 'Pagamento',
    description: 'Integre com gateways de pagamento (Stripe, PagSeguro)',
    icon: '\uD83D\uDCB3',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    description: 'Envie notificacoes automaticas via WhatsApp Business',
    icon: '\uD83D\uDCAC',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sincronize turmas e eventos com o Google Calendar',
    icon: '\uD83D\uDCC5',
  },
];

// ── Loading skeleton ─────────────────────────────────────────────────

function SettingsSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Skeleton variant="text" className="h-8 w-48" />
      <Skeleton variant="text" className="h-4 w-64" />
      <Skeleton variant="card" className="h-64" />
      <Skeleton variant="card" className="h-48" />
      <Skeleton variant="card" className="h-56" />
      <Skeleton variant="card" className="h-40" />
      <Skeleton variant="card" className="h-32" />
    </div>
  );
}

// ── Main page component ──────────────────────────────────────────────

export default function AdminConfiguracoesPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // Academy data
  const [academy, setAcademy] = useState(MOCK_ACADEMY);

  // Class config
  const [defaultCapacity, setDefaultCapacity] = useState(30);
  const [modalities, setModalities] = useState(MOCK_MODALITIES);

  // Graduation criteria (editable)
  const [gradCriteria, setGradCriteria] = useState(MOCK_GRAD_CRITERIA);

  // Notifications
  const [notifications, setNotifications] = useState({
    absenceAlert: true,
    paymentReminder: true,
    graduationNotification: true,
    newStudentAlert: false,
    systemAlerts: true,
  });

  // LGPD export
  const [exporting, setExporting] = useState(false);

  // Saving states
  const [savingAcademy, setSavingAcademy] = useState(false);
  const [savingClass, setSavingClass] = useState(false);
  const [savingGrad, setSavingGrad] = useState(false);
  const [savingNotif, setSavingNotif] = useState(false);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────

  function toggleModality(id: string) {
    setModalities((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)),
    );
  }

  function toggleNotification(key: keyof typeof notifications) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function updateGradCriteria(
    belt: BeltLevel,
    field: 'attendance' | 'months' | 'quizAvg',
    value: number,
  ) {
    setGradCriteria((prev) =>
      prev.map((c) => (c.belt === belt ? { ...c, [field]: value } : c)),
    );
  }

  async function handleSaveAcademy() {
    setSavingAcademy(true);
    await new Promise((r) => setTimeout(r, 800));
    setSavingAcademy(false);
    toast('Dados da academia salvos com sucesso!', 'success');
  }

  async function handleSaveClass() {
    setSavingClass(true);
    await new Promise((r) => setTimeout(r, 800));
    setSavingClass(false);
    toast('Configuracoes de turma salvas!', 'success');
  }

  async function handleSaveGrad() {
    setSavingGrad(true);
    await new Promise((r) => setTimeout(r, 800));
    setSavingGrad(false);
    toast('Criterios de graduacao atualizados!', 'success');
  }

  async function handleSaveNotif() {
    setSavingNotif(true);
    await new Promise((r) => setTimeout(r, 800));
    setSavingNotif(false);
    toast('Preferencias de notificacao salvas!', 'success');
  }

  async function handleExport() {
    setExporting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setExporting(false);
    toast('Exportacao LGPD iniciada! Voce recebera o arquivo por email.', 'success');
  }

  // ── Loading ─────────────────────────────────────────────────────────

  if (loading) return <SettingsSkeleton />;

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen p-4 sm:p-6 animate-reveal overflow-x-hidden">
      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="mb-6">
        <h1
          className="font-display text-xl font-bold sm:text-2xl"
          style={{ color: 'var(--bb-ink-100)' }}
        >
          Configuracoes
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Gerencie as configuracoes da sua academia
        </p>
      </div>

      <div data-stagger className="space-y-6">
        {/* ══════════════════════════════════════════════════════════
           SECTION 1: Dados da Academia
           ══════════════════════════════════════════════════════════ */}
        <section>
          <SectionHeader icon={IconBuilding} title="Dados da Academia" />
          <div style={cardStyle} className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Nome da academia"
                value={academy.name}
                onChange={(e) => setAcademy({ ...academy, name: e.target.value })}
              />
              <Input
                label="CNPJ"
                value={academy.cnpj}
                onChange={(e) => setAcademy({ ...academy, cnpj: e.target.value })}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Endereco"
                  value={academy.address}
                  onChange={(e) => setAcademy({ ...academy, address: e.target.value })}
                />
              </div>
              <Input
                label="Telefone"
                type="tel"
                value={academy.phone}
                onChange={(e) => setAcademy({ ...academy, phone: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                value={academy.email}
                onChange={(e) => setAcademy({ ...academy, email: e.target.value })}
              />
            </div>

            {/* Logo upload placeholder */}
            <div className="mt-6">
              <p
                className="mb-2 text-sm font-medium"
                style={{ color: 'var(--bb-ink-80)' }}
              >
                Logo da academia
              </p>
              <button
                type="button"
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 transition-colors duration-200"
                style={{
                  borderColor: 'var(--bb-glass-border)',
                  background: 'var(--bb-depth-4)',
                  minHeight: '44px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--bb-brand)';
                  e.currentTarget.style.background = 'var(--bb-brand-surface)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--bb-glass-border)';
                  e.currentTarget.style.background = 'var(--bb-depth-4)';
                }}
                onClick={() => toast('Upload de logo sera disponibilizado em breve', 'info')}
              >
                <IconUpload size={24} color="var(--bb-ink-40)" />
                <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                  Clique para fazer upload da logo
                </span>
                <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  PNG, JPG ou SVG. Max 2MB
                </span>
              </button>
            </div>

            {/* Brand colors display */}
            <div className="mt-6">
              <p
                className="mb-2 text-sm font-medium"
                style={{ color: 'var(--bb-ink-80)' }}
              >
                Cores da marca
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
                <div className="flex items-center gap-2">
                  <div
                    className="h-8 w-8 flex-shrink-0 rounded-lg"
                    style={{
                      background: academy.brandColors.primary,
                      border: '1px solid var(--bb-glass-border)',
                    }}
                  />
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                      Primaria
                    </p>
                    <p className="font-mono text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      {academy.brandColors.primary}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-8 w-8 flex-shrink-0 rounded-lg"
                    style={{
                      background: academy.brandColors.secondary,
                      border: '1px solid var(--bb-glass-border)',
                    }}
                  />
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                      Secundaria
                    </p>
                    <p className="font-mono text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      {academy.brandColors.secondary}
                    </p>
                  </div>
                </div>
                <Link
                  href="/admin/configuracoes/marca"
                  className="flex items-center gap-1 self-start rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:self-center"
                  style={{
                    background: 'var(--bb-brand-surface)',
                    color: 'var(--bb-brand)',
                    minHeight: '44px',
                  }}
                >
                  Editar cores
                  <IconChevronRight size={14} color="var(--bb-brand)" />
                </Link>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                onClick={handleSaveAcademy}
                loading={savingAcademy}
                size="md"
                className="w-full sm:w-auto"
              >
                Salvar dados
              </Button>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
           SECTION 2: Configuracoes de Turma
           ══════════════════════════════════════════════════════════ */}
        <section>
          <SectionHeader icon={IconUsers} title="Configuracoes de Turma" />
          <div style={cardStyle} className="p-4 sm:p-6">
            <div className="max-w-full sm:max-w-xs">
              <Input
                label="Capacidade padrao por turma"
                type="number"
                value={String(defaultCapacity)}
                onChange={(e) => setDefaultCapacity(Number(e.target.value))}
                helperText="Numero maximo de alunos por turma (padrao)"
              />
            </div>

            <div className="mt-6">
              <p
                className="mb-3 text-sm font-medium"
                style={{ color: 'var(--bb-ink-80)' }}
              >
                Modalidades disponiveis
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {modalities.map((mod) => (
                  <div
                    key={mod.id}
                    className="flex items-center justify-between rounded-lg px-4 py-3"
                    style={{
                      background: mod.enabled ? 'var(--bb-brand-surface)' : 'var(--bb-depth-4)',
                      border: mod.enabled
                        ? '1px solid rgba(239, 68, 68, 0.2)'
                        : '1px solid var(--bb-glass-border)',
                      minHeight: '44px',
                    }}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{ color: mod.enabled ? 'var(--bb-ink-100)' : 'var(--bb-ink-60)' }}
                    >
                      {mod.name}
                    </span>
                    <ToggleSwitch
                      enabled={mod.enabled}
                      onToggle={() => toggleModality(mod.id)}
                      label={`Toggle ${mod.name}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                onClick={handleSaveClass}
                loading={savingClass}
                size="md"
                className="w-full sm:w-auto"
              >
                Salvar turma
              </Button>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
           SECTION 3: Configuracoes de Graduacao
           ══════════════════════════════════════════════════════════ */}
        <section>
          <SectionHeader icon={IconAward} title="Configuracoes de Graduacao" />
          <div style={cardStyle} className="overflow-hidden">
            <p
              className="px-4 pt-4 text-sm sm:px-6 sm:pt-6"
              style={{ color: 'var(--bb-ink-60)' }}
            >
              Defina os criterios minimos para promocao a cada faixa
            </p>

            {/* Desktop table */}
            <div className="mt-4 hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                    <th
                      className="px-6 py-3 text-left font-mono text-xs uppercase"
                      style={{ color: 'var(--bb-ink-40)', letterSpacing: '0.05em' }}
                    >
                      Faixa
                    </th>
                    <th
                      className="px-6 py-3 text-left font-mono text-xs uppercase"
                      style={{ color: 'var(--bb-ink-40)', letterSpacing: '0.05em' }}
                    >
                      Presencas min.
                    </th>
                    <th
                      className="px-6 py-3 text-left font-mono text-xs uppercase"
                      style={{ color: 'var(--bb-ink-40)', letterSpacing: '0.05em' }}
                    >
                      Meses min.
                    </th>
                    <th
                      className="px-6 py-3 text-left font-mono text-xs uppercase"
                      style={{ color: 'var(--bb-ink-40)', letterSpacing: '0.05em' }}
                    >
                      Media quiz (%)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {gradCriteria.map((criteria) => {
                    const isInitial = criteria.belt === BeltLevel.White;
                    return (
                      <tr
                        key={criteria.belt}
                        style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                      >
                        <td className="px-6 py-3">
                          <span
                            className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                            style={{
                              background: criteria.color,
                              color: criteria.textColor,
                              border: criteria.belt === BeltLevel.White
                                ? '1px solid var(--bb-glass-border)'
                                : 'none',
                            }}
                          >
                            {criteria.label}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          {isInitial ? (
                            <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                              -
                            </span>
                          ) : (
                            <input
                              type="number"
                              min={0}
                              value={criteria.attendance}
                              onChange={(e) =>
                                updateGradCriteria(
                                  criteria.belt,
                                  'attendance',
                                  Number(e.target.value),
                                )
                              }
                              className="h-9 w-20 rounded-lg px-2 text-center text-sm"
                              style={{
                                background: 'var(--bb-depth-5)',
                                border: '1px solid var(--bb-glass-border)',
                                color: 'var(--bb-ink-100)',
                              }}
                            />
                          )}
                        </td>
                        <td className="px-6 py-3">
                          {isInitial ? (
                            <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                              -
                            </span>
                          ) : (
                            <input
                              type="number"
                              min={0}
                              value={criteria.months}
                              onChange={(e) =>
                                updateGradCriteria(
                                  criteria.belt,
                                  'months',
                                  Number(e.target.value),
                                )
                              }
                              className="h-9 w-20 rounded-lg px-2 text-center text-sm"
                              style={{
                                background: 'var(--bb-depth-5)',
                                border: '1px solid var(--bb-glass-border)',
                                color: 'var(--bb-ink-100)',
                              }}
                            />
                          )}
                        </td>
                        <td className="px-6 py-3">
                          {isInitial ? (
                            <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                              -
                            </span>
                          ) : (
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={criteria.quizAvg}
                              onChange={(e) =>
                                updateGradCriteria(
                                  criteria.belt,
                                  'quizAvg',
                                  Number(e.target.value),
                                )
                              }
                              className="h-9 w-20 rounded-lg px-2 text-center text-sm"
                              style={{
                                background: 'var(--bb-depth-5)',
                                border: '1px solid var(--bb-glass-border)',
                                color: 'var(--bb-ink-100)',
                              }}
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards for graduation criteria */}
            <div className="mt-4 space-y-3 px-4 pb-4 sm:hidden">
              {gradCriteria.map((criteria) => {
                const isInitial = criteria.belt === BeltLevel.White;
                return (
                  <div
                    key={criteria.belt}
                    className="rounded-lg p-3"
                    style={{
                      background: 'var(--bb-depth-4)',
                      border: '1px solid var(--bb-glass-border)',
                    }}
                  >
                    <div className="mb-3">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{
                          background: criteria.color,
                          color: criteria.textColor,
                          border: criteria.belt === BeltLevel.White
                            ? '1px solid var(--bb-glass-border)'
                            : 'none',
                        }}
                      >
                        {criteria.label}
                      </span>
                    </div>
                    {isInitial ? (
                      <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                        Faixa inicial — sem requisitos
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label
                            className="mb-1 block text-xs"
                            style={{ color: 'var(--bb-ink-40)' }}
                          >
                            Presencas
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={criteria.attendance}
                            onChange={(e) =>
                              updateGradCriteria(
                                criteria.belt,
                                'attendance',
                                Number(e.target.value),
                              )
                            }
                            className="h-11 w-full rounded-lg px-2 text-center text-sm"
                            style={{
                              background: 'var(--bb-depth-5)',
                              border: '1px solid var(--bb-glass-border)',
                              color: 'var(--bb-ink-100)',
                              minHeight: '44px',
                            }}
                          />
                        </div>
                        <div>
                          <label
                            className="mb-1 block text-xs"
                            style={{ color: 'var(--bb-ink-40)' }}
                          >
                            Meses
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={criteria.months}
                            onChange={(e) =>
                              updateGradCriteria(
                                criteria.belt,
                                'months',
                                Number(e.target.value),
                              )
                            }
                            className="h-11 w-full rounded-lg px-2 text-center text-sm"
                            style={{
                              background: 'var(--bb-depth-5)',
                              border: '1px solid var(--bb-glass-border)',
                              color: 'var(--bb-ink-100)',
                              minHeight: '44px',
                            }}
                          />
                        </div>
                        <div>
                          <label
                            className="mb-1 block text-xs"
                            style={{ color: 'var(--bb-ink-40)' }}
                          >
                            Quiz %
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={criteria.quizAvg}
                            onChange={(e) =>
                              updateGradCriteria(
                                criteria.belt,
                                'quizAvg',
                                Number(e.target.value),
                              )
                            }
                            className="h-11 w-full rounded-lg px-2 text-center text-sm"
                            style={{
                              background: 'var(--bb-depth-5)',
                              border: '1px solid var(--bb-glass-border)',
                              color: 'var(--bb-ink-100)',
                              minHeight: '44px',
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 px-4 pb-4 sm:flex-row sm:justify-end sm:px-6 sm:pb-6">
              <Button
                onClick={handleSaveGrad}
                loading={savingGrad}
                size="md"
                className="w-full sm:w-auto"
              >
                Salvar criterios
              </Button>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
           SECTION 4: Tema
           ══════════════════════════════════════════════════════════ */}
        <section>
          <SectionHeader icon={IconSun} title="Tema" />
          <div style={cardStyle} className="p-4 sm:p-6">
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

        {/* ══════════════════════════════════════════════════════════
           SECTION 5: Notificacoes
           ══════════════════════════════════════════════════════════ */}
        <section>
          <SectionHeader icon={IconBell} title="Notificacoes" />
          <div style={cardStyle} className="overflow-hidden">
            <ToggleRow
              label="Alerta de ausencia"
              description="Notificar quando alunos faltarem mais de 3 aulas consecutivas"
              enabled={notifications.absenceAlert}
              onToggle={() => toggleNotification('absenceAlert')}
            />
            <ToggleRow
              label="Lembrete de pagamento"
              description="Enviar lembretes automaticos de mensalidades em atraso"
              enabled={notifications.paymentReminder}
              onToggle={() => toggleNotification('paymentReminder')}
            />
            <ToggleRow
              label="Notificacao de graduacao"
              description="Alerta quando um aluno atinge os criterios para promocao de faixa"
              enabled={notifications.graduationNotification}
              onToggle={() => toggleNotification('graduationNotification')}
            />
            <ToggleRow
              label="Novos alunos"
              description="Receber alerta quando um novo aluno se cadastrar"
              enabled={notifications.newStudentAlert}
              onToggle={() => toggleNotification('newStudentAlert')}
            />
            <ToggleRow
              label="Alertas do sistema"
              description="Notificacoes sobre atualizacoes e manutencao do sistema"
              enabled={notifications.systemAlerts}
              onToggle={() => toggleNotification('systemAlerts')}
            />
            <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:justify-end">
              <Button
                onClick={handleSaveNotif}
                loading={savingNotif}
                size="md"
                className="w-full sm:w-auto"
              >
                Salvar preferencias
              </Button>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
           SECTION 6: Integracoes
           ══════════════════════════════════════════════════════════ */}
        <section>
          <SectionHeader icon={IconPlug} title="Integracoes" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MOCK_INTEGRATIONS.map((integration) => (
              <div
                key={integration.id}
                style={{
                  ...cardStyle,
                  opacity: 0.7,
                }}
                className="relative overflow-hidden p-4 sm:p-5"
              >
                {/* Locked icon */}
                <div className="absolute right-3 top-3">
                  <IconLock size={16} color="var(--bb-ink-40)" />
                </div>

                <div className="mb-2 text-2xl">{integration.icon}</div>
                <h3
                  className="text-sm font-semibold"
                  style={{ color: 'var(--bb-ink-100)' }}
                >
                  {integration.name}
                </h3>
                <p
                  className="mt-1 text-xs"
                  style={{ color: 'var(--bb-ink-60)' }}
                >
                  {integration.description}
                </p>
                <div className="mt-3">
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{
                      background: 'var(--bb-depth-4)',
                      color: 'var(--bb-ink-40)',
                    }}
                  >
                    Em breve
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
           SECTION 7: Plano
           ══════════════════════════════════════════════════════════ */}
        <section>
          <SectionHeader icon={IconCreditCard} title="Plano" />
          <Link href="/admin/plano">
            <div
              style={cardStyle}
              className="flex items-center justify-between p-4 sm:p-5 transition-all duration-200 cursor-pointer"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--bb-glass-border-hover)';
                e.currentTarget.style.boxShadow = 'var(--bb-shadow-sm)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <div className="flex-1 min-w-0">
                <h3
                  className="text-sm font-semibold"
                  style={{ color: 'var(--bb-ink-100)' }}
                >
                  Gerenciar Plano & Uso
                </h3>
                <p
                  className="mt-1 text-xs"
                  style={{ color: 'var(--bb-ink-60)' }}
                >
                  Veja seu plano atual, uso de recursos e historico de faturas
                </p>
              </div>
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <IconChevronRight size={20} color="var(--bb-ink-40)" />
              </div>
            </div>
          </Link>
        </section>

        {/* ══════════════════════════════════════════════════════════
           TUTORIAL
           ══════════════════════════════════════════════════════════ */}
        <TutorialSettings />

        {/* ══════════════════════════════════════════════════════════
           SECTION 8: Exportar Dados (LGPD)
           ══════════════════════════════════════════════════════════ */}
        <section>
          <SectionHeader icon={IconDownload} title="Exportar Dados" />
          <div style={cardStyle} className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 min-w-0">
                <h3
                  className="text-sm font-semibold"
                  style={{ color: 'var(--bb-ink-100)' }}
                >
                  Exportacao LGPD
                </h3>
                <p
                  className="mt-1 text-xs"
                  style={{ color: 'var(--bb-ink-60)' }}
                >
                  Exporte todos os dados da sua academia em formato compativel com a
                  Lei Geral de Protecao de Dados. O arquivo sera enviado para o email
                  cadastrado.
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={handleExport}
                loading={exporting}
                size="md"
                className="w-full sm:w-auto"
              >
                <span className="flex items-center gap-2">
                  <IconDownload size={16} color="var(--bb-ink-100)" />
                  Exportar dados
                </span>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

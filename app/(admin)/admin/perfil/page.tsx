'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

// ── Inline SVG icons (lucide-style, stroke-width 1.5) ────────────────
function IconUser({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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

function IconMapPin({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconCrown({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
      <path d="M3 20h18" />
    </svg>
  );
}

function IconMail({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function IconPhone({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconEdit({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

// ── Icon type for InfoRow ─────────────────────────────────────────────
type IconComponent = React.ComponentType<{ size?: number; color: string }>;

// ── Mock academy data ──────────────────────────────────────────────
const MOCK_ACADEMY = {
  name: 'Guerreiros BJJ',
  address: 'Rua das Artes Marciais, 123 - Centro, Sao Paulo - SP',
  plan: 'Premium',
  cnpj: '12.345.678/0001-00',
  email: 'contato@guerreirosbjj.com.br',
  phone: '(11) 98765-4321',
};

// ── Loading skeleton ─────────────────────────────────────────────────
function PerfilSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Skeleton variant="circle" className="h-20 w-20" />
        <div className="space-y-2">
          <Skeleton variant="text" className="h-6 w-48" />
          <Skeleton variant="text" className="h-4 w-32" />
        </div>
      </div>
      <Skeleton variant="card" className="h-40" />
      <Skeleton variant="card" className="h-48" />
    </div>
  );
}

// ── Avatar with initials ──────────────────────────────────────────────
function AvatarCircle({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (avatarUrl) {
    return (
      <div
        className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden"
        style={{ borderRadius: '50%' }}
      >
        <img
          src={avatarUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className="flex h-20 w-20 flex-shrink-0 items-center justify-center font-display text-2xl font-bold"
      style={{
        borderRadius: '50%',
        background: 'var(--bb-brand-gradient)',
        color: '#fff',
      }}
    >
      {initials}
    </div>
  );
}

// ── Info row ─────────────────────────────────────────────────────────
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: IconComponent;
  label: string;
  value: string;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
    >
      <span className="flex-shrink-0">
        <Icon size={16} color="var(--bb-ink-40)" />
      </span>
      <div className="flex flex-1 items-center justify-between">
        <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          {label}
        </span>
        <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
          {value}
        </span>
      </div>
    </div>
  );
}

// ── Main page component ──────────────────────────────────────────────
export default function AdminPerfilPage() {
  const { profile, isLoading } = useAuth();
  const [editing] = useState(false);

  if (isLoading) {
    return <PerfilSkeleton />;
  }

  const displayName = profile?.display_name ?? 'Administrador';
  const role = profile?.role ?? 'admin';
  const avatar = profile?.avatar ?? null;

  const roleLabel =
    role === 'admin'
      ? 'Administrador'
      : role === 'professor'
        ? 'Professor'
        : role;

  return (
    <div className="min-h-screen space-y-6 p-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <section
        className="flex items-center gap-4 p-6"
        style={{
          background: 'var(--bb-depth-3)',
          border: '1px solid var(--bb-glass-border)',
          borderRadius: 'var(--bb-radius-lg)',
        }}
      >
        <AvatarCircle name={displayName} avatarUrl={avatar} />

        <div className="flex-1">
          <h1
            className="font-display text-xl font-bold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            {displayName}
          </h1>
          <span
            className="mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-xs font-medium uppercase"
            style={{
              background: 'var(--bb-brand-surface)',
              color: 'var(--bb-brand)',
              letterSpacing: '0.06em',
            }}
          >
            {roleLabel}
          </span>
        </div>
      </section>

      {/* ── Informacoes pessoais ──────────────────────────────────── */}
      <section>
        <h2
          className="mb-3 font-display text-sm font-semibold uppercase"
          style={{
            color: 'var(--bb-ink-60)',
            letterSpacing: '0.06em',
          }}
        >
          Informacoes Pessoais
        </h2>

        <div
          className="overflow-hidden"
          style={{
            background: 'var(--bb-depth-3)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          <InfoRow icon={IconUser} label="Nome" value={displayName} />
          <InfoRow icon={IconCrown} label="Perfil" value={roleLabel} />
          <InfoRow icon={IconMail} label="Email" value="admin@guerreirosbjj.com.br" />
          <InfoRow icon={IconPhone} label="Telefone" value="(11) 98765-4321" />
        </div>
      </section>

      {/* ── Dados da Academia ──────────────────────────────────────── */}
      <section>
        <h2
          className="mb-3 font-display text-sm font-semibold uppercase"
          style={{
            color: 'var(--bb-ink-60)',
            letterSpacing: '0.06em',
          }}
        >
          Dados da Academia
        </h2>

        <div
          className="overflow-hidden"
          style={{
            background: 'var(--bb-depth-3)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          <InfoRow icon={IconBuilding} label="Academia" value={MOCK_ACADEMY.name} />
          <InfoRow icon={IconMapPin} label="Endereco" value={MOCK_ACADEMY.address} />
          <InfoRow icon={IconCrown} label="Plano" value={MOCK_ACADEMY.plan} />
          <InfoRow icon={IconMail} label="Email" value={MOCK_ACADEMY.email} />
          <InfoRow icon={IconPhone} label="Telefone" value={MOCK_ACADEMY.phone} />

          {/* Plan badge */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Status do Plano
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                background: 'var(--bb-success-surface)',
                color: 'var(--bb-success)',
              }}
            >
              Ativo
            </span>
          </div>
        </div>
      </section>

      {/* ── Editar button ─────────────────────────────────────────── */}
      <div className="pt-2">
        <Button
          variant="primary"
          size="lg"
          className="w-full gap-2"
          disabled={editing}
        >
          <IconEdit size={16} color="currentColor" />
          Editar informacoes
        </Button>
      </div>
    </div>
  );
}

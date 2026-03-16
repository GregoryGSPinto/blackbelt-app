'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getProfessorDashboard } from '@/lib/api/professor.service';
import type { ProfessorDashboardDTO } from '@/lib/api/professor.service';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';

// ── Inline SVG icons ────────────────────────────────────────────────
function IconUser({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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

function IconCalendar({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function IconAward({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
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

type IconComponent = React.ComponentType<{ size?: number; color: string }>;

// ── Info Row ────────────────────────────────────────────────────────
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

// ── Loading skeleton ────────────────────────────────────────────────
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

// ── Main page ───────────────────────────────────────────────────────
export default function ProfessorPerfilPage() {
  const { profile: authProfile, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<ProfessorDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const d = await getProfessorDashboard('prof-1');
        setData(d);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || authLoading) {
    return <PerfilSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-4xl">&#x1F464;</p>
          <h2
            className="mt-4 text-lg font-bold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Perfil indisponivel
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
            Nao foi possivel carregar seus dados.
          </p>
        </div>
      </div>
    );
  }

  const displayName = authProfile?.display_name ?? 'Professor Silva';
  const avatar = authProfile?.avatar ?? null;
  const totalAlunos = data.meusAlunos.length;
  const totalTurmas = data.minhasTurmas.length;
  const mediaPresenca =
    totalTurmas > 0
      ? Math.round(
          data.minhasTurmas.reduce((acc, t) => acc + t.presenca_media, 0) /
            totalTurmas,
        )
      : 0;

  return (
    <div className="min-h-screen space-y-6 p-6">
      {/* ── Header ────────────────────────────────────────────────── */}
      <section
        className="flex items-center gap-4 p-6"
        style={{
          background: 'var(--bb-depth-3)',
          border: '1px solid var(--bb-glass-border)',
          borderRadius: 'var(--bb-radius-lg)',
        }}
      >
        {avatar ? (
          <div
            className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden"
            style={{ borderRadius: '50%' }}
          >
            <img
              src={avatar}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <Avatar name={displayName} size="xl" />
        )}

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
            Professor
          </span>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Brazilian Jiu-Jitsu
          </p>
        </div>
      </section>

      {/* ── Stats Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <div
          className="p-3 text-center"
          style={{
            background: 'var(--bb-depth-3)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          <p className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            {totalTurmas}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
            Turmas
          </p>
        </div>
        <div
          className="p-3 text-center"
          style={{
            background: 'var(--bb-depth-3)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          <p className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            {totalAlunos}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
            Alunos
          </p>
        </div>
        <div
          className="p-3 text-center"
          style={{
            background: 'var(--bb-depth-3)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          <p className="text-2xl font-bold" style={{ color: 'var(--bb-brand)' }}>
            {mediaPresenca}%
          </p>
          <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
            Presenca
          </p>
        </div>
      </div>

      {/* ── Informacoes pessoais ──────────────────────────────────── */}
      <section>
        <h2
          className="mb-3 font-display text-sm font-semibold uppercase"
          style={{ color: 'var(--bb-ink-60)', letterSpacing: '0.06em' }}
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
          <InfoRow icon={IconMail} label="Email" value="professor@guerreirosbjj.com.br" />
          <InfoRow icon={IconPhone} label="Telefone" value="(11) 99876-5432" />
          <InfoRow icon={IconCalendar} label="Data de nascimento" value="15/03/1985" />
        </div>
      </section>

      {/* ── Dados da academia ──────────────────────────────────────── */}
      <section>
        <h2
          className="mb-3 font-display text-sm font-semibold uppercase"
          style={{ color: 'var(--bb-ink-60)', letterSpacing: '0.06em' }}
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
          <InfoRow icon={IconAward} label="Graduacao" value="Faixa Preta" />
          <InfoRow icon={IconAward} label="Modalidade" value="BJJ" />
          <InfoRow icon={IconCalendar} label="Data de entrada" value="10/01/2018" />
        </div>
      </section>

      {/* ── Bio ────────────────────────────────────────────────────── */}
      <section>
        <h2
          className="mb-3 font-display text-sm font-semibold uppercase"
          style={{ color: 'var(--bb-ink-60)', letterSpacing: '0.06em' }}
        >
          Sobre
        </h2>
        <div
          className="p-4"
          style={{
            background: 'var(--bb-depth-3)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          <p className="text-sm leading-relaxed" style={{ color: 'var(--bb-ink-60)' }}>
            Faixa preta de Brazilian Jiu-Jitsu com mais de 10 anos de experiencia.
            Especialista em tecnicas de solo e preparacao para competicao.
            Certificado pela CBJJ.
          </p>
        </div>
      </section>

      {/* ── Minhas Turmas ──────────────────────────────────────────── */}
      <section>
        <h2
          className="mb-3 font-display text-sm font-semibold uppercase"
          style={{ color: 'var(--bb-ink-60)', letterSpacing: '0.06em' }}
        >
          Minhas Turmas
        </h2>
        <div className="space-y-2">
          {data.minhasTurmas.map((turma) => (
            <div
              key={turma.class_id}
              className="p-3"
              style={{
                background: 'var(--bb-depth-3)',
                border: '1px solid var(--bb-glass-border)',
                borderRadius: 'var(--bb-radius-lg)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                    {turma.modality_name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    {turma.schedule_text}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                    {turma.enrolled_count} alunos
                  </p>
                  <span
                    className="text-xs font-medium"
                    style={{
                      color:
                        turma.presenca_media >= 70
                          ? 'var(--bb-success)'
                          : 'var(--bb-warning)',
                    }}
                  >
                    {turma.presenca_media}% presenca
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Editar button ──────────────────────────────────────────── */}
      <div className="pt-2">
        <Button variant="primary" size="lg" className="w-full gap-2" disabled>
          <IconEdit size={16} color="currentColor" />
          Editar perfil
        </Button>
      </div>
    </div>
  );
}

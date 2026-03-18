'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// ── Types ──────────────────────────────────────────────────────────────

interface InviteData {
  academyName: string;
  academyCity: string;
  role: string;
  inviterName: string;
  expiresAt: string;
}

type InviteStatus = 'loading' | 'valid' | 'expired' | 'used' | 'invalid';

// ── Constants ──────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  professor: 'Professor',
  aluno_adulto: 'Aluno',
  aluno_teen: 'Aluno Teen',
  aluno_kids: 'Aluno Kids',
  responsavel: 'Responsavel',
  recepcao: 'Recepcionista',
  gestor: 'Gestor',
};

const BUTTON_PRIMARY_CLASS = 'w-full rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]';

// ── Helpers ────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function daysUntil(iso: string): number {
  const now = new Date();
  const target = new Date(iso);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

// ── Component ──────────────────────────────────────────────────────────

export default function ConviteTokenPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params.token;

  const [status, setStatus] = useState<InviteStatus>('loading');
  const [inviteData, setInviteData] = useState<InviteData | null>(null);

  // ── Fetch invite data on mount ───────────────────────────────────

  useEffect(() => {
    async function fetchInvite() {
      try {
        // Mock implementation — replace with real API call
        // In production: const res = await fetch(`/api/invites/validate/${token}`);
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Mock data: use token to determine behavior for testing
        if (token === 'expired') {
          setStatus('expired');
          return;
        }
        if (token === 'used') {
          setStatus('used');
          return;
        }
        if (token === 'invalid' || token.length < 6) {
          setStatus('invalid');
          return;
        }

        // Valid invite
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        setInviteData({
          academyName: 'Guerreiros BJJ',
          academyCity: 'Sao Paulo, SP',
          role: 'aluno_adulto',
          inviterName: 'Roberto Silva',
          expiresAt: expiresAt.toISOString(),
        });
        setStatus('valid');
      } catch {
        setStatus('invalid');
      }
    }

    fetchInvite();
  }, [token]);

  // ── Navigate to registration ─────────────────────────────────────

  function handleCreateAccount() {
    router.push(`/cadastro?invite=${encodeURIComponent(token)}`);
  }

  // ── Loading ──────────────────────────────────────────────────────

  if (status === 'loading') {
    return (
      <div
        className="w-full max-w-md rounded-2xl p-8"
        style={{
          background: 'var(--bb-depth-3)',
          boxShadow: 'var(--bb-shadow-xl)',
          border: '1px solid var(--bb-glass-border)',
        }}
      >
        <div className="flex flex-col items-center py-8">
          <div
            className="h-10 w-10 animate-spin rounded-full border-3 border-t-transparent"
            style={{ borderColor: 'var(--bb-brand)', borderTopColor: 'transparent' }}
          />
          <p className="mt-4 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Verificando convite...
          </p>
        </div>
      </div>
    );
  }

  // ── Error states ─────────────────────────────────────────────────

  if (status === 'expired' || status === 'used' || status === 'invalid') {
    const errorConfig = {
      expired: {
        title: 'Convite expirado',
        message: 'Este convite ja expirou e nao pode mais ser utilizado.',
      },
      used: {
        title: 'Convite ja utilizado',
        message: 'Este convite ja foi utilizado para criar uma conta.',
      },
      invalid: {
        title: 'Convite invalido',
        message: 'Este link de convite nao existe ou foi removido.',
      },
    };

    const config = errorConfig[status];

    return (
      <div
        className="w-full max-w-md rounded-2xl p-8"
        style={{
          background: 'var(--bb-depth-3)',
          boxShadow: 'var(--bb-shadow-xl)',
          border: '1px solid var(--bb-glass-border)',
        }}
      >
        <div className="text-center">
          {/* Error icon */}
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: 'rgba(239, 68, 68, 0.1)' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>

          <h1 className="mt-4 text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            {config.title}
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            {config.message}
          </p>
          <p className="mt-4 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
            Peca um novo convite ao administrador da academia.
          </p>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/login"
              className={BUTTON_PRIMARY_CLASS + ' inline-block text-center'}
              style={{ background: 'var(--bb-brand-gradient, var(--bb-brand))' }}
            >
              Ja tem conta? Entrar
            </Link>
            <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
              Entre em contato com a administracao da sua academia para solicitar um novo link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Valid invite ─────────────────────────────────────────────────

  if (!inviteData) return null;

  const roleLabel = ROLE_LABELS[inviteData.role] ?? inviteData.role;
  const remainingDays = daysUntil(inviteData.expiresAt);

  return (
    <div
      className="w-full max-w-md rounded-2xl p-6 sm:p-8"
      style={{
        background: 'var(--bb-depth-3)',
        boxShadow: 'var(--bb-shadow-xl)',
        border: '1px solid var(--bb-glass-border)',
      }}
    >
      {/* Header */}
      <div className="mb-6 text-center">
        <h1
          className="text-3xl font-extrabold"
          style={{ color: 'var(--bb-brand)', letterSpacing: '-0.03em' }}
        >
          BLACKBELT
        </h1>
        <div
          className="mx-auto mt-2"
          style={{ width: 40, height: 3, borderRadius: 2, background: 'var(--bb-brand)' }}
        />
        <p className="mt-3 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Voce foi convidado para fazer parte
        </p>
      </div>

      {/* Academy card */}
      <div
        className="rounded-xl p-5"
        style={{
          background: 'var(--bb-depth-2)',
          border: '1px solid var(--bb-glass-border)',
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl text-lg font-black text-white"
            style={{ background: 'var(--bb-brand-gradient, var(--bb-brand))' }}
          >
            BB
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {inviteData.academyName}
            </p>
            <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
              {inviteData.academyCity}
            </p>
          </div>
        </div>

        {/* Role badge */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Cadastro como
          </span>
          <span
            className="rounded-full px-3 py-1 text-sm font-semibold"
            style={{ background: 'var(--bb-brand-surface, rgba(239,68,68,0.1))', color: 'var(--bb-brand)' }}
          >
            {roleLabel}
          </span>
        </div>

        {/* Inviter */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Convidado por
          </span>
          <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
            {inviteData.inviterName}
          </span>
        </div>
      </div>

      {/* Expiry info */}
      <div
        className="mt-4 rounded-lg px-4 py-2.5 text-center"
        style={{
          background: remainingDays <= 2
            ? 'rgba(239, 68, 68, 0.08)'
            : 'rgba(34, 197, 94, 0.08)',
          border: `1px solid ${
            remainingDays <= 2 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'
          }`,
        }}
      >
        <p
          className="text-xs"
          style={{
            color: remainingDays <= 2 ? '#ef4444' : '#22c55e',
          }}
        >
          Este convite expira em {remainingDays} dia{remainingDays !== 1 ? 's' : ''} &middot;
          Valido ate: {formatDate(inviteData.expiresAt)}
        </p>
      </div>

      {/* CTA */}
      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={handleCreateAccount}
          className={BUTTON_PRIMARY_CLASS}
          style={{ background: 'var(--bb-brand-gradient, var(--bb-brand))' }}
        >
          CRIAR MINHA CONTA
        </button>

        <p className="text-center text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Ja tem conta?{' '}
          <Link href="/login" className="hover:underline" style={{ color: 'var(--bb-brand)' }}>
            Entrar com minha conta
          </Link>
        </p>
      </div>
    </div>
  );
}

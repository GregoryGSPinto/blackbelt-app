'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { BlackBeltLogo } from '@/components/brand/BlackBeltLogo';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { isMock } from '@/lib/env';
import { useIsNative } from '@/lib/hooks/useIsNative';
import { resendEmailConfirmation } from '@/features/auth/services/auth.service';
import { translateError } from '@/lib/utils/error-translator';
import { validateEmail } from '@/lib/utils/validation';

// ── Dashboard Preview (left panel) ──────────────────────────────

const PREVIEW_CHECKINS = [
  { name: 'Lucas Oliveira', belt: '#FFFFFF', time: '08:12' },
  { name: 'Ana Costa', belt: '#2563EB', time: '08:05' },
  { name: 'Pedro Henrique', belt: '#7C3AED', time: '07:58' },
  { name: 'Mariana Silva', belt: '#854D0E', time: '07:51' },
];

function DashboardPreview() {
  return (
    <div
      className="w-full max-w-[440px] rounded-xl overflow-hidden"
      style={{
        background: 'var(--bb-depth-2)',
        border: '1px solid var(--bb-glass-border)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      }}
    >
      {/* Browser chrome */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ background: 'var(--bb-depth-3)' }}
      >
        <span className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
        <span className="w-3 h-3 rounded-full" style={{ background: '#eab308' }} />
        <span className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
        <span
          className="ml-3 text-xs font-mono"
          style={{ color: 'var(--bb-ink-40)' }}
        >
          blackbelts.com.br/dashboard
        </span>
      </div>

      {/* Dashboard Content */}
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: 'var(--bb-brand-deep)' }}
          >
            Dashboard
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background: 'rgba(198,40,40,0.12)',
              color: 'var(--bb-brand-deep)',
            }}
          >
            Guerreiros BJJ
          </span>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Alunos', value: '127', color: 'var(--bb-brand-deep)' },
            { label: 'Presenca', value: '83%', color: '#22C55E' },
            { label: 'Receita', value: 'R$ 24.8k', color: '#8B5CF6' },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-lg p-2.5 text-center"
              style={{ background: 'var(--bb-depth-3)' }}
            >
              <p className="text-xl font-black leading-none" style={{ color: kpi.color }}>
                {kpi.value}
              </p>
              <p className="text-[10px] font-medium mt-1.5 uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
                {kpi.label}
              </p>
            </div>
          ))}
        </div>

        {/* Check-ins recentes */}
        <div className="space-y-2">
          {PREVIEW_CHECKINS.map((c) => (
            <div
              key={c.name}
              className="flex items-center gap-3 px-3 py-2 rounded-lg"
              style={{ background: 'var(--bb-depth-3)' }}
            >
              <div
                className="h-3 w-3 shrink-0 rounded-full"
                style={{
                  background: c.belt,
                  boxShadow: '0 0 0 1px var(--bb-glass-border)',
                }}
              />
              <span className="flex-1 text-sm font-medium truncate" style={{ color: 'var(--bb-ink-80)' }}>
                {c.name}
              </span>
              <span className="ml-auto text-xs font-mono" style={{ color: 'var(--bb-ink-40)' }}>
                {c.time}
              </span>
            </div>
          ))}
        </div>

        {/* Meta */}
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: '1px solid var(--bb-glass-border)' }}
        >
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: 'var(--bb-ink-40)' }}
          >
            Check-ins hoje
          </span>
          <span
            className="text-xs font-bold"
            style={{ color: 'var(--bb-ink-60)' }}
          >
            32 alunos
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Demo Accounts ───────────────────────────────────────────────

const DEMO_ACCOUNTS = [
  { email: 'gregoryguimaraes12@gmail.com', label: 'Super Admin', pw: '' },
  { email: 'roberto@guerreiros.com', label: 'Admin', pw: '' },
  { email: 'andre@guerreiros.com', label: 'Professor', pw: '' },
  { email: 'julia@guerreiros.com', label: 'Recepcionista', pw: '' },
  { email: 'joao@email.com', label: 'Aluno', pw: '' },
  { email: 'lucas.teen@email.com', label: 'Teen', pw: '' },
  { email: 'miguel.kids@email.com', label: 'Kids', pw: '' },
  { email: 'maria.resp@email.com', label: 'Responsavel', pw: '' },
  { email: 'fernando@guerreiros.com', label: 'Franqueador', pw: '' },
];

// ── Login Page ──────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithOAuth, selectProfile, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);
  const [resendingConfirmation, setResendingConfirmation] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const isNativeDevice = useIsNative();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setConfirmationSent(false);
    if (!email || !password) {
      setLocalError('Preencha seu email e sua senha para continuar.');
      return;
    }
    if (!validateEmail(email)) {
      setLocalError('Digite um email valido para entrar.');
      return;
    }
    setLoading(true);

    try {
      document.cookie.split(';').forEach((c) => {
        const name = c.trim().split('=')[0];
        if (name && (name.startsWith('bb-') || name.startsWith('sb-'))) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      });
    } catch { /* ignore */ }

    const timeout = setTimeout(() => {
      setLoading(false);
      setLocalError('Tempo esgotado. Verifique sua conexao e tente novamente.');
    }, 30000);

    try {
      const profiles = await login(email, password);
      clearTimeout(timeout);
      if (profiles.length === 1) {
        await selectProfile(profiles[0].id);
      } else if (profiles.length > 1) {
        router.push('/selecionar-perfil');
      } else {
        setLocalError('Nenhum perfil encontrado para este usuario.');
      }
    } catch (err: unknown) {
      clearTimeout(timeout);
      console.error('[LoginPage] handleSubmit error:', err);
      setLocalError(translateError(err));
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    if (isMock()) {
      alert('OAuth disponível apenas em produção. Use as contas demo abaixo.');
      return;
    }
    setOauthLoading(provider);
    setLocalError('');
    setConfirmationSent(false);
    try {
      const profiles = await loginWithOAuth(provider);
      if (profiles.length > 0) {
        if (profiles.length === 1) {
          await selectProfile(profiles[0].id);
        } else {
          router.push('/selecionar-perfil');
        }
      }
    } catch (err: unknown) {
      console.error('[LoginPage] handleOAuth error:', err);
      setLocalError(translateError(err));
    } finally {
      setOauthLoading(null);
    }
  };

  const isSubmitting = loading;
  const isBusy = loading || authLoading;
  const canSubmit = !isBusy && !!email.trim() && !!password.trim();
  const needsEmailConfirmationCta = localError.toLowerCase().includes('confirm');

  async function handleResendConfirmation() {
    if (!validateEmail(email)) {
      setLocalError('Digite o email correto para reenviar a confirmacao.');
      return;
    }
    setResendingConfirmation(true);
    setConfirmationSent(false);
    try {
      await resendEmailConfirmation(email.trim());
      setLocalError('');
      setConfirmationSent(true);
    } catch (err: unknown) {
      setLocalError(translateError(err));
    } finally {
      setResendingConfirmation(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row">
      {/* ========== LEFT SIDE — Desktop only ========== */}
      <div
        className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-10 overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(198,40,40,0.10) 0%, transparent 60%),
            radial-gradient(ellipse at 70% 80%, rgba(198,40,40,0.05) 0%, transparent 50%),
            var(--bb-depth-1)
          `,
        }}
      >
        {/* Logo top-left */}
        <div>
          <Link href="/" aria-label="Ir para a pagina inicial">
            <BlackBeltLogo variant="full" height={32} />
          </Link>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="flex-1 flex items-center justify-center px-4">
          <DashboardPreview />
        </div>

        {/* Footer text */}
        <p
          className="text-sm font-medium"
          style={{ color: 'var(--bb-ink-40)' }}
        >
          Gestao completa para academias de artes marciais
        </p>
      </div>

      {/* ========== RIGHT SIDE — Login form ========== */}
      <div
        className="flex-1 lg:flex-none lg:w-[55%] flex flex-col items-center justify-center px-6 py-10 lg:px-16"
        style={{ background: 'var(--bb-depth-0)' }}
      >
        <div className="w-full max-w-[440px]">
          {/* Mobile logo (hidden on desktop) */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <Link href="/" aria-label="Ir para a pagina inicial">
              <BlackBeltLogo variant="full" height={44} />
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2
              className="text-2xl font-bold"
              style={{ color: 'var(--bb-ink-100)' }}
            >
              Entrar
            </h2>
            <p
              className="mt-1 text-sm"
              style={{ color: 'var(--bb-ink-40)' }}
            >
              Acesse sua academia
            </p>
          </div>

          {/* Social login buttons */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={isBusy || !!oauthLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50 min-h-[44px]"
              style={{
                background: 'var(--bb-depth-2)',
                color: 'var(--bb-ink-80)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              {oauthLoading === 'google' ? (
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('apple')}
              disabled={isBusy || !!oauthLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50 min-h-[44px]"
              style={{
                background: 'var(--bb-depth-2)',
                color: 'var(--bb-ink-80)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              {oauthLoading === 'apple' ? (
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              )}
              Apple
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: 'var(--bb-glass-border)' }} />
            <span
              className="text-xs font-medium"
              style={{ color: 'var(--bb-ink-40)' }}
            >
              ou continue com email
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--bb-glass-border)' }} />
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--bb-ink-80)' }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all focus:ring-2"
                style={{
                  background: 'var(--bb-depth-2)',
                  color: 'var(--bb-ink-100)',
                  border: '1px solid var(--bb-glass-border)',
                  '--tw-ring-color': 'var(--bb-brand-deep)',
                } as React.CSSProperties}
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--bb-ink-80)' }}
              >
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm outline-none transition-all focus:ring-2"
                  style={{
                    background: 'var(--bb-depth-2)',
                    color: 'var(--bb-ink-100)',
                    border: '1px solid var(--bb-glass-border)',
                    '--tw-ring-color': 'var(--bb-brand-deep)',
                  } as React.CSSProperties}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: 'var(--bb-ink-40)' }}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {localError && (
              <div
                className="rounded-lg p-3"
                style={{ background: 'rgba(239,68,68,0.08)' }}
              >
                <p
                  className="text-sm"
                  style={{ color: 'var(--bb-danger)' }}
                >
                  {localError}
                </p>
                {needsEmailConfirmationCta && (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      disabled={resendingConfirmation}
                      className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50 min-h-[44px]"
                      style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
                    >
                      {resendingConfirmation ? (
                        <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                        </svg>
                      )}
                      Reenviar confirmacao
                    </button>
                    <Link
                      href="/"
                      className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold min-h-[44px]"
                      style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                      </svg>
                      Voltar ao site
                    </Link>
                  </div>
                )}
              </div>
            )}

            {confirmationSent && (
              <div
                className="rounded-lg p-3 text-sm"
                style={{ background: 'rgba(34,197,94,0.08)', color: 'var(--bb-success)' }}
              >
                Reenviamos a confirmacao para {email.trim()}. Verifique sua caixa de entrada e o spam.
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]"
              style={{
                background: 'var(--bb-brand-deep)',
                color: '#fff',
                boxShadow: '0 0 20px rgba(198,40,40,0.2)',
              }}
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Forgot password */}
          <div className="mt-4 flex items-center justify-between gap-3 text-sm">
            <Link
              href="/esqueci-senha"
              className="inline-flex items-center gap-2 transition-opacity hover:opacity-80 min-h-[44px]"
              style={{ color: 'var(--bb-ink-60)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              Esqueci minha senha
            </Link>
          </div>

          {/* Registration CTAs */}
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ background: 'var(--bb-glass-border)' }} />
              <span
                className="text-xs font-medium"
                style={{ color: 'var(--bb-ink-40)' }}
              >
                ainda nao tem conta?
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--bb-glass-border)' }} />
            </div>

            {isNativeDevice ? (
              <div className="text-center">
                <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                  Cadastre-se pelo site:{' '}
                  <span className="font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                    blackbelts.com.br
                  </span>
                </p>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link
                  href="/cadastrar-academia"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-center transition-opacity hover:opacity-80 min-h-[44px]"
                  style={{
                    background: 'var(--bb-depth-2)',
                    color: 'var(--bb-brand-deep)',
                    border: '1px solid var(--bb-glass-border)',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  Sou dono de academia
                </Link>
                <Link
                  href="/convite"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-center transition-opacity hover:opacity-80 min-h-[44px]"
                  style={{
                    background: 'var(--bb-depth-2)',
                    color: 'var(--bb-ink-60)',
                    border: '1px solid var(--bb-glass-border)',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 7l-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
                  </svg>
                  Tenho um convite
                </Link>
              </div>
            )}
          </div>

          {/* Demo accounts — only in mock mode */}
          {isMock() && (
            <div
              className="mt-8 p-4 rounded-xl"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              <p
                className="text-xs font-semibold mb-3 tracking-wider"
                style={{ color: 'var(--bb-ink-40)' }}
              >
                CONTAS DEMO
              </p>
              <div className="grid grid-cols-1 gap-2">
                {DEMO_ACCOUNTS.map((demo) => (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => { setEmail(demo.email); setPassword(demo.pw); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:opacity-80 transition-opacity min-h-[44px]"
                    style={{
                      background: 'var(--bb-depth-3)',
                      color: 'var(--bb-ink-80)',
                    }}
                  >
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ background: 'var(--bb-brand-deep)' }} />
                    <span className="font-medium">{demo.label}</span>
                    <span
                      className="text-xs ml-auto truncate max-w-[180px]"
                      style={{ color: 'var(--bb-ink-40)' }}
                    >
                      {demo.email}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Privacy / Terms footer */}
          <div className="mt-8 text-center">
            <p
              className="text-xs"
              style={{ color: 'var(--bb-ink-40)' }}
            >
              Ao continuar, voce concorda com nossos{' '}
              <Link
                href="/termos"
                className="underline hover:opacity-80 transition-opacity"
                style={{ color: 'var(--bb-ink-60)' }}
              >
                Termos de Uso
              </Link>{' '}
              e{' '}
              <Link
                href="/privacidade"
                className="underline hover:opacity-80 transition-opacity"
                style={{ color: 'var(--bb-ink-60)' }}
              >
                Politica de Privacidade
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

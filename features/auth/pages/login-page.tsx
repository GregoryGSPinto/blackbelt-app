'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { BlackBeltLogo } from '@/components/brand/BlackBeltLogo';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { isMock } from '@/lib/env';
import { resendEmailConfirmation } from '@/features/auth/services/auth.service';
import { translateError } from '@/lib/utils/error-translator';
import { validateEmail } from '@/lib/utils/validation';

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

    // Clear stale auth cookies that may corrupt the session
    try {
      document.cookie.split(';').forEach((c) => {
        const name = c.trim().split('=')[0];
        if (name && (name.startsWith('bb-') || name.startsWith('sb-'))) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      });
    } catch { /* ignore */ }

    // Timeout safety — real Supabase auth + profile selection can take longer
    // for freshly created users, so keep the guard generous enough to avoid
    // false negatives while still surfacing genuine stalls.
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
    <div className="min-h-dvh overflow-x-hidden" style={{ background: 'var(--bb-depth-0)' }}>
      <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col lg:flex-row">

      {/* ═══ LEFT SIDE — VISUAL (desktop only) ═══ */}
      <div
        className="relative hidden overflow-hidden lg:flex lg:w-[52%] lg:flex-col lg:justify-between lg:px-10 lg:py-10 xl:w-[56%] xl:px-14"
        style={{ background: 'var(--bb-depth-1)' }}
      >
        {/* Gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(198, 40, 40, 0.08) 0%, transparent 70%)' }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <BlackBeltLogo variant="full" height={40} />
        </div>

        {/* Dashboard Preview */}
        <div className="relative z-10 flex flex-1 items-center justify-center py-6 xl:py-8">
          <div className="w-full max-w-[520px] xl:max-w-[560px]">
            <div
              className="overflow-hidden rounded-[28px] border shadow-2xl"
              style={{ background: 'var(--bb-depth-2)', borderColor: 'var(--bb-glass-border)' }}
            >
              {/* Window bar */}
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--bb-danger)' }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--bb-warning)' }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--bb-success)' }} />
                <span className="text-[10px] ml-2" style={{ color: 'var(--bb-ink-40)' }}>
                  Dashboard — Guerreiros do Tatame
                </span>
              </div>
              {/* KPIs */}
              <div className="grid grid-cols-3 gap-3 p-4">
                {[
                  { label: 'Alunos', value: '45', color: 'var(--bb-brand)' },
                  { label: 'Presença', value: '87%', color: 'var(--bb-success)' },
                  { label: 'Receita', value: 'R$ 15.8k', color: 'var(--bb-warning)' },
                ].map(kpi => (
                  <div key={kpi.label} className="rounded-xl p-3 text-center" style={{ background: 'var(--bb-depth-3)' }}>
                    <div className="mb-1 text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>{kpi.label}</div>
                    <div className="text-base font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
                  </div>
                ))}
              </div>
              {/* Activity */}
              <div className="space-y-2 px-4 pb-4">
                <div className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--bb-ink-40)' }}>
                  Check-ins recentes
                </div>
                {[
                  { name: 'João Pedro', time: '5 min', belt: '#3B82F6' },
                  { name: 'Maria Clara', time: '12 min', belt: '#8B5CF6' },
                  { name: 'Lucas Teen', time: '18 min', belt: '#EAB308' },
                ].map(row => (
                  <div key={row.name} className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'var(--bb-depth-4)' }}>
                    <div className="h-6 w-1.5 rounded-full" style={{ background: row.belt }} />
                    <span className="flex-1 text-sm" style={{ color: 'var(--bb-ink-100)' }}>{row.name}</span>
                    <span className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>há {row.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Belt colors strip */}
            <div className="mt-6 flex justify-center gap-1.5">
              {['#F8FAFC', '#EAB308', '#F97316', '#22C55E', '#3B82F6', '#8B5CF6', '#92400E', '#1A1A2E'].map(c => (
                <div key={c} className="w-4 h-1.5 rounded-full" style={{ background: c, opacity: 0.6 }} />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom text */}
        <div className="relative z-10">
          <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
            Gestão completa para academias de artes marciais
          </p>
        </div>
      </div>

      {/* ═══ RIGHT SIDE — FORM ═══ */}
      <div className="flex w-full items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:w-[48%] lg:px-10 lg:py-10 xl:w-[44%] xl:px-14">
        <div className="flex w-full max-w-[30rem] flex-col justify-center md:max-w-[34rem] lg:max-w-[30rem] xl:max-w-[32rem]">
          <div className="mb-5 sm:mb-6">
            <Link
              href="/"
              className="inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium leading-tight transition-opacity hover:opacity-100"
              style={{
                color: 'var(--bb-ink-60)',
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                opacity: 0.92,
              }}
            >
              <span aria-hidden="true">←</span>
              Voltar para a pagina inicial
            </Link>
          </div>

          {/* Logo (mobile only) */}
          <div className="mb-7 text-center lg:hidden sm:mb-8">
            <div className="flex justify-center">
              <BlackBeltLogo variant="full" height={44} />
            </div>
            <div className="flex justify-center gap-1 mt-3">
              {['#F8FAFC', '#EAB308', '#F97316', '#22C55E', '#3B82F6', '#8B5CF6', '#92400E', '#1A1A2E'].map(c => (
                <div key={c} className="w-3 h-1 rounded-full" style={{ background: c, opacity: 0.5 }} />
              ))}
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl font-bold sm:text-[2rem]" style={{ color: 'var(--bb-ink-100)' }}>
              Entrar
            </h2>
            <p className="mt-2 max-w-[32rem] text-sm leading-6" style={{ color: 'var(--bb-ink-40)' }}>
              Entre para acessar sua academia com seguranca.
            </p>
          </div>

          {/* Social Login */}
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={isBusy || !!oauthLoading}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
            >
              {oauthLoading === 'google' ? (
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24">
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
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
            >
              {oauthLoading === 'apple' ? (
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83"/>
                  <path d="M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11"/>
                </svg>
              )}
              Apple
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid var(--bb-glass-border)' }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs" style={{ background: 'var(--bb-depth-0)', color: 'var(--bb-ink-40)' }}>
                ou continue com email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--bb-ink-60)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                className="w-full min-w-0 rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2"
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                  Senha
                </label>
                <Link href="/esqueci-senha" className="text-xs hover:underline" style={{ color: 'var(--bb-brand-deep)' }}>
                  Esqueceu?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full min-w-0 rounded-xl px-4 py-3 pr-12 text-sm outline-none transition-all focus:ring-2"
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
                className="rounded-2xl px-4 py-3 text-sm"
                role="alert"
                style={{ background: 'color-mix(in srgb, var(--bb-danger) 10%, transparent)', color: 'color-mix(in srgb, var(--bb-danger) 70%, white)', border: '1px solid color-mix(in srgb, var(--bb-danger) 20%, transparent)' }}
              >
                <div className="flex items-start gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{localError}</p>
                    {needsEmailConfirmationCta && (
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={handleResendConfirmation}
                          disabled={resendingConfirmation}
                          className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
                          style={{ background: 'var(--bb-brand-gradient)' }}
                        >
                          {resendingConfirmation ? 'Reenviando...' : 'Reenviar confirmacao'}
                        </button>
                        <Link
                          href="/"
                          className="rounded-xl px-4 py-2 text-center text-sm font-medium"
                          style={{
                            color: 'var(--bb-ink-80)',
                            background: 'var(--bb-depth-2)',
                            border: '1px solid var(--bb-glass-border)',
                          }}
                        >
                          Voltar
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {confirmationSent && (
              <div
                className="rounded-2xl px-4 py-3 text-sm"
                role="status"
                style={{ background: 'color-mix(in srgb, var(--bb-success) 10%, transparent)', color: 'color-mix(in srgb, var(--bb-success) 70%, white)', border: '1px solid color-mix(in srgb, var(--bb-success) 20%, transparent)' }}
              >
                Reenviamos a confirmacao para {email.trim()}. Verifique sua caixa de entrada e o spam.
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
              style={{ background: 'var(--bb-brand-deep)' }}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Register link */}
          <div className="mt-6 pt-5 sm:mt-8 sm:pt-6" style={{ borderTop: '1px solid var(--bb-glass-border)' }}>
            <p className="mb-3 text-center text-xs" style={{ color: 'var(--bb-ink-40)' }}>
              Recebeu um convite?
            </p>
            <Link
              href="/cadastro"
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-center text-xs font-medium transition-all hover:brightness-110"
              style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
            >
              🥋 Tenho um convite
            </Link>
          </div>

          {/* Demo accounts (mock mode only) */}
          {isMock() && (
            <div className="mt-6 p-4 rounded-xl" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--bb-ink-40)' }}>
                Contas Demo
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { email: 'super@blackbelt.app', label: 'Super Admin', pw: '', icon: '🛡️' },
                  { email: 'roberto@guerreiros.com', label: 'Admin', pw: '', icon: '👑' },
                  { email: 'andre@guerreiros.com', label: 'Professor', pw: '', icon: '🥋' },
                  { email: 'julia@guerreiros.com', label: 'Recepcionista', pw: '', icon: '📋' },
                  { email: 'joao@email.com', label: 'Aluno', pw: '', icon: '💪' },
                  { email: 'lucas.teen@email.com', label: 'Teen', pw: '', icon: '🎮' },
                  { email: 'miguel.kids@email.com', label: 'Kids', pw: '', icon: '⭐' },
                  { email: 'maria.resp@email.com', label: 'Responsável', pw: '', icon: '👨‍👧' },
                  { email: 'fernando@guerreiros.com', label: 'Franqueador', pw: '', icon: '🏢' },
                ].map(demo => (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => { setEmail(demo.email); setPassword(demo.pw); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all hover:brightness-110"
                    style={{ background: 'var(--bb-depth-3)' }}
                  >
                    <span className="text-sm">{demo.icon}</span>
                    <span className="text-xs font-medium flex-1" style={{ color: 'var(--bb-ink-80)' }}>{demo.label}</span>
                    <span className="text-[10px] hidden sm:inline" style={{ color: 'var(--bb-ink-40)' }}>{demo.email}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer links */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center sm:mt-8">
            <Link href="/privacidade" className="text-[10px] hover:underline" style={{ color: 'var(--bb-ink-40)' }}>
              Privacidade
            </Link>
            <Link href="/termos" className="text-[10px] hover:underline" style={{ color: 'var(--bb-ink-40)' }}>
              Termos
            </Link>
            <Link href="/contato" className="text-[10px] hover:underline" style={{ color: 'var(--bb-ink-40)' }}>
              Contato
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

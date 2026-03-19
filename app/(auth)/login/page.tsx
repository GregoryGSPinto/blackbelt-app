'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Building2, LinkIcon, Loader2 } from 'lucide-react';

const BELT_COLORS = [
  '#FAFAFA', '#EAB308', '#EA580C', '#16A34A',
  '#2563EB', '#9333EA', '#92400E', '#0A0A0A',
];

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithOAuth, selectProfile } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

  // Invite code modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ valid: boolean; academy?: string; role?: string } | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => { emailRef.current?.focus(); }, []);

  useEffect(() => {
    if (shake) {
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [shake]);

  // Close invite modal on Escape
  useEffect(() => {
    if (!showInviteModal) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setShowInviteModal(false); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showInviteModal]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Preencha email e senha.');
      setShake(true);
      return;
    }

    setLoading(true);
    try {
      const profiles = await login(email, password);
      setSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 400));

      if (profiles.length === 1) {
        await selectProfile(profiles[0].id);
      } else {
        router.push('/selecionar-perfil');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login.';
      setError(message);
      setShake(true);
      toast(message, 'error');
      setLoading(false);
    }
  }

  async function handleOAuth(provider: 'google' | 'apple') {
    setOauthLoading(provider);
    setError('');
    try {
      const profiles = await loginWithOAuth(provider);
      // In real mode, browser redirects to OAuth provider — we never reach here.
      // In mock mode, we get profiles back.
      if (profiles.length > 0) {
        setSuccess(true);
        await new Promise((r) => setTimeout(r, 400));
        if (profiles.length === 1) {
          await selectProfile(profiles[0].id);
        } else {
          router.push('/selecionar-perfil');
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login social.';
      setError(message);
      setShake(true);
      toast(message, 'error');
      setOauthLoading(null);
    }
  }

  function extractToken(input: string): string {
    const trimmed = input.trim();
    // If it's a URL, extract the last path segment
    if (trimmed.includes('/')) {
      const parts = trimmed.split('/');
      return parts[parts.length - 1];
    }
    return trimmed;
  }

  async function handleValidateInvite() {
    const token = extractToken(inviteCode);
    if (!token) return;
    setInviteLoading(true);
    setInviteResult(null);

    try {
      // Mock validation — in production, call /api/invites/validate/:token
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (token.length < 6 || token === 'invalid') {
        setInviteResult({ valid: false });
      } else {
        setInviteResult({ valid: true, academy: 'Guerreiros BJJ', role: 'Aluno Adulto' });
      }
    } catch {
      setInviteResult({ valid: false });
    } finally {
      setInviteLoading(false);
    }
  }

  function handleGoToInvite() {
    const token = extractToken(inviteCode);
    router.push(`/convite/${encodeURIComponent(token)}`);
  }

  /* ── Animations ── */
  const cardAnim = shake
    ? { animation: 'bb-shake 0.3s ease-in-out', opacity: 1 }
    : success
      ? { animation: 'bb-success 0.3s ease-in-out forwards', opacity: 1 }
      : {};

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bb-card-in {
          0% { opacity: 0; transform: scale(0.95); filter: blur(8px); }
          100% { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        @keyframes bb-el-in {
          0% { opacity: 0; transform: translateY(12px); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes bb-fade {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes bb-shake {
          0%, 100% { transform: translateX(0); }
          12% { transform: translateX(-8px); }
          25% { transform: translateX(8px); }
          37% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          62% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        @keyframes bb-success {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.97); opacity: 0; }
        }
        @keyframes bb-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes bb-modal-in {
          0% { opacity: 0; transform: scale(0.95) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes bb-backdrop-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        .bb-s { opacity: 0; animation-fill-mode: forwards; }
        .bb-s-card { animation: bb-card-in 0.6s cubic-bezier(0.16,1,0.3,1) 0s forwards; }
        .bb-s-logo { animation: bb-el-in 0.5s cubic-bezier(0.16,1,0.3,1) 0.2s forwards; }
        .bb-s-tag  { animation: bb-fade 0.5s ease-out 0.35s forwards; }
        .bb-s-social { animation: bb-el-in 0.5s cubic-bezier(0.16,1,0.3,1) 0.45s forwards; }
        .bb-s-div  { animation: bb-fade 0.4s ease-out 0.55s forwards; }
        .bb-s-email { animation: bb-el-in 0.5s cubic-bezier(0.16,1,0.3,1) 0.6s forwards; }
        .bb-s-pass { animation: bb-el-in 0.5s cubic-bezier(0.16,1,0.3,1) 0.7s forwards; }
        .bb-s-btn  { animation: bb-el-in 0.5s cubic-bezier(0.16,1,0.3,1) 0.85s forwards; }
        .bb-s-links { animation: bb-fade 0.5s ease-out 1s forwards; }
        .bb-s-extra { animation: bb-fade 0.5s ease-out 1.1s forwards; }

        .bb-shimmer { position: relative; overflow: hidden; }
        .bb-shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%);
          animation: bb-shimmer 1.5s ease-in-out infinite;
        }
      ` }} />

      <div className="flex min-h-screen w-full" style={{ backgroundColor: 'var(--bb-depth-1)' }}>
        {/* ── Left side: illustration (desktop only) ── */}
        <div
          className="relative hidden w-1/2 flex-col items-center justify-center md:flex"
          style={{
            background: 'linear-gradient(135deg, var(--bb-depth-2) 0%, var(--bb-depth-0) 100%)',
            borderRight: '1px solid var(--bb-glass-border)',
          }}
        >
          <h2
            className="text-4xl font-extrabold lg:text-5xl"
            style={{
              color: 'var(--bb-brand)',
              letterSpacing: '-0.03em',
              filter: 'drop-shadow(0 0 40px rgba(239, 68, 68, 0.2))',
            }}
          >
            BLACKBELT
          </h2>
          <p className="mt-4 max-w-xs text-center text-base" style={{ color: 'var(--bb-ink-60)' }}>
            Sua jornada nas artes marciais comeca aqui.
          </p>
          <div className="mt-8 flex w-64 gap-1">
            {BELT_COLORS.map((c, i) => (
              <div
                key={i}
                className="h-2 flex-1 rounded-full"
                style={{ backgroundColor: c, opacity: 0.5 }}
              />
            ))}
          </div>
          <div className="mt-12 flex items-center gap-6 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
            <span>500+ academias</span>
            <span style={{ color: 'var(--bb-ink-20)' }}>|</span>
            <span>25.000+ alunos</span>
          </div>
        </div>

        {/* ── Right side: login form ── */}
        <div className="flex w-full flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 md:w-1/2">
          <div
            className={`bb-s w-full max-w-[420px] rounded-2xl sm:rounded-3xl ${shake || success ? '' : 'bb-s-card'}`}
            style={{
              background: 'var(--bb-depth-3)',
              backdropFilter: 'blur(24px) saturate(1.3)',
              WebkitBackdropFilter: 'blur(24px) saturate(1.3)',
              border: '1px solid var(--bb-glass-border)',
              padding: 'clamp(1.5rem, 4vw, 2.75rem) clamp(1.25rem, 3.5vw, 2.25rem)',
              boxShadow: 'var(--bb-shadow-xl)',
              ...cardAnim,
            }}
          >
            {/* Logo */}
            <div className="bb-s bb-s-logo flex flex-col items-center">
              <h1
                className="text-3xl font-extrabold sm:text-4xl"
                style={{
                  letterSpacing: '-0.03em',
                  color: 'var(--bb-brand)',
                  filter: 'drop-shadow(0 0 30px rgba(239, 68, 68, 0.3))',
                }}
              >
                BLACKBELT
              </h1>
              <div
                className="mt-3"
                style={{ width: 40, height: 3, borderRadius: 2, background: 'var(--bb-brand)' }}
              />
            </div>

            {/* Tagline */}
            <p
              className="bb-s bb-s-tag mt-3 text-center text-xs uppercase tracking-widest sm:text-[13px]"
              style={{ color: 'var(--bb-ink-60)' }}
            >
              Sua jornada nas artes marciais
            </p>

            {/* Social Login Buttons */}
            <div className="bb-s bb-s-social mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={!!oauthLoading || loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-medium transition-all duration-200 sm:text-sm disabled:opacity-50"
                style={{
                  border: '1px solid var(--bb-glass-border)',
                  background: 'var(--bb-depth-2)',
                  color: 'var(--bb-ink-80)',
                  cursor: oauthLoading || loading ? 'not-allowed' : 'pointer',
                }}
              >
                {oauthLoading === 'google' ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                Google
              </button>
              <button
                type="button"
                onClick={() => handleOAuth('apple')}
                disabled={!!oauthLoading || loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-medium transition-all duration-200 sm:text-sm disabled:opacity-50"
                style={{
                  border: '1px solid var(--bb-glass-border)',
                  background: 'var(--bb-depth-2)',
                  color: 'var(--bb-ink-80)',
                  cursor: oauthLoading || loading ? 'not-allowed' : 'pointer',
                }}
              >
                {oauthLoading === 'apple' ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.53-3.23 0-1.44.62-2.2.44-3.06-.4C3.79 16.17 4.36 9.51 8.82 9.28c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.3 4.12zM12.03 9.2C11.88 6.88 13.77 5 15.96 4.82c.29 2.65-2.4 4.63-3.93 4.38z"/>
                  </svg>
                )}
                Apple
              </button>
            </div>

            {/* Divider */}
            <div className="bb-s bb-s-div my-5 flex items-center gap-3">
              <div className="h-px flex-1" style={{ background: 'var(--bb-glass-border)' }} />
              <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>ou</span>
              <div className="h-px flex-1" style={{ background: 'var(--bb-glass-border)' }} />
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="bb-s bb-s-email relative">
                <span className="pointer-events-none absolute left-4 top-[38px] z-10" style={{ color: 'var(--bb-ink-40)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <Input
                  ref={emailRef}
                  label="Email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  error={error && !email.trim() ? 'Campo obrigatorio' : undefined}
                  className="h-12 w-full border-[var(--bb-glass-border)] bg-[var(--bb-depth-5)] pl-11 text-sm text-[var(--bb-ink-100)] placeholder:text-[var(--bb-ink-40)] focus-visible:border-[var(--bb-brand)] focus-visible:ring-[var(--bb-brand)]/20"
                />
              </div>

              <div className="bb-s bb-s-pass relative">
                <span className="pointer-events-none absolute left-4 top-[38px] z-10" style={{ color: 'var(--bb-ink-40)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <Input
                  label="Senha"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  error={error && !password.trim() ? 'Campo obrigatorio' : undefined}
                  className="h-12 w-full border-[var(--bb-glass-border)] bg-[var(--bb-depth-5)] pl-11 text-sm text-[var(--bb-ink-100)] placeholder:text-[var(--bb-ink-40)] focus-visible:border-[var(--bb-brand)] focus-visible:ring-[var(--bb-brand)]/20"
                />
              </div>

              {error && email.trim() && password.trim() && (
                <p className="text-center text-[13px]" style={{ color: 'var(--bb-brand)' }}>
                  {error}
                </p>
              )}

              <div className="bb-s bb-s-btn mt-1">
                <Button
                  type="submit"
                  loading={loading}
                  className={`h-12 w-full text-sm font-bold text-white transition-all duration-200 sm:text-[15px] ${loading ? 'bb-shimmer' : ''}`}
                  style={{ background: 'var(--bb-brand-gradient)', borderRadius: 'var(--bb-radius-md)' }}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </div>
            </form>

            {/* Forgot password */}
            <div className="bb-s bb-s-links mt-5 flex items-center justify-center">
              <Link
                href="/esqueci-senha"
                className="text-xs transition-colors duration-200 sm:text-sm"
                style={{ color: 'var(--bb-ink-60)' }}
              >
                Esqueci minha senha
              </Link>
            </div>

            {/* Divider */}
            <div className="bb-s bb-s-extra mt-5 flex items-center gap-3">
              <div className="h-px flex-1" style={{ background: 'var(--bb-glass-border)' }} />
              <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Nao tem conta?</span>
              <div className="h-px flex-1" style={{ background: 'var(--bb-glass-border)' }} />
            </div>

            {/* Registration options */}
            <div className="bb-s bb-s-extra mt-4 flex flex-col gap-3">
              <Link
                href="/landing"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  border: '1px solid var(--bb-glass-border)',
                  background: 'var(--bb-depth-2)',
                  color: 'var(--bb-ink-80)',
                }}
              >
                <Building2 size={18} style={{ color: 'var(--bb-brand)' }} />
                Sou dono de academia
              </Link>
              <button
                type="button"
                onClick={() => { setShowInviteModal(true); setInviteCode(''); setInviteResult(null); }}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  border: '1px solid var(--bb-glass-border)',
                  background: 'var(--bb-depth-2)',
                  color: 'var(--bb-ink-80)',
                  cursor: 'pointer',
                }}
              >
                <LinkIcon size={18} style={{ color: 'var(--bb-brand)' }} />
                Tenho codigo de convite
              </button>
            </div>

            {/* Demo credentials */}
            <div className="bb-s bb-s-extra mt-5 pt-4" style={{ borderTop: '1px solid var(--bb-glass-border)' }}>
              <p className="text-center text-[11px] sm:text-xs" style={{ color: 'var(--bb-ink-40)', overflowWrap: 'break-word' }}>
                Demo: roberto@guerreiros.com / BlackBelt@2026
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ INVITE CODE MODAL ═══ */}
      {showInviteModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ animation: 'bb-backdrop-in 0.2s ease-out forwards' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowInviteModal(false); }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          />
          <div
            className="relative w-full max-w-md rounded-2xl p-6 sm:p-8"
            style={{
              background: 'var(--bb-depth-3)',
              border: '1px solid var(--bb-glass-border)',
              boxShadow: 'var(--bb-shadow-xl)',
              animation: 'bb-modal-in 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
            }}
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => setShowInviteModal(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
              style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-60)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: 'var(--bb-brand-surface)', color: 'var(--bb-brand)' }}
              >
                <LinkIcon size={20} />
              </div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                Codigo de Convite
              </h3>
            </div>

            <p className="text-sm mb-4" style={{ color: 'var(--bb-ink-60)' }}>
              Cole o codigo ou link que voce recebeu do professor ou da academia:
            </p>

            <input
              type="text"
              placeholder="ABC123 ou link completo"
              value={inviteCode}
              onChange={(e) => { setInviteCode(e.target.value); setInviteResult(null); }}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--bb-brand)]/30"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-100)',
              }}
              autoFocus
            />

            {!inviteResult && (
              <button
                type="button"
                onClick={handleValidateInvite}
                disabled={!inviteCode.trim() || inviteLoading}
                className="mt-4 w-full rounded-xl py-3 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'var(--bb-brand-gradient)', cursor: inviteCode.trim() && !inviteLoading ? 'pointer' : undefined }}
              >
                {inviteLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Validando...
                  </span>
                ) : 'Validar'}
              </button>
            )}

            {inviteResult?.valid && (
              <div className="mt-4">
                <div
                  className="rounded-xl p-4"
                  style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)' }}
                >
                  <p className="text-sm font-semibold" style={{ color: '#22c55e' }}>Convite valido!</p>
                  <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                    Academia: {inviteResult.academy}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                    Perfil: {inviteResult.role}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGoToInvite}
                  className="mt-3 w-full rounded-xl py-3 text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: 'var(--bb-brand-gradient)', cursor: 'pointer' }}
                >
                  Criar minha conta
                </button>
              </div>
            )}

            {inviteResult && !inviteResult.valid && (
              <div className="mt-4">
                <div
                  className="rounded-xl p-4"
                  style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                >
                  <p className="text-sm font-semibold" style={{ color: '#ef4444' }}>Codigo invalido ou expirado.</p>
                  <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                    Peca um novo link ao seu professor.
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowInviteModal(false)}
              className="mt-4 w-full py-2 text-center text-sm transition-colors"
              style={{ color: 'var(--bb-ink-40)', cursor: 'pointer', background: 'none', border: 'none' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

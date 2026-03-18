'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const { login, selectProfile } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // Clear shake after animation
  useEffect(() => {
    if (shake) {
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [shake]);

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

      // Brief scale-down animation before redirect
      await new Promise((resolve) => setTimeout(resolve, 400));

      if (profiles.length === 1) {
        // selectProfile sets cookies (bb-active-role, bb-academy-id) and navigates
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

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* === CHOREOGRAPHED ANIMATION SEQUENCE === */
            @keyframes bb-login-card-in {
              0% { opacity: 0; transform: scale(0.95); filter: blur(8px); }
              100% { opacity: 1; transform: scale(1); filter: blur(0); }
            }
            @keyframes bb-login-element-in {
              0% { opacity: 0; transform: translateY(12px); filter: blur(4px); }
              100% { opacity: 1; transform: translateY(0); filter: blur(0); }
            }
            @keyframes bb-login-fade-in {
              0% { opacity: 0; }
              100% { opacity: 1; }
            }
            @keyframes bb-login-shake {
              0%, 100% { transform: translateX(0); }
              12% { transform: translateX(-8px); }
              25% { transform: translateX(8px); }
              37% { transform: translateX(-4px); }
              50% { transform: translateX(4px); }
              62% { transform: translateX(-2px); }
              75% { transform: translateX(2px); }
              87% { transform: translateX(0); }
            }
            @keyframes bb-login-success {
              0% { transform: scale(1); opacity: 1; }
              100% { transform: scale(0.97); opacity: 0; }
            }
            @keyframes bb-login-shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }

            /* Stagger items — each with opacity 0 until animated */
            .bb-stagger { opacity: 0; animation-fill-mode: forwards; }
            .bb-stagger-card { animation: bb-login-card-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.0s forwards; }
            .bb-stagger-logo { animation: bb-login-element-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; }
            .bb-stagger-tagline { animation: bb-login-fade-in 0.5s ease-out 0.4s forwards; }
            .bb-stagger-email { animation: bb-login-element-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards; }
            .bb-stagger-password { animation: bb-login-element-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.7s forwards; }
            .bb-stagger-button { animation: bb-login-element-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.9s forwards; }
            .bb-stagger-links { animation: bb-login-fade-in 0.5s ease-out 1.1s forwards; }

            /* Button shimmer on loading */
            .bb-btn-shimmer { position: relative; overflow: hidden; }
            .bb-btn-shimmer::after {
              content: '';
              position: absolute;
              inset: 0;
              background: linear-gradient(
                90deg,
                transparent 0%,
                rgba(255, 255, 255, 0.15) 50%,
                transparent 100%
              );
              animation: bb-login-shimmer 1.5s ease-in-out infinite;
            }
          `,
        }}
      />

      {/* Fullscreen wrapper with mesh gradient background */}
      <div
        className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden"
        style={{
          backgroundColor: 'var(--bb-depth-1)',
        }}
      >
        {/* Cinematic glassmorphism card */}
        <div
          className={`bb-stagger w-[95%] ${shake ? '' : success ? '' : 'bb-stagger-card'}`}
          style={{
            maxWidth: 420,
            background: 'var(--bb-depth-3)',
            backdropFilter: 'blur(24px) saturate(1.3)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.3)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 24,
            padding: '48px 40px',
            boxShadow: 'var(--bb-shadow-xl)',
            ...(shake
              ? { animation: 'bb-login-shake 0.3s ease-in-out', opacity: 1 }
              : success
                ? { animation: 'bb-login-success 0.3s ease-in-out forwards', opacity: 1 }
                : {}),
          }}
        >
          {/* Logo */}
          <div className="bb-stagger bb-stagger-logo flex flex-col items-center">
            <h1
              className="font-display text-4xl font-extrabold"
              style={{
                letterSpacing: '-0.03em',
                color: 'var(--bb-brand)',
                filter: 'drop-shadow(0 0 30px rgba(239, 68, 68, 0.3))',
              }}
            >
              BLACKBELT
            </h1>
            {/* Red stripe below logo */}
            <div
              className="mt-3"
              style={{
                width: 40,
                height: 3,
                borderRadius: 2,
                background: 'var(--bb-brand)',
              }}
            />
          </div>

          {/* Tagline */}
          <p
            className="bb-stagger bb-stagger-tagline mt-4 text-center font-sans uppercase"
            style={{
              fontSize: 13,
              letterSpacing: '0.08em',
              color: 'var(--bb-ink-60)',
            }}
          >
            O sistema operacional da sua academia
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            {/* Email field */}
            <div className="bb-stagger bb-stagger-email relative">
              <span
                className="pointer-events-none absolute left-4 top-[38px] z-10"
                style={{ color: 'var(--bb-ink-40)' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
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
                error={error && !email.trim() ? 'Campo obrigatório' : undefined}
                className="h-12 border-[var(--bb-glass-border)] bg-[var(--bb-depth-5)] pl-11 text-sm text-[var(--bb-ink-100)] placeholder:text-[var(--bb-ink-40)] focus-visible:border-[var(--bb-brand)] focus-visible:ring-[var(--bb-brand)]/20"
              />
            </div>

            {/* Password field */}
            <div className="bb-stagger bb-stagger-password relative">
              <span
                className="pointer-events-none absolute left-4 top-[38px] z-10"
                style={{ color: 'var(--bb-ink-40)' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
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
                error={error && !password.trim() ? 'Campo obrigatório' : undefined}
                className="h-12 border-[var(--bb-glass-border)] bg-[var(--bb-depth-5)] pl-11 text-sm text-[var(--bb-ink-100)] placeholder:text-[var(--bb-ink-40)] focus-visible:border-[var(--bb-brand)] focus-visible:ring-[var(--bb-brand)]/20"
              />
            </div>

            {/* Error message */}
            {error && email.trim() && password.trim() && (
              <p
                className="text-center text-[13px]"
                style={{ color: 'var(--bb-brand)' }}
              >
                {error}
              </p>
            )}

            {/* Submit button */}
            <div className="bb-stagger bb-stagger-button mt-1">
              <Button
                type="submit"
                loading={loading}
                className={`h-12 w-full text-[15px] font-bold text-white transition-all duration-200 ${
                  loading ? 'bb-btn-shimmer' : ''
                }`}
                style={{
                  background: 'var(--bb-brand-gradient)',
                  borderRadius: 'var(--bb-radius-md)',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.boxShadow = 'var(--bb-brand-glow)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.filter = 'brightness(0.9)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.filter = 'brightness(1)';
                }}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </div>
          </form>

          {/* Links */}
          <div
            className="bb-stagger bb-stagger-links mt-6 flex items-center justify-center gap-3 text-sm"
          >
            <Link
              href="/esqueci-senha"
              className="transition-colors duration-200"
              style={{ color: 'var(--bb-ink-60)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--bb-ink-100)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--bb-ink-60)';
              }}
            >
              Esqueci senha
            </Link>
            <span style={{ color: 'var(--bb-ink-20)' }}>|</span>
            <Link
              href="/cadastro"
              className="transition-colors duration-200"
              style={{ color: 'var(--bb-ink-60)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--bb-ink-100)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--bb-ink-60)';
              }}
            >
              Criar conta
            </Link>
          </div>

          {/* Demo credentials */}
          <div
            className="bb-stagger bb-stagger-links mt-6 pt-4"
            style={{ borderTop: '1px solid var(--bb-glass-border)' }}
          >
            <p
              className="text-center text-xs"
              style={{ color: 'var(--bb-ink-40)' }}
            >
              Demo: roberto@guerreiros.com / BlackBelt@2026
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

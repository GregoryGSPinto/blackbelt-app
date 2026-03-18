'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const MAX_ATTEMPTS = 3;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_RESENDS = 3;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [rateLimited, setRateLimited] = useState(false);

  // Resend state
  const [resendCount, setResendCount] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  // Rate limit tracking
  const attemptsRef = useRef<number[]>([]);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  function checkRateLimit(): boolean {
    const now = Date.now();
    attemptsRef.current = attemptsRef.current.filter(
      (t) => now - t < RATE_LIMIT_WINDOW_MS,
    );
    if (attemptsRef.current.length >= MAX_ATTEMPTS) {
      setRateLimited(true);
      return false;
    }
    attemptsRef.current.push(now);
    return true;
  }

  async function sendResetEmail(targetEmail: string): Promise<void> {
    const supabase = createBrowserClient();
    await supabase.auth.resetPasswordForEmail(targetEmail, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setEmailError('');

    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError('Digite seu email.');
      return;
    }
    if (!isValidEmail(trimmed)) {
      setEmailError('Email invalido. Verifique o formato.');
      return;
    }
    if (!checkRateLimit()) return;

    setLoading(true);
    try {
      await sendResetEmail(trimmed);
    } catch {
      // SECURITY: Never reveal if email exists. Always show success.
    }
    setLoading(false);
    setSent(true);
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }

  async function handleResend() {
    if (cooldown > 0 || resendCount >= MAX_RESENDS) return;
    if (!checkRateLimit()) return;

    setResending(true);
    try {
      await sendResetEmail(email.trim());
    } catch {
      // SECURITY: Silent fail
    }
    setResending(false);
    setResendCount((prev) => prev + 1);
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div
        className="w-full max-w-md"
        style={{
          background: 'var(--bb-depth-3)',
          border: '1px solid var(--bb-glass-border)',
          borderRadius: 24,
          padding: '48px 32px',
          boxShadow: 'var(--bb-shadow-xl)',
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center">
          <h1
            className="text-3xl font-extrabold tracking-tight"
            style={{
              color: 'var(--bb-brand)',
              letterSpacing: '-0.03em',
              filter: 'drop-shadow(0 0 30px rgba(239, 68, 68, 0.3))',
            }}
          >
            BLACKBELT
          </h1>
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

        {sent ? (
          /* ===== SENT STATE ===== */
          <div className="mt-8 flex flex-col items-center text-center">
            {/* Check icon */}
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: 'var(--bb-brand-surface)' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: 'var(--bb-success)' }}
              >
                <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                <path d="m16 19 2 2 4-4" />
              </svg>
            </div>

            <h2
              className="mt-5 text-xl font-bold"
              style={{ color: 'var(--bb-ink-100)' }}
            >
              Email enviado!
            </h2>

            <p
              className="mt-2 text-sm"
              style={{ color: 'var(--bb-ink-60)' }}
            >
              Enviamos um link de recuperacao para:
            </p>
            <p
              className="mt-1 text-sm font-semibold"
              style={{ color: 'var(--bb-ink-100)' }}
            >
              {email.trim()}
            </p>

            {/* Tips */}
            <div
              className="mt-6 w-full rounded-xl p-4 text-left"
              style={{
                backgroundColor: 'var(--bb-depth-5)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              <p
                className="mb-2 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--bb-ink-40)' }}
              >
                Dicas
              </p>
              <ul className="flex flex-col gap-1.5 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                <li>Verifique a pasta de spam/lixo eletrOnico</li>
                <li>O email pode levar ate 2 minutos</li>
                <li>Confirme se o email digitado esta correto</li>
                <li className="mt-1" style={{ color: 'var(--bb-warning)' }}>
                  Gmail: verifique as abas Atualizacoes e Promocoes
                </li>
              </ul>
            </div>

            {/* Resend */}
            <div className="mt-6 w-full">
              {resendCount >= MAX_RESENDS ? (
                <p
                  className="text-center text-xs"
                  style={{ color: 'var(--bb-ink-40)' }}
                >
                  Limite de reenvios atingido. Tente novamente mais tarde.
                </p>
              ) : (
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full text-sm"
                  disabled={cooldown > 0 || resending}
                  loading={resending}
                  onClick={handleResend}
                >
                  {cooldown > 0
                    ? `Reenviar email (${cooldown}s)`
                    : 'Reenviar email'}
                </Button>
              )}
            </div>

            <Link
              href="/login"
              className="mt-5 text-sm transition-colors"
              style={{ color: 'var(--bb-brand)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              Voltar para o login
            </Link>
          </div>
        ) : (
          /* ===== FORM STATE ===== */
          <>
            <h2
              className="mt-6 text-center text-lg font-semibold"
              style={{ color: 'var(--bb-ink-100)' }}
            >
              Recuperar sua senha
            </h2>
            <p
              className="mt-2 text-center text-sm"
              style={{ color: 'var(--bb-ink-60)' }}
            >
              Digite seu email e enviaremos um link para criar uma nova senha.
            </p>

            {rateLimited && (
              <div
                className="mt-4 rounded-lg p-3 text-center text-sm"
                style={{
                  backgroundColor: 'var(--bb-brand-surface)',
                  color: 'var(--bb-warning)',
                  border: '1px solid var(--bb-warning)',
                }}
              >
                Aguarde alguns minutos antes de tentar novamente.
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
              <div className="relative">
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                    setRateLimited(false);
                  }}
                  autoComplete="email"
                  error={emailError || undefined}
                  className="h-12 border-[var(--bb-glass-border)] bg-[var(--bb-depth-5)] pl-11 text-sm text-[var(--bb-ink-100)] placeholder:text-[var(--bb-ink-40)] focus-visible:border-[var(--bb-brand)] focus-visible:ring-[var(--bb-brand)]/20"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                loading={loading}
                disabled={rateLimited}
                className="w-full text-[15px] font-bold text-white"
                style={{
                  background: 'var(--bb-brand-gradient)',
                  borderRadius: 'var(--bb-radius-md)',
                }}
              >
                {loading ? 'Enviando...' : 'ENVIAR LINK DE RECUPERACAO'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm transition-colors"
                style={{ color: 'var(--bb-ink-60)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--bb-ink-100)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--bb-ink-60)';
                }}
              >
                Voltar para o login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

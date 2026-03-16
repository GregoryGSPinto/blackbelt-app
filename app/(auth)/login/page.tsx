'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { ROLE_DASHBOARD } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
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
        const dashboard = ROLE_DASHBOARD[profiles[0].role] ?? '/dashboard';
        router.push(dashboard);
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
            @keyframes bb-login-fade-in {
              0% { opacity: 0; transform: translateY(12px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            @keyframes bb-login-shake {
              0%, 100% { transform: translateX(0); }
              10%, 50%, 90% { transform: translateX(-4px); }
              30%, 70% { transform: translateX(4px); }
            }
            @keyframes bb-login-success {
              0% { transform: scale(1); opacity: 1; }
              100% { transform: scale(0.96); opacity: 0.7; }
            }
            @keyframes bb-login-tagline {
              0% { opacity: 0; }
              100% { opacity: 1; }
            }
            @keyframes bb-login-spinner {
              to { transform: rotate(360deg); }
            }
          `,
        }}
      />

      {/*
        Fullscreen wrapper — breaks out of the auth layout's centering
        by using fixed positioning to own the entire viewport.
      */}
      <div
        className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden"
        style={{
          background: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 39px,
              rgba(255,255,255,0.02) 39px,
              rgba(255,255,255,0.02) 40px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 39px,
              rgba(255,255,255,0.02) 39px,
              rgba(255,255,255,0.02) 40px
            ),
            linear-gradient(180deg, #0A0A0A 0%, #111111 100%)
          `,
        }}
      >
        {/* Glassmorphism card */}
        <div
          className="w-[95%] max-w-md rounded-2xl border border-white/10 p-8 sm:p-10"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            animation: shake
              ? 'bb-login-shake 0.5s ease-in-out'
              : success
                ? 'bb-login-success 0.4s ease-in-out forwards'
                : 'bb-login-fade-in 0.5s ease-out forwards',
          }}
        >
          {/* Logo */}
          <h1 className="text-center text-3xl font-bold tracking-tight text-white">
            Black<span className="text-[#DC2626]">Belt</span>
          </h1>

          {/* Tagline with delayed fade */}
          <p
            className="mt-2 text-center text-sm text-neutral-500"
            style={{
              animation: 'bb-login-tagline 0.6s ease-out 0.3s forwards',
              opacity: 0,
            }}
          >
            O sistema operacional da sua academia
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            {/* Email field */}
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-[38px] text-neutral-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
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
                className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-neutral-600 focus-visible:ring-[#DC2626] focus-visible:ring-offset-0"
              />
            </div>

            {/* Password field */}
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-[38px] text-neutral-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
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
                className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-neutral-600 focus-visible:ring-[#DC2626] focus-visible:ring-offset-0"
              />
            </div>

            {/* Error message */}
            {error && email.trim() && password.trim() && (
              <p className="rounded-md bg-red-500/10 px-3 py-2 text-center text-sm text-red-400">
                {error}
              </p>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              loading={loading}
              className="mt-1 h-12 w-full bg-[#DC2626] text-base font-semibold text-white hover:bg-[#B91C1C] active:bg-[#991B1B]"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 flex items-center justify-center gap-3 text-sm">
            <Link
              href="/esqueci-senha"
              className="text-neutral-500 transition-colors hover:text-white"
            >
              Esqueci senha
            </Link>
            <span className="text-neutral-700">|</span>
            <Link
              href="/cadastro"
              className="text-neutral-500 transition-colors hover:text-white"
            >
              Criar conta
            </Link>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 border-t border-white/5 pt-4">
            <p className="text-center text-xs text-neutral-600">
              Demo: roberto@guerreiros.com / BlackBelt@2026
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

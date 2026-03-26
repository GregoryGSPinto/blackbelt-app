'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { PasswordRules, getPasswordStrength, PASSWORD_RULES } from '@/components/auth/PasswordRules';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import { translateError } from '@/lib/utils/error-translator';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

type PageState = 'loading' | 'valid' | 'expired';

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>('loading');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const strength = getPasswordStrength(password);
  const allRulesPass = PASSWORD_RULES.every((rule) => rule.test(password));
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const canSubmit = allRulesPass && passwordsMatch && !submitting;

  // Check session on mount
  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    async function checkSession() {
      try {
        const supabase = createBrowserClient();
        const { data: authListener } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
          if (cancelled) return;
          if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
            setPageState('valid');
          }
        });
        unsubscribe = () => authListener.subscription.unsubscribe();

        const { data } = await supabase.auth.getSession();

        if (cancelled) return;

        if (data.session) {
          setPageState('valid');
        } else {
          window.setTimeout(async () => {
            if (cancelled) return;
            const retry = await supabase.auth.getSession();
            if (retry.data.session) {
              setPageState('valid');
              return;
            }
            setPageState('expired');
          }, 250);
        }
      } catch {
        if (!cancelled) setPageState('expired');
      }
    }

    checkSession();
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');

    setSubmitting(true);
    try {
      const supabase = createBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(translateError(updateError));
        setSubmitting(false);
        return;
      }

      router.push('/senha-alterada');
    } catch {
      setError('Nao foi possivel atualizar sua senha. Tente novamente.');
      setSubmitting(false);
    }
  }

  // Loading state
  if (pageState === 'loading') {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <svg
          className="h-8 w-8 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          style={{ color: 'var(--bb-brand)' }}
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Verificando link...
        </p>
      </div>
    );
  }

  // Expired state
  if (pageState === 'expired') {
    return (
      <div className="py-8">
        <div
          className="w-full text-center"
          style={{
            background: 'var(--bb-depth-3)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 24,
            padding: '48px 32px',
            boxShadow: 'var(--bb-shadow-xl)',
          }}
        >
          {/* Expired icon */}
          <div className="flex justify-center">
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
                style={{ color: 'var(--bb-error)' }}
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>

          <h2
            className="mt-5 text-xl font-bold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Link expirado
          </h2>
          <p
            className="mt-2 text-sm"
            style={{ color: 'var(--bb-ink-60)' }}
          >
            Este link de redefinicao expirou, ja foi usado ou nao pode ser validado. Solicite um novo email para continuar.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Link href="/esqueci-senha">
              <Button
                size="lg"
                className="w-full text-[15px] font-bold text-white"
                style={{
                  background: 'var(--bb-brand-gradient)',
                  borderRadius: 'var(--bb-radius-md)',
                }}
              >
                Solicitar novo link
              </Button>
            </Link>

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
            <Link
              href="/"
              className="text-sm transition-colors"
              style={{ color: 'var(--bb-ink-60)' }}
            >
              Voltar para o site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Valid session — reset password form
  return (
    <div className="py-8">
      <div
        className="w-full"
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

        <h2
          className="mt-6 text-center text-lg font-semibold"
          style={{ color: 'var(--bb-ink-100)' }}
        >
          Criar nova senha
        </h2>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          {/* New password */}
          <div>
            <PasswordInput
              label="Nova senha"
              placeholder="Digite sua nova senha"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              autoComplete="new-password"
            />
            {password.length > 0 && (
              <div className="mt-2">
                <PasswordStrengthMeter strength={strength} />
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <PasswordInput
              label="Confirmar nova senha"
              placeholder="Repita a nova senha"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
              }}
              autoComplete="new-password"
            />
            {confirmPassword.length > 0 && (
              <p
                className="mt-1.5 text-xs font-medium"
                style={{
                  color: passwordsMatch ? 'var(--bb-success)' : 'var(--bb-error)',
                }}
              >
                {passwordsMatch ? 'Senhas coincidem' : 'Senhas nao coincidem'}
              </p>
            )}
          </div>

          {/* Password rules */}
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: 'var(--bb-depth-5)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            <PasswordRules password={password} />
          </div>

          {/* Error */}
          {error && (
            <p
              className="text-center text-sm"
              style={{ color: 'var(--bb-error)' }}
            >
              {error}
            </p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            loading={submitting}
            disabled={!canSubmit}
            className="w-full text-[15px] font-bold text-white"
            style={{
              background: canSubmit ? 'var(--bb-brand-gradient)' : undefined,
              borderRadius: 'var(--bb-radius-md)',
            }}
          >
            {submitting ? 'Salvando...' : 'Salvar nova senha'}
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
      </div>
    </div>
  );
}

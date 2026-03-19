'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/lib/api/auth.service';
import { validateInviteToken, useInviteToken as redeemInviteToken } from '@/lib/api/invite-tokens.service';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Loader2 } from 'lucide-react';
import type { InviteValidation, Role } from '@/lib/types';
import { ROLE_DASHBOARD } from '@/lib/types';

// ── Constants ───────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  professor: 'Professor',
  aluno_adulto: 'Aluno (Adulto)',
  aluno_teen: 'Aluno (Teen)',
  aluno_kids: 'Aluno (Kids)',
  responsavel: 'Responsavel',
  recepcao: 'Recepcionista',
  gestor: 'Gestor',
};

const ERROR_MESSAGES: Record<string, { title: string; desc: string }> = {
  not_found: {
    title: 'Link nao encontrado',
    desc: 'Este link de convite nao existe ou foi removido.',
  },
  expired: {
    title: 'Link expirado',
    desc: 'Este link de convite ja expirou. Peca um novo link ao administrador da academia.',
  },
  max_uses: {
    title: 'Vagas esgotadas',
    desc: 'O limite de cadastros para este link foi atingido. Peca um novo link ao administrador.',
  },
  inactive: {
    title: 'Link desativado',
    desc: 'Este link de convite foi desativado pelo administrador da academia.',
  },
};

// ── Page ────────────────────────────────────────────────────────────────

export default function CadastroTokenPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithOAuth, selectProfile, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const fromOAuth = searchParams.get('from') === 'oauth';

  const [validation, setValidation] = useState<InviteValidation | null>(null);
  const [loading, setLoading] = useState(true);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);
  const [completingOAuth, setCompletingOAuth] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Validate token on mount ────────────────────────────────────────

  useEffect(() => {
    async function validate() {
      try {
        const result = await validateInviteToken(params.token);
        setValidation(result);
      } catch {
        setValidation({ valid: false, error: 'not_found' });
      } finally {
        setLoading(false);
      }
    }
    validate();
  }, [params.token]);

  // ── Auto-complete registration when returning from OAuth ───────────

  useEffect(() => {
    if (!fromOAuth || !isAuthenticated || !validation?.valid || !validation.token || completingOAuth) return;

    async function completeOAuthRegistration() {
      setCompletingOAuth(true);
      try {
        const inviteData = validation!.token!;

        // Create profile — name comes from OAuth provider or fallback
        const result = await register({
          name: 'Usuario OAuth',
          email: '',
          password: '',
        });

        // Redeem the invite
        await redeemInviteToken(params.token, result.profile.id);

        toast('Conta criada com sucesso! Redirecionando...', 'success');

        const targetRole = inviteData.target_role as Role;
        const dashboard = ROLE_DASHBOARD[targetRole] ?? '/login';
        router.push(dashboard);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao completar cadastro.';
        toast(message, 'error');
        setCompletingOAuth(false);
      }
    }

    completeOAuthRegistration();
  }, [fromOAuth, isAuthenticated, validation, completingOAuth, params.token, router, toast]);

  // ── OAuth handler ─────────────────────────────────────────────────

  async function handleOAuth(provider: 'google' | 'apple') {
    setOauthLoading(provider);
    try {
      const profiles = await loginWithOAuth(provider, params.token);
      // In real mode, browser redirects to OAuth provider — we never reach here.
      // In mock mode, we get profiles back — complete the invite flow.
      if (profiles.length > 0 && validation?.token) {
        toast('Conta vinculada com sucesso! Redirecionando...', 'success');
        await new Promise((r) => setTimeout(r, 400));

        // Redeem the invite for the first profile
        await redeemInviteToken(params.token, profiles[0].id);

        if (profiles.length === 1) {
          await selectProfile(profiles[0].id);
        } else {
          router.push('/selecionar-perfil');
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login social.';
      toast(message, 'error');
      setOauthLoading(null);
    }
  }

  // ── Form validation ────────────────────────────────────────────────

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Nome e obrigatorio';
    if (!email.trim()) e.email = 'Email e obrigatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email invalido';
    if (password.length < 6) e.password = 'Minimo 6 caracteres';
    if (password !== confirmPassword) e.confirmPassword = 'Senhas nao conferem';
    if (!acceptTerms) e.terms = 'Aceite os termos de uso';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit ─────────────────────────────────────────────────────────

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate() || !validation?.token) return;

    setSubmitting(true);
    try {
      const result = await register({ name, email, password });

      // Register the invite usage
      await redeemInviteToken(params.token, result.profile.id);

      toast('Conta criada com sucesso! Redirecionando...', 'success');

      // Redirect to the appropriate dashboard based on the invite role
      const inviteData = validation.token!;
      const targetRole = inviteData.target_role as Role;
      const dashboard = ROLE_DASHBOARD[targetRole] ?? '/login';
      router.push(dashboard);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta.';
      toast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Loading ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div
        className="flex items-center justify-center rounded-lg p-12"
        style={{
          background: 'var(--bb-depth-3)',
          boxShadow: 'var(--bb-shadow-xl)',
          border: '1px solid var(--bb-glass-border)',
        }}
      >
        <Spinner size="lg" className="text-[var(--bb-ink-100)]" />
      </div>
    );
  }

  // ── Completing OAuth registration ──────────────────────────────────

  if (completingOAuth) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 rounded-lg p-12"
        style={{
          background: 'var(--bb-depth-3)',
          boxShadow: 'var(--bb-shadow-xl)',
          border: '1px solid var(--bb-glass-border)',
        }}
      >
        <Spinner size="lg" className="text-[var(--bb-ink-100)]" />
        <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Finalizando seu cadastro...
        </p>
      </div>
    );
  }

  // ── Invalid token ──────────────────────────────────────────────────

  if (!validation?.valid) {
    const errorInfo = ERROR_MESSAGES[validation?.error ?? 'not_found'];
    return (
      <div
        className="rounded-lg p-8 text-center"
        style={{
          background: 'var(--bb-depth-3)',
          boxShadow: 'var(--bb-shadow-xl)',
          border: '1px solid var(--bb-glass-border)',
        }}
      >
        <span className="text-5xl">🚫</span>
        <h1 className="mt-4 text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          {errorInfo.title}
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          {errorInfo.desc}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link href="/login">
            <Button className="w-full">Ir para o Login</Button>
          </Link>
          <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
            Entre em contato com a administracao da sua academia
          </p>
        </div>
      </div>
    );
  }

  // ── Valid token — Registration form ────────────────────────────────

  const inviteToken = validation.token!;
  const roleLabel = ROLE_LABELS[inviteToken.target_role as Role] ?? inviteToken.target_role;

  return (
    <div
      className="w-full max-w-md rounded-lg p-8"
      style={{
        background: 'var(--bb-depth-3)',
        boxShadow: 'var(--bb-shadow-xl)',
        border: '1px solid var(--bb-glass-border)',
      }}
    >
      {/* Academy header */}
      <div className="mb-6 text-center">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: 'var(--bb-brand-surface)' }}
        >
          <span className="text-3xl">🥋</span>
        </div>
        <h1 className="mt-3 text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          {validation.academy_name ?? 'BlackBelt'}
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Voce esta se cadastrando como
        </p>
        <span
          className="mt-1 inline-block rounded-full px-3 py-1 text-sm font-semibold"
          style={{ background: 'var(--bb-brand-surface)', color: 'var(--bb-brand)' }}
        >
          {roleLabel}
        </span>
      </div>

      {/* Locked fields */}
      <div className="mb-4 space-y-2">
        <div
          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
          style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
        >
          <span style={{ color: 'var(--bb-ink-40)' }}>Academia</span>
          <span className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>
            {validation.academy_name ?? 'BlackBelt'} 🔒
          </span>
        </div>
        <div
          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
          style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
        >
          <span style={{ color: 'var(--bb-ink-40)' }}>Perfil</span>
          <span className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>
            {roleLabel} 🔒
          </span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="mb-4 flex gap-3">
        <button
          type="button"
          onClick={() => handleOAuth('google')}
          disabled={!!oauthLoading || submitting}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-medium transition-all duration-200 sm:text-sm disabled:opacity-50"
          style={{
            border: '1px solid var(--bb-glass-border)',
            background: 'var(--bb-depth-2)',
            color: 'var(--bb-ink-80)',
            cursor: oauthLoading || submitting ? 'not-allowed' : 'pointer',
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
          disabled={!!oauthLoading || submitting}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-medium transition-all duration-200 sm:text-sm disabled:opacity-50"
          style={{
            border: '1px solid var(--bb-glass-border)',
            background: 'var(--bb-depth-2)',
            color: 'var(--bb-ink-80)',
            cursor: oauthLoading || submitting ? 'not-allowed' : 'pointer',
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
      <div className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: 'var(--bb-glass-border)' }} />
        <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>ou preencha manualmente</span>
        <div className="h-px flex-1" style={{ background: 'var(--bb-glass-border)' }} />
      </div>

      {/* Registration form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nome completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          className="bg-[var(--bb-depth-5)] text-[var(--bb-ink-100)] placeholder:text-[var(--bb-ink-40)] border-[var(--bb-glass-border)]"
        />

        <Input
          label="Email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          className="bg-[var(--bb-depth-5)] text-[var(--bb-ink-100)] placeholder:text-[var(--bb-ink-40)] border-[var(--bb-glass-border)]"
        />

        <Input
          label="Telefone (opcional)"
          type="tel"
          placeholder="(11) 99999-9999"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="bg-[var(--bb-depth-5)] text-[var(--bb-ink-100)] placeholder:text-[var(--bb-ink-40)] border-[var(--bb-glass-border)]"
        />

        <Input
          label="Senha"
          type="password"
          placeholder="Minimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          className="bg-[var(--bb-depth-5)] text-[var(--bb-ink-100)] placeholder:text-[var(--bb-ink-40)] border-[var(--bb-glass-border)]"
        />

        <Input
          label="Confirmar senha"
          type="password"
          placeholder="Repita a senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          className="bg-[var(--bb-depth-5)] text-[var(--bb-ink-100)] placeholder:text-[var(--bb-ink-40)] border-[var(--bb-glass-border)]"
        />

        {/* Terms */}
        <label className="flex items-start gap-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-0.5 rounded"
          />
          <span>
            Aceito os{' '}
            <Link href="/termos" className="underline" style={{ color: 'var(--bb-brand)' }}>
              termos de uso
            </Link>{' '}
            e{' '}
            <Link href="/privacidade" className="underline" style={{ color: 'var(--bb-brand)' }}>
              politica de privacidade
            </Link>
          </span>
        </label>
        {errors.terms && (
          <p className="text-xs text-red-500">{errors.terms}</p>
        )}

        <Button type="submit" loading={submitting} disabled={!acceptTerms || !!oauthLoading} className="mt-2 w-full">
          Criar Minha Conta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: 'var(--bb-ink-60)' }}>
        Ja tem conta?{' '}
        <Link href="/login" className="hover:underline" style={{ color: 'var(--bb-brand)' }}>
          Fazer login
        </Link>
      </p>
    </div>
  );
}

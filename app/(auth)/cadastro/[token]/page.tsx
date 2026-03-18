'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/lib/api/auth.service';
import { validateInviteToken, useInviteToken as redeemInviteToken } from '@/lib/api/invite-tokens.service';
import { useToast } from '@/lib/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import type { InviteValidation, Role } from '@/lib/types';
import { ROLE_DASHBOARD } from '@/lib/types';

// ── Constants ───────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  professor: 'Professor',
  aluno_adulto: 'Aluno (Adulto)',
  aluno_teen: 'Aluno (Teen)',
  aluno_kids: 'Aluno (Kids)',
  responsavel: 'Responsável',
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
  const { toast } = useToast();

  const [validation, setValidation] = useState<InviteValidation | null>(null);
  const [loading, setLoading] = useState(true);

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
      const targetRole = inviteToken.target_role as Role;
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

        <Button type="submit" loading={submitting} disabled={!acceptTerms} className="mt-2 w-full">
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

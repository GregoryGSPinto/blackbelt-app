'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/api/auth.service';
import { useToast } from '@/lib/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const ROLE_OPTIONS = [
  { value: 'aluno_adulto', label: 'Aluno (Adulto)', icon: '🥋' },
  { value: 'aluno_teen', label: 'Aluno (Teen)', icon: '⚡' },
  { value: 'aluno_kids', label: 'Aluno (Kids)', icon: '🌟' },
  { value: 'professor', label: 'Professor', icon: '🎓' },
  { value: 'responsavel', label: 'Responsável', icon: '👨‍👩‍👧' },
] as const;

export default function CadastroPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Nome é obrigatório';
    if (!email.trim()) e.email = 'Email é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email inválido';
    if (!role) e.role = 'Selecione seu perfil';
    if (password.length < 6) e.password = 'Mínimo 6 caracteres';
    if (password !== confirmPassword) e.confirmPassword = 'Senhas não conferem';
    if (!acceptTerms) e.terms = 'Aceite os termos de uso';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register({ name, email, password });
      toast('Conta criada com sucesso! Faça login para acessar.', 'success');
      router.push('/login');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta.';
      toast(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="w-full max-w-md rounded-2xl p-8"
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
          Crie sua conta para acessar a academia
        </p>
      </div>

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

        {/* Role selection */}
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
            Eu sou... *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all"
                style={{
                  background: role === opt.value ? 'var(--bb-brand-surface)' : 'var(--bb-depth-5)',
                  border: `2px solid ${role === opt.value ? 'var(--bb-brand)' : 'var(--bb-glass-border)'}`,
                  color: role === opt.value ? 'var(--bb-brand)' : 'var(--bb-ink-80)',
                }}
              >
                <span className="text-lg">{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
          {errors.role && (
            <p className="mt-1 text-xs text-red-500">{errors.role}</p>
          )}
        </div>

        <Input
          label="Senha"
          type="password"
          placeholder="Mínimo 6 caracteres"
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
              política de privacidade
            </Link>
          </span>
        </label>
        {errors.terms && <p className="text-xs text-red-500">{errors.terms}</p>}

        <Button type="submit" loading={loading} disabled={!acceptTerms} className="mt-2 w-full">
          Criar Minha Conta
        </Button>
      </form>

      {/* Links */}
      <div className="mt-6 space-y-3 text-center">
        <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Já tem conta?{' '}
          <Link href="/login" className="hover:underline" style={{ color: 'var(--bb-brand)' }}>
            Fazer login
          </Link>
        </p>
        <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
          É dono de academia?{' '}
          <Link href="/cadastrar-academia" className="hover:underline" style={{ color: 'var(--bb-brand)' }}>
            Cadastre sua academia
          </Link>
        </p>
      </div>
    </div>
  );
}

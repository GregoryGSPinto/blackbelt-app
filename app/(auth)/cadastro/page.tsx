'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/api/auth.service';
import { useToast } from '@/lib/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function CadastroPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Nome é obrigatório';
    if (!email.trim()) e.email = 'Email é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email inválido';
    if (password.length < 6) e.password = 'Mínimo 6 caracteres';
    if (password !== confirmPassword) e.confirmPassword = 'Senhas não conferem';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register({ name, email, password });
      toast('Conta criada com sucesso! Faça login.', 'success');
      router.push('/login');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta.';
      toast(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg bg-[var(--bb-depth-3)] p-8" style={{ boxShadow: 'var(--bb-shadow-xl)', border: '1px solid var(--bb-glass-border)' }}>
      <h1 className="mb-1 text-center text-2xl font-bold text-[var(--bb-ink-100)]">BlackBelt</h1>
      <p className="mb-6 text-center text-sm text-[var(--bb-ink-60)]">Crie sua conta</p>

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

        <Button type="submit" loading={loading} className="mt-2 w-full">
          Criar conta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--bb-ink-60)]">
        Já tem conta?{' '}
        <Link href="/login" className="text-[var(--bb-brand)] hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}

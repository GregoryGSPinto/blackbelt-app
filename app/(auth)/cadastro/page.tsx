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
    <div className="rounded-lg bg-bb-gray-900 p-8 shadow-xl">
      <h1 className="mb-1 text-center text-2xl font-bold text-bb-white">BlackBelt</h1>
      <p className="mb-6 text-center text-sm text-bb-gray-500">Crie sua conta</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nome completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          className="bg-bb-gray-700 text-bb-white placeholder:text-bb-gray-500 border-bb-gray-700"
        />

        <Input
          label="Email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          className="bg-bb-gray-700 text-bb-white placeholder:text-bb-gray-500 border-bb-gray-700"
        />

        <Input
          label="Senha"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          className="bg-bb-gray-700 text-bb-white placeholder:text-bb-gray-500 border-bb-gray-700"
        />

        <Input
          label="Confirmar senha"
          type="password"
          placeholder="Repita a senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          className="bg-bb-gray-700 text-bb-white placeholder:text-bb-gray-500 border-bb-gray-700"
        />

        <Button type="submit" loading={loading} className="mt-2 w-full">
          Criar conta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-bb-gray-500">
        Já tem conta?{' '}
        <Link href="/login" className="text-bb-red hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}

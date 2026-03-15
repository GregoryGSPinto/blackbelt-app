'use client';

import { useState, type FormEvent } from 'react';
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Preencha email e senha.');
      return;
    }

    setLoading(true);
    try {
      const profiles = await login(email, password);

      if (profiles.length === 1) {
        const dashboard = ROLE_DASHBOARD[profiles[0].role] ?? '/dashboard';
        router.push(dashboard);
      } else {
        router.push('/selecionar-perfil');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login.';
      setError(message);
      toast(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg bg-bb-gray-900 p-8 shadow-xl">
      <h1 className="mb-1 text-center text-2xl font-bold text-bb-white">BlackBelt</h1>
      <p className="mb-6 text-center text-sm text-bb-gray-500">Entre na sua conta</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error && !email.trim() ? 'Campo obrigatório' : undefined}
          className="bg-bb-gray-700 text-bb-white placeholder:text-bb-gray-500 border-bb-gray-700"
        />

        <Input
          label="Senha"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error && !password.trim() ? 'Campo obrigatório' : undefined}
          className="bg-bb-gray-700 text-bb-white placeholder:text-bb-gray-500 border-bb-gray-700"
        />

        {error && email.trim() && password.trim() && (
          <p className="text-sm text-bb-error">{error}</p>
        )}

        <Button type="submit" loading={loading} className="mt-2 w-full">
          Entrar
        </Button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-2 text-sm">
        <Link href="/esqueci-senha" className="text-bb-gray-500 hover:text-bb-red transition-colors">
          Esqueci minha senha
        </Link>
        <Link href="/cadastro" className="text-bb-gray-500 hover:text-bb-red transition-colors">
          Criar conta
        </Link>
      </div>

      <div className="mt-6 border-t border-bb-gray-700 pt-4">
        <p className="text-center text-xs text-bb-gray-500">
          Demo: admin@blackbelt.com / senha123
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/lib/api/auth.service';
import { useToast } from '@/lib/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function EsqueciSenhaPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
      toast('Email de recuperação enviado!', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar email.';
      toast(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg bg-[var(--bb-depth-3)] p-8" style={{ boxShadow: 'var(--bb-shadow-xl)', border: '1px solid var(--bb-glass-border)' }}>
      <h1 className="mb-1 text-center text-2xl font-bold text-[var(--bb-ink-100)]">BlackBelt</h1>
      <p className="mb-6 text-center text-sm text-[var(--bb-ink-60)]">Recuperar senha</p>

      {sent ? (
        <div className="text-center">
          <p className="text-[var(--bb-success)]">Email de recuperação enviado!</p>
          <p className="mt-2 text-sm text-[var(--bb-ink-60)]">
            Verifique sua caixa de entrada e siga as instruções.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block text-sm text-[var(--bb-brand)] hover:underline"
          >
            Voltar ao login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[var(--bb-depth-5)] text-[var(--bb-ink-100)] placeholder:text-[var(--bb-ink-40)] border-[var(--bb-glass-border)]"
          />

          <Button type="submit" loading={loading} className="w-full">
            Enviar link de recuperação
          </Button>

          <Link
            href="/login"
            className="text-center text-sm text-[var(--bb-ink-60)] hover:text-[var(--bb-brand)] transition-colors"
          >
            Voltar ao login
          </Link>
        </form>
      )}
    </div>
  );
}

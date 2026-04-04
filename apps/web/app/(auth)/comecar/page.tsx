'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import Link from 'next/link';
import { useToast } from '@/lib/hooks/useToast';
import { Check } from 'lucide-react';

const MODALIDADES = [
  'Jiu-Jitsu', 'Muay Thai', 'Boxe', 'Karate', 'Taekwondo',
  'Judo', 'MMA', 'Capoeira', 'Kung Fu', 'Krav Maga',
];

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

const INPUT_CLASS = 'w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--bb-brand)]/30 focus:border-[var(--bb-brand)]';

export default function ComecarPage() {
  const { toast } = useToast();

  const [form, setForm] = useState({
    nomeAcademia: '',
    contatoNome: '',
    contatoEmail: '',
    contatoTelefone: '',
    cidade: '',
    estado: '',
    modalidades: [] as string[],
    quantidadeAlunos: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange(field: string) {
    return (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    };
  }

  function toggleModalidade(mod: string) {
    setForm((prev) => ({
      ...prev,
      modalidades: prev.modalidades.includes(mod)
        ? prev.modalidades.filter((m) => m !== mod)
        : [...prev.modalidades, mod],
    }));
  }

  function applyPhoneMask(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.nomeAcademia.trim()) e.nomeAcademia = 'Nome da academia e obrigatorio';
    if (!form.contatoNome.trim()) e.contatoNome = 'Seu nome e obrigatorio';
    if (!form.contatoEmail.trim()) e.contatoEmail = 'Email e obrigatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contatoEmail)) e.contatoEmail = 'Email invalido';
    if (!form.cidade.trim()) e.cidade = 'Cidade e obrigatoria';
    if (!form.estado) e.estado = 'Estado e obrigatorio';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          contatoTelefone: form.contatoTelefone.replace(/\D/g, '') || undefined,
          quantidadeAlunos: form.quantidadeAlunos ? Number(form.quantidadeAlunos) : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? 'Erro ao enviar dados.');
      }

      setSuccess(true);
      toast('Cadastro realizado com sucesso!', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar dados.';
      toast(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4" style={{ background: 'var(--bb-depth-1)' }}>
        <div
          className="w-full max-w-md rounded-2xl p-8 text-center"
          style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', boxShadow: 'var(--bb-shadow-xl)' }}
        >
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: 'var(--bb-brand-surface)' }}
          >
            <Check size={32} style={{ color: 'var(--bb-brand)' }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            Cadastro recebido!
          </h1>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--bb-ink-60)' }}>
            Nossa equipe vai entrar em contato em ate 24 horas para ativar seu trial gratuito de 7 dias.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block rounded-xl px-8 py-3 text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--bb-brand-gradient)' }}
          >
            Ir para Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12" style={{ background: 'var(--bb-depth-1)' }}>
      <div
        className="w-full max-w-lg rounded-2xl p-6 sm:p-8"
        style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', boxShadow: 'var(--bb-shadow-xl)' }}
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold" style={{ color: 'var(--bb-brand)', letterSpacing: '-0.03em' }}>
            BLACKBELT
          </h1>
          <div className="mx-auto mt-2" style={{ width: 40, height: 3, borderRadius: 2, background: 'var(--bb-brand)' }} />
          <p className="mt-4 text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
            Comece seu trial gratuito de 7 dias
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Sem cartao de credito. Cancele quando quiser.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nome da Academia */}
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Nome da academia *
            </label>
            <input
              type="text"
              placeholder="Ex: Guerreiros BJJ"
              value={form.nomeAcademia}
              onChange={handleChange('nomeAcademia')}
              className={INPUT_CLASS}
              style={{
                background: 'var(--bb-depth-2)',
                border: `1px solid ${errors.nomeAcademia ? '#ef4444' : 'var(--bb-glass-border)'}`,
                color: 'var(--bb-ink-100)',
              }}
            />
            {errors.nomeAcademia && <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.nomeAcademia}</p>}
          </div>

          {/* Nome do Responsavel */}
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Seu nome *
            </label>
            <input
              type="text"
              placeholder="Nome completo"
              value={form.contatoNome}
              onChange={handleChange('contatoNome')}
              className={INPUT_CLASS}
              style={{
                background: 'var(--bb-depth-2)',
                border: `1px solid ${errors.contatoNome ? '#ef4444' : 'var(--bb-glass-border)'}`,
                color: 'var(--bb-ink-100)',
              }}
            />
            {errors.contatoNome && <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.contatoNome}</p>}
          </div>

          {/* Email + Telefone */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                Email *
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={form.contatoEmail}
                onChange={handleChange('contatoEmail')}
                className={INPUT_CLASS}
                style={{
                  background: 'var(--bb-depth-2)',
                  border: `1px solid ${errors.contatoEmail ? '#ef4444' : 'var(--bb-glass-border)'}`,
                  color: 'var(--bb-ink-100)',
                }}
              />
              {errors.contatoEmail && <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.contatoEmail}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                Telefone
              </label>
              <input
                type="tel"
                placeholder="(11) 99999-9999"
                value={form.contatoTelefone}
                onChange={(e) => setForm((prev) => ({ ...prev, contatoTelefone: applyPhoneMask(e.target.value) }))}
                className={INPUT_CLASS}
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                  color: 'var(--bb-ink-100)',
                }}
              />
            </div>
          </div>

          {/* Cidade + Estado */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                Cidade *
              </label>
              <input
                type="text"
                placeholder="Sua cidade"
                value={form.cidade}
                onChange={handleChange('cidade')}
                className={INPUT_CLASS}
                style={{
                  background: 'var(--bb-depth-2)',
                  border: `1px solid ${errors.cidade ? '#ef4444' : 'var(--bb-glass-border)'}`,
                  color: 'var(--bb-ink-100)',
                }}
              />
              {errors.cidade && <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.cidade}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                Estado *
              </label>
              <select
                value={form.estado}
                onChange={handleChange('estado')}
                className={INPUT_CLASS}
                style={{
                  background: 'var(--bb-depth-2)',
                  border: `1px solid ${errors.estado ? '#ef4444' : 'var(--bb-glass-border)'}`,
                  color: form.estado ? 'var(--bb-ink-100)' : 'var(--bb-ink-40)',
                }}
              >
                <option value="">Selecione</option>
                {ESTADOS.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
              {errors.estado && <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.estado}</p>}
            </div>
          </div>

          {/* Modalidades */}
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Modalidades
            </label>
            <div className="flex flex-wrap gap-2">
              {MODALIDADES.map((mod) => (
                <button
                  key={mod}
                  type="button"
                  onClick={() => toggleModalidade(mod)}
                  className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                  style={{
                    background: form.modalidades.includes(mod) ? 'var(--bb-brand-surface)' : 'var(--bb-depth-2)',
                    border: `1px solid ${form.modalidades.includes(mod) ? 'rgba(239,68,68,0.3)' : 'var(--bb-glass-border)'}`,
                    color: form.modalidades.includes(mod) ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                  }}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>

          {/* Quantidade de Alunos */}
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Quantidade estimada de alunos
            </label>
            <input
              type="number"
              placeholder="Ex: 150"
              value={form.quantidadeAlunos}
              onChange={handleChange('quantidadeAlunos')}
              min="0"
              className={INPUT_CLASS}
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-100)',
              }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--bb-brand-gradient)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Enviando...
              </span>
            ) : (
              'COMECAR TRIAL GRATIS'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Ja tem conta?{' '}
          <Link href="/login" className="hover:underline" style={{ color: 'var(--bb-brand)' }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

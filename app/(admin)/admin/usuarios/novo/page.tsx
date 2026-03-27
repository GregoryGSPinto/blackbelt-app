'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrador' },
  { value: 'professor', label: 'Professor' },
  { value: 'recepcao', label: 'Recepcionista' },
  { value: 'aluno_adulto', label: 'Aluno Adulto' },
  { value: 'aluno_teen', label: 'Aluno Teen (13-17)' },
  { value: 'aluno_kids', label: 'Aluno Kids (<13)' },
  { value: 'responsavel', label: 'Responsavel' },
];

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  professor: 'Professor',
  recepcao: 'Recepcionista',
  aluno_adulto: 'Aluno Adulto',
  aluno_teen: 'Aluno Teen',
  aluno_kids: 'Aluno Kids',
  responsavel: 'Responsavel',
};

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function unformatPhone(value: string): string {
  return value.replace(/\D/g, '');
}

interface CreatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
}

export default function CriarUsuarioPage() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null);
  const [magicLink, setMagicLink] = useState('');
  const [emailError, setEmailError] = useState('');

  function validateEmail(val: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(val);
  }

  function resetForm() {
    setName('');
    setEmail('');
    setPhone('');
    setRole('');
    setCreatedUser(null);
    setMagicLink('');
    setEmailError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !role) {
      toast('Preencha todos os campos obrigatorios', 'error');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Email invalido');
      return;
    }
    setEmailError('');

    setSubmitting(true);
    try {
      const res = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: unformatPhone(phone) || undefined,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar usuario');
      }

      setCreatedUser(data.user);
      setMagicLink(data.magicLink || '');
      toast(data.message || 'Usuario criado com sucesso!', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopyLink() {
    if (!magicLink) return;
    navigator.clipboard.writeText(magicLink).then(() => {
      toast('Link copiado!', 'success');
    });
  }

  function handleWhatsApp() {
    if (!createdUser || !magicLink) return;
    const msg = encodeURIComponent(
      `Ola ${createdUser.name}! Seu acesso ao BlackBelt foi criado.\n\nAcesse pelo link:\n${magicLink}`,
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  }

  // ── Success state ──────────────────────────────────────────
  if (createdUser) {
    return (
      <div className="min-h-screen p-4 sm:p-6" style={{ background: 'var(--bb-depth-1)' }}>
        <div
          className="mx-auto max-w-lg rounded-xl p-6 sm:p-8"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            boxShadow: 'var(--bb-shadow-lg)',
          }}
        >
          {/* Success icon */}
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: 'rgba(34,197,94,0.15)' }}
          >
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#22c55e"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2
            className="mb-2 text-center text-xl font-bold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Usuario criado!
          </h2>

          {/* User info */}
          <div
            className="mb-6 rounded-lg p-4"
            style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}
          >
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--bb-ink-40)' }}>Nome</span>
                <span className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                  {createdUser.name}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--bb-ink-40)' }}>Email</span>
                <span className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                  {createdUser.email}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--bb-ink-40)' }}>Perfil</span>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ background: 'var(--bb-brand)', color: '#fff' }}
                >
                  {ROLE_LABEL[createdUser.role] ?? createdUser.role}
                </span>
              </div>
              {createdUser.phone && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--bb-ink-40)' }}>Telefone</span>
                  <span className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                    {formatPhone(createdUser.phone)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Magic link display */}
          {magicLink && (
            <div
              className="mb-4 rounded-lg p-3"
              style={{
                background: 'var(--bb-depth-3)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              <p className="mb-1.5 text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                Link de acesso (magic link)
              </p>
              <code
                className="block break-all rounded px-2 py-1.5 text-xs"
                style={{
                  background: 'var(--bb-depth-4)',
                  color: 'var(--bb-ink-80)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              >
                {magicLink}
              </code>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            {magicLink && (
              <>
                <button
                  onClick={handleCopyLink}
                  className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 min-h-[44px] text-sm font-semibold transition-all"
                  style={{
                    background: 'var(--bb-brand)',
                    color: '#fff',
                    borderRadius: 'var(--bb-radius-lg)',
                  }}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copiar Link
                </button>

                <button
                  onClick={handleWhatsApp}
                  className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 min-h-[44px] text-sm font-semibold transition-all"
                  style={{
                    background: '#25D366',
                    color: '#fff',
                    borderRadius: 'var(--bb-radius-lg)',
                  }}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Compartilhar no WhatsApp
                </button>
              </>
            )}

            <button
              onClick={resetForm}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 min-h-[44px] text-sm font-semibold transition-all"
              style={{
                background: 'var(--bb-depth-3)',
                color: 'var(--bb-ink-80)',
                border: '1px solid var(--bb-glass-border)',
                borderRadius: 'var(--bb-radius-lg)',
              }}
            >
              Criar Outro Usuario
            </button>

            <Link
              href="/admin/usuarios"
              className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 min-h-[44px] text-sm font-medium transition-all"
              style={{ color: 'var(--bb-brand)' }}
            >
              Voltar para Usuarios
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Form state ─────────────────────────────────────────────
  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ background: 'var(--bb-depth-1)' }}>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/usuarios"
          className="mb-2 inline-flex items-center gap-1 text-sm font-medium"
          style={{ color: 'var(--bb-ink-60)' }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </Link>
        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
          Criar Usuario
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Cadastre um novo usuario e envie o convite de acesso via magic link
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-lg space-y-5 rounded-xl p-6"
        style={{
          background: 'var(--bb-depth-2)',
          border: '1px solid var(--bb-glass-border)',
          borderRadius: 'var(--bb-radius-lg)',
          boxShadow: 'var(--bb-shadow-lg)',
        }}
      >
        {/* Nome completo */}
        <div>
          <label
            className="mb-1.5 block text-sm font-medium"
            style={{ color: 'var(--bb-ink-80)' }}
          >
            Nome completo *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Joao Silva"
            className="w-full rounded-lg px-3 py-2.5 min-h-[44px] text-sm outline-none transition-colors"
            style={{
              background: 'var(--bb-depth-3)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 'var(--bb-radius-sm)',
              color: 'var(--bb-ink-100)',
            }}
          />
        </div>

        {/* Email */}
        <div>
          <label
            className="mb-1.5 block text-sm font-medium"
            style={{ color: 'var(--bb-ink-80)' }}
          >
            Email *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError('');
            }}
            onBlur={() => {
              if (email && !validateEmail(email)) {
                setEmailError('Email invalido');
              }
            }}
            placeholder="email@exemplo.com"
            className="w-full rounded-lg px-3 py-2.5 min-h-[44px] text-sm outline-none transition-colors"
            style={{
              background: 'var(--bb-depth-3)',
              border: emailError
                ? '1px solid #ef4444'
                : '1px solid var(--bb-glass-border)',
              borderRadius: 'var(--bb-radius-sm)',
              color: 'var(--bb-ink-100)',
            }}
          />
          {emailError && (
            <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>
              {emailError}
            </p>
          )}
        </div>

        {/* Telefone (optional) */}
        <div>
          <label
            className="mb-1.5 block text-sm font-medium"
            style={{ color: 'var(--bb-ink-80)' }}
          >
            Telefone
            <span className="ml-1 font-normal" style={{ color: 'var(--bb-ink-40)' }}>
              (opcional)
            </span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="(11) 99999-9999"
            className="w-full rounded-lg px-3 py-2.5 min-h-[44px] text-sm outline-none transition-colors"
            style={{
              background: 'var(--bb-depth-3)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 'var(--bb-radius-sm)',
              color: 'var(--bb-ink-100)',
            }}
          />
        </div>

        {/* Perfil / Role */}
        <div>
          <label
            className="mb-1.5 block text-sm font-medium"
            style={{ color: 'var(--bb-ink-80)' }}
          >
            Perfil *
          </label>
          <select
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg px-3 py-2.5 min-h-[44px] text-sm outline-none transition-colors"
            style={{
              background: 'var(--bb-depth-3)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 'var(--bb-radius-sm)',
              color: role ? 'var(--bb-ink-100)' : 'var(--bb-ink-40)',
            }}
          >
            <option value="" disabled>
              Selecione o perfil
            </option>
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 min-h-[44px] text-sm font-semibold transition-all disabled:opacity-50"
          style={{
            background: 'var(--bb-brand)',
            color: '#fff',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          {submitting ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Criando...
            </>
          ) : (
            'Criar Usuario e Gerar Link'
          )}
        </button>
      </form>
    </div>
  );
}

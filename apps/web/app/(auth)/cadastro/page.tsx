'use client';

import { useState, useEffect, useCallback, useMemo, type FormEvent, type ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/lib/hooks/useToast';

// ── Types ──────────────────────────────────────────────────────────────

interface StepOneData {
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
}

interface StepTwoData {
  senha: string;
  confirmarSenha: string;
  responsavelNome: string;
  responsavelEmail: string;
  responsavelTelefone: string;
  responsavelParentesco: string;
}

interface InviteInfo {
  academyName: string;
  academyCity: string;
  role: string;
  inviterName: string;
}

type PasswordRule = {
  label: string;
  test: (pw: string) => boolean;
};

// ── Constants ──────────────────────────────────────────────────────────

const PARENTESCO_OPTIONS = [
  { value: '', label: 'Selecione...' },
  { value: 'pai', label: 'Pai' },
  { value: 'mae', label: 'Mae' },
  { value: 'avo', label: 'Avo/Avo' },
  { value: 'tio', label: 'Tio/Tia' },
  { value: 'responsavel_legal', label: 'Responsavel Legal' },
  { value: 'outro', label: 'Outro' },
];

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'Minimo 8 caracteres', test: (pw) => pw.length >= 8 },
  { label: 'Uma letra maiuscula', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'Uma letra minuscula', test: (pw) => /[a-z]/.test(pw) },
  { label: 'Um numero', test: (pw) => /\d/.test(pw) },
  { label: 'Um caractere especial (!@#$%)', test: (pw) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw) },
];

const INPUT_STYLE = {
  background: 'var(--bb-depth-2)',
  border: '1px solid var(--bb-glass-border)',
  color: 'var(--bb-ink-100)',
} as const;

const INPUT_CLASS = 'w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--bb-brand)]/30 focus:border-[var(--bb-brand)]';

const BUTTON_PRIMARY_STYLE = {
  background: 'var(--bb-brand-gradient, var(--bb-brand))',
} as const;

const BUTTON_PRIMARY_CLASS = 'w-full rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';

// ── Helpers ────────────────────────────────────────────────────────────

function capitalizeName(value: string): string {
  const lowercaseWords = new Set(['da', 'de', 'do', 'das', 'dos', 'e']);
  return value
    .split(' ')
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index > 0 && lowercaseWords.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

function applyPhoneMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function applyDateMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function parseDateBR(dateBR: string): Date | null {
  const match = dateBR.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    d.getFullYear() !== Number(year) ||
    d.getMonth() !== Number(month) - 1 ||
    d.getDate() !== Number(day)
  ) {
    return null;
  }
  return d;
}

function calcAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getPasswordStrength(pw: string): number {
  if (!pw) return 0;
  const passed = PASSWORD_RULES.filter((r) => r.test(pw)).length;
  return Math.round((passed / PASSWORD_RULES.length) * 100);
}

function getStrengthLabel(pct: number): { label: string; color: string } {
  if (pct <= 20) return { label: 'Muito fraca', color: '#ef4444' };
  if (pct <= 40) return { label: 'Fraca', color: '#f97316' };
  if (pct <= 60) return { label: 'Media', color: '#eab308' };
  if (pct <= 80) return { label: 'Forte', color: '#22c55e' };
  return { label: 'Muito forte', color: '#16a34a' };
}

// ── Component ──────────────────────────────────────────────────────────

export default function CadastroPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const inviteToken = searchParams.get('invite');

  // Step state
  const [step, setStep] = useState(1);

  // Step 1
  const [stepOne, setStepOne] = useState<StepOneData>({
    nome: '',
    email: '',
    telefone: '',
    dataNascimento: '',
  });

  // Step 2
  const [stepTwo, setStepTwo] = useState<StepTwoData>({
    senha: '',
    confirmarSenha: '',
    responsavelNome: '',
    responsavelEmail: '',
    responsavelTelefone: '',
    responsavelParentesco: '',
  });

  // Step 3
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  // Global
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Invite
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [inviteLoading, setInviteLoading] = useState(!!inviteToken);

  // ── Fetch invite ─────────────────────────────────────────────────

  useEffect(() => {
    if (!inviteToken) return;
    setInviteLoading(true);

    // Mock invite fetch for now
    const timer = setTimeout(() => {
      setInviteInfo({
        academyName: 'Guerreiros BJJ',
        academyCity: 'Sao Paulo, SP',
        role: 'Aluno',
        inviterName: 'Roberto Silva',
      });
      setInviteLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [inviteToken]);

  // ── Computed values ──────────────────────────────────────────────

  const birthDate = useMemo(() => parseDateBR(stepOne.dataNascimento), [stepOne.dataNascimento]);
  const age = useMemo(() => (birthDate ? calcAge(birthDate) : null), [birthDate]);
  const isMinor = useMemo(() => age !== null && age < 18, [age]);
  const passwordStrength = useMemo(() => getPasswordStrength(stepTwo.senha), [stepTwo.senha]);
  const strengthInfo = useMemo(() => getStrengthLabel(passwordStrength), [passwordStrength]);

  // ── Handlers ─────────────────────────────────────────────────────

  const handleStepOneChange = useCallback(
    (field: keyof StepOneData) => (e: ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      if (field === 'nome') value = capitalizeName(value);
      if (field === 'telefone') value = applyPhoneMask(value);
      if (field === 'dataNascimento') value = applyDateMask(value);
      setStepOne((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const handleStepTwoChange = useCallback(
    (field: keyof StepTwoData) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      let value = e.target.value;
      if (field === 'responsavelNome') value = capitalizeName(value);
      if (field === 'responsavelTelefone') value = applyPhoneMask(value);
      setStepTwo((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [],
  );

  // ── Validation ───────────────────────────────────────────────────

  function validateStepOne(): boolean {
    const e: Record<string, string> = {};
    if (!stepOne.nome.trim()) e.nome = 'Nome e obrigatorio';
    else if (stepOne.nome.trim().split(' ').length < 2) e.nome = 'Informe nome e sobrenome';
    if (!stepOne.email.trim()) e.email = 'Email e obrigatorio';
    else if (!isValidEmail(stepOne.email)) e.email = 'Email invalido';
    if (stepOne.telefone && stepOne.telefone.replace(/\D/g, '').length < 10) {
      e.telefone = 'Telefone incompleto';
    }
    if (!stepOne.dataNascimento.trim()) e.dataNascimento = 'Data de nascimento e obrigatoria';
    else if (!birthDate) e.dataNascimento = 'Data invalida (DD/MM/AAAA)';
    else if (birthDate > new Date()) e.dataNascimento = 'Data nao pode ser futura';
    else if (age !== null && age < 5) e.dataNascimento = 'Idade minima: 5 anos';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStepTwo(): boolean {
    const e: Record<string, string> = {};
    if (!stepTwo.senha) e.senha = 'Senha e obrigatoria';
    else if (passwordStrength < 60) e.senha = 'Senha muito fraca';
    if (!stepTwo.confirmarSenha) e.confirmarSenha = 'Confirme a senha';
    else if (stepTwo.senha !== stepTwo.confirmarSenha) e.confirmarSenha = 'Senhas nao conferem';

    if (isMinor) {
      if (!stepTwo.responsavelNome.trim()) e.responsavelNome = 'Nome do responsavel e obrigatorio';
      if (!stepTwo.responsavelEmail.trim()) e.responsavelEmail = 'Email do responsavel e obrigatorio';
      else if (!isValidEmail(stepTwo.responsavelEmail)) e.responsavelEmail = 'Email invalido';
      if (!stepTwo.responsavelParentesco) e.responsavelParentesco = 'Selecione o parentesco';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Navigation ───────────────────────────────────────────────────

  function goNext() {
    if (step === 1 && validateStepOne()) setStep(2);
    else if (step === 2 && validateStepTwo()) setStep(3);
  }

  function goBack() {
    if (step > 1) setStep(step - 1);
  }

  // ── Submit ───────────────────────────────────────────────────────

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!acceptTerms || !acceptPrivacy) {
      setErrors({ terms: 'Aceite os termos e a politica de privacidade' });
      return;
    }

    setLoading(true);
    try {
      const body = {
        nome: stepOne.nome.trim(),
        email: stepOne.email.trim().toLowerCase(),
        telefone: stepOne.telefone.replace(/\D/g, '') || undefined,
        dataNascimento: birthDate?.toISOString().split('T')[0],
        senha: stepTwo.senha,
        inviteToken: inviteToken || undefined,
        responsavel: isMinor
          ? {
              nome: stepTwo.responsavelNome.trim(),
              email: stepTwo.responsavelEmail.trim().toLowerCase(),
              telefone: stepTwo.responsavelTelefone.replace(/\D/g, '') || undefined,
              parentesco: stepTwo.responsavelParentesco,
            }
          : undefined,
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? 'Erro ao criar conta.');
      }

      toast('Conta criada com sucesso!', 'success');
      router.push('/login');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta.';
      toast(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  // ── Progress bar ─────────────────────────────────────────────────

  const progressPct = (step / 3) * 100;

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div
      className="w-full max-w-md rounded-2xl p-6 sm:p-8"
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

      {/* Invite academy card */}
      {inviteToken && (
        <div
          className="mb-5 rounded-xl p-4"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
          }}
        >
          {inviteLoading ? (
            <div className="flex items-center justify-center py-2">
              <div
                className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
                style={{ borderColor: 'var(--bb-brand)', borderTopColor: 'transparent' }}
              />
              <span className="ml-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                Carregando convite...
              </span>
            </div>
          ) : inviteInfo ? (
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-sm font-black text-white"
                style={{ background: 'var(--bb-brand-gradient, var(--bb-brand))' }}
              >
                BB
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                  {inviteInfo.academyName}
                </p>
                <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  {inviteInfo.academyCity} &middot; Convite de {inviteInfo.inviterName}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs" style={{ color: 'var(--bb-ink-40)' }}>
          <span>Etapa {step} de 3</span>
          <span>
            {step === 1 && 'Dados pessoais'}
            {step === 2 && 'Senha'}
            {step === 3 && 'Confirmacao'}
          </span>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full"
          style={{ background: 'var(--bb-depth-2)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progressPct}%`,
              background: 'var(--bb-brand-gradient, var(--bb-brand))',
            }}
          />
        </div>
      </div>

      {/* Step 1: Personal Data */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          {/* Nome */}
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Nome completo *
            </label>
            <input
              type="text"
              placeholder="Seu nome completo"
              value={stepOne.nome}
              onChange={handleStepOneChange('nome')}
              autoComplete="name"
              className={INPUT_CLASS}
              style={{
                ...INPUT_STYLE,
                ...(errors.nome ? { borderColor: '#ef4444' } : {}),
              }}
            />
            {errors.nome && (
              <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.nome}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Email *
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={stepOne.email}
              onChange={handleStepOneChange('email')}
              autoComplete="email"
              className={INPUT_CLASS}
              style={{
                ...INPUT_STYLE,
                ...(errors.email ? { borderColor: '#ef4444' } : {}),
              }}
            />
            {errors.email && (
              <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.email}</p>
            )}
          </div>

          {/* Telefone */}
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Telefone
            </label>
            <input
              type="tel"
              placeholder="(11) 99999-9999"
              value={stepOne.telefone}
              onChange={handleStepOneChange('telefone')}
              autoComplete="tel"
              className={INPUT_CLASS}
              style={{
                ...INPUT_STYLE,
                ...(errors.telefone ? { borderColor: '#ef4444' } : {}),
              }}
            />
            {errors.telefone && (
              <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.telefone}</p>
            )}
          </div>

          {/* Data de Nascimento */}
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Data de nascimento *
            </label>
            <input
              type="text"
              placeholder="DD/MM/AAAA"
              value={stepOne.dataNascimento}
              onChange={handleStepOneChange('dataNascimento')}
              autoComplete="bday"
              inputMode="numeric"
              maxLength={10}
              className={INPUT_CLASS}
              style={{
                ...INPUT_STYLE,
                ...(errors.dataNascimento ? { borderColor: '#ef4444' } : {}),
              }}
            />
            {errors.dataNascimento && (
              <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.dataNascimento}</p>
            )}
            {age !== null && age >= 5 && (
              <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                {age} anos {isMinor ? '(menor de idade - responsavel sera solicitado)' : ''}
              </p>
            )}
          </div>

          {/* Next button */}
          <button
            type="button"
            onClick={goNext}
            className={BUTTON_PRIMARY_CLASS + ' mt-2'}
            style={BUTTON_PRIMARY_STYLE}
          >
            Continuar
          </button>
        </div>
      )}

      {/* Step 2: Password + Guardian */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          {/* Senha */}
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Senha *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Crie uma senha forte"
                value={stepTwo.senha}
                onChange={handleStepTwoChange('senha')}
                autoComplete="new-password"
                className={INPUT_CLASS + ' pr-12'}
                style={{
                  ...INPUT_STYLE,
                  ...(errors.senha ? { borderColor: '#ef4444' } : {}),
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium"
                style={{ color: 'var(--bb-ink-40)' }}
                tabIndex={-1}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {errors.senha && (
              <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.senha}</p>
            )}
          </div>

          {/* Password strength meter */}
          {stepTwo.senha.length > 0 && (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  Forca da senha
                </span>
                <span className="text-xs font-medium" style={{ color: strengthInfo.color }}>
                  {strengthInfo.label}
                </span>
              </div>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full"
                style={{ background: 'var(--bb-depth-2)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${passwordStrength}%`,
                    background: strengthInfo.color,
                  }}
                />
              </div>

              {/* Rules list */}
              <ul className="mt-3 space-y-1.5">
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(stepTwo.senha);
                  return (
                    <li
                      key={rule.label}
                      className="flex items-center gap-2 text-xs"
                      style={{ color: passed ? '#22c55e' : 'var(--bb-ink-40)' }}
                    >
                      <span className="flex-shrink-0 text-xs">
                        {passed ? '\u2713' : '\u2022'}
                      </span>
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Confirmar senha */}
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Confirmar senha *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repita a senha"
                value={stepTwo.confirmarSenha}
                onChange={handleStepTwoChange('confirmarSenha')}
                autoComplete="new-password"
                className={INPUT_CLASS + ' pr-12'}
                style={{
                  ...INPUT_STYLE,
                  ...(errors.confirmarSenha ? { borderColor: '#ef4444' } : {}),
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium"
                style={{ color: 'var(--bb-ink-40)' }}
                tabIndex={-1}
              >
                {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {errors.confirmarSenha && (
              <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.confirmarSenha}</p>
            )}
            {stepTwo.confirmarSenha && stepTwo.senha === stepTwo.confirmarSenha && (
              <p className="mt-1 text-xs" style={{ color: '#22c55e' }}>Senhas conferem</p>
            )}
          </div>

          {/* Guardian fields (if minor) */}
          {isMinor && (
            <div
              className="mt-2 rounded-xl p-4"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              <p className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                Dados do responsavel
              </p>
              <p className="mb-4 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                Por ser menor de 18 anos, e necessario informar os dados de um responsavel legal.
              </p>

              <div className="flex flex-col gap-3">
                {/* Responsavel Nome */}
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                    Nome do responsavel *
                  </label>
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={stepTwo.responsavelNome}
                    onChange={handleStepTwoChange('responsavelNome')}
                    className={INPUT_CLASS}
                    style={{
                      ...INPUT_STYLE,
                      ...(errors.responsavelNome ? { borderColor: '#ef4444' } : {}),
                    }}
                  />
                  {errors.responsavelNome && (
                    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.responsavelNome}</p>
                  )}
                </div>

                {/* Responsavel Email */}
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                    Email do responsavel *
                  </label>
                  <input
                    type="email"
                    placeholder="responsavel@email.com"
                    value={stepTwo.responsavelEmail}
                    onChange={handleStepTwoChange('responsavelEmail')}
                    className={INPUT_CLASS}
                    style={{
                      ...INPUT_STYLE,
                      ...(errors.responsavelEmail ? { borderColor: '#ef4444' } : {}),
                    }}
                  />
                  {errors.responsavelEmail && (
                    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.responsavelEmail}</p>
                  )}
                </div>

                {/* Responsavel Telefone */}
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                    Telefone do responsavel
                  </label>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={stepTwo.responsavelTelefone}
                    onChange={handleStepTwoChange('responsavelTelefone')}
                    className={INPUT_CLASS}
                    style={INPUT_STYLE}
                  />
                </div>

                {/* Parentesco */}
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                    Parentesco *
                  </label>
                  <select
                    value={stepTwo.responsavelParentesco}
                    onChange={handleStepTwoChange('responsavelParentesco')}
                    className={INPUT_CLASS}
                    style={{
                      ...INPUT_STYLE,
                      ...(errors.responsavelParentesco ? { borderColor: '#ef4444' } : {}),
                    }}
                  >
                    {PARENTESCO_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.responsavelParentesco && (
                    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.responsavelParentesco}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={goBack}
              className="w-full rounded-xl py-3.5 text-sm font-medium transition-all hover:opacity-80"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-80)',
              }}
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={goNext}
              className={BUTTON_PRIMARY_CLASS}
              style={BUTTON_PRIMARY_STYLE}
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Summary */}
          <div
            className="space-y-3 rounded-xl p-4"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
              Confira seus dados
            </p>

            <div className="space-y-2">
              <SummaryRow label="Nome" value={stepOne.nome} />
              <SummaryRow label="Email" value={stepOne.email} />
              {stepOne.telefone && <SummaryRow label="Telefone" value={stepOne.telefone} />}
              <SummaryRow label="Nascimento" value={stepOne.dataNascimento} />
              {age !== null && <SummaryRow label="Idade" value={`${age} anos`} />}
            </div>

            {isMinor && stepTwo.responsavelNome && (
              <>
                <div className="my-2" style={{ borderTop: '1px solid var(--bb-glass-border)' }} />
                <p className="text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>
                  Responsavel
                </p>
                <div className="space-y-2">
                  <SummaryRow label="Nome" value={stepTwo.responsavelNome} />
                  <SummaryRow label="Email" value={stepTwo.responsavelEmail} />
                  {stepTwo.responsavelTelefone && (
                    <SummaryRow label="Telefone" value={stepTwo.responsavelTelefone} />
                  )}
                  <SummaryRow
                    label="Parentesco"
                    value={
                      PARENTESCO_OPTIONS.find((o) => o.value === stepTwo.responsavelParentesco)
                        ?.label ?? stepTwo.responsavelParentesco
                    }
                  />
                </div>
              </>
            )}
          </div>

          {/* Terms checkboxes */}
          <div className="space-y-3">
            <label className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked);
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.terms;
                    return next;
                  });
                }}
                className="mt-0.5 h-4 w-4 rounded"
                style={{ accentColor: 'var(--bb-brand)' }}
              />
              <span>
                Li e aceito os{' '}
                <Link href="/termos" className="underline" style={{ color: 'var(--bb-brand)' }} target="_blank">
                  Termos de Uso
                </Link>
                {' *'}
              </span>
            </label>

            <label className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              <input
                type="checkbox"
                checked={acceptPrivacy}
                onChange={(e) => {
                  setAcceptPrivacy(e.target.checked);
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.terms;
                    return next;
                  });
                }}
                className="mt-0.5 h-4 w-4 rounded"
                style={{ accentColor: 'var(--bb-brand)' }}
              />
              <span>
                Li e aceito a{' '}
                <Link href="/privacidade" className="underline" style={{ color: 'var(--bb-brand)' }} target="_blank">
                  Politica de Privacidade
                </Link>
                {' *'}
              </span>
            </label>

            {errors.terms && (
              <p className="text-xs" style={{ color: '#ef4444' }}>{errors.terms}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={goBack}
              className="w-full rounded-xl py-3.5 text-sm font-medium transition-all hover:opacity-80"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-80)',
              }}
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={loading || !acceptTerms || !acceptPrivacy}
              className={BUTTON_PRIMARY_CLASS}
              style={BUTTON_PRIMARY_STYLE}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
                    style={{ borderColor: 'white', borderTopColor: 'transparent' }}
                  />
                  Criando conta...
                </span>
              ) : (
                'CRIAR MINHA CONTA'
              )}
            </button>
          </div>
        </form>
      )}

      {/* Login link */}
      <p className="mt-6 text-center text-sm" style={{ color: 'var(--bb-ink-60)' }}>
        Ja tem conta?{' '}
        <Link href="/login" className="hover:underline" style={{ color: 'var(--bb-brand)' }}>
          Entrar
        </Link>
      </p>
    </div>
  );
}

// ── Summary Row ────────────────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span style={{ color: 'var(--bb-ink-40)' }}>{label}</span>
      <span className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>
        {value}
      </span>
    </div>
  );
}

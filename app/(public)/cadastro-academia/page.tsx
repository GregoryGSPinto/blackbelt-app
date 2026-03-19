'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Building2,
  Users,
  Dumbbell,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';

// ─── Constants ───────────────────────────────────────────────

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO',
];

const MODALIDADES = [
  'BJJ', 'Muay Thai', 'Judo', 'MMA', 'Boxe', 'Karate',
  'Taekwondo', 'Capoeira', 'Kung Fu', 'Krav Maga',
];

const QTD_ALUNOS = [
  { value: 'ate-30', label: 'Ate 30' },
  { value: '31-80', label: '31-80' },
  { value: '81-150', label: '81-150' },
  { value: '151-300', label: '151-300' },
  { value: '300+', label: '300+' },
];

const DIAS_SEMANA = [
  { value: 'seg', label: 'Seg' },
  { value: 'ter', label: 'Ter' },
  { value: 'qua', label: 'Qua' },
  { value: 'qui', label: 'Qui' },
  { value: 'sex', label: 'Sex' },
  { value: 'sab', label: 'Sab' },
];

// ─── Types ───────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4;

interface WizardState {
  // Step 1 — Seus dados
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  confirmarSenha: string;

  // Step 2 — Sua academia
  nomeAcademia: string;
  cidade: string;
  estado: string;
  modalidades: string[];
  qtdAlunos: string;

  // Step 3 — Primeira turma (optional)
  nomeTurma: string;
  turmaModalidade: string;
  diasSemana: string[];
  horarioInicio: string;
  horarioFim: string;
  capacidade: string;
}

const INITIAL_STATE: WizardState = {
  nome: '',
  email: '',
  telefone: '',
  senha: '',
  confirmarSenha: '',
  nomeAcademia: '',
  cidade: '',
  estado: '',
  modalidades: [],
  qtdAlunos: '',
  nomeTurma: '',
  turmaModalidade: '',
  diasSemana: [],
  horarioInicio: '',
  horarioFim: '',
  capacidade: '',
};

// ─── Helpers ─────────────────────────────────────────────────

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function hasMinLength(s: string): boolean {
  return s.length >= 8;
}
function hasUppercase(s: string): boolean {
  return /[A-Z]/.test(s);
}
function hasNumber(s: string): boolean {
  return /\d/.test(s);
}

// ─── Styles ──────────────────────────────────────────────────

const inputCls =
  'w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--bb-brand)]/30 transition-colors';
const inputStyle: React.CSSProperties = {
  background: 'var(--bb-depth-2)',
  color: 'var(--bb-ink-100)',
  border: '1px solid var(--bb-glass-border)',
};
const labelCls = 'mb-1 block text-sm font-medium';
const labelStyle: React.CSSProperties = { color: 'var(--bb-ink-80)' };

// ─── Component ───────────────────────────────────────────────

export default function CadastroAcademiaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<WizardState>(INITIAL_STATE);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ─── Field updater ────────────────────────────────────────

  const updateField = useCallback(
    <K extends keyof WizardState>(key: K, value: WizardState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const toggleArrayField = useCallback(
    (key: 'modalidades' | 'diasSemana', value: string) => {
      setForm((prev) => {
        const arr = prev[key];
        const next = arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value];
        return { ...prev, [key]: next };
      });
    },
    [],
  );

  // ─── Password validation state ────────────────────────────

  const pwChecks = useMemo(
    () => ({
      length: hasMinLength(form.senha),
      upper: hasUppercase(form.senha),
      number: hasNumber(form.senha),
    }),
    [form.senha],
  );

  // ─── Validation ───────────────────────────────────────────

  function validateStep1(): boolean {
    if (!form.nome.trim()) {
      toast('Nome completo e obrigatorio', 'error');
      return false;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast('Insira um email valido', 'error');
      return false;
    }
    if (form.telefone.replace(/\D/g, '').length < 10) {
      toast('Telefone invalido', 'error');
      return false;
    }
    if (!pwChecks.length || !pwChecks.upper || !pwChecks.number) {
      toast('Senha nao atende os requisitos', 'error');
      return false;
    }
    if (form.senha !== form.confirmarSenha) {
      toast('As senhas nao conferem', 'error');
      return false;
    }
    return true;
  }

  function validateStep2(): boolean {
    if (!form.nomeAcademia.trim()) {
      toast('Nome da academia e obrigatorio', 'error');
      return false;
    }
    if (!form.cidade.trim()) {
      toast('Cidade e obrigatoria', 'error');
      return false;
    }
    if (!form.estado) {
      toast('Selecione o estado', 'error');
      return false;
    }
    if (form.modalidades.length === 0) {
      toast('Selecione pelo menos uma modalidade', 'error');
      return false;
    }
    if (!form.qtdAlunos) {
      toast('Selecione a quantidade de alunos', 'error');
      return false;
    }
    return true;
  }

  // ─── Lead submit (mock-safe) ──────────────────────────────

  async function submitLead(): Promise<void> {
    setSubmitting(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } catch {
      // silently ignore — mock mode or network error
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Navigation ───────────────────────────────────────────

  function handleNext() {
    if (step === 1) {
      if (!validateStep1()) return;
      void submitLead();
      setStep(2);
    } else if (step === 2) {
      if (!validateStep2()) return;
      void submitLead();
      setStep(3);
    } else if (step === 3) {
      void submitLead();
      setStep(4);
    }
  }

  function handleBack() {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  }

  function handleSkip() {
    if (step === 3) {
      void submitLead();
      setStep(4);
    }
  }

  // ─── Password check row ──────────────────────────────────

  function PwCheck({ ok, label }: { ok: boolean; label: string }) {
    return (
      <div className="flex items-center gap-1.5">
        <div
          className="flex h-4 w-4 items-center justify-center rounded-full transition-colors"
          style={{
            background: ok ? 'rgba(34, 197, 94, 0.15)' : 'var(--bb-depth-2)',
            border: ok ? '1px solid #22c55e' : '1px solid var(--bb-glass-border)',
          }}
        >
          {ok && <Check size={10} style={{ color: '#22c55e' }} />}
        </div>
        <span
          className="text-xs transition-colors"
          style={{ color: ok ? '#22c55e' : 'var(--bb-ink-40)' }}
        >
          {label}
        </span>
      </div>
    );
  }

  // ─── Progress bar ─────────────────────────────────────────

  const progressPercent = ((step) / 4) * 100;

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div
      className="flex min-h-screen flex-col overflow-x-hidden"
      style={{ background: 'var(--bb-depth-1)' }}
    >
      {/* ── Header ── */}
      <header
        className="flex items-center justify-center px-4 py-4 sm:px-6 lg:px-8"
        style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
      >
        <Link href="/landing" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black text-white"
            style={{ background: 'var(--bb-brand-gradient)' }}
          >
            BB
          </span>
          <span style={{ color: 'var(--bb-ink-100)' }}>
            Black<span style={{ color: 'var(--bb-brand)' }}>Belt</span>
          </span>
        </Link>
      </header>

      {/* ── Progress bar ── */}
      <div className="px-4 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
              Passo {step} de 4
            </span>
            <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
              {step === 1 && 'Seus dados'}
              {step === 2 && 'Sua academia'}
              {step === 3 && 'Primeira turma'}
              {step === 4 && 'Tudo pronto!'}
            </span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full"
            style={{ background: 'var(--bb-depth-3)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPercent}%`,
                background: 'var(--bb-brand-gradient)',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex flex-1 flex-col items-center px-4 py-8 sm:px-6 lg:px-8">
        <div
          className="w-full max-w-2xl rounded-2xl p-6 sm:p-8"
          style={{
            background: 'var(--bb-depth-3)',
            boxShadow: 'var(--bb-shadow-xl)',
            border: '1px solid var(--bb-glass-border)',
          }}
        >
          {/* ════════════════════════════════════════════════ */}
          {/* STEP 1 — Seus dados                            */}
          {/* ════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                  Seus dados
                </h2>
                <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                  Crie sua conta para comecar a usar o BlackBelt.
                </p>
              </div>

              {/* Social buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => toast('Login com Google em breve!', 'info')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-medium transition-all duration-200 sm:text-sm"
                  style={{
                    border: '1px solid var(--bb-glass-border)',
                    background: 'var(--bb-depth-2)',
                    color: 'var(--bb-ink-80)',
                  }}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => toast('Login com Apple em breve!', 'info')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-medium transition-all duration-200 sm:text-sm"
                  style={{
                    border: '1px solid var(--bb-glass-border)',
                    background: 'var(--bb-depth-2)',
                    color: 'var(--bb-ink-80)',
                  }}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.53-3.23 0-1.44.62-2.2.44-3.06-.4C3.79 16.17 4.36 9.51 8.82 9.28c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.3 4.12zM12.03 9.2C11.88 6.88 13.77 5 15.96 4.82c.29 2.65-2.4 4.63-3.93 4.38z" />
                  </svg>
                  Apple
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1" style={{ background: 'var(--bb-glass-border)' }} />
                <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>ou</span>
                <div className="h-px flex-1" style={{ background: 'var(--bb-glass-border)' }} />
              </div>

              {/* Nome */}
              <div>
                <label className={labelCls} style={labelStyle}>Nome completo *</label>
                <input
                  value={form.nome}
                  onChange={(e) => updateField('nome', e.target.value)}
                  placeholder="Seu nome completo"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>

              {/* Email */}
              <div>
                <label className={labelCls} style={labelStyle}>Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="seu@email.com"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>

              {/* Telefone */}
              <div>
                <label className={labelCls} style={labelStyle}>Telefone *</label>
                <input
                  type="tel"
                  value={form.telefone}
                  onChange={(e) => updateField('telefone', formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>

              {/* Senha */}
              <div>
                <label className={labelCls} style={labelStyle}>Senha *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.senha}
                    onChange={(e) => updateField('senha', e.target.value)}
                    placeholder="Minimo 8 caracteres"
                    className={inputCls}
                    style={{ ...inputStyle, paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--bb-ink-40)' }}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* Password requirements */}
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  <PwCheck ok={pwChecks.length} label="8+ caracteres" />
                  <PwCheck ok={pwChecks.upper} label="Maiuscula" />
                  <PwCheck ok={pwChecks.number} label="Numero" />
                </div>
              </div>

              {/* Confirmar senha */}
              <div>
                <label className={labelCls} style={labelStyle}>Confirmar senha *</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmarSenha}
                    onChange={(e) => updateField('confirmarSenha', e.target.value)}
                    placeholder="Repita a senha"
                    className={inputCls}
                    style={{ ...inputStyle, paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--bb-ink-40)' }}
                    aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.confirmarSenha.length > 0 && (
                  <div className="mt-2 flex items-center gap-1.5">
                    {form.senha === form.confirmarSenha ? (
                      <>
                        <Check size={14} style={{ color: '#22c55e' }} />
                        <span className="text-xs" style={{ color: '#22c55e' }}>
                          Senhas conferem
                        </span>
                      </>
                    ) : (
                      <span className="text-xs" style={{ color: '#ef4444' }}>
                        Senhas nao conferem
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Next button */}
              <div className="flex pt-2">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'var(--bb-brand-gradient)' }}
                >
                  Proximo
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════ */}
          {/* STEP 2 — Sua academia                          */}
          {/* ════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: 'var(--bb-brand-surface)', color: 'var(--bb-brand)' }}
                >
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                    Sua academia
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                    Informacoes do seu espaco de treino.
                  </p>
                </div>
              </div>

              {/* Nome da academia */}
              <div>
                <label className={labelCls} style={labelStyle}>Nome da academia *</label>
                <input
                  value={form.nomeAcademia}
                  onChange={(e) => updateField('nomeAcademia', e.target.value)}
                  placeholder="Ex: Guerreiros BJJ"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>

              {/* Cidade + Estado */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls} style={labelStyle}>Cidade *</label>
                  <input
                    value={form.cidade}
                    onChange={(e) => updateField('cidade', e.target.value)}
                    placeholder="Sua cidade"
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Estado *</label>
                  <select
                    value={form.estado}
                    onChange={(e) => updateField('estado', e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                  >
                    <option value="">Selecione</option>
                    {ESTADOS.map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Modalidades */}
              <div>
                <label className={labelCls} style={labelStyle}>Modalidades *</label>
                <div className="flex flex-wrap gap-2">
                  {MODALIDADES.map((m) => {
                    const selected = form.modalidades.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleArrayField('modalidades', m)}
                        className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-all sm:text-sm"
                        style={{
                          background: selected ? 'var(--bb-brand-surface)' : 'var(--bb-depth-2)',
                          color: selected ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                          border: `1.5px solid ${selected ? 'var(--bb-brand)' : 'var(--bb-glass-border)'}`,
                        }}
                      >
                        {selected && <Check size={14} />}
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Qtd alunos */}
              <div>
                <label className={labelCls} style={labelStyle}>Quantidade de alunos *</label>
                <select
                  value={form.qtdAlunos}
                  onChange={(e) => updateField('qtdAlunos', e.target.value)}
                  className={inputCls}
                  style={inputStyle}
                >
                  <option value="">Selecione</option>
                  {QTD_ALUNOS.map((q) => (
                    <option key={q.value} value={q.value}>{q.label}</option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1 rounded-xl px-4 py-3 text-sm font-medium transition-all"
                  style={{
                    background: 'transparent',
                    color: 'var(--bb-ink-60)',
                    border: '1px solid var(--bb-glass-border)',
                  }}
                >
                  <ChevronLeft size={16} />
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={submitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'var(--bb-brand-gradient)' }}
                >
                  Proximo
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════ */}
          {/* STEP 3 — Sua primeira turma (optional)         */}
          {/* ════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: 'var(--bb-brand-surface)', color: 'var(--bb-brand)' }}
                >
                  <Users size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                    Sua primeira turma
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                    Configure sua primeira turma de treino.
                  </p>
                </div>
              </div>

              {/* Optional notice */}
              <div
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs sm:text-sm"
                style={{
                  background: 'var(--bb-brand-surface)',
                  color: 'var(--bb-brand)',
                  border: '1px solid var(--bb-brand)',
                }}
              >
                <Dumbbell size={16} className="shrink-0" />
                Pode pular e criar depois
              </div>

              {/* Nome da turma */}
              <div>
                <label className={labelCls} style={labelStyle}>Nome da turma</label>
                <input
                  value={form.nomeTurma}
                  onChange={(e) => updateField('nomeTurma', e.target.value)}
                  placeholder="Ex: BJJ Iniciantes Noite"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>

              {/* Modalidade (select from step 2 selections) */}
              <div>
                <label className={labelCls} style={labelStyle}>Modalidade</label>
                <select
                  value={form.turmaModalidade}
                  onChange={(e) => updateField('turmaModalidade', e.target.value)}
                  className={inputCls}
                  style={inputStyle}
                >
                  <option value="">Selecione</option>
                  {form.modalidades.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Dias da semana */}
              <div>
                <label className={labelCls} style={labelStyle}>Dias da semana</label>
                <div className="flex flex-wrap gap-2">
                  {DIAS_SEMANA.map((d) => {
                    const selected = form.diasSemana.includes(d.value);
                    return (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => toggleArrayField('diasSemana', d.value)}
                        className="flex h-10 w-12 items-center justify-center rounded-lg text-xs font-medium transition-all sm:w-14 sm:text-sm"
                        style={{
                          background: selected ? 'var(--bb-brand-surface)' : 'var(--bb-depth-2)',
                          color: selected ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                          border: `1.5px solid ${selected ? 'var(--bb-brand)' : 'var(--bb-glass-border)'}`,
                        }}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Horario + Capacidade */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelCls} style={labelStyle}>Horario inicio</label>
                  <input
                    type="time"
                    value={form.horarioInicio}
                    onChange={(e) => updateField('horarioInicio', e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Horario fim</label>
                  <input
                    type="time"
                    value={form.horarioFim}
                    onChange={(e) => updateField('horarioFim', e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Capacidade</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={form.capacidade}
                    onChange={(e) => updateField('capacidade', e.target.value)}
                    placeholder="30"
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center justify-center gap-1 rounded-xl px-4 py-3 text-sm font-medium transition-all"
                  style={{
                    background: 'transparent',
                    color: 'var(--bb-ink-60)',
                    border: '1px solid var(--bb-glass-border)',
                  }}
                >
                  <ChevronLeft size={16} />
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition-all"
                  style={{
                    background: 'var(--bb-depth-2)',
                    color: 'var(--bb-ink-60)',
                    border: '1px solid var(--bb-glass-border)',
                  }}
                >
                  Pular
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={submitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'var(--bb-brand-gradient)' }}
                >
                  Proximo
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════ */}
          {/* STEP 4 — Tudo pronto!                          */}
          {/* ════════════════════════════════════════════════ */}
          {step === 4 && (
            <div className="space-y-6 text-center">
              {/* Celebration icon */}
              <div className="flex justify-center">
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-2xl"
                  style={{
                    background: 'var(--bb-brand-surface)',
                    border: '2px solid var(--bb-brand)',
                  }}
                >
                  <Sparkles size={40} style={{ color: 'var(--bb-brand)' }} />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
                  Tudo pronto!
                </h2>
                <p className="mt-2 text-base" style={{ color: 'var(--bb-ink-60)' }}>
                  Sua academia esta no BlackBelt!
                </p>
              </div>

              {/* Checklist */}
              <div className="mx-auto max-w-sm space-y-2 text-left">
                {[
                  'Conta criada',
                  `${form.nomeAcademia || 'Sua academia'} cadastrada`,
                  'Trial de 7 dias ativo',
                  'TODOS os modulos liberados',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-lg px-4 py-2.5"
                    style={{ background: 'var(--bb-depth-2)' }}
                  >
                    <div
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                      style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e' }}
                    >
                      <Check size={12} style={{ color: '#22c55e' }} />
                    </div>
                    <span className="text-sm" style={{ color: 'var(--bb-ink-100)' }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* Trial info */}
              <div
                className="mx-auto max-w-sm rounded-xl p-4"
                style={{
                  background: 'var(--bb-brand-surface)',
                  border: '1px solid var(--bb-brand)',
                }}
              >
                <p className="text-sm font-semibold" style={{ color: 'var(--bb-brand)' }}>
                  Seu trial: 7 dias gratis + 90 dias de descoberta com tudo liberado.
                </p>
              </div>

              {/* Proximos passos */}
              <div className="mx-auto max-w-sm text-left">
                <h3 className="mb-3 text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                  Proximos passos:
                </h3>
                <div className="space-y-2">
                  {[
                    { num: '1', text: 'Convide seus alunos' },
                    { num: '2', text: 'Crie mais turmas' },
                    { num: '3', text: 'Configure o financeiro' },
                  ].map((item) => (
                    <div key={item.num} className="flex items-center gap-3">
                      <div
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ background: 'var(--bb-brand-gradient)' }}
                      >
                        {item.num}
                      </div>
                      <span className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/admin')}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 sm:text-base"
                  style={{ background: 'var(--bb-brand-gradient)', boxShadow: 'var(--bb-shadow-xl)' }}
                >
                  ABRIR MEU PAINEL
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer link */}
        {step < 4 && (
          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Ja tem conta?{' '}
              <Link href="/login" className="hover:underline" style={{ color: 'var(--bb-brand)' }}>
                Fazer login
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

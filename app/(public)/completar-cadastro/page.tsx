'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, LinkIcon, Dumbbell, ChevronRight } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────

type HowOption = 'owner' | 'invite' | 'train' | null;

interface InviteResult {
  valid: boolean;
  academyName: string;
  academyId: string;
}

// ── Constants ──────────────────────────────────────────────────────────

const INPUT_CLASS =
  'w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--bb-brand)]/30';

const CATEGORY_THRESHOLDS = {
  kids: { max: 11, label: 'Kids' },
  teen: { min: 12, max: 17, label: 'Teen' },
  adult: { min: 18, label: 'Adulto' },
} as const;

// ── Helpers ────────────────────────────────────────────────────────────

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

function parseBirthdate(masked: string): Date | null {
  const parts = masked.split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  if (day.length !== 2 || month.length !== 2 || year.length !== 4) return null;

  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);

  if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2025) return null;

  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    return null;
  }
  return date;
}

function calculateAge(birthdate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const monthDiff = today.getMonth() - birthdate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
    age--;
  }
  return age;
}

function getAgeCategory(age: number): string {
  if (age <= CATEGORY_THRESHOLDS.kids.max) return CATEGORY_THRESHOLDS.kids.label;
  if (age >= CATEGORY_THRESHOLDS.teen.min && age <= CATEGORY_THRESHOLDS.teen.max) return CATEGORY_THRESHOLDS.teen.label;
  return CATEGORY_THRESHOLDS.adult.label;
}

// ── Component ──────────────────────────────────────────────────────────

export default function CompletarCadastroPage() {
  const router = useRouter();

  // Mock user from social auth — in production comes from auth context
  const userName = 'Joao';
  const userInitial = userName.charAt(0).toUpperCase();

  // Form state
  const [phone, setPhone] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [selectedOption, setSelectedOption] = useState<HowOption>(null);

  // Invite code state
  const [inviteCode, setInviteCode] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<InviteResult | null>(null);
  const [inviteError, setInviteError] = useState('');

  // Submit state
  const [saving, setSaving] = useState(false);

  // ── Derived values ────────────────────────────────────────────────

  const parsedDate = useMemo(() => parseBirthdate(birthdate), [birthdate]);

  const ageInfo = useMemo(() => {
    if (!parsedDate) return null;
    const age = calculateAge(parsedDate);
    if (age < 0 || age > 120) return null;
    const category = getAgeCategory(age);
    return { age, category };
  }, [parsedDate]);

  // ── Handlers ──────────────────────────────────────────────────────

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(applyPhoneMask(e.target.value));
  }, []);

  const handleBirthdateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBirthdate(applyDateMask(e.target.value));
  }, []);

  const handleSelectOption = useCallback((option: HowOption) => {
    setSelectedOption((prev) => (prev === option ? null : option));
    setInviteResult(null);
    setInviteError('');
    setInviteCode('');
  }, []);

  const handleValidateInvite = useCallback(async () => {
    const code = inviteCode.trim();
    if (!code) {
      setInviteError('Cole o codigo de convite');
      return;
    }

    setInviteLoading(true);
    setInviteError('');
    setInviteResult(null);

    try {
      // Mock validation — in production: POST /api/invites/validate
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (code.length < 6) {
        setInviteError('Codigo invalido. Verifique e tente novamente.');
        return;
      }

      // Mock success
      setInviteResult({
        valid: true,
        academyName: 'Guerreiros BJJ',
        academyId: 'academy-123',
      });
    } catch {
      setInviteError('Erro ao validar codigo. Tente novamente.');
    } finally {
      setInviteLoading(false);
    }
  }, [inviteCode]);

  const handleContinue = useCallback(async () => {
    setSaving(true);
    try {
      // Mock save — in production: PUT /api/users/me/complete-profile
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (inviteResult?.academyId) {
        router.push('/selecionar-perfil');
      } else {
        router.push('/');
      }
    } catch {
      // Error handled by service layer in production
    } finally {
      setSaving(false);
    }
  }, [inviteResult, router]);

  // ── Validation ────────────────────────────────────────────────────

  const canContinue = phone.replace(/\D/g, '').length >= 10 && parsedDate !== null && inviteResult?.valid;

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6"
      style={{ background: 'var(--bb-depth-1)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 sm:p-8"
        style={{
          background: 'var(--bb-depth-3)',
          boxShadow: 'var(--bb-shadow-xl)',
          border: '1px solid var(--bb-glass-border)',
        }}
      >
        {/* Header with avatar */}
        <div className="mb-8 text-center">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white"
            style={{ background: 'var(--bb-brand-gradient, var(--bb-brand))' }}
          >
            {userInitial}
          </div>
          <h1 className="mt-4 text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            Ola, {userName}! Falta pouco.
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Complete seus dados para continuar
          </p>
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          {/* Telefone (WhatsApp) */}
          <div>
            <label
              className="mb-1.5 block text-sm font-medium"
              style={{ color: 'var(--bb-ink-100)' }}
            >
              Telefone (WhatsApp)
            </label>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={handlePhoneChange}
              className={INPUT_CLASS}
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-100)',
              }}
            />
          </div>

          {/* Data de nascimento */}
          <div>
            <label
              className="mb-1.5 block text-sm font-medium"
              style={{ color: 'var(--bb-ink-100)' }}
            >
              Data de nascimento
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="DD/MM/AAAA"
              value={birthdate}
              onChange={handleBirthdateChange}
              className={INPUT_CLASS}
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-100)',
              }}
            />
            {ageInfo && (
              <p className="mt-1.5 text-sm font-medium" style={{ color: 'var(--bb-brand)' }}>
                &rarr; {ageInfo.age} anos &middot; {ageInfo.category}
              </p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div
          className="my-6"
          style={{ height: 1, background: 'var(--bb-glass-border)' }}
        />

        {/* How did you get here? */}
        <div>
          <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
            Como chegou aqui?
          </h2>

          <div className="space-y-2">
            {/* Option 1: Academy owner */}
            <button
              type="button"
              onClick={() => handleSelectOption('owner')}
              className="flex w-full items-center gap-3 rounded-xl p-4 text-left transition-all"
              style={{
                background: selectedOption === 'owner' ? 'var(--bb-brand-surface)' : 'var(--bb-depth-2)',
                border: `1.5px solid ${selectedOption === 'owner' ? 'var(--bb-brand)' : 'var(--bb-glass-border)'}`,
              }}
            >
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: selectedOption === 'owner' ? 'var(--bb-brand)' : 'var(--bb-depth-3)',
                }}
              >
                <Building2
                  size={20}
                  style={{
                    color: selectedOption === 'owner' ? '#fff' : 'var(--bb-ink-60)',
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="text-sm font-semibold"
                  style={{ color: 'var(--bb-ink-100)' }}
                >
                  Sou dono de academia
                </p>
                <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  Quero cadastrar minha academia
                </p>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--bb-ink-40)' }} />
            </button>

            {selectedOption === 'owner' && (
              <div
                className="ml-4 rounded-lg p-3"
                style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
              >
                <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                  Voce sera redirecionado para o cadastro completo da academia.
                </p>
                <Link
                  href="/cadastro-academia"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: 'var(--bb-brand-gradient, var(--bb-brand))' }}
                >
                  Cadastrar academia
                  <ChevronRight size={16} />
                </Link>
              </div>
            )}

            {/* Option 2: Invite code */}
            <button
              type="button"
              onClick={() => handleSelectOption('invite')}
              className="flex w-full items-center gap-3 rounded-xl p-4 text-left transition-all"
              style={{
                background: selectedOption === 'invite' ? 'var(--bb-brand-surface)' : 'var(--bb-depth-2)',
                border: `1.5px solid ${selectedOption === 'invite' ? 'var(--bb-brand)' : 'var(--bb-glass-border)'}`,
              }}
            >
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: selectedOption === 'invite' ? 'var(--bb-brand)' : 'var(--bb-depth-3)',
                }}
              >
                <LinkIcon
                  size={20}
                  style={{
                    color: selectedOption === 'invite' ? '#fff' : 'var(--bb-ink-60)',
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="text-sm font-semibold"
                  style={{ color: 'var(--bb-ink-100)' }}
                >
                  Tenho codigo de convite
                </p>
                <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  Recebi um link ou codigo da academia
                </p>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--bb-ink-40)' }} />
            </button>

            {selectedOption === 'invite' && (
              <div
                className="ml-4 space-y-3 rounded-lg p-3"
                style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Cole o codigo aqui"
                    value={inviteCode}
                    onChange={(e) => {
                      setInviteCode(e.target.value);
                      setInviteError('');
                    }}
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--bb-brand)]/30"
                    style={{
                      background: 'var(--bb-depth-3)',
                      border: `1px solid ${inviteError ? '#ef4444' : 'var(--bb-glass-border)'}`,
                      color: 'var(--bb-ink-100)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleValidateInvite}
                    disabled={inviteLoading}
                    className="flex-shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                    style={{ background: 'var(--bb-brand-gradient, var(--bb-brand))' }}
                  >
                    {inviteLoading ? (
                      <span
                        className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                      />
                    ) : (
                      'Validar'
                    )}
                  </button>
                </div>

                {inviteError && (
                  <p className="text-xs" style={{ color: '#ef4444' }}>
                    {inviteError}
                  </p>
                )}

                {inviteResult?.valid && (
                  <div
                    className="flex items-center justify-between rounded-lg p-3"
                    style={{
                      background: 'rgba(34, 197, 94, 0.08)',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                    }}
                  >
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                        {inviteResult.academyName}
                      </p>
                      <p className="text-xs" style={{ color: '#22c55e' }}>
                        Codigo valido
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleContinue}
                      disabled={saving || !canContinue}
                      className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                      style={{ background: 'var(--bb-brand-gradient, var(--bb-brand))' }}
                    >
                      {saving ? (
                        <span
                          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                        />
                      ) : (
                        <>
                          Continuar
                          <ChevronRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Option 3: Want to train */}
            <button
              type="button"
              onClick={() => handleSelectOption('train')}
              className="flex w-full items-center gap-3 rounded-xl p-4 text-left transition-all"
              style={{
                background: selectedOption === 'train' ? 'var(--bb-brand-surface)' : 'var(--bb-depth-2)',
                border: `1.5px solid ${selectedOption === 'train' ? 'var(--bb-brand)' : 'var(--bb-glass-border)'}`,
              }}
            >
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: selectedOption === 'train' ? 'var(--bb-brand)' : 'var(--bb-depth-3)',
                }}
              >
                <Dumbbell
                  size={20}
                  style={{
                    color: selectedOption === 'train' ? '#fff' : 'var(--bb-ink-60)',
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="text-sm font-semibold"
                  style={{ color: 'var(--bb-ink-100)' }}
                >
                  Quero treinar
                </p>
                <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  Ainda nao tenho academia cadastrada
                </p>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--bb-ink-40)' }} />
            </button>

            {selectedOption === 'train' && (
              <div
                className="ml-4 rounded-lg p-3"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              >
                <p className="text-sm leading-relaxed" style={{ color: 'var(--bb-ink-60)' }}>
                  Peca o link ao seu professor ou recepcionista da academia. Eles geram pelo app!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

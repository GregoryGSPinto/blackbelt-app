'use client';

import { forwardRef, useState } from 'react';
import { isMock } from '@/lib/env';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import Link from 'next/link';

type Step = 'intro' | 'verify-age' | 'consent' | 'success';

interface ParentalConsentFlowProps {
  minorProfileId?: string;
  minorName?: string;
  academyName?: string;
  guardianName?: string;
  onComplete?: () => void;
  className?: string;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1940 + 1 }, (_, i) => 1940 + i);

const ParentalConsentFlow = forwardRef<HTMLDivElement, ParentalConsentFlowProps>(
  function ParentalConsentFlow(
    { minorProfileId, minorName = '', academyName = '', guardianName: initialGuardianName = '', onComplete, className },
    ref
  ) {
    const { toast } = useToast();
    const [step, setStep] = useState<Step>('intro');
    const [birthYear, setBirthYear] = useState<number | null>(null);
    const [ageError, setAgeError] = useState('');
    const [privacyChecked, setPrivacyChecked] = useState(false);
    const [authorizeChecked, setAuthorizeChecked] = useState(false);
    const [guardianName, setGuardianName] = useState(initialGuardianName);
    const [isSaving, setIsSaving] = useState(false);

    function handleVerifyAge() {
      if (!birthYear) {
        setAgeError('Selecione o ano de nascimento.');
        return;
      }
      const age = currentYear - birthYear;
      if (age < 18) {
        setAgeError('Voce precisa ser maior de idade para autorizar.');
        return;
      }
      setAgeError('');
      setStep('consent');
    }

    async function handleConsent() {
      if (!privacyChecked || !authorizeChecked || !guardianName.trim()) return;

      setIsSaving(true);
      try {
        if (isMock()) {
          toast('Consentimento registrado com sucesso!', 'success');
          setStep('success');
          return;
        }

        const { createBrowserClient } = await import('@/lib/supabase/client');
        const supabase = createBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!minorProfileId) {
          toast('Perfil do menor nao identificado.', 'error');
          return;
        }

        // Get existing parental_controls
        const { data: profileData, error: fetchError } = await supabase
          .from('profiles')
          .select('parental_controls')
          .eq('id', minorProfileId)
          .single();

        if (fetchError) throw fetchError;

        const existingControls = (profileData?.parental_controls as Record<string, unknown>) || {};

        const consentData = {
          ...existingControls,
          consent: {
            granted: true,
            grantedBy: session?.user?.id ?? 'unknown',
            grantedAt: new Date().toISOString(),
            guardianBirthYear: birthYear,
            guardianName: guardianName.trim(),
            ip: 'client',
            version: '1.0',
          },
        };

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ parental_controls: consentData })
          .eq('id', minorProfileId);

        if (updateError) throw updateError;

        toast('Consentimento registrado com sucesso!', 'success');
        setStep('success');
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setIsSaving(false);
      }
    }

    return (
      <div
        ref={ref}
        className={`mx-auto w-full max-w-lg p-6 ${className ?? ''}`}
        style={{ color: 'var(--bb-ink-100)' }}
      >
        {/* Step 1: Intro */}
        {step === 'intro' && (
          <div className="flex flex-col items-center text-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl"
              style={{ background: 'var(--bb-brand-gradient)', color: '#fff' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-bold">Autorizacao do Responsavel</h2>
            <p className="mt-3 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Para usar o BlackBelt, um responsavel precisa autorizar o acesso
              {minorName ? ` de ${minorName}` : ''}.
            </p>
            <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              O responsavel precisa estar presente agora para completar este processo.
            </p>
            <button
              onClick={() => setStep('verify-age')}
              className="mt-6 w-full rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--bb-brand-gradient)' }}
            >
              Meu responsavel esta comigo agora
            </button>
          </div>
        )}

        {/* Step 2: Age Verification */}
        {step === 'verify-age' && (
          <div>
            <h2 className="text-xl font-bold">Verificacao do Responsavel</h2>
            <p className="mt-3 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Para confirmar que voce e o responsavel, responda:
            </p>

            <label className="mt-6 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Qual e o seu ano de nascimento?
            </label>
            <select
              value={birthYear ?? ''}
              onChange={(e) => {
                setBirthYear(e.target.value ? Number(e.target.value) : null);
                setAgeError('');
              }}
              className="mt-2 w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{
                backgroundColor: 'var(--bb-depth-2)',
                borderColor: 'var(--bb-glass-border)',
                color: 'var(--bb-ink-100)',
              }}
            >
              <option value="">Selecione o ano</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            {ageError && (
              <p className="mt-2 text-sm" style={{ color: '#EF4444' }}>
                {ageError}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep('intro')}
                className="rounded-lg px-4 py-2.5 text-sm font-medium"
                style={{ backgroundColor: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)' }}
              >
                Voltar
              </button>
              <button
                onClick={handleVerifyAge}
                disabled={!birthYear}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ background: 'var(--bb-brand-gradient)' }}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Consent Form */}
        {step === 'consent' && (
          <div>
            <h2 className="text-xl font-bold">Consentimento Parental</h2>

            <div
              className="mt-4 rounded-xl border p-4 text-sm"
              style={{
                backgroundColor: 'var(--bb-depth-2)',
                borderColor: 'var(--bb-glass-border)',
                color: 'var(--bb-ink-80)',
              }}
            >
              <p className="font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                Dados coletados do menor:
              </p>
              <ul className="mt-2 space-y-1 pl-4 list-disc">
                <li>Nome e data de nascimento</li>
                <li>Dados de presenca e evolucao na academia</li>
                <li>Fotos de perfil (se enviadas)</li>
              </ul>

              <p className="mt-4 font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                O que NAO coletamos:
              </p>
              <ul className="mt-2 space-y-1 pl-4 list-disc">
                <li>Localizacao do menor</li>
                <li>Compartilhamento de dados com terceiros</li>
                <li>Exibicao de anuncios</li>
              </ul>
            </div>

            {/* Checkboxes */}
            <div className="mt-6 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyChecked}
                  onChange={(e) => setPrivacyChecked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded"
                  style={{ accentColor: 'var(--bb-brand)' }}
                />
                <span className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                  Li e concordo com a{' '}
                  <Link
                    href="/privacidade-menores"
                    target="_blank"
                    className="underline"
                    style={{ color: 'var(--bb-brand)' }}
                  >
                    Politica de Privacidade para Menores
                  </Link>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={authorizeChecked}
                  onChange={(e) => setAuthorizeChecked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded"
                  style={{ accentColor: 'var(--bb-brand)' }}
                />
                <span className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                  Autorizo {minorName || 'o menor'} a usar o BlackBelt
                  {academyName ? ` na academia ${academyName}` : ''}
                </span>
              </label>
            </div>

            {/* Guardian Name */}
            <label className="mt-4 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Nome completo do responsavel
            </label>
            <input
              type="text"
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
              placeholder="Nome do responsavel"
              className="mt-2 w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{
                backgroundColor: 'var(--bb-depth-2)',
                borderColor: 'var(--bb-glass-border)',
                color: 'var(--bb-ink-100)',
              }}
            />

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep('verify-age')}
                className="rounded-lg px-4 py-2.5 text-sm font-medium"
                style={{ backgroundColor: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)' }}
              >
                Voltar
              </button>
              <button
                onClick={handleConsent}
                disabled={!privacyChecked || !authorizeChecked || !guardianName.trim() || isSaving}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ background: 'var(--bb-brand-gradient)' }}
              >
                {isSaving ? 'Salvando...' : 'Autorizar'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div className="flex flex-col items-center text-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-2xl"
              style={{ backgroundColor: 'color-mix(in srgb, #22C55E 15%, transparent)', color: '#22C55E' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-bold">Autorizado com sucesso!</h2>
            <p className="mt-3 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              O consentimento parental foi registrado. {minorName || 'O menor'} ja pode usar o BlackBelt.
            </p>
            <p className="mt-2 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
              Voce pode revogar esta autorizacao a qualquer momento nas configuracoes.
            </p>
            {onComplete && (
              <button
                onClick={onComplete}
                className="mt-6 w-full rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--bb-brand-gradient)' }}
              >
                Continuar
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);

ParentalConsentFlow.displayName = 'ParentalConsentFlow';

export default ParentalConsentFlow;

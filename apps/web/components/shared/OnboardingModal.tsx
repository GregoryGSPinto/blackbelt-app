'use client';

import { forwardRef, useState, useEffect } from 'react';
import {
  SettingsIcon,
  UsersIcon,
  CalendarIcon,
} from '@/components/shell/icons';

const STORAGE_KEY = 'bb_onboarding_done';

const STEPS = [
  {
    title: 'Bem-vindo ao BlackBelt!',
    description:
      'Sua plataforma completa de gestao para academias de artes marciais. Gerencie alunos, turmas, financeiro e muito mais.',
    icon: null,
    action: null,
  },
  {
    title: 'Configure sua academia',
    description:
      'Personalize o nome, logo, horarios e informacoes da sua academia para comecar.',
    icon: SettingsIcon,
    action: '/admin/configuracoes',
  },
  {
    title: 'Cadastre seus alunos',
    description:
      'Adicione seus alunos manualmente, por convite ou importando uma planilha CSV.',
    icon: UsersIcon,
    action: '/admin/alunos',
  },
  {
    title: 'Crie suas turmas',
    description:
      'Defina turmas com horarios, modalidades e professores para organizar sua academia.',
    icon: CalendarIcon,
    action: '/admin/turmas',
  },
];

interface OnboardingModalProps {
  onClose?: () => void;
}

const OnboardingModal = forwardRef<HTMLDivElement, OnboardingModalProps>(
  function OnboardingModal({ onClose }, ref) {
    const [visible, setVisible] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
      if (typeof window === 'undefined') return;
      const done = localStorage.getItem(STORAGE_KEY);
      if (!done) {
        setVisible(true);
      }
    }, []);

    function handleClose() {
      localStorage.setItem(STORAGE_KEY, 'true');
      setVisible(false);
      onClose?.();
    }

    function handleNext() {
      if (step === STEPS.length - 1) {
        handleClose();
      } else {
        setStep((s) => s + 1);
      }
    }

    function handleSkip() {
      handleClose();
    }

    if (!visible) return null;

    const current = STEPS[step];
    const IconComp = current.icon;
    const isLast = step === STEPS.length - 1;

    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.6)' }}
      >
        <div
          ref={ref}
          className="relative w-full max-w-md overflow-hidden"
          style={{
            background: 'var(--bb-depth-2)',
            borderRadius: 'var(--bb-radius-xl, 16px)',
            border: '1px solid var(--bb-glass-border)',
            boxShadow: 'var(--bb-shadow-xl, 0 20px 60px rgba(0,0,0,0.3))',
          }}
        >
          {/* Header accent bar */}
          <div
            className="h-1.5 w-full"
            style={{ background: 'var(--bb-brand-gradient, var(--bb-brand))' }}
          />

          <div className="p-6">
            {/* Step content */}
            <div className="flex flex-col items-center text-center">
              {step === 0 ? (
                <div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                  style={{ background: 'var(--bb-brand-surface)' }}
                >
                  {'\uD83E\uDD4B'}
                </div>
              ) : IconComp ? (
                <div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{ background: 'var(--bb-brand-surface)' }}
                >
                  <IconComp className="h-8 w-8" style={{ color: 'var(--bb-brand)' }} />
                </div>
              ) : null}

              <h2
                className="text-xl font-bold"
                style={{ color: 'var(--bb-ink-100)' }}
              >
                {current.title}
              </h2>
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{ color: 'var(--bb-ink-60)' }}
              >
                {current.description}
              </p>
            </div>

            {/* Dots indicator */}
            <div className="mt-6 flex items-center justify-center gap-2">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: i === step ? '20px' : '8px',
                    background: i === step ? 'var(--bb-brand)' : 'var(--bb-depth-4)',
                  }}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-sm font-medium transition-colors"
                style={{ color: 'var(--bb-ink-40)' }}
              >
                Pular tutorial
              </button>
              <button
                onClick={handleNext}
                className="rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-colors"
                style={{ background: 'var(--bb-brand)' }}
              >
                {isLast ? 'Comecar!' : 'Proximo'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

OnboardingModal.displayName = 'OnboardingModal';

export { OnboardingModal };

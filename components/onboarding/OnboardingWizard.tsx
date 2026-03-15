'use client';

import { forwardRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';

interface OnboardingWizardProps {
  onComplete: () => void;
  academyId?: string;
}

interface StepConfig {
  title: string;
  subtitle: string;
}

const STEPS: StepConfig[] = [
  { title: 'Boas-vindas ao BlackBelt!', subtitle: 'Vamos configurar sua academia em poucos minutos.' },
  { title: 'Configure sua academia', subtitle: 'Informações básicas e identidade visual.' },
  { title: 'Adicione modalidades', subtitle: 'Selecione as artes marciais oferecidas.' },
  { title: 'Crie sua primeira turma', subtitle: 'Configure horário e capacidade.' },
  { title: 'Adicione alunos', subtitle: 'Convide alunos ou adicione manualmente.' },
  { title: 'Tudo pronto!', subtitle: 'Sua academia está configurada.' },
];

const MODALITIES = ['BJJ', 'Muay Thai', 'Judô', 'Karatê', 'MMA', 'Boxe', 'Wrestling', 'Outro'];

const OnboardingWizard = forwardRef<HTMLDivElement, OnboardingWizardProps>(
  function OnboardingWizard({ onComplete }, ref) {
    const [step, setStep] = useState(0);
    const [academyName, setAcademyName] = useState('');
    const [selectedModalities, setSelectedModalities] = useState<string[]>(['BJJ']);
    const [className, setClassName] = useState('');
    const [classSchedule, setClassSchedule] = useState('');
    const [inviteMethod, setInviteMethod] = useState<'manual' | 'csv' | 'link'>('link');
    const [manualEmail, setManualEmail] = useState('');
    const [inviteLink] = useState(`https://app.blackbelt.com/convite/${Math.random().toString(36).slice(2, 8)}`);

    const canAdvance = useCallback((): boolean => {
      switch (step) {
        case 0: return true; // Welcome
        case 1: return academyName.length > 0;
        case 2: return selectedModalities.length > 0;
        case 3: return className.length > 0;
        case 4: return true; // Optional
        case 5: return true; // Done
        default: return true;
      }
    }, [step, academyName, selectedModalities, className]);

    const toggleModality = (mod: string) => {
      setSelectedModalities((prev) =>
        prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod],
      );
    };

    const next = () => {
      if (step < STEPS.length - 1) setStep(step + 1);
    };

    const prev = () => {
      if (step > 0) setStep(step - 1);
    };

    const currentStep = STEPS[step];

    return (
      <div ref={ref} className="mx-auto w-full max-w-lg space-y-6">
        {/* Progress */}
        <div className="text-center">
          <p className="text-sm text-bb-gray-500">Passo {step + 1} de {STEPS.length}</p>
          <div className="mt-2 flex justify-center gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  i <= step ? 'bg-bb-red' : 'bg-bb-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="rounded-xl border border-bb-gray-200 bg-white p-6">
          <h2 className="text-xl font-bold text-bb-gray-900">{currentStep.title}</h2>
          <p className="mt-1 text-sm text-bb-gray-500">{currentStep.subtitle}</p>

          <div className="mt-6">
            {step === 0 && (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-4xl">
                  🥋
                </div>
                <p className="text-sm text-bb-gray-600">
                  O BlackBelt vai ajudar você a gerenciar sua academia de artes marciais
                  com check-in, turmas, progresso de alunos, financeiro e muito mais.
                </p>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-bb-gray-700">Nome da academia</label>
                  <input
                    value={academyName}
                    onChange={(e) => setAcademyName(e.target.value)}
                    placeholder="Ex: Academia Fight Club"
                    className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm focus:border-bb-red focus:outline-none focus:ring-1 focus:ring-bb-red"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bb-gray-700">Logo (opcional)</label>
                  <div className="mt-1 flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-bb-gray-300 text-sm text-bb-gray-400">
                    Clique para fazer upload
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-2 gap-2">
                {MODALITIES.map((mod) => (
                  <button
                    key={mod}
                    onClick={() => toggleModality(mod)}
                    className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                      selectedModalities.includes(mod)
                        ? 'border-bb-red bg-red-50 text-bb-red font-medium'
                        : 'border-bb-gray-200 text-bb-gray-600 hover:border-bb-gray-300'
                    }`}
                  >
                    {mod}
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-bb-gray-700">Nome da turma</label>
                  <input
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="Ex: BJJ Iniciante"
                    className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm focus:border-bb-red focus:outline-none focus:ring-1 focus:ring-bb-red"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bb-gray-700">Horário</label>
                  <input
                    value={classSchedule}
                    onChange={(e) => setClassSchedule(e.target.value)}
                    placeholder="Ex: Seg/Qua/Sex 19:00-20:30"
                    className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm focus:border-bb-red focus:outline-none focus:ring-1 focus:ring-bb-red"
                  />
                </div>
                <p className="text-xs text-bb-gray-400">Você pode criar mais turmas depois.</p>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  {(['manual', 'csv', 'link'] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setInviteMethod(method)}
                      className={`flex-1 rounded-lg border px-2 py-1.5 text-xs transition-colors ${
                        inviteMethod === method
                          ? 'border-bb-red bg-red-50 text-bb-red font-medium'
                          : 'border-bb-gray-200 text-bb-gray-600'
                      }`}
                    >
                      {method === 'manual' ? 'Manual' : method === 'csv' ? 'Importar CSV' : 'Link de convite'}
                    </button>
                  ))}
                </div>

                {inviteMethod === 'manual' && (
                  <div>
                    <input
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      placeholder="Email do aluno"
                      type="email"
                      className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm focus:border-bb-red focus:outline-none focus:ring-1 focus:ring-bb-red"
                    />
                    <p className="mt-1 text-xs text-bb-gray-400">Adicione 1-3 alunos agora, mais depois.</p>
                  </div>
                )}

                {inviteMethod === 'csv' && (
                  <div className="rounded-lg border-2 border-dashed border-bb-gray-300 p-4 text-center text-sm text-bb-gray-400">
                    <p>Arraste um CSV com colunas: nome, email</p>
                    <button className="mt-2 text-xs text-bb-red underline">Baixar template</button>
                  </div>
                )}

                {inviteMethod === 'link' && (
                  <div className="rounded-lg bg-bb-gray-50 p-3">
                    <p className="text-xs text-bb-gray-500">Link de auto-cadastro:</p>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        readOnly
                        value={inviteLink}
                        className="flex-1 rounded border border-bb-gray-200 bg-white px-2 py-1 text-xs text-bb-gray-700"
                      />
                      <button
                        onClick={() => navigator.clipboard?.writeText(inviteLink)}
                        className="rounded bg-bb-red px-2 py-1 text-xs text-white"
                      >
                        Copiar
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-bb-gray-400">
                      Compartilhe via WhatsApp para seus alunos se cadastrarem sozinhos.
                    </p>
                  </div>
                )}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-3 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-2xl">
                  ✓
                </div>
                <div className="space-y-1">
                  <p className="flex items-center justify-center gap-2 text-sm text-green-600">
                    <span>✓</span> Academia configurada
                  </p>
                  {selectedModalities.length > 0 && (
                    <p className="flex items-center justify-center gap-2 text-sm text-green-600">
                      <span>✓</span> {selectedModalities.length} modalidade(s) adicionada(s)
                    </p>
                  )}
                  {className && (
                    <p className="flex items-center justify-center gap-2 text-sm text-green-600">
                      <span>✓</span> Turma criada
                    </p>
                  )}
                  <p className="flex items-center justify-center gap-2 text-sm text-green-600">
                    <span>✓</span> Pronto para começar
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-6 flex gap-3">
            {step > 0 && step < STEPS.length - 1 && (
              <Button variant="ghost" onClick={prev}>Voltar</Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button
                className="flex-1"
                onClick={next}
                disabled={!canAdvance()}
              >
                {step === 0 ? 'Começar' : step === 4 ? 'Pular / Continuar' : 'Próximo'}
              </Button>
            ) : (
              <Button className="flex-1" onClick={onComplete}>
                Explorar o dashboard
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  },
);

OnboardingWizard.displayName = 'OnboardingWizard';

export { OnboardingWizard };

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { completeSetupStep } from '@/lib/api/onboarding.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/lib/hooks/useToast';

const WIZARD_STEPS = [
  { step: 1, title: 'Logo da Academia', description: 'Faça upload do logo (será usado no app e relatórios)' },
  { step: 2, title: 'Modalidades', description: 'Configure as modalidades oferecidas (BJJ, Muay Thai, etc)' },
  { step: 3, title: 'Primeira Turma', description: 'Crie sua primeira turma com horário e professor' },
  { step: 4, title: 'Convide um Professor', description: 'Envie um convite por email para o primeiro professor' },
  { step: 5, title: 'Tudo Pronto!', description: 'Sua academia está configurada e pronta para usar' },
];

export default function SetupWizardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    setLoading(true);
    try {
      await completeSetupStep('academy-1', currentStep);
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1 as 1 | 2 | 3 | 4 | 5);
      } else {
        toast('Setup completo!', 'success');
        router.push('/admin');
      }
    } catch {
      toast('Erro no setup', 'error');
    } finally {
      setLoading(false);
    }
  }

  const stepData = WIZARD_STEPS[currentStep - 1];

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <p className="text-sm text-bb-gray-500">Passo {currentStep} de 5</p>
          <div className="mt-2 flex justify-center gap-1">
            {WIZARD_STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 w-8 rounded-full ${i < currentStep ? 'bg-bb-primary' : 'bg-bb-gray-200'}`} />
            ))}
          </div>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-bb-black">{stepData.title}</h2>
          <p className="mt-2 text-sm text-bb-gray-500">{stepData.description}</p>

          {currentStep === 1 && (
            <div className="mt-4 flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-bb-gray-300 text-sm text-bb-gray-500">
              Clique para fazer upload do logo
            </div>
          )}

          {currentStep === 2 && (
            <div className="mt-4 space-y-2">
              {['BJJ', 'Muay Thai', 'Judô', 'Karatê'].map((mod) => (
                <label key={mod} className="flex items-center gap-2 text-sm text-bb-black">
                  <input type="checkbox" defaultChecked={mod === 'BJJ'} className="rounded" />
                  {mod}
                </label>
              ))}
            </div>
          )}

          {currentStep === 3 && (
            <div className="mt-4 space-y-3">
              <input placeholder="Nome da turma" className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
              <input placeholder="Horário (ex: Seg/Qua 19h)" className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
            </div>
          )}

          {currentStep === 4 && (
            <div className="mt-4">
              <input placeholder="Email do professor" type="email" className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
            </div>
          )}

          {currentStep === 5 && (
            <div className="mt-4 text-center text-3xl">🎉</div>
          )}

          <div className="mt-6 flex gap-2">
            {currentStep > 1 && currentStep < 5 && (
              <Button variant="ghost" onClick={() => setCurrentStep(currentStep - 1 as 1 | 2 | 3 | 4)}>Voltar</Button>
            )}
            <Button className="flex-1" onClick={handleComplete} loading={loading}>
              {currentStep === 5 ? 'Ir para o Dashboard' : currentStep === 4 ? 'Pular / Continuar' : 'Próximo'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

'use client';

import {
  useCallback,
  useRef,
  useEffect,
  useState,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';

export interface WizardStep {
  title: string;
  content: ReactNode;
  isValid: boolean;
}

export interface RegistrationWizardProps {
  steps: WizardStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete: () => void;
  loading?: boolean;
  completeLabel?: string;
  className?: string;
}

export function RegistrationWizard({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  loading = false,
  completeLabel = 'Criar Minha Conta',
  className,
}: RegistrationWizardProps) {
  const totalSteps = steps.length;
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;
  const currentValid = steps[currentStep]?.isValid ?? false;
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  const containerRef = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const goNext = useCallback(() => {
    if (!currentValid || isLast || isAnimating) return;
    setDirection('left');
    setIsAnimating(true);
  }, [currentValid, isLast, isAnimating]);

  const goPrev = useCallback(() => {
    if (isFirst || isAnimating) return;
    setDirection('right');
    setIsAnimating(true);
  }, [isFirst, isAnimating]);

  // Handle step transition after animation starts
  useEffect(() => {
    if (!isAnimating || direction === null) return;

    const timer = setTimeout(() => {
      if (direction === 'left') {
        onStepChange(currentStep + 1);
      } else {
        onStepChange(currentStep - 1);
      }
      setDirection(null);
      setIsAnimating(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [isAnimating, direction, currentStep, onStepChange]);

  const handleComplete = useCallback(() => {
    if (!currentValid || loading) return;
    onComplete();
  }, [currentValid, loading, onComplete]);

  const slideStyle: CSSProperties = {
    transition: 'transform 250ms ease-in-out, opacity 250ms ease-in-out',
    transform:
      direction === 'left'
        ? 'translateX(-20px)'
        : direction === 'right'
          ? 'translateX(20px)'
          : 'translateX(0)',
    opacity: isAnimating ? 0 : 1,
  };

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Progress bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-medium"
            style={{ color: 'var(--bb-ink-60)' }}
          >
            Passo {currentStep + 1} de {totalSteps}
          </span>
          <span
            className="text-xs font-medium"
            style={{ color: 'var(--bb-ink-60)' }}
          >
            {Math.round(progressPercent)}%
          </span>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden"
          style={{
            backgroundColor: 'var(--bb-depth-4)',
            borderRadius: 'var(--bb-radius-sm, 4px)',
          }}
        >
          <div
            className="h-full transition-all duration-300 ease-out"
            style={{
              width: `${progressPercent}%`,
              background: 'var(--bb-brand-gradient)',
              borderRadius: 'var(--bb-radius-sm, 4px)',
            }}
          />
        </div>
      </div>

      {/* Step title */}
      <h2
        className="text-lg font-semibold"
        style={{ color: 'var(--bb-ink-100)' }}
      >
        {steps[currentStep]?.title}
      </h2>

      {/* Step content with slide animation */}
      <div ref={containerRef} className="min-h-[200px]" style={slideStyle}>
        {steps[currentStep]?.content}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-3">
        {!isFirst && (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={goPrev}
            disabled={isAnimating}
            className="flex-1"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Anterior
          </Button>
        )}

        {isLast ? (
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleComplete}
            disabled={!currentValid}
            loading={loading}
            className="flex-1"
          >
            {completeLabel}
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={goNext}
            disabled={!currentValid || isAnimating}
            className="flex-1"
          >
            Proximo
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

RegistrationWizard.displayName = 'RegistrationWizard';

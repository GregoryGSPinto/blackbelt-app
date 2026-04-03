'use client';

import { forwardRef, useState, useCallback, type CSSProperties } from 'react';
import { Button } from '@/components/ui/Button';

// ── Types ─────────────────────────────────────────────────────

interface OnboardingWizardProps {
  onComplete: () => void;
  academyId?: string;
}

interface AcademyFormData {
  name: string;
  address: string;
}

interface ClassFormData {
  name: string;
  modality: string;
  schedule: string;
}

interface StepConfig {
  title: string;
  subtitle: string;
  skippable: boolean;
}

// ── Constants ────────────────────────────────────────────────

const TOTAL_STEPS = 6;

const STEPS: StepConfig[] = [
  { title: 'Bem-vindo ao BlackBelt!', subtitle: 'Sua jornada de gestao inteligente comeca agora.', skippable: false },
  { title: 'Configure sua academia', subtitle: 'Nome, logo e endereco da sua academia.', skippable: true },
  { title: 'Crie sua primeira turma', subtitle: 'Configure uma turma para comecar.', skippable: true },
  { title: 'Convide um professor', subtitle: 'Compartilhe o link para seu professor se cadastrar.', skippable: true },
  { title: 'Gere links para alunos', subtitle: 'Crie um link de convite para seus alunos.', skippable: true },
  { title: 'Tudo pronto!', subtitle: 'Sua academia esta configurada e pronta para uso.', skippable: false },
];

const MODALITIES = ['BJJ', 'Muay Thai', 'Judo', 'Karate', 'MMA', 'Boxe', 'Wrestling', 'Taekwondo'];

// ── Styles ───────────────────────────────────────────────────

const inputStyle: CSSProperties = {
  background: 'var(--bb-depth-2)',
  color: 'var(--bb-ink-100)',
  border: '1px solid var(--bb-glass-border)',
  borderRadius: 'var(--bb-radius-sm)',
};

const labelStyle: CSSProperties = {
  color: 'var(--bb-ink-80)',
};

const subtextStyle: CSSProperties = {
  color: 'var(--bb-ink-60)',
};

const mutedStyle: CSSProperties = {
  color: 'var(--bb-ink-40)',
};

// ── Component ────────────────────────────────────────────────

const OnboardingWizard = forwardRef<HTMLDivElement, OnboardingWizardProps>(
  function OnboardingWizard({ onComplete }, ref) {
    const [step, setStep] = useState(0);

    // Step 2: Academy form
    const [academy, setAcademy] = useState<AcademyFormData>({ name: '', address: '' });

    // Step 3: Class form
    const [classData, setClassData] = useState<ClassFormData>({ name: '', modality: 'BJJ', schedule: '' });

    // Step 4: Professor invite link
    const [professorLink] = useState(
      `https://blackbeltv2.vercel.app/convite/prof-${Math.random().toString(36).slice(2, 8)}`,
    );
    const [professorLinkCopied, setProfessorLinkCopied] = useState(false);

    // Step 5: Student invite link
    const [studentLink] = useState(
      `https://blackbeltv2.vercel.app/convite/aluno-${Math.random().toString(36).slice(2, 8)}`,
    );
    const [studentLinkCopied, setStudentLinkCopied] = useState(false);

    // ── Navigation ────────────────────────────────────────────

    const canAdvance = useCallback((): boolean => {
      switch (step) {
        case 0: return true;
        case 1: return academy.name.trim().length > 0;
        case 2: return classData.name.trim().length > 0;
        case 3: return true;
        case 4: return true;
        case 5: return true;
        default: return true;
      }
    }, [step, academy.name, classData.name]);

    const next = () => {
      if (step < TOTAL_STEPS - 1) setStep(step + 1);
    };

    const prev = () => {
      if (step > 0) setStep(step - 1);
    };

    const skip = () => {
      if (step < TOTAL_STEPS - 1) setStep(step + 1);
    };

    const copyToClipboard = async (text: string, setter: (v: boolean) => void) => {
      try {
        await navigator.clipboard.writeText(text);
        setter(true);
        setTimeout(() => setter(false), 2000);
      } catch {
        // Fallback: silent fail
      }
    };

    const currentStep = STEPS[step];
    const progress = ((step + 1) / TOTAL_STEPS) * 100;

    // ── Render ──────────────────────────────────────────────────

    return (
      <div ref={ref} className="mx-auto w-full max-w-lg space-y-6">
        {/* Progress bar */}
        <div className="text-center">
          <p className="text-sm font-medium" style={subtextStyle}>
            Passo {step + 1} de {TOTAL_STEPS}
          </p>
          <div
            className="mt-3 h-2 w-full overflow-hidden"
            style={{
              background: 'var(--bb-depth-4)',
              borderRadius: 'var(--bb-radius-full)',
            }}
          >
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
                background: 'var(--bb-brand-gradient)',
                borderRadius: 'var(--bb-radius-full)',
              }}
            />
          </div>
        </div>

        {/* Card */}
        <div
          className="animate-reveal"
          key={step}
          style={{
            background: 'var(--bb-depth-3)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
            padding: '24px',
          }}
        >
          {/* Header */}
          <h2
            className="text-xl font-bold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            {currentStep.title}
          </h2>
          <p className="mt-1 text-sm" style={subtextStyle}>
            {currentStep.subtitle}
          </p>

          {/* Step content */}
          <div className="mt-6">
            {/* ── Step 1: Welcome ──────────────────────────────── */}
            {step === 0 && (
              <div className="space-y-4 text-center">
                <div
                  className="mx-auto flex h-24 w-24 items-center justify-center text-5xl"
                  style={{
                    background: 'var(--bb-brand-surface)',
                    borderRadius: 'var(--bb-radius-xl)',
                  }}
                >
                  <span style={{ filter: 'grayscale(0)' }}>&#129355;</span>
                </div>
                <p className="text-sm leading-relaxed" style={subtextStyle}>
                  O BlackBelt vai ajudar voce a gerenciar sua academia de artes marciais
                  com check-in inteligente, gestao de turmas, progresso de alunos,
                  financeiro e muito mais.
                </p>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {[
                    { icon: '&#128203;', label: 'Turmas' },
                    { icon: '&#127942;', label: 'Faixas' },
                    { icon: '&#128176;', label: 'Financeiro' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex flex-col items-center gap-1 rounded-lg py-3"
                      style={{ background: 'var(--bb-depth-4)' }}
                    >
                      <span className="text-xl" dangerouslySetInnerHTML={{ __html: item.icon }} />
                      <span className="text-xs font-medium" style={subtextStyle}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 2: Configure Academy ────────────────────── */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium" style={labelStyle}>
                    Nome da academia *
                  </label>
                  <input
                    value={academy.name}
                    onChange={(e) => setAcademy({ ...academy, name: e.target.value })}
                    placeholder="Ex: Academia Fight Club"
                    className="w-full px-3 py-2.5 text-sm focus:outline-none"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium" style={labelStyle}>
                    Logo (opcional)
                  </label>
                  <div
                    className="flex h-24 cursor-pointer items-center justify-center text-sm"
                    style={{
                      border: '2px dashed var(--bb-glass-border)',
                      borderRadius: 'var(--bb-radius-md)',
                      color: 'var(--bb-ink-40)',
                    }}
                  >
                    Clique para fazer upload
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium" style={labelStyle}>
                    Endereco
                  </label>
                  <input
                    value={academy.address}
                    onChange={(e) => setAcademy({ ...academy, address: e.target.value })}
                    placeholder="Rua, numero, bairro, cidade - UF"
                    className="w-full px-3 py-2.5 text-sm focus:outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>
            )}

            {/* ── Step 3: Create First Class ───────────────────── */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium" style={labelStyle}>
                    Nome da turma *
                  </label>
                  <input
                    value={classData.name}
                    onChange={(e) => setClassData({ ...classData, name: e.target.value })}
                    placeholder="Ex: BJJ Iniciante - Noturno"
                    className="w-full px-3 py-2.5 text-sm focus:outline-none"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium" style={labelStyle}>
                    Modalidade
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {MODALITIES.map((mod) => (
                      <button
                        key={mod}
                        onClick={() => setClassData({ ...classData, modality: mod })}
                        className="px-2 py-2 text-xs font-medium transition-all duration-200"
                        style={{
                          background: classData.modality === mod
                            ? 'var(--bb-brand-surface)'
                            : 'var(--bb-depth-4)',
                          color: classData.modality === mod
                            ? 'var(--bb-brand)'
                            : 'var(--bb-ink-60)',
                          border: `1px solid ${classData.modality === mod ? 'var(--bb-brand)' : 'var(--bb-glass-border)'}`,
                          borderRadius: 'var(--bb-radius-sm)',
                        }}
                      >
                        {mod}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium" style={labelStyle}>
                    Horario
                  </label>
                  <input
                    value={classData.schedule}
                    onChange={(e) => setClassData({ ...classData, schedule: e.target.value })}
                    placeholder="Ex: Seg/Qua/Sex 19:00-20:30"
                    className="w-full px-3 py-2.5 text-sm focus:outline-none"
                    style={inputStyle}
                  />
                  <p className="mt-1 text-xs" style={mutedStyle}>
                    Voce pode criar mais turmas depois no painel administrativo.
                  </p>
                </div>
              </div>
            )}

            {/* ── Step 4: Invite Professor ─────────────────────── */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm" style={subtextStyle}>
                  Compartilhe este link com seu professor para que ele possa criar uma conta
                  e comecar a gerenciar turmas.
                </p>

                <div
                  className="rounded-lg p-4"
                  style={{ background: 'var(--bb-depth-4)' }}
                >
                  <p className="mb-2 text-xs font-medium" style={mutedStyle}>
                    Link de convite para professor:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={professorLink}
                      className="flex-1 px-3 py-2 text-xs focus:outline-none"
                      style={{
                        ...inputStyle,
                        background: 'var(--bb-depth-3)',
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(professorLink, setProfessorLinkCopied)}
                    >
                      {professorLinkCopied ? 'Copiado!' : 'Copiar'}
                    </Button>
                  </div>
                  <p className="mt-3 text-xs" style={mutedStyle}>
                    O professor recebera acesso ao painel com visualizacao de turmas,
                    presencas e avaliacoes.
                  </p>
                </div>
              </div>
            )}

            {/* ── Step 5: Student Invite Links ─────────────────── */}
            {step === 4 && (
              <div className="space-y-4">
                <p className="text-sm" style={subtextStyle}>
                  Gere um link de auto-cadastro para compartilhar com seus alunos
                  via WhatsApp, email ou redes sociais.
                </p>

                <div
                  className="rounded-lg p-4"
                  style={{ background: 'var(--bb-depth-4)' }}
                >
                  <p className="mb-2 text-xs font-medium" style={mutedStyle}>
                    Link de convite para alunos:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={studentLink}
                      className="flex-1 px-3 py-2 text-xs focus:outline-none"
                      style={{
                        ...inputStyle,
                        background: 'var(--bb-depth-3)',
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(studentLink, setStudentLinkCopied)}
                    >
                      {studentLinkCopied ? 'Copiado!' : 'Copiar'}
                    </Button>
                  </div>
                  <p className="mt-3 text-xs" style={mutedStyle}>
                    Alunos que acessarem este link poderao criar sua conta
                    e ja estarao vinculados a sua academia.
                  </p>
                </div>
              </div>
            )}

            {/* ── Step 6: All Done ─────────────────────────────── */}
            {step === 5 && (
              <div className="space-y-4 text-center">
                <div
                  className="mx-auto flex h-20 w-20 items-center justify-center text-3xl"
                  style={{
                    background: 'var(--bb-success-surface)',
                    borderRadius: 'var(--bb-radius-full)',
                    color: 'var(--bb-success)',
                  }}
                >
                  &#10003;
                </div>

                <div className="space-y-2">
                  {academy.name && (
                    <div
                      className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm"
                      style={{ background: 'var(--bb-success-surface)' }}
                    >
                      <span style={{ color: 'var(--bb-success)' }}>&#10003;</span>
                      <span style={{ color: 'var(--bb-ink-80)' }}>
                        Academia <strong>{academy.name}</strong> configurada
                      </span>
                    </div>
                  )}
                  {classData.name && (
                    <div
                      className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm"
                      style={{ background: 'var(--bb-success-surface)' }}
                    >
                      <span style={{ color: 'var(--bb-success)' }}>&#10003;</span>
                      <span style={{ color: 'var(--bb-ink-80)' }}>
                        Turma <strong>{classData.name}</strong> criada
                      </span>
                    </div>
                  )}
                  <div
                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm"
                    style={{ background: 'var(--bb-success-surface)' }}
                  >
                    <span style={{ color: 'var(--bb-success)' }}>&#10003;</span>
                    <span style={{ color: 'var(--bb-ink-80)' }}>Links de convite gerados</span>
                  </div>
                  <div
                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm"
                    style={{ background: 'var(--bb-success-surface)' }}
                  >
                    <span style={{ color: 'var(--bb-success)' }}>&#10003;</span>
                    <span style={{ color: 'var(--bb-ink-80)' }}>Pronto para comecar!</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Navigation ──────────────────────────────────────── */}
          <div className="mt-6 flex items-center gap-3">
            {step > 0 && step < TOTAL_STEPS - 1 && (
              <Button variant="ghost" onClick={prev}>
                Voltar
              </Button>
            )}

            {currentStep.skippable && (
              <button
                onClick={skip}
                className="text-sm font-medium transition-colors duration-200"
                style={{ color: 'var(--bb-ink-40)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--bb-ink-60)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--bb-ink-40)'; }}
              >
                Pular
              </button>
            )}

            <div className="flex-1" />

            {step < TOTAL_STEPS - 1 ? (
              <Button
                onClick={next}
                disabled={!canAdvance()}
              >
                {step === 0 ? 'Comecar' : 'Proximo'}
              </Button>
            ) : (
              <Button className="flex-1" onClick={onComplete}>
                Acessar Dashboard
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
export type { OnboardingWizardProps };

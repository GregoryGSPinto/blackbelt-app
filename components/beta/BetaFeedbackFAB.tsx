'use client';

import { forwardRef, useState, useRef } from 'react';
import Image from 'next/image';
import { submitFeedback, uploadScreenshot, type CreateFeedbackDTO } from '@/lib/api/beta-feedback.service';
import { useToast } from '@/lib/hooks/useToast';

const isBetaMode = process.env.NEXT_PUBLIC_BETA_MODE === 'true';

type FeedbackType = CreateFeedbackDTO['feedback_type'];

const FEEDBACK_TYPES: { value: FeedbackType; label: string; icon: string; desc: string }[] = [
  { value: 'bug', label: 'Bug', icon: '\uD83D\uDC1B', desc: 'Algo nao funciona' },
  { value: 'feature_request', label: 'Sugestao', icon: '\uD83D\uDCA1', desc: 'Tenho uma ideia' },
  { value: 'usability', label: 'Usabilidade', icon: '\uD83E\uDD14', desc: 'Confuso ou dificil' },
  { value: 'praise', label: 'Elogio', icon: '\u2764\uFE0F', desc: 'Gostei disso!' },
  { value: 'general', label: 'Geral', icon: '\uD83D\uDCAC', desc: 'Outro assunto' },
];

const BetaFeedbackFAB = forwardRef<HTMLDivElement>(function BetaFeedbackFAB(_, ref) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isBetaMode) return null;

  function reset() {
    setStep(1);
    setFeedbackType(null);
    setTitle('');
    setDescription('');
    setScreenshotUrl(null);
    setScreenshotPreview(null);
    setUploading(false);
    setSubmitting(false);
    setSuccess(false);
  }

  function handleClose() {
    setOpen(false);
    setTimeout(reset, 300);
  }

  function handleSelectType(type: FeedbackType) {
    setFeedbackType(type);
    setStep(2);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast('Arquivo muito grande. Maximo 5MB.', 'error');
      return;
    }
    setScreenshotPreview(URL.createObjectURL(file));
    setUploading(true);
    const url = await uploadScreenshot(file);
    setScreenshotUrl(url);
    setUploading(false);
  }

  async function handleSubmit() {
    if (!feedbackType || !title.trim() || !description.trim()) return;
    setSubmitting(true);
    await submitFeedback({
      feedback_type: feedbackType,
      title: title.trim(),
      description: description.trim(),
      screenshot_url: screenshotUrl || undefined,
    });
    setSubmitting(false);
    setSuccess(true);
    setTimeout(handleClose, 2000);
  }

  return (
    <div ref={ref}>
      {/* FAB Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed z-[90] flex items-center gap-2 rounded-full px-4 py-3 shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
          right: '16px',
          background: 'var(--bb-brand-deep)',
          color: 'var(--bb-depth-1)',
        }}
        aria-label="Enviar feedback"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          <line x1="12" y1="8" x2="12" y2="14" />
          <line x1="9" y1="11" x2="15" y2="11" />
        </svg>
        <span className="text-sm font-semibold">Feedback</span>
      </button>

      {/* Modal Overlay */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
          <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
          <div
            className="relative z-10 w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
              boxShadow: 'var(--bb-shadow-lg)',
            }}
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                {step === 1 && 'Como podemos melhorar?'}
                {step === 2 && 'Detalhes do feedback'}
                {step === 3 && (success ? 'Enviado!' : 'Confirmar envio')}
              </h2>
              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ color: 'var(--bb-ink-40)' }}
                aria-label="Fechar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Step 1: Type Selection */}
            {step === 1 && (
              <div className="space-y-2">
                {FEEDBACK_TYPES.map(ft => (
                  <button
                    key={ft.value}
                    onClick={() => handleSelectType(ft.value)}
                    className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors"
                    style={{
                      background: 'var(--bb-depth-3)',
                      border: '1px solid var(--bb-glass-border)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--bb-depth-3)'; }}
                  >
                    <span className="text-2xl">{ft.icon}</span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{ft.label}</p>
                      <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{ft.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-60)' }}>Titulo *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value.slice(0, 100))}
                    placeholder="Resuma o feedback em uma frase"
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{
                      background: 'var(--bb-depth-3)',
                      border: '1px solid var(--bb-glass-border)',
                      color: 'var(--bb-ink-100)',
                    }}
                  />
                  <p className="mt-1 text-right text-xs" style={{ color: 'var(--bb-ink-40)' }}>{title.length}/100</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-60)' }}>Descricao *</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value.slice(0, 1000))}
                    placeholder="Descreva com detalhes..."
                    rows={4}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                    style={{
                      background: 'var(--bb-depth-3)',
                      border: '1px solid var(--bb-glass-border)',
                      color: 'var(--bb-ink-100)',
                    }}
                  />
                  <p className="mt-1 text-right text-xs" style={{ color: 'var(--bb-ink-40)' }}>{description.length}/1000</p>
                </div>
                <div>
                  <input ref={fileRef} type="file" accept="image/png,image/jpeg" onChange={handleFileChange} className="hidden" />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
                    style={{
                      background: 'var(--bb-depth-3)',
                      border: '1px solid var(--bb-glass-border)',
                      color: 'var(--bb-ink-60)',
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    {uploading ? 'Enviando...' : 'Anexar captura de tela'}
                  </button>
                  {screenshotPreview && (
                    <div className="mt-2">
                      <Image src={screenshotPreview} alt="Preview" width={0} height={0} sizes="100vw" className="h-24 w-auto rounded-lg object-cover" unoptimized />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                    style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-60)' }}
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!title.trim() || !description.trim()}
                    className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-40"
                    style={{ background: 'var(--bb-brand-deep)', color: 'var(--bb-depth-1)' }}
                  >
                    Revisar
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && !success && (
              <div className="space-y-4">
                <div className="rounded-lg p-3" style={{ background: 'var(--bb-depth-3)' }}>
                  <p className="text-xs font-semibold uppercase" style={{ color: 'var(--bb-ink-40)' }}>Tipo</p>
                  <p className="text-sm" style={{ color: 'var(--bb-ink-100)' }}>
                    {FEEDBACK_TYPES.find(f => f.value === feedbackType)?.icon}{' '}
                    {FEEDBACK_TYPES.find(f => f.value === feedbackType)?.label}
                  </p>
                </div>
                <div className="rounded-lg p-3" style={{ background: 'var(--bb-depth-3)' }}>
                  <p className="text-xs font-semibold uppercase" style={{ color: 'var(--bb-ink-40)' }}>Titulo</p>
                  <p className="text-sm" style={{ color: 'var(--bb-ink-100)' }}>{title}</p>
                </div>
                <div className="rounded-lg p-3" style={{ background: 'var(--bb-depth-3)' }}>
                  <p className="text-xs font-semibold uppercase" style={{ color: 'var(--bb-ink-40)' }}>Descricao</p>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--bb-ink-100)' }}>{description}</p>
                </div>
                {screenshotPreview && (
                  <div className="rounded-lg p-3" style={{ background: 'var(--bb-depth-3)' }}>
                    <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--bb-ink-40)' }}>Screenshot</p>
                    <Image src={screenshotPreview} alt="Screenshot" width={0} height={0} sizes="100vw" className="h-20 w-auto rounded-lg object-cover" unoptimized />
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                    style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-60)' }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-60"
                    style={{ background: 'var(--bb-brand-deep)', color: 'var(--bb-depth-1)' }}
                  >
                    {submitting ? 'Enviando...' : 'Enviar feedback'}
                  </button>
                </div>
              </div>
            )}

            {/* Success */}
            {step === 3 && success && (
              <div className="py-8 text-center">
                <p className="text-4xl mb-3">{'\uD83D\uDE4F'}</p>
                <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                  Obrigado! Seu feedback foi registrado.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

BetaFeedbackFAB.displayName = 'BetaFeedbackFAB';

export { BetaFeedbackFAB };

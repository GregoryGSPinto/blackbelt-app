'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { submitFeedback } from '@/lib/api/feedback.service';
import type { FeedbackType } from '@/lib/api/feedback.service';
import { useToast } from '@/lib/hooks/useToast';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { translateError } from '@/lib/utils/error-translator';

// ── Type options ────────────────────────────────────────────────────

const TYPE_OPTIONS: { value: FeedbackType; label: string }[] = [
  { value: 'suggestion', label: 'Sugestao' },
  { value: 'bug', label: 'Bug' },
  { value: 'praise', label: 'Elogio' },
  { value: 'complaint', label: 'Reclamacao' },
  { value: 'other', label: 'Outro' },
];

// ── Component ───────────────────────────────────────────────────────

export function SidebarFeedback() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>('suggestion');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Lock scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  function handleClose() {
    setOpen(false);
    setType('suggestion');
    setMessage('');
    setRating(0);
  }

  async function handleSubmit() {
    if (message.trim().length < 10) {
      toast('A mensagem precisa ter pelo menos 10 caracteres.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const academyId = getActiveAcademyId();
      const result = await submitFeedback(academyId, {
        type,
        message: message.trim(),
        rating: rating > 0 ? rating : undefined,
        page_url: pathname ?? undefined,
      });

      if (result) {
        toast('Feedback enviado com sucesso!', 'success');
        handleClose();
      } else {
        toast('Erro ao enviar feedback. Tente novamente.', 'error');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Sidebar trigger */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 text-sm transition-colors w-full text-left"
        style={{
          padding: '10px 16px',
          borderRadius: 'var(--bb-radius-sm)',
          color: 'var(--bb-ink-60)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          marginTop: '4px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bb-depth-4)';
          e.currentTarget.style.color = 'var(--bb-ink-80)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--bb-ink-60)';
        }}
        title="Enviar feedback"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span>Feedback</span>
      </button>

      {/* Modal Overlay */}
      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
          onClick={(e) => {
            if (e.target === overlayRef.current) handleClose();
          }}
        >
          <div
            className="w-full max-w-md overflow-hidden"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 'var(--bb-radius-lg)',
              boxShadow: 'var(--bb-shadow-lg)',
              animation: 'scaleIn 0.15s ease-out',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
            >
              <div>
                <h2 className="text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                  Envie seu feedback
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--bb-ink-60)' }}>
                  Sua opiniao nos ajuda a melhorar o BlackBelt
                </p>
              </div>
              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                style={{ color: 'var(--bb-ink-60)', background: 'var(--bb-depth-3)' }}
                aria-label="Fechar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-4">
              {/* Type Select */}
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: 'var(--bb-ink-80)' }}
                >
                  Tipo
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as FeedbackType)}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                  style={{
                    background: 'var(--bb-depth-3)',
                    color: 'var(--bb-ink-100)',
                    border: '1px solid var(--bb-glass-border)',
                  }}
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message Textarea */}
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: 'var(--bb-ink-80)' }}
                >
                  Mensagem
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Descreva sua sugestao, problema ou elogio..."
                  rows={4}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none transition-colors"
                  style={{
                    background: 'var(--bb-depth-3)',
                    color: 'var(--bb-ink-100)',
                    border: '1px solid var(--bb-glass-border)',
                  }}
                />
                <p className="text-[11px] mt-1" style={{ color: 'var(--bb-ink-40)' }}>
                  Minimo 10 caracteres ({message.length}/10)
                </p>
              </div>

              {/* Rating Stars (optional) */}
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: 'var(--bb-ink-80)' }}
                >
                  Avaliacao (opcional)
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star === rating ? 0 : star)}
                      className="text-2xl transition-transform hover:scale-110"
                      style={{
                        color: star <= rating ? 'var(--bb-brand)' : 'var(--bb-ink-20)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                      }}
                      aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
                    >
                      {star <= rating ? '\u2605' : '\u2606'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-end gap-3 px-5 py-3"
              style={{ borderTop: '1px solid var(--bb-glass-border)' }}
            >
              <button
                onClick={handleClose}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                style={{ color: 'var(--bb-ink-60)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bb-depth-4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || message.trim().length < 10}
                className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
                style={{
                  background: 'var(--bb-brand)',
                  color: '#fff',
                }}
                onMouseEnter={(e) => {
                  if (!submitting) e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {submitting ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

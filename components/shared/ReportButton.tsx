'use client';

import { useState } from 'react';
import { Flag, X, Loader2 } from 'lucide-react';

interface ReportButtonProps {
  contentType: string;
  contentId?: string;
  reportedUserId?: string;
  userId?: string;
  academyId?: string;
  className?: string;
}

const REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Assédio ou bullying' },
  { value: 'inappropriate', label: 'Conteúdo inadequado' },
  { value: 'hate_speech', label: 'Discurso de ódio' },
  { value: 'violence', label: 'Violência ou ameaça' },
  { value: 'other', label: 'Outro motivo' },
];

export function ReportButton({ contentType, contentId, reportedUserId, userId, academyId, className }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!userId) return null;

  async function handleSubmit() {
    if (!reason) return;
    setLoading(true);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: userId,
          academyId,
          reportedUserId,
          contentType,
          contentId,
          reason,
          description,
        }),
      });
      if (res.ok) {
        setDone(true);
        setTimeout(() => { setOpen(false); setDone(false); setReason(''); setDescription(''); }, 2000);
      }
    } catch { /* silent */ }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1 text-xs opacity-60 hover:opacity-100 transition-opacity ${className || ''}`}
        style={{ color: 'var(--bb-ink-40)' }}
        title="Denunciar"
      >
        <Flag size={14} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div
            className="w-full max-w-sm rounded-xl p-6 relative"
            style={{ background: 'var(--bb-depth-1)', border: '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))' }}
          >
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4" style={{ color: 'var(--bb-ink-60)' }}>
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--bb-ink-100)' }}>
              Denunciar conteúdo
            </h3>

            {done ? (
              <p className="text-sm text-center py-8" style={{ color: '#22C55E' }}>
                Denúncia enviada. Obrigado por ajudar a manter a comunidade segura.
              </p>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--bb-ink-80)' }}>Motivo *</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))', color: 'var(--bb-ink-100)' }}
                  >
                    <option value="">Selecione o motivo</option>
                    {REASONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--bb-ink-80)' }}>Detalhes (opcional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                    style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))', color: 'var(--bb-ink-100)' }}
                    placeholder="Descreva o problema..."
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!reason || loading}
                  className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: '#C62828', color: '#fff' }}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Flag size={16} />}
                  {loading ? 'Enviando...' : 'Enviar denúncia'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

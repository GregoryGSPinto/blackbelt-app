'use client';

import { useState } from 'react';

interface ParentalConsentProps {
  childName: string;
  onAccept: () => void;
  onCancel: () => void;
}

export function ParentalConsent({ childName, onAccept, onCancel }: ParentalConsentProps) {
  const [consent1, setConsent1] = useState(false);
  const [consent2, setConsent2] = useState(false);

  const canProceed = consent1 && consent2;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div
        className="w-full max-w-lg overflow-hidden"
        style={{
          background: 'var(--bb-depth-2, #1a1a2e)',
          border: '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
          borderRadius: 'var(--bb-radius-lg, 12px)',
          boxShadow: 'var(--bb-shadow-xl)',
        }}
      >
        <div className="p-6">
          <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100, #fff)' }}>
            Consentimento Parental
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-60, #999)' }}>
            Para cadastrar <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>{childName}</strong> (menor de 18 anos), o responsavel legal precisa autorizar a coleta e uso de dados conforme a legislacao vigente (LGPD/COPPA).
          </p>

          <div className="mt-6 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent1}
                onChange={(e) => setConsent1(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 rounded"
                style={{ accentColor: 'var(--bb-brand, #ef4444)' }}
              />
              <span className="text-sm" style={{ color: 'var(--bb-ink-100, #fff)' }}>
                Declaro que sou o responsavel legal de <strong>{childName}</strong> e autorizo a coleta de dados conforme a{' '}
                <a href="/privacidade" target="_blank" className="underline" style={{ color: 'var(--bb-brand, #ef4444)' }}>
                  Politica de Privacidade
                </a>{' '}
                do BlackBelt.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent2}
                onChange={(e) => setConsent2(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 rounded"
                style={{ accentColor: 'var(--bb-brand, #ef4444)' }}
              />
              <span className="text-sm" style={{ color: 'var(--bb-ink-100, #fff)' }}>
                Entendo que posso solicitar a exclusao dos dados do menor a qualquer momento em Configuracoes {'>'} Meus Dados.
              </span>
            </label>
          </div>
        </div>

        <div
          className="flex justify-end gap-3 px-6 py-4"
          style={{ borderTop: '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))' }}
        >
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{ color: 'var(--bb-ink-60, #999)' }}
          >
            Cancelar
          </button>
          <button
            onClick={onAccept}
            disabled={!canProceed}
            className="px-4 py-2 text-sm font-bold text-white rounded-lg transition-colors disabled:opacity-40"
            style={{ background: canProceed ? 'var(--bb-brand, #ef4444)' : 'var(--bb-depth-4, #333)' }}
          >
            Autorizar e continuar
          </button>
        </div>
      </div>
    </div>
  );
}

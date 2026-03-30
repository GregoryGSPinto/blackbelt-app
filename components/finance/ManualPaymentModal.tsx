'use client';

import { useState } from 'react';

export interface ManualPaymentData {
  invoiceId: string;
  studentName: string;
  amount: number;
  referenceMonth: string;
}

interface ManualPaymentModalProps {
  open: boolean;
  data: ManualPaymentData | null;
  saving: boolean;
  onClose: () => void;
  onConfirm: (paymentMethod: string, notes: string) => void;
}

const PAYMENT_METHODS = [
  'Dinheiro',
  'PIX (direto)',
  'Transferencia',
  'Cartao (maquininha)',
  'Outro',
];

function fmtCurrency(n: number): string {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtMonth(ref: string): string {
  if (!ref) return '';
  const [y, m] = ref.split('-');
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

export function ManualPaymentModal({ open, data, saving, onClose, onConfirm }: ManualPaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState('Dinheiro');
  const [notes, setNotes] = useState('');

  if (!open || !data) return null;

  const inputCls = 'w-full rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[var(--bb-brand)]/30';
  const inputStyle = { background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' };

  function handleConfirm() {
    onConfirm(paymentMethod, notes);
    setPaymentMethod('Dinheiro');
    setNotes('');
  }

  function handleClose() {
    setPaymentMethod('Dinheiro');
    setNotes('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div
        className="relative z-10 w-full max-w-md rounded-xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            Dar Baixa Manual
          </h2>
          <button
            onClick={handleClose}
            aria-label="Fechar"
            className="text-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
            style={{ color: 'var(--bb-ink-40)' }}
          >
            &times;
          </button>
        </div>

        {/* Invoice info */}
        <div
          className="rounded-lg p-4 space-y-2"
          style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
              Aluno
            </span>
            <span className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
              {data.studentName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
              Valor
            </span>
            <span className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
              R$ {fmtCurrency(data.amount)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
              Referencia
            </span>
            <span className="text-sm font-semibold capitalize" style={{ color: 'var(--bb-ink-100)' }}>
              {fmtMonth(data.referenceMonth)}
            </span>
          </div>
        </div>

        {/* Payment method */}
        <div>
          <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
            Forma de pagamento *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className="rounded-lg px-3 py-2.5 min-h-[44px] text-sm font-medium text-left transition-all"
                style={{
                  border: `2px solid ${paymentMethod === method ? 'var(--bb-brand)' : 'var(--bb-glass-border)'}`,
                  background: paymentMethod === method ? 'var(--bb-brand-surface, rgba(212,175,55,0.05))' : 'transparent',
                  color: 'var(--bb-ink-100)',
                }}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
            Observacoes (opcional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Recebido na recepcao"
            className={inputCls}
            style={inputStyle}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="flex-1 rounded-lg px-4 py-2.5 min-h-[44px] text-sm font-medium transition-all hover:opacity-80"
            style={{
              background: 'var(--bb-depth-2)',
              color: 'var(--bb-ink-80)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving}
            className="flex-1 rounded-lg px-4 py-2.5 min-h-[44px] text-sm font-medium text-white transition-all hover:opacity-80 disabled:opacity-50"
            style={{ background: 'var(--bb-brand)' }}
          >
            {saving ? 'Registrando...' : 'Confirmar Baixa'}
          </button>
        </div>
      </div>
    </div>
  );
}

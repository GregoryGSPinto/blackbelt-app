'use client';

import { useState, useEffect } from 'react';
import { listStudents } from '@/lib/api/student-management.service';
import type { AdminStudentItem } from '@/lib/types/student-management';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

interface ChargeStudentModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface ChargeResult {
  invoiceUrl?: string;
  pixQrCode?: string;
  bankSlipUrl?: string;
}

export function ChargeStudentModal({ open, onClose, onCreated }: ChargeStudentModalProps) {
  const { toast } = useToast();
  const [students, setStudents] = useState<AdminStudentItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<AdminStudentItem | null>(null);
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [billingType, setBillingType] = useState('PIX');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<ChargeResult | null>(null);

  // Default due date: day 10 of next month
  useEffect(() => {
    if (open) {
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth() + 1, 10);
      setDueDate(next.toISOString().split('T')[0]);
      const refMonth = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
      setDescription(`Mensalidade ${refMonth}`);
      setResult(null);
      setSelectedStudent(null);
      setAmountStr('');
      setSearch('');
    }
  }, [open]);

  // Load students
  useEffect(() => {
    if (!open) return;
    listStudents(getActiveAcademyId(), { search: search || undefined })
      .then(setStudents)
      .catch(() => {});
  }, [open, search]);

  async function handleSubmit() {
    if (!selectedStudent) {
      toast('Selecione um aluno', 'error');
      return;
    }
    const amountCents = Math.round(parseFloat(amountStr.replace(',', '.')) * 100);
    if (!amountCents || amountCents <= 0) {
      toast('Informe um valor valido', 'error');
      return;
    }
    if (!dueDate) {
      toast('Informe a data de vencimento', 'error');
      return;
    }

    setSaving(true);
    try {
      const now = new Date();
      const refMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const res = await fetch('/api/academy/charge-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          academyId: getActiveAcademyId(),
          studentProfileId: selectedStudent.profile_id,
          description,
          amountCents,
          billingType,
          dueDate,
          studentName: selectedStudent.display_name,
          studentCpf: '',
          studentEmail: selectedStudent.email || '',
          referenceMonth: refMonth,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || 'Erro ao gerar cobranca', 'error');
        return;
      }
      setResult({
        invoiceUrl: data.invoiceUrl,
        pixQrCode: data.pixQrCode,
        bankSlipUrl: data.bankSlipUrl,
      });
      toast('Cobranca gerada com sucesso!', 'success');
      onCreated();
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  const inputCls = 'w-full rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[var(--bb-brand)]/30';
  const inputStyle = { background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-lg rounded-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Gerar Cobranca</h2>
          <button onClick={onClose} aria-label="Fechar" className="text-xl" style={{ color: 'var(--bb-ink-40)' }}>&times;</button>
        </div>

        {result ? (
          <div className="space-y-4">
            <div
              className="rounded-lg p-4"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
            >
              <p className="font-medium" style={{ color: '#22C55E' }}>Cobranca gerada com sucesso!</p>
            </div>

            {result.invoiceUrl && (
              <div className="space-y-2">
                <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Link de pagamento:</p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={result.invoiceUrl}
                    className={inputCls}
                    style={inputStyle}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.invoiceUrl || '');
                      toast('Link copiado!', 'success');
                    }}
                    className="rounded-lg px-3 min-h-[44px] text-sm font-medium whitespace-nowrap"
                    style={{ background: 'var(--bb-brand)', color: '#fff' }}
                  >
                    Copiar
                  </button>
                </div>
              </div>
            )}

            {result.invoiceUrl && (
              <button
                onClick={() => {
                  const msg = encodeURIComponent(`Ola! Segue o link para pagamento: ${result.invoiceUrl}`);
                  window.open(`https://wa.me/?text=${msg}`, '_blank');
                }}
                className="w-full rounded-lg px-4 py-2 min-h-[44px] text-sm font-medium transition-all hover:opacity-80"
                style={{ background: '#25D366', color: '#fff' }}
              >
                Enviar por WhatsApp
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full rounded-lg px-4 py-2 min-h-[44px] text-sm font-medium"
              style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
            >
              Fechar
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Student selector */}
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Aluno *</label>
              {selectedStudent ? (
                <div className="flex items-center justify-between rounded-lg p-3" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
                  <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{selectedStudent.display_name}</span>
                  <button onClick={() => setSelectedStudent(null)} className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Trocar</button>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    placeholder="Buscar aluno por nome..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                  />
                  {students.length > 0 && (
                    <div
                      className="mt-1 max-h-40 overflow-y-auto rounded-lg"
                      style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
                    >
                      {students.slice(0, 10).map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedStudent(s)}
                          className="w-full text-left px-3 py-2 text-sm hover:opacity-80 transition-all"
                          style={{ color: 'var(--bb-ink-100)', borderBottom: '1px solid var(--bb-glass-border)' }}
                        >
                          {s.display_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Descricao</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputCls}
                style={inputStyle}
              />
            </div>

            {/* Amount */}
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Valor (R$) *</label>
              <input
                type="text"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="150,00"
                className={inputCls}
                style={inputStyle}
              />
            </div>

            {/* Billing type */}
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Metodo de pagamento</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'PIX', label: 'PIX' },
                  { value: 'BOLETO', label: 'Boleto' },
                  { value: 'CREDIT_CARD', label: 'Cartao' },
                ].map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setBillingType(m.value)}
                    className="rounded-lg p-2 text-center text-sm font-medium transition-all"
                    style={{
                      border: `2px solid ${billingType === m.value ? 'var(--bb-brand)' : 'var(--bb-glass-border)'}`,
                      background: billingType === m.value ? 'var(--bb-brand-surface, rgba(212,175,55,0.05))' : 'transparent',
                      color: 'var(--bb-ink-100)',
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Due date */}
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Vencimento *</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputCls}
                style={inputStyle}
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="w-full rounded-lg px-4 py-2.5 min-h-[44px] text-sm font-medium text-white transition-all hover:opacity-80 disabled:opacity-50"
              style={{ background: 'var(--bb-brand)' }}
            >
              {saving ? 'Gerando...' : 'Gerar Cobranca'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

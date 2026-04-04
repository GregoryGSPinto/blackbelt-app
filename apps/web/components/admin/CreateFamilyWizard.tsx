'use client';

import { forwardRef, useState } from 'react';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { createPerson, createFamilyLink } from '@/lib/api/family.service';
import type { FamilyRelationship } from '@/lib/types/domain';

// ── Types ──────────────────────────────────────────────────────────────

interface CreateFamilyWizardProps {
  academyId: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

interface GuardianData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  relationship: FamilyRelationship;
  isAlsoStudent: boolean;
}

interface DependentData {
  name: string;
  birthDate: string;
  gender: string;
  medicalNotes: string;
  hasOwnLogin: boolean;
  email: string;
  password: string;
  classId: string;
  planId: string;
  paymentMethod: string;
  dueDay: string;
  monthlyFee: string;
}

const STEPS = [
  'Responsavel',
  'Dependente 1',
  'Mais Filhos',
  'Turma',
  'Financeiro',
  'Revisao',
];

const PAYMENT_METHOD_OPTIONS = [
  { value: '', label: 'Selecionar forma de pagamento' },
  { value: 'pix', label: 'PIX' },
  { value: 'credit_card', label: 'Cartao de credito' },
  { value: 'debit_card', label: 'Cartao de debito' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'bank_transfer', label: 'Transferencia bancaria' },
] as const;

const DUE_DAY_OPTIONS = [5, 10, 15, 20, 25] as const;

// ── Helpers ─────────────────────────────────────────────────────────────

function calcAge(dateStr: string): number {
  const today = new Date();
  const birth = new Date(dateStr);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function roleFromAge(age: number): string {
  if (age >= 5 && age <= 12) return 'Kids';
  if (age >= 13 && age <= 17) return 'Teen';
  return 'Adulto';
}

// ── Component ──────────────────────────────────────────────────────────

const CreateFamilyWizard = forwardRef<HTMLDivElement, CreateFamilyWizardProps>(
  function CreateFamilyWizard({ academyId: _academyId, onComplete, onCancel }, ref) {
    const { toast } = useToast();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [guardian, setGuardian] = useState<GuardianData>({
      name: '', email: '', phone: '', cpf: '',
      relationship: 'pai', isAlsoStudent: false,
    });
    const [dependents, setDependents] = useState<DependentData[]>([
      { name: '', birthDate: '', gender: '', medicalNotes: '', hasOwnLogin: false, email: '', password: '', classId: '', planId: '', paymentMethod: '', dueDay: '10', monthlyFee: '' },
    ]);

    const canAddMore = dependents.length < 5;

    function addDependent() {
      if (!canAddMore) return;
      setDependents((prev) => [
        ...prev,
        { name: '', birthDate: '', gender: '', medicalNotes: '', hasOwnLogin: false, email: '', password: '', classId: '', planId: '', paymentMethod: '', dueDay: '10', monthlyFee: '' },
      ]);
    }

    function updateDependent(index: number, field: keyof DependentData, value: string | boolean) {
      setDependents((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
    }

    function removeDependent(index: number) {
      if (dependents.length <= 1) return;
      setDependents((prev) => prev.filter((_, i) => i !== index));
    }

    async function handleSubmit() {
      setLoading(true);
      try {
        // 1. Criar Person do responsavel
        const guardianPerson = await createPerson({
          fullName: guardian.name,
          email: guardian.email,
          phone: guardian.phone,
          cpf: guardian.cpf,
        });

        // 2. Para cada dependente
        for (const dep of dependents) {
          if (!dep.name || !dep.birthDate) continue;
          const depPerson = await createPerson({
            fullName: dep.name,
            birthDate: dep.birthDate,
            gender: dep.gender || undefined,
            medicalNotes: dep.medicalNotes || undefined,
          });

          await createFamilyLink({
            guardianPersonId: guardianPerson.id,
            dependentPersonId: depPerson.id,
            relationship: guardian.relationship,
            isPrimaryGuardian: true,
            isFinancialResponsible: true,
          });
        }

        toast(`Familia cadastrada com sucesso! ${dependents.filter((d) => d.name).length} dependente(s)`, 'success');
        onComplete?.();
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }

    const inputStyle = {
      background: 'var(--bb-depth-2)',
      color: 'var(--bb-ink-100)',
      border: '1px solid var(--bb-glass-border)',
    };

    const labelStyle = { color: 'var(--bb-ink-80)' };

    return (
      <div ref={ref} className="flex flex-col gap-6">
        {/* Stepper */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  background: i <= step ? 'var(--bb-brand)' : 'var(--bb-depth-3)',
                  color: i <= step ? '#fff' : 'var(--bb-ink-60)',
                }}
              >
                {i + 1}
              </div>
              <span
                className="hidden text-xs font-medium sm:block"
                style={{ color: i <= step ? 'var(--bb-ink-100)' : 'var(--bb-ink-40)' }}
              >
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div className="mx-1 h-px w-4" style={{ background: 'var(--bb-glass-border)' }} />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Responsavel */}
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Dados do Responsavel</h2>
            <input type="text" value={guardian.name} onChange={(e) => setGuardian({ ...guardian, name: e.target.value })} placeholder="Nome completo *" className="h-12 w-full rounded-lg px-3 text-sm" style={inputStyle} />
            <input type="email" value={guardian.email} onChange={(e) => setGuardian({ ...guardian, email: e.target.value })} placeholder="Email" className="h-12 w-full rounded-lg px-3 text-sm" style={inputStyle} />
            <input type="tel" value={guardian.phone} onChange={(e) => setGuardian({ ...guardian, phone: e.target.value })} placeholder="Telefone *" className="h-12 w-full rounded-lg px-3 text-sm" style={inputStyle} />
            <input type="text" value={guardian.cpf} onChange={(e) => setGuardian({ ...guardian, cpf: e.target.value })} placeholder="CPF (opcional)" className="h-12 w-full rounded-lg px-3 text-sm" style={inputStyle} />
            <select value={guardian.relationship} onChange={(e) => setGuardian({ ...guardian, relationship: e.target.value as FamilyRelationship })} className="h-12 w-full rounded-lg px-3 text-sm" style={inputStyle}>
              <option value="pai">Pai</option>
              <option value="mae">Mae</option>
              <option value="avo">Avo</option>
              <option value="responsavel_legal">Responsavel Legal</option>
              <option value="outro">Outro</option>
            </select>
            <label className="flex items-center gap-2 text-sm" style={labelStyle}>
              <input type="checkbox" checked={guardian.isAlsoStudent} onChange={(e) => setGuardian({ ...guardian, isAlsoStudent: e.target.checked })} />
              Este responsavel tambem e aluno da academia
            </label>
          </div>
        )}

        {/* Step 1-2: Dependentes */}
        {(step === 1 || step === 2) && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {step === 1 ? 'Dados do Dependente' : 'Adicionar Mais Filhos'}
            </h2>
            {dependents.map((dep, idx) => {
              const age = dep.birthDate ? calcAge(dep.birthDate) : null;
              const show = step === 1 ? idx === 0 : idx > 0;
              if (!show && step === 2) return null;
              if (step === 1 && idx > 0) return null;
              return (
                <div key={idx} className="flex flex-col gap-3 rounded-lg p-4" style={{ background: 'var(--bb-depth-1)', border: '1px solid var(--bb-glass-border)' }}>
                  {idx > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>Filho {idx + 1}</span>
                      <button type="button" onClick={() => removeDependent(idx)} className="text-xs" style={{ color: 'var(--bb-error, #ef4444)' }}>Remover</button>
                    </div>
                  )}
                  <input type="text" value={dep.name} onChange={(e) => updateDependent(idx, 'name', e.target.value)} placeholder="Nome completo *" className="h-12 w-full rounded-lg px-3 text-sm" style={inputStyle} />
                  <input type="date" value={dep.birthDate} onChange={(e) => updateDependent(idx, 'birthDate', e.target.value)} className="h-12 w-full rounded-lg px-3 text-sm" style={inputStyle} />
                  {age !== null && <span className="text-xs" style={{ color: 'var(--bb-brand)' }}>{age} anos — {roleFromAge(age)}</span>}
                  <textarea value={dep.medicalNotes} onChange={(e) => updateDependent(idx, 'medicalNotes', e.target.value)} placeholder="Observacoes medicas (opcional)" rows={2} className="w-full rounded-lg p-3 text-sm" style={inputStyle} />
                  {age !== null && age >= 13 && age <= 17 && (
                    <label className="flex items-center gap-2 text-sm" style={labelStyle}>
                      <input type="checkbox" checked={dep.hasOwnLogin} onChange={(e) => updateDependent(idx, 'hasOwnLogin', e.target.checked)} />
                      Teen tera login proprio
                    </label>
                  )}
                  {dep.hasOwnLogin && (
                    <div className="flex flex-col gap-2">
                      <input type="email" value={dep.email} onChange={(e) => updateDependent(idx, 'email', e.target.value)} placeholder="Email do teen" className="h-12 w-full rounded-lg px-3 text-sm" style={inputStyle} />
                      <input type="password" value={dep.password} onChange={(e) => updateDependent(idx, 'password', e.target.value)} placeholder="Senha" className="h-12 w-full rounded-lg px-3 text-sm" style={inputStyle} />
                    </div>
                  )}
                </div>
              );
            })}
            {step === 2 && canAddMore && (
              <button type="button" onClick={addDependent} className="rounded-lg px-4 py-2 text-sm font-medium" style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-brand)', border: '1px solid var(--bb-brand)' }}>
                + Adicionar outro filho
              </button>
            )}
          </div>
        )}

        {/* Step 3: Turma */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Selecionar Turma</h2>
            {dependents.filter((d) => d.name).map((dep, idx) => (
              <div key={idx} className="flex flex-col gap-2 rounded-lg p-4" style={{ background: 'var(--bb-depth-1)', border: '1px solid var(--bb-glass-border)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{dep.name}</span>
                <select value={dep.classId} onChange={(e) => updateDependent(idx, 'classId', e.target.value)} className="h-12 w-full rounded-lg px-3 text-sm" style={inputStyle}>
                  <option value="">Selecionar turma</option>
                  <option value="class-kids-1">BJJ Kids — Seg/Qua 16h</option>
                  <option value="class-kids-2">BJJ Kids — Ter/Qui 16h</option>
                  <option value="class-teen-1">BJJ Teen — Seg/Qua 17h</option>
                  <option value="class-teen-2">BJJ Teen — Ter/Qui 17h</option>
                </select>
              </div>
            ))}
          </div>
        )}

        {/* Step 4: Financeiro */}
        {step === 4 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Financeiro</h2>
            <div className="rounded-lg p-4" style={{ background: 'var(--bb-depth-1)', border: '1px solid var(--bb-glass-border)' }}>
              <p className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>Pagador: <strong style={{ color: 'var(--bb-ink-100)' }}>{guardian.name || 'Responsavel'}</strong></p>
            </div>
            {dependents.filter((d) => d.name).map((dep, idx) => (
              <div key={idx} className="flex flex-col gap-3 rounded-lg p-4" style={{ background: 'var(--bb-depth-1)', border: '1px solid var(--bb-glass-border)' }}>
                <span className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>{dep.name}</span>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium" style={labelStyle}>Plano</span>
                  <select value={dep.planId} onChange={(e) => updateDependent(idx, 'planId', e.target.value)} className="h-12 w-full rounded-lg px-3 text-sm" style={inputStyle}>
                    <option value="">Selecionar plano</option>
                    <option value="plan-mensal">Mensal — R$ 149/mes</option>
                    <option value="plan-trimestral">Trimestral — R$ 129/mes</option>
                    <option value="plan-semestral">Semestral — R$ 109/mes</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium" style={labelStyle}>Forma de pagamento</span>
                  <select value={dep.paymentMethod} onChange={(e) => updateDependent(idx, 'paymentMethod', e.target.value)} className="h-12 w-full rounded-lg px-3 text-sm" style={inputStyle}>
                    {PAYMENT_METHOD_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium" style={labelStyle}>Dia de vencimento</span>
                    <select value={dep.dueDay} onChange={(e) => updateDependent(idx, 'dueDay', e.target.value)} className="h-12 w-full rounded-lg px-3 text-sm" style={inputStyle}>
                      {DUE_DAY_OPTIONS.map((d) => (
                        <option key={d} value={String(d)}>Dia {d}</option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium" style={labelStyle}>Mensalidade (R$)</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={dep.monthlyFee}
                      onChange={(e) => updateDependent(idx, 'monthlyFee', e.target.value.replace(/[^\d,]/g, ''))}
                      className="h-12 w-full rounded-lg px-3 text-sm"
                      style={inputStyle}
                    />
                  </label>
                </div>
              </div>
            ))}
            {dependents.filter((d) => d.name).length >= 2 && (
              <div className="rounded-lg p-4" style={{ background: 'var(--bb-brand-surface)', border: '1px solid var(--bb-brand)' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--bb-brand)' }}>
                  Sugestao: Plano Familia — Economize ate 15% com 2+ filhos
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Revisao */}
        {step === 5 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Revisao Final</h2>
            <div className="rounded-lg p-4" style={{ background: 'var(--bb-depth-1)', border: '1px solid var(--bb-glass-border)' }}>
              <p className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>Responsavel</p>
              <p className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>{guardian.name} — {guardian.email || 'sem email'} — {guardian.phone || 'sem telefone'}</p>
            </div>
            {dependents.filter((d) => d.name).map((dep, idx) => {
              const age = dep.birthDate ? calcAge(dep.birthDate) : null;
              const paymentLabel = PAYMENT_METHOD_OPTIONS.find((o) => o.value === dep.paymentMethod)?.label;
              return (
                <div key={idx} className="rounded-lg p-4" style={{ background: 'var(--bb-depth-1)', border: '1px solid var(--bb-glass-border)' }}>
                  <p className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>{dep.name}</p>
                  <p className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                    {age !== null && `${age} anos (${roleFromAge(age)})`}
                    {dep.hasOwnLogin && ' — Login proprio'}
                  </p>
                  {(dep.paymentMethod || dep.monthlyFee) && (
                    <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                      {paymentLabel && `${paymentLabel}`}
                      {dep.monthlyFee && ` — R$ ${dep.monthlyFee}`}
                      {dep.dueDay && ` — Venc. dia ${dep.dueDay}`}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 && (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="flex-1 rounded-lg px-4 py-3 text-sm font-medium" style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}>
              Voltar
            </button>
          )}
          {step === 0 && onCancel && (
            <button type="button" onClick={onCancel} className="flex-1 rounded-lg px-4 py-3 text-sm font-medium" style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}>
              Cancelar
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => setStep((s) => s + 1)} className="flex-1 rounded-lg px-4 py-3 text-sm font-bold" style={{ background: 'var(--bb-brand)', color: '#fff' }}>
              Proximo
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading} className="flex-1 rounded-lg px-4 py-3 text-sm font-bold disabled:opacity-50" style={{ background: 'var(--bb-brand)', color: '#fff' }}>
              {loading ? 'Cadastrando...' : 'Confirmar Cadastro'}
            </button>
          )}
        </div>
      </div>
    );
  },
);

CreateFamilyWizard.displayName = 'CreateFamilyWizard';

export { CreateFamilyWizard };
export type { CreateFamilyWizardProps };

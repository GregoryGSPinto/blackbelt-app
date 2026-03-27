'use client';

import { useState } from 'react';
import { PLANS, type AsaasPlan, type BillingData } from '@/lib/types/billing';

interface BillingStepProps {
  selectedPlanId: string;
  onPlanChange: (planId: string) => void;
  onBillingDataChange: (data: BillingData) => void;
  billingData: Partial<BillingData>;
}

export function BillingStep({ selectedPlanId, onPlanChange, onBillingDataChange, billingData }: BillingStepProps) {
  const [billingType, setBillingType] = useState<'pix' | 'boleto' | 'credit_card'>(billingData.billingType || 'pix');

  const selectedPlan: AsaasPlan = PLANS.find(p => p.id === selectedPlanId) || PLANS[0];

  function update(partial: Partial<BillingData>) {
    onBillingDataChange({ ...billingData as BillingData, ...partial });
  }

  const inputCls = "w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--bb-brand)]/30";
  const inputStyle = { background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' };
  const labelCls = "mb-1 block text-sm font-medium";
  const labelStyle = { color: 'var(--bb-ink-80)' };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Escolha seu plano</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--bb-ink-60)' }}>
          Teste gratis por 7 dias com acesso completo ao plano Black Belt.
          A cobranca comeca so apos o trial.
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PLANS.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => onPlanChange(plan.id)}
            className="relative w-full rounded-xl p-4 text-left transition-all"
            style={{
              background: selectedPlanId === plan.id ? 'var(--bb-depth-2)' : 'var(--bb-depth-4)',
              border: `2px solid ${selectedPlanId === plan.id ? 'var(--bb-brand)' : 'var(--bb-glass-border)'}`,
            }}
          >
            {plan.popular && (
              <span
                className="absolute -top-2 right-4 rounded-full px-3 py-0.5 text-[10px] font-bold text-white"
                style={{ background: 'var(--bb-brand)' }}
              >
                MAIS POPULAR
              </span>
            )}
            <div className="flex items-center justify-between">
              <span className="font-bold" style={{ color: 'var(--bb-ink-100)' }}>{plan.name}</span>
              <span className="font-bold" style={{ color: 'var(--bb-brand)' }}>R${plan.price}/mes</span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--bb-ink-40)' }}>
              {plan.maxStudents ? `Ate ${plan.maxStudents} alunos` : 'Alunos ilimitados'}
            </p>
            <ul className="mt-2 space-y-1">
              {plan.features.slice(0, 3).map((f, i) => (
                <li key={i} className="text-xs flex items-center gap-1.5" style={{ color: 'var(--bb-ink-60)' }}>
                  <span style={{ color: 'var(--bb-brand)' }}>&#10003;</span> {f}
                </li>
              ))}
              {plan.features.length > 3 && (
                <li className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  + {plan.features.length - 3} mais...
                </li>
              )}
            </ul>
          </button>
        ))}
      </div>

      {/* Billing data */}
      <div className="rounded-xl p-5 space-y-5" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
        <div>
          <h3 className="font-bold" style={{ color: 'var(--bb-ink-100)' }}>Dados para cobranca</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--bb-ink-60)' }}>
            A primeira cobranca de R${selectedPlan.price}/mes sera gerada apos 7 dias gratis.
          </p>
        </div>

        {/* Payment method */}
        <div>
          <label className={labelCls} style={labelStyle}>Como prefere pagar?</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: 'pix' as const, label: 'PIX', desc: '5% desconto' },
              { value: 'boleto' as const, label: 'Boleto', desc: 'Vence em 3 dias' },
              { value: 'credit_card' as const, label: 'Cartao', desc: 'Recorrente' },
            ] as const).map((method) => (
              <button
                key={method.value}
                type="button"
                onClick={() => {
                  setBillingType(method.value);
                  update({ billingType: method.value });
                }}
                className="p-3 rounded-lg text-center transition-all"
                style={{
                  border: `2px solid ${billingType === method.value ? 'var(--bb-brand)' : 'var(--bb-glass-border)'}`,
                  background: billingType === method.value ? 'var(--bb-brand-surface, rgba(212,175,55,0.05))' : 'transparent',
                }}
              >
                <div className="font-medium text-sm" style={{ color: 'var(--bb-ink-100)' }}>{method.label}</div>
                <div className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{method.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Billing info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={labelCls} style={labelStyle}>Nome completo *</label>
            <input
              type="text"
              value={billingData.name || ''}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Nome do responsavel financeiro"
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>CPF ou CNPJ *</label>
            <input
              type="text"
              value={billingData.cpfCnpj || ''}
              onChange={(e) => update({ cpfCnpj: e.target.value })}
              placeholder="000.000.000-00"
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>E-mail de cobranca *</label>
            <input
              type="email"
              value={billingData.email || ''}
              onChange={(e) => update({ email: e.target.value })}
              placeholder="financeiro@academia.com"
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>WhatsApp *</label>
            <input
              type="tel"
              value={billingData.phone || ''}
              onChange={(e) => update({ phone: e.target.value })}
              placeholder="(31) 99999-9999"
              className={inputCls}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Address for boleto */}
        {billingType === 'boleto' && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm" style={{ color: 'var(--bb-ink-80)' }}>Endereco (obrigatorio para boleto)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                placeholder="CEP *"
                value={billingData.address?.cep || ''}
                onChange={(e) => update({ address: { ...billingData.address as BillingData['address'] & object, cep: e.target.value } })}
                className={inputCls}
                style={inputStyle}
              />
              <div className="md:col-span-2">
                <input
                  placeholder="Rua *"
                  value={billingData.address?.street || ''}
                  onChange={(e) => update({ address: { ...billingData.address as BillingData['address'] & object, street: e.target.value } })}
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <input
                placeholder="Numero"
                value={billingData.address?.number || ''}
                onChange={(e) => update({ address: { ...billingData.address as BillingData['address'] & object, number: e.target.value } })}
                className={inputCls}
                style={inputStyle}
              />
              <input
                placeholder="Complemento"
                value={billingData.address?.complement || ''}
                onChange={(e) => update({ address: { ...billingData.address as BillingData['address'] & object, complement: e.target.value } })}
                className={inputCls}
                style={inputStyle}
              />
              <input
                placeholder="Bairro"
                value={billingData.address?.neighborhood || ''}
                onChange={(e) => update({ address: { ...billingData.address as BillingData['address'] & object, neighborhood: e.target.value } })}
                className={inputCls}
                style={inputStyle}
              />
              <input
                placeholder="Cidade/UF"
                value={billingData.address?.city || ''}
                onChange={(e) => update({ address: { ...billingData.address as BillingData['address'] & object, city: e.target.value } })}
                className={inputCls}
                style={inputStyle}
              />
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="rounded-lg p-4" style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>Plano {selectedPlan.name}</p>
              <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                Cobranca mensal via {billingType === 'pix' ? 'PIX' : billingType === 'boleto' ? 'Boleto' : 'Cartao'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>R${selectedPlan.price}/mes</p>
              {billingType === 'pix' && (
                <p className="text-xs" style={{ color: 'var(--bb-success, #22c55e)' }}>
                  Com PIX: R${Math.round(selectedPlan.price * 0.95)}/mes (5% off)
                </p>
              )}
            </div>
          </div>
          <div className="mt-3 pt-3 text-xs space-y-1" style={{ borderTop: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-40)' }}>
            <p>&#10003; 7 dias gratis com acesso Black Belt completo</p>
            <p>&#10003; Primeira cobranca em {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}</p>
            <p>&#10003; Cancele quando quiser, sem multa</p>
          </div>
        </div>
      </div>
    </div>
  );
}

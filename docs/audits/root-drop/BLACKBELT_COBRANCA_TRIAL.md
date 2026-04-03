# BLACKBELT v2 — COBRANÇA AUTOMÁTICA PÓS-TRIAL
## Coletar Dados de Pagamento no Cadastro + Cobrar Após 7 Dias
## Integração real com Asaas (PIX, Boleto, Cartão)

> **INSTRUÇÕES DE EXECUÇÃO:**
> - Execute BLOCO a BLOCO, na ordem (B1 → B7)
> - Cada BLOCO termina com: `pnpm typecheck && pnpm build` → commit → push
> - PRÉ-REQUISITO: Asaas configurado (.env.local tem ASAAS_API_KEY)
> - Base: wizard de onboarding JÁ existe, planos JÁ existem

---

## BLOCO 1 — MIGRATION: TABELAS DE TRIAL E ASSINATURA

Criar `supabase/migrations/077_trial_billing.sql`:

```sql
-- ═══════════════════════════════════════════════════════════════
-- TRIAL + BILLING AUTOMÁTICO
-- ═══════════════════════════════════════════════════════════════

-- Coluna de trial na academia
ALTER TABLE academies ADD COLUMN IF NOT EXISTS trial_starts_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE academies ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT now() + interval '7 days';
ALTER TABLE academies ADD COLUMN IF NOT EXISTS trial_converted BOOLEAN DEFAULT false;
ALTER TABLE academies ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'trial'
  CHECK (subscription_status IN ('trial', 'active', 'past_due', 'cancelled', 'suspended'));
ALTER TABLE academies ADD COLUMN IF NOT EXISTS plan_id VARCHAR(30) DEFAULT 'starter';
ALTER TABLE academies ADD COLUMN IF NOT EXISTS asaas_customer_id VARCHAR(255);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS asaas_subscription_id VARCHAR(255);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS billing_type VARCHAR(20) DEFAULT 'pix'
  CHECK (billing_type IN ('pix', 'boleto', 'credit_card'));
ALTER TABLE academies ADD COLUMN IF NOT EXISTS billing_name VARCHAR(200);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS billing_cpf_cnpj VARCHAR(18);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS billing_email VARCHAR(255);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS billing_phone VARCHAR(20);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS billing_address_cep VARCHAR(10);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS billing_address_street VARCHAR(255);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS billing_address_number VARCHAR(20);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS billing_address_complement VARCHAR(100);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS billing_address_neighborhood VARCHAR(100);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS billing_address_city VARCHAR(100);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS billing_address_state VARCHAR(2);

-- Tabela de assinaturas
CREATE TABLE IF NOT EXISTS academy_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  plan_id VARCHAR(30) NOT NULL,
  plan_name VARCHAR(100) NOT NULL,
  price_cents INTEGER NOT NULL,
  billing_type VARCHAR(20) NOT NULL DEFAULT 'pix',
  asaas_subscription_id VARCHAR(255),
  asaas_customer_id VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'past_due', 'cancelled', 'suspended')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  next_due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(academy_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_academy ON academy_subscriptions(academy_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON academy_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_asaas ON academy_subscriptions(asaas_subscription_id);

-- RLS
ALTER TABLE academy_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sub_admin') THEN
    CREATE POLICY "sub_admin" ON academy_subscriptions FOR ALL USING (
      academy_id IN (SELECT public.get_my_academy_ids())
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sub_insert') THEN
    CREATE POLICY "sub_insert" ON academy_subscriptions FOR INSERT WITH CHECK (true);
  END IF;
END $$;
```

Rodar: `supabase db push --include-all <<< "y"`

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: migration 077 — trial billing tables and subscription tracking`

---

## BLOCO 2 — TIPOS E CONFIGURAÇÃO DE PLANOS

### 2A. Criar/atualizar `lib/types/billing.ts`:

```typescript
export interface Plan {
  id: string;
  name: string;
  price: number; // em reais
  priceCents: number;
  maxStudents: number | null; // null = ilimitado
  maxUnits: number | null;
  maxProfessors: number | null;
  features: string[];
  popular?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 79,
    priceCents: 7900,
    maxStudents: 50,
    maxUnits: 1,
    maxProfessors: 2,
    features: [
      'Gestão de alunos',
      'Check-in por QR Code',
      'Financeiro básico',
      'Agenda de aulas',
      'Notificações',
    ],
  },
  {
    id: 'essencial',
    name: 'Essencial',
    price: 149,
    priceCents: 14900,
    maxStudents: 100,
    maxUnits: 1,
    maxProfessors: 5,
    features: [
      'Tudo do Starter',
      'Biblioteca de vídeos',
      'Certificados digitais',
      'Relatórios avançados',
      'Comunicação com responsáveis',
      'App do aluno',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 249,
    priceCents: 24900,
    maxStudents: 200,
    maxUnits: 2,
    maxProfessors: null,
    popular: true,
    features: [
      'Tudo do Essencial',
      'Módulo Compete (campeonatos)',
      'Gamificação teen',
      'Currículo técnico',
      'Contratos digitais',
      'Estoque',
    ],
  },
  {
    id: 'blackbelt',
    name: 'Black Belt',
    price: 397,
    priceCents: 39700,
    maxStudents: null,
    maxUnits: null,
    maxProfessors: null,
    features: [
      'Tudo do Pro',
      'Painel franqueador',
      'White-label',
      'API access',
      'Suporte prioritário',
      'Relatórios multi-unidade',
    ],
  },
];

export interface BillingData {
  planId: string;
  billingType: 'pix' | 'boleto' | 'credit_card';
  name: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  address?: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  // Cartão (só se billingType === 'credit_card')
  cardToken?: string;
}

export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'suspended';

export function getPlan(planId: string): Plan | undefined {
  return PLANS.find(p => p.id === planId);
}

export function formatPrice(price: number): string {
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
}

export function getTrialDaysRemaining(trialEndsAt: string | Date): number {
  const end = new Date(trialEndsAt);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function isTrialExpired(trialEndsAt: string | Date): boolean {
  return getTrialDaysRemaining(trialEndsAt) === 0;
}
```

**Commit:** `feat: billing types and plan config`

---

## BLOCO 3 — STEP DE PAGAMENTO NO WIZARD DE ONBOARDING

### 3A. Encontrar o wizard de cadastro existente

```bash
grep -rn "wizard\|Wizard\|onboarding\|Onboarding\|cadastrar-academia\|cadastro.*academia" app/ components/ --include="*.tsx" | head -20
```

### 3B. Criar componente `components/onboarding/BillingStep.tsx`

Este é o ÚLTIMO step do wizard, ANTES de finalizar o cadastro.

```typescript
'use client';

import { useState } from 'react';
import { PLANS, Plan, BillingData } from '@/lib/types/billing';

interface BillingStepProps {
  selectedPlanId: string;
  onPlanChange: (planId: string) => void;
  onBillingDataChange: (data: BillingData) => void;
  billingData: Partial<BillingData>;
}

export function BillingStep({ selectedPlanId, onPlanChange, onBillingDataChange, billingData }: BillingStepProps) {
  const [billingType, setBillingType] = useState<'pix' | 'boleto' | 'credit_card'>(billingData.billingType || 'pix');

  const selectedPlan = PLANS.find(p => p.id === selectedPlanId) || PLANS[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Escolha seu plano</h2>
        <p className="text-gray-500 mt-2">
          Teste grátis por 7 dias com acesso completo ao plano Black Belt.
          <br />
          Sem cartão agora — a cobrança começa só após o trial.
        </p>
      </div>

      {/* Cards de planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            onClick={() => onPlanChange(plan.id)}
            className={`
              relative cursor-pointer rounded-xl border-2 p-5 transition-all
              ${selectedPlanId === plan.id
                ? 'border-[var(--bb-primary,#D4AF37)] bg-[var(--bb-primary,#D4AF37)]/5 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--bb-primary,#D4AF37)] text-white text-xs font-bold px-3 py-1 rounded-full">
                MAIS POPULAR
              </span>
            )}
            <h3 className="font-bold text-lg">{plan.name}</h3>
            <div className="mt-2">
              <span className="text-3xl font-bold">R${plan.price}</span>
              <span className="text-gray-500">/mês</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {plan.maxStudents ? `Até ${plan.maxStudents} alunos` : 'Alunos ilimitados'}
            </p>
            <ul className="mt-4 space-y-2">
              {plan.features.slice(0, 4).map((f, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {f}
                </li>
              ))}
              {plan.features.length > 4 && (
                <li className="text-sm text-gray-400">
                  + {plan.features.length - 4} mais...
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>

      {/* Seção de dados de cobrança */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 space-y-6">
        <div>
          <h3 className="font-bold text-lg">Dados para cobrança</h3>
          <p className="text-sm text-gray-500">
            A primeira cobrança de <strong>R${selectedPlan.price}/mês</strong> será gerada
            automaticamente após o período de 7 dias grátis.
          </p>
        </div>

        {/* Método de pagamento */}
        <div>
          <label className="block text-sm font-medium mb-2">Como prefere pagar?</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'pix' as const, label: 'PIX', icon: '⚡', desc: '5% desconto' },
              { value: 'boleto' as const, label: 'Boleto', icon: '📄', desc: 'Vence em 3 dias' },
              { value: 'credit_card' as const, label: 'Cartão', icon: '💳', desc: 'Recorrente' },
            ].map((method) => (
              <button
                key={method.value}
                type="button"
                onClick={() => {
                  setBillingType(method.value);
                  onBillingDataChange({ ...billingData as BillingData, billingType: method.value });
                }}
                className={`
                  p-3 rounded-lg border-2 text-center transition-all
                  ${billingType === method.value
                    ? 'border-[var(--bb-primary,#D4AF37)] bg-[var(--bb-primary,#D4AF37)]/5'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="text-2xl">{method.icon}</div>
                <div className="font-medium text-sm mt-1">{method.label}</div>
                <div className="text-xs text-gray-500">{method.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Dados do responsável financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome completo *</label>
            <input
              type="text"
              value={billingData.name || ''}
              onChange={(e) => onBillingDataChange({ ...billingData as BillingData, name: e.target.value })}
              placeholder="Nome do responsável financeiro"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--bb-primary,#D4AF37)] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">CPF ou CNPJ *</label>
            <input
              type="text"
              value={billingData.cpfCnpj || ''}
              onChange={(e) => onBillingDataChange({ ...billingData as BillingData, cpfCnpj: e.target.value })}
              placeholder="000.000.000-00"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--bb-primary,#D4AF37)] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">E-mail de cobrança *</label>
            <input
              type="email"
              value={billingData.email || ''}
              onChange={(e) => onBillingDataChange({ ...billingData as BillingData, email: e.target.value })}
              placeholder="financeiro@academia.com"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--bb-primary,#D4AF37)] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">WhatsApp *</label>
            <input
              type="tel"
              value={billingData.phone || ''}
              onChange={(e) => onBillingDataChange({ ...billingData as BillingData, phone: e.target.value })}
              placeholder="(31) 99999-9999"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--bb-primary,#D4AF37)] focus:border-transparent"
            />
          </div>
        </div>

        {/* Endereço (obrigatório para boleto) */}
        {billingType === 'boleto' && (
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Endereço (obrigatório para boleto)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-1">CEP *</label>
                <input
                  type="text"
                  placeholder="30000-000"
                  className="w-full px-3 py-2 border rounded-lg"
                  onChange={(e) => onBillingDataChange({
                    ...billingData as BillingData,
                    address: { ...billingData.address as any, cep: e.target.value }
                  })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Rua *</label>
                <input
                  type="text"
                  placeholder="Rua da Academia"
                  className="w-full px-3 py-2 border rounded-lg"
                  onChange={(e) => onBillingDataChange({
                    ...billingData as BillingData,
                    address: { ...billingData.address as any, street: e.target.value }
                  })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input placeholder="Número" className="px-3 py-2 border rounded-lg" />
              <input placeholder="Complemento" className="px-3 py-2 border rounded-lg" />
              <input placeholder="Bairro" className="px-3 py-2 border rounded-lg" />
              <input placeholder="Cidade/UF" className="px-3 py-2 border rounded-lg" />
            </div>
          </div>
        )}

        {/* Resumo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Plano {selectedPlan.name}</p>
              <p className="text-sm text-gray-500">Cobrança mensal via {billingType === 'pix' ? 'PIX' : billingType === 'boleto' ? 'Boleto' : 'Cartão'}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">R${selectedPlan.price}/mês</p>
              {billingType === 'pix' && (
                <p className="text-sm text-green-600">
                  Com PIX: R${(selectedPlan.price * 0.95).toFixed(0)}/mês (5% off)
                </p>
              )}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t text-sm text-gray-500">
            ✅ 7 dias grátis com acesso Black Belt completo<br />
            ✅ Primeira cobrança em {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}<br />
            ✅ Cancele quando quiser, sem multa
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 3C. Integrar no wizard existente

Encontrar o wizard e adicionar o BillingStep como penúltimo ou último step, ANTES de finalizar:

```bash
# Encontrar o wizard
grep -rn "step\|Step\|currentStep\|activeStep" app/cadastrar-academia/ app/(public)/cadastrar/ components/onboarding/ --include="*.tsx" | head -20
```

Adicionar:
1. Import do `BillingStep`
2. State para `billingData` e `selectedPlanId`
3. Novo step no array de steps
4. Renderização condicional do `BillingStep`
5. No submit final, enviar billingData junto com os dados da academia

**Commit:** `feat: billing step in onboarding wizard — plan selection + payment data`

---

## BLOCO 4 — API DE CRIAÇÃO DE ASSINATURA NO ASAAS

### 4A. Criar `app/api/subscriptions/create/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_BASE_URL = process.env.ASAAS_SANDBOX === 'true'
  ? 'https://sandbox.asaas.com/api/v3'
  : 'https://api.asaas.com/api/v3';

async function asaasFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${ASAAS_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'access_token': ASAAS_API_KEY!,
      ...options.headers,
    },
  });
  return res.json();
}

export async function POST(req: NextRequest) {
  if (!ASAAS_API_KEY) {
    return NextResponse.json({ error: 'Asaas não configurado' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const {
      academyId, planId, planName, priceCents,
      billingType, name, cpfCnpj, email, phone, address,
    } = body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // 1. Criar cliente no Asaas
    const customer = await asaasFetch('/customers', {
      method: 'POST',
      body: JSON.stringify({
        name,
        cpfCnpj: cpfCnpj.replace(/\D/g, ''),
        email,
        phone: phone.replace(/\D/g, ''),
        ...(address ? {
          address: address.street,
          addressNumber: address.number,
          complement: address.complement,
          province: address.neighborhood,
          postalCode: address.cep.replace(/\D/g, ''),
          city: address.city,
          state: address.state,
        } : {}),
      }),
    });

    if (customer.errors) {
      return NextResponse.json({ error: 'Erro ao criar cliente no Asaas', details: customer.errors }, { status: 400 });
    }

    // 2. Calcular data da primeira cobrança (7 dias após hoje)
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 7);
    const dueDateStr = nextDueDate.toISOString().split('T')[0]; // YYYY-MM-DD

    // 3. Criar assinatura no Asaas
    const subscription = await asaasFetch('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({
        customer: customer.id,
        billingType: billingType === 'credit_card' ? 'CREDIT_CARD' : billingType === 'boleto' ? 'BOLETO' : 'PIX',
        value: priceCents / 100,
        cycle: 'MONTHLY',
        description: `BlackBelt v2 — Plano ${planName}`,
        nextDueDate: dueDateStr,
        // Desconto 5% no PIX
        ...(billingType === 'pix' ? {
          discount: { value: 5, type: 'PERCENTAGE', dueDateLimitDays: 0 },
        } : {}),
      }),
    });

    if (subscription.errors) {
      return NextResponse.json({ error: 'Erro ao criar assinatura', details: subscription.errors }, { status: 400 });
    }

    // 4. Salvar no banco
    // Atualizar academia
    await supabase.from('academies').update({
      plan_id: planId,
      subscription_status: 'trial',
      trial_starts_at: new Date().toISOString(),
      trial_ends_at: nextDueDate.toISOString(),
      trial_converted: false,
      asaas_customer_id: customer.id,
      asaas_subscription_id: subscription.id,
      billing_type: billingType,
      billing_name: name,
      billing_cpf_cnpj: cpfCnpj,
      billing_email: email,
      billing_phone: phone,
      ...(address ? {
        billing_address_cep: address.cep,
        billing_address_street: address.street,
        billing_address_number: address.number,
        billing_address_complement: address.complement,
        billing_address_neighborhood: address.neighborhood,
        billing_address_city: address.city,
        billing_address_state: address.state,
      } : {}),
    }).eq('id', academyId);

    // Criar registro de assinatura
    await supabase.from('academy_subscriptions').upsert({
      academy_id: academyId,
      plan_id: planId,
      plan_name: planName,
      price_cents: priceCents,
      billing_type: billingType,
      asaas_subscription_id: subscription.id,
      asaas_customer_id: customer.id,
      status: 'pending', // vai virar 'active' quando primeiro pagamento for confirmado
      next_due_date: dueDateStr,
      current_period_start: new Date().toISOString(),
      current_period_end: nextDueDate.toISOString(),
    }, { onConflict: 'academy_id' });

    // Audit log
    await supabase.from('audit_log').insert({
      academy_id: academyId,
      action: 'subscription_created',
      entity_type: 'subscription',
      entity_id: subscription.id,
      new_data: { planId, planName, billingType, customerId: customer.id },
    });

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      customerId: customer.id,
      nextDueDate: dueDateStr,
      trialEndsAt: nextDueDate.toISOString(),
    });

  } catch (error: any) {
    console.error('[subscriptions/create] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**Commit:** `feat: subscription creation API — Asaas customer + subscription + trial`

---

## BLOCO 5 — WEBHOOK: ATUALIZAR STATUS QUANDO PAGAMENTO CONFIRMADO

### 5A. Atualizar `app/api/webhooks/asaas/route.ts`

Adicionar handler para eventos de assinatura:

```typescript
// Dentro do handler existente, adicionar:

// Eventos de assinatura
if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
  // Verificar se é pagamento de assinatura
  if (payload.subscription) {
    // Buscar academia pela assinatura
    const { data: subscription } = await supabase
      .from('academy_subscriptions')
      .select('academy_id')
      .eq('asaas_subscription_id', payload.subscription)
      .single();

    if (subscription) {
      // Atualizar status da assinatura
      await supabase.from('academy_subscriptions').update({
        status: 'active',
        updated_at: new Date().toISOString(),
      }).eq('asaas_subscription_id', payload.subscription);

      // Atualizar academia — trial convertido
      await supabase.from('academies').update({
        subscription_status: 'active',
        trial_converted: true,
      }).eq('id', subscription.academy_id);

      // Enviar email de confirmação
      // await fetch('/api/emails/payment-confirmed', { ... });
    }
  }
}

if (event === 'PAYMENT_OVERDUE') {
  if (payload.subscription) {
    const { data: subscription } = await supabase
      .from('academy_subscriptions')
      .select('academy_id')
      .eq('asaas_subscription_id', payload.subscription)
      .single();

    if (subscription) {
      await supabase.from('academy_subscriptions').update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      }).eq('asaas_subscription_id', payload.subscription);

      await supabase.from('academies').update({
        subscription_status: 'past_due',
      }).eq('id', subscription.academy_id);
    }
  }
}
```

**Commit:** `feat: webhook handles subscription payments — trial conversion + overdue`

---

## BLOCO 6 — INTEGRAR NO FLUXO DE ONBOARDING

### 6A. No submit final do wizard

Quando o wizard é finalizado, APÓS criar a academia e o user no Supabase, chamar a API de assinatura:

```typescript
// Após criar academia com sucesso:
if (billingData.planId && billingData.cpfCnpj) {
  const plan = PLANS.find(p => p.id === billingData.planId);
  if (plan) {
    try {
      const subscriptionRes = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          academyId: newAcademy.id,
          planId: plan.id,
          planName: plan.name,
          priceCents: plan.priceCents,
          billingType: billingData.billingType,
          name: billingData.name,
          cpfCnpj: billingData.cpfCnpj,
          email: billingData.email,
          phone: billingData.phone,
          address: billingData.address,
        }),
      });
      const result = await subscriptionRes.json();
      if (!result.success) {
        console.error('[onboarding] Subscription error:', result.error);
        // NÃO bloquear o cadastro — a academia foi criada
        // Mostrar aviso: "Cadastro criado! Configure o pagamento depois."
      }
    } catch (err) {
      console.error('[onboarding] Subscription fetch error:', err);
    }
  }
}
```

### 6B. TrialBanner atualizado

O `components/trial/TrialBanner.tsx` já existe. Verificar que ele lê `trial_ends_at` da academia e mostra a contagem regressiva. Se o trial expirou e não converteu, mostrar CTA de pagamento.

**Commit:** `feat: onboarding creates Asaas subscription after academy creation`

---

## BLOCO 7 — EDGE FUNCTION: VERIFICAÇÃO DIÁRIA DE TRIALS EXPIRADOS

### 7A. Criar `supabase/functions/check-trials/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Buscar academias com trial expirado que não converteram
    const { data: expiredTrials } = await supabase
      .from('academies')
      .select('id, name, billing_email, trial_ends_at, asaas_subscription_id')
      .eq('subscription_status', 'trial')
      .eq('trial_converted', false)
      .lt('trial_ends_at', new Date().toISOString());

    let updated = 0;
    for (const academy of expiredTrials || []) {
      // Marcar como past_due (a cobrança do Asaas já foi gerada automaticamente)
      await supabase.from('academies').update({
        subscription_status: 'past_due',
      }).eq('id', academy.id);

      updated++;
    }

    return new Response(JSON.stringify({
      checked: expiredTrials?.length || 0,
      updated,
      timestamp: new Date().toISOString(),
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
```

### 7B. Deploy

```bash
supabase functions deploy check-trials
```

### 7C. Configurar CRON (manual no Supabase Dashboard)

No Supabase Dashboard → Edge Functions → check-trials → Schedule:
- Cron: `0 8 * * *` (roda todo dia às 8h)

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: check-trials edge function — daily trial expiration check`

---

## COMANDO DE RETOMADA

```
Continue de onde parou no BLACKBELT_COBRANCA_TRIAL.md. Verifique estado:
ls supabase/migrations/077_trial_billing.sql 2>/dev/null && echo "B1 OK" || echo "B1 FALTA"
ls lib/types/billing.ts 2>/dev/null && echo "B2 OK" || echo "B2 FALTA"
ls components/onboarding/BillingStep.tsx 2>/dev/null && echo "B3 OK" || echo "B3 FALTA"
ls app/api/subscriptions/create/route.ts 2>/dev/null && echo "B4 OK" || echo "B4 FALTA"
grep -q "subscription" app/api/webhooks/asaas/route.ts 2>/dev/null && echo "B5 OK" || echo "B5 FALTA"
ls supabase/functions/check-trials/index.ts 2>/dev/null && echo "B7 OK" || echo "B7 FALTA"
pnpm typecheck 2>&1 | tail -5
Continue da próxima seção incompleta. ZERO erros. Commit e push.
```

---

## FLUXO COMPLETO

```
1. Dono acessa blackbelts.com.br
2. Clica "Começar Grátis — 7 Dias"
3. Wizard: dados pessoais → dados da academia → escolhe plano + dados de cobrança
4. Sistema cria: user + academy + profile + membership no Supabase
5. Sistema cria: customer + subscription no Asaas (primeira cobrança em 7 dias)
6. Dono acessa dashboard admin com acesso Black Belt por 7 dias
7. TrialBanner mostra: "Faltam X dias do trial"
8. Dia 7: Asaas gera cobrança automática (PIX/boleto/cartão)
9. Webhook confirma pagamento → subscription_status = 'active'
10. Se não pagar: subscription_status = 'past_due' → TrialBanner mostra CTA
```

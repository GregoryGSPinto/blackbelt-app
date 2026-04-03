# BLACKBELT v2 — PROMPT COMPLEMENTAR
## O Que o PrimalWOD Está Fazendo e o BlackBelt Ainda Não Tem
## Cruzamento dos gaps: tudo que faltou nos 3 prompts anteriores

> **CONTEXTO:** O PrimalWOD está executando P-030 a P-044 que cobrem:
> - Asaas integração real (billing + subscription + webhook)
> - RLS reforçado (40+ policies para INSERT/UPDATE/DELETE)
> - OAuth Google + Apple real
> - Resend email transacional (6 templates)
> - Consentimento parental LGPD
> - Offline check-in com IndexedDB
> - Trial 14 dias com banner + blocking overlay
> - Onboarding wizard 5 etapas
> - Error/loading pages em todos os route groups
> - AuthGuard client-side em todos os layouts
> - Contato page + API route
> - 12 páginas novas (exportar, notificações, planos, frequência, etc)
> - Screenshots guide + production checklist
>
> Os 3 prompts do BlackBelt (MEGA, REAL, MARCA_FINAL) cobriram:
> - Usabilidade (família, permissões, evolução, wizard)
> - Supabase real (migrations, seeds, edge functions)
> - Segurança (delete account, rate limit, sanitize)
> - Email (Resend), WhatsApp, PDF, paginação
> - Error handling (useQuery, ErrorBoundary)
> - Apple/Google compliance
>
> ESTE PROMPT cobre o que FICOU DE FORA:

---

## SEÇÃO 1 — ASAAS INTEGRAÇÃO REAL (0/10 nos dois apps)

Sem pagamento = sem negócio. Esta é a feature mais crítica que nenhum dos 3 prompts cobriu.

### 1A. Instalar SDK e configurar

```bash
pnpm add axios
# Asaas não tem SDK oficial Node — usamos axios para REST API
```

Criar `lib/payment/asaas.ts`:

```typescript
import axios from 'axios';

const ASAAS_BASE = process.env.ASAAS_SANDBOX === 'true'
  ? 'https://sandbox.asaas.com/api/v3'
  : 'https://api.asaas.com/api/v3';

const asaas = axios.create({
  baseURL: ASAAS_BASE,
  headers: {
    'access_token': process.env.ASAAS_API_KEY!,
    'Content-Type': 'application/json',
  },
});

// === CLIENTES ===

export async function createCustomer(data: {
  name: string;
  email?: string;
  cpfCnpj?: string;
  phone?: string;
  externalReference?: string; // person_id do BlackBelt
}): Promise<{ id: string; externalReference: string }> {
  const response = await asaas.post('/customers', {
    name: data.name,
    email: data.email,
    cpfCnpj: data.cpfCnpj?.replace(/\D/g, ''),
    mobilePhone: data.phone?.replace(/\D/g, ''),
    externalReference: data.externalReference,
    notificationDisabled: false,
  });
  return response.data;
}

export async function findCustomerByExternalRef(ref: string): Promise<{ id: string } | null> {
  const response = await asaas.get(`/customers?externalReference=${ref}`);
  return response.data.data?.[0] || null;
}

// === COBRANÇAS ===

export async function createPayment(data: {
  customerId: string;
  billingType: 'BOLETO' | 'PIX' | 'CREDIT_CARD';
  value: number;
  dueDate: string; // YYYY-MM-DD
  description: string;
  externalReference?: string; // invoice_id do BlackBelt
}): Promise<{
  id: string;
  invoiceUrl: string;
  bankSlipUrl?: string;
  pixQrCode?: { payload: string; encodedImage: string };
  status: string;
}> {
  const response = await asaas.post('/payments', {
    customer: data.customerId,
    billingType: data.billingType,
    value: data.value,
    dueDate: data.dueDate,
    description: data.description,
    externalReference: data.externalReference,
  });

  const payment = response.data;

  // Se PIX, buscar QR code
  if (data.billingType === 'PIX' && payment.id) {
    try {
      const pixResponse = await asaas.get(`/payments/${payment.id}/pixQrCode`);
      payment.pixQrCode = pixResponse.data;
    } catch {
      // PIX pode não estar disponível imediatamente
    }
  }

  return payment;
}

export async function getPayment(paymentId: string): Promise<{
  id: string;
  status: string;
  value: number;
  netValue: number;
  billingType: string;
  confirmedDate?: string;
}> {
  const response = await asaas.get(`/payments/${paymentId}`);
  return response.data;
}

// === ASSINATURAS ===

export async function createSubscription(data: {
  customerId: string;
  billingType: 'BOLETO' | 'PIX' | 'CREDIT_CARD';
  value: number;
  cycle: 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY';
  nextDueDate: string;
  description: string;
  externalReference?: string;
}): Promise<{ id: string; status: string }> {
  const response = await asaas.post('/subscriptions', {
    customer: data.customerId,
    billingType: data.billingType,
    value: data.value,
    cycle: data.cycle,
    nextDueDate: data.nextDueDate,
    description: data.description,
    externalReference: data.externalReference,
  });
  return response.data;
}

// === STATUS MAPPING ===

export function mapAsaasStatus(asaasStatus: string): string {
  const map: Record<string, string> = {
    PENDING: 'pending',
    RECEIVED: 'paid',
    CONFIRMED: 'paid',
    OVERDUE: 'overdue',
    REFUNDED: 'refunded',
    RECEIVED_IN_CASH: 'paid',
    REFUND_REQUESTED: 'refunding',
    CHARGEBACK_REQUESTED: 'chargeback',
    CHARGEBACK_DISPUTE: 'chargeback',
    AWAITING_CHARGEBACK_REVERSAL: 'chargeback',
    DUNNING_REQUESTED: 'overdue',
    DUNNING_RECEIVED: 'paid',
    AWAITING_RISK_ANALYSIS: 'pending',
  };
  return map[asaasStatus] || 'unknown';
}
```

### 1B. Webhook handler

Criar `app/api/webhooks/asaas/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { mapAsaasStatus } from '@/lib/payment/asaas';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event = body.event;
    const payment = body.payment;

    if (!event || !payment) {
      return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 });
    }

    // Validar access token (Asaas envia como query param ou header)
    const url = new URL(request.url);
    const token = url.searchParams.get('access_token');
    if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Log do webhook (audit)
    await supabase.from('webhook_log').insert({
      source: 'asaas',
      event_type: event,
      payload: body,
      external_id: payment.id,
      processed: false,
    });

    // Processar por tipo de evento
    const newStatus = mapAsaasStatus(payment.status);
    const externalRef = payment.externalReference;

    if (externalRef) {
      // Atualizar invoice/fatura no banco
      const { error } = await supabase
        .from('invoices')
        .update({
          status: newStatus,
          paid_at: payment.confirmedDate || null,
          payment_method: payment.billingType?.toLowerCase(),
          external_payment_id: payment.id,
          net_value: payment.netValue,
          updated_at: new Date().toISOString(),
        })
        .eq('id', externalRef);

      if (error) {
        console.error('Erro ao atualizar invoice:', error);
      }

      // Atualizar family_invoice se existe
      await supabase
        .from('family_invoices')
        .update({
          status: newStatus,
          paid_at: payment.confirmedDate || null,
          payment_method: payment.billingType?.toLowerCase(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', externalRef);

      // Notificar (se pagamento confirmado)
      if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
        // TODO: enviar notificação push + email de confirmação
      }

      // Se overdue, notificar admin
      if (event === 'PAYMENT_OVERDUE') {
        // TODO: notificar admin sobre inadimplência
      }
    }

    // Marcar webhook como processado
    await supabase
      .from('webhook_log')
      .update({ processed: true })
      .eq('external_id', payment.id)
      .eq('event_type', event);

    // SEMPRE retornar 200 (mesmo se erro interno) para evitar retry infinito do Asaas
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ received: true }); // 200 mesmo com erro
  }
}
```

### 1C. Migration para webhook_log e campos de pagamento

```sql
-- Webhook log (auditoria de todos os webhooks recebidos)
CREATE TABLE IF NOT EXISTS webhook_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source VARCHAR(30) NOT NULL, -- 'asaas', 'stripe', etc
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  external_id VARCHAR(255),
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_log_source ON webhook_log(source, event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_log_external ON webhook_log(external_id);

ALTER TABLE webhook_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "webhook_superadmin" ON webhook_log FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'superadmin')
);

-- Campos de pagamento nas invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS external_payment_id VARCHAR(255);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS net_value DECIMAL(10,2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_link TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS pix_qr_code TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS pix_payload TEXT;

-- Tabela de clientes Asaas (cache local)
CREATE TABLE IF NOT EXISTS payment_customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID REFERENCES people(id),
  academy_id UUID NOT NULL REFERENCES academies(id),
  external_customer_id VARCHAR(255) NOT NULL, -- ID do Asaas
  provider VARCHAR(30) DEFAULT 'asaas',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(person_id, academy_id, provider)
);

ALTER TABLE payment_customers ENABLE ROW LEVEL SECURITY;
```

### 1D. Service de billing integrado

Criar `lib/api/billing.service.ts`:

```typescript
import { isMock } from '@/lib/utils/mock';
import { handleServiceError } from '@/lib/utils/error';

export interface PaymentResult {
  paymentId: string;
  invoiceUrl: string;
  pixQrCode?: string;
  pixPayload?: string;
  bankSlipUrl?: string;
  status: string;
}

export async function generatePayment(data: {
  invoiceId: string;
  personId: string;
  academyId: string;
  amount: number;
  dueDate: string;
  description: string;
  billingType: 'PIX' | 'BOLETO';
  customerName: string;
  customerEmail?: string;
  customerCpf?: string;
  customerPhone?: string;
}): Promise<PaymentResult> {
  if (isMock()) {
    return {
      paymentId: `pay_mock_${Date.now()}`,
      invoiceUrl: 'https://sandbox.asaas.com/mock-invoice',
      pixQrCode: 'data:image/png;base64,MOCK_QR_CODE_BASE64',
      pixPayload: '00020126580014br.gov.bcb.pix0136mock-pix-key',
      status: 'pending',
    };
  }

  try {
    // Chamar API route que usa o SDK Asaas (server-side)
    const response = await fetch('/api/payments/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao gerar pagamento');
    }

    return response.json();
  } catch (error) {
    throw handleServiceError(error, 'generatePayment');
  }
}
```

### 1E. API route de pagamento

Criar `app/api/payments/generate/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { createCustomer, findCustomerByExternalRef, createPayment } from '@/lib/payment/asaas';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Verificar se não está em modo mock
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      return NextResponse.json({
        paymentId: `pay_mock_${Date.now()}`,
        invoiceUrl: '#mock',
        pixQrCode: null,
        status: 'mock',
      });
    }

    // Verificar se ASAAS_API_KEY está configurada
    if (!process.env.ASAAS_API_KEY) {
      return NextResponse.json({ error: 'Asaas não configurado. Configure ASAAS_API_KEY.' }, { status: 503 });
    }

    // Buscar ou criar customer no Asaas
    let customer = await findCustomerByExternalRef(body.personId);
    if (!customer) {
      customer = await createCustomer({
        name: body.customerName,
        email: body.customerEmail,
        cpfCnpj: body.customerCpf,
        phone: body.customerPhone,
        externalReference: body.personId,
      });
    }

    // Criar pagamento
    const payment = await createPayment({
      customerId: customer.id,
      billingType: body.billingType,
      value: body.amount,
      dueDate: body.dueDate,
      description: body.description,
      externalReference: body.invoiceId,
    });

    // Salvar no banco
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase
      .from('invoices')
      .update({
        external_payment_id: payment.id,
        payment_link: payment.invoiceUrl,
        pix_qr_code: payment.pixQrCode?.encodedImage,
        pix_payload: payment.pixQrCode?.payload,
        payment_method: body.billingType.toLowerCase(),
      })
      .eq('id', body.invoiceId);

    // Salvar customer mapping
    await supabase.from('payment_customers').upsert({
      person_id: body.personId,
      academy_id: body.academyId,
      external_customer_id: customer.id,
      provider: 'asaas',
    }, { onConflict: 'person_id,academy_id,provider' });

    return NextResponse.json({
      paymentId: payment.id,
      invoiceUrl: payment.invoiceUrl,
      pixQrCode: payment.pixQrCode?.encodedImage,
      pixPayload: payment.pixQrCode?.payload,
      bankSlipUrl: payment.bankSlipUrl,
      status: payment.status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao gerar pagamento';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

### 1F. Checkout page para aluno/responsável

Criar `app/(main)/checkout/[invoiceId]/page.tsx`:

```typescript
// Página de checkout:
// 1. Buscar invoice por ID
// 2. Mostrar resumo (aluno, plano, valor, vencimento)
// 3. Seletor: PIX ou Boleto
// 4. Botão "Gerar Pagamento"
// 5. Se PIX: mostra QR code + código copia-e-cola + countdown de expiração
// 6. Se Boleto: mostra código de barras + botão copiar + link para PDF
// 7. Status polling: verifica a cada 5s se pagamento foi confirmado
// 8. Se confirmado: tela de sucesso com confetti 🎉
//
// Mobile-first: QR code grande, botão copiar acessível, feedback visual claro
// Cores: verde para PIX, azul para boleto
```

Criar também `app/(parent)/parent/checkout/[invoiceId]/page.tsx` com mesmo layout mas contexto de responsável.

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: Asaas payment integration — SDK, webhook, checkout page, PIX + boleto`

---

## SEÇÃO 2 — AUDIT LOG (Enterprise-grade)

O PrimalWOD está fazendo P-031 (RLS reforçado). O BlackBelt tem RLS mas não tem audit log.

### 2A. Migration

```sql
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID REFERENCES academies(id),
  user_id UUID REFERENCES auth.users(id),
  profile_id UUID REFERENCES profiles(id),
  action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout', 'export', 'invite'
  entity_type VARCHAR(50) NOT NULL, -- 'student', 'class', 'invoice', 'announcement', 'profile'
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_academy ON audit_log(academy_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Apenas admin e superadmin veem audit log
CREATE POLICY "audit_admin" ON audit_log FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'superadmin')
      AND (p.academy_id = audit_log.academy_id OR p.role = 'superadmin')
  )
);
-- Todos podem inserir (o sistema insere em nome do user)
CREATE POLICY "audit_insert" ON audit_log FOR INSERT WITH CHECK (true);
```

### 2B. Service de audit

Criar `lib/api/audit.service.ts`:

```typescript
import { isMock } from '@/lib/utils/mock';

export async function logAudit(data: {
  academyId?: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'invite' | 'evolve' | 'payment';
  entityType: string;
  entityId?: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
}): Promise<void> {
  if (isMock()) {
    console.log(`[AUDIT] ${data.action} ${data.entityType} ${data.entityId || ''}`);
    return;
  }

  try {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('audit_log').insert({
      academy_id: data.academyId,
      user_id: user?.id,
      action: data.action,
      entity_type: data.entityType,
      entity_id: data.entityId,
      old_data: data.oldData,
      new_data: data.newData,
    });
  } catch {
    // Audit log falhar não pode bloquear a operação principal
    console.error('[AUDIT] Falha ao registrar log');
  }
}
```

### 2C. Integrar audit nos pontos críticos

Adicionar `logAudit()` em:
- Criar aluno → `logAudit({ action: 'create', entityType: 'student', entityId: newId })`
- Editar aluno → `logAudit({ action: 'update', entityType: 'student', oldData, newData })`
- Excluir → `logAudit({ action: 'delete', entityType: 'student' })`
- Login → `logAudit({ action: 'login', entityType: 'session' })`
- Exportar dados → `logAudit({ action: 'export', entityType: 'report' })`
- Gerar pagamento → `logAudit({ action: 'payment', entityType: 'invoice' })`
- Evoluir perfil → `logAudit({ action: 'evolve', entityType: 'profile', oldData: { role: old }, newData: { role: new } })`

### 2D. Página de audit log para admin

Criar `app/(admin)/admin/auditoria/page.tsx`:
- Tabela com: data/hora, usuário, ação, entidade, detalhes
- Filtros: por período, por usuário, por tipo de ação
- Expandir linha: mostra diff old_data vs new_data
- Exportar CSV
- Paginação (usar o usePagination já criado)

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: audit log — enterprise-grade activity tracking + admin page`

---

## SEÇÃO 3 — AUTHGUARD CLIENT-SIDE (PrimalWOD P-039)

O PrimalWOD implementou AuthGuard em todos os 9 layouts. O BlackBelt tem middleware mas pode não ter proteção client-side completa.

### 3A. Verificar e implementar AuthGuard

```bash
grep -rn "AuthGuard\|authGuard\|useAuth.*redirect\|useEffect.*auth\|session.*redirect" app/ --include="*.tsx" | head -10
```

Se não existe, criar `components/auth/AuthGuard.tsx`:

```typescript
'use client';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export function AuthGuard({ children, allowedRoles, redirectTo = '/login' }: AuthGuardProps) {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(redirectTo);
    }
    if (!isLoading && user && profile && !allowedRoles.includes(profile.role)) {
      router.replace('/selecionar-perfil');
    }
  }, [user, profile, isLoading, allowedRoles, redirectTo, router]);

  if (isLoading) return <div className="flex items-center justify-center h-screen"><LoadingSpinner /></div>;
  if (!user || !profile) return null;
  if (!allowedRoles.includes(profile.role)) return null;

  return <>{children}</>;
}
```

Integrar em CADA layout de route group:
- `app/(admin)/layout.tsx` → `<AuthGuard allowedRoles={['admin']}>`
- `app/(professor)/layout.tsx` → `<AuthGuard allowedRoles={['professor']}>`
- `app/(main)/layout.tsx` → `<AuthGuard allowedRoles={['aluno_adulto']}>`
- `app/(teen)/layout.tsx` → `<AuthGuard allowedRoles={['aluno_teen']}>`
- `app/(kids)/layout.tsx` → `<AuthGuard allowedRoles={['aluno_kids']}>`
- `app/(parent)/layout.tsx` → `<AuthGuard allowedRoles={['responsavel']}>`
- `app/(recepcao)/layout.tsx` → `<AuthGuard allowedRoles={['recepcionista']}>`
- `app/(superadmin)/layout.tsx` → `<AuthGuard allowedRoles={['superadmin']}>`
- `app/(franqueador)/layout.tsx` → `<AuthGuard allowedRoles={['franqueador']}>`

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: AuthGuard client-side — role-based route protection in all 9 layouts`

---

## SEÇÃO 4 — LOADING + ERROR PAGES EM TODOS OS ROUTE GROUPS (PrimalWOD P-038)

### 4A. Verificar cobertura

```bash
# Quais route groups têm loading.tsx e error.tsx?
for dir in app/\(admin\) app/\(professor\) app/\(main\) app/\(teen\) app/\(kids\) app/\(parent\) app/\(recepcao\) app/\(superadmin\) app/\(franqueador\) app/\(auth\); do
  echo "=== $(basename $dir) ==="
  test -f "$dir/loading.tsx" && echo "  loading.tsx ✅" || echo "  loading.tsx ❌"
  test -f "$dir/error.tsx" && echo "  error.tsx ✅" || echo "  error.tsx ❌"
done
```

### 4B. Criar loading.tsx para cada route group que não tem

```typescript
// Template — adaptar cores por perfil:
export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[var(--bb-primary)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--bb-ink-secondary)]">Carregando...</p>
      </div>
    </div>
  );
}
```

### 4C. Criar error.tsx para cada route group que não tem

```typescript
'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="max-w-md text-center p-8">
        <h2 className="text-xl font-semibold mb-2">Algo deu errado</h2>
        <p className="text-sm text-[var(--bb-ink-secondary)] mb-6">
          {error.message || 'Ocorreu um erro inesperado.'}
        </p>
        <button onClick={reset} className="px-6 py-3 bg-[var(--bb-primary)] text-white rounded-lg">
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
```

### 4D. Global error

Verificar `app/global-error.tsx`. Se não existe, criar:

```typescript
'use client';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html><body>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui' }}>
        <div style={{ textAlign: 'center', padding: 32 }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>BlackBelt</h1>
          <p style={{ marginBottom: 24 }}>Ocorreu um erro inesperado.</p>
          <button onClick={reset} style={{ padding: '12px 24px', background: '#C62828', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            Recarregar
          </button>
        </div>
      </div>
    </body></html>
  );
}
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: loading.tsx + error.tsx for all route groups + global-error`

---

## SEÇÃO 5 — TRIAL COM BANNER + BLOQUEIO (PrimalWOD P-036)

O BlackBelt tem trial, mas verificar se tem o banner visual de contagem regressiva + bloqueio pós-trial.

### 5A. Verificar estado atual

```bash
grep -rn "trial\|Trial\|TrialBanner\|trial.*banner\|days.*remaining\|dias.*restantes" components/ app/ --include="*.tsx" | head -10
```

### 5B. Se não tem banner de trial

Criar `components/trial/TrialBanner.tsx`:

```typescript
// Banner no topo do app (abaixo do header) para academias em trial:
// "Seu período de teste acaba em 5 dias. Escolha um plano para continuar."
// [Ver planos] [Fechar]
//
// Cores:
// - 7+ dias: azul informativo
// - 3-6 dias: amarelo warning
// - 1-2 dias: vermelho urgente
// - 0 dias: vermelho com bloqueio
//
// Quando trial expira:
// Overlay bloqueante: "Seu período de teste expirou"
// Só mostra os planos e o botão de upgrade
// Bloqueia navegação para todas as páginas exceto /admin/planos
```

### 5C. Integrar no AdminShell

No `AdminShell.tsx`, acima do conteúdo principal:
```typescript
{academy.trialEndsAt && <TrialBanner expiresAt={academy.trialEndsAt} />}
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: trial banner with countdown + post-trial blocking overlay`

---

## SEÇÃO 6 — CONTATO PAGE + SUPORTE (PrimalWOD P-040)

### 6A. Verificar se existe

```bash
find app -path "*contato*" -o -path "*suporte*" -o -path "*contact*" -o -path "*support*" | grep page.tsx | head -5
```

### 6B. Se não existe, criar

Criar `app/(public)/contato/page.tsx`:
- Formulário: nome, email, telefone, assunto (dropdown: suporte/comercial/feedback/bug), mensagem
- Ao enviar: salva no Supabase + envia email via Resend pro gregoryguimaraes12@gmail.com
- Toast de confirmação
- Alternativas: WhatsApp, email direto
- FAQ com as 10 perguntas mais comuns

Criar `app/api/contato/route.ts`:
- Recebe POST, salva na tabela `support_tickets`
- Envia email de notificação

```sql
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  academy_id UUID REFERENCES academies(id),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: contact page + support tickets + FAQ`

---

## SEÇÃO 7 — CONSOLE.LOG CLEANUP + PRODUCTION HARDENING

### 7A. Limpar console.logs

```bash
# Contar console.logs no código
grep -rn "console\.log" app/ components/ lib/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v ".test." | wc -l

# Remover todos (exceto os que estão em catch blocks como console.error)
find app/ components/ lib/ -name "*.ts" -o -name "*.tsx" | xargs sed -i '' '/console\.log/d' 2>/dev/null
# OU no Linux:
# find app/ components/ lib/ -name "*.ts" -o -name "*.tsx" | xargs sed -i '/console\.log/d' 2>/dev/null

# Manter console.error e console.warn
```

### 7B. Verificar que não tem segredos no código

```bash
grep -rn "SUPABASE_SERVICE_ROLE\|sb_secret\|api_key\|API_KEY\|password.*=.*[\"']" lib/ app/ --include="*.ts" --include="*.tsx" | grep -v ".env" | grep -v "process.env" | head -10
```

Se encontrar qualquer hardcoded secret → remover IMEDIATAMENTE e mover para .env.

### 7C. Verificar .env.example está atualizado

```bash
cat .env.example
```

Deve conter TODAS as variáveis necessárias (sem valores reais):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_USE_MOCK=false
RESEND_API_KEY=
RESEND_DOMAIN=
ASAAS_API_KEY=
ASAAS_SANDBOX=true
ASAAS_WEBHOOK_TOKEN=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `chore: production hardening — clean console.logs, verify no secrets, update .env.example`

---

## COMANDO DE RETOMADA

```
Continue de onde parou no BLACKBELT_COMPLEMENTAR.md. Verifique estado:
ls lib/payment/asaas.ts 2>/dev/null && echo "S1 OK" || echo "S1 FALTA"
ls lib/api/audit.service.ts 2>/dev/null && echo "S2 OK" || echo "S2 FALTA"
ls components/auth/AuthGuard.tsx 2>/dev/null && echo "S3 OK" || echo "S3 FALTA"
ls app/global-error.tsx 2>/dev/null && echo "S4 OK" || echo "S4 FALTA"
ls components/trial/TrialBanner.tsx 2>/dev/null && echo "S5 OK" || echo "S5 FALTA"
find app -path "*contato*" -name "page.tsx" 2>/dev/null && echo "S6 OK" || echo "S6 FALTA"
grep -c "console\.log" lib/api/*.ts 2>/dev/null | awk -F: '{s+=$2}END{print "Console.logs:", s}' && echo "S7 CHECK"
pnpm typecheck 2>&1 | tail -5
Continue da próxima seção incompleta. ZERO erros. Commit e push.
```

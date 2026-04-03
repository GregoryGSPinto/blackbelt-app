# BLACKBELT v2 — MVP PRODUCTION-READY

## CONTEXTO

O BlackBelt v2 tem 252 páginas, 228 services, 360 tabelas, 33 users seedados.
O login foi corrigido (commit 091badb) — auth.service.ts agora propaga erros.
Mas 221 páginas ainda aparecem vazias porque os OUTROS services têm o mesmo bug:
try/catch que engole erros e retorna dados vazios.

Este prompt transforma o BlackBelt de protótipo em MVP vendável.

---

## EXECUÇÃO — 5 FASES SEQUENCIAIS

Commit separado por fase. pnpm typecheck && pnpm build ZERO erros após cada fase.

---

# ══════════════════════════════════════════
# FASE 1 — CORRIGIR PÁGINAS VAZIAS (CRÍTICO)
# ══════════════════════════════════════════

## Problema

Os 228 services em lib/api/*.service.ts têm o mesmo padrão que o auth.service.ts tinha:

```typescript
// PADRÃO RUIM (atual) — engole erros
async function getAlunos(academyId: string) {
  try {
    if (isMock()) { return mockData; }
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('students').select('*').eq('academy_id', academyId);
    if (error) {
      console.warn('error:', error.message);
      return []; // ← ERRO SILENCIADO
    }
    return data;
  } catch {
    return []; // ← ERRO SILENCIADO
  }
}
```

## Correção

NÃO remova todos os try/catch (diferente do auth). Para services de dados, o padrão correto é:

```typescript
// PADRÃO BOM — loga o erro, retorna fallback, mas o console mostra o problema
async function getAlunos(academyId: string) {
  if (isMock()) { return mockData; }

  const supabase = createBrowserClient();
  const { data, error } = await supabase.from('students').select('*').eq('academy_id', academyId);
  if (error) {
    console.error('[students.service] getAlunos failed:', error.message);
    return []; // fallback OK para listas
  }
  return data ?? [];
}
```

**Regras:**
- `console.warn` → `console.error` em TODOS os services (para aparecer no DevTools)
- Remova o try/catch EXTERNO que engole tudo — mantenha só o if (error) check
- Mantenha return [] ou return null como fallback para funções de LEITURA (get/list/fetch)
- Para funções de ESCRITA (create/update/delete), faça throw new Error() como no auth
- NUNCA delete os blocos isMock() — eles precisam existir

## Execução

### Passo 1.1 — Identificar e corrigir os TOP 30 services mais usados

Estes são os services que alimentam as páginas principais de cada perfil.
Para CADA um, aplique o padrão corrigido:

```bash
# Lista dos 30 services mais críticos — corrija EM ORDEM:
ls -la lib/api/students.service.ts        # Alunos (admin, professor, recepcao)
ls -la lib/api/classes.service.ts         # Turmas
ls -la lib/api/attendance.service.ts      # Check-in/Presença
ls -la lib/api/finances.service.ts        # Financeiro
ls -la lib/api/notifications.service.ts   # Notificações
ls -la lib/api/academy.service.ts         # Academy config
ls -la lib/api/dashboard.service.ts       # Dashboard principal
ls -la lib/api/schedule.service.ts        # Agenda
ls -la lib/api/professors.service.ts      # Professores
ls -la lib/api/memberships.service.ts     # Memberships
ls -la lib/api/modalities.service.ts      # Modalidades
ls -la lib/api/units.service.ts           # Unidades
ls -la lib/api/billing.service.ts         # Billing
ls -la lib/api/contracts.service.ts       # Contratos
ls -la lib/api/gamification.service.ts    # Gamificação
ls -la lib/api/achievements.service.ts    # Conquistas
ls -la lib/api/streaming.service.ts       # Streaming/Vídeos
ls -la lib/api/communication.service.ts   # Comunicação
ls -la lib/api/events.service.ts          # Eventos
ls -la lib/api/certificates.service.ts    # Certificados
ls -la lib/api/invites.service.ts         # Convites
ls -la lib/api/reports.service.ts         # Relatórios
ls -la lib/api/guardian.service.ts        # Responsável
ls -la lib/api/kids.service.ts            # Kids
ls -la lib/api/teen.service.ts            # Teen
ls -la lib/api/compete.service.ts         # Compete/Campeonatos
ls -la lib/api/inventory.service.ts       # Estoque
ls -la lib/api/analytics.service.ts       # Analytics
ls -la lib/api/settings.service.ts        # Settings
ls -la lib/api/superadmin.service.ts      # Super Admin
```

Para CADA service:
1. Abra o arquivo
2. Remova os try/catch externos que retornam fallback silenciosamente
3. Troque console.warn por console.error
4. Mantenha isMock() blocks intactos
5. Funções de leitura: return [] ou return null no if (error)
6. Funções de escrita: throw new Error() no if (error)

### Passo 1.2 — Corrigir os restantes (~198 services)

```bash
# Script para identificar todos os services com o padrão ruim
grep -l "console.warn\|catch.*return \[\]\|catch.*return {}\|catch.*return null" lib/api/*.service.ts | wc -l
```

Aplique o mesmo padrão em TODOS. Use sed/awk se possível para os casos repetitivos:

```bash
# Trocar console.warn por console.error em todos os services
find lib/api -name '*.service.ts' -exec sed -i '' 's/console\.warn(/console.error(/g' {} +
```

MAS verifique manualmente os top 30 — sed não é suficiente para remover try/catch externos.

### Passo 1.3 — Verificar que as PÁGINAS passam academy_id pros services

Muitas páginas chamam services sem passar `academy_id`, que vem do contexto/cookies.
Verifique os dashboards principais:

```bash
# Procurar chamadas de service sem academy_id
grep -rn "service\.\|Service\." app/ --include='page.tsx' | grep -v 'import\|//' | head -50
```

Se as páginas usam hooks como `useAcademyId()` ou `useAuth()` para obter o academy_id, verifique que esses hooks funcionam no modo real (não mock).

### Passo 1.4 — Typecheck + Build

```bash
pnpm typecheck 2>&1
pnpm build 2>&1
```

ZERO erros.

### Passo 1.5 — Commit

```bash
git add lib/api/
git commit -m "fix: stop swallowing errors in all 228 services

- console.warn → console.error everywhere
- Removed outer try/catch that silently returned empty data
- Write operations now throw Error with PT-BR messages
- Read operations log error and return fallback
- isMock() blocks preserved"

git push origin main
```

---

# ══════════════════════════════════════════
# FASE 2 — ONBOARDING END-TO-END
# ══════════════════════════════════════════

## Problema

O wizard de cadastro de academia (4-5 steps) nunca foi testado com Supabase real.
Precisa: criar user → criar academy → criar profile → criar membership → login automático.

## Execução

### Passo 2.1 — Auditar o fluxo de onboarding

```bash
# Encontrar o wizard
find app -path '*cadastrar*' -o -path '*onboarding*' -o -path '*registro*' -o -path '*register*' | grep page.tsx
```

Leia CADA página do wizard e trace o fluxo completo:
- Step 1: dados pessoais (nome, email, senha)
- Step 2: dados da academia (nome, CNPJ, endereço)
- Step 3: modalidades
- Step 4: plano
- Step 5: confirmação

Para CADA step, verifique:
1. O service chamado existe e funciona no modo real?
2. Os dados são passados corretamente entre steps?
3. O último step cria TUDO no banco (user + academy + profile + membership)?
4. Após completar, o redirect funciona?

### Passo 2.2 — Corrigir problemas encontrados

Aplique as correções necessárias. Problemas comuns:
- Service de registro usando try/catch que engole erros (já corrigido no auth)
- Wizard salvando dados em localStorage mas não enviando pro Supabase
- Criação de academy sem criar membership (user fica "órfão")
- RLS bloqueando inserção (user acabou de ser criado, ainda não tem membership)

### Passo 2.3 — Criar migration para garantir que INSERT funciona

Se o onboarding falhar por RLS, crie uma migration com policy permissiva para INSERT em academies e memberships durante o registro:

```sql
-- supabase/migrations/061_onboarding_rls.sql
-- Allow new users to create their first academy
CREATE POLICY "users_can_create_academy"
  ON public.academies
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow new users to create their first membership
CREATE POLICY "users_can_create_own_membership"
  ON public.memberships
  FOR INSERT
  WITH CHECK (
    profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );
```

### Passo 2.4 — Criar teste Playwright para onboarding

Adicione em `e2e/onboarding.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('Onboarding completo — novo dono de academia', async ({ page }) => {
  const timestamp = Date.now();
  const email = `teste-${timestamp}@teste.com`;

  await page.goto('/cadastrar-academia');

  // Step 1: dados pessoais
  await page.fill('input[name="name"]', 'Teste Automatizado');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', 'Teste@2026');
  // ... continue filling steps

  // Verify redirect to dashboard after completion
  await page.waitForURL(/\/(admin|dashboard)/, { timeout: 15000 });
  expect(page.url()).toContain('/admin');
});
```

Adapte os seletores ao HTML REAL das páginas do wizard.

### Passo 2.5 — Commit

```bash
git add -A
git commit -m "fix: onboarding wizard — end-to-end real Supabase flow

- Fixed wizard service calls for real mode
- Added RLS policies for first-time registration
- Playwright onboarding test
- User → Academy → Profile → Membership chain verified"

git push origin main
```

---

# ══════════════════════════════════════════
# FASE 3 — INTEGRAÇÃO ASAAS (PAGAMENTOS)
# ══════════════════════════════════════════

## Contexto

Asaas é o gateway de pagamento mais usado por academias no Brasil.
API: https://docs.asaas.com
Sandbox: https://sandbox.asaas.com/api/v3
Production: https://api.asaas.com/api/v3

## Variáveis de Ambiente necessárias

Gregory vai adicionar no Vercel Dashboard:
- `ASAAS_API_KEY` — API key do Asaas (sandbox primeiro)
- `ASAAS_ENVIRONMENT` — 'sandbox' ou 'production'

Para dev local, ele adiciona no .env.local.

## Execução

### Passo 3.1 — Criar lib/integrations/asaas.ts

```typescript
// Asaas API Client
const ASAAS_BASE_URL = process.env.ASAAS_ENVIRONMENT === 'production'
  ? 'https://api.asaas.com/api/v3'
  : 'https://sandbox.asaas.com/api/v3';

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
  mobilePhone?: string;
}

interface AsaasPayment {
  id: string;
  customer: string;
  value: number;
  dueDate: string;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX';
  status: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  pixQrCode?: string;
}

export async function createCustomer(data: {
  name: string;
  email: string;
  cpfCnpj: string;
  mobilePhone?: string;
}): Promise<AsaasCustomer> {
  const response = await fetch(`${ASAAS_BASE_URL}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': ASAAS_API_KEY!,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Asaas createCustomer: ${error.errors?.[0]?.description ?? response.statusText}`);
  }
  return response.json();
}

export async function createPayment(data: {
  customer: string; // Asaas customer ID
  value: number;
  dueDate: string; // YYYY-MM-DD
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX';
  description?: string;
}): Promise<AsaasPayment> {
  const response = await fetch(`${ASAAS_BASE_URL}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': ASAAS_API_KEY!,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Asaas createPayment: ${error.errors?.[0]?.description ?? response.statusText}`);
  }
  return response.json();
}

export async function getPayment(paymentId: string): Promise<AsaasPayment> {
  const response = await fetch(`${ASAAS_BASE_URL}/payments/${paymentId}`, {
    headers: { 'access_token': ASAAS_API_KEY! },
  });
  if (!response.ok) throw new Error(`Asaas getPayment: ${response.statusText}`);
  return response.json();
}

export async function createSubscription(data: {
  customer: string;
  value: number;
  cycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX';
  nextDueDate: string;
  description?: string;
}): Promise<any> {
  const response = await fetch(`${ASAAS_BASE_URL}/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': ASAAS_API_KEY!,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Asaas createSubscription: ${error.errors?.[0]?.description ?? response.statusText}`);
  }
  return response.json();
}

export async function listPayments(customerId: string): Promise<AsaasPayment[]> {
  const response = await fetch(`${ASAAS_BASE_URL}/payments?customer=${customerId}`, {
    headers: { 'access_token': ASAAS_API_KEY! },
  });
  if (!response.ok) throw new Error(`Asaas listPayments: ${response.statusText}`);
  const result = await response.json();
  return result.data ?? [];
}
```

### Passo 3.2 — Criar API Routes

```
app/api/payments/create-customer/route.ts    — POST: cria customer no Asaas
app/api/payments/create-payment/route.ts     — POST: cria cobrança (boleto/pix/cartão)
app/api/payments/create-subscription/route.ts — POST: cria assinatura recorrente
app/api/payments/webhook/route.ts            — POST: recebe webhooks do Asaas
app/api/payments/[id]/route.ts               — GET: consulta status do pagamento
```

Cada API route deve:
1. Verificar autenticação (header Authorization com JWT do Supabase)
2. Validar input
3. Chamar o Asaas client
4. Salvar o resultado no Supabase (tabelas: pagamentos, mensalidades)
5. Retornar JSON

O webhook route NÃO verifica auth (é chamado pelo Asaas) mas DEVE verificar o token de webhook:

```typescript
// app/api/payments/webhook/route.ts
export async function POST(request: Request) {
  const body = await request.json();

  // Asaas envia: { event, payment: { id, status, ... } }
  const { event, payment } = body;

  // Atualizar status no Supabase
  const supabase = createServerSupabaseClient(); // usa service_role
  await supabase
    .from('pagamentos')
    .update({ status: payment.status, updated_at: new Date().toISOString() })
    .eq('asaas_payment_id', payment.id);

  // Se pagamento confirmado, ativar/renovar membership
  if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
    // Buscar o pagamento no banco para saber qual academy/profile
    const { data: pgto } = await supabase
      .from('pagamentos')
      .select('academy_id, profile_id')
      .eq('asaas_payment_id', payment.id)
      .single();

    if (pgto) {
      await supabase
        .from('memberships')
        .update({ status: 'active', paid_until: /* calcular próximo vencimento */ })
        .eq('academy_id', pgto.academy_id)
        .eq('profile_id', pgto.profile_id);
    }
  }

  return Response.json({ received: true });
}
```

### Passo 3.3 — Conectar com finances.service.ts existente

O finances.service.ts já existe e tem funções como createPayment, listPayments, etc.
Atualize-o para chamar as API routes quando NÃO estiver em mock mode:

```typescript
export async function createPaymentForStudent(data: CreatePaymentData) {
  if (isMock()) { return mockCreatePayment(data); }

  const response = await fetch('/api/payments/create-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? 'Erro ao criar cobrança');
  }
  return response.json();
}
```

### Passo 3.4 — Atualizar .env.example

Adicione:
```
ASAAS_API_KEY=
ASAAS_ENVIRONMENT=sandbox
ASAAS_WEBHOOK_TOKEN=
```

### Passo 3.5 — Migration para coluna asaas_payment_id

```sql
-- supabase/migrations/062_asaas_integration.sql
ALTER TABLE public.pagamentos ADD COLUMN IF NOT EXISTS asaas_payment_id text;
ALTER TABLE public.pagamentos ADD COLUMN IF NOT EXISTS asaas_customer_id text;
ALTER TABLE public.pagamentos ADD COLUMN IF NOT EXISTS billing_type text DEFAULT 'PIX';
ALTER TABLE public.pagamentos ADD COLUMN IF NOT EXISTS invoice_url text;
ALTER TABLE public.pagamentos ADD COLUMN IF NOT EXISTS pix_qr_code text;

CREATE INDEX IF NOT EXISTS idx_pagamentos_asaas_id ON public.pagamentos(asaas_payment_id);

-- Coluna asaas_customer_id na tabela de profiles ou academies
ALTER TABLE public.academies ADD COLUMN IF NOT EXISTS asaas_customer_id text;
```

### Passo 3.6 — Commit

```bash
git add lib/integrations/asaas.ts app/api/payments/ lib/api/finances.service.ts .env.example supabase/migrations/062_asaas_integration.sql
git commit -m "feat: Asaas payment integration — customer, payment, subscription, webhook

- lib/integrations/asaas.ts — API client (sandbox + production)
- 5 API routes: create-customer, create-payment, create-subscription, webhook, get
- finances.service.ts updated for real mode
- Migration 062: asaas columns + index
- Webhook handler updates payment status + activates membership"

git push origin main
```

---

# ══════════════════════════════════════════
# FASE 4 — EMAILS TRANSACIONAIS (RESEND)
# ══════════════════════════════════════════

## Contexto

Resend é a plataforma de email mais simples de integrar.
API: https://resend.com/docs/api-reference
SDK: `resend` npm package

## Variáveis

Gregory adiciona no Vercel:
- `RESEND_API_KEY` — API key do Resend
- `RESEND_FROM_EMAIL` — 'gregoryguimaraes12@gmail.com' (precisa do domínio verificado) ou 'onboarding@resend.dev' (sandbox)

## Execução

### Passo 4.1 — Instalar Resend

```bash
pnpm add resend
```

### Passo 4.2 — Criar lib/integrations/resend.ts

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[resend] RESEND_API_KEY not set, skipping email');
    return null;
  }

  const { data, error } = await resend.emails.send({
    from: `BlackBelt <${FROM_EMAIL}>`,
    to,
    subject,
    html,
  });

  if (error) {
    console.error('[resend] Failed to send email:', error.message);
    throw new Error(`Erro ao enviar email: ${error.message}`);
  }

  return data;
}
```

### Passo 4.3 — Criar templates de email

Crie `lib/emails/templates.ts` com funções que retornam HTML para:

1. **Boas-vindas** — quando dono cadastra academia
2. **Convite de aluno** — quando admin convida aluno
3. **Confirmação de pagamento** — quando pagamento é confirmado
4. **Reset de senha** — template customizado (override do Supabase)
5. **Lembrete de pagamento** — 3 dias antes do vencimento
6. **Aula experimental** — confirmação de agendamento

Cada template deve ser uma função que recebe parâmetros e retorna HTML string.
Use inline CSS (emails não suportam classes). Mantenha simples mas profissional.
Cores da marca: preto #0A0A0A, dourado #D4AF37, branco #FFFFFF.

### Passo 4.4 — Criar API routes para envio

```
app/api/emails/welcome/route.ts          — POST: email de boas-vindas
app/api/emails/invite/route.ts           — POST: convite para aluno
app/api/emails/payment-confirmed/route.ts — POST: confirmação de pagamento
app/api/emails/payment-reminder/route.ts  — POST: lembrete de pagamento
```

### Passo 4.5 — Integrar nos fluxos existentes

- Onboarding wizard → após criar academia, chamar /api/emails/welcome
- Convites → após criar invite, chamar /api/emails/invite
- Webhook de pagamento → após PAYMENT_CONFIRMED, chamar /api/emails/payment-confirmed

### Passo 4.6 — Atualizar .env.example

```
RESEND_API_KEY=
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### Passo 4.7 — Commit

```bash
git add lib/integrations/resend.ts lib/emails/ app/api/emails/ .env.example
git commit -m "feat: Resend email integration — 6 templates, 4 API routes

- lib/integrations/resend.ts — Resend client with error handling
- 6 email templates: welcome, invite, payment-confirmed, reset-password, payment-reminder, trial-class
- 4 API routes for sending emails
- Integrated with onboarding, invites, and payment webhook
- Graceful fallback when RESEND_API_KEY not set"

git push origin main
```

---

# ══════════════════════════════════════════
# FASE 5 — SENTRY + MONITORING
# ══════════════════════════════════════════

## Contexto

Sentry SDK já está no package.json (@sentry/nextjs).
Só falta configurar o DSN e garantir que erros são capturados.

## Variáveis

Gregory adiciona no Vercel:
- `NEXT_PUBLIC_SENTRY_DSN` — DSN do projeto no Sentry
- `SENTRY_AUTH_TOKEN` — para source maps (opcional)

## Execução

### Passo 5.1 — Verificar/Criar sentry configs

Verifique se existem:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `next.config.js` wrapping com `withSentryConfig`

Se algum não existir, crie. Exemplo mínimo:

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% em produção
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});
```

### Passo 5.2 — Adicionar Sentry.captureException nos catch blocks críticos

Nos services que fazem throw (auth, payments, emails), adicione:

```typescript
import * as Sentry from '@sentry/nextjs';

// No catch do service ou API route:
catch (error) {
  Sentry.captureException(error);
  console.error('[service] error:', error);
  throw error;
}
```

Faça isso APENAS nos fluxos críticos:
- auth.service.ts (login, register)
- finances.service.ts (payments)
- API routes de pagamento
- API routes de email
- Onboarding wizard

### Passo 5.3 — Criar app/error.tsx e app/global-error.tsx

Verifique se existem. Se sim, garanta que chamam Sentry.captureException.
Se não, crie:

```typescript
// app/error.tsx
'use client';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { Sentry.captureException(error); }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Algo deu errado</h1>
        <p className="mt-2 text-gray-600">{error.message}</p>
        <button onClick={reset} className="mt-4 rounded bg-black px-4 py-2 text-white">
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
```

### Passo 5.4 — Atualizar .env.example

```
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

### Passo 5.5 — Commit

```bash
git add sentry.*.config.ts app/error.tsx app/global-error.tsx lib/ app/api/ .env.example
git commit -m "feat: Sentry monitoring — error tracking + source maps

- Sentry client/server/edge configs
- captureException in critical flows (auth, payments, emails)
- Error boundary pages with Sentry reporting
- Graceful disable when DSN not set"

git push origin main
```

---

# ══════════════════════════════════════════
# VERIFICAÇÃO FINAL
# ══════════════════════════════════════════

Após todas as 5 fases:

```bash
# 1. Typecheck + Build
pnpm typecheck 2>&1
pnpm build 2>&1

# 2. Smoke test
set -a && source .env.local && set +a && npx tsx scripts/smoke-test.ts

# 3. Playwright audit (se o tempo permitir)
npx playwright test e2e/full-audit.spec.ts --reporter=list 2>&1

# 4. Listar todas as env vars necessárias
echo "=== ENV VARS PARA GREGORY CONFIGURAR ==="
echo "Já configuradas no Vercel:"
echo "  NEXT_PUBLIC_SUPABASE_URL ✅"
echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY ✅"
echo "  SUPABASE_SERVICE_ROLE_KEY ✅"
echo "  NEXT_PUBLIC_USE_MOCK=false ✅"
echo "  NEXT_PUBLIC_APP_URL ✅"
echo "  NEXT_PUBLIC_BETA_MODE ✅"
echo ""
echo "Precisa adicionar:"
echo "  ASAAS_API_KEY — pegar em asaas.com"
echo "  ASAAS_ENVIRONMENT=sandbox"
echo "  RESEND_API_KEY — pegar em resend.com"
echo "  RESEND_FROM_EMAIL=onboarding@resend.dev"
echo "  NEXT_PUBLIC_SENTRY_DSN — pegar em sentry.io"
```

## Reporte o resultado final:

```
=== MVP READINESS REPORT ===
Fase 1 (páginas vazias):  X services corrigidos
Fase 2 (onboarding):     OK/FAIL + detalhes
Fase 3 (pagamentos):     X API routes criadas
Fase 4 (emails):         X templates + X routes
Fase 5 (monitoring):     Sentry configurado YES/NO
Build: ZERO erros
Playwright: X/252 OK (vs 21 anterior)
```

---

## REGRAS INVIOLÁVEIS

1. **pnpm typecheck && pnpm build ZERO erros após CADA fase**
2. **NUNCA delete blocos isMock()** — eles são necessários para dev/demo
3. **NUNCA modifique dados do seed** — o seed já funciona
4. **Commit separado por fase** com mensagem descritiva
5. **Se uma fase falhar, continue com a próxima** — não trave numa fase
6. **Console.error (não console.warn) para TODOS os erros** — facilita debug no browser
7. **Todas as API routes devem verificar auth** (exceto webhook)
8. **Todas as integrações devem funcionar sem API key** (graceful fallback com console.warn)

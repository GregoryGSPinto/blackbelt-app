# BLACKBELT v2 — SUBCONTA ASAAS PARA ACADEMIAS
## A academia recebe dos alunos direto na conta bancária do dono
## Tudo automático, sem sair do BlackBelt

> **INSTRUÇÕES DE EXECUÇÃO:**
> - Execute BLOCO a BLOCO, na ordem (B1 → B7)
> - Cada BLOCO termina com: `pnpm typecheck && pnpm build` → commit → push
> - PRÉ-REQUISITO: Asaas configurado (.env.local tem ASAAS_API_KEY)
> - A Etapa 1 (BlackBelt cobra das academias) JÁ está implementada

---

## CONTEXTO

O dono da academia precisa receber dinheiro dos alunos (mensalidades, matrículas, etc).
Em vez de pedir pra ele criar conta no Asaas e copiar API key, vamos:

1. Criar uma **subconta Asaas** automaticamente via API
2. O dono só preenche CPF/CNPJ + dados bancários numa tela simples
3. O BlackBelt gera cobranças usando a API key da subconta
4. Dinheiro cai direto na conta do dono — zero fricção

API do Asaas: `POST /v3/accounts` → retorna `{ id, apiKey, walletId }`

---

## BLOCO 1 — MIGRATION: SUBCONTA DA ACADEMIA

Criar `supabase/migrations/078_academy_subaccount.sql`:

```sql
-- ═══════════════════════════════════════════════════════════════
-- SUBCONTA ASAAS — ACADEMIA RECEBE DOS ALUNOS
-- ═══════════════════════════════════════════════════════════════

-- Dados bancários da academia
ALTER TABLE academies ADD COLUMN IF NOT EXISTS bank_account_configured BOOLEAN DEFAULT false;
ALTER TABLE academies ADD COLUMN IF NOT EXISTS bank_owner_name VARCHAR(200);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS bank_owner_cpf_cnpj VARCHAR(18);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS bank_owner_email VARCHAR(255);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS bank_owner_phone VARCHAR(20);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS bank_owner_birth_date DATE;
ALTER TABLE academies ADD COLUMN IF NOT EXISTS bank_company_type VARCHAR(20)
  CHECK (bank_company_type IS NULL OR bank_company_type IN ('MEI', 'LIMITED', 'INDIVIDUAL', 'ASSOCIATION'));
ALTER TABLE academies ADD COLUMN IF NOT EXISTS bank_code VARCHAR(10);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS bank_agency VARCHAR(10);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS bank_account VARCHAR(20);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS bank_account_digit VARCHAR(2);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS bank_account_type VARCHAR(20) DEFAULT 'CONTA_CORRENTE'
  CHECK (bank_account_type IN ('CONTA_CORRENTE', 'CONTA_POUPANCA'));
ALTER TABLE academies ADD COLUMN IF NOT EXISTS asaas_subaccount_id VARCHAR(255);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS asaas_subaccount_api_key TEXT;
ALTER TABLE academies ADD COLUMN IF NOT EXISTS asaas_subaccount_wallet_id VARCHAR(255);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS asaas_subaccount_status VARCHAR(20) DEFAULT 'pending'
  CHECK (asaas_subaccount_status IN ('pending', 'active', 'suspended', 'rejected'));

-- Tabela de cobranças de alunos (geradas pela academia)
CREATE TABLE IF NOT EXISTS student_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  student_profile_id UUID NOT NULL REFERENCES profiles(id),
  guardian_person_id UUID REFERENCES people(id),
  description VARCHAR(255) NOT NULL,
  amount_cents INTEGER NOT NULL,
  billing_type VARCHAR(20) NOT NULL DEFAULT 'PIX'
    CHECK (billing_type IN ('PIX', 'BOLETO', 'CREDIT_CARD')),
  due_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'CONFIRMED', 'RECEIVED', 'OVERDUE', 'REFUNDED', 'CANCELLED')),
  asaas_payment_id VARCHAR(255),
  asaas_customer_id VARCHAR(255),
  invoice_url TEXT,
  pix_qr_code TEXT,
  pix_payload TEXT,
  paid_at TIMESTAMPTZ,
  reference_month VARCHAR(7),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_payments_academy ON student_payments(academy_id, status);
CREATE INDEX IF NOT EXISTS idx_student_payments_student ON student_payments(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_student_payments_due ON student_payments(due_date, status);
CREATE INDEX IF NOT EXISTS idx_student_payments_asaas ON student_payments(asaas_payment_id);

ALTER TABLE student_payments ENABLE ROW LEVEL SECURITY;

-- Admin da academia vê todas as cobranças da academia
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sp_admin') THEN
    CREATE POLICY "sp_admin" ON student_payments FOR ALL USING (
      academy_id IN (SELECT public.get_my_academy_ids())
    );
  END IF;
END $$;

-- Aluno vê só as próprias cobranças
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sp_student') THEN
    CREATE POLICY "sp_student" ON student_payments FOR SELECT USING (
      student_profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Responsável vê cobranças dos dependentes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sp_guardian') THEN
    CREATE POLICY "sp_guardian" ON student_payments FOR SELECT USING (
      guardian_person_id IN (
        SELECT id FROM people WHERE account_id = auth.uid()
      )
    );
  END IF;
END $$;
```

Rodar: `supabase db push --include-all <<< "y"`

**Commit:** `feat: migration 078 — academy subaccount + student payments table`

---

## BLOCO 2 — API: CRIAR SUBCONTA ASAAS

Criar `app/api/academy/setup-payments/route.ts`:

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
      academyId, name, cpfCnpj, email, phone, birthDate,
      companyType, bankCode, bankAgency, bankAccount,
      bankAccountDigit, bankAccountType,
    } = body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Verificar se já tem subconta
    const { data: academy } = await supabase
      .from('academies')
      .select('asaas_subaccount_id')
      .eq('id', academyId)
      .single();

    if (academy?.asaas_subaccount_id) {
      return NextResponse.json({ error: 'Academia já tem subconta configurada' }, { status: 400 });
    }

    // Criar subconta no Asaas
    const subaccount = await asaasFetch('/accounts', {
      method: 'POST',
      body: JSON.stringify({
        name,
        cpfCnpj: cpfCnpj.replace(/\D/g, ''),
        email,
        phone: phone?.replace(/\D/g, ''),
        ...(birthDate ? { birthDate } : {}),
        companyType: companyType || (cpfCnpj.replace(/\D/g, '').length > 11 ? 'LIMITED' : 'MEI'),
        // Dados bancários
        bankAccount: {
          bank: { code: bankCode },
          accountName: name,
          ownerName: name,
          cpfCnpj: cpfCnpj.replace(/\D/g, ''),
          agency: bankAgency,
          account: bankAccount,
          accountDigit: bankAccountDigit,
          bankAccountType: bankAccountType || 'CONTA_CORRENTE',
        },
      }),
    });

    if (subaccount.errors) {
      console.error('[setup-payments] Asaas error:', subaccount.errors);
      return NextResponse.json({
        error: 'Erro ao criar conta de recebimento',
        details: subaccount.errors,
      }, { status: 400 });
    }

    // Salvar no banco
    await supabase.from('academies').update({
      bank_account_configured: true,
      bank_owner_name: name,
      bank_owner_cpf_cnpj: cpfCnpj,
      bank_owner_email: email,
      bank_owner_phone: phone,
      bank_owner_birth_date: birthDate,
      bank_company_type: companyType,
      bank_code: bankCode,
      bank_agency: bankAgency,
      bank_account: bankAccount,
      bank_account_digit: bankAccountDigit,
      bank_account_type: bankAccountType,
      asaas_subaccount_id: subaccount.id,
      asaas_subaccount_api_key: subaccount.apiKey,
      asaas_subaccount_wallet_id: subaccount.walletId,
      asaas_subaccount_status: 'active',
    }).eq('id', academyId);

    // Audit log
    await supabase.from('audit_log').insert({
      academy_id: academyId,
      action: 'subaccount_created',
      entity_type: 'academy',
      entity_id: academyId,
      new_data: { subaccountId: subaccount.id, walletId: subaccount.walletId },
    });

    return NextResponse.json({
      success: true,
      subaccountId: subaccount.id,
      walletId: subaccount.walletId,
    });

  } catch (error: any) {
    console.error('[setup-payments] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**Commit:** `feat: API setup-payments — create Asaas subaccount for academy`

---

## BLOCO 3 — API: GERAR COBRANÇA PARA ALUNO

Criar `app/api/academy/charge-student/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ASAAS_BASE_URL = process.env.ASAAS_SANDBOX === 'true'
  ? 'https://sandbox.asaas.com/api/v3'
  : 'https://api.asaas.com/api/v3';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      academyId, studentProfileId, guardianPersonId,
      description, amountCents, billingType, dueDate,
      studentName, studentCpf, studentEmail, referenceMonth,
    } = body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Buscar API key da subconta da academia
    const { data: academy } = await supabase
      .from('academies')
      .select('asaas_subaccount_api_key, asaas_subaccount_status, name')
      .eq('id', academyId)
      .single();

    if (!academy?.asaas_subaccount_api_key) {
      return NextResponse.json({
        error: 'Academia não configurou recebimento de pagamentos. Vá em Configurações → Dados Bancários.',
      }, { status: 400 });
    }

    if (academy.asaas_subaccount_status !== 'active') {
      return NextResponse.json({
        error: 'Conta de recebimento da academia está pendente de aprovação.',
      }, { status: 400 });
    }

    // Usar API key da subconta (não a master)
    async function academyAsaasFetch(path: string, options: RequestInit = {}) {
      const res = await fetch(`${ASAAS_BASE_URL}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'access_token': academy!.asaas_subaccount_api_key!,
          ...options.headers,
        },
      });
      return res.json();
    }

    // 1. Criar ou buscar cliente na subconta
    // Buscar por CPF
    const existingCustomers = await academyAsaasFetch(
      `/customers?cpfCnpj=${(studentCpf || '').replace(/\D/g, '')}`
    );

    let customerId: string;
    if (existingCustomers.data?.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      // Criar cliente
      const newCustomer = await academyAsaasFetch('/customers', {
        method: 'POST',
        body: JSON.stringify({
          name: studentName,
          cpfCnpj: (studentCpf || '').replace(/\D/g, ''),
          email: studentEmail,
        }),
      });
      if (newCustomer.errors) {
        return NextResponse.json({ error: 'Erro ao criar cliente', details: newCustomer.errors }, { status: 400 });
      }
      customerId = newCustomer.id;
    }

    // 2. Criar cobrança
    const payment = await academyAsaasFetch('/payments', {
      method: 'POST',
      body: JSON.stringify({
        customer: customerId,
        billingType: billingType || 'PIX',
        value: amountCents / 100,
        dueDate,
        description: description || `Mensalidade ${academy.name}`,
        externalReference: `bb_${academyId}_${studentProfileId}_${referenceMonth || ''}`,
      }),
    });

    if (payment.errors) {
      return NextResponse.json({ error: 'Erro ao gerar cobrança', details: payment.errors }, { status: 400 });
    }

    // 3. Salvar no banco
    const { data: savedPayment } = await supabase.from('student_payments').insert({
      academy_id: academyId,
      student_profile_id: studentProfileId,
      guardian_person_id: guardianPersonId,
      description: description || `Mensalidade ${academy.name}`,
      amount_cents: amountCents,
      billing_type: billingType || 'PIX',
      due_date: dueDate,
      status: 'PENDING',
      asaas_payment_id: payment.id,
      asaas_customer_id: customerId,
      invoice_url: payment.invoiceUrl,
      pix_qr_code: payment.pixQrCode?.payload || null,
      reference_month: referenceMonth,
    }).select('id').single();

    return NextResponse.json({
      success: true,
      paymentId: savedPayment?.id,
      asaasPaymentId: payment.id,
      invoiceUrl: payment.invoiceUrl,
      pixQrCode: payment.pixQrCode?.payload || null,
      bankSlipUrl: payment.bankSlipUrl || null,
    });

  } catch (error: any) {
    console.error('[charge-student] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**Commit:** `feat: API charge-student — generate payment using academy subaccount`

---

## BLOCO 4 — PÁGINA: CONFIGURAÇÕES → DADOS BANCÁRIOS

Criar `app/(admin)/admin/configuracoes/dados-bancarios/page.tsx`:

Página simples com formulário:

```
Receber pagamentos dos seus alunos

Configure sua conta bancária para receber mensalidades,
matrículas e outras cobranças diretamente na sua conta.

[Formulário]
- Nome completo do titular *
- CPF ou CNPJ *
- E-mail *
- WhatsApp *
- Data de nascimento (se PF)
- Tipo de empresa: MEI / Limitada / Individual / Associação

Dados bancários:
- Banco * (dropdown com lista de bancos: 001 BB, 033 Santander, 104 Caixa, 237 Bradesco, 341 Itaú, 260 Nubank, 077 Inter, 336 C6, 290 PagBank, 380 PicPay)
- Agência *
- Conta *
- Dígito *
- Tipo: Corrente / Poupança

[Botão: Configurar Recebimento]

Após salvar:
- Mostrar card de sucesso: "Conta configurada! Agora você pode gerar cobranças para seus alunos."
- Mostrar resumo: Banco Itaú, Ag 1234, CC 56789-0, Titular: João Silva
- Botão: "Gerar primeira cobrança" → redireciona pra /admin/financeiro
```

Se já configurou (bank_account_configured = true):
- Mostrar os dados salvos (mascarados: ***789-0)
- Botão "Atualizar dados bancários"
- Status da subconta: Ativa / Pendente / Rejeitada

**IMPORTANTE:**
- Usar `isMock()` check — em mock mode, simular com dados fake
- Validar CPF/CNPJ antes de enviar
- Máscara nos inputs (CPF, CNPJ, telefone, CEP)
- Loading state no botão durante a chamada API
- Toast de sucesso/erro
- Skeleton loading ao carregar dados existentes

**Commit:** `feat: bank account settings page — academy payment configuration`

---

## BLOCO 5 — PÁGINA: ADMIN GERAR COBRANÇA

Atualizar a página de financeiro existente (`/admin/financeiro`) para incluir:

### 5A. Botão "Gerar Cobrança"

No topo da página de financeiro, adicionar botão:
```
[+ Gerar Cobrança]
```

Que abre um modal/drawer com:
- Seletor de aluno (busca por nome)
- Se aluno é menor: mostra responsável financeiro automaticamente
- Descrição (preenchido: "Mensalidade MÊS/ANO")
- Valor em R$ *
- Método: PIX (padrão) / Boleto / Cartão
- Vencimento * (padrão: dia 10 do próximo mês)
- Mês referência (auto)

Ao clicar "Gerar":
1. Chama `/api/academy/charge-student`
2. Mostra resultado: link do boleto/PIX QR code
3. Opção: "Enviar por WhatsApp" (abre link wa.me com mensagem e URL)
4. Opção: "Copiar link de pagamento"

### 5B. Se academia NÃO configurou dados bancários

Mostrar card de aviso:
```
⚠️ Configure seus dados bancários para gerar cobranças
Você precisa informar sua conta bancária para receber
pagamentos dos alunos.
[Configurar agora] → /admin/configuracoes/dados-bancarios
```

### 5C. Lista de cobranças geradas

Tabela com:
- Aluno | Descrição | Valor | Vencimento | Status | Ações
- Status com badge colorido: Pendente (amarelo), Pago (verde), Vencido (vermelho)
- Ação: Ver link | Reenviar | Cancelar

**Commit:** `feat: admin generates student charges — payment modal + list`

---

## BLOCO 6 — WEBHOOK: PAGAMENTO DO ALUNO CONFIRMADO

Atualizar `app/api/webhooks/asaas/route.ts` para processar pagamentos de alunos:

```typescript
// Adicionar ao handler existente:

// Se o pagamento tem externalReference começando com "bb_"
// é um pagamento de aluno
if (payload.externalReference?.startsWith('bb_')) {
  const { data: studentPayment } = await supabase
    .from('student_payments')
    .select('id, academy_id, student_profile_id')
    .eq('asaas_payment_id', payload.id)
    .single();

  if (studentPayment) {
    const newStatus = event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED'
      ? 'CONFIRMED'
      : event === 'PAYMENT_OVERDUE'
      ? 'OVERDUE'
      : event === 'PAYMENT_REFUNDED'
      ? 'REFUNDED'
      : null;

    if (newStatus) {
      await supabase.from('student_payments').update({
        status: newStatus,
        ...(newStatus === 'CONFIRMED' ? { paid_at: new Date().toISOString() } : {}),
        updated_at: new Date().toISOString(),
      }).eq('id', studentPayment.id);

      // Criar timeline event pro aluno
      if (newStatus === 'CONFIRMED') {
        await supabase.from('student_timeline_events').insert({
          profile_id: studentPayment.student_profile_id,
          academy_id: studentPayment.academy_id,
          event_type: 'pagamento',
          title: 'Pagamento confirmado',
          description: `Pagamento de R$${(payload.value || 0).toFixed(2)} confirmado`,
          event_date: new Date().toISOString(),
        });
      }
    }
  }
}
```

**IMPORTANTE:** O webhook precisa distinguir entre:
- Pagamentos do BlackBelt (assinatura da academia pra você) → usa `subscription` field
- Pagamentos de alunos (cobranças da academia) → usa `externalReference` começando com `bb_`

**Commit:** `feat: webhook handles student payments — status update + timeline`

---

## BLOCO 7 — SIDEBAR + BANNER + NAV

### 7A. Adicionar "Dados Bancários" nas configurações

No AdminShell sidebar, dentro de Configurações (ou como sub-item):
- 🏦 Dados Bancários → /admin/configuracoes/dados-bancarios

### 7B. Banner no dashboard admin

Se `bank_account_configured === false`, mostrar banner no topo do dashboard:

```
💰 Configure sua conta bancária para receber dos alunos
Informe seus dados bancários para gerar cobranças de mensalidade.
[Configurar agora]
```

O banner some quando configurar.

### 7C. Atualizar final-check.sh

Adicionar verificações:
```bash
test -f app/api/academy/setup-payments/route.ts
check "Setup payments API"

test -f app/api/academy/charge-student/route.ts
check "Charge student API"

find app -path "*dados-bancarios*" -name "page.tsx" | grep -q .
check "Bank account settings page"
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: sidebar + banner for bank account setup`

---

## COMANDO DE RETOMADA

```
Continue de onde parou no BLACKBELT_SUBCONTA_ACADEMIA.md. Verifique estado:
ls supabase/migrations/078_academy_subaccount.sql 2>/dev/null && echo "B1 OK" || echo "B1 FALTA"
ls app/api/academy/setup-payments/route.ts 2>/dev/null && echo "B2 OK" || echo "B2 FALTA"
ls app/api/academy/charge-student/route.ts 2>/dev/null && echo "B3 OK" || echo "B3 FALTA"
find app -path "*dados-bancarios*" -name "page.tsx" 2>/dev/null | grep -q . && echo "B4 OK" || echo "B4 FALTA"
grep -q "charge-student\|Gerar Cobrança" app/\(admin\)/admin/financeiro/page.tsx 2>/dev/null && echo "B5 OK" || echo "B5 FALTA"
grep -q "externalReference\|bb_" app/api/webhooks/asaas/route.ts 2>/dev/null && echo "B6 OK" || echo "B6 FALTA"
grep -q "dados-bancarios\|bank_account" scripts/final-check.sh 2>/dev/null && echo "B7 OK" || echo "B7 FALTA"
pnpm typecheck 2>&1 | tail -5
Continue da próxima seção incompleta. ZERO erros. Commit e push.
```

---

## FLUXO COMPLETO (VISÃO DO DONO DA ACADEMIA)

```
1. Dono cadastra academia no BlackBelt (Etapa 1 — já implementada)
2. Loga no dashboard admin
3. Vê banner: "Configure sua conta bancária para receber dos alunos"
4. Clica → vai pra Configurações → Dados Bancários
5. Preenche: nome, CPF, banco, agência, conta
6. Clica "Configurar Recebimento" → BlackBelt cria subconta Asaas automaticamente
7. Pronto! Agora em Financeiro → "Gerar Cobrança":
   - Seleciona aluno
   - Define valor e vencimento
   - Escolhe PIX/boleto/cartão
   - Gera cobrança → link + QR code
8. Envia pro aluno/responsável via WhatsApp
9. Aluno paga → webhook atualiza status → aparece "Pago" no financeiro
10. Dinheiro cai direto na conta bancária do dono
```

# BLACKBELT v2 — ENTERPRISE PRODUCTION (FASE 2 de 3)
# Services Reais, Gateway de Pagamento, Offline-First

## PRÉ-REQUISITO: FASE 1 concluída (AUDIT_SERVICES.md existe, schema aplicado, seed rodado)

---

## SEÇÃO 5 — CONVERTER OS 7 SERVICES CRÍTICOS PARA REAL (40 min)

Para cada service abaixo: abrir o arquivo, encontrar o ramo `!isMock()` (ou `else`),
e implementar queries Supabase reais. Se o ramo real já existe, VERIFICAR que funciona.

**Padrão obrigatório para TODO service:**

```typescript
import { getSupabaseClient } from '@/lib/supabase/client';
import { isMock } from '@/lib/utils/mock';
import { handleServiceError } from '@/lib/monitoring/service-error';

export async function getAlgo(academyId: string): Promise<AlgoDTO[]> {
  if (isMock()) {
    return mockGetAlgo(academyId);
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('tabela')
      .select('*')
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapToDTO);
  } catch (err) {
    handleServiceError(err, 'service-name.getAlgo');
    return []; // fallback seguro
  }
}
```

### 5A. admin.service.ts (Dashboard Admin)

O admin precisa ver KPIs reais da academia.

```typescript
// getDashboard(academyId)
const supabase = getSupabaseClient();

// Total alunos ativos
const { count: totalStudents } = await supabase
  .from('students')
  .select('id', { count: 'exact', head: true })
  .eq('academy_id', academyId)
  .eq('status', 'active');

// Total turmas ativas
const { count: totalClasses } = await supabase
  .from('classes')
  .select('id', { count: 'exact', head: true })
  .eq('academy_id', academyId)
  .eq('status', 'active');

// Check-ins do mês
const startOfMonth = new Date();
startOfMonth.setDate(1);
startOfMonth.setHours(0, 0, 0, 0);

const { count: monthlyCheckins } = await supabase
  .from('attendance')
  .select('id', { count: 'exact', head: true })
  .eq('academy_id', academyId)
  .gte('check_in_at', startOfMonth.toISOString());

// Receita do mês (faturas pagas)
const { data: paidInvoices } = await supabase
  .from('invoices')
  .select('amount_cents')
  .eq('academy_id', academyId)
  .eq('status', 'paid')
  .gte('paid_at', startOfMonth.toISOString());

const monthlyRevenue = (paidInvoices ?? []).reduce((sum, inv) => sum + inv.amount_cents, 0);

// Inadimplência (faturas vencidas não pagas)
const { count: overdueCount } = await supabase
  .from('invoices')
  .select('id', { count: 'exact', head: true })
  .eq('academy_id', academyId)
  .eq('status', 'overdue');

// Últimos check-ins (para feed de atividade)
const { data: recentCheckins } = await supabase
  .from('attendance')
  .select(`
    id, check_in_at, method,
    students!inner(id, profile_id, belt,
      profiles!inner(display_name, avatar_url)
    ),
    classes(name, modality)
  `)
  .eq('academy_id', academyId)
  .order('check_in_at', { ascending: false })
  .limit(10);

// Novos alunos do mês
const { count: newStudents } = await supabase
  .from('students')
  .select('id', { count: 'exact', head: true })
  .eq('academy_id', academyId)
  .gte('enrollment_date', startOfMonth.toISOString());

return {
  totalStudents: totalStudents ?? 0,
  totalClasses: totalClasses ?? 0,
  monthlyCheckins: monthlyCheckins ?? 0,
  monthlyRevenue: monthlyRevenue / 100, // centavos → reais
  overdueInvoices: overdueCount ?? 0,
  newStudentsThisMonth: newStudents ?? 0,
  recentActivity: mapRecentCheckins(recentCheckins ?? []),
};
```

### 5B. student.service.ts / admin-alunos.service.ts

```typescript
// listStudents(academyId, filters?)
const query = supabase
  .from('students')
  .select(`
    id, belt, stripes, enrollment_date, status, birth_date,
    profiles!inner(id, display_name, email, phone, avatar_url, cpf)
  `)
  .eq('academy_id', academyId);

if (filters?.status) query.eq('status', filters.status);
if (filters?.belt) query.eq('belt', filters.belt);
if (filters?.search) query.ilike('profiles.display_name', `%${filters.search}%`);

const { data, error } = await query.order('profiles(display_name)');

// createStudent(academyId, data) — ESTA FUNÇÃO PRECISA DE API ROUTE
// Porque criar user no Auth requer service_role key (server-side only)
// Chamar POST /api/students com os dados
// A API route usa createAdminSupabase() para criar user + profile + student
```

**CRIAR API ROUTE** para cadastro de aluno:

```typescript
// app/api/students/route.ts
import { createAdminSupabase, createServerSupabase } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Verificar auth
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  // Verificar role (só admin, recepcionista, super_admin podem cadastrar)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, academy_id')
    .eq('user_id', user.id)
    .single();

  if (!profile || !['admin', 'recepcionista', 'super_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
  }

  const body = await req.json();
  const admin = createAdminSupabase();

  // 1. Criar auth user
  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email: body.email,
    password: body.password || 'BlackBelt@2026', // senha temporária
    email_confirm: true,
    user_metadata: { display_name: body.name, role: body.role || 'aluno_adulto' },
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  // 2. Criar profile
  const { error: profError } = await admin.from('profiles').insert({
    id: authUser.user.id,
    user_id: authUser.user.id,
    email: body.email,
    display_name: body.name,
    role: body.role || 'aluno_adulto',
    academy_id: profile.academy_id,
    phone: body.phone,
    cpf: body.cpf,
    birth_date: body.birth_date,
  });

  if (profError) {
    return NextResponse.json({ error: profError.message }, { status: 400 });
  }

  // 3. Criar student
  const { data: student, error: stuError } = await admin.from('students').insert({
    profile_id: authUser.user.id,
    academy_id: profile.academy_id,
    belt: 'branca',
    stripes: 0,
    birth_date: body.birth_date,
    enrollment_date: new Date().toISOString(),
    status: 'active',
    modality: body.modality,
    emergency_contact: body.emergency_contact,
    emergency_phone: body.emergency_phone,
  }).select().single();

  if (stuError) {
    return NextResponse.json({ error: stuError.message }, { status: 400 });
  }

  // 4. Criar membership
  await admin.from('memberships').insert({
    profile_id: authUser.user.id,
    academy_id: profile.academy_id,
    role: body.role || 'aluno_adulto',
    status: 'active',
  });

  return NextResponse.json({ student, userId: authUser.user.id }, { status: 201 });
}
```

### 5C. checkin.service.ts

```typescript
// registerCheckIn(academyId, studentId, classId?, method?)
const { data, error } = await supabase
  .from('attendance')
  .insert({
    academy_id: academyId,
    student_id: studentId,
    class_id: classId || null,
    professor_id: null, // preenchido depois se professor marcar
    check_in_at: new Date().toISOString(),
    method: method || 'manual',
  })
  .select()
  .single();

if (error) {
  // Duplicata = aluno já fez check-in hoje nesta turma
  if (error.code === '23505') {
    throw new ServiceError(409, 'checkin', 'Você já fez check-in nesta aula hoje');
  }
  throw error;
}

// Após check-in, dar XP (gamificação)
await supabase.from('xp_ledger').insert({
  student_id: studentId,
  amount: 10,
  reason: 'attendance',
  reference_id: data.id,
});

return data;

// getCheckInHistory(studentId, limit?)
const { data } = await supabase
  .from('attendance')
  .select(`
    id, check_in_at, method,
    classes(name, modality)
  `)
  .eq('student_id', studentId)
  .order('check_in_at', { ascending: false })
  .limit(limit || 30);

// getCheckInStats(studentId)
// Calcular: total, este mês, streak, frequência semanal média
```

### 5D. class.service.ts / turmas.service.ts

```typescript
// listClasses(academyId)
const { data } = await supabase
  .from('classes')
  .select(`
    id, name, modality, max_students, status, schedule, description, level,
    profiles!professor_id(id, display_name, avatar_url),
    class_enrollments(count)
  `)
  .eq('academy_id', academyId)
  .eq('status', 'active')
  .order('name');

// createClass(academyId, data)
const { data: newClass, error } = await supabase
  .from('classes')
  .insert({
    academy_id: academyId,
    name: data.name,
    modality: data.modality,
    professor_id: data.professorId,
    max_students: data.maxStudents || 30,
    schedule: data.schedule, // [{day: 'monday', start: '19:00', end: '20:30'}]
    description: data.description,
    level: data.level,
  })
  .select()
  .single();

// enrollStudent(classId, studentId)
const { error } = await supabase
  .from('class_enrollments')
  .insert({ class_id: classId, student_id: studentId });
```

### 5E. invoice.service.ts / faturas.service.ts / billing.service.ts

```typescript
// listInvoices(academyId, filters?)
const query = supabase
  .from('invoices')
  .select(`
    id, amount_cents, status, due_date, paid_at, payment_method,
    invoice_url, pix_qr_code, notes,
    students!inner(
      profiles!inner(display_name, email)
    ),
    subscriptions(plans(name))
  `)
  .eq('academy_id', academyId);

if (filters?.status) query.eq('status', filters.status);
if (filters?.month) {
  const start = new Date(filters.year, filters.month - 1, 1);
  const end = new Date(filters.year, filters.month, 0);
  query.gte('due_date', start.toISOString()).lte('due_date', end.toISOString());
}

const { data } = await query.order('due_date', { ascending: false });

// createInvoice(academyId, data)
const { data: invoice, error } = await supabase
  .from('invoices')
  .insert({
    academy_id: academyId,
    student_id: data.studentId,
    subscription_id: data.subscriptionId,
    amount_cents: data.amountCents,
    due_date: data.dueDate,
    status: 'pending',
    payment_method: data.paymentMethod,
    notes: data.notes,
  })
  .select()
  .single();

// markAsPaid(invoiceId)
const { error } = await supabase
  .from('invoices')
  .update({ status: 'paid', paid_at: new Date().toISOString() })
  .eq('id', invoiceId);
```

### 5F. professor.service.ts

```typescript
// getDashboard(profileId) — profileId = professor's profile.id
const supabase = getSupabaseClient();

// Minhas turmas
const { data: myClasses } = await supabase
  .from('classes')
  .select(`
    id, name, modality, schedule, max_students,
    class_enrollments(count)
  `)
  .eq('professor_id', profileId)
  .eq('status', 'active');

// Presença da semana nas minhas turmas
const weekAgo = new Date();
weekAgo.setDate(weekAgo.getDate() - 7);

const classIds = (myClasses ?? []).map(c => c.id);

const { count: weeklyAttendance } = await supabase
  .from('attendance')
  .select('id', { count: 'exact', head: true })
  .in('class_id', classIds)
  .gte('check_in_at', weekAgo.toISOString());

// Alunos únicos nas minhas turmas
const { data: enrollments } = await supabase
  .from('class_enrollments')
  .select('student_id')
  .in('class_id', classIds);

const uniqueStudentIds = [...new Set((enrollments ?? []).map(e => e.student_id))];

// Próxima aula (baseado no schedule + hora atual)
const nextClass = findNextClass(myClasses ?? []);

return {
  classes: myClasses ?? [],
  totalStudents: uniqueStudentIds.length,
  weeklyAttendance: weeklyAttendance ?? 0,
  nextClass,
};
```

### 5G. parent.service.ts

```typescript
// getDashboard(guardianProfileId)
const supabase = getSupabaseClient();

// Buscar filhos vinculados
const { data: links } = await supabase
  .from('guardian_links')
  .select(`
    id, relationship,
    profiles!student_profile_id(
      id, display_name, avatar_url,
      students(id, belt, stripes, status)
    )
  `)
  .eq('guardian_profile_id', guardianProfileId);

const children = (links ?? []).map(link => {
  const childProfile = link.profiles;
  const student = childProfile?.students?.[0];
  return {
    profileId: childProfile?.id,
    studentId: student?.id,
    name: childProfile?.display_name,
    avatar: childProfile?.avatar_url,
    belt: student?.belt,
    stripes: student?.stripes,
  };
});

// Para cada filho, buscar presença do mês
const childrenWithAttendance = await Promise.all(
  children.map(async (child) => {
    if (!child.studentId) return { ...child, monthlyAttendance: 0 };

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('attendance')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', child.studentId)
      .gte('check_in_at', startOfMonth.toISOString());

    return { ...child, monthlyAttendance: count ?? 0 };
  })
);

return { children: childrenWithAttendance };
```

**Para CADA service acima:**
1. Abrir o arquivo atual
2. Verificar se o ramo real (`!isMock()` ou `else`) está completo
3. Se não, implementar com os queries acima
4. Se sim, verificar que os nomes de tabelas/colunas batem com a migration 050

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: 7 critical services fully real — admin, student, checkin, class, billing, professor, parent`

---

## SEÇÃO 6 — CONVERTER TODOS OS SERVICES RESTANTES (30 min)

Abrir o AUDIT_SERVICES.md gerado na Seção 1.
Para cada service marcado 🔴 (mock only):

### Regra de conversão rápida:

**Se o service faz CRUD simples** (list, getById, create, update, delete):
```typescript
// Padrão: substituir mock por query Supabase
if (isMock()) { return mockData; }

try {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('TABELA')
    .select('*')
    .eq('academy_id', academyId);
  if (error) throw error;
  return data ?? [];
} catch (err) {
  handleServiceError(err, 'SERVICE.METODO');
  return [];
}
```

**Se o service depende de API externa** (pagamento, email, SMS, NFe):
```typescript
// Padrão: salvar no Supabase + tentar API externa se configurada
if (isMock()) { return mockData; }

try {
  const supabase = getSupabaseClient();

  // Sempre salvar no banco
  const { data, error } = await supabase
    .from('TABELA')
    .insert({ ... })
    .select()
    .single();

  if (error) throw error;

  // Tentar API externa (se configurada)
  const apiKey = process.env.EXTERNAL_API_KEY;
  if (apiKey) {
    // Chamar API externa
    // Atualizar registro com external_id
  } else {
    console.info('[service] API externa não configurada — registro salvo localmente');
  }

  return data;
} catch (err) {
  handleServiceError(err, 'SERVICE.METODO');
  throw err;
}
```

### Lista de services a converter (varrer TODOS do AUDIT_SERVICES.md):

Executar para cada service 🔴:
1. Ler o arquivo
2. Identificar as funções exportadas
3. Para cada função no ramo `!isMock()`:
   - Se tem `throw new Error('Not implemented')` → IMPLEMENTAR
   - Se tem `return []` ou `return null` → IMPLEMENTAR com query real
   - Se tem `TODO` → IMPLEMENTAR
4. Verificar que a tabela existe na migration 050
5. Se a tabela NÃO existe → OU usar uma tabela existente, OU adicionar à migration

**IMPORTANTE:** Não gastar mais de 3 minutos por service.
Se um service é complexo demais (ex: IA, integração externa complexa),
implementar com fallback gracioso:

```typescript
return {
  status: 'not_configured',
  message: 'Este módulo requer configuração adicional. Acesse Configurações → Integrações.',
};
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: all services converted to real Supabase — zero mock-only gaps`

---

## SEÇÃO 7 — PAYMENT GATEWAY PLUGÁVEL (25 min)

### 7A. Verificar payment-gateway.service.ts

```bash
cat lib/api/payment-gateway.service.ts 2>/dev/null || find lib -name "*payment*" -o -name "*gateway*" | head -10
```

### 7B. Garantir Strategy Pattern

O gateway DEVE ser plugável. Interface:

```typescript
// lib/types/payment.ts
export interface PaymentGateway {
  createCustomer(data: CustomerInput): Promise<{ externalId: string }>;
  createCharge(data: ChargeInput): Promise<ChargeResult>;
  getCharge(externalId: string): Promise<ChargeStatus>;
  cancelCharge(externalId: string): Promise<void>;
  generatePixQrCode(chargeId: string): Promise<{ qrCode: string; qrCodeImage: string }>;
}

export interface CustomerInput {
  name: string;
  email: string;
  cpf: string;
  phone?: string;
}

export interface ChargeInput {
  customerExternalId: string;
  amount: number; // em reais (R$ 197.00)
  dueDate: string; // YYYY-MM-DD
  description: string;
  billingType: 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'UNDEFINED';
}

export interface ChargeResult {
  externalId: string;
  status: 'PENDING' | 'CONFIRMED' | 'OVERDUE' | 'CANCELLED';
  invoiceUrl?: string;
  pixQrCode?: string;
  bankSlipUrl?: string;
}
```

### 7C. Implementar gateways

**Asaas Gateway** (`lib/api/gateways/asaas.gateway.ts`):

```typescript
import type { PaymentGateway, CustomerInput, ChargeInput, ChargeResult } from '@/lib/types/payment';

const getBaseUrl = () =>
  process.env.ASAAS_SANDBOX === 'true'
    ? 'https://sandbox.asaas.com/api/v3'
    : 'https://api.asaas.com/api/v3';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'access_token': process.env.ASAAS_API_KEY || '',
});

export const asaasGateway: PaymentGateway = {
  async createCustomer(input: CustomerInput) {
    const res = await fetch(`${getBaseUrl()}/customers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        name: input.name,
        email: input.email,
        cpfCnpj: input.cpf.replace(/\D/g, ''),
        phone: input.phone,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Asaas: ${data.errors?.[0]?.description || 'Erro ao criar customer'}`);
    return { externalId: data.id };
  },

  async createCharge(input: ChargeInput) {
    const res = await fetch(`${getBaseUrl()}/payments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        customer: input.customerExternalId,
        billingType: input.billingType,
        value: input.amount,
        dueDate: input.dueDate,
        description: input.description,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Asaas: ${data.errors?.[0]?.description || 'Erro ao criar cobrança'}`);
    return {
      externalId: data.id,
      status: data.status as ChargeResult['status'],
      invoiceUrl: data.invoiceUrl,
      bankSlipUrl: data.bankSlipUrl,
    };
  },

  async getCharge(externalId: string) {
    const res = await fetch(`${getBaseUrl()}/payments/${externalId}`, { headers: getHeaders() });
    const data = await res.json();
    return { status: data.status, pixQrCode: data.pixQrCodeUrl };
  },

  async cancelCharge(externalId: string) {
    await fetch(`${getBaseUrl()}/payments/${externalId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
  },

  async generatePixQrCode(chargeId: string) {
    const res = await fetch(`${getBaseUrl()}/payments/${chargeId}/pixQrCode`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    return { qrCode: data.payload, qrCodeImage: data.encodedImage };
  },
};
```

**Manual Gateway** (`lib/api/gateways/manual.gateway.ts`):

```typescript
// Para quando nenhum gateway está configurado
// Salva tudo no banco mas não processa pagamento real
export const manualGateway: PaymentGateway = {
  async createCustomer(input) {
    return { externalId: `manual_${Date.now()}` };
  },
  async createCharge(input) {
    return {
      externalId: `manual_charge_${Date.now()}`,
      status: 'PENDING',
      invoiceUrl: undefined,
    };
  },
  async getCharge(id) { return { status: 'PENDING' }; },
  async cancelCharge(id) {},
  async generatePixQrCode(id) { return { qrCode: '', qrCodeImage: '' }; },
};
```

**Factory** (`lib/api/gateways/index.ts`):

```typescript
import type { PaymentGateway } from '@/lib/types/payment';
import { asaasGateway } from './asaas.gateway';
import { manualGateway } from './manual.gateway';

export function getPaymentGateway(): PaymentGateway {
  const gateway = process.env.PAYMENT_GATEWAY || 'manual';

  switch (gateway) {
    case 'asaas':
      if (!process.env.ASAAS_API_KEY) {
        console.warn('[Payment] ASAAS_API_KEY não configurada — usando gateway manual');
        return manualGateway;
      }
      return asaasGateway;
    case 'stripe':
      // TODO: implementar quando necessário
      console.warn('[Payment] Stripe gateway ainda não implementado — usando manual');
      return manualGateway;
    case 'manual':
    default:
      return manualGateway;
  }
}

export function isGatewayConfigured(): boolean {
  const gw = process.env.PAYMENT_GATEWAY;
  if (gw === 'asaas') return !!process.env.ASAAS_API_KEY;
  if (gw === 'stripe') return !!process.env.STRIPE_SECRET_KEY;
  return false;
}
```

### 7D. Webhook handler

Criar/verificar `app/api/webhooks/payment/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabase = createAdminSupabase();

  // Log do webhook
  await supabase.from('webhook_logs').insert({
    gateway: 'asaas',
    event_type: body.event,
    payload: body,
    processed: false,
  });

  try {
    const paymentId = body.payment?.id;
    if (!paymentId) return NextResponse.json({ received: true });

    switch (body.event) {
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_RECEIVED':
        await supabase
          .from('invoices')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
          })
          .eq('external_id', paymentId);
        break;

      case 'PAYMENT_OVERDUE':
        await supabase
          .from('invoices')
          .update({ status: 'overdue' })
          .eq('external_id', paymentId);
        break;

      case 'PAYMENT_REFUNDED':
        await supabase
          .from('invoices')
          .update({ status: 'refunded' })
          .eq('external_id', paymentId);
        break;
    }

    // Marcar webhook como processado
    await supabase
      .from('webhook_logs')
      .update({ processed: true })
      .eq('payload->>id', body.id);

  } catch (err) {
    console.error('[Webhook] Erro processando:', err);
    // NÃO retornar erro — evita retry infinito
  }

  return NextResponse.json({ received: true });
}
```

### 7E. Imprimir instruções de configuração

```
💳 CONFIGURAÇÃO DO GATEWAY DE PAGAMENTO (quando quiser ativar):

OPÇÃO 1 — Asaas (recomendado para Brasil):
1. Crie conta em https://www.asaas.com
2. Vá em Integrações → API
3. Gere API Key de SANDBOX primeiro
4. Adicione ao .env.local:
   PAYMENT_GATEWAY=asaas
   ASAAS_API_KEY=sua_api_key_sandbox
   ASAAS_SANDBOX=true
5. Configure webhook no Asaas:
   URL: https://blackbelts.com.br/api/webhooks/payment
   Eventos: PAYMENT_CONFIRMED, PAYMENT_OVERDUE, PAYMENT_REFUNDED

OPÇÃO 2 — Manual (padrão):
   Nenhuma configuração necessária.
   Faturas são registradas no banco mas pagamento é marcado manualmente.
   
⚠️ SEM GATEWAY CONFIGURADO, o sistema funciona normalmente.
   Admin cria faturas, marca como pago manualmente.
   Quando configurar o gateway, tudo começa a ser automático.
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: pluggable payment gateway — Asaas ready, manual fallback, webhook handler`

---

## SEÇÃO 8 — OFFLINE-FIRST COM SERVICE WORKER (20 min)

### 8A. Verificar PWA config

```bash
cat public/manifest.json 2>/dev/null
cat public/sw.js 2>/dev/null
ls public/icons/ 2>/dev/null
```

### 8B. Garantir manifest.json

```json
{
  "name": "BlackBelt — Gestão de Academias",
  "short_name": "BlackBelt",
  "description": "Sistema completo para gestão de academias de artes marciais",
  "start_url": "/login",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#C62828",
  "background_color": "#0A0A0A",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### 8C. Service Worker com cache inteligente

```javascript
// public/sw.js
const CACHE_NAME = 'blackbelt-v2';
const STATIC_ASSETS = ['/', '/login', '/offline'];

// Install: cache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first para API, cache-first para assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls: network-first
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          // Cache GET responses
          if (request.method === 'GET' && res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static assets: cache-first
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
    return;
  }
});

// Background sync: queue check-ins offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-checkins') {
    event.respondWith(syncOfflineCheckins());
  }
});

async function syncOfflineCheckins() {
  // Implementar: ler do IndexedDB, enviar para API, limpar
}
```

### 8D. Offline check-in queue

```typescript
// lib/offline/checkin-queue.ts
const DB_NAME = 'blackbelt-offline';
const STORE_NAME = 'pending-checkins';

export async function queueOfflineCheckIn(data: {
  studentId: string;
  classId?: string;
  academyId: string;
  timestamp: string;
}) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).add({ ...data, synced: false });
  await tx.complete;

  // Tentar sync via service worker
  if ('serviceWorker' in navigator && 'sync' in (ServiceWorkerRegistration.prototype)) {
    const reg = await navigator.serviceWorker.ready;
    await (reg as any).sync.register('sync-checkins');
  }
}

export async function getPendingCheckIns(): Promise<any[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  return tx.objectStore(STORE_NAME).getAll();
}

export async function clearSyncedCheckIns() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const all = await store.getAll();
  for (const item of all) {
    if (item.synced) store.delete(item.id);
  }
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
```

### 8E. Registrar SW no layout

```typescript
// No app/layout.tsx, adicionar:
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
  }
}, []);
```

### 8F. Offline indicator component

```typescript
// components/shared/OfflineIndicator.tsx
'use client';
import { useState, useEffect } from 'react';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-white text-center text-sm py-1 px-4">
      📡 Sem conexão — alterações serão sincronizadas quando voltar online
    </div>
  );
}
```

Adicionar `<OfflineIndicator />` no root layout, acima do `{children}`.

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: offline-first — service worker, check-in queue, offline indicator`

---

## COMANDO DE RETOMADA — FASE 2

```
Continue de onde parou na FASE 2 do BLACKBELT_ENTERPRISE_P2.md. Verifique estado: grep -c "🟢\|🔴" AUDIT_SERVICES.md 2>/dev/null && ls lib/api/gateways/ 2>/dev/null && pnpm typecheck 2>&1 | tail -5. Continue da próxima seção incompleta. ZERO erros. Commit e push. Comece agora.
```

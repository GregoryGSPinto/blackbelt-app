# BLACKBELT v2 — Plano MVP Real

> De Mock para Produto Vendável
> 6 Sprints · 30 Prompts Cirúrgicos · Foco em Profundidade
>
> Autor: Gregory Gonçalves Silveira Pinto
> Data: Março 2026 | Pré-requisito: Codebase atual (Fases 0-30 em mock)

---

## Filosofia

O codebase atual tem 150+ services, 100+ páginas, e cobertura visual de marketplace a wearables. Mas tudo roda com `isMock() = true`. Nenhum dado persiste. Nenhum pagamento processa. Nenhum email envia.

Este plano NÃO adiciona features novas. Ele pega o que já existe e faz funcionar de verdade. Ao final dos 6 sprints, um dono de academia real consegue:

1. Criar conta e logar
2. Cadastrar alunos
3. Criar turmas com horários
4. Fazer chamada / check-in
5. Ver dashboard com dados reais
6. Cobrar mensalidade via PIX/boleto

Isso é o suficiente para vender. Todo o resto (IA, marketplace, wearables, franquias) vira roadmap pós-revenue.

---

## Visão dos 6 Sprints

| Sprint | Nome | Duração | Resultado |
|--------|------|---------|-----------|
| 1 | Supabase Live | 2-3 dias | Banco real rodando com migrações |
| 2 | Auth Real | 2-3 dias | Login, registro, perfis funcionando de verdade |
| 3 | Core CRUD Real | 3-4 dias | Alunos, turmas, matrículas persistindo no banco |
| 4 | Check-in Real | 2-3 dias | Presença registrada de verdade, QR funcional |
| 5 | Dashboard Real | 2-3 dias | KPIs calculados do banco, não de mock |
| 6 | Cobrança Real | 3-4 dias | PIX/boleto gerando de verdade via Asaas |

**Total estimado: 15-20 dias de trabalho focado.**

---

## SPRINT 1 — SUPABASE LIVE

Objetivo: banco de dados real rodando, migrações aplicadas, seed de demo, conexão funcionando.

---

#### MVP-01 📋: Criar Projeto Supabase

```
AÇÃO MANUAL:
1. Acesse supabase.com e crie conta (se não tem)
2. Crie novo projeto:
   - Nome: blackbelt-production
   - Região: South America (sa-east-1) ou US East
   - Senha do banco: gere uma forte e GUARDE
3. Aguarde o projeto ficar ready (~2min)
4. Vá em Settings > API e copie:
   - Project URL → será NEXT_PUBLIC_SUPABASE_URL
   - anon public key → será NEXT_PUBLIC_SUPABASE_ANON_KEY
   - service_role key → será SUPABASE_SERVICE_ROLE_KEY
5. Vá em Settings > General e copie:
   - Reference ID → será SUPABASE_PROJECT_REF
6. Crie arquivo .env.local na raiz do projeto:

NEXT_PUBLIC_USE_MOCK=true
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

(Mantenha mock=true por enquanto. Vamos trocar quando tudo estiver pronto.)
```

---

#### MVP-02 🔧: Rodar Migrações no Supabase Real

```
O projeto já tem 9 arquivos de migração em supabase/migrations/.
Porém, esses arquivos foram escritos para um cenário ideal e podem
ter problemas ao rodar num Supabase real. Sua tarefa:

1. Instale Supabase CLI se não tem:
   pnpm add -D supabase

2. Faça login e link:
   npx supabase login
   npx supabase link --project-ref $SUPABASE_PROJECT_REF

3. ANTES de rodar as migrações, revise cada arquivo:
   - Leia supabase/migrations/001_auth_profiles.sql até 009_seed.sql
   - Verifique se as tabelas referenciam auth.users corretamente
   - Verifique se os tipos (text, uuid, numeric, timestamptz) estão corretos
   - Verifique se as RLS policies usam auth.uid() corretamente
   - A seed (009) deve funcionar para demo mas NÃO deve rodar em produção

4. Corrija qualquer problema encontrado nos SQLs.

5. Rode dry-run primeiro:
   npx supabase db push --dry-run

6. Se dry-run OK, aplique:
   npx supabase db push

7. Verifique no Supabase Dashboard:
   - Table Editor: todas as tabelas devem aparecer
   - Auth: deve estar habilitado
   - Pelo menos: profiles, academies, units, memberships,
     students, classes, class_enrollments, attendance,
     modalities, plans, subscriptions, invoices

8. Se alguma migração falhar:
   - Leia o erro exato
   - Corrija o SQL
   - Re-rode apenas a migração que falhou
   - NÃO ignore erros

9. Teste conexão básica criando um arquivo de teste:
   scripts/test-supabase-connection.ts que faz:
   - Conecta ao Supabase com as credentials do .env.local
   - Faz SELECT 1
   - Lista as tabelas existentes
   - Printa: "Conexão OK. X tabelas encontradas."
```

---

#### MVP-03 🔧: Configurar Supabase Client Real

```
O projeto já tem lib/supabase/client.ts mas precisa ser
verificado e testado com conexão real:

1. Verifique lib/supabase/client.ts:
   - createBrowserClient() deve usar @supabase/ssr
   - createServerClient() deve aceitar cookie store
   - Ambos devem usar as env vars corretas

2. Crie lib/supabase/admin.ts:
   - Usa SUPABASE_SERVICE_ROLE_KEY (server-side only)
   - Para operações que precisam bypass de RLS (ex: seed, admin)
   - NUNCA expor no client

3. Gere os types reais do banco:
   npx supabase gen types typescript --project-id $REF > lib/supabase/database.types.ts

4. Crie lib/supabase/helpers.ts:
   - getSupabase() → retorna browser ou server client conforme contexto
   - handleSupabaseError(error) → converte erro Supabase para ServiceError

5. Teste: crie um script que:
   - Insere um registro em academies
   - Lê de volta
   - Deleta
   - Confirma que RLS funciona (sem auth → bloqueia)

6. NÃO mude isMock() ainda. Apenas confirme que a conexão funciona.
```

---

## SPRINT 2 — AUTH REAL

Objetivo: um usuário real consegue criar conta, logar, e ser redirecionado para o dashboard correto.

---

#### MVP-04 🔧: Supabase Auth Setup

```
Configure autenticação real no Supabase:

1. No Supabase Dashboard > Auth > Providers:
   - Email habilitado (já é default)
   - Desabilite "Confirm email" por enquanto (simplifica o beta)
   - Configure Site URL: http://localhost:3000 (dev)
   - Configure Redirect URLs: http://localhost:3000/**

2. No Supabase Dashboard > Auth > Email Templates:
   - Customize o template de "Confirm signup" (visual BlackBelt)
   - Customize "Reset password"
   - Customize "Magic link" (se for usar)

3. Crie um trigger no banco que automaticamente cria um profile
   quando um user se registra:

   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS trigger AS $$
   BEGIN
     INSERT INTO public.profiles (id, user_id, role, display_name)
     VALUES (gen_random_uuid(), NEW.id, 'admin', COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'));
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION handle_new_user();

4. Teste: crie um usuário pelo Supabase Dashboard > Auth > Users > Add user
   - Verifique que profile foi criado automaticamente
   - Verifique que o user aparece na tabela profiles
```

---

#### MVP-05 🔧: Auth Service Real (Substituir Mock)

```
Reescreva lib/api/auth.service.ts para funcionar com Supabase real.
O mock CONTINUA existindo (isMock() ainda funciona), mas agora o
branch real faz login de verdade:

login(email, password):
  MOCK: retorna token fake (como já faz)
  REAL:
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new ServiceError(401, 'auth.login', error.message);
    // Buscar profiles do user
    const profiles = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', data.user.id);
    return { session: data.session, profiles: profiles.data };

register(data):
  MOCK: retorna user fake
  REAL:
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { name: data.name } }
    });
    // Trigger cria profile automaticamente
    // Criar academy se é o primeiro registro
    return { user: authData.user };

logout():
  REAL: await supabase.auth.signOut();

refreshToken():
  REAL: await supabase.auth.refreshSession();

Teste com mock=false:
  - Crie um user no Supabase
  - Tente logar no app
  - Deve funcionar com redirect para dashboard
```

---

#### MVP-06 🔧: Middleware de Auth Real

```
Reescreva middleware.ts para funcionar com Supabase Auth real:

1. O middleware atual decodifica JWT manualmente.
   Com Supabase, use o middleware helper oficial:

   import { createServerClient } from '@supabase/ssr';
   import { NextResponse, type NextRequest } from 'next/server';

   export async function middleware(request: NextRequest) {
     const response = NextResponse.next();

     const supabase = createServerClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
       { cookies: { /* get/set/remove from request/response */ } }
     );

     const { data: { user } } = await supabase.auth.getUser();

     if (!user && !isPublicRoute(request.pathname)) {
       return NextResponse.redirect(new URL('/login', request.url));
     }

     if (user) {
       // Buscar role do profile
       // Verificar se a rota é permitida para o role
       // Redirect se role não match
     }

     return response;
   }

2. isMock() check: se mock=true, use o middleware antigo (token fake).
   Se mock=false, use Supabase real.

3. Teste:
   - mock=true → funciona como antes
   - mock=false → sem sessão Supabase → redirect /login
   - mock=false → com sessão → acessa dashboard correto
```

---

#### MVP-07 🔧: Fluxo de Registro de Academia

```
Quando um dono de academia se registra, o sistema precisa:
1. Criar auth user (Supabase Auth)
2. Profile criado automaticamente (trigger)
3. Criar academy
4. Criar membership (admin da academy)
5. Redirect para setup wizard

Reescreva app/(auth)/cadastro/page.tsx para:
- Form: nome, email, senha, nome da academia
- Submit chama: register → createAcademy → createMembership
- Redirect para /(admin)/admin/setup-wizard (já existe)

Crie (ou ajuste) o fluxo real em lib/api/onboarding.service.ts:
  MOCK: retorna dados fake
  REAL:
    1. supabase.auth.signUp()
    2. supabase.from('academies').insert({ name, slug, owner_id })
    3. supabase.from('memberships').insert({ profile_id, academy_id, role: 'admin' })

Teste end-to-end:
  - Abra /cadastro
  - Preencha dados
  - Submit
  - User criado no Supabase Auth
  - Academy criada no banco
  - Profile + Membership criados
  - Redirect para setup wizard
  - Volte para /login e logue com as credenciais criadas
```

---

## SPRINT 3 — CORE CRUD REAL

Objetivo: admin cria turmas e alunos que persistem de verdade no banco.

---

#### MVP-08 🔧: Service de Academy/Membership Real

```
Reescreva os services de tenant para funcionar com Supabase:

lib/api/academy.service.ts (criar se não existe):
  REAL:
  - getMyAcademy() → busca academy via membership do user logado
  - updateAcademy(id, data) → update no banco
  - getUnits(academyId) → lista unidades

lib/api/membership.service.ts (criar se não existe):
  REAL:
  - getMyMembership() → busca membership do user + academy
  - getMembers(academyId) → lista membros da academy
  - inviteMember(email, role) → cria convite

Padrão: cada service mantém isMock() bifurcação.
O branch REAL usa supabase.from('tabela').select/insert/update.
Sempre filtra por academy_id (multi-tenant obrigatório).

Teste: logue como admin → getMyAcademy retorna a academy real.
```

---

#### MVP-09 🔧: CRUD de Alunos Real

```
Reescreva lib/api/admin-alunos.service.ts (ou equivalente) para
persistir alunos no Supabase real:

list(academyId, filters?):
  REAL: supabase.from('students')
    .select('*, profiles(*)')
    .eq('academy_id', academyId)
    → retorna lista real de alunos

create(data):
  REAL:
    1. supabase.auth.admin.createUser({ email, password })
       (usa service_role key via API route)
    2. Profile criado pelo trigger
    3. supabase.from('students').insert({ profile_id, academy_id, belt: 'white' })
    4. supabase.from('memberships').insert({ profile_id, academy_id, role: 'aluno_adulto' })
  Ou alternativa: admin cadastra aluno, aluno recebe email para criar senha.

update(id, data):
  REAL: supabase.from('students').update(data).eq('id', id)

delete(id):
  REAL: soft delete (status = inactive), nunca hard delete

IMPORTANTE: Criar aluno é o fluxo mais complexo porque envolve
auth user + profile + student + membership. Crie uma Edge Function
ou API Route que faça tudo numa transação.

Crie app/api/admin/students/route.ts:
  POST → cria user + profile + student + membership
  Usa SUPABASE_SERVICE_ROLE_KEY para criar user programaticamente

Teste:
  - Login como admin (mock=false)
  - Vá em gestão de alunos
  - Clique "Novo aluno"
  - Preencha e salve
  - Refresh a página → aluno ainda está lá (persistiu!)
  - Vá no Supabase Dashboard → veja o registro na tabela
```

---

#### MVP-10 🔧: CRUD de Turmas Real

```
Reescreva lib/api/turmas.service.ts para persistir no Supabase:

list(academyId):
  REAL: supabase.from('classes')
    .select('*, modalities(name), profiles!professor_id(display_name)')
    .eq('academy_id', academyId) via join com modalities

create(data):
  REAL: supabase.from('classes').insert({
    modality_id, unit_id, professor_id, schedule, capacity, academy_id
  })

update(id, data):
  REAL: supabase.from('classes').update(data).eq('id', id)

delete(id):
  REAL: supabase.from('classes').delete().eq('id', id)
  (ou soft delete se tiver enrollments)

Também reescreva:
- lib/api/horarios.service.ts → busca schedule real das turmas
- Matrícula de aluno em turma: supabase.from('class_enrollments').insert()

Teste:
  - Login como admin
  - Criar modalidade "Jiu-Jitsu"
  - Criar turma "BJJ Iniciante" → seg/qua/sex 19h
  - Ver turma na grade horária
  - Matricular um aluno na turma
  - Refresh → tudo persiste
```

---

#### MVP-11 🔧: CRUD de Modalidades Real

```
Crie lib/api/modalidades.service.ts (se não existe como service dedicado):

list(academyId):
  REAL: supabase.from('modalities').select('*').eq('academy_id', academyId)

create(data):
  REAL: supabase.from('modalities').insert({ name, belt_required, academy_id })

update(id, data):
  REAL: supabase.from('modalities').update(data).eq('id', id)

delete(id):
  REAL: supabase.from('modalities').delete().eq('id', id)
  (verificar se não tem turmas vinculadas antes)

Crie ou ajuste a tela admin de modalidades:
app/(admin)/admin/modalidades/page.tsx:
  - Lista de modalidades com ícone, nome, faixa mínima
  - Botão "Nova modalidade" → modal com form
  - Editar/excluir

Esse é simples mas fundamental — turmas dependem de modalidades.

Teste: criar BJJ, Judô, MMA. Verificar que aparecem no dropdown de criar turma.
```

---

## SPRINT 4 — CHECK-IN REAL

Objetivo: professor faz chamada e presença é registrada de verdade. Aluno faz check-in via QR real.

---

#### MVP-12 🔧: Check-in Service Real

```
Reescreva lib/api/checkin.service.ts para persistir no Supabase:

doCheckin(studentId, classId, method):
  REAL:
    // Verificar duplicata (1 por aluno/turma/dia)
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase.from('attendance')
      .select('id')
      .eq('student_id', studentId)
      .eq('class_id', classId)
      .gte('checked_at', today)
      .lt('checked_at', tomorrow);

    if (existing.length > 0) throw new ServiceError(409, 'checkin', 'Já fez check-in hoje');

    const { data } = await supabase.from('attendance').insert({
      student_id: studentId,
      class_id: classId,
      method,
      checked_at: new Date().toISOString(),
    }).select().single();

    return data;

getHistory(studentId, dateRange?):
  REAL: supabase.from('attendance')
    .select('*, classes(*, modalities(name))')
    .eq('student_id', studentId)
    .order('checked_at', { ascending: false })

getStats(studentId):
  REAL: calcular do banco:
    - Total de presenças
    - Frequência do mês atual
    - Streak (dias consecutivos)

getTodayByClass(classId):
  REAL: presenças de hoje para a turma (para a chamada do professor)

Teste:
  - Login como professor
  - Abrir turma ativa
  - Marcar presença de 3 alunos
  - Verificar no Supabase Dashboard que 3 registros foram criados
  - Login como aluno → ver presença no histórico
```

---

#### MVP-13 🔧: QR Code Real

```
Reescreva lib/api/qrcode.service.ts para funcionar de verdade:

generateQR(classId, professorId):
  REAL:
    // Gera payload com dados + assinatura + expiração
    const payload = {
      classId,
      professorId,
      timestamp: Date.now(),
      expires: Date.now() + 5 * 60 * 1000, // 5 min
    };
    // Assinar com HMAC (usando uma secret key)
    const signature = hmacSign(JSON.stringify(payload), QR_SECRET);
    return JSON.stringify({ ...payload, signature });

validateQR(qrData, studentId):
  REAL:
    const data = JSON.parse(qrData);
    // Verificar assinatura
    // Verificar expiração
    // Verificar que aluno está matriculado na turma
    // Fazer check-in
    return doCheckin(studentId, data.classId, 'qr_code');

Para renderizar o QR code real no frontend:
  pnpm add qrcode.react
  import { QRCodeSVG } from 'qrcode.react';
  <QRCodeSVG value={qrData} size={256} />

Para ler QR code do aluno (mobile):
  - No Capacitor: usar @capacitor-community/barcode-scanner
  - No web: usar html5-qrcode (câmera do browser)
  pnpm add html5-qrcode

Atualize components/checkin/QRScanner.tsx para usar html5-qrcode:
  import { Html5QrcodeScanner } from 'html5-qrcode';
  // Inicializa scanner, onScan chama validateQR

Teste end-to-end:
  1. Professor abre turma ativa
  2. Clica "Gerar QR Code"
  3. QR aparece na tela
  4. Aluno abre app no celular
  5. Clica no FAB de check-in
  6. Escaneia o QR do professor
  7. Toast: "Check-in realizado!"
  8. Professor vê aluno como "presente" na chamada
  9. Banco: registro de attendance com method='qr_code'
```

---

#### MVP-14 🔧: Chamada do Professor Real

```
Reescreva app/(professor)/turma-ativa/page.tsx para dados reais:

Ao abrir:
  1. Buscar turmas do professor (supabase.from('classes').select().eq('professor_id', myId))
  2. Identificar turma do horário atual
  3. Buscar alunos matriculados (class_enrollments + students)
  4. Buscar presenças de hoje (attendance de hoje para essa turma)
  5. Renderizar lista com status de presença real

Ao marcar presença manualmente:
  1. Chamar doCheckin(studentId, classId, 'manual')
  2. Atualizar UI otimisticamente
  3. Se erro (duplicata) → toast de aviso

Ao gerar QR:
  1. Chamar generateQR(classId, professorId)
  2. Renderizar QRCodeSVG
  3. Timer de 5min visível
  4. Regenerar ao expirar

Ao encerrar aula:
  1. Salvar resumo (total presentes, total matriculados)
  2. Notificar alunos ausentes (futuro)
  3. Redirect para dashboard

Teste: professor faz chamada → 10 de 15 presentes → dados persistem → admin vê no dashboard.
```

---

## SPRINT 5 — DASHBOARD REAL

Objetivo: admin vê KPIs calculados de dados reais do banco, não de mock.

---

#### MVP-15 🔧: Admin Dashboard Real

```
Reescreva lib/api/admin.service.ts getDashboard() para calcular do banco:

totalAlunos:
  supabase.from('students').select('id', { count: 'exact' }).eq('academy_id', aid)

alunosAtivos:
  supabase.from('memberships').select('id', { count: 'exact' })
    .eq('academy_id', aid).eq('status', 'active').in('role', ['aluno_adulto','aluno_teen','aluno_kids'])

novosEsteMes:
  supabase.from('students').select('id', { count: 'exact' })
    .eq('academy_id', aid).gte('created_at', firstDayOfMonth)

totalTurmas:
  supabase.from('classes').select('id', { count: 'exact' }).eq('academy_id', aid)

presencaMedia:
  Total de presenças este mês / (alunos ativos × aulas no mês) × 100

ultimosCheckins:
  supabase.from('attendance')
    .select('*, students(*, profiles(display_name)), classes(*, modalities(name))')
    .order('checked_at', { ascending: false }).limit(5)

receitaMensal:
  supabase.from('invoices')
    .select('amount').eq('status', 'paid')
    .gte('due_date', firstDayOfMonth)
    → somar amounts

inadimplencia:
  invoices overdue / total invoices deste mês × 100

A tela app/(admin)/dashboard/page.tsx já existe e consome o service.
Só precisa que o service retorne dados reais.

Teste:
  - Login como admin com mock=false
  - Dashboard mostra dados reais do banco
  - Adicione um aluno → refresh → total atualiza
  - Faça um check-in → últimos check-ins atualiza
```

---

#### MVP-16 🔧: Professor Dashboard Real

```
Reescreva lib/api/professor.service.ts para dados reais:

getDashboard(professorId):
  - Minhas turmas: supabase.from('classes').select('*, modalities(name), class_enrollments(count)')
    .eq('professor_id', professorId)
  - Próxima aula: filtrar por schedule × hora atual
  - Presença média: calcular das últimas 4 semanas
  - Alunos: distinct students das minhas turmas

A tela já existe. Só precisa dados reais.

Teste: login como professor → vê suas turmas reais, seus alunos reais, presença real.
```

---

#### MVP-17 🔧: Aluno Dashboard Real

```
Reescreva para dados reais o dashboard do aluno:

- Próxima aula: buscar classes que estou matriculado, filtrar por schedule
- Frequência do mês: count attendance deste mês
- Streak: calcular dias consecutivos com presença
- Progresso de faixa: buscar student.belt + requisitos da próxima

Teste: login como aluno → vê sua próxima aula real, presença real, faixa real.
```

---

## SPRINT 6 — COBRANÇA REAL

Objetivo: o sistema gera uma cobrança PIX de verdade e processa o pagamento.

---

#### MVP-18 📋: Criar Conta Asaas

```
AÇÃO MANUAL:
1. Acesse asaas.com
2. Crie conta (PF ou PJ — PJ se tiver CNPJ/MEI)
3. Vá em Integrações > API
4. Gere API Key de SANDBOX primeiro
5. Anote:
   - ASAAS_API_KEY (sandbox)
   - ASAAS_WEBHOOK_TOKEN
6. Configure webhook no sandbox:
   - URL: https://SEU-DOMINIO/api/webhooks/payment
   - Ou use ngrok para testar local: ngrok http 3000
   - Eventos: PAYMENT_CONFIRMED, PAYMENT_OVERDUE, PAYMENT_REFUNDED
7. Adicione ao .env.local:
   PAYMENT_GATEWAY=asaas
   ASAAS_API_KEY=xxx
   ASAAS_SANDBOX=true
```

---

#### MVP-19 🔧: Gateway Asaas Real

```
Reescreva lib/api/gateways/asaas.gateway.ts com chamadas HTTP reais:

const BASE_URL = process.env.ASAAS_SANDBOX === 'true'
  ? 'https://sandbox.asaas.com/api/v3'
  : 'https://api.asaas.com/api/v3';

const headers = {
  'Content-Type': 'application/json',
  'access_token': process.env.ASAAS_API_KEY,
};

createCustomer(data):
  POST /customers → { name, email, cpfCnpj, phone }
  Retorna: { id: 'cus_xxx' }

createPayment(customerId, planPrice, dueDate):
  POST /payments → {
    customer: customerId,
    billingType: 'UNDEFINED', // aceita PIX, boleto, cartão
    dueDate: '2026-04-05',
    value: 197.00,
    description: 'BlackBelt Pro — Março 2026'
  }
  Retorna: { id, invoiceUrl, bankSlipUrl, pixQrCode }

getPayment(paymentId):
  GET /payments/{id}
  Retorna status: PENDING, CONFIRMED, OVERDUE, etc.

Crie app/api/webhooks/payment/route.ts:
  POST handler que:
  1. Valida access_token do header
  2. Parse evento (payment_confirmed, payment_overdue, etc)
  3. Atualiza invoice no banco (status = paid/overdue)
  4. Log do evento

Teste no sandbox:
  1. Criar customer
  2. Criar payment
  3. Acessar invoiceUrl → simular pagamento
  4. Webhook recebido → invoice atualizada no banco
```

---

#### MVP-20 🔧: Fluxo de Assinatura Real

```
Conecte o fluxo completo de assinatura:

Quando admin cadastra um plano na academia:
  1. supabase.from('plans').insert({ name, price, interval, academy_id })

Quando aluno (ou responsável) assina:
  1. Criar customer no Asaas (se não existe)
  2. Criar subscription no Asaas (recorrente)
  3. Salvar subscription no banco com external_id do Asaas
  4. Primeira fatura gerada automaticamente pelo Asaas
  5. Salvar invoice no banco

Webhook processa:
  - payment_confirmed → marca invoice como paid, notifica aluno
  - payment_overdue → marca como overdue, notifica admin
  - subscription_deleted → cancela no banco

Atualize app/(admin)/admin/financeiro/page.tsx:
  - Mostrar faturas reais do banco
  - Status real (pago/pendente/vencido)
  - Link para boleto/PIX do Asaas

Teste end-to-end no sandbox:
  1. Admin cria plano "Mensal R$ 150"
  2. Aluno assina o plano
  3. Fatura PIX gerada
  4. Aluno paga (no sandbox: simular pagamento)
  5. Webhook confirma
  6. Admin vê fatura como "Pago" no dashboard
```

---

#### MVP-21 📋: Testar com R$ 1 Real

```
AÇÃO MANUAL — Teste com dinheiro real:
1. No Asaas, troque para API de PRODUÇÃO
2. Atualize ASAAS_API_KEY no .env.local (chave de produção)
3. Atualize ASAAS_SANDBOX=false
4. Crie uma cobrança de R$ 1,00 para você mesmo
5. Pague via PIX real
6. Confirme:
   - [ ] QR code PIX renderizou
   - [ ] Pagamento processou no Asaas
   - [ ] Webhook recebido
   - [ ] Invoice atualizada no banco
   - [ ] Dashboard do admin mostra como "Pago"
7. Se tudo OK: o sistema processa pagamentos reais.
```

---

## PÓS-SPRINTS — Checklist para Vender

```
Após os 6 sprints, verifique:

FUNCIONAL:
- [ ] Admin cria conta e loga (real)
- [ ] Admin configura academy (nome, modalidades)
- [ ] Admin cria turmas com horários
- [ ] Admin cadastra alunos (email + dados)
- [ ] Professor vê suas turmas e faz chamada
- [ ] Professor gera QR e aluno escaneia (real)
- [ ] Presença persiste e aparece nos dashboards
- [ ] Admin cria plano de pagamento
- [ ] Sistema gera cobrança PIX/boleto (real)
- [ ] Pagamento processado via webhook
- [ ] Dashboard admin mostra KPIs reais
- [ ] Dashboard professor mostra dados reais
- [ ] Dashboard aluno mostra dados reais

INFRAESTRUTURA:
- [ ] Supabase em produção
- [ ] Vercel com domínio customizado
- [ ] HTTPS funcionando
- [ ] Variáveis de ambiente configuradas

LEGAL:
- [ ] Política de privacidade no ar
- [ ] Termos de uso no ar

PRONTO PARA BETA:
- [ ] Convidar 3-5 academias
- [ ] Onboarding guiado (setup wizard existe)
- [ ] Suporte via WhatsApp
- [ ] Cobrar após 30 dias de teste

Se todos os checkboxes acima estão marcados:
VOCÊ TEM UM MVP VENDÁVEL.

Tudo o que foi construído nas Fases 0-30 (marketplace, IA,
wearables, franquias, competições) continua existindo no código
e pode ser ativado incrementalmente conforme os clientes pedem.
Mas o core funciona DE VERDADE.
```

---

## Resumo

| Sprint | Prompts | Foco | Resultado |
|--------|---------|------|-----------|
| 1 | MVP-01 a MVP-03 | Supabase Live | Banco real conectado |
| 2 | MVP-04 a MVP-07 | Auth Real | Login/registro real |
| 3 | MVP-08 a MVP-11 | Core CRUD | Alunos/turmas persistem |
| 4 | MVP-12 a MVP-14 | Check-in Real | Presença funciona |
| 5 | MVP-15 a MVP-17 | Dashboard Real | KPIs de dados reais |
| 6 | MVP-18 a MVP-21 | Cobrança Real | PIX/boleto processando |

---

> **21 prompts. 6 sprints. ~15-20 dias.**
> Menos é mais. Profundidade > amplitude.
> Ao final: o dono da academia cadastra alunos, faz chamada,
> cobra mensalidade, e vê seus dados de verdade.
> Isso é um produto. Isso vende.

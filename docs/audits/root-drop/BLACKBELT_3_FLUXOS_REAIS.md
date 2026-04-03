# BLACKBELT v2 — 3 FLUXOS REAIS: CADASTRO + CHECK-IN + PRESENÇA
## O Mínimo Pra Uma Academia Usar De Verdade No Primeiro Dia

> O app tem 275 páginas e 220 services conectados ao Supabase.
> Mas o que importa pro PRIMEIRO DIA de uso real de uma academia são 3 coisas:
> 1. Admin cadastra aluno → aluno existe no banco → aparece em tudo
> 2. Recepcionista faz check-in → presença salva → todos veem
> 3. Professor faz chamada → presença persiste → aluno vê frequência
>
> Se esses 3 funcionam de verdade, a academia usa o app amanhã.
> O resto pode ir sendo conectado semana a semana.

---

## ANTES DE COMEÇAR

```bash
# 1. Confirmar que Supabase está conectado
echo "=== ENV ==="
grep "SUPABASE_URL\|USE_MOCK" .env.local 2>/dev/null
# DEVE mostrar: NEXT_PUBLIC_USE_MOCK=false
# DEVE mostrar: NEXT_PUBLIC_SUPABASE_URL=https://tdplmmodmumryzdosmpv.supabase.co

# 2. Confirmar que seed rodou
echo "=== SEED STATUS ==="
# Rodar query no Supabase via script ou CLI:
# Crie um script rápido pra verificar:
cat > /tmp/check_data.ts << 'EOF'
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
async function check() {
  const tables = ['academies','profiles','memberships','students','classes','class_enrollments','attendance','invoices'];
  for (const t of tables) {
    const { count } = await supabase.from(t).select('*', { count: 'exact', head: true });
    console.log(`${t}: ${count ?? 0}`);
  }
  const { data: users } = await supabase.auth.admin.listUsers();
  console.log(`auth.users: ${users?.users?.length ?? 0}`);
}
check();
EOF
npx tsx /tmp/check_data.ts

# SE tabelas vazias (0): O seed precisa rodar primeiro.
# SE tabelas com dados (30+ profiles, 3000+ attendance): Prosseguir.

# 3. Confirmar que o app builda
pnpm typecheck && pnpm build
```

---

═══════════════════════════════════════════════════════════════
FLUXO 1 — CADASTRAR ALUNO REAL (Admin → Banco → Todos Veem)
═══════════════════════════════════════════════════════════════

Este é O fluxo mais importante. Se o admin cadastra um aluno e ele
aparece em todo o sistema, o software é real.

### 1.1 Identificar o service de cadastro de alunos

```bash
# Encontrar o service responsável
grep -rn "criarAluno\|createStudent\|addStudent\|cadastrarAluno\|registerStudent" \
  lib/api/ --include="*.ts" | head -20

# Encontrar o form de cadastro
grep -rn "onSubmit\|handleSubmit\|handleCreate\|handleSave" \
  app/\(admin\)/admin/alunos/ --include="*.tsx" | head -20

# Encontrar o form da recepcionista
grep -rn "onSubmit\|handleSubmit" \
  app/\(recepcao\)/recepcao/cadastro/ --include="*.tsx" 2>/dev/null | head -10
```

### 1.2 Verificar e corrigir o service

```
Abrir o service que cria alunos (provavelmente students.service.ts ou admin-alunos.service.ts).

VERIFICAR que a função de criação faz TUDO isso na branch real (else do isMock):

1. Criar user no Supabase Auth (se email novo):
   const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
     email: dados.email,
     password: 'BlackBelt@2026', // senha padrão inicial
     email_confirm: true,
     user_metadata: { display_name: dados.nome }
   });

   SE auth.admin NÃO funciona no client (precisa service_role):
   Criar API route: app/api/students/create/route.ts
   Essa route usa service_role key (server-side) pra criar o user.

   ALTERNATIVA: Se não quer criar auth user no cadastro (o aluno cria quando
   receber o convite), pular o auth e criar só profile + student.

2. Criar profile:
   await supabase.from('profiles').insert({
     user_id: authUser?.id || null, // null se não criou auth
     display_name: dados.nome,
     avatar_url: null,
     role: dados.idade && dados.idade < 13 ? 'aluno_kids' 
           : dados.idade && dados.idade < 18 ? 'aluno_teen' 
           : 'aluno_adulto',
   }).select().single();

3. Criar membership:
   await supabase.from('memberships').insert({
     profile_id: profile.id,
     academy_id: academyId,
     role: profile.role,
     status: 'active',
   });

4. Criar student:
   await supabase.from('students').insert({
     profile_id: profile.id,
     academy_id: academyId,
     belt: dados.faixa || 'white',
     stripes: 0,
     phone: dados.telefone,
     cpf: dados.cpf,
     birth_date: dados.nascimento,
     emergency_contact: dados.contatoEmergencia,
     medical_notes: dados.observacoes,
   });

5. Criar class_enrollment (se turma foi selecionada):
   await supabase.from('class_enrollments').insert({
     student_id: student.id, // ou profile_id dependendo do schema
     class_id: dados.turmaId,
     academy_id: academyId,
     status: 'active',
   });

6. Se menor de 18 e tem responsável:
   await supabase.from('guardian_links').insert({
     guardian_profile_id: dados.responsavelProfileId,
     student_profile_id: profile.id,
     relationship: 'parent',
   });

CADA INSERT deve ter try/catch:
  Se erro: console.error + retornar { success: false, error: mensagem }
  Se sucesso: retornar { success: true, studentId: student.id }
```

### 1.3 Verificar o form do Admin

```
Abrir app/(admin)/admin/alunos/page.tsx (ou o form de criação)

VERIFICAR que o botão "Salvar" / "Cadastrar":
1. Coleta TODOS os campos do form
2. Chama o service com os dados
3. Mostra loading no botão durante a chamada
4. Se sucesso: toast "Aluno cadastrado!" + recarregar lista
5. Se erro: toast de erro com mensagem

SE O FORM NÃO CHAMA O SERVICE REAL:
Conectar. O onSubmit deve chamar a função real, não mock.

TESTAR MENTALMENTE:
- Admin preenche nome "Teste Real" + email "teste@real.com" + turma "BJJ Iniciante"
- Clica "Salvar"
- Aluno aparece na tabela de alunos
- Aluno aparece na turma "BJJ Iniciante"
- Se abrir o Supabase Dashboard → tabela students → o registro está lá
```

### 1.4 Verificar o form da Recepcionista

```
Mesmo processo para app/(recepcao)/recepcao/cadastro/page.tsx
O form de matrícula da recepcionista DEVE usar o MESMO service.
Se usa um service diferente: verificar que também persiste no Supabase.
```

### 1.5 Verificar que aluno aparece em TODOS os lugares

```
Após cadastro, o aluno novo deve aparecer em:
- /admin/alunos (lista de alunos) → query: supabase.from('students')...
- /admin/turmas → [turma] → lista de alunos → query: supabase.from('class_enrollments')...
- /professor/alunos (se professor daquela turma) → query filtrada
- /professor/presenca (na chamada daquela turma)
- /recepcao/checkin (busca por nome)
- /recepcao/alunos (busca)

PARA CADA página acima:
  Verificar que a query Supabase faz SELECT real (não retorna mock).
  Se retorna mock: corrigir o service para fazer query real.
  Se query dá erro: verificar tabela + colunas + RLS policy.
```

```bash
# Commit intermediário
git add -A
git commit -m "feat: real flow 1 — student registration persists to Supabase, appears across all profiles"
git push origin main
```

---

═══════════════════════════════════════════════════════════════
FLUXO 2 — CHECK-IN REAL (Recepcionista → Banco → Todos Veem)
═══════════════════════════════════════════════════════════════

O aluno chega na academia. A recepcionista registra a entrada.
Isso precisa salvar no banco E aparecer em tempo real.

### 2.1 Identificar o service de check-in

```bash
grep -rn "registrarEntrada\|checkIn\|registerCheckin\|marcarPresenca" \
  lib/api/ --include="*.ts" | head -20

grep -rn "onSubmit\|handleCheckin\|registrarEntrada" \
  app/\(recepcao\)/recepcao/checkin/ --include="*.tsx" | head -10
```

### 2.2 Verificar e corrigir o service

```
O check-in DEVE fazer:

1. Buscar aluno por nome (autocomplete):
   const { data } = await supabase
     .from('students')
     .select('id, profile_id, profiles(display_name, avatar_url), belt')
     .eq('academy_id', academyId)
     .ilike('profiles.display_name', `%${query}%`)
     .limit(10);

   SE a query não funciona por causa do join:
   Tentar via profiles primeiro:
   const { data } = await supabase
     .from('profiles')
     .select('id, display_name, avatar_url, students(id, belt)')
     .eq('academy_id', ???) // pode não ter academy_id direto
     .ilike('display_name', `%${query}%`)
     .limit(10);

   SE nenhum join funciona:
   Buscar profiles e students separadamente e cruzar em JS.

2. Verificar status financeiro do aluno:
   const { data: invoice } = await supabase
     .from('invoices')
     .select('status, due_date')
     .eq('student_id', studentId)
     .order('due_date', { ascending: false })
     .limit(1)
     .single();
   
   Se invoice.status !== 'paid' && due_date < hoje: inadimplente

3. Registrar entrada (INSERT na tabela attendance):
   await supabase.from('attendance').insert({
     student_id: studentId, // ou profile_id
     class_id: classId || null, // turma do horário atual, se identificável
     academy_id: academyId,
     date: new Date().toISOString().split('T')[0],
     status: 'present',
     check_in_time: new Date().toISOString(),
     check_in_method: 'manual', // ou 'qr'
   });

4. Retornar sucesso com dados do aluno.

VERIFICAR:
- O INSERT realmente salva? (checar no Supabase Dashboard → attendance → nova row?)
- O RLS permite INSERT? (a policy deve permitir insert se o user é da mesma academia)
- Se RLS bloqueia: criar policy:
  CREATE POLICY "attendance_insert" ON attendance FOR INSERT
  WITH CHECK (academy_id IN (SELECT get_my_academy_ids()));
```

### 2.3 Verificar a página de check-in

```
Abrir app/(recepcao)/recepcao/checkin/page.tsx

VERIFICAR:
1. Input de busca → ao digitar, chama service de busca → resultados aparecem
2. Selecionar aluno → card mostra dados + status financeiro
3. Botão "Registrar Entrada" → chama service → INSERT no banco → toast
4. Lista "Dentro agora" → query SELECT com check_in de hoje → mostra quem está

CADA PASSO deve usar o Supabase real, não mock.
```

### 2.4 Verificar que check-in aparece em outros lugares

```
Após check-in:
- /admin/presenca → presença do dia deve incluir o aluno
- /professor/presenca → na chamada, aluno deve aparecer como "presente" (se turma match)
- Dashboard admin → feed de atividade → "João chegou às 19:05"
- Dashboard recepcionista → "Últimos check-ins" → novo entry
- /dashboard (aluno) → frequência do mês atualizada
```

```bash
git add -A
git commit -m "feat: real flow 2 — check-in persists to Supabase, real-time across profiles"
git push origin main
```

---

═══════════════════════════════════════════════════════════════
FLUXO 3 — CHAMADA/PRESENÇA REAL (Professor → Banco → Aluno Vê)
═══════════════════════════════════════════════════════════════

O professor abre o modo aula, faz a chamada, marca quem veio.
Isso precisa salvar no banco E o aluno ver na frequência dele.

### 3.1 Identificar o service de presença

```bash
grep -rn "salvarPresenca\|saveAttendance\|registrarPresenca\|bulkAttendance" \
  lib/api/ --include="*.ts" | head -20

grep -rn "handleSubmit\|salvarPresenca\|handleFinalize" \
  app/\(professor\)/professor/presenca/ --include="*.tsx" | head -10
```

### 3.2 Verificar e corrigir o service

```
A chamada do professor DEVE fazer:

1. Listar alunos da turma:
   const { data: enrollments } = await supabase
     .from('class_enrollments')
     .select('student_id, students(id, profile_id, profiles(display_name, avatar_url), belt)')
     .eq('class_id', turmaId)
     .eq('status', 'active');

2. Salvar presença (BULK INSERT — todos os alunos de uma vez):
   
   const registros = alunos.map(a => ({
     student_id: a.studentId,
     class_id: turmaId,
     academy_id: academyId,
     date: new Date().toISOString().split('T')[0],
     status: a.presente ? 'present' : 'absent',
     check_in_time: a.presente ? new Date().toISOString() : null,
     check_in_method: 'professor_roll_call',
     late: a.atrasado || false,
   }));

   // Usar upsert pra não duplicar se já existe presença do dia
   const { error } = await supabase
     .from('attendance')
     .upsert(registros, { 
       onConflict: 'student_id,class_id,date',
       ignoreDuplicates: false 
     });

   SE upsert dá erro por falta de unique constraint:
   Criar migração:
   CREATE UNIQUE INDEX IF NOT EXISTS attendance_unique 
   ON attendance(student_id, class_id, date);

   SE upsert não é possível: DELETE existing + INSERT new:
   await supabase.from('attendance')
     .delete()
     .eq('class_id', turmaId)
     .eq('date', hoje);
   await supabase.from('attendance').insert(registros);

3. Retornar: { success: true, presentes: X, ausentes: Y }
```

### 3.3 Verificar a página de presença do professor

```
Abrir app/(professor)/professor/presenca/page.tsx

VERIFICAR:
1. Selecionar turma → lista alunos da turma (query real do Supabase)
2. Toggle presente/ausente por aluno → state local
3. "Finalizar Aula" / "Salvar Presença" → chama service → BULK INSERT → toast
4. Histórico de chamadas → query SELECT por turma + data

MODO AULA (se existe):
1. Timer funciona
2. Lista de alunos carrega do banco
3. Toque marca presente/ausente
4. "Finalizar" salva tudo de uma vez
```

### 3.4 Verificar que presença aparece pro aluno

```
Após chamada:
- /dashboard (aluno) → frequência do mês → total de presenças atualizado
- /dashboard/presenca (ou equivalente) → calendário com dias marcados
- O dia de hoje deve aparecer como "presente" ✅ ou "ausente" ❌

Query do aluno:
const { data } = await supabase
  .from('attendance')
  .select('date, status, class_id, classes(name)')
  .eq('student_id', studentId)
  .gte('date', inicioDoMes)
  .order('date', { ascending: false });

VERIFICAR que essa query retorna dados reais.
```

### 3.5 Verificar que presença aparece pro responsável

```
Se o aluno é menor:
- /parent → dashboard → "Sophia treinou hoje ✅"
- /parent/presenca → frequência da filha atualizada

Query do responsável:
1. Buscar filhos: guardian_links → student_profile_id
2. Buscar presença dos filhos: attendance → student_id in (filhos)
```

```bash
git add -A
git commit -m "feat: real flow 3 — professor attendance persists, students and parents see real frequency"
git push origin main
```

---

═══════════════════════════════════════════════════════════════
FLUXO BÔNUS — VERIFICAR LOGIN REAL DE TODOS OS PERFIS
═══════════════════════════════════════════════════════════════

```
Antes de terminar, verificar que CADA login funciona com Supabase Auth real:

O login DEVE usar:
  supabase.auth.signInWithPassword({ email, password })

NÃO deve usar mock de auth (verificar que o bloco mock NÃO está ativo quando USE_MOCK=false).

TESTAR que cada credencial funciona:
  gregoryguimaraes12@gmail.com / @Greg1994     → /superadmin
  roberto@guerreiros.com / BlackBelt@2026      → /admin
  andre@guerreiros.com / BlackBelt@2026        → /professor
  julia@guerreiros.com / BlackBelt@2026        → /recepcao
  joao@email.com / BlackBelt@2026              → /dashboard
  lucas.teen@email.com / BlackBelt@2026        → /teen
  helena.kids@email.com / BlackBelt@2026       → /kids
  patricia@email.com / BlackBelt@2026          → /parent

Para cada:
  1. signInWithPassword → retorna session?
  2. getUser → retorna user?
  3. Buscar profile → retorna role?
  4. Middleware redireciona pro dashboard correto?

SE algum login falha:
  - Verificar que o user existe no Supabase Auth (Dashboard → Authentication → Users)
  - Verificar que o email_confirm está true
  - Verificar que a senha está correta
  - SE user não existe: criar com auth.admin.createUser
```

---

═══════════════════════════════════════════════════════════════
TESTE FINAL — O FLUXO COMPLETO DO PRIMEIRO DIA
═══════════════════════════════════════════════════════════════

```
Simular mentalmente (verificar no código que cada passo funciona):

MANHÃ:
1. Admin (Roberto) abre /admin → vê dashboard com dados reais
2. Roberto vai em /admin/alunos → vê 21 alunos seedados
3. Roberto clica "Novo Aluno" → preenche "Maria Teste" → salva
4. Maria aparece na lista (SELECT retorna ela)
5. Roberto vai em /admin/turmas → "BJJ Iniciante" → Maria está lá

TARDE:
6. Recepcionista (Julia) abre /recepcao → vê dashboard
7. Maria chega na academia
8. Julia busca "Maria" no check-in → encontra
9. Julia clica "Registrar Entrada" → presença salva
10. Maria aparece em "Dentro agora"

NOITE:
11. Professor (André) abre /professor → vê aula de hoje
12. André abre "Modo Aula" → turma "BJJ Iniciante"
13. Maria está na lista → André marca como presente
14. André clica "Finalizar Aula" → presença salva
15. Maria abre /dashboard → vê "1 treino hoje" na frequência
16. Se Maria é menor: Patrícia vê "Maria treinou hoje" no /parent

CADA STEP acima DEVE funcionar com query Supabase real.
Se algum step retorna dados mock ou não persiste: CORRIGIR.
```

```bash
# Build final
pnpm typecheck && pnpm build

# Commit
git add -A
git commit -m "feat: 3 critical real flows — student registration, check-in, attendance — all persist to Supabase"
git push origin main
```

---

## REGRAS

1. NUNCA delete o bloco mock (if isMock). Ele continua existindo como fallback.
2. NUNCA use 'any'. Type tudo.
3. CADA INSERT/UPDATE no Supabase deve ter try/catch com fallback.
4. SE uma tabela não existe ou falta coluna: criar migração.
5. SE RLS bloqueia: criar policy adequada (nunca desabilitar RLS).
6. SE o join não funciona: buscar separado e cruzar em JS.
7. COMMIT após cada fluxo (3 commits mínimo).
8. Build DEVE passar entre commits.
9. FOCO: esses 3 fluxos. Não corrija outros services neste prompt.
10. O objetivo: Roberto cadastra, Julia faz check-in, André faz chamada → TUDO persiste no Supabase.

## COMECE AGORA. FLUXO 1.

# BLACKBELT v2 — CHECK-IN & PRÉ-CHECK-IN NUCLEAR
## 5 Agentes — Backend Real, Frontend, Integração, Dashboard, Deploy

> **OBJETIVO:** O sistema de check-in e pré-check-in deve funcionar de verdade no Supabase real.
> - **Pré-check-in:** Agendamento antecipado (responsável agenda presença do filho para a próxima aula)
> - **Check-in:** Presença efetiva na aula (feito na hora, pelo aluno, responsável, professor ou recepcionista)
>
> **QUEM FAZ O QUÊ:**
> - **Responsável:** Pré-check-in E check-in dos filhos (teen/kids)
> - **Aluno Adulto:** Check-in próprio
> - **Aluno Teen:** Check-in próprio
> - **Aluno Kids:** NÃO faz check-in sozinho (responsável ou professor faz)
> - **Professor:** Check-in dos alunos da sua turma (chamada)
> - **Admin/Owner:** Check-in de qualquer aluno + visualiza tudo
> - **Recepcionista:** Check-in de qualquer aluno na recepção
>
> **DASHBOARDS QUE MOSTRAM CHECK-IN:**
> - Admin: total check-ins hoje, presença por turma, alunos ativos
> - Professor: chamada da turma, presença dos seus alunos
> - Responsável: check-ins dos filhos, streak
> - Aluno: seus próprios check-ins, streak, conquistas

---

## AGENTE 1 — AUDITAR BACKEND (Supabase Real)

**Missão:** Verificar o que existe no Supabase real, quais tabelas, colunas, dados. Mapear o gap entre código e banco.

### 1.1 Verificar tabelas de check-in

```bash
set -a && source .env.local && set +a

echo "=== TABELAS DE CHECKIN ==="
# Verificar todas as variações possíveis
for TABLE in checkins attendance check_ins presenca; do
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${TABLE}?select=id&limit=1" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}")
  echo "  $TABLE: HTTP $HTTP"
done

# Schema das tabelas que existem
echo ""
echo "=== SCHEMA CHECKINS ==="
curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" | \
  python3 -c "
import sys, json
spec = json.load(sys.stdin)
for table in ['checkins', 'attendance', 'check_ins', 'pre_checkins']:
  if table in (spec.get('definitions', {}) if 'definitions' in spec else spec):
    print(f'\n=== {table} ===')
    try:
      defn = spec['definitions'][table]
      for col, info in defn.get('properties', {}).items():
        print(f'  {col}: {info.get(\"type\", info.get(\"format\", \"?\"))}')
    except: pass
" 2>/dev/null

# Dados existentes
echo ""
echo "=== DADOS EXISTENTES ==="
for TABLE in checkins attendance; do
  COUNT=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${TABLE}?select=id" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Prefer: count=exact" \
    -I 2>/dev/null | grep -i 'content-range' | grep -oE '[0-9]+$')
  echo "  $TABLE: ${COUNT:-0} registros"
done
```

### 1.2 Verificar tabelas relacionadas

```bash
echo "=== TABELAS RELACIONADAS ==="
for TABLE in guardian_links classes memberships profiles pre_checkins; do
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${TABLE}?select=id&limit=1" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}")
  echo "  $TABLE: HTTP $HTTP"
done

# Guardian links com dados
echo ""
echo "=== GUARDIAN LINKS ==="
curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/guardian_links?select=*&limit=5" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" | \
  python3 -c "import sys,json; data=json.load(sys.stdin); print(f'{len(data)} links'); [print(f'  guardian={r.get(\"guardian_id\",\"?\")[:12]} child={r.get(\"child_id\",\"?\")[:12]}') for r in data[:5]]" 2>/dev/null
```

### 1.3 Verificar services de check-in no código

```bash
echo "=== SERVICES DE CHECKIN ==="
find lib/api -name '*checkin*' -o -name '*attendance*' -o -name '*presenca*' | sort
grep -rn "checkin\|check_in\|attendance\|presenca" lib/api/ --include='*.ts' -l | sort

echo ""
echo "=== COMO O SERVICE FAZ QUERY ==="
for f in $(find lib/api -name '*checkin*' -o -name '*attendance*' -o -name '*presenca*' 2>/dev/null); do
  echo "--- $f ---"
  grep "\.from(" "$f" | head -5
done

echo ""
echo "=== PÁGINAS DE CHECKIN ==="
find app -path '*checkin*' -name 'page.tsx' | sort
find app -path '*presenca*' -name 'page.tsx' | sort
find app -path '*chamada*' -name 'page.tsx' | sort
```

### 1.4 Gerar relatório

Salvar em `docs/review/checkin-audit.md` com o estado atual:
- Quais tabelas existem no banco
- Quais colunas cada tabela tem
- Quantos registros
- Quais services fazem query
- Quais páginas existem por perfil
- O que falta

```bash
git add docs/review/checkin-audit.md
git commit -m "audit: check-in system — tabelas, services, páginas, gap report"
```

---

## AGENTE 2 — GARANTIR BACKEND (Migration + RLS + Service)

**Missão:** Criar/corrigir tabelas, RLS policies, e services para check-in funcionar de verdade.

### 2.1 Tabela de check-ins (se não existe ou falta colunas)

A tabela DEVE ter:

```sql
-- Se a tabela se chama "checkins":
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  class_name TEXT, -- denormalizado para display
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_in_by UUID REFERENCES profiles(id), -- quem fez (se diferente do aluno)
  checkin_type TEXT NOT NULL DEFAULT 'self' CHECK (checkin_type IN ('self', 'pre_checkin', 'guardian', 'professor', 'recepcao', 'qr', 'manual')),
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('scheduled', 'confirmed', 'cancelled')),
  -- scheduled = pré-check-in (agendado pelo responsável)
  -- confirmed = check-in efetivo (presença confirmada)
  -- cancelled = cancelado
  scheduled_date DATE, -- para pré-check-in: qual dia da aula
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_checkins_academy ON checkins(academy_id);
CREATE INDEX IF NOT EXISTS idx_checkins_profile ON checkins(profile_id);
CREATE INDEX IF NOT EXISTS idx_checkins_date ON checkins(checked_in_at);
CREATE INDEX IF NOT EXISTS idx_checkins_class ON checkins(class_id);
```

### 2.2 RLS Policies

```sql
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- Qualquer membro da academia pode VER check-ins da academia
CREATE POLICY IF NOT EXISTS "checkins_select_academy" ON checkins
  FOR SELECT USING (
    academy_id IN (
      SELECT academy_id FROM memberships WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      ) AND status = 'active'
    )
  );

-- Aluno pode criar check-in PRÓPRIO
CREATE POLICY IF NOT EXISTS "checkins_insert_self" ON checkins
  FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND checkin_type = 'self'
  );

-- Professor/Admin/Recepcao pode criar check-in para qualquer aluno da academia
CREATE POLICY IF NOT EXISTS "checkins_insert_staff" ON checkins
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships m
      JOIN profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid()
      AND m.academy_id = checkins.academy_id
      AND m.role IN ('admin', 'professor', 'recepcao')
      AND m.status = 'active'
    )
  );

-- Responsável pode criar check-in/pré-check-in dos filhos
CREATE POLICY IF NOT EXISTS "checkins_insert_guardian" ON checkins
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM guardian_links gl
      JOIN profiles p ON p.id = gl.guardian_id
      WHERE p.user_id = auth.uid()
      AND gl.child_id = checkins.profile_id
    )
    AND checkin_type IN ('guardian', 'pre_checkin')
  );
```

### 2.3 Service de Check-in

Criar/atualizar `lib/api/checkin.service.ts`:

```typescript
// Funções necessárias:

// getCheckins(academyId, filters) — listar check-ins com filtros (data, turma, aluno)
// getCheckinsByProfile(profileId, limit) — check-ins de um aluno específico
// getCheckinStats(academyId) — stats: total hoje, presença por turma, streak
// getTodayCheckins(academyId) — check-ins de hoje para o dashboard
// getChildCheckins(guardianId) — check-ins dos filhos do responsável
// doCheckin(data) — registrar check-in efetivo
// doPreCheckin(data) — agendar pré-check-in
// cancelPreCheckin(checkinId) — cancelar pré-check-in
// confirmPreCheckin(checkinId) — converter pré-check-in em check-in confirmado
// getUpcomingClasses(profileId) — turmas do aluno com horários futuros (para pré-check-in)
// getStreak(profileId) — calcular streak de presença
// hasCheckedInToday(profileId, classId) — verificar se já fez check-in hoje nesta turma

// TODAS com isMock() branching
// TODAS com handleServiceError() no catch
```

### 2.4 Aplicar migration

```bash
# Criar migration
# O número da migration deve ser o próximo disponível
ls supabase/migrations/*.sql | tail -5

# Aplicar via supabase db push
supabase db push --include-all 2>&1
```

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: checkin backend — migration, RLS, service com isMock branching"
```

---

## AGENTE 3 — FRONTEND: PÁGINAS DE CHECK-IN POR PERFIL

**Missão:** Criar/corrigir as páginas de check-in para cada perfil que precisa.

### 3.1 Responsável — Pré-Check-in + Check-in dos filhos

Página: `app/(parent)/parent/precheckin/page.tsx` (já existe do transplante)
Página: `app/(parent)/parent/checkin/page.tsx` (criar se não existe)

**Layout Pré-Check-in:**
```
┌──────────────────────────────────────────────────────┐
│  📋 Pré-Check-in                                      │
│  Agende a presença dos seus filhos nas próximas aulas │
│                                                       │
│  👦 Lucas (Teen)                                      │
│  ┌─────────────────────────────────────┐              │
│  │ Seg 19:00 — BJJ Teen   [✅ Agendar] │              │
│  │ Qua 19:00 — BJJ Teen   [✅ Agendar] │              │
│  │ Sex 19:00 — BJJ Teen   [✅ Agendar] │              │
│  └─────────────────────────────────────┘              │
│                                                       │
│  👧 Maria (Kids)                                      │
│  ┌─────────────────────────────────────┐              │
│  │ Sáb 09:00 — BJJ Kids   [✅ Agendar] │              │
│  │ Sáb 10:00 — Karatê     [✅ Agendar] │              │
│  └─────────────────────────────────────┘              │
│                                                       │
│  ── Agendados ──                                      │
│  ✅ Lucas — Seg 19:00 BJJ Teen (agendado)             │
│  [❌ Cancelar]                                        │
└──────────────────────────────────────────────────────┘
```

**Layout Check-in (presença na hora):**
```
┌──────────────────────────────────────────────────────┐
│  ✅ Check-in                                          │
│  Registre a presença agora                            │
│                                                       │
│  👦 Lucas — BJJ Teen (19:00) — 🟢 AULA EM ANDAMENTO  │
│  [✅ FAZER CHECK-IN]                                  │
│                                                       │
│  👧 Maria — Sem aula agora                            │
│  [⏳ Próxima: Sáb 09:00 BJJ Kids]                    │
│                                                       │
│  ── Hoje ──                                           │
│  ✅ Lucas check-in às 19:05 (por responsável)         │
└──────────────────────────────────────────────────────┘
```

### 3.2 Aluno Adulto — Check-in próprio

Página: `app/(main)/dashboard/checkin/page.tsx`

```
┌──────────────────────────────────────────────────────┐
│  ✅ Meu Check-in                                      │
│                                                       │
│  🟢 AULA EM ANDAMENTO                                │
│  BJJ Adulto Noite — 19:00-20:30                      │
│  Prof. André Nakamura                                 │
│                                                       │
│  [✅ FAZER CHECK-IN]  (botão grande verde)            │
│                                                       │
│  🔥 Streak: 12 dias consecutivos                     │
│                                                       │
│  ── Histórico ──                                      │
│  ✅ Hoje 19:03 — BJJ Adulto Noite                    │
│  ✅ Ontem 19:10 — BJJ Adulto Noite                   │
│  ✅ Anteontem 07:05 — BJJ Adulto Manhã               │
└──────────────────────────────────────────────────────┘
```

### 3.3 Professor — Chamada da turma

Página: `app/(professor)/professor/chamada/page.tsx` (deve já existir)

Verificar que funciona com dados reais:
- Lista alunos matriculados na turma
- Checkbox para marcar presença
- Botão "Salvar chamada" → insere checkins em batch
- `checkin_type = 'professor'`

### 3.4 Admin — Presença geral

Página: `app/(admin)/admin/presenca/page.tsx`

Verificar que mostra:
- Total check-ins hoje
- Lista de quem veio por turma
- Opção de check-in manual

### 3.5 Recepcionista — Check-in na recepção

Página: `app/(recepcao)/recepcao/checkin/page.tsx`

Verificar que funciona:
- Busca aluno por nome
- Faz check-in com `checkin_type = 'recepcao'`

### 3.6 Botões no sidebar/dashboard

Para CADA perfil, verificar que o link de Check-in está no sidebar E no dashboard:

```bash
for SHELL in AdminShell ProfessorShell RecepcaoShell MainShell TeenShell ParentShell; do
  FILE=$(find components/shell -name "${SHELL}.tsx" | head -1)
  echo "$SHELL: $(grep -c 'checkin\|check-in\|chamada\|presenca\|Presença\|Check-in' "$FILE" 2>/dev/null) referências"
done
```

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: check-in frontend — responsável pré-checkin/checkin, aluno, professor chamada, admin presença"
```

---

## AGENTE 4 — DASHBOARDS: MOSTRAR CHECK-INS

**Missão:** Garantir que os check-ins aparecem nos dashboards de quem precisa ver.

### 4.1 Dashboard Admin

No dashboard `/admin` (page.tsx):
- Card "Check-ins Hoje": número total
- Card "Presença": percentual de alunos ativos que vieram hoje
- Seção "Atividade Recente": últimos 10 check-ins com nome do aluno + horário

### 4.2 Dashboard Professor

No dashboard `/professor` (page.tsx):
- Card "Alunos Presentes Hoje": contagem
- Na lista de "Minhas Aulas Hoje": mostrar "18/25 alunos" com barra de progresso (já existe na screenshot)
- Esses dados DEVEM vir do Supabase real (não mock)

### 4.3 Dashboard Responsável

No dashboard `/parent` (page.tsx):
- Card por filho: "Lucas — ✅ presente hoje" ou "Maria — ❌ não veio hoje"
- Streak de cada filho
- Botão rápido de check-in no card

### 4.4 Dashboard Aluno

No dashboard `/dashboard` e `/teen`:
- Streak atual (🔥 12 dias)
- Badge de presença (se veio hoje: ✅ Presente)
- Mini calendário com dias presentes marcados em verde

### 4.5 Verificar que os dados vêm do Supabase real

```bash
echo "=== VERIFICAR QUERIES REAIS NOS DASHBOARDS ==="

# Admin dashboard
grep -n "checkin\|attendance\|presenca\|getCheckin\|getTodayCheckin" app/(admin)/admin/page.tsx | head -10

# Professor dashboard
grep -n "checkin\|attendance\|presenca\|getCheckin" app/(professor)/professor/page.tsx | head -10

# Parent dashboard
grep -n "checkin\|attendance\|presenca\|getChild" app/(parent)/parent/page.tsx | head -10

# Aluno dashboard
grep -n "checkin\|attendance\|presenca\|streak\|getMyCheckin" app/(main)/dashboard/page.tsx | head -10
```

Se algum dashboard usa dados mock hardcoded para check-ins → substituir por chamada ao service real.

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: check-ins nos dashboards — admin, professor, responsável, aluno com dados Supabase reais"
```

---

## AGENTE 5 — TESTES E2E + SEED + DEPLOY

### 5.1 Seed de check-ins (se não existem)

```bash
set -a && source .env.local && set +a

# Verificar se já tem check-ins
COUNT=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/checkins?select=id" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Prefer: count=exact" \
  -I 2>/dev/null | grep -i 'content-range' | grep -oE '[0-9]+$')

echo "Check-ins existentes: ${COUNT:-0}"

if [ "${COUNT:-0}" -lt 100 ]; then
  echo "Poucos check-ins — rodando seed..."
  pnpm tsx scripts/seed-complete.ts
fi
```

### 5.2 Testar fluxos

```bash
cat > scripts/test-checkin-flows.ts << 'SCRIPT'
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const anon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function test() {
  let pass = 0, fail = 0;
  function assert(name: string, ok: boolean, detail?: string) {
    ok ? (pass++, console.log(`  ✅ ${name}`)) : (fail++, console.log(`  ❌ ${name}: ${detail}`));
  }

  const ACADEMY_ID = '809f2763-0096-4cfa-8057-b5b029cbc62f';

  // 1. Check-ins existem
  console.log('\n=== FLUXO 1: Check-ins existem ===');
  const { count } = await admin.from('checkins').select('id', { count: 'exact', head: true }).eq('academy_id', ACADEMY_ID);
  assert('Check-ins existem', (count || 0) > 0, `count=${count}`);
  assert('Tem pelo menos 100', (count || 0) >= 100, `count=${count}`);

  // 2. Guardian links existem
  console.log('\n=== FLUXO 2: Guardian links ===');
  const { data: links } = await admin.from('guardian_links').select('*');
  assert('Guardian links existem', (links?.length || 0) > 0, `count=${links?.length}`);

  // 3. Turmas existem
  console.log('\n=== FLUXO 3: Turmas ===');
  const { data: classes } = await admin.from('classes').select('id, name').eq('academy_id', ACADEMY_ID);
  assert('Turmas existem', (classes?.length || 0) > 0, `count=${classes?.length}`);

  // 4. Inserir check-in como admin
  console.log('\n=== FLUXO 4: Inserir check-in ===');
  const { data: testProfile } = await admin.from('memberships')
    .select('profile_id').eq('academy_id', ACADEMY_ID).eq('role', 'aluno_adulto').limit(1).maybeSingle();

  if (testProfile) {
    const { error: insertErr } = await admin.from('checkins').insert({
      academy_id: ACADEMY_ID,
      profile_id: testProfile.profile_id,
      checkin_type: 'manual',
      checked_in_at: new Date().toISOString(),
      status: 'confirmed',
    });
    assert('Insert check-in', !insertErr, insertErr?.message);

    // Limpar o check-in de teste
    await admin.from('checkins').delete()
      .eq('profile_id', testProfile.profile_id)
      .eq('checkin_type', 'manual')
      .gte('checked_in_at', new Date(Date.now() - 60000).toISOString());
  }

  // 5. Pré-check-in
  console.log('\n=== FLUXO 5: Pré-check-in ===');
  if (testProfile) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { error: preErr } = await admin.from('checkins').insert({
      academy_id: ACADEMY_ID,
      profile_id: testProfile.profile_id,
      checkin_type: 'pre_checkin',
      status: 'scheduled',
      scheduled_date: tomorrow.toISOString().split('T')[0],
    });
    assert('Insert pré-check-in', !preErr, preErr?.message);

    // Limpar
    await admin.from('checkins').delete()
      .eq('profile_id', testProfile.profile_id)
      .eq('checkin_type', 'pre_checkin')
      .eq('status', 'scheduled');
  }

  // Resultado
  console.log(`\n═══════════════════════════════`);
  console.log(`✅ Passou: ${pass}`);
  console.log(`❌ Falhou: ${fail}`);
  console.log(`📊 Score: ${Math.round((pass / (pass + fail)) * 100)}%`);
}

test().catch(console.error);
SCRIPT

set -a && source .env.local && set +a
pnpm tsx scripts/test-checkin-flows.ts
```

### 5.3 Build e deploy

```bash
pnpm typecheck && pnpm build
git add -A
git commit -m "nuclear: check-in & pré-check-in funcional — backend real, frontend 6 perfis, dashboards, testes E2E

Agente 1: Audit completo — tabelas, services, páginas, gap
Agente 2: Backend — migration, RLS policies, service com isMock branching
Agente 3: Frontend — responsável (pré-checkin + checkin filhos), aluno, professor (chamada), admin, recepção
Agente 4: Dashboards — check-ins visíveis em admin, professor, responsável, aluno
Agente 5: Testes E2E contra Supabase real, seed se necessário

Zero erros TypeScript. Build limpo."

git push origin main
npx vercel --prod --force --yes
```

---

## COMANDO PARA O CLAUDE CODE

```
Leia o BLACKBELT_CHECKIN_NUCLEAR.md nesta pasta. Execute os 5 agentes NA ORDEM:

AGENTE 1: Auditar o Supabase REAL — quais tabelas de check-in existem, quais colunas, quantos dados, quais services fazem query, quais páginas existem. Relatório completo. Commit.

AGENTE 2: Backend — criar/atualizar migration com tabela checkins (com colunas para pré-check-in: status scheduled/confirmed, checked_in_by, checkin_type). RLS para aluno, staff, e guardian. Service checkin.service.ts completo com isMock branching. Aplicar migration via supabase db push. Commit.

AGENTE 3: Frontend — verificar/criar páginas de check-in para: responsável (pré-check-in + check-in filhos), aluno adulto, teen, professor (chamada), admin (presença), recepção. Botões nos sidebars e dashboards. Commit.

AGENTE 4: Dashboards — garantir que check-ins aparecem nos dashboards de admin, professor, responsável e aluno com dados REAIS do Supabase (não mock). Cards de presença, streak, atividade recente. Commit.

AGENTE 5: Seed se necessário, testes E2E contra banco real, build limpo, push, deploy.

REGRAS: Supabase real (não mock). RLS correto por role. isMock() branching em todo service. PT-BR. CSS vars --bb-*. Comece pelo AGENTE 1 agora.
```

# BLACKBELT v2 — AUDITORIA DE PRONTIDÃO PARA DEMO

## CONTEXTO

BlackBelt v2 — SaaS multi-tenant para gestão de academias de artes marciais.
Stack: Next.js 14 (App Router), TypeScript strict, Tailwind CSS, Supabase, Capacitor.
Repo: `blackbelt-v2` | Vercel: `blackbelts.com.br`
Supabase projeto: `tdplmmodmumryzdosmpv`

**Estado atual:**
- UI 100% (503/503 checkboxes)
- 115 services convertidos de mock → real
- 3 fluxos reais testados: student registration, check-in com RLS, professor attendance
- App carrega na Vercel e login funciona (confirmado manualmente)
- `NEXT_PUBLIC_USE_MOCK=false`

**Problema:** UI 100% ≠ production-ready. Muitos services podem ter gaps entre mock e real.
Duas academias reais querem testar. Precisamos garantir que os fluxos core funcionam end-to-end.

---

## REGRAS ABSOLUTAS

1. **NÃO delete blocos mock.** Toda função `isMock()` deve ser preservada.
2. **NÃO mude a estrutura de pastas.** Corrija arquivos existentes.
3. **NÃO crie services novos** — corrija os existentes.
4. **handleServiceError em CADA catch block.**
5. **pnpm typecheck && pnpm build** — ZERO erros a cada seção.
6. **Commit a cada seção completada** com mensagem descritiva.
7. **Avaliação honesta.** Se algo não funciona, diga. Sem otimismo falso.

---

## SEÇÃO 1 — DIAGNÓSTICO DO SUPABASE CLIENT (5 min)

### 1A. Verificar formato da anon key

```bash
# Ler a env var configurada
grep "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local 2>/dev/null || echo "Nenhum .env.local encontrado"
grep "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.example 2>/dev/null
```

Se a key começa com `sb_publishable_` (novo formato Supabase), verificar se o client tem defensive checks.
Se começa com `eyJ` (JWT legacy), tudo ok.

### 1B. Verificar Supabase client tem proteção contra .split() crash

```bash
cat lib/supabase/client.ts
cat lib/supabase/server.ts
```

**Se NÃO tiver try/catch ou validação do formato da key:**

Adicionar em `lib/supabase/client.ts`:
```typescript
function validateSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.warn('[Supabase] Missing URL or ANON_KEY — running in degraded mode');
    return false;
  }
  
  // Novo formato Supabase (sb_publishable_xxx) funciona com @supabase/ssr >= 0.5
  // JWT legacy (eyJxxx) funciona com todas as versões
  // Apenas logar qual formato está sendo usado
  if (key.startsWith('sb_')) {
    console.info('[Supabase] Using new API key format');
  } else if (key.startsWith('eyJ')) {
    console.info('[Supabase] Using legacy JWT key format');
  } else {
    console.warn('[Supabase] Unknown key format — may cause issues');
  }
  
  return true;
}
```

Chamar `validateSupabaseConfig()` antes de `createBrowserClient()`.

### 1C. Verificar versão do @supabase/ssr

```bash
grep "@supabase/ssr" package.json
grep "@supabase/supabase-js" package.json
```

Se `@supabase/ssr` < 0.5.0, o novo formato `sb_publishable_` pode não funcionar.
Neste caso, o fix é: ir no Supabase Dashboard → Settings → API Keys → seção "Legacy anon, service_role API keys" → copiar a anon key JWT (começa com `eyJ`).

**Imprimir no output:**
```
📋 RESULTADO DIAGNÓSTICO SUPABASE:
- Formato da key: [sb_publishable / eyJ / outro]
- @supabase/ssr versão: [x.x.x]
- @supabase/supabase-js versão: [x.x.x]
- Defensive checks: [SIM / NÃO — adicionado agora]
- Compatível: [SIM / NÃO — precisa legacy key]
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `chore: supabase client diagnostic and defensive checks`

---

## SEÇÃO 2 — VERIFICAR ENV VARS NA VERCEL (2 min)

### 2A. Listar env vars que o app precisa

```bash
grep -rn "process.env\." lib/ app/ middleware.ts --include="*.ts" --include="*.tsx" | \
  grep -oP 'process\.env\.\K[A-Z_]+' | sort -u
```

### 2B. Gerar checklist para Gregory atualizar na Vercel

Imprimir:
```
📋 ENV VARS OBRIGATÓRIAS NA VERCEL:

✅ NEXT_PUBLIC_SUPABASE_URL = https://tdplmmodmumryzdosmpv.supabase.co
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY = [a key correta — JWT ou sb_publishable]
✅ NEXT_PUBLIC_USE_MOCK = false

⚠️ VERIFICAR SE EXISTEM NA VERCEL:
[listar todas as env vars encontradas no grep acima que NÃO são NEXT_PUBLIC_USE_MOCK, SUPABASE_URL, ou ANON_KEY]

❌ NUNCA COLOCAR NA VERCEL (segredo):
SUPABASE_SERVICE_ROLE_KEY (só local e server-side API routes)
```

---

## SEÇÃO 3 — AUDITORIA DE SERVICES: MOCK vs REAL (20 min)

Esta é a seção mais importante. Precisamos saber EXATAMENTE quais services funcionam de verdade.

### 3A. Listar TODOS os services

```bash
find lib/api -name "*.ts" -o -name "*.service.ts" | sort
```

### 3B. Para CADA service, verificar se o ramo real (`!isMock()`) tem queries Supabase funcionais

```bash
# Encontrar services que ainda têm "Not implemented", "TODO", "throw new Error" no ramo real
grep -rn "Not implemented\|TODO\|FIXME\|throw new Error('Not\|// real implementation" lib/api/ --include="*.ts" | \
  grep -v "node_modules\|mock\|isMock()" | head -30
```

### 3C. Categorizar cada service em 3 grupos

Criar um arquivo `AUDIT_SERVICES.md` na raiz com esta tabela:

```markdown
# Auditoria de Services — BlackBelt v2

## 🟢 FUNCIONANDO (query Supabase real, testado)
| Service | Arquivo | Observação |
|---------|---------|------------|
| student.service | lib/api/student.service.ts | Registration + list testados |
| checkin.service | lib/api/checkin.service.ts | Check-in com RLS migration 041 |
| attendance.service | lib/api/attendance.service.ts | Professor attendance com upsert |

## 🟡 PARCIAL (tem query Supabase mas não testado end-to-end)
| Service | Arquivo | O que falta |
|---------|---------|-------------|
| ... | ... | ... |

## 🔴 MOCK ONLY (ramo real vazio, throw, ou TODO)
| Service | Arquivo | Prioridade para demo |
|---------|---------|---------------------|
| ... | ... | ALTA / MÉDIA / BAIXA |
```

**Regra de classificação:**
- 🟢 = tem `supabase.from('tabela').select/insert/update/delete` NO ramo `!isMock()` E a tabela existe na migration
- 🟡 = tem query Supabase mas não sabemos se a tabela/coluna existe
- 🔴 = ramo real é `throw new Error`, `return []`, `TODO`, ou não existe

### 3D. Contar e reportar

```
📊 RESULTADO DA AUDITORIA:
- Total services: [N]
- 🟢 Funcionando: [N] ([%])
- 🟡 Parcial: [N] ([%])
- 🔴 Mock only: [N] ([%])

SERVIÇOS CRÍTICOS PARA DEMO:
1. Login/Auth — [🟢/🟡/🔴]
2. Cadastro de aluno — [🟢/🟡/🔴]
3. Check-in — [🟢/🟡/🔴]
4. Turmas/aulas — [🟢/🟡/🔴]
5. Cobranças/mensalidades — [🟢/🟡/🔴]
6. Dashboard admin — [🟢/🟡/🔴]
7. Perfil do aluno — [🟢/🟡/🔴]
8. Graduações/faixas — [🟢/🟡/🔴]
9. Comunicação (avisos) — [🟢/🟡/🔴]
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `docs: service audit — mock vs real classification`

---

## SEÇÃO 4 — VERIFICAR MIGRATIONS E SCHEMA (10 min)

### 4A. Listar todas as migrations

```bash
ls -la supabase/migrations/ | sort
```

### 4B. Verificar que as tabelas referenciadas nos services 🟢 e 🟡 existem nas migrations

```bash
# Extrair nomes de tabelas dos services
grep -rn "\.from('" lib/api/ --include="*.ts" | grep -oP "\.from\('\K[^']+" | sort -u > /tmp/tables_used.txt

# Extrair nomes de tabelas das migrations
grep -rn "CREATE TABLE" supabase/migrations/ | grep -oP "CREATE TABLE\s+(IF NOT EXISTS\s+)?\K\w+" | sort -u > /tmp/tables_created.txt

# Comparar
echo "=== TABELAS USADAS NOS SERVICES MAS NÃO CRIADAS NAS MIGRATIONS ==="
comm -23 /tmp/tables_used.txt /tmp/tables_created.txt

echo "=== TABELAS CRIADAS MAS NÃO USADAS ==="
comm -13 /tmp/tables_used.txt /tmp/tables_created.txt
```

### 4C. Verificar RLS

```bash
grep -rn "ALTER TABLE.*ENABLE ROW LEVEL SECURITY\|CREATE POLICY" supabase/migrations/ | wc -l
echo "---"
grep -rn "ALTER TABLE.*ENABLE ROW LEVEL SECURITY" supabase/migrations/ | grep -oP "ALTER TABLE\s+\K\w+" | sort -u
```

**Imprimir:**
```
📋 SCHEMA STATUS:
- Total migrations: [N]
- Tabelas nos services sem migration: [lista]
- Tabelas com RLS: [N] de [total]
- Tabelas SEM RLS: [lista] ⚠️
```

---

## SEÇÃO 5 — TESTAR OS 9 LOGINS (15 min)

### 5A. Verificar seed de usuários

```bash
# Encontrar o seed ou script que cria os mock users
find . -name "seed*" -o -name "setup*" | grep -v node_modules | sort
grep -rn "guerreiros\|BlackBelt@2026\|@Greg1994" lib/ scripts/ supabase/ --include="*.ts" --include="*.sql" | head -20
```

### 5B. Listar as credenciais esperadas

Verificar que estes 9+1 users existem no Supabase Auth:

```
1. Super Admin: gregoryguimaraes12@gmail.com / @Greg1994
   OU: gregoryguimaraes12@gmail.com / @Greg1994
2. Admin: admin@guerreiros.com / BlackBelt@2026
3. Professor: professor@guerreiros.com / BlackBelt@2026
4. Recepcionista: recepcionista@guerreiros.com / BlackBelt@2026
5. Aluno Adulto: adulto@guerreiros.com / BlackBelt@2026
   OU: aluno@email.com / BlackBelt@2026
6. Aluno Teen: teen@guerreiros.com / BlackBelt@2026
7. Aluno Kids: kids@guerreiros.com / BlackBelt@2026
8. Responsável: responsavel@guerreiros.com / BlackBelt@2026
   OU: pai@email.com / BlackBelt@2026
9. Franqueador: franqueador@guerreiros.com / BlackBelt@2026
```

### 5C. Verificar AuthContext e login flow

```bash
cat lib/contexts/AuthContext.tsx | head -100
cat app/\(auth\)/login/page.tsx | head -50
```

Verificar:
- Login chama `supabase.auth.signInWithPassword()` quando `!isMock()`
- Após login, busca profile com role
- Redireciona para o shell correto baseado no role

### 5D. Verificar middleware

```bash
cat middleware.ts
```

Confirmar:
- Middleware verifica sessão Supabase
- Redireciona não-autenticados para /login
- Permite acesso público às rotas `/`, `/login`, `/registro`, `/precos`, `/compete/*`
- Role-based routing funciona (admin → /admin, professor → /professor, etc.)

**Imprimir:**
```
📋 STATUS DOS LOGINS:
- Auth method: [Supabase Auth / mock / outro]
- Users no seed: [N]
- Middleware: [OK / problemas]
- Redirecionamento por role: [OK / problemas]

CREDENCIAIS PARA TESTE MANUAL:
[listar as 9 credenciais com email/senha e rota esperada]
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `docs: login audit and credential verification`

---

## SEÇÃO 6 — CORRIGIR OS 7 SERVICES CRÍTICOS PARA DEMO (30 min)

Para cada service abaixo, se estiver 🔴 ou 🟡, implementar o ramo real com query Supabase.
Se a tabela não existir na migration, criar uma nova migration.

### PRIORIDADE 1 — Login funcionar com todos os perfis

Se o login real não funciona com os 9 perfis:

1. Verificar que os users existem no Supabase Auth
2. Se não existem, criar script `scripts/seed-auth-users.ts` que usa `supabase.auth.admin.createUser()` para cada um
3. Verificar que a tabela `profiles` tem uma row para cada user com o `role` correto
4. Se não tem, criar seed que popula profiles

```typescript
// scripts/seed-auth-users.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const USERS = [
  { email: 'gregoryguimaraes12@gmail.com', password: '@Greg1994', role: 'super_admin', name: 'Gregory Pinto' },
  { email: 'admin@guerreiros.com', password: 'BlackBelt@2026', role: 'admin', name: 'Roberto Silva' },
  { email: 'professor@guerreiros.com', password: 'BlackBelt@2026', role: 'professor', name: 'Carlos Sensei' },
  { email: 'recepcionista@guerreiros.com', password: 'BlackBelt@2026', role: 'recepcionista', name: 'Maria Santos' },
  { email: 'adulto@guerreiros.com', password: 'BlackBelt@2026', role: 'aluno_adulto', name: 'João Aluno' },
  { email: 'teen@guerreiros.com', password: 'BlackBelt@2026', role: 'aluno_teen', name: 'Lucas Teen' },
  { email: 'kids@guerreiros.com', password: 'BlackBelt@2026', role: 'aluno_kids', name: 'Ana Kids' },
  { email: 'responsavel@guerreiros.com', password: 'BlackBelt@2026', role: 'responsavel', name: 'Pedro Pai' },
  { email: 'franqueador@guerreiros.com', password: 'BlackBelt@2026', role: 'franqueador', name: 'Fernando Franquia' },
];

async function seed() {
  for (const user of USERS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { display_name: user.name, role: user.role },
    });
    
    if (error) {
      if (error.message.includes('already been registered')) {
        console.log(`⏭️  ${user.email} já existe`);
      } else {
        console.error(`❌ ${user.email}: ${error.message}`);
      }
    } else {
      console.log(`✅ ${user.email} criado (${data.user.id})`);
      
      // Inserir profile
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        email: user.email,
        display_name: user.name,
        role: user.role,
        academy_id: 'guerreiros-001', // ID da academia demo
      });
      
      if (profileError) {
        console.error(`  ⚠️ Profile: ${profileError.message}`);
      }
    }
  }
}

seed().then(() => console.log('Done'));
```

**IMPORTANTE:** Este script requer `SUPABASE_SERVICE_ROLE_KEY` no `.env.local`. Imprimir instruções claras:
```
🔑 PARA RODAR O SEED:
1. Pegue a service_role key no Supabase Dashboard → Settings → API Keys (seção legacy ou secret)
2. Adicione ao .env.local: SUPABASE_SERVICE_ROLE_KEY=sua_key_aqui
3. Rode: npx tsx scripts/seed-auth-users.ts
```

### PRIORIDADE 2 — Dashboard Admin mostra dados reais

Verificar `lib/api/dashboard.service.ts` (ou equivalente):
- Deve retornar contagem real de alunos, turmas, presenças do mês
- Query: `supabase.from('profiles').select('id', { count: 'exact' }).eq('academy_id', academyId).eq('role', 'aluno_adulto')`

### PRIORIDADE 3 — Cadastro de aluno funciona end-to-end

Verificar `lib/api/student.service.ts`:
- `createStudent()` no ramo real deve:
  1. Criar user no Supabase Auth (via API route server-side, NÃO no client)
  2. Criar profile com role + academy_id
  3. Retornar o student criado

### PRIORIDADE 4 — Check-in funciona

Verificar `lib/api/checkin.service.ts`:
- `registerCheckIn()` deve inserir na tabela `check_ins`
- `getCheckInHistory()` deve retornar histórico do aluno
- RLS: aluno só vê seus próprios check-ins

### PRIORIDADE 5 — Turmas/Aulas mostra dados

Verificar `lib/api/class.service.ts` ou `schedule.service.ts`:
- Listar turmas da academia
- Listar alunos por turma
- Horários semanais

### PRIORIDADE 6 — Cobranças mostra algo útil

Verificar `lib/api/billing.service.ts` ou `payment.service.ts`:
- Listar faturas/mensalidades
- Status: pago, pendente, atrasado
- Se integração com gateway (Asaas/Stripe) não está pronta, pelo menos mostrar dados mockados de forma realista

### PRIORIDADE 7 — Perfil do aluno mostra dados

Verificar `lib/api/profile.service.ts`:
- Retorna dados do perfil logado
- Graduação/faixa atual
- Histórico de presenças resumido

**Para cada service corrigido:**
```bash
pnpm typecheck && pnpm build
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: demo-ready — critical services connected to real Supabase`

---

## SEÇÃO 7 — SEED DE DADOS REALISTAS PARA DEMO (15 min)

Se a academia "Guerreiros do Tatame" não tem dados suficientes, criar/expandir seed.

### 7A. Verificar dados existentes

```bash
# Verificar se tem um seed script
find . -name "seed*" -path "*/scripts/*" -o -name "seed*" -path "*/supabase/*" | grep -v node_modules
```

### 7B. Dados mínimos para demo

A academia demo deve ter:
- 1 academia: "Guerreiros do Tatame" (CNPJ, endereço, logo)
- 3 turmas: Jiu-Jitsu Adulto (seg/qua/sex 19h), Judô Kids (ter/qui 17h), Karatê Teen (sáb 10h)
- 15-20 alunos distribuídos nas turmas
- 2 professores (Carlos Sensei, Ana Professora)
- 50+ check-ins nos últimos 30 dias
- 20+ faturas (algumas pagas, algumas pendentes)
- 5+ graduações/promoções de faixa recentes
- 1 franqueador com 3 academias na rede

### 7C. Se o seed não existe ou está incompleto

Criar `scripts/seed-demo-data.ts` com dados realistas:
- Nomes brasileiros reais
- CPFs válidos (gerados)
- Datas de nascimento realistas
- Planos/mensalidades em R$

**NÃO usar dados genéricos tipo "John Doe", "Test User".**
Usar: "Maria Clara de Oliveira", "Pedro Henrique Santos", "Ana Beatriz Lima".

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: realistic demo seed — Guerreiros do Tatame with 20+ students`

---

## SEÇÃO 8 — VERIFICAÇÃO FINAL (10 min)

### 8A. Build limpo

```bash
pnpm typecheck 2>&1 | tail -10
pnpm build 2>&1 | tail -20
```

ZERO erros. Se tiver warning, ok. Se tiver error, CORRIGIR.

### 8B. Verificar que nenhuma página dá tela branca

```bash
pnpm build 2>&1 | grep -i "error\|failed\|crash" | head -10
```

### 8C. Verificar console.error patterns

```bash
# Patterns que indicam problema
grep -rn "console.error\|console.warn" lib/api/ --include="*.ts" | head -20
```

### 8D. Verificar que handleServiceError está em todos os catch blocks

```bash
grep -rn "catch" lib/api/ --include="*.ts" | grep -v "handleServiceError\|// \|mock\|test" | head -10
```

Cada resultado sem `handleServiceError` → ADICIONAR.

### 8E. Relatório final

Imprimir:

```
═══════════════════════════════════════════════════════
📊 RELATÓRIO FINAL — BLACKBELT v2 DEMO READINESS
═══════════════════════════════════════════════════════

BUILD: [PASS ✅ / FAIL ❌]
TYPECHECK: [PASS ✅ / FAIL ❌]

SUPABASE:
- Client: [OK / precisa legacy key]
- Key format: [JWT / sb_publishable]
- Versão @supabase/ssr: [x.x.x]

LOGINS (9 perfis):
1. Super Admin — [✅/❌] → rota: /superadmin
2. Admin — [✅/❌] → rota: /admin
3. Professor — [✅/❌] → rota: /professor
4. Recepcionista — [✅/❌] → rota: /recepcao
5. Aluno Adulto — [✅/❌] → rota: /aluno
6. Aluno Teen — [✅/❌] → rota: /teen
7. Aluno Kids — [✅/❌] → rota: /kids
8. Responsável — [✅/❌] → rota: /responsavel
9. Franqueador — [✅/❌] → rota: /franqueador

SERVICES CRÍTICOS:
1. Dashboard — [🟢/🟡/🔴]
2. Cadastro aluno — [🟢/🟡/🔴]
3. Check-in — [🟢/🟡/🔴]
4. Turmas — [🟢/🟡/🔴]
5. Cobranças — [🟢/🟡/🔴]
6. Perfil — [🟢/🟡/🔴]
7. Graduações — [🟢/🟡/🔴]

DADOS DEMO:
- Academia: [existe/não existe]
- Alunos: [N]
- Turmas: [N]
- Check-ins: [N]
- Faturas: [N]

NOTA GERAL: [X/10]
[Avaliação honesta do quão pronto está para uma demo real]

PRÓXIMOS PASSOS PRIORITÁRIOS:
1. [...]
2. [...]
3. [...]

═══════════════════════════════════════════════════════
```

**`pnpm typecheck && pnpm build` — ZERO erros.**

```bash
git add -A
git commit -m "audit: demo readiness assessment — services, schema, auth, seed"
git push origin main --force
```

---

## COMANDO DE RETOMADA

Se o Claude Code parar no meio:

```
Continue de onde parou. Verifique o estado com: find lib/api -name "*.ts" | wc -l && cat AUDIT_SERVICES.md 2>/dev/null | head -5 && pnpm typecheck 2>&1 | tail -5. Corrija erros pendentes e continue a partir da próxima seção incompleta. pnpm typecheck && pnpm build ZERO erros. Commit e push. Comece agora.
```

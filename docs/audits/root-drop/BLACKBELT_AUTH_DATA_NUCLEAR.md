# BLACKBELT v2 — FIX NUCLEAR: AUTH (LOGOUT/LOGIN) + DADOS VAZIOS EM TODAS AS PÁGINAS
## 5 Agentes Especializados — Os Dois Problemas Mais Críticos do App

> **BUG 1:** O botão "Sair" não funciona corretamente — ao sair, o botão "Entrar"
> na tela de login não responde. Só funciona fechando o browser e abrindo novamente.
> Isso indica que o logout não limpa a sessão/cookies corretamente.
>
> **BUG 2:** A maioria das páginas mostra skeleton loading infinito ou cards vazios
> (como na screenshot: /superadmin/receita com cards escuros sem dados).
> Os services estão fazendo queries ao Supabase que retornam vazio ou erro,
> e o loading state nunca é desligado.
>
> **ESTES SÃO OS BUGS MAIS CRÍTICOS DO APP.** Sem login/logout funcional e sem dados
> nas telas, o app é inutilizável. Prioridade máxima.

---

## CONTEXTO

- **Repo:** `GregoryGSPinto/blackbelt-v2`
- **Deploy:** `blackbelts.com.br`
- **Supabase project:** `tdplmmodmumryzdosmpv`
- **Stack:** Next.js 14 App Router, TypeScript, Supabase, Tailwind
- **CSS vars:** `var(--bb-depth-*)`, `var(--bb-ink-*)`, `var(--bb-brand)`
- **Login Super Admin:** `greg@email.com` / `BlackBelt@Greg1994`
- **Login Admin:** `admin@guerreiros.com` / `BlackBelt@2026`
- **Supabase anon key:** DEVE ser formato JWT (`eyJ...`), NÃO `sb_publishable_*`

### HISTÓRICO DOS BUGS:
- O `auth.service.ts` já foi corrigido antes para não engolir erros silenciosamente
- O `isMock()` já foi corrigido — `NEXT_PUBLIC_USE_MOCK=false` está na Vercel
- As migrations estão no código mas MUITAS ainda não foram executadas no Supabase real
- O padrão `safeSupabaseQuery` retorna fallback vazio quando tabela não existe
- Skeleton loading infinito = service retorna vazio sem setar loading=false

---

## PRÉ-EXECUÇÃO: DIAGNÓSTICO COMPLETO

```bash
echo "════════════════════════════════════════"
echo "DIAGNÓSTICO NUCLEAR — $(date)"
echo "════════════════════════════════════════"

set -a && source .env.local 2>/dev/null && set +a

# ── 1. VERIFICAR ENV VARS ──
echo ""
echo "=== 1. VARIÁVEIS DE AMBIENTE ==="
echo "SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL:0:40}..."
echo "ANON_KEY formato: $(echo $NEXT_PUBLIC_SUPABASE_ANON_KEY | cut -c1-10)..."
echo "SERVICE_ROLE: ${SUPABASE_SERVICE_ROLE_KEY:0:15}..."
echo "USE_MOCK: ${NEXT_PUBLIC_USE_MOCK:-NÃO DEFINIDA}"

# Verificar formato da anon key
if echo "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | grep -q "^sb_"; then
  echo "⚠️  ANON KEY no formato sb_publishable — TROCAR para JWT (eyJ...)"
  echo "   Vá em Supabase Dashboard → Settings → API → copie anon key JWT"
fi

if echo "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | grep -q "^eyJ"; then
  echo "✅ ANON KEY em formato JWT"
fi

# ── 2. AUTH: COMO FUNCIONA O LOGOUT ──
echo ""
echo "=== 2. SISTEMA DE AUTH ==="

# Encontrar logout
echo "--- Logout ---"
grep -rn 'signOut\|sign_out\|logout\|logOut\|handleLogout\|handleSignOut' lib/ app/ components/ --include='*.ts' --include='*.tsx' | grep -v node_modules | grep -v .next | head -20

# Encontrar login
echo ""
echo "--- Login ---"
grep -rn 'signIn\|sign_in\|handleLogin\|handleSubmit.*login\|Entrando' app/(auth)/ components/auth/ lib/auth/ lib/api/auth* --include='*.ts' --include='*.tsx' 2>/dev/null | head -20

# AuthContext
echo ""
echo "--- AuthContext ---"
find lib -name '*Auth*' -o -name '*auth*context*' | head -5
cat $(find lib -name 'AuthContext.tsx' -o -name 'auth-context.tsx' | head -1) 2>/dev/null | head -80

# Middleware
echo ""
echo "--- Middleware (auth redirect) ---"
head -60 middleware.ts

# Cookies/session
echo ""
echo "--- Supabase client (cookies) ---"
grep -rn 'createBrowserClient\|createServerClient\|cookies\|getSession\|getUser' lib/supabase/ --include='*.ts' | head -15

# ── 3. SERVICES: PADRÃO DE QUERY ──
echo ""
echo "=== 3. PADRÃO DE QUERY DOS SERVICES ==="

# Como isMock funciona
echo "--- isMock ---"
grep -A 5 'function isMock\|const isMock\|export.*isMock' lib/ --include='*.ts' -r | head -10

# Quantos services existem
echo ""
echo "--- Services count ---"
find lib/api -name '*.service.ts' -o -name '*.ts' | wc -l
echo "services"

# Padrão de loading nos services
echo ""
echo "--- Padrão loading (catch blocks) ---"
grep -c 'catch.*{' lib/api/*.ts 2>/dev/null | awk -F: '{sum+=$2} END {print sum " catch blocks em " NR " services"}'

# Services com catch vazio ou que engole erro
echo ""
echo "--- Catch blocks que engolem erros ---"
grep -B1 -A3 'catch.*{' lib/api/*.ts 2>/dev/null | grep -A2 'return \[\]\|return null\|return {}\|return undefined' | head -30

# ── 4. TABELAS QUE EXISTEM NO SUPABASE ──
echo ""
echo "=== 4. TABELAS NO SUPABASE ==="

# Testar conexão e listar tabelas
if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "Testando conexão..."
  TABLES=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" 2>/dev/null)
  
  if echo "$TABLES" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d))" 2>/dev/null; then
    echo "tabelas encontradas no Supabase"
    echo "$TABLES" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(k) for k in sorted(d.keys())[:30]]" 2>/dev/null
    echo "... (primeiras 30)"
  else
    echo "⚠️  Erro ao listar tabelas — verificar credenciais"
    echo "$TABLES" | head -5
  fi
else
  echo "❌ SUPABASE_SERVICE_ROLE_KEY não encontrada em .env.local"
fi

# ── 5. TESTAR LOGIN REAL ──
echo ""
echo "=== 5. TESTE DE LOGIN ==="
if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  LOGIN_RESULT=$(curl -s -X POST "${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@guerreiros.com","password":"BlackBelt@2026"}')
  
  if echo "$LOGIN_RESULT" | grep -q "access_token"; then
    echo "✅ Login admin funciona via API"
    ACCESS_TOKEN=$(echo "$LOGIN_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token','')[:20])" 2>/dev/null)
    echo "   Token: ${ACCESS_TOKEN}..."
  else
    echo "❌ Login admin FALHOU"
    echo "$LOGIN_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error_description', d.get('error', d.get('msg','Erro desconhecido'))))" 2>/dev/null
  fi
fi
```

Salvar output em `docs/review/auth-data-diagnostic.md` e commitar:
```bash
git add docs/review/auth-data-diagnostic.md
git commit -m "diagnostic: auth + data loading nuclear audit"
```

---

## AGENTE 1 — FIX DO LOGOUT

**Missão:** Garantir que ao clicar "Sair", a sessão é completamente limpa e o login funciona novamente sem precisar fechar o browser.

### 1.1 Encontrar e analisar o fluxo de logout

```bash
# Todos os arquivos com lógica de logout
grep -rn 'signOut\|handleLogout\|handleSignOut\|Sair' components/ lib/ app/ --include='*.tsx' --include='*.ts' -l | grep -v node_modules | sort
```

### 1.2 O logout CORRETO para Supabase + Next.js App Router

O logout no Supabase com SSR (cookies) precisa de 3 etapas:

**Etapa 1 — Supabase signOut:**
```typescript
const supabase = createBrowserClient();
await supabase.auth.signOut();
```

**Etapa 2 — Limpar cookies manualmente (CRÍTICO):**
O `signOut()` do Supabase client-side nem sempre limpa todos os cookies SSR. Precisa limpar manualmente:
```typescript
// Limpar cookies de sessão do Supabase
document.cookie.split(';').forEach(cookie => {
  const name = cookie.split('=')[0].trim();
  if (name.startsWith('sb-') || name.includes('supabase') || name.includes('auth-token')) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
  }
});
```

**Etapa 3 — Limpar state do AuthContext + localStorage:**
```typescript
// Limpar AuthContext
setState({ user: null, profile: null, loading: false, error: null });

// Limpar localStorage
localStorage.removeItem('bb_active_profile_id');
localStorage.removeItem('sb-tdplmmodmumryzdosmpv-auth-token');
// Limpar qualquer outro item sb-*
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth')) {
    localStorage.removeItem(key);
  }
});

// Limpar sessionStorage
sessionStorage.clear();
```

**Etapa 4 — Redirect hard (não soft):**
```typescript
// CRÍTICO: Usar window.location ao invés de router.push
// router.push mantém o state do React na memória
window.location.href = '/login';
```

### 1.3 Implementar logout correto

Criar/atualizar `lib/auth/logout.ts`:
```typescript
import { createBrowserClient } from '@/lib/supabase/client';

export async function performLogout(): Promise<void> {
  try {
    // 1. Supabase signOut
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error('Erro no signOut do Supabase:', err);
    // Continuar mesmo com erro — limpar tudo manualmente
  }

  // 2. Limpar cookies
  document.cookie.split(';').forEach(cookie => {
    const name = cookie.split('=')[0].trim();
    if (name.startsWith('sb-') || name.includes('supabase') || name.includes('auth')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
    }
  });

  // 3. Limpar storage
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth') || key.startsWith('bb_')) {
      localStorage.removeItem(key);
    }
  });
  sessionStorage.clear();

  // 4. Hard redirect (limpa React state)
  window.location.href = '/login';
}
```

### 1.4 Conectar em TODOS os botões "Sair"

```bash
# Encontrar todos os botões de sair
grep -rn "Sair\|sair\|logout\|logOut\|sign-out\|signout" components/shell/ components/layout/ --include='*.tsx' | head -20
```

Para CADA botão "Sair" encontrado:
```typescript
import { performLogout } from '@/lib/auth/logout';

// No onClick:
onClick={async () => {
  await performLogout();
  // Não precisa de router.push — performLogout já faz hard redirect
}}
```

### 1.5 Fix do login após logout

O problema do "Entrar" não funcionando após sair é porque o AuthContext ainda tem state velho na memória. O hard redirect (`window.location.href`) resolve isso porque força um full page reload.

Mas também verificar a página de login:

```bash
cat app/(auth)/login/page.tsx | head -100
```

- O `handleSubmit` deve limpar qualquer erro anterior antes de tentar logar
- O `isLoading` deve ser `false` no mount (já corrigido no Agente 1 do transplante)
- Se existe `useEffect` que checa sessão existente no mount, deve resetar loading se não há sessão:

```typescript
useEffect(() => {
  // Se chegou na página de login, não deve haver sessão ativa
  // Se houver, o middleware deveria ter redirecionado
  // Resetar qualquer state residual
  setIsLoading(false);
  setError('');
}, []);
```

### 1.6 Verificar middleware

O middleware DEVE permitir acesso a `/login` sem sessão:

```bash
grep -A 10 'login\|PUBLIC\|public.*route\|matcher' middleware.ts | head -30
```

Se o middleware redireciona `/login` para algum lugar quando não há sessão → BUG. A página de login é SEMPRE pública.

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "fix: logout nuclear — limpa cookies, storage, state, hard redirect. Login funciona após sair."
```

---

## AGENTE 2 — FIX DO AUTHCONTEXT (Sessão + Profile + Role)

**Missão:** Garantir que após login, o AuthContext carrega corretamente user + profile + role + academyId, e que essas informações chegam em todas as páginas.

### 2.1 Analisar AuthContext atual

```bash
cat $(find lib -name 'AuthContext.tsx' -o -name 'auth-context.tsx' -o -name 'AuthProvider.tsx' | head -1)
```

### 2.2 O AuthContext DEVE:

1. No mount, verificar sessão existente via `supabase.auth.getSession()`
2. Se há sessão → buscar profile do user → setar state → redirect se necessário
3. Se não há sessão → setar `loading: false` (para a UI renderizar login)
4. Listener `onAuthStateChange`:
   - `SIGNED_IN` → buscar profile → setar state → redirect
   - `SIGNED_OUT` → limpar state → redirect para /login
   - `TOKEN_REFRESHED` → atualizar token silenciosamente
5. Expor: `user`, `profile`, `role`, `academyId`, `profileId`, `loading`, `error`
6. Loading DEVE ser `false` em no máximo 5 segundos (timeout safety)

### 2.3 Corrigir problemas comuns

```typescript
// TIMEOUT SAFETY — nunca ficar em loading infinito
useEffect(() => {
  const timeout = setTimeout(() => {
    if (state.loading) {
      console.warn('AuthContext: timeout de 5s — forçando loading=false');
      setState(prev => ({ ...prev, loading: false }));
    }
  }, 5000);
  return () => clearTimeout(timeout);
}, [state.loading]);
```

```typescript
// BUSCAR PROFILE — tolerante a falha
async function loadProfile(userId: string) {
  try {
    const supabase = createBrowserClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(); // maybeSingle ao invés de single — não crasheia se não encontrar

    if (error) {
      console.error('Erro ao buscar profile:', error.message);
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      return;
    }

    if (!profile) {
      console.warn('Profile não encontrado para user_id:', userId);
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    setState({
      user: { id: userId, email: profile.email },
      profile,
      role: profile.role,
      academyId: profile.academy_id,
      profileId: profile.id,
      loading: false,
      error: null,
    });
  } catch (err: any) {
    console.error('Erro inesperado ao buscar profile:', err);
    setState(prev => ({ ...prev, loading: false, error: err.message }));
  }
}
```

### 2.4 Verificar que o AuthContext wrapa toda a app

```bash
grep -rn 'AuthProvider\|AuthContext.Provider' app/layout.tsx app/providers.tsx | head -5
```

Se o AuthProvider não está no layout root, adicioná-lo.

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "fix: AuthContext — session, profile, timeout safety, maybeSingle, expor academyId"
```

---

## AGENTE 3 — FIX DOS SERVICES (Skeleton Infinito → Empty State)

**Missão:** Garantir que NENHUM service deixa a UI em loading infinito. Se a query falha ou retorna vazio, a página mostra empty state, não skeleton eterno.

### 3.1 Padrão do problema

O padrão atual em muitos services é:
```typescript
// RUIM — se der erro, retorna [] silenciosamente e a página fica em skeleton
try {
  const { data } = await supabase.from('tabela').select('*');
  return data || [];
} catch {
  return []; // Erro engolido — página nunca sai do loading
}
```

O padrão correto é:
```typescript
// BOM — se der erro, lança pra página tratar (mostrar empty state ou toast)
const { data, error } = await supabase.from('tabela').select('*');
if (error) {
  console.error('Erro ao buscar dados:', error.message);
  // Se tabela não existe (404/42P01) → retornar vazio com aviso
  if (error.message.includes('does not exist') || error.code === '42P01') {
    return [];
  }
  throw new Error(`Erro ao buscar dados: ${error.message}`);
}
return data || [];
```

### 3.2 Corrigir TODOS os services em batch

```bash
# Listar todos os services
find lib/api -name '*.service.ts' -o -name '*.ts' | sort

# Contar catch blocks que retornam vazio
grep -c 'catch.*{' lib/api/*.ts 2>/dev/null | sort -t: -k2 -rn | head -20

# Encontrar o padrão ruim
grep -B2 -A5 'catch' lib/api/*.ts 2>/dev/null | grep -B3 'return \[\]\|return null\|return {}' | head -40
```

### 3.3 Script de correção em massa

Para CADA service file:
1. Encontrar catch blocks que retornam silenciosamente
2. Adicionar `console.error` ANTES do return
3. Se o catch está numa função que a UI depende para sair do loading, garantir que o erro é propagado ou que o loading é setado false

### 3.4 Corrigir as PÁGINAS (não só os services)

O loading infinito acontece quando a página faz:
```typescript
// RUIM
useEffect(() => {
  loadData(); // Se loadData falha silenciosamente, setLoading(false) nunca é chamado
}, []);

async function loadData() {
  setLoading(true);
  const data = await someService.getData();
  setData(data);
  setLoading(false); // Só chega aqui se não der erro
}
```

Padrão correto:
```typescript
// BOM
useEffect(() => {
  loadData();
}, []);

async function loadData() {
  setLoading(true);
  try {
    const data = await someService.getData();
    setData(data);
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    // Não crashar — mostrar empty state
  } finally {
    setLoading(false); // SEMPRE desliga loading, mesmo com erro
  }
}
```

### 3.5 Batch fix

```bash
# Encontrar TODAS as páginas com loading state
grep -rn 'setLoading\|setIsLoading\|useState.*loading\|useState.*Loading' app/ --include='*.tsx' -l | head -40

# Para cada uma, verificar se tem finally { setLoading(false) }
for file in $(grep -rn 'setLoading\|setIsLoading' app/ --include='*.tsx' -l | head -40); do
  has_finally=$(grep -c 'finally' "$file" 2>/dev/null)
  has_loading=$(grep -c 'setLoading\|setIsLoading' "$file" 2>/dev/null)
  if [ "$has_loading" -gt 0 ] && [ "$has_finally" -eq 0 ]; then
    echo "⚠️  SEM FINALLY: $file (tem $has_loading setLoading sem finally)"
  fi
done
```

Para CADA arquivo sem `finally`:
- Wrapar o corpo do `useEffect` callback ou da função `loadData` em `try/catch/finally`
- Garantir `setLoading(false)` no `finally`

### 3.6 Empty states universais

Para as páginas que carregam mas mostram nada (cards vazios escuros como na screenshot):

```bash
# Encontrar páginas que renderizam cards sem dados
grep -rn 'skeleton\|Skeleton\|animate-pulse' app/ --include='*.tsx' -l | head -30
```

Cada página com dados deve ter 3 estados:
1. **Loading:** Skeleton (animate-pulse) — MÁXIMO 5 segundos
2. **Empty:** Mensagem amigável + CTA ("Nenhuma receita registrada. Os dados aparecerão quando academias começarem a pagar.")
3. **Data:** Conteúdo real

Se após 5 segundos ainda está em loading → forçar transição para empty state:
```typescript
useEffect(() => {
  const timeout = setTimeout(() => {
    if (loading) {
      setLoading(false); // Força saída do skeleton
    }
  }, 5000);
  return () => clearTimeout(timeout);
}, [loading]);
```

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "fix: skeleton infinito → empty state em todas as páginas. finally{} em todo loading. Services com console.error."
```

---

## AGENTE 4 — VERIFICAR TABELAS REAIS NO SUPABASE

**Missão:** Identificar quais tabelas existem no banco e quais services estão tentando consultar tabelas inexistentes.

### 4.1 Listar tabelas reais

```bash
set -a && source .env.local && set +a

# Listar TODAS as tabelas do Supabase
TABLES_JSON=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}")

echo "$TABLES_JSON" | python3 -c "
import sys, json
try:
  d = json.load(sys.stdin)
  if isinstance(d, dict):
    tables = sorted(d.keys())
    print(f'Total: {len(tables)} tabelas')
    for t in tables:
      print(f'  ✅ {t}')
  else:
    print('Resposta não é objeto:', str(d)[:200])
except Exception as e:
  print(f'Erro: {e}')
" 2>/dev/null
```

### 4.2 Listar tabelas referenciadas nos services

```bash
# Extrair nomes de tabelas dos .from('tabela')
grep -rn "\.from(" lib/api/ --include='*.ts' | grep -oP "\.from\(['\"]([^'\"]+)" | sed "s/\.from(['\"]//g" | sort -u > /tmp/tables_in_services.txt

echo "Tabelas referenciadas nos services:"
wc -l /tmp/tables_in_services.txt
cat /tmp/tables_in_services.txt
```

### 4.3 Comparar

```bash
# Salvar tabelas reais
echo "$TABLES_JSON" | python3 -c "
import sys, json
d = json.load(sys.stdin)
if isinstance(d, dict):
  for k in sorted(d.keys()):
    print(k)
" > /tmp/tables_in_supabase.txt 2>/dev/null

# Diff
echo ""
echo "=== TABELAS QUE OS SERVICES PRECISAM MAS NÃO EXISTEM NO SUPABASE ==="
comm -23 /tmp/tables_in_services.txt /tmp/tables_in_supabase.txt
```

### 4.4 Para tabelas que FALTAM no Supabase

Gerar relatório: `docs/review/missing-tables.md`

Para cada tabela faltante:
- Verificar se há migration que a cria (mas não foi rodada)
- Se sim → listar como "migration pendente"
- Se não → listar como "migration precisa ser criada"

### 4.5 Para tabelas que EXISTEM mas retornam vazio

Testar as tabelas principais:
```bash
for TABLE in profiles academies classes plans invoices checkins guardian_links; do
  COUNT=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${TABLE}?select=id" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Prefer: count=exact" \
    -I 2>/dev/null | grep -i 'content-range' | grep -oP '\d+$')
  echo "$TABLE: ${COUNT:-0} registros"
done
```

Se tabelas principais estão vazias → o seed não foi rodado.

```bash
git add docs/review/missing-tables.md
git commit -m "audit: tabelas reais vs referenciadas — mapear gap Supabase"
```

---

## AGENTE 5 — VALIDAÇÃO FINAL + RELATÓRIO

### 5.1 Build limpo

```bash
pnpm typecheck && pnpm build
```

### 5.2 Checklist final

```bash
echo "════════════════════════════════════════"
echo "CHECKLIST FINAL"
echo "════════════════════════════════════════"

# Logout funcional
echo "--- Logout ---"
grep -c 'performLogout\|signOut' $(grep -rn 'Sair' components/shell/ --include='*.tsx' -l) 2>/dev/null
echo "botões Sair conectados ao performLogout"

# Login page sem loading inicial
echo "--- Login ---"
grep 'useState.*false.*loading\|useState(false)' app/(auth)/login/page.tsx 2>/dev/null | head -1

# AuthContext com timeout
echo "--- AuthContext ---"
grep -c 'timeout\|setTimeout.*loading' $(find lib -name 'AuthContext.tsx' | head -1) 2>/dev/null
echo "timeouts de segurança no AuthContext"

# Services com console.error
echo "--- Services ---"
TOTAL_CATCH=$(grep -rc 'catch' lib/api/*.ts 2>/dev/null | awk -F: '{sum+=$2} END {print sum}')
WITH_LOG=$(grep -rc 'console.error\|console.warn' lib/api/*.ts 2>/dev/null | awk -F: '{sum+=$2} END {print sum}')
echo "catch blocks: $TOTAL_CATCH, com log: $WITH_LOG"

# Páginas com finally
echo "--- Finally blocks ---"
PAGES_WITH_LOADING=$(grep -rl 'setLoading\|setIsLoading' app/ --include='*.tsx' | wc -l)
PAGES_WITH_FINALLY=$(grep -rl 'finally' app/ --include='*.tsx' | wc -l)
echo "Páginas com loading: $PAGES_WITH_LOADING, com finally: $PAGES_WITH_FINALLY"

# Tabelas no Supabase
echo "--- Supabase ---"
echo "Verificar docs/review/missing-tables.md para detalhes"
```

### 5.3 Commit e tag

```bash
git add -A
git commit -m "fix-nuclear: auth logout/login + skeleton infinito → empty state + services com error handling

5 agentes executados:
1. Logout nuclear — limpa cookies, storage, state, hard redirect
2. AuthContext — session, profile, timeout safety, maybeSingle
3. Services — finally{} em todo loading, console.error, empty states
4. Audit tabelas Supabase vs services — gap report
5. Validação final — checklist completo

Build limpo. Zero erros TypeScript."

git push origin main
```

---

## COMANDO PARA O CLAUDE CODE

```
Leia o BLACKBELT_AUTH_DATA_NUCLEAR.md nesta pasta. Execute os 5 agentes NA ORDEM:

AGENTE 0 (Diagnóstico): Rode TODO o bloco de diagnóstico. Salve output. Identifique a causa raiz de CADA bug. Se a anon key está no formato sb_publishable, PARE e reporte ao Gregory.

AGENTE 1 (Logout): Criar lib/auth/logout.ts com limpeza nuclear (cookies + storage + state + hard redirect). Conectar em TODOS os botões Sair de TODOS os shells. Commit.

AGENTE 2 (AuthContext): Corrigir para usar maybeSingle, timeout 5s, expor academyId e profileId. Verificar que wrapa toda a app. Commit.

AGENTE 3 (Services + Páginas): Para CADA service com catch que engole erro → adicionar console.error. Para CADA página com setLoading sem finally → adicionar finally. Timeout 5s em loading. Empty states. Commit.

AGENTE 4 (Tabelas): Listar tabelas reais no Supabase, comparar com services, gerar relatório de gap. Commit.

AGENTE 5 (Validação): Build limpo, checklist, commit final, push.

PRIORIDADE MÁXIMA: O app precisa de login/logout funcional e dados visíveis nas telas. Sem isso, é inutilizável. Comece pelo diagnóstico agora.
```

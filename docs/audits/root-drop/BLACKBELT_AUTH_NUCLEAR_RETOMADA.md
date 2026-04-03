# BLACKBELT v2 — RETOMADA: TROCAR ANON KEY + AUTH NUCLEAR COMPLETO
## Trocar a chave, aplicar migrations, seed, fix auth, fix dados — TUDO DE UMA VEZ

> **SITUAÇÃO:** A execução parou porque a anon key estava no formato `sb_publishable_*`.
> Gregory obteve a chave JWT correta. Este prompt troca a chave e executa TUDO que ficou pendente.

---

## AGENTE 0 — TROCAR ANON KEY (LOCAL + VERCEL)

**Missão:** Substituir a anon key antiga pela JWT em todos os lugares.

### 0.1 Trocar no .env.local

```bash
echo "=== AGENTE 0: Trocando anon key ==="

# A chave JWT correta
NEW_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkcGxtbW9kbXVtcnl6ZG9zbXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDk5NzEsImV4cCI6MjA4OTE4NTk3MX0.nnvQy9y_YwHXktJY14BiPwQc5AmrulpC2fk7BC6pr8g"

# Verificar estado atual
echo "--- Antes ---"
grep "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local

# Substituir (qualquer formato antigo: sb_publishable_* ou outra JWT)
if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
  # Substituir a linha existente
  sed -i.bak "s|^NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEW_ANON_KEY}|" .env.local
  rm -f .env.local.bak
else
  # Adicionar se não existe
  echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEW_ANON_KEY}" >> .env.local
fi

echo "--- Depois ---"
grep "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local | cut -c1-60
echo "...$(grep 'NEXT_PUBLIC_SUPABASE_ANON_KEY' .env.local | tail -c 20)"

# Verificar que começa com eyJ
if grep "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local | grep -q "^NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ"; then
  echo "✅ Anon key atualizada para formato JWT"
else
  echo "❌ ERRO: anon key não foi atualizada corretamente"
  exit 1
fi
```

### 0.2 Trocar na Vercel

```bash
# Verificar se Vercel CLI está disponível
if command -v vercel &> /dev/null || command -v npx vercel &> /dev/null; then
  echo "--- Atualizando na Vercel ---"

  # Remover a variável antiga
  echo "$NEW_ANON_KEY" | npx vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production -y 2>/dev/null
  echo "$NEW_ANON_KEY" | npx vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY preview -y 2>/dev/null

  # Adicionar a nova
  echo "$NEW_ANON_KEY" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
  echo "$NEW_ANON_KEY" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview

  echo "✅ Vercel env var atualizada"
else
  echo "⚠️  Vercel CLI não disponível. AÇÃO MANUAL NECESSÁRIA:"
  echo ""
  echo "   1. Abra: https://vercel.com → black_belt_v2 → Settings → Environment Variables"
  echo "   2. Edite NEXT_PUBLIC_SUPABASE_ANON_KEY"
  echo "   3. Cole: ${NEW_ANON_KEY:0:30}..."
  echo "   4. Salve e faça Redeploy com cache OFF"
  echo ""
fi
```

### 0.3 Verificar que hardcoded no código não existe

```bash
# Verificar se a key antiga está hardcoded em algum lugar
echo "--- Verificando hardcoded ---"
grep -rn "sb_publishable_ATsXcimoWwaPewOUofFoJw" app/ lib/ components/ --include='*.ts' --include='*.tsx' 2>/dev/null | head -5
grep -rn "sb_publishable" app/ lib/ components/ --include='*.ts' --include='*.tsx' 2>/dev/null | head -5

# Se encontrar, substituir
for file in $(grep -rl "sb_publishable_ATsXcimoWwaPewOUofFoJw" app/ lib/ components/ --include='*.ts' --include='*.tsx' 2>/dev/null); do
  echo "  Corrigindo hardcoded em: $file"
  sed -i.bak "s|sb_publishable_ATsXcimoWwaPewOUofFoJw_uyS22_nw|${NEW_ANON_KEY}|g" "$file"
  rm -f "${file}.bak"
done
```

### 0.4 Testar conexão com a nova key

```bash
set -a && source .env.local && set +a

echo "--- Testando conexão ---"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}")
echo "Supabase REST: HTTP $HTTP_CODE"

# Testar auth
echo "--- Testando auth ---"
LOGIN_RESULT=$(curl -s -X POST "${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@guerreiros.com","password":"BlackBelt@2026"}')

if echo "$LOGIN_RESULT" | grep -q "access_token"; then
  echo "✅ Login funciona com a nova anon key"
else
  ERROR_MSG=$(echo "$LOGIN_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error_description', d.get('msg', d.get('error', 'erro desconhecido'))))" 2>/dev/null)
  echo "⚠️  Login retornou: $ERROR_MSG"
  echo "   (Pode ser que o user não existe ainda — vamos criar no seed)"
fi

echo ""
echo "✅ AGENTE 0 COMPLETO — Anon key JWT configurada"
```

```bash
git add -A
git commit -m "config: anon key atualizada para formato JWT — desbloqueia auth real"
```

---

## AGENTE 1 — LOGOUT NUCLEAR

**Missão:** Garantir que "Sair" limpa TUDO e o login funciona imediatamente depois.

### 1.1 Criar lib/auth/logout.ts

```bash
cat lib/auth/logout.ts 2>/dev/null || echo "NÃO EXISTE — criar"
```

Criar/atualizar `lib/auth/logout.ts`:

```typescript
'use client';

import { createBrowserClient } from '@/lib/supabase/client';

/**
 * Logout nuclear — limpa sessão Supabase, cookies, storage, state.
 * Usa window.location.href (hard redirect) para garantir que o React
 * state é completamente limpo — router.push NÃO limpa o state.
 */
export async function performLogout(): Promise<void> {
  // 1. Supabase signOut (best effort — continua mesmo se falhar)
  try {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error('[logout] Erro no signOut:', err);
  }

  // 2. Limpar cookies de sessão do Supabase
  if (typeof document !== 'undefined') {
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (
        name.startsWith('sb-') ||
        name.includes('supabase') ||
        name.includes('auth-token') ||
        name.includes('session')
      ) {
        // Limpar para path / e para o domínio atual
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
        // Tentar com domínio com ponto (subdomínios)
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
      }
    });
  }

  // 3. Limpar localStorage
  if (typeof localStorage !== 'undefined') {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('sb-') ||
        key.includes('supabase') ||
        key.includes('auth') ||
        key.startsWith('bb_') ||
        key.includes('profile') ||
        key.includes('active_profile') ||
        key.includes('tour')
      )) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  // 4. Limpar sessionStorage
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
  }

  // 5. Hard redirect — limpa React state completamente
  // CRÍTICO: NÃO usar router.push — ele mantém o state na memória
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
```

### 1.2 Conectar em TODOS os botões "Sair"

```bash
# Encontrar todos os botões/links de sair
grep -rn "'Sair'\|\"Sair\"\|Sair<\|>Sair\|signOut\|handleLogout\|handleSignOut" components/shell/ components/layout/ components/shared/ app/ --include='*.tsx' | grep -v node_modules | grep -v .next | head -30

# Encontrar os shells
find components/shell -name '*.tsx' | sort
```

Para CADA shell/componente que tem botão "Sair":

1. Adicionar import: `import { performLogout } from '@/lib/auth/logout';`
2. No onClick do botão Sair: `onClick={() => performLogout()}`
3. Remover qualquer `router.push('/login')` que existir no handler de logout
4. Remover qualquer `signOut()` inline que existir (a função centralizada cuida de tudo)

**Verificar TODOS os shells:**
- SuperAdminShell
- AdminShell
- ProfessorShell
- RecepcionistShell / RecepcaoShell
- MainShell (aluno adulto)
- TeenShell
- KidsShell
- ParentShell
- FranqueadorShell
- ShellHeader (se existir header compartilhado)
- UserMenu / AvatarDropdown (se existir)

### 1.3 Fix da página de login

```bash
cat app/(auth)/login/page.tsx | head -80
```

Garantir que a página de login:
1. `useState(false)` para loading (NUNCA true no mount)
2. `useEffect` no mount que reseta state:
```typescript
useEffect(() => {
  setIsLoading(false);
  setError('');
}, []);
```
3. `finally { setIsLoading(false) }` no handleSubmit
4. `disabled={isLoading || !email.trim() || !password.trim()}` no botão
5. Se existe verificação de sessão no mount que redireciona user logado:
```typescript
useEffect(() => {
  const checkSession = async () => {
    try {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Já logado — redirecionar
        router.push('/admin'); // ou rota do role
      }
    } catch {
      // Sem sessão — OK, fica na página de login
    }
  };
  if (!isMock()) checkSession();
}, []);
```

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "fix: logout nuclear — limpa cookies/storage/state, hard redirect. Login reset no mount."
```

---

## AGENTE 2 — AUTHCONTEXT BLINDADO

**Missão:** AuthContext que NUNCA deixa a app em loading infinito.

### 2.1 Analisar e corrigir

```bash
# Encontrar AuthContext
find lib -name '*Auth*' -o -name '*auth*context*' -o -name '*auth*provider*' | head -10
cat $(find lib -name 'AuthContext.tsx' -o -name 'auth-context.tsx' -o -name 'AuthProvider.tsx' | head -1)
```

### 2.2 O AuthContext DEVE ter:

```typescript
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { isMock } from '@/lib/env';

interface AuthState {
  user: { id: string; email: string } | null;
  profile: any | null;
  role: string | null;
  academyId: string | null;
  profileId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  role: null,
  academyId: null,
  profileId: null,
  loading: true,
  error: null,
};

// ... createContext, Provider, etc.

// DENTRO DO PROVIDER:

// 1. TIMEOUT DE SEGURANÇA — nunca loading infinito
useEffect(() => {
  const timeout = setTimeout(() => {
    setState(prev => {
      if (prev.loading) {
        console.warn('[Auth] Timeout 5s — forçando loading=false');
        return { ...prev, loading: false };
      }
      return prev;
    });
  }, 5000);
  return () => clearTimeout(timeout);
}, []);

// 2. INICIALIZAÇÃO
useEffect(() => {
  if (isMock()) {
    // Em mock, carregar profile do mock
    loadMockProfile();
    return;
  }

  const supabase = createBrowserClient();

  // Verificar sessão existente
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      loadRealProfile(session.user.id, session.user.email || '');
    } else {
      setState(prev => ({ ...prev, loading: false }));
    }
  }).catch(err => {
    console.error('[Auth] Erro ao verificar sessão:', err);
    setState(prev => ({ ...prev, loading: false, error: err.message }));
  });

  // Listener de auth state
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadRealProfile(session.user.id, session.user.email || '');
      } else if (event === 'SIGNED_OUT') {
        setState({ ...initialState, loading: false });
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);

// 3. CARREGAR PROFILE REAL
async function loadRealProfile(userId: string, email: string) {
  try {
    const supabase = createBrowserClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(); // maybeSingle NÃO crasheia se retorna 0 ou 2+ rows

    if (error) {
      console.error('[Auth] Erro ao buscar profile:', error.message);
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      return;
    }

    if (!profile) {
      console.warn('[Auth] Nenhum profile encontrado para user_id:', userId);
      setState(prev => ({
        ...prev,
        user: { id: userId, email },
        loading: false,
      }));
      return;
    }

    setState({
      user: { id: userId, email: profile.email || email },
      profile,
      role: profile.role,
      academyId: profile.academy_id || null,
      profileId: profile.id,
      loading: false,
      error: null,
    });
  } catch (err: any) {
    console.error('[Auth] Erro inesperado:', err);
    setState(prev => ({ ...prev, loading: false, error: err.message }));
  }
}
```

### 2.3 Verificar que wrapa toda a app

```bash
grep -n 'AuthProvider\|AuthContext' app/layout.tsx app/providers.tsx 2>/dev/null | head -10
```

Se não está no layout root → adicionar.

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "fix: AuthContext blindado — timeout 5s, maybeSingle, expor academyId/profileId, listener auth"
```

---

## AGENTE 3 — SERVICES E PÁGINAS: ZERO SKELETON INFINITO

**Missão:** Nenhuma página fica em skeleton loading pra sempre. Se dados não carregam, mostra empty state.

### 3.1 Fix em massa dos services

```bash
# Encontrar TODOS os services
find lib/api -name '*.ts' | sort > /tmp/all_services.txt
wc -l /tmp/all_services.txt
echo "services encontrados"

# Encontrar catch blocks que engolem erros
echo ""
echo "=== CATCH BLOCKS QUE ENGOLEM ERROS ==="
for f in $(cat /tmp/all_services.txt); do
  silent=$(grep -c 'catch.*{' "$f" 2>/dev/null)
  logged=$(grep -c 'console.error\|console.warn\|handleServiceError\|throw' "$f" 2>/dev/null)
  if [ "$silent" -gt "$logged" ]; then
    echo "⚠️  $f — $silent catch, $logged com log"
  fi
done
```

Para CADA service com catch silencioso:
1. Adicionar `console.error('[ServiceName] Erro:', error)` antes do return
2. Se a função retorna `[]` no catch, está OK (graceful degradation) — MAS precisa do log

### 3.2 Fix em massa das páginas

```bash
# Páginas com setLoading mas sem finally
echo "=== PÁGINAS SEM FINALLY ==="
for f in $(grep -rl 'setLoading\|setIsLoading' app/ --include='*.tsx'); do
  has_loading=$(grep -c 'setLoading\|setIsLoading' "$f")
  has_finally=$(grep -c 'finally' "$f")
  if [ "$has_loading" -gt 0 ] && [ "$has_finally" -eq 0 ]; then
    echo "❌ $f"
  fi
done
```

Para CADA página sem `finally`:
1. Encontrar a função que chama `setLoading(true)`
2. Wrapar o corpo em `try { ... } catch (err) { console.error(err); } finally { setLoading(false); }`

### 3.3 Timeout de segurança em TODAS as páginas com loading

Criar um hook compartilhado:

```typescript
// lib/hooks/useLoadingTimeout.ts
'use client';

import { useEffect, useRef, Dispatch, SetStateAction } from 'react';

/**
 * Garante que loading nunca fica true por mais de `ms` millisegundos.
 * Se o timeout disparar, seta loading=false e loga um warning.
 */
export function useLoadingTimeout(
  loading: boolean,
  setLoading: Dispatch<SetStateAction<boolean>>,
  ms: number = 5000,
  label: string = 'Página'
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (loading) {
      timeoutRef.current = setTimeout(() => {
        console.warn(`[${label}] Loading timeout ${ms}ms — forçando false`);
        setLoading(false);
      }, ms);
    } else if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [loading, ms, label, setLoading]);
}
```

Aplicar nas páginas mais críticas (dashboards, financeiro, receita):

```typescript
import { useLoadingTimeout } from '@/lib/hooks/useLoadingTimeout';

// Dentro do componente:
const [loading, setLoading] = useState(true);
useLoadingTimeout(loading, setLoading, 5000, 'AdminDashboard');
```

### 3.4 Empty states

Para as páginas que carregam mas ficam com cards escuros vazios (como na screenshot de `/superadmin/receita`):

```bash
# Páginas do superadmin que provavelmente mostram dados financeiros
find app/(superadmin) -name 'page.tsx' | sort
```

Cada página de dados deve ter:
```tsx
if (loading) return <PageSkeleton />;

if (!data || data.length === 0) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-4xl mb-4">📊</div>
      <h3 className="text-lg font-medium" style={{ color: 'var(--bb-ink-100)' }}>
        Nenhum dado disponível
      </h3>
      <p className="text-sm mt-2" style={{ color: 'var(--bb-ink-400)' }}>
        Os dados aparecerão quando houver movimentação.
      </p>
    </div>
  );
}

// Renderizar dados reais
return <ActualContent data={data} />;
```

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "fix: zero skeleton infinito — finally em todas as páginas, useLoadingTimeout, empty states, console.error em services"
```

---

## AGENTE 4 — MIGRATIONS + SEED NO SUPABASE REAL

**Missão:** Aplicar migrations pendentes e popular com dados de teste.

### 4.1 Verificar tabelas existentes

```bash
set -a && source .env.local && set +a

echo "=== TABELAS NO SUPABASE ==="
TABLES=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}")

TABLE_COUNT=$(echo "$TABLES" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d)) if isinstance(d,dict) else print('erro')" 2>/dev/null)
echo "Total: $TABLE_COUNT tabelas"

# Listar tabelas principais que PRECISAM existir
for TABLE in profiles academies academy classes plans invoices checkins guardian_links platform_plans; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${TABLE}?select=id&limit=1" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}")
  if [ "$CODE" = "200" ]; then
    echo "  ✅ $TABLE"
  else
    echo "  ❌ $TABLE (HTTP $CODE)"
  fi
done
```

### 4.2 Aplicar migrations pendentes

Se o script `scripts/apply-pending-migrations.ts` existe, usá-lo.
Se não, tentar aplicar via consolidação:

```bash
# Verificar se existe script de aplicação
ls -la scripts/apply*migrations* scripts/consolidate* 2>/dev/null

# Se existe, rodar
if [ -f "scripts/apply-pending-migrations.ts" ]; then
  echo "Rodando apply-pending-migrations..."
  pnpm tsx scripts/apply-pending-migrations.ts
elif [ -f "scripts/apply-all-migrations.ts" ]; then
  echo "Rodando apply-all-migrations..."
  pnpm tsx scripts/apply-all-migrations.ts
else
  echo "Criando script de aplicação..."
  # Criar inline se necessário
fi
```

### 4.3 Seed completo

Se `scripts/seed-complete.ts` existe, adaptá-lo para o schema real das tabelas.

Verificar o nome real da tabela de academias:
```bash
# A tabela pode ser "academies" ou "academy" — verificar
curl -s -o /dev/null -w "%{http_code}" "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/academies?select=id&limit=1" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}"

curl -s -o /dev/null -w "%{http_code}" "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/academy?select=id&limit=1" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}"
```

Adaptar o seed para usar o nome correto. O seed DEVE:
1. Criar 9 users no Auth (com `auth.admin.createUser`)
2. Criar academia "Guerreiros do Tatame"
3. Criar profiles vinculados aos users E à academia
4. Criar turmas
5. Criar planos com valores canônicos (R$79/149/249/397/Enterprise)
6. Vincular responsável aos filhos (guardian_links)
7. Criar check-ins dos últimos 60 dias
8. Criar faturas dos últimos 3 meses

```bash
pnpm tsx scripts/seed-complete.ts
```

Se o seed falhar em algum passo, diagnosticar e corrigir o schema/script antes de prosseguir.

```bash
git add -A && git commit -m "data: migrations aplicadas + seed completo — Guerreiros do Tatame com 9 users"
```

---

## AGENTE 5 — TESTES E2E + BUILD FINAL

### 5.1 Testar fluxos reais

```bash
set -a && source .env.local && set +a

# Se existe test script, rodar
if [ -f "scripts/test-real-flows.ts" ]; then
  pnpm tsx scripts/test-real-flows.ts
fi
```

### 5.2 Testar login de CADA perfil

```bash
echo "=== TESTE DE LOGIN POR PERFIL ==="

test_login() {
  local email=$1
  local password=$2
  local role=$3

  RESULT=$(curl -s -X POST "${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${email}\",\"password\":\"${password}\"}")

  if echo "$RESULT" | grep -q "access_token"; then
    echo "  ✅ ${role}: ${email}"
  else
    MSG=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error_description', d.get('msg','?')))" 2>/dev/null)
    echo "  ❌ ${role}: ${email} — ${MSG}"
  fi
}

test_login "greg@email.com" "BlackBelt@Greg1994" "Super Admin"
test_login "admin@guerreiros.com" "BlackBelt@2026" "Admin"
test_login "professor@guerreiros.com" "BlackBelt@2026" "Professor"
test_login "recepcionista@guerreiros.com" "BlackBelt@2026" "Recepcionista"
test_login "aluno@guerreiros.com" "BlackBelt@2026" "Aluno Adulto"
test_login "teen@guerreiros.com" "BlackBelt@2026" "Aluno Teen"
test_login "kids@guerreiros.com" "BlackBelt@2026" "Aluno Kids"
test_login "responsavel@guerreiros.com" "BlackBelt@2026" "Responsável"
test_login "franqueador@email.com" "BlackBelt@2026" "Franqueador"
```

### 5.3 Build final

```bash
pnpm typecheck && pnpm build
```

### 5.4 Relatório final

```bash
cat > docs/review/auth-nuclear-report.md << 'REPORT'
# Auth Nuclear — Relatório Final

## Status

| Item | Status |
|------|--------|
| Anon key JWT | ✅ |
| Logout nuclear (performLogout) | ✅ |
| AuthContext com timeout 5s | ✅ |
| Services com console.error | ✅ |
| Páginas com finally | ✅ |
| useLoadingTimeout hook | ✅ |
| Empty states | ✅ |
| Migrations aplicadas | ✅/❌ |
| Seed completo | ✅/❌ |
| Login 9 perfis | ✅/❌ |
| Build limpo | ✅ |

## Pendências para Gregory

- [ ] Verificar anon key na Vercel (se CLI não conseguiu atualizar)
- [ ] Redeploy na Vercel com cache OFF
- [ ] Testar login no browser: https://blackbelts.com.br/login
- [ ] Testar logout e re-login
REPORT
```

### 5.5 Commit e push final

```bash
git add -A
git commit -m "nuclear: auth + dados + empty states — anon key JWT, logout, AuthContext, timeout, migrations, seed

Agente 0: Anon key trocada para JWT (eyJ...) no .env.local
Agente 1: performLogout() nuclear em todos os shells — cookies + storage + hard redirect
Agente 2: AuthContext com timeout 5s, maybeSingle, listener auth, expõe academyId
Agente 3: finally{} em todas as páginas, useLoadingTimeout hook, empty states, console.error em services
Agente 4: Migrations aplicadas, seed com 9 users + academia + turmas + planos
Agente 5: Login testado por perfil, build limpo, relatório

Zero erros TypeScript. Zero skeleton infinito."

git push origin main
```

---

## COMANDO PARA O CLAUDE CODE

```
Leia o BLACKBELT_AUTH_NUCLEAR_RETOMADA.md nesta pasta. Execute os 6 agentes NA ORDEM:

AGENTE 0: Trocar anon key para JWT no .env.local (e Vercel se CLI disponível). Verificar hardcoded. Testar conexão. Commit.

AGENTE 1: Criar lib/auth/logout.ts com limpeza nuclear. Conectar em TODOS os shells (SuperAdmin, Admin, Professor, Recepcao, Main, Teen, Kids, Parent, Franqueador). Fix login page. Commit.

AGENTE 2: AuthContext com timeout 5s, maybeSingle, listener onAuthStateChange, expor academyId/profileId. Commit.

AGENTE 3: console.error em TODOS os catch de services. finally{setLoading(false)} em TODAS as páginas. Criar useLoadingTimeout hook. Empty states onde dados são vazios. Commit.

AGENTE 4: Verificar tabelas reais, aplicar migrations pendentes, rodar seed completo. Commit.

AGENTE 5: Testar login de cada perfil, build limpo, relatório, push.

CADA agente commita antes de passar ao próximo. pnpm typecheck && pnpm build ZERO erros entre agentes. Comece pelo AGENTE 0 agora.
```

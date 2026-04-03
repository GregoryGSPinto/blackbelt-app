# BLACKBELT v2 — ENTERPRISE PRODUCTION (FASE 1 de 3)
# De Protótipo a Software Enterprise — Fundação, Auth, Schema

## MISSÃO

Transformar o BlackBelt v2 de protótipo com mocks em software enterprise de produção.
O dono de academia deve poder: cadastrar aluno, cobrar mensalidade, controlar presença,
acompanhar graduações, comunicar com pais — TUDO real, TUDO persistindo, TUDO offline-capable.

**Este prompt é a FASE 1 de 3. Foco: fundação sólida.**

---

## REGRAS ABSOLUTAS (APLICAM A TODAS AS 3 FASES)

1. **PRESERVAR blocos mock.** `isMock()` branching NUNCA é deletado.
2. **handleServiceError** em CADA catch block de CADA service.
3. **TypeScript strict.** Zero `any`. Zero `@ts-ignore`. Zero `as any`.
4. **pnpm typecheck && pnpm build** — ZERO erros ao final de CADA seção.
5. **Commit a cada seção** com mensagem descritiva.
6. **Avaliação honesta.** Se algo não funciona, reportar. Sem otimismo falso.
7. **Não criar arquivos novos desnecessários.** Corrigir os existentes.
8. **academy_id em TODA query.** Multi-tenant = isolamento total.
9. **RLS habilitado em TODA tabela.** Sem exceção.
10. **Nomes brasileiros** em seeds. João, Maria, Pedro — nunca John, Jane, Test.

---

## SEÇÃO 1 — DIAGNÓSTICO COMPLETO (15 min)

Antes de mudar qualquer coisa, entender EXATAMENTE o estado atual.

### 1A. Inventário de arquivos

```bash
echo "=== ESTRUTURA ==="
find app -name "page.tsx" | sort | wc -l
find lib/api -name "*.ts" | sort | wc -l
find supabase/migrations -name "*.sql" | sort | wc -l
echo ""
echo "=== SERVICES ==="
find lib/api -name "*.ts" -o -name "*.service.ts" | sort
echo ""
echo "=== MIGRATIONS ==="
ls -la supabase/migrations/ | sort
echo ""
echo "=== ENV ==="
cat .env.local 2>/dev/null || cat .env.example
echo ""
echo "=== PACKAGE VERSIONS ==="
grep -E "@supabase|next|react|capacitor" package.json | head -20
echo ""
echo "=== BUILD STATUS ==="
pnpm typecheck 2>&1 | tail -10
```

### 1B. Classificar CADA service

```bash
# Services com query Supabase real (ramo !isMock)
echo "=== SERVICES COM SUPABASE REAL ==="
for f in $(find lib/api -name "*.ts" | sort); do
  if grep -q "supabase.*from\|\.from(" "$f" 2>/dev/null; then
    HAS_MOCK=$(grep -c "isMock\|mock" "$f" 2>/dev/null || echo 0)
    echo "🟢 $f (mock branches: $HAS_MOCK)"
  fi
done

echo ""
echo "=== SERVICES SEM SUPABASE (MOCK ONLY OU TODO) ==="
for f in $(find lib/api -name "*.ts" | sort); do
  if ! grep -q "supabase.*from\|\.from(" "$f" 2>/dev/null; then
    HAS_THROW=$(grep -c "throw\|Not implemented\|TODO" "$f" 2>/dev/null || echo 0)
    echo "🔴 $f (throws/TODOs: $HAS_THROW)"
  fi
done
```

### 1C. Verificar tabelas referenciadas vs criadas

```bash
echo "=== TABELAS USADAS NOS SERVICES ==="
grep -rhn "\.from(['\"]" lib/api/ --include="*.ts" | grep -oP "\.from\(['\"]\\K[^'\"]+" | sort -u

echo ""
echo "=== TABELAS NAS MIGRATIONS ==="
grep -rhn "CREATE TABLE" supabase/migrations/ | grep -oP "CREATE TABLE\s+(IF NOT EXISTS\s+)?\\K\w+" | sort -u

echo ""
echo "=== TABELAS USADAS MAS NÃO CRIADAS ==="
comm -23 \
  <(grep -rhn "\.from(['\"]" lib/api/ --include="*.ts" | grep -oP "\.from\(['\"]\\K[^'\"]+" | sort -u) \
  <(grep -rhn "CREATE TABLE" supabase/migrations/ | grep -oP "CREATE TABLE\s+(IF NOT EXISTS\s+)?\\K\w+" | sort -u)
```

### 1D. Verificar RLS

```bash
echo "=== TABELAS COM RLS ==="
grep -rhn "ENABLE ROW LEVEL SECURITY" supabase/migrations/ | grep -oP "ALTER TABLE\s+\\K\w+" | sort -u

echo ""
echo "=== POLICIES ==="
grep -rhn "CREATE POLICY" supabase/migrations/ | wc -l
```

### 1E. Gerar AUDIT_SERVICES.md

Criar arquivo `AUDIT_SERVICES.md` na raiz com TODOS os services classificados:

```markdown
# Auditoria de Services — BlackBelt v2
Data: [data atual]

## Resumo
- Total services: [N]
- 🟢 Real Supabase: [N] ([%])
- 🟡 Parcial: [N] ([%])
- 🔴 Mock only: [N] ([%])

## 🟢 FUNCIONANDO (query Supabase real)
| Service | Arquivo | Tabelas usadas |
|---------|---------|----------------|

## 🟡 PARCIAL (tem query mas tabela pode não existir)
| Service | Arquivo | O que falta |
|---------|---------|-------------|

## 🔴 MOCK ONLY (precisa implementar)
| Service | Arquivo | Prioridade |
|---------|---------|------------|

## Tabelas órfãs (nos services mas sem migration)
[lista]

## Tabelas sem RLS
[lista]
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `audit: complete service and schema diagnostic`

---

## SEÇÃO 2 — SUPABASE CLIENT HARDENING (10 min)

### 2A. Verificar e corrigir lib/supabase/client.ts

```bash
cat lib/supabase/client.ts
```

O client DEVE ter:

```typescript
import { createBrowserClient } from '@supabase/ssr';

let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (clientInstance) return clientInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      '[Supabase] NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórios quando USE_MOCK=false'
    );
  }

  clientInstance = createBrowserClient(url, key);
  return clientInstance;
}

// Helper seguro — retorna null se env não configurada
export function getSupabaseClientSafe() {
  try {
    return getSupabaseClient();
  } catch {
    console.warn('[Supabase] Client não disponível — verifique env vars');
    return null;
  }
}
```

### 2B. Verificar e corrigir lib/supabase/server.ts

```bash
cat lib/supabase/server.ts
```

Deve usar `@supabase/ssr` com cookies:

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: Record<string, unknown>) {
          try { cookieStore.set({ name, value, ...options }); } catch { /* server component */ }
        },
        remove(name: string, options: Record<string, unknown>) {
          try { cookieStore.set({ name, value: '', ...options }); } catch { /* server component */ }
        },
      },
    }
  );
}

// Admin client (service_role) — APENAS em API routes e scripts
export function createAdminSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('[Supabase] SUPABASE_SERVICE_ROLE_KEY não configurada');

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { cookies: { get: () => undefined, set: () => {}, remove: () => {} } }
  );
}
```

### 2C. Verificar @supabase/ssr versão

```bash
grep "@supabase/ssr" package.json
```

Se < 0.5.0, atualizar:
```bash
pnpm add @supabase/ssr@latest @supabase/supabase-js@latest
```

### 2D. Verificar formato da key

```bash
grep "ANON_KEY" .env.local 2>/dev/null
```

Se começa com `sb_publishable_`:
- Imprimir aviso claro:
```
⚠️ AÇÃO MANUAL NECESSÁRIA:
A anon key está no novo formato (sb_publishable_).
Para máxima compatibilidade, use a LEGACY key:

1. Abra https://supabase.com/dashboard/project/tdplmmodmumryzdosmpv/settings/api
2. Procure seção "Legacy anon, service_role API keys"
3. Copie a "anon" key (começa com eyJ...)
4. Atualize .env.local: NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
5. Atualize na Vercel: Settings > Environment Variables > NEXT_PUBLIC_SUPABASE_ANON_KEY

Se a seção "Legacy" NÃO existir, a key sb_publishable funciona com @supabase/ssr >= 0.5.
Neste caso, confirme que a versão está atualizada (passo 2C acima).
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `fix: supabase client hardening — singleton, safe fallback, admin client`

---

## SEÇÃO 3 — AUTH FLOW COMPLETO E REAL (20 min)

O auth é a base de TUDO. Se o login não funciona perfeitamente para os 9 perfis, nada mais importa.

### 3A. Verificar AuthContext

```bash
cat lib/contexts/AuthContext.tsx
```

O AuthContext DEVE expor (quando `!isMock()`):

```typescript
interface AuthContextValue {
  // Estado
  user: SupabaseUser | null;        // auth.getUser()
  profile: Profile | null;           // tabela profiles
  role: UserRole | null;             // do profile ou membership
  academyId: string | null;          // da membership ou profile
  profileId: string | null;          // profiles.id
  studentId: string | null;          // students.id (null se não é aluno)
  isLoading: boolean;
  isAuthenticated: boolean;

  // Ações
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
```

**Fluxo após login real:**
```typescript
// 1. Login
const { data, error } = await supabase.auth.signInWithPassword({ email, password });
if (error) throw new ServiceError(401, 'auth', error.message);

// 2. Buscar profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', data.user.id)
  .single();

// 3. Buscar membership (para academyId e role)
const { data: membership } = await supabase
  .from('memberships')
  .select('*')
  .eq('profile_id', profile.id)
  .order('created_at', { ascending: false })
  .limit(1)
  .single();

// 4. Se é aluno, buscar studentId
let studentId = null;
if (['aluno_adulto', 'aluno_teen', 'aluno_kids'].includes(membership.role)) {
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('profile_id', profile.id)
    .single();
  studentId = student?.id ?? null;
}

// 5. Setar no contexto
setState({
  user: data.user,
  profile,
  role: membership.role as UserRole,
  academyId: membership.academy_id,
  profileId: profile.id,
  studentId,
  isLoading: false,
  isAuthenticated: true,
});

// 6. Redirect baseado no role
const roleRoutes: Record<string, string> = {
  super_admin: '/superadmin',
  admin: '/admin',
  professor: '/professor',
  recepcionista: '/recepcao',
  aluno_adulto: '/aluno',
  aluno_teen: '/teen',
  aluno_kids: '/kids',
  responsavel: '/responsavel',
  franqueador: '/franqueador',
};
router.push(roleRoutes[membership.role] || '/');
```

**IMPORTANTE:** Se o AuthContext atual NÃO tem esse fluxo completo no ramo `!isMock()`, IMPLEMENTAR AGORA. Este é o ponto #1 de falha.

### 3B. Verificar middleware.ts

```bash
cat middleware.ts
```

O middleware DEVE:
1. Verificar sessão Supabase (via cookie)
2. Se não autenticado e rota protegida → redirect /login
3. Se autenticado, extrair role do token/profile
4. Verificar se role tem acesso à rota atual
5. Permitir rotas públicas sem auth: `/`, `/login`, `/cadastro`, `/precos`, `/compete/*`, `/api/webhooks/*`

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/', '/login', '/cadastro', '/esqueci-senha', '/precos', '/registro'];
const PUBLIC_PREFIXES = ['/compete', '/api/webhooks', '/_next', '/favicon'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rotas públicas
  if (PUBLIC_ROUTES.includes(pathname) || PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Static assets
  if (pathname.includes('.')) return NextResponse.next();

  // Criar Supabase client com cookies do request
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return req.cookies.get(name)?.value; },
        set(name, value, options) { res.cookies.set({ name, value, ...options }); },
        remove(name, options) { res.cookies.set({ name, value: '', ...options }); },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
```

### 3C. Verificar login page

```bash
cat app/\(auth\)/login/page.tsx | head -80
```

Login DEVE:
- Chamar `supabase.auth.signInWithPassword()` quando `!isMock()`
- Mostrar loading state durante login
- Mostrar erro claro (credenciais inválidas, email não confirmado, etc.)
- Após sucesso, chamar AuthContext que faz o redirect por role

### 3D. Criar/Verificar seed de auth users

```bash
find . -path "*/scripts/seed*" -o -path "*/scripts/setup*" | grep -v node_modules
```

Criar `scripts/seed-auth-users.ts` se não existe:

```typescript
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ACADEMY = {
  id: 'acad-guerreiros-001',
  name: 'Guerreiros do Tatame',
  slug: 'guerreiros-do-tatame',
  cnpj: '12.345.678/0001-90',
  phone: '(31) 99999-0000',
  email: 'contato@guerreirosdotatame.com.br',
  address: 'Rua das Artes Marciais, 100 — Vespasiano, MG',
  city: 'Vespasiano',
  state: 'MG',
  modalities: ['jiu_jitsu', 'judo', 'karate', 'mma'],
};

const USERS = [
  // Super Admin (Gregory)
  {
    email: 'gregoryguimaraes12@gmail.com',
    password: '@Greg1994',
    role: 'super_admin',
    name: 'Gregory Pinto',
    academy_id: null, // super admin não pertence a academia
  },
  // Admin da academia
  {
    email: 'admin@guerreiros.com',
    password: 'BlackBelt@2026',
    role: 'admin',
    name: 'Roberto Silva',
    academy_id: ACADEMY.id,
  },
  // Professor 1
  {
    email: 'professor@guerreiros.com',
    password: 'BlackBelt@2026',
    role: 'professor',
    name: 'Carlos Eduardo Santos (Sensei Carlos)',
    academy_id: ACADEMY.id,
  },
  // Professor 2
  {
    email: 'professor2@guerreiros.com',
    password: 'BlackBelt@2026',
    role: 'professor',
    name: 'Ana Paula Lima (Professora Ana)',
    academy_id: ACADEMY.id,
  },
  // Recepcionista
  {
    email: 'recepcionista@guerreiros.com',
    password: 'BlackBelt@2026',
    role: 'recepcionista',
    name: 'Maria Aparecida Santos',
    academy_id: ACADEMY.id,
  },
  // Aluno Adulto 1
  {
    email: 'adulto@guerreiros.com',
    password: 'BlackBelt@2026',
    role: 'aluno_adulto',
    name: 'João Pedro de Oliveira',
    academy_id: ACADEMY.id,
    belt: 'azul',
    stripes: 2,
  },
  // Aluno Adulto 2
  {
    email: 'aluno2@guerreiros.com',
    password: 'BlackBelt@2026',
    role: 'aluno_adulto',
    name: 'Marcos Vinícius Almeida',
    academy_id: ACADEMY.id,
    belt: 'branca',
    stripes: 4,
  },
  // Aluno Teen
  {
    email: 'teen@guerreiros.com',
    password: 'BlackBelt@2026',
    role: 'aluno_teen',
    name: 'Lucas Gabriel Ferreira',
    academy_id: ACADEMY.id,
    belt: 'amarela',
    stripes: 1,
    birth_date: '2011-06-15',
  },
  // Aluno Kids
  {
    email: 'kids@guerreiros.com',
    password: 'BlackBelt@2026',
    role: 'aluno_kids',
    name: 'Ana Beatriz Costa',
    academy_id: ACADEMY.id,
    belt: 'branca',
    stripes: 0,
    birth_date: '2017-03-22',
  },
  // Responsável (pai do teen e kids)
  {
    email: 'responsavel@guerreiros.com',
    password: 'BlackBelt@2026',
    role: 'responsavel',
    name: 'Pedro Henrique Ferreira',
    academy_id: ACADEMY.id,
    // guardian_of: ['teen@guerreiros.com', 'kids@guerreiros.com'],
  },
  // Franqueador
  {
    email: 'franqueador@guerreiros.com',
    password: 'BlackBelt@2026',
    role: 'franqueador',
    name: 'Fernando Augusto Ramos',
    academy_id: null, // franqueador vê múltiplas academias
  },
];

async function seed() {
  console.log('🏛️  Criando academia...');

  // 1. Upsert academy
  const { error: acadError } = await supabase.from('academies').upsert({
    id: ACADEMY.id,
    name: ACADEMY.name,
    slug: ACADEMY.slug,
    cnpj: ACADEMY.cnpj,
    phone: ACADEMY.phone,
    email: ACADEMY.email,
    address: ACADEMY.address,
    city: ACADEMY.city,
    state: ACADEMY.state,
    modalities: ACADEMY.modalities,
    status: 'active',
    created_at: new Date().toISOString(),
  }, { onConflict: 'id' });

  if (acadError) console.error('❌ Academia:', acadError.message);
  else console.log('✅ Academia criada');

  // 2. Criar cada user
  for (const u of USERS) {
    console.log(`\n👤 ${u.email} (${u.role})...`);

    // 2a. Criar no Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { display_name: u.name, role: u.role },
    });

    let userId: string;

    if (authError) {
      if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
        console.log('  ⏭️  Auth user já existe');
        // Buscar ID existente
        const { data: users } = await supabase.auth.admin.listUsers();
        const existing = users?.users?.find(x => x.email === u.email);
        if (!existing) { console.error('  ❌ Não encontrou user existente'); continue; }
        userId = existing.id;
      } else {
        console.error('  ❌ Auth:', authError.message);
        continue;
      }
    } else {
      userId = authData.user.id;
      console.log('  ✅ Auth user criado');
    }

    // 2b. Upsert profile
    const { error: profError } = await supabase.from('profiles').upsert({
      id: userId,
      user_id: userId,
      email: u.email,
      display_name: u.name,
      role: u.role,
      academy_id: u.academy_id,
      avatar_url: null,
      created_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    if (profError) console.error('  ⚠️ Profile:', profError.message);
    else console.log('  ✅ Profile upserted');

    // 2c. Upsert membership (se tem academy)
    if (u.academy_id) {
      const { error: memError } = await supabase.from('memberships').upsert({
        profile_id: userId,
        academy_id: u.academy_id,
        role: u.role,
        status: 'active',
        created_at: new Date().toISOString(),
      }, { onConflict: 'profile_id,academy_id' });

      if (memError) console.error('  ⚠️ Membership:', memError.message);
      else console.log('  ✅ Membership upserted');
    }

    // 2d. Se aluno, criar student record
    if (['aluno_adulto', 'aluno_teen', 'aluno_kids'].includes(u.role)) {
      const { error: stuError } = await supabase.from('students').upsert({
        profile_id: userId,
        academy_id: u.academy_id,
        belt: (u as any).belt || 'branca',
        stripes: (u as any).stripes || 0,
        birth_date: (u as any).birth_date || null,
        enrollment_date: new Date().toISOString(),
        status: 'active',
      }, { onConflict: 'profile_id' });

      if (stuError) console.error('  ⚠️ Student:', stuError.message);
      else console.log('  ✅ Student upserted');
    }

    // 2e. Se responsável, criar guardian links
    if (u.role === 'responsavel') {
      // Link para teen e kids
      for (const childEmail of ['teen@guerreiros.com', 'kids@guerreiros.com']) {
        const { data: childUser } = await supabase.auth.admin.listUsers();
        const child = childUser?.users?.find(x => x.email === childEmail);
        if (child) {
          const { error: linkError } = await supabase.from('guardian_links').upsert({
            guardian_profile_id: userId,
            student_profile_id: child.id,
            relationship: 'pai',
            created_at: new Date().toISOString(),
          }, { onConflict: 'guardian_profile_id,student_profile_id' });

          if (linkError) console.error(`  ⚠️ Guardian link ${childEmail}:`, linkError.message);
          else console.log(`  ✅ Guardian link → ${childEmail}`);
        }
      }
    }
  }

  console.log('\n🎉 Seed completo!');
  console.log('\n📋 CREDENCIAIS PARA TESTE:');
  for (const u of USERS) {
    console.log(`  ${u.role.padEnd(15)} → ${u.email} / ${u.password}`);
  }
}

seed().catch(console.error);
```

### 3E. Imprimir instruções

```
🔑 PARA RODAR O SEED:
1. Pegue a service_role key:
   → Supabase Dashboard → Settings → API Keys
   → Seção "Legacy" ou "Secret keys" → copie a chave completa
2. Adicione ao .env.local:
   SUPABASE_SERVICE_ROLE_KEY=sua_key_aqui
3. Rode:
   npx tsx scripts/seed-auth-users.ts
4. Verifique no Supabase Dashboard → Authentication → Users
   que os 11 users aparecem
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: auth flow hardened — complete login, seed script, middleware`

---

## SEÇÃO 4 — SCHEMA ENTERPRISE: MIGRATION CONSOLIDADA (25 min)

Verificar que TODAS as tabelas necessárias existem. Se faltam, criar nova migration.

### 4A. Verificar tabelas essenciais

Rodar o diagnóstico da Seção 1C. Para cada tabela usada nos services que NÃO existe na migration, criar.

### 4B. Migration consolidada

Criar `supabase/migrations/050_enterprise_consolidation.sql`:

```sql
-- ═══════════════════════════════════════════════════
-- BLACKBELT v2 — Enterprise Consolidation
-- Garante que TODAS as tabelas necessárias existem
-- Safe: IF NOT EXISTS em tudo
-- ═══════════════════════════════════════════════════

-- ═══ ACADEMIES ═══
CREATE TABLE IF NOT EXISTS academies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  cnpj TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  logo_url TEXT,
  modalities TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'trial', 'suspended')),
  trial_ends_at TIMESTAMPTZ,
  plan TEXT DEFAULT 'starter',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ PROFILES ═══
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN (
    'super_admin', 'admin', 'professor', 'recepcionista',
    'aluno_adulto', 'aluno_teen', 'aluno_kids', 'responsavel', 'franqueador'
  )),
  academy_id UUID REFERENCES academies(id) ON DELETE SET NULL,
  avatar_url TEXT,
  phone TEXT,
  cpf TEXT,
  birth_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ MEMBERSHIPS ═══
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_id, academy_id)
);

-- ═══ STUDENTS ═══
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  academy_id UUID REFERENCES academies(id) ON DELETE CASCADE,
  belt TEXT DEFAULT 'branca',
  stripes INTEGER DEFAULT 0,
  birth_date DATE,
  enrollment_date TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active',
  modality TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  medical_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ GUARDIAN LINKS ═══
CREATE TABLE IF NOT EXISTS guardian_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'responsavel',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(guardian_profile_id, student_profile_id)
);

-- ═══ CLASSES (TURMAS) ═══
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  modality TEXT NOT NULL,
  professor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  max_students INTEGER DEFAULT 30,
  status TEXT DEFAULT 'active',
  schedule JSONB DEFAULT '[]', -- [{day: 'monday', start: '19:00', end: '20:30'}]
  description TEXT,
  level TEXT DEFAULT 'all', -- beginner, intermediate, advanced, all
  min_age INTEGER,
  max_age INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ CLASS ENROLLMENTS ═══
CREATE TABLE IF NOT EXISTS class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active',
  UNIQUE(class_id, student_id)
);

-- ═══ ATTENDANCE (CHECK-INS) ═══
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  professor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  check_in_at TIMESTAMPTZ DEFAULT now(),
  method TEXT DEFAULT 'manual', -- manual, qr_code, biometric
  notes TEXT,
  UNIQUE(student_id, class_id, check_in_at::date)
);

-- ═══ BELT PROGRESSIONS ═══
CREATE TABLE IF NOT EXISTS belt_progressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  from_belt TEXT,
  from_stripes INTEGER,
  to_belt TEXT NOT NULL,
  to_stripes INTEGER DEFAULT 0,
  promoted_by UUID REFERENCES profiles(id),
  promoted_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  ceremony_date DATE
);

-- ═══ PLANS (PLANOS DE ASSINATURA) ═══
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL, -- preço em centavos (R$ 197,00 = 19700)
  interval TEXT DEFAULT 'monthly' CHECK (interval IN ('monthly', 'quarterly', 'semiannual', 'annual')),
  max_classes_per_week INTEGER,
  modalities TEXT[] DEFAULT '{}',
  features JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ SUBSCRIPTIONS ═══
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'suspended', 'trial')),
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  external_id TEXT, -- ID no gateway de pagamento
  gateway TEXT, -- asaas, stripe, manual
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ INVOICES (FATURAS) ═══
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled', 'refunded')),
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  payment_method TEXT, -- pix, boleto, cartao, manual
  external_id TEXT,
  invoice_url TEXT,
  pix_qr_code TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ NOTIFICATIONS ═══
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  academy_id UUID REFERENCES academies(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- info, warning, success, payment, attendance, belt
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ MESSAGES ═══
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  recipient_id UUID REFERENCES profiles(id), -- null = broadcast
  channel TEXT DEFAULT 'direct', -- direct, class, academy
  channel_id UUID, -- class_id se channel=class
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ ACHIEVEMENTS (CONQUISTAS) ═══
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT, -- attendance, belt, social, challenge
  requirement JSONB, -- {type: 'streak', value: 7}
  xp_reward INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ STUDENT ACHIEVEMENTS ═══
CREATE TABLE IF NOT EXISTS student_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id),
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, achievement_id)
);

-- ═══ XP LEDGER (GAMIFICAÇÃO) ═══
CREATE TABLE IF NOT EXISTS xp_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL, -- attendance, achievement, quiz, belt
  reference_id UUID, -- ID do registro que gerou o XP
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ EVALUATIONS (AVALIAÇÕES PEDAGÓGICAS) ═══
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES profiles(id),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'periodic', -- periodic, belt_exam, observation
  scores JSONB NOT NULL, -- {tecnica: 8, disciplina: 9, presenca: 7}
  notes TEXT,
  evaluated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ FRANCHISE NETWORKS ═══
CREATE TABLE IF NOT EXISTS franchise_networks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_profile_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS franchise_academies (
  network_id UUID NOT NULL REFERENCES franchise_networks(id) ON DELETE CASCADE,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (network_id, academy_id)
);

-- ═══ PAYMENT CUSTOMERS (GATEWAY) ═══
CREATE TABLE IF NOT EXISTS payment_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  gateway TEXT NOT NULL, -- asaas, stripe
  external_id TEXT NOT NULL, -- ID no gateway
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_id, gateway)
);

-- ═══ WEBHOOK LOGS ═══
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════
-- INDEXES
-- ═══════════════════════════════

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_academy_id ON profiles(academy_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_memberships_profile ON memberships(profile_id);
CREATE INDEX IF NOT EXISTS idx_memberships_academy ON memberships(academy_id);
CREATE INDEX IF NOT EXISTS idx_students_profile ON students(profile_id);
CREATE INDEX IF NOT EXISTS idx_students_academy ON students(academy_id);
CREATE INDEX IF NOT EXISTS idx_classes_academy ON classes(academy_id);
CREATE INDEX IF NOT EXISTS idx_classes_professor ON classes(professor_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_academy ON attendance(academy_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(check_in_at);
CREATE INDEX IF NOT EXISTS idx_invoices_student ON invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_invoices_academy ON invoices(academy_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_notifications_profile ON notifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_messages_academy ON messages(academy_id);
CREATE INDEX IF NOT EXISTS idx_xp_ledger_student ON xp_ledger(student_id);

-- ═══════════════════════════════
-- RLS — TODAS AS TABELAS
-- ═══════════════════════════════

ALTER TABLE academies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE belt_progressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_academies ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════
-- POLICIES — Padrão multi-tenant
-- ═══════════════════════════════

-- Helper function
CREATE OR REPLACE FUNCTION get_user_academy_id()
RETURNS UUID AS $$
  SELECT academy_id FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Profiles: user vê seu próprio, admin/professor vê da academia
DO $$ BEGIN
  CREATE POLICY profiles_select ON profiles FOR SELECT USING (
    user_id = auth.uid()
    OR academy_id = get_user_academy_id()
    OR get_user_role() = 'super_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY profiles_update ON profiles FOR UPDATE USING (
    user_id = auth.uid()
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Students: aluno vê a si, admin/professor vê da academia
DO $$ BEGIN
  CREATE POLICY students_select ON students FOR SELECT USING (
    profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR academy_id = get_user_academy_id()
    OR get_user_role() = 'super_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Attendance: aluno vê a sua, admin/professor vê da academia
DO $$ BEGIN
  CREATE POLICY attendance_select ON attendance FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()))
    OR academy_id = get_user_academy_id()
    OR get_user_role() = 'super_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY attendance_insert ON attendance FOR INSERT WITH CHECK (
    academy_id = get_user_academy_id()
    OR get_user_role() IN ('super_admin', 'admin', 'professor', 'recepcionista')
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Classes: todos da academia veem
DO $$ BEGIN
  CREATE POLICY classes_select ON classes FOR SELECT USING (
    academy_id = get_user_academy_id()
    OR get_user_role() = 'super_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY classes_manage ON classes FOR ALL USING (
    get_user_role() IN ('super_admin', 'admin')
    AND (academy_id = get_user_academy_id() OR get_user_role() = 'super_admin')
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Invoices: aluno vê as suas, admin vê da academia
DO $$ BEGIN
  CREATE POLICY invoices_select ON invoices FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()))
    OR academy_id = get_user_academy_id()
    OR get_user_role() = 'super_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Notifications: só o próprio user
DO $$ BEGIN
  CREATE POLICY notifications_own ON notifications FOR ALL USING (
    profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Messages: participante ou admin da academia
DO $$ BEGIN
  CREATE POLICY messages_select ON messages FOR SELECT USING (
    sender_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR recipient_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR (recipient_id IS NULL AND academy_id = get_user_academy_id())
    OR get_user_role() = 'super_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Plans: todos da academia veem
DO $$ BEGIN
  CREATE POLICY plans_select ON plans FOR SELECT USING (
    academy_id = get_user_academy_id()
    OR get_user_role() = 'super_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Guardian links: guardian ou admin
DO $$ BEGIN
  CREATE POLICY guardian_links_select ON guardian_links FOR SELECT USING (
    guardian_profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR student_profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR get_user_role() IN ('super_admin', 'admin')
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Achievements: todos veem (catálogo público)
DO $$ BEGIN
  CREATE POLICY achievements_select ON achievements FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Student achievements: aluno vê as suas, academia vê todas
DO $$ BEGIN
  CREATE POLICY student_achievements_select ON student_achievements FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()))
    OR get_user_role() IN ('super_admin', 'admin', 'professor')
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- XP: mesmo padrão de student_achievements
DO $$ BEGIN
  CREATE POLICY xp_select ON xp_ledger FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()))
    OR get_user_role() IN ('super_admin', 'admin', 'professor')
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Evaluations: aluno vê as suas, professor e admin veem da academia
DO $$ BEGIN
  CREATE POLICY evaluations_select ON evaluations FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()))
    OR academy_id = get_user_academy_id()
    OR get_user_role() = 'super_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Academies: membros veem a sua, super_admin vê todas
DO $$ BEGIN
  CREATE POLICY academies_select ON academies FOR SELECT USING (
    id = get_user_academy_id()
    OR get_user_role() = 'super_admin'
    OR get_user_role() = 'franqueador'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Subscriptions
DO $$ BEGIN
  CREATE POLICY subscriptions_select ON subscriptions FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()))
    OR academy_id = get_user_academy_id()
    OR get_user_role() = 'super_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Franchise: franqueador e super_admin
DO $$ BEGIN
  CREATE POLICY franchise_select ON franchise_networks FOR SELECT USING (
    owner_profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR get_user_role() = 'super_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY franchise_academies_select ON franchise_academies FOR SELECT USING (
    network_id IN (SELECT id FROM franchise_networks WHERE owner_profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()))
    OR get_user_role() = 'super_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Webhook logs: só super_admin e admin
DO $$ BEGIN
  CREATE POLICY webhook_logs_select ON webhook_logs FOR SELECT USING (
    get_user_role() IN ('super_admin', 'admin')
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Payment customers: próprio user ou admin
DO $$ BEGIN
  CREATE POLICY payment_customers_select ON payment_customers FOR SELECT USING (
    profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR get_user_role() IN ('super_admin', 'admin')
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ═══════════════════════════════
-- UPDATED_AT TRIGGER
-- ═══════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER academies_updated_at BEFORE UPDATE ON academies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
```

### 4C. Rodar migration

Imprimir instruções:
```
📋 PARA APLICAR A MIGRATION:
1. Copie o conteúdo de supabase/migrations/050_enterprise_consolidation.sql
2. Cole no SQL Editor do Supabase: https://supabase.com/dashboard/project/tdplmmodmumryzdosmpv/sql/new
3. Clique Run
4. Espere "Success"
5. Depois rode o seed: npx tsx scripts/seed-auth-users.ts
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: enterprise schema — 22 tables, full RLS, indexes, helper functions`

---

## COMANDO DE RETOMADA — FASE 1

```
Continue de onde parou na FASE 1 do BLACKBELT_ENTERPRISE_P1.md. Verifique estado: cat AUDIT_SERVICES.md 2>/dev/null | head -5 && ls supabase/migrations/050* 2>/dev/null && pnpm typecheck 2>&1 | tail -5. Continue da próxima seção incompleta. ZERO erros. Commit e push. Comece agora.
```

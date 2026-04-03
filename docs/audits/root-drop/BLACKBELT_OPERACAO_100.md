# 🥋 BLACKBELT V2 — OPERAÇÃO 100/100
# PROMPT DE CORREÇÃO TOTAL — TODOS OS GAPS DA ENTERPRISE REVIEW
# Baseado nos relatórios dos 8 agentes em /docs/review/

---

Leia TODOS os 8 relatórios em `/docs/review/` (AGENTE_01 até AGENTE_08). Eles contêm os gaps exatos encontrados na revisão enterprise anterior. Seu trabalho é RESOLVER CADA UM deles até atingir 100/100 em todas as dimensões.

Você vai operar como um **time de 12 agentes ultra-especializados**, cada um focado em elevar um score específico ao máximo. Execução sequencial, commit entre cada agente.

## REGRAS ABSOLUTAS

1. Leia o relatório do agente correspondente ANTES de começar cada bloco
2. `npx tsc --noEmit` DEVE retornar 0 erros após CADA agente — se quebrar, corrija antes de commitar
3. NUNCA delete blocos `isMock()` — mock e real coexistem sempre
4. `handleServiceError(error)` em todo catch de service
5. CSS variables: `var(--bb-depth-*)`, `var(--bb-ink-*)`, `var(--bb-brand)` — ZERO cores hardcoded em componentes
6. Toast PT-BR em TODA ação do usuário (sucesso e erro)
7. Commit entre cada agente: `git add -A && git commit -m "fix-100: agente-XX-nome"`
8. Se um arquivo ficar muito grande para ler inteiro, use grep/head/tail para encontrar as linhas relevantes
9. PRIORIZE CORREÇÕES REAIS sobre relatórios — o código importa mais que o documento
10. Skeleton loading = componente `<Skeleton />` com layout que espelha o conteúdo real, NUNCA spinner genérico sozinho

---

## AGENTE 01 — PERFORMANCE SURGEON (Score atual: 62 → Meta: 100)
**Missão:** Eliminar TODOS os problemas de performance identificados no AGENTE_06_PERFORMANCE.md

### 1.1 — Eliminar select('*') desnecessários
Busque TODOS os `.select('*')` em `lib/` e `app/`:
```bash
grep -rn "select('\*')" lib/ app/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v ".d.ts"
```
Para CADA ocorrência:
- Identifique quais colunas são realmente usadas pelo código que consome o resultado
- Substitua `select('*')` por `select('col1, col2, col3')` com APENAS as colunas necessárias
- Se o resultado é tipado com uma interface, use as propriedades da interface como guia
- EXCEÇÃO: se é um CRUD admin que realmente precisa de todas as colunas, deixe `select('*')` mas adicione comentário `// all columns needed for admin CRUD`

### 1.2 — next/image em todas as imagens
Busque TODOS os `<img` tags em componentes:
```bash
grep -rn "<img " app/ components/ --include="*.tsx" | grep -v node_modules
```
Para CADA ocorrência:
- Substitua `<img` por `<Image` de `next/image`
- Adicione `width` e `height` (use tamanhos razoáveis baseados no contexto)
- Para imagens dinâmicas (avatar, upload), use `fill` com container `relative`
- Para ícones/logos pequenos, adicione `priority={false}` e `loading="lazy"`
- Se a imagem é acima do fold (hero, logo do header), adicione `priority={true}`
- IMPORTANTE: adicione domínios externos em `next.config.js` se necessário:
  ```js
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] }
  ```

### 1.3 — Debounce em inputs de busca
Busque TODOS os inputs de busca/filtro:
```bash
grep -rn "onChange.*search\|onChange.*filter\|onChange.*query\|onSearch\|handleSearch\|setSearch\|setFilter\|setBusca" app/ components/ --include="*.tsx" | grep -v node_modules
```
Para CADA input de busca que dispara fetch/query:
- Implemente debounce de 300ms usando `useCallback` + `setTimeout`/`useRef`
- Pattern:
```tsx
const searchTimeoutRef = useRef<NodeJS.Timeout>();
const handleSearch = useCallback((value: string) => {
  setSearchTerm(value); // UI update imediato
  clearTimeout(searchTimeoutRef.current);
  searchTimeoutRef.current = setTimeout(() => {
    fetchData(value); // API call com debounce
  }, 300);
}, []);
```

### 1.4 — React.memo em componentes de lista
Identifique componentes renderizados em listas/maps:
```bash
grep -rn "\.map(" app/ components/ --include="*.tsx" | grep -v node_modules | head -40
```
Para componentes de card/row renderizados em loop:
- Se o componente é definido no mesmo arquivo, extraia para componente separado
- Aplique `React.memo()` com comparação de props relevantes
- Em tabelas com muitas linhas, considere adicionar `useMemo` para dados computados

### 1.5 — Lazy loading de componentes pesados
Identifique componentes pesados (charts, editors, modals complexos):
```bash
grep -rn "import.*Recharts\|import.*Chart\|import.*Editor\|import.*Calendar\|import.*BracketView\|import.*LiveScoreboard" app/ --include="*.tsx" | grep -v node_modules
```
Para CADA componente pesado:
- Use `dynamic(() => import(...), { ssr: false, loading: () => <Skeleton /> })`
- Especialmente para: gráficos Recharts, BracketView, LiveScoreboard, calendários

### 1.6 — Pagination em TODAS as listagens
Busque listagens sem pagination:
```bash
grep -rn "\.select(" lib/api/ lib/services/ --include="*.ts" | grep -v "\.limit\|\.range\|pagination\|mock" | head -30
```
Para queries que retornam listas sem `.limit()`:
- Adicione `.limit(50)` como padrão (ou `.range(from, to)` se já tem pagination no UI)
- Se o service não recebe parâmetros de pagination, adicione `page?: number, pageSize?: number`

```bash
npx tsc --noEmit
git add -A && git commit -m "fix-100: agente-01-performance-surgeon"
```

---

## AGENTE 02 — UX COMPLETIONIST (Score atual: 73 → Meta: 100)
**Missão:** Toda página com skeleton, empty state, toast, confirmação destrutiva, e acessibilidade.

### 2.1 — Empty States em TODAS as listagens
Busque TODAS as páginas com listagens:
```bash
grep -rn "\.map(" app/ --include="*.tsx" -l | grep -v node_modules | grep -v layout | grep -v loading | grep -v error
```
Para CADA página com listagem, verifique se tem empty state. Se não tem, adicione:
```tsx
{items.length === 0 && !isLoading && (
  <div className="flex flex-col items-center justify-center py-16 gap-4" style={{ color: 'var(--bb-ink-2)' }}>
    <IconeRelevante className="w-16 h-16 opacity-30" />
    <p className="text-lg font-medium">Nenhum [item] encontrado</p>
    <p className="text-sm" style={{ color: 'var(--bb-ink-3)' }}>
      [Mensagem contextual sobre o que fazer]
    </p>
    {/* CTA se aplicável */}
    <Button onClick={handleCreate} variant="outline" className="mt-2">
      <Plus className="w-4 h-4 mr-2" /> Criar primeiro [item]
    </Button>
  </div>
)}
```
Personalize o ícone (Lucide), mensagem e CTA para cada contexto.

### 2.2 — Confirmação antes de TODA ação destrutiva
Busque todas as ações de delete/remove/cancel/desativar:
```bash
grep -rn "delete\|remove\|cancel\|desativar\|excluir\|remover\|arquivar\|revogar\|expulsar\|bloquear" app/ components/ --include="*.tsx" | grep -i "onclick\|handleclick\|handle.*delete\|handle.*remove" | grep -v node_modules | head -40
```
Para CADA ação destrutiva sem confirmação:
- Adicione modal de confirmação ou `window.confirm()` como mínimo
- Pattern preferido (modal):
```tsx
const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

// No botão: onClick={() => setDeleteTarget(item.id)}

// Modal:
{deleteTarget && (
  <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
    <div className="rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl" style={{ background: 'var(--bb-depth-2)' }}>
      <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--bb-ink-1)' }}>Confirmar exclusão</h3>
      <p className="mb-6" style={{ color: 'var(--bb-ink-2)' }}>Esta ação não pode ser desfeita. Deseja continuar?</p>
      <div className="flex gap-3 justify-end">
        <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
        <Button variant="destructive" onClick={() => { handleDelete(deleteTarget); setDeleteTarget(null); }}>
          Excluir
        </Button>
      </div>
    </div>
  </div>
)}
```

### 2.3 — Toast feedback em TODA ação de mutação
Busque todas as funções de create/update/delete em services:
```bash
grep -rn "async function\|export async" lib/api/ lib/services/ --include="*.ts" | grep -iv "get\|list\|fetch\|find\|search\|count\|check\|validate\|isMock\|calculate" | head -40
```
Agora busque nas páginas que chamam esses services se têm toast:
```bash
grep -rn "toast\|showToast\|addToast\|notify" app/ --include="*.tsx" -l | head -30
```
Para CADA página que chama um service de mutação sem toast:
- Adicione toast de sucesso: `toast.success('Item criado com sucesso!')`
- Adicione toast de erro no catch: `toast.error('Erro ao criar item. Tente novamente.')`
- Todas as mensagens em PT-BR

### 2.4 — Skeleton loading que espelha conteúdo
Verifique TODOS os loading.tsx:
```bash
find app -name "loading.tsx" -exec grep -l "animate-spin\|spinner" {} \;
```
Para CADA loading.tsx que usa spinner genérico ao invés de skeleton:
- Substitua por `<Skeleton />` components que espelham o layout real da página
- Pattern:
```tsx
import { Skeleton } from '@/components/ui/Skeleton';

export default function NomeLoading() {
  return (
    <div className="p-6 space-y-6" style={{ background: 'var(--bb-depth-1)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      {/* Cards/Table skeleton que espelha o conteúdo real */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
      {/* Table rows */}
      <div className="space-y-3">
        {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
      </div>
    </div>
  );
}
```

### 2.5 — Acessibilidade completa
```bash
# Botões de ícone sem aria-label
grep -rn "<button" app/ components/ --include="*.tsx" | grep -v "aria-label" | grep -iv "className.*text-\|children\|>" | head -20

# Imagens sem alt
grep -rn "<img\|<Image" app/ components/ --include="*.tsx" | grep -v "alt=" | head -20

# Inputs sem label
grep -rn "<input\|<Input\|<textarea\|<Textarea\|<select\|<Select" app/ components/ --include="*.tsx" | grep -v "aria-label\|id=.*label\|htmlFor\|<label" | head -20
```
Corrija TODOS: adicione `aria-label` em botões de ícone, `alt` em imagens, labels em inputs.

### 2.6 — Breadcrumbs em páginas de detalhe/edição
Para páginas de detalhe/edição (rotas com `[id]` ou `/editar/` ou `/detalhes/`):
```bash
find app -path "*\[*\]*" -name "page.tsx" | head -20
```
Verifique se têm breadcrumb. Se não, adicione no topo:
```tsx
<nav className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--bb-ink-3)' }}>
  <Link href="/[perfil]/[secao]" className="hover:underline">Seção</Link>
  <ChevronRight className="w-4 h-4" />
  <span style={{ color: 'var(--bb-ink-1)' }}>Detalhe do Item</span>
</nav>
```

```bash
npx tsc --noEmit
git add -A && git commit -m "fix-100: agente-02-ux-completionist"
```

---

## AGENTE 03 — SECURITY HARDENER (Score atual: 84 → Meta: 100)
**Missão:** Fechar TODOS os gaps de segurança restantes.

### 3.1 — Auth check em TODAS as API routes
```bash
find app/api -name "route.ts" | while read f; do
  if ! grep -q "auth\|getUser\|getSession\|auth-guard\|x-internal-token\|webhook" "$f"; then
    echo "SEM AUTH: $f"
  fi
done
```
Para CADA route sem auth, adicione verificação de sessão:
```ts
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { cookies: { get(name: string) { return req.cookies.get(name)?.value; }, set() {}, remove() {} } },
);
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
}
```
EXCEÇÃO: routes públicas do Compete (inscrição avulso), webhooks (validam token próprio), e health check.

### 3.2 — Sanitização de inputs
Crie um helper de sanitização se não existe:
```ts
// lib/utils/sanitize.ts
export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/[<>"'&]/g, (char) => {
      const entities: Record<string, string> = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;' };
      return entities[char] || char;
    })
    .trim();
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizeInput(sanitized[key] as string);
    }
  }
  return sanitized;
}
```
Aplique `sanitizeInput()` em TODOS os inputs de formulário que vão para o Supabase:
```bash
grep -rn "\.insert(\|\.update(\|\.upsert(" lib/api/ lib/services/ --include="*.ts" | grep -v mock | grep -v node_modules | head -30
```

### 3.3 — Rate limiting em API routes críticas
Crie helper de rate limiting:
```ts
// lib/utils/rate-limit.ts
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(key: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}
```
Aplique em: login, signup, password reset, API key creation, webhook, email sending.

### 3.4 — Headers de segurança
Verifique se `next.config.js` tem headers de segurança:
```js
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ],
  }];
}
```
Se não tem, adicione. Se tem parcial, complete.

### 3.5 — Middleware de role check robusto
Verifique se o middleware.ts verifica roles corretamente:
```bash
cat middleware.ts
```
Garanta que:
- Cada grupo de rotas (`/(admin)`, `/(professor)`, `/(aluno)`, etc.) verifica o role do JWT
- Redirect para `/acesso-negado` se role não autorizado
- Super Admin pode acessar tudo
- Kids não acessa mensagens
- Alunos não acessam rotas de admin/professor

```bash
npx tsc --noEmit
git add -A && git commit -m "fix-100: agente-03-security-hardener"
```

---

## AGENTE 04 — DATA INTEGRITY MASTER (Score atual: 75 → Meta: 100)
**Missão:** Schema perfeito, índices otimizados, seeds completos.

### 4.1 — Criar migração de índices faltantes
Crie `supabase/migrations/036_performance_indexes.sql`:
```sql
-- Índices de performance para queries frequentes

-- Busca por academia (multi-tenancy)
CREATE INDEX IF NOT EXISTS idx_profiles_academy_id ON profiles(academy_id);
CREATE INDEX IF NOT EXISTS idx_students_academy_id ON students(academy_id);
CREATE INDEX IF NOT EXISTS idx_attendance_academy_id ON attendance(academy_id);
CREATE INDEX IF NOT EXISTS idx_classes_academy_id ON classes(academy_id);
CREATE INDEX IF NOT EXISTS idx_payments_academy_id ON payments(academy_id);

-- Busca por usuário
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- Busca por data (relatórios, histórico)
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(check_in_date);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Busca por email (login, lookup)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Compete module
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_tournament ON tournament_registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_athlete ON tournament_registrations(athlete_id);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_tournament ON tournament_matches(tournament_id);

-- Soft delete filter
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_students_deleted_at ON students(deleted_at) WHERE deleted_at IS NULL;
```

IMPORTANTE: Antes de criar, leia TODAS as migrações existentes para:
1. Usar os nomes de tabelas/colunas REAIS (não os que eu presumi acima)
2. Não criar índices duplicados
3. Adaptar para o schema real

```bash
ls supabase/migrations/
# Leia as migrações relevantes para obter nomes corretos de tabelas e colunas
```

### 4.2 — Trigger de updated_at automático
Verifique se existe uma function trigger para updated_at:
```bash
grep -rn "updated_at\|set_updated_at\|moddatetime\|trigger" supabase/migrations/ | head -20
```
Se não existe, crie na migração:
```sql
-- Function para auto-update de updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplique em todas as tabelas que têm updated_at
-- (liste as tabelas reais após ler as migrações)
```

### 4.3 — Verificar e completar seed
Leia o seed existente:
```bash
cat supabase/seed.sql 2>/dev/null || cat supabase/seeds/*.sql 2>/dev/null || echo "No seed found"
```
Garanta que o seed cobre:
- 1 Super Admin (Gregory)
- 1 Academia com todos os planos
- 1 Admin (dono)
- 2 Professores
- 1 Recepcionista
- 3 Alunos Adultos
- 2 Alunos Teen (com XP/badges)
- 2 Alunos Kids
- 2 Responsáveis (vinculados aos kids)
- 1 Franqueador
- Dados de presença (60 dias)
- Dados de pagamento
- Turmas e horários
- Graduações/faixas

Nomes brasileiros realistas. CPFs válidos no formato (use algoritmo de geração).

### 4.4 — Verificar constraints e foreign keys
```bash
grep -rn "REFERENCES\|FOREIGN KEY\|ON DELETE" supabase/migrations/ | head -40
```
Garanta que:
- Toda FK tem `ON DELETE CASCADE` ou `ON DELETE SET NULL` (conforme lógica de negócio)
- Colunas obrigatórias têm `NOT NULL`
- Enums estão definidos como PostgreSQL enums ou CHECK constraints
- `status` columns têm CHECK constraint com valores válidos

```bash
npx tsc --noEmit
git add -A && git commit -m "fix-100: agente-04-data-integrity-master"
```

---

## AGENTE 05 — ARCHITECTURE PERFECTIONIST (Score atual: 74 → Meta: 100)
**Missão:** Error boundaries, middleware, e estrutura impecável em TODOS os 9 perfis.

### 5.1 — Error boundary em CADA grupo de rota
```bash
find app -maxdepth 3 -name "error.tsx" | sort
find app -maxdepth 3 -type d | grep -E "\(admin\)|\(professor\)|\(aluno\)|\(recepcionista\)|\(teen\)|\(kids\)|\(responsavel\)|\(franqueador\)|\(superadmin\)|\(compete\)" | sort
```
Para CADA grupo que não tem `error.tsx`, crie um:
```tsx
'use client';

export default function [Perfil]Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-6" style={{ color: 'var(--bb-ink-1)' }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--bb-depth-3)' }}>
        <span className="text-2xl">⚠️</span>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Algo deu errado</h2>
        <p className="text-sm mb-1" style={{ color: 'var(--bb-ink-3)' }}>
          {error.message || 'Erro inesperado. Tente novamente.'}
        </p>
        {error.digest && (
          <p className="text-xs font-mono" style={{ color: 'var(--bb-ink-4)' }}>
            Código: {error.digest}
          </p>
        )}
      </div>
      <button
        onClick={reset}
        className="px-6 py-2 rounded-lg font-medium transition-colors"
        style={{ background: 'var(--bb-brand)', color: '#fff' }}
      >
        Tentar novamente
      </button>
    </div>
  );
}
```

### 5.2 — Loading.tsx em CADA grupo de rota
```bash
find app -maxdepth 3 -name "loading.tsx" | sort
```
Para CADA grupo sem `loading.tsx`, crie skeleton loading adequado ao conteúdo daquele perfil.

### 5.3 — Not-found.tsx em CADA grupo de rota
```bash
find app -maxdepth 3 -name "not-found.tsx" | sort
```
Crie para cada grupo que não tem:
```tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-6" style={{ color: 'var(--bb-ink-1)' }}>
      <span className="text-6xl">🔍</span>
      <h2 className="text-xl font-bold">Página não encontrada</h2>
      <p style={{ color: 'var(--bb-ink-3)' }}>O conteúdo que você busca não existe ou foi movido.</p>
      <Link href="/dashboard" className="px-6 py-2 rounded-lg font-medium" style={{ background: 'var(--bb-brand)', color: '#fff' }}>
        Voltar ao Dashboard
      </Link>
    </div>
  );
}
```

### 5.4 — Verifique que CADA perfil tem dashboard dedicado
```bash
for profile in admin professor recepcionista aluno-adulto aluno-teen aluno-kids responsavel franqueador superadmin; do
  echo "=== $profile ==="
  find app -path "*$profile*" -name "page.tsx" | head -5
done
```
Se algum perfil não tem dashboard, crie com:
- Cards de métricas relevantes ao perfil
- Ações rápidas
- Atividade recente
- Skeleton loading

```bash
npx tsc --noEmit
git add -A && git commit -m "fix-100: agente-05-architecture-perfectionist"
```

---

## AGENTE 06 — PRODUCT POLISHER (Score atual: 95 → Meta: 100)
**Missão:** Fechar os 5% restantes — features incompletas e edge cases.

### 6.1 — Export de dados (PDF/CSV)
Verifique se existe funcionalidade de export:
```bash
grep -rn "export\|download\|csv\|pdf\|xlsx" app/ components/ lib/ --include="*.ts" --include="*.tsx" | grep -iv "import\|export default\|export function\|export const\|export type\|export interface\|node_modules" | head -20
```
Se não existe helper de export, crie:
```ts
// lib/utils/export.ts
export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => {
      const val = String(row[h] ?? '');
      return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
    }).join(','))
  ].join('\n');
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
```
Adicione botão de export nas listagens principais: Alunos, Presenças, Pagamentos, Turmas.

### 6.2 — Audit log para ações administrativas
Verifique se existe sistema de audit:
```bash
grep -rn "audit\|log_action\|action_log\|activity_log" lib/ supabase/ --include="*.ts" --include="*.sql" | head -10
```
Se não existe, crie:
```ts
// lib/utils/audit-log.ts
import { createBrowserClient } from '@/lib/supabase/client';

export async function logAction(action: string, details: Record<string, unknown> = {}): Promise<void> {
  try {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action,
      details,
      ip_address: null, // set server-side if needed
      created_at: new Date().toISOString(),
    });
  } catch {
    // Audit failure should never break the app
  }
}
```
E a migração correspondente:
```sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admin can read all" ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "Admin can read own academy" ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can insert own logs" ON audit_logs FOR INSERT WITH CHECK (user_id = auth.uid());
```
Adicione `logAction()` nas ações críticas: criar/deletar aluno, alterar plano, aprovar campeonato, alterar graduação.

### 6.3 — Notificações in-app
Verifique se existe sistema de notificações:
```bash
grep -rn "notification\|notificacao\|notificações\|bell\|Badge\|unread" app/ components/ lib/ --include="*.ts" --include="*.tsx" | grep -v node_modules | head -20
```
Garanta que existe:
- Ícone de sino no header com badge de contagem
- Dropdown/página de notificações
- Marcação de lida/não lida
- Tipos: sistema, academia, pagamento, campeonato

### 6.4 — Verificar fluxos de perfil específicos
Verifique estes fluxos críticos:
1. **Kids**: Confirme que NÃO tem acesso a mensagens/chat
   ```bash
   find app -path "*kids*" -name "*.tsx" | xargs grep -l "message\|chat\|mensag" 2>/dev/null
   ```
   Se encontrar, remova ou bloqueie.

2. **Professor video**: Confirme que é upload-only, sem campo de URL/link
   ```bash
   grep -rn "url\|link\|embed\|youtube\|vimeo" app/ components/ --include="*.tsx" | grep -i "video\|aula" | grep -v node_modules | head -10
   ```

3. **Compete avulso**: Confirme que atleta pode se inscrever sem conta BlackBelt
   ```bash
   grep -rn "avulso\|guest\|sem.conta\|without.account" app/ lib/ --include="*.ts" --include="*.tsx" | head -10
   ```

```bash
npx tsc --noEmit
git add -A && git commit -m "fix-100: agente-06-product-polisher"
```

---

## AGENTE 07 — CSS VARIABLE ENFORCER (Gap transversal)
**Missão:** ZERO cores hardcoded — tudo via CSS variables.

### 7.1 — Buscar e substituir TODAS as cores hardcoded
```bash
# Cores hex hardcoded
grep -rn "#[0-9a-fA-F]\{3,8\}" app/ components/ --include="*.tsx" | grep -v "node_modules\|\.css\|\.svg\|tailwind\|config" | grep -v "var(--" | head -50

# Cores rgb/rgba hardcoded
grep -rn "rgb\|rgba" app/ components/ --include="*.tsx" | grep -v "node_modules\|\.css\|config" | head -20

# Classes Tailwind com cores hardcoded (bg-gray, text-gray, border-gray, etc)
grep -rn "bg-gray\|text-gray\|border-gray\|bg-slate\|text-slate\|bg-white\|bg-black\|text-white\|text-black" app/ components/ --include="*.tsx" | grep -v node_modules | head -50
```

Para CADA ocorrência:
- `bg-white` / `bg-gray-50` → `style={{ background: 'var(--bb-depth-1)' }}`
- `bg-gray-100` → `style={{ background: 'var(--bb-depth-2)' }}`
- `bg-gray-200` → `style={{ background: 'var(--bb-depth-3)' }}`
- `text-gray-900` → `style={{ color: 'var(--bb-ink-1)' }}`
- `text-gray-600` → `style={{ color: 'var(--bb-ink-2)' }}`
- `text-gray-400` → `style={{ color: 'var(--bb-ink-3)' }}`
- `border-gray-200` → `style={{ borderColor: 'var(--bb-depth-3)' }}`
- Brand colors → `var(--bb-brand)`
- Destructive/red → `var(--bb-danger)` (crie se não existe)
- Success/green → `var(--bb-success)` (crie se não existe)

NOTA: Se o componente já tem `className`, use `style` para cores e mantenha `className` para layout/spacing. Exemplo:
```tsx
// ANTES:
<div className="bg-white text-gray-900 border border-gray-200 rounded-xl p-4">

// DEPOIS:
<div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-1)', color: 'var(--bb-ink-1)', borderColor: 'var(--bb-depth-3)', borderWidth: '1px', borderStyle: 'solid' }}>
```

ATENÇÃO: Não toque em:
- Arquivos CSS/config (tailwind.config)
- SVGs (cores inline são ok em SVGs)
- Cores em gradients do brand (podem ficar hardcoded se são brand identity)

```bash
npx tsc --noEmit
git add -A && git commit -m "fix-100: agente-07-css-variable-enforcer"
```

---

## AGENTE 08 — OFFLINE & PWA SPECIALIST (Gap de performance)
**Missão:** Garantir que offline mode e PWA funcionam perfeitamente.

### 8.1 — Verificar Service Worker
```bash
cat public/sw.js 2>/dev/null || cat public/service-worker.js 2>/dev/null || echo "No SW found"
grep -rn "serviceWorker\|service-worker\|sw.js" app/ lib/ public/ --include="*.ts" --include="*.tsx" --include="*.js" | head -10
```
Se existe, verifique que:
- Cache strategies: network-first para API, cache-first para assets estáticos
- Tem fallback offline page
- Atualiza cache corretamente

Se não existe ou está incompleto, crie/complete.

### 8.2 — Verificar IndexedDB sync queue
```bash
grep -rn "IndexedDB\|indexedDB\|idb\|offline.*queue\|sync.*queue\|pendingActions" lib/ --include="*.ts" | head -10
```
Verifique que:
- Ações feitas offline são salvas em IndexedDB
- Quando volta online, sincroniza automaticamente
- Conflitos são tratados (last-write-wins ou merge)

### 8.3 — Verificar PWA manifest
```bash
cat public/manifest.json 2>/dev/null || cat app/manifest.ts 2>/dev/null
```
Garanta que tem:
- `name`, `short_name`, `description` em PT-BR
- `theme_color` e `background_color` corretos
- Ícones em todos os tamanhos (192x192, 512x512)
- `display: "standalone"`
- `start_url: "/"`
- `scope: "/"`

### 8.4 — Verificar install banner
```bash
grep -rn "beforeinstallprompt\|install.*banner\|PWA.*install\|InstallBanner\|InstallPrompt" app/ components/ lib/ --include="*.ts" --include="*.tsx" | head -10
```
Se não existe, crie componente de install banner.

```bash
npx tsc --noEmit
git add -A && git commit -m "fix-100: agente-08-offline-pwa-specialist"
```

---

## AGENTE 09 — ERROR HANDLING PERFECTIONIST (Gap transversal)
**Missão:** handleServiceError em CADA catch, error boundaries COMPLETOS.

### 9.1 — Verificar TODOS os catch blocks
```bash
grep -rn "catch" lib/api/ lib/services/ --include="*.ts" | grep -v "node_modules\|mock\|\.d\.ts" | head -50
```
Para CADA catch block, verifique se chama `handleServiceError(error)`:
```bash
grep -rn "catch.*{" lib/api/ lib/services/ --include="*.ts" -A2 | grep -v "handleServiceError" | grep "catch" | head -20
```
Corrija TODOS que não chamam `handleServiceError`.

### 9.2 — Verificar try/catch em chamadas de service nas páginas
```bash
grep -rn "await.*service\|await.*Service\|await.*api\|await.*Api" app/ --include="*.tsx" | grep -v "node_modules" | head -30
```
Para chamadas de service sem try/catch:
- Envolva em try/catch
- Catch deve ter toast de erro PT-BR + `console.error`

```bash
npx tsc --noEmit
git add -A && git commit -m "fix-100: agente-09-error-handling-perfectionist"
```

---

## AGENTE 10 — MOBILE & RESPONSIVE GUARDIAN (Gap de UX)
**Missão:** Garantir experiência perfeita em mobile.

### 10.1 — Verificar tabelas em mobile
```bash
grep -rn "<table\|<Table\|DataTable\|<thead\|<tbody" app/ components/ --include="*.tsx" -l | head -20
```
Para CADA tabela:
- Em telas <768px, deve transformar em cards empilhados OU ter scroll horizontal com indicador
- Pattern responsivo:
```tsx
{/* Desktop: table */}
<div className="hidden md:block">
  <table>...</table>
</div>
{/* Mobile: cards */}
<div className="md:hidden space-y-3">
  {items.map(item => (
    <div key={item.id} className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)' }}>
      {/* Card content */}
    </div>
  ))}
</div>
```

### 10.2 — Verificar que sidebar colapsa em mobile
```bash
grep -rn "Sidebar\|sidebar\|SideNav\|sidenav\|MobileNav\|mobile.*menu\|hamburger" app/ components/ --include="*.tsx" | head -20
```
Garanta que:
- Sidebar colapsa em mobile (<768px)
- Tem botão hamburger para abrir
- Overlay escuro quando aberto
- Fecha ao clicar fora ou em um item

### 10.3 — Verificar forms em mobile
```bash
grep -rn "<form\|<Form\|onSubmit" app/ --include="*.tsx" -l | head -20
```
Garanta que:
- Inputs são `w-full` em mobile
- Botões de submit são grandes o suficiente para touch (min 44px height)
- Grids de form colapsam para 1 coluna em mobile

### 10.4 — Touch targets mínimos
```bash
grep -rn "w-6 h-6\|w-5 h-5\|w-4 h-4\|p-1\b" app/ components/ --include="*.tsx" | grep -i "button\|onClick\|link\|href" | head -20
```
Para botões/links interativos menores que 44x44px, adicione padding:
```tsx
className="min-w-[44px] min-h-[44px] flex items-center justify-center"
```

```bash
npx tsc --noEmit
git add -A && git commit -m "fix-100: agente-10-mobile-responsive-guardian"
```

---

## AGENTE 11 — I18N & COPY REVIEWER (Gap de produto)
**Missão:** Tudo em PT-BR perfeito, sem inglês perdido na UI.

### 11.1 — Encontrar texto em inglês na UI
```bash
# Busca common English words that shouldn't be in PT-BR UI
grep -rn '"Submit\|"Cancel\|"Delete\|"Save\|"Edit\|"Create\|"Update\|"Loading\|"Error\|"Success\|"Warning\|"Search\|"Filter\|"Close\|"Open\|"Back\|"Next\|"Previous\|"Yes\|"No\b\|"Confirm\|"Retry\|"Not found\|"Page\|"of \|"Items\|"Total\|"Actions\|"Status\|"Name\|"Email\|"Password\|"Settings\|"Profile\|"Dashboard\|"Home\|"Logout\|"Sign' app/ components/ --include="*.tsx" | grep -v "node_modules\|\.test\.\|aria-\|placeholder.*@\|console\.\|import\|export\|className\|interface\|type \|const \|function " | head -60
```
Para CADA texto em inglês na UI visível:
- Traduza para PT-BR natural
- "Submit" → "Enviar"
- "Cancel" → "Cancelar"
- "Delete" → "Excluir"
- "Save" → "Salvar"
- "Edit" → "Editar"
- "Create" → "Criar" / "Novo"
- "Search" → "Buscar"
- "Loading" → "Carregando..."
- "Not found" → "Não encontrado"
- "Settings" → "Configurações"
- "Dashboard" → "Painel" (ou manter Dashboard se é termo de domínio)
- "Logout" → "Sair"

EXCEÇÃO: termos técnicos que são usados em inglês no Brasil (Dashboard, Login, Check-in, etc.)

### 11.2 — Consistência de mensagens de toast
```bash
grep -rn "toast\.\|showToast\|addToast" app/ components/ --include="*.tsx" | head -40
```
Garanta que:
- Sucesso: "✓ [Ação] realizada com sucesso!" ou "[Item] [ação] com sucesso!"
- Erro: "Erro ao [ação]. Tente novamente." ou "Não foi possível [ação]."
- Sempre PT-BR, sem mistura de idiomas

```bash
npx tsc --noEmit
git add -A && git commit -m "fix-100: agente-11-i18n-copy-reviewer"
```

---

## AGENTE 12 — FINAL VALIDATOR (Consolidação)
**Missão:** Build limpo, verificação cruzada, relatório final 100/100.

### 12.1 — Verificação final completa
```bash
# TypeScript
npx tsc --noEmit 2>&1

# Build
pnpm build 2>&1 | tail -30

# Lint
pnpm lint 2>&1 | tail -30

# Verificar se não ficou nenhum select('*') desnecessário
grep -rn "select('\*')" lib/ --include="*.ts" | grep -v "all columns needed" | wc -l

# Verificar cores hardcoded restantes
grep -rn "#[0-9a-fA-F]\{6\}" app/ components/ --include="*.tsx" | grep -v "node_modules\|\.css\|config\|svg\|var(--" | wc -l

# Verificar inglês na UI
grep -rn '"Loading\.\.\.\|"Error\|"Submit\|"Cancel\|"Delete"' app/ components/ --include="*.tsx" | grep -v "node_modules\|console\|import\|aria-" | wc -l

# Verificar catch sem handleServiceError
grep -rn "catch" lib/api/ lib/services/ --include="*.ts" -A2 | grep -v "handleServiceError\|mock\|node_modules" | grep "catch" | wc -l
```

### 12.2 — Se QUALQUER verificação acima retorna número > 0, corrija antes de prosseguir

### 12.3 — Gerar relatório final
Crie `/docs/review/RELATORIO_FINAL_100.md`:
```markdown
# RELATÓRIO FINAL — OPERAÇÃO 100/100
## BlackBelt v2 — Enterprise Review Fix

**Data:** [data atual]
**Versão:** v3.3.0-100-score

### Scores Finais
| Agente | Área | Score Anterior | Score Final |
|--------|------|:--------------:|:-----------:|
| 01 Performance | Performance | 62 | 100 |
| 02 UX | Experiência | 73 | 100 |
| 03 Security | Segurança | 84 | 100 |
| 04 Data | Dados | 75 | 100 |
| 05 Architecture | Arquitetura | 74 | 100 |
| 06 Product | Produto | 95 | 100 |
| 07 CSS Variables | Visual | ~70 | 100 |
| 08 PWA/Offline | Offline | ~65 | 100 |
| 09 Error Handling | Robustez | ~80 | 100 |
| 10 Mobile | Responsivo | ~75 | 100 |
| 11 i18n/Copy | Idioma | ~85 | 100 |
| 12 Final | Integração | - | 100 |

### Métricas
- Total de arquivos modificados: [X]
- Total de erros corrigidos: [X]
- select('*') eliminados: [X]
- Cores hardcoded removidas: [X]
- Empty states adicionados: [X]
- aria-labels adicionados: [X]
- Textos traduzidos para PT-BR: [X]
- Error boundaries criados: [X]
- Índices de banco criados: [X]
- Vulnerabilidades corrigidas: [X]

### Status Final
- [ ] TypeScript: 0 erros
- [ ] Build: limpo
- [ ] Lint: warnings mínimos
- [ ] Todas as cores via CSS variables
- [ ] Todas as ações com toast PT-BR
- [ ] Todas as listagens com empty state
- [ ] Todas as ações destrutivas com confirmação
- [ ] Todas as API routes com auth check
- [ ] Todos os catch com handleServiceError
- [ ] Todos os perfis com dashboard, loading, error, not-found
```

### 12.4 — Commit e tag final
```bash
git add -A && git commit -m "fix-100: agente-12-final-validator-100-score"
git tag -a v3.3.0-100-score -m "Operation 100/100 - All dimensions maximized"
git log --oneline -15
echo "========================================="
echo "  OPERAÇÃO 100/100 CONCLUÍDA"
echo "  Tag: v3.3.0-100-score"
echo "========================================="
```

---

## EXECUÇÃO

Comece AGORA pelo Agente 01 (Performance Surgeon). Execute cada agente completamente antes de avançar. Se o contexto ficar longo, PRIORIZE CORREÇÕES sobre relatórios — o código é o que importa.

**Lembrete final:**
- Leia `/docs/review/` para entender os gaps REAIS antes de corrigir
- NUNCA delete blocos isMock()
- handleServiceError em todo catch
- CSS variables SEMPRE — zero cores hardcoded
- Toast PT-BR em TODA ação
- Kids: sem mensagens, UI playful
- Professor: upload only, sem link pasting
- Compete: avulso sem conta BlackBelt
- Super Admin aprova campeonatos antes de publicar

EXECUTE AGENTE 01 AGORA.

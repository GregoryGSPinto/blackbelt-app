# BLACKBELT APP — RESPONSIVIDADE PREMIUM + FLUXO DE NAVEGAÇÃO
## Restaurar responsividade + Landing first (browser) / Login first (nativo)
## Data: 03/04/2026

---

> **INSTRUÇÕES DE EXECUÇÃO:**
>
> 1. Este prompt tem 3 BLOCOS sequenciais.
> 2. Cada bloco termina com: `pnpm typecheck && pnpm build` → commit → push
> 3. REGRAS: NUNCA delete isMock(). CSS var(--bb-*). Toast PT-BR. Mobile-first.
>
> **DIRETÓRIO:** `cd ~/Projetos/blackbelt-app`
> **DEPLOY:** `https://blackbelts.com.br`

---

## BLOCO 01 — DIAGNOSTICAR E RESTAURAR RESPONSIVIDADE
### Encontrar o commit que quebrou e restaurar o CSS/layout

**PASSO 1: Identificar quando a responsividade quebrou**

```bash
echo "=== ÚLTIMOS 30 COMMITS ==="
git log --oneline -30

echo ""
echo "=== COMMITS QUE MEXERAM EM CSS/LAYOUT/RESPONSIVIDADE ==="
git log --oneline --all -- "*.css" "styles/" "tailwind.config.ts" | head -20

echo ""
echo "=== COMMITS QUE MEXERAM NA TELA DE LOGIN ==="
git log --oneline --all -- "*login*" "*Login*" | head -15

echo ""
echo "=== COMMITS QUE MEXERAM EM SHELLS/LAYOUTS ==="
git log --oneline --all -- "components/shell/*" "app/layout.tsx" "app/*/layout.tsx" | head -15

echo ""
echo "=== COMMITS QUE MEXERAM EM TAILWIND CONFIG ==="
git log --oneline --all -- "tailwind.config.ts" "postcss.config.mjs" | head -10

echo ""
echo "=== VERIFICAR BREAKPOINTS TAILWIND ==="
cat tailwind.config.ts | grep -A 20 "screens\|breakpoint"

echo ""
echo "=== VERIFICAR CSS GLOBAL ==="
cat styles/globals.css 2>/dev/null | head -60
find styles -type f | head -10
```

**PASSO 2: Verificar o estado atual do login**

```bash
echo "=== TELA DE LOGIN ==="
find app -path "*login*" -name "page.tsx" | head -5
LOGINPAGE=$(find app -path "*login*" -name "page.tsx" | head -1)
echo "Arquivo: $LOGINPAGE"
echo ""
cat "$LOGINPAGE" | head -100

echo ""
echo "=== COMPONENTES DE LOGIN ==="
grep -rn "import" "$LOGINPAGE" | head -20

echo ""
echo "=== VERIFICAR GRID/FLEX DO LOGIN ==="
grep -n "grid\|flex\|lg:\|md:\|sm:\|xl:\|container\|max-w\|w-full\|w-screen\|min-h\|h-screen" "$LOGINPAGE" | head -30
```

**PASSO 3: Comparar com versão anterior**

```bash
# Encontrar o último commit ANTES da quebra de responsividade
# Verificar como estava a tela de login nos commits anteriores
echo "=== DIFF DO LOGIN NOS ÚLTIMOS 10 COMMITS ==="
LOGINPAGE=$(find app -path "*login*" -name "page.tsx" | head -1)
git log --oneline -10 -- "$LOGINPAGE"

echo ""
echo "=== MOSTRAR VERSÃO DO COMMIT ANTERIOR ==="
PREV_COMMIT=$(git log --oneline -2 -- "$LOGINPAGE" | tail -1 | cut -d' ' -f1)
if [ -n "$PREV_COMMIT" ]; then
  echo "Commit anterior: $PREV_COMMIT"
  echo ""
  echo "=== DIFF ==="
  git diff "$PREV_COMMIT" HEAD -- "$LOGINPAGE" | head -100
fi
```

**PASSO 4: Corrigir a responsividade da tela de login**

A tela de login do BlackBelt tem um layout split-screen: lado esquerdo com preview do dashboard (desktop only), lado direito com formulário. No screenshot, ambos estão aparecendo lado a lado de forma espremida.

**O layout correto deve ser:**
- **Mobile (< 1024px):** Formulário de login ocupa tela inteira. Preview do dashboard ESCONDIDO.
- **Desktop (>= 1024px):** Split 40/60 — preview à esquerda, formulário à direita.

```tsx
// PADRÃO CORRETO de responsividade para tela de login:

// Container principal
<div className="flex min-h-screen">
  
  {/* LADO ESQUERDO — Preview (ESCONDIDO no mobile) */}
  <div className="hidden lg:flex lg:w-[40%] xl:w-[45%] flex-col items-center justify-center bg-[var(--bb-depth-1)] p-8">
    {/* Dashboard preview card */}
    <div className="w-full max-w-sm rounded-2xl bg-[var(--bb-depth-0)] p-6 shadow-2xl">
      {/* ... conteúdo do preview ... */}
    </div>
  </div>

  {/* LADO DIREITO — Formulário (SEMPRE visível) */}
  <div className="flex w-full lg:w-[60%] xl:w-[55%] flex-col items-center justify-center px-4 sm:px-8 lg:px-12">
    <div className="w-full max-w-md">
      {/* Logo */}
      {/* Título "Entrar" */}
      {/* Botões Google/Apple */}
      {/* Formulário email/senha */}
      {/* Links rodapé */}
    </div>
  </div>

</div>
```

**Verificar e corrigir TODOS os elementos do login:**

```bash
# Encontrar classes que podem estar quebrando responsividade
LOGINPAGE=$(find app -path "*login*" -name "page.tsx" | head -1)

# Verificar se há larguras fixas (width em px)
grep -n "w-\[.*px\]\|width:.*px\|min-width:.*px\|max-width:.*px" "$LOGINPAGE" | head -10

# Verificar se há grid sem responsividade
grep -n "grid-cols-\|grid " "$LOGINPAGE" | grep -v "sm:\|md:\|lg:" | head -10

# Verificar se há flex sem wrap
grep -n "flex " "$LOGINPAGE" | grep -v "flex-col\|flex-wrap\|flex-1" | head -10
```

**Corrigir os problemas encontrados:**

1. **Botões Google/Apple lado a lado espremidos no mobile:**
```tsx
// ERRADO — sempre lado a lado
<div className="flex gap-4">
  <button className="flex-1">Google</button>
  <button className="flex-1">Apple</button>
</div>

// CORRETO — empilha no mobile, lado a lado no desktop
<div className="flex flex-col sm:flex-row gap-3">
  <button className="flex-1 h-12 rounded-xl border border-[var(--bb-depth-2)] ...">
    Google
  </button>
  <button className="flex-1 h-12 rounded-xl border border-[var(--bb-depth-2)] ...">
    Apple
  </button>
</div>
```

2. **Formulário sem padding lateral no mobile:**
```tsx
// Garantir padding em telas pequenas
<div className="w-full max-w-md px-4 sm:px-0">
```

3. **Preview do dashboard aparecendo no mobile:**
```tsx
// DEVE estar hidden no mobile
<div className="hidden lg:flex ...">
```

4. **Inputs e botões com tamanho adequado para touch (44px mínimo):**
```tsx
<input className="w-full h-12 px-4 rounded-xl border ..." />
<button className="w-full h-12 rounded-xl ..." />
```

5. **Texto e espaçamento:**
```tsx
// Título
<h1 className="text-2xl sm:text-3xl font-bold">Entrar</h1>
// Subtítulo
<p className="text-sm sm:text-base text-[var(--bb-ink-3)]">
  Entre para acessar sua academia com segurança.
</p>
```

**PASSO 5: Auditar responsividade de TODAS as shells e layouts**

```bash
echo "=== SHELLS — verificar responsividade ==="
find components/shell -name "*.tsx" | while read f; do
  echo ""
  echo "--- $f ---"
  # Verificar se tem breakpoints responsivos
  RESPONSIVE=$(grep -c "sm:\|md:\|lg:\|xl:" "$f")
  FIXED_WIDTH=$(grep -c "w-\[.*px\]" "$f")
  echo "  Breakpoints responsivos: $RESPONSIVE"
  echo "  Larguras fixas (px): $FIXED_WIDTH"
  
  # Verificar sidebar
  grep -n "sidebar\|Sidebar\|w-64\|w-72\|w-80\|w-\[" "$f" | head -5
done

echo ""
echo "=== LAYOUTS — verificar ==="
find app -name "layout.tsx" -maxdepth 3 | while read f; do
  echo ""
  echo "--- $f ---"
  RESPONSIVE=$(grep -c "sm:\|md:\|lg:\|xl:" "$f")
  echo "  Breakpoints: $RESPONSIVE"
done
```

**Corrigir qualquer shell com problema:**
- Sidebar: `hidden lg:block` no mobile, menu hamburger para abrir
- Main content: `w-full` sempre, `lg:ml-64` quando sidebar é fixa
- Bottom nav: `fixed bottom-0 lg:hidden` — só aparece no mobile
- Tabelas: `overflow-x-auto` para scroll horizontal no mobile
- Cards: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "fix: responsividade premium — login split-screen + shells mobile-first"
git push origin main
```

---

## BLOCO 02 — FLUXO DE NAVEGAÇÃO: LANDING FIRST vs LOGIN FIRST
### Browser abre landing page / App nativo abre login direto

**Contexto:**
- No BROWSER: usuário acessa `blackbelts.com.br` → vê a landing page → clica "Entrar" → vai pro login
- No APP NATIVO (iOS/Android via Capacitor): abre direto no login → sem landing page
- A landing page JÁ EXISTE em `/` e está funcionando

**Diagnóstico:**
```bash
echo "=== ROTA RAIZ ==="
# Verificar o que a rota / renderiza
find app -maxdepth 2 -name "page.tsx" | head -5
cat app/page.tsx 2>/dev/null | head -30

echo ""
echo "=== MIDDLEWARE — como trata a rota / ==="
grep -n "pathname.*===.*'/'" middleware.ts | head -5
grep -n "redirect.*login\|redirect.*dashboard" middleware.ts | head -10

echo ""
echo "=== VERIFICAR SE JÁ EXISTE DETECÇÃO DE PLATAFORMA ==="
grep -rn "isNative\|isNativeBuild\|NEXT_PUBLIC_CAPACITOR\|NEXT_PUBLIC_PLATFORM" lib/ middleware.ts --include="*.ts" --include="*.tsx" | head -10

echo ""
echo "=== VERIFICAR COMO O LOGIN REDIRECIONA APÓS AUTH ==="
grep -rn "selecionar-perfil\|dashboard\|ROLE_DASHBOARD" middleware.ts app/ --include="*.ts" --include="*.tsx" | head -15
```

**Implementação:**

O middleware.ts já tem a lógica de rotas públicas e redirecionamento. Precisamos adicionar:

1. **No middleware.ts — rota `/` no build nativo vai pro login:**

Localizar no middleware.ts a função `middleware()` ou `handleMockAuth()`/`handleSupabaseAuth()` e adicionar ANTES da lógica de auth:

```typescript
// === NAVEGAÇÃO: Landing (browser) vs Login (nativo) ===
const isNativeBuildFlag = 
  process.env.NEXT_PUBLIC_CAPACITOR === 'true' || 
  process.env.NEXT_PUBLIC_PLATFORM === 'mobile';

// No app nativo: rota raiz vai direto pro login
if (isNativeBuildFlag && pathname === '/') {
  return NextResponse.redirect(new URL('/login', request.url));
}
```

2. **Na landing page (`app/page.tsx` ou `app/(public)/page.tsx`):**

Adicionar detecção client-side como fallback (caso a env var não esteja setada):

```tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// No topo do componente da landing:
useEffect(() => {
  // Detecção client-side: se está no Capacitor, redireciona pro login
  const win = window as Record<string, unknown>;
  if (win.Capacitor && typeof (win.Capacitor as Record<string, unknown>).isNativePlatform === 'function') {
    if ((win.Capacitor as { isNativePlatform: () => boolean }).isNativePlatform()) {
      router.replace('/login');
    }
  }
}, []);
```

3. **Na tela de login — link "Voltar para a página inicial":**

```bash
# Verificar se existe o link de volta
LOGINPAGE=$(find app -path "*login*" -name "page.tsx" | head -1)
grep -n "Voltar\|pagina inicial\|landing\|home" "$LOGINPAGE" | head -5
```

O link "← Voltar para a página inicial" deve:
- **No browser:** Funcionar normalmente (leva pra landing `/`)
- **No nativo:** Estar ESCONDIDO (não tem landing no nativo)

```tsx
import { useIsNative } from '@/lib/hooks/useIsNative';

// Dentro do componente de login:
const isNative = useIsNative();

// No JSX:
{!isNative && (
  <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--bb-ink-3)] hover:text-[var(--bb-ink-1)] mb-8">
    ← Voltar para a página inicial
  </Link>
)}
```

4. **Garantir que a landing page NÃO aparece nas rotas bloqueadas do nativo:**

No middleware, confirmar que as rotas de landing/marketing estão na lista de bloqueio nativo:

```typescript
// Rotas que NÃO devem aparecer no app nativo
const NATIVE_BLOCKED_PATHS = ['/', '/precos', '/planos', '/pricing', '/landing', '/comecar'];

if (isNativeBuildFlag && NATIVE_BLOCKED_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
  return NextResponse.redirect(new URL('/login', request.url));
}
```

**Verificação:**
```bash
# Confirmar que a landing page carrega no browser
echo "Testar manualmente: https://blackbelts.com.br/ → deve mostrar landing"
echo "Testar manualmente: https://blackbelts.com.br/login → deve mostrar login"

pnpm typecheck && pnpm build
```

```bash
git add -A && git commit -m "feat: navegação — browser abre landing, app nativo abre login direto"
git push origin main
```

---

## BLOCO 03 — POLISH RESPONSIVO GLOBAL + VERIFICAÇÃO

**Auditar responsividade das páginas mais visitadas:**

```bash
echo "=== PÁGINAS CRÍTICAS PARA RESPONSIVIDADE ==="

# Dashboard admin
ADMIN_DASH=$(find app -path "*admin*" -name "page.tsx" -maxdepth 4 | head -1)
echo "Admin dashboard: $ADMIN_DASH"
[ -n "$ADMIN_DASH" ] && grep -c "sm:\|md:\|lg:\|xl:" "$ADMIN_DASH"

# Dashboard aluno
ALUNO_DASH=$(find app -path "*dashboard*" -name "page.tsx" -maxdepth 3 | head -1)
echo "Aluno dashboard: $ALUNO_DASH"
[ -n "$ALUNO_DASH" ] && grep -c "sm:\|md:\|lg:\|xl:" "$ALUNO_DASH"

# Professor
PROF_DASH=$(find app -path "*professor*" -name "page.tsx" -maxdepth 3 | head -1)
echo "Professor dashboard: $PROF_DASH"
[ -n "$PROF_DASH" ] && grep -c "sm:\|md:\|lg:\|xl:" "$PROF_DASH"

# Lista de alunos
ALUNOS_LIST=$(find app -path "*aluno*" -name "page.tsx" | grep -i "list\|index" | head -1)
[ -z "$ALUNOS_LIST" ] && ALUNOS_LIST=$(find app -path "*admin*aluno*" -name "page.tsx" | head -1)
echo "Lista alunos: $ALUNOS_LIST"
[ -n "$ALUNOS_LIST" ] && grep -c "sm:\|md:\|lg:\|xl:" "$ALUNOS_LIST"
```

**Garantir padrões responsivos em componentes compartilhados:**

```bash
echo "=== COMPONENTES UI COMPARTILHADOS ==="

# Verificar tabelas
find components -name "*Table*" -o -name "*table*" | head -5
# Todas tabelas devem ter: <div className="overflow-x-auto">

# Verificar modais
find components -name "*Modal*" -o -name "*modal*" -o -name "*Dialog*" | head -5
# Modais: max-w-lg no mobile, max-w-2xl no desktop

# Verificar cards
find components -name "*Card*" -o -name "*card*" | head -5
# Cards: w-full em grid responsivo

# Verificar forms
find components -name "*Form*" -o -name "*form*" | head -5
# Forms: inputs h-12, w-full, px-4
```

**Checklist de responsividade — corrigir o que não estiver certo:**

```bash
echo "=== CHECKLIST RESPONSIVIDADE ==="

# 1. Overflow-x em tabelas
TABLES_NO_OVERFLOW=$(grep -rn "<table\|<Table" components/ app/ --include="*.tsx" -l | while read f; do
  if ! grep -q "overflow-x-auto\|overflow-auto\|overflow-x-scroll" "$f"; then
    echo "$f"
  fi
done | wc -l | tr -d ' ')
echo "Tabelas sem overflow-x-auto: $TABLES_NO_OVERFLOW"

# 2. Inputs com tamanho mínimo touch (h-10 ou h-12)
SMALL_INPUTS=$(grep -rn "<input\|<Input\|<select\|<Select" components/ui/ --include="*.tsx" | grep -v "h-10\|h-11\|h-12\|h-14" | wc -l | tr -d ' ')
echo "Inputs possivelmente pequenos: $SMALL_INPUTS"

# 3. Texto que pode estourar container
TEXT_OVERFLOW=$(grep -rn "truncate\|overflow-hidden\|text-ellipsis\|line-clamp" components/ --include="*.tsx" | wc -l | tr -d ' ')
echo "Elementos com truncate/overflow: $TEXT_OVERFLOW (quanto mais, melhor)"

# 4. Imagens sem responsive
IMGS_NO_RESP=$(grep -rn "<img\|<Image" app/ components/ --include="*.tsx" | grep -v "w-full\|max-w\|object-\|fill\|responsive" | wc -l | tr -d ' ')
echo "Imagens possivelmente não-responsivas: $IMGS_NO_RESP"
```

**Aplicar correções:**

1. **Tabelas sem overflow:** Wrappear com `<div className="overflow-x-auto">`
2. **Inputs pequenos:** Garantir `h-12` mínimo em todos os inputs e selects
3. **Textos longos:** Adicionar `truncate` ou `line-clamp-2` onde necessário
4. **Grids não responsivos:** Garantir `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
5. **Padding da main content:** Garantir `p-4 sm:p-6 lg:p-8` em todas as páginas

**Verificação final:**
```bash
pnpm typecheck && pnpm build
```

```bash
git add -A && git commit -m "fix: polish responsivo global — tabelas, inputs, grids, overflow"
git push origin main

git tag -a v5.4.0-responsive -m "BlackBelt App v5.4.0 — Responsividade Premium
- fix: login split-screen restaurado (mobile-first)
- feat: browser abre landing / nativo abre login
- fix: shells e dashboards mobile-first
- fix: tabelas com overflow-x-auto
- fix: inputs touch-friendly (h-12 mínimo)
- fix: grids responsivos em todas as páginas"

git push origin v5.4.0-responsive
```

---

## COMANDO DE RETOMADA

```
Retome a execução do prompt RESPONSIVIDADE PREMIUM do BlackBelt App. Verifique o último commit com `git log --oneline -5`. O objetivo é: responsividade perfeita em todas as telas (mobile-first), login com layout split-screen correto, e navegação browser→landing / nativo→login. NUNCA delete isMock(). CSS var(--bb-*).
```

---

## FIM DO PROMPT

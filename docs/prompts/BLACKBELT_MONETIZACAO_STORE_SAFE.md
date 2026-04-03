# BLACKBELT APP — MONETIZAÇÃO STORE-SAFE
## Separação Nativo vs Web: Zero Preços no App = Zero Rejeição
## Data: 02/04/2026 | Repo: GregoryGSPinto/blackbelt-app

---

> **INSTRUÇÕES DE EXECUÇÃO:**
>
> 1. Este prompt tem 5 BLOCOS sequenciais. Execute UM por vez.
> 2. Cada bloco termina com: `pnpm typecheck && pnpm build` → commit → push
> 3. REGRAS INVIOLÁVEIS:
>    - NUNCA delete blocos `isMock()` — sempre manter mock + real
>    - `handleServiceError(error)` em todo catch block
>    - CSS: usar `var(--bb-*)` — ZERO cores hardcoded
>    - Toast PT-BR em toda ação
>    - TypeScript strict: ZERO `any`
>
> **CONTEXTO LEGAL:**
> A Apple App Store Review Guideline 3.1.3(a) permite que apps B2B SaaS
> cobrem FORA do app (pelo site) sem pagar comissão, desde que:
> - Nenhum preço apareça dentro do app nativo iOS/Android
> - Nenhum botão de compra/upgrade/assinatura dentro do app nativo
> - O cadastro com pagamento aconteça via browser (site)
> - O app nativo abre direto no login, sem landing page com preços
> - Referências ao site sejam discretas (texto, não botão CTA gigante)
>
> Exemplos aprovados: Slack, Salesforce, Trello, Basecamp, Monday.com
> Documento de referência: `docs/APPLE_MONETIZATION_JUSTIFICATION.md`
>
> **DIRETÓRIO:** `cd ~/Projetos/blackbelt-app`
> **DEPLOY:** `https://blackbeltv2.vercel.app`

---

## BLOCO 01 — DETECÇÃO DE PLATAFORMA
### Criar utility global para saber se é nativo (Capacitor) ou browser

**Diagnóstico primeiro:**
```bash
# Verificar se já existe detecção de plataforma
grep -rn "isNative\|isNativePlatform\|isPlatform\|Capacitor\.isNative\|NEXT_PUBLIC_PLATFORM\|NEXT_PUBLIC_CAPACITOR\|isCapacitor" lib/ app/ components/ --include="*.ts" --include="*.tsx" | head -20

# Verificar Capacitor config
cat capacitor.config.ts

# Verificar se já existe variável de ambiente para plataforma
grep -rn "PLATFORM\|CAPACITOR" .env.example | head -10

# Verificar como o build mobile é feito
grep "mobile\|CAPACITOR\|PLATFORM" package.json | head -10
```

**Implementação — criar/atualizar utility de plataforma:**

Arquivo: `lib/platform.ts` (criar se não existe, ou atualizar se existe)

```typescript
// lib/platform.ts
// Detecção de plataforma — usado para esconder preços no app nativo

/**
 * Retorna true se o app está rodando dentro do Capacitor (iOS/Android nativo).
 * 
 * Lógica de detecção (em ordem de prioridade):
 * 1. Variável de ambiente NEXT_PUBLIC_CAPACITOR=true (setada no build mobile)
 * 2. Variável de ambiente NEXT_PUBLIC_PLATFORM=mobile (setada no build mobile)
 * 3. Detecção em runtime via Capacitor.isNativePlatform() (client-side only)
 * 4. User-agent contendo "Capacitor" (fallback)
 */

// Server-side safe (funciona no middleware e em server components)
export function isNativeBuild(): boolean {
  return (
    process.env.NEXT_PUBLIC_CAPACITOR === 'true' ||
    process.env.NEXT_PUBLIC_PLATFORM === 'mobile'
  );
}

// Client-side only — detecção em runtime
export function isNativeApp(): boolean {
  // Build-time flag (mais confiável)
  if (isNativeBuild()) return true;

  // Runtime detection (client-side only)
  if (typeof window === 'undefined') return false;

  // Capacitor injeta window.Capacitor no webview
  const win = window as Record<string, unknown>;
  if (win.Capacitor && typeof (win.Capacitor as Record<string, unknown>).isNativePlatform === 'function') {
    return (win.Capacitor as { isNativePlatform: () => boolean }).isNativePlatform();
  }

  // Fallback: user-agent
  if (typeof navigator !== 'undefined' && /Capacitor/i.test(navigator.userAgent)) {
    return true;
  }

  return false;
}

// Retorna a plataforma específica
export function getNativePlatform(): 'ios' | 'android' | 'web' {
  if (typeof window === 'undefined') return 'web';

  const win = window as Record<string, unknown>;
  if (win.Capacitor) {
    const cap = win.Capacitor as { getPlatform?: () => string };
    if (cap.getPlatform) {
      const platform = cap.getPlatform();
      if (platform === 'ios') return 'ios';
      if (platform === 'android') return 'android';
    }
  }

  return 'web';
}

// Hook React para componentes client-side
// Usar em componentes que precisam esconder preços no nativo
export function useIsNative(): boolean {
  // Em server-side render, usa build flag
  if (typeof window === 'undefined') return isNativeBuild();
  return isNativeApp();
}
```

**Criar hook React separado para uso em componentes:**

Arquivo: `lib/hooks/useIsNative.ts` (ou adicionar ao hooks existente)

```typescript
'use client';
import { useState, useEffect } from 'react';
import { isNativeApp, isNativeBuild } from '@/lib/platform';

/**
 * Hook que retorna true se o app está rodando no Capacitor (nativo).
 * Seguro para SSR — retorna o valor do build flag no server,
 * e faz detecção real no client.
 */
export function useIsNative(): boolean {
  const [native, setNative] = useState(isNativeBuild());

  useEffect(() => {
    setNative(isNativeApp());
  }, []);

  return native;
}
```

**Verificação:**
```bash
# Confirmar que o arquivo existe e exporta corretamente
cat lib/platform.ts | head -5
# Confirmar que o hook existe
cat lib/hooks/useIsNative.ts 2>/dev/null || echo "Verificar path correto dos hooks"

pnpm typecheck && pnpm build
```

```bash
git add -A && git commit -m "feat: detecção de plataforma nativo vs web — lib/platform.ts + useIsNative hook"
git push origin main
```

---

## BLOCO 02 — ROTA RAIZ: LOGIN DIRETO NO NATIVO
### App nativo abre no login, browser abre na landing

**Diagnóstico:**
```bash
# Verificar a rota raiz atual
cat app/page.tsx 2>/dev/null || cat "app/(public)/page.tsx" 2>/dev/null || find app -maxdepth 2 -name "page.tsx" | head -5

# Verificar se existe landing page
find app -path "*landing*" -o -path "*home*" | head -10

# Verificar o layout raiz
cat app/layout.tsx | head -30

# Verificar middleware — como trata a rota /
grep -n "pathname === '/'" middleware.ts | head -5
```

**Implementação:**

A rota raiz (`app/page.tsx` ou equivalente) precisa detectar a plataforma e:
- **Nativo (Capacitor):** Redirecionar imediatamente para `/login`
- **Browser:** Mostrar a landing page normal (com preços, planos, CTA)

**Opção A — Redirect no middleware (mais limpo):**

No `middleware.ts`, adicionar lógica de plataforma na rota raiz:

```typescript
// Dentro da função middleware, ANTES da lógica de auth:

// Se é build nativo E está na raiz, redirecionar para login
if (pathname === '/' && (
  process.env.NEXT_PUBLIC_CAPACITOR === 'true' ||
  process.env.NEXT_PUBLIC_PLATFORM === 'mobile'
)) {
  return NextResponse.redirect(new URL('/login', request.url));
}
```

**Opção B — Na própria page (se a landing é server component):**

```tsx
// app/page.tsx (ou app/(public)/page.tsx)
import { isNativeBuild } from '@/lib/platform';
import { redirect } from 'next/navigation';

export default function HomePage() {
  // No build mobile, redireciona direto pro login
  if (isNativeBuild()) {
    redirect('/login');
  }

  // No browser, mostra landing page completa
  return <LandingPage />;
}
```

**Opção C — Client-side redirect (fallback):**

```tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isNativeApp } from '@/lib/platform';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (isNativeApp()) {
      router.replace('/login');
    }
  }, [router]);

  // Renderizar landing normalmente — redirect acontece no client se nativo
  return <LandingPage />;
}
```

**RECOMENDAÇÃO:** Use a Opção A (middleware) como primária E a Opção B como backup. O middleware pega no server-side antes de renderizar qualquer coisa, que é mais rápido e evita flash de conteúdo.

**No middleware.ts, a mudança é:**

Localizar a seção que trata rotas públicas e adicionar ANTES:

```typescript
// === STORE COMPLIANCE: nativo vai direto pro login ===
const isNativeBuildFlag = process.env.NEXT_PUBLIC_CAPACITOR === 'true' || process.env.NEXT_PUBLIC_PLATFORM === 'mobile';

// Rotas que NÃO devem aparecer no app nativo (têm preços/planos)
const NATIVE_BLOCKED_PATHS = ['/', '/precos', '/planos', '/pricing', '/landing', '/comecar'];

if (isNativeBuildFlag && NATIVE_BLOCKED_PATHS.includes(pathname)) {
  return NextResponse.redirect(new URL('/login', request.url));
}
```

**Verificação:**
```bash
pnpm typecheck && pnpm build
```

```bash
git add -A && git commit -m "feat: rota raiz — nativo vai direto pro login, browser mostra landing"
git push origin main
```

---

## BLOCO 03 — REMOVER PREÇOS DE TODAS AS TELAS NATIVAS
### Esconder preços, botões de compra, e CTAs de upgrade no app nativo

**Diagnóstico — encontrar TODOS os locais com preços:**
```bash
# 1. Buscar valores monetários hardcoded
grep -rn "R\$\|BRL\|reais\|97\|197\|347\|597\|mensalidade\|mensal\|anual\|assinatura\|preço\|preco" app/ components/ --include="*.tsx" | grep -v node_modules | grep -v ".test." | grep -v "docs/" | head -40

# 2. Buscar botões de compra/upgrade/assinar
grep -rn "Assinar\|Upgrade\|Comprar\|Ver Planos\|Escolher Plano\|Mudar Plano\|Plano Atual" app/ components/ --include="*.tsx" | head -20

# 3. Buscar a página de preços/planos
find app -path "*preco*" -o -path "*plano*" -o -path "*pricing*" -o -path "*plans*" | head -10

# 4. Buscar componentes de pricing
find components -name "*Pricing*" -o -name "*Plan*" -o -name "*pricing*" -o -name "*plano*" | head -10

# 5. Buscar links para planos dentro de shells/dashboards
grep -rn "precos\|planos\|pricing\|plans\|upgrade" components/shell/ --include="*.tsx" | head -10
```

**Correção — criar componente wrapper de pricing:**

```tsx
// components/shared/PricingGuard.tsx
'use client';
import { useIsNative } from '@/lib/hooks/useIsNative';

interface PricingGuardProps {
  children: React.ReactNode;
  /** O que mostrar no app nativo em vez do conteúdo com preços */
  nativeFallback?: React.ReactNode;
}

/**
 * Esconde conteúdo de preços/compra no app nativo.
 * Apple Guideline 3.1.3(a): apps SaaS B2B não devem mostrar
 * preços ou botões de compra dentro do app nativo.
 */
export function PricingGuard({ children, nativeFallback }: PricingGuardProps) {
  const isNative = useIsNative();

  if (isNative) {
    return nativeFallback ? <>{nativeFallback}</> : null;
  }

  return <>{children}</>;
}
```

**Criar componente de mensagem "gerencie pelo site":**

```tsx
// components/shared/ManageOnWebMessage.tsx
'use client';

interface ManageOnWebMessageProps {
  feature?: string; // ex: "seu plano", "sua assinatura"
}

export function ManageOnWebMessage({ feature = 'seu plano' }: ManageOnWebMessageProps) {
  return (
    <div className="rounded-xl border border-[var(--bb-depth-2)] bg-[var(--bb-depth-0)] p-6 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bb-depth-1)]">
        <svg className="h-6 w-6 text-[var(--bb-ink-2)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-[var(--bb-ink-1)] mb-1">
        Gerenciar {feature}
      </h3>
      <p className="text-sm text-[var(--bb-ink-3)] mb-4">
        Para gerenciar {feature}, acesse pelo navegador:
      </p>
      <p className="text-sm font-medium text-[var(--bb-brand)]">
        blackbeltv2.vercel.app/conta
      </p>
      <p className="text-xs text-[var(--bb-ink-4)] mt-2">
        Abra o link acima no navegador do seu celular ou computador
      </p>
    </div>
  );
}
```

**Agora, aplicar em TODOS os locais encontrados no diagnóstico:**

1. **Página de preços/planos** (`/precos`, `/planos`, ou similar):
```tsx
import { PricingGuard } from '@/components/shared/PricingGuard';
import { ManageOnWebMessage } from '@/components/shared/ManageOnWebMessage';

// Wrappear toda a seção de preços:
<PricingGuard nativeFallback={<ManageOnWebMessage feature="seu plano" />}>
  {/* Conteúdo original com preços — só aparece no browser */}
  <PricingCards plans={plans} />
</PricingGuard>
```

2. **Botões "Ver Planos" / "Upgrade" / "Assinar" em dashboards e sidebars:**
```tsx
<PricingGuard>
  <Button onClick={() => router.push('/precos')}>Ver Planos</Button>
</PricingGuard>
```

3. **Cards de plano atual** (ex: no dashboard admin mostra "Plano: Pro — R$ 347/mês"):
```tsx
// Mostrar o NOME do plano, mas esconder o preço no nativo
<div>
  <span>Plano: {plan.name}</span>
  <PricingGuard>
    <span className="text-sm text-[var(--bb-ink-3)]">
      {formatCurrency(plan.priceMonthly)}/mês
    </span>
  </PricingGuard>
</div>
```

4. **Tela "Meu Plano" / "Assinatura" dentro do app:**
```tsx
// No app nativo, mostrar apenas info do plano sem preço e sem botão de upgrade
import { useIsNative } from '@/lib/hooks/useIsNative';

export default function MeuPlanoPage() {
  const isNative = useIsNative();

  return (
    <div>
      <h1>Meu Plano</h1>
      <div className="...">
        <p>Plano atual: <strong>{plan.name}</strong></p>
        <p>Status: <Badge>{plan.status}</Badge></p>
        <p>Válido até: {formatDate(plan.validUntil)}</p>

        {!isNative ? (
          <>
            <p>Valor: {formatCurrency(plan.price)}/mês</p>
            <Button onClick={() => router.push('/precos')}>Mudar Plano</Button>
          </>
        ) : (
          <ManageOnWebMessage feature="sua assinatura" />
        )}
      </div>
    </div>
  );
}
```

5. **Sidebar/Menu — remover link "Planos" ou "Preços" no nativo:**
```tsx
// No array de menu items do shell:
const menuItems = [
  { label: 'Dashboard', href: '/admin', icon: Home },
  { label: 'Alunos', href: '/admin/alunos', icon: Users },
  // ... outros itens
  // Planos só aparece no browser:
  ...(!isNative ? [{ label: 'Planos', href: '/precos', icon: CreditCard }] : []),
];
```

6. **Landing page sections com preços:**
   - Se a landing page tem seção de pricing, wrappear com `<PricingGuard>`
   - No nativo a landing nem aparece (Bloco 02 já redireciona pro login)
   - Mas por segurança, wrappear mesmo assim

7. **Página de cadastro / onboarding:**
   - Se o onboarding mostra escolha de plano com preços:
   - No nativo, pular essa etapa ou mostrar sem preços
   - O cadastro com pagamento deve acontecer APENAS no browser

**Lista de verificação — rode DEPOIS de aplicar tudo:**
```bash
# Verificar que NENHUM preço aparece sem PricingGuard
grep -rn "R\$" app/ components/ --include="*.tsx" | grep -v PricingGuard | grep -v node_modules | grep -v "test\|mock\|Mock\|MOCK\|\.md\|docs/" | head -20

# Se sobrar algum R$ sem guard: wrappear com PricingGuard
# Exceção: formatadores de moeda em lib/ estão OK (não são UI)

pnpm typecheck && pnpm build
```

```bash
git add -A && git commit -m "feat: esconder preços no app nativo — Apple Guideline 3.1.3(a) compliance"
git push origin main
```

---

## BLOCO 04 — TELA DE LOGIN: LINK DISCRETO PARA O SITE
### Texto "Não tem conta?" com referência discreta ao site

**Diagnóstico:**
```bash
# Encontrar a página de login
find app -path "*login*" -name "page.tsx" | head -5

# Ver o conteúdo atual
cat $(find app -path "*login*" -name "page.tsx" | head -1) | head -80
```

**Implementação:**

Na tela de login, adicionar texto discreto para quem não tem conta. A regra da Apple é: pode mencionar o site, mas NÃO pode ser um botão CTA chamativo de "ASSINE AGORA".

```tsx
import { useIsNative } from '@/lib/hooks/useIsNative';

// Dentro do componente de login, ABAIXO do formulário de login:

const isNative = useIsNative();

// ...

{/* Link para cadastro */}
{isNative ? (
  // NO NATIVO: texto discreto, sem botão, sem CTA agressivo
  <p className="text-center text-sm text-[var(--bb-ink-3)] mt-6">
    Não tem conta?{' '}
    <span className="text-[var(--bb-ink-2)]">
      Acesse blackbeltv2.vercel.app para se cadastrar
    </span>
  </p>
) : (
  // NO BROWSER: botão normal de cadastro
  <p className="text-center text-sm text-[var(--bb-ink-3)] mt-6">
    Não tem conta?{' '}
    <Link href="/cadastrar-academia" className="text-[var(--bb-brand)] font-medium hover:underline">
      Cadastre sua academia
    </Link>
  </p>
)}
```

**IMPORTANTE — o que NÃO fazer no nativo:**
```tsx
// ❌ ERRADO — botão CTA que leva pra compra
<Button onClick={() => window.open('https://blackbeltv2.vercel.app/precos')}>
  ASSINE AGORA — 7 DIAS GRÁTIS
</Button>

// ❌ ERRADO — link direto pra página de preços
<a href="https://blackbeltv2.vercel.app/precos">Ver planos e preços</a>

// ✅ CORRETO — texto informativo discreto
<p className="text-sm text-gray-500">
  Acesse blackbeltv2.vercel.app para se cadastrar
</p>
```

**Verificação:**
```bash
pnpm typecheck && pnpm build
```

```bash
git add -A && git commit -m "feat: login — link discreto para site no nativo (Apple compliance)"
git push origin main
```

---

## BLOCO 05 — VERIFICAÇÃO FINAL + DOCUMENTAÇÃO + TAG
### Garantir zero preços no nativo, atualizar docs

**Verificação completa:**
```bash
echo "=== VERIFICAÇÃO DE MONETIZAÇÃO STORE-SAFE ==="

# 1. Confirmar que lib/platform.ts existe
echo "--- Platform detection ---"
test -f lib/platform.ts && echo "✅ lib/platform.ts existe" || echo "❌ FALTA lib/platform.ts"

# 2. Confirmar que PricingGuard existe
echo "--- PricingGuard ---"
find components -name "PricingGuard*" | head -1 | xargs test -f 2>/dev/null && echo "✅ PricingGuard existe" || echo "❌ FALTA PricingGuard"

# 3. Confirmar que ManageOnWebMessage existe
echo "--- ManageOnWebMessage ---"
find components -name "ManageOnWebMessage*" | head -1 | xargs test -f 2>/dev/null && echo "✅ ManageOnWebMessage existe" || echo "❌ FALTA ManageOnWebMessage"

# 4. Verificar que middleware bloqueia rotas de preço no nativo
echo "--- Middleware native block ---"
grep -c "NATIVE_BLOCKED_PATHS\|isNativeBuildFlag\|NEXT_PUBLIC_CAPACITOR" middleware.ts

# 5. SCAN FINAL — R$ sem proteção
echo "--- R$ sem PricingGuard (devem ser ZERO em UI) ---"
grep -rn "R\\\$" app/ components/ --include="*.tsx" | grep -v PricingGuard | grep -v node_modules | grep -v "test\|mock\|\.md\|docs/\|lib/" | wc -l

# 6. Scan botões de compra sem proteção
echo "--- Botões de compra sem guard ---"
grep -rn "Assinar\|Upgrade.*plano\|Comprar.*plano\|Escolher.*plano" app/ components/ --include="*.tsx" | grep -v PricingGuard | grep -v node_modules | grep -v "test\|mock" | wc -l

# 7. Build
echo "--- Build ---"
pnpm typecheck && pnpm build
```

**Atualizar documentação de monetização:**

```bash
# Verificar se o doc já existe
cat docs/APPLE_MONETIZATION_JUSTIFICATION.md 2>/dev/null | head -10
```

Atualizar ou criar `docs/APPLE_MONETIZATION_JUSTIFICATION.md`:

```markdown
# BlackBelt — Apple App Store Monetization Justification

## Model: SaaS B2B — Guideline 3.1.3(a)

BlackBelt is a multi-tenant SaaS platform for martial arts academy management.
The primary customer is the academy owner (B2B), not the end-user athlete.

### Why IAP is not required:
1. **B2B SaaS**: Similar to Slack, Salesforce, Trello, Basecamp
2. **Service consumed outside the app**: Academy management, billing, class scheduling, franchise operations
3. **Multi-user per subscription**: One academy subscription serves owners, professors, receptionists, students, parents
4. **No digital content**: No digital goods, no streaming, no downloadable content

### Technical implementation:
- **Native app (iOS/Android)**: Opens directly to login screen. No pricing, no purchase buttons, no upgrade CTAs.
- **Web app (browser)**: Full landing page with pricing, plans, and signup flow.
- **Platform detection**: `Capacitor.isNativePlatform()` + `NEXT_PUBLIC_CAPACITOR` env var.
- **PricingGuard component**: Wraps all pricing UI, renders nothing on native.
- **ManageOnWebMessage component**: Shown on native in place of pricing, directs users to website.

### Comparable approved apps:
- Slack (workplace communication SaaS)
- Salesforce (CRM SaaS)
- Trello (project management SaaS)
- Monday.com (work management SaaS)
- Basecamp (project management SaaS)
- Mindbody (fitness business SaaS — direct competitor)

### App Review Notes (copy to App Store Connect):
"BlackBelt is a B2B SaaS platform for martial arts academy management, per Guideline 3.1.3(a).
Subscriptions are purchased by academy owners through our website (blackbeltv2.vercel.app).
The app does not display pricing or offer in-app purchases.
Demo account: roberto@guerreiros.com / BlackBelt@2026 (Admin role)"
```

**Tag de release:**
```bash
git add -A && git commit -m "feat: monetização store-safe completa — zero preços no nativo + docs Apple"
git push origin main

git tag -a v5.1.0-monetization-safe -m "BlackBelt App v5.1.0 — Monetização Store-Safe
- feat: lib/platform.ts — detecção nativo vs web
- feat: useIsNative hook
- feat: PricingGuard component
- feat: ManageOnWebMessage component
- feat: middleware bloqueia rotas de preço no nativo
- feat: login com link discreto para site
- docs: APPLE_MONETIZATION_JUSTIFICATION.md atualizado
- Apple Guideline 3.1.3(a) compliance total"

git push origin v5.1.0-monetization-safe
```

---

## COMANDO DE RETOMADA

Se o Claude Code parar no meio:

```
Retome a execução do prompt MONETIZAÇÃO STORE-SAFE do BlackBelt App. Verifique o último commit com `git log --oneline -5` e continue do próximo BLOCO. Regras: pnpm typecheck && pnpm build → commit → push entre cada bloco. NUNCA delete isMock(). CSS var(--bb-*). O objetivo é garantir ZERO preços/botões de compra no app nativo iOS/Android, mantendo tudo normal no browser.
```

---

## FIM DO PROMPT

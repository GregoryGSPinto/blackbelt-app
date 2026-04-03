# BLACKBELT APP — MEGA PROMPT: ZERO BARREIRAS PARA STORES
## 8 Agents Sequenciais: Eliminar TUDO que impede publicação
## Data: 02/04/2026 | Repo: GregoryGSPinto/blackbelt-app
## EXECUTAR DEPOIS do prompt STORE_READY (bugs/features)

---

> **INSTRUÇÕES DE EXECUÇÃO:**
>
> 1. Este prompt tem 8 BLOCOS sequenciais. Execute UM por vez.
> 2. Cada bloco termina com: `pnpm typecheck && pnpm build` → commit → push
> 3. Se build FALHAR: corrija ANTES de avançar. NUNCA pule.
> 4. REGRAS INVIOLÁVEIS:
>    - NUNCA delete blocos `isMock()`
>    - `handleServiceError(error)` em todo catch block
>    - CSS: usar `var(--bb-*)` — ZERO cores hardcoded
>    - Toast PT-BR em toda ação do usuário
>    - Mobile-first Tailwind, touch targets 44px
>    - Kids: ZERO mensagens, ZERO financeiro
>    - TypeScript strict: ZERO `any`
>
> **CONTEXTO:**
> Este prompt assume que o prompt STORE_READY (bugs/features) já foi executado.
> Este prompt NÃO corrige bugs de UI — ele elimina TODAS as barreiras
> técnicas, legais, de compliance e de metadata que impedem publicação
> na Apple App Store e Google Play Store.
>
> **DIRETÓRIO:** `cd ~/Projetos/blackbelt-app`
> **REPO:** `https://github.com/GregoryGSPinto/blackbelt-app`
> **DEPLOY:** `https://blackbeltv2.vercel.app`
> **SUPABASE PROJECT:** `tdplmmodmumryzdosmpv`
> **BRAND COLOR:** `#C62828`

---

## BLOCO 01 — DOMÍNIO FANTASMA + EMAILS MORTOS
### Apple Guideline 2.3: Metadata precisa ser verdadeira
### Problema: referências a `blackbelt.com` e `suporte@blackbelt.app` que NÃO existem

**Este é o bloqueador mais silencioso. O reviewer da Apple CLICA nos links e ENVIA
email pros endereços listados. Se não funcionam = rejeição por metadata enganosa.**

**Diagnóstico:**
```bash
echo "=== SCAN DE DOMÍNIOS/EMAILS FANTASMA ==="

# 1. Todas referências a blackbelt.com (domínio que NÃO é do Gregory)
grep -rn "blackbelt\.com" app/ components/ lib/ docs/ public/ --include="*.tsx" --include="*.ts" --include="*.json" --include="*.md" --include="*.mjs" | grep -v node_modules | grep -v ".git"

# 2. Todas referências a suporte@blackbelt.app (email que pode não existir)
grep -rn "suporte@blackbelt" app/ components/ lib/ docs/ public/ --include="*.tsx" --include="*.ts" --include="*.md" | grep -v node_modules

# 3. Referências no capacitor.config.ts
grep "blackbelt\.com\|blackbelt\.app" capacitor.config.ts

# 4. Referências no next.config.mjs
grep "blackbelt\.com\|blackbelt\.app" next.config.mjs

# 5. Qualquer URL/email que não seja blackbeltv2.vercel.app ou gregoryguimaraes12@gmail.com
grep -rn "blackbelt\.\(com\|app\|io\|dev\)" app/ components/ lib/ docs/ public/ --include="*.tsx" --include="*.ts" --include="*.json" --include="*.md" --include="*.mjs" | grep -v "blackbeltv2\.vercel\.app" | grep -v node_modules | grep -v ".git"
```

**Correção — substituir TUDO:**

1. **Em `capacitor.config.ts`:**
```typescript
// ANTES:
const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.blackbelt.com';

// DEPOIS:
const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://blackbeltv2.vercel.app';
```

2. **Em TODOS os arquivos encontrados pelo scan:**
   - `blackbelt.com` → `blackbeltv2.vercel.app`
   - `app.blackbelt.com` → `blackbeltv2.vercel.app`
   - `suporte@blackbelt.app` → `gregoryguimaraes12@gmail.com`
   - `contato@blackbelt.app` → `gregoryguimaraes12@gmail.com`
   - `dpo@blackbelt.app` → `gregoryguimaraes12@gmail.com`
   - Qualquer `*@blackbelt.app` → `gregoryguimaraes12@gmail.com`

3. **Na política de privacidade** (`app/(public)/privacidade/page.tsx` ou equivalente):
   - DPO email: `gregoryguimaraes12@gmail.com`
   - Contato: `gregoryguimaraes12@gmail.com`
   - Site: `https://blackbeltv2.vercel.app`

4. **Na página `/excluir-conta`:**
   - Email de suporte: `gregoryguimaraes12@gmail.com`

5. **Nos termos de uso:**
   - Mesmas substituições

6. **No header/footer público** (se tem link "Site"):
   - Trocar href de `https://blackbelt.com` para `https://blackbeltv2.vercel.app`
   - Ou remover o link "Site" se aponta pro mesmo lugar que o app

7. **No `next.config.mjs`** — verificar se há referências a domínios externos.

8. **Nos docs/STORE_METADATA.md e docs/APPLE_MONETIZATION_JUSTIFICATION.md:**
   - Substituir todas referências

**Depois, confirmar que ZERO referências fantasma restam:**
```bash
echo "=== VERIFICAÇÃO FINAL ==="
# Deve retornar ZERO linhas (exceto node_modules/.git)
grep -rn "blackbelt\.com\b" app/ components/ lib/ docs/ public/ capacitor.config.ts next.config.mjs --include="*.tsx" --include="*.ts" --include="*.json" --include="*.md" --include="*.mjs" | grep -v "blackbeltv2\.vercel\.app" | grep -v node_modules | grep -v ".git"

# Verificar emails
grep -rn "@blackbelt\.\(app\|com\)" app/ components/ lib/ docs/ public/ --include="*.tsx" --include="*.ts" --include="*.md" | grep -v "gregoryguimaraes12@gmail.com" | grep -v node_modules
```

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "fix: eliminar domínios/emails fantasma — usar URLs e emails reais"
git push origin main
```

---

## BLOCO 02 — MONETIZAÇÃO STORE-SAFE
### Apple Guideline 3.1.1/3.1.3(a): Zero preços no app nativo

**Diagnóstico:**
```bash
echo "=== SCAN DE PREÇOS NO APP ==="

# 1. Valores monetários em componentes UI
grep -rn "R\\\$\|BRL\|reais" app/ components/ --include="*.tsx" | grep -v node_modules | grep -v "test\|mock\|Mock\|MOCK\|\.md\|docs/" | head -30

# 2. Botões de compra/upgrade
grep -rn "Assinar\|Upgrade\|Comprar.*plano\|Ver Planos\|Escolher Plano\|Mudar Plano" app/ components/ --include="*.tsx" | grep -v node_modules | head -20

# 3. Verificar se já existe PricingGuard ou isNative
grep -rn "PricingGuard\|isNative\|isNativeApp\|useIsNative\|NEXT_PUBLIC_CAPACITOR" lib/ components/ app/ --include="*.tsx" --include="*.ts" | head -20

# 4. Páginas de preços/planos
find app -path "*preco*" -o -path "*plano*" -o -path "*pricing*" | head -10
```

**Se NÃO existe `lib/platform.ts` e `PricingGuard`, criar:**

Arquivo `lib/platform.ts`:
```typescript
/**
 * Detecção de plataforma — esconder preços no app nativo (Apple Guideline 3.1.3a)
 */
export function isNativeBuild(): boolean {
  return (
    process.env.NEXT_PUBLIC_CAPACITOR === 'true' ||
    process.env.NEXT_PUBLIC_PLATFORM === 'mobile'
  );
}

export function isNativeApp(): boolean {
  if (isNativeBuild()) return true;
  if (typeof window === 'undefined') return false;
  const win = window as Record<string, unknown>;
  if (win.Capacitor && typeof (win.Capacitor as Record<string, unknown>).isNativePlatform === 'function') {
    return (win.Capacitor as { isNativePlatform: () => boolean }).isNativePlatform();
  }
  return false;
}
```

Arquivo `lib/hooks/useIsNative.ts`:
```typescript
'use client';
import { useState, useEffect } from 'react';
import { isNativeApp, isNativeBuild } from '@/lib/platform';

export function useIsNative(): boolean {
  const [native, setNative] = useState(isNativeBuild());
  useEffect(() => { setNative(isNativeApp()); }, []);
  return native;
}
```

Arquivo `components/shared/PricingGuard.tsx`:
```tsx
'use client';
import { useIsNative } from '@/lib/hooks/useIsNative';

interface PricingGuardProps {
  children: React.ReactNode;
  nativeFallback?: React.ReactNode;
}

export function PricingGuard({ children, nativeFallback }: PricingGuardProps) {
  const isNative = useIsNative();
  if (isNative) return nativeFallback ? <>{nativeFallback}</> : null;
  return <>{children}</>;
}
```

Arquivo `components/shared/ManageOnWebMessage.tsx`:
```tsx
'use client';

export function ManageOnWebMessage({ feature = 'seu plano' }: { feature?: string }) {
  return (
    <div className="rounded-xl border border-[var(--bb-depth-2)] bg-[var(--bb-depth-0)] p-6 text-center">
      <h3 className="text-base font-semibold text-[var(--bb-ink-1)] mb-1">Gerenciar {feature}</h3>
      <p className="text-sm text-[var(--bb-ink-3)] mb-3">
        Para gerenciar {feature}, acesse pelo navegador:
      </p>
      <p className="text-sm font-medium text-[var(--bb-brand)]">blackbeltv2.vercel.app/conta</p>
    </div>
  );
}
```

**Aplicar PricingGuard em TODOS os locais encontrados pelo scan:**
- Wrappear TODA exibição de R$ com `<PricingGuard>`
- Wrappear TODOS os botões de compra/upgrade
- Na sidebar: esconder link "Planos"/"Preços" no nativo
- Na tela de login: substituir botão "Cadastrar academia" por texto discreto no nativo

**No middleware.ts — bloquear rotas de preço no nativo:**
```typescript
// Adicionar ANTES da lógica de auth:
const isNativeBuildFlag = process.env.NEXT_PUBLIC_CAPACITOR === 'true' || process.env.NEXT_PUBLIC_PLATFORM === 'mobile';
const NATIVE_BLOCKED_PATHS = ['/', '/precos', '/planos', '/pricing', '/landing', '/comecar'];
if (isNativeBuildFlag && NATIVE_BLOCKED_PATHS.includes(pathname)) {
  return NextResponse.redirect(new URL('/login', request.url));
}
```

**Na tela de login — texto discreto no nativo:**
```tsx
// Substituir o bloco "Ainda não tem conta?" para detectar plataforma
import { useIsNative } from '@/lib/hooks/useIsNative';

// Dentro do componente:
const isNative = useIsNative();

// No JSX, substituir os links de cadastro:
{isNative ? (
  <p className="text-center text-sm text-[var(--bb-ink-3)] mt-6">
    Não tem conta? Acesse <span className="text-[var(--bb-ink-2)]">blackbeltv2.vercel.app</span> para se cadastrar
  </p>
) : (
  // Manter os links originais: "Sou dono de academia" + "Tenho um convite"
  <div>
    <Link href="/cadastrar-academia">🏛️ Sou dono de academia</Link>
    <Link href="/cadastro">🥋 Tenho um convite</Link>
  </div>
)}
```

**Verificação:**
```bash
# Confirmar que ZERO R$ aparece sem PricingGuard em UI
grep -rn "R\\\$" app/ components/ --include="*.tsx" | grep -v PricingGuard | grep -v node_modules | grep -v "test\|mock\|lib/\|docs/" | wc -l
# Deve ser 0 ou quase 0

pnpm typecheck && pnpm build
```

```bash
git add -A && git commit -m "feat: monetização store-safe — PricingGuard + zero preços no nativo"
git push origin main
```

---

## BLOCO 03 — FEATURES FANTASMA (IA, Features Prometidas)
### Apple Guideline 2.3: App deve funcionar conforme anunciado
### Problema: README e UI listam features de IA que são mock ou inexistentes

**O reviewer da Apple navega pelo app inteiro. Se encontrar seções
"AI Coach", "Fight Analysis", "Competition Prediction" que mostram
"Em breve" ou tela vazia, rejeita por feature incompleta.**

**Diagnóstico:**
```bash
echo "=== SCAN DE FEATURES FANTASMA ==="

# 1. Referências a IA no código
grep -rn "ai\|AI\|artificial\|coach\|Coach\|fight.*analysis\|prediction\|inteligencia\|inteligência" app/ components/ --include="*.tsx" -l | head -20

# 2. Páginas com "Em breve" ou "Coming soon"
grep -rn "Em breve\|Coming soon\|em breve\|coming soon\|Em Breve\|Proximamente\|Em desenvolvimento\|em desenvolvimento" app/ components/ --include="*.tsx" | head -30

# 3. Menus/links para features que não existem
grep -rn "Em breve\|coming-soon\|placeholder" components/shell/ --include="*.tsx" | head -20

# 4. Referências a Apple Watch
grep -rn "Apple Watch\|apple watch\|watchOS\|watch\|Watch" app/ components/ --include="*.tsx" | head -10

# 5. Referências a features que podem não funcionar
grep -rn "análise de luta\|analise de luta\|fight analysis\|AI coach\|ai coach\|predição\|predicao" app/ components/ --include="*.tsx" | head -10
```

**Correção — para CADA feature fantasma encontrada:**

**Opção A (preferida): Esconder a feature completamente:**
- Remover o item do menu/sidebar
- Remover o card do dashboard
- NÃO deletar o código — apenas esconder o acesso

```tsx
// ANTES: item sempre visível no menu
{ label: 'AI Coach', href: '/dashboard/ai-coach', icon: Brain },

// DEPOIS: escondido até estar pronto (feature flag)
...(process.env.NEXT_PUBLIC_FEATURE_AI === 'true' ? [
  { label: 'AI Coach', href: '/dashboard/ai-coach', icon: Brain },
] : []),
```

**Opção B: Converter "Em breve" em funcionalidade mínima:**
- Se a tela existe mas só mostra placeholder, adicionar conteúdo real mínimo
- Ex: "AI Coach" pode se tornar uma lista de dicas de treino estáticas
- Ex: "Fight Analysis" pode mostrar estatísticas do aluno (dados que já existem)

**Para TODOS os "Em breve" no app:**
```tsx
// ERRADO — reviewer vê isso e rejeita
<div className="flex items-center justify-center h-64">
  <p className="text-gray-500">Em breve</p>
</div>

// CORRETO — se não está pronto, NÃO mostrar no menu
// Remover o link/item de navegação que leva a essa página
```

**Para Apple Watch:**
```bash
# Se encontrar referência:
# Substituir "Apple Watch" por "dispositivos wearable" ou remover completamente
# Se há uma página de integração com Apple Watch que não funciona: esconder
```

**Scan final:**
```bash
# Deve retornar ZERO
grep -rn "Em breve\|Coming soon\|em breve\|coming soon" app/ components/ --include="*.tsx" | grep -v node_modules | grep -v test | wc -l

pnpm typecheck && pnpm build
```

```bash
git add -A && git commit -m "fix: esconder features incompletas — zero 'Em breve' no app"
git push origin main
```

---

## BLOCO 04 — PRIVACY MANIFEST iOS (PrivacyInfo.xcprivacy)
### Obrigatório desde Spring 2024 — Apple rejeita sem ele

**Diagnóstico:**
```bash
echo "=== PRIVACY MANIFEST iOS ==="

# Verificar se existe
find ios -name "PrivacyInfo.xcprivacy" 2>/dev/null
find ios -name "*.xcprivacy" 2>/dev/null

# Verificar a pasta iOS
ls -la ios/App/App/ 2>/dev/null | head -20
```

**Se NÃO existe, criar:**

```bash
cat > ios/App/App/PrivacyInfo.xcprivacy << 'PRIVACY'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>NSPrivacyTracking</key>
    <false/>
    <key>NSPrivacyTrackingDomains</key>
    <array/>
    <key>NSPrivacyCollectedDataTypes</key>
    <array>
        <dict>
            <key>NSPrivacyCollectedDataType</key>
            <string>NSPrivacyCollectedDataTypeEmailAddress</string>
            <key>NSPrivacyCollectedDataTypeLinked</key>
            <true/>
            <key>NSPrivacyCollectedDataTypeTracking</key>
            <false/>
            <key>NSPrivacyCollectedDataTypePurposes</key>
            <array>
                <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
            </array>
        </dict>
        <dict>
            <key>NSPrivacyCollectedDataType</key>
            <string>NSPrivacyCollectedDataTypeName</string>
            <key>NSPrivacyCollectedDataTypeLinked</key>
            <true/>
            <key>NSPrivacyCollectedDataTypeTracking</key>
            <false/>
            <key>NSPrivacyCollectedDataTypePurposes</key>
            <array>
                <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
            </array>
        </dict>
        <dict>
            <key>NSPrivacyCollectedDataType</key>
            <string>NSPrivacyCollectedDataTypePhoneNumber</string>
            <key>NSPrivacyCollectedDataTypeLinked</key>
            <true/>
            <key>NSPrivacyCollectedDataTypeTracking</key>
            <false/>
            <key>NSPrivacyCollectedDataTypePurposes</key>
            <array>
                <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
            </array>
        </dict>
        <dict>
            <key>NSPrivacyCollectedDataType</key>
            <string>NSPrivacyCollectedDataTypeUserID</string>
            <key>NSPrivacyCollectedDataTypeLinked</key>
            <true/>
            <key>NSPrivacyCollectedDataTypeTracking</key>
            <false/>
            <key>NSPrivacyCollectedDataTypePurposes</key>
            <array>
                <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
            </array>
        </dict>
    </array>
    <key>NSPrivacyAccessedAPITypes</key>
    <array>
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>CA92.1</string>
            </array>
        </dict>
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategorySystemBootTime</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>35F9.1</string>
            </array>
        </dict>
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryDiskSpace</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>E174.1</string>
            </array>
        </dict>
    </array>
</dict>
</plist>
PRIVACY
```

**Se JÁ existe:** Verificar que contém pelo menos `NSPrivacyCollectedDataTypes` e `NSPrivacyAccessedAPITypes`. Atualizar se incompleto.

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: PrivacyInfo.xcprivacy — Privacy Manifest obrigatório Apple"
git push origin main
```

---

## BLOCO 05 — STORE METADATA COMPLETO + REVIEW CREDENTIALS
### Tudo que Apple e Google precisam nos consoles

**Verificar o que já existe:**
```bash
ls docs/STORE_METADATA.md 2>/dev/null && echo "existe" || echo "NÃO existe"
ls docs/APPLE_MONETIZATION_JUSTIFICATION.md 2>/dev/null && echo "existe" || echo "NÃO existe"
ls docs/STORE_REVIEW_CREDENTIALS.md 2>/dev/null && echo "existe" || echo "NÃO existe"
```

**Criar/atualizar `docs/STORE_METADATA.md`:**

```markdown
# BlackBelt — Store Metadata
# Atualizado: $(date +%Y-%m-%d)

## App Identity
- App Name: BlackBelt
- Bundle ID (iOS): app.blackbelt.academy
- Package Name (Android): app.blackbelt.academy
- Version: 1.0.0
- Build: 1

## Apple App Store

### Primary Language: Portuguese (Brazil)
### Category: Business
### Secondary Category: Education

### Subtitle (30 chars max):
Gestão de academias de artes marciais

### Promotional Text (170 chars):
Gerencie sua academia de artes marciais com check-in por QR Code, controle de presença, graduação de faixas, cobranças e muito mais. Teste grátis por 7 dias.

### Description (4000 chars max):
BlackBelt é a plataforma completa de gestão para academias de artes marciais — BJJ, Judô, Karatê, MMA e mais.

PARA DONOS DE ACADEMIA:
• Dashboard com métricas em tempo real: alunos, presença, receita
• Gestão de turmas, horários e professores
• Controle financeiro: cobranças, inadimplência, relatórios
• Check-in de alunos por QR Code
• Sistema de graduação e progressão de faixas
• CRM para captação de novos alunos
• Comunicação com alunos e responsáveis

PARA PROFESSORES:
• Diário de aula e controle de presença
• Avaliações técnicas dos alunos
• Planejamento de aulas e currículos

PARA ALUNOS:
• Acompanhe sua evolução e presença
• Check-in rápido por QR Code
• Veja sua progressão de faixa
• Carteirinha digital

PARA PAIS/RESPONSÁVEIS:
• Acompanhe a evolução dos seus filhos
• Receba notificações de presença
• Gerencie pagamentos

SEGURANÇA:
• Dados protegidos com criptografia
• Conformidade com LGPD
• Perfis Kids com proteção especial

Planos a partir de R$ 97/mês. Teste grátis por 7 dias com acesso completo.

### Keywords (100 chars max):
academia,artes marciais,bjj,jiu jitsu,judô,karate,mma,gestão,check-in,presença,faixa,graduação

### Support URL: https://blackbeltv2.vercel.app/contato
### Marketing URL: https://blackbeltv2.vercel.app
### Privacy Policy URL: https://blackbeltv2.vercel.app/privacidade

### App Review Notes:
BlackBelt is a B2B SaaS platform for martial arts academy management, per Guideline 3.1.3(a).
Subscriptions are purchased by academy owners through our website (blackbeltv2.vercel.app).
The app does not display pricing or offer in-app purchases.

Demo account:
Email: roberto@guerreiros.com
Password: BlackBelt@2026
Role: Admin (academy administrator)

After login, you can explore: Dashboard, Students, Classes, Check-in, Financials, Reports.
The demo academy "Guerreiros do Tatame" has pre-populated data.

### Age Rating: 4+ (no objectionable content)

---

## Google Play Store

### Default Language: pt-BR
### Application Type: Application
### Category: Business
### Content Rating: IARC → Everyone

### Short Description (80 chars):
Gestão completa para academias de artes marciais. Check-in, turmas e cobranças.

### Full Description (4000 chars):
[Usar mesma descrição do Apple com adaptações]

### Contact Email: gregoryguimaraes12@gmail.com
### Contact Phone: [Gregory preencher]
### Contact Website: https://blackbeltv2.vercel.app

### Privacy Policy URL: https://blackbeltv2.vercel.app/privacidade

### Data Safety:
- Collects: Name, email, phone, payment info (via Asaas), usage data
- Data encrypted in transit: Yes
- Data can be deleted: Yes (via /excluir-conta)
- Data shared with third parties: Asaas (payments), Supabase (hosting), PostHog (analytics)
- No data sold to third parties

### Target Audience: 18+ (B2B — academy owners and staff)
### App contains ads: No
### App is a news app: No

### Families Policy Declaration:
This app is NOT designed for children. The app's target audience is adult business owners.
Kid/Teen profiles are managed sub-accounts created by adult administrators.
Children never access the app store listing or download the app themselves.
```

**Criar/atualizar `docs/STORE_REVIEW_CREDENTIALS.md`:**

```markdown
# BlackBelt — Credenciais para Review (Apple/Google)

## Conta Demo Principal (usar para App Review)
- **Email:** roberto@guerreiros.com
- **Password:** BlackBelt@2026
- **Role:** Admin (Administrador da Academia)
- **Academy:** Guerreiros do Tatame (Vespasiano, MG)

## O que o reviewer pode testar:
1. Login → Dashboard com métricas
2. Menu lateral → Alunos (lista com dados)
3. Menu lateral → Turmas (grade de horários)
4. Menu lateral → Financeiro (cobranças e relatórios)
5. Menu lateral → Comunicação (mensagens internas)
6. Perfil → Configurações
7. Check-in (QR Code)

## Notas importantes:
- O app é SaaS B2B — subscriptions são gerenciadas fora do app (website)
- Não há in-app purchases
- O backend está ativo 24/7 (Supabase + Vercel)
- Dados de demo são pré-populados e resetados periodicamente

## Conta Super Admin (NÃO usar para review — apenas referência)
- Email: greg@email.com
- Password: BlackBelt@Greg1994
```

**Atualizar `docs/APPLE_MONETIZATION_JUSTIFICATION.md`:**

```markdown
# BlackBelt — Monetization Justification
# Apple App Store Review Guideline 3.1.3(a)

## Business Model: SaaS B2B (Multi-tenant)

BlackBelt is a multi-tenant SaaS platform for martial arts academy management.

### Why In-App Purchase is NOT required:

1. **B2B Service**: The customer is the business (academy), not the consumer.
   Academy owners purchase subscriptions through our website to manage their business operations.

2. **Service consumed outside the app**: Core value is business management —
   classes, billing, student records, reports. These are operational tools, not digital content.

3. **Multi-user per subscription**: One academy subscription serves the owner,
   professors, receptionists, students, and parents. The subscription is tied
   to the business entity, not individual app users.

4. **No digital content delivered**: No ebooks, no streaming video, no downloadable
   content. The app is a management tool.

### Technical Implementation:
- Native app (iOS/Android): Opens to login screen. No pricing displayed.
- Web app (browser): Full landing page with pricing and signup flow.
- `PricingGuard` component wraps all pricing UI, renders nothing on native.
- Platform detection via `Capacitor.isNativePlatform()` + build-time env vars.

### Comparable Approved Apps:
- Mindbody (fitness business management)
- Glofox (gym management)
- Zen Planner (martial arts management)
- Slack (workplace SaaS)
- Salesforce (CRM SaaS)
- Monday.com (work management SaaS)

### App Store Connect Review Notes Template:
"BlackBelt is a B2B SaaS platform for martial arts academy management,
per Guideline 3.1.3(a). Subscriptions are purchased by academy owners
through our website (blackbeltv2.vercel.app). The app does not display
pricing or offer in-app purchases.
Demo: roberto@guerreiros.com / BlackBelt@2026 (Admin role)"
```

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "docs: store metadata completo + review credentials + monetization justification"
git push origin main
```

---

## BLOCO 06 — FEATURE GRAPHIC + ÍCONE VERIFICAÇÃO
### Google Play exige Feature Graphic 1024x500
### Apple exige ícone 1024x1024 no Asset Catalog

**Diagnóstico:**
```bash
echo "=== ASSETS PARA STORES ==="

# Feature graphic
find . -name "*feature*graphic*" -o -name "*1024x500*" 2>/dev/null | grep -v node_modules

# Ícone 1024x1024
find ios -name "*.png" 2>/dev/null | head -20
find public -name "icon*" -o -name "logo*" -o -name "apple-touch*" | head -10
ls public/icon* public/logo* public/apple-touch-icon* 2>/dev/null

# Screenshots existentes
find docs -name "*.png" -path "*screenshot*" 2>/dev/null | head -20
ls docs/store-screenshots/ 2>/dev/null | head -20

# App icon no manifest
grep -i "icon\|512\|1024" public/manifest.json 2>/dev/null || grep -i "icon\|512\|1024" public/site.webmanifest 2>/dev/null
```

**Gerar Feature Graphic 1024x500 com código:**

```bash
# Instalar sharp se necessário
pnpm add -D sharp 2>/dev/null || npm install -D sharp 2>/dev/null

# Gerar feature graphic
cat > scripts/generate-feature-graphic.mjs << 'SCRIPT'
import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, '..', 'docs', 'store-assets');

if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

// Feature Graphic: 1024x500, fundo escuro (#0A0A0A) com marca
const width = 1024;
const height = 500;

const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0A0A0A"/>
      <stop offset="100%" style="stop-color:#1A1A1A"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <!-- Brand accent line -->
  <rect x="0" y="0" width="${width}" height="4" fill="#C62828"/>
  <!-- App name -->
  <text x="512" y="220" font-family="Arial,Helvetica,sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle">BLACKBELT</text>
  <!-- Tagline -->
  <text x="512" y="290" font-family="Arial,Helvetica,sans-serif" font-size="28" fill="#9CA3AF" text-anchor="middle">Gestão completa para academias de artes marciais</text>
  <!-- Features -->
  <text x="512" y="370" font-family="Arial,Helvetica,sans-serif" font-size="20" fill="#6B7280" text-anchor="middle">Check-in • Turmas • Cobranças • Graduações • Relatórios</text>
  <!-- Belt icon (simplified) -->
  <rect x="462" y="130" width="100" height="20" rx="4" fill="#C62828"/>
  <rect x="502" y="125" width="20" height="30" rx="2" fill="#C62828"/>
</svg>`;

await sharp(Buffer.from(svg))
  .resize(1024, 500)
  .png()
  .toFile(join(outputDir, 'feature-graphic-1024x500.png'));

console.log('✅ Feature graphic gerada: docs/store-assets/feature-graphic-1024x500.png');

// App Icon 1024x1024 (se não existe)
const iconSvg = `
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" rx="230" fill="#0A0A0A"/>
  <!-- Belt -->
  <rect x="262" y="460" width="500" height="100" rx="16" fill="#C62828"/>
  <rect x="472" y="430" width="80" height="160" rx="10" fill="#C62828"/>
  <!-- BB text -->
  <text x="512" y="400" font-family="Arial,Helvetica,sans-serif" font-size="280" font-weight="bold" fill="white" text-anchor="middle">BB</text>
</svg>`;

await sharp(Buffer.from(iconSvg))
  .resize(1024, 1024)
  .png()
  .toFile(join(outputDir, 'app-icon-1024x1024.png'));

console.log('✅ App icon gerada: docs/store-assets/app-icon-1024x1024.png');
SCRIPT

node scripts/generate-feature-graphic.mjs
```

**Se sharp não instalar (network restriction), criar SVGs manuais:**

```bash
mkdir -p docs/store-assets

# Feature Graphic como SVG (Gregory pode converter para PNG no browser)
cat > docs/store-assets/feature-graphic.svg << 'SVG'
<svg width="1024" height="500" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="500" fill="#0A0A0A"/>
  <rect x="0" y="0" width="1024" height="4" fill="#C62828"/>
  <text x="512" y="220" font-family="Arial" font-size="72" font-weight="bold" fill="white" text-anchor="middle">BLACKBELT</text>
  <text x="512" y="290" font-family="Arial" font-size="28" fill="#9CA3AF" text-anchor="middle">Gestão completa para academias de artes marciais</text>
  <text x="512" y="370" font-family="Arial" font-size="20" fill="#6B7280" text-anchor="middle">Check-in • Turmas • Cobranças • Graduações • Relatórios</text>
</svg>
SVG

echo "✅ SVG criado. Gregory: abra no browser e faça Print Screen 1024x500 se precisar de PNG."
```

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: feature graphic + app icon para stores"
git push origin main
```

---

## BLOCO 07 — CAPACITOR + README + BADGES CONSISTENTES
### Corrigir inconsistências que o reviewer pode notar

**Diagnóstico:**
```bash
echo "=== CONSISTÊNCIA ==="

# 1. Capacitor version no package.json vs README
grep "capacitor" package.json | head -5
grep -i "capacitor" README.md | head -5

# 2. webDir no capacitor.config.ts — deve ser "out" para static export
grep "webDir" capacitor.config.ts

# 3. next.config.mjs — verificar se output: 'export' existe para build mobile
grep "output" next.config.mjs | head -3

# 4. Verificar se o script build:mobile faz static export
grep "build:mobile\|prepare-capacitor" package.json

# 5. iOS scheme no capacitor
grep "scheme\|ios\|android" capacitor.config.ts | head -10
```

**Correções:**

1. **README.md — corrigir badge Capacitor:**
```bash
# Substituir "Capacitor 8" por "Capacitor 7" (versão real no package.json é 7.6.1)
sed -i '' 's/Capacitor-8/Capacitor-7.6/g' README.md 2>/dev/null || sed -i 's/Capacitor-8/Capacitor-7.6/g' README.md
```

2. **Verificar que `webDir: 'out'` está correto:**
   - Para Capacitor funcionar com Next.js, o build mobile precisa gerar static export
   - O script `build:mobile` deve ter `NEXT_PUBLIC_PLATFORM=mobile next build`
   - O `next.config.mjs` deve ter lógica condicional para `output: 'export'` quando `NEXT_PUBLIC_PLATFORM=mobile`
   - Se isso não existe, adicionar:

```javascript
// Em next.config.mjs, adicionar:
const isMobileBuild = process.env.NEXT_PUBLIC_PLATFORM === 'mobile' || process.env.NEXT_PUBLIC_CAPACITOR === 'true';

const nextConfig = {
  // ... config existente ...
  ...(isMobileBuild ? { output: 'export' } : {}),
};
```

3. **README — remover menção a features de IA se foram escondidas:**
   - Se o Bloco 03 escondeu features de IA, atualizar o README para não listá-las
   - Ou mover para seção "Roadmap" do README

4. **Verificar que `android/app/build.gradle` tem versionCode correto:**
```bash
grep "versionCode\|versionName\|compileSdk\|targetSdk\|minSdk" android/app/build.gradle 2>/dev/null | head -10
```

5. **Verificar que `.gitignore` não inclui arquivos necessários para build iOS/Android:**
```bash
grep "ios\|android\|Pods\|xcworkspace" .gitignore | head -10
```

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "fix: consistência Capacitor, README, build config"
git push origin main
```

---

## BLOCO 08 — VERIFICAÇÃO FINAL ABSOLUTA + TAG
### Scan completo de tudo que pode causar rejeição

```bash
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  BLACKBELT APP — VERIFICAÇÃO FINAL ABSOLUTA PARA STORES    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

PASS=0
FAIL=0
WARN=0

check() {
  local label="$1"
  local result="$2"
  if [ "$result" = "0" ]; then
    echo "✅ $label"
    PASS=$((PASS + 1))
  elif [ "$result" = "warn" ]; then
    echo "⚠️  $label"
    WARN=$((WARN + 1))
  else
    echo "❌ $label"
    FAIL=$((FAIL + 1))
  fi
}

# === BUILD ===
echo ""
echo "=== BUILD ==="
pnpm typecheck 2>&1 > /dev/null && check "TypeScript: zero erros" "0" || check "TypeScript: tem erros" "1"
pnpm build 2>&1 > /dev/null && check "Build: limpo" "0" || check "Build: falhou" "1"

# === DOMÍNIOS/EMAILS ===
echo ""
echo "=== DOMÍNIOS E EMAILS ==="
GHOST_DOMAINS=$(grep -rn "blackbelt\.com\b" app/ components/ lib/ docs/ public/ capacitor.config.ts next.config.mjs --include="*.tsx" --include="*.ts" --include="*.json" --include="*.md" --include="*.mjs" 2>/dev/null | grep -v "blackbeltv2\.vercel\.app" | grep -v node_modules | grep -v ".git" | wc -l | tr -d ' ')
[ "$GHOST_DOMAINS" = "0" ] && check "Zero domínios fantasma (blackbelt.com)" "0" || check "DOMÍNIOS FANTASMA: $GHOST_DOMAINS ocorrências" "1"

GHOST_EMAILS=$(grep -rn "@blackbelt\.\(app\|com\)" app/ components/ lib/ docs/ public/ --include="*.tsx" --include="*.ts" --include="*.md" 2>/dev/null | grep -v "gregoryguimaraes12@gmail.com" | grep -v node_modules | wc -l | tr -d ' ')
[ "$GHOST_EMAILS" = "0" ] && check "Zero emails fantasma (@blackbelt.app)" "0" || check "EMAILS FANTASMA: $GHOST_EMAILS ocorrências" "1"

# === MONETIZAÇÃO ===
echo ""
echo "=== MONETIZAÇÃO (Apple 3.1.3a) ==="
test -f lib/platform.ts && check "lib/platform.ts existe" "0" || check "FALTA lib/platform.ts" "1"
PRICING_UNGUARDED=$(grep -rn "R\\\$" app/ components/ --include="*.tsx" 2>/dev/null | grep -v PricingGuard | grep -v node_modules | grep -v "test\|mock\|lib/\|docs/" | wc -l | tr -d ' ')
[ "$PRICING_UNGUARDED" -lt "3" ] && check "Preços protegidos por PricingGuard" "0" || check "PREÇOS SEM GUARD: $PRICING_UNGUARDED" "1"

# === FEATURES FANTASMA ===
echo ""
echo "=== FEATURES FANTASMA ==="
EM_BREVE=$(grep -rn "Em breve\|Coming soon\|em breve" app/ components/ --include="*.tsx" 2>/dev/null | grep -v node_modules | grep -v test | wc -l | tr -d ' ')
[ "$EM_BREVE" = "0" ] && check "Zero 'Em breve' no app" "0" || check "'EM BREVE' ENCONTRADO: $EM_BREVE" "1"

# === PRIVACY ===
echo ""
echo "=== PRIVACY ==="
find ios -name "PrivacyInfo.xcprivacy" 2>/dev/null | grep -q "." && check "PrivacyInfo.xcprivacy existe" "0" || check "FALTA PrivacyInfo.xcprivacy" "1"
grep -q "privacidade-menores" middleware.ts && check "/privacidade-menores no PUBLIC_PATHS" "0" || check "FALTA /privacidade-menores no PUBLIC_PATHS" "warn"

# === STORE DOCS ===
echo ""
echo "=== STORE DOCS ==="
test -f docs/STORE_METADATA.md && check "STORE_METADATA.md existe" "0" || check "FALTA STORE_METADATA.md" "1"
test -f docs/STORE_REVIEW_CREDENTIALS.md && check "STORE_REVIEW_CREDENTIALS.md existe" "0" || check "FALTA STORE_REVIEW_CREDENTIALS.md" "1"
test -f docs/APPLE_MONETIZATION_JUSTIFICATION.md && check "APPLE_MONETIZATION_JUSTIFICATION.md existe" "0" || check "FALTA APPLE_MONETIZATION_JUSTIFICATION.md" "1"

# === ASSETS ===
echo ""
echo "=== ASSETS ==="
find docs -name "*feature*graphic*" -o -name "*1024x500*" 2>/dev/null | grep -q "." && check "Feature graphic existe" "0" || check "FALTA feature graphic 1024x500" "warn"
find docs -name "*1024x1024*" -o -name "*app-icon*1024*" 2>/dev/null | grep -q "." && check "App icon 1024x1024 existe" "0" || check "FALTA app icon 1024x1024" "warn"

# === CÓDIGO LIMPO ===
echo ""
echo "=== CÓDIGO LIMPO ==="
TODOS=$(grep -rn "TODO\|FIXME\|HACK\|XXX" app/ components/ lib/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules | grep -v ".test." | wc -l | tr -d ' ')
[ "$TODOS" = "0" ] && check "Zero TODOs/FIXMEs" "0" || check "TODOs ENCONTRADOS: $TODOS" "warn"

CONSOLE_LOGS=$(grep -rn "console\.log" app/ components/ --include="*.tsx" 2>/dev/null | grep -v node_modules | grep -v "test\|debug\|monitor\|logger" | wc -l | tr -d ' ')
[ "$CONSOLE_LOGS" -lt "5" ] && check "console.logs mínimos" "0" || check "console.logs: $CONSOLE_LOGS" "warn"

# === URLS PÚBLICAS ===
echo ""
echo "=== URLs (verificar manualmente) ==="
echo "   https://blackbeltv2.vercel.app/login"
echo "   https://blackbeltv2.vercel.app/privacidade"
echo "   https://blackbeltv2.vercel.app/termos"
echo "   https://blackbeltv2.vercel.app/excluir-conta"
echo "   https://blackbeltv2.vercel.app/contato"
echo "   https://blackbeltv2.vercel.app/privacidade-menores"

# === RESUMO ===
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  RESULTADO FINAL                                            ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  ✅ Aprovados: $PASS                                        ║"
echo "║  ⚠️  Warnings: $WARN                                        ║"
echo "║  ❌ Falhas: $FAIL                                           ║"
echo "╚══════════════════════════════════════════════════════════════╝"

if [ "$FAIL" = "0" ]; then
  echo ""
  echo "🎯 ZERO FALHAS — PRONTO PARA STORES"
else
  echo ""
  echo "🚨 $FAIL FALHAS PRECISAM SER CORRIGIDAS ANTES DE SUBMETER"
fi
```

**Se ZERO falhas — tag final:**

```bash
git add -A && git commit -m "chore: verificação final absoluta — zero barreiras para stores"
git push origin main

git tag -a v5.2.0-zero-barriers -m "BlackBelt App v5.2.0 — Zero Barreiras para Stores
- fix: domínios/emails fantasma eliminados
- feat: monetização store-safe (PricingGuard)
- fix: features fantasma escondidas (zero 'Em breve')
- feat: PrivacyInfo.xcprivacy completo
- docs: STORE_METADATA + REVIEW_CREDENTIALS + MONETIZATION
- feat: feature graphic 1024x500 + app icon 1024x1024
- fix: consistência Capacitor/README/build
- check: verificação final 100% aprovada"

git push origin v5.2.0-zero-barriers

echo ""
echo "═══════════════════════════════════════════════════"
echo "  PRÓXIMOS PASSOS (ações manuais do Gregory):"
echo "═══════════════════════════════════════════════════"
echo ""
echo "  1. Criar conta Apple Developer ($99/ano)"
echo "     → developer.apple.com/programs/enroll"
echo ""
echo "  2. Criar conta Google Play Console ($25)"
echo "     → play.google.com/console/signup"
echo ""
echo "  3. No Mac: pnpm mobile:ios → Xcode → testar no iPhone"
echo ""
echo "  4. No Mac: pnpm mobile:android → Android Studio → testar no Android"
echo ""
echo "  5. App Store Connect:"
echo "     - Criar App ID"
echo "     - Preencher Age Rating (4+)"
echo "     - Preencher Privacy Labels"
echo "     - Copiar Review Notes de docs/STORE_REVIEW_CREDENTIALS.md"
echo "     - Upload screenshots reais do dispositivo"
echo ""
echo "  6. Google Play Console:"
echo "     - Criar app listing"
echo "     - Preencher Content Rating (IARC)"
echo "     - Preencher Data Safety"
echo "     - Upload feature graphic de docs/store-assets/"
echo "     - Internal testing track → Production"
echo ""
echo "═══════════════════════════════════════════════════"
```

---

## COMANDO DE RETOMADA

```
Retome a execução do prompt ZERO BARREIRAS PARA STORES do BlackBelt App. Verifique o último commit com `git log --oneline -5` e continue do próximo BLOCO. Regras: pnpm typecheck && pnpm build → commit → push entre cada bloco. NUNCA delete isMock(). CSS var(--bb-*). Toast PT-BR. O objetivo é eliminar TODAS as barreiras técnicas, legais e de metadata que impedem publicação nas stores.
```

---

## FIM DO MEGA PROMPT

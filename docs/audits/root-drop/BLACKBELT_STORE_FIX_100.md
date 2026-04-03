# 🥋 BLACKBELT V2 — STORE FIX 100% (MULTI-AGENT TEAM)
# Corrigir TODOS os bloqueadores da auditoria de stores
# Resultado: 100% pronto para Apple App Store + Google Play
# Referência: docs/store/RELATORIO_STORE_READINESS.md

---

Leia PRIMEIRO o relatório em `docs/store/RELATORIO_STORE_READINESS.md` e TODOS os 7 relatórios em `docs/store/01_*.md` até `docs/store/07_*.md`. Eles contêm os gaps EXATOS encontrados pela auditoria de 7 agents. Seu trabalho é CORRIGIR CADA ❌ e ⚠️ até atingir 100%.

## REGRAS

1. `npx tsc --noEmit` = 0 erros após CADA agent
2. `pnpm build` = limpo após CADA agent
3. Commit entre cada agent
4. NUNCA delete blocos `isMock()`
5. CSS: `var(--bb-depth-*)`, `var(--bb-ink-*)`, `var(--bb-brand)` — ZERO hardcoded
6. Toast PT-BR em toda mutação
7. Mobile-first, 44px touch targets
8. Ser RIGOROSO — testar que cada fix realmente resolve o ❌

## EXECUÇÃO — 8 AGENTS

Primeiro leia TODOS os relatórios de auditoria:
```bash
cat docs/store/RELATORIO_STORE_READINESS.md
ls docs/store/
```

Depois execute 8 agents. Os primeiros 2 são SEQUENCIAIS (dependências), os últimos 6 em PARALELO:

```
# SEQUENCIAIS (ordem importa):
1. Agent("Store Fix: UGC Moderation System") → precisa existir antes do Agent de conteúdo
2. Agent("Store Fix: Account Deletion + Privacy") → precisa existir antes do Agent legal

# PARALELOS (sem dependências entre si):
3-8 em paralelo:
Agent("Store Fix: Capacitor Native Features")
Agent("Store Fix: Store Listing + Metadata + Screenshots")
Agent("Store Fix: Monetization Compliance")
Agent("Store Fix: Content Rating + Age + COPPA")
Agent("Store Fix: Accessibility + Design Polish")
Agent("Store Fix: Security + Legal + Pre-submission")
```

---

## AGENT 1 — UGC MODERATION SYSTEM (Sequencial, primeiro)

**Problema:** Apple 1.2 e Google 4.19 exigem moderação para UGC (mensagens, vídeos, comentários).

### 1.1 — Verificar se já existe sistema de report

```bash
grep -rn "report\|Report\|denunci\|Denunci\|block.*user\|bloquear.*usuario\|content_reports" app/ components/ lib/ supabase/ --include="*.tsx" --include="*.ts" --include="*.sql" | grep -v node_modules | head -20
```

### 1.2 — Se NÃO existe, criar completo:

**Migration** `supabase/migrations/083_ugc_moderation.sql`:
```sql
-- Sistema de moderação UGC (Apple 1.2 + Google 4.19)
CREATE TABLE IF NOT EXISTS content_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID REFERENCES academies(id),
  reporter_id UUID NOT NULL REFERENCES auth.users(id),
  reported_user_id UUID REFERENCES auth.users(id),
  content_type TEXT NOT NULL CHECK (content_type IN ('message','video','comment','profile','other')),
  content_id UUID,
  reason TEXT NOT NULL CHECK (reason IN ('spam','harassment','inappropriate','hate_speech','violence','other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','reviewing','resolved','dismissed')),
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_reports_academy ON content_reports(academy_id, status);
CREATE INDEX idx_reports_reporter ON content_reports(reporter_id);
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

-- Qualquer user autenticado pode criar report
CREATE POLICY reports_insert ON content_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
-- Admin/SuperAdmin vê reports
CREATE POLICY reports_admin ON content_reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin','superadmin'))
);
-- Admin pode atualizar status
CREATE POLICY reports_update ON content_reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin','superadmin'))
);

-- Tabela de usuários bloqueados
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL REFERENCES auth.users(id),
  blocked_id UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY blocked_own ON blocked_users FOR ALL USING (auth.uid() = blocker_id);
```

**API Route** `app/api/report/route.ts`:
- POST: criar report (autenticado)
- GET: listar reports (admin/superadmin)
- PATCH: atualizar status (admin/superadmin)

**Componente** `components/shared/ReportButton.tsx`:
- Botão com ícone Flag
- Modal com: tipo de conteúdo, razão (select), descrição (textarea)
- Toast: "Denúncia enviada. Nossa equipe vai analisar."
- Mínimo 44px touch target
- CSS variables

**Componente** `components/shared/BlockUserButton.tsx`:
- Botão para bloquear usuário
- Confirmação antes de bloquear
- Toast: "Usuário bloqueado."

**Integrar ReportButton** em TODAS as páginas com UGC:
```bash
# Encontrar páginas com mensagens, chat, feed, comunicados, vídeos
find app -name "page.tsx" | xargs grep -l "message\|mensag\|chat\|feed\|comunicado\|video\|comentario" | grep -v node_modules | head -20
```
Adicionar `<ReportButton />` ao lado de cada mensagem/post/vídeo.

**Página de moderação para Admin**: `app/(admin)/admin/moderacao/page.tsx`
- Lista de reports pendentes
- Ações: Revisar, Resolver, Dispensar
- Filtro por status e tipo

```bash
npx tsc --noEmit && pnpm build
git add -A && git commit -m "store-fix: UGC moderation — reports, block users, ReportButton, admin moderation page"
```

---

## AGENT 2 — ACCOUNT DELETION + PRIVACY (Sequencial, segundo)

**Problema:** Apple 3.18 e Google exigem exclusão de conta acessível sem login.

### 2.1 — Verificar estado atual

```bash
find app -path "*excluir*" -o -path "*delete*account*" | grep -v node_modules
grep -rn "excluir.*conta\|delete.*account\|apagar.*dados" app/ --include="*.tsx" | head -10
# Verificar se é acessível sem auth
grep -rn "excluir\|delete-account" middleware.ts | head -5
```

### 2.2 — Criar/corrigir página de exclusão

A página `/excluir-conta` DEVE:
- Ser acessível SEM login (rota pública no middleware)
- Se logado: botão "Excluir minha conta" → confirmação → API call
- Se NÃO logado: formulário com email para solicitar exclusão
- API route que processa exclusão (soft delete ou anonimização)
- Conformidade LGPD: explicar quais dados são retidos e por quanto tempo

Criar `app/(public)/excluir-conta/page.tsx` (rota pública):
```tsx
// Duas experiências:
// 1. Logado → botão direto + confirmação dupla
// 2. Não logado → formulário com email + mensagem de confirmação
```

Criar `app/api/account/delete/route.ts`:
- Se autenticado: soft delete do profile + anonymize data
- Se via formulário: criar ticket de exclusão (tabela deletion_requests)

Adicionar `/excluir-conta` às rotas públicas no middleware.

Verificar que retorna 200:
```bash
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/excluir-conta"
# DEVE ser 200, não 307/redirect
```

### 2.3 — Privacy Policy completar se necessário

Verificar conteúdo:
```bash
cat app/\(public\)/privacidade/page.tsx 2>/dev/null | wc -l
```

Garantir que inclui:
- Quais dados são coletados (nome, email, CPF, data nascimento, presença, vídeos)
- Como são usados
- Com quem são compartilhados (Supabase, Bunny Stream, Asaas)
- Direitos LGPD do titular (acesso, correção, exclusão, portabilidade)
- Como solicitar exclusão
- Dados de menores (COPPA/LGPD: consentimento parental)
- Contato do responsável

### 2.4 — Termos de Uso — adicionar cláusulas UGC

Abrir termos e verificar se tem seção sobre UGC:
```bash
cat app/\(public\)/termos/page.tsx 2>/dev/null | grep -i "conteúdo\|ugc\|mensag\|vídeo\|denúncia\|proibido" | head -10
```

Se não tem, adicionar seção:
```
## Conteúdo Gerado por Usuários

O usuário se compromete a não publicar conteúdo que:
- Seja ilegal, ofensivo, discriminatório ou que incite violência
- Viole direitos de propriedade intelectual de terceiros
- Contenha spam, phishing ou links maliciosos
- Exponha dados pessoais de terceiros sem consentimento

A plataforma se reserva o direito de:
- Remover conteúdo que viole estes termos
- Suspender ou banir contas reincidentes
- Colaborar com autoridades quando exigido por lei

Para denunciar conteúdo inadequado, use o botão de denúncia disponível em cada mensagem/vídeo.
```

```bash
npx tsc --noEmit && pnpm build
git add -A && git commit -m "store-fix: account deletion + privacy + UGC terms"
```

---

## AGENTS 3-8 EM PARALELO

Agora lance os 6 agents restantes em paralelo:

```
Agent("Store Fix: Capacitor Native Features")
Agent("Store Fix: Store Listing + Metadata + Screenshots")
Agent("Store Fix: Monetization Compliance")
Agent("Store Fix: Content Rating + COPPA")
Agent("Store Fix: Accessibility + Design Polish")
Agent("Store Fix: Security + Legal + Pre-submission")
```

---

## AGENT 3 — CAPACITOR NATIVE FEATURES

**Problema:** Apple 4.2 — app não pode ser apenas WebView wrapper.

### 3.1 — Verificar Capacitor atual

```bash
cat capacitor.config.ts 2>/dev/null || cat capacitor.config.json 2>/dev/null
cat package.json | grep -i "@capacitor" | head -20
ls ios/ 2>/dev/null && echo "iOS EXISTS" || echo "NO iOS"
ls android/ 2>/dev/null && echo "Android EXISTS" || echo "NO Android"
```

### 3.2 — Se Capacitor não está configurado, instalar

```bash
# Verificar se já tem
npm ls @capacitor/core 2>/dev/null || echo "NOT INSTALLED"
```

Se não tem:
```bash
pnpm add @capacitor/core @capacitor/cli
pnpm add @capacitor/app @capacitor/haptics @capacitor/keyboard @capacitor/status-bar @capacitor/splash-screen @capacitor/push-notifications @capacitor/camera @capacitor/browser @capacitor/share @capacitor/local-notifications @capacitor/device @capacitor/network
npx cap init "BlackBelt" "app.blackbelt.academy" --web-dir=out 2>/dev/null || echo "Already initialized"
```

### 3.3 — Configurar capacitor.config.ts

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.blackbelt.academy',
  appName: 'BlackBelt',
  webDir: 'out',
  server: {
    url: 'https://blackbelts.com.br',
    androidScheme: 'https',
    iosScheme: 'https',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
      backgroundColor: '#0a0a0a',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0a0a0a',
    },
  },
  ios: {
    contentInset: 'automatic',
    scheme: 'BlackBelt',
  },
  android: {
    backgroundColor: '#0a0a0a',
    allowMixedContent: false,
  },
};

export default config;
```

### 3.4 — Platform detection helper

Criar `lib/utils/platform.ts` se não existe:
```typescript
import { Capacitor } from '@capacitor/core';

export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

export function isIOS(): boolean {
  return Capacitor.getPlatform() === 'ios';
}

export function isAndroid(): boolean {
  return Capacitor.getPlatform() === 'android';
}

export function isWeb(): boolean {
  return Capacitor.getPlatform() === 'web';
}
```

### 3.5 — Native feature hooks

Criar hooks que usam plugins nativos quando disponíveis:

`lib/hooks/useHaptics.ts`:
```typescript
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { isNative } from '@/lib/utils/platform';

export function useHaptics() {
  const impact = async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (isNative()) {
      await Haptics.impact({ style });
    }
  };
  const notification = async (type: 'success' | 'warning' | 'error' = 'success') => {
    if (isNative()) {
      await Haptics.notification({ type: type as any });
    }
  };
  return { impact, notification };
}
```

`lib/hooks/useNativeShare.ts`:
```typescript
import { Share } from '@capacitor/share';
import { isNative } from '@/lib/utils/platform';

export function useNativeShare() {
  const share = async (title: string, text: string, url?: string) => {
    if (isNative()) {
      await Share.share({ title, text, url });
    } else if (navigator.share) {
      await navigator.share({ title, text, url });
    }
  };
  return { share };
}
```

### 3.6 — Safe areas CSS

Verificar e adicionar safe area padding para notch:
```bash
grep -rn "safe-area\|env(safe-area" app/ components/ --include="*.tsx" --include="*.css" | head -5
```

Se não tem, adicionar ao layout root:
```css
/* No global CSS ou no layout principal */
:root {
  --safe-area-top: env(safe-area-inset-top, 0px);
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
}
```

E aplicar no header e bottom nav dos shells.

### 3.7 — Build scripts mobile

Adicionar ao `package.json`:
```json
{
  "scripts": {
    "cap:sync": "npx cap sync",
    "cap:ios": "npx cap open ios",
    "cap:android": "npx cap open android"
  }
}
```

```bash
npx tsc --noEmit && pnpm build
git add -A && git commit -m "store-fix: Capacitor native — plugins, platform detection, haptics, share, safe areas"
```

---

## AGENT 4 — STORE LISTING + METADATA + SCREENSHOTS

**Problema:** 46% — sem screenshots, sem descrições, sem feature graphic.

### 4.1 — Verificar o que já existe

```bash
ls docs/store-screenshots/ 2>/dev/null || echo "NO SCREENSHOTS DIR"
cat docs/store/STORE_METADATA.md 2>/dev/null || cat docs/STORE_METADATA.md 2>/dev/null || echo "NO METADATA"
cat docs/STORE_REVIEW_CREDENTIALS.md 2>/dev/null || echo "NO REVIEW CREDENTIALS"
find public -name "icon*" -o -name "logo*" | head -10
```

### 4.2 — Gerar screenshots automatizados

Criar script `scripts/generate-store-screenshots.ts` que usa Playwright:
- Viewport iPhone 15 Pro Max (430x932) e Pixel 7 (412x915)
- Login como cada perfil principal (admin, professor, aluno, responsavel)
- Captura: landing, dashboard, presença, turmas, financeiro, compete, perfil, check-in
- Salva em `docs/store-screenshots/`

```bash
npx playwright install chromium 2>/dev/null
# Gerar o script e rodar
```

Se Playwright não funcionar no ambiente, gerar instruções manuais para Gregory.

### 4.3 — Criar/atualizar STORE_METADATA.md

```markdown
# BlackBelt — Store Metadata

## App Name (≤30): BlackBelt

## Subtitle/Short (≤30/≤80):
Apple: Gestão de Academias
Google: Gerencie sua academia de artes marciais: alunos, presenças, graduações e pagamentos.

## Full Description (PT-BR, ≤4000 chars):
BlackBelt é a plataforma completa de gestão para academias de artes marciais.

Desenvolvido por quem entende o tatame, o BlackBelt oferece:

• Check-in digital e biométrico de alunos
• Controle de presenças e histórico completo
• Gestão de graduações e faixas (BJJ, Judô, Karatê, MMA)
• Turmas com horários e calendário
• Dashboard financeiro com mensalidades e inadimplência
• Perfil para professores com chamada digital e upload de vídeos
• Módulo Kids com interface lúdica e segura (sem mensagens)
• Módulo Teen com gamificação: XP, badges, streaks
• Dashboard para responsáveis acompanharem os filhos
• Compete: campeonatos com bracket view e placar ao vivo
• Notificações push para lembrar treinos e comunicados

Ideal para:
- Donos de academias que querem sair das planilhas
- Professores que precisam de chamada digital
- Alunos que querem acompanhar sua evolução
- Pais que querem saber se o filho treinou

Teste grátis por 7 dias. Planos a partir de R$97/mês.

## Keywords (Apple):
academia, artes marciais, bjj, jiu-jitsu, judô, karatê, mma, gestão, presença, alunos, graduação, faixa, check-in, treino

## Category:
Apple: Business
Google: Business

## Contact:
Email: gregoryguimaraes12@gmail.com (ou gregoryguimaraes12@gmail.com enquanto não tem domínio)
Website: https://blackbelts.com.br

## Age Rating:
Apple: 4+ (sem violência, conteúdo adulto, gambling)
Google: Everyone (com Parental guidance para módulo kids)
```

### 4.4 — Criar STORE_REVIEW_CREDENTIALS.md

```markdown
# Credenciais para Revisão — Apple + Google

## Demo Account
Email: reviewer@guerreiros.com
Password: BlackBelt@2026
Role: admin
Academy: Guerreiros do Tatame (demo)

## Backend
URL: https://blackbelts.com.br
Status: Ativo 24/7 (Vercel + Supabase)

## Test Instructions
1. Open app → Login screen
2. Enter credentials above → Admin dashboard
3. Key features to test:
   - Dashboard with real-time metrics
   - Student check-in (Alunos → Check-in)
   - Attendance history (Presença)
   - Belt graduation management (Graduações)
   - Class schedule (Turmas)
   - Financial overview (Financeiro)
   - Professor video upload (login as professor@guerreiros.com)

## Additional Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Super Admin | gregoryguimaraes12@gmail.com | @Greg1994 |
| Professor | andre@guerreiros.com | BlackBelt@2026 |
| Student | joao@email.com | BlackBelt@2026 |
| Guardian | maria.resp@email.com | BlackBelt@2026 |

## Notes for Reviewers
- This is a B2B SaaS for martial arts academy management
- Payments are processed via external gateway (Asaas), not via IAP
  (Apple Guideline 3.1.3(a): business SaaS for professional use)
- Kids module is restricted: no messaging, simplified UI, age-appropriate
- Videos are hosted via Bunny Stream CDN (no user-generated video on device)
- The app requires login because all functionality is tied to academy membership
```

### 4.5 — Gerar ícones em todos os tamanhos

Criar script para gerar ícones placeholder ou verificar que existem:
```bash
ls public/icons/ 2>/dev/null | head -20
```

Se faltam tamanhos, criar SVG placeholder e converter.

```bash
npx tsc --noEmit && pnpm build
git add -A && git commit -m "store-fix: metadata, screenshots, review credentials, icons"
```

---

## AGENT 5 — MONETIZATION COMPLIANCE

**Problema:** Apple 3.1.1 — preços visíveis no app nativo podem parecer contornar IAP.

### 5.1 — Verificar páginas de preço no app

```bash
grep -rn "R\$\|97\|197\|347\|597\|starter\|essencial\|plano" app/ --include="*.tsx" | grep -iv "mock\|seed\|test\|import\|type\|interface\|const.*=.*'" | head -20
find app -path "*planos*" -o -path "*pricing*" -o -path "*assinatura*" | grep -v node_modules
```

### 5.2 — Se existem preços no app nativo

Quando em plataforma nativa (Capacitor), os preços NÃO devem aparecer dentro do app com botão de compra. Em vez disso:

```tsx
// Na página de planos, quando em modo nativo:
import { isNative } from '@/lib/utils/platform';

// Se nativo: redirecionar para o site
if (isNative()) {
  return (
    <div>
      <p>Para gerenciar sua assinatura, acesse:</p>
      <a href="https://blackbelts.com.br/planos" target="_blank">
        Gerenciar Assinatura
      </a>
    </div>
  );
}
// Se web: mostrar preços normalmente
```

### 5.3 — Criar documento de argumentação

Criar `docs/store/APPLE_MONETIZATION_JUSTIFICATION.md`:

```markdown
# Apple Guideline 3.1.3(a) — Reader/SaaS Exemption

## App: BlackBelt
## Category: B2B SaaS — Business Management

## Justification

BlackBelt is a Software-as-a-Service (SaaS) platform for martial arts
academy management. It falls under Apple's Guideline 3.1.3(a) exemption
for "business apps that are used by employees of a company or organizations."

### Why IAP is not applicable:
1. **The customer is a business (academy), not an individual consumer**
2. **The service is consumed outside the app** (management of physical
   attendance, classes, and students)
3. **Similar apps in the category use external payments:**
   - Mindbody (fitness studio management)
   - Wodify (CrossFit box management)
   - Glofox (gym management)
   - Zen Planner (martial arts management)
   All use external payment processing, not IAP.

### Revenue model:
- B2B monthly subscription (academy pays)
- Plans: Starter R$97/mo, Essencial R$197/mo, Pro R$347/mo, BlackBelt R$597/mo
- 7-day free trial
- Payment processor: Asaas (Brazilian payment gateway)

### In-app behavior:
- The iOS/Android app does NOT show pricing or purchase flows
- Subscription management is done via the web portal
- The app is a consumption tool for the SaaS service
```

### 5.4 — Verificar Asaas integration

```bash
grep -rn "asaas\|Asaas\|ASAAS" app/ lib/ --include="*.ts" --include="*.tsx" | head -10
grep -rn "ASAAS" .env* 2>/dev/null | head -5
```

Se Asaas não está configurado, garantir que o app funciona gracefully sem ele (fallback para mock ou mensagem "Configurar pagamentos").

```bash
npx tsc --noEmit && pnpm build
git add -A && git commit -m "store-fix: monetization compliance — native price hiding, Apple justification doc"
```

---

## AGENT 6 — CONTENT RATING + COPPA

**Problema:** 48% — classificação etária, COPPA para Kids.

### 6.1 — Verificar Kids profile isolation

```bash
# Kids NÃO pode acessar:
find app -path "*kids*" -name "*.tsx" | xargs grep -l "message\|chat\|mensag" 2>/dev/null
# DEVE retornar vazio

# Kids NÃO vê conteúdo adulto
find app -path "*kids*" -name "page.tsx" | head -10
```

### 6.2 — COPPA compliance

Criar `docs/store/COPPA_COMPLIANCE.md`:
```markdown
# COPPA Compliance — BlackBelt

## Children's Data Collection
- Kids profile (under 13) collects: name, belt rank, attendance
- NO personal identifiers beyond what's needed for academy membership
- NO advertising or analytics on kids' views
- NO messaging or social features for kids

## Parental Consent
- Kids accounts are ONLY created by Academy Admin or Guardian
- Guardian (parent) must have an active account to create a kid's account
- Guardian can view, modify, and delete their child's data
- Guardian can delete child's account at any time

## Data Handling
- Kids data is stored in the same secure database (Supabase with RLS)
- Kids data is never shared with third parties for advertising
- Kids data is accessible only by: the child, their guardian, academy admin
```

### 6.3 — Parental gate verification

Verificar que Kids não pode criar conta sozinho:
```bash
grep -rn "kids\|aluno_kids" app/api/auth/ --include="*.ts" | head -10
# Kids registration should ONLY be possible via Admin or Guardian
```

Se kids pode se auto-registrar, bloquear:
```typescript
// No registro, se role = aluno_kids, exigir guardian_id
```

### 6.4 — Content classification notes

O app contém artes marciais (BJJ, MMA) mas:
- NÃO tem vídeos de luta/violência no app (vídeos são de técnicas educacionais)
- NÃO tem gambling (Compete é campeonato esportivo, sem apostas)
- NÃO tem conteúdo sexualmente explícito
- NÃO tem drogas/álcool

Classificação recomendada: 4+ (Apple) / Everyone (Google)
Com nota: "Contains mild martial arts training content"

```bash
npx tsc --noEmit && pnpm build
git add -A && git commit -m "store-fix: COPPA compliance, content rating docs, kids isolation verified"
```

---

## AGENT 7 — ACCESSIBILITY + DESIGN POLISH

**Problema:** 81% — ajustes finais de acessibilidade e design.

### 7.1 — Audit completo de acessibilidade

```bash
# Botões sem aria-label
grep -rn "<button" app/ components/ --include="*.tsx" | grep -v "aria-label\|>{" | grep "onClick" | head -20

# Imagens sem alt
grep -rn "<img\|<Image" app/ components/ --include="*.tsx" | grep -v "alt=" | head -10

# Inputs sem label associado
grep -rn "<input\|<Input" app/ components/ --include="*.tsx" | grep -v "aria-label\|id=.*label\|htmlFor" | head -10

# Focus visible
grep -rn "focus:ring\|focus-visible\|outline-none" app/ components/ --include="*.tsx" | head -10

# Color contrast — verificar se text é legível
grep -rn "text-gray-400\|text-gray-300\|ink-4\|ink-5" app/ components/ --include="*.tsx" | head -10
```

Corrigir TODOS os problemas encontrados.

### 7.2 — Dynamic Type support

Verificar que fontes usam unidades relativas:
```bash
grep -rn "font-size.*px\|fontSize.*[0-9]px" app/ components/ --include="*.tsx" --include="*.css" | grep -v "node_modules\|tailwind" | head -10
```

### 7.3 — Dark mode consistency

```bash
# Verificar se todas as cores usam CSS variables
grep -rn "#[0-9a-fA-F]\{6\}" app/ components/ --include="*.tsx" | grep -v "node_modules\|config\|svg\|var(--" | head -10
```

### 7.4 — Verificar que /contato e /suporte existem e funcionam

```bash
find app -path "*contato*" -name "page.tsx" | head -3
find app -path "*suporte*" -name "page.tsx" | head -3
```

Se não existem, criar páginas básicas com:
- Email de contato
- Formulário de contato
- Link para feedback
- FAQ básico

```bash
npx tsc --noEmit && pnpm build
git add -A && git commit -m "store-fix: accessibility audit, dark mode, contact/support pages"
```

---

## AGENT 8 — SECURITY + LEGAL + PRE-SUBMISSION

**Problema:** 73% — ajustes finais de segurança e documentação legal.

### 8.1 — Security headers

```bash
cat next.config.mjs 2>/dev/null | grep -A20 "headers"
```

Garantir que tem:
```js
headers: [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
]
```

### 8.2 — Verificar VULN-001 fix está aplicado

```bash
cat supabase/migrations/082_fix_role_escalation.sql | head -5
```

### 8.3 — Limpar TODOs e placeholders

```bash
grep -rn "TODO\|FIXME\|HACK\|XXX\|placeholder\|lorem ipsum\|coming soon" app/ components/ --include="*.tsx" | grep -v node_modules | head -20
```

Resolver CADA TODO encontrado — implementar ou remover.

### 8.4 — Verificar todas as URLs públicas

```bash
# Páginas que precisam funcionar sem auth
for PAGE in privacidade termos contato suporte excluir-conta feedback; do
  FILE=$(find app -path "*${PAGE}*" -name "page.tsx" | head -1)
  if [ -n "$FILE" ]; then
    echo "✅ /${PAGE} → $FILE"
  else
    echo "❌ /${PAGE} → NÃO EXISTE"
  fi
done

# Verificar middleware não bloqueia
grep -n "publicRoutes\|matcher\|config" middleware.ts | head -10
```

Se alguma página pública não existe, criar.

### 8.5 — Versão do app

```bash
cat package.json | grep '"version"'
```

Atualizar para versão de release se necessário (ex: "1.0.0").

### 8.6 — Gerar checklist final

Criar `docs/store/CHECKLIST_FINAL.md`:
```markdown
# BlackBelt v2 — Checklist Final Pré-Submissão

## Apple App Store
- [ ] Apple Developer Account criada ($99/ano)
- [ ] Certificados de distribuição gerados
- [ ] Provisioning profiles configurados
- [ ] App ID registrado: app.blackbelt.academy
- [ ] Sign In with Apple configurado no Supabase
- [ ] Build via Xcode: npx cap open ios → Archive → Upload
- [ ] Screenshots reais (iPhone 6.7", iPad se necessário)
- [ ] App Store Connect: metadata preenchido (STORE_METADATA.md)
- [ ] App Store Connect: Privacy Labels preenchidos
- [ ] App Store Connect: Age Rating respondido
- [ ] App Store Connect: Review notes com STORE_REVIEW_CREDENTIALS.md
- [ ] App Store Connect: Support URL = /contato ou /suporte
- [ ] App Store Connect: Privacy Policy URL = /privacidade

## Google Play Store
- [ ] Google Play Console conta criada ($25)
- [ ] Verificação de identidade concluída
- [ ] Android keystore gerado
- [ ] Build: npx cap open android → Generate Signed AAB
- [ ] Play Console: Store listing completa (STORE_METADATA.md)
- [ ] Play Console: Data Safety section preenchida
- [ ] Play Console: Content Rating (IARC) respondido
- [ ] Play Console: Target audience declarado
- [ ] Play Console: App access instructions (STORE_REVIEW_CREDENTIALS.md)
- [ ] Play Console: Privacy Policy URL = /privacidade
- [ ] Play Console: Contact email configurado
- [ ] Play Console: Country distribution = Brasil
- [ ] Play Console: Pricing = Free (SaaS cobra fora)

## Ambas
- [ ] Backend ativo e acessível (Vercel + Supabase)
- [ ] Conta demo funcional (reviewer@guerreiros.com)
- [ ] Asaas configurado (ou graceful degradation)
- [ ] Resend configurado (ou graceful degradation)
- [ ] Zero crashes, zero TypeScript errors, build limpo
- [ ] Domínio próprio (recomendado mas não obrigatório)
```

```bash
npx tsc --noEmit && pnpm build
git add -A && git commit -m "store-fix: security headers, TODOs cleaned, legal pages, pre-submission checklist"
```

---

## VERIFICAÇÃO FINAL (Após todos os 8 agents)

```bash
npx tsc --noEmit
pnpm build 2>&1 | tail -15

# Re-audit rápido
echo "=== QUICK RE-AUDIT ==="
echo "UGC Report System:"
test -f components/shared/ReportButton.tsx && echo "  ✅ ReportButton" || echo "  ❌ ReportButton"
test -f app/api/report/route.ts && echo "  ✅ API route" || echo "  ❌ API route"

echo "Account Deletion:"
find app -path "*excluir*" -name "page.tsx" | head -1 | xargs -I{} echo "  ✅ {}" || echo "  ❌ no page"

echo "Privacy + Terms:"
find app -path "*privacidade*" -name "page.tsx" | head -1 | xargs -I{} echo "  ✅ {}" || echo "  ❌ no page"
find app -path "*termos*" -name "page.tsx" | head -1 | xargs -I{} echo "  ✅ {}" || echo "  ❌ no page"

echo "Contact + Support:"
find app -path "*contato*" -name "page.tsx" -o -path "*suporte*" -name "page.tsx" | head -2

echo "Capacitor:"
cat capacitor.config.ts 2>/dev/null | head -3 && echo "  ✅ configured" || echo "  ❌ no config"

echo "Store Metadata:"
test -f docs/store/STORE_METADATA.md && echo "  ✅ STORE_METADATA.md" || echo "  ❌ missing"
test -f docs/STORE_REVIEW_CREDENTIALS.md && echo "  ✅ REVIEW_CREDENTIALS" || echo "  ❌ missing"
test -f docs/store/APPLE_MONETIZATION_JUSTIFICATION.md && echo "  ✅ Apple monetization doc" || echo "  ❌ missing"
test -f docs/store/COPPA_COMPLIANCE.md && echo "  ✅ COPPA doc" || echo "  ❌ missing"
test -f docs/store/CHECKLIST_FINAL.md && echo "  ✅ Checklist final" || echo "  ❌ missing"

echo "TODOs:"
grep -rn "TODO\|FIXME" app/ components/ --include="*.tsx" | grep -v node_modules | wc -l | xargs -I{} echo "  {} TODOs restantes"

echo "Hardcoded colors:"
grep -rn "#[0-9a-fA-F]\{6\}" app/ components/ --include="*.tsx" | grep -v "node_modules\|config\|svg\|var(--" | wc -l | xargs -I{} echo "  {} cores hardcoded"

git add -A && git commit -m "store-fix: verificação final — 100% store ready"
git tag -a v4.0.0-store-ready -m "BlackBelt v2 — 100% ready for Apple App Store + Google Play"
git push origin main --tags

echo "═══════════════════════════════════════"
echo "  🥋 BLACKBELT 100% STORE READY"
echo "  Tag: v4.0.0-store-ready"
echo "  Docs: docs/store/"
echo "═══════════════════════════════════════"
```

---

## EXECUÇÃO

1. Ler TODOS os relatórios em docs/store/
2. Agent 1 (UGC) — sequencial
3. Agent 2 (Deletion + Privacy) — sequencial
4. Agents 3-8 — paralelo
5. Verificação final

COMECE LENDO OS RELATÓRIOS AGORA.

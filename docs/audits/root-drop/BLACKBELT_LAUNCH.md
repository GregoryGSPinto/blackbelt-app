# BLACKBELT v2 — PRODUCTION LAUNCH: LEGAL + STORES + OPERACIONAL
# Tudo que falta para publicar nas stores e vender para academias

## CONTEXTO

O BlackBelt v2 tem:
- 227 services 100% reais (após prompt anterior)
- 234 tabelas com RLS, 379 policies
- 9 perfis completos com auth real
- Gateway de pagamento plugável (Asaas/Stripe/Manual)
- PWA com Service Worker + offline check-in
- Build zero erros

Este prompt adiciona: páginas legais (LGPD), Capacitor build (iOS/Android), store assets,
onboarding self-service para academias, email transacional, e tudo que falta para vender.

---

## REGRAS ABSOLUTAS

1. **NÃO quebrar o que já funciona.** Testar build após CADA seção.
2. **isMock() preservado** em TUDO.
3. **handleServiceError** em CADA catch.
4. **Mobile-first.** Tudo funciona no celular primeiro.
5. **pnpm typecheck && pnpm build** — ZERO erros a cada seção.
6. **Commit a cada seção.**

---

## SEÇÃO 1 — PÁGINAS LEGAIS: LGPD + STORES (15 min)

Apple e Google **exigem** Política de Privacidade e Termos de Uso.
LGPD **exige** consentimento parental para menores de 18.

### 1A. Política de Privacidade

Criar `app/(public)/privacidade/page.tsx`:

```tsx
export default function PrivacidadePage() {
  return (
    <div className="min-h-screen py-12 px-4 max-w-3xl mx-auto" style={{ background: 'var(--bb-depth-0)', color: 'var(--bb-ink-100)' }}>
      <h1 className="text-3xl font-bold mb-8">Política de Privacidade</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--bb-ink-400)' }}>
        Última atualização: {new Date().toLocaleDateString('pt-BR')}
      </p>

      <section className="space-y-6 text-sm leading-relaxed" style={{ color: 'var(--bb-ink-200)' }}>
        <div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--bb-ink-100)' }}>1. Quem Somos</h2>
          <p>BlackBelt é uma plataforma de gestão para academias de artes marciais, desenvolvida por Gregory Pinto.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--bb-ink-100)' }}>2. Dados que Coletamos</h2>
          <p>Dados de cadastro (nome, email, telefone, data de nascimento), dados de uso (frequência, progresso, graduação), dados de pagamento (processados por gateway terceiro — não armazenamos dados de cartão).</p>
          <p className="mt-2">Dados de menores de 18 anos são coletados apenas com consentimento expresso do responsável legal.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--bb-ink-100)' }}>3. Como Usamos</h2>
          <p>Gestão operacional da academia (presença, turmas, comunicação, financeiro), melhoria do serviço, comunicação com o usuário.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--bb-ink-100)' }}>4. Compartilhamento</h2>
          <p>Não vendemos dados pessoais. Compartilhamos dados com a academia do usuário (admin e professores veem dados dos seus alunos). Provedores de infraestrutura: Supabase (banco de dados), Vercel (hospedagem), Asaas (pagamentos).</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--bb-ink-100)' }}>5. Dados de Menores (LGPD Art. 14)</h2>
          <p>O tratamento de dados de menores de 18 anos ocorre somente com consentimento do responsável legal. O responsável pode solicitar exclusão dos dados do menor a qualquer momento. O perfil Kids tem acesso restrito: sem mensagens diretas, sem contato com outros usuários.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--bb-ink-100)' }}>6. Seus Direitos (LGPD)</h2>
          <p>Acesso, correção, exclusão, portabilidade e revogação do consentimento. Para exercer seus direitos, entre em contato pelo email: gregoryguimaraes12@gmail.com</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--bb-ink-100)' }}>7. Segurança</h2>
          <p>Dados criptografados em trânsito (HTTPS) e repouso. Isolamento por academia (multi-tenant com Row Level Security). Acesso restrito por perfil (role-based access control).</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--bb-ink-100)' }}>8. Cookies</h2>
          <p>Usamos cookies de sessão para autenticação. Não usamos cookies de rastreamento ou publicidade.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--bb-ink-100)' }}>9. Alterações</h2>
          <p>Notificaremos sobre alterações significativas por email ou notificação no app.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--bb-ink-100)' }}>10. Contato</h2>
          <p>Encarregado de proteção de dados (DPO): gregoryguimaraes12@gmail.com</p>
        </div>
      </section>
    </div>
  );
}
```

### 1B. Termos de Uso

Criar `app/(public)/termos/page.tsx` — mesma estrutura, conteúdo:

```
1. ACEITAÇÃO — Ao usar o BlackBelt, você concorda com estes termos.
2. DESCRIÇÃO DO SERVIÇO — Plataforma SaaS de gestão para academias de artes marciais.
3. CONTAS — Cada usuário é responsável pela segurança de suas credenciais.
4. USO ACEITÁVEL — Não utilizar para spam, assédio ou atividades ilegais.
5. PAGAMENTOS — Planos com renovação automática. Cancelamento a qualquer momento, sem multa.
6. PROPRIEDADE INTELECTUAL — O software é propriedade de Gregory Pinto. Dados inseridos pelo cliente são propriedade do cliente.
7. LIMITAÇÃO DE RESPONSABILIDADE — O serviço é fornecido "como está".
8. RESCISÃO — Qualquer parte pode encerrar a qualquer momento. Dados exportáveis por 30 dias.
9. FORO — Comarca de Vespasiano — MG.
```

### 1C. Consentimento Parental

Criar `components/legal/ParentalConsent.tsx`:

```tsx
'use client';
import { useState } from 'react';

interface ParentalConsentProps {
  onConsent: (consented: boolean) => void;
}

export function ParentalConsent({ onConsent }: ParentalConsentProps) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--bb-ink-700)', background: 'var(--bb-depth-2)' }}>
      <h3 className="font-semibold mb-2" style={{ color: 'var(--bb-ink-100)' }}>
        Consentimento do Responsável Legal
      </h3>
      <p className="text-sm mb-3" style={{ color: 'var(--bb-ink-300)' }}>
        Como o aluno é menor de 18 anos, o cadastro requer autorização do responsável legal conforme a LGPD (Art. 14).
      </p>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => {
            setChecked(e.target.checked);
            onConsent(e.target.checked);
          }}
          className="mt-1 h-4 w-4 rounded border-gray-600"
        />
        <span className="text-sm" style={{ color: 'var(--bb-ink-200)' }}>
          Declaro que sou o responsável legal e autorizo o cadastro e tratamento de dados do menor
          conforme a{' '}
          <a href="/privacidade" target="_blank" className="underline" style={{ color: 'var(--bb-ink-100)' }}>
            Política de Privacidade
          </a>.
        </span>
      </label>
    </div>
  );
}
```

**Integrar** no form de cadastro de aluno quando `role === 'aluno_teen' || role === 'aluno_kids'` ou `birth_date` indica menor de 18.

### 1D. Links legais em configurações

Em CADA shell de perfil que tem página de configurações, adicionar seção "Legal":
- Link para /privacidade (abre em nova aba)
- Link para /termos (abre em nova aba)
- Versão do app: 2.0.0

### 1E. Verificar que /privacidade e /termos são rotas públicas

No middleware.ts, adicionar `/privacidade` e `/termos` ao array de rotas públicas.

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `legal: privacy policy, terms of use, parental consent — LGPD + store compliant`

---

## SEÇÃO 2 — CAPACITOR: EMPACOTAR COMO APP NATIVO (15 min)

### 2A. Verificar estado atual do Capacitor

```bash
echo "=== CAPACITOR ==="
grep -i "capacitor" package.json | head -20
cat capacitor.config.ts 2>/dev/null | head -30
ls ios/ 2>/dev/null | head -5
ls android/ 2>/dev/null | head -5
```

### 2B. Se Capacitor NÃO está instalado, instalar

```bash
pnpm add @capacitor/core @capacitor/cli
pnpm add @capacitor/app @capacitor/haptics @capacitor/keyboard @capacitor/status-bar
pnpm add @capacitor/splash-screen @capacitor/browser @capacitor/network
pnpm add @capacitor/push-notifications @capacitor/camera @capacitor/preferences
pnpm add @capacitor/share @capacitor/clipboard @capacitor/toast
```

**NÃO rodar `npx cap add ios` nem `npx cap add android` no Claude Code** — isso requer Xcode/Android Studio que não estão disponíveis no terminal.

### 2C. Criar/Verificar capacitor.config.ts

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.blackbelt.v2',
  appName: 'BlackBelt',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0A0A0A',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0A0A0A',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'BlackBelt',
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
```

### 2D. Platform detection

Criar/verificar `lib/platform.ts`:

```typescript
export function isNative(): boolean {
  try {
    const { Capacitor } = require('@capacitor/core');
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export function isIOS(): boolean {
  try {
    const { Capacitor } = require('@capacitor/core');
    return Capacitor.getPlatform() === 'ios';
  } catch {
    return false;
  }
}

export function isAndroid(): boolean {
  try {
    const { Capacitor } = require('@capacitor/core');
    return Capacitor.getPlatform() === 'android';
  } catch {
    return false;
  }
}

export function isWeb(): boolean {
  return !isNative();
}
```

### 2E. Safe areas para iPhone notch

Em `styles/globals.css`, adicionar (se não existe):

```css
:root {
  --safe-area-top: env(safe-area-inset-top, 0px);
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-left: env(safe-area-inset-left, 0px);
  --safe-area-right: env(safe-area-inset-right, 0px);
}
```

Nos shells que têm header fixo, adicionar:
```css
padding-top: calc(var(--safe-area-top) + 16px);
```

Nos bottom navs:
```css
padding-bottom: calc(var(--safe-area-bottom) + 8px);
```

### 2F. AuthGuard client-side

Capacitor não suporta middleware SSR. Criar guard client-side:

```typescript
// lib/guards/AuthGuard.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

interface AuthGuardProps {
  requiredRoles?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ requiredRoles, children, fallback }: AuthGuardProps) {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.replace('/login'); return; }
    if (requiredRoles && profile && !requiredRoles.includes(profile.role)) {
      router.replace('/login');
    }
  }, [user, profile, isLoading, requiredRoles, router]);

  if (isLoading) return fallback || (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
    </div>
  );

  if (!user) return null;
  return <>{children}</>;
}
```

### 2G. Build scripts mobile

Adicionar ao `package.json`:

```json
{
  "scripts": {
    "build:mobile": "NEXT_PUBLIC_PLATFORM=mobile next build && next export",
    "cap:sync": "npx cap sync",
    "cap:ios": "npx cap open ios",
    "cap:android": "npx cap open android",
    "mobile:prepare": "pnpm build:mobile && pnpm cap:sync"
  }
}
```

**NOTA:** O build:mobile pode falhar porque Next.js 14 com App Router não suporta `next export` diretamente. A solução pragmática é usar a Vercel URL como server no Capacitor:

```typescript
// capacitor.config.ts — para produção
server: {
  url: 'https://blackbelts.com.br',
  androidScheme: 'https',
  iosScheme: 'https',
}
```

Isso significa que o app nativo é basicamente um WebView apontando para a Vercel. Funciona perfeitamente, é como a maioria dos apps SaaS B2B fazem, e mantém API routes + middleware SSR funcionando.

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: capacitor setup — iOS/Android config, platform detection, safe areas, auth guard`

---

## SEÇÃO 3 — STORE ASSETS E METADATA (10 min)

### 3A. Gerar ícones placeholder

Criar `scripts/generate-icons.ts`:

```typescript
// Gera ícones placeholder (quadrado vermelho #C62828 com "BB" branco)
// Em produção, substituir por ícone profissional
// Sizes: 72, 96, 128, 144, 152, 192, 384, 512

import fs from 'fs';
import path from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(process.cwd(), 'public', 'icons');

if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

for (const size of sizes) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="#C62828" rx="${Math.round(size * 0.15)}"/>
    <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="800" font-size="${Math.round(size * 0.35)}">BB</text>
  </svg>`;
  
  fs.writeFileSync(path.join(iconsDir, `icon-${size}.svg`), svg);
  console.log(`✅ icon-${size}.svg`);
}

console.log('\n⚠️ Para produção: converter SVGs em PNGs e substituir por ícone profissional');
console.log('   Ferramenta: https://realfavicongenerator.net');
```

Rodar: `npx tsx scripts/generate-icons.ts`

### 3B. Criar docs/STORE_METADATA.md

```markdown
# BlackBelt — App Store Metadata

## App Name
BlackBelt — Gestão de Academias

## Subtitle (App Store) / Short Description (Google Play)
Check-in, turmas, presença e progresso para academias de artes marciais

## Full Description (ambas stores)
BlackBelt é a plataforma completa de gestão para academias de artes marciais.

Desenvolvido por quem entende o tatame, o BlackBelt oferece ferramentas específicas
para jiu-jitsu, judô, karatê, MMA e outras modalidades.

PARA DONOS DE ACADEMIA:
• Dashboard com métricas em tempo real (alunos, receita, inadimplência)
• Gestão financeira completa (cobranças automáticas via PIX e boleto)
• Controle de turmas, horários e professores
• Relatórios detalhados de presença e evolução

PARA PROFESSORES:
• Chamada digital com QR Code
• Avaliações técnicas dos alunos
• Planos de aula e diário
• Comunicação direta com alunos e pais

PARA ALUNOS:
• Check-in rápido por QR Code
• Acompanhamento de presença e streak
• Progresso de graduação (faixa)
• Biblioteca de conteúdo (vídeos de técnicas)

PARA PAIS E RESPONSÁVEIS:
• Acompanhamento em tempo real da presença dos filhos
• Evolução e avaliações
• Gestão financeira (faturas e pagamentos)

DIFERENCIAIS:
• 9 perfis especializados (admin, professor, aluno adulto, teen, kids, responsável, recepcionista, franqueador, super admin)
• Gamificação para teens (XP, ranking, conquistas)
• Interface lúdica para crianças
• Módulo de campeonatos com chaves e placar ao vivo
• Funciona offline (check-in sem internet)
• Multi-tenant (franquias e redes)

Comece grátis por 7 dias. Planos a partir de R$97/mês.

## Keywords (App Store, max 100 chars)
academia,artes marciais,bjj,jiu jitsu,judo,karate,mma,gestao,checkin,turmas,faixa,presenca

## Category
Primary: Health & Fitness
Secondary: Education

## Age Rating
4+ (sem conteúdo restrito)

## Privacy Policy URL
https://blackbelts.com.br/privacidade

## Support URL
https://blackbelts.com.br/contato

## Marketing URL
https://blackbelts.com.br
```

### 3C. Criar docs/STORE_REVIEW_CREDENTIALS.md

```markdown
# Credenciais para Review — Apple / Google

## Conta de Admin (para ver o dashboard completo)
Email: admin@guerreiros.com
Senha: BlackBelt@2026
Perfil: Administrador da academia "Guerreiros do Tatame"

## Conta de Professor
Email: professor@guerreiros.com
Senha: BlackBelt@2026

## Conta de Aluno
Email: adulto@guerreiros.com
Senha: BlackBelt@2026

## Notas para o Reviewer
1. O app é um SaaS B2B para gestão de academias de artes marciais
2. A conta de admin acima está pré-populada com dados demo
3. Para testar check-in: login como aluno → botão de check-in no dashboard
4. Para testar financeiro: login como admin → menu Financeiro
5. O app funciona 100% online (requer conexão para login)
6. Não há compras in-app — cobrança é feita externamente via gateway
```

### 3D. Criar screenshots placeholder

Criar `docs/screenshots/README.md`:

```markdown
# Screenshots para as Stores

## Tamanhos necessários

### App Store (iOS)
- iPhone 6.7" (1290 × 2796): iPhone 15 Pro Max
- iPhone 6.5" (1284 × 2778): iPhone 14 Plus
- iPhone 5.5" (1242 × 2208): iPhone 8 Plus
- iPad Pro 12.9" (2048 × 2732)

### Google Play (Android)
- Phone (min 320px, max 3840px, 16:9 ratio)
- Tablet 7" (min 320px)
- Tablet 10" (min 320px)

## Screenshots recomendadas (mínimo 4, máximo 10)
1. Dashboard do Admin (KPIs, gráficos)
2. Check-in por QR Code (aluno)
3. Grade de turmas/horários
4. Perfil do aluno com faixa e progresso
5. Financeiro (faturas, receita)
6. Painel do responsável (filhos)
7. Dashboard do professor
8. Campeonato (bracket)

## Como gerar
1. Acesse blackbelts.com.br no simulador iOS / Chrome DevTools
2. Faça login com cada perfil
3. Tire screenshot de cada tela
4. Recomendado: usar ferramenta como https://screenshots.pro ou https://appscreens.com
   para adicionar moldura de device + texto de destaque

⚠️ NÃO enviar screenshots com dados fake óbvios (Lorem ipsum, etc.)
   Os dados demo do seed são realistas e podem ser usados.
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: store assets — icons, metadata, review credentials, screenshot guide`

---

## SEÇÃO 4 — ONBOARDING SELF-SERVICE PARA ACADEMIAS (20 min)

Para vender, academias precisam se auto-cadastrar sem intervenção do Gregory.

### 4A. Verificar wizard existente

```bash
find app -path "*cadastrar*" -o -path "*onboarding*" -o -path "*registro*" -o -path "*wizard*" | grep -v node_modules | sort
cat app/\(public\)/registro*/page.tsx 2>/dev/null | head -30
```

### 4B. Criar/Verificar fluxo de auto-cadastro de academia

O fluxo deve ser:

```
Visitante abre blackbelts.com.br
  → Landing page → botão "Começar Grátis"
  → /registro-academia (wizard 4 steps)
  
Step 1: Dados da Academia
  - Nome da academia
  - Cidade / Estado
  - Modalidades (checkboxes: jiu-jitsu, judô, karatê, MMA, etc.)
  - Telefone da academia

Step 2: Dados do Administrador
  - Nome completo
  - Email
  - Senha + confirmação
  - Telefone pessoal

Step 3: Escolha do Plano
  - 5 cards: Starter R$97 → Enterprise (sob consulta)
  - Badge "7 dias grátis" no plano selecionado
  - Destaque no Pro (mais popular)

Step 4: Confirmação
  - Resumo dos dados
  - Checkbox: "Concordo com os Termos de Uso e Política de Privacidade"
  - Botão "Criar Minha Academia"

Ao submeter:
  1. Criar academy no Supabase
  2. Criar auth user (admin)
  3. Criar profile + membership
  4. Definir trial_ends_at = now + 7 dias, plan = plano escolhido
  5. Redirect para /admin com setup wizard
```

**IMPORTANTE:** Este fluxo precisa de API route server-side (criar auth user requer service_role_key):

```typescript
// app/api/register-academy/route.ts
import { createAdminSupabase } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const admin = createAdminSupabase();

  try {
    // 1. Criar academia
    const { data: academy, error: acadError } = await admin.from('academies').insert({
      name: body.academyName,
      city: body.city,
      state: body.state,
      modalities: body.modalities,
      phone: body.academyPhone,
      slug: body.academyName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      status: 'trial',
      plan: body.plan || 'starter',
      trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }).select().single();

    if (acadError) throw acadError;

    // 2. Criar auth user
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: { display_name: body.name, role: 'admin' },
    });

    if (authError) throw authError;

    // 3. Criar profile
    await admin.from('profiles').insert({
      id: authUser.user.id,
      user_id: authUser.user.id,
      email: body.email,
      display_name: body.name,
      role: 'admin',
      academy_id: academy.id,
      phone: body.phone,
    });

    // 4. Criar membership
    await admin.from('memberships').insert({
      profile_id: authUser.user.id,
      academy_id: academy.id,
      role: 'admin',
      status: 'active',
    });

    return NextResponse.json({
      academy: { id: academy.id, name: academy.name },
      userId: authUser.user.id,
    }, { status: 201 });

  } catch (err: any) {
    console.error('[register-academy]', err);
    return NextResponse.json({ error: err.message || 'Erro ao criar academia' }, { status: 400 });
  }
}
```

### 4C. Setup Wizard pós-cadastro

Criar `app/(admin)/setup/page.tsx`:

```
Step 1: Upload de logo (opcional, pode pular) → Supabase Storage ou skip
Step 2: Criar primeira turma (nome, modalidade, horários)
Step 3: Convidar primeiro professor (email + role)
Step 4: "Tudo pronto!" → redirect para /admin
```

Cada step salva no Supabase em tempo real. O admin pode abandonar e voltar depois.

### 4D. Verificar que landing page tem CTA

```bash
cat app/page.tsx | head -30
# OU
cat app/\(public\)/page.tsx | head -30
```

A landing page DEVE ter:
- Botão "Começar Grátis" → link para /registro-academia (ou equivalente)
- Seção de pricing com os 5 planos
- Botão "Começar Grátis" em CADA card de plano

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: self-service onboarding — 4-step wizard, API route, setup wizard, landing CTA`

---

## SEÇÃO 5 — EMAIL TRANSACIONAL (15 min)

### 5A. Criar service de email plugável

```typescript
// lib/api/email.service.ts
import { isMock } from '@/lib/utils/mock';
import { handleServiceError } from '@/lib/monitoring/service-error';
import { getSupabaseClient } from '@/lib/supabase/client';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(data: EmailData): Promise<{ sent: boolean; configured: boolean }> {
  if (isMock()) {
    console.log(`[email-mock] Para: ${data.to} | Assunto: ${data.subject}`);
    return { sent: true, configured: true };
  }

  try {
    // Sempre logar no banco
    const supabase = getSupabaseClient();
    await supabase.from('notification_logs').insert({
      type: 'email',
      recipient: data.to,
      content: data.subject,
      metadata: { html: data.html.substring(0, 500) },
      status: 'pending',
    });

    // Tentar enviar se API key existe
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return { sent: false, configured: false };
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: data.from || 'BlackBelt <gregoryguimaraes12@gmail.com>',
        to: data.to,
        subject: data.subject,
        html: data.html,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('[email] Resend error:', err);
      return { sent: false, configured: true };
    }

    return { sent: true, configured: true };
  } catch (err) {
    handleServiceError(err, 'email.send');
    return { sent: false, configured: false };
  }
}
```

### 5B. Templates de email

Criar `lib/email-templates/`:

```typescript
// lib/email-templates/welcome.ts
export function welcomeEmail(name: string, academyName: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 20px 0;">
        <h1 style="color: #C62828; margin: 0;">BlackBelt</h1>
      </div>
      <h2>Bem-vindo(a), ${name}!</h2>
      <p>Sua academia <strong>${academyName}</strong> foi criada com sucesso no BlackBelt.</p>
      <p>Seu trial gratuito de 7 dias já começou. Durante esse período, você tem acesso completo a todas as funcionalidades.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://blackbelts.com.br/login" style="background: #C62828; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Acessar Minha Academia</a>
      </div>
      <p style="color: #666; font-size: 14px;">Precisa de ajuda? Responda este email ou acesse nossa central de suporte.</p>
    </div>
  `;
}

// lib/email-templates/invoice.ts
export function invoiceEmail(name: string, amount: string, dueDate: string, invoiceUrl?: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 20px 0;">
        <h1 style="color: #C62828; margin: 0;">BlackBelt</h1>
      </div>
      <h2>Fatura disponível</h2>
      <p>Olá ${name},</p>
      <p>Sua fatura de <strong>${amount}</strong> com vencimento em <strong>${dueDate}</strong> está disponível.</p>
      ${invoiceUrl ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${invoiceUrl}" style="background: #C62828; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Pagar Agora</a>
        </div>
      ` : ''}
      <p style="color: #666; font-size: 14px;">Este é um email automático do BlackBelt.</p>
    </div>
  `;
}

// lib/email-templates/password-reset.ts
export function passwordResetEmail(name: string, resetUrl: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 20px 0;">
        <h1 style="color: #C62828; margin: 0;">BlackBelt</h1>
      </div>
      <h2>Redefinir senha</h2>
      <p>Olá ${name},</p>
      <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background: #C62828; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Redefinir Senha</a>
      </div>
      <p style="color: #666; font-size: 14px;">Se você não solicitou essa alteração, ignore este email.</p>
      <p style="color: #666; font-size: 14px;">Este link expira em 1 hora.</p>
    </div>
  `;
}
```

### 5C. Imprimir instruções de configuração

```
📧 CONFIGURAÇÃO DE EMAIL (quando quiser ativar):

OPÇÃO 1 — Resend (recomendado, 100 emails/dia grátis):
1. Crie conta em https://resend.com
2. Verifique seu domínio (ou use o domínio de teste deles)
3. Gere API Key
4. Adicione ao .env.local: RESEND_API_KEY=re_xxxxx
5. Adicione na Vercel: RESEND_API_KEY=re_xxxxx

OPÇÃO 2 — SendGrid:
1. Crie conta em https://sendgrid.com
2. Mesmos passos
3. Adicione: SENDGRID_API_KEY=SG.xxxxx

⚠️ SEM EMAIL CONFIGURADO, tudo funciona normalmente.
   Emails ficam logados no banco (notification_logs) mas não são enviados.
   O app nunca quebra por falta de email.
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: email service — pluggable (Resend), templates (welcome, invoice, reset), graceful fallback`

---

## SEÇÃO 6 — PÁGINA DE CONTATO + SUPORTE (5 min)

Apple pode pedir, e toda empresa precisa.

### 6A. Criar /contato

```typescript
// app/(public)/contato/page.tsx
export default function ContatoPage() {
  return (
    <div className="min-h-screen py-12 px-4 max-w-2xl mx-auto" style={{ background: 'var(--bb-depth-0)', color: 'var(--bb-ink-100)' }}>
      <h1 className="text-3xl font-bold mb-6">Contato</h1>
      
      <div className="space-y-6">
        <div className="p-6 rounded-xl" style={{ background: 'var(--bb-depth-2)' }}>
          <h2 className="text-lg font-semibold mb-4">Suporte</h2>
          <p className="text-sm mb-2" style={{ color: 'var(--bb-ink-300)' }}>
            Para dúvidas, problemas ou sugestões:
          </p>
          <a href="mailto:gregoryguimaraes12@gmail.com" className="text-red-400 hover:text-red-300 font-medium">
            gregoryguimaraes12@gmail.com
          </a>
        </div>

        <div className="p-6 rounded-xl" style={{ background: 'var(--bb-depth-2)' }}>
          <h2 className="text-lg font-semibold mb-4">Vendas</h2>
          <p className="text-sm mb-2" style={{ color: 'var(--bb-ink-300)' }}>
            Quer levar o BlackBelt para sua academia?
          </p>
          <a href="mailto:gregoryguimaraes12@gmail.com" className="text-red-400 hover:text-red-300 font-medium">
            gregoryguimaraes12@gmail.com
          </a>
        </div>

        <div className="p-6 rounded-xl" style={{ background: 'var(--bb-depth-2)' }}>
          <h2 className="text-lg font-semibold mb-4">Horário de Atendimento</h2>
          <p className="text-sm" style={{ color: 'var(--bb-ink-300)' }}>
            Segunda a sexta, 9h às 18h (horário de Brasília)
          </p>
        </div>
      </div>
    </div>
  );
}
```

Adicionar `/contato` às rotas públicas no middleware.

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: contact page + support info`

---

## SEÇÃO 7 — TRIAL + CONVERSÃO FLOW (15 min)

### 7A. Trial banner

Criar `components/shared/TrialBanner.tsx`:

```typescript
'use client';
import { useAuth } from '@/lib/hooks/useAuth';
import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { isMock } from '@/lib/utils/mock';

export function TrialBanner() {
  const { academyId, role } = useAuth();
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!academyId || role !== 'admin' || isMock()) return;

    const supabase = getSupabaseClient();
    supabase
      .from('academies')
      .select('trial_ends_at, status')
      .eq('id', academyId)
      .single()
      .then(({ data }) => {
        if (data?.status === 'trial' && data.trial_ends_at) {
          const ends = new Date(data.trial_ends_at);
          const now = new Date();
          const diff = Math.ceil((ends.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (diff <= 7 && diff >= 0) {
            setDaysLeft(diff);
            setShow(true);
          }
        }
      });
  }, [academyId, role]);

  if (!show || daysLeft === null) return null;

  return (
    <div className={`text-center text-sm py-2 px-4 ${
      daysLeft <= 2 ? 'bg-red-600' : daysLeft <= 5 ? 'bg-amber-600' : 'bg-blue-600'
    } text-white`}>
      {daysLeft === 0
        ? '⚠️ Seu trial expira hoje! '
        : `🔥 ${daysLeft} dia${daysLeft > 1 ? 's' : ''} restante${daysLeft > 1 ? 's' : ''} de trial. `}
      <a href="/admin/plano" className="underline font-semibold">Escolher plano</a>
    </div>
  );
}
```

Adicionar `<TrialBanner />` no AdminShell, acima do conteúdo principal.

### 7B. Verificar página de planos

```bash
find app -path "*plano*" -name "page.tsx" | sort
```

Se `/admin/plano` (ou equivalente) existe, verificar que mostra os 5 tiers com botão de upgrade. Se não existe, criar com os 5 cards de pricing (Starter R$97 → Enterprise sob consulta).

### 7C. Expiração do trial

Verificar que o middleware ou AuthContext verifica `academy.status`:
- Se `status === 'trial'` e `trial_ends_at < now` → mostrar tela de "Trial expirado — escolha um plano"
- Se `status === 'suspended'` → mostrar tela de "Conta suspensa — entre em contato"
- Se `status === 'active'` → acesso normal

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: trial flow — banner, expiration check, upgrade CTA`

---

## SEÇÃO 8 — VERIFICAÇÃO FINAL E RELATÓRIO (10 min)

### 8A. Build limpo

```bash
pnpm typecheck 2>&1 | tail -10
pnpm build 2>&1 | tail -20
```

### 8B. Verificar rotas públicas

```bash
echo "=== ROTAS PÚBLICAS ==="
grep -A 20 "PUBLIC_ROUTES\|PUBLIC_PREFIXES\|publicRoutes" middleware.ts
```

Garantir que estão listadas: `/`, `/login`, `/cadastro`, `/registro-academia`, `/precos`,
`/privacidade`, `/termos`, `/contato`, `/compete/*`, `/api/webhooks/*`

### 8C. Verificar que nenhuma página legal está 404

```bash
echo "=== PÁGINAS LEGAIS ==="
ls app/\(public\)/privacidade/page.tsx 2>/dev/null && echo "✅ /privacidade" || echo "❌ /privacidade"
ls app/\(public\)/termos/page.tsx 2>/dev/null && echo "✅ /termos" || echo "❌ /termos"
ls app/\(public\)/contato/page.tsx 2>/dev/null && echo "✅ /contato" || echo "❌ /contato"
```

### 8D. Relatório

```
╔═══════════════════════════════════════════════════════════╗
║  BLACKBELT v2 — PRODUCTION LAUNCH REPORT                 ║
╠═══════════════════════════════════════════════════════════╣

📜 LEGAL (Apple + Google exigem)
   Política de Privacidade:  [✅/❌] → /privacidade
   Termos de Uso:            [✅/❌] → /termos
   Consentimento Parental:   [✅/❌] → componente integrado
   Página de Contato:        [✅/❌] → /contato

📱 CAPACITOR
   Packages instalados:      [✅/❌]
   capacitor.config.ts:      [✅/❌]
   Platform detection:       [✅/❌]
   Safe areas (notch):       [✅/❌]
   AuthGuard client-side:    [✅/❌]
   Build scripts:            [✅/❌]

🏪 STORE ASSETS
   Ícones (8 tamanhos):      [✅/❌]
   Store metadata:           [✅/❌]
   Review credentials:       [✅/❌]
   Screenshot guide:         [✅/❌]

🏛️ ONBOARDING
   Auto-cadastro academia:   [✅/❌] → /registro-academia
   API route server-side:    [✅/❌] → /api/register-academy
   Setup wizard:             [✅/❌] → /admin/setup
   Landing page CTA:         [✅/❌]

📧 EMAIL
   Service plugável:         [✅/❌]
   Templates (3):            [✅/❌]
   Fallback gracioso:        [✅/❌]
   Instruções de config:     [✅/❌]

💰 TRIAL + CONVERSÃO
   Trial banner:             [✅/❌]
   Expiração check:          [✅/❌]
   Página de planos:         [✅/❌]

════════════════════════════════════════════════════════════

📋 AÇÕES MANUAIS DO GREGORY (em ordem):

1. AGORA:
   □ Rodar migrations no Supabase (050_enterprise + esta)
   □ Rodar seeds (seed-full-academy + seed-demo-data)
   □ Atualizar env vars na Vercel
   □ Testar login com todos os 9 perfis

2. PARA VENDER (qualquer ordem):
   □ Criar conta Asaas (sandbox → produção)
   □ Configurar ASAAS_API_KEY na Vercel
   □ Criar conta Resend para email
   □ Configurar RESEND_API_KEY na Vercel
   □ Comprar domínio (blackbelts.com.br)
   □ Configurar domínio na Vercel

3. PARA APP STORES:
   □ Criar conta Apple Developer ($99/ano) → developer.apple.com
   □ Criar conta Google Play Developer ($25 único) → play.google.com/console
   □ No Mac: rodar npx cap add ios → abrir Xcode → build → TestFlight
   □ No Mac/Linux: rodar npx cap add android → Android Studio → build → upload
   □ Gerar screenshots reais dos 8 perfis
   □ Converter ícones SVG em PNG (realfavicongenerator.net)
   □ Submeter para review com credenciais de docs/STORE_REVIEW_CREDENTIALS.md

╚═══════════════════════════════════════════════════════════╝
```

### 8E. Push final

```bash
pnpm typecheck — ZERO erros
pnpm build — ZERO erros

git add -A
git commit -m "release: production launch ready — legal, capacitor, store assets, onboarding, email, trial flow"
git push origin main --force
```

---

## COMANDO DE RETOMADA

```
Continue de onde parou no BLACKBELT_LAUNCH.md. Verifique estado: ls app/\(public\)/privacidade 2>/dev/null && ls app/\(public\)/termos 2>/dev/null && grep "capacitor" package.json | head -3 && pnpm typecheck 2>&1 | tail -5. Continue da próxima seção incompleta. ZERO erros. Commit e push. Comece agora.
```

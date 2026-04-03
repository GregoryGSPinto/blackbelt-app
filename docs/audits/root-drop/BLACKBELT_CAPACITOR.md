# BLACKBELT v2 — CAPACITOR + STORE PREPARATION
## Preparar builds iOS/Android para Google Play e App Store
## NÃO quebrar o build web (Vercel continua funcionando)

> **INSTRUÇÕES DE EXECUÇÃO:**
> - Execute BLOCO a BLOCO, na ordem (B1 → B7)
> - Cada BLOCO termina com: `pnpm typecheck && pnpm build` → commit → push
> - IMPORTANTE: manter compatibilidade com Vercel (não usar output: 'export')

---

## BLOCO 1 — INSTALAR CAPACITOR + DEPENDÊNCIAS

```bash
# Core
pnpm add @capacitor/core @capacitor/cli

# Plugins essenciais
pnpm add @capacitor/app @capacitor/haptics @capacitor/keyboard @capacitor/status-bar
pnpm add @capacitor/splash-screen @capacitor/browser @capacitor/network
pnpm add @capacitor/push-notifications @capacitor/preferences
pnpm add @capacitor/share @capacitor/clipboard @capacitor/toast
pnpm add @capacitor/ios @capacitor/android

# Biometria (Face ID / Touch ID)
pnpm add @aparajita/capacitor-biometric-auth
```

Verificar que NÃO quebrou o build:
```bash
pnpm typecheck && pnpm build
```

**Commit:** `chore: install Capacitor + native plugins`

---

## BLOCO 2 — CAPACITOR CONFIG

Criar `capacitor.config.ts` na raiz:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.blackbelt.academy',
  appName: 'BlackBelt',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // Em dev, descomentar:
    // url: 'http://localhost:3000',
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

**Commit:** `config: Capacitor config for iOS/Android`

---

## BLOCO 3 — PLATFORM DETECTION + SAFE AREAS

### 3A. Criar `lib/platform.ts`:

```typescript
'use client';

let _capacitor: typeof import('@capacitor/core').Capacitor | null = null;

async function getCapacitor() {
  if (_capacitor) return _capacitor;
  try {
    const mod = await import('@capacitor/core');
    _capacitor = mod.Capacitor;
    return _capacitor;
  } catch {
    return null;
  }
}

export function isNative(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Capacitor } = require('@capacitor/core');
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const { Capacitor } = require('@capacitor/core');
    return Capacitor.getPlatform() === 'ios';
  } catch {
    return false;
  }
}

export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false;
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

export { getCapacitor };
```

### 3B. Safe areas no `globals.css`:

Adicionar ao início:
```css
:root {
  --safe-area-top: env(safe-area-inset-top, 0px);
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-left: env(safe-area-inset-left, 0px);
  --safe-area-right: env(safe-area-inset-right, 0px);
}
```

No `app/layout.tsx`, adicionar no `<head>`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="BlackBelt" />
```

### 3C. Aplicar safe areas nos shells

Em TODOS os shells (AdminShell, MainShell, etc.), adicionar padding-top no header mobile e padding-bottom no bottom nav:

```css
/* Header mobile */
padding-top: var(--safe-area-top);

/* Bottom nav mobile */
padding-bottom: var(--safe-area-bottom);
```

**Commit:** `feat: platform detection + safe areas for native apps`

---

## BLOCO 4 — SCRIPTS DE BUILD MOBILE

Adicionar ao `package.json` nos scripts:

```json
{
  "scripts": {
    "mobile:build": "next build && npx next export -o out",
    "mobile:sync": "npx cap sync",
    "mobile:ios": "npx cap open ios",
    "mobile:android": "npx cap open android",
    "mobile:prepare": "pnpm mobile:build && pnpm mobile:sync"
  }
}
```

**IMPORTANTE:** O `mobile:build` usa `next export` pra gerar arquivos estáticos na pasta `out/`. Isso é SEPARADO do build normal da Vercel. O build da Vercel (`pnpm build`) continua funcionando com SSR.

Se `next export` não funciona com App Router, usar alternativa:
```json
{
  "mobile:build": "NEXT_PUBLIC_CAPACITOR=true next build",
  "mobile:sync": "npx cap sync"
}
```

E criar `next.config.mobile.js` que adiciona `output: 'export'` + `images: { unoptimized: true }`.

**Commit:** `config: mobile build scripts for Capacitor`

---

## BLOCO 5 — MANIFEST.JSON + ÍCONES PWA

### 5A. Criar/atualizar `public/manifest.json`:

```json
{
  "name": "BlackBelt - Gestão de Academias",
  "short_name": "BlackBelt",
  "description": "Plataforma completa para gestão de academias de artes marciais",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0A0A0A",
  "theme_color": "#D4AF37",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icons/icon-72.png", "sizes": "72x72", "type": "image/png" },
    { "src": "/icons/icon-96.png", "sizes": "96x96", "type": "image/png" },
    { "src": "/icons/icon-128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-144.png", "sizes": "144x144", "type": "image/png" },
    { "src": "/icons/icon-152.png", "sizes": "152x152", "type": "image/png" },
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-384.png", "sizes": "384x384", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "categories": ["business", "sports", "education"],
  "lang": "pt-BR"
}
```

### 5B. Gerar ícones placeholder

Se não existem ícones em `public/icons/`, criar SVG placeholder e gerar PNGs:

```bash
mkdir -p public/icons

# Criar SVG base do ícone (fundo escuro + BB dourado)
cat > /tmp/icon.svg << 'SVG'
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="90" fill="#0A0A0A"/>
  <text x="256" y="300" text-anchor="middle" font-family="Arial Black" font-size="200" font-weight="bold" fill="#D4AF37">BB</text>
</svg>
SVG

# Gerar todos os tamanhos (precisa de sharp ou similar)
# Se não tiver ferramenta de conversão, criar um script Node:
node -e "
const fs = require('fs');
const svg = fs.readFileSync('/tmp/icon.svg', 'utf8');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
// Salvar SVG como fallback
sizes.forEach(s => {
  const scaled = svg.replace('width=\"512\"', 'width=\"' + s + '\"').replace('height=\"512\"', 'height=\"' + s + '\"');
  fs.writeFileSync('public/icons/icon-' + s + '.svg', scaled);
});
console.log('Icons generated (SVG). Convert to PNG with sharp or online tool.');
"
```

Se `sharp` está disponível, converter SVG→PNG. Se não, deixar SVG e anotar que precisa converter antes da submissão.

**Commit:** `assets: PWA manifest + icon placeholders`

---

## BLOCO 6 — STORE METADATA

Criar `docs/store-metadata.md`:

```markdown
# BlackBelt — Store Metadata

## Google Play

**Nome:** BlackBelt - Gestão de Academias
**Descrição curta (80 chars):** Gestão completa para academias de artes marciais. Alunos, turmas, financeiro.
**Descrição longa:**
BlackBelt é a plataforma mais completa para gestão de academias de artes marciais (BJJ, Judô, Karatê, MMA).

Funcionalidades:
• Gestão de alunos com perfis detalhados
• Check-in por QR Code ou lista
• Controle de turmas e horários
• Financeiro completo (mensalidades, cobranças, relatórios)
• Graduações e faixas
• Comunicação com alunos e responsáveis
• Área do aluno com progresso
• Área Kids segura e gamificada
• Área Teen com XP e conquistas
• Calendário de eventos e campeonatos
• Relatórios e analytics

Para donos de academia:
• Trial gratuito de 7 dias
• Planos a partir de R$79/mês
• Sem taxa de adesão, sem contrato
• Suporte via WhatsApp

Pagamentos processados com segurança pelo Asaas (instituição autorizada pelo Banco Central).

**Categoria:** Negócios / Esportes
**Tags:** artes marciais, academia, jiu-jitsu, judô, karatê, MMA, gestão, alunos, check-in
**Classificação:** Livre
**Política de privacidade:** https://blackbelts.com.br/privacidade
**Site:** https://blackbelts.com.br

## Apple App Store

**Nome:** BlackBelt - Gestão de Academias
**Subtítulo (30 chars):** Artes Marciais & Gestão
**Categoria primária:** Business
**Categoria secundária:** Sports
**Keywords:** academia,artes marciais,jiu-jitsu,gestão,alunos,check-in,mma,karate,judo,financeiro
**URL de suporte:** https://blackbelts.com.br/contato
**URL de privacidade:** https://blackbelts.com.br/privacidade

## Credenciais de Review (Apple)

Email: roberto@guerreiros.com
Senha: BlackBelt@2026
Notas: Conta demo com perfil Admin. Após login, acesse Dashboard, Alunos, Turmas, Financeiro.
```

**Commit:** `docs: store metadata — Google Play + Apple App Store`

---

## BLOCO 7 — VERIFICAÇÃO FINAL

```bash
echo "=== VERIFICAÇÃO CAPACITOR ==="
test -f capacitor.config.ts && echo "✅ capacitor.config.ts" || echo "❌ capacitor.config.ts"
test -f lib/platform.ts && echo "✅ platform.ts" || echo "❌ platform.ts"
test -f public/manifest.json && echo "✅ manifest.json" || echo "❌ manifest.json"
test -f docs/store-metadata.md && echo "✅ store-metadata.md" || echo "❌ store-metadata.md"
ls public/icons/ 2>/dev/null | wc -l | xargs -I{} echo "✅ {} ícones"
grep -q "capacitor" package.json && echo "✅ Capacitor no package.json" || echo "❌ Capacitor no package.json"
grep -q "mobile:" package.json && echo "✅ Scripts mobile" || echo "❌ Scripts mobile"
grep -q "safe-area" app/globals.css 2>/dev/null && echo "✅ Safe areas CSS" || echo "❌ Safe areas CSS"
echo ""
echo "=== BUILD ==="
pnpm typecheck 2>&1 | tail -3
pnpm build 2>&1 | tail -5
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: Capacitor store preparation complete`

---

## APÓS EXECUTAR ESTE PROMPT

Gregory precisa fazer manualmente no Mac:

```bash
# 1. Adicionar plataformas (requer Xcode + Android Studio instalados)
cd ~/Projetos/black_belt_v2
npx cap add ios
npx cap add android

# 2. Sincronizar
npx cap sync

# 3. Abrir no Xcode
npx cap open ios
# No Xcode: selecionar team, certificado, rodar no simulador

# 4. Abrir no Android Studio
npx cap open android
# No Android Studio: rodar no emulador

# 5. Gerar builds de produção
# iOS: Xcode → Product → Archive → Distribute → App Store Connect
# Android: Android Studio → Build → Generate Signed Bundle (AAB)
```

**Contas necessárias:**
- Apple Developer: https://developer.apple.com ($99/ano)
- Google Play Console: https://play.google.com/console ($25 único)

---

## COMANDO DE RETOMADA

```
Continue de onde parou no BLACKBELT_CAPACITOR.md. Verifique estado:
test -f capacitor.config.ts && echo "B2 OK" || echo "B2 FALTA"
test -f lib/platform.ts && echo "B3 OK" || echo "B3 FALTA"
grep -q "mobile:" package.json && echo "B4 OK" || echo "B4 FALTA"
test -f public/manifest.json && echo "B5 OK" || echo "B5 FALTA"
test -f docs/store-metadata.md && echo "B6 OK" || echo "B6 FALTA"
pnpm typecheck 2>&1 | tail -3
Continue da próxima seção incompleta. ZERO erros. Commit e push.
```

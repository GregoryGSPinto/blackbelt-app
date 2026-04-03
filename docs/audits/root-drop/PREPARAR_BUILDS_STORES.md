# 🥋 BLACKBELT + PRIMALWOD — PREPARAR BUILDS PARA STORES
# Tudo que o terminal consegue fazer antes do Xcode/Android Studio
# Resultado: quando Gregory abrir as IDEs, é só clicar

---

Este prompt prepara os dois projetos para build nativo. Faz tudo que é possível via CLI e gera guias passo-a-passo para as partes manuais.

## REGRAS
1. Executar em AMBOS os projetos (detectar qual está ativo pelo package.json)
2. Não quebrar o build web existente
3. Gerar documentação detalhada para os passos manuais
4. Commit ao final

---

## ETAPA 1 — DETECTAR PROJETO E ESTADO

```bash
PROJECT_NAME=$(cat package.json | grep '"name"' | head -1 | sed 's/.*"name": "//;s/".*//')
echo "Projeto: $PROJECT_NAME"
echo "Version: $(cat package.json | grep '"version"' | head -1 | sed 's/.*"version": "//;s/".*//')"

# Capacitor instalado?
echo ""
echo "=== Capacitor ==="
npx cap --version 2>/dev/null || echo "Capacitor CLI não instalado"
cat capacitor.config.ts 2>/dev/null | head -10 || echo "Sem capacitor.config.ts"

# Plataformas
echo ""
echo "=== Plataformas ==="
ls -d ios/ 2>/dev/null && echo "✅ iOS platform existe" || echo "❌ iOS platform não existe"
ls -d android/ 2>/dev/null && echo "✅ Android platform existe" || echo "❌ Android platform não existe"
```

---

## ETAPA 2 — INSTALAR/ATUALIZAR CAPACITOR (se necessário)

```bash
# Verificar se Capacitor está instalado
npm ls @capacitor/core 2>/dev/null | head -3

# Se não está instalado:
if ! npm ls @capacitor/core 2>/dev/null | grep -q "@capacitor/core"; then
  echo "Instalando Capacitor..."
  pnpm add @capacitor/core @capacitor/cli
  pnpm add @capacitor/app @capacitor/haptics @capacitor/keyboard @capacitor/status-bar @capacitor/splash-screen @capacitor/push-notifications @capacitor/browser @capacitor/share @capacitor/device @capacitor/network
fi
```

---

## ETAPA 3 — CONFIGURAR CAPACITOR CONFIG

Verificar e corrigir `capacitor.config.ts`:

```bash
cat capacitor.config.ts
```

Garantir que tem:
- `appId` correto (`app.blackbelt.academy` ou `com.primalwod.app`)
- `appName` correto
- `webDir: 'out'` (para export estático) OU `server.url` apontando para Vercel
- `server.androidScheme: 'https'`

**IMPORTANTE sobre webDir vs server.url:**

Para apps SaaS com API routes (como BlackBelt e PrimalWOD), o approach mais confiável é usar `server.url` apontando para a Vercel. Isso porque:
- Next.js App Router com API routes não suporta `next export` puro
- API routes, middleware, e Server Components precisam de um servidor
- É assim que Mindbody, Wodify, e outros SaaS fazem

Verificar e ajustar:
```typescript
// capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.APP_ID.app', // detectar do projeto
  appName: 'APP_NAME',
  webDir: 'out', // fallback
  server: {
    // Em produção, o app nativo carrega da Vercel
    url: 'https://DEPLOY_URL',
    androidScheme: 'https',
    iosScheme: 'https',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#0a0a0a',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0a0a0a',
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
    },
  },
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: false,
  },
  android: {
    backgroundColor: '#0a0a0a',
    allowMixedContent: false,
  },
};

export default config;
```

---

## ETAPA 4 — ADICIONAR PLATAFORMAS iOS E ANDROID

```bash
# iOS (só funciona no Mac com Xcode instalado)
if [ ! -d "ios" ]; then
  echo "Adicionando plataforma iOS..."
  npx cap add ios 2>&1 || echo "⚠️ iOS só pode ser adicionado no Mac com Xcode"
fi

# Android
if [ ! -d "android" ]; then
  echo "Adicionando plataforma Android..."
  npx cap add android 2>&1
fi

# Sincronizar
npx cap sync 2>&1 | tail -10
```

---

## ETAPA 5 — CONFIGURAR ANDROID PARA PRODUÇÃO

### 5A — Gerar Keystore (se não existe)

```bash
if [ ! -f "android/app/blackbelt-release.keystore" ] && [ ! -f "android/app/primalwod-release.keystore" ] && [ ! -f "android/app/release.keystore" ]; then
  echo ""
  echo "═══════════════════════════════════════════"
  echo "  KEYSTORE NÃO ENCONTRADO"
  echo ""
  echo "  Gregory, execute este comando MANUALMENTE"
  echo "  (pede senha interativa):"
  echo ""
  
  if echo "$PROJECT_NAME" | grep -qi "blackbelt\|black_belt"; then
    echo "  keytool -genkey -v \\"
    echo "    -keystore android/app/blackbelt-release.keystore \\"
    echo "    -alias blackbelt \\"
    echo "    -keyalg RSA -keysize 2048 -validity 10000 \\"
    echo "    -storepass [SUA_SENHA] \\"
    echo "    -dname \"CN=Gregory Pinto, O=BlackBelt, L=Vespasiano, ST=MG, C=BR\""
  else
    echo "  keytool -genkey -v \\"
    echo "    -keystore android/app/primalwod-release.keystore \\"
    echo "    -alias primalwod \\"
    echo "    -keyalg RSA -keysize 2048 -validity 10000 \\"
    echo "    -storepass [SUA_SENHA] \\"
    echo "    -dname \"CN=Gregory Pinto, O=PrimalWOD, L=Vespasiano, ST=MG, C=BR\""
  fi
  echo ""
  echo "  GUARDE A SENHA — se perder, não consegue atualizar o app"
  echo "═══════════════════════════════════════════"
fi
```

### 5B — Configurar signing no build.gradle

Verificar e adicionar configuração de release signing:

```bash
cat android/app/build.gradle | grep -A5 "signingConfigs" || echo "Sem signingConfigs"
```

Se não tem, adicionar. **Mas NÃO hardcode a senha** — usar variáveis de ambiente ou gradle.properties.

Criar `android/app/gradle.properties.example`:
```properties
# Copiar para gradle.properties e preencher com seus valores
RELEASE_STORE_FILE=blackbelt-release.keystore
RELEASE_STORE_PASSWORD=sua_senha_aqui
RELEASE_KEY_ALIAS=blackbelt
RELEASE_KEY_PASSWORD=sua_senha_aqui
```

### 5C — App Icons Android

```bash
# Verificar ícones
ls android/app/src/main/res/mipmap-*/ic_launcher.png 2>/dev/null | head -10

# Se não tem ícones customizados, gerar placeholders
if [ ! -f "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png" ]; then
  echo "⚠️ Ícones Android são placeholder. Para ícones profissionais:"
  echo "   1. Crie um ícone 1024x1024 PNG"
  echo "   2. Acesse: https://icon.kitchen ou https://romannurik.github.io/AndroidAssetStudio/"
  echo "   3. Faça upload e baixe o pack"
  echo "   4. Substitua em android/app/src/main/res/mipmap-*/"
fi
```

### 5D — Versão do app

```bash
# Verificar versionCode e versionName no build.gradle
grep -E "versionCode|versionName" android/app/build.gradle
```

Garantir que `versionCode` é 1 (primeiro release) e `versionName` está correto.

---

## ETAPA 6 — CONFIGURAR iOS (se no Mac)

```bash
if [ -d "ios" ]; then
  echo "=== iOS Config ==="
  
  # Verificar Info.plist
  cat ios/App/App/Info.plist 2>/dev/null | head -30
  
  # Verificar Bundle ID
  grep -r "PRODUCT_BUNDLE_IDENTIFIER" ios/App/App.xcodeproj/project.pbxproj 2>/dev/null | head -3
  
  # Verificar se tem PrivacyInfo.xcprivacy
  ls ios/App/App/PrivacyInfo.xcprivacy 2>/dev/null && echo "✅ PrivacyInfo exists" || echo "❌ PrivacyInfo missing"
  
  # Verificar ícones iOS
  ls ios/App/App/Assets.xcassets/AppIcon.appiconset/ 2>/dev/null | head -10

  echo ""
  echo "⚠️ Para iOS, Gregory precisa:"
  echo "   1. Abrir Xcode: npx cap open ios"
  echo "   2. Selecionar Team (Apple Developer Account)"
  echo "   3. Signing & Capabilities → Automatic Signing"
  echo "   4. Product → Archive"
  echo "   5. Distribute App → App Store Connect → Upload"
fi
```

---

## ETAPA 7 — GERAR GUIA PASSO-A-PASSO

Criar `docs/store/GUIA_PUBLICACAO_STORES.md`:

```markdown
# Guia de Publicação — Apple App Store + Google Play

## PRÉ-REQUISITOS

### Contas (criar ANTES de tudo)
1. **Apple Developer** → https://developer.apple.com/programs/enroll/
   - Custo: US$99/ano (~R$500)
   - Tempo: aprovação pode levar 24-48h
   - Tipo: Individual (pode mudar pra Organization depois)
   - Precisa de: Apple ID + cartão internacional

2. **Google Play Console** → https://play.google.com/console/signup
   - Custo: US$25 (único)
   - Tempo: aprovação 24-48h (verificação de identidade)
   - Tipo: Organização (recomendado para SaaS)
   - Precisa de: Conta Google + cartão

### Ferramentas
- **Mac com Xcode 16+** (para iOS) — obrigatório, não tem alternativa
- **Android Studio** (para Android) — funciona em Mac, Windows, Linux
- **Java 17+** (para Android) — `java -version` para verificar

---

## PARTE 1 — GOOGLE PLAY (mais fácil, começar por aqui)

### Passo 1: Gerar o AAB assinado

```bash
# No terminal do projeto:
cd ~/Projetos/[PROJETO]

# Sincronizar Capacitor
npx cap sync android

# Abrir Android Studio
npx cap open android
```

No Android Studio:
1. Esperar o Gradle sync terminar (barra de progresso embaixo)
2. Menu: **Build → Generate Signed Bundle / APK...**
3. Selecionar **Android App Bundle**
4. **Keystore:**
   - Se primeira vez: Create new → escolher local, senha, alias
   - GUARDAR A SENHA E O ARQUIVO — sem isso não atualiza o app
5. **Build Variants:** selecionar **release**
6. Clicar **Create**
7. O arquivo `.aab` será gerado em `android/app/build/outputs/bundle/release/`

### Passo 2: Criar o app no Google Play Console

1. Abrir https://play.google.com/console
2. Clicar **"Create app"**
3. Preencher:
   - **App name:** BlackBelt (ou PrimalWOD)
   - **Default language:** Portuguese (Brazil)
   - **App or game:** App
   - **Free or paid:** Free (SaaS cobra fora)
4. Aceitar declarações
5. Clicar **Create app**

### Passo 3: Preencher Store Listing

Copiar de `docs/store/STORE_METADATA.md`:
- **Short description** (≤80 chars): copiar do doc
- **Full description** (≤4000 chars): copiar do doc
- **App icon:** 512x512 PNG (de `public/icons/`)
- **Feature graphic:** 1024x500 PNG (criar no Canva se não tem)
- **Screenshots:** pelo menos 2 do celular (de `docs/store-screenshots/`)

### Passo 4: Data Safety

No Play Console → App Content → Data Safety:

| Tipo de dado | Coletado | Compartilhado | Finalidade |
|---|---|---|---|
| Nome | Sim | Não | Funcionalidade do app |
| Email | Sim | Não | Gerenciamento de conta |
| Telefone | Sim (opcional) | Não | Contato |
| Data nascimento | Sim (para teens/kids) | Não | Classificação etária |
| Fotos (avatar) | Sim (opcional) | Não | Personalização |

- **Dados criptografados em trânsito?** Sim (HTTPS)
- **Mecanismo de exclusão de dados?** Sim (/excluir-conta)

### Passo 5: Content Rating

App Content → Content Rating:
- Responder questionário IARC honestamente
- Sem violência, sem conteúdo sexual, sem gambling
- Resultado esperado: **Everyone** ou **Everyone 10+**

### Passo 6: Target Audience

- Selecionar: **13-17** e **18+** (NÃO selecionar <13 mesmo tendo Kids)
  - Kids acessam via conta do Responsável, não diretamente
  - Se selecionar <13, entra em Designed for Families = requisitos extras

### Passo 7: App Access

App Content → App Access:
- Selecionar: **All or some functionality is restricted**
- Adicionar credenciais de teste:
  - Copiar de `docs/store/STORE_REVIEW_CREDENTIALS.md`
  - Username: reviewer@... / Password: ...

### Passo 8: Upload e Teste Interno

1. No menu lateral: **Release → Testing → Internal testing**
2. Clicar **Create new release**
3. Upload do arquivo `.aab`
4. Adicionar **Release notes:** "Versão inicial — gestão de academias/boxes"
5. Clicar **Review release** → **Start rollout**

### Passo 9: Promover para Produção

Após testar internamente:
1. **Release → Production**
2. **Create new release** → usar o mesmo AAB
3. Clicar **Review release** → **Start rollout to Production**
4. **Tempo de review:** 1-7 dias (primeiro app demora mais)

---

## PARTE 2 — APPLE APP STORE (mais complexo)

### Passo 1: Configurar no Xcode

```bash
# Sincronizar
npx cap sync ios

# Abrir Xcode
npx cap open ios
```

No Xcode:
1. Selecionar **App** no navigator (barra lateral esquerda)
2. Aba **Signing & Capabilities**
3. **Team:** selecionar sua conta Apple Developer
4. **Automatically manage signing:** ✅ marcar
5. **Bundle Identifier:** verificar que é `app.blackbelt.academy` (ou `com.primalwod.app`)
6. Se aparecer erro de signing → clicar em "Register Device" ou "Fix Issue"

### Passo 2: Testar no dispositivo

1. Conectar iPhone via cabo USB
2. Selecionar seu iPhone como target (dropdown no topo)
3. Clicar ▶️ Play
4. Primeira vez: no iPhone → Ajustes → Geral → Gerenciamento de Dispositivo → confiar no certificado
5. Testar os fluxos principais

### Passo 3: Criar Archive

1. Selecionar target: **Any iOS Device (arm64)**
2. Menu: **Product → Archive**
3. Esperar compilar (pode demorar 2-5 min)
4. Organizer abre automaticamente com o archive

### Passo 4: Upload para App Store Connect

1. No Organizer, selecionar o archive
2. Clicar **Distribute App**
3. Selecionar **App Store Connect**
4. Clicar **Upload**
5. Esperar upload + processamento (5-15 min)

### Passo 5: Configurar no App Store Connect

1. Abrir https://appstoreconnect.apple.com
2. **My Apps** → **+** → **New App**
3. Preencher:
   - **Name:** BlackBelt (ou PrimalWOD) — ≤30 chars
   - **Primary language:** Portuguese (Brazil)
   - **Bundle ID:** selecionar o que foi configurado no Xcode
   - **SKU:** `app.blackbelt.academy` (identificador único)

### Passo 6: Preencher Metadata

Copiar de `docs/store/STORE_METADATA.md`:
- **Subtitle** (≤30 chars)
- **Description**
- **Keywords** (≤100 chars total, separados por vírgula)
- **Support URL:** https://[deploy-url]/suporte
- **Privacy Policy URL:** https://[deploy-url]/privacidade
- **Category:** Business

### Passo 7: Screenshots

- Fazer upload de screenshots para cada tamanho:
  - iPhone 6.7" (1290x2796) — obrigatório
  - iPhone 6.5" (1242x2688) — obrigatório  
  - iPad 12.9" — se suportar iPad
- Mínimo 3 screenshots por tamanho
- Pegar de `docs/store-screenshots/` ou tirar do dispositivo real

### Passo 8: App Review Information

- **Contact:** seu email e telefone
- **Demo Account:** copiar de `docs/store/STORE_REVIEW_CREDENTIALS.md`
- **Notes:** copiar de `docs/store/STORE_REVIEW_CREDENTIALS.md` a seção "Notes for Reviewers"

### Passo 9: Privacy

- **Privacy Labels:** preencher na aba App Privacy
  - Data types: Name, Email, Phone (optional), Date of Birth (teens/kids)
  - Usage: App Functionality
  - Linked to user: Yes
  - Tracking: No

### Passo 10: Pricing

- **Price:** Free
- **Availability:** Brazil (pelo menos)
- **Pre-Orders:** No

### Passo 11: Submeter para Review

1. Selecionar o build (o que você uploadou no Passo 4)
2. Verificar que todos os campos obrigatórios estão preenchidos
3. Clicar **Add for Review**
4. Clicar **Submit for Review**
5. **Tempo:** ~90% revisados em 24h, mas primeiro app pode demorar mais

---

## RESUMO DE TEMPO

| Tarefa | Tempo estimado |
|--------|----------------|
| Criar conta Apple Developer | 10 min + 24-48h aprovação |
| Criar conta Google Play | 10 min + 24-48h aprovação |
| Gerar AAB Android + upload | 30 min |
| Preencher Google Play Console | 1-2 horas |
| Configurar Xcode + Archive + Upload | 1 hora |
| Preencher App Store Connect | 1-2 horas |
| **TOTAL trabalho manual** | **~4-5 horas** |
| Review Google Play | 1-7 dias |
| Review Apple | 1-3 dias |

---

## DICAS IMPORTANTES

1. **Comece pelo Google Play** — é mais fácil, menos burocrático
2. **Keystore Android é IRREVERSÍVEL** — se perder o arquivo ou senha, não pode atualizar o app nunca mais. Faça backup em lugar seguro.
3. **Apple é mais rígido** — pode rejeitar na primeira tentativa. Motivos comuns:
   - WebView wrapper (resposta: "o app usa plugins nativos — haptics, push, camera, share")
   - Preços no app (resposta: "SaaS B2B, veja doc APPLE_MONETIZATION_JUSTIFICATION.md")
   - UGC sem moderação (resposta: "temos sistema de denúncia, bloqueio, e moderação admin")
4. **Se Apple rejeitar:** leia o motivo detalhado, corrija, e resubmeta. É normal levar 2-3 tentativas.
5. **Screenshots REAIS vendem mais** que screenshots gerados — tire do celular real com dados bonitos.
```

Salvar este guia no projeto.

```bash
npx tsc --noEmit
git add -A && git commit -m "docs: guia completo de publicação Apple App Store + Google Play"
git push origin main
```

---

## EXECUÇÃO

1. Detectar projeto e estado
2. Instalar/atualizar Capacitor se necessário
3. Configurar config
4. Adicionar plataformas
5. Configurar Android (keystore, signing, ícones, versão)
6. Configurar iOS (se no Mac)
7. Gerar guia GUIA_PUBLICACAO_STORES.md
8. Commit e push

COMECE PELA ETAPA 1 AGORA.

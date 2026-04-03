# Guia de Publicacao — Apple App Store + Google Play

Data: 2026-03-29
Projeto: BlackBelt v2
Bundle ID: `app.blackbelt.academy`

---

## PRE-REQUISITOS

### Contas (criar ANTES de tudo)

1. **Apple Developer Program** → https://developer.apple.com/programs/enroll/
   - Custo: US$99/ano (~R$500)
   - Tempo: aprovacao leva 24-48h
   - Tipo: Individual (pode mudar para Organization depois)
   - Precisa de: Apple ID + cartao internacional
   - Gregory precisa: passaporte ou RG + comprovante de endereco

2. **Google Play Console** → https://play.google.com/console/signup
   - Custo: US$25 (unico, nao renova)
   - Tempo: aprovacao 24-48h (verificacao de identidade)
   - Tipo: Organizacao (recomendado para SaaS)
   - Precisa de: Conta Google + cartao + DUNS number (para Organization)

### Ferramentas (todas verificadas em 2026-03-29)

| Ferramenta | Versao verificada | Obrigatorio para |
|------------|-------------------|------------------|
| Mac com Xcode 16.2 | ✅ Instalado | iOS |
| Android Studio | ✅ Instalado | Android |
| Java 21+ (OpenJDK) | ✅ 21.0.10 via Homebrew | Android (Capacitor 8 requer) |
| CocoaPods | ✅ 1.16.2 via Homebrew | iOS |
| pnpm | ✅ 10.30.2 | Ambos |
| Node.js 18+ | ✅ | Ambos |

**IMPORTANTE:** Java 21 e JAVA_HOME/ANDROID_HOME ja configurados em `~/.zshrc`.
Abrir novo terminal ou `source ~/.zshrc` para aplicar.

### Estado atual do projeto

| Item | Status |
|------|--------|
| Capacitor CLI | 7.6.1 ✅ |
| @capacitor/core | 7.6.1 ✅ |
| @capacitor/ios | 7.6.1 ✅ |
| @capacitor/android | 7.6.1 ✅ |
| Plugins nativos | 18 instalados ✅ |
| iOS platform | Existe ✅ |
| Android platform | Existe ✅ |
| Bundle ID (iOS) | app.blackbelt.academy ✅ |
| applicationId (Android) | app.blackbelt.academy ✅ |
| versionCode | 1 ✅ |
| versionName | 1.0 ✅ |
| Info.plist permissions | NSCamera, NSPhotoLibrary, NSFaceID ✅ |
| PrivacyInfo.xcprivacy | Existe ✅ |
| Android icons (mipmap) | Todos os tamanhos ✅ |
| iOS icon (1024x1024) | AppIcon-512@2x.png ✅ |
| Android signing config | Via signing.gradle (aplicado pelo cap-sync.sh) ✅ |
| Android debug build | ✅ BUILD SUCCESSFUL (530 tasks) |
| iOS release build | ✅ BUILD SUCCEEDED (CODE_SIGNING_ALLOWED=NO) |
| Android local.properties | ✅ SDK path configurado |
| JAVA_HOME / ANDROID_HOME | ✅ Configurados em ~/.zshrc |
| Android keystore | ❌ PRECISA GERAR (passo manual — interativo) |
| Apple Developer Account | ❌ PRECISA CRIAR |
| Google Play Account | ❌ PRECISA CRIAR |

---

## PARTE 0 — SINCRONIZAR CAPACITOR (antes de qualquer build)

```bash
cd ~/Projetos/black_belt_v2

# Opcao A: Script completo (recomendado — aplica patches automaticamente)
chmod +x scripts/cap-sync.sh
./scripts/cap-sync.sh all

# Opcao B: Sync manual
npx cap sync
```

O script `cap-sync.sh` faz automaticamente:
1. Configura Java 21 (JAVA_HOME)
2. Build Next.js (pule com `SKIP_BUILD=true`)
3. Prepara assets web para Capacitor
4. Sincroniza iOS e Android
5. Aplica patches no Info.plist (permissoes de camera, Face ID, galeria)
6. Cria local.properties com SDK path (Android)
7. Aplica signing config via signing.gradle (Android)
8. Copia PrivacyInfo.xcprivacy (Apple Privacy Manifest)

---

## PARTE 1 — GOOGLE PLAY (comecar por aqui — mais facil)

### Passo 1: Gerar o Keystore Android

**ATENCAO: Este arquivo e IRREVERSIVEL. Se perder o keystore ou a senha, NAO consegue atualizar o app na Play Store. Faca backup em lugar seguro (Google Drive, 1Password, etc.).**

```bash
cd ~/Projetos/black_belt_v2

# Gerar keystore (pede senha interativa)
keytool -genkey -v \
  -keystore android/app/blackbelt-release.keystore \
  -alias blackbelt \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -dname "CN=Gregory Pinto, O=BlackBelt, L=Vespasiano, ST=MG, C=BR"
```

Quando pedir senha, use uma senha forte e GUARDE EM LUGAR SEGURO.

### Passo 2: Configurar as senhas do signing

```bash
# Copiar template
cp android-signing.properties.example android/app/gradle.properties

# Editar com suas senhas
nano android/app/gradle.properties
```

Conteudo do `gradle.properties`:
```properties
RELEASE_STORE_FILE=blackbelt-release.keystore
RELEASE_STORE_PASSWORD=SUA_SENHA_REAL
RELEASE_KEY_ALIAS=blackbelt
RELEASE_KEY_PASSWORD=SUA_SENHA_REAL
```

### Passo 3: Sincronizar e abrir Android Studio

```bash
npx cap sync android
npx cap open android
```

### Passo 4: Gerar o AAB assinado

No Android Studio:
1. Esperar Gradle sync terminar (barra de progresso embaixo)
2. Menu: **Build → Generate Signed Bundle / APK...**
3. Selecionar **Android App Bundle**
4. Keystore path: `android/app/blackbelt-release.keystore`
5. Key alias: `blackbelt`
6. Digitar as senhas
7. Build variant: **release**
8. Clicar **Create**
9. AAB gerado em: `android/app/build/outputs/bundle/release/app-release.aab`

**Alternativa via terminal:**
```bash
cd android
./gradlew bundleRelease
# AAB em: app/build/outputs/bundle/release/app-release.aab
```

### Passo 5: Criar o app no Google Play Console

1. Abrir https://play.google.com/console
2. Clicar **"Create app"**
3. Preencher:
   - **App name:** BlackBelt
   - **Default language:** Portuguese (Brazil) — pt-BR
   - **App or game:** App
   - **Free or paid:** Free
4. Aceitar todas as declaracoes
5. Clicar **Create app**

### Passo 6: Preencher Store Listing

Copiar tudo de `docs/store/STORE_METADATA.md`:

| Campo | Valor |
|-------|-------|
| **Short description** (≤80 chars) | Gestao completa para academias de artes marciais — alunos, aulas, financeiro |
| **Full description** | Copiar secao PT-BR do STORE_METADATA.md |
| **App icon** | 512x512 PNG — `public/icons/icon-512x512.png` |
| **Feature graphic** | 1024x500 PNG — `public/app-icons/feature-graphic.png` |
| **Screenshots** | Minimo 2, ideal 5-8 — de `docs/store-screenshots/` ou tirar do device |

### Passo 7: Data Safety

No Play Console → App Content → Data Safety:

| Tipo de dado | Coletado | Compartilhado | Finalidade |
|---|---|---|---|
| Nome | Sim | Nao | Funcionalidade do app |
| Email | Sim | Nao | Gerenciamento de conta |
| Telefone | Sim (opcional) | Nao | Contato |
| Data nascimento | Sim (teens/kids) | Nao | Classificacao etaria |
| Fotos (avatar) | Sim (opcional) | Nao | Personalizacao |

- **Dados criptografados em transito?** Sim (HTTPS only)
- **Mecanismo de exclusao de dados?** Sim → https://blackbeltv2.vercel.app/excluir-conta
- **Politica de privacidade:** https://blackbeltv2.vercel.app/privacidade

Guia detalhado: `docs/store/GOOGLE_DATA_SAFETY_FORM.md`

### Passo 8: Content Rating (IARC)

App Content → Content Rating:
- Questionario IARC — responder honestamente
- Sem violencia, sem conteudo sexual, sem gambling, sem substancias
- **Resultado esperado:** Everyone / Livre

Guia de respostas: `docs/store/CONTENT_RATING_GUIDE.md`

### Passo 9: Target Audience

- Selecionar: **13-17** e **18+**
- **NAO selecionar <13** — Kids acessam via conta do Responsavel, nao diretamente
- Se selecionar <13, entra em "Designed for Families" = requisitos extras pesados

### Passo 10: App Access

App Content → App Access:
- Selecionar: **All or some functionality is restricted**
- Adicionar credenciais de teste:

| Campo | Valor |
|-------|-------|
| Username | gregoryguimaraes12@gmail.com |
| Password | BlackBelt@Review2026 |

Credenciais completas: `docs/store/STORE_REVIEW_CREDENTIALS.md`

### Passo 11: Upload e Internal Testing

1. Menu lateral: **Release → Testing → Internal testing**
2. **Create new release**
3. Upload do arquivo `.aab` (de Passo 4)
4. Release notes: "Versao 1.0 — gestao completa de academias de artes marciais"
5. **Review release** → **Start rollout**
6. Testar no device real usando o link de teste interno

### Passo 12: Promover para Producao

Apos testar internamente e estar tudo ok:
1. **Release → Production**
2. **Create new release** → usar o mesmo AAB
3. Release notes: "Gestao completa de academias de artes marciais — alunos, aulas, financeiro, video-aulas"
4. **Review release** → **Start rollout to Production**
5. **Tempo de review:** 1-7 dias (primeiro app demora mais)

---

## PARTE 2 — APPLE APP STORE

### Passo 1: Sincronizar e abrir Xcode

```bash
npx cap sync ios
npx cap open ios
```

### Passo 2: Configurar Signing no Xcode

1. No navigator (barra esquerda), clicar em **App**
2. Aba **Signing & Capabilities**
3. **Team:** selecionar sua conta Apple Developer
4. **Automatically manage signing:** ✅ marcar
5. **Bundle Identifier:** confirmar `app.blackbelt.academy`
6. Se aparecer erro → clicar "Register App ID" ou "Fix Issue"

### Passo 3: Testar no iPhone real

1. Conectar iPhone via cabo USB-C/Lightning
2. No dropdown de target (topo do Xcode), selecionar seu iPhone
3. Clicar ▶️ Play
4. **Primeira vez:** no iPhone → Ajustes → Geral → VPN e Gerenciamento de Dispositivo → confiar no certificado
5. Testar fluxos:
   - Login como Admin → dashboard
   - Login como Professor → aulas
   - Login como Aluno → treinos
   - Camera QR code
   - Push notifications (se Firebase configurado)

### Passo 4: Criar Archive

1. Selecionar target: **Any iOS Device (arm64)** (NAO um simulador)
2. Menu: **Product → Archive**
3. Esperar compilar (2-5 min)
4. Organizer abre automaticamente com o archive

### Passo 5: Upload para App Store Connect

1. No Organizer, selecionar o archive
2. Clicar **Distribute App**
3. Selecionar **App Store Connect**
4. **Distribution method:** App Store Connect
5. **Destination:** Upload
6. Clicar **Distribute** (pode demorar 5-15 min)
7. Esperar email "has completed processing"

### Passo 6: Criar o app no App Store Connect

1. Abrir https://appstoreconnect.apple.com
2. **My Apps** → **+** → **New App**
3. Preencher:

| Campo | Valor |
|-------|-------|
| **Platforms** | iOS |
| **Name** | BlackBelt |
| **Primary Language** | Portuguese (Brazil) |
| **Bundle ID** | app.blackbelt.academy (aparece no dropdown) |
| **SKU** | blackbelt-academy-2026 |
| **User Access** | Full Access |

### Passo 7: Preencher Metadata

Copiar de `docs/store/STORE_METADATA.md`:

| Campo | Valor |
|-------|-------|
| **Subtitle** (≤30 chars) | Gestao de Academias |
| **Description** | Copiar secao PT-BR do STORE_METADATA.md |
| **Keywords** (≤100 chars) | academia,artes marciais,bjj,jiu-jitsu,gestao,alunos,aulas,financeiro |
| **Support URL** | https://blackbeltv2.vercel.app/suporte |
| **Marketing URL** | https://blackbeltv2.vercel.app |
| **Privacy Policy URL** | https://blackbeltv2.vercel.app/privacidade |
| **Category** | Business |
| **Secondary Category** | Education |

### Passo 8: Screenshots

Fazer upload para cada tamanho obrigatorio:

| Tamanho | Resolucao | Obrigatorio |
|---------|-----------|-------------|
| iPhone 6.7" (Pro Max) | 1290x2796 | ✅ Sim |
| iPhone 6.5" (Plus) | 1242x2688 | ✅ Sim |
| iPad 12.9" (3rd gen+) | 2048x2732 | Se suportar iPad |

- Minimo 3 screenshots por tamanho
- Pegar de `docs/store-screenshots/` ou capturar do device real
- Screenshots REAIS vendem mais que mockups

### Passo 9: App Review Information

| Campo | Valor |
|-------|-------|
| **Contact First Name** | Gregory |
| **Contact Last Name** | Pinto |
| **Contact Phone** | +55 31 XXXXX-XXXX (seu numero real) |
| **Contact Email** | gregoryguimaraes12@gmail.com |
| **Demo Username** | gregoryguimaraes12@gmail.com |
| **Demo Password** | BlackBelt@Review2026 |

**Notes for Review** — copiar de `docs/store/STORE_METADATA.md` secao "App Review Notes". Pontos-chave:
- App e um SaaS B2B para gestao de academias de artes marciais
- Pagamentos sao B2B via gateway externo (Asaas) — nao e conteudo digital
- Precedentes: Mindbody, Glofox, Zen Planner
- 17 plugins nativos: biometria, push, camera, haptics, share, etc.

Justificativa completa: `docs/store/APPLE_MONETIZATION_JUSTIFICATION.md`

### Passo 10: App Privacy (Privacy Labels)

Na aba **App Privacy**:

| Data Type | Collection | Linked to User | Tracking |
|-----------|-----------|----------------|----------|
| Name | Yes | Yes | No |
| Email Address | Yes | Yes | No |
| Phone Number | Yes (optional) | Yes | No |
| Date of Birth | Yes (teens) | Yes | No |
| Photos | Yes (optional) | Yes | No |
| Crash Data | Yes (Sentry) | No | No |
| Performance Data | Yes (PostHog) | No | No |

- **Purpose:** App Functionality
- **Third-party sharing:** No
- **Tracking:** No

### Passo 11: Pricing and Availability

- **Price:** Free
- **Availability:** Brazil (pelo menos — pode adicionar mais paises depois)
- **Pre-Orders:** No

### Passo 12: Selecionar Build e Submeter

1. Na aba principal do app, secao **Build**
2. Clicar **+** para selecionar o build (enviado no Passo 5)
3. Verificar que TODOS os campos obrigatorios estao preenchidos (icone verde)
4. Clicar **Add for Review**
5. Clicar **Submit for Review**
6. **Tempo:** ~90% revisados em 24h, primeiro app pode demorar 48-72h

---

## RESPOSTAS PARA REJEICOES COMUNS

### "Your app is a web wrapper (Guideline 4.2)"

> BlackBelt utilizes 17 native Capacitor plugins providing native functionality beyond web capabilities:
> - Biometric authentication (Face ID / fingerprint)
> - Push notifications via APNs
> - Camera for QR code scanning (check-in)
> - Haptic feedback on interactions
> - Native share sheet
> - Splash screen with native animation
> - Status bar integration
> - Keyboard handling with body resize
> - Network status monitoring
> - Clipboard access
> - Device information
> - Local preferences storage
>
> The app provides a native experience with safe areas, dark mode, and platform-specific behaviors that cannot be replicated in a browser.

### "Payment links visible in app (Guideline 3.1.1)"

> BlackBelt is a B2B SaaS for martial arts academy management. The customer is the BUSINESS (academy), not the end consumer. This model is identical to:
> - Mindbody (fitness studio management — charges outside App Store)
> - Glofox (gym management — charges outside)
> - Zen Planner (martial arts management — charges outside)
> - Salesforce, HubSpot, Shopify, Slack, Notion
>
> Per Guideline 3.1.3(a), business management apps may offer alternative payment methods.
>
> See attached: APPLE_MONETIZATION_JUSTIFICATION.md

Documento completo: `docs/store/APPLE_MONETIZATION_JUSTIFICATION.md`

### "UGC without proper moderation (Guideline 1.2)"

> BlackBelt implements full UGC moderation:
> - Report button on all user-generated content
> - User blocking with confirmation dialog
> - Admin moderation dashboard with 4 statuses (Pending/Reviewing/Resolved/Dismissed)
> - Server-side profanity filter (Portuguese)
> - Admin can hide/delete reported messages
> - `blocked_users` table with full audit trail
>
> Moderation accessible at: /admin/moderacao (use demo admin credentials)

---

## CHECKLIST FINAL PRE-SUBMISSAO

### Google Play
- [ ] Conta Google Play Console criada e verificada
- [ ] Keystore gerado e senha guardada em lugar seguro
- [ ] AAB assinado gerado com sucesso
- [ ] Store listing preenchido (titulo, descricao, icone, screenshots)
- [ ] Data Safety preenchido
- [ ] Content Rating (IARC) respondido
- [ ] Target audience configurado (13+)
- [ ] App Access com credenciais de teste
- [ ] Internal testing feito em device real
- [ ] Release notes escritas

### Apple App Store
- [ ] Conta Apple Developer criada e aprovada
- [ ] Signing configurado no Xcode (Team selecionado)
- [ ] Testado em iPhone real via cabo
- [ ] Archive criado e uploadado
- [ ] App criado no App Store Connect
- [ ] Metadata preenchido (titulo, descricao, keywords, URLs)
- [ ] Screenshots enviadas (6.7" + 6.5")
- [ ] App Review Info preenchido com credenciais de teste
- [ ] Privacy Labels preenchidas
- [ ] Notes for Review com justificativa B2B
- [ ] Build selecionado e submetido

---

## TIMELINE ESTIMADA

| Etapa | Tempo |
|-------|-------|
| Criar contas (Apple + Google) | 10 min + 24-48h espera |
| Gerar keystore + AAB Android | 30 min |
| Preencher Google Play Console | 1-2h |
| Testar internal track Android | 1h |
| Configurar Xcode + testar iPhone | 1h |
| Archive + upload iOS | 30 min |
| Preencher App Store Connect | 1-2h |
| **Total trabalho manual** | **~5-7h** |
| Review Google Play | 1-7 dias |
| Review Apple | 1-3 dias (primeiro pode ser mais) |

---

## DICAS IMPORTANTES

1. **Comece pelo Google Play** — mais facil, menos burocratico, review mais rapido
2. **Keystore Android e IRREVERSIVEL** — backup em 2+ locais seguros
3. **Apple pode rejeitar na primeira vez** — e normal, leia o motivo e corrija
4. **Screenshots REAIS do device** vendem muito mais que mockups genericos
5. **Crie as contas de reviewer** no ambiente de producao ANTES de submeter
6. **Nao selecione <13 no target audience** — Kids acessam via conta do Responsavel
7. **Use `./scripts/cap-sync.sh all`** sempre antes de buildar — aplica todos os patches
8. **Teste em device real** antes de submeter — simulador nao pega tudo

---

## ARQUIVOS DE REFERENCIA

| Documento | Localizacao |
|-----------|-------------|
| Store Metadata (textos) | `docs/store/STORE_METADATA.md` |
| Credenciais de Review | `docs/store/STORE_REVIEW_CREDENTIALS.md` |
| Justificativa IAP Apple | `docs/store/APPLE_MONETIZATION_JUSTIFICATION.md` |
| Data Safety Google | `docs/store/GOOGLE_DATA_SAFETY_FORM.md` |
| Content Rating | `docs/store/CONTENT_RATING_GUIDE.md` |
| COPPA Compliance | `docs/store/COPPA_COMPLIANCE.md` |
| Checklist Final | `docs/store/CHECKLIST_FINAL.md` |
| Relatorio de Readiness | `docs/store/RELATORIO_STORE_READINESS.md` |
| Signing Template | `android-signing.properties.example` |
| Signing Gradle | `native-patches/android-signing.gradle` |
| Cap Sync Script | `scripts/cap-sync.sh` |
| Privacy Manifest (iOS) | `ios-privacy-manifest/PrivacyInfo.xcprivacy` |

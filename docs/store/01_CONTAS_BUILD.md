# 01 — Contas de Desenvolvedor + Build Técnico

Data: 2026-03-29

## PARTE 1 — CONTAS DE DESENVOLVEDOR

### Apple App Store
| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 1.1 | Conta Apple Developer Program (US$99/ano) | ❌ | Nenhum DEVELOPMENT_TEAM configurado no Xcode project — campo vazio no project.pbxproj. Sem conta ativa vinculada. |
| 1.2 | Informações de contato atualizadas | ❌ | Depende de 1.1 — conta inexistente |
| 1.3 | Acordo de licença aceito | ❌ | Depende de 1.1 — conta inexistente |
| 1.4 | Certificados de distribuição válidos | ❌ | CODE_SIGN_IDENTITY = "iPhone Developer" (certificado de dev, não de distribuição). Sem Distribution certificate. |
| 1.5 | Provisioning profiles configurados | ❌ | CODE_SIGN_STYLE = Automatic, mas sem DEVELOPMENT_TEAM. Nenhum provisioning profile pode ser gerado sem conta. |
| 1.6 | Status de trader (UE) | ⚠️ N/A | App só no Brasil inicialmente — não se aplica |

### Google Play Store
| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 1.7 | Conta Google Play Console (US$25) | ❌ | Sem evidência de conta. Sem google-services.json no projeto. |
| 1.8 | Verificação de identidade concluída | ❌ | Depende de 1.7 |
| 1.9 | Tipo de conta (Personal vs Organization) | ❌ | SaaS B2B com módulo financeiro DEVE ser Organization. Conta ainda não existe. |
| 1.10 | Organization obrigatório para financeiro | ❌ | App tem módulo financeiro — Google exige conta Organization para apps que lidam com dinheiro |
| 1.11 | Distribution Agreement aceito | ❌ | Depende de conta |
| 1.12 | Play App Signing aceito | ❌ | Depende de conta. Também: nenhum keystore encontrado no projeto. |

## PARTE 2 — BUILD TÉCNICO

### Apple (iOS)
| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 2.1 | Build com Xcode 16+ | ⚠️ | Plataforma iOS existe, mas IPHONEOS_DEPLOYMENT_TARGET = 15.0 (muito antigo). Precisa verificar versão do Xcode instalado. SWIFT_VERSION = 5.0 — ok. |
| 2.2 | SDK iOS 18+ target | ❌ | IPHONEOS_DEPLOYMENT_TARGET = 15.0. Apple exige builds contra SDK mais recente. Deployment target pode ser 15.0, mas precisa ser compilado com SDK 18+. Sem evidência de build real. |
| 2.3 | Capacitor iOS platform adicionada | ✅ | `ios/` existe com App.xcodeproj, Info.plist, Assets. @capacitor/ios ^8.3.0 instalado. |
| 2.4 | 64-bit architecture | ✅ | Capacitor 8 default. Info.plist tem UIRequiredDeviceCapabilities armv7 — considerar atualizar para arm64 (armv7 foi removido desde iOS 11). |
| 2.5 | IPv6-only funcional | ⚠️ | Capacitor usa WKWebView (ok). Supabase CDN suporta IPv6. Mas sem teste real em rede IPv6-only. |
| 2.6 | Testado em dispositivo real | ❌ | Sem DEVELOPMENT_TEAM, impossível ter rodado em device. Nenhuma evidência de teste em dispositivo. |
| 2.7 | Sem crashes/bugs óbvios | ❌ | Impossível confirmar — nunca buildou em device real. Capacitor config aponta server.url para https://blackbeltv2.vercel.app (remote), não bundle local. |
| 2.8 | iPhone app roda no iPad | ⚠️ | TARGETED_DEVICE_FAMILY = "1,2" (iPhone + iPad). UISupportedInterfaceOrientations~ipad configurado. Mas sem teste real. |

### Android
| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 2.9 | AAB format | ⚠️ | build.gradle não tem configuração explícita para AAB. Gradle pode gerar AAB via `bundleRelease`, mas nenhum build release foi configurado (minifyEnabled false, sem signingConfigs). |
| 2.10 | Target API level (min 34 em 2026) | ✅ | targetSdkVersion = 36, compileSdkVersion = 36, minSdkVersion = 24. Atualizado e acima do mínimo exigido. |
| 2.11 | versionCode incrementado | ⚠️ | versionCode = 1, versionName = "1.0". Ok para primeiro upload, mas pipeline de incremento não existe. |
| 2.12 | Play App Signing | ❌ | Nenhum keystore encontrado no projeto. Nenhum signingConfigs no build.gradle. Impossível gerar release build assinado. |
| 2.13 | APK/AAB < 200MB | ✅ | App é shell WebView apontando para URL remota (Vercel). Bundle será muito leve (~5-10MB). |
| 2.14 | Sem crashes/ANRs | ❌ | Sem evidência de teste em device Android. Sem google-services.json (push notifications vão falhar). |

### Problemas Críticos Adicionais Encontrados

| # | Problema | Severidade | Notas |
|---|----------|------------|-------|
| 2.15 | App é WebView remoto, não bundle local | ⚠️ RISCO ALTO | `capacitor.config.ts` tem `server.url: 'https://blackbeltv2.vercel.app'` — app carrega tudo do Vercel, sem conteúdo local. Apple pode rejeitar por ser "wrapper de website". O script `prepare-capacitor-web.mjs` gera apenas um HTML de redirecionamento no `out/`. |
| 2.16 | Sem google-services.json / GoogleService-Info.plist | ❌ | Push notifications (@capacitor/push-notifications) não funcionam sem Firebase config files. |
| 2.17 | Ícones são default Capacitor | ⚠️ | Ícones Android parecem ser os defaults do Capacitor (tamanhos pequenos: 2-15KB). Ícone iOS tem 110KB/1024x1024 — pode ser customizado. Verificar se são os assets reais da marca. |
| 2.18 | Info.plist sem NSCameraUsageDescription | ❌ | @capacitor/camera está nas dependências mas Info.plist não tem NSCameraUsageDescription. App será rejeitado pela Apple se camera for invocada. |
| 2.19 | AndroidManifest sem permissões necessárias | ⚠️ | Apenas INTERNET declarada. Camera, push notifications, biometria etc. podem precisar de permissões adicionais no manifest. |

## AÇÕES NECESSÁRIAS

### Prioridade CRÍTICA (Bloqueadores de Submissão)

| # | Ação | Esforço | Ref |
|---|------|---------|-----|
| A1 | Criar conta Apple Developer Program (US$99/ano) — processo leva 24-48h | 1 dia | 1.1-1.5 |
| A2 | Criar conta Google Play Console Organization (US$25) — verificação pode levar até 2 semanas | 1-14 dias | 1.7-1.12 |
| A3 | Gerar certificado de distribuição iOS + provisioning profile | 2h | 1.4, 1.5 |
| A4 | Configurar DEVELOPMENT_TEAM no Xcode project | 15 min | 1.4, 2.6 |
| A5 | Gerar keystore Android e configurar signingConfigs no build.gradle | 1h | 2.12 |
| A6 | Registrar app no Play App Signing | 30 min | 2.12 |
| A7 | Resolver arquitetura WebView remoto — Apple REJEITA wrappers de website (Guideline 4.2). Opções: (a) migrar para export estático local, ou (b) adicionar funcionalidade nativa significativa suficiente para justificar | 2-5 dias | 2.15 |
| A8 | Adicionar NSCameraUsageDescription, NSPhotoLibraryUsageDescription etc. no Info.plist | 1h | 2.18 |
| A9 | Configurar Firebase: adicionar google-services.json (Android) e GoogleService-Info.plist (iOS) | 2h | 2.16 |
| A10 | Adicionar permissões faltantes no AndroidManifest.xml (CAMERA, POST_NOTIFICATIONS, USE_BIOMETRIC) | 1h | 2.19 |

### Prioridade ALTA (Podem causar rejeição)

| # | Ação | Esforço | Ref |
|---|------|---------|-----|
| A11 | Atualizar UIRequiredDeviceCapabilities de armv7 para arm64 no Info.plist | 15 min | 2.4 |
| A12 | Substituir ícones default por ícones customizados da marca BlackBelt em todas as resoluções | 2h | 2.17 |
| A13 | Testar build em dispositivo iOS real | 2h | 2.6, 2.7 |
| A14 | Testar build em dispositivo Android real | 2h | 2.14 |
| A15 | Configurar build AAB release com assinatura | 1h | 2.9 |
| A16 | Criar pipeline de incremento automático de versionCode | 1h | 2.11 |

### Prioridade MÉDIA (Boas práticas)

| # | Ação | Esforço | Ref |
|---|------|---------|-----|
| A17 | Testar em rede IPv6-only | 1h | 2.5 |
| A18 | Testar layout no iPad (app já está configurado para iPhone + iPad) | 2h | 2.8 |
| A19 | Habilitar minifyEnabled/proguardFiles no release build Android | 30 min | 2.9 |

## RESUMO

- **Total: 27 items**
- ✅ **Pronto: 4** (2.3 Capacitor iOS, 2.4 64-bit, 2.10 Target API 36, 2.13 Tamanho OK)
- ⚠️ **Parcial: 9** (1.6, 2.1, 2.5, 2.8, 2.9, 2.11, 2.15, 2.17, 2.19)
- ❌ **Falta: 14** (1.1-1.5, 1.7-1.12, 2.2, 2.6, 2.7, 2.12, 2.14, 2.16, 2.18)

### Veredicto

**O projeto NÃO está pronto para submissão em nenhuma das lojas.** Os dois bloqueadores principais são:

1. **Contas de desenvolvedor inexistentes** — nenhuma das duas contas (Apple/Google) foi criada. Sem elas, nada pode ser submetido.
2. **Arquitetura de WebView remoto** — o app é essencialmente um wrapper que redireciona para `blackbeltv2.vercel.app`. Apple tem histórico de rejeitar esse tipo de app sob a Guideline 4.2 ("Minimum Functionality"). O app precisa ter conteúdo local significativo ou funcionalidade nativa que justifique sua existência como app nativo, além do que um bookmark na home screen ofereceria.

**Estimativa para ficar pronto:** 2-4 semanas (considerando tempo de aprovação de contas + refatoração da arquitetura WebView).

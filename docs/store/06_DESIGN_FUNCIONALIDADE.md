# 06 — Design, Funcionalidade, Acessibilidade + Native

Data: 2026-03-29

## PARTE 1 — FUNCIONALIDADE MINIMA

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 7.1 | App oferece funcionalidade real (nao e website empacotado) | ✅ | Capacitor com 17 plugins nativos: push, haptics, camera, biometrics, network, keyboard, status bar, splash, share, clipboard, browser, preferences, toast. Tem features que justificam nativo. |
| 7.2 | Funcionalidades nativas justificam app nativo | ✅ | Push notifications, haptic feedback (checkin QR), camera scanner, biometric auth (Face ID/Touch ID), offline cache via Preferences, deep links. Nao e um mero webview. |
| 7.3 | App funciona sem internet (offline basico) | ✅ | Service Worker (`public/sw.js`) com cache-first para assets estaticos, network-first para paginas, offline.html fallback, background sync para checkins, Capacitor Network plugin + Preferences para cache de dados. |
| 7.4 | Performance aceitavel (nao lento) | ⚠️ | Precisa teste real em device fisico. Skeleton loading presente (2162 refs), mas server: { url } no capacitor.config aponta para URL remota (nao bundle local), o que pode causar latencia de carregamento inicial. |
| 7.5 | Sem telas placeholder/em construcao | ✅ | Nenhuma referencia a "em construcao", "em breve" ou "coming soon" encontrada. Apenas `placeholder` em inputs de formulario (uso correto). |

## PARTE 2 — LOGIN E AUTENTICACAO

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 7.6 | Login funcional (email/senha) | ✅ | `signInWithPassword` implementado em `lib/api/auth.service.ts`. |
| 7.7 | Sign in with Apple (OBRIGATORIO se tem login social) | ✅ | Implementado. `lib/auth/oauth.ts` suporta provider `'apple'`. Botao presente na pagina de login (`app/(auth)/login/page.tsx:253`). Apple exige isso se qualquer login social e oferecido. |
| 7.8 | Google Sign In | ✅ | Implementado. `signInWithOAuth('google')` via Supabase OAuth. Botao na pagina de login (`app/(auth)/login/page.tsx:234`). |
| 7.9 | Recuperacao de senha | ✅ | Fluxo completo: `app/(auth)/esqueci-senha/page.tsx` envia email via `resetPasswordForEmail`, `app/(auth)/redefinir-senha/page.tsx` processa o reset. Link "esqueci senha" na tela de login. |
| 7.10 | Logout funcional | ✅ | `lib/api/auth.service.ts:252` com `supabase.auth.signOut()`. Usado em `AuthContext` e exposto em multiplos shells. |

## PARTE 3 — UI/UX

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 7.11 | Safe areas para notch | ✅ | Implementado em todos os shells: `var(--safe-area-top)` e `var(--safe-area-bottom)`. CSS define `env(safe-area-inset-*)` em `:root`. AdminShell, ProfessorShell, MainShell, KidsShell, TeenShell, ParentShell, RecepcaoShell, SuperAdminShell — todos com safe area top/bottom. OfflineBanner e BetaFeedbackFAB tambem respeitam. |
| 7.12 | Keyboard handling (teclado nao cobre campos) | ✅ | Capacitor Keyboard plugin configurado com `resize: 'body'` e `resizeOnFullScreen: true` no `capacitor.config.ts`. Isso faz o WebView redimensionar automaticamente quando o teclado abre. |
| 7.13 | Orientacao: portrait locked? | ⚠️ | iOS Info.plist permite Portrait + LandscapeLeft + LandscapeRight no iPhone. Para app de gestao, recomendado travar em portrait no iPhone (iPad pode ser livre). Nao esta travado. |
| 7.14 | Back button funciona (Android) | ⚠️ | Nao ha handler explicito para `App.addListener('backButton')`. O Capacitor tem comportamento padrao de back button (navega historico), mas sem handler customizado pode fechar o app inesperadamente em telas raiz. Paginas internas usam `router.back()` (8+ refs). |
| 7.15 | Loading states em todas as telas | ✅ | 2162 referencias a Skeleton/loading em componentes e paginas. Padrao bem estabelecido no projeto. |
| 7.16 | Error states em todas as telas | ✅ | 14 arquivos `error.tsx` cobrindo todos os route groups: root, auth, public, main, admin, professor, recepcao, franqueador, kids, teen, parent, superadmin, network, cockpit. |
| 7.17 | Empty states | ✅ | 3 componentes de EmptyState (`components/ui/EmptyState.tsx`, `components/shared/EmptyState.tsx`, `components/shared/EmptyStates.tsx`, `components/cockpit/EmptyState.tsx`). 67 usos em paginas do app. |

## PARTE 4 — ACESSIBILIDADE

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 7.18 | Contraste minimo WCAG 2.1 | ⚠️ | Design system usa CSS variables com cores definidas. Light mode: ink-100 `#0F1117` sobre depth-2 `#FFFFFF` (ratio ~18:1, excelente). Dark mode: ink-100 `#F4F4F7` sobre depth-2 `#0C0E14` (ratio ~17:1, excelente). MAS cores intermediarias (ink-60: `#6B7085` sobre `#FFFFFF` = ~4.7:1, marginal para AA body text). Precisa auditoria completa de combinacoes em uso real. |
| 7.19 | Dynamic Type / font scaling | ✅ | Tailwind usa `rem` por padrao. 4967 referencias a classes de texto (`text-sm`, `text-base`, `text-lg`, `text-xl`). Fontes em rem escalam com preferencias do usuario. Nao usa `px` fixo para texto. |
| 7.20 | VoiceOver / TalkBack compativel | ⚠️ | 420 atributos de acessibilidade (`aria-*`, `role=`, `alt=`, `sr-only`, `tabIndex`). Presente, mas para um app desta complexidade (centenas de paginas, multiplos perfis), a cobertura e provavelmente insuficiente. ThemeToggle tem `aria-label` (bom exemplo), mas precisa auditoria com VoiceOver/TalkBack real. |
| 7.21 | Dark mode | ✅ | Totalmente implementado. ThemeContext suporta `system`, `light`, `dark`. CSS variables redefinem todas as cores em `.dark`. ThemeToggle permite ciclar entre modos. Respeita `prefers-color-scheme` do OS quando em modo `system`. |

## PARTE 5 — CAPACITOR/NATIVE

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 7.22 | Capacitor plugins instalados | ✅ | 17 plugins: `@capacitor/android` ^8.3, `@capacitor/ios` ^8.3, `@capacitor/core` ^8.2, `@capacitor/cli` ^8.2, `@capacitor/app` ^8.0.1, `@capacitor/browser` ^8.0.2, `@capacitor/camera` ^8.0.2, `@capacitor/clipboard` ^8.0.1, `@capacitor/haptics` ^8.0.1, `@capacitor/keyboard` ^8.0.1, `@capacitor/network` ^8.0.1, `@capacitor/preferences` ^8.0.1, `@capacitor/push-notifications` ^8.0.2, `@capacitor/share` ^8.0.1, `@capacitor/splash-screen` ^8.0.1, `@capacitor/status-bar` ^8.0.1, `@capacitor/toast` ^8.0.1. Tambem: `capacitor-native-biometric` (biometria). |
| 7.23 | Push notifications | ✅ | `lib/native/push-notifications.ts` com `PushNotifications.requestPermissions()`, `register()`, `addListener('registration')`, `addListener('pushNotificationReceived')`, `addListener('pushNotificationActionPerformed')`. Config no `capacitor.config.ts` com `presentationOptions: ['badge', 'sound', 'alert']`. Service Worker tambem trata push web. |
| 7.24 | Camera | ✅ | `lib/native/camera-scanner.ts` usa `@capacitor/camera` para QR scanner no checkin. `components/checkin/QRScanner.tsx` integra com haptics. |
| 7.25 | Deep links configurados | ✅ | `public/.well-known/apple-app-site-association` com appIDs e paths (`/auth/callback`, `/redefinir-senha`, `/convite/*`, `/cadastro/*`, `/verificar/*`). `public/.well-known/assetlinks.json` para Android (fingerprint precisa ser preenchido apos signing). `lib/native/deep-links.ts` com `App.addListener('appUrlOpen')` e `App.getLaunchUrl()`. **ATENCAO**: `assetlinks.json` tem `sha256_cert_fingerprints: ["TO_BE_FILLED_AFTER_SIGNING"]` — precisa preencher antes do deploy. AASA usa `TEAM_ID.app.blackbelt.v2` — precisa substituir TEAM_ID real. |
| 7.26 | Splash screen nativa | ✅ | Configurado no `capacitor.config.ts`: `launchShowDuration: 2000`, `backgroundColor: '#0A0A0A'`, `splashFullScreen: true`, `splashImmersive: true`, `androidSplashResourceName: 'splash'`. |
| 7.27 | Status bar styling | ✅ | `lib/native/status-bar.ts` com `configureStatusBar(darkMode)`, `hideStatusBar()`, `showStatusBar()`. Diferencia iOS (style only) e Android (style + backgroundColor). Config padrao no `capacitor.config.ts`: `style: 'DARK'`, `backgroundColor: '#0A0A0A'`. |

## PARTE 6 — FEATURES NATIVAS ADICIONAIS (encontradas)

| Feature | Status | Arquivo |
|---------|--------|---------|
| Biometric Auth (Face ID / Touch ID / Fingerprint) | ✅ | `lib/native/biometric-auth.ts` — `capacitor-native-biometric` |
| Haptic Feedback | ✅ | `lib/native/haptics.ts` — success, error, warning, light, medium |
| Offline Cache (Preferences) | ✅ | `lib/native/offline-cache.ts` — Network status + cache/retrieve data |
| Payment Redirect | ✅ | `lib/native/payment-redirect.ts` |
| Biometric Checkin | ✅ | `lib/native/biometric-checkin.ts` |

## ACOES NECESSARIAS

| # | Acao | Prioridade | Esforco |
|---|------|------------|---------|
| 1 | **Android Back Button handler** — Adicionar `App.addListener('backButton')` para evitar que o app feche ao apertar back na tela raiz. Deve mostrar confirmacao ou navegar para dashboard. | ALTA | 2h |
| 2 | **AASA: substituir TEAM_ID** em `public/.well-known/apple-app-site-association` pelo Team ID real da Apple. | ALTA | 15min |
| 3 | **Asset Links: preencher sha256_cert_fingerprints** em `public/.well-known/assetlinks.json` apos gerar keystore de producao. | ALTA | 15min |
| 4 | **iOS Portrait Lock (iPhone)** — Travar orientacao em portrait no iPhone em `Info.plist` (remover LandscapeLeft/Right). iPad pode manter todas as orientacoes. | MEDIA | 30min |
| 5 | **Auditoria VoiceOver/TalkBack** — 420 atributos de acessibilidade e insuficiente para app deste porte. Fazer teste manual com VoiceOver (iOS) e TalkBack (Android) nas telas principais (login, dashboard, checkin, calendario, perfil). Adicionar `aria-label` em botoes com icone, tabelas, modais. | MEDIA | 8-16h |
| 6 | **Auditoria de contraste WCAG** — Verificar combinacoes de cores intermediarias (ink-60 sobre backgrounds claros, ink-40 em dark mode). Usar ferramenta como axe ou Lighthouse. | MEDIA | 4h |
| 7 | **Performance em device real** — Testar em iPhone SE (low-end iOS) e Android mid-range. O app carrega via URL remota (`server.url` no capacitor.config), nao bundle local. Latencia de first load pode ser problema em 3G. Considerar `static export` para bundle local. | MEDIA | 4-8h |
| 8 | **capacitor.config.ts appId divergencia** — Config diz `app.blackbelt.academy` mas AASA/assetlinks usam `app.blackbelt.v2`. Precisam ser consistentes. | ALTA | 15min |

## RESUMO

- **Total: 27 items**
- ✅ **Pronto: 22** (81%)
- ⚠️ **Parcial: 5** (19%) — orientacao, back button Android, contraste WCAG, VoiceOver, performance device
- ❌ **Falta: 0**

### Veredito

O projeto esta surpreendentemente bem preparado para native. A camada `lib/native/` e robusta com 11 modulos dedicados, cobrindo push, haptics, biometria, camera, deep links, offline cache, status bar, e keyboard. Todos os shells respeitam safe areas. Dark mode esta 100% implementado com CSS variables. Error boundaries cobrem todos os route groups. Empty states e skeleton loading estao disseminados.

Os pontos criticos antes de submeter para as stores sao:

1. **Corrigir appId inconsistente** entre `capacitor.config.ts` e os deep link configs (15 min, bloqueante).
2. **Preencher TEAM_ID e sha256 fingerprints** nos deep link configs (15 min cada, bloqueante).
3. **Adicionar Android back button handler** para evitar rejeicao por UX ruim (2h, alta prioridade).
4. **Travar portrait no iPhone** — nao e bloqueante, mas app de gestao em landscape fica estranho (30 min).
5. **Auditoria de acessibilidade** com VoiceOver/TalkBack antes de submeter, especialmente se mirar mercado educacional/governamental (8-16h, media prioridade).

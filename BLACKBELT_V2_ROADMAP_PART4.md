# BLACKBELT v2 — Master Roadmap Part 4

> Do Código à Primeira Venda
> Fases 31–33 · 20 Prompts Executáveis · Produção Real · Stores · Revenue
>
> Autor: Gregory Gonçalves Silveira Pinto
> Data: Março 2026 | Pré-requisito: Fases 0–30 concluídas

---

## Contexto

Os Blocos 1-3 (152 prompts) entregaram um ecossistema completo em código. Mas código com mocks não paga conta. Este bloco faz a transição final: banco real, pagamentos reais, builds reais, stores reais, clientes reais. Ao final do P172, o BlackBelt está recebendo PIX de academias.

**Diferença fundamental deste bloco:** Metade dos prompts geram código/configuração. A outra metade são checklists de ações que VOCÊ precisa executar (criar contas, pagar, assinar). Os prompts marcados com 🔧 são código. Os marcados com 📋 são ação manual com checklist.

---

## Visão Geral das Fases 31–33

| Fase | Nome | Foco | Prompts | Resultado |
|------|------|------|---------|-----------|
| 31 | Infraestrutura de Produção | Supabase real, domínio, email, monitoring | P153–P160 | Backend real funcionando |
| 32 | Stores & Mobile Real | Builds nativos, TestFlight, Play Store | P161–P166 | App nas stores |
| 33 | Go-To-Market | Pricing, onboarding, beta, primeira venda | P167–P172 | Receita entrando |

---

## FASE 31 — INFRAESTRUTURA DE PRODUÇÃO

Sair dos mocks. Tudo real: banco, auth, pagamentos, email, monitoring.

---

#### PROMPT P153 📋: Criar Contas e Serviços

```
CHECKLIST DE AÇÃO MANUAL — Crie todas as contas necessárias:

1. SUPABASE (supabase.com)
   - [ ] Criar projeto "blackbelt-production"
   - [ ] Região: South America (São Paulo) se disponível, ou US East
   - [ ] Anotar: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
   - [ ] Anotar: SUPABASE_PROJECT_REF, SUPABASE_DB_PASSWORD
   - [ ] Plano: Free para começar (upgrade quando >500MB ou >50k requests)

2. VERCEL (vercel.com)
   - [ ] Projeto já existe (blackbelt-v2)
   - [ ] Configurar domínio customizado (ver P155)
   - [ ] Anotar: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID

3. ASAAS (asaas.com) — Gateway de pagamento
   - [ ] Criar conta PJ ou PF
   - [ ] Ativar sandbox primeiro para testes
   - [ ] Anotar: ASAAS_API_KEY (sandbox), ASAAS_WEBHOOK_TOKEN
   - [ ] Depois: gerar chave de produção
   - [ ] Alternativa: Stripe (stripe.com) se preferir

4. RESEND (resend.com) — Email transacional
   - [ ] Criar conta
   - [ ] Verificar domínio (DNS records)
   - [ ] Anotar: RESEND_API_KEY
   - [ ] Configurar FROM: noreply@seudominio.com

5. SENTRY (sentry.io)
   - [ ] Criar projeto Next.js
   - [ ] Anotar: SENTRY_DSN, SENTRY_AUTH_TOKEN
   - [ ] Configurar alertas de email

6. DOMÍNIO
   - [ ] Registrar domínio (ex: blackbelt.app, useblackbelt.com.br)
   - [ ] Provedor sugerido: Cloudflare (DNS rápido + grátis)
   - [ ] Anotar: domínio escolhido

7. APPLE DEVELOPER (developer.apple.com)
   - [ ] Criar conta ($99/ano)
   - [ ] Aceitar todos os agreements
   - [ ] Criar App ID: com.blackbelt.app

8. GOOGLE PLAY (play.google.com/console)
   - [ ] Criar conta de desenvolvedor ($25 único)
   - [ ] Preencher perfil de desenvolvedor
   - [ ] Criar app listing

9. (OPCIONAL) EVOLUTION API — WhatsApp
   - [ ] Servidor VPS para hospedar (DigitalOcean $6/mês)
   - [ ] Ou usar Twilio WhatsApp ($0.005/msg)
   - [ ] Anotar: WHATSAPP_API_URL, WHATSAPP_API_KEY

Guarde todas as chaves num gerenciador de senhas (1Password, Bitwarden).
NÃO coloque nenhuma chave no código. Tudo via variáveis de ambiente.
```

---

#### PROMPT P154 🔧: Configurar Supabase de Produção

```
Configure o Supabase real do BlackBelt v2:

1. Rode as migrações no banco de produção:
   cd ~/Projetos/black_belt_v2
   pnpm add -D supabase
   npx supabase login
   npx supabase link --project-ref SEU_PROJECT_REF
   npx supabase db push

2. Verifique que todas as 9 migrações rodaram:
   npx supabase db push --dry-run
   (deve mostrar "No changes to push")

3. Configure Auth no dashboard do Supabase:
   - Settings > Auth > Site URL: https://seudominio.com
   - Settings > Auth > Redirect URLs: adicionar https://seudominio.com/**
   - Settings > Auth > Disable email confirmations (para MVP, ativa depois)
   - Settings > Auth > Enable "Confirm email" depois do beta

4. Configure Storage:
   - Criar bucket "avatars" (público)
   - Criar bucket "training-videos" (privado, RLS)
   - Criar bucket "content" (privado, RLS)
   - Criar bucket "contracts" (privado, RLS)
   - Políticas de upload: max 50MB para vídeos, 5MB para imagens

5. Configure Edge Functions:
   npx supabase functions deploy generate-qr
   npx supabase functions deploy process-checkin
   npx supabase functions deploy promote-belt
   npx supabase functions deploy generate-invoices
   npx supabase functions deploy send-push

6. Seed de dados de demo:
   npx supabase db reset (CUIDADO: só em staging, nunca em prod com dados reais)

7. Teste: mude NEXT_PUBLIC_USE_MOCK=false e verifique que login funciona.
```

---

#### PROMPT P155 🔧: Configurar Domínio e SSL

```
Configure domínio customizado do BlackBelt v2:

1. No Cloudflare (ou seu DNS provider):
   - Adicionar domínio
   - Configurar nameservers

2. Na Vercel:
   - Settings > Domains > Add Domain
   - Adicionar: seudominio.com e www.seudominio.com
   - Vercel fornece os records DNS necessários
   - Adicionar no Cloudflare:
     CNAME seudominio.com → cname.vercel-dns.com
     CNAME www → cname.vercel-dns.com
   - SSL automático pela Vercel

3. No Supabase:
   - Settings > API > Custom Domains (se plano Pro)
   - Ou manter URL padrão do Supabase (funciona bem)

4. Atualize variáveis de ambiente na Vercel:
   NEXT_PUBLIC_APP_URL=https://seudominio.com
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
   SUPABASE_SERVICE_ROLE_KEY=xxx
   NEXT_PUBLIC_USE_MOCK=false
   NEXT_PUBLIC_SENTRY_DSN=xxx
   SENTRY_AUTH_TOKEN=xxx
   RESEND_API_KEY=xxx
   PAYMENT_GATEWAY=asaas
   ASAAS_API_KEY=xxx
   ASAAS_WEBHOOK_TOKEN=xxx

5. Configure webhook do gateway de pagamento:
   - URL: https://seudominio.com/api/webhooks/payment
   - Eventos: payment.confirmed, payment.overdue, subscription.*

6. Redeploy:
   git push origin main
   (Vercel rebuilda automaticamente)

7. Teste: acesse https://seudominio.com → deve carregar o login.
```

---

#### PROMPT P156 🔧: Ativar Sentry e Monitoring

```
Ative o monitoring real do BlackBelt v2:

1. Instale Sentry:
   pnpm add @sentry/nextjs

2. Configure sentry.client.config.ts (substituir stub):
   import * as Sentry from '@sentry/nextjs';
   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     tracesSampleRate: 0.1,
     replaysSessionSampleRate: 0.05,
     replaysOnErrorSampleRate: 1.0,
     environment: process.env.NODE_ENV,
   });

3. Configure sentry.server.config.ts:
   import * as Sentry from '@sentry/nextjs';
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     tracesSampleRate: 0.2,
     environment: process.env.NODE_ENV,
   });

4. Configure next.config.mjs para Sentry:
   import { withSentryConfig } from '@sentry/nextjs';
   export default withSentryConfig(nextConfig, {
     org: "sua-org",
     project: "blackbelt",
     silent: true,
     hideSourceMaps: true,
   });

5. Crie Error Boundary global:
   app/error.tsx → Sentry.captureException + PageError component
   app/global-error.tsx → fallback de último recurso

6. Configure alertas no Sentry dashboard:
   - Email quando error rate > 1%
   - Email quando nova issue (first seen)
   - Slack se tiver (opcional)

7. Crie app/api/health/route.ts:
   GET → { status: 'ok', timestamp, supabase: 'connected'|'error' }
   Testar conexão Supabase com query simples (SELECT 1)

8. Configure UptimeRobot (uptimerobot.com, grátis):
   - Monitor: https://seudominio.com/api/health
   - Intervalo: 5 minutos
   - Alerta: email quando down

9. Redeploy e verifique: cause um erro proposital, veja no Sentry.
```

---

#### PROMPT P157 🔧: Ativar Email Transacional

```
Configure email real do BlackBelt v2:

1. No Resend (resend.com):
   - Verificar domínio: adicionar records DNS (SPF, DKIM, DMARC)
   - Aguardar verificação (pode levar horas)
   - Testar envio pelo dashboard

2. Atualize lib/api/channels/email.channel.ts:
   No branch real (não mock):
   import { Resend } from 'resend';
   const resend = new Resend(process.env.RESEND_API_KEY);
   
   async function sendEmail(to, template, data) {
     const html = renderTemplate(template, data);
     await resend.emails.send({
       from: 'BlackBelt <noreply@seudominio.com>',
       to,
       subject: getSubject(template),
       html,
     });
   }

3. Instale: pnpm add resend

4. Teste cada template:
   - Boas-vindas (registro de novo usuário)
   - Reset de senha
   - Lembrete de aula
   - Fatura gerada
   - Promoção de faixa

5. Configure rate limits:
   - Resend free: 100 emails/dia, 3000/mês
   - Suficiente para beta com 5-10 academias
   - Upgrade quando precisar

6. Configure unsubscribe:
   - Header List-Unsubscribe em todo email
   - Link de unsubscribe no footer
   - Respeitar preferências de notificação do usuário
```

---

#### PROMPT P158 🔧: Ativar Gateway de Pagamento

```
Configure pagamentos reais do BlackBelt v2:

1. No Asaas (sandbox primeiro):
   - Criar customer de teste
   - Criar cobrança de teste (PIX, boleto)
   - Configurar webhook para URL de staging
   - Testar fluxo completo: criar → pagar → webhook → confirmar

2. Atualize lib/api/gateways/asaas.gateway.ts:
   No branch real:
   const ASAAS_URL = process.env.ASAAS_SANDBOX 
     ? 'https://sandbox.asaas.com/api/v3'
     : 'https://api.asaas.com/api/v3';
   
   Headers: { 'access_token': process.env.ASAAS_API_KEY }

3. Implemente cada método:
   - createCustomer → POST /customers
   - createSubscription → POST /subscriptions
   - generateInvoice → POST /payments
   - getPaymentLink → payment.invoiceUrl
   - processWebhook → validar + processar evento

4. Teste o fluxo completo no sandbox:
   - Aluno se inscreve em plano
   - Sistema gera cobrança PIX
   - QR code aparece no checkout
   - "Pagar" no sandbox
   - Webhook recebido
   - Invoice marcada como paid
   - Subscription ativada

5. Quando sandbox OK, troque para produção:
   - Nova API key de produção
   - URL de produção
   - Webhook de produção
   - Teste com R$ 1,00 real

6. Variáveis de ambiente:
   PAYMENT_GATEWAY=asaas
   ASAAS_API_KEY=xxx (produção)
   ASAAS_WEBHOOK_TOKEN=xxx
   ASAAS_SANDBOX=false
```

---

#### PROMPT P159 🔧: Configurar GitHub Secrets e CI/CD Real

```
Configure CI/CD de produção do BlackBelt v2:

1. No GitHub (Settings > Secrets and variables > Actions):
   Adicione TODOS os secrets:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_ACCESS_TOKEN
   - SUPABASE_DB_PASSWORD
   - SUPABASE_PROJECT_REF
   - NEXT_PUBLIC_SENTRY_DSN
   - SENTRY_DSN
   - SENTRY_AUTH_TOKEN
   - VERCEL_TOKEN
   - VERCEL_ORG_ID
   - VERCEL_PROJECT_ID

2. Atualize .github/workflows/ci.yml:
   - Adicione step de deploy para Vercel:
     - uses: amondnet/vercel-action@v25
       with:
         vercel-token: ${{ secrets.VERCEL_TOKEN }}
         vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
         vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
         vercel-args: '--prod'

3. Atualize .github/workflows/supabase-deploy.yml:
   - Substitua placeholders por ${{ secrets.XXX }}

4. Crie .github/workflows/release.yml:
   - Trigger: tag v*.*.* (ex: v1.0.0)
   - Gera changelog automático
   - Cria GitHub Release
   - Deploy produção

5. Teste:
   - Push para main → CI roda → deploy automático
   - Altere uma migration → supabase deploy roda
   - Crie tag v1.0.0 → release criada

6. Proteja a branch main:
   - Settings > Branches > Branch protection rules
   - Require: PR reviews, status checks, up-to-date
```

---

#### PROMPT P160 🔧: Página de Status e Legal

```
Crie as páginas legais e de status do BlackBelt v2:

1. app/(public)/privacidade/page.tsx:
   Política de privacidade completa (LGPD):
   - Quais dados coletamos e por quê
   - Como usamos os dados
   - Compartilhamento com terceiros
   - Direitos do titular (acesso, correção, exclusão)
   - Retenção de dados
   - Cookies
   - Contato do DPO (email)
   Gere texto completo em português. Tom profissional mas acessível.

2. app/(public)/termos/page.tsx:
   Termos de uso do SaaS:
   - Descrição do serviço
   - Planos e pagamento
   - Cancelamento e reembolso
   - Responsabilidades do usuário
   - Propriedade intelectual
   - Limitação de responsabilidade
   - Foro: comarca da sua cidade
   Gere texto completo. Tom jurídico mas legível.

3. app/(public)/status/page.tsx:
   Página de status pública:
   - Fetch /api/health em tempo real
   - Indicadores: App, Banco, Pagamentos, Email
   - Verde (operacional) / Amarelo (degradado) / Vermelho (fora)
   - Histórico de incidentes (mock inicialmente)
   - "Última atualização: há X minutos"

4. Atualize footer de TODAS as páginas públicas:
   - Link para /privacidade
   - Link para /termos
   - Link para /status
   - © 2026 BlackBelt. Todos os direitos reservados.

5. Atualize docs/STORE_METADATA.md com URLs reais das policies.
```

---

## FASE 32 — STORES & MOBILE REAL

Builds nativos reais. TestFlight. Google Play. App publicado.

---

#### PROMPT P161 📋: Preparar Assets para Stores

```
CHECKLIST DE AÇÃO MANUAL — Assets necessários para publicação:

1. ÍCONE DO APP:
   - [ ] Design profissional 1024×1024 PNG (sem transparência)
   - [ ] Versões: iOS (rounded corners automático), Android (adaptive icon)
   - [ ] Ferramenta sugerida: Figma ou Canva
   - [ ] Salvar em resources/icon.png

2. SPLASH SCREEN:
   - [ ] Design: fundo #C62828 + logo BlackBelt centralizado
   - [ ] 2732×2732 PNG (cobre todos os devices)
   - [ ] Salvar em resources/splash.png

3. SCREENSHOTS (mínimo 3, ideal 6):
   iPhone 6.7" (1290×2796):
   - [ ] Tela de login
   - [ ] Dashboard do aluno
   - [ ] Check-in QR code
   - [ ] Grade horária
   - [ ] Progresso de faixa
   - [ ] Conquistas
   
   iPhone 6.5" (1284×2778): mesmas telas
   iPad 12.9" (2048×2732): mesmas telas (se universal)
   Android: mesmas dimensões do iPhone 6.7"

   COMO GERAR:
   - Rode o app no simulador/device com dados mock bonitos
   - Screenshot nativo do device
   - Ou use ferramenta: screenshots.pro, appstorescreenshot.com

4. FEATURE GRAPHIC (Google Play):
   - [ ] 1024×500 PNG
   - [ ] Logo + tagline + visual da academia

5. VÍDEO DE PREVIEW (opcional mas recomendado):
   - [ ] 15-30 segundos mostrando as principais features
   - [ ] App Store: 1920×1080 ou formato do device
   - [ ] Ferramenta: gravar tela do simulador

Salve tudo em resources/ organizado por plataforma.
```

---

#### PROMPT P162 🔧: Build iOS Real (Xcode)

```
Build iOS real do BlackBelt v2:

1. Pré-requisitos:
   - macOS com Xcode 15+ instalado
   - Apple Developer Account ativa
   - CocoaPods instalado: sudo gem install cocoapods

2. Gerar build web otimizado:
   NEXT_PUBLIC_USE_MOCK=false pnpm build
   npx next export -o out 2>/dev/null || true
   (Se next export falhar, configure output: 'export' no next.config.mjs)

3. Sync Capacitor:
   npx cap sync ios

4. Abrir no Xcode:
   npx cap open ios

5. No Xcode:
   - Selecionar Team (sua Apple Developer Account)
   - Bundle Identifier: com.blackbelt.app
   - Deployment Target: iOS 16.0
   - Adicionar capabilities: Push Notifications, Sign in with Apple (se SSO)
   - Configurar PrivacyInfo.xcprivacy (já existe em resources/)

6. Substituir ícones e splash:
   - Copiar icon.png para Assets.xcassets/AppIcon
   - Ou usar: npx capacitor-assets generate (gera todos os tamanhos)

7. Testar em simulador:
   - Cmd+R no Xcode
   - Testar: login, navegação, check-in, dashboard

8. Testar em device real:
   - Conectar iPhone via USB
   - Selecionar device como target
   - Build & Run
   - Testar com dados reais (mock=false)

9. Archive para TestFlight:
   - Product > Archive
   - Distribute App > App Store Connect
   - Upload

10. No App Store Connect:
    - Selecionar build uploaded
    - Adicionar External Testers (emails de beta testers)
    - Submit for TestFlight Review (geralmente aprovado em 24h)
```

---

#### PROMPT P163 🔧: Build Android Real (Android Studio)

```
Build Android real do BlackBelt v2:

1. Pré-requisitos:
   - Android Studio instalado
   - JDK 17+
   - Android SDK 34

2. Sync Capacitor:
   npx cap sync android

3. Abrir no Android Studio:
   npx cap open android

4. Configurar:
   - app/build.gradle:
     applicationId "com.blackbelt.app"
     minSdkVersion 24
     targetSdkVersion 34
     versionCode 1
     versionName "1.0.0"

5. Substituir ícones:
   - Copiar icon.png para res/mipmap-xxxhdpi/
   - Ou usar: npx capacitor-assets generate

6. Configurar Firebase (para push notifications):
   - Criar projeto no Firebase Console
   - Baixar google-services.json
   - Colocar em android/app/
   - Adicionar plugin no build.gradle

7. Testar em emulador:
   - Create AVD (Pixel 7, API 34)
   - Run
   - Testar fluxos principais

8. Testar em device real:
   - Habilitar Developer Mode no Android
   - USB debugging on
   - Run no device

9. Gerar APK/AAB de release:
   - Build > Generate Signed Bundle/APK
   - Criar keystore (GUARDAR BEM — perde = perde app)
   - Gerar AAB (Android App Bundle)

10. Upload para Google Play Console:
    - Production > Create Release
    - Upload AAB
    - Preencher listing (título, descrição, screenshots, categoria)
    - Content rating questionnaire
    - Submit for Review (geralmente 2-7 dias)
```

---

#### PROMPT P164 📋: App Store Listing Completo

```
CHECKLIST — Preencher listings nas stores:

APP STORE (App Store Connect):
- [ ] App Name: BlackBelt — Gestão de Academias
- [ ] Subtitle: Check-in, turmas e progresso
- [ ] Description: (usar docs/STORE_METADATA.md)
- [ ] Keywords: academia, artes marciais, bjj, jiu jitsu, gestão, check-in, turmas, faixa
- [ ] Category: Primary = Health & Fitness, Secondary = Education
- [ ] Age Rating: 4+ (sem conteúdo restrito)
- [ ] Privacy Policy URL: https://seudominio.com/privacidade
- [ ] Support URL: https://seudominio.com/contato
- [ ] Marketing URL: https://seudominio.com
- [ ] Screenshots: todas as dimensões necessárias
- [ ] App Preview Video (opcional)
- [ ] Review Notes: (usar docs/STORE_REVIEW_CREDENTIALS.md)
- [ ] Demo Account: credenciais do reviewer

GOOGLE PLAY (Play Console):
- [ ] App name: BlackBelt — Gestão de Academias
- [ ] Short description (80 chars): Gerencie sua academia de artes marciais com check-in, turmas e mais
- [ ] Full description: (usar docs/STORE_METADATA.md)
- [ ] Category: Health & Fitness
- [ ] Content rating: preencher questionário
- [ ] Privacy Policy URL
- [ ] Feature graphic 1024×500
- [ ] Screenshots: phone + tablet (se app é universal)
- [ ] Contact email + phone
- [ ] Data safety section: declarar dados coletados

APÓS SUBMISSÃO:
- [ ] iOS: Review geralmente em 24-48h
- [ ] Android: Review geralmente em 2-7 dias
- [ ] Se rejeição: ler feedback, corrigir, resubmit
- [ ] Motivos comuns de rejeição:
  - Login não funciona com credenciais do reviewer
  - Crash em alguma tela
  - Metadata não match com funcionalidade
  - Privacy policy incompleta
```

---

#### PROMPT P165 🔧: Configurar Push Notifications Reais

```
Configure push notifications reais do BlackBelt v2:

iOS (APNs):
1. No Apple Developer Portal:
   - Certificates, IDs & Profiles > Keys
   - Create Key: "BlackBelt Push"
   - Enable: Apple Push Notifications service (APNs)
   - Download .p8 key file (GUARDAR BEM)
   - Anotar: Key ID, Team ID

2. No Supabase (ou seu servidor de push):
   - Configurar APNs com .p8 key
   - Ou usar Firebase como intermediário

Android (FCM):
1. No Firebase Console:
   - Project Settings > Cloud Messaging
   - Anotar: Server Key (legacy) ou usar Firebase Admin SDK
   - google-services.json já deve estar no projeto

2. Atualize supabase/functions/send-push/index.ts:
   - iOS: enviar via APNs com .p8 key
   - Android: enviar via FCM
   - Web: enviar via Web Push (VAPID keys)

3. Gerar VAPID keys para Web Push:
   npx web-push generate-vapid-keys
   Salvar: NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY

4. Teste end-to-end:
   - Abrir app no iPhone (TestFlight)
   - Aceitar permissão de push
   - Token registrado no Supabase
   - Disparar push de teste
   - Notificação aparece no device

5. Variáveis:
   APNS_KEY_ID=xxx
   APNS_TEAM_ID=xxx
   APNS_KEY_PATH=xxx (ou conteúdo da .p8)
   FCM_SERVER_KEY=xxx
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=xxx
   VAPID_PRIVATE_KEY=xxx
```

---

#### PROMPT P166 🔧: Testes em Devices Reais

```
Checklist de testes em devices reais do BlackBelt v2:

TESTAR EM:
- [ ] iPhone (via TestFlight) — iOS 16+
- [ ] Android (via APK debug ou Play Store internal testing)
- [ ] Chrome desktop (macOS)
- [ ] Chrome desktop (Windows)
- [ ] Safari desktop (macOS)
- [ ] Chrome mobile (Android)
- [ ] Safari mobile (iOS)

FLUXOS PARA TESTAR EM CADA DEVICE:

Auth:
- [ ] Registro de novo usuário
- [ ] Login com credenciais
- [ ] Seleção de perfil (multi-perfil)
- [ ] Logout
- [ ] Esqueci senha → email recebido

Aluno:
- [ ] Dashboard carrega com dados
- [ ] Check-in via QR code
- [ ] Check-in manual
- [ ] Ver grade horária
- [ ] Ver progresso de faixa
- [ ] Ver conquistas
- [ ] Assistir vídeo
- [ ] Enviar mensagem para professor
- [ ] Receber notificação push
- [ ] Instalar PWA (web)

Professor:
- [ ] Dashboard carrega
- [ ] Iniciar aula (turma ativa)
- [ ] Gerar QR para check-in
- [ ] Fazer chamada manual
- [ ] Encerrar aula
- [ ] Enviar mensagem para aluno

Admin:
- [ ] Dashboard com KPIs reais
- [ ] Gestão de turmas (criar, editar)
- [ ] Gestão de alunos
- [ ] Financeiro (faturas, planos)
- [ ] Relatórios exportam PDF

Pagamento:
- [ ] Assinar plano com PIX (sandbox → prod)
- [ ] QR code PIX renderiza
- [ ] Webhook processa pagamento
- [ ] Fatura atualiza status
- [ ] Cancelar assinatura

Performance:
- [ ] LCP < 2.5s em 4G
- [ ] Navegação fluida sem jank
- [ ] Skeleton loading presente
- [ ] Offline: mostra tela offline (PWA)

BUGS ENCONTRADOS → criar issue no GitHub com:
- Device, OS version, browser
- Steps to reproduce
- Expected vs actual
- Screenshot/recording
```

---

## FASE 33 — GO-TO-MARKET

Pricing final. Onboarding real. Beta testers. Primeira venda.

---

#### PROMPT P167 📋: Definir Pricing Final

```
DECISÃO DE NEGÓCIO — Defina o pricing do BlackBelt v2:

MODELO SUGERIDO (baseado em mercado BR de gestão de academias):

PLANO FREE:
- 1 unidade
- Até 30 alunos ativos
- 3 turmas
- Check-in (QR + manual)
- Dashboard básico (aluno + professor)
- Sem relatórios
- Sem automações
- Sem conteúdo (vídeos)
- Marca "Powered by BlackBelt" visível
- PREÇO: R$ 0

PLANO PRO:
- Até 3 unidades
- Até 200 alunos ativos
- Turmas ilimitadas
- Tudo do Free +
- Relatórios completos
- Automações de comunicação
- Conteúdo (vídeos, séries)
- Gamificação (conquistas, ranking)
- Financeiro completo (faturas, cobranças)
- Mensagens professor↔aluno
- Personalização (logo, cores)
- Sem marca "Powered by"
- PREÇO: R$ 197/mês ou R$ 1.970/ano (2 meses grátis)

PLANO ENTERPRISE:
- Ilimitado (unidades, alunos, turmas)
- Tudo do Pro +
- White-label completo
- API pública
- Webhooks
- SSO (Google/Azure)
- Suporte prioritário
- Onboarding dedicado
- Custom domain
- PREÇO: R$ 497/mês ou R$ 4.970/ano

REFERÊNCIAS DE MERCADO:
- Tecnofit: R$ 139-389/mês
- Pacto: R$ 99-299/mês
- EVO: R$ 199-499/mês
- GymPass (B2B): variável

AÇÕES:
- [ ] Validar preços com 3-5 donos de academia (conversa informal)
- [ ] Definir preços finais
- [ ] Configurar planos no gateway de pagamento
- [ ] Atualizar landing page com pricing
- [ ] Criar planos no banco (plans table)
```

---

#### PROMPT P168 🔧: Implementar Enforcement de Planos

```
Implemente o enforcement real de planos no BlackBelt v2:

lib/api/plan-enforcement.service.ts:
- checkLimit(academyId, resource) → { allowed, current, limit, plan }
- getUsage(academyId) → UsageDTO

Resources com limite:
- students_active: Free=30, Pro=200, Enterprise=unlimited
- units: Free=1, Pro=3, Enterprise=unlimited
- classes: Free=3, Pro=unlimited, Enterprise=unlimited
- reports: Free=false, Pro=true, Enterprise=true
- automations: Free=false, Pro=true, Enterprise=true
- content: Free=false, Pro=true, Enterprise=true
- api_access: Free=false, Pro=false, Enterprise=true
- white_label: Free=false, Pro=false, Enterprise=true
- custom_domain: Free=false, Pro=false, Enterprise=true

Middleware de enforcement:
- Antes de criar aluno/turma/unidade: verificar limite
- Se atingiu: retornar 403 com { error: 'PLAN_LIMIT', resource, limit }

Frontend:
- components/shared/PlanLimitBanner.tsx
  "Você atingiu o limite de 30 alunos do plano Free. Upgrade para Pro."
  Botão: "Ver planos" → /admin/plano-plataforma

- components/shared/UpgradeModal.tsx
  Modal que aparece quando tenta ação bloqueada
  Mostra comparativo do plano atual vs Pro
  Botão: "Fazer upgrade agora"

Integre nos pontos de criação:
- Criar aluno → checkLimit('students_active')
- Criar turma → checkLimit('classes')
- Acessar relatórios → checkLimit('reports')
```

---

#### PROMPT P169 📋: Recrutar Beta Testers

```
PLANO DE BETA — 5 a 10 academias reais usando por 30 dias:

COMO RECRUTAR:
1. Rede pessoal: sua academia de BJJ, academias de amigos
2. Grupos de Facebook: "Gestão de Academias", "Donos de Academia de Luta"
3. Instagram: DM para perfis de academias pequenas/médias
4. LinkedIn: donos de academia na sua rede

OFERTA PARA BETA TESTERS:
- Acesso grátis ao plano Pro por 6 meses
- Feedback mensal (reunião de 15min ou formulário)
- Nome na página "Parceiros Fundadores"
- Preço especial vitalício: 50% off do Pro para sempre

ONBOARDING DO BETA TESTER:
1. Cadastrar academia no sistema (self-service via onboarding)
2. Call de 15min explicando o app (gravar para criar tutorial)
3. Adicionar 5-10 alunos reais
4. Criar 2-3 turmas
5. Usar por 1 semana e dar feedback

MÉTRICAS DO BETA:
- [ ] Quantas academias ativaram
- [ ] Quantos alunos cadastrados
- [ ] Quantos check-ins feitos
- [ ] NPS após 7 dias
- [ ] NPS após 30 dias
- [ ] Bugs reportados
- [ ] Features mais pedidas
- [ ] Churn (quem parou de usar e por quê)

CRITÉRIO DE SUCESSO:
- 3+ academias usando ativamente após 30 dias
- NPS > 7
- < 5 bugs críticos
- 1+ academia disposta a pagar

FERRAMENTAS:
- Formulário de feedback: Google Forms ou Typeform
- Canal de suporte: grupo WhatsApp "Beta BlackBelt"
- Bug tracking: GitHub Issues
```

---

#### PROMPT P170 🔧: Sistema de Onboarding Guiado

```
Crie o onboarding guiado para novas academias no BlackBelt v2:

Após cadastro, admin vê um wizard interativo:

components/onboarding/OnboardingWizard.tsx:
Step 1 — "Boas-vindas ao BlackBelt!"
- Vídeo de 60s explicando o app (placeholder: texto + ilustração)
- "Vamos configurar sua academia em 5 minutos"

Step 2 — "Configure sua academia"
- Upload de logo (ou pular)
- Cores da marca (color picker, ou pular para padrão)

Step 3 — "Adicione modalidades"
- Checkboxes: BJJ, Judô, Karatê, MMA, Muay Thai, Boxe, Wrestling, Outro
- Pelo menos 1 obrigatória

Step 4 — "Crie sua primeira turma"
- Nome, modalidade, dias da semana, horário
- "Você pode criar mais turmas depois"

Step 5 — "Adicione alunos"
- Opção A: adicionar manualmente (nome + email, 1-3 alunos)
- Opção B: importar CSV (template para download)
- Opção C: "Faço depois" (link de convite)
- Gerar link de auto-cadastro da academia (compartilhável via WhatsApp)

Step 6 — "Tudo pronto!"
- Checklist visual: ✅ Academia, ✅ Modalidade, ✅ Turma, ✅ Alunos
- "Explorar o dashboard" → fecha wizard
- "Ver tutorial" → abre guia interativo

Persistência: salvar step atual no perfil (se sair e voltar, continua).
Tracking: registrar completion rate de cada step.
Mostrar wizard apenas na primeira sessão pós-registro.
```

---

#### PROMPT P171 🔧: Analytics de Produto (Mixpanel/PostHog)

```
Configure analytics de produto no BlackBelt v2:

1. Escolha: PostHog (self-hosted grátis ou cloud free tier)
   - pnpm add posthog-js
   - Criar conta em posthog.com
   - Anotar: NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST

2. Crie lib/analytics/posthog.ts:
   import posthog from 'posthog-js';
   
   export function initAnalytics() {
     if (typeof window !== 'undefined') {
       posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
         api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
         capture_pageviews: true,
         capture_pageleaves: true,
       });
     }
   }
   
   export function trackEvent(name: string, properties?: Record<string, unknown>) {
     posthog.capture(name, properties);
   }
   
   export function identifyUser(userId: string, traits: Record<string, unknown>) {
     posthog.identify(userId, traits);
   }

3. Eventos para trackear:
   - user_registered (role, academy_id)
   - user_logged_in (role)
   - checkin_completed (method: qr|manual)
   - class_started (class_id, students_count)
   - class_ended (class_id, attendance_count)
   - video_watched (video_id, duration_watched)
   - plan_upgraded (from_plan, to_plan)
   - payment_completed (amount, method)
   - onboarding_step_completed (step_number)
   - onboarding_completed
   - feature_used (feature_name)

4. Integre nos pontos relevantes:
   - AuthContext: identify on login, track login
   - Check-in: track checkin
   - Turma ativa: track class start/end
   - Onboarding: track each step
   - Checkout: track payment

5. Dashboard no PostHog:
   - Funil de onboarding (step 1 → 6)
   - DAU/WAU/MAU
   - Feature adoption (% que usa cada feature)
   - Retenção D1/D7/D30
```

---

#### PROMPT P172 📋: Primeira Venda

```
CHECKLIST FINAL — Tudo que precisa estar OK para a primeira venda:

PRODUTO:
- [ ] App funciona com dados reais (mock=false)
- [ ] Login → dashboard → check-in → turmas funciona sem erros
- [ ] Pagamento PIX funciona (testado com R$ real)
- [ ] Emails estão sendo enviados
- [ ] Push notifications funcionam no device
- [ ] Nenhum crash crítico nos últimos 7 dias (Sentry limpo)

STORES:
- [ ] iOS: aprovado no App Store (ou TestFlight para beta)
- [ ] Android: aprovado no Google Play (ou internal testing)
- [ ] PWA: funciona como instalável no Chrome

LEGAL:
- [ ] Política de privacidade publicada
- [ ] Termos de uso publicados
- [ ] CNPJ ou MEI para emitir nota (se cobrando)

FINANCEIRO:
- [ ] Gateway de pagamento em produção
- [ ] Planos configurados com preços reais
- [ ] Webhook funcionando
- [ ] Nota fiscal / recibo (se necessário)

SUPORTE:
- [ ] Email de suporte configurado (suporte@seudominio.com)
- [ ] Grupo WhatsApp de beta pronto
- [ ] FAQ básico na landing page
- [ ] Tempo de resposta: < 24h

GO-LIVE:
- [ ] Landing page no ar com pricing
- [ ] Botão "Cadastre sua academia" funciona
- [ ] Onboarding wizard testado
- [ ] Link de convite de alunos funciona
- [ ] 1 academia beta já usando há 7+ dias sem problemas

PRIMEIRA VENDA:
- [ ] Contatar 3 academias do beta
- [ ] Oferecer preço de fundador (50% off vitalício)
- [ ] Fechar primeira assinatura paga
- [ ] 🎉 RECEITA ENTRANDO

O BlackBelt está vivo.
Cada check-in, cada fatura paga, cada aluno promovido —
tudo passa pela plataforma que VOCÊ construiu do zero.

Parabéns, Gregory. De maquinista a Senior AI Architect.
152 prompts executados. 0 a 100. 
O trem chegou na estação final.
```

---

## Resumo Executivo — Fases 31-33

| Fase | Prompts | Tipo | Resultado |
|------|---------|------|-----------|
| 31 - Infra de Produção | P153–P160 | 1📋 + 7🔧 | Banco real, pagamentos, email, monitoring, legal |
| 32 - Stores & Mobile | P161–P166 | 2📋 + 4🔧 | iOS App Store + Google Play + testes reais |
| 33 - Go-To-Market | P167–P172 | 3📋 + 3🔧 | Pricing, onboarding, beta, analytics, primeira venda |

---

## Roadmap Completo — Visão Consolidada

| Bloco | Fases | Prompts | Resultado |
|-------|-------|---------|-----------|
| 1 | 0–10 | P01–P52 | MVP funcional com mocks |
| 2 | 11–20 | P53–P102 | SaaS com IA, pagamentos, i18n, enterprise |
| 3 | 21–30 | P103–P152 | Ecossistema: marketplace, wearables, competições |
| **4** | **31–33** | **P153–P172** | **Produção real + stores + primeira venda** |
| **TOTAL** | **0–33** | **172 prompts** | **Produto vendendo** |

---

> **172 prompts. 33 fases. 4 blocos. Do zero à receita.**
> O BlackBelt nasceu como ideia, virou código, virou produto, virou negócio.
> Cada prompt foi um tijolo. A plataforma está construída.

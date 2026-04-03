# 🥋 BLACKBELT V2 — AUDITORIA STORE READINESS (Apple + Google Play)
# Multi-Agent Team — Checar TUDO contra o checklist oficial
# Resultado: relatório COMPLETO para Gregory com ✅/❌/⚠️ em cada item

---

Este prompt faz uma auditoria COMPLETA de tudo que falta para o BlackBelt v2 ser publicado na Apple App Store e Google Play Store e VENDIDO para academias. Cada Agent verifica uma área específica, reporta o status real, e gera o relatório. NÃO implementa features — apenas audita e documenta com honestidade total.

## CONTEXTO

- Projeto: BlackBelt v2 — Gestão de academias de artes marciais
- Stack: Next.js 14, TypeScript, Supabase, Capacitor
- Supabase: `tdplmmodmumryzdosmpv`
- Deploy: `blackbelts.com.br`
- 9 perfis: Super Admin, Admin, Professor, Recepcionista, Aluno Adulto/Teen/Kids, Responsável, Franqueador
- Modelo: B2B SaaS (academia paga mensalidade: Starter R$97 → Enterprise R$597)
- Trial: 7 dias grátis
- Públicos: Adultos + menores (Teen 13-17, Kids <13) — COPPA/LGPD relevante
- Contém UGC: mensagens entre usuários, vídeos de professores
- Login obrigatório para funcionalidades core
- Pagamentos: via Asaas (gateway brasileiro, fora do app) — NÃO usa IAP da Apple/Google

## REGRAS

1. Cada Agent lê os arquivos relevantes do projeto ANTES de responder
2. Status para cada item: ✅ (pronto), ❌ (falta/não existe), ⚠️ (parcial/precisa ajuste)
3. Relatório vai para `/docs/store/`
4. Ser BRUTALMENTE honesto — falso ✅ é pior que ❌
5. Para cada ❌, descrever exatamente o que falta e o esforço estimado
6. Commit ao final com todos os relatórios

## EXECUÇÃO — 7 AGENTS EM PARALELO

```
Agent("Store Audit 01: Contas de Desenvolvedor + Build Técnico")
Agent("Store Audit 02: Privacidade, LGPD, COPPA + Dados do Usuário")
Agent("Store Audit 03: Conteúdo, Classificação Etária + UGC")
Agent("Store Audit 04: Store Listing + Metadata + Assets")
Agent("Store Audit 05: Monetização + Pagamentos")
Agent("Store Audit 06: Design, Funcionalidade, Acessibilidade + Capacitor/Native")
Agent("Store Audit 07: Segurança, Legal, IP + Pré-submissão Final")
```

---

## AGENT 01: Contas de Desenvolvedor + Build Técnico

Verificar estado do Capacitor e builds nativos:
```bash
# Capacitor instalado?
cat package.json | grep -i capacitor
cat capacitor.config.ts 2>/dev/null || cat capacitor.config.json 2>/dev/null || echo "NO CAPACITOR CONFIG"

# Platforms adicionadas?
ls -la ios/ 2>/dev/null || echo "NO iOS PLATFORM"
ls -la android/ 2>/dev/null || echo "NO Android PLATFORM"

# Gradle/Xcode configs
cat android/app/build.gradle 2>/dev/null | grep -E "targetSdk|versionCode|versionName|applicationId" | head -10
cat ios/App/App.xcodeproj/project.pbxproj 2>/dev/null | grep -E "PRODUCT_BUNDLE_IDENTIFIER|MARKETING_VERSION" | head -5

# Ícones e splash
ls android/app/src/main/res/mipmap-*/ 2>/dev/null | head -10
ls ios/App/App/Assets.xcassets/AppIcon.appiconset/ 2>/dev/null | head -10

# Keystore Android
ls android/app/*.keystore 2>/dev/null || ls android/*.keystore 2>/dev/null || echo "NO KEYSTORE"
```

Gere `/docs/store/01_CONTAS_BUILD.md`:

```markdown
# PARTE 1 — CONTAS DE DESENVOLVEDOR

## Apple App Store
| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 1.1 | Conta Apple Developer Program (US$99/ano) | ✅/❌ | [Gregory tem? verificar] |
| 1.2 | Informações de contato atualizadas | ✅/❌ | |
| 1.3 | Acordo de licença aceito | ✅/❌ | |
| 1.4 | Certificados de distribuição válidos | ✅/❌ | |
| 1.5 | Provisioning profiles configurados | ✅/❌ | |
| 1.6 | Status de trader (UE) | ⚠️ N/A | App só no Brasil inicialmente |

## Google Play Store
| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 1.7 | Conta Google Play Console (US$25) | ✅/❌ | |
| 1.8 | Verificação de identidade concluída | ✅/❌ | |
| 1.9 | Tipo de conta (Personal vs Organization) | ❌/✅ | SaaS B2B deveria ser Organization |
| 1.10 | Organization obrigatório para financeiro | ⚠️ | App tem módulo financeiro |
| 1.11 | Distribution Agreement aceito | ✅/❌ | |
| 1.12 | Play App Signing aceito | ✅/❌ | |

# PARTE 2 — BUILD TÉCNICO

## Apple
| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 2.1 | Build com Xcode 16+ | ✅/❌ | Capacitor status: [verificar] |
| 2.2 | SDK iOS 18+ | ✅/❌ | |
| 2.4 | 64-bit | ✅ | Capacitor é 64-bit por padrão |
| 2.5 | IPv6-only funcional | ⚠️ | Supabase suporta IPv6? |
| 2.6 | Testado em dispositivo real | ❌ | |
| 2.7 | Sem crashes/bugs óbvios | [resultado do teste real] |
| 2.12 | iPhone app roda no iPad | ✅/❌ | |

## Google
| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 2.17 | AAB format | ✅/❌ | Capacitor gera AAB? |
| 2.18 | Target API level | ✅/❌ | Mínimo 34 (Android 14) em 2026 |
| 2.19 | versionCode incrementado | ✅/❌ | |
| 2.21 | Play App Signing | ❌ | Keystore existe? |
| 2.22 | APK < 200MB | ✅ | Next.js app é leve |
| 2.23 | Sem crashes/ANRs | [verificar] |

## AÇÕES NECESSÁRIAS
1. [lista de cada item ❌ com esforço estimado]
```

---

## AGENT 02: Privacidade, LGPD, COPPA + Dados do Usuário

Verificar páginas legais e compliance:
```bash
# Páginas de privacidade e termos
find app -path "*privacidade*" -o -path "*privacy*" -o -path "*termos*" -o -path "*terms*" | grep -v node_modules
cat app/\(public\)/privacidade/page.tsx 2>/dev/null | head -30 || echo "NO PRIVACY PAGE"
cat app/\(public\)/termos/page.tsx 2>/dev/null | head -30 || echo "NO TERMS PAGE"

# LGPD compliance
grep -rn "lgpd\|LGPD\|consentimento\|consent\|cookie\|Cookie" app/ components/ --include="*.tsx" | head -10

# Exclusão de conta (obrigatório Apple + Google)
grep -rn "excluir.*conta\|delete.*account\|apagar.*conta\|deletar.*dados" app/ components/ lib/ --include="*.tsx" --include="*.ts" | head -10

# COPPA — Kids profile (<13)
grep -rn "kids\|Kids\|criança\|children\|parental\|guardian" app/ components/ --include="*.tsx" | grep -iv "import\|node_modules" | head -15

# Dados coletados
grep -rn "cpf\|CPF\|birth_date\|phone\|email\|address\|endereco" lib/api/ --include="*.ts" | head -15

# Google OAuth
grep -rn "google\|Google.*OAuth\|signInWith.*Google" lib/ app/ --include="*.ts" --include="*.tsx" | head -10

# Camera/mic/location permissions
grep -rn "camera\|Camera\|microphone\|geolocation\|GPS\|ACCESS_FINE_LOCATION" app/ components/ --include="*.tsx" --include="*.ts" | head -10
cat android/app/src/main/AndroidManifest.xml 2>/dev/null | grep "permission" | head -10
```

Gere `/docs/store/02_PRIVACIDADE_LGPD.md` com status de CADA item das Partes 3.1-3.39 do checklist. Incluir:
- Privacy Policy existe? URL funcional? Conteúdo adequado?
- Política de exclusão de conta implementada?
- COPPA compliance para perfil Kids?
- LGPD compliance (Brasil)?
- Privacy Labels (Apple) / Data Safety (Google) — quais dados o app coleta?
- App Tracking Transparency necessário?
- Consentimento antes de coleta?

---

## AGENT 03: Conteúdo, Classificação Etária + UGC

```bash
# UGC — mensagens, chat, vídeos
grep -rn "message\|Message\|chat\|Chat\|comment\|Comment" app/ --include="*.tsx" -l | head -10
grep -rn "report\|denunci\|block\|bloquear\|flag\|moderat" app/ components/ lib/ --include="*.tsx" --include="*.ts" | head -15

# Kids profile restrictions
find app -path "*kids*" -name "*.tsx" | head -10
# Kids acessam mensagens?
find app -path "*kids*" -name "*.tsx" | xargs grep -l "message\|chat\|mensag" 2>/dev/null

# Conteúdo — artes marciais (violência?)
# Vídeos de técnicas de luta podem impactar classificação etária

# Gambling/lotteries — compete module
grep -rn "campeonato\|tournament\|championship\|bet\|aposta" app/ lib/ --include="*.tsx" --include="*.ts" | head -10
```

Gere `/docs/store/03_CONTEUDO_CLASSIFICACAO.md` com status de CADA item das Partes 4.1-4.21. Incluir:
- Age Rating adequado (artes marciais = violência leve?)
- UGC: existe moderação? Denúncia? Bloqueio de usuários?
- Kids: isolamento de conteúdo adulto verificado?
- Compete module: não é gambling (é esporte)

---

## AGENT 04: Store Listing + Metadata + Assets

```bash
# Ícones existem?
find . -name "icon*" -o -name "logo*" -o -name "favicon*" | grep -v node_modules | head -20
ls public/icons/ 2>/dev/null || ls public/images/ 2>/dev/null | head -10

# Manifest PWA (tem nomes e descrições?)
cat public/manifest.json 2>/dev/null || cat app/manifest.ts 2>/dev/null

# Store metadata files
find . -path "*store*" -o -path "*STORE*" | grep -v node_modules | head -10
cat docs/STORE_REVIEW_CREDENTIALS.md 2>/dev/null || echo "NO STORE CREDENTIALS DOC"

# Splash screen / launch screen
find . -name "splash*" -o -name "launch*" | grep -v node_modules | head -10

# Support URL
grep -rn "suporte\|support\|contato\|contact" app/ --include="*.tsx" -l | head -10
find app -path "*contato*" -o -path "*suporte*" -o -path "*support*" | grep -v node_modules
```

Gere `/docs/store/04_LISTING_METADATA.md` com status de CADA item das Partes 5.1-5.31. Incluir:
- Nome do app definido? (max 30 chars)
- Descrição curta (80 chars) e longa (4000 chars) escritas?
- Screenshots existem? Quantas? Quais perfis cobrem?
- Ícone em todos os tamanhos?
- Feature graphic (Google Play)?
- Categoria correta?
- Conta demo para revisores?
- Support URL funcional?
- Localização PT-BR?

**IMPORTANTE: Gere DRAFTS de metadata que o Gregory pode usar:**
```markdown
## DRAFTS PARA AS STORES

### Nome: BlackBelt (≤30 chars)

### Subtitle (Apple, ≤30): Gestão de Academias

### Short Description (Google, ≤80):
Gerencie sua academia de artes marciais: alunos, presenças, graduações e pagamentos.

### Full Description (≤4000):
[escrever descrição completa em PT-BR, focando nos benefícios para donos de academia]

### Keywords (Apple):
academia, artes marciais, bjj, jiu-jitsu, judô, karatê, mma, gestão, presença, alunos

### Category:
Apple: Business
Google: Business

### Contact Email: [gregoryguimaraes12@gmail.com]
```

---

## AGENT 05: Monetização + Pagamentos

```bash
# Asaas integration
grep -rn "asaas\|Asaas\|ASAAS" app/ lib/ --include="*.ts" --include="*.tsx" | head -15
grep -rn "ASAAS_API_KEY\|ASAAS_WEBHOOK" .env* 2>/dev/null | head -5

# Payment flow
grep -rn "payment\|pagamento\|cobrança\|invoice\|fatura\|mensalidade" app/ lib/ --include="*.tsx" --include="*.ts" | head -20

# IAP (In-App Purchase) — NÃO deve existir se pagamento é externo
grep -rn "StoreKit\|BillingClient\|in.app.purchase\|IAP\|inAppPurchase" app/ lib/ ios/ android/ --include="*.tsx" --include="*.ts" --include="*.swift" --include="*.java" --include="*.kt" 2>/dev/null | head -10

# Subscription info
grep -rn "trial\|Trial\|plano\|Plano\|starter\|Starter\|essencial\|pro\|enterprise\|pricing" app/ lib/ --include="*.tsx" --include="*.ts" | head -15

# Pricing page
find app -path "*planos*" -o -path "*pricing*" -o -path "*assinatura*" | grep -v node_modules
```

Gere `/docs/store/05_MONETIZACAO.md` com status de CADA item das Partes 6.1-6.21. Incluir:
- **CRÍTICO**: BlackBelt cobra via Asaas (fora do app). Apple exige IAP para conteúdo digital desbloqueável. VERIFICAR se o modelo de SaaS B2B (academia paga gestão) se qualifica como "bens/serviços físicos consumidos fora do app" (item 6.12) — se sim, NÃO precisa de IAP.
- Argumentação: "O BlackBelt é um SaaS de gestão empresarial para academias. O pagamento é pela ferramenta de gestão (serviço B2B), não por conteúdo digital dentro do app. Similar a Salesforce, HubSpot, Mindbody que cobram fora das stores."
- Asaas está configurado? Funcional?
- Trial de 7 dias implementado?
- Página de planos/pricing existe?
- Transparência de preços?

---

## AGENT 06: Design, Funcionalidade, Acessibilidade + Native

```bash
# Capacitor plugins
cat package.json | grep -i "@capacitor" | head -20

# Safe areas (notch)
grep -rn "safe-area\|SafeArea\|env(safe-area\|padding-top.*env\|safeArea" app/ components/ --include="*.tsx" --include="*.css" | head -10

# Dynamic Type / font scaling
grep -rn "rem\|em\|font-size.*var\|text-sm\|text-base\|text-lg" app/ components/ --include="*.tsx" | head -10

# Dark mode
grep -rn "dark\|Dark\|prefers-color-scheme\|theme" app/ components/ --include="*.tsx" --include="*.css" | head -10

# Accessibility
grep -rn "aria-\|role=\|alt=\|tabIndex\|sr-only\|screen-reader" app/ components/ --include="*.tsx" | wc -l

# Deep links / universal links
cat apple-app-site-association 2>/dev/null || echo "NO AASA"
cat .well-known/assetlinks.json 2>/dev/null || echo "NO ASSETLINKS"

# Push notifications
grep -rn "push\|Push\|notification\|Notification\|FCM\|firebase" app/ lib/ --include="*.ts" --include="*.tsx" | head -10

# Status bar / navigation bar
grep -rn "StatusBar\|statusBar\|NavigationBar\|navigationBar" app/ components/ --include="*.tsx" | head -10

# Offline mode
grep -rn "offline\|Offline\|ServiceWorker\|service-worker\|IndexedDB" app/ lib/ public/ --include="*.ts" --include="*.tsx" --include="*.js" | head -10
```

Gere `/docs/store/06_DESIGN_FUNCIONALIDADE.md` com status de CADA item das Partes 7.1-7.21. Incluir:
- App oferece funcionalidade real (não é website repackaged)?
- Login Google implementado? Alternativa de login?
- Push notifications: opt-in? Não obrigatórias?
- Acessibilidade: contraste, Dynamic Type, Dark Mode?
- Safe areas para notch?
- Offline mode funcional?

---

## AGENT 07: Segurança, Legal, IP + Pré-submissão

```bash
# Security headers
cat next.config.mjs | grep -A10 "headers" 2>/dev/null || cat next.config.js | grep -A10 "headers" 2>/dev/null

# RLS
grep -rn "ENABLE ROW LEVEL SECURITY\|CREATE POLICY" supabase/migrations/ | wc -l

# VULN-001 fix
cat supabase/migrations/082_fix_role_escalation.sql 2>/dev/null | head -5 || echo "NO VULN FIX"

# Service role key exposure
grep -rn "SUPABASE_SERVICE_ROLE_KEY\|service_role" app/ components/ --include="*.tsx" --include="*.ts" | grep -v "node_modules\|\.env\|route\.ts\|middleware\|scripts/" | head -5

# Intellectual property
grep -rn "CrossFit\|UFC\|Gracie\|Reebok\|Nike" app/ components/ --include="*.tsx" | head -10

# Legal pages
find app -path "*privacidade*" -o -path "*termos*" -o -path "*contato*" -o -path "*suporte*" | grep -v node_modules

# STORE_REVIEW_CREDENTIALS
cat docs/STORE_REVIEW_CREDENTIALS.md 2>/dev/null || echo "NO REVIEW CREDENTIALS"

# App version
cat package.json | grep '"version"'

# Error handling completeness
grep -rn "catch" lib/api/ --include="*.ts" | wc -l
grep -rn "logServiceError\|handleServiceError" lib/api/ --include="*.ts" | wc -l
```

Gere `/docs/store/07_SEGURANCA_LEGAL_PRESUBMISSAO.md` com status de CADA item das Partes 8.1-8.9, 9.1-9.20, 10.1-10.26. Incluir:
- IP: alguma marca registrada usada sem permissão?
- Segurança: RLS, auth, VULN-001 corrigida?
- Legal: LGPD compliance, termos de uso, privacidade?
- Pré-submissão Apple: conta demo, backend ativo, App Review notes?
- Pré-submissão Google: Data Safety, Content Rating, Permissions?

**IMPORTANTE: Gere o arquivo de credenciais para revisores:**
```markdown
## STORE_REVIEW_CREDENTIALS.md

### Credenciais para Revisão (Apple + Google)

**Demo Account (Reviewer):**
- Email: reviewer@blackbelt.demo
- Senha: BlackBelt@Review2026
- Role: admin
- Academia: Guerreiros do Tatame (demo)

**Instruções:**
1. Abrir o app
2. Fazer login com as credenciais acima
3. O app abrirá no dashboard do admin
4. Funcionalidades para testar: [listar as principais]

**Backend:** https://blackbelts.com.br (ativo 24/7)
**Supabase:** Projeto ativo, free tier

**Notas para revisores:**
- O app é um SaaS de gestão de academias de artes marciais
- Pagamentos são processados via gateway externo (Asaas), não via IAP
- O módulo Kids é restrito: sem mensagens, sem chat, UI simplificada
- Vídeos são hospedados via Bunny Stream CDN
```

---

## APÓS TODOS OS 7 AGENTS — RELATÓRIO CONSOLIDADO

Gere `/docs/store/RELATORIO_STORE_READINESS.md`:

```markdown
# BLACKBELT V2 — RELATÓRIO DE READINESS PARA STORES

## Resumo Executivo

| Área | Total Items | ✅ Pronto | ⚠️ Parcial | ❌ Falta | % |
|------|-------------|-----------|------------|---------|---|
| Contas + Build | XX | XX | XX | XX | XX% |
| Privacidade + LGPD | XX | XX | XX | XX | XX% |
| Conteúdo + Classificação | XX | XX | XX | XX | XX% |
| Listing + Metadata | XX | XX | XX | XX | XX% |
| Monetização | XX | XX | XX | XX | XX% |
| Design + Funcionalidade | XX | XX | XX | XX | XX% |
| Segurança + Legal | XX | XX | XX | XX | XX% |
| **TOTAL** | **XX** | **XX** | **XX** | **XX** | **XX%** |

## BLOQUEADORES HARD (sem isso NÃO publica)
1. [lista com esforço estimado]

## BLOQUEADORES SOFT (pode publicar, mas risco de rejeição)
1. [lista com esforço estimado]

## COISAS JÁ PRONTAS
1. [lista — para Gregory ver que já avançou muito]

## PRÓXIMOS PASSOS (ordenados por prioridade)
1. [lista acionável com tempo estimado]

## ESTIMATIVA TOTAL
- Tempo para Google Play: ~X dias de trabalho
- Tempo para Apple App Store: ~X dias de trabalho (precisa de Mac)
- Tempo para ambas: ~X dias

## CUSTOS
- Apple Developer: US$99/ano (~R$500)
- Google Play: US$25 (único, ~R$130)
- Domínio próprio: ~R$40/ano
- Total primeiro ano: ~R$670
```

```bash
git add docs/store/ && git commit -m "store-audit: relatório completo de readiness — Apple + Google Play — 7 agents"
```

---

## EXECUÇÃO

Lance os 7 Agents em PARALELO. Cada um analisa o código, gera seu relatório, e ao final consolida.

COMECE AGORA — lance os 7 agents.

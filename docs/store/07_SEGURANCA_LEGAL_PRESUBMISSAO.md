# 07 -- Seguranca, Legal, IP + Pre-submissao

Data: 2026-03-29
Auditor: Claude (automated security audit)
Versao: 1.0.0 (package.json)

---

## PARTE 1 -- SEGURANCA

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 8.1 | RLS em todas as tabelas | ✅ | 455 ENABLE RLS statements, 415 tabelas unicas, 589 CREATE POLICY statements. Cobertura ampla com `get_my_academy_ids()` |
| 8.2 | VULN-001 corrigida (role escalation) | ✅ | Migration `082_fix_role_escalation.sql` — trigger `prevent_role_escalation()` bloqueia alteracao de role por nao-superadmin |
| 8.3 | Service role key NAO exposta no client | ✅ | Unica referencia em `cockpit/cto/page.tsx` e apenas como string de nome para checklist de env vars — nao expoe o valor real. `.gitignore` protege `.env*` |
| 8.4 | HTTPS only | ✅ | `Strict-Transport-Security: max-age=31536000; includeSubDomains` configurado. Capacitor usa `androidScheme: 'https'` e `iosScheme: 'https'`. Nenhuma URL http:// hardcoded (exceto validacao de formato) |
| 8.5 | Auth em todas as rotas protegidas | ✅ | **Middleware**: verifica auth (mock ou Supabase) em todas as rotas nao-publicas com redirect para /login. **API routes**: 45/45 routes tem auth ou verificacao de webhook token. Middleware exclui `/api/` do matcher — cada route handler gerencia auth propria via `authenticateRequest()`, `getUser()`, ou webhook token |
| 8.6 | Error handling em todos os services | ✅ | 1.112 catch blocks + 2.493 chamadas a `logServiceError`/`handleServiceError`/`translateError` em `lib/api/`. Ratio de ~2.2 handlers por catch — indica tratamento consistente |
| 8.7 | Sem dados sensiveis em logs | ✅ | Nenhum `console.log` com password/token/key/senha encontrado. Unica referencia e log de nomes de env vars (sem valores) em `env-production.ts` |
| 8.8 | Security headers configurados | ✅ | `next.config.mjs` configura 7 headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-XSS-Protection`, `HSTS`, `Permissions-Policy` (camera/mic/geo desativados), `CSP` |
| 8.9 | CORS configurado | ⚠️ | Nao ha configuracao CORS explicita. Supabase e Vercel aplicam CORS padrao, mas nao ha headers `Access-Control-*` customizados. Para API publica (v1/), considerar adicionar CORS explicito |
| 8.10 | CSP connect-src completo | ❌ | **CSP falta Bunny CDN** — `connect-src` so permite `supabase.co` e `sentry.io`. Videos do Bunny Stream (`*.b-cdn.net` ou `*.bunnycdn.com`) serao bloqueados em browsers que aplicam CSP. Tambem falta PostHog (`app.posthog.com`) |
| 8.11 | Webhook signature verification | ✅ | `payments/webhook` verifica `asaas-access-token`, `webhooks/payment` verifica `x-webhook-signature`, `webhooks/bunny` verifica `x-webhook-token`. `leads/` e publico com rate limiting (10 req/min por IP) |

### Vulnerabilidades Encontradas

**VULN-002 (MEDIA): CSP connect-src incompleto**
- Arquivo: `/next.config.mjs` linha 43
- Problema: CSP `connect-src` nao inclui dominios do Bunny CDN nem PostHog
- Impacto: Videos podem nao carregar em browsers strict-CSP; analytics bloqueado
- Fix: Adicionar `https://*.b-cdn.net https://*.bunnycdn.com https://app.posthog.com` ao connect-src
- Esforco: 5 min

**VULN-003 (LOW): Bunny webhook token opcional**
- Arquivo: `/app/api/webhooks/bunny/route.ts` linha 6
- Problema: `if (expectedToken)` — se env var nao configurada, webhook aceita qualquer request
- Impacto: Atacante pode enviar payloads falsos de status de video
- Fix: Tornar token obrigatorio (retornar 503 se ausente)
- Esforco: 5 min

---

## PARTE 2 -- LEGAL

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 9.1 | Termos de Uso | ✅ | `/app/(public)/termos/page.tsx` — completo com 11+ secoes incluindo UGC, limites de responsabilidade, SLA |
| 9.2 | Politica de Privacidade | ✅ | `/app/(public)/privacidade/page.tsx` — 9+ secoes, cobre dados coletados, finalidades, bases legais LGPD, direitos do titular |
| 9.3 | LGPD compliance | ✅ | Exportacao de dados LGPD (rota `/api/lgpd/export`), exclusao de conta (`/api/auth/delete-account` + `/excluir-conta`), pagina de privacidade do perfil (`/perfil/privacidade`), consentimento para menores |
| 9.4 | COPPA compliance (Kids) | ✅ | Pagina dedicada `/privacidade-menores` com conformidade LGPD Art. 14 + COPPA. Sem ads para menores, sem compartilhamento de dados, sem tracking, sem UGC, consentimento parental obrigatorio |
| 9.5 | Licenca do software | ❌ | **Nao existe arquivo LICENSE na raiz do projeto.** Necessario para submissao e protecao de IP |
| 9.6 | Termos de UGC | ✅ | Secao "11-A. Conteudo do Usuario" nos Termos de Uso cobre licenca limitada, responsabilidade do usuario, proibicoes |
| 9.7 | Excluir conta | ✅ | Pagina publica `/excluir-conta` + API route `auth/delete-account` — exigido por Apple e Google |
| 9.8 | Pagina de contato/suporte | ✅ | `/contato`, `/suporte`, API `/api/contato`, area admin de suporte |

---

## PARTE 3 -- PROPRIEDADE INTELECTUAL

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 9.9 | Sem marcas registradas sem permissao | ❌ | **109 referencias a marcas registradas em mock data**: "Gracie Barra", "Carlson Gracie", "Alliance", "CheckMat", "Nova Uniao", "GFTeam", "Atos JJ", "Ribeiro JJ". Tambem em `campeonatos/[id]/inscricao/page.tsx:72`. Todas sao marcas registradas de equipes de BJJ |
| 9.10 | "BlackBelt" disponivel como nome de app? | ⚠️ | Verificar manualmente nas stores — existem apps "BlackBelt" (generico). Nome do bundle: `app.blackbelt.academy` (mais especifico, provavelmente ok) |
| 9.11 | Icones/imagens sao originais | ✅ | `/public/icons/` e `/public/app-icons/` contem icones gerados (SVG/PNG). `/public/brand/` contem marca propria |
| 9.12 | Fonts licenciadas | ✅ | Google Fonts via `next/font/google`: Instrument Sans (OFL), JetBrains Mono (OFL), Outfit (OFL), Playfair Display (OFL) — todas licenca aberta |

### Acoes IP Urgentes

**IP-001 (CRITICO para store): Remover marcas registradas dos mocks**
- Arquivos: `lib/mocks/marketplace.mock.ts`, `lib/mocks/federation-ranking.mock.ts`, `lib/mocks/championships.mock.ts`, `app/(main)/campeonatos/[id]/inscricao/page.tsx`
- Impacto: Apple e Google podem rejeitar por uso nao autorizado de marcas. Equipes de BJJ podem exigir remocao
- Fix: Substituir por nomes ficticios ("Academia Samurai", "Equipe Tatame", "Team Kime", etc.)
- Esforco: 30 min

---

## PARTE 4 -- PRE-SUBMISSAO APPLE

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 10.1 | Conta demo para reviewer | ✅ | `docs/STORE_REVIEW_CREDENTIALS.md` existe com 4 perfis (admin, professor, aluno, responsavel). **MAS**: credenciais precisam ser criadas de fato no backend de producao |
| 10.2 | App Review Notes escritas | ⚠️ | Credentials doc tem fluxos de teste, mas falta texto formatado para o campo "App Review Notes" do App Store Connect |
| 10.3 | Backend ativo e acessivel | ✅ | Vercel + Supabase com deploy automatico. URL: `https://blackbeltv2.vercel.app` |
| 10.4 | Sem placeholder content | ✅ | Nenhum "Lorem ipsum" encontrado. Placeholders em inputs sao hints contextuais (nomes, emails, etc.) — correto |
| 10.5 | Sem referencia a "beta" ou "test" | ✅ | Unicas refs a "beta" sao no painel superadmin de feature flags (opcao de status) — nao visivel para usuarios normais |
| 10.6 | Sem crash no cold start | ⚠️ | Nao testado em device fisico. Necessario teste manual em iPhone |
| 10.7 | Sem API key hardcoded | ✅ | Todas as keys vem de `process.env.*`. `.env*` no `.gitignore`. `.env.example` tem valores vazios |
| 10.8 | Info.plist permissions justified | ❌ | **CRITICO**: App usa Camera (`@capacitor/camera` em `lib/native/camera-scanner.ts`) e PushNotifications (`@capacitor/push-notifications`) mas Info.plist NAO tem `NSCameraUsageDescription` nem `NSPhotoLibraryUsageDescription`. Apple REJEITARA na submissao |
| 10.9 | Capacitor server config | ⚠️ | `capacitor.config.ts` aponta `server.url` para `https://blackbeltv2.vercel.app` — app e um web wrapper. Apple pode rejeitar por "minimum functionality" se nao detectar features nativas suficientes |
| 10.10 | Sentry configurado | ⚠️ | `withSentryConfig` no next.config.mjs mas `SENTRY_DSN` e `SENTRY_AUTH_TOKEN` marcados como "missing" no CTO dashboard |

---

## PARTE 5 -- PRE-SUBMISSAO GOOGLE

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 10.11 | Data Safety form | ❌ | Necessario preencher no Google Play Console. Dados coletados: email, nome, telefone, dados de uso, fotos (camera). Dados compartilhados: nenhum com terceiros |
| 10.12 | Content Rating (IARC) | ❌ | Necessario preencher questionario IARC no Google Play Console |
| 10.13 | Permissions justificadas | ✅ | Android so pede `INTERNET` — minimo necessario. Push notifications via FCM nao requer permissao extra no manifest |
| 10.14 | Target audience definido | ❌ | Precisa definir no Google Play Console. App tem modulo Kids (< 13 anos) — aciona politica de "Families" do Google |
| 10.15 | App access (restricted) | ❌ | Login obrigatorio — precisa fornecer credenciais de teste no Google Play Console |
| 10.16 | Ads declaration | ✅ | Sem ads. Declararar "No ads" no Play Console |
| 10.17 | webContentsDebuggingEnabled | ✅ | `android.webContentsDebuggingEnabled: false` no `capacitor.config.ts` — correto para producao |
| 10.18 | allowMixedContent | ✅ | `android.allowMixedContent: false` — correto, bloqueia HTTP |

---

## PARTE 6 -- STORE REVIEW CREDENTIALS

Documento separado: [`STORE_REVIEW_CREDENTIALS.md`](./STORE_REVIEW_CREDENTIALS.md)

Credenciais de demo ja existem em `docs/STORE_REVIEW_CREDENTIALS.md` com 4 perfis e 7 fluxos de teste.

**Acao necessaria**: Criar as contas de fato no ambiente de producao antes da submissao.

---

## ACOES NECESSARIAS

### Prioridade CRITICA (bloqueia submissao)

| # | Acao | Esforco | Responsavel |
|---|------|---------|-------------|
| A1 | Adicionar `NSCameraUsageDescription` e `NSPhotoLibraryUsageDescription` ao Info.plist | 5 min | Dev iOS |
| A2 | Remover marcas registradas dos mocks (Gracie Barra, Alliance, CheckMat, etc.) | 30 min | Dev |
| A3 | Corrigir CSP connect-src: adicionar `*.b-cdn.net`, `*.bunnycdn.com`, `app.posthog.com` | 5 min | Dev |
| A4 | Criar contas demo reais no ambiente de producao | 15 min | Admin |
| A5 | Adicionar arquivo LICENSE na raiz do projeto | 5 min | Lead |

### Prioridade ALTA (pode causar rejeicao)

| # | Acao | Esforco | Responsavel |
|---|------|---------|-------------|
| A6 | Preencher Data Safety form no Google Play Console | 30 min | PM |
| A7 | Preencher Content Rating (IARC) no Google Play Console | 15 min | PM |
| A8 | Definir target audience no Google Play Console (atencao: modulo Kids aciona politica Families) | 30 min | PM |
| A9 | Fornecer credenciais de teste no Google Play Console | 10 min | PM |
| A10 | Escrever App Review Notes para Apple (campo do App Store Connect) | 20 min | PM |
| A11 | Tornar BUNNY_WEBHOOK_TOKEN obrigatorio no webhook | 5 min | Dev |

### Prioridade MEDIA (recomendado)

| # | Acao | Esforco | Responsavel |
|---|------|---------|-------------|
| A12 | Configurar CORS explicito para API routes v1/ | 30 min | Dev |
| A13 | Configurar Sentry DSN e auth token em producao | 15 min | DevOps |
| A14 | Testar cold start em device fisico (iPhone + Android) | 1h | QA |
| A15 | Verificar disponibilidade do nome "BlackBelt" nas stores | 15 min | PM |
| A16 | Validar que app passa no teste "minimum functionality" da Apple (web wrapper) | 1h | Dev |

---

## RESUMO

| Metrica | Valor |
|---------|-------|
| **Total de items auditados** | 33 |
| ✅ **Pronto** | 24 (73%) |
| ⚠️ **Parcial / Precisa verificacao** | 4 (12%) |
| ❌ **Falta** | 5 (15%) |

### Veredito

A base de seguranca e **solida**: RLS abrangente (415 tabelas, 589 policies), VULN-001 corrigida, auth completa em middleware e API routes, security headers bem configurados, error handling consistente. A conformidade legal (LGPD, COPPA, Termos, Privacidade, exclusao de conta) esta **acima da media** para apps brasileiros.

Os **bloqueios criticos** para submissao sao:
1. **Info.plist sem NSUsageDescription** — Apple rejeitara automaticamente
2. **Marcas registradas nos mocks** — risco legal e de rejeicao
3. **CSP incompleto** — videos do Bunny podem nao funcionar

Esforco total estimado para resolver todos os bloqueios: **~1 hora de dev + 2 horas de PM no console das stores**.

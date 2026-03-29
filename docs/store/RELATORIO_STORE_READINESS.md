# BLACKBELT V2 — RELATORIO DE READINESS PARA STORES

Data: 2026-03-29
Auditoria: 7 agents paralelos — analise completa do codebase

---

## Resumo Executivo

| Area | Total | ✅ Pronto | ⚠️ Parcial | ❌ Falta | % Pronto |
|------|-------|-----------|------------|---------|----------|
| 01 — Contas + Build | 27 | 4 | 9 | 14 | 15% |
| 02 — Privacidade + LGPD | 22 | 18 | 2 | 2 | 82% |
| 03 — Conteudo + Classificacao | 21 | 10 | 5 | 6 | 48% |
| 04 — Listing + Metadata | 28 | 13 | 5 | 10 | 46% |
| 05 — Monetizacao | 21 | 14 | 6 | 1 | 67% |
| 06 — Design + Funcionalidade | 27 | 22 | 5 | 0 | 81% |
| 07 — Seguranca + Legal | 33 | 24 | 4 | 5 | 73% |
| **TOTAL** | **179** | **105** | **36** | **38** | **59%** |

**Score geral: 105/179 itens prontos (59%)**

---

## BLOQUEADORES HARD (sem isso NAO publica)

Estes itens causam rejeicao automatica ou impedem submissao:

### Contas e Infraestrutura
| # | Bloqueio | Esforco | Area |
|---|----------|---------|------|
| H1 | Criar conta Apple Developer Program (US$99/ano) — aprovacao leva 24-48h | 1 dia espera | 01 |
| H2 | Criar conta Google Play Console Organization (US$25) — verificacao ate 2 semanas | 1-14 dias espera | 01 |
| H3 | Gerar certificado de distribuicao iOS + provisioning profile | 2h | 01 |
| H4 | Gerar keystore Android + configurar signingConfigs | 1h | 01 |

### Build e Configuracao
| # | Bloqueio | Esforco | Area |
|---|----------|---------|------|
| H5 | **Arquitetura WebView remoto** — `capacitor.config.ts` aponta para URL remota. Apple rejeita wrappers de website (Guideline 4.2). Necessita bundle local ou features nativas significativas | 2-5 dias | 01 |
| H6 | Adicionar `NSCameraUsageDescription` e `NSPhotoLibraryUsageDescription` ao Info.plist | 5 min | 01/07 |
| H7 | Configurar Firebase: `google-services.json` (Android) + `GoogleService-Info.plist` (iOS) para push notifications | 2h | 01 |
| H8 | Corrigir CSP connect-src: adicionar `*.b-cdn.net`, `*.bunnycdn.com`, `app.posthog.com` | 5 min | 07 |

### UGC (User Generated Content)
| # | Bloqueio | Esforco | Area |
|---|----------|---------|------|
| H9 | **Implementar bloqueio de usuarios** — Apple Guideline 1.2 OBRIGA para apps com UGC. Zero infraestrutura hoje | 3-5 dias | 03 |
| H10 | **Criar dashboard admin de moderacao** — tabela `content_reports` existe, mas SEM UI para resolver denuncias | 3-4 dias | 03 |
| H11 | Implementar filtro de profanidade em mensagens | 2-3 dias | 03 |
| H12 | Mecanismo admin para ocultar/deletar mensagens denunciadas | 2-3 dias | 03 |

### Apple IAP Compliance
| # | Bloqueio | Esforco | Area |
|---|----------|---------|------|
| H13 | **Esconder precos/links de pagamento no app nativo** — `TrialBanner`, `AdminShell "Meu Plano"`, `/admin/plano` mostram precos. Apple 3.1.1 proibe. Usar `isNative()` para condicionar | 4-5h | 05 |

### IP / Marcas Registradas
| # | Bloqueio | Esforco | Area |
|---|----------|---------|------|
| H14 | **Remover 109 marcas registradas dos mocks** — "Gracie Barra", "Alliance", "CheckMat", etc. em `lib/mocks/` | 30 min | 07 |

**Total de bloqueadores hard: 14**
**Esforco dev estimado: ~20-30 dias** (dominado por H5 WebView + H9-H12 UGC)

---

## BLOQUEADORES SOFT (pode publicar, mas risco de rejeicao)

| # | Item | Esforco | Area |
|---|------|---------|------|
| S1 | Preencher questionarios Age Rating (IARC Google + Apple) | 2h | 03 |
| S2 | Preencher Data Safety form no Google Play Console | 30 min | 07 |
| S3 | Screenshots iPhone 6.5" (1284x2778) — Apple exige separado de 6.7" | 1h | 04 |
| S4 | Redigir TODOS os textos de listing (subtitle, descriptions, keywords) | 1h (drafts prontos) | 04 |
| S5 | Configurar email `suporte@blackbelt.app` com MX records reais | 1h | 04 |
| S6 | Substituir telefone placeholder `+55 11 99999-0000` por numero real | 5 min | 04 |
| S7 | Nomear DPO/Encarregado de dados na politica de privacidade (LGPD Art. 41) | 30 min | 02 |
| S8 | Criar `PrivacyInfo.xcprivacy` fisicamente em `ios/App/App/` | 15 min | 02 |
| S9 | Adicionar Android back button handler para evitar fechar app na tela raiz | 2h | 06 |
| S10 | Corrigir appId inconsistente (`app.blackbelt.academy` vs `app.blackbelt.v2`) | 15 min | 06 |
| S11 | Preencher TEAM_ID no AASA e sha256 fingerprints no assetlinks.json | 30 min | 06 |
| S12 | Criar contas demo reais no ambiente de producao para revisores | 15 min | 07 |
| S13 | Adicionar arquivo LICENSE na raiz do projeto | 5 min | 07 |
| S14 | Definir target audience no Google Play Console (modulo Kids aciona politica Families) | 30 min | 07 |
| S15 | Desabilitar analytics (PostHog/Sentry) para perfis Kids (COPPA) | 2h | 02 |
| S16 | Restricoes adicionais para Teen messaging (supervisao parental) | 2-3 dias | 03 |
| S17 | Criar pagina publica de precos standalone (nao apenas redirect) | 4h | 05 |

**Total soft blockers: 17**
**Esforco dev estimado: ~5-7 dias**

---

## COISAS JA PRONTAS (destaques)

### Privacidade e Legal (82% pronto)
- ✅ Politica de privacidade completa (12 secoes, LGPD, bases legais, retencao)
- ✅ Politica de privacidade para menores dedicada
- ✅ Termos de uso com 16 secoes (incluindo UGC, reembolso)
- ✅ Exclusao de conta com anonimizacao real (Edge Function + API route)
- ✅ Consentimento parental multi-step com verificacao de idade
- ✅ Cookie banner com opcoes essenciais/todos
- ✅ COPPA: Kids sem mensagens, sem chat, sem financeiro

### Design e Native (81% pronto)
- ✅ 17 plugins Capacitor (push, haptics, camera, biometrics, network, keyboard, etc.)
- ✅ 11 modulos nativos em `lib/native/` (biometria, camera QR, offline cache, deep links)
- ✅ Safe areas em TODOS os 8 shells
- ✅ Dark mode completo com ThemeContext (system/light/dark)
- ✅ Skeleton loading (2162 refs) + Error boundaries (14 arquivos) + Empty states (67 usos)
- ✅ Sign in with Apple + Google implementados
- ✅ Recuperacao de senha funcional

### Seguranca (73% pronto)
- ✅ 415 tabelas com RLS, 589 policies
- ✅ VULN-001 (role escalation) corrigida
- ✅ 7 security headers configurados (HSTS, CSP, X-Frame-Options, etc.)
- ✅ 1112 catch blocks + 2493 error handlers
- ✅ Service role key protegida (nao exposta no client)
- ✅ Auth em todas as 45 API routes

### Monetizacao (67% pronto)
- ✅ Asaas integrado end-to-end (subscriptions + cobracas)
- ✅ Trial 7 dias implementado com TrialBanner e auto-expiracao
- ✅ Boleto + PIX (5% desconto) + Cartao
- ✅ Webhooks configurados com verificacao de assinatura
- ✅ Inadimplencia detectada e tratada

### Assets (parcialmente pronto)
- ✅ App Icon 1024x1024 (Apple) + 512x512 (Google) + mipmaps
- ✅ Feature Graphic 1024x500 (Google Play)
- ✅ Screenshots iPhone 6.7", iPad 12.9", Android phone, Android tablet 7"
- ✅ Splash screens iOS + Android configuradas
- ✅ Contas demo documentadas com fluxos de teste
- ✅ Pagina de suporte/contato funcional

---

## PROXIMOS PASSOS (ordenados por prioridade)

### SEMANA 1 — Contas e Fixes Rapidos (~8h dev + espera de aprovacao)

1. **Criar conta Apple Developer (US$99)** — Gregory no browser
2. **Criar conta Google Play Organization (US$25)** — Gregory no browser
3. **Fix CSP connect-src** — 5 min (adicionar Bunny + PostHog)
4. **Adicionar NSCameraUsageDescription ao Info.plist** — 5 min
5. **Remover marcas registradas dos mocks** — 30 min
6. **Adicionar LICENSE** — 5 min
7. **Criar PrivacyInfo.xcprivacy** — 15 min
8. **Nomear DPO na politica de privacidade** — 30 min
9. **Esconder precos no app nativo** (isNative check) — 4-5h
10. **Corrigir appId + TEAM_ID + assetlinks** — 30 min

### SEMANA 2 — UGC e Moderacao (~12-15 dias dev)

11. **Implementar bloqueio de usuarios** — tabela + service + UI — 3-5 dias
12. **Dashboard admin de moderacao** — listar/resolver reports — 3-4 dias
13. **Filtro de profanidade** — server-side em PT-BR — 2-3 dias
14. **Mecanismo de deletar mensagens denunciadas** — 2-3 dias

### SEMANA 3 — Store Listing e Build (~5 dias dev + PM)

15. **Configurar Firebase** (google-services.json + GoogleService-Info.plist) — 2h
16. **Gerar keystore Android + signingConfigs** — 1h
17. **Screenshots iPhone 6.5"** — 1h
18. **Copiar drafts de listing para as stores** — 1h (drafts prontos no relatorio 04)
19. **Preencher IARC + Data Safety + Target Audience** — 2h
20. **Configurar email suporte@blackbelt.app** — 1h
21. **Testar build em device real (iOS + Android)** — 4h

### SEMANA 4 — Resolver WebView e Polimento

22. **Resolver arquitetura WebView remoto** (H5) — 2-5 dias
    - Opcao A: Migrar para static export local (mais seguro)
    - Opcao B: Demonstrar que features nativas justificam o app (17 plugins, biometria, push, camera)
23. **Back button handler Android** — 2h
24. **Lock portrait iPhone** — 30 min
25. **Desabilitar analytics para Kids** — 2h
26. **Teste end-to-end em devices** — 4h
27. **Submeter para review** — Apple (~48h review) + Google (~24h review)

---

## ESTIMATIVA TOTAL

| Metrica | Valor |
|---------|-------|
| **Tempo para Google Play** | ~3-4 semanas (Google e mais flexivel, menos bloqueios) |
| **Tempo para Apple App Store** | ~4-5 semanas (IAP compliance + WebView risk + review mais rigido) |
| **Tempo para AMBAS** | ~4-5 semanas (paralelizavel) |
| **Dias de dev puro** | ~25-35 dias |
| **Maior risco** | Apple rejeitar por WebView remoto (Guideline 4.2) |

## CUSTOS

| Item | Valor | Frequencia |
|------|-------|------------|
| Apple Developer Program | US$99 (~R$500) | Anual |
| Google Play Console | US$25 (~R$130) | Unico |
| Dominio blackbelt.app (se nao tem) | ~R$40 | Anual |
| Email profissional (MX records) | R$0-50 | Mensal |
| **Total primeiro ano** | **~R$670-1.270** | |

---

## VULNERABILIDADES ENCONTRADAS

| ID | Severidade | Descricao | Fix |
|----|-----------|-----------|-----|
| VULN-002 | MEDIA | CSP connect-src nao inclui Bunny CDN nem PostHog | 5 min |
| VULN-003 | BAIXA | Bunny webhook token opcional (aceita requests sem auth se env var vazia) | 5 min |
| IP-001 | ALTA | 109 marcas registradas de equipes BJJ em mock data | 30 min |

---

## CONCLUSAO

O BlackBelt v2 esta **59% pronto** para publicacao nas stores. Os pontos fortes sao privacidade/LGPD (82%), design/native (81%), e seguranca (73%). Os pontos fracos sao contas/build (15% — contas nao criadas) e listing/metadata (46% — textos nao redigidos, mas drafts prontos).

**Os 3 maiores riscos de rejeicao sao:**

1. **Apple Guideline 4.2 (Minimum Functionality)** — app carrega via URL remota. Mitigacao: 17 plugins nativos + biometria + camera + push podem justificar, mas e risco.

2. **Apple Guideline 1.2 (UGC)** — sem bloqueio de usuarios e sem moderacao de admin. Rejeicao CERTA sem implementar.

3. **Apple Guideline 3.1.1 (IAP)** — precos visiveis dentro do app nativo. Fix rapido com `isNative()`.

**Com 4-5 semanas de trabalho focado, o BlackBelt estara pronto para ambas as stores.**

---

## RELATORIOS DETALHADOS

- [01 — Contas + Build](./01_CONTAS_BUILD.md)
- [02 — Privacidade + LGPD](./02_PRIVACIDADE_LGPD.md)
- [03 — Conteudo + Classificacao](./03_CONTEUDO_CLASSIFICACAO.md)
- [04 — Listing + Metadata](./04_LISTING_METADATA.md)
- [05 — Monetizacao](./05_MONETIZACAO.md)
- [06 — Design + Funcionalidade](./06_DESIGN_FUNCIONALIDADE.md)
- [07 — Seguranca + Legal](./07_SEGURANCA_LEGAL_PRESUBMISSAO.md)
- [Store Review Credentials](./STORE_REVIEW_CREDENTIALS.md)

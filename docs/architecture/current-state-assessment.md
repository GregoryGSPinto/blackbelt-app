# BlackBelt v2 — Current State Assessment

> Auditoria executiva do estado real do projeto. Fase 0 do Enterprise Elevation Program.
> Data: 2026-03-17 | Avaliador: Principal Engineer / Enterprise SaaS Architect

---

## 1. Resumo Executivo

O BlackBelt v2 possui **engenharia de base sólida** e uma **superfície de produto impressionante**, mas opera inteiramente em **modo mock em produção**. A distância entre o que o projeto comunica e o que ele entrega em runtime é o maior risco enterprise.

**Veredito:** O projeto tem disciplina arquitetural real (TypeScript strict, 130+ services tipados, CI/CD funcional, RLS no Supabase). Mas não há um único fluxo end-to-end que funcione com dados reais em produção hoje.

---

## 2. O que é genuinamente sólido

### 2.1 Disciplina Arquitetural (9/10)

- **TypeScript strict mode** com `"no-explicit-any": "error"` — real, enforced no CI
- **130+ service contracts** seguindo padrão consistente: `isMock()` → dynamic import → mock ou Supabase
- **Domain rules** em `lib/domain/rules.ts` — 9 regras de negócio puras, bem testadas (25 test cases)
- **CLAUDE.md** como governance document — claro, prático, reflete o código real
- **Separation of concerns** — services nunca dependem de rotas, domínio é fonte de verdade

### 2.2 Infraestrutura de Build e Deploy (8.5/10)

- **CI/CD** com GitHub Actions: lint → typecheck → test → build → deploy (Vercel)
- **pnpm 10** com lockfile frozen — builds reproduzíveis
- **Sentry** configurado (client + server) — opcional mas pronto
- **PostHog** para analytics — integrado
- **Security headers** no next.config.mjs — HSTS, X-Frame-Options, CSP (embora CSP permissivo)
- **Releases automatizadas** via tags semânticas

### 2.3 Schema de Banco de Dados (7.5/10)

- **17 migrações SQL** cobrindo: auth, tenants, classes, attendance, pedagogy, content, social, financial
- **39 tabelas** com foreign keys e constraints
- **RLS em 100% das tabelas** (migration 012 como catch-all)
- **Função `is_member_of(academy_id)`** como padrão de isolamento — correto e reutilizável
- **Superadmin bypass** explícito via policies dedicadas (migration 017)

### 2.4 Stack Enxuta (9/10)

- 18 dependências de produção — lean e proposital
- Nenhum framework de UI inflado — Tailwind utility-first only
- Supabase SSR para auth seguro
- Capacitor 8 para mobile
- Recharts para gráficos (única lib de UI)

---

## 3. O que está parcialmente implementado

### 3.1 Autenticação (Beta)

| Componente | Status |
|-----------|--------|
| Login com Supabase JWT | Funcional quando `isMock=false` |
| Token em memória | Correto no mock; Supabase SSR usa httpOnly cookies |
| Middleware de rota | Redireciona por role, mas não enforça permissões |
| Profile switching | Funciona, mas usa cookie `bb-academy-id` manipulável |
| Refresh token | Supabase gerencia automaticamente no modo real |

**Problema central:** Auth funciona para routing, mas não há enforcement no nível de API. Qualquer request com API key acessa qualquer dado.

### 3.2 Multi-Tenancy (Beta com Vulnerabilidades)

| Componente | Status |
|-----------|--------|
| `is_member_of()` function | Correto — 25+ policies usam |
| RLS por academy_id | 16+ tabelas com coluna academy_id |
| Superadmin bypass | Explícito e correto |
| Franqueador cross-tenant | Role definido, zero policies implementadas |

**VULNERABILIDADE CRÍTICA:** 6 tabelas com `USING (true)` permitem leitura cross-tenant:
- `class_notes`, `feed_likes`, `feed_comments`, `student_xp`, `challenge_progress`, `event_registrations`
- Qualquer usuário autenticado pode ler dados de qualquer academia nessas tabelas

### 3.3 Gateway de Pagamento (Scaffolding)

| Componente | Status |
|-----------|--------|
| Factory pattern (Stripe/Asaas/Mock) | Implementado e correto |
| Webhook route | Recebe e valida signatures |
| Webhook handlers | **Stubs** — apenas logam, não processam |
| Subscription lifecycle | Tipos definidos, nenhuma transição real |
| Invoice generation | Mock only |
| Dunning/Grace period | Configuração existe, não é enforçada |

### 3.4 Onboarding (70%)

- Wizard de 6 passos para academia — UI completa, links de convite são placeholders
- Token-based enrollment via superadmin — integrado com Supabase
- Fluxo de primeiro aluno — não existe

### 3.5 Mobile/PWA (60%)

- PWA manifest completo e correto
- Service worker implementado mas **não registrado** no layout
- Capacitor configurado (splash, status bar, push)
- QR Scanner — camera funciona, **decoder não implementado** (jsQR ausente)

---

## 4. O que é mock-backed (parece real, mas não é)

### 4.1 Toda a Camada de Dados em Produção

**`NEXT_PUBLIC_USE_MOCK=true`** está ativo em `.env.production`. Isso significa:

- Todos os 130+ services retornam dados hardcoded
- Nenhuma query real ao Supabase em produção
- Toda a experiência do usuário é fake data

### 4.2 Services sem Backend Real

| Domínio | Services | Backend Real |
|---------|----------|-------------|
| Admin Dashboard | 6 services | 0 |
| Super Admin | 8 services | 0 |
| Professor | 8 services | 0 |
| Aluno Adulto | 8 services | 0 |
| Responsável | 5 services | 0 |
| Teen | 4 services | 0 |
| Kids | 1 service | 0 |
| Billing | 7 services | 0 (gateway scaffolded) |
| Financial | 3 services | 0 |

**Exceções que têm backend real:**
- `auth.service.ts` — login, register, refresh, logout com Supabase
- `admin.service.ts` — dashboard e metrics com queries Supabase
- `turmas.service.ts` — CRUD de turmas com Supabase

### 4.3 Billing "Not Implemented"

`billing.service.ts` tem 11 funções, **todas lançam `'Not implemented'`** em produção. Não há billing real.

---

## 5. O que é aspiracional (existe no discurso, não no código)

### 5.1 RBAC de Verdade

- **Discurso:** Matriz RBAC detalhada no CLAUDE.md e roadmap
- **Realidade:** Middleware faz redirect por role. Nenhuma verificação de permissão por recurso/ação. API routes aceitam qualquer request com API key.
- `lib/domain/rules.ts` define 9 regras — nenhuma é chamada em API routes

### 5.2 Security Enterprise-Grade

- **SECURITY.md** lista features como se estivessem implementadas
- **Realidade:** Headers básicos no next.config, CSP permissivo (`unsafe-eval`, `unsafe-inline`), nenhum audit, nenhum pentest, nenhuma compliance

### 5.3 Observabilidade

- **Web Vitals:** Interface definida, implementação é `console.log` com TODO
- **Sentry:** Configurado mas `Sentry.captureException()` nunca é chamado no código
- **Correlation IDs:** Inexistentes
- **Structured logging:** Logger faz console.log formatado — sem shipping, sem aggregation

### 5.4 Ecossistema (SDK, Plugin System, Developer Portal)

- **ECOSYSTEM.md** e **SDK.md** descrevem sistema de plugins, marketplace, API pública
- **Realidade:** Páginas estáticas de marketing. Nenhum SDK publicado. Nenhuma API documentada funcional.

---

## 6. Conflitos de Narrativa

### 6.1 Três Roadmaps Conflitantes

| Documento | Escopo |
|-----------|--------|
| ROADMAP.md | 10 fases, 52 prompts |
| ARCHITECTURE_V3.md | 30 fases, 152 prompts |
| Git history | 100+ prompts já mergeados |

**Impacto:** Impossível determinar o que está commited vs aspiracional. Enterprise audience não saberá o que é real.

### 6.2 Go-Live Não Mergeado

`BLACKBELT_GO_LIVE.md` está no git como untracked. Este é o documento mais importante do projeto — as instruções para conectar Supabase real — e não está no main branch.

### 6.3 Módulos "Nucleares" Incompletos

| Módulo | Spec existe | Implementação |
|--------|------------|---------------|
| Admin Local | Sim | 100% |
| Super Admin | Sim | 75% (2 páginas faltando) |
| Professor | Sim | 100% |
| Aluno Adulto | Sim | 87% (1 página faltando) |
| Responsável | Sim | 50% |
| Teen | Sim | 62% |
| Kids | Sim | 37% |
| Recepcionista | Sim | 0% (zero implementação) |
| Franqueador | Sim | 71% |

---

## 7. Testes e Quality Gates

### 7.1 Cobertura de Testes

| Tipo | Arquivos | Casos | Cobertura Estimada |
|------|----------|-------|-------------------|
| Unit (domain rules) | 1 | 25 | Excelente para rules.ts |
| Unit (services) | 10 | ~70 | Mock-only, happy path |
| Route validation | 1 | ~10 | Verifica existência de arquivo |
| E2E (Playwright) | 1 | 4 | Apenas login flow |
| **Total** | **13** | **~109** | **<5% do codebase** |

### 7.2 O que NÃO é testado

- Payment flows (Stripe/Asaas)
- Tenant isolation (cross-academy queries)
- Real Supabase auth (JWT validation)
- Database migrations (schema integrity)
- File uploads
- Realtime/WebSocket
- Push notifications
- Email sending
- Nenhum service em modo real (todos testam mock)

### 7.3 CI Gates

| Gate | Existe | Enforçado |
|------|--------|-----------|
| ESLint | Sim | Sim |
| TypeScript strict | Sim | Sim |
| Unit tests | Sim | Sim (mas mock-only) |
| Build success | Sim | Sim |
| E2E tests | Config existe | **Não roda no CI** |
| Coverage threshold | **Não** | — |
| Security scanning | **Não** | — |
| Dependency audit | **Não** | — |
| Migration validation | **Não** | — |

---

## 8. Scorecard Consolidado

| Eixo | Score | Classificação |
|------|-------|--------------|
| Disciplina arquitetural | 9/10 | Production-Ready |
| TypeScript / Type safety | 10/10 | Production-Ready |
| CI/CD pipeline | 8/10 | Production-Ready |
| Database schema | 7.5/10 | Beta (RLS vulnerabilities) |
| Auth / Session | 6/10 | Beta |
| Multi-tenancy | 5/10 | Beta (6 tabelas vulneráveis) |
| RBAC enforcement | 2/10 | Planned |
| Billing / Payments | 2/10 | Mock-backed (scaffolding) |
| Test coverage | 3/10 | Insuficiente |
| Observabilidade | 4/10 | Aspirational |
| Segurança | 4/10 | Aspirational |
| Mobile / PWA | 5/10 | Beta |
| Onboarding | 5/10 | Beta |
| Operação real (classes, check-in) | 7/10 | Beta → Production |
| Documentação / Posicionamento | 5/10 | Conflitante |
| **MÉDIA PONDERADA** | **5.2/10** | **Beta com base sólida** |

---

## 9. Veredito Final

### O que sustenta a narrativa enterprise

1. **Código limpo e disciplinado** — TypeScript strict, zero any, padrões consistentes
2. **CI/CD real** — lint, typecheck, test, build, deploy automatizado
3. **Schema de banco maduro** — 17 migrations, RLS, constraints
4. **Service layer bem desenhado** — 130+ contratos tipados, bifurcação mock/real elegante
5. **Domínio rico** — regras de negócio, enums, tipos, constantes

### O que enfraquece a narrativa enterprise

1. **Produção roda em mock mode** — nenhum dado real
2. **6 vulnerabilidades de data leakage** cross-tenant no RLS
3. **Zero enforcement de RBAC** no nível de API
4. **Billing é fachada** — 11 funções "Not implemented"
5. **<5% test coverage** — inaceitável para SaaS
6. **3 roadmaps conflitantes** — confusão de escopo
7. **Security docs aspiracionais** — listam features como se existissem
8. **Go-live uncommitted** — o procedimento mais crítico não está no main
9. **Recepcionista com zero implementação** — módulo inteiro inexistente
10. **Observabilidade é console.log** — sem tracing, sem APM, sem alertas

### A frase que melhor descreve o estado atual

> "Excelente arquitetura de frontend com contratos de backend bem definidos, operando inteiramente sobre dados fictícios, com gaps críticos em segurança, billing e enforcement de permissões."

---

*Documento gerado como parte da Fase 0 — Enterprise Elevation Program*
*Próximo: enterprise-gap-analysis.md*

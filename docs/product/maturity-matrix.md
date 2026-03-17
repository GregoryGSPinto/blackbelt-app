# BlackBelt v2 — Maturity Matrix

> Classificação de cada módulo e domínio por nível de maturidade real.
> Data: 2026-03-17 | Fase 0 — Enterprise Elevation Program

---

## Legenda

| Nível | Definição | Critérios |
|-------|-----------|-----------|
| **Production-Ready** | Funciona com dados reais, testado, seguro | Backend real + testes + RLS + error handling |
| **Beta** | Funciona mas com gaps conhecidos | Backend parcial ou mock com estrutura real pronta |
| **Mock-Backed** | UI funcional, dados fictícios | Service + mock implementados, zero backend |
| **Planned** | Existe no discurso ou spec, não no código | Documentação ou tipos, sem implementação |

---

## 1. Infraestrutura e Plataforma

| Domínio | Maturidade | Evidência |
|---------|-----------|-----------|
| TypeScript strict mode | **Production-Ready** | `tsconfig.json` strict: true, `no-explicit-any: error`, enforçado no CI |
| Build pipeline (Next.js) | **Production-Ready** | next build funcional, Vercel auto-deploy |
| CI/CD (GitHub Actions) | **Production-Ready** | lint → typecheck → test → build → deploy |
| Release automation | **Production-Ready** | Tag-based releases com changelog |
| pnpm lockfile | **Production-Ready** | Frozen lockfile, reproducible builds |
| Dependency management | **Beta** | Lean (34 deps), mas 2 major versions atrás (Next 14, React 18) |
| Database migrations | **Beta** | 17 migrations corretas, sem pre-flight validation no CI |
| Environment validation | **Beta** | `env-production.ts` valida 40+ vars, não enforçado no CI |
| Vercel deployment | **Production-Ready** | Preview por PR, production por push to main |

---

## 2. Autenticação e Identidade

| Domínio | Maturidade | Evidência |
|---------|-----------|-----------|
| Login (Supabase JWT) | **Production-Ready** | `supabase.auth.signInWithPassword()` funcional |
| Token storage | **Production-Ready** | Supabase SSR httpOnly cookies (modo real) |
| Token refresh | **Production-Ready** | `supabase.auth.refreshSession()` automático |
| Logout | **Beta** | Funciona, mas não limpa cookie `bb-academy-id` |
| Profile switching | **Beta** | Funciona via DB query, contexto via cookie manipulável |
| Mock auth | **Production-Ready** | 20 users, JWT válido, rate limiting básico |
| Middleware (route protection) | **Beta** | Redireciona por role, não enforça permissões |
| RBAC enforcement (API) | **Planned** | `rules.ts` existe com 9 regras, nenhuma chamada em endpoints |
| Permission model (resource-level) | **Planned** | Nenhum `hasPermission(action, resource)` implementado |
| OAuth2 / SSO | **Planned** | Nenhuma implementação |

---

## 3. Multi-Tenancy

| Domínio | Maturidade | Evidência |
|---------|-----------|-----------|
| Tenant model (Academy) | **Production-Ready** | FK academy_id em 16+ tabelas |
| `is_member_of()` function | **Production-Ready** | SECURITY DEFINER, 25+ policies |
| RLS coverage | **Beta** | 100% tabelas com RLS, mas 6 com `USING(true)` |
| Superadmin bypass | **Production-Ready** | Policies explícitas em migration 017 |
| Franqueador cross-tenant | **Planned** | Role definido, zero RLS policies |
| Tenant data cleanup | **Production-Ready** | CASCADE DELETE configurado |
| Cross-tenant messaging guard | **Planned** | Sem validação em mensagens |

---

## 4. Billing e Modelo de Negócio

| Domínio | Maturidade | Evidência |
|---------|-----------|-----------|
| Domain types (Plan, Subscription, Invoice) | **Production-Ready** | Enums, interfaces, lifecycle states definidos |
| Database schema (plans, subscriptions, invoices) | **Production-Ready** | Migration 008, FK constraints, RLS |
| Gateway factory (Stripe/Asaas/Mock) | **Beta** | Implementado e correto, nunca chamado pelos services |
| Webhook endpoint | **Beta** | Recebe e valida signatures, handlers são stubs |
| Subscription CRUD | **Mock-Backed** | Service existe, retorna dados fictícios |
| Invoice generation | **Mock-Backed** | Mock com 300 invoices, nenhuma real |
| Payment processing | **Planned** | Webhook handlers logam mas não processam |
| Billing cycle automation | **Planned** | Service existe, lança "Not implemented" |
| Dunning / Grace period | **Planned** | Config definida, não enforçada |
| Plan enforcement (feature gates) | **Mock-Backed** | Limites hardcoded funcionam no mock |
| B2C tuition (Mensalidade) | **Mock-Backed** | Service + UI funcionais com dados fake |

---

## 5. Módulos por Persona

### 5.1 Admin Local

| Feature | Maturidade | Notas |
|---------|-----------|-------|
| Dashboard (Painel do Dia) | **Mock-Backed** | 6 services, UI completa, dados fake |
| Aula experimental | **Mock-Backed** | Funnel, status, gestão |
| Inadimplência | **Mock-Backed** | Devedores, WhatsApp, contato |
| Estoque | **Mock-Backed** | Produtos, movimentações, alertas |
| Contratos | **Mock-Backed** | Templates, geração, preview |
| Relatório professores | **Mock-Backed** | Cards, analytics, charts |
| **Completude: 100%** | | 6/6 páginas, 6/6 services |

### 5.2 Super Admin

| Feature | Maturidade | Notas |
|---------|-----------|-------|
| Mission Control dashboard | **Mock-Backed** | KPIs, MRR, alertas |
| Pipeline | **Mock-Backed** | Leads, stages, histórico |
| Health Score | **Mock-Backed** | Service existe, **página faltando** |
| Receita / Revenue | **Mock-Backed** | Charts, cohorts, projeções |
| Impersonation | **Mock-Backed** | Service existe, **página faltando** |
| Comunicação massa | **Mock-Backed** | Broadcasts, templates |
| Feature flags | **Mock-Backed** | Flags, regras, usage stats |
| Analytics | **Mock-Backed** | Feature ranking, engajamento |
| **Completude: 75%** | | 6/8 páginas, 8/8 services |

### 5.3 Professor

| Feature | Maturidade | Notas |
|---------|-----------|-------|
| Modo aula (turma ativa) | **Mock-Backed** | Presença, alertas, timer |
| Diário de aula | **Mock-Backed** | CRUD completo |
| Avaliação técnica | **Mock-Backed** | Critérios, radar chart, evolução |
| Plano de aula | **Mock-Backed** | Semana, templates, notas |
| Aluno 360 | **Mock-Backed** | Visão completa + notas |
| Alertas | **Mock-Backed** | Contagem, marcação, filtros |
| Relatórios | **Mock-Backed** | Métricas, export PDF |
| Banco de técnicas | **Mock-Backed** | CRUD, busca, filtros |
| **Completude: 100%** | | 8/8 páginas, 8/8 services |

### 5.4 Aluno Adulto

| Feature | Maturidade | Notas |
|---------|-----------|-------|
| Dashboard | **Mock-Backed** | Streak, faixa, agenda, heatmap |
| Perfil guerreiro | **Mock-Backed** | Timeline, evolução, financeiro |
| Metas pessoais | **Mock-Backed** | Goals, diary entries |
| Meu progresso | **Mock-Backed** | Analytics, radar charts |
| Indicações | **Mock-Backed** | Service existe, **página faltando** |
| Torneios | **Mock-Backed** | Inscrição, chaves |
| Check-in | **Beta** | FAB funciona, QR decoder ausente |
| Comunidade / Feed | **Mock-Backed** | Posts, likes, comments |
| **Completude: 87%** | | 7/8 páginas, 8/8 services |

### 5.5 Responsável

| Feature | Maturidade | Notas |
|---------|-----------|-------|
| Dashboard | **Mock-Backed** | Dependentes, overview |
| Agenda familiar | **Mock-Backed** | Calendário familiar |
| Pagamentos | **Mock-Backed** | Faturas, checkout |
| Mensagens | **Mock-Backed** | Conversas com academia |
| Jornada do dependente | **Planned** | **Sem página e sem service** |
| Autorizações | **Planned** | **Sem página e sem service** |
| Relatórios mensais | **Planned** | Parcial via agenda |
| Notificações | **Planned** | **Sem página e sem service** |
| **Completude: 50%** | | 4/8 páginas, 5/8 services |

### 5.6 Teen

| Feature | Maturidade | Notas |
|---------|-----------|-------|
| Dashboard | **Mock-Backed** | XP, ranking, próximo nível |
| Perfil | **Mock-Backed** | TeenProfileDTO |
| Conquistas | **Mock-Backed** | Usa service genérico |
| Conteúdo | **Mock-Backed** | Usa streaming genérico |
| Ranking | **Mock-Backed** | Inline no dashboard DTO |
| Desafios | **Planned** | **Sem página e sem service dedicado** |
| Season pass | **Planned** | Service genérico seasons.service existe |
| Squad / social | **Planned** | **Sem página e sem service** |
| **Completude: 62%** | | 5/8 páginas, ~4/8 services |

### 5.7 Kids

| Feature | Maturidade | Notas |
|---------|-----------|-------|
| Dashboard | **Mock-Backed** | Estrelas, faixa, figurinhas (DTOs inline) |
| Conquistas | **Mock-Backed** | Grid, filtros, progresso |
| Conteúdo / Aventuras | **Mock-Backed** | Usa streaming genérico |
| Figurinhas | **Planned** | DTO parcial no dashboard, **sem página** |
| Recompensas | **Planned** | **Sem página e sem service** |
| Minha faixa | **Planned** | DTO parcial, **sem página** |
| Personalização | **Planned** | **Sem página e sem service** |
| Mini-games | **Planned** | **Sem página e sem service** |
| **Completude: 37%** | | 3/8 páginas, 1/8 services |

### 5.8 Recepcionista

| Feature | Maturidade | Notas |
|---------|-----------|-------|
| Dashboard | **Planned** | Role existe no enum, zero código |
| Cadastro rápido | **Planned** | — |
| Atendimento | **Planned** | — |
| Caixa | **Planned** | — |
| Experimentais | **Planned** | — |
| Mensagens | **Planned** | — |
| Acesso | **Planned** | — |
| **Completude: 0%** | | 0/7 páginas, 0/7 services |

### 5.9 Franqueador

| Feature | Maturidade | Notas |
|---------|-----------|-------|
| Dashboard rede | **Mock-Backed** | KPIs, ranking, revenue |
| Royalties | **Mock-Backed** | Tracking, cobrança |
| Padrões / Compliance | **Mock-Backed** | Standards, verificação |
| Expansão | **Mock-Backed** | Pipeline kanban, onboarding |
| Comunicação | **Mock-Backed** | Broadcasts, treinamentos |
| Unidades | **Planned** | **Sem página e sem service** |
| Currículo rede | **Planned** | **Sem página e sem service** |
| **Completude: 71%** | | 5/7 páginas, 5/7 services |

---

## 6. Observabilidade e Operação

| Domínio | Maturidade | Evidência |
|---------|-----------|-----------|
| Structured logger | **Beta** | JSON format, 4 níveis, sem shipping |
| Sentry (error tracking) | **Beta** | Configurado, `captureException()` não chamado |
| PostHog (analytics) | **Beta** | Integrado, eventos definidos, localStorage |
| Web vitals | **Planned** | Interface + console.log + TODO comment |
| Health check endpoint | **Beta** | `/api/health` — app + DB connectivity |
| Correlation IDs | **Planned** | Inexistente |
| APM / Distributed tracing | **Planned** | Nenhuma ferramenta |
| Alertas / Thresholds | **Planned** | Nenhuma configuração |
| Business metrics | **Planned** | Eventos PostHog definidos, não verificados |

---

## 7. Segurança

| Domínio | Maturidade | Evidência |
|---------|-----------|-----------|
| HTTPS / HSTS | **Production-Ready** | Header configurado, 1 ano |
| Security headers | **Beta** | X-Frame, X-Content-Type, mas CSP permissivo |
| Token security | **Production-Ready** | Supabase SSR httpOnly (modo real) |
| RLS enforcement | **Beta** | 100% cobertura, 6 policies vulneráveis |
| Rate limiting | **Planned** | `rate-limit.ts` mencionado, não verificado em APIs |
| LGPD compliance | **Planned** | `lgpd.service.ts` mencionado, não auditado |
| Threat model | **Planned** | Nenhum documento |
| Data classification | **Planned** | Nenhum documento |
| Audit logging | **Planned** | Nenhuma implementação |
| Incident response | **Planned** | SECURITY.md menciona "24h ack" sem processo |

---

## 8. Comunicação e Notificações

| Domínio | Maturidade | Evidência |
|---------|-----------|-----------|
| Email templates | **Production-Ready** | 8 templates, i18n, base layout |
| Email sending (Resend) | **Beta** | Service configurado, não testado end-to-end |
| Push notification config | **Beta** | Capacitor + APNs/FCM/VAPID keys configurados |
| Push notification delivery | **Planned** | Hub desenhado, channel implementations stubbed |
| WhatsApp | **Planned** | Service file existe, sem integração real |
| SMS | **Planned** | Service file existe, sem integração real |
| In-app messaging | **Mock-Backed** | Service existe, sem UI de chat |
| Realtime (Supabase) | **Beta** | Subscriptions configuradas, não usadas em componentes |

---

## 9. Mobile / PWA

| Domínio | Maturidade | Evidência |
|---------|-----------|-----------|
| PWA manifest | **Production-Ready** | Standalone, icons, theme |
| Service worker | **Beta** | Implementado, não registrado |
| Capacitor config | **Beta** | iOS/Android configs prontos |
| Camera (QR) | **Beta** | Camera funciona, decoder ausente |
| Haptics | **Production-Ready** | Integrado com Capacitor |
| Offline support | **Planned** | Nenhuma implementação |
| App Store ready | **Planned** | Build scripts existem, não testados |

---

## 10. Resumo Visual

```
                    Production   Beta   Mock-Backed   Planned
                    ──────────   ────   ───────────   ───────
Infraestrutura      ████████░░   ██░░
Auth/Identity       ████░░░░░░   ████░░             ████░░░░
Multi-Tenancy       ██████░░░░   ████░░             ██░░░░░░
Billing             ██░░░░░░░░   ██░░   ████░░░░░░  ████████
Admin Local                             ████████████
Super Admin                             ██████████  ██░░░░░░
Professor                               ████████████
Aluno Adulto                    ██░░    ██████████  ██░░░░░░
Responsável                             ████████░░  ████████
Teen                                    ██████░░░░  ██████░░
Kids                                    ████░░░░░░  ████████
Recepcionista                                       ████████
Franqueador                             ██████████  ████░░░░
Observabilidade                 ████░░              ████████
Segurança           ████░░░░░░  ████░░              ████████
Comunicação         ██░░░░░░░░  ████░░  ██░░░░░░░░  ████████
Mobile/PWA          ██░░░░░░░░  ████░░              ████░░░░
```

---

## 11. Top 5 Insights para CTO

1. **A engenharia é real.** TypeScript strict, CI/CD funcional, 130+ service contracts tipados, schema de banco com RLS. Isso não é protótipo — é base enterprise com execução incompleta.

2. **O produto roda inteiro em mock.** Apesar da base sólida, `NEXT_PUBLIC_USE_MOCK=true` em produção significa zero funcionalidade real. O gap entre infraestrutura e operação é o problema #1.

3. **Segurança tem holes críticos mas corrigíveis.** 6 RLS policies com `USING(true)`, zero RBAC em APIs. Fixes são cirúrgicos (1-2 dias de trabalho), não reescritas.

4. **Billing é o maior gap de negócio.** Gateway scaffolding existe (Stripe + Asaas), mas nenhum pagamento é processado. Sem billing, não há SaaS.

5. **O projeto precisa de foco, não de mais features.** 9 personas, 60+ páginas, 130+ services — mas 0 funcionam em produção. Consolidar o core (Admin + Professor + Aluno + Auth + Billing) e provar operação real vale mais que completar Kids ou Recepcionista.

---

*Documento gerado como parte da Fase 0 — Enterprise Elevation Program*

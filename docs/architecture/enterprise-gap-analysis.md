# BlackBelt v2 — Enterprise Gap Analysis

> Análise detalhada das lacunas entre o estado atual e o nível enterprise.
> Data: 2026-03-17 | Fase 0 — Enterprise Elevation Program

---

## Metodologia

Cada gap é classificado por:
- **Severidade:** CRITICAL / HIGH / MEDIUM / LOW
- **Impacto enterprise:** O que um CTO/arquiteto corporativo veria
- **Esforço estimado:** T-shirt sizing (S/M/L/XL)
- **Prioridade:** P0 (bloqueia go-live) / P1 (bloqueia enterprise) / P2 (melhoria) / P3 (nice-to-have)

---

## GAP-01: Produção roda em mock mode

| Atributo | Valor |
|----------|-------|
| Severidade | **CRITICAL** |
| Prioridade | **P0** |
| Esforço | **M** |
| Localização | `.env.production` → `NEXT_PUBLIC_USE_MOCK=true` |

**Situação:** Todos os 130+ services retornam dados hardcoded em produção. O Vercel deployment serve uma aplicação com dados fictícios.

**Impacto enterprise:** O produto não funciona. Não há nada para demonstrar a um prospect. Todo fluxo é fake data.

**Resolução:**
1. Flipar `NEXT_PUBLIC_USE_MOCK=false` em produção
2. Garantir que auth.service.ts, admin.service.ts e turmas.service.ts (que já têm backend real) funcionem
3. Priorizar services do core para implementação real
4. Manter mock como fallback para services ainda não migrados

---

## GAP-02: 6 tabelas com data leakage cross-tenant

| Atributo | Valor |
|----------|-------|
| Severidade | **CRITICAL** |
| Prioridade | **P0** |
| Esforço | **S** |
| Localização | `supabase/migrations/011_seed_tables.sql` |

**Situação:** As seguintes tabelas têm `FOR SELECT USING (true)`, permitindo que qualquer usuário autenticado leia dados de qualquer academia:

| Tabela | Dados expostos |
|--------|---------------|
| `class_notes` | Observações de professores sobre alunos |
| `feed_likes` | Atividade social de alunos |
| `feed_comments` | Comentários de alunos e professores |
| `student_xp` | Rankings e pontuação de alunos |
| `challenge_progress` | Progresso em desafios |
| `event_registrations` | Agendas e participação em eventos |

**Impacto enterprise:** Violação de LGPD/GDPR. Dados de menores expostos. Incompatível com qualquer due diligence de segurança.

**Resolução:** Migration 018 com policies que usam `is_member_of(academy_id)` para cada tabela.

---

## GAP-03: Zero RBAC enforcement em API routes

| Atributo | Valor |
|----------|-------|
| Severidade | **CRITICAL** |
| Prioridade | **P0** |
| Esforço | **L** |
| Localização | `app/api/v1/*` |

**Situação:** API routes aceitam requests apenas com `X-API-Key` header. Não verificam:
- Quem é o usuário
- Qual seu role
- A qual academia pertence
- Se tem permissão para a ação

`lib/domain/rules.ts` define 9 regras de negócio, mas nenhuma é chamada em endpoints.

**Impacto enterprise:** Qualquer pessoa com a API key pode ler/escrever qualquer dado. Sem audit trail. Sem authorization. É um endpoint público.

**Resolução:**
1. Middleware de API que verifica Supabase JWT
2. Extrair `user_id`, `role`, `academy_id` do JWT
3. Chamar `rules.ts` em cada endpoint que modifica dados
4. Usar Supabase client com contexto do usuário (RLS enforçado)

---

## GAP-04: Billing não funciona

| Atributo | Valor |
|----------|-------|
| Severidade | **CRITICAL** |
| Prioridade | **P1** |
| Esforço | **XL** |
| Localização | `lib/api/billing.service.ts`, `lib/api/webhook-processor.ts` |

**Situação:**
- `billing.service.ts`: 11 funções que lançam `'Not implemented'`
- `webhook-processor.ts`: handlers que apenas logam
- Gateway factory (Stripe/Asaas) está pronto mas nunca é chamado
- Subscription lifecycle definido em tipos mas não implementado
- Nenhuma invoice é gerada em produção
- Nenhum pagamento é processado
- Idempotência de webhook usa `Set` em memória (perde estado no restart)

**Impacto enterprise:** Sem billing, não há SaaS. É um software free. Não há modelo de negócio funcional.

**Resolução:**
1. Implementar 7+ API routes de billing
2. Conectar services ao gateway
3. Implementar webhook handlers reais
4. Mover idempotência para banco de dados
5. Implementar billing cycle automation (cron)
6. Conectar plan enforcement ao auth/access layer

---

## GAP-05: Test coverage < 5%

| Atributo | Valor |
|----------|-------|
| Severidade | **HIGH** |
| Prioridade | **P1** |
| Esforço | **L** |
| Localização | `tests/`, `vitest.config.ts` |

**Situação:**
- 13 arquivos de teste, ~109 test cases
- 130+ services, ~190 arquivos no total
- Todos os testes rodam em mock mode
- Zero testes de integração com Supabase real
- E2E (Playwright) existe mas não roda no CI
- Nenhum coverage threshold configurado

**Impacto enterprise:** Impossível garantir que mudanças não quebram funcionalidade. Regressions passam despercebidas. Nenhum SaaS sério opera com <5% coverage.

**Resolução:**
1. Configurar coverage no vitest (provider: v8, threshold: 60%)
2. Adicionar testes de integração para tenant isolation
3. Adicionar Playwright ao CI pipeline
4. Priorizar testes para: auth, billing, attendance, tenant boundaries

---

## GAP-06: Roadmaps conflitantes

| Atributo | Valor |
|----------|-------|
| Severidade | **HIGH** |
| Prioridade | **P1** |
| Esforço | **S** |
| Localização | `BLACKBELT_V2_ROADMAP.md`, `docs/ARCHITECTURE_V3.md` |

**Situação:**
- ROADMAP.md: 10 fases, 52 prompts
- ARCHITECTURE_V3.md: 30 fases, 152 prompts
- Git history: 100+ prompts mergeados
- 9 arquivos NUCLEAR uncommitted na raiz

**Impacto enterprise:** Confusão de escopo. Prospect pergunta "o que está pronto?" e não há resposta clara. Três narrativas diferentes sobre o mesmo projeto.

**Resolução:**
1. Consolidar em UM roadmap canônico
2. Classificar cada feature como: shipped / beta / planned
3. Remover documentos conflitantes
4. Commitar ou deletar arquivos NUCLEAR da raiz

---

## GAP-07: Security docs aspiracionais

| Atributo | Valor |
|----------|-------|
| Severidade | **HIGH** |
| Prioridade | **P1** |
| Esforço | **M** |
| Localização | `docs/SECURITY.md` |

**Situação:**
- SECURITY.md lista features como se estivessem implementadas ("tokens em memória", "RLS policies enforce tenant isolation", "rate limiting via lib/security/rate-limit.ts")
- Nenhuma verificação de que essas features estão ativas e testadas
- Sem audit, sem pentest, sem compliance
- CSP permite `unsafe-eval` e `unsafe-inline`
- Nenhum `Sentry.captureException()` no código apesar de Sentry estar configurado

**Impacto enterprise:** Security team de qualquer prospect vai rejeitar. Documento lido como checklist aspiracional, não postura verificada.

**Resolução:**
1. Reescrever SECURITY.md separando "implementado e testado" de "planejado"
2. Apertar CSP (remover unsafe-eval em produção)
3. Adicionar Sentry.captureException() no handleServiceError()
4. Planejar security assessment formal

---

## GAP-08: Módulo Recepcionista inexistente

| Atributo | Valor |
|----------|-------|
| Severidade | **MEDIUM** |
| Prioridade | **P2** |
| Esforço | **XL** |
| Localização | `app/(recepcao)/` — não existe |

**Situação:**
- Role `recepcao` definido no enum e middleware
- Spec detalhado existe (`BLACKBELT_RECEPCIONISTA_NUCLEAR.md`)
- Zero implementação: 0 páginas, 0 services, 0 mocks, 0 componentes
- Nem mesmo user mock no auth.mock.ts

**Impacto enterprise:** Recepção é função crítica em academia real. Módulo fantasma no roadmap.

**Resolução:** Implementar conforme spec ou remover do escopo oficial e classificar como "expansão futura".

---

## GAP-09: Observabilidade é console.log

| Atributo | Valor |
|----------|-------|
| Severidade | **MEDIUM** |
| Prioridade | **P2** |
| Esforço | **M** |
| Localização | `lib/monitoring/` |

**Situação:**
- Logger estruturado existe — saída é console.log (sem shipping)
- Web Vitals: interface definida, implementação é TODO
- Sentry: configurado mas nunca chamado no código
- Zero correlation IDs
- Zero distributed tracing
- Zero alertas
- Health check endpoint existe mas é básico (só testa conectividade Supabase)

**Impacto enterprise:** Impossível diagnosticar problemas em produção. Sem métricas de negócio. Sem visibilidade operacional.

**Resolução:**
1. Adicionar Sentry.captureException() em handleServiceError()
2. Implementar correlation IDs no middleware
3. Configurar web vitals reporting real
4. Expandir health check com external service status

---

## GAP-10: Módulos Kids e Teen incompletos

| Atributo | Valor |
|----------|-------|
| Severidade | **MEDIUM** |
| Prioridade | **P2** |
| Esforço | **L** |
| Localização | `app/(kids)/`, `app/(teen)/` |

**Situação:**
- **Kids:** 3/8 páginas, 1/8 services (37% completo)
- **Teen:** 5/8 páginas, 4/8 services com DTOs parciais (62% completo)
- Ambos usam services genéricos (conquistas, streaming) ao invés de dedicados
- Faltam: figurinhas, recompensas, mini-games (kids); desafios, season pass, squad (teen)

**Impacto enterprise:** Se esses módulos são parte do core, estão incompletos. Se são expansão, devem ser classificados como tal.

---

## GAP-11: Responsável parcialmente implementado

| Atributo | Valor |
|----------|-------|
| Severidade | **MEDIUM** |
| Prioridade | **P2** |
| Esforço | **M** |
| Localização | `app/(parent)/` |

**Situação:**
- 4/8 páginas implementadas
- 5/8 services implementados
- Faltam: jornada do dependente, autorizações/controle parental, relatórios dedicados, notificações

**Impacto enterprise:** Responsável é stakeholder crítico (paga a mensalidade). Módulo incompleto afeta retenção.

---

## GAP-12: Franqueador e Super Admin com gaps

| Atributo | Valor |
|----------|-------|
| Severidade | **LOW** |
| Prioridade | **P2** |
| Esforço | **M** |
| Localização | `app/(franqueador)/`, `app/(superadmin)/` |

**Situação:**
- **Super Admin:** 6/8 páginas (faltam: health score page, impersonation page)
- **Franqueador:** 5/7 páginas (faltam: unidades, currículo rede)
- Todos os services existem — apenas UI faltando
- Franqueador não tem RLS policies dedicadas

---

## GAP-13: Service worker não registrado

| Atributo | Valor |
|----------|-------|
| Severidade | **LOW** |
| Prioridade | **P3** |
| Esforço | **S** |
| Localização | `public/sw.js`, `app/layout.tsx` |

**Situação:** Service worker implementado com caching strategy, mas nunca registrado no layout da aplicação. PWA é "instalável" mas não funciona offline.

---

## GAP-14: QR code decoder não implementado

| Atributo | Valor |
|----------|-------|
| Severidade | **LOW** |
| Prioridade | **P3** |
| Esforço | **S** |
| Localização | `components/checkin/QRScanner.tsx` |

**Situação:** Camera funciona (Capacitor + MediaStream fallback), mas não há biblioteca de decoding (jsQR ausente). Scanner é visual placeholder.

---

## GAP-15: Dependências desatualizadas

| Atributo | Valor |
|----------|-------|
| Severidade | **LOW** |
| Prioridade | **P3** |
| Esforço | **M** |

**Situação:**
- Next.js 14 (atual: 16)
- React 18 (atual: 19)
- Tailwind 3 (atual: 4)
- ESLint 8 (atual: 10)

**Impacto:** Não é bloqueante, mas cria débito técnico crescente.

---

## Matriz de Priorização

### P0 — Bloqueia Go-Live (antes de qualquer usuário real)

| Gap | Esforço | Impacto |
|-----|---------|---------|
| GAP-01: Mock mode em produção | M | Crítico |
| GAP-02: Data leakage cross-tenant | S | Crítico |
| GAP-03: API routes sem auth | L | Crítico |

### P1 — Bloqueia Percepção Enterprise (antes de demonstrar)

| Gap | Esforço | Impacto |
|-----|---------|---------|
| GAP-04: Billing não funciona | XL | Crítico |
| GAP-05: Test coverage < 5% | L | Alto |
| GAP-06: Roadmaps conflitantes | S | Alto |
| GAP-07: Security docs aspiracionais | M | Alto |

### P2 — Melhoria de Produto (próximos 30 dias)

| Gap | Esforço | Impacto |
|-----|---------|---------|
| GAP-08: Recepcionista inexistente | XL | Médio |
| GAP-09: Observabilidade | M | Médio |
| GAP-10: Kids/Teen incompletos | L | Médio |
| GAP-11: Responsável parcial | M | Médio |
| GAP-12: Franqueador/SuperAdmin gaps | M | Baixo |

### P3 — Nice-to-Have

| Gap | Esforço | Impacto |
|-----|---------|---------|
| GAP-13: Service worker | S | Baixo |
| GAP-14: QR decoder | S | Baixo |
| GAP-15: Deps desatualizadas | M | Baixo |

---

## Conclusão

O BlackBelt v2 tem **3 gaps P0** que impedem go-live e **4 gaps P1** que impedem posicionamento enterprise.

A boa notícia: os gaps P0 são de esforço S a L — são correções cirúrgicas, não reescritas. O gap mais pesado (billing, P1) é o único que requer trabalho XL.

A base arquitetural está correta. O trabalho é de **blindagem e prova**, não de reconstrução.

---

*Documento gerado como parte da Fase 0 — Enterprise Elevation Program*
*Próximo: maturity-matrix.md*

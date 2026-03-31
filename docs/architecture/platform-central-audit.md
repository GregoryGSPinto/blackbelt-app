# Central da Plataforma — Auditoria, Arquitetura e Plano

## Escopo auditado
- Super Admin: [`app/(superadmin)/superadmin`](/Users/user_pc/Projetos/black_belt_v2/app/(superadmin)/superadmin)
- Telemetria cliente: [`lib/telemetry`](/Users/user_pc/Projetos/black_belt_v2/lib/telemetry)
- Rota de ingestão: [`app/api/telemetry/route.ts`](/Users/user_pc/Projetos/black_belt_v2/app/api/telemetry/route.ts)
- Suporte/feedback existentes: [`lib/api/feedback.service.ts`](/Users/user_pc/Projetos/black_belt_v2/lib/api/feedback.service.ts), [`lib/api/beta-feedback.service.ts`](/Users/user_pc/Projetos/black_belt_v2/lib/api/beta-feedback.service.ts), [`lib/api/suporte.service.ts`](/Users/user_pc/Projetos/black_belt_v2/lib/api/suporte.service.ts)
- Schema/migrations/seed: [`supabase/migrations`](/Users/user_pc/Projetos/black_belt_v2/supabase/migrations), [`supabase/seed.sql`](/Users/user_pc/Projetos/black_belt_v2/supabase/seed.sql)

## Estado atual encontrado

### O que já existia e estava bom
- Navegação e shell do Super Admin já estavam maduros e reaproveitáveis.
- Havia base real de Supabase, RLS multi-tenant e papel `superadmin`.
- Existiam sementes de domínio e estrutura de academias/memberships úteis.
- Já existiam sinais de observabilidade: `telemetry`, `monitoring`, `feedback`, `beta_feedback`, `support_tickets`.

### O que existia, mas precisava ajuste
- A página antiga de suporte era visualmente rica, porém dependia de contratos quebrados.
- O coletor cliente e a rota `/api/telemetry` usavam payloads incompatíveis entre si.
- Serviços de suporte/observabilidade apontavam para views/tabelas não encontradas no schema atual.
- Havia duplicidade e fragmentação entre `user_feedback`, `beta_feedback`, `support_tickets`, `telemetry_sessions`, `telemetry_events`.
- Parte do health/security dependia de `platform_settings` ou mocks em vez de snapshots operacionais.

### O que faltava criar
- Fundação única para Central da Plataforma com entidades próprias.
- Snapshots de saúde, risco e IA auditáveis.
- Agregações sustentáveis para overview, erros/performance e dispositivos/layout.
- Pipeline honesto de ingestão para erro, performance, viewport e device analytics.
- Seed coerente multi-tenant com volume suficiente para as 5 abas.

### O que pode ser reaproveitado
- Shell e rota `/superadmin/suporte` como ponto de entrada.
- Cookies e contexto de auth para `academy_id` e papel ativo.
- Infra de Supabase, migrations, service role e padrão de serviços existentes.
- Componentes de UI base (`Button`, `Modal`, `Skeleton`) e gráficos com Recharts.

### O que não podia continuar fake ou mock dominante
- Views fantasmas como `active_sessions`, `session_history`, `performance_overview`, `device_breakdown`.
- Health overview em `platform_settings` como fonte principal.
- Painéis ligados a tabelas antigas simples demais para drill-down enterprise.
- IA exibida sem base real de provider/modelo.

## Arquitetura final recomendada

### Backbone de dados
- `app_telemetry_sessions`
- `app_telemetry_events`
- `app_error_events`
- `app_performance_metrics`
- `app_device_snapshots`
- `support_feedback_items`
- `support_feedback_comments`
- `support_feedback_assignments`
- `support_feedback_tags`
- `support_feedback_item_tags`
- `platform_incidents`
- `platform_health_snapshots`
- `platform_risk_snapshots`
- `model_observability_snapshots`

### Enums
- `support_feedback_category`
- `platform_severity`
- `platform_status`
- `platform_health_component_type`
- `platform_event_origin`
- `platform_incident_type`
- `platform_device_type`
- `platform_signal_status`

### Views agregadas
- `platform_overview_daily_v`
- `platform_error_route_metrics_v`
- `platform_performance_route_metrics_v`
- `platform_device_layout_metrics_v`
- `platform_health_risk_latest_v`

### Contratos de leitura do Super Admin
- Snapshot único entregue por [`app/api/superadmin/platform-central/route.ts`](/Users/user_pc/Projetos/black_belt_v2/app/api/superadmin/platform-central/route.ts)
- Loader/agregador servidor em [`lib/server/platform-central.ts`](/Users/user_pc/Projetos/black_belt_v2/lib/server/platform-central.ts)
- Serviço cliente em [`lib/api/platform-central.service.ts`](/Users/user_pc/Projetos/black_belt_v2/lib/api/platform-central.service.ts)

## Abas e fontes de dados

### 1. Visão Geral
- Fonte: `platform_overview_daily_v`, `platform_incidents`, `platform_health_risk_latest_v`
- KPIs: acessos, usuários ativos, tenants ativos, taxa de erro, latência média, incidentes críticos

### 2. Suporte & Feedback
- Fonte: `support_feedback_*`
- Operações: filtros, kanban, tabela densa, detalhe, comentário interno, mudança de status, atribuição

### 3. Erros & Performance
- Fonte: `app_error_events`, `app_performance_metrics`, views agregadas por rota/device/release
- Leituras: top erros, auth failures, timeouts, slow routes, regressão por release

### 4. Dispositivos & Layout
- Fonte: `app_device_snapshots`, `app_performance_metrics`, `app_error_events`
- Leituras: device mix, resolução, breakpoints, risco visual/layout, rota problemática por viewport

### 5. Saúde, Segurança & IA
- Fonte: `platform_health_snapshots`, `platform_risk_snapshots`, `model_observability_snapshots`
- Leituras: componentes críticos, score de risco, sinais detectáveis, IA ativa ou `não configurado`

## Eventos de telemetria recomendados
- `route_visited`
- `screen_viewed`
- `screen_left`
- `performance_metric`
- `js_error`
- `api_error`
- `auth_failure`
- `timeout`
- `feedback_submitted`
- `complaint_submitted`
- `suggestion_submitted`

## Gráficos recomendados
- Área: acessos x erros x latência
- Barras: rotas lentas
- Barras: breakpoints mais usados
- Pizza: distribuição por dispositivo
- Tabelas densas: fila de suporte, regressão por release, rotas problemáticas

## Filtros recomendados
- Período
- Tenant
- Categoria
- Status
- Severidade
- Release
- Rota
- Device type
- Breakpoint

## Drill-down recomendado
- Aba 1: card -> rota/tenant crítico
- Aba 2: item -> modal com histórico, atribuição, status e notas internas
- Aba 3: rota -> release/device impactado
- Aba 4: resolução/breakpoint -> rotas com risco
- Aba 5: tenant -> componentes de health + score de risco

## Implementação entregue nesta fase
- Migration base: [`093_platform_central_foundation.sql`](/Users/user_pc/Projetos/black_belt_v2/supabase/migrations/093_platform_central_foundation.sql)
- Seed coerente local: [`supabase/seed.sql`](/Users/user_pc/Projetos/black_belt_v2/supabase/seed.sql)
- Ingestão real de telemetria: [`app/api/telemetry/route.ts`](/Users/user_pc/Projetos/black_belt_v2/app/api/telemetry/route.ts)
- Coletor cliente alinhado: [`lib/telemetry/collector.ts`](/Users/user_pc/Projetos/black_belt_v2/lib/telemetry/collector.ts)
- Central UI 5 abas: [`app/(superadmin)/superadmin/suporte/page.tsx`](/Users/user_pc/Projetos/black_belt_v2/app/(superadmin)/superadmin/suporte/page.tsx)
- Thresholds e scoring: [`lib/platform/thresholds.ts`](/Users/user_pc/Projetos/black_belt_v2/lib/platform/thresholds.ts), [`lib/platform/scoring.ts`](/Users/user_pc/Projetos/black_belt_v2/lib/platform/scoring.ts)

## Plano de execução por etapas
1. Consolidar schema, enums, índices, views e snapshots.
2. Ligar ingestão real do cliente ao schema novo.
3. Fazer dual-write de feedback para abastecer a Central sem quebrar legado.
4. Expor snapshot único do Super Admin.
5. Substituir UI antiga quebrada pela Central com 5 abas.
6. Validar typecheck, testes, build e seed.

## Backlog técnico executável
- Regenerar `database.types.ts` após aplicar migration no ambiente Supabase.
- Migrar fluxos legados de `support_tickets` para `support_feedback_items` se o produto decidir unificar totalmente.
- Adicionar scans reais de dependências para enriquecer segurança detectável.
- Adicionar snapshot real de deploy/release se houver fonte operacional integrada.
- Conectar IA/model observability somente quando houver provider ativo.

## Gaps honestos
- Dependência de integração externa para vulnerabilidades reais de dependências.
- Dependência de fonte operacional externa para `último deploy` e release provenance completos.
- IA permanece `não configurado` até existir uso real no projeto.

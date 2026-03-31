# Central da Plataforma — Fechamento Técnico

## Implementado
- Migration base da Central da Plataforma com schema real, enums, índices, views e RLS.
- Seed coerente local para cenários enterprise com multi-tenant, 20k acessos/mês e incidentes/dispositivos.
- Ingestão real de telemetria em sessão, eventos, erros, performance e snapshots de dispositivo.
- Dual-write de feedback para abastecer a Central sem quebrar fluxos legados.
- Endpoint agregado do Super Admin para leitura operacional.
- UI nova em `/superadmin/suporte` com 5 abas:
  - Visão Geral
  - Suporte & Feedback
  - Erros & Performance
  - Dispositivos & Layout
  - Saúde, Segurança & IA

## Tabelas criadas/ajustadas
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

## Services e contratos
- [`lib/server/platform-central.ts`](/Users/user_pc/Projetos/black_belt_v2/lib/server/platform-central.ts)
- [`lib/api/platform-central.service.ts`](/Users/user_pc/Projetos/black_belt_v2/lib/api/platform-central.service.ts)
- [`app/api/superadmin/platform-central/route.ts`](/Users/user_pc/Projetos/black_belt_v2/app/api/superadmin/platform-central/route.ts)
- [`app/api/telemetry/route.ts`](/Users/user_pc/Projetos/black_belt_v2/app/api/telemetry/route.ts)

## Instrumentação criada
- `route_visited`
- `screen_viewed`
- `screen_left`
- `performance_metric`
- `js_error`
- `api_error`
- `auth_failure`
- `timeout`

## Validação executada
- `pnpm typecheck`
  - Resultado: ok
- `pnpm test tests/services/platform-central-scoring.test.ts`
  - Resultado: 1 arquivo, 4 testes, todos ok
- `pnpm build`
  - Resultado: ok
  - Observação: warnings legados preexistentes de hooks/img/console fora do escopo da Central permaneceram no build, mas não bloquearam a geração.

## Evidências dos fluxos validados
- Snapshot único do Super Admin disponível em `/api/superadmin/platform-central`.
- Página `/superadmin/suporte` compilada e incluída no build final.
- Drill-down operacional em suporte via modal com:
  - abertura do item
  - mudança de status
  - atribuição para o operador atual
  - nota interna
- Leituras de erros/performance por rota, device e release.
- Leituras de dispositivos, resolução, breakpoint e risco visual/layout.
- Health/risk snapshots e IA com estado honesto `não configurado`.

## Pronto no código
- Schema
- Seed
- ingestão
- agregação
- UI 5 abas
- thresholds e scoring

## Pronto com backend real local de teste
- Telemetria persistida em tabelas novas
- agregações do Super Admin
- suporte/feedback na fila nova
- snapshots de health/risk

## Dependente de integração externa
- vulnerabilidades reais de dependências
- provenance de deploy/último release a partir de CI/CD
- model observability real quando houver provider/modelo ativo

## Gaps restantes
- Regenerar `lib/supabase/database.types.ts` no ambiente Supabase após aplicar a migration.
- Se a decisão de produto for unificação total, migrar completamente o legado de `support_tickets` para `support_feedback_items`.

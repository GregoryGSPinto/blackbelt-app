# Central da Plataforma — Fechamento Operacional

## Escopo desta fase
- Ativação real do backend da Central da Plataforma no projeto Supabase usado pelo app.
- Regeneração dos tipos Supabase a partir do schema ativo.
- Validação real do endpoint agregado e da UI `/superadmin/suporte`.
- Smoke autenticado com backend ativo.
- Publicação final em `main` e novo deploy de produção.

## Migrations aplicadas
- `092_student_financial_profiles.sql`
  - estava pendente no projeto linkado e precisou entrar antes da Central.
- `093_platform_central_foundation.sql`
  - aplicada no projeto `tdplmmodmumryzdosmpv`.
  - ajuste feito na view `platform_overview_daily_v` para corrigir a agregação por dia e evitar erro SQL de coluna não agrupada.
- `094_platform_central_seed_activation.sql`
  - criada nesta fase para materializar no banco linkado o mesmo cenário de seed da Central.
  - motivo: o repositório não possui `supabase/config.toml` configurado para `seed --linked`, então a ativação remota precisava de um caminho não destrutivo e auditável.
  - a migration foi alinhada para usar `owner_id` e perfis reais já existentes no ambiente ativo, sem depender de UUIDs fictícios.

## Seed aplicado no banco ativo
- O seed operacional da Central foi aplicado no mesmo projeto Supabase do app via `094_platform_central_seed_activation.sql`.
- Resultado confirmado no banco:
  - `app_telemetry_events`: `20000`
  - `app_error_events`: `360`
  - `app_performance_metrics`: `1800`
  - `app_device_snapshots`: `800`
  - `support_feedback_items`: `36`
  - `platform_health_snapshots`: `8`
  - `platform_risk_snapshots`: `5`
  - `model_observability_snapshots`: `1`

## Tipos regenerados
- `lib/supabase/database.types.ts`
  - regenerado a partir do projeto ativo `tdplmmodmumryzdosmpv`.

## Arquivos ajustados nesta fase
- [`supabase/migrations/093_platform_central_foundation.sql`](/Users/user_pc/Projetos/black_belt_v2/supabase/migrations/093_platform_central_foundation.sql)
- [`supabase/migrations/094_platform_central_seed_activation.sql`](/Users/user_pc/Projetos/black_belt_v2/supabase/migrations/094_platform_central_seed_activation.sql)
- [`lib/supabase/database.types.ts`](/Users/user_pc/Projetos/black_belt_v2/lib/supabase/database.types.ts)
- [`e2e/tests/11-platform-central.spec.ts`](/Users/user_pc/Projetos/black_belt_v2/e2e/tests/11-platform-central.spec.ts)

## Resultado do endpoint `/api/superadmin/platform-central`
- Validado em execução real do app local com autenticação de superadmin.
- A resposta `GET /api/superadmin/platform-central` retornou `200 OK`.
- Evidências confirmadas na carga:
  - `overview.totalAccesses > 0`
  - `support.metrics.total > 0`
  - `errorsPerformance.totals.errors > 0`
  - `devicesLayout.distribution.length > 0`
  - `healthSecurityAI.latest.length > 0`
  - `healthSecurityAI.ai.status = "not_configured"`
- Consulta direta ao banco também confirmou que as views agregadas estão respondendo:
  - `platform_overview_daily_v`
  - `platform_health_risk_latest_v`

## Resultado da página `/superadmin/suporte`
- Validada ponta a ponta com smoke autenticado.
- Confirmado:
  - carregamento das 5 abas
  - cards e gráficos renderizando
  - filtros de suporte funcionando
  - abertura do drill-down do item
  - atribuição para o operador atual
  - mudança de status para resolvido
  - registro de nota interna
  - aba de IA exibindo estado honesto `Não configurado`

## Testes executados
- `pnpm typecheck`
  - resultado: `ok`
- `pnpm test tests/services/platform-central-scoring.test.ts`
  - resultado: `1 arquivo`, `4 testes`, todos `ok`
- `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3002 pnpm exec playwright test e2e/tests/11-platform-central.spec.ts --project=desktop`
  - resultado: `1 passed`
- `pnpm build`
  - resultado: `ok`
  - observação: warnings legados de hooks/img/console seguiram presentes fora do escopo da Central e não bloquearam o build.

## Resultado do deploy
- Commit publicado em `main`:
  - `5279f041d6e3473eebc58181beac927f037ad170`
- Push concluído para `origin/main`.
- Deploy de produção executado com Vercel CLI.
- URLs geradas:
  - inspect: `https://vercel.com/gregorys-projects-e10ef67b/black_belt_v2/4pqzKsjVts8hb3WjnDfVhqm82daF`
  - production: `https://blackbeltv2-87kxvi20d-gregorys-projects-e10ef67b.vercel.app`
- Validação externa possível nesta sessão:
  - `curl -I` para a URL de produção respondeu `HTTP/2 401`
  - isso confirma que a URL publicada está ativa na Vercel, porém protegida por autenticação/protection layer do ambiente
- Bloqueio externo remanescente:
  - não foi possível validar conteúdo público da produção além do `401`, porque a própria proteção do ambiente bloqueia leitura sem credencial/sessão autorizada

## Pronto no código
- Schema final da Central
- Seed operacional da Central
- Tipos Supabase regenerados
- Endpoint agregado do Super Admin
- UI 5 abas
- Smoke e2e mínimo da rota crítica

## Pronto no banco real/local
- `093` aplicada no projeto linkado
- seed da Central aplicado no projeto linkado
- views e tabelas da Central respondendo com dados reais
- backend lendo o banco ativo, sem mock dominante como fonte principal

## Pronto em produção
- código publicado em `main`
- deploy Vercel disparado
- URL final emitida pela Vercel
- acesso externo confirmado até a camada de proteção (`HTTP/2 401`)

## Dependente de credencial, rede ou infra externa
- execução do push final para `main`
- deploy Vercel desta revisão final
- eventual proteção/autenticação de ambiente na URL pública do Vercel
- qualquer validação externa que dependa de DNS, API da Vercel ou políticas de acesso do ambiente

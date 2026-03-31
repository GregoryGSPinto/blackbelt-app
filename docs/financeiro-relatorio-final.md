# Relatório Final — Financeiro Senior por Aluno

## Migrations criadas e ajustadas

- [`supabase/migrations/092_student_financial_profiles.sql`](/Users/user_pc/Projetos/black_belt_v2/supabase/migrations/092_student_financial_profiles.sql)

## Tabelas e colunas afetadas

- `student_financial_profiles`
  - nova tabela one-to-one por membership/aluno com configuração financeira completa
- `student_financial_alerts`
  - nova tabela para histórico de alertas de meta/check-in e financeiro
- `student_payments`
  - novas colunas: `membership_id`, `payment_method`, `payment_notes`, `paid_amount_cents`, `source`
- funções SQL novas:
  - `can_manage_student_financial`
  - `can_view_student_financial`
  - `count_student_month_checkins`
  - `compute_student_financial_status`
  - `compute_checkin_goal_status`

## Services criados e ajustados

- [`lib/domain/student-financial.ts`](/Users/user_pc/Projetos/black_belt_v2/lib/domain/student-financial.ts)
  - domínio, labels, cores, validação e cálculos puros
- [`lib/api/student-billing.service.ts`](/Users/user_pc/Projetos/black_belt_v2/lib/api/student-billing.service.ts)
  - leitura/atualização de configuração financeira
  - listagem executiva por aluno
  - resumo executivo
  - histórico de cobranças via `student_payments`
  - geração de recorrências
  - registro de alertas com proteção diária
- [`lib/api/financial.service.ts`](/Users/user_pc/Projetos/black_belt_v2/lib/api/financial.service.ts)
  - adaptado para operar sobre a nova base
- [`lib/api/student-management.service.ts`](/Users/user_pc/Projetos/black_belt_v2/lib/api/student-management.service.ts)
  - lista de alunos enriquecida com dados financeiros reais

## Telas alteradas

- [`components/finance/BillingConfigSection.tsx`](/Users/user_pc/Projetos/black_belt_v2/components/finance/BillingConfigSection.tsx)
  - nova seção `Configuração Financeira`
  - UX condicional por vínculo
- [`app/(admin)/admin/financeiro/page.tsx`](/Users/user_pc/Projetos/black_belt_v2/app/(admin)/admin/financeiro/page.tsx)
  - dashboards executivos reais
  - atenção imediata
  - filtros operacionais
  - ações rápidas por aluno
  - histórico financeiro
- [`app/(admin)/admin/alunos/page.tsx`](/Users/user_pc/Projetos/black_belt_v2/app/(admin)/admin/alunos/page.tsx)
  - maior visibilidade financeira na lista de alunos

## Dashboards alterados

- owner/admin/recepção em `/admin/financeiro`
  - receita prevista do mês
  - receita recebida
  - inadimplentes
  - vencem hoje
  - vencem em breve
  - alunos por vínculo
  - GymPass/TotalPass abaixo da meta
  - alertas enviados hoje
  - bloco `Atenção imediata`

## Regras de RLS aplicadas

- gestão completa para owner/admin/recepção via `can_manage_student_financial`
- visualização núcleo para aluno/responsável via `can_view_student_financial`
- `student_financial_profiles` com RLS dedicado
- `student_financial_alerts` com RLS dedicado
- `invoices` ganhou policies complementares para o novo escopo financeiro quando `academy_id/profile_id` estiverem preenchidos

## Fluxos validados

- leitura da configuração financeira
- atualização da configuração financeira
- cálculo de status financeiro
- cálculo de próximo vencimento
- cálculo de meta GymPass/TotalPass
- proteção contra alerta duplicado no mesmo dia
- geração de cobranças recorrentes em `student_payments`
- registro de pagamento manual
- histórico financeiro por aluno

## Seed ajustado

- [`supabase/seed.sql`](/Users/user_pc/Projetos/black_belt_v2/supabase/seed.sql)
  - particular PIX mensal
  - cartão semestral
  - anual atrasado
  - GymPass meta 8
  - TotalPass meta 10
  - bolsista parcial
  - cortesia
  - convênio
  - alerta para responsável

## Testes executados

- `pnpm typecheck`
- `pnpm test tests/domain/student-financial.test.ts tests/services/financeiro.service.test.ts`
- `pnpm build`
  - compilação e lint passaram pelo trecho alterado
  - o processo continuou emitindo warnings preexistentes do projeto e não finalizou retorno dentro da janela observada

## Gaps restantes

- o detalhe completo de `/admin/alunos/[id]` ainda possui partes antigas em mock fora do bloco financeiro novo; o trecho financeiro já está real, mas o restante da página merece refatoração separada
- o job/cron automático de alerta GymPass/TotalPass ainda não foi ligado a uma edge function dedicada; a lógica operacional e o registro já existem no domínio/service e na ação manual
- o build do projeto ainda carrega warnings preexistentes de lint e dependências dinâmicas de Sentry/OpenTelemetry

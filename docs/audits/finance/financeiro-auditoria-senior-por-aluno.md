# Auditoria do Financeiro Senior por Aluno

## Ja existe e esta bom

- `memberships` ja centraliza o vinculo do perfil com a academia e e o melhor ponto para armazenar configuracao financeira por aluno.
- `invoices` ja existe com suporte a `manual_payment`, `payment_method`, `payment_notes`, `paid_at`, `academy_id`, `membership_id`, `profile_id`, `reference_month` e `paid_amount`.
- `attendance` e `checkins` ja existem e permitem calcular presencas/check-ins reais do mes.
- `guardian_links` ja permite identificar responsavel por dependente.
- `student_payments` e a rota [`app/api/academy/charge-student/route.ts`](/Users/user_pc/Projetos/black_belt_v2/app/api/academy/charge-student/route.ts) ja suportam geracao de cobranca externa real via Asaas.

## Ja existe e precisa ajuste

- [`supabase/migrations/089_billing_system.sql`](/Users/user_pc/Projetos/black_belt_v2/supabase/migrations/089_billing_system.sql) modela apenas parte do problema e usa nomenclatura inconsistente com a regra de negocio atual.
- [`lib/api/student-billing.service.ts`](/Users/user_pc/Projetos/black_belt_v2/lib/api/student-billing.service.ts) usa `memberships`, mas com tipos incompletos, sem GymPass/TotalPass operacional, sem filtros executivos e sem historico de alertas.
- [`lib/api/financial.service.ts`](/Users/user_pc/Projetos/black_belt_v2/lib/api/financial.service.ts) ainda depende do fluxo legado `subscriptions/plans/invoices`, quebrando a visao por aluno.
- [`app/(admin)/admin/financeiro/page.tsx`](/Users/user_pc/Projetos/black_belt_v2/app/(admin)/admin/financeiro/page.tsx) mistura servicos legados, `student_payments` e resumo parcial por `memberships`.
- [`components/finance/BillingConfigSection.tsx`](/Users/user_pc/Projetos/black_belt_v2/components/finance/BillingConfigSection.tsx) tem UX parcial e nao cobre os tipos obrigatorios, `charge_mode`, check-ins minimos, alertas e convenio.
- [`lib/api/student-management.service.ts`](/Users/user_pc/Projetos/black_belt_v2/lib/api/student-management.service.ts) lista alunos com pouca informacao financeira e sem indicadores operacionais.
- [`app/(admin)/admin/alunos/[id]/page.tsx`](/Users/user_pc/Projetos/black_belt_v2/app/(admin)/admin/alunos/[id]/page.tsx) ainda usa mock para trechos importantes do detalhe do aluno.

## Precisa criar do zero

- Camada unificada de dominio financeiro por aluno com calculo real de:
  - status financeiro
  - proximo vencimento
  - status de meta GymPass/TotalPass
  - protecao de alerta duplicado
  - dashboard executivo por vinculo
- Tabela de historico de alertas financeiros/check-in por aluno.
- Regras RLS especificas para owner/admin/recepcao, professor e aluno/responsavel no escopo financeiro por aluno.
- Seed coerente com todos os cenarios obrigatorios.
- Testes confiaveis para filtros, calculos, alertas e contratos principais do dominio.

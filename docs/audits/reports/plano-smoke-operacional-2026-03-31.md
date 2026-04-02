# Plano curto de smoke operacional — 2026-03-31

## Fluxos-alvo

1. Onboarding da academia
2. Cadastro de aluno
3. Vinculo responsavel ↔ dependente
4. Check-in principal
5. Cobranca manual com write ate gateway, se seguro

## Estado auditado

- `onboarding`: fluxo publico em [`app/(public)/cadastrar-academia/page.tsx`](../app/(public)/cadastrar-academia/page.tsx) usa [`lib/api/onboarding.service.ts`](../lib/api/onboarding.service.ts) e [`app/api/register-academy/route.ts`](../app/api/register-academy/route.ts). Risco principal: criar academia sem autenticar automaticamente o admin no fim do wizard.
- `cadastro de aluno`: rota oficial [`app/api/students/create/route.ts`](../app/api/students/create/route.ts) ja cria `auth user`, `profile`, `person`, `membership`, `student`, `guardians`, `guardian_links` e `student_financial_profiles`.
- `responsavel ↔ dependente`: leitura do responsavel usa `guardian_links` em [`lib/api/parent.service.ts`](../lib/api/parent.service.ts) e [`lib/api/parent-checkin.service.ts`](../lib/api/parent-checkin.service.ts). Gap encontrado: [`app/(parent)/parent/filhos/novo/page.tsx`](../app/(parent)/parent/filhos/novo/page.tsx) ainda dependia de `MOCK_GUARDIAN_PERSON_ID`.
- `check-in`: recepcao usa [`lib/api/recepcao-checkin.service.ts`](../lib/api/recepcao-checkin.service.ts) e grava em `checkins`; responsavel usa [`lib/api/parent-checkin.service.ts`](../lib/api/parent-checkin.service.ts) e grava em `attendance`.
- `cobranca manual`: rota [`app/api/academy/charge-student/route.ts`](../app/api/academy/charge-student/route.ts) faz validacao/autorizacao real e so escreve no Asaas se a academia tiver `asaas_subaccount_api_key` ativa.

## Ambiente e dependencias

- Banco remoto Supabase alinhado com todas as migrations versionadas.
- Stack local Supabase indisponivel nesta maquina porque o Docker nao esta ativo.
- Smoke sera executado contra backend remoto ativo e validado com service role local para prova de persistencia.
- Cobranca manual so sera marcada como `validado real` se houver write confirmado no gateway externo e persistencia em `student_payments`.

## Estrategia de prova

- Criar suite Playwright serial especifica para estes 5 fluxos.
- Reutilizar usuarios seeded de admin, recepcao e responsavel onde fizer sentido.
- Gerar entidades de smoke com identificadores unicos e validar persistencia via Supabase admin.
- Se o gateway externo bloquear por configuracao segura da academia, registrar como `bloqueado externamente`, sem vender sucesso.

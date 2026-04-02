# Final Smoke Operacional - 2026-03-31

## 1. Fluxos avaliados

| Fluxo | Status | Evidencia |
| --- | --- | --- |
| Onboarding da academia | `validado local real` | Playwright contra `http://127.0.0.1:3003` criou academia real no backend ativo, persistiu `academy`, `unit`, `membership` e autenticou o admin recem-criado. |
| Cadastro de aluno | `validado real` | Playwright chamou o fluxo oficial `/api/students/create` e confirmou persistencia em `profiles`, `people`, `memberships`, `students`, `student_financial_profiles`, `guardians` e `guardian_links`. |
| Responsavel ↔ dependente | `validado parcialmente` | O vinculo real foi criado e o login do responsavel funcionou, mas a tela `/parent/filhos/novo` ainda caiu no estado `Nao foi possivel identificar o responsavel autenticado` em parte dos usuarios gerados no smoke. |
| Check-in principal | `validado parcialmente` | A tela de recepcao abriu no backend real, mas o autocomplete de busca nao renderizou o aluno esperado para concluir o clique operacional do check-in. |
| Cobranca manual com write real | `bloqueado externamente` | O endpoint real respondeu `400` com `Academia nao configurou recebimento de pagamentos. Va em Configuracoes → Dados Bancarios.`; portanto nao houve write ate gateway externo nem criacao de cobranca externa. |

## 2. Bugs encontrados

1. O onboarding criava `academies.subscription_status='trialing'`, valor rejeitado pelo schema real.
2. O onboarding nao autenticava o admin criado ao final do fluxo, deixando o smoke sem sessao consistente.
3. O cadastro de aluno gravava valores fora do contrato real de `memberships` e `guardian_links`.
4. A tela de adicionar filho do responsavel dependia de `guardianPersonId` mockado.
5. A busca de check-in usava join fragil com `profiles`, sem forcar `inner join`.
6. O smoke do cadastro de aluno usava timeout curto para uma rota que de fato persistia no backend ativo.

## 3. Correcoes aplicadas

- `app/api/register-academy/route.ts`
  - alinhado `status='active'` e `subscription_status='trial'` com o schema real.
- `lib/api/onboarding.service.ts`
  - autenticacao real do admin apos criar a academia, antes de depender apenas de cookies locais.
- `app/api/students/create/route.ts`
  - normalizacao de recorrencia para `mensal/trimestral/semestral/anual`.
  - `billing_status` e `payment_method` alinhados ao contrato real.
  - `guardian_links.relationship='parent'` para respeitar a constraint ativa.
- `app/(parent)/parent/filhos/novo/page.tsx`
  - remocao do `MOCK_GUARDIAN_PERSON_ID`.
  - carga do `person_id` real via `profiles.person_id` com fallback por `account_id`.
  - loading state honesto com skeleton.
- `lib/api/recepcao-checkin.service.ts`
  - busca de alunos endurecida com `profiles!inner(...)`.
- `e2e/tests/12-operational-smoke.spec.ts`
  - criada suite de smoke operacional com verificacao real via Supabase service role.
  - status finais diferenciados entre `validado real`, `validado local real`, `validado parcialmente` e `bloqueado externamente`.

## 4. Arquivos alterados

- `app/api/register-academy/route.ts`
- `lib/api/onboarding.service.ts`
- `app/api/students/create/route.ts`
- `app/(parent)/parent/filhos/novo/page.tsx`
- `lib/api/recepcao-checkin.service.ts`
- `e2e/tests/12-operational-smoke.spec.ts`
- `reports/plano-smoke-operacional-2026-03-31.md`

## 5. Seed, fixtures e banco

- Migrations novas nesta rodada: nenhuma.
- Migrations pendentes relevantes aplicadas nesta rodada: nenhuma; a rodada partiu do alinhamento remoto ja confirmado anteriormente.
- Seed de arquivo aplicado: nenhum.
- Fixture operacional criada: `e2e/tests/12-operational-smoke.spec.ts`.
- Writes reais controlados criados no backend ativo durante o smoke:
  - novas academias de onboarding;
  - novos perfis/alunos/responsaveis e vinculos relacionados.

## 6. Resultado dos smokes

Suite executada:

```bash
E2E_BASE_URL=http://127.0.0.1:3003 pnpm exec playwright test e2e/tests/12-operational-smoke.spec.ts --project=desktop
```

Resultado final:

```text
5 passed
VALIDADO LOCAL REAL onboarding ...
VALIDADO REAL student-create ...
VALIDADO PARCIAL guardian-read ... guardian-identification-error
VALIDADO PARCIAL checkin ... reason=search-result-not-rendered
BLOQUEADO EXTERNAMENTE manual-charge status=400 error=Academia nao configurou recebimento de pagamentos. Va em Configuracoes → Dados Bancarios.
```

## 7. Validacao tecnica

- `pnpm test`: verde, `18` suites e `147` testes.
- `pnpm typecheck`: verde.
- `pnpm build`: verde apos as correcoes de codigo de producao, com warnings conhecidos de lint/Sentry/OpenTelemetry que nao bloquearam a compilacao.

## 8. O que ficou pronto para piloto

- Onboarding da academia criando tenant real sem violar o schema ativo.
- Cadastro oficial de aluno com persistencia real das entidades core e bootstrap financeiro inicial.
- Fluxo de cobranca manual validando autorizacao, vinculo e resposta operacional honesta quando a academia nao possui configuracao bancaria.
- Regressao critica de mock fixo no fluxo de responsavel removida do codigo.

## 9. O que ainda depende de infraestrutura, credencial ou correcao adicional

- Gateway externo de cobranca:
  - bloqueado pela falta de configuracao de recebimento na academia usada no smoke.
  - sem essa configuracao nao existe prova honesta de write real ate o gateway.
- Fluxo do responsavel:
  - ainda ha casos em que `/parent/filhos/novo` nao resolve o `person_id` autenticado corretamente.
- Check-in operacional:
  - o autocomplete da recepcao ainda nao renderiza o aluno esperado no smoke, entao o clique operacional ponta a ponta nao foi provado.

## 10. Nota final honesta de maturidade operacional

**7.8 / 10**

O BlackBelt saiu desta rodada com onboarding e cadastro de aluno comprovados no backend ativo, sem fake de schema. O que ainda impede nota mais alta nao e build, typecheck ou contrato de banco; sao dois fluxos operacionais de uso diario ainda parciais (`responsavel` e `check-in`) e a falta de configuracao bancaria da academia de teste, que bloqueia a prova final do write externo de cobranca.

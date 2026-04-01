# Final Asaas Activation Definitive

Data: 2026-04-01

## 1. Academia usada
- `809f2763-0096-4cfa-8057-b5b029cbc62f`
- `Academia Guerreiros do Tatame`

## 2. Campos da academia antes
- `bank_account_configured=false`
- `bank_owner_name=null`
- `bank_owner_cpf_cnpj=null`
- `bank_owner_email=null`
- `bank_owner_phone=null`
- `bank_owner_birth_date=null`
- `bank_company_type=null`
- `bank_code=null`
- `bank_agency=null`
- `bank_account=null`
- `bank_account_digit=null`
- `bank_account_type=CONTA_CORRENTE`
- `asaas_subaccount_id=null`
- `asaas_subaccount_api_key=null`
- `asaas_subaccount_wallet_id=null`
- `asaas_subaccount_status=pending`

## 3. O que o `setup-payments` exige
- A rota oficial `app/api/academy/setup-payments/route.ts` exige:
  - `academyId`
  - `name`
  - `cpfCnpj`
  - `email`
  - `bankCode`
  - `bankAgency`
  - `bankAccount`
- Depois do retorno do Asaas, o codigo persiste:
  - `bank_account_configured=true`
  - `asaas_subaccount_id`
  - `asaas_subaccount_api_key`
  - `asaas_subaccount_wallet_id`
  - `asaas_subaccount_status='active'`

## 4. O que foi executado
- Auditoria do banco da academia correta
- Auditoria de memberships/admin da academia correta
- Auditoria global de academias configuradas
- Revalidacao do smoke minimo da cobranca externa
- Revalidacao tecnica:
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm build`

## 5. Verificacao de contexto e divergencia
- Nao havia divergencia entre academia logada, academy do membership e academy da cobranca.
- A academia usada no smoke era a academia correta.
- Nao existe outra academia no banco ativo com:
  - dados bancarios salvos
  - `asaas_subaccount_id`
  - `asaas_subaccount_api_key`
  - `asaas_subaccount_status=active`

## 6. Campos da academia depois
- Sem alteracao.
- A academia permaneceu sem dados bancarios e sem subconta.

## 7. Resultado da tentativa de ativacao da subconta
- Nenhum `setup-payments` real foi executado.
- Motivo exato:
  - a academia correta nao possui nenhum dado bancario real salvo
  - o ambiente esta com `ASAAS_SANDBOX=false`
  - executar `setup-payments` agora exigiria write real em producao com dados bancarios inexistentes
  - o codigo nao pode fabricar `cpfCnpj`, banco, agencia, conta e titular

## 8. Resultado da cobranca manual
- O fluxo oficial de cobranca continuou parando exatamente na guarda correta:
  - `Academia nao configurou recebimento de pagamentos. Va em Configuracoes → Dados Bancarios.`
- Nao houve write real ao Asaas.
- `student_payments` segue vazio no banco ativo.

## 9. Evidencia do write real ou do bloqueio externo
- Smoke minimo:
  - `E2E_BASE_URL=http://127.0.0.1:3003 pnpm exec playwright test e2e/tests/13-core-final-gaps.spec.ts --project=desktop --grep 'cobranca manual externa'`
- Evidencia registrada:
  - `BLOQUEADO EXTERNAMENTE manual-charge reason=no-safe-gateway-setup academy=809f2763-0096-4cfa-8057-b5b029cbc62f sandbox=false`
  - `BLOQUEADO EXTERNAMENTE manual-charge status=400 error=Academia nao configurou recebimento de pagamentos. Va em Configuracoes → Dados Bancarios.`

## 10. Resultado do smoke
- `1 passed`
- Classificacao: `bloqueado externamente`

## 11. Resultado do typecheck
- `pnpm typecheck`: verde

## 12. Resultado do test
- `pnpm test`: verde
- `18` arquivos
- `147` testes

## 13. Resultado do build
- `pnpm build`: verde

## 14. Status final
- `bloqueado externamente`

## 15. Causa exata
- O ultimo gap nao e codigo.
- O ultimo gap nao e academia errada.
- O ultimo gap nao e ausencia da `ASAAS_API_KEY` global.
- O ultimo gap e ausencia total de dados bancarios reais da academia no banco e, por consequencia, ausencia total de subconta Asaas ativa no ambiente.

## 16. Unico passo manual restante
- Preencher dados bancarios reais de uma academia de teste segura:
  - titular
  - CPF/CNPJ
  - email
  - banco
  - agencia
  - conta
- Executar `setup-payments`
- Confirmar no banco:
  - `bank_account_configured=true`
  - `asaas_subaccount_id` preenchido
  - `asaas_subaccount_api_key` preenchido
  - `asaas_subaccount_wallet_id` preenchido
  - `asaas_subaccount_status=active`
- Rerodar a cobranca manual externa

# Final Asaas Subconta Check

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

## 3. Verificacao de divergencia de academia/contexto
- Nao havia divergencia de contexto.
- O smoke anterior usava a academia correta.
- Auditoria global do banco ativo:
  - nenhuma academia com `bank_owner_name` preenchido
  - nenhuma academia com `asaas_subaccount_id` preenchido
  - nenhuma academia com `asaas_subaccount_api_key` preenchida

## 4. Ambiente relevante
- `ASAAS_SANDBOX=false`
- `ASAAS_API_KEY` global presente no ambiente do app
- O fluxo `charge-student` depende de configuracao por academia, nao apenas da key global.

## 5. Acao executada no setup-payments
- Nenhum `setup-payments` real foi executado.
- Motivo:
  - a academia alvo nao possui nenhum dado bancario real salvo
  - o endpoint oficial exige dados reais obrigatorios:
    - `name`
    - `cpfCnpj`
    - `email`
    - `bankCode`
    - `bankAgency`
    - `bankAccount`
  - o ambiente atual esta em producao, entao nao era seguro inventar ou forcar dados bancarios em write real

## 6. Campos da academia depois
- Sem alteracao.
- A academia permaneceu:
  - `bank_account_configured=false`
  - `asaas_subaccount_id=null`
  - `asaas_subaccount_api_key=null`
  - `asaas_subaccount_wallet_id=null`
  - `asaas_subaccount_status=pending`

## 7. Evidencia da cobranca externa
- Smoke minimo focado em cobranca externa:
  - `E2E_BASE_URL=http://127.0.0.1:3003 pnpm exec playwright test e2e/tests/13-core-final-gaps.spec.ts --project=desktop --grep 'cobranca manual externa'`
- Evidencia registrada pelo proprio smoke:
  - `BLOQUEADO EXTERNAMENTE manual-charge reason=no-safe-gateway-setup academy=809f2763-0096-4cfa-8057-b5b029cbc62f sandbox=false`
  - `BLOQUEADO EXTERNAMENTE manual-charge status=400 error=Academia nao configurou recebimento de pagamentos. Va em Configuracoes → Dados Bancarios.`
- Auditoria complementar:
  - `student_payments` continua vazio no banco ativo
  - nao houve write real ao gateway

## 8. Resultado do smoke
- `1 passed`
- Classificacao:
  - `bloqueado externamente`

## 9. Resultado do typecheck
- `pnpm typecheck`: verde

## 10. Resultado do test
- `pnpm test`: verde
- `18` arquivos
- `147` testes

## 11. Resultado do build
- `pnpm build`: verde

## 12. Status final
- `bloqueado externamente`

## 13. Causa exata do bloqueio
- O ultimo gap nao era divergencia de academia.
- O ultimo gap nao era ausencia da key global.
- O ultimo gap era, e continua sendo, ausencia total de configuracao bancaria real na academia alvo e em qualquer outra academia do banco ativo.
- Sem dados bancarios reais da academia, nao existe como criar subconta Asaas com o fluxo oficial de forma segura.
- Como `ASAAS_SANDBOX=false`, qualquer tentativa de completar esse setup agora seria write real em producao com dados que hoje nao existem no banco.

## Conclusao definitiva
- Nao foi possivel fechar `100/100` nesta execucao.
- O bloqueio restante esta provado com precisao:
  - academia correta confirmada
  - nenhum dado bancario salvo
  - nenhuma subconta ativa no banco
  - nenhuma persistencia em `student_payments`
  - fluxo oficial de cobranca parando exatamente na guarda correta
- O unico passo restante e externo ao codigo:
  - fornecer dados bancarios reais de uma academia de teste segura
  - executar `setup-payments`
  - confirmar persistencia de `asaas_subaccount_id`, `asaas_subaccount_api_key`, `asaas_subaccount_wallet_id` e `asaas_subaccount_status=active`
  - rerodar a cobranca manual externa

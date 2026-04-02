# Diagnostico Curto: Cobranca Externa

Data: 2026-04-01

## Escopo auditado
- `app/api/academy/setup-payments/route.ts`
- `app/api/academy/charge-student/route.ts`
- `.env.local`
- `academies`
- `student_payments`
- `memberships`

## Estado encontrado
- `ASAAS_SANDBOX=false`
- o ambiente atual esta apontando para Asaas em modo de producao
- o fluxo oficial de cobranca exige:
  - `academies.asaas_subaccount_api_key`
  - `academies.asaas_subaccount_status = active`
- a academia usada no smoke do core:
  - `809f2763-0096-4cfa-8057-b5b029cbc62f`
  - `Academia Guerreiros do Tatame`
  - `bank_account_configured=false`
  - `asaas_subaccount_id=null`
  - `asaas_subaccount_api_key=null`
  - `asaas_subaccount_wallet_id=null`
  - `asaas_subaccount_status=pending`

## Auditoria do banco ativo
- nao existe academia recente com `asaas_subaccount_api_key` preenchida
- nao existe `student_payments` persistido no ambiente ativo

## Conclusao tecnica
- o fluxo de codigo esta alinhado com a regra esperada:
  - sem subconta/chave ativa por academia, a cobranca externa deve parar com `400`
- o gap restante nao esta no backend do charge flow
- o gap esta no ambiente externo/configuracao da academia:
  - nao ha academia segura e configurada para write real
  - criar/configurar subconta agora exigiria write real em ambiente de producao
  - isso nao e seguro nesta execucao sem credencial humana apropriada e dados bancarios reais da academia de teste

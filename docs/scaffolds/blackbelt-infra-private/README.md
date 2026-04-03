# blackbelt-infra-private

Repositório privado operacional do BlackBelt.

## Responsabilidades

- deploy e release
- IaC
- monitoramento e observabilidade operacional
- runbooks
- automações internas
- documentação restrita de segurança, incidentes e operação

## Estrutura Inicial

```text
blackbelt-infra-private/
  terraform/
  scripts/
  runbooks/
  docs/
    security/
    release/
    incidents/
  monitoring/
  .github/
```

## Regras

- privado por padrão
- nenhum segredo em texto puro versionado
- mudança operacional precisa de runbook ou atualização de incidente/release

## Passos Remotos

```bash
gh repo create blackbelt-infra-private --private --description "Private infrastructure and operations for BlackBelt"
```

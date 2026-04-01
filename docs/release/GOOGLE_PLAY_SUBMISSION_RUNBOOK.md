# Google Play Submission Runbook

Data da auditoria: 2026-04-01
Status atual: `NO-GO`

## O que foi verificado

| Item | Evidência | Status |
|---|---|---|
| Package `app.blackbelt.academy` | `android/app/build.gradle` | `verificado no código` |
| Version name `1.0` | `android/app/build.gradle` | `verificado no código` |
| Version code `1` | `android/app/build.gradle` | `verificado no código` |
| Android target SDK 36 | `android/variables.gradle` | `verificado no código` |
| Ícones Android existem | `android/app/src/main/res/mipmap-*` | `verificado no código` |
| Screenshots existem | `docs/screenshots` e `docs/store-screenshots` | `verificado no repositório` |
| Feature graphic existe | `docs/store-assets/feature-graphic.png` | `verificado no repositório` |
| Privacy policy pública existe | rota `/privacidade` | `verificado no código` |
| Terms públicos existem | rota `/termos` | `verificado no código` |
| Delete account URL existe | rota `/excluir-conta` | `verificado no código` |

## Blockers Google

1. `./gradlew bundleRelease` falhou em `:app:signReleaseBundle FAILED`.
2. A conta Play Console e o gate de produção não são verificáveis pelo repositório.
3. `assetlinks.json` continua com fingerprint placeholder.
4. Credenciais reais de review não estão prontas.
5. Telefone público é placeholder; email de suporte não está provado.
6. O app continua dependente de shell remoto, o que aumenta risco operacional em review.
7. Push notifications não podem ser prometidas como prontas sem `google-services.json`.

## Ordem exata para Google Play

1. Corrigir a assinatura Android até `bundleRelease` gerar AAB com sucesso.
2. Unificar exclusão de conta e alinhar textos.
3. Substituir telefone placeholder e confirmar email de suporte.
4. Preencher `public/.well-known/assetlinks.json` com o SHA-256 real do certificado de release.
5. Criar e validar conta real de review sem fricção.
6. Confirmar no Play Console se a conta cai na exigência de closed testing para conta pessoal nova.
7. Rodar build mobile web:

```bash
pnpm build:mobile
```

8. Sincronizar Capacitor:

```bash
pnpm cap:sync
```

9. Gerar AAB:

```bash
cd android
./gradlew clean bundleRelease
```

10. Validar o artefato esperado:

```bash
ls -la app/build/outputs/bundle/release/
```

11. Fazer upload do `.aab` no track correto.
12. Preencher App content, Data safety, App access, Content rating e Store listing.
13. Enviar para closed testing ou production conforme o gate real da conta.

## Gate crítico: conta pessoal nova

Este ponto não pode ser provado pelo repositório. Tratar como `confirmar manualmente no console`.

Se a produção estiver bloqueada, a ordem é:

1. Criar `Closed testing`
2. Convidar 12 testers
3. Manter o teste por 14 dias
4. Solicitar production access

## Google Data Safety draft

Baseado no código atual:

| Tema | Draft |
|---|---|
| Coleta de dados | Nome, email, telefone, fotos de perfil, identificador de usuário, analytics de uso, crash/performance, token de dispositivo para push |
| Compartilhamento | Não há prova no código de venda de dados para advertising; integrações operacionais existem com Supabase, Resend, Asaas/Stripe, PostHog e Sentry |
| Propósitos | App functionality, analytics, crash diagnostics, account management, academy billing operations |
| Criptografia em trânsito | Declarar `Yes` apenas se confirmado no console/infra |
| Exclusão de conta | `Yes`, mas só depois de alinhar o comportamento real |

## Itens que dependem do Play Console

- Confirmar tipo da conta e gate de produção
- Criar app listing
- Preencher Data Safety
- Preencher IARC / Content Rating
- Configurar App Access com credenciais reais
- Declarar ads como `No` se continuar sem ads
- Definir target audience com cuidado por existir módulo Kids/Teen

## Go / No-Go

- Hoje: `NO-GO`
- Go apenas quando:
  - `bundleRelease` passar
  - o gate de produção no console estiver claro
  - o review account existir
  - contatos públicos forem reais
  - `assetlinks.json` estiver preenchido
